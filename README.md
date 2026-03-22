# ARVI — Agentic Regeneration Via Intelligence

> Environmental intelligence for prevention and resilience. One provable autonomous loop.

## What Works Now (Demo)
1. **Real public data** — Open-Meteo weather API + NASA FIRMS fire data
2. **Real LLM analysis** — Bankr gateway (Gemini 2.5 Flash) with structured JSON output
3. **Real decision** — anomaly threshold logic with severity classification
4. **Real action** — alert logged to `/alert-log.json` with timestamp and evidence
5. **Real identity** — ERC-8004 registered on Base Mainnet ([0xb8623d...cf43a](https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a))

## What is Roadmap
- Live IoT sensor nodes (current data: curated static baselines for 3 CDMX locations)
- Locus USDC automatic payments (payment infrastructure ready; awaiting Locus public API)
- Multi-city expansion

## Demo Path (60 seconds)
1. Visit [arvi-eight.vercel.app](https://arvi-eight.vercel.app)
2. Go to Dashboard → click **Run Agent**
3. See: real weather data fetched, LLM analysis returned, alert logged
4. Visit `/alert-log.json` — see the structured evidence

## Architecture

```
Sensor reads → Agent analyzes (Bankr LLM) → Alert logged → Operator paid (USDC)
```

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| Weather | Open-Meteo API (free, no key) |
| Fire data | NASA FIRMS MODIS NRT (free key) |
| LLM | Bankr Gateway → Gemini 2.5 Flash |
| Payments | Locus USDC (Base) — integrated, awaiting public API |
| Identity | ERC-8004 — agent.json registered on Base Mainnet |
| Deploy | Vercel (CI/CD from GitHub main) |

## API

### `POST /api/analyze`

```json
{ "node_id": "node-01" }
```

Returns analysis result with `simulated: true/false` indicating whether Bankr LLM was actually called, plus alert entry written to `/alert-log.json`.

### `GET /api/weather`

Returns live Open-Meteo data for all 3 nodes + NASA FIRMS fire hotspots near Mexico.

## Environment Variables
- `BANKR_API_KEY` — Bankr LLM gateway (Gemini 2.5 Flash)
- `LOCUS_API_KEY` — Locus payments (Base chain USDC)
- `BANKR_API_URL` — default: `https://api.bankr.ai/v1`

## ERC-8004 Identity
Agent Pantera — [0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a](https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a) (Base Mainnet)

## Active Nodes (CDMX pilot)

| Node | Location | Health | Status |
|---|---|---|---|
| `node-01` | Bosque de Chapultepec | 34% | CRITICAL — plague risk |
| `node-02` | Alameda Central | 71% | Monitoring |
| `node-03` | Tlatelolco | 52% | Drought stress |

Node sensor data is currently curated static baselines — not live IoT streams.

## Built at Synthesis Hackathon 2026

**Builder:** Valentín Martínez
**Team:** Pantera Labs
**Participant ID:** d88080a57309466c96340338faed7862

---

*Signals become decisions.*
