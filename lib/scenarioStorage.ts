import { ScenarioDefinition } from '@/lib/types';

const STORAGE_KEY = 'crisiscoordinator-scenario-draft';

export function loadScenarioDraft(): ScenarioDefinition | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScenarioDefinition) : null;
  } catch (error) {
    console.warn('Failed to load scenario draft', error);
    return null;
  }
}

export function saveScenarioDraft(draft: ScenarioDefinition) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.warn('Failed to persist scenario draft', error);
  }
}

export function clearScenarioDraft() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear scenario draft', error);
  }
}
