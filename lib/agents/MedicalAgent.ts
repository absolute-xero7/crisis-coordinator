// Medical Agent - Monitor hospital capacity and medical system

import { SimulationState, MedicalDecision } from '../types';
import { callAgentLLM } from '../utils/llmClient';
import { buildMedicalAgentPrompt } from './agentPrompts';

export class MedicalAgent {
  /**
   * Make medical system monitoring decision
   */
  static async makeDecision(state: SimulationState): Promise<MedicalDecision> {
    try {
      const prompt = buildMedicalAgentPrompt(state);
      const response = await callAgentLLM('medical', prompt, 600);

      if (!response.alerts) {
        throw new Error('Invalid medical response: missing alerts');
      }

      const decision: MedicalDecision = {
        agentId: 'medical',
        timestamp: state.timeline,
        decision: {
          alerts: response.alerts || [],
          recommendations: response.recommendations || [],
        },
        reasoning: response.reasoning || 'No reasoning provided',
        torontoContext: response.torontoContext || [],
        confidence: 0.9, // Medical monitoring is more deterministic
      };

      return decision;
    } catch (error) {
      console.error('Medical Agent error:', error);
      return this.getFallbackDecision(state);
    }
  }

  /**
   * Fallback decision if LLM fails
   */
  private static getFallbackDecision(state: SimulationState): MedicalDecision {
    const alerts: any[] = [];
    const recommendations: string[] = [];

    // Check each hospital capacity
    for (const hospital of state.hospitals) {
      const utilization = hospital.capacityUsed / hospital.capacityTotal;

      if (utilization > 0.95) {
        alerts.push({
          type: 'capacity' as const,
          hospitalId: hospital.id,
          message: `${hospital.name} at ${Math.round(utilization * 100)}% capacity - CRITICAL, diversion required`,
        });
        recommendations.push(`Divert all non-critical patients from ${hospital.name}`);
      } else if (utilization > 0.85) {
        alerts.push({
          type: 'capacity' as const,
          hospitalId: hospital.id,
          message: `${hospital.name} at ${Math.round(utilization * 100)}% capacity - HIGH stress, consider diversion`,
        });
        recommendations.push(`Monitor ${hospital.name} closely, prepare diversion protocols`);
      } else if (utilization > 0.7) {
        alerts.push({
          type: 'capacity' as const,
          hospitalId: hospital.id,
          message: `${hospital.name} at ${Math.round(utilization * 100)}% capacity - moderate stress`,
        });
      }
    }

    // Overall system recommendation
    if (alerts.length > 0) {
      recommendations.push('Balance patient load across Toronto hospital system');
    }

    return {
      agentId: 'medical',
      timestamp: state.timeline,
      decision: {
        alerts,
        recommendations,
      },
      reasoning: 'Fallback rule-based hospital monitoring (LLM unavailable)',
      torontoContext: ['Rule-based fallback mode'],
      confidence: 0.7,
    };
  }
}
