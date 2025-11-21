# CRISISCOORDINATOR - TORONTO EDITION
## System Architecture Document

**Version:** 1.0
**Target:** Toronto Emergency Response Simulation
**Framework:** Next.js 14 + TypeScript + Tailwind CSS
**AI:** Anthropic Claude (via API)

---

## 🏗️ HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Landing Page  │  │ Ops Console    │  │   Scenario   │ │
│  │  /             │  │ /console       │  │   Builder    │ │
│  │                │  │                │  │ /console/    │ │
│  │  - Hero        │  │ - Toronto Map  │  │  builder     │ │
│  │  - Features    │  │ - Agent Panel  │  │              │ │
│  │  - Scenarios   │  │ - Controls     │  │ - Incident   │ │
│  └────────────────┘  │ - Event Log    │  │   Form       │ │
│                      │ - Analytics    │  │ - Resource   │ │
│                      └────────────────┘  │   Config     │ │
│                                          │ - Map Preview│ │
│                                          └──────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ API Routes
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (/app/api)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ /simulate    │  │ /agent-think │  │  /scenarios/*    │ │
│  │              │  │              │  │                  │ │
│  │ - Step sim   │  │ - LLM calls  │  │ - Validate       │ │
│  │ - Get state  │  │ - Reasoning  │  │ - Save/Load      │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              SIMULATION ENGINE (Server-Side)                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SimulationState                                      │  │
│  │  - incidents: Incident[]                             │  │
│  │  - resources: Resource[]                             │  │
│  │  - hospitals: Hospital[]                             │  │
│  │  - timeline: number (seconds elapsed)                │  │
│  │  - events: Event[]                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SimulationEngine.step()                             │  │
│  │  1. Check for scripted events                        │  │
│  │  2. Update resource positions                        │  │
│  │  3. Process arrivals                                 │  │
│  │  4. Trigger agent decisions                          │  │
│  │  5. Apply decisions                                  │  │
│  │  6. Update incident states                           │  │
│  │  7. Return new state                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  MULTI-AGENT SYSTEM                         │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   TRIAGE    │  │  RESOURCE   │  │    LOGISTICS     │   │
│  │   AGENT     │  │   AGENT     │  │     AGENT        │   │
│  │             │  │             │  │                  │   │
│  │ - Ranks     │  │ - Assigns   │  │ - Hospital       │   │
│  │   incidents │  │   units     │  │   routing        │   │
│  │ - Priority  │  │ - Toronto   │  │ - Shelter        │   │
│  │   queue     │  │   TFS/EMS   │  │   selection      │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌──────────────────────────────────┐    │
│  │   MEDICAL   │  │     COMMUNICATIONS               │    │
│  │   AGENT     │  │        AGENT                     │    │
│  │             │  │                                  │    │
│  │ - Hospital  │  │ - Public alerts                  │    │
│  │   capacity  │  │ - Toronto-specific               │    │
│  │ - Patient   │  │ - TTC updates                    │    │
│  │   routing   │  │                                  │    │
│  └─────────────┘  └──────────────────────────────────┘    │
│                                                              │
│  Each agent:                                                 │
│  - Input: SimulationState + Toronto context                 │
│  - LLM: Claude API (structured prompts)                     │
│  - Output: Decision + Reasoning (JSON)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 FILE STRUCTURE

```
crisis-coordinator/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # Global styles + Toronto colors
│   ├── console/
│   │   ├── page.tsx                      # Operations console (main app)
│   │   └── builder/
│   │       └── page.tsx                  # Scenario builder
│   └── api/
│       ├── simulate/
│       │   └── route.ts                  # Simulation step API
│       ├── agent-think/
│       │   └── route.ts                  # Agent decision API
│       └── scenarios/
│           ├── validate/route.ts         # Validate scenario JSON
│           ├── save/route.ts             # Save scenario
│           ├── list/route.ts             # List scenarios
│           └── [id]/route.ts             # Load scenario by ID
│
├── components/
│   ├── landing/
│   │   ├── Hero.tsx                      # Hero section
│   │   ├── Features.tsx                  # Feature cards
│   │   └── Scenarios.tsx                 # Scenario previews
│   ├── console/
│   │   ├── TorontoMap.tsx                # Main map component
│   │   ├── AgentPanel.tsx                # 5 agent cards
│   │   ├── AgentCard.tsx                 # Individual agent
│   │   ├── IncidentList.tsx              # Incident sidebar
│   │   ├── IncidentCard.tsx              # Individual incident
│   │   ├── ResourcePanel.tsx             # Resource status
│   │   ├── HospitalStatus.tsx            # Toronto hospitals
│   │   ├── Controls.tsx                  # Play/pause/step/speed
│   │   ├── EventLog.tsx                  # Timeline events
│   │   ├── Analytics.tsx                 # Stats dashboard
│   │   ├── ReasoningPanel.tsx            # LLM reasoning display
│   │   └── CommanderSummary.tsx          # Executive summary
│   └── builder/
│       ├── ScenarioBuilder.tsx           # Main builder form
│       ├── IncidentForm.tsx              # Add/edit incident
│       ├── EventForm.tsx                 # Scripted events
│       ├── ResourceConfig.tsx            # Resource sliders
│       ├── HospitalSelector.tsx          # Toronto hospitals
│       └── MapPreview.tsx                # Live preview
│
├── lib/
│   ├── types.ts                          # TypeScript types
│   ├── torontoData.ts                    # Real Toronto data
│   ├── simulation/
│   │   ├── SimulationEngine.ts           # Core engine
│   │   ├── SimulationState.ts            # State management
│   │   └── eventHandlers.ts              # Event processing
│   ├── agents/
│   │   ├── TriageAgent.ts                # Triage logic
│   │   ├── ResourceAgent.ts              # Resource assignment
│   │   ├── LogisticsAgent.ts             # Hospital routing
│   │   ├── MedicalAgent.ts               # Capacity monitoring
│   │   ├── CommunicationsAgent.ts        # Public alerts
│   │   └── agentPrompts.ts               # LLM prompt templates
│   ├── scenarios/
│   │   ├── pathFlooding.ts               # Scenario 1
│   │   ├── dvpBlizzard.ts                # Scenario 2
│   │   ├── billyBishop.ts                # Scenario 3
│   │   └── scenarioLoader.ts             # Load/parse scenarios
│   ├── scenarioBuilder/
│   │   ├── validator.ts                  # JSON validation
│   │   ├── generator.ts                  # Generate scenario
│   │   └── storage.ts                    # Save/load
│   └── utils/
│       ├── mapUtils.ts                   # Grid/coordinate math
│       ├── pathfinding.ts                # A* for routing
│       ├── timeUtils.ts                  # Time formatting
│       └── llmClient.ts                  # Claude API client
│
├── public/
│   └── toronto-icon.svg                  # Maple leaf icon
│
├── ARCHITECTURE.md                        # This file
├── README.md                             # Project documentation
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript config
├── tailwind.config.ts                    # Tailwind + Toronto colors
└── next.config.js                        # Next.js config
```

---

## 🗂️ CORE DATA STRUCTURES

### Toronto Geographic Data

```typescript
// lib/types.ts

export interface GridPosition {
  x: number;
  y: number;
}

export interface TorontoLocation extends GridPosition {
  address?: string;
  neighborhood?: string;
  landmark?: string;
}

export interface TorontoHospital {
  id: string;
  name: string;
  address: string;
  location: GridPosition;
  capacityTotal: number;
  capacityUsed: number;
  specialties: string[];
  travelTimeMatrix: Record<string, number>; // incidentId -> minutes
}

export interface TorontoShelter {
  id: string;
  name: string;
  address: string;
  location: GridPosition;
  capacityTotal: number;
  capacityUsed: number;
}

// Real Toronto hospitals (pre-configured)
export const TORONTO_HOSPITALS: TorontoHospital[] = [
  {
    id: 'toronto-general',
    name: 'Toronto General Hospital',
    address: '200 University Ave',
    location: { x: 5, y: 8 },
    capacityTotal: 60,
    capacityUsed: 30,
    specialties: ['Trauma Level 1', 'Cardiac', 'Stroke'],
    travelTimeMatrix: {}
  },
  {
    id: 'st-michaels',
    name: "St. Michael's Hospital",
    address: '30 Bond St',
    location: { x: 9, y: 9 },
    capacityTotal: 45,
    capacityUsed: 38,
    specialties: ['Trauma Level 1', 'Emergency'],
    travelTimeMatrix: {}
  },
  {
    id: 'mount-sinai',
    name: 'Mount Sinai Hospital',
    address: '600 University Ave',
    location: { x: 5, y: 7 },
    capacityTotal: 40,
    capacityUsed: 20,
    specialties: ['General Emergency'],
    travelTimeMatrix: {}
  },
  {
    id: 'sunnybrook',
    name: 'Sunnybrook Health Sciences',
    address: '2075 Bayview Ave',
    location: { x: 12, y: 3 },
    capacityTotal: 55,
    capacityUsed: 25,
    specialties: ['Trauma', 'Burns', 'Critical Care'],
    travelTimeMatrix: {}
  },
  {
    id: 'north-york-general',
    name: 'North York General',
    address: '4001 Leslie St',
    location: { x: 10, y: 1 },
    capacityTotal: 50,
    capacityUsed: 15,
    specialties: ['General Emergency'],
    travelTimeMatrix: {}
  }
];
```

### Incident System

```typescript
export type IncidentType =
  | 'fire'
  | 'medical'
  | 'traffic'
  | 'flood'
  | 'hazmat'
  | 'infrastructure'
  | 'mass-casualty'
  | 'transit';

export type IncidentStatus =
  | 'reported'
  | 'responding'
  | 'on-scene'
  | 'contained'
  | 'resolved';

export interface Incident {
  id: string;                              // TOR-INC-001
  type: IncidentType;
  location: TorontoLocation;
  severity: 1 | 2 | 3 | 4 | 5;             // 5 = critical
  peopleAffected: number;
  details: string;                         // Rich description
  status: IncidentStatus;
  reportedAt: number;                      // Seconds since T+0
  assignedResources: string[];             // Resource IDs
  resolvedAt?: number;
  metadata: {
    casualties?: number;
    transported?: number;
    evacuated?: number;
  };
}
```

### Resource System

```typescript
export type ResourceType =
  | 'fire-pumper'
  | 'fire-aerial'
  | 'fire-heavy-rescue'
  | 'fire-hazmat'
  | 'fire-water-rescue'
  | 'fire-technical-rescue'
  | 'ambulance'
  | 'ambulance-supervisor'
  | 'ambulance-mass-casualty'
  | 'police'
  | 'police-traffic';

export type ResourceStatus =
  | 'available'
  | 'dispatched'
  | 'en-route'
  | 'on-scene'
  | 'transporting'
  | 'returning';

export interface Resource {
  id: string;                              // PT-1, A-1, P-1
  name: string;                            // "Pumper Truck 1"
  type: ResourceType;
  status: ResourceStatus;
  location: GridPosition;
  assignedTo?: string;                     // Incident ID
  travelSpeed: number;                     // Grid cells per minute
  capabilities: string[];                  // ['fire', 'rescue', 'water']
  station?: string;                        // "Toronto Fire Station 312"
}
```

### Simulation State

```typescript
export interface SimulationState {
  // Core data
  scenario: ScenarioDefinition;
  timeline: number;                        // Seconds since T+0
  incidents: Incident[];
  resources: Resource[];
  hospitals: TorontoHospital[];
  shelters: TorontoShelter[];

  // Event history
  events: SimulationEvent[];

  // Agent decisions (cached)
  agentDecisions: {
    triage: TriageDecision | null;
    resource: ResourceDecision | null;
    logistics: LogisticsDecision | null;
    medical: MedicalDecision | null;
    communications: CommunicationsDecision | null;
  };

  // Analytics
  stats: {
    totalIncidents: number;
    resolvedIncidents: number;
    peopleSaved: number;
    avgResponseTime: number;              // Minutes
    hospitalUtilization: number;          // Percentage
  };

  // Simulation control
  isPaused: boolean;
  speed: 1 | 2 | 5 | 10;                  // Simulation speed multiplier
}

export interface SimulationEvent {
  id: string;
  timestamp: number;                      // Seconds
  type: 'incident' | 'decision' | 'arrival' | 'transport' | 'alert';
  description: string;                    // "Water Rescue 1 arrived at PATH flooding"
  severity?: 1 | 2 | 3 | 4 | 5;
  agentId?: string;                       // Which agent made this decision
  torontoContext?: string;                // "TTC Line 1 suspended"
}
```

### Agent Decisions

```typescript
export interface AgentDecision {
  agentId: 'triage' | 'resource' | 'logistics' | 'medical' | 'communications';
  timestamp: number;
  decision: any;                          // Agent-specific
  reasoning: string;                      // LLM-generated explanation
  torontoContext: string[];               // ["St. Michael's at 85%", "King St gridlocked"]
  confidence: number;                     // 0-1
}

export interface TriageDecision extends AgentDecision {
  decision: {
    priorityQueue: Array<{
      incidentId: string;
      priority: number;                   // 1-10
      rationale: string;
    }>;
  };
}

export interface ResourceDecision extends AgentDecision {
  decision: {
    assignments: Array<{
      resourceId: string;
      incidentId: string;
      rationale: string;
    }>;
    held: string[];                       // Resources held in reserve
  };
}

export interface LogisticsDecision extends AgentDecision {
  decision: {
    hospitalRouting: Array<{
      incidentId: string;
      targetHospital: string;
      reason: string;
    }>;
    shelterAssignments: Array<{
      incidentId: string;
      shelterId: string;
      capacity: number;
    }>;
  };
}

export interface MedicalDecision extends AgentDecision {
  decision: {
    alerts: Array<{
      type: 'capacity' | 'specialty' | 'diversion';
      hospitalId: string;
      message: string;
    }>;
    recommendations: string[];
  };
}

export interface CommunicationsDecision extends AgentDecision {
  decision: {
    publicAlerts: Array<{
      severity: 'info' | 'warning' | 'urgent';
      message: string;
      torontoSpecific: string[];          // ["Avoid downtown core", "TTC Line 1 suspended"]
    }>;
  };
}
```

### Scenario Definition

```typescript
export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  duration: number;                       // Minutes
  citySize: { width: number; height: number };
  locationFocus: string;                  // "Downtown Toronto Core"

  initialIncidents: Array<{
    id: string;
    type: IncidentType;
    location: TorontoLocation;
    severity: 1 | 2 | 3 | 4 | 5;
    peopleAffected: number;
    details: string;
    reportedAt: number;
  }>;

  scriptedEvents: Array<{
    id: string;
    triggerTime: number;                  // Seconds
    type: 'spawn_incident' | 'hospital_capacity' | 'weather' | 'road_closure';
    payload: any;
  }>;

  resources: {
    fireUnits: number;
    ambulances: number;
    policeUnits: number;
    specialized: string[];
  };

  hospitals: TorontoHospital[];
  shelters: TorontoShelter[];

  metadata: {
    createdAt: string;
    createdBy: string;
    tags: string[];
  };
}
```

---

## 🤖 AGENT SYSTEM ARCHITECTURE

### Agent Decision Flow

```
1. Simulation calls: agent.makeDecision(state)

2. Agent constructs LLM prompt:
   - Current state summary
   - Toronto-specific context (hospitals, streets, TTC)
   - Recent events
   - Agent's specific role/objective

3. LLM call (Claude API):
   - Structured JSON response required
   - decision: { ...agent-specific }
   - reasoning: string (explanation)
   - torontoContext: string[] (Toronto details)

4. Agent validates response

5. Return AgentDecision object

6. Simulation applies decision to state
```

### Agent Prompt Templates

```typescript
// lib/agents/agentPrompts.ts

export const TRIAGE_AGENT_PROMPT = `
You are the TRIAGE AGENT for Toronto Emergency Operations.

ROLE: Analyze all active incidents and create a priority queue for response.

TORONTO CONTEXT:
{torontoContext}

CURRENT INCIDENTS:
{incidents}

AVAILABLE RESOURCES:
{resources}

Consider:
- Severity (1-5)
- People affected
- Time sensitivity
- Toronto geography (PATH underground, DVP highway, TTC subway)
- Hospital proximity
- Resource availability

RESPOND IN JSON:
{
  "priorityQueue": [
    {
      "incidentId": "TOR-INC-001",
      "priority": 10,
      "rationale": "PATH flooding affects 2,000 trapped underground with rising water"
    }
  ],
  "reasoning": "Detailed explanation of prioritization...",
  "torontoContext": ["PATH system critical", "St. Michael's at 85%"]
}
`;

// Similar prompts for other agents...
```

### LLM Integration

```typescript
// lib/utils/llmClient.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callAgent(
  agentId: string,
  prompt: string,
  maxTokens: number = 2000
): Promise<any> {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: maxTokens,
    messages: [{
      role: 'user',
      content: prompt
    }],
    temperature: 0.7,
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Parse JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  return JSON.parse(jsonMatch[0]);
}
```

---

## 🎮 SIMULATION ENGINE ARCHITECTURE

### Core Loop

```typescript
// lib/simulation/SimulationEngine.ts

export class SimulationEngine {
  private state: SimulationState;

  constructor(scenario: ScenarioDefinition) {
    this.state = this.initializeState(scenario);
  }

  /**
   * Advance simulation by one step (10 seconds)
   */
  async step(): Promise<SimulationState> {
    // 1. Increment timeline
    this.state.timeline += 10;

    // 2. Check for scripted events
    this.processScriptedEvents();

    // 3. Update resource positions (moving toward incidents)
    this.updateResourcePositions();

    // 4. Check for arrivals
    this.processArrivals();

    // 5. Trigger agent decisions (every 60 seconds)
    if (this.state.timeline % 60 === 0) {
      await this.runAgentDecisions();
    }

    // 6. Update incident states
    this.updateIncidentStates();

    // 7. Calculate analytics
    this.updateStats();

    return this.state;
  }

  private async runAgentDecisions() {
    // Run in sequence (some depend on previous)
    const triage = await TriageAgent.decide(this.state);
    this.state.agentDecisions.triage = triage;

    const resource = await ResourceAgent.decide(this.state, triage);
    this.state.agentDecisions.resource = resource;

    const logistics = await LogisticsAgent.decide(this.state, triage);
    this.state.agentDecisions.logistics = logistics;

    const medical = await MedicalAgent.decide(this.state);
    this.state.agentDecisions.medical = medical;

    const comms = await CommunicationsAgent.decide(this.state, triage);
    this.state.agentDecisions.communications = comms;

    // Apply decisions to state
    this.applyDecisions();
  }

  private updateResourcePositions() {
    for (const resource of this.state.resources) {
      if (resource.status === 'en-route' && resource.assignedTo) {
        const incident = this.state.incidents.find(i => i.id === resource.assignedTo);
        if (incident) {
          // Move toward incident (simple pathfinding)
          const target = incident.location;
          const current = resource.location;

          // Move one step closer
          if (current.x < target.x) current.x++;
          else if (current.x > target.x) current.x--;

          if (current.y < target.y) current.y++;
          else if (current.y > target.y) current.y--;

          // Check if arrived
          if (current.x === target.x && current.y === target.y) {
            resource.status = 'on-scene';
            this.logEvent({
              type: 'arrival',
              description: `${resource.name} arrived at ${incident.id}`,
              severity: incident.severity
            });
          }
        }
      }
    }
  }

  // ... more methods
}
```

---

## 🗺️ TORONTO MAP RENDERING

### Grid System

```typescript
// 14x14 grid for downtown Toronto scenarios
// Each cell = ~300m x 300m

