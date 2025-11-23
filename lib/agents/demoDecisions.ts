import {
  SimulationState,
  Incident,
  TriageDecision,
  ResourceDecision,
  LogisticsDecision,
  MedicalDecision,
  CommunicationsDecision,
  CommanderDecision,
  AgentConflict,
} from '../types';
import { geoDistance } from '../utils/mapUtils';

// Scenario-specific content for demo mode
const SCENARIO_CONTENT = {
  'path-flooding': {
    triage: {
      reasoning: 'PATH System Flood ranked Priority #1 with 2,000+ commuters trapped underground between Union Station and TD Centre. Hypothermia risk escalating as water temperature is 12°C. Mass-casualty and medical emergencies receive top priority regardless of location or property value. Ritz-Carlton fire alarm (property only, no injuries) deprioritized below all human-life incidents.',
      torontoContext: [
        'PATH flooding impacts downtown core',
        'University Ave hospitals coordinating surge',
        'Human vulnerability prioritized over property',
      ],
    },
    resource: {
      reasoning: 'Dispatching TFS water rescue units to PATH flooding as priority. Staging ambulances at King/Bay intersection for rapid extraction. TPS traffic units establishing perimeter on Bay St and York St to facilitate emergency vehicle access. Holding 2 units in reserve for potential cascade events.',
      torontoContext: ['Staging near King/Bay and Union Station corridors'],
    },
    logistics: {
      reasoning: '⛔ ROUTE CONFLICT DETECTED: Bay St corridor at 90% traffic density due to evacuation gridlock. Proposed ambulance route via Bay St rejected. Rerouting all transports via University Ave exit to reduce ETA by 8 minutes.',
      torontoContext: [
        'Bay St blocked - using University Ave corridor',
        'Routing to University Ave corridor and Sunnybrook',
        'Traffic density monitoring active',
      ],
    },
    medical: {
      reasoning: "St. Michael's at 85% capacity—recommending diversion for non-critical cases to prevent overload. Toronto General and Sunnybrook have available capacity. Routing trauma cases to St. Michael's (Level 1 trauma center), overflow via University Ave corridor to Toronto General. Hypothermia patients from PATH require immediate warming protocols upon extraction.",
      torontoContext: ['Monitoring University Ave hospital corridor', 'Sunnybrook available for overflow'],
    },
    communications: {
      reasoning: 'Issuing URGENT alert for PATH system evacuation via Toronto Emergency Alert system. Coordinating with TTC for Line 1 service suspension announcements. TPS Traffic Services notified for road closures on Bay St between King and Front. Media advisory prepared for 6PM news cycle. Social media monitoring active for misinformation.',
      torontoContext: ['Coordinated with TPS traffic for detours'],
    },
    commander: {
      conflict: {
        description: 'Medical Agent demanded immediate ambulance extraction via Bay Street for hypothermia patients at King Station. Logistics Agent rejected that route—Bay Street is gridlocked at 90% traffic density from the evacuation crowds.',
        resolution: '⚡ RESOLVED: Commander AI rerouted to University Avenue exit. ETA reduced by 8 minutes. In a flood, 8 minutes saves lives.',
      },
      keyDecisions: [
        'Priority #1: PATH System Flood (2,000+ trapped underground)',
        '⚠️ St. Michael\'s at 85% capacity—diverting non-critical cases',
        '⚡ 1 agent conflict resolved (Medical vs Logistics routing)',
      ],
      equityNotes: [
        '✅ Human vulnerability prioritized over property value',
        '✅ PATH evacuation (2,000 trapped people) ranked above Ritz-Carlton fire alarm (property only, no injuries)',
        '✅ Mass-casualty and medical emergencies receive top priority regardless of location',
        '✅ Vulnerable populations (hypothermia risk, elderly, medical conditions) receiving priority transport',
      ],
      torontoContext: [
        'Coordinating TFS/EMS/TPS multi-agency response',
        'University Ave corridor primary transport route (Bay St rejected)',
        'Metro Convention Centre on standby for mass evacuation shelter',
      ],
    },
  },
  'dvp-blizzard': {
    triage: {
      reasoning: '40-vehicle pileup on DVP ranked Priority #1 with 80+ people affected, multiple entrapments in -25°C wind chill. Hypothermia risk critical—exposure time under 30 minutes before life-threatening. CO poisoning incident in Scarborough elevated to Priority #2 due to multiple unconscious patients. Thorncliffe power outage affecting 300 elderly residents requires shelter coordination.',
      torontoContext: [
        'DVP corridor completely blocked',
        'Eastern hospitals coordinating surge capacity',
        'Cold weather emergencies prioritized',
      ],
    },
    resource: {
      reasoning: 'Dispatching TFS heavy rescue and extrication units to DVP pileup. Deploying hazmat team to Eglinton fuel spill. TPS traffic establishing perimeter on Don Mills Rd and Eglinton Ave. Staging warming buses at Thorncliffe Park. Holding technical rescue team for ravine extraction.',
      torontoContext: ['Staging at Don Mills/Eglinton interchange'],
    },
    logistics: {
      reasoning: '⛔ ROUTE CONFLICT DETECTED: DVP completely blocked from Don Mills to Pottery Road. Ambulances rerouting via Bayview Ave and Victoria Park. Sunnybrook at 95% capacity—diverting to North York General. ETA to trauma centers increased by 12 minutes due to road conditions.',
      torontoContext: [
        'DVP closed - using Bayview Ave corridor',
        'Routing to North York General for overflow',
        'Snow plow coordination active with City Works',
      ],
    },
    medical: {
      reasoning: "Sunnybrook on diversion at 95% capacity with incoming DVP trauma cases. North York General has significant available capacity (30%). Routing critical trauma to Sunnybrook (closest Level 1), all others to North York General. Hypothermia and frostbite cases require immediate warming protocols. CO poisoning patients need hyperbaric treatment at Toronto General.",
      torontoContext: ['Monitoring Sunnybrook surge and North York General capacity'],
    },
    communications: {
      reasoning: 'Issuing URGENT winter storm advisory via Toronto Emergency Alert. TTC surface routes suspended on Eglinton and Don Mills. Toronto Hydro crews coordinating power restoration for 15,000 affected homes. Warming centres activated at East York and Thorncliffe community centres. Media advisory issued for road closures.',
      torontoContext: ['Coordinated with TTC and Toronto Hydro'],
    },
    commander: {
      conflict: {
        description: 'Medical Agent requested ambulance transport via DVP for cardiac arrest in Leaside. Logistics Agent flagged DVP completely blocked by 40-vehicle pileup with no estimated clearance time.',
        resolution: '⚡ RESOLVED: Commander rerouted via Bayview Ave. Dispatched closest available unit from Sunnybrook staging area. ETA reduced from 15 to 8 minutes.',
      },
      keyDecisions: [
        'Priority #1: DVP 40-Vehicle Pileup (80+ affected)',
        '⚠️ Sunnybrook at 95% capacity—on diversion',
        '⚡ 1 agent conflict resolved (Medical vs Logistics routing)',
      ],
      equityNotes: [
        '✅ EQUITY CHECK: Life-threatening cold exposure prioritized',
        '✅ Thorncliffe elderly residents (vulnerable population) receiving priority transport',
        '✅ Shelter overflow directed to community warming centres',
        '✅ CO poisoning victims receiving priority hyperbaric access',
      ],
      torontoContext: [
        'Coordinating TFS/EMS/TPS winter response',
        'Bayview Ave primary transport corridor',
        'Warming centres activated across East York',
      ],
    },
  },
  'billy-bishop-airport': {
    triage: {
      reasoning: 'Aircraft crash in Lake Ontario ranked Priority #1—3 passengers in 12°C water with 30-minute hypothermia window. Water rescue is time-critical. Fuel fire on water surface creating toxic smoke hazard for 5,000+ at Harbourfront festival. Boat collision victims with spinal injury require specialized marine extraction.',
      torontoContext: [
        'Waterfront emergency zone established',
        'Marine rescue coordination with Coast Guard',
        'Mass evacuation from Harbourfront in progress',
      ],
    },
    resource: {
      reasoning: 'Dispatching TFS Marine Unit and water rescue teams to crash site. Hazmat deployed for fuel fire containment. TPS marine unit establishing safety perimeter. Staging ambulances at Queens Quay ferry terminal. Coast Guard helicopter requested for aerial support.',
      torontoContext: ['Staging at Toronto Island Ferry Terminal'],
    },
    logistics: {
      reasoning: '⛔ ROUTE CONFLICT DETECTED: Queens Quay gridlocked with 5,000+ evacuating festival-goers blocking emergency vehicle access. Ambulances rerouting via York St and Harbour St. Water rescue patients transported by marine unit to ferry dock for land ambulance handoff.',
      torontoContext: [
        'Queens Quay blocked - using York St corridor',
        'Marine-to-land patient handoff at ferry dock',
        'Evacuation routes via Front St established',
      ],
    },
    medical: {
      reasoning: "St. Michael's approaching capacity with incoming water rescue and crowd surge casualties. Toronto General has available capacity (58%). Routing hypothermia cases requiring rewarming to St. Michael's (Level 1 trauma), crowd injuries to Toronto General. Spinal injury patient requires specialized transport with immobilization.",
      torontoContext: ['Monitoring downtown trauma centres'],
    },
    communications: {
      reasoning: 'Issuing URGENT waterfront evacuation alert via Toronto Emergency Alert. Billy Bishop Airport operations suspended—all flights diverted to Pearson. TTC 509/510 streetcar service suspended on Queens Quay. Media advisory for waterfront closures. Coast Guard coordinating marine traffic control.',
      torontoContext: ['Coordinated with Billy Bishop and Pearson airports'],
    },
    commander: {
      conflict: {
        description: 'Medical Agent requested immediate ground ambulance for hypothermia patients at crash site. Logistics Agent flagged no land access—patients are 200m offshore in Lake Ontario.',
        resolution: '⚡ RESOLVED: Commander coordinated marine-to-land handoff. TFS Marine Unit extracting patients to ferry dock for ambulance transfer. Total transport time reduced by coordinating assets.',
      },
      keyDecisions: [
        'Priority #1: Aircraft Crash Water Rescue (3 in water)',
        '⚠️ Fuel fire creating toxic smoke over Harbourfront',
        '⚡ 1 agent conflict resolved (Marine vs Ground transport)',
      ],
      equityNotes: [
        '✅ EQUITY CHECK: Life-threatening water rescue prioritized',
        '✅ Festival crowd (5,000) evacuation coordinated safely',
        '✅ Vulnerable individuals (injured, elderly) receiving priority transport',
        '✅ Environmental hazard (fuel spill) contained to protect public',
      ],
      torontoContext: [
        'Coordinating TFS Marine/EMS/TPS/Coast Guard',
        'York St corridor primary transport route',
        'Metro Convention Centre activated for evacuation shelter',
      ],
    },
  },
};

