// Map and Geo Utility Functions

import { GridPosition, GeoPosition } from '../types';

// ============================================================================
// GEO POSITION UTILITIES (Real coordinates)
// ============================================================================

/**
 * Calculate distance between two geo positions using Haversine formula
 * @returns Distance in kilometers
 */
export function geoDistance(a: GeoPosition, b: GeoPosition): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDlat = Math.sin(dLat / 2);
  const sinDlng = Math.sin(dLng / 2);
  const aVal =
    sinDlat * sinDlat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDlng * sinDlng;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

/**
 * Check if two geo positions are approximately equal (within ~10m)
 */
export function positionsEqual(a: GeoPosition, b: GeoPosition): boolean {
  // Within 0.0001 degrees (~11 meters)
  return Math.abs(a.lat - b.lat) < 0.0001 && Math.abs(a.lng - b.lng) < 0.0001;
}

/**
 * Move one step from current position toward target
 * Uses linear interpolation with a fixed step size
 * @param current Current geo position
 * @param target Target geo position
 * @param stepKm Step size in kilometers (default 0.1km = 100m)
 */
export function moveToward(
  current: GeoPosition,
  target: GeoPosition,
  stepKm: number = 0.1
): GeoPosition {
  const distance = geoDistance(current, target);

  // If already close enough, snap to target
  if (distance < stepKm) {
    return { lat: target.lat, lng: target.lng };
  }

  // Calculate the ratio of step to total distance
  const ratio = stepKm / distance;

  // Linear interpolation
  return {
    lat: current.lat + (target.lat - current.lat) * ratio,
    lng: current.lng + (target.lng - current.lng) * ratio,
  };
}

/**
 * Calculate travel time between two positions
 * @param a Starting position
 * @param b Ending position
 * @param speedKmPerMin Speed in km/min (default 0.5 = 30 km/h for emergency vehicles)
 */
export function travelTime(
  a: GeoPosition,
  b: GeoPosition,
  speedKmPerMin: number = 0.5
): number {
  const distance = geoDistance(a, b);
  return Math.ceil(distance / speedKmPerMin);
}

// ============================================================================
// BOUNDS CHECKING
// ============================================================================

// Downtown Toronto bounds
const DOWNTOWN_BOUNDS = {
  west: -79.42,
  east: -79.34,
  north: 43.68,
  south: 43.63,
};

/**
 * Check if a geo position is within downtown Toronto bounds
 */
export function isWithinDowntownBounds(pos: GeoPosition): boolean {
  return (
    pos.lng >= DOWNTOWN_BOUNDS.west &&
    pos.lng <= DOWNTOWN_BOUNDS.east &&
    pos.lat >= DOWNTOWN_BOUNDS.south &&
    pos.lat <= DOWNTOWN_BOUNDS.north
  );
}

// ============================================================================
// LEGACY GRID UTILITIES (for backwards compatibility)
// ============================================================================

/**
 * Calculate Manhattan distance between two grid positions
 */
export function manhattanDistance(a: GridPosition, b: GridPosition): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

/**
 * Calculate Euclidean distance between two grid positions
 */
export function euclideanDistance(a: GridPosition, b: GridPosition): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two grid positions are the same
 */
export function gridPositionsEqual(a: GridPosition, b: GridPosition): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Check if grid position is within bounds
 */
export function isWithinBounds(
  position: GridPosition,
  width: number,
  height: number
): boolean {
  return position.x >= 0 && position.x < width && position.y >= 0 && position.y < height;
}

/**
 * Get neighboring cells (4-directional)
 */
export function getNeighbors(position: GridPosition): GridPosition[] {
  return [
    { x: position.x, y: position.y - 1 }, // North
    { x: position.x + 1, y: position.y }, // East
    { x: position.x, y: position.y + 1 }, // South
    { x: position.x - 1, y: position.y }, // West
  ];
}

/**
 * Legacy: Move one step from current grid position toward target
 */
export function moveTowardGrid(current: GridPosition, target: GridPosition): GridPosition {
  const next = { ...current };

  // Move horizontally first if needed
  if (current.x < target.x) {
    next.x++;
  } else if (current.x > target.x) {
    next.x--;
  }
  // Then vertically
  else if (current.y < target.y) {
    next.y++;
  } else if (current.y > target.y) {
    next.y--;
  }

  return next;
}

/**
 * Generate random grid position within bounds
 */
export function randomPosition(width: number, height: number): GridPosition {
  return {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
  };
}

/**
 * Generate random geo position within downtown bounds
 */
export function randomGeoPosition(): GeoPosition {
  return {
    lat: DOWNTOWN_BOUNDS.south + Math.random() * (DOWNTOWN_BOUNDS.north - DOWNTOWN_BOUNDS.south),
    lng: DOWNTOWN_BOUNDS.west + Math.random() * (DOWNTOWN_BOUNDS.east - DOWNTOWN_BOUNDS.west),
  };
}
