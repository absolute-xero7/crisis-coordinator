# 🍁 CrisisCoordinator - Toronto Emergency Response System

**Multi-Agent AI System for Emergency Response Simulation and Training**

Built for Toronto Emergency Operations Centre. Demonstrating how AI can support emergency coordinators with transparent, explainable decisions during crisis scenarios.

---

## 🚨 What is CrisisCoordinator?

CrisisCoordinator is an interactive simulation platform that uses **5 specialized AI agents** to coordinate emergency response in Toronto-specific crisis scenarios. Each agent makes decisions with full transparency and Toronto-aware context.

### Key Features

- **🧠 5 Specialized AI Agents:**
  - **Triage Agent**: Prioritizes incidents by severity, people affected, and Toronto geography
  - **Resource Agent**: Assigns Toronto Fire Services, Paramedic Services, and Police units
  - **Logistics Agent**: Routes patients to Toronto hospitals, manages shelter assignments
  - **Medical Agent**: Monitors hospital capacity across Toronto's 5 major hospitals
  - **Communications Agent**: Generates Toronto-specific public alerts

- **🍁 Toronto-Specific Data:**
  - 5 real Toronto hospitals (Toronto General, St. Michael's, Mount Sinai, Sunnybrook, North York General)
  - Real Toronto geography (PATH system, DVP, Union Station, Financial District)
  - TTC integration (Line 1, 2, subway stations)
  - Toronto streets (King, Bay, Yonge, University, Spadina)
  - Toronto Fire Services, Paramedic Services, Police Service units

- **💡 Explainable AI:**
  - Every decision includes detailed reasoning
  - Toronto context highlighted (hospital capacity, TTC status, street names)
  - Transparent tradeoffs explained
  - Real-time agent thinking visualization

- **🎮 Interactive Simulation:**
  - Real-time map visualization with Toronto street labels
  - Live resource tracking (TFS, EMS, TPS units)
  - Play/pause/step controls
  - Adjustable simulation speed (1x to 10x)
  - Comprehensive event timeline

---

## 🌆 Three Built-In Toronto Scenarios

### 1. PATH System Flood & Union Station Emergency
**Duration:** 75 minutes | **Location:** Downtown Financial District

A water main ruptures at King & Bay during morning rush hour, flooding the PATH underground system. 2,000+ commuters trapped underground. Union Station evacuation. TTC subway disruption.

**Key Challenges:**
- Mass underground evacuation
- Water rescue in confined spaces
- Hospital capacity management (St. Michael's at 85%)
- Traffic gridlock on King Street
- TTC Line 1 suspension

---

### 2. DVP Winter Blizzard + Multi-Vehicle Pileup
**Duration:** 90 minutes | **Location:** Don Valley Parkway & Eastern Toronto

Severe winter storm causes 40-vehicle pileup on DVP during evening rush hour. -25°C wind chill. Multiple cold weather emergencies. Hospital overload.

**Key Challenges:**
- Mass casualty response in extreme cold
- Hypothermia and frostbite risks
- Hospital system stress (Sunnybrook at 95%)
- Stranded TTC bus with 35 passengers
- Carbon monoxide poisoning from improper heating

---

### 3. Billy Bishop Airport Incident + Waterfront Emergency
**Duration:** 60 minutes | **Location:** Toronto Waterfront

Small aircraft crashes into Lake Ontario near Billy Bishop Airport. Fuel fire on water. Multiple vessel collision. Mass waterfront evacuation during summer festival.

**Key Challenges:**
- Marine rescue coordination
- Aviation fuel fire containment
- Mass evacuation (5,000+ people at Harbourfront)
- Hypothermia from cold water (12°C)
- Multi-agency coordination (TFS Marine Unit, TPS Marine, Coast Guard)

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Mission control aesthetic)
- **AI:** Anthropic Claude 3.5 Sonnet (via API)
- **State Management:** React hooks
- **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key (Claude 3.5 Sonnet)
- Supabase project (free tier is fine) with URL + anon + service role keys

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/absolute-xero7/crisis-coordinator.git
cd crisis-coordinator
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with:

```bash
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key   # server-side only
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
```

> **Security note:** Keep `.env.local` out of version control. The service role key is required for local server-side routes only and never sent to the browser.

4. **Provision Supabase schema**

Use the SQL editor (or CLI) to apply `supabase/schema.sql` so the `scenarios`, `simulation_runs`, and `simulation_events` tables exist:

```bash
supabase db push --file supabase/schema.sql
# or paste the SQL file contents in the Supabase dashboard
```

Need a step-by-step walkthrough? See [`docs/SETUP.md`](docs/SETUP.md) for screenshots, troubleshooting tips, and verification steps.

4. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**

```bash
npm run build
npm start
```

---

## 📖 Usage

### Running a Simulation

1. Navigate to **Operations Console** from the landing page
2. Select a scenario from the dropdown (PATH Flooding, DVP Blizzard, Billy Bishop)
3. Click **Play** to start the simulation
4. Watch agents make decisions every 60 seconds
5. Click on agent cards to view detailed reasoning
6. Monitor incidents, resources, and events in real-time

### Understanding Agent Decisions

- **Triage Priority Queue**: See which incidents are prioritized and why
- **Resource Assignments**: View which TFS/EMS/TPS units are assigned to each incident
- **Hospital Routing**: Understand why patients are routed to specific Toronto hospitals
- **Medical Alerts**: Monitor hospital capacity warnings
- **Public Communications**: Read Toronto-specific public alerts

---

## 🗺️ System Architecture

```
┌─────────────────────────────────────────────┐
│           NEXT.JS FRONTEND                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Landing  │  │ Console  │  │ Builder  │  │
│  │  Page    │  │  (Main)  │  │ (Future) │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│       SIMULATION ENGINE (Client-Side)       │
│  ┌────────────────────────────────────┐    │
│  │  SimulationState                    │    │
│  │  - Incidents, Resources, Hospitals  │    │
│  │  - Timeline, Events, Stats          │    │
│  └────────────────────────────────────┘    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          5 AI AGENTS (Claude API)           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──┐ │
│  │Triage│ │Resrc.│ │Logic.│ │Medic.│ │Com│ │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──┘ │
└─────────────────────────────────────────────┘
```

---

## ⚖️ Ethical Considerations

**This is a training prototype, not production software.**

### ✅ Appropriate Uses:
- Toronto Fire Services training exercises
- Emergency Management Ontario scenario planning
- City of Toronto preparedness drills
- Research on AI for public safety
- Educational demonstrations

### ❌ NOT Ready For:
- Live 911 dispatch
- Real emergency coordination
- Decisions without human oversight
- Production deployment without extensive validation

### Requirements for Deployment:
- Integration with Toronto CAD systems
- Validation with Toronto emergency services
- Community consultation (especially vulnerable neighborhoods)
- Multilingual support for Toronto's diverse population
- Compliance with Ontario privacy and emergency management regulations

---

## 🍁 Why Toronto?

Toronto presents unique emergency response challenges:

- **PATH System**: 30km underground network serving 200,000+ daily
- **Extreme Weather**: -30°C winters, severe storms, rapid temperature swings
- **High Density**: 2.9 million residents, 6.4 million in GTA
- **Complex Infrastructure**: DVP, Gardiner, TTC, GO Transit, Billy Bishop Airport
- **Waterfront**: Lake Ontario, Toronto Islands, marine emergencies
- **Diverse Neighborhoods**: Different challenges across Scarborough, North York, Etobicoke

CrisisCoordinator demonstrates how multi-agent AI could be adapted to any city's unique geography and infrastructure.

---

## 📊 Project Stats

- **Lines of Code:** ~8,000+
- **Components:** 20+
- **Toronto Data Points:** 100+ (hospitals, streets, neighborhoods, stations)
- **Scenarios:** 3 built-in (+ custom scenario builder coming)
- **AI Agents:** 5 specialized
- **Build Time:** ~30 hours

---

## 🤝 Contributing

This project was built for a hackathon demonstration. Future enhancements could include:

- **Scenario Builder UI** (architected but not implemented)
- **Historical replay** of past simulations
- **Multi-city support** (Montreal, Vancouver, etc.)
- **Real-time data integration** (weather, traffic, hospital capacity APIs)
- **VR/AR visualization** for training centers

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Toronto Emergency Services**: For inspiring this project
- **Anthropic**: For Claude AI API
- **Next.js Team**: For the incredible framework
- **Toronto Open Data**: For geographic and infrastructure data

---

## 📧 Contact

**For Toronto Emergency Services:**

We'd love to demo CrisisCoordinator for your training division and get feedback from real Toronto coordinators.

**GitHub:** [absolute-xero7/crisis-coordinator](https://github.com/absolute-xero7/crisis-coordinator)

---

**Built with ❤️ for Toronto**

*Because when disaster strikes our city, every decision matters. And every decision deserves an explanation.* 🍁🚨
