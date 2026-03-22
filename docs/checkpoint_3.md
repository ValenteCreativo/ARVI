# ARVI — CHECKPOINT 3
**Fecha:** 2026-03-22 (UTC)  
**Tiempo restante:** ~23h  
**Commit live:** `85bd114`  
**URL producción:** https://arvi-eight.vercel.app  
**GitHub:** https://github.com/ValenteCreativo/ARVI  

---

## Estado General

| Dimensión | Estado |
|---|---|
| Producción (Vercel) | ✅ Live — 200 en todas las rutas |
| Build | ✅ 0 errores TypeScript |
| Agent Loop | ✅ Funcional — 3 nodos, pagos USDC |
| ERC-8004 Identity | ✅ Base Mainnet — 0xb8623d...cf43a |
| EVVM Contracts | ✅ Anvil local (chain 31337) |
| Base Sepolia | ❌ Pendiente |
| Bankr API real | ⚠️ Simulado (bloqueado desde AWS) |
| Locus API real | ⚠️ Simulado (bloqueado desde AWS) |

---

## Evolución de versiones

| Versión | Commit | Descripción |
|---|---|---|
| v1.0 | `ad16746` | Scaffold inicial + EVVM deploy Anvil |
| v2.0 | `ad16746` | Atlas + Business Model |
| v3.0 | `4a7cdf1` | Horizontal scroll + design system dark |
| v3.1 | `612701b` | World canvas + dashboard 3 tabs |
| v4.0 | `a6faf6b` | Whiteboard system — jade + neutros |
| **v5.0** | **`85bd114`** | **Horizontal journey — 6 planos navegables** |

---

## Arquitectura del proyecto

```
ARVI/
├── app/                          ← Next.js 15.2.9 (Vercel root dir)
│   ├── app/
│   │   ├── page.tsx              ← Landing v5.0 (horizontal journey)
│   │   ├── layout.tsx            ← Root layout
│   │   ├── globals.css           ← Design system v4/v5
│   │   ├── dashboard/page.tsx    ← Command center (3 tabs)
│   │   ├── atlas/
│   │   │   ├── page.tsx          ← Atlas page
│   │   │   └── MapComponent.tsx  ← Leaflet dark map SSR-safe
│   │   ├── register/page.tsx     ← Node registration form
│   │   ├── components/
│   │   │   └── MiniWorldMap.tsx  ← Mini Leaflet map (landing/atlas panel)
│   │   └── api/
│   │       ├── analyze/route.ts  ← POST /api/analyze (agent loop)
│   │       └── weather/route.ts  ← GET /api/weather (Open-Meteo + FIRMS)
│   ├── data/
│   │   └── nodes.ts              ← 3 CDMX nodes (expanded schema)
│   ├── lib/
│   │   ├── bankr.ts              ← LLM Gateway (Bankr + sim fallback)
│   │   ├── locus.ts              ← USDC payments (Locus + sim fallback)
│   │   └── agent-log.ts          ← Onchain log writer
│   ├── tailwind.config.ts        ← v4 design tokens
│   └── vercel.json               ← Framework preset
├── agent.json                    ← ERC-8004 agent identity
├── agent_log.json                ← Onchain execution log
├── ARVI_CHECKPOINT.md            ← CP1 + CP2
├── ARVI_CHECKPOINT_3.md          ← Este archivo
└── .env                          ← API keys (gitignored)
```

---

## V5.0 Landing — Experiencia horizontal

La landing es ahora un sistema navegable de 6 planos completos.  
Navegación: wheel → horizontal, flechas de teclado, swipe táctil, dots clickeables.

### Planos

