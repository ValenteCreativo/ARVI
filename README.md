# ARVI — Agentic Regeneration Via Intelligence

> **Sensors generate data. Agents act. Owners earn.**

ARVI turns environmental sensors into an autonomous income-generating network.

---

## How It Works

```
[Sensor] → streams data → [ARVI Network]
                                ↓
                    [Venice AI analyzes privately]
                                ↓
                    Threat detected? → [Agent acts]
                         ↓                    ↓
                  Email alert sent      On-chain tx on Base
                         ↓
                  Sensor owner earns passive income
```

1. **Buy a sensor** → deploy it in a forest, park, or ecosystem
2. **Your sensor streams** hyperlocal data every 5 minutes (CO₂, soil moisture, pathogen risk, biodiversity, air quality)
3. **AI agents analyze** the data continuously — correlating patterns, identifying threats
4. **Agents act autonomously** — no human trigger required
5. **Sensor owners earn** passive income for contributing environmental intelligence

Agents can also **offer inference as a service**: any autonomous agent can query ARVI, get a structured environmental analysis, and pay per-inference.

---

## Live Infrastructure

| Component | Details |
|-----------|---------|
| Live app | https://arvi-eight.vercel.app |
| Agent contract (Base Mainnet) | `0x8118069E26656862F8a0693F007d5DD7664Acb00` |
| Verifiable alert tx | [basescan.org](https://basescan.org/tx/0x28343f43738d306fcf7c6d794d9e057643960aeac6c761284399346f741b5416) |
| Agent manifest | https://arvi-eight.vercel.app/arvi.skill.md |
| ERC-8004 identity | [basescan.org](https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a) |
| Mission board | https://arvi-eight.vercel.app/api/missions |
| Alert log (public) | https://arvi-eight.vercel.app/alert-log.json |

---

## One Real Action

```bash
# Any agent can hire ARVI — or ARVI posts missions for other agents
curl https://arvi-eight.vercel.app/api/missions

# Trigger an environmental analysis (Venice AI, private inference)
curl -X POST https://arvi-eight.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"node_id": "node-01", "email_alert": "ops@example.com"}'
```

Response includes: anomaly detection, severity, recommended action, on-chain payment wallet, model used (`venice-llama-3.3-70b`), `simulated: false`.

---

## Sponsor Integration Rationale

### ✅ Venice — Private Inference
Sensor data is sensitive environmental IP. Venice AI (llama-3.3-70b) processes all data with zero retention. Replaced Bankr/OpenAI. Every analysis response includes `model_used: "venice-llama-3.3-70b"` and `simulated: false`.

### ✅ Protocol Labs (ERC-8004 + No Humans Required)
ARVI has a verified on-chain agent identity (agentId `33311` on Base). The cron loop runs hourly with zero human intervention. Agent service manifest at `/arvi.skill.md` makes ARVI discoverable by other agents.

### ✅ Base — Agent Services
ARVIAgent contract deployed on Base Mainnet. Every alert emits an on-chain event. Sensor operators get paid on Base.

### ✅ Octant — Regenerative Mechanism
ARVI is a regenerative public good: sensor owners earn by contributing to environmental intelligence. The more nodes, the stronger the network.

### ✅ ENS — Agent Identity
Node addressing via .eth names for human-readable sensor identification.

### ✅ Status Network — Gasless Tx
Enables sensor operators in low-income or remote regions to participate without holding ETH for gas.

### ✅ Markee — Access Control
Premium data stream access control for enterprise or research consumers.

### ❌ Bankr (excluded)
`api.bankr.ai/v1` returned empty responses. Bankr is a token launchpad, not an LLM gateway. Replaced with Venice.

### ❌ OpenServ (excluded)
No real code integration was possible within the project scope. Removed to maintain honesty.

### ❌ Locus (excluded)
API not functional during development. Payment flows handled by ARVIAgent contract on Base directly.

---

## Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind, Framer Motion
- **LLM:** Venice AI (llama-3.3-70b) — private, zero retention
- **Blockchain:** Base Mainnet (ARVIAgent contract), ERC-8004 identity
- **Email:** Resend (critical/high anomaly alerts)
- **Data:** Open-Meteo API, NASA FIRMS fire data
- **Cron:** Vercel (hourly autonomous loop)

---

## Repo Structure

```
app/                  ← Next.js app (Vercel root)
├── app/
│   ├── page.tsx      ← Landing
│   ├── dashboard/    ← Live agent dashboard
│   ├── api/
│   │   ├── analyze/  ← Core agent action (Venice AI)
│   │   ├── missions/ ← ARVI mission board
│   │   ├── cron/     ← Autonomous hourly loop
│   │   └── weather/  ← Open-Meteo integration
│   └── ...
├── lib/
│   ├── bankr.ts      ← Venice AI integration (renamed for continuity)
│   ├── locus.ts      ← Payment simulation
│   ├── alertLog.ts   ← Verifiable alert logging
│   └── alert-action.ts
└── public/
    ├── arvi.skill.md ← Agent service manifest (ERC-8004 / x402)
    └── alert-log.json
```

---

*ARVI — Pantera Labs 2026 · Synthesis Hackathon*