function getScenarioContent(state: SimulationState) {
  const scenarioId = state.scenario?.id || 'path-flooding';
  return SCENARIO_CONTENT[scenarioId as keyof typeof SCENARIO_CONTENT] || SCENARIO_CONTENT['path-flooding'];
}

function buildTriage(state: SimulationState): TriageDecision {
  const content = getScenarioContent(state);
  const activeIncidents = state.incidents.filter((i) => i.status !== 'resolved');
  const priorityQueue = activeIncidents
    .map((incident) => {
      const priority = Math.min(
        10,
        incident.severity * 2 + Math.log10(Math.max(1, incident.peopleAffected))
      );

      return {
        incidentId: incident.id,
        priority: Math.round(priority),
        rationale: `Severity ${incident.severity}, ${incident.peopleAffected} impacted`,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  return {
    agentId: 'triage',
    timestamp: state.timeline,
    decision: { priorityQueue },
    reasoning: content.triage.reasoning,
    torontoContext: content.triage.torontoContext,
    confidence: 0.91,
  };
}

function buildResources(state: SimulationState, triageDecision: TriageDecision): ResourceDecision {
  const content = getScenarioContent(state);
  const assignments: any[] = [];
  const availableResources = state.resources.filter((r) => r.status === 'available');
  const topIncidents = triageDecision.decision.priorityQueue.slice(0, 4);

  for (const priorityItem of topIncidents) {
    const incident = state.incidents.find((i) => i.id === priorityItem.incidentId);
    if (!incident) continue;

    const resource = availableResources.find((r) => {
      if (assignments.some((a) => a.resourceId === r.id)) return false;
      if (incident.type === 'fire' && r.type.startsWith('fire')) return true;
      if (incident.type === 'medical' && r.type.startsWith('ambulance')) return true;
      if (incident.type === 'flood' && r.type.includes('water')) return true;
      return r.type === 'police';
    });

    if (resource) {
      assignments.push({
        resourceId: resource.id,
        incidentId: incident.id,
        rationale: `Nearest available ${resource.type} unit assigned based on proximity and capability match`,
      });
    }
  }

  return {
    agentId: 'resource',
    timestamp: state.timeline,
    decision: { assignments, held: [] },
    reasoning: content.resource.reasoning,
    torontoContext: content.resource.torontoContext,
    confidence: 0.88,
  };
}

function buildLogistics(state: SimulationState): LogisticsDecision {
  const content = getScenarioContent(state);
  const hospitalRouting: any[] = [];

  const medicalIncidents = state.incidents.filter(
    (i) =>
      (i.type === 'medical' || i.type === 'mass-casualty' || i.type === 'flood') &&
      i.status !== 'resolved'
  );

  for (const incident of medicalIncidents.slice(0, 4)) {
    let bestHospital = null;
    let bestScore = -Infinity;

    for (const hospital of state.hospitals) {
      const utilization = hospital.capacityUsed / hospital.capacityTotal;
      if (utilization > 0.93) continue;
      const distance = geoDistance(incident.location, hospital.location);
      const score = 100 / (distance + 1) - utilization * 40;
      if (score > bestScore) {
        bestScore = score;
        bestHospital = hospital;
      }
    }

    if (bestHospital) {
      hospitalRouting.push({
        incidentId: incident.id,
        targetHospital: bestHospital.id,
        reason: `Routing to ${bestHospital.name} - optimal capacity (${Math.round(
          (bestHospital.capacityUsed / bestHospital.capacityTotal) * 100
        )}% utilized) and trauma capability`,
      });
    }
  }

  return {
    agentId: 'logistics',
    timestamp: state.timeline,
    decision: { hospitalRouting, shelterAssignments: [] },
    reasoning: content.logistics.reasoning,
    torontoContext: content.logistics.torontoContext,
    confidence: 0.9,
  };
}

function buildMedical(state: SimulationState): MedicalDecision {
  const content = getScenarioContent(state);
  const alerts: any[] = [];
  const recommendations: string[] = [];

  for (const hospital of state.hospitals) {
    const utilization = hospital.capacityUsed / hospital.capacityTotal;
    if (utilization > 0.85) {
      alerts.push({
        type: 'capacity' as const,
        hospitalId: hospital.id,
        message: `${hospital.name} at ${Math.round(utilization * 100)}% capacity - divert non-critical cases`,
      });
    }
  }

  if (alerts.length > 0) {
    recommendations.push('Redistribute transports across University Ave corridor and Sunnybrook.');
  } else {
    recommendations.push('System stable; keep monitoring downtown surge.');
  }

  return {
    agentId: 'medical',
    timestamp: state.timeline,
    decision: { alerts, recommendations },
    reasoning: content.medical.reasoning,
    torontoContext: content.medical.torontoContext,
    confidence: 0.92,
  };
}

function buildComms(state: SimulationState, incidents: Incident[]): CommunicationsDecision {
  const publicAlerts = incidents.slice(0, 3).map((incident) => {
    let severity: 'info' | 'warning' | 'urgent' = 'info';
    if (incident.severity >= 5) severity = 'urgent';
    else if (incident.severity >= 3) severity = 'warning';

    return {
      severity,
      message: `${incident.type.toUpperCase()}: ${incident.details || incident.type} near ${
        incident.location.address || incident.location.landmark || 'downtown core'
      }. Avoid area; follow TFS/EMS directions.`,
      torontoSpecific: ['TTC disruptions possible', 'Use alternate routes around Financial District'],
    };
  });

  return {
    agentId: 'communications',
    timestamp: state.timeline,
    decision: { publicAlerts },
    reasoning: 'Issuing URGENT alert for PATH system evacuation via Toronto Emergency Alert system. Coordinating with TTC for Line 1 service suspension announcements. TPS Traffic Services notified for road closures on Bay St between King and Front. Media advisory prepared for 6PM news cycle. Social media monitoring active for misinformation.',
    torontoContext: ['Coordinated with TPS traffic for detours'],
    confidence: 0.87,
  };
}

function buildCommander(state: SimulationState): CommanderDecision {
  const content = getScenarioContent(state);
  // Hardcoded demo conflict for presentation
  const demoConflicts: AgentConflict[] = [
    {
      id: 'conflict-demo-1',
      agents: ['medical', 'logistics'],
      description: content.commander.conflict.description,
      resolution: content.commander.conflict.resolution,
      resolvedBy: 'commander',
    },
  ];

  // Calculate overall status
  const activeIncidents = state.incidents.filter((i) => i.status !== 'resolved');
  const criticalCount = activeIncidents.filter((i) => i.severity >= 5).length;
  const overallStatus: 'stable' | 'stressed' | 'critical' =
    criticalCount >= 2 ? 'critical' : criticalCount >= 1 || activeIncidents.length >= 4 ? 'stressed' : 'stable';

  return {
    agentId: 'commander',
    timestamp: state.timeline,
    decision: {
      summary: {
        timestamp: state.timeline,
        overallStatus,
        keyDecisions: content.commander.keyDecisions,
        conflicts: demoConflicts,
        equityNotes: content.commander.equityNotes,
        torontoContext: content.commander.torontoContext,
      },
    },
    reasoning: `Commander AI resolved ${demoConflicts.length} agent conflict${demoConflicts.length > 1 ? 's' : ''} between Medical and Logistics. Bay Street route rejected due to gridlock; University Avenue corridor selected. System status: ${overallStatus.toUpperCase()}. All decisions auditable and transparent.`,
    torontoContext: content.commander.torontoContext,
    confidence: 0.92,
  };
}

export function demoAgentDecisions(state: SimulationState, topIncidents?: Incident[]) {
  const triage = buildTriage(state);
  const resource = buildResources(state, triage);
  const logistics = buildLogistics(state);
  const medical = buildMedical(state);
  const communications = buildComms(
    state,
    topIncidents && topIncidents.length ? topIncidents : state.incidents
  );
  const commander = buildCommander(state);

  return {
    triage,
    resource,
    logistics,
    medical,
    communications,
    commander,
  };
}
