// Toronto Emergency Response Infrastructure
// Real Toronto Hospitals, Shelters, and Geography

import { TorontoHospital, TorontoShelter, GridPosition } from './types';

// ============================================================================
// TORONTO HOSPITALS (Real Data)
// ============================================================================

export const TORONTO_HOSPITALS: TorontoHospital[] = [
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
];

// ============================================================================
// TORONTO SHELTERS & SAFE ZONES
// ============================================================================

export const TORONTO_SHELTERS: TorontoShelter[] = [
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
];

// ============================================================================
// TORONTO GEOGRAPHY - DOWNTOWN CORE
// ============================================================================

export interface TorontoLandmark {
  name: string;
  location: GridPosition;
  type: 'transit' | 'building' | 'infrastructure' | 'park';
}

export const TORONTO_LANDMARKS: TorontoLandmark[] = [
  // Transit Hubs
  { name: 'Union Station', location: { x: 7, y: 11 }, type: 'transit' },
  { name: 'King Station', location: { x: 7, y: 10 }, type: 'transit' },
  { name: 'Queen Station', location: { x: 8, y: 8 }, type: 'transit' },
  { name: 'Dundas Station', location: { x: 8, y: 7 }, type: 'transit' },

  // Major Buildings
  { name: 'TD Centre', location: { x: 6, y: 10 }, type: 'building' },
  { name: 'Scotia Plaza', location: { x: 7, y: 9 }, type: 'building' },
  { name: 'CN Tower', location: { x: 6, y: 11 }, type: 'building' },
  { name: 'City Hall', location: { x: 6, y: 8 }, type: 'building' },

  // Infrastructure
  { name: 'PATH System Hub (King & Bay)', location: { x: 7, y: 10 }, type: 'infrastructure' },
  { name: 'PATH System (York St)', location: { x: 8, y: 10 }, type: 'infrastructure' },
];

// ============================================================================
// TORONTO STREETS (For Labels)
// ============================================================================

export interface TorontoStreet {
  name: string;
  gridLine: number;
  orientation: 'horizontal' | 'vertical';
}

export const TORONTO_STREETS: TorontoStreet[] = [
  // Major East-West Streets
  { name: 'Bloor St', gridLine: 4, orientation: 'horizontal' },
  { name: 'College St', gridLine: 6, orientation: 'horizontal' },
  { name: 'Dundas St', gridLine: 7, orientation: 'horizontal' },
  { name: 'Queen St', gridLine: 8, orientation: 'horizontal' },
  { name: 'King St', gridLine: 10, orientation: 'horizontal' },
  { name: 'Front St', gridLine: 11, orientation: 'horizontal' },
  { name: 'Queens Quay', gridLine: 13, orientation: 'horizontal' },

  // Major North-South Streets
  { name: 'Spadina Ave', gridLine: 3, orientation: 'vertical' },
  { name: 'University Ave', gridLine: 5, orientation: 'vertical' },
  { name: 'Bay St', gridLine: 7, orientation: 'vertical' },
  { name: 'Yonge St', gridLine: 8, orientation: 'vertical' },
  { name: 'Church St', gridLine: 9, orientation: 'vertical' },
  { name: 'Jarvis St', gridLine: 10, orientation: 'vertical' },
];

// ============================================================================
// TORONTO NEIGHBORHOODS
// ============================================================================

export interface TorontoNeighborhood {
  name: string;
  bounds: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
}

export const TORONTO_NEIGHBORHOODS: TorontoNeighborhood[] = [
  {
    name: 'Financial District',
    bounds: { xMin: 6, xMax: 9, yMin: 9, yMax: 11 },
  },
  {
    name: 'Entertainment District',
    bounds: { xMin: 4, xMax: 7, yMin: 8, yMax: 10 },
  },
  {
    name: 'Harbourfront',
    bounds: { xMin: 5, xMax: 9, yMin: 12, yMax: 14 },
  },
  {
    name: 'The Annex',
    bounds: { xMin: 3, xMax: 6, yMin: 4, yMax: 6 },
  },
];

// ============================================================================
// TORONTO FIRE SERVICES - STATION LOCATIONS
// ============================================================================

export interface FireStation {
  id: string;
  stationNumber: number;
  location: GridPosition;
  units: string[]; // ['PT-1', 'AT-1']
}

export const TORONTO_FIRE_STATIONS: FireStation[] = [
  {
    id: 'station-312',
    stationNumber: 312,
    location: { x: 3, y: 10 },
    units: ['PT-1', 'AT-1', 'HR-1', 'TR-1'],
  },
  {
    id: 'station-315',
    stationNumber: 315,
    location: { x: 11, y: 10 },
    units: ['PT-2', 'AT-2'],
  },
  {
    id: 'station-333',
    stationNumber: 333,
    location: { x: 7, y: 5 },
    units: ['PT-3', 'HZ-1'],
  },
  {
    id: 'station-344',
    stationNumber: 344,
    location: { x: 7, y: 14 },
    units: ['PT-4'],
  },
  {
    id: 'marine-unit',
    stationNumber: 334,
    location: { x: 7, y: 12 },
    units: ['WR-1', 'WR-2'],
  },
];

// ============================================================================
// TRAVEL TIME ESTIMATES
// ============================================================================

/**
 * Calculate travel time between two grid positions
 * @param from Starting position
 * @param to Ending position
 * @returns Estimated travel time in minutes
 */
export function calculateTravelTime(from: GridPosition, to: GridPosition): number {
  const distance = Math.abs(to.x - from.x) + Math.abs(to.y - from.y); // Manhattan distance
  const baseSpeed = 0.5; // Grid cells per minute (conservative for emergency vehicles)
  return Math.ceil(distance / baseSpeed);
}

/**
 * Get neighborhood name for a given position
 */
export function getNeighborhood(position: GridPosition): string | null {
  for (const neighborhood of TORONTO_NEIGHBORHOODS) {
    const { xMin, xMax, yMin, yMax } = neighborhood.bounds;
    if (
      position.x >= xMin &&
      position.x <= xMax &&
      position.y >= yMin &&
      position.y <= yMax
    ) {
      return neighborhood.name;
    }
  }
  return null;
}

/**
 * Get nearest hospital to a position
 */
export function getNearestHospital(
  position: GridPosition,
  hospitals: TorontoHospital[] = TORONTO_HOSPITALS
): TorontoHospital {
  let nearest = hospitals[0];
  let minDistance = Infinity;

  for (const hospital of hospitals) {
    const distance =
      Math.abs(hospital.location.x - position.x) +
      Math.abs(hospital.location.y - position.y);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = hospital;
    }
  }

  return nearest;
}

/**
 * Get street name for a position (if on a major street)
 */
export function getStreetName(position: GridPosition): string | null {
  for (const street of TORONTO_STREETS) {
    if (street.orientation === 'horizontal' && position.y === street.gridLine) {
      return street.name;
    }
    if (street.orientation === 'vertical' && position.x === street.gridLine) {
      return street.name;
    }
  }
  return null;
}
