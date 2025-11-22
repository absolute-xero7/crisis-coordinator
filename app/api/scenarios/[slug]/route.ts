import { NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/db/supabaseServerClient';
import { BUILT_IN_SCENARIOS } from '@/lib/scenarios/scenarioLoader';
import { ScenarioDefinition } from '@/lib/types';

const TABLE = 'scenarios';

type ScenarioRow = {
  id: string;
  slug: string;
  payload: ScenarioDefinition;
};

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const builtIn = BUILT_IN_SCENARIOS.find((scenario) => scenario.id === slug);
  if (builtIn) {
    return NextResponse.json(builtIn);
  }

  const { data, error } = await supabaseServerClient
    .from(TABLE)
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
  }

  const scenarioRow = data as ScenarioRow;
  return NextResponse.json(scenarioRow.payload);
}
