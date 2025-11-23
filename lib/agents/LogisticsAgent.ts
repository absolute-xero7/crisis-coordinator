// Logistics Agent - Hospital routing and shelter assignments

import { SimulationState, LogisticsDecision, TriageDecision } from '../types';
import { callAgentLLM } from '../utils/llmClient';
import { buildLogisticsAgentPrompt } from './agentPrompts';
import { geoDistance } from '../utils/mapUtils';

export class LogisticsAgent {
  /**
   * Make logistics decision (hospital routing, shelter assignments)
   */
  static async makeDecision(
    state: SimulationState,
    triageDecision: TriageDecision
  ): Promise<LogisticsDecision> {
    try {
      const prompt = buildLogisticsAgentPrompt(state);
      // 900 tokens: hospitalRouting can be verbose with shelter assignments
      const response = await callAgentLLM('logistics', prompt, 900);

      if (!response.hospitalRouting) {
        throw new Error('Invalid logistics response: missing hospitalRouting');
      }

      const decision: LogisticsDecision = {
        agentId: 'logistics',
        timestamp: state.timeline,
        decision: {
          hospitalRouting: response.hospitalRouting || [],
          shelterAssignments: response.shelterAssignments || [],
        },
        reasoning: response.reasoning || 'No reasoning provided',
        torontoContext: response.torontoContext || [],
        confidence: 0.85,
      };

      return decision;
    } catch (error) {
      console.error('Logistics Agent error:', error);
      return this.getFallbackDecision(state);
    }
  }

  /**
   * Fallback decision if LLM fails
   */
  private static getFallbackDecision(state: SimulationState): LogisticsDecision {
    const hospitalRouting: any[] = [];
    const shelterAssignments: any[] = [];

    // Route medical incidents to nearest hospital with capacity
    const medicalIncidents = state.incidents.filter(
      (i) =>
        (i.type === 'medical' || i.type === 'mass-casualty') &&
        i.status !== 'resolved'
    );

    for (const incident of medicalIncidents) {
      // Find nearest hospital with capacity
      let bestHospital = null;
      let bestScore = -Infinity;

      for (const hospital of state.hospitals) {
        const utilization = hospital.capacityUsed / hospital.capacityTotal;

        // Skip if over 90% capacity
        if (utilization > 0.9) continue;

        const distance = geoDistance(incident.location, hospital.location);
        // Score: closer is better, lower utilization is better
        const score = 100 / (distance + 1) - utilization * 50;

        if (score > bestScore) {
          bestScore = score;
          bestHospital = hospital;
        }
      }

      if (bestHospital) {
        hospitalRouting.push({
          incidentId: incident.id,
          targetHospital: bestHospital.id,
          reason: `Fallback: Nearest available hospital (${Math.round((bestHospital.capacityUsed / bestHospital.capacityTotal) * 100)}% capacity)`,
        });
      }
    }

    // Assign shelters for mass evacuations
    const evacuationIncidents = state.incidents.filter(
      (i) =>
        (i.type === 'flood' || i.type === 'fire' || i.type === 'transit') &&
        i.status !== 'resolved' &&
        i.peopleAffected > 100
    );

    for (const incident of evacuationIncidents) {
      // Find nearest shelter with capacity
      const nearestShelter = state.shelters
        .filter((s) => s.capacityUsed < s.capacityTotal)
        .sort(
          (a, b) =>
            geoDistance(incident.location, a.location) -
            geoDistance(incident.location, b.location)
        )[0];

      if (nearestShelter) {
        shelterAssignments.push({
          incidentId: incident.id,
          shelterId: nearestShelter.id,
          capacity: Math.min(
            incident.peopleAffected,
            nearestShelter.capacityTotal - nearestShelter.capacityUsed
          ),
        });
      }
    }

    return {
      agentId: 'logistics',
      timestamp: state.timeline,
      decision: {
        hospitalRouting,
        shelterAssignments,
      },
      reasoning: 'Fallback rule-based logistics (LLM unavailable)',
      torontoContext: ['Rule-based fallback mode'],
      confidence: 0.5,
    };
  }
}
