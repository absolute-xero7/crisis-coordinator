// Simulation State Management

import {
  SimulationState,
  ScenarioDefinition,
  Incident,
  Resource,
  TorontoHospital,
  TorontoShelter,
  SimulationEvent,
  IncidentStatus,
  ResourceStatus,
} from '../types';
import { TORONTO_HOSPITALS, TORONTO_SHELTERS } from '../torontoData';

/**
 * Initialize simulation state from scenario definition
 */
export function initializeSimulationState(scenario: ScenarioDefinition): SimulationState {
  // Create incidents from initial incidents
  const incidents: Incident[] = scenario.initialIncidents.map((incidentDef) => ({
    id: incidentDef.id,
    type: incidentDef.type,
    location: incidentDef.location,
    severity: incidentDef.severity,
    peopleAffected: incidentDef.peopleAffected,
    details: incidentDef.details,
    status: 'reported' as IncidentStatus,
    reportedAt: incidentDef.reportedAt,
    assignedResources: [],
    metadata: {
      casualties: 0,
      transported: 0,
      evacuated: 0,
    },
  }));

  // Generate resources based on scenario config
  const resources: Resource[] = generateResources(scenario);

  // Use scenario hospitals or default Toronto hospitals
  const hospitals: TorontoHospital[] =
    scenario.hospitals.length > 0 ? scenario.hospitals : TORONTO_HOSPITALS;

  // Use scenario shelters or default Toronto shelters
  const shelters: TorontoShelter[] =
    scenario.shelters.length > 0 ? scenario.shelters : TORONTO_SHELTERS;

  // Initial events
  const events: SimulationEvent[] = incidents.map((incident, index) => ({
    id: `evt-init-${index}`,
    timestamp: incident.reportedAt,
    type: 'incident' as const,
    description: `${incident.type.toUpperCase()}: ${incident.details.substring(0, 80)}...`,
    severity: incident.severity,
  }));

  return {
    scenario,
    timeline: 0,
    incidents,
    resources,
    hospitals,
    shelters,
    events,
    agentDecisions: {
      triage: null,
      resource: null,
      logistics: null,
      medical: null,
      communications: null,
    },
    stats: {
      totalIncidents: incidents.length,
      resolvedIncidents: 0,
      peopleSaved: 0,
      avgResponseTime: 0,
      hospitalUtilization: calculateHospitalUtilization(hospitals),
    },
    isPaused: true,
    speed: 1,
  };
}

/**
 * Generate resources based on scenario configuration
 */
