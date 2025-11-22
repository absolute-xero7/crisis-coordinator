import { ScenarioDefinition } from '@/lib/types';

export interface ScenarioListResponse {
  builtIn: ScenarioDefinition[];
  custom: ScenarioDefinition[];
}

export async function fetchScenarioList(): Promise<ScenarioListResponse> {
  const res = await fetch('/api/scenarios', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load scenarios');
  }
  return res.json();
}