export interface MapCell {
  x: number;
  y: number;
  type: 'street' | 'building' | 'park' | 'water' | 'underground';
  label?: string;                         // "King St", "PATH System"
}

// Pre-defined Toronto map for PATH scenario
export const DOWNTOWN_TORONTO_MAP: MapCell[][] = [
  // ... 14x14 grid with Toronto streets
];
```

### Map Component

```typescript
// components/console/TorontoMap.tsx

export function TorontoMap({
  state,
  onCellClick
}: {
  state: SimulationState;
  onCellClick: (x: number, y: number) => void;
}) {
  return (
    <div className="map-container">
      <svg viewBox="0 0 1400 1400">
        {/* Grid cells */}
        {state.scenario.citySize.width * state.scenario.citySize.height &&
          renderGrid()}

        {/* Toronto street labels */}
        {renderStreetLabels()}

        {/* Incidents */}
        {state.incidents.map(incident => (
          <IncidentMarker
            key={incident.id}
            incident={incident}
          />
        ))}

        {/* Resources */}
        {state.resources.map(resource => (
          <ResourceMarker
            key={resource.id}
            resource={resource}
          />
        ))}

        {/* Hospitals */}
        {state.hospitals.map(hospital => (
          <HospitalMarker
            key={hospital.id}
            hospital={hospital}
          />
        ))}
      </svg>
    </div>
  );
}
```

---

## 🛠️ SCENARIO BUILDER ARCHITECTURE

### Builder UI Flow

```
1. User opens /console/builder

