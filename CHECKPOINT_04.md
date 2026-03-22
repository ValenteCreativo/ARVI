# CHECKPOINT 04 — ARVI v7.0
## From Prototype to Intelligence System

*March 22, 2026 — Synthesis Hackathon*

---

## What We Built (and Why It Changed)

When we started ARVI, we had a map with three sensor nodes and a dashboard with a sidebar.
By v7.0, we had something different: an **agentic economy** — a system where sensors, agents, humans, and capital coordinate automatically to prevent and respond to environmental threats.

The shift wasn't cosmetic. It came from understanding what the system actually was.

---

## v6 → v7: What We Learned

### 1. Dashboards are passive. ARVI is not.

The original design centered on a map + sidebar — a visualization tool. Useful for analysts. Not useful for the planet.

v7.0 reframes everything around **action**: every piece of data exists to trigger a response. The dashboard's new **Command Center** home tab reflects this — it's not a read-only view, it's a dispatch center. Agents are running. Bounties are live. The system is working whether you're watching or not.

This distinction matters for any autonomous agent system: **intelligence without action is just observation.**

### 2. The economy is the feature, not the add-on

We initially treated the business model as a separate section — something to explain after the tech. That was wrong.

The economy *is* the architecture. When a sensor detects a threat:
- It triggers a USDC payment to field humans via **Locus on Base**
- It posts a data task to the **Agent Task Board** for AI agents to earn from
- It generates **verifiable MRV evidence** that project evaluators (Octant, carbon registries, ESG auditors) can query via **x402 on Base**

The economy creates the incentive for the sensors to exist, for the operators to deploy them, for the agents to analyze the data, and for the institutions to trust the results. Removing the economy breaks everything else.

### 3. Field humans are agents too

One of our clearest product insights: the **Field Bounty Board** treats human field workers as agents in the same network. A human who walks to Chapultepec Forest to verify a sensor alert and submits a photo report is doing what an AI agent does — processing inputs, producing outputs, earning for their work.

The same Locus payment rail. The same onchain log. The same verifiable evidence.
This makes ARVI's "agentic economy" genuinely multi-species: sensors → AI agents → human agents → institutions.

---

## Technical Decisions

### ERC-8004 Identity
Every agent in the ARVI network has an onchain identity registered via ERC-8004 on Base Mainnet. This means:
- Agent behavior is attributable and auditable
- Payments flow to verified identities
- Any system (Locus, Octant, ESG evaluators) can verify the agent's record before trusting its data

Our agent identity tx: `0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a`

### x402 Data API
Environmental data should be queryable without subscriptions or intermediaries. Our `/api/analyze` endpoint implements x402 micropayments on Base — any agent, app, or institution can pay per query, discover the service onchain, and trust the provenance.

This is how data becomes infrastructure: open, priced, verifiable, and composable.

### EVVM as Invisible Infrastructure
We built on EVVM intentionally. No validator node overhead, no gas fee friction for operators — the infrastructure disappears so the application layer can breathe. When a sensor operator in Xochimilco gets paid USDC for their node's uptime, they shouldn't need to understand blockchain. They just receive payment.

Good infrastructure is invisible. EVVM made that possible.

### Bankr + OpenServ Orchestration
The ARVI agent doesn't run in isolation. Bankr handles LLM orchestration across multi-stream sensor data — detecting patterns that single-node analysis misses (a slow drought forming across three zones, an air quality anomaly correlating with satellite fire data). OpenServ coordinates parallel responses when a single threat affects multiple agents or stakeholders.

The insight: **environmental intelligence is inherently multi-agent**. No single model sees the full picture.

### Locus for Payments
USDC payments on Base via Locus enable the two-sided marketplace ARVI depends on:
- **Supply side**: node operators earn monthly for data quality and uptime
- **Demand side**: field humans earn per verified mission; AI agents earn per task completed

Locus handles the payment routing without requiring participants to manage wallets or understand DeFi. That's the right level of abstraction for a system meant to include NGO workers, environmental scientists, and community node operators.