function generateResources(scenario: ScenarioDefinition): Resource[] {
  const resources: Resource[] = [];

  // Fire units (Pumpers)
  const pumperCount = Math.floor(scenario.resources.fireUnits * 0.5);
  for (let i = 1; i <= pumperCount; i++) {
    resources.push({
      id: `PT-${i}`,
      name: `Pumper Truck ${i}`,
      type: 'fire-pumper',
      status: 'available',
      location: getStationLocation(i, scenario),
      travelSpeed: 0.5, // 0.5 cells per 10 seconds
      capabilities: ['fire', 'rescue'],
      station: `Toronto Fire Station ${310 + i}`,
    });
  }

  // Aerial units
  const aerialCount = Math.floor(scenario.resources.fireUnits * 0.2);
  for (let i = 1; i <= aerialCount; i++) {
    resources.push({
      id: `AT-${i}`,
      name: `Aerial Truck ${i}`,
      type: 'fire-aerial',
      status: 'available',
      location: getStationLocation(i, scenario),
      travelSpeed: 0.4,
      capabilities: ['fire', 'rescue', 'height'],
      station: `Toronto Fire Station ${310 + i}`,
    });
  }

  // Heavy rescue
  const rescueCount = Math.floor(scenario.resources.fireUnits * 0.15);
  for (let i = 1; i <= rescueCount; i++) {
    resources.push({
      id: `HR-${i}`,
      name: `Heavy Rescue ${i}`,
      type: 'fire-heavy-rescue',
      status: 'available',
      location: getStationLocation(i, scenario),
      travelSpeed: 0.5,
      capabilities: ['rescue', 'extrication', 'technical'],
    });
  }

  // Specialized units
  if (scenario.resources.specialized.includes('hazmat')) {
    resources.push({
      id: 'HZ-1',
      name: 'Hazmat Unit 1',
      type: 'fire-hazmat',
      status: 'available',
      location: { x: 7, y: 5 },
      travelSpeed: 0.4,
      capabilities: ['hazmat', 'chemical', 'gas'],
      station: 'Toronto Fire Station 333',
    });
  }

  if (scenario.resources.specialized.includes('water-rescue')) {
    resources.push({
      id: 'WR-1',
      name: 'Water Rescue 1',
      type: 'fire-water-rescue',
      status: 'available',
      location: { x: 7, y: 12 },
      travelSpeed: 0.3,
      capabilities: ['water', 'marine', 'dive'],
      station: 'TFS Marine Unit',
    });
    resources.push({
      id: 'WR-2',
      name: 'Water Rescue 2',
      type: 'fire-water-rescue',
      status: 'available',
      location: { x: 7, y: 12 },
      travelSpeed: 0.3,
      capabilities: ['water', 'marine', 'dive'],
      station: 'TFS Marine Unit',
    });
  }

  if (scenario.resources.specialized.includes('technical-rescue')) {
    resources.push({
      id: 'TR-1',
      name: 'Technical Rescue 1',
      type: 'fire-technical-rescue',
      status: 'available',
      location: { x: 3, y: 10 },
      travelSpeed: 0.4,
      capabilities: ['technical', 'confined-space', 'high-angle'],
    });
  }

  // Ambulances
  for (let i = 1; i <= scenario.resources.ambulances; i++) {
    resources.push({
      id: `A-${i}`,
      name: `Ambulance ${i}`,
      type: 'ambulance',
      status: 'available',
      location: getAmbulanceLocation(i, scenario),
      travelSpeed: 0.6, // Faster than fire trucks
      capabilities: ['medical', 'transport'],
    });
  }

  // Ambulance supervisors
  if (scenario.resources.ambulances >= 8) {
    resources.push({
      id: 'SUP-1',
      name: 'Paramedic Supervisor 1',
      type: 'ambulance-supervisor',
      status: 'available',
      location: { x: 7, y: 8 },
      travelSpeed: 0.8,
      capabilities: ['medical', 'command'],
    });
  }

  // Mass casualty unit
  if (scenario.resources.ambulances >= 8) {
    resources.push({
      id: 'MC-1',
      name: 'Mass Casualty Unit 1',
      type: 'ambulance-mass-casualty',
      status: 'available',
      location: { x: 5, y: 10 },
      travelSpeed: 0.4,
      capabilities: ['medical', 'mass-casualty', 'triage'],
    });
  }

  // Police units
  for (let i = 1; i <= scenario.resources.policeUnits; i++) {
    resources.push({
      id: `P-${i}`,
      name: `Police Unit ${i}`,
      type: 'police',
      status: 'available',
      location: getPoliceLocation(i, scenario),
      travelSpeed: 0.8, // Fast response
      capabilities: ['traffic', 'crowd-control', 'security'],
    });
  }

  // Traffic units
  if (scenario.resources.policeUnits >= 6) {
    resources.push({
      id: 'T-1',
      name: 'Traffic Unit 1',
      type: 'police-traffic',
      status: 'available',
      location: { x: 8, y: 10 },
      travelSpeed: 0.9,
      capabilities: ['traffic', 'road-closure'],
    });
    resources.push({
      id: 'T-2',
      name: 'Traffic Unit 2',
      type: 'police-traffic',
      status: 'available',
      location: { x: 6, y: 10 },
      travelSpeed: 0.9,
      capabilities: ['traffic', 'road-closure'],
    });
  }

  return resources;
}

/**
 * Get station location for fire unit (distributed across grid)
 */
function getStationLocation(index: number, scenario: ScenarioDefinition): { x: number; y: number } {
  const stations = [
    { x: 3, y: 10 }, // Station 312 (west)
    { x: 11, y: 10 }, // Station 315 (east)
    { x: 7, y: 5 }, // Station 333 (north)
    { x: 7, y: 14 }, // Station 344 (south)
  ];
  return stations[index % stations.length] || { x: 7, y: 7 };
}

/**
 * Get ambulance starting location
 */
function getAmbulanceLocation(index: number, scenario: ScenarioDefinition): { x: number; y: number } {
  const locations = [
    { x: 5, y: 8 }, // Near Toronto General
    { x: 9, y: 9 }, // Near St. Michael's
    { x: 4, y: 10 }, // West end
    { x: 10, y: 10 }, // East end
    { x: 7, y: 7 }, // Central
    { x: 7, y: 12 }, // Waterfront
    { x: 5, y: 6 }, // North
    { x: 9, y: 12 }, // Southeast
  ];
  return locations[index % locations.length] || { x: 7, y: 7 };
}

/**
 * Get police starting location
 */
function getPoliceLocation(index: number, scenario: ScenarioDefinition): { x: number; y: number } {
  const divisions = [
    { x: 6, y: 8 }, // 52 Division
    { x: 9, y: 10 }, // 51 Division
    { x: 4, y: 11 }, // 14 Division
    { x: 11, y: 7 }, // 55 Division
    { x: 7, y: 5 }, // North
    { x: 7, y: 13 }, // South
  ];
  return divisions[index % divisions.length] || { x: 7, y: 7 };
}

/**
 * Calculate hospital utilization percentage
 */
function calculateHospitalUtilization(hospitals: TorontoHospital[]): number {
  const totalCapacity = hospitals.reduce((sum, h) => sum + h.capacityTotal, 0);
  const totalUsed = hospitals.reduce((sum, h) => sum + h.capacityUsed, 0);
  return totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;
}
