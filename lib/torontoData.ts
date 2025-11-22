// Toronto Emergency Response Infrastructure
// Real Toronto Hospitals, Shelters, and Geography
// Using real lat/lng coordinates from MapTiler geocoding

import { TorontoHospital, TorontoShelter, GridPosition, GeoPosition } from './types';

// ============================================================================
// TORONTO HOSPITALS (Real Coordinates)
// ============================================================================

export const TORONTO_HOSPITALS: TorontoHospital[] = [
  {
    id: 'toronto-general',
    name: 'Toronto General Hospital',
    address: '200 Elizabeth St',
    location: { lat: 43.6596, lng: -79.3877 },
    capacityTotal: 60,
    capacityUsed: 30,
    specialties: ['Trauma Level 1', 'Cardiac', 'Stroke'],
  },
  {
    id: 'st-michaels',
    name: "St. Michael's Hospital",
    address: '36 Queen St E',
    location: { lat: 43.6538, lng: -79.3776 },
    capacityTotal: 45,
    capacityUsed: 38, // 85% - already stressed
    specialties: ['Trauma Level 1', 'Emergency'],
  },
  {
    id: 'mount-sinai',
    name: 'Mount Sinai Hospital',
    address: '600 University Ave',
    location: { lat: 43.6573, lng: -79.3904 },
    capacityTotal: 40,
    capacityUsed: 20,
    specialties: ['General Emergency'],
  },
  {
    id: 'sunnybrook',
    name: 'Sunnybrook Health Sciences',
    address: '2075 Bayview Ave',
    location: { lat: 43.7242, lng: -79.3768 }, // North of downtown (may be off-map)
    capacityTotal: 55,
    capacityUsed: 25,
    specialties: ['Trauma', 'Burns', 'Critical Care'],
  },
  {
    id: 'north-york-general',
    name: 'North York General',
    address: '4001 Leslie St',
    location: { lat: 43.7679, lng: -79.3647 }, // North of downtown (may be off-map)
    capacityTotal: 50,
    capacityUsed: 15,
    specialties: ['General Emergency'],
  },
];

// ============================================================================
// TORONTO SHELTERS & SAFE ZONES (Real Coordinates)
// ============================================================================

export const TORONTO_SHELTERS: TorontoShelter[] = [
  {
    id: 'metro-convention',
    name: 'Metro Toronto Convention Centre',
    address: '255 Front St W',
    location: { lat: 43.6441, lng: -79.3875 },
    capacityTotal: 2000,
    capacityUsed: 0,
  },
  {
    id: 'yonge-dundas',
    name: 'Yonge-Dundas Square Area',
    address: 'Yonge & Dundas St',
    location: { lat: 43.6561, lng: -79.3802 },
    capacityTotal: 500,
    capacityUsed: 0,
  },
  {
    id: 'nathan-phillips',
    name: 'Nathan Phillips Square',
    address: '100 Queen St W',
    location: { lat: 43.6525, lng: -79.3832 },
    capacityTotal: 1000,
    capacityUsed: 0,
  },
  {
    id: 'harbourfront',
    name: 'Harbourfront Centre',
    address: '235 Queens Quay W',
    location: { lat: 43.6389, lng: -79.3818 },
    capacityTotal: 800,
    capacityUsed: 0,
  },
];

// ============================================================================
// TORONTO GEOGRAPHY - DOWNTOWN CORE (Real Coordinates)
// ============================================================================

export interface TorontoLandmark {
  name: string;
  location: GeoPosition;
  type: 'transit' | 'building' | 'infrastructure' | 'park';
}

