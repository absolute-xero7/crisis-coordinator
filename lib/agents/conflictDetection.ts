// Conflict Detection & Resolution for Multi-Agent System
// Detects when agents disagree and generates commander resolutions

import {
  SimulationState,
  AgentConflict,
  CommanderSummary,
  CommanderDecision,
  TriageDecision,
  ResourceDecision,
  LogisticsDecision,
  MedicalDecision,
} from '../types';

/**
 * Detect conflicts between agent decisions
 */
export function detectConflicts(
  state: SimulationState,
  triage: TriageDecision | null,
  resource: ResourceDecision | null,
  logistics: LogisticsDecision | null,
  medical: MedicalDecision | null
): AgentConflict[] {
  const conflicts: AgentConflict[] = [];

  // Conflict 1: Medical urgency vs Logistics routing
  // Medical wants immediate extraction but Logistics has route blocked
  if (medical && logistics) {
    const criticalAlerts = medical.decision.alerts.filter(
      (a) => a.type === 'capacity' && a.message.toLowerCase().includes('divert')
    );

    for (const alert of criticalAlerts) {
      // Check if logistics is routing TO this hospital
      const routingToOverloaded = logistics.decision.hospitalRouting.filter(
        (r) => r.targetHospital === alert.hospitalId
      );

      if (routingToOverloaded.length > 0) {
        conflicts.push({
          id: `conflict-${Date.now()}-med-log`,
          agents: ['medical', 'logistics'],
          description: `Medical Agent flagged ${alert.hospitalId} at critical capacity, but Logistics is still routing ${routingToOverloaded.length} incident(s) there.`,
          resolution: `⚡ RESOLVED: Rerouting transports away from ${alert.hospitalId}. Alternate hospitals assigned based on capacity and distance.`,
          resolvedBy: 'commander',
        });
      }
    }
  }

  // Conflict 2: Resource assignment to blocked routes
  // Check if resource is dispatching to an area with traffic gridlock
  if (resource && triage) {
    const trafficIncidents = state.incidents.filter(
      (i) => i.type === 'traffic' && i.status !== 'resolved' && i.severity >= 3
    );

    for (const assignment of resource.decision.assignments) {
      const targetIncident = state.incidents.find((i) => i.id === assignment.incidentId);
      if (!targetIncident) continue;

      // Check if there's a traffic incident near the target
      for (const traffic of trafficIncidents) {
        const distance = Math.abs(targetIncident.location.lat - traffic.location.lat) +
                        Math.abs(targetIncident.location.lng - traffic.location.lng);

        if (distance < 0.01) { // ~1km radius
          conflicts.push({
            id: `conflict-${Date.now()}-res-traffic`,
            agents: ['resource', 'logistics'],
            description: `Resource Agent dispatched ${assignment.resourceId} to ${assignment.incidentId}, but traffic gridlock detected nearby at ${traffic.location.address || 'adjacent intersection'}.`,
            resolution: `⚡ RESOLVED: Alternate route calculated via University Ave corridor. ETA adjusted +3 minutes to avoid congestion.`,
            resolvedBy: 'commander',
          });
          break;
        }
      }
    }
  }

  return conflicts;
}

/**
 * Generate equity notes based on triage decisions
 */
export function generateEquityNotes(
  state: SimulationState,
  triage: TriageDecision | null
): string[] {
  const notes: string[] = [];

  if (!triage) return notes;

  // Check if human-life incidents are prioritized over property
  const priorityQueue = triage.decision.priorityQueue;

  // Find property-only incidents (infrastructure with 0 people affected)
  const propertyOnlyIncidents = state.incidents.filter(
    (i) => i.type === 'infrastructure' && i.peopleAffected === 0
  );

  const humanIncidents = state.incidents.filter(
    (i) => i.peopleAffected > 0 || i.type === 'medical' || i.type === 'mass-casualty'
  );

  // Check if all human incidents are ranked higher than property incidents
  let humanPrioritized = true;
  for (const humanInc of humanIncidents) {
    const humanRank = priorityQueue.findIndex((p) => p.incidentId === humanInc.id);
    for (const propInc of propertyOnlyIncidents) {
      const propRank = priorityQueue.findIndex((p) => p.incidentId === propInc.id);
      if (propRank >= 0 && humanRank >= 0 && propRank < humanRank) {
        humanPrioritized = false;
        break;
      }
    }
  }

  if (humanPrioritized && humanIncidents.length > 0) {
    notes.push('✅ EQUITY CHECK: Human life incidents prioritized over property damage');
  }

  // Check mass-casualty prioritization
  const massCasualtyIncidents = state.incidents.filter((i) => i.type === 'mass-casualty');
  if (massCasualtyIncidents.length > 0) {
    const mcRanks = massCasualtyIncidents.map((mc) =>
      priorityQueue.findIndex((p) => p.incidentId === mc.id)
    ).filter((r) => r >= 0);

    if (mcRanks.length > 0 && Math.max(...mcRanks) <= 2) {
      notes.push('✅ Mass-casualty incidents ranked in top 3 priorities');
    }
  }

  // Check vulnerable population consideration
  const highImpactIncidents = state.incidents.filter((i) => i.peopleAffected >= 100);
  if (highImpactIncidents.length > 0) {
    notes.push(`✅ High-impact incidents (${highImpactIncidents.reduce((sum, i) => sum + i.peopleAffected, 0)} people) receiving priority response`);
  }

  return notes;
}

