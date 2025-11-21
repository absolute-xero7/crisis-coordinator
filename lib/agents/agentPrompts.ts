// Agent Prompt Templates - Toronto Emergency Response

import { SimulationState, Incident, Resource, TorontoHospital } from '../types';
import { formatTime } from '../utils/timeUtils';

/**
 * Build Toronto context string from state
 */
export function buildTorontoContext(state: SimulationState): string {
  const context: string[] = [];

  // Hospital status
  for (const hospital of state.hospitals) {
    const utilization = Math.round((hospital.capacityUsed / hospital.capacityTotal) * 100);
    context.push(
      `${hospital.name} (${hospital.address}): ${hospital.capacityUsed}/${hospital.capacityTotal} beds (${utilization}%)`
    );
  }

  // Timeline
  context.push(`Current time: ${formatTime(state.timeline)}`);

  // Active incidents count
  const activeIncidents = state.incidents.filter(
    (i) => i.status !== 'resolved'
  ).length;
  context.push(`Active incidents: ${activeIncidents}/${state.incidents.length}`);

  // Available resources
  const availableResources = state.resources.filter(
    (r) => r.status === 'available'
  ).length;
  context.push(`Available resources: ${availableResources}/${state.resources.length}`);

  return context.join(' | ');
}

/**
 * Format incidents for prompt
 */
export function formatIncidentsForPrompt(incidents: Incident[]): string {
  return incidents
    .filter((i) => i.status !== 'resolved')
    .map((i) => {
      const address = i.location.address || `Grid ${i.location.x},${i.location.y}`;
      const neighborhood = i.location.neighborhood ? ` (${i.location.neighborhood})` : '';
      const landmark = i.location.landmark ? ` near ${i.location.landmark}` : '';

      return `ID: ${i.id}
Type: ${i.type.toUpperCase()}
Location: ${address}${neighborhood}${landmark}
Severity: ${i.severity}/5
People Affected: ${i.peopleAffected}
Status: ${i.status}
Details: ${i.details}
Reported At: ${formatTime(i.reportedAt)}
Assigned Resources: ${i.assignedResources.length > 0 ? i.assignedResources.join(', ') : 'None'}`;
    })
    .join('\n\n');
}

/**
 * Format resources for prompt
 */
export function formatResourcesForPrompt(resources: Resource[]): string {
  return resources
    .map((r) => {
      const location = r.location ? `Grid ${r.location.x},${r.location.y}` : 'Unknown';
      return `ID: ${r.id} | Name: ${r.name} | Type: ${r.type} | Status: ${r.status} | Location: ${location} | Assigned: ${r.assignedTo || 'None'}`;
    })
    .join('\n');
}

/**
 * Format hospitals for prompt
 */
export function formatHospitalsForPrompt(hospitals: TorontoHospital[]): string {
  return hospitals
    .map((h) => {
      const utilization = Math.round((h.capacityUsed / h.capacityTotal) * 100);
      return `${h.name} (${h.address}): ${h.capacityUsed}/${h.capacityTotal} beds (${utilization}%) | Specialties: ${h.specialties.join(', ')}`;
    })
    .join('\n');
}

// ============================================================================
// TRIAGE AGENT PROMPT
// ============================================================================

export function buildTriageAgentPrompt(state: SimulationState): string {
  return `You are the TRIAGE AGENT for Toronto Emergency Operations Centre.

ROLE: Analyze all active incidents and create a priority queue for emergency response.

TORONTO CONTEXT:
${buildTorontoContext(state)}

CURRENT INCIDENTS:
${formatIncidentsForPrompt(state.incidents)}

AVAILABLE RESOURCES:
${formatResourcesForPrompt(state.resources)}

CONSIDERATIONS:
- Severity level (1-5, where 5 is critical)
- Number of people affected
- Time sensitivity (life threats, hypothermia, trapped individuals)
- Toronto geography (PATH underground system, DVP highway, TTC subway, waterfront)
- Hospital proximity and capacity
- Resource availability and specialization
- Current response status (are resources already assigned?)

INSTRUCTIONS:
Prioritize incidents for response. Assign priority scores from 1-10 (10 = highest priority).
Consider both immediate life threats and strategic resource deployment.

RESPOND IN VALID JSON ONLY:
{
  "priorityQueue": [
    {
      "incidentId": "TOR-INC-001",
      "priority": 10,
      "rationale": "Brief explanation why this is highest priority"
    }
  ],
  "reasoning": "Overall explanation of prioritization strategy, mentioning Toronto-specific factors (hospitals, streets, infrastructure)",
  "torontoContext": ["Key Toronto factors like 'PATH system critical', 'St. Michael's at 85%'", "TTC Line 1 suspended"]
}`;
}

