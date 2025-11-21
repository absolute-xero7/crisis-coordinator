// Scenario 1: PATH System Flood & Union Station Emergency
// Downtown Toronto Core - Rush Hour Disaster

import { ScenarioDefinition } from '../types';

export const pathFloodingScenario: ScenarioDefinition = {
  id: 'path-flooding',
  name: 'PATH System Flood & Union Station Emergency',
  description:
    'Water main rupture floods PATH underground system during morning rush hour. 2,000+ commuters trapped underground. Union Station threatened. TTC subway evacuation needed.',
  duration: 75, // 75 minutes
  citySize: { width: 14, height: 14 },
  locationFocus: 'Downtown Toronto Core (Financial District)',

  initialIncidents: [
    {
      id: 'TOR-INC-001',
      type: 'flood',
      location: {
        x: 7,
        y: 10,
        address: 'King St & Bay St (PATH Hub)',
        neighborhood: 'Financial District',
        landmark: 'PATH System Hub',
      },
      severity: 5,
      peopleAffected: 2000,
      details:
        'Water main rupture flooding PATH corridors. 2,000+ commuters trapped underground across 5 connected buildings. Water level rising 15cm/min. Multiple access points compromised. Panic reported.',
      reportedAt: 0, // T+0:00
    },
    {
      id: 'TOR-INC-002',
      type: 'transit',
      location: {
        x: 7,
        y: 11,
        address: 'Union Station',
        landmark: 'Union Station',
      },
      severity: 5,
      peopleAffected: 5000,
      details:
        'Water entering Union Station from PATH connection. TTC subway operations threatened. GO Train platforms flooding. Emergency power systems at risk. Immediate evacuation ordered.',
      reportedAt: 180, // T+3:00
    },
    {
      id: 'TOR-INC-003',
      type: 'flood',
      location: {
        x: 6,
        y: 10,
        address: 'TD Centre Underground Garage',
        landmark: 'TD Centre',
      },
      severity: 4,
      peopleAffected: 30,
      details:
        'Underground parking garage flooding rapidly. 15 vehicles trapped, several with occupants inside. Water reaching vehicle roofs. Elevator shafts flooding.',
      reportedAt: 300, // T+5:00
    },
    {
      id: 'TOR-INC-004',
      type: 'medical',
      location: {
        x: 8,
        y: 10,
        address: 'PATH (York Street section)',
      },
      severity: 4,
      peopleAffected: 1,
      details:
        'Diabetic individual unconscious in flooded PATH corridor. Needs immediate medical attention but water blocking access.',
      reportedAt: 480, // T+8:00
    },
    {
      id: 'TOR-INC-005',
      type: 'infrastructure',
      location: {
        x: 7,
        y: 9,
        address: 'Scotia Plaza',
        landmark: 'Scotia Plaza',
      },
      severity: 3,
      peopleAffected: 500,
      details:
        'Water infiltration causing electrical failures. Emergency lighting only. Elevators non-functional. People trapped between floors.',
      reportedAt: 600, // T+10:00
    },
    {
      id: 'TOR-INC-006',
      type: 'traffic',
      location: {
        x: 8,
        y: 10,
        address: 'King St & Yonge St',
      },
      severity: 3,
      peopleAffected: 0,
      details:
        'Complete gridlock on King Street. Emergency vehicles unable to reach PATH entrances. Streetcars blocked. Estimated 45min delay to scene.',
      reportedAt: 720, // T+12:00
    },
    {
      id: 'TOR-INC-007',
      type: 'transit',
      location: {
        x: 7,
        y: 10,
        address: 'King Station',
        landmark: 'King Station (TTC)',
      },
      severity: 4,
      peopleAffected: 300,
      details:
        'Line 1 train stopped at King Station. Water on tracks. 300 passengers need evacuation through tunnels.',
      reportedAt: 900, // T+15:00
    },
    {
      id: 'TOR-INC-008',
      type: 'hazmat',
      location: {
        x: 7,
        y: 9,
        address: 'Bay St & Wellington St',
      },
      severity: 4,
      peopleAffected: 100,
      details:
        'Natural gas odor reported. Water damage may have compromised gas lines. Area requires immediate evacuation. Explosion risk.',
      reportedAt: 1080, // T+18:00
    },
    {
      id: 'TOR-INC-009',
      type: 'medical',
      location: {
        x: 9,
        y: 9,
        address: "St. Michael's Hospital",
        landmark: "St. Michael's Hospital",
      },
      severity: 3,
      peopleAffected: 0,
      details:
        "St. Michael's reporting 85% capacity. Multiple panic attacks and injuries from PATH evacuation incoming. May need diversion protocols.",
      reportedAt: 1200, // T+20:00
    },
    {
      id: 'TOR-INC-010',
      type: 'flood',
      location: {
        x: 7,
        y: 11,
        address: 'Front St & Bay St',
      },
      severity: 2,
      peopleAffected: 50,
      details:
        'Street-level flooding from overwhelmed storm drains. Pedestrians wading through knee-deep water. No injuries yet but mobility impaired.',
      reportedAt: 1500, // T+25:00
    },
  ],

  scriptedEvents: [
    {
      id: 'evt-electrical-failure',
      triggerTime: 900, // T+15:00
      type: 'spawn_incident',
      payload: {
        id: 'TOR-INC-011',
        type: 'infrastructure',
        location: {
          x: 6,
          y: 9,
          address: 'Electrical Substation - University Ave',
        },
        severity: 4,
        peopleAffected: 1000,
        details:
          'Electrical substation failure expands power outage to 8 city blocks. Traffic lights out. Additional buildings losing power.',
      },
    },
    {
      id: 'evt-secondary-flooding',
      triggerTime: 1800, // T+30:00
      type: 'spawn_incident',
      payload: {
        id: 'TOR-INC-012',
        type: 'flood',
        location: {
          x: 8,
          y: 9,
          address: 'PATH (Yonge Street section)',
        },
        severity: 5,
        peopleAffected: 500,
        details:
          'Secondary PATH section flooding as connected tunnels overflow. Additional 500 people trapped. Water spreading through underground network.',
      },
    },
    {
      id: 'evt-hospital-capacity',
      triggerTime: 2700, // T+45:00
      type: 'hospital_capacity',
      payload: {
        hospitalId: 'toronto-general',
        capacityUsed: 54, // 90%
      },
    },
    {
      id: 'evt-weather-update',
      triggerTime: 3600, // T+60:00
      type: 'weather',
      payload: {
        description: 'Rain stopping, but drainage takes time. Flooding stabilizing but not receding.',
      },
    },
  ],

  resources: {
    fireUnits: 12,
    ambulances: 10,
    policeUnits: 8,
    specialized: ['hazmat', 'water-rescue', 'technical-rescue'],
  },

  hospitals: [
    {
      id: 'toronto-general',
      name: 'Toronto General Hospital',
      address: '200 University Ave',
      location: { x: 5, y: 8 },
      capacityTotal: 60,
      capacityUsed: 30,
      specialties: ['Trauma Level 1', 'Cardiac', 'Stroke'],
    },
    {
      id: 'st-michaels',
      name: "St. Michael's Hospital",
      address: '30 Bond St',
      location: { x: 9, y: 9 },
      capacityTotal: 45,
      capacityUsed: 38, // 85% - already stressed
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
    {
      id: 'sunnybrook',
      name: 'Sunnybrook Health Sciences',
      address: '2075 Bayview Ave',
      location: { x: 12, y: 3 },
      capacityTotal: 55,
      capacityUsed: 25,
      specialties: ['Trauma', 'Burns', 'Critical Care'],
    },
    {
      id: 'north-york-general',
      name: 'North York General',
      address: '4001 Leslie St',
      location: { x: 10, y: 1 },
      capacityTotal: 50,
      capacityUsed: 15,
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
      id: 'yonge-dundas',
      name: 'Yonge-Dundas Square Area',
      address: 'Yonge & Dundas St',
      location: { x: 8, y: 7 },
      capacityTotal: 500,
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
    {
      id: 'harbourfront',
      name: 'Harbourfront Centre',
      address: '235 Queens Quay W',
      location: { x: 7, y: 13 },
      capacityTotal: 800,
      capacityUsed: 0,
    },
  ],

  metadata: {
    createdAt: '2025-01-20T00:00:00Z',
    createdBy: 'CrisisCoordinator Team',
    tags: ['toronto', 'flood', 'underground', 'mass-evacuation', 'transit', 'path-system'],
  },
};