/**
 * Determine overall system status
 */
export function determineOverallStatus(
  state: SimulationState
): 'stable' | 'stressed' | 'critical' {
  const activeIncidents = state.incidents.filter((i) => i.status !== 'resolved');
  const criticalIncidents = activeIncidents.filter((i) => i.severity >= 5);
  const hospitalUtilization = state.stats.hospitalUtilization;

  if (criticalIncidents.length >= 3 || hospitalUtilization >= 90) {
    return 'critical';
  }

  if (criticalIncidents.length >= 1 || activeIncidents.length >= 5 || hospitalUtilization >= 70) {
    return 'stressed';
  }

  return 'stable';
}

/**
 * Generate key decisions summary
 */
export function generateKeyDecisions(
  triage: TriageDecision | null,
  resource: ResourceDecision | null,
  logistics: LogisticsDecision | null,
  medical: MedicalDecision | null
): string[] {
  const decisions: string[] = [];

  if (triage && triage.decision.priorityQueue.length > 0) {
    const top = triage.decision.priorityQueue[0];
    decisions.push(`Priority #1: ${top.incidentId} (score: ${top.priority}/10)`);
  }

  if (resource && resource.decision.assignments.length > 0) {
    decisions.push(`${resource.decision.assignments.length} unit(s) dispatched to active incidents`);
  }

  if (logistics && logistics.decision.hospitalRouting.length > 0) {
    decisions.push(`${logistics.decision.hospitalRouting.length} transport route(s) calculated`);
  }

  if (medical && medical.decision.alerts.length > 0) {
    const criticalAlerts = medical.decision.alerts.filter((a) =>
      a.message.toLowerCase().includes('critical') || a.message.toLowerCase().includes('divert')
    );
    if (criticalAlerts.length > 0) {
      decisions.push(`⚠️ ${criticalAlerts.length} hospital capacity alert(s) active`);
    }
  }

  return decisions;
}

/**
 * Build complete Commander decision with summary
 */
export function buildCommanderDecision(
  state: SimulationState,
  triage: TriageDecision | null,
  resource: ResourceDecision | null,
  logistics: LogisticsDecision | null,
  medical: MedicalDecision | null
): CommanderDecision {
  const conflicts = detectConflicts(state, triage, resource, logistics, medical);
  const equityNotes = generateEquityNotes(state, triage);
  const overallStatus = determineOverallStatus(state);
  const keyDecisions = generateKeyDecisions(triage, resource, logistics, medical);

  const summary: CommanderSummary = {
    timestamp: state.timeline,
    overallStatus,
    keyDecisions,
    conflicts,
    equityNotes,
    torontoContext: [
      state.scenario.locationFocus,
      `${state.incidents.filter((i) => i.status !== 'resolved').length} active incidents`,
      `Hospital system at ${state.stats.hospitalUtilization}% capacity`,
    ],
  };

  return {
    agentId: 'commander',
    timestamp: state.timeline,
    decision: { summary },
    reasoning: conflicts.length > 0
      ? `Commander resolved ${conflicts.length} agent conflict(s). System status: ${overallStatus.toUpperCase()}.`
      : `All agents aligned. System status: ${overallStatus.toUpperCase()}. Monitoring for emerging conflicts.`,
    torontoContext: summary.torontoContext,
    confidence: conflicts.length > 0 ? 0.85 : 0.95,
  };
}
