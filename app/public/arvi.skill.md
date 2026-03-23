# ARVI — Environmental Intelligence Agent Service

> Base URL: `https://arvi-eight.vercel.app`
> Agent Identity: ERC-8004 on Base Mainnet
> Payment: x402 — USDC on Base

ARVI is an autonomous environmental intelligence service. Agents and humans can request real-time forest sensor analysis, anomaly detection, and alert generation for urban forest nodes in Mexico City.

---

## What ARVI Does

ARVI analyzes IoT sensor data from urban forest nodes and returns structured intelligence reports. When threats are detected (plagues, drought, fire risk, air quality anomalies), ARVI logs verifiable alerts and optionally notifies operators via email.

Data sources: Open-Meteo (real-time weather), NASA FIRMS (fire hotspots), curated node baselines (Chapultepec, Xochimilco, Bosque de Tlalpan).

---

## Authentication

No API key required for basic analysis. x402 payment accepted for premium features (priority analysis, email alerts, multi-node batch).

---

## Endpoints

### POST /api/analyze

Analyze a sensor node and return structured environmental intelligence.

```bash
curl -X POST https://arvi-eight.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"node_id": "node-01"}'
```

**Request body:**
```json
{
  "node_id": "node-01",
  "email_alert": "operator@example.com"
}
```

**Available nodes:**
- `node-01` — Chapultepec Forest (19.4133, -99.1905)
- `node-02` — Xochimilco (19.2646, -99.0982)
- `node-03` — Bosque de Tlalpan (19.2763, -99.1842)

**Response:**
```json
{
  "success": true,
  "analysis": {
    "node_id": "node-01",
    "severity": "high",
    "alert_type": "heat_stress",
    "confidence": 0.89,
    "recommendation": "Increase irrigation. Deploy pest monitoring.",
    "anomaly_detected": true,
    "model_used": "venice-llama-3.3-70b",
    "simulated": false
  },
  "alert": {
    "id": "uuid",
    "timestamp": "2026-03-23T...",
    "verifiable_at": "/alert-log.json"
  }
}
```

**x402 Payment Headers (for premium features):**
```
X-PAYMENT: <signed USDC payment on Base>
X-PAYMENT-SCHEME: exact
X-PAYMENT-AMOUNT: 1000000
X-PAYMENT-ASSET: USDC
X-PAYMENT-CHAIN: base
```

---

### GET /api/weather

Fetch live sensor data for all nodes.

```bash
curl https://arvi-eight.vercel.app/api/weather
```

---

### GET /api/cron

Trigger autonomous agent loop (analyzes all 3 nodes sequentially). Normally runs hourly via Vercel cron.

```bash
curl https://arvi-eight.vercel.app/api/cron
```

---

### GET /alert-log.json

Public verifiable log of all agent actions. Updated on every analysis run.

```bash
curl https://arvi-eight.vercel.app/alert-log.json
```

---

## Agent Manifest

- **agent.json**: `https://arvi-eight.vercel.app/agent.json`
- **alert-log.json**: `https://pub-d5530f4a34f949ba8f6e52c403aa3a8c.r2.dev/alert-log.json`
- **ERC-8004 tx**: `0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a`
- **Base Mainnet identity**: verified

---

## Example: Agent-to-Agent Call

An orchestrator agent can call ARVI, receive the analysis, and trigger a payment:

```bash
# Step 1: Request analysis
RESULT=$(curl -s -X POST https://arvi-eight.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"node_id": "node-01", "email_alert": "ops@arvi.earth"}')

# Step 2: Check severity
SEVERITY=$(echo $RESULT | python3 -c "import sys,json; print(json.load(sys.stdin)['analysis']['severity'])")

# Step 3: If critical, trigger payment to ARVI agent wallet
if [ "$SEVERITY" = "critical" ]; then
  echo "Critical threat detected — triggering ARVI payment reward"
  # Send ARVI token to agent wallet via coordinator
fi
```

---

## ARVI Agent Wallet

Receive payments and rewards at:
`0xc193F0c7649444c96dE651Cbf4ddF771f3142450`

Network: Base Mainnet
Token: $ARVI (contact for token address)