2. Form loads with:
   - Basic info fields
   - Incident builder (+ Add Incident)
   - Scripted events (+ Add Event)
   - Resource config (sliders)
   - Hospital selector (checkboxes)

3. User fills form:
   - Adds incidents (click map or enter coordinates)
   - Toronto address autocomplete
   - Configures scripted events

4. Live preview shows:
   - Incidents on Toronto map
   - Hospital locations
   - Resource starting positions

5. Validation:
   - At least 1 incident
   - At least 3 resources
   - Hospital capacity > 0
   - Grid coordinates in bounds

6. Save:
   - Generate ScenarioDefinition JSON
   - Save to localStorage
   - Add to scenario selector

7. Test Run:
   - Load scenario into simulation
   - Navigate to /console with scenario parameter
```

### Scenario Storage

```typescript
// lib/scenarioBuilder/storage.ts

export class ScenarioStorage {
  private static STORAGE_KEY = 'crisiscoordinator-scenarios';

  static save(scenario: ScenarioDefinition): void {
    const scenarios = this.list();
    scenarios.push(scenario);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenarios));
  }

  static list(): ScenarioDefinition[] {
    const json = localStorage.getItem(this.STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  }

  static load(id: string): ScenarioDefinition | null {
    const scenarios = this.list();
    return scenarios.find(s => s.id === id) || null;
  }

  static delete(id: string): void {
    const scenarios = this.list().filter(s => s.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenarios));
  }
}
```

---

## 🎨 TORONTO BRANDING & STYLING

### Color Palette

```typescript
// tailwind.config.ts

