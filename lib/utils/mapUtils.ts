// Map and Grid Utility Functions

import { GridPosition } from '../types';

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
 * Check if two positions are the same
 */
export function positionsEqual(a: GridPosition, b: GridPosition): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Check if position is within grid bounds
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
 * Move one step from current position toward target
 * Simple greedy algorithm for resource movement
 */
export function moveToward(current: GridPosition, target: GridPosition): GridPosition {
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
 * Generate random position within bounds
 */
export function randomPosition(width: number, height: number): GridPosition {
  return {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
  };
}
