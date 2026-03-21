import { NextResponse } from 'next/server'

const NODE_COORDS = [
  { node_id: 'node-01', lat: 19.4133, lon: -99.1905, name: 'Chapultepec' },
  { node_id: 'node-02', lat: 19.4360, lon: -99.1508, name: 'Alameda Central' },
  { node_id: 'node-03', lat: 19.4528, lon: -99.1388, name: 'Tlatelolco' },
]

const FIRMS_KEY = process.env.NASA_FIRMS_API_KEY || '5e31f5817ee2bdfc0d663f884c10243d'

export async function GET() {
  try {
    // Fetch Open-Meteo weather for all 3 nodes in parallel
    const weatherPromises = NODE_COORDS.map(node =>
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${node.lat}&longitude=${node.lon}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index,precipitation` +
        `&timezone=America%2FMexico_City`,
        { next: { revalidate: 300 } } // cache 5 min
      ).then(r => r.json()).then(data => ({
        node_id: node.node_id,
        name: node.name,
        lat: node.lat,
        lon: node.lon,
        weather: data.current ?? null,
      }))
    )

    // Fetch NASA FIRMS fire hotspots for Mexico (last 24h)
    const firmsPromise = fetch(
      `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_KEY}/MODIS_NRT/MEX/1`,
      { next: { revalidate: 600 } }
    ).then(r => r.text()).catch(() => '')

    const [weatherData, firmsCSV] = await Promise.all([
      Promise.all(weatherPromises),
      firmsPromise,
    ])

    // Parse FIRMS CSV → fire hotspots array
    const fires: { lat: number; lon: number; brightness: number; confidence: string }[] = []
    if (firmsCSV) {
      const lines = firmsCSV.trim().split('\n').slice(1) // skip header
      for (const line of lines.slice(0, 50)) { // max 50 points
        const cols = line.split(',')
        if (cols.length >= 4) {
          fires.push({
            lat: parseFloat(cols[0]),
            lon: parseFloat(cols[1]),
            brightness: parseFloat(cols[2]) || 300,
            confidence: cols[8] || 'nominal',
          })
        }
      }
    }

    return NextResponse.json({
      nodes: weatherData,
      fires,
      fetched_at: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err), nodes: [], fires: [] }, { status: 500 })
  }
}
