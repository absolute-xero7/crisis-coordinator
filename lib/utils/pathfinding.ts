// A* Pathfinding Algorithm for Emergency Vehicle Routing

import { GridPosition } from '../types';
import { manhattanDistance, getNeighbors, isWithinBounds, positionsEqual } from './mapUtils';

interface PathNode {
  position: GridPosition;
  g: number; // Cost from start
  h: number; // Heuristic to goal
  f: number; // Total cost
  parent: PathNode | null;
}

/**
 * A* pathfinding algorithm
 * Returns array of positions from start to goal
 */
export function findPath(
  start: GridPosition,
  goal: GridPosition,
  gridWidth: number,
  gridHeight: number,
  obstacles: GridPosition[] = []
): GridPosition[] {
  // Quick check if already at goal
  if (positionsEqual(start, goal)) {
    return [start];
  }

  const openList: PathNode[] = [];
  const closedSet = new Set<string>();

  // Helper to convert position to string key
  const posKey = (pos: GridPosition) => `${pos.x},${pos.y}`;

  // Initialize start node
  const startNode: PathNode = {
    position: start,
    g: 0,
    h: manhattanDistance(start, goal),
    f: manhattanDistance(start, goal),
    parent: null,
  };

  openList.push(startNode);

  // Create obstacle set for fast lookup
  const obstacleSet = new Set(obstacles.map(posKey));

  while (openList.length > 0) {
    // Find node with lowest f score
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    // Check if we reached the goal
    if (positionsEqual(current.position, goal)) {
      // Reconstruct path
      const path: GridPosition[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift(node.position);
        node = node.parent;
      }
      return path;
    }

    closedSet.add(posKey(current.position));

    // Check all neighbors
    const neighbors = getNeighbors(current.position);
    for (const neighborPos of neighbors) {
      // Skip if out of bounds
      if (!isWithinBounds(neighborPos, gridWidth, gridHeight)) {
        continue;
      }

      // Skip if obstacle
      if (obstacleSet.has(posKey(neighborPos))) {
        continue;
      }

      // Skip if already evaluated
      if (closedSet.has(posKey(neighborPos))) {
        continue;
      }

      const g = current.g + 1; // Each step costs 1
      const h = manhattanDistance(neighborPos, goal);
      const f = g + h;

      // Check if this neighbor is already in open list
      const existingNode = openList.find((node) =>
        positionsEqual(node.position, neighborPos)
      );

      if (existingNode) {
        // Update if we found a better path
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      } else {
        // Add new node to open list
        openList.push({
          position: neighborPos,
          g,
          h,
          f,
          parent: current,
        });
      }
    }
  }

  // No path found - return direct line (fallback)
  return [start, goal];
}

/**
 * Calculate estimated time to reach destination
 * @param path Array of positions
 * @param speed Grid cells per 10 seconds
 * @returns Time in seconds
 */
export function calculatePathTime(path: GridPosition[], speed: number): number {
  const distance = path.length - 1; // Number of steps
  return Math.ceil((distance / speed) * 10); // Convert to seconds
}
