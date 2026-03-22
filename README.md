# ARVI — Agentic Regeneration Via Intelligence

**An autonomous environmental intelligence system that detects ecosystem threats and pays sensor operators — without human intervention.**

→ **Live:** [arvi-eight.vercel.app](https://arvi-eight.vercel.app)  
→ **Dashboard:** [arvi-eight.vercel.app/dashboard](https://arvi-eight.vercel.app/dashboard)  
→ **Atlas:** [arvi-eight.vercel.app/atlas](https://arvi-eight.vercel.app/atlas)  
→ **ERC-8004:** [0xb8623d...cf43a](https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a) · Base Mainnet

---

## What this is

ARVI is not a dashboard. It is an intelligence system.

IoT sensor nodes are deployed in forests, rivers, and soil. They continuously measure data that city-scale APIs cannot provide: canopy-level temperature, root zone moisture, biodiversity by audio, pathogen risk by AI model. An autonomous agent reads every reading, detects threats using LLM analysis, logs events onchain, and triggers USDC payments to node operators — in under 2 seconds.

```
Sensor reads → Agent analyzes → Alert logged onchain → Operator paid (USDC)
```

No dashboard refresh. No human trigger. The system acts.

---

## Why it matters

Urban forests absorb carbon, cool cities, and filter air. Aquifers feed millions. Coral reefs protect coastlines.

Right now, detecting a plague in Chapultepec requires a field visit. ARVI makes that automatic, verifiable, and self-sustaining. The agent pays for its own intelligence from subscription revenue.

---

## Demo

**Happy path (3 minutes):**

1. Open [arvi-eight.vercel.app](https://arvi-eight.vercel.app)
   - Scroll (or use arrow keys) through 6 horizontal planes
   - INTRO → SYSTEM → ATLAS → DASHBOARD → ECONOMICS → ENTER
   - Interact with each plane: cursor over nodes, click system graph, hover Atlas

2. Click **Launch App** → `/dashboard`
   - Select node-01 (Chapultepec — CRITICAL)
   - Tab **Sensors**: full sensor array with real values
   - Tab **Intelligence**: live Open-Meteo weather + NASA FIRMS fire data
   - Click **Run Agent** → watch pipeline animate → 8.5 USDC paid to operator

3. Open `/atlas`
   - Dark world map, 3 active CDMX nodes
   - Live weather overlay, NASA FIRMS fire hotspots

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15.2.9, TypeScript, Tailwind CSS v3, Framer Motion |
| Maps | Leaflet + CartoDB dark tiles (free, no key) |
| Weather | Open-Meteo API (free, no key) |
| Fire data | NASA FIRMS MODIS NRT (free key) |
| LLM | Bankr Gateway → gemini-2.5-flash |
| Payments | Locus USDC (Base) |
| Contracts | EVVM (6 contracts: Core, Staking, Estimator, NameService, Treasury, P2PSwap) |
| Identity | ERC-8004 — agent.json registered on Base Mainnet |
| Deploy | Vercel (CI/CD from GitHub main) |

---

## Project structure

```
ARVI/
├── app/                    ← Next.js app (Vercel root dir)
│   ├── app/
│   │   ├── page.tsx        ← Landing v5.0 (6-plane horizontal system)
│   │   ├── dashboard/      ← Command center (Sensors / Intelligence / Actions)
│   │   ├── atlas/          ← Geospatial intelligence map
│   │   ├── register/       ← Node operator registration
│   │   ├── components/     ← MiniWorldMap, shared components
│   │   └── api/
│   │       ├── analyze/    ← POST: full agent loop
│   │       └── weather/    ← GET: Open-Meteo + NASA FIRMS
│   ├── data/nodes.ts       ← 3 CDMX nodes (expanded sensor schema)
│   └── lib/
│       ├── bankr.ts        ← LLM gateway (Bankr / gemini-2.5-flash)
│       ├── locus.ts        ← USDC payment automation (Locus)
│       └── agent-log.ts    ← Onchain log writer
├── agent.json              ← ERC-8004 agent identity
├── agent_log.json          ← Execution log (onchain evidence)
├── docs/
│   ├── checkpoint_1.md     ← Build log — ideation to EVVM deploy
│   ├── checkpoint_2.md     ← Build log — agent loop + UI v2
│   ├── checkpoint_3.md     ← Build log — v5.0 system navigation
│   └── arvi-llm.txt        ← Machine-readable system context
└── evvm/                   ← EVVM smart contracts (Foundry)
```

---

## Sensor data schema

What ARVI nodes measure that city-scale APIs cannot:

| Field | Source | vs Open-Meteo |
|---|---|---|
| `temperature_c` | Canopy-level sensor | City average only |
| `humidity_pct` | Root zone (30–60cm) | Ambient only |
| `soil_moisture_pct` | Underground sensor | Not available |
| `air_quality_index` | PM2.5/PM10 at canopy | Station average |
| `biodiversity_score` | Audio sensor (species presence) | Not available |
| `pathogen_risk` | AI multi-model output | Not available |
| `canopy_density_pct` | Visual sensor | Not available |
| `co2_ppm` | Air column | Not available |

Every reading is operator-signed and logged onchain.

---

## Active nodes (CDMX pilot)

| Node | Location | Health | Status |
|---|---|---|---|
| `node-01` | Bosque de Chapultepec | 34% | CRITICAL — plague risk |
| `node-02` | Alameda Central | 71% | Monitoring |
| `node-03` | Tlatelolco | 52% | Drought stress |

---

## API

### `POST /api/analyze`

```json
// Request
{ "node_id": "node-01" }

// Response
{
  "success": true,
  "node": { "id": "node-01", "location": "Bosque de Chapultepec, CDMX", "health_score": 0.34 },
  "analysis": {
    "severity": "critical",
    "alert_type": "probable_plague",
    "description": "...",
    "recommended_action": "...",
    "confidence": 0.94,
    "payment_warranted": true,
    "payment_amount_usdc": 8.5,
    "model_used": "gemini-2.5-flash"
  },
  "payment": {
    "success": true,
    "tx_hash": "0x...",
    "amount_usdc": 8.5,
    "recipient": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "chain": "Base (via Locus)"
  }
}
```

### `GET /api/weather`

Returns live Open-Meteo data for all 3 nodes + NASA FIRMS fire hotspots near Mexico.

---

## Smart contracts

Deployed with EVVM (Foundry). Local Anvil (chain 31337).

| Contract | Address |
|---|---|
| Core | `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318` |
| Staking | `0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6` |
| NameService | `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e` |
| Treasury | `0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82` |

---

## Business model

Self-sustaining from day one. Not grant-dependent.

| Stream | Price |
|---|---|
| Node subscription | $1,200/node/yr |
| Enterprise data API | $500/mo |
| Alert intelligence | $2,000/mo |
| Carbon absorption oracle | $0.80/tonne verified |

**Year 3 target:** 1,000 nodes · 280K trees protected · $1.4M ARR · $720K paid to operators

---

## Evolution

ARVI is the 4th step in a deliberate research trajectory:

| Project | Year | Layer solved |
|---|---|---|
| [REMBU](https://rembu-app.vercel.app) | 2024 | Sensing |
| [SEN](https://sen-network1.vercel.app) | 2025 | Incentives |
| [AONA](https://aona.vercel.app) | 2025 | Intelligence |
| **ARVI** | 2026 | **Autonomous execution** |

Each project solved one missing layer. ARVI integrates all four.

---

## Local development

```bash
# Requirements: Node 20+, Foundry

# 1. Clone
git clone https://github.com/ValenteCreativo/ARVI
cd ARVI

# 2. Install deps
cd app && npm install

# 3. Environment
cp .env.example .env.local
# Add: BANKR_API_KEY, LOCUS_API_KEY, NASA_FIRMS_API_KEY

# 4. Run
npm run dev
# → http://localhost:3000

# 5. Test agent loop
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"node_id":"node-01"}'

# 6. Smart contracts (optional)
export PATH="$HOME/.foundry/bin:$PATH"
cd ../evvm && anvil &
forge script Deploy.s.sol --broadcast --rpc-url http://localhost:8545
```

---

## Built at Synthesis Hackathon 2026

**Builder:** Valentín Martínez  
**Team:** Pantera Labs  
**Participant ID:** d88080a57309466c96340338faed7862

---

*Signals become decisions.*
