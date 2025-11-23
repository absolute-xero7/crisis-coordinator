// Triage Agent - Prioritizes incidents for response

import { SimulationState, TriageDecision } from '../types';
import { callAgentLLM } from '../utils/llmClient';
import { buildTriageAgentPrompt } from './agentPrompts';

export class TriageAgent {
  /**
   * Make triage decision based on current simulation state
   */
  static async makeDecision(state: SimulationState): Promise<TriageDecision> {
    try {
      // Build prompt with Toronto context
      const prompt = buildTriageAgentPrompt(state);

      // Call LLM (800 tokens: priorityQueue ~400 + reasoning/context ~300)
      const response = await callAgentLLM('triage', prompt, 800);

      // Validate response structure
      if (!response.priorityQueue || !Array.isArray(response.priorityQueue)) {
        throw new Error('Invalid triage response: missing priorityQueue');
      }

      // Build decision object
      const decision: TriageDecision = {
        agentId: 'triage',
        timestamp: state.timeline,
        decision: {
          priorityQueue: response.priorityQueue,
        },
        reasoning: response.reasoning || 'No reasoning provided',
        torontoContext: response.torontoContext || [],
        confidence: 0.85, // Default confidence
      };

      return decision;
    } catch (error) {
      console.error('Triage Agent error:', error);

      // Return fallback decision
      return this.getFallbackDecision(state);
    }
  }

  /**
   * Fallback decision if LLM fails
   */
  private static getFallbackDecision(state: SimulationState): TriageDecision {
    // Simple rule-based fallback: prioritize by severity and people affected
    const activeIncidents = state.incidents.filter((i) => i.status !== 'resolved');

    const priorityQueue = activeIncidents
      .map((incident) => {
        // Priority score: severity * 2 + log(peopleAffected)
        const priority = Math.min(
          10,
          incident.severity * 2 + Math.log10(Math.max(1, incident.peopleAffected))
        );

        return {
          incidentId: incident.id,
          priority: Math.round(priority),
          rationale: `Severity ${incident.severity}, ${incident.peopleAffected} people affected`,
        };
      })
      .sort((a, b) => b.priority - a.priority);

    return {
      agentId: 'triage',
      timestamp: state.timeline,
      decision: {
        priorityQueue,
      },
      reasoning: 'Fallback rule-based triage (LLM unavailable)',
      torontoContext: ['Rule-based fallback mode'],
      confidence: 0.5,
    };
  }
}
