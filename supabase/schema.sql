-- Supabase schema for CrisisCoordinator
-- Run via Supabase SQL editor or supabase CLI

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  payload jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.simulation_runs (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid references public.scenarios (id) on delete set null,
  status text not null check (status in ('pending','running','completed','failed')),
  started_at timestamptz default now(),
  completed_at timestamptz,
  summary jsonb,
  error text
);

create table if not exists public.simulation_events (
  id bigserial primary key,
  run_id uuid references public.simulation_runs (id) on delete cascade,
  timestamp integer not null,
  payload jsonb not null
);

create index if not exists idx_simulation_events_run on public.simulation_events(run_id);
