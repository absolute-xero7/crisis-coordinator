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
  GeoPosition,
} from '../types';
import { TORONTO_HOSPITALS, TORONTO_SHELTERS, TORONTO_FIRE_STATIONS } from '../torontoData';

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

// ============================================================================
// REAL TORONTO STATION LOCATIONS (GeoPosition)
// ============================================================================

const FIRE_STATION_LOCATIONS: GeoPosition[] = [
  { lat: 43.6702, lng: -79.3898 }, // Station 312 - Yorkville
  { lat: 43.6562, lng: -79.3591 }, // Station 315 - Sherbourne
  { lat: 43.6721, lng: -79.3919 }, // Station 333 - Davenport
  { lat: 43.6386, lng: -79.3661 }, // Station 344 - Queens Quay E
  { lat: 43.6391, lng: -79.3804 }, // Marine Unit - Harbourfront
];

const AMBULANCE_BASE_LOCATIONS: GeoPosition[] = [
  { lat: 43.6596, lng: -79.3877 }, // Near Toronto General
  { lat: 43.6538, lng: -79.3776 }, // Near St. Michael's
  { lat: 43.6474, lng: -79.4015 }, // West end (Spadina)
  { lat: 43.6562, lng: -79.3591 }, // East end (Sherbourne)
  { lat: 43.6534, lng: -79.3843 }, // Central (City Hall)
  { lat: 43.6441, lng: -79.3875 }, // Waterfront (Convention Centre)
  { lat: 43.6573, lng: -79.3904 }, // Near Mount Sinai
  { lat: 43.6453, lng: -79.3706 }, // Southeast (Jarvis)
];

const POLICE_DIVISION_LOCATIONS: GeoPosition[] = [
  { lat: 43.6525, lng: -79.3832 }, // 52 Division - University/Dundas
  { lat: 43.6538, lng: -79.3676 }, // 51 Division - Parliament
  { lat: 43.6441, lng: -79.3975 }, // 14 Division - Bathurst
  { lat: 43.6672, lng: -79.3598 }, // 55 Division - Coxwell
  { lat: 43.6621, lng: -79.3869 }, // North area
  { lat: 43.6389, lng: -79.3818 }, // South area - Harbourfront
];

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
      location: getStationLocation(i),
      travelSpeed: 0.5, // km per 10 seconds
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
      location: getStationLocation(i),
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
      location: getStationLocation(i),
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
      location: { lat: 43.6721, lng: -79.3919 }, // Station 333
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
      location: { lat: 43.6391, lng: -79.3804 }, // Marine Unit
      travelSpeed: 0.3,
      capabilities: ['water', 'marine', 'dive'],
      station: 'TFS Marine Unit',
    });
    resources.push({
      id: 'WR-2',
      name: 'Water Rescue 2',
      type: 'fire-water-rescue',
      status: 'available',
      location: { lat: 43.6391, lng: -79.3804 }, // Marine Unit
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
      location: { lat: 43.6702, lng: -79.3898 }, // Station 312
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
      location: getAmbulanceLocation(i),
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
      location: { lat: 43.6534, lng: -79.3843 }, // Central
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
      location: { lat: 43.6474, lng: -79.3815 }, // Near TD Centre
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
      location: getPoliceLocation(i),
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
      location: { lat: 43.6492, lng: -79.3782 }, // King Station area
      travelSpeed: 0.9,
      capabilities: ['traffic', 'road-closure'],
    });
    resources.push({
      id: 'T-2',
      name: 'Traffic Unit 2',
      type: 'police-traffic',
      status: 'available',
      location: { lat: 43.6474, lng: -79.3815 }, // TD Centre area
      travelSpeed: 0.9,
      capabilities: ['traffic', 'road-closure'],
    });
  }

  return resources;
}

/**
 * Get station location for fire unit (distributed across stations)
 */
function getStationLocation(index: number): GeoPosition {
  return FIRE_STATION_LOCATIONS[index % FIRE_STATION_LOCATIONS.length];
}

/**
 * Get ambulance starting location
 */
function getAmbulanceLocation(index: number): GeoPosition {
  return AMBULANCE_BASE_LOCATIONS[index % AMBULANCE_BASE_LOCATIONS.length];
}

/**
 * Get police starting location
 */
function getPoliceLocation(index: number): GeoPosition {
  return POLICE_DIVISION_LOCATIONS[index % POLICE_DIVISION_LOCATIONS.length];
}

/**
 * Calculate hospital utilization percentage
 */
function calculateHospitalUtilization(hospitals: TorontoHospital[]): number {
  const totalCapacity = hospitals.reduce((sum, h) => sum + h.capacityTotal, 0);
  const totalUsed = hospitals.reduce((sum, h) => sum + h.capacityUsed, 0);
  return totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;
}
