# ARVI — Agentic Regeneration Via Intelligence

![Status](https://img.shields.io/badge/status-live-brightgreen) ![Base](https://img.shields.io/badge/chain-Base%20Mainnet-0052FF?logo=ethereum) ![Venice](https://img.shields.io/badge/LLM-Venice%20AI-7B2FFF) ![ERC-8004](https://img.shields.io/badge/identity-ERC--8004-orange) ![License](https://img.shields.io/badge/license-MIT-green)

> **Environmental data is centralized, slow, and lacks economic incentives. ARVI fixes this.**
>
> A decentralized sensor network that collects environmental data, analyzes it with private AI, and takes autonomous agentic actions — without waiting for humans.

---

## The Problem

Environmental data today lives in government agencies and NASA satellites. There is no real automated analysis capable of preventing crises and identifying patterns for climate resilience. The human factor in environmental solutions lacks economic incentives, is slow, and bureaucratic — unable to act with the urgency the planetary crisis demands.

## The Solution

ARVI is a decentralized network of environmental sensors. Each sensor:
- Streams hyperlocal data (CO₂, soil moisture, biodiversity, pathogen risk, air quality) every 5 minutes
- Feeds an AI agent that analyzes, correlates, and detects threats autonomously
- Generates passive income for its owner — paid on Base, no technical knowledge required

**The agent acts. Not humans.**

---

## The Loop Is Real — Here Is the Evidence

This is not a UI demo. Every artifact below is publicly verifiable right now.

### Try it yourself

```bash
curl -X POST https://arvi-eight.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"node_id": "node-01", "email_alert": "ops@yourorg.com"}'
```

**What happens in that single call:**

| Step | What runs | Verifiable proof |
|------|-----------|-----------------|
| 1 | Open-Meteo API called with sensor coordinates | Real lat/lon in response payload |
| 2 | Venice AI (llama-3.3-70b) analyzes data privately | `"model_used": "venice-llama-3.3-70b"`, `"simulated": false` in JSON response |
| 3 | Anomaly confirmed → email alert dispatched | Resend delivery log; `"email_sent": true` in response |
| 4 | Alert written to public persistent log on Cloudflare R2 | **[alert-log.json (live)](https://pub-d5530f4a34f949ba8f6e52c403aa3a8c.r2.dev/alert-log.json)** |
| 5 | On-chain event emitted via ARVIAgent on Base Mainnet | **[Verified tx on Basescan](https://basescan.org/tx/0x28343f43738d306fcf7c6d794d9e057643960aeac6c761284399346f741b5416)** |

**This loop runs automatically every hour. Zero human trigger.**

### Public proof artifacts (open right now)

| Artifact | URL | What it proves |
|----------|-----|---------------|
| 🗂️ Live alert log | **[r2.dev/alert-log.json](https://pub-d5530f4a34f949ba8f6e52c403aa3a8c.r2.dev/alert-log.json)** | Real Venice AI entries, `simulated: false`, timestamps, UUIDs |
| 📋 Agent manifest | [arvi.skill.md](https://arvi-eight.vercel.app/arvi.skill.md) | Discoverable agent identity, x402 payment headers |
| 🔗 Base contract | [ARVIAgent on Basescan](https://basescan.org/address/0x8118069E26656862F8a0693F007d5DD7664Acb00) | On-chain alert event, deploy + alert tx |
| 🤖 ERC-8004 identity | [registration tx](https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a) | AgentId `33311`, on-chain agent registry |
| 🔁 Mission board | [/api/missions](https://arvi-eight.vercel.app/api/missions) | Open missions posted by the agent |

### Sample real response (node-01, March 23 2026)

```json
{
  "success": true,
  "analysis": {
    "model_used": "venice-llama-3.3-70b",
    "simulated": false,
    "severity": "high",
    "anomaly_detected": true,
    "confidence": 0.87,
    "alert_type": "ecosystem_stress",
    "description": "High ecosystem stress detected. CO2 elevated, soil moisture below critical threshold.",
    "recommended_action": "Deploy irrigation response and alert park rangers to inspect sector A."
  },
  "alert": { "id": "3f3e4034-e36a-477a-8c67-0211ed65fd14" },
  "email_sent": true
}
```

---

## What the Agent Can Do (Full Vision)

The autonomous loop today handles detection + alerting + on-chain logging. The architecture is built so the same agent can extend to:

- 🌡️ **Real-time threat detection** — plague, drought, fire risk, air quality anomalies
- 📧 **Operator notifications** — email alerts with GPS, severity, recommended action
- 💸 **Autonomous payments** — pay sensor operators on Base based on data quality + uptime
- 🗳️ **Project evaluation** — provide objective, sensor-backed impact scores for regen projects
- 📊 **Carbon MRV** — generate verifiable monitoring reports for carbon credit issuance
- 🔍 **ESG compliance** — continuous environmental evidence for corporate sustainability
- 🤝 **Agent-to-agent coordination** — post missions, receive responses, coordinate parallel analysis
- 🌐 **Node network expansion** — register new sensors, onboard operators, auto-assign zones

---

## Sponsor Integration

### 🟣 Venice AI — Private Inference
**Track: Venice Private Agents**

Environmental sensor data is sensitive IP — species locations, ecosystem vulnerabilities, proprietary monitoring zones. Venice AI processes every analysis with **zero data retention**. No cloud logs, no training on your data.

Every `/api/analyze` response includes:
```json
{ "model_used": "venice-llama-3.3-70b", "simulated": false }
```

### 🟡 Protocol Labs — Let the Agent Cook + ERC-8004
**Tracks: No Humans Required / Receipts on Chain**

ARVI's entire value proposition is **no human in the loop**. The agent:
- Detects → decides → acts → logs — all autonomously
- Runs on a Vercel cron (hourly), zero human trigger
- Has a verifiable on-chain identity via ERC-8004

**ERC-8004 registration:**
- AgentId: `33311`
- Registry: `eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Tx: [`0xb8623d...cf43a`](https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a)

**Agent service manifest** (discoverable by any agent):
```
https://arvi-eight.vercel.app/arvi.skill.md
```

### 🟢 Octant — Data Collection & Analysis for Project Evaluation
**Tracks: Mechanism Design / Analysis / Collection**

This is ARVI's core public goods use case. Impact projects — reforestation, wetland restoration, urban greening — often claim environmental outcomes that are impossible to verify independently. ARVI provides the infrastructure to change that:

- **Before/after sensor deployment**: measure what actually changed in CO₂, biodiversity, soil health
- **Continuous data streams**: not a one-time audit — ongoing monitoring over the project lifecycle
- **Objective scoring**: the AI agent produces a structured impact score, free from human bias or conflict of interest
- **Composable evidence**: output feeds Octant, Gitcoin, and carbon credit issuers directly

Any Octant-funded project can deploy an ARVI sensor, get a public sensor node ID, and generate verifiable impact evidence. The data collection and analysis is the service.

### 🔵 Base — Agent Services on Base
**Track: Base Agent Services**

All economic activity in ARVI settles on Base:
- Sensor operator payments (passive income)
- Agent inference micropayments (x402)
- Alert events on ARVIAgent contract

**Live contract:** [`0x8118069E26656862F8a0693F007d5DD7664Acb00`](https://basescan.org/address/0x8118069E26656862F8a0693F007d5DD7664Acb00)
**Verified alert tx:** [`0x28343f...b5416`](https://basescan.org/tx/0x28343f43738d306fcf7c6d794d9e057643960aeac6c761284399346f741b5416)

### 🔷 ENS — Agent Identity
**Track: ENS Identity**

ARVI uses ENS for human-readable node addressing across the sensor network. Each sensor node maps to an `.eth` name, enabling:
- Consistent identity across deployments (`chapultepec-a.arvi.eth`)
- Agent-to-agent lookup without raw addresses
- ENS resolution integrated in the dashboard node registry

Registration: `arvi-agent.eth` (pending finalization)
ENS resolution via viem in the dashboard node data layer.

---

## Why We Cut These

| Removed | Reason |
|---------|---------|
| **Bankr** | `api.bankr.ai/v1` returns empty responses. Bankr is a token launchpad, not an LLM gateway. |
| **OpenServ** | No real integration possible within project scope. Removed to maintain submission honesty. |
| **Locus** | API not functional during development. Payments handled directly via ARVIAgent on Base. |

---

## Live Infrastructure

| Resource | Link |
|----------|------|
| 🌐 Live app | https://arvi-eight.vercel.app |
| 📋 Agent manifest | https://arvi-eight.vercel.app/arvi.skill.md |
| 🗂️ Alert log (persistent, R2) | **https://pub-d5530f4a34f949ba8f6e52c403aa3a8c.r2.dev/alert-log.json** |
| 📊 Alert log (app route) | https://arvi-eight.vercel.app/alert-log.json |
| 🔍 Contract on Base | https://basescan.org/address/0x8118069E26656862F8a0693F007d5DD7664Acb00 |
| ⚡ Verified alert tx | https://basescan.org/tx/0x28343f43738d306fcf7c6d794d9e057643960aeac6c761284399346f741b5416 |
| 🤖 ERC-8004 identity | https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a |
| 🔁 Mission board | https://arvi-eight.vercel.app/api/missions |

---

## Stack

```
Frontend     Next.js 15 · TypeScript · Tailwind · Framer Motion
LLM          Venice AI (llama-3.3-70b) — private, zero retention
Blockchain   Base Mainnet (ARVIAgent) · ERC-8004 identity
Email        Resend — critical/high anomaly alerts
Data         Open-Meteo API · NASA FIRMS fire data
Cron         Vercel — hourly autonomous loop
Identity     ENS — human-readable node addressing
```

---

## Repo Structure

```
app/                       ← Next.js app (Vercel root dir)
├── app/
│   ├── page.tsx           ← Landing
│   ├── dashboard/         ← Live agent dashboard
│   └── api/
│       ├── analyze/       ← Core agent action (Venice AI + email + on-chain)
│       ├── missions/      ← Open mission board (agent coordination)
│       ├── cron/          ← Autonomous hourly loop
│       └── weather/       ← Open-Meteo integration
├── lib/
│   ├── bankr.ts           ← Venice AI integration
│   ├── alertLog.ts        ← Verifiable alert logging
│   └── locus.ts           ← Payment layer
└── public/
    ├── arvi.skill.md      ← Agent service manifest (ERC-8004 / x402)
    └── alert-log.json     ← Public verifiable alert history
```

---

*ARVI — Pantera Labs 2026 · [Synthesis Hackathon](https://arvi-eight.vercel.app)*
