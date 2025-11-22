import { ScenarioDefinition, IncidentType, TorontoLocation } from '@/lib/types';
import { TORONTO_HOSPITALS, TORONTO_SHELTERS } from '@/lib/torontoData';

const INCIDENT_TYPES: IncidentType[] = [
  'fire',
  'medical',
  'traffic',
  'flood',
  'hazmat',
  'infrastructure',
  'mass-casualty',
  'transit',
];

// Default coordinates for new incidents (City Hall area)
const DEFAULT_LOCATION: TorontoLocation = {
  lat: 43.6534,
  lng: -79.3843,
  address: 'City Hall Area',
  neighborhood: 'Downtown',
};

export const DEFAULT_SCENARIO_DRAFT: ScenarioDefinition = {
  id: 'toronto-path-training',
  name: 'Training Exercise - PATH Flooding',
  description:
    'Water main rupture at King & Bay floods PATH corridors. Use this template to create your own downtown drills.',
  duration: 75,
  citySize: { width: 14, height: 14 },
  locationFocus: 'Downtown Toronto Core',
  initialIncidents: [
    {
      id: 'TOR-INC-CUSTOM-001',
      type: 'flood',
      location: {
        lat: 43.6486,
        lng: -79.3817,
        address: 'PATH Hub - King & Bay',
        neighborhood: 'Financial District',
      },
      severity: 5,
      peopleAffected: 1500,
      details: 'PATH concourse flooding. Evacuation routes compromised; commuters trapped underground.',
      reportedAt: 0,
    },
  ],
  scriptedEvents: [],
  resources: {
    fireUnits: 6,
    ambulances: 4,
    policeUnits: 4,
    specialized: ['water-rescue', 'hazmat'],
  },
  hospitals: TORONTO_HOSPITALS.map((hospital) => ({
    ...hospital,
  })),
  shelters: TORONTO_SHELTERS.map((shelter) => ({
    ...shelter,
  })),
  metadata: {
    createdAt: new Date().toISOString(),
    createdBy: 'Scenario Builder',
    tags: ['toronto', 'custom'],
  },
};

export const INCIDENT_TYPE_OPTIONS = INCIDENT_TYPES.map((type) => ({
  label: type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: type,
}));

export const SPECIALIZED_UNITS = [
  { id: 'hazmat', label: 'Hazmat' },
  { id: 'heavy-rescue', label: 'Heavy Rescue' },
  { id: 'water-rescue', label: 'Water Rescue' },
  { id: 'technical-rescue', label: 'Technical Rescue' },
  { id: 'mass-casualty', label: 'Mass Casualty' },
];

export function createIncidentTemplate(index: number) {
  // Spread incidents around downtown Toronto for variety
  const locations: TorontoLocation[] = [
    { lat: 43.6534, lng: -79.3843, address: 'City Hall Area', neighborhood: 'Downtown' },
    { lat: 43.6486, lng: -79.3817, address: 'King & Bay', neighborhood: 'Financial District' },
    { lat: 43.6453, lng: -79.3806, address: 'Union Station', neighborhood: 'Financial District' },
    { lat: 43.6561, lng: -79.3802, address: 'Yonge-Dundas Square', neighborhood: 'Downtown' },
    { lat: 43.6474, lng: -79.3815, address: 'TD Centre', neighborhood: 'Financial District' },
    { lat: 43.6426, lng: -79.3871, address: 'CN Tower Area', neighborhood: 'Entertainment District' },
  ];

  return {
    id: `TOR-INC-CUSTOM-${(index + 1).toString().padStart(3, '0')}`,
    type: 'medical' as IncidentType,
    location: locations[index % locations.length],
    severity: 3 as const,
    peopleAffected: 50,
    details: 'Describe the incident details, access challenges, and Toronto landmarks nearby.',
    reportedAt: index * 120,
  };
}

export function createScriptedEventTemplate(index: number) {
  return {
    id: `evt-${index + 1}`,
    triggerTime: (index + 1) * 600,
    type: 'spawn_incident' as const,
    payload: {
      id: `TOR-INC-CUSTOM-${(index + 2).toString().padStart(3, '0')}`,
      type: 'fire',
      location: {
        lat: 43.6523,
        lng: -79.3792,
        address: 'Custom Location',
        neighborhood: 'Downtown',
      },
      severity: 3,
      peopleAffected: 100,
      details: 'Follow-on incident details.',
    },
  };
}