export const TORONTO_LANDMARKS: TorontoLandmark[] = [
  // Transit Hubs
  { name: 'Union Station', location: { lat: 43.6453, lng: -79.3806 }, type: 'transit' },
  { name: 'King Station', location: { lat: 43.6492, lng: -79.3782 }, type: 'transit' },
  { name: 'Queen Station', location: { lat: 43.6523, lng: -79.3792 }, type: 'transit' },
  { name: 'Dundas Station', location: { lat: 43.6561, lng: -79.3802 }, type: 'transit' },
  { name: 'St. Andrew Station', location: { lat: 43.6476, lng: -79.3847 }, type: 'transit' },
  { name: 'Osgoode Station', location: { lat: 43.6506, lng: -79.3867 }, type: 'transit' },

  // Major Buildings
  { name: 'TD Centre', location: { lat: 43.6474, lng: -79.3815 }, type: 'building' },
  { name: 'Scotia Plaza', location: { lat: 43.6494, lng: -79.3803 }, type: 'building' },
  { name: 'CN Tower', location: { lat: 43.6426, lng: -79.3871 }, type: 'building' },
  { name: 'City Hall', location: { lat: 43.6534, lng: -79.3843 }, type: 'building' },
  { name: 'Rogers Centre', location: { lat: 43.6414, lng: -79.3894 }, type: 'building' },
  { name: 'Scotiabank Arena', location: { lat: 43.6435, lng: -79.3791 }, type: 'building' },

  // Infrastructure
  { name: 'PATH System Hub (King & Bay)', location: { lat: 43.6486, lng: -79.3817 }, type: 'infrastructure' },
  { name: 'PATH System (York St)', location: { lat: 43.6463, lng: -79.3830 }, type: 'infrastructure' },
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
// TORONTO FIRE SERVICES - STATION LOCATIONS (Real Coordinates)
// ============================================================================

export interface FireStation {
  id: string;
  stationNumber: number;
  location: GeoPosition;
  units: string[]; // ['PT-1', 'AT-1']
}

export const TORONTO_FIRE_STATIONS: FireStation[] = [
  {
    id: 'station-312',
    stationNumber: 312, // 34 Yorkville Ave
    location: { lat: 43.6702, lng: -79.3898 },
    units: ['PT-1', 'AT-1', 'HR-1', 'TR-1'],
  },
  {
    id: 'station-315',
    stationNumber: 315, // 257 Sherbourne St
    location: { lat: 43.6562, lng: -79.3591 },
    units: ['PT-2', 'AT-2'],
  },
  {
    id: 'station-333',
    stationNumber: 333, // 83 Davenport Rd
    location: { lat: 43.6721, lng: -79.3919 },
    units: ['PT-3', 'HZ-1'],
  },
  {
    id: 'station-344',
    stationNumber: 344, // 295 Queens Quay E
    location: { lat: 43.6386, lng: -79.3661 },
    units: ['PT-4'],
  },
  {
    id: 'marine-unit',
    stationNumber: 334, // 2 Rees St (Harbourfront)
    location: { lat: 43.6391, lng: -79.3804 },
    units: ['WR-1', 'WR-2'],
  },
];

// ============================================================================
// TRAVEL TIME ESTIMATES
// ============================================================================

/**
 * Calculate distance between two geo positions using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateGeoDistance(from: GeoPosition, to: GeoPosition): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate travel time between two geo positions
 * @param from Starting position
 * @param to Ending position
 * @returns Estimated travel time in minutes
 */
export function calculateTravelTime(from: GeoPosition, to: GeoPosition): number {
  const distanceKm = calculateGeoDistance(from, to);
  // Average emergency vehicle speed in downtown: ~30 km/h = 0.5 km/min
  const speedKmPerMin = 0.5;
  return Math.ceil(distanceKm / speedKmPerMin);
}

/**
 * Legacy: Calculate travel time between two grid positions
 */
export function calculateTravelTimeGrid(from: GridPosition, to: GridPosition): number {
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
 * Get nearest hospital to a position (using geo coordinates)
 */
export function getNearestHospital(
  position: GeoPosition,
  hospitals: TorontoHospital[] = TORONTO_HOSPITALS
): TorontoHospital {
  let nearest = hospitals[0];
  let minDistance = Infinity;

  for (const hospital of hospitals) {
    const distance = calculateGeoDistance(position, hospital.location);
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
