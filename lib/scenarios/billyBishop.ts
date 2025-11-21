// Scenario 3: Billy Bishop Airport Incident + Waterfront Emergency
// Toronto Waterfront - Summer Afternoon

import { ScenarioDefinition } from '../types';

export const billyBishopScenario: ScenarioDefinition = {
  id: 'billy-bishop-airport',
  name: 'Billy Bishop Airport Incident + Waterfront Emergency',
  description:
    'Small aircraft crash into Lake Ontario near Billy Bishop Airport. Multiple vessel collision during rescue. Fuel fire on water. Mass waterfront evacuation. Marine rescue coordination.',
  duration: 60, // 60 minutes
  citySize: { width: 14, height: 14 },
  locationFocus: 'Toronto Waterfront (Billy Bishop to Harbourfront)',

  initialIncidents: [
    {
      id: 'TOR-INC-201',
      type: 'mass-casualty',
      location: {
        x: 5,
        y: 13,
        address: 'Lake Ontario, 200m offshore from Billy Bishop Airport',
        landmark: 'Billy Bishop Airport',
      },
      severity: 5,
      peopleAffected: 3,
      details:
        'Small aircraft (Cessna) crashed into Lake Ontario during emergency landing attempt. 3 passengers in water. Aircraft sinking. Fuel leaking. Water temperature 12°C - hypothermia in 30-45 minutes.',
      reportedAt: 0,
    },
    {
      id: 'TOR-INC-202',
      type: 'traffic',
      location: {
        x: 6,
        y: 13,
        address: 'Lake Ontario, near Toronto Island Ferry Terminal',
      },
      severity: 4,
      peopleAffected: 5,
      details:
        'Two recreational boats collided while responding to aircraft crash. 5 people injured, 2 in water. One vessel taking on water.',
      reportedAt: 300,
    },
    {
      id: 'TOR-INC-203',
      type: 'fire',
      location: {
        x: 5,
        y: 13,
        address: 'Lake Ontario surface',
      },
      severity: 4,
      peopleAffected: 0,
      details:
        'Aviation fuel from crash ignited on water surface. Fuel slick fire spreading. Wind pushing toward shore. Toxic smoke.',
      reportedAt: 480,
    },
    {
      id: 'TOR-INC-204',
      type: 'mass-casualty',
      location: {
        x: 7,
        y: 12,
        address: 'Harbourfront Centre',
        landmark: 'Harbourfront Centre',
      },
      severity: 3,
      peopleAffected: 5000,
      details:
        'Mass evacuation of Harbourfront area due to fuel fire smoke. Summer festival in progress - 5,000+ people. Panic and crowding. Several minor injuries from stampede.',
      reportedAt: 600,
    },
    {
      id: 'TOR-INC-205',
      type: 'medical',
      location: {
        x: 7,
        y: 13,
        address: 'Queens Quay W',
      },
      severity: 4,
      peopleAffected: 1,
      details:
        'Suspected spinal injury from boat collision. Patient in water, needs specialized rescue and immobilization. Cannot move without spinal board.',
      reportedAt: 720,
    },
    {
      id: 'TOR-INC-206',
      type: 'traffic',
      location: {
        x: 6,
        y: 11,
        address: 'Lakeshore Blvd & York St',
      },
      severity: 3,
      peopleAffected: 0,
      details:
        'Traffic gridlock blocking ambulance access to waterfront. Evacuating crowds blocking streets. Emergency vehicles delayed 20+ minutes.',
      reportedAt: 900,
    },
    {
      id: 'TOR-INC-207',
      type: 'medical',
      location: {
        x: 5,
        y: 13,
        address: 'Water rescue zone',
      },
      severity: 4,
      peopleAffected: 2,
      details:
        'Two aircraft passengers rescued from water. Severe hypothermia (core temp 32°C). Need immediate warming and hospital transport. Time-critical.',
      reportedAt: 1080,
    },
    {
      id: 'TOR-INC-208',
      type: 'hazmat',
      location: {
        x: 6,
        y: 12,
        address: 'Toronto Island Ferry Dock',
      },
      severity: 3,
      peopleAffected: 50,
      details:
        'Aviation fuel contamination at ferry dock. Passengers complaining of respiratory issues. Dock evacuation ordered. Environmental hazard.',
      reportedAt: 1200,
    },
  ],

  scriptedEvents: [
    {
      id: 'evt-fuel-contained',
      triggerTime: 1500, // T+25:00
      type: 'weather',
      payload: {
        description: 'TFS Marine Unit successfully contains fuel fire. Smoke dissipating. Waterfront evacuation can begin lifting.',
      },
    },
    {
      id: 'evt-airport-operations',
      triggerTime: 1800, // T+30:00
      type: 'weather',
      payload: {
        description: 'Billy Bishop Airport operations suspended. All flights diverted to Pearson. Airport assisting with emergency response coordination.',
      },
    },
    {
      id: 'evt-coast-guard',
      triggerTime: 2400, // T+40:00
      type: 'weather',
      payload: {
        description: 'Canadian Coast Guard arrives on scene. Additional marine rescue capacity. Taking over fuel containment operations.',
      },
    },
  ],

  resources: {
    fireUnits: 10,
    ambulances: 10,
    policeUnits: 8,
    specialized: ['water-rescue', 'hazmat'],
  },

  hospitals: [
    {
      id: 'toronto-general',
      name: 'Toronto General Hospital',
      address: '200 University Ave',
      location: { x: 5, y: 8 },
      capacityTotal: 60,
      capacityUsed: 35,
      specialties: ['Trauma Level 1', 'Cardiac', 'Stroke'],
    },
    {
      id: 'st-michaels',
      name: "St. Michael's Hospital",
      address: '30 Bond St',
      location: { x: 9, y: 9 },
      capacityTotal: 45,
      capacityUsed: 30,
      specialties: ['Trauma Level 1', 'Emergency'],
    },
    {
      id: 'mount-sinai',
      name: 'Mount Sinai Hospital',
      address: '600 University Ave',
      location: { x: 5, y: 7 },
      capacityTotal: 40,
      capacityUsed: 20,
      specialties: ['General Emergency'],
    },
  ],

  shelters: [
    {
      id: 'metro-convention',
      name: 'Metro Toronto Convention Centre',
      address: '255 Front St W',
      location: { x: 6, y: 12 },
      capacityTotal: 2000,
      capacityUsed: 0,
    },
    {
      id: 'nathan-phillips',
      name: 'Nathan Phillips Square',
      address: '100 Queen St W',
      location: { x: 6, y: 8 },
      capacityTotal: 1000,
      capacityUsed: 0,
    },
  ],

  metadata: {
    createdAt: '2025-01-20T00:00:00Z',
    createdBy: 'CrisisCoordinator Team',
    tags: ['toronto', 'waterfront', 'aviation', 'marine', 'hazmat', 'mass-evacuation'],
  },
};