// ============================================================================
// RESOURCE AGENT PROMPT
// ============================================================================

export function buildResourceAgentPrompt(
  state: SimulationState,
  priorityQueue: any[]
): string {
  return `You are the RESOURCE AGENT for Toronto Fire Services, Toronto Paramedic Services, and Toronto Police Service.

ROLE: Assign emergency resources to incidents based on triage priorities.

TORONTO CONTEXT:
${buildTorontoContext(state)}

TRIAGE PRIORITY QUEUE (from Triage Agent):
${priorityQueue
  .map(
    (p) => `${p.incidentId} - Priority: ${p.priority}/10 - ${p.rationale}`
  )
  .join('\n')}

CURRENT INCIDENTS:
${formatIncidentsForPrompt(state.incidents)}

AVAILABLE RESOURCES:
${formatResourcesForPrompt(state.resources.filter((r) => r.status === 'available'))}

RESOURCE CAPABILITIES:
- fire-pumper: Fire suppression, basic rescue
- fire-aerial: High-rise fires, elevated rescue
- fire-heavy-rescue: Vehicle extrication, structural collapse
- fire-hazmat: Chemical spills, gas leaks
- fire-water-rescue: Flooding, marine incidents, PATH system
- fire-technical-rescue: Confined spaces, high-angle rescue
- ambulance: Medical transport, trauma care
- ambulance-supervisor: Command and coordination
- ambulance-mass-casualty: Large-scale triage
- police: Traffic control, crowd management, security
- police-traffic: Road closures, traffic coordination

TORONTO-SPECIFIC CONSIDERATIONS:
- PATH flooding requires water-rescue units
- DVP/Gardiner incidents need heavy rescue for vehicle extrication
- Downtown fires (Financial District) may need aerial units
- TTC incidents require coordination with Toronto Transit
- Waterfront/marine incidents need water-rescue

INSTRUCTIONS:
Assign available resources to high-priority incidents.
Match resource capabilities to incident types.
Consider holding some resources in reserve for new incidents.
DO NOT assign resources that are already deployed (status != 'available').

RESPOND IN VALID JSON ONLY:
{
  "assignments": [
    {
      "resourceId": "WR-1",
      "incidentId": "TOR-INC-001",
      "rationale": "Water Rescue 1 assigned to PATH flooding - specialized capability needed"
    }
  ],
  "held": ["A-5", "PT-4"],
  "reasoning": "Explain assignment strategy, mention Toronto locations and resource positioning",
  "torontoContext": ["TFS units staged near King St", "Water rescue from Marine Unit"]
}`;
}

// ============================================================================
// LOGISTICS AGENT PROMPT
// ============================================================================

export function buildLogisticsAgentPrompt(state: SimulationState): string {
  return `You are the LOGISTICS AGENT for Toronto Emergency Medical Services coordination.

ROLE: Plan hospital routing, shelter assignments, and evacuation logistics.

TORONTO CONTEXT:
${buildTorontoContext(state)}

CURRENT INCIDENTS:
${formatIncidentsForPrompt(state.incidents)}

TORONTO HOSPITALS:
${formatHospitalsForPrompt(state.hospitals)}

SHELTERS:
${state.shelters.map((s) => `${s.name} (${s.address}): ${s.capacityUsed}/${s.capacityTotal} capacity`).join('\n')}

CONSIDERATIONS:
- Hospital capacity and specialties
- Travel time from incident to hospital
- Toronto geography (University Ave hospital row, Sunnybrook in North York)
- Hospital specialization (Trauma centers: Toronto General, St. Michael's, Sunnybrook)
- Shelter proximity for evacuees
- Load balancing across hospitals

TORONTO-SPECIFIC ROUTING:
- St. Michael's Hospital (Bond St): Closest to Financial District, often busy
- Toronto General Hospital (University Ave): Trauma center, cardiac specialty
- Mount Sinai Hospital (University Ave): General emergency
- Sunnybrook Health Sciences (Bayview Ave): Trauma, burns, critical care (farther north)
- North York General (Leslie St): North Toronto coverage

INSTRUCTIONS:
Route medical transports to appropriate hospitals.
Balance hospital capacity - avoid overloading any single hospital.
Consider specialty needs (trauma, cardiac, burns).
Assign shelters for mass evacuations.

RESPOND IN VALID JSON ONLY:
{
  "hospitalRouting": [
    {
      "incidentId": "TOR-INC-001",
      "targetHospital": "toronto-general",
      "reason": "Trauma capability, adequate capacity, 6-minute transport time"
    }
  ],
  "shelterAssignments": [
    {
      "incidentId": "TOR-INC-001",
      "shelterId": "metro-convention",
      "capacity": 2000
    }
  ],
  "reasoning": "Explain routing strategy with Toronto hospital locations and capacities",
  "torontoContext": ["Metro Convention Centre closest shelter", "St. Michael's at 85% - route to Toronto General"]
}`;
}

