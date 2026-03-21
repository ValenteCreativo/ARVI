export interface NodeData {
  node_id: string
  ens: string
  location: string
  zone: string
  trees_monitored: number
  health_score: number
  anomaly_detected: boolean
  anomaly_type?: string
  dominant_species: string
  // Microclimate (what satellites can't give you)
  temperature_c: number          // Canopy-level, not city-level
  humidity_pct: number           // Root zone, not ambient
  co2_ppm: number
  soil_moisture_pct: number      // Root zone saturation
  air_quality_index: number      // PM2.5/PM10 canopy-specific (0–500 AQI)
  // Biodiversity & health
  biodiversity_score: number     // 0–1 · audio sensor species detection
  pathogen_risk: number          // 0–1 · AI-computed from all inputs
  canopy_density_pct: number     // % canopy cover (visual sensor)
  uv_index: number               // UV at canopy base
  // Identity & economics
  timestamp: string
  operator_wallet: string
  lat: number
  lon: number
}

export const ARVI_NODES: NodeData[] = [
  {
    node_id: 'node-01',
    ens: 'n1.arvi.eth',
    location: 'Bosque de Chapultepec, CDMX',
    zone: 'Centro-Poniente',
    trees_monitored: 47,
    health_score: 0.34,
    anomaly_detected: true,
    anomaly_type: 'probable_plague',
    dominant_species: 'Ahuehuete (Taxodium mucronatum)',
    temperature_c: 28.4,
    humidity_pct: 31.2,
    co2_ppm: 412,
    soil_moisture_pct: 18.3,        // Critically low — drought stress
    air_quality_index: 87,           // Moderate — urban pollution
    biodiversity_score: 0.31,        // Very low — ecosystem stress
    pathogen_risk: 0.89,             // AI-computed: HIGH
    canopy_density_pct: 41,          // Reduced — thinning canopy
    uv_index: 9.2,
    timestamp: new Date().toISOString(),
    operator_wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    lat: 19.4133,
    lon: -99.1905,
  },
  {
    node_id: 'node-02',
    ens: 'n2.arvi.eth',
    location: 'Parque Alameda Central, CDMX',
    zone: 'Centro',
    trees_monitored: 31,
    health_score: 0.71,
    anomaly_detected: false,
    dominant_species: 'Cedro Blanco (Cupressus lusitanica)',
    temperature_c: 26.1,
    humidity_pct: 38.0,
    co2_ppm: 398,
    soil_moisture_pct: 34.7,
    air_quality_index: 64,
    biodiversity_score: 0.62,
    pathogen_risk: 0.22,
    canopy_density_pct: 68,
    uv_index: 8.8,
    timestamp: new Date().toISOString(),
    operator_wallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    lat: 19.4360,
    lon: -99.1508,
  },
  {
    node_id: 'node-03',
    ens: 'n3.arvi.eth',
    location: 'Plaza de las Tres Culturas, Tlatelolco',
    zone: 'Norte',
    trees_monitored: 19,
    health_score: 0.52,
    anomaly_detected: false,
    dominant_species: 'Jacaranda (Jacaranda mimosifolia)',
    temperature_c: 27.8,
    humidity_pct: 29.5,
    co2_ppm: 405,
    soil_moisture_pct: 22.1,
    air_quality_index: 112,          // Unhealthy for sensitive groups
    biodiversity_score: 0.44,
    pathogen_risk: 0.41,
    canopy_density_pct: 55,
    uv_index: 9.0,
    timestamp: new Date().toISOString(),
    operator_wallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    lat: 19.4528,
    lon: -99.1388,
  },
]
