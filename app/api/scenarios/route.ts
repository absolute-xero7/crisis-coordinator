import { NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/db/supabaseServerClient';
import { BUILT_IN_SCENARIOS, validateScenario } from '@/lib/scenarios/scenarioLoader';
import { ScenarioDefinition } from '@/lib/types';
import { slugify } from '@/lib/utils/slug';

const TABLE = 'scenarios';

type ScenarioRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  payload: ScenarioDefinition;
};

function mapRow(row: ScenarioRow): ScenarioDefinition {
  return row.payload;
}

export async function GET() {
  const { data, error } = await supabaseServerClient
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[scenarios] GET error', error);
    return NextResponse.json(
      { error: 'Failed to load scenarios' },
      { status: 500 }
    );
  }

  const customScenarios = (data as ScenarioRow[] | null)?.map(mapRow) ?? [];

  return NextResponse.json({
    builtIn: BUILT_IN_SCENARIOS,
    custom: customScenarios,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as ScenarioDefinition;

  const { valid, errors } = validateScenario(body);
  if (!valid) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const slug = slugify(body.id || body.name);

  const { data, error } = await supabaseServerClient
    .from(TABLE)
    .upsert(
      {
        slug,
        name: body.name,
        description: body.description,
        payload: body,
      },
      { onConflict: 'slug' }
    )
    .select('*')
    .single();

  if (error) {
    console.error('[scenarios] POST error', error);
    return NextResponse.json(
      { error: 'Failed to save scenario' },
      { status: 500 }
    );
  }

  return NextResponse.json(mapRow(data as ScenarioRow));
}
