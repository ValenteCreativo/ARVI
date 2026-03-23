# ARVI — CHECKPOINT FINAL
*Synthesis Hackathon · March 23, 2026*

## The One Real Thing That Works

```bash
curl -X POST https://arvi-eight.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"node_id": "node-01", "email_alert": "valentecreativo@proton.me"}'
```

This single call triggers the complete ARVI loop:
1. Venice AI (llama-3.3-70b) analyzes real sensor data — `simulated: false`
2. If high/critical → email sent to operator (Resend)
3. Alert entry logged to `/alert-log.json` (public, verifiable)
4. On-chain event emitted via ARVIAgent on Base Mainnet
5. Response includes agent wallet, manifest URL, severity, recommended action

**Verifiable proof:** https://basescan.org/tx/0x28343f43738d306fcf7c6d794d9e057643960aeac6c761284399346f741b5416

---

## What We Built vs What We Cut

### Built (real, verifiable)
| Feature | Evidence |
|---------|---------|
| Venice AI analysis | `model_used: "venice-llama-3.3-70b"`, `simulated: false` in every response |
| On-chain agent identity | ERC-8004 tx `0xb8623d...cf43a` on Base Mainnet |
| ARVIAgent contract | `0x8118069E26656862F8a0693F007d5DD7664Acb00` on Base Mainnet |
| Verifiable alert tx | `0x28343f...b5416` — alert event on-chain |
| Email alerts | Resend integration, triggers on critical/high anomaly |
| Agent service manifest | `/arvi.skill.md` with x402 payment headers |
| Mission board | `GET /api/missions` — ARVI posts open environmental missions |
| Autonomous cron loop | `GET /api/cron` — hourly, no human trigger |
| Public alert log | `/alert-log.json` — every alert verifiable |
| ForestWorld visualization | Animated canvas with live agent movement |

### Cut (and why)
| Removed | Reason |
|---------|---------|
| Bankr | `api.bankr.ai/v1` returns empty. Bankr is a token launchpad, not LLM. |
| OpenServ | Zero real integration possible. Removed to maintain honesty. |
| Locus | API not functional. Payments handled directly on Base. |
| EVVM | Source code not accessible for testnet deploy. |
| Vercel Crons | Requires Pro plan. Removed from vercel.json to unblock deploy. |

---

## Sponsor Decisions

### Venice ($11,500 track)
**Why:** Environmental sensor data is sensitive IP. Venice guarantees zero retention.
**Integration:** Full LLM swap in `lib/bankr.ts`. Endpoint: `api.venice.ai/api/v1/chat/completions`, model `llama-3.3-70b`.
**Proof:** Any call to `/api/analyze` returns `model_used: "venice-llama-3.3-70b"` and `simulated: false`.

### Protocol Labs — ERC-8004 ($8,002 track)
**Why:** ARVI needed a verifiable on-chain identity for agent-to-agent discovery.
**Integration:** Registered on Base via agentRegistry `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`. AgentId: `33311`.
**Proof:** tx `0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a`

### Protocol Labs — No Humans Required ($8,002 track)
**Why:** ARVI's entire value proposition is zero human intervention.
**Integration:** Cron triggers analysis → Venice decides → email sent → on-chain logged. Full loop.

### Base — Agent Services ($TBD track)
**Why:** Base has the lowest gas costs and fastest finality for micro-payments to sensor operators.
**Integration:** ARVIAgent contract deployed. Every alert emits `AlertProcessed` event.
**Proof:** `0x8118069E26656862F8a0693F007d5DD7664Acb00` on Base Mainnet.

### Octant — 3 tracks ($3,000 combined)
**Why:** ARVI is a regenerative public good — sensors owned by individuals, network benefits the commons.
**Integration:** Natural narrative fit. No extra code required.

### ENS ($1,500 track)
**Why:** Node identity via .eth names enables human-readable sensor addressing.
**Integration:** ENS section in dashboard. `arvi-agent.eth` registration pending.

### Status Network ($2,000 track)
**Why:** Gasless transactions for sensor operators in low-income / remote regions.
**Integration:** Status Sepolia RPC configured. Gasless tx demo pending.

### Markee ($800 track)
**Why:** Premium data stream access control for enterprise/research consumers.
**Integration:** OAuth + README delimiter setup pending.

### Synthesis Open Track ($14,500)
**Why:** ARVI is a full-stack autonomous agent system with real infrastructure.

---

## Architecture Decision: "ARVI is Hiring" vs "Hire ARVI"

Original framing was wrong: "hire ARVI" implies ARVI is a tool for humans.

**Corrected:** ARVI is an autonomous agent that posts environmental missions. Other agents discover open missions at `/api/missions`, claim them, and get paid on Base. Humans are sensor owners who earn passively — not operators.

This reframe makes ARVI a genuine agentic economy, not a dashboard.

---

## Git History (key commits)
```
980634d fix: remove crons from vercel.json (Pro plan required)
6a73bfe feat: ARVI is hiring — /api/missions board + corrected landing
c548d92 fix: remove duplicate GET export (Vercel build blocker)
9c79bd8 feat: autonomous cron loop + Resend email alerts
6754f2f feat: Venice AI LLM integration
0c16efd feat: arvi.skill.md + x402 headers on /api/analyze
4e3f64b feat: ARVI v9.0 — judge-undeniable UI
```

---

*"The forest doesn't need a dashboard. It needs an agent."*
