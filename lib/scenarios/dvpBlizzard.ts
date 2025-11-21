// Scenario 2: DVP Winter Blizzard + Multi-Vehicle Pileup
// Don Valley Parkway & Eastern Toronto - Evening Rush Hour

import { ScenarioDefinition } from '../types';

export const dvpBlizzardScenario: ScenarioDefinition = {
  id: 'dvp-blizzard',
  name: 'DVP Winter Blizzard + Multi-Vehicle Pileup',
  description:
    'Severe winter storm hits Toronto during evening rush hour. 40-vehicle pileup on DVP. Multiple cold weather emergencies. Hospital overload. Time-critical due to -25°C wind chill.',
  duration: 90, // 90 minutes
  citySize: { width: 16, height: 16 },
  locationFocus: 'Don Valley Parkway Corridor & Eastern Toronto',

  initialIncidents: [
    {
      id: 'TOR-INC-101',
      type: 'mass-casualty',
      location: {
        x: 8,
        y: 8,
        address: 'DVP at Don Mills Road',
        landmark: 'Don Valley Parkway',
      },
      severity: 5,
      peopleAffected: 80,
      details:
        '40-vehicle chain reaction collision in whiteout conditions. Multiple entrapments. Confirmed serious injuries. Highway completely blocked. Temperature -15°C with wind chill -25°C. Hypothermia risk.',
      reportedAt: 0,
    },
    {
      id: 'TOR-INC-102',
      type: 'hazmat',
      location: {
        x: 8,
        y: 6,
        address: 'DVP at Eglinton Ave',
      },
      severity: 4,
      peopleAffected: 2,
      details:
        'Transport truck jackknifed, blocking all southbound lanes. Diesel fuel leak. Driver injured. Additional vehicles sliding into scene.',
      reportedAt: 300,
    },
    {
      id: 'TOR-INC-103',
      type: 'transit',
      location: {
        x: 10,
        y: 4,
        address: 'Don Mills Rd & Sheppard Ave',
      },
      severity: 3,
      peopleAffected: 35,
      details:
        'TTC bus stuck in snowdrift. Heat failing. 35 passengers including 3 elderly and 1 infant. Hypothermia concern in 30-45 minutes.',
      reportedAt: 480,
    },
    {
      id: 'TOR-INC-104',
      type: 'infrastructure',
      location: {
        x: 7,
        y: 7,
        address: 'Thorncliffe Park apartment tower',
        neighborhood: 'Thorncliffe Park',
      },
      severity: 4,
      peopleAffected: 300,
      details:
        '20-story tower lost power. No heat. Elderly residents in high-rise apartments. Temperature inside dropping. Elevators non-functional.',
      reportedAt: 720,
    },
    {
      id: 'TOR-INC-105',
      type: 'medical',
      location: {
        x: 6,
        y: 8,
        address: 'Leaside neighborhood',
        neighborhood: 'Leaside',
      },
      severity: 4,
      peopleAffected: 1,
      details:
        'Cardiac arrest, requires immediate transport. Nearest ambulance 15min away due to storm. Patient critical. Every minute counts.',
      reportedAt: 900,
    },
    {
      id: 'TOR-INC-106',
      type: 'traffic',
      location: {
        x: 5,
        y: 9,
        address: "O'Connor Dr & St. Clair Ave",
      },
      severity: 4,
      peopleAffected: 1,
      details:
        'Pedestrian hit by vehicle sliding on ice. Unconscious, head trauma. Low visibility made it impossible to see. Needs trauma center.',
      reportedAt: 1080,
    },
    {
      id: 'TOR-INC-107',
      type: 'flood',
      location: {
        x: 8,
        y: 10,
        address: 'DVP near Pottery Road',
      },
      severity: 3,
      peopleAffected: 3,
      details:
        'Vehicle slid off DVP into ravine. 30-foot drop. 3 occupants trapped. Access difficult due to terrain and snow. Technical rescue required.',
      reportedAt: 1320,
    },
    {
      id: 'TOR-INC-108',
      type: 'infrastructure',
      location: {
        x: 3,
        y: 10,
        address: 'Downtown shelter',
      },
      severity: 3,
      peopleAffected: 150,
      details:
        'Shelter at 150% capacity. 50+ people outside in -25°C wind chill. Frostbite and hypothermia imminent. Need additional shelter space.',
      reportedAt: 1500,
    },
    {
      id: 'TOR-INC-109',
      type: 'fire',
      location: {
        x: 9,
        y: 9,
        address: 'East York residential',
        neighborhood: 'East York',
      },
      severity: 4,
      peopleAffected: 5,
      details:
        'Power outage led to candle use. House fire. Family trapped on second floor. Extreme cold complicates firefighting (water freezes). Hydrants may be frozen.',
      reportedAt: 1680,
    },
    {
      id: 'TOR-INC-110',
      type: 'hazmat',
      location: {
        x: 12,
        y: 10,
        address: 'Scarborough home',
        neighborhood: 'Scarborough',
      },
      severity: 4,
      peopleAffected: 4,
      details:
        'Family running generator indoors due to power outage. CO poisoning. Multiple unconscious. Need immediate evacuation and hyperbaric treatment.',
      reportedAt: 1800,
    },
    {
      id: 'TOR-INC-111',
      type: 'medical',
      location: {
        x: 10,
        y: 3,
        address: 'Sunnybrook Hospital',
        landmark: 'Sunnybrook Health Sciences',
      },
      severity: 3,
      peopleAffected: 0,
      details:
        'Sunnybrook on diversion. 95% capacity. Multiple trauma and hypothermia cases. Requesting ambulances route elsewhere.',
      reportedAt: 2100,
    },
    {
      id: 'TOR-INC-112',
      type: 'infrastructure',
      location: {
        x: 11,
        y: 8,
        address: 'Victoria Park Ave',
      },
      severity: 2,
      peopleAffected: 3,
      details:
        'Toronto Hydro crew repairing power lines. Bucket truck stuck in snow. Workers need rescue but low priority compared to life threats.',
      reportedAt: 2400,
    },
  ],

  scriptedEvents: [
    {
      id: 'evt-gardiner-pileup',
      triggerTime: 1200, // T+20:00
      type: 'spawn_incident',
      payload: {
        id: 'TOR-INC-113',
        type: 'mass-casualty',
        location: {
          x: 4,
          y: 12,
          address: 'Gardiner Expressway at Spadina',
          landmark: 'Gardiner Expressway',
        },
        severity: 4,
        peopleAffected: 50,
        details:
          'Second major pileup on Gardiner Expressway. 25-vehicle collision. Multiple injuries. Emergency services already stretched thin.',
      },
    },
    {
      id: 'evt-power-outage',
      triggerTime: 2400, // T+40:00
      type: 'weather',
      payload: {
        description: 'Power outage expands, affecting 15,000 homes across East York and Scarborough. Multiple cold-related emergency calls spiking.',
      },
    },
    {
      id: 'evt-hospital-full',
      triggerTime: 3600, // T+60:00
      type: 'hospital_capacity',
      payload: {
        hospitalId: 'toronto-general',
        capacityUsed: 54, // 90%
      },
    },
    {
      id: 'evt-dvp-clearing',
      triggerTime: 4500, // T+75:00
      type: 'weather',
      payload: {
        description: 'Snow plows clearing DVP, but slowly. Access improving but still difficult. Estimated 30 minutes to full clearance.',
      },
    },
  ],

  resources: {
    fireUnits: 14,
    ambulances: 12,
    policeUnits: 10,
    specialized: ['hazmat', 'heavy-rescue', 'technical-rescue'],
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
      capacityUsed: 36, // 80%
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
      capacityUsed: 52, // 95% - on diversion!
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
      id: 'community-center-1',
      name: 'East York Community Centre',
      address: '1081 Pape Ave',
      location: { x: 9, y: 10 },
      capacityTotal: 200,
      capacityUsed: 0,
    },
    {
      id: 'community-center-2',
      name: 'Thorncliffe Park Community Centre',
      address: '45 Overlea Blvd',
      location: { x: 7, y: 6 },
      capacityTotal: 300,
      capacityUsed: 0,
    },
    {
      id: 'community-center-3',
      name: 'Scarborough Civic Centre',
      address: '150 Borough Dr',
      location: { x: 13, y: 9 },
      capacityTotal: 500,
      capacityUsed: 0,
    },
    {
      id: 'metro-convention',
      name: 'Metro Toronto Convention Centre',
      address: '255 Front St W',
      location: { x: 6, y: 12 },
      capacityTotal: 2000,
      capacityUsed: 0,
    },
  ],

  metadata: {
    createdAt: '2025-01-20T00:00:00Z',
    createdBy: 'CrisisCoordinator Team',
    tags: ['toronto', 'winter', 'blizzard', 'dvp', 'mass-casualty', 'cold-weather', 'hypothermia'],
  },
};
