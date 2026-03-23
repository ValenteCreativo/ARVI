# ARVI — Agentic Regeneration Via Intelligence

![Status](https://img.shields.io/badge/status-live-brightgreen) ![Base](https://img.shields.io/badge/chain-Base%20Mainnet-0052FF?logo=ethereum) ![Venice](https://img.shields.io/badge/LLM-Venice%20AI-7B2FFF) ![ERC-8004](https://img.shields.io/badge/identity-ERC--8004-orange) ![License](https://img.shields.io/badge/license-BSD%203--Clause-blue)

> Four years of research. One working loop. Zero humans required.

Environmental data is trapped in government servers. Crises are detected weeks late. The people closest to the ecosystems — farmers, park rangers, community stewards — have no tools, no incentives, and no voice in the data economy.

ARVI gives them all three.

---

## Prove It in 15 Seconds

```bash
curl https://arvi-eight.vercel.app/api/demo | jq .
```

That single command runs the full chain: real weather data → Venice AI analysis → anomaly detection → alert written to Cloudflare R2 → proof artifacts returned. No mock. No simulation. Every field is verifiable.

---

## What Happens in That Call

| Step | What runs | Proof |
|------|-----------|-------|
| 1 | Open-Meteo API fetches real sensor coordinates | `lat/lon` + live weather in response |
| 2 | Venice AI (llama-3.3-70b) analyzes privately, zero retention | `"model_used": "venice-llama-3.3-70b"`, `"simulated": false` |
| 3 | Anomaly confirmed → email alert dispatched | `"email_sent": true` |
| 4 | Alert written to permanent public log on Cloudflare R2 | [alert-log.json](https://pub-d5530f4a34f949ba8f6e52c403aa3a8c.r2.dev/alert-log.json) |
| 5 | On-chain event emitted via ARVIAgent on Base Mainnet | [verified tx on Basescan](https://basescan.org/tx/0x28343f43738d306fcf7c6d794d9e057643960aeac6c761284399346f741b5416) |

**This loop runs automatically every hour. No human triggers it.**

---

## The Problem It Solves

Forests burn for days before anyone responds. Wetlands dry out over months with no one noticing. Air quality spikes go undetected in neighborhoods without expensive monitoring stations.

The existing system is centralized, slow, and built around waiting for humans to act.

ARVI flips the model: citizens deploy sensors and earn passive income. Venice AI analyzes the data privately and continuously. The agent acts the moment an anomaly is detected — alerting, logging, coordinating — without waiting for permission.

---

## Live Proof Artifacts

| Artifact | Link |
|----------|------|
| 🗂️ Live alert log (R2, permanent) | [alert-log.json](https://pub-d5530f4a34f949ba8f6e52c403aa3a8c.r2.dev/alert-log.json) |
| 📋 Agent manifest (ERC-8004 / x402) | [arvi.skill.md](https://arvi-eight.vercel.app/arvi.skill.md) |
| 🔗 ARVIAgent on Base Mainnet | [Basescan](https://basescan.org/address/0x8118069E26656862F8a0693F007d5DD7664Acb00) |
| 🤖 ERC-8004 on-chain identity | [AgentId 33311](https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a) |
| 🔁 Open mission board | [/api/missions](https://arvi-eight.vercel.app/api/missions) |
| 🌐 Live app | [arvi-eight.vercel.app](https://arvi-eight.vercel.app) |

---

## The Research Behind It

ARVI is not a hackathon idea. It is the fourth iteration of a Master's thesis in Strategic Business Administration — an experiment-based research arc that has been running since 2024.

| Version | Year | What was learned |
|---------|------|-----------------|
| Rembu | 2024 | Economic incentives can drive citizen sensor adoption (DePIN validation) |
| SEN | 2025 | Hyperlocal environmental data has real market demand |
| Aona | 2025 | AI can replace human analysts for anomaly detection |
| **ARVI** | **2026** | **Autonomous agents can close the full loop — detect, decide, act** |

Each version ran in a real hackathon. Each validated one hypothesis. ARVI is where they converge.

---

## Sponsor Integrations

### 🟣 Venice AI — Private Inference
Sensor data is sensitive. Species locations, ecosystem vulnerabilities, proprietary monitoring zones — none of it should train a cloud model. Every ARVI analysis runs on Venice with zero retention. Every response includes `"simulated": false`.

### 🔵 Protocol Labs — No Humans Required + ERC-8004
The agent detects → decides → acts → logs, hourly, with no human trigger. It has a verifiable on-chain identity: AgentId `33311`, registered at `eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`.

### 🟢 Octant — Data Collection and Analysis for Impact Project Evaluation
Impact projects claim outcomes that no one can independently verify. ARVI gives them continuous, sensor-backed, AI-analyzed evidence — not self-reported. Any Octant-funded project can deploy a node and get an objective impact score.

### 🔷 ENS — Operator Identity
Node operators register a `.eth` name once. Every alert, payment, and mission resolves to that name — no raw addresses. The ENS endpoint is live:
```bash
curl https://arvi-eight.vercel.app/api/ens?name=vitalik.eth
```

### 🟡 Base — Settlement Layer
Operator rewards, inference micropayments, and alert events all settle on Base. ARVIAgent contract: [`0x8118069E26656862F8a0693F007d5DD7664Acb00`](https://basescan.org/address/0x8118069E26656862F8a0693F007d5DD7664Acb00)

---

## Stack

```
Frontend     Next.js 15 · TypeScript · Tailwind · Framer Motion
LLM          Venice AI (llama-3.3-70b) — private, zero retention
Blockchain   Base Mainnet (ARVIAgent) · ERC-8004 identity
Alert log    Cloudflare R2 — public, permanent, append-only
Email        Resend — medium/high/critical anomaly alerts
Data         Open-Meteo API (real-time weather + environmental)
Cron         Vercel — hourly autonomous loop
Identity     ENS — operator and node addressing
```

---

*ARVI — Pantera Labs 2026 · Built for [The Synthesis Hackathon](https://synthesis.md/)*

From México, with 💚.
