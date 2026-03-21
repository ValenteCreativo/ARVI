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
  temperature_c: number
  humidity_pct: number
  co2_ppm: number
  timestamp: string
  operator_wallet: string
}

export const ARVI_NODES: NodeData[] = [
  {
    node_id: "node-01",
    ens: "n1.arvi.eth",
    location: "Bosque de Chapultepec, CDMX",
    zone: "Centro-Poniente",
    trees_monitored: 47,
    health_score: 0.34,
    anomaly_detected: true,
    anomaly_type: "probable_plague",
    dominant_species: "Ahuehuete",
    temperature_c: 28.4,
    humidity_pct: 31.2,
    co2_ppm: 412,
    timestamp: new Date().toISOString(),
    operator_wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  },
  {
    node_id: "node-02",
    ens: "n2.arvi.eth",
    location: "Parque Alameda Central, CDMX",
    zone: "Centro",
    trees_monitored: 31,
    health_score: 0.71,
    anomaly_detected: false,
    dominant_species: "Cedro Blanco",
    temperature_c: 26.1,
    humidity_pct: 38.0,
    co2_ppm: 398,
    timestamp: new Date().toISOString(),
    operator_wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
  },
  {
    node_id: "node-03",
    ens: "n3.arvi.eth",
    location: "Plaza de las Tres Culturas, Tlatelolco",
    zone: "Norte",
    trees_monitored: 19,
    health_score: 0.52,
    anomaly_detected: false,
    dominant_species: "Jacaranda",
    temperature_c: 27.8,
    humidity_pct: 29.5,
    co2_ppm: 405,
    timestamp: new Date().toISOString(),
    operator_wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
  }
]
