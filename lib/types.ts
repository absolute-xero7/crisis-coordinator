// CrisisCoordinator - Core Type Definitions
// Toronto Emergency Response System

// ============================================================================
// GEOGRAPHIC TYPES
// ============================================================================

export interface GridPosition {
  x: number;
  y: number;
}

export interface GeoPosition {
  lat: number;
  lng: number;
}

// Location type that supports real lat/lng coordinates
export interface TorontoLocation {
  // Real geographic coordinates (preferred)
  lat: number;
  lng: number;
  // Legacy grid position (for backwards compatibility)
  x?: number;
  y?: number;
  // Address info
  address?: string;
  neighborhood?: string;
  landmark?: string;
}

// ============================================================================
// TORONTO INFRASTRUCTURE
// ============================================================================

export interface TorontoHospital {
  id: string;
  name: string;
  address: string;
  location: GeoPosition;
  capacityTotal: number;
  capacityUsed: number;
  specialties: string[];
  travelTimeMatrix?: Record<string, number>; // incidentId -> minutes
}

export interface TorontoShelter {
  id: string;
  name: string;
  address: string;
  location: GeoPosition;
  capacityTotal: number;
  capacityUsed: number;
}

// ============================================================================
// INCIDENT SYSTEM
// ============================================================================

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
  id: string; // TOR-INC-001
  type: IncidentType;
  location: TorontoLocation;
  severity: 1 | 2 | 3 | 4 | 5; // 5 = critical
  peopleAffected: number;
  details: string;
  status: IncidentStatus;
  reportedAt: number; // Seconds since T+0
  assignedResources: string[]; // Resource IDs
  resolvedAt?: number;
  metadata: {
    casualties?: number;
    transported?: number;
    evacuated?: number;
  };
}

// ============================================================================
// RESOURCE SYSTEM
// ============================================================================

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
  id: string; // PT-1, A-1, P-1
  name: string; // "Pumper Truck 1"
  type: ResourceType;
  status: ResourceStatus;
  location: GeoPosition;
  assignedTo?: string; // Incident ID
  travelSpeed: number; // Kilometers per minute for real coords
  capabilities: string[]; // ['fire', 'rescue', 'water']
  station?: string; // "Toronto Fire Station 312"
}

// ============================================================================
// SIMULATION STATE
// ============================================================================

export interface SimulationState {
  // Core data
  scenario: ScenarioDefinition;
  timeline: number; // Seconds since T+0
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
    commander: CommanderDecision | null;
  };

  // Analytics
  stats: {
    totalIncidents: number;
    resolvedIncidents: number;
    peopleSaved: number;
    avgResponseTime: number; // Minutes
    hospitalUtilization: number; // Percentage
  };

  // Simulation control
  isPaused: boolean;
  speed: 1 | 2 | 5 | 10; // Simulation speed multiplier
}

export interface SimulationEvent {
  id: string;
  timestamp: number; // Seconds
  type: 'incident' | 'decision' | 'arrival' | 'transport' | 'alert' | 'resolution';
  description: string;
  severity?: 1 | 2 | 3 | 4 | 5;
  agentId?: string;
  torontoContext?: string;
}

// ============================================================================
// AGENT DECISIONS
// ============================================================================

export interface AgentDecision {
  agentId: 'triage' | 'resource' | 'logistics' | 'medical' | 'communications' | 'commander';
  timestamp: number;
  decision: any;
  reasoning: string;
  torontoContext: string[];
  confidence: number; // 0-1
}

// Agent conflict detection
export interface AgentConflict {
  id: string;
  agents: [string, string]; // e.g., ['medical', 'logistics']
  description: string;
  resolution: string;
  resolvedBy: 'commander' | 'rule';
}

// Commander summary synthesizing all agent outputs
export interface CommanderSummary {
  timestamp: number;
  overallStatus: 'stable' | 'stressed' | 'critical';
  keyDecisions: string[];
  conflicts: AgentConflict[];
  equityNotes: string[];
  torontoContext: string[];
}

export interface TriageDecision extends AgentDecision {
  agentId: 'triage';
  decision: {
    priorityQueue: Array<{
      incidentId: string;
      priority: number; // 1-10
      rationale: string;
    }>;
  };
}

export interface ResourceDecision extends AgentDecision {
  agentId: 'resource';
  decision: {
    assignments: Array<{
      resourceId: string;
      incidentId: string;
      rationale: string;
    }>;
    held: string[]; // Resources held in reserve
  };
}

export interface LogisticsDecision extends AgentDecision {
  agentId: 'logistics';
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
  agentId: 'medical';
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
  agentId: 'communications';
  decision: {
    publicAlerts: Array<{
      severity: 'info' | 'warning' | 'urgent';
      message: string;
      torontoSpecific: string[];
    }>;
  };
}

export interface CommanderDecision extends AgentDecision {
  agentId: 'commander';
  decision: {
    summary: CommanderSummary;
  };
}

// ============================================================================
// SCENARIO DEFINITION
// ============================================================================

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  duration: number; // Minutes
  citySize: { width: number; height: number };
  locationFocus: string; // "Downtown Toronto Core"

  initialIncidents: Array<{
    id: string;
    type: IncidentType;
    location: TorontoLocation;
    severity: 1 | 2 | 3 | 4 | 5;
    peopleAffected: number;
    details: string;
    reportedAt: number; // Seconds
  }>;

  scriptedEvents: Array<{
    id: string;
    triggerTime: number; // Seconds
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

// ============================================================================
// MAP TYPES
// ============================================================================

export interface MapCell {
  x: number;
  y: number;
  type: 'street' | 'building' | 'park' | 'water' | 'underground';
  label?: string; // "King St", "PATH System"
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SeverityLevel = 1 | 2 | 3 | 4 | 5;

export interface TimelineMarker {
  time: number; // Seconds
  label: string;
  type: 'incident' | 'decision' | 'milestone';
}