// ============================================================================
// MEDICAL AGENT PROMPT
// ============================================================================

export function buildMedicalAgentPrompt(state: SimulationState): string {
  return `You are the MEDICAL AGENT monitoring Toronto hospital system capacity.

ROLE: Monitor hospital capacity, identify system stress, recommend diversion protocols.

TORONTO CONTEXT:
${buildTorontoContext(state)}

TORONTO HOSPITALS STATUS:
${formatHospitalsForPrompt(state.hospitals)}

CURRENT MEDICAL INCIDENTS:
${formatIncidentsForPrompt(state.incidents.filter((i) => ['medical', 'mass-casualty'].includes(i.type)))}

CAPACITY THRESHOLDS:
- <70%: Normal operations
- 70-85%: Moderate stress
- 85-95%: High stress - consider diversion
- >95%: Critical - diversion required

INSTRUCTIONS:
Identify hospitals under stress.
Recommend diversion protocols if needed.
Flag specialty care concerns (trauma, cardiac, burns).

RESPOND IN VALID JSON ONLY:
{
  "alerts": [
    {
      "type": "capacity",
      "hospitalId": "st-michaels",
      "message": "St. Michael's at 85% capacity - recommend diversion to Toronto General"
    }
  ],
  "recommendations": [
    "Route trauma cases to Toronto General or Sunnybrook",
    "Monitor St. Michael's capacity closely"
  ],
  "reasoning": "Explain hospital system status with Toronto-specific concerns",
  "torontoContext": ["St. Michael's stressed due to PATH evacuation", "Toronto General has capacity"]
}`;
}

// ============================================================================
// COMMUNICATIONS AGENT PROMPT
// ============================================================================

export function buildCommunicationsAgentPrompt(
  state: SimulationState,
  topIncidents: Incident[]
): string {
  return `You are the COMMUNICATIONS AGENT for Toronto Emergency Operations Centre.

ROLE: Generate public alerts for Toronto residents and media.

TORONTO CONTEXT:
${buildTorontoContext(state)}

TOP PRIORITY INCIDENTS:
${formatIncidentsForPrompt(topIncidents)}

INSTRUCTIONS:
Draft clear, calm, actionable public alerts.
Include Toronto-specific information (streets, TTC lines, hospitals, shelters).
Use appropriate severity levels.

ALERT SEVERITY LEVELS:
- info: General updates, situational awareness
- warning: Avoid area, take precautions
- urgent: Immediate action required, safety threat

TORONTO-SPECIFIC MESSAGING:
- Mention TTC disruptions (Line 1, 2, buses, streetcars)
- Reference Toronto streets (King, Bay, Yonge, DVP, Gardiner)
- Direct to Toronto shelters (Metro Convention Centre, Nathan Phillips Square)
- Use Toronto landmarks (PATH system, Union Station, CN Tower)

RESPOND IN VALID JSON ONLY:
{
  "publicAlerts": [
    {
      "severity": "urgent",
      "message": "URGENT: PATH system closed due to flooding. Avoid downtown core (King to Front, Bay to Yonge). Union Station evacuating. Use alternate routes.",
      "torontoSpecific": ["PATH system closed", "TTC Line 1 suspended King to Bloor", "Nearest shelter: Metro Convention Centre"]
    }
  ],
  "reasoning": "Explain alert strategy and Toronto context",
  "torontoContext": ["Financial District impacted", "TTC service disrupted"]
}`;
}