---

## Dashboard v7.0 Architecture

```
Command Center (Home)
├── KPI cards: Nodes Online · Network Health · Fire Hotspots · Avg Temp
├── Mini map (CDMX node locations, white bg, CartoDB light tiles)
├── Agent Activity Feed (live onchain log)
├── Sensor grid (3 nodes, compact health cards)
└── Agent Task Board preview → full Bounties tab

Tabs:
Global    — NASA FIRMS fire data + Open-Meteo per node
Sensors   — Hyperlocal readings per node (CO₂, soil, biodiversity, pathogens)
Intelligence — LLM analysis results + weather correlation
Actions   — Autonomous pipeline: sense → analyze → act → pay → done
Bounties  — Agent Task Board + Field Bounty Board (humans)
Network   — AgentWorld: 5 named agents, workstations, event feed
Atlas     — Leaflet map (light mode, CDMX focus)
Console   — Telemetry stream (TrackingConsole)
```

Sidebar removed in v7.0 — replaced by a **horizontal NodePicker** that appears only when a specific node is relevant. The system is network-first, not node-first.

---

## What Changed for Each Sponsor Track

### Base — Agent Services on Base
The x402 `/api/analyze` endpoint is our clearest Base-native feature. Pay-per-request environmental data, discoverable on Base, with ERC-8004 identity for provenance. Locus handles USDC distribution to operators and agents. EVVM removes the infrastructure friction.

v7.0 added: Base link badges in the IntelligencePlane step cards, "Built on Base" in the landing, explicit x402 framing in the Data API revenue stream.

### Octant — Three Tracks
ARVI is a direct implementation of what Octant's public goods evaluation tracks describe:

- **Mechanism Design for Public Goods Evaluation**: The Project Evaluation stream uses sensor evidence to produce independent MRV scores — a mechanism for verifiable impact claims, not self-reported ones.
- **Agents for Public Goods Data Analysis**: Bankr + OpenServ orchestrate multi-agent analysis of environmental sensor streams, cross-referenced with NASA and Open-Meteo.
- **Agents for Public Goods Data Collection**: Field Bounty Board pays humans and agents to collect environmental data. Sensor Kit program deploys new nodes.

v7.0 made these connections explicit: Project Evaluation renamed from "Carbon MRV" to align with Octant's framing; "Mechanism Design" language added; Octant tag visible in the Economy section.

### Protocol Labs — Let the Agent Cook
The ARVI agent cycle (sense → analyze → act → pay → done) is a demonstration of autonomous agent behavior without human triggers. The agent detects, decides, and dispatches — field bounties, institutional alerts, and onchain logs — in seconds. No human in the loop for the response chain.

v7.0 IntelligencePlane step 03 copy: *"Chapultepec sensor: CO₂ spike + 94% pathogen confidence → 12 USDC field bounty posted, NGO alerted with GPS coordinates, onchain log created. Zero human trigger."*

### OpenServ — Ship Something Real
The multi-agent coordination layer is live. Bankr analyzes, OpenServ routes, Locus pays. The `/api/analyze` endpoint is a real service. The `agent_log.json` in `/public` documents actual agent runs with timestamped decisions.

### Locus — Best Use of Locus
Locus is not a feature in ARVI — it's the payment infrastructure the entire economic model depends on. Operator payouts, agent task rewards, field bounty payments. The Field Bounty Board in v7.0's dashboard Bounties tab is the clearest expression of this: four human field missions with USDC bounties, paid via Locus on Base.

---

## What's Next

- Node 4 deployment (Bosque de Aragón) — first community-operated node
- Octant formal submission (3 tracks)
- ESG enterprise pilot — one company, one region, one quarter of data
- Field Bounty Board beta — first real human field missions in CDMX

---

*ARVI — Agentic Regeneration Via Intelligence*
*The first autonomous agent economy that detects environmental threats and acts — in seconds.*
