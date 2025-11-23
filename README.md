# CrisisCoordinator

**Multi-agent AI command center for Toronto emergency response training**

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet-orange?logo=anthropic)
![MapLibre](https://img.shields.io/badge/MapLibre-GL-green?logo=maplibre)

> *"It's Monday morning, 8:30 AM. A water main bursts in Toronto's PATH network. 2,000 commuters are trapped underground. You have 50 units to deploy, 5 hospitals to manage, and 15 minutes before panic sets in. The cognitive load is impossible for one human."*

---

## The Problem

Emergency coordinators face **impossible cognitive loads** during multi-incident crises:
- Dozens of simultaneous decisions across fire, EMS, police, hospitals
- Conflicting priorities between agencies (speed vs. safety, capacity vs. proximity)
- No time to verify if decisions are equitable or explain reasoning under pressure
- Traditional dispatch systems are reactive, not predictive

**CrisisCoordinator** demonstrates how AI agents can assist—not replace—human coordinators by surfacing conflicts, explaining reasoning, and ensuring equitable resource allocation.

---

## What Makes This Different

### Human-Centered AI Design
- **Transparent reasoning**: Every agent decision shows the "why," not just the "what"
- **Conflict surfacing**: When agents disagree, the system shows the conflict AND how it was resolved
- **Equity checks**: Explicit verification that vulnerable populations aren't deprioritized
- **Human override**: Coordinators can pause, reject, or modify any recommendation

### Real Toronto Infrastructure
- **5 real hospitals**: St. Michael's, Toronto General, Sunnybrook, Mount Sinai, North York General
- **Actual geography**: PATH system, DVP, Billy Bishop, TTC corridors
- **Toronto agencies**: TFS, TPS, Toronto Paramedic Services protocols

### Multi-Agent Coordination
Six specialized AI agents that collaborate and sometimes conflict:

| Agent | Role | Example Decision |
|-------|------|------------------|
| **Triage** | Prioritize incidents by severity + impact | "PATH flood Priority #1: 2,000 trapped vs. Ritz alarm: property only" |
| **Resource** | Dispatch units to incidents | "TFS water rescue to PATH, staging ambulances at King/Bay" |
| **Logistics** | Route planning + hospital selection | "Bay St blocked at 90%—rerouting via University Ave" |
| **Medical** | Hospital capacity monitoring | "St. Michael's at 93%—diverting non-critical cases" |
| **Communications** | Public alerts + agency coordination | "URGENT: PATH evacuation via Toronto Emergency Alert" |
| **Commander** | Resolve conflicts + synthesize decisions | "Conflict resolved: ETA reduced 8 minutes via alternate route" |

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment (API key required for Live mode only)
cp .env.local.example .env.local
# Add ANTHROPIC_API_KEY if using Live mode

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Live mode only | Claude API key for real-time agent decisions |
| `NEXT_PUBLIC_MAPTILER_KEY` | Optional | MapTiler key for enhanced basemap |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Optional | For custom scenario storage |

---

## Demo Mode vs Live Mode

| Feature | Demo Mode (Default) | Live Mode |
|---------|---------------------|-----------|
| Agent decisions | Instant, cached responses | Real-time Claude API calls |
| Network required | No | Yes |
| Rate limits | None | API throttled |
| Best for | Presentations, offline use | Testing AI reasoning |

**Tip**: Use Demo Mode for presentations. It's instant, reliable, and showcases all features without network dependencies.

---

## Built-in Toronto Scenarios

### 1. PATH System Flood & Union Station
- Water main burst traps 2,000+ commuters underground
- TTC Line 1 suspended, hospital surge, gas leak cascade
- **Key conflict**: Bay St gridlock vs. ambulance extraction timing

### 2. DVP Winter Blizzard
- 40-vehicle pileup in -25°C wind chill
- CO poisoning, power outages, hypothermia emergencies
- **Key conflict**: DVP blocked vs. cardiac arrest transport

### 3. Billy Bishop Waterfront Emergency
- Aircraft crash + fuel fire + mass festival evacuation
- Marine rescue coordination with Coast Guard
- **Key conflict**: No land access to offshore patients

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Console UI (Next.js)                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
│  │   Map   │  │ Agents  │  │Incidents│  │  Timeline   │ │
│  │(MapLibre│  │  Panel  │  │  List   │  │  EventLog   │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Simulation Engine (lib/simulation)          │
│  • Timeline advancement    • Resource dispatch           │
│  • Incident lifecycle      • Hospital routing            │
│  • Scripted event triggers • State management            │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                 Agent System (lib/agents)                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │Triage  │→│Resource│→│Logistics│→│Medical │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│       │          │          │          │                │
│       └──────────┴──────────┴──────────┘                │
│                      ↓                                   │
│              ┌─────────────┐                            │
│              │  Commander  │ ← Conflict Resolution      │
│              └─────────────┘                            │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    Demo Mode                 Live Mode
    (Cached)              (Claude API)
```

---

## Key Files

| Path | Description |
|------|-------------|
| `app/console/page.tsx` | Main console UI, agent triggers, demo toggle |
| `components/console/AgentPanel.tsx` | Agent cards with reasoning display |
| `lib/simulation/SimulationEngine.ts` | Core simulation loop |
| `lib/agents/demoDecisions.ts` | Scenario-specific cached agent responses |
| `lib/agents/agentPrompts.ts` | LLM prompts for each agent |
| `lib/scenarios/*.ts` | Toronto scenario definitions |

---

## Equity & Fairness

CrisisCoordinator explicitly surfaces equity considerations:

```
✅ Human vulnerability prioritized over property value
✅ PATH evacuation (2,000 people) ranked above Ritz-Carlton alarm (property only)
✅ Vulnerable populations (elderly, medical conditions) receiving priority transport
✅ Mass-casualty incidents ranked regardless of neighborhood wealth
```

This isn't just a checkbox—it's visible in the Commander panel so coordinators can verify and audit every decision.

---

## Future Roadmap

- [ ] **Scenario Builder**: Visual editor for custom emergency drills
- [ ] **Multi-city support**: Upload custom geography + infrastructure
- [ ] **After-action reports**: Exportable timeline + decision audit trail
- [ ] **Voice interface**: Hands-free agent queries during simulation
- [ ] **Real data integration**: Live traffic, weather, hospital capacity feeds

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Mapping**: MapLibre GL JS with MapTiler
- **AI**: Claude (Anthropic) via API with parallel agent execution
- **State**: React hooks + custom simulation engine
- **Styling**: Custom "control room" dark theme

---

## Security & Privacy

- All Claude API calls are server-side (keys never exposed to browser)
- No real emergency data—all scenarios are simulated
- Supabase integration is optional; built-in scenarios run fully local
- Designed as a **training tool**, not production dispatch software

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>CrisisCoordinator</strong><br>
  <em>Turning chaos into clarity with transparent, equitable AI coordination</em>
</p>