export default {
  theme: {
    extend: {
      colors: {
        ops: {
          bg: '#050816',
          panel: '#0B1220',
          'panel-light': '#111827',
          border: '#1E293B',
        },
        severity: {
          critical: '#DC2626',       // Red
          high: '#F59E0B',           // Amber
          medium: '#EAB308',         // Yellow
          low: '#3B82F6',            // Blue
        },
        toronto: {
          fire: '#CC0000',           // TFS Red
          police: '#003A70',         // TPS Blue
          ems: '#00563F',            // Paramedic Green
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

---

## 📊 API ENDPOINTS

### `/api/simulate` - POST
**Purpose:** Advance simulation by one step

**Request:**
```json
{
  "stateId": "abc123",
  "action": "step"
}
```

**Response:**
```json
{
  "state": { /* SimulationState */ },
  "events": [ /* New events */ ]
}
```

### `/api/agent-think` - POST
**Purpose:** Get agent reasoning for specific decision

**Request:**
```json
{
  "agentId": "triage",
  "stateId": "abc123"
}
```

**Response:**
```json
{
  "decision": { /* Agent decision */ },
  "reasoning": "Detailed explanation...",
  "torontoContext": ["St. Michael's at 85%"]
}
```

### `/api/scenarios/validate` - POST
**Purpose:** Validate scenario JSON

**Request:**
```json
{
  "scenario": { /* ScenarioDefinition */ }
}
```

**Response:**
```json
{
  "valid": true,
  "errors": []
}
```

### `/api/scenarios/save` - POST
**Purpose:** Save scenario

**Request:**
```json
{
  "scenario": { /* ScenarioDefinition */ }
}
```

**Response:**
```json
{
  "scenarioId": "custom-123",
  "success": true
}
```

---

## 🔧 PHASE-BY-PHASE BUILD PLAN

### **PHASE 1: Simulation Engine + Toronto Data (Hours 2-8)**

**Deliverables:**
- [ ] TypeScript types (types.ts)
- [ ] Toronto hospital data (torontoData.ts)
- [ ] Toronto neighborhoods, streets
- [ ] SimulationState class
- [ ] SimulationEngine class with step() method
- [ ] Basic event system
- [ ] Resource movement logic
- [ ] Incident state transitions
- [ ] Unit tests for engine

**Files Created:**
- `lib/types.ts`
- `lib/torontoData.ts`
- `lib/simulation/SimulationEngine.ts`
- `lib/simulation/SimulationState.ts`
- `lib/simulation/eventHandlers.ts`
- `lib/utils/mapUtils.ts`
- `lib/utils/pathfinding.ts`

**Checkpoint:** Engine can run basic scenario without agents

---

### **PHASE 2: Agent Logic + LLM Integration (Hours 8-14)**

**Deliverables:**
- [ ] LLM client (Anthropic SDK)
- [ ] Agent prompt templates
- [ ] TriageAgent implementation
- [ ] ResourceAgent implementation
- [ ] LogisticsAgent implementation
- [ ] MedicalAgent implementation
- [ ] CommunicationsAgent implementation
- [ ] Toronto-aware prompts (mentions streets, hospitals, TTC)
- [ ] Decision validation
- [ ] Agent testing with mock LLM

**Files Created:**
- `lib/utils/llmClient.ts`
- `lib/agents/agentPrompts.ts`
- `lib/agents/TriageAgent.ts`
- `lib/agents/ResourceAgent.ts`
- `lib/agents/LogisticsAgent.ts`
- `lib/agents/MedicalAgent.ts`
- `lib/agents/CommunicationsAgent.ts`

**Checkpoint:** All 5 agents make decisions, LLM responses valid

---

### **PHASE 3: Operations Console UI (Hours 14-18)**

**Deliverables:**
- [ ] Landing page (/)
- [ ] Operations console layout (/console)
- [ ] TorontoMap component (SVG grid)
- [ ] AgentPanel with 5 agent cards
- [ ] IncidentList sidebar
- [ ] ResourcePanel
- [ ] HospitalStatus (Toronto hospitals)
- [ ] Controls (play/pause/step)
- [ ] EventLog timeline
- [ ] ReasoningPanel (show LLM reasoning)
- [ ] CommanderSummary
- [ ] Toronto branding (colors, fonts)
- [ ] Responsive layout

**Files Created:**
- `app/page.tsx`
- `app/console/page.tsx`
- `components/landing/*`
- `components/console/*`
- `app/globals.css`
- `tailwind.config.ts`

**Checkpoint:** Full console UI functional, Toronto map displays

---

### **PHASE 4: Scenario Builder (Hours 18-25)**

**Deliverables:**
- [ ] Builder page (/console/builder)
- [ ] ScenarioBuilder form component
- [ ] IncidentForm with Toronto address autocomplete
- [ ] EventForm for scripted events
- [ ] ResourceConfig sliders
- [ ] HospitalSelector (Toronto hospitals checkboxes)
- [ ] MapPreview live preview
- [ ] Scenario validation logic
- [ ] Save/load from localStorage
- [ ] Export/import JSON
- [ ] Integration with console (load custom scenario)

**Files Created:**
- `app/console/builder/page.tsx`
- `components/builder/*`
- `lib/scenarioBuilder/validator.ts`
- `lib/scenarioBuilder/generator.ts`
- `lib/scenarioBuilder/storage.ts`
- `app/api/scenarios/*`

**Checkpoint:** Can create custom Toronto scenario and run it

---

### **PHASE 5: Analytics, Integration, Polish (Hours 22-26)**

**Deliverables:**
- [ ] Analytics dashboard (stats, charts)
- [ ] Three Toronto scenarios implemented:
  - [ ] PATH System Flooding
  - [ ] DVP Winter Blizzard
  - [ ] Billy Bishop Airport Incident
- [ ] Scenario selector dropdown
- [ ] Toronto street labels on map
- [ ] Hospital capacity visualization
- [ ] Animation polish (smooth transitions)
- [ ] Mission control aesthetic refinement
- [ ] Toronto branding watermark
- [ ] Performance optimization
- [ ] Bug fixes

**Files Created:**
- `components/console/Analytics.tsx`
- `lib/scenarios/pathFlooding.ts`
- `lib/scenarios/dvpBlizzard.ts`
- `lib/scenarios/billyBishop.ts`
- `lib/scenarios/scenarioLoader.ts`

**Checkpoint:** All 3 scenarios work, builder integrated, polish complete

---

### **PHASE 6: QA & Demo Prep (Hours 26-30)**

**Deliverables:**
- [ ] Test all 3 Toronto scenarios end-to-end
- [ ] Test scenario builder
- [ ] Test agent reasoning display
- [ ] Fix bugs
- [ ] README.md with Toronto focus
- [ ] DEMO_SCRIPT.md
- [ ] Video recording (4 minutes)
- [ ] Live demo rehearsal (5+ times)
- [ ] Backup screenshots
- [ ] Deploy to Vercel

**Files Created:**
- `README.md`
- `DEMO_SCRIPT.md`
- `BUGS.md` (QA findings)

**Checkpoint:** Demo-ready, video complete, deployed

---

## 🚀 TECHNOLOGY STACK

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom (mission control aesthetic)
- **Maps:** SVG-based grid system
- **State Management:** React Context + hooks
- **LLM:** Anthropic Claude 3.5 Sonnet (via API)
- **Storage:** localStorage (scenario builder), API routes (simulation state)
- **Deployment:** Vercel
- **Testing:** Manual testing, scenario validation

---

## 🎯 SUCCESS CRITERIA

**Technical:**
- [x] Architecture document complete
- [ ] Simulation engine runs 3 Toronto scenarios
- [ ] All 5 agents make Toronto-aware decisions
- [ ] LLM reasoning displays correctly
- [ ] Scenario builder creates valid scenarios
- [ ] Operations console UI polished
- [ ] Toronto hospitals, streets, TTC referenced
- [ ] No critical bugs

**Demo:**
- [ ] 4-minute video with PATH scenario
- [ ] Live demo rehearsed 5+ times
- [ ] Toronto judges recognize locations
- [ ] Explainability WOW moment clear

**Toronto Authenticity:**
- [ ] Real hospital names and addresses
- [ ] Real street names (King, Bay, Yonge, etc.)
- [ ] TTC impacts mentioned
- [ ] Toronto Fire Services unit types
- [ ] Toronto neighborhoods labeled

---

## 🔐 SECURITY & ETHICS

**API Key Safety:**
- Store `ANTHROPIC_API_KEY` in `.env.local` (never commit)
- Use Next.js API routes (server-side only)

**Ethical Considerations:**
- Prominent disclaimer: "Training prototype, not production software"
- Requires validation with Toronto emergency services
- Human oversight mandatory
- Community consultation for deployment

---

## 📝 NEXT STEPS FOR ENGINEER AGENT

1. Initialize Next.js project
2. Install dependencies
3. Set up TypeScript config
4. Create file structure
5. Implement Phase 1 (Simulation Engine)
6. Checkpoint after each phase
7. Notify QA Agent for testing

---

**ARCHITECTURE COMPLETE. READY FOR ENGINEER AGENT.**

Built with precision for Toronto emergency response training.
When disaster strikes Toronto, every decision matters. 🍁🚨
