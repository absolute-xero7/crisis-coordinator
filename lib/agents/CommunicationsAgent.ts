// Communications Agent - Generate public alerts

import { SimulationState, CommunicationsDecision, Incident } from '../types';
import { callAgentLLM } from '../utils/llmClient';
import { buildCommunicationsAgentPrompt } from './agentPrompts';

export class CommunicationsAgent {
  /**
   * Make communications decision (public alerts)
   */
  static async makeDecision(
    state: SimulationState,
    topIncidents: Incident[]
  ): Promise<CommunicationsDecision> {
    try {
      const prompt = buildCommunicationsAgentPrompt(state, topIncidents);
      const response = await callAgentLLM('communications', prompt, 2000);

      if (!response.publicAlerts) {
        throw new Error('Invalid communications response: missing publicAlerts');
      }

      const decision: CommunicationsDecision = {
        agentId: 'communications',
        timestamp: state.timeline,
        decision: {
          publicAlerts: response.publicAlerts || [],
        },
        reasoning: response.reasoning || 'No reasoning provided',
        torontoContext: response.torontoContext || [],
        confidence: 0.85,
      };

      return decision;
    } catch (error) {
      console.error('Communications Agent error:', error);
      return this.getFallbackDecision(state, topIncidents);
    }
  }

  /**
   * Fallback decision if LLM fails
   */
  private static getFallbackDecision(
    state: SimulationState,
    topIncidents: Incident[]
  ): CommunicationsDecision {
    const publicAlerts: any[] = [];

    // Generate alerts for top incidents
    for (const incident of topIncidents.slice(0, 3)) {
      let severity: 'info' | 'warning' | 'urgent' = 'info';
      if (incident.severity >= 5) severity = 'urgent';
      else if (incident.severity >= 3) severity = 'warning';

      const address = incident.location.address || `Grid ${incident.location.x},${incident.location.y}`;
      const torontoSpecific: string[] = [];

      if (incident.location.address) {
        torontoSpecific.push(`Location: ${incident.location.address}`);
      }
      if (incident.location.landmark) {
        torontoSpecific.push(`Near: ${incident.location.landmark}`);
      }

      let message = `${incident.type.toUpperCase()}: ${address}. `;

      if (incident.type === 'flood') {
        message += 'Avoid area. Roads may be impassable.';
      } else if (incident.type === 'fire') {
        message += 'Evacuate immediately if nearby. Avoid area.';
      } else if (incident.type === 'traffic') {
        message += 'Use alternate routes. Expect delays.';
      } else if (incident.type === 'transit') {
        message += 'TTC service affected. Seek alternate transit.';
        torontoSpecific.push('TTC service disrupted');
      }

      publicAlerts.push({
        severity,
        message,
        torontoSpecific,
      });
    }

    return {
      agentId: 'communications',
      timestamp: state.timeline,
      decision: {
        publicAlerts,
      },
      reasoning: 'Fallback rule-based alerts (LLM unavailable)',
      torontoContext: ['Rule-based fallback mode'],
      confidence: 0.6,
    };
  }
}
