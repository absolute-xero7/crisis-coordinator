// Resource Agent - Assigns emergency resources to incidents

import { SimulationState, ResourceDecision, TriageDecision } from '../types';
import { callAgentLLM } from '../utils/llmClient';
import { buildResourceAgentPrompt } from './agentPrompts';

export class ResourceAgent {
  /**
   * Make resource assignment decision
   */
  static async makeDecision(
    state: SimulationState,
    triageDecision: TriageDecision
  ): Promise<ResourceDecision> {
    try {
      // Build prompt with priority queue from triage
      const prompt = buildResourceAgentPrompt(
        state,
        triageDecision.decision.priorityQueue
      );

      // Call LLM
      const response = await callAgentLLM('resource', prompt, 2500);

      // Validate response
      if (!response.assignments || !Array.isArray(response.assignments)) {
        throw new Error('Invalid resource response: missing assignments');
      }

      const decision: ResourceDecision = {
        agentId: 'resource',
        timestamp: state.timeline,
        decision: {
          assignments: response.assignments,
          held: response.held || [],
        },
        reasoning: response.reasoning || 'No reasoning provided',
        torontoContext: response.torontoContext || [],
        confidence: 0.85,
      };

      return decision;
    } catch (error) {
      console.error('Resource Agent error:', error);
      return this.getFallbackDecision(state, triageDecision);
    }
  }

  /**
   * Fallback decision if LLM fails
   */
  private static getFallbackDecision(
    state: SimulationState,
    triageDecision: TriageDecision
  ): ResourceDecision {
    const assignments: any[] = [];
    const held: string[] = [];

    // Get available resources
    const availableResources = state.resources.filter((r) => r.status === 'available');

    // Assign to top 3 priority incidents
    const topIncidents = triageDecision.decision.priorityQueue.slice(0, 3);

    for (const priorityItem of topIncidents) {
      const incident = state.incidents.find((i) => i.id === priorityItem.incidentId);
      if (!incident) continue;

      // Find suitable resource (simple matching)
      const resource = availableResources.find((r) => {
        // Already assigned in this decision
        if (assignments.some((a) => a.resourceId === r.id)) return false;

        // Match resource type to incident type
        if (incident.type === 'fire' && r.type.startsWith('fire')) return true;
        if (incident.type === 'medical' && r.type.startsWith('ambulance')) return true;
        if (incident.type === 'flood' && r.type === 'fire-water-rescue') return true;
        if (incident.type === 'hazmat' && r.type === 'fire-hazmat') return true;

        return false;
      });

      if (resource) {
        assignments.push({
          resourceId: resource.id,
          incidentId: incident.id,
          rationale: `Fallback: ${resource.name} to ${incident.type}`,
        });
      }
    }

    return {
      agentId: 'resource',
      timestamp: state.timeline,
      decision: {
        assignments,
        held,
      },
      reasoning: 'Fallback rule-based resource assignment (LLM unavailable)',
      torontoContext: ['Rule-based fallback mode'],
      confidence: 0.5,
    };
  }
}