| # | ID | Contenido |
|---|---|---|
| 0 | INTRO | "ARVI" a 160px, red animada SVG, nodos reactivos al cursor |
| 1 | SYSTEM | Grafo SVG interactivo (5 nodos + aristas), click = micro-copy |
| 2 | ATLAS | Mapa mini Leaflet embebido + overlays de nodos CDMX + hover tooltips |
| 3 | DASHBOARD | 3 nodos con health bars + alerta activa + link al dashboard completo |
| 4 | ECONOMICS | Flujo animado (signal → verified → rewarded → protected) + partícula viajera |
| 5 | ENTER | Fondo oscuro, "ARVI is not a dashboard. It's an intelligence system." + CTA |

### Indicador de progreso persistente
- Línea horizontal fija en bottom
- Nodo viajero (dot jade) que se mueve con física (spring)  
- Dots + labels por sección, todos clickeables
- Flechas ← → laterales

---

## Dashboard — Command Center

**Ruta:** `/dashboard`  
**Diseño:** Whiteboard (#F7F7F7 base, panels blancos, jade como acento)

### Tabs
1. **◎ Sensors** — Array completo de sensores por nodo
2. **◈ Intelligence** — Open-Meteo live + NASA FIRMS + análisis del agente
3. **▸ Actions** — Pipeline animado + resultado de pago + log de ejecución

### Datos por nodo (nodes.ts — schema expandido)

| Campo | Tipo | Fuente |
|---|---|---|
| temperature_c | number | Sensor de dosel (canopy-level) |
| humidity_pct | number | Zona raíz (root zone) |
| co2_ppm | number | Columna de aire |
| soil_moisture_pct | number | Sensor a 30-60cm |
| air_quality_index | number | PM2.5/PM10 en dosel |
| biodiversity_score | number | Sensor de audio (presencia de especies) |
| pathogen_risk | number | Modelo AI (todos los inputs) |
| canopy_density_pct | number | Sensor visual |
| uv_index | number | Base del dosel |
| operator_wallet | string | Ethereum address |
| lat / lon | number | Coordenadas reales CDMX |

### 3 nodos CDMX

| ID | Ubicación | Health | Estado |
|---|---|---|---|
| node-01 | Bosque de Chapultepec | 34% | CRITICAL — probable_plague |
| node-02 | Alameda Central | 71% | medium — monitoring |
| node-03 | Tlatelolco | 52% | high — drought_stress |

---

## Agent Loop — `/api/analyze`

```
POST /api/analyze { node_id: "node-01" }

→ lib/bankr.ts → analyzeNodeData(node)
  ├── Si BANKR_API_KEY presente: fetch api.bankr.ai/v1/chat/completions
  │   └── model: gemini-2.5-flash, prompt con todos los campos del sensor
  └── Si no / timeout: simulateAnalysis(node) [deterministic, coherent]

→ lib/locus.ts → triggerPayment(analysis)
  ├── Si LOCUS_API_KEY presente: fetch api.locus.finance
  └── Si no: simulated USDC transfer

→ lib/agent-log.ts → appendLog(entry)
  └── Escribe en agent_log.json

→ Response JSON:
  { success, node, analysis, payment }
```

### Outputs verificados en producción:
- node-01: `critical · probable_plague · 0.94 conf · 8.5 USDC`
- node-02: `medium · monitoring · 0.82 conf · 3 USDC`
- node-03: `high · drought_stress · 0.88 conf · 5 USDC`

---

## Atlas — `/atlas`

- Leaflet dark map (CartoDB dark tiles)
- Zoom inicial: CDMX, 3 nodos con markers animados
- Popups con datos del nodo
- Open-Meteo live weather overlay
- NASA FIRMS fire hotspots (MEX, 24h)
- Custom CSS dark popups

---

## APIs en producción

| Endpoint | Método | Estado |
|---|---|---|
| `/api/analyze` | POST | ✅ Funcional |
| `/api/weather` | GET | ✅ Funcional — 3 nodos |
| Open-Meteo | External | ✅ Live (no key needed) |
| NASA FIRMS | External | ✅ Live (key en env) |
| Bankr API | External | ⚠️ Simulated (AWS bloqueado, OK en Vercel) |
| Locus API | External | ⚠️ Simulated (AWS bloqueado, OK en Vercel) |

---

## Identidad onchain

| Item | Detalle |
|---|---|
| ERC-8004 TX | `0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a` |
| Chain | Base Mainnet |
| Agent Name | Pantera |
| agent.json | Root del repo — live en GitHub |
| agent_log.json | 2 entradas reales: SYSTEM_INIT + AGENT_REGISTERED |

---

## EVVM Contracts (Anvil local — chain 31337)

| Contrato | Address |
|---|---|
| Core | `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318` |
| Staking | `0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6` |
| Estimator | `0x610178dA211FEF7D417bC0e6FeD39F05609AD788` |
| NameService | `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e` |
| Treasury | `0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82` |
| P2PSwap | `0x0B306BF915C4d645ff596e518fAf3F9A5179B816` |

**Admin wallet:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Anvil default)  
**Token:** ARVI Environmental Token (ARVI)

