// Scenario Loader - Load and manage scenarios

import { ScenarioDefinition } from '../types';
import { pathFloodingScenario } from './pathFlooding';
import { dvpBlizzardScenario } from './dvpBlizzard';
import { billyBishopScenario } from './billyBishop';

export const BUILT_IN_SCENARIOS: ScenarioDefinition[] = [
  pathFloodingScenario,
  dvpBlizzardScenario,
  billyBishopScenario,
];

/**
 * Get all available scenarios (built-in + custom)
 */
export function getAllScenarios(): ScenarioDefinition[] {
  const customScenarios = getCustomScenarios();
  return [...BUILT_IN_SCENARIOS, ...customScenarios];
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): ScenarioDefinition | null {
  const allScenarios = getAllScenarios();
  return allScenarios.find((s) => s.id === id) || null;
}

/**
 * Get custom scenarios from localStorage
 */
export function getCustomScenarios(): ScenarioDefinition[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('crisiscoordinator-scenarios');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load custom scenarios:', error);
    return [];
  }
}

/**
 * Save custom scenario to localStorage
 */
export function saveCustomScenario(scenario: ScenarioDefinition): void {
  if (typeof window === 'undefined') return;

  try {
    const customScenarios = getCustomScenarios();
    // Remove existing scenario with same ID
    const filtered = customScenarios.filter((s) => s.id !== scenario.id);
    filtered.push(scenario);

    localStorage.setItem('crisiscoordinator-scenarios', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to save custom scenario:', error);
    throw new Error('Failed to save scenario');
  }
}

/**
 * Delete custom scenario
 */
export function deleteCustomScenario(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const customScenarios = getCustomScenarios();
    const filtered = customScenarios.filter((s) => s.id !== id);
    localStorage.setItem('crisiscoordinator-scenarios', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete custom scenario:', error);
    throw new Error('Failed to delete scenario');
  }
}

/**
 * Validate scenario definition
 */
export function validateScenario(scenario: ScenarioDefinition): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!scenario.id) errors.push('Scenario ID is required');
  if (!scenario.name) errors.push('Scenario name is required');
  if (!scenario.description) errors.push('Scenario description is required');
  if (!scenario.duration || scenario.duration <= 0) {
    errors.push('Scenario duration must be greater than 0');
  }

  // City size
  if (!scenario.citySize || scenario.citySize.width < 10 || scenario.citySize.height < 10) {
    errors.push('City size must be at least 10x10');
  }

  // Initial incidents
  if (!scenario.initialIncidents || scenario.initialIncidents.length === 0) {
    errors.push('At least one initial incident is required');
  }

  // Validate incidents
  for (const incident of scenario.initialIncidents || []) {
    if (!incident.id) errors.push(`Incident missing ID`);
    if (!incident.type) errors.push(`Incident ${incident.id} missing type`);
    if (!incident.location) errors.push(`Incident ${incident.id} missing location`);
    const { x, y } = incident.location || { x: undefined, y: undefined };
    if (
      x === undefined ||
      y === undefined ||
      x < 0 ||
      y < 0 ||
      x >= scenario.citySize.width ||
      y >= scenario.citySize.height
    ) {
      errors.push(`Incident ${incident.id} has invalid location`);
    }
    if (!incident.severity || incident.severity < 1 || incident.severity > 5) {
      errors.push(`Incident ${incident.id} has invalid severity (must be 1-5)`);
    }
  }

  // Resources
  if (!scenario.resources) {
    errors.push('Resources configuration is required');
  } else {
    if (scenario.resources.fireUnits < 0) errors.push('Fire units cannot be negative');
    if (scenario.resources.ambulances < 0) errors.push('Ambulances cannot be negative');
    if (scenario.resources.policeUnits < 0) errors.push('Police units cannot be negative');

    // At least 3 total resources
    const totalResources =
      (scenario.resources.fireUnits || 0) +
      (scenario.resources.ambulances || 0) +
      (scenario.resources.policeUnits || 0);
    if (totalResources < 3) {
      errors.push('Scenario must have at least 3 resources total');
    }
  }

  // Hospitals
  if (!scenario.hospitals || scenario.hospitals.length === 0) {
    errors.push('At least one hospital is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
