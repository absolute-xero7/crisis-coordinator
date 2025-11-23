import { NextRequest, NextResponse } from 'next/server';
import { TriageAgent } from '@/lib/agents/TriageAgent';
import { ResourceAgent } from '@/lib/agents/ResourceAgent';
import { LogisticsAgent } from '@/lib/agents/LogisticsAgent';
import { MedicalAgent } from '@/lib/agents/MedicalAgent';
import { CommunicationsAgent } from '@/lib/agents/CommunicationsAgent';
import { demoAgentDecisions } from '@/lib/agents/demoDecisions';
import { buildCommanderDecision } from '@/lib/agents/conflictDetection';
import '@/lib/suppressDeprecationWarnings';

export async function POST(request: NextRequest) {
  const { state, topIncidents, demoMode } = await request.json();

  const demoModeFlag = demoMode || process.env.DEMO_MODE === 'true';

  if (!state) {
    return NextResponse.json(
      { error: 'Missing simulation state' },
      { status: 400 }
    );
  }

  // Demo mode skips live LLM calls for instant responses
  if (demoModeFlag) {
    const demoDecisions = demoAgentDecisions(state, topIncidents);
    return NextResponse.json(demoDecisions);
  }

  try {
    console.log('[API] Starting agent decisions (optimized parallel execution)...');
    const startTime = Date.now();

    // Phase 1: Triage must run first (other agents depend on priority queue)
    const triageDecision = await TriageAgent.makeDecision(state);
    console.log(`[API] Triage complete in ${Date.now() - startTime}ms`);

    // Phase 2: Run Resource + Logistics in parallel (both need triage), Medical + Comms in parallel (independent)
    const [resourceDecision, logisticsDecision, medicalDecision, commsDecision] = await Promise.all([
      ResourceAgent.makeDecision(state, triageDecision),
      LogisticsAgent.makeDecision(state, triageDecision),
      MedicalAgent.makeDecision(state),
      CommunicationsAgent.makeDecision(state, topIncidents || []),
    ]);
    console.log(`[API] All parallel agents complete in ${Date.now() - startTime}ms`);

    const totalTime = Date.now() - startTime;
    console.log(`[API] All agents complete in ${totalTime}ms`);

    // Build Commander decision (synthesizes all agent outputs, detects conflicts)
    const commanderDecision = buildCommanderDecision(
      state,
      triageDecision,
      resourceDecision,
      logisticsDecision,
      medicalDecision
    );
    console.log(`[API] Commander synthesis complete`);

    return NextResponse.json({
      triage: triageDecision,
      resource: resourceDecision,
      logistics: logisticsDecision,
      medical: medicalDecision,
      communications: commsDecision,
      commander: commanderDecision,
    });
  } catch (error: any) {
    console.error('Agent API error, falling back to demo decisions:', error);
    const demoDecisions = demoAgentDecisions(state, topIncidents);
    // Always return a valid shape so the UI keeps moving even under rate limits/errors
    return NextResponse.json(demoDecisions, { status: 200 });
  }
}