---

## Premios objetivo y su estado

| Sponsor | Premio | Track | Estado |
|---|---|---|---|
| Protocol Labs | $16K | AI Agents on IPFS/Filecoin | ⚠️ Falta Base Sepolia |
| Open Track | $14.5K | General | ✅ Aplicable |
| Venice AI | $11.5K | Privacy AI | ⚠️ Integrar Venice API |
| Bankr | $5K | AI Agent + payments | ✅ Loop funcional (sim) |
| Octant | $3K | Public Goods (3 tracks) | ✅ Business model visible |
| Locus | $3K | USDC payments | ✅ Loop funcional (sim) |
| ENS | $1.5K | ENS names | ✅ n1/n2/n3.arvi.eth visibles |

**Total objetivo:** ~$59K+

---

## Design System v4/v5

```
Background:  #F7F7F7  (canvas)
Text:        #111111  (ink)
Lines/grid:  #E5E5E5  (line)
Borders:     #DADADA  (border)
Accent:      #2E7D6B  (jade — máx 10%)
Jade light:  #EAF4F1
Critical:    #C0392B
Warning:     #B85C00

Fonts:
  Headlines: DM Serif Display
  Technical: DM Mono
  Body:      Inter
```

---

## Seguridad

- API keys expuestas en commit `8214950` por ~9 min → **Rotar pendiente**
- `.env` y `.env.local` en `.gitignore` ✅
- Keys actuales solo en Vercel env vars y `.env` local

---

## Próximos pasos urgentes (por prioridad)

| Prioridad | Tarea | Impacto |
|---|---|---|
| P0 | Abrir sitio en browser y confirmar que v5.0 se ve bien | Blocker demo |
| P1 | Deploy EVVM a Base Sepolia | +$16K Protocol Labs |
| P2 | Rotar API keys expuestas | Seguridad |
| P3 | Grabar video demo backup (2 min) | Seguridad del demo |
| P4 | Integrar Venice API (privacy AI) | +$11.5K opcional |
| P5 | Preparar pitch script | Fase 8 |

---

## Script demo (happy path para jueces)

```
1. arvi-eight.vercel.app
   → Landing abre — tipo ARVI grande, red animada
   → Cursor sobre nodos — se despiertan (jade glow)
   → → navegas a SYSTEM — click nodos del grafo
   → → → ATLAS — mapa vivo con nodos CDMX, hover tooltip
   → → → → DASHBOARD — health bars, alert strip
   → → → → → ECONOMICS — flujo animado
   → → → → → → ENTER — "It's an intelligence system."

2. Click "Launch App" → /dashboard
   → node-01 seleccionado (CRITICAL)
   → Tab Sensors: ver todos los campos del sensor
   → Tab Intelligence: Open-Meteo live + FIRMS
   → "Run Agent" → pipeline anima → USDC pagado

3. /atlas → mapa oscuro, 3 pins activos, fire hotspots

4. Mostrar agent_log.json en GitHub (evidencia onchain)
5. Mostrar TX de ERC-8004 en Basescan
```

---

*Checkpoint 3 generado por Pantera · 2026-03-22*
