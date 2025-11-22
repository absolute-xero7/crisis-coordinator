'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SimulationState, ScenarioDefinition } from '@/lib/types';
import { SimulationEngine } from '@/lib/simulation/SimulationEngine';
import { BUILT_IN_SCENARIOS } from '@/lib/scenarios/scenarioLoader';
import { TriageAgent } from '@/lib/agents/TriageAgent';
import { ResourceAgent } from '@/lib/agents/ResourceAgent';
import { LogisticsAgent } from '@/lib/agents/LogisticsAgent';
import { MedicalAgent } from '@/lib/agents/MedicalAgent';
import { CommunicationsAgent } from '@/lib/agents/CommunicationsAgent';
import TorontoMap from '@/components/console/TorontoMap';
import AgentPanel from '@/components/console/AgentPanel';
import IncidentList from '@/components/console/IncidentList';
import Controls from '@/components/console/Controls';
import EventLog from '@/components/console/EventLog';
import { formatTime } from '@/lib/utils/timeUtils';
import { fetchScenarioList } from '@/lib/scenarios/scenarioApi';

function ConsolePageContent() {
  const searchParams = useSearchParams();
  const [engine, setEngine] = useState<SimulationEngine | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('path-flooding');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [agentThinking, setAgentThinking] = useState(false);
  const [lastAgentUpdate, setLastAgentUpdate] = useState<number | null>(null);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [scenarioOptions, setScenarioOptions] = useState<{
    builtIn: ScenarioDefinition[];
    custom: ScenarioDefinition[];
  }>({
    builtIn: BUILT_IN_SCENARIOS,
    custom: [],
  });
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const requestedScenario = searchParams?.get('scenario');

  useEffect(() => {
    if (requestedScenario && requestedScenario !== selectedScenario) {
      setSelectedScenario(requestedScenario);
    }
  }, [requestedScenario, selectedScenario]);
  // Load scenarios from API (Supabase-backed)
  useEffect(() => {
    let cancelled = false;

    async function loadScenarios() {
      setScenarioError(null);
      try {
        const data = await fetchScenarioList();
        if (!cancelled) {
          setScenarioOptions({
            builtIn: data.builtIn?.length ? data.builtIn : BUILT_IN_SCENARIOS,
            custom: data.custom ?? [],
          });
        }
      } catch (error) {
        console.error('Failed to load scenarios', error);
        if (!cancelled) {
          setScenarioError('Unable to load custom scenarios. Built-in scenarios only.');
          setScenarioOptions((prev) => ({ ...prev, custom: [] }));
        }
      } finally {
        if (!cancelled) {
          setScenariosLoading(false);
        }
      }
    }

    loadScenarios();
    return () => {
      cancelled = true;
    };
  }, []);

  const allScenarios = useMemo(
    () => [...scenarioOptions.custom, ...scenarioOptions.builtIn],
    [scenarioOptions]
  );

  // Initialize simulation
  useEffect(() => {
    const scenario = allScenarios.find((s) => s.id === selectedScenario);
    if (scenario) {
      if (activeScenarioId === scenario.id) {
        return;
      }
      const newEngine = new SimulationEngine(scenario);
      setEngine(newEngine);
      setState(newEngine.getState());
      setIsRunning(false);
      setActiveScenarioId(scenario.id);
      setLastAgentUpdate(null);
    }
  }, [selectedScenario, allScenarios, activeScenarioId]);

  const runAgents = useCallback(async (currentState: SimulationState) => {
    if (!engine) return;

    try {
      // Triage
      const triageDecision = await TriageAgent.makeDecision(currentState);
      currentState.agentDecisions.triage = triageDecision;

      // Resource
      const resourceDecision = await ResourceAgent.makeDecision(
        currentState,
        triageDecision
      );
      currentState.agentDecisions.resource = resourceDecision;

      // Apply resource assignments
      for (const assignment of resourceDecision.decision.assignments) {
        engine.assignResource(assignment.resourceId, assignment.incidentId);
      }

      // Logistics
      const logisticsDecision = await LogisticsAgent.makeDecision(
        currentState,
        triageDecision
      );
      currentState.agentDecisions.logistics = logisticsDecision;

      // Apply hospital routing
      for (const routing of logisticsDecision.decision.hospitalRouting) {
        engine.assignHospital(routing.incidentId, routing.targetHospital);
      }

      // Medical
      const medicalDecision = await MedicalAgent.makeDecision(currentState);
      currentState.agentDecisions.medical = medicalDecision;

      // Communications
      const topIncidents = triageDecision.decision.priorityQueue
        .slice(0, 3)
        .map((p) => currentState.incidents.find((i) => i.id === p.incidentId))
        .filter((i) => i !== undefined);

      const commsDecision = await CommunicationsAgent.makeDecision(
        currentState,
        topIncidents as any
      );
      currentState.agentDecisions.communications = commsDecision;

      // Update state
      setState({ ...currentState });
      setLastAgentUpdate(currentState.timeline);
    } catch (error) {
      console.error('Agent error:', error);
    }
  }, [engine]);

  // Simulation loop
  useEffect(() => {
    if (!engine || !state || state.isPaused) return;

    const interval = setInterval(async () => {
      const newState = await engine.step();

      if (newState.timeline % 60 === 0 && !agentThinking) {
        setAgentThinking(true);
        await runAgents(newState);
        setAgentThinking(false);
      }

      setState(newState);

      if (engine.isComplete()) {
        setIsRunning(false);
      }
    }, 1000 / (state.speed || 1));

    return () => clearInterval(interval);
  }, [engine, state, agentThinking, runAgents]);

  function handlePlayPause() {
    if (!engine || !state) return;
    engine.togglePause();
    setState(engine.getState());
    setIsRunning(!state.isPaused);
  }

  function handleSpeedChange(speed: 1 | 2 | 5 | 10) {
    if (!engine) return;
    engine.setSpeed(speed);
    setState(engine.getState());
  }

  function handleStep() {
    if (!engine) return;
    engine.step().then((newState) => setState(newState));
  }

  function handleScenarioChange(scenarioId: string) {
    setSelectedScenario(scenarioId);
    setIsRunning(false);
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-ops-bg flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="spinner mx-auto mb-4 w-12 h-12"></div>
          <p className="text-gray-400 text-lg font-medium">Loading simulation...</p>
          <p className="text-gray-500 text-sm mt-2">Initializing Toronto emergency systems</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ops-bg text-gray-100 page-transition">
      {/* Header with Enhanced Design */}
      <div className="bg-gradient-to-r from-ops-panel to-ops-panel-light border-b border-ops-border px-6 py-5 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow"></span>
              Multi-Agent Simulation
            </p>
            <h1 className="text-2xl font-display font-bold text-blue-300">
              Toronto Emergency Operations Console
            </h1>
            <p className="text-sm text-gray-400">{state.scenario.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide text-gray-400">Scenario</label>
              <select
                value={selectedScenario}
                onChange={(e) => handleScenarioChange(e.target.value)}
                className="bg-ops-panel-light border-2 border-ops-border hover:border-blue-500/50 rounded-lg px-4 py-2 text-sm transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[220px]"
                disabled={scenariosLoading}
              >
                <optgroup label="Built-In Scenarios">
                  {scenarioOptions.builtIn.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </optgroup>
                {scenarioOptions.custom.length > 0 && (
                  <optgroup label="Custom Scenarios">
                    {scenarioOptions.custom.map((scenario) => (
                      <option key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {scenarioError && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <span>⚠️</span>
                  {scenarioError}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ops-panel-light border border-blue-500/30">
              <span className="text-xs text-gray-400 uppercase tracking-wide">T+</span>
              <div className="time-display text-xl">{formatTime(state.timeline)}</div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-400 flex items-center gap-2 px-3 py-2 rounded-lg bg-ops-panel-light border border-ops-border">
                <span className="text-xs uppercase opacity-60">Incidents</span>
                <span className="font-mono text-blue-300">
                  {state.stats.resolvedIncidents}/{state.stats.totalIncidents}
                </span>
              </div>
              <div className="text-gray-400 flex items-center gap-2 px-3 py-2 rounded-lg bg-ops-panel-light border border-ops-border">
                <span className="text-xs uppercase opacity-60">Hospital Load</span>
                <span className="font-mono text-emerald-300">
                  {state.stats.hospitalUtilization}%
                </span>
              </div>
            </div>

            <Link
              href="/console/builder"
              className="text-sm rounded-lg border-2 border-ops-border px-4 py-2 hover:bg-ops-panel-light hover:border-blue-500/50 transition-all duration-300"
            >
              Scenario Builder
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen Layout */}
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-180px)] p-4 gap-4 pb-24 overflow-y-auto lg:overflow-hidden">
        {/* Left Panel - Map (65% on desktop) */}
        <div className="w-full lg:w-[65%] h-[50vh] lg:h-full flex-shrink-0">
          <TorontoMap state={state} />
        </div>

        {/* Right Panel - Sidebar with all info (35% on desktop) */}
        <div className="w-full lg:w-[35%] flex flex-col gap-3 lg:h-full lg:overflow-y-auto">
          {/* Multi-Agent System */}
          <div className="flex-shrink-0">
            <AgentPanel
              state={state}
              agentThinking={agentThinking}
              lastAgentUpdate={lastAgentUpdate}
            />
          </div>

          {/* Active Incidents */}
          <div className="flex-1 min-h-[200px] lg:min-h-0">
            <IncidentList incidents={state.incidents} />
          </div>

          {/* Event Timeline */}
          <div className="flex-1 min-h-[200px] lg:min-h-0">
            <EventLog events={state.events} />
          </div>
        </div>
      </div>

      {/* Bottom Controls with Enhanced Design */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-ops-panel to-ops-panel-light border-t-2 border-ops-border px-6 py-4 shadow-2xl backdrop-blur-sm z-50">
        <Controls
          isRunning={isRunning}
          speed={state.speed}
          onPlayPause={handlePlayPause}
          onStep={handleStep}
          onSpeedChange={handleSpeedChange}
        />
      </div>
    </div>
  );
}

export default function ConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ops-bg flex items-center justify-center text-gray-400">
          Preparing console...
        </div>
      }
    >
      <ConsolePageContent />
    </Suspense>
  );
}
