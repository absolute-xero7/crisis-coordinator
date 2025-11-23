'use client';

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SimulationState, ScenarioDefinition } from '@/lib/types';
import { SimulationEngine } from '@/lib/simulation/SimulationEngine';
import { BUILT_IN_SCENARIOS } from '@/lib/scenarios/scenarioLoader';
import { demoAgentDecisions } from '@/lib/agents/demoDecisions';
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
  const [layout, setLayout] = useState<'default' | 'map-focus' | 'data-focus'>('default');
  const [demoMode, setDemoMode] = useState(true); // demo mode ON by default for presentations
  const initialAgentsTriggered = useRef(false);
  const demoAgentsTriggered = useRef(false);
  const agentCallInFlight = useRef(false);
  const lastAgentCallTs = useRef<number>(0);
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
      initialAgentsTriggered.current = false; // ensure first agent run happens on new scenario
      demoAgentsTriggered.current = false; // reset demo agents trigger for new scenario
      lastAgentCallTs.current = 0; // reset throttle so new scenario can call agents immediately
    }
  }, [selectedScenario, allScenarios, activeScenarioId]);

  const runAgents = useCallback(async (currentState: SimulationState) => {
    if (!engine) return;
    // Hard stop: no agent calls while in demo mode
    if (demoMode) return;

    // Throttle agent calls to avoid rapid-fire requests (min 15s apart)
    const now = Date.now();
    if (agentCallInFlight.current || now - lastAgentCallTs.current < 15000) {
      return;
    }
    agentCallInFlight.current = true;

    try {
      // Calculate top incidents for communications agent
      const topIncidents = currentState.incidents
        .filter((i) => i.status !== 'resolved')
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 3);

      // Call agent API route
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: currentState,
          topIncidents,
          demoMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Agent API call failed');
      }

      const decisions = await response.json();

      // Apply resource assignments
      for (const assignment of decisions.resource.decision.assignments) {
        engine.assignResource(assignment.resourceId, assignment.incidentId);
      }

      // Apply hospital routing
      for (const routing of decisions.logistics.decision.hospitalRouting) {
        engine.assignHospital(routing.incidentId, routing.targetHospital);
      }

      // Get the CURRENT engine state (timeline has advanced during API call)
      const latestState = engine.getState();

      // Update agent decisions in engine state
      engine.setState({
        ...latestState,
        agentDecisions: {
          triage: decisions.triage,
          resource: decisions.resource,
          logistics: decisions.logistics,
          medical: decisions.medical,
          communications: decisions.communications,
          commander: decisions.commander,
        },
      });

      // Update React state with latest engine state (preserves current timeline)
      setState(engine.getState());
      setLastAgentUpdate(latestState.timeline);
    } catch (error) {
      console.error('Agent error:', error);
    } finally {
      lastAgentCallTs.current = Date.now();
      agentCallInFlight.current = false;
    }
  }, [engine, demoMode]);

  // Simulation loop
  useEffect(() => {
    if (!engine || !state || state.isPaused) return;

    const interval = setInterval(async () => {
      const newState = await engine.step();

      // In demo mode: trigger agent "sync" at T+5 seconds (instant, no thinking delay to avoid timer issues)
      if (demoMode && newState.timeline >= 5 && !demoAgentsTriggered.current) {
        demoAgentsTriggered.current = true;

        const demo = demoAgentDecisions(newState, newState.incidents.slice(0, 3));

        // Apply resource assignments (dispatch units)
        for (const assignment of demo.resource.decision.assignments) {
          engine.assignResource(assignment.resourceId, assignment.incidentId);
        }

        // Apply hospital routing
        for (const routing of demo.logistics.decision.hospitalRouting) {
          engine.assignHospital(routing.incidentId, routing.targetHospital);
        }

        // Update agent decisions in engine (don't touch isPaused)
        const currentEngineState = engine.getState();
        engine.setState({
          ...currentEngineState,
          agentDecisions: {
            triage: demo.triage,
            resource: demo.resource,
            logistics: demo.logistics,
            medical: demo.medical,
            communications: demo.communications,
            commander: demo.commander,
          },
        });
        setLastAgentUpdate(newState.timeline);
      }

      // In live mode, call agents every 60 simulation seconds
      const shouldRunAgents =
        !demoMode && newState.timeline % 60 === 0 && !agentThinking;

      if (shouldRunAgents) {
        setAgentThinking(true);
        try {
          await runAgents(newState);
        } finally {
          setAgentThinking(false);
        }
      }

      setState(newState);

      if (engine.isComplete()) {
        setIsRunning(false);
      }
    }, 1000 / (state.speed || 1));

    return () => clearInterval(interval);
  }, [engine, state, agentThinking, runAgents, demoMode]);

  // Run agents immediately on load/scenario change (LIVE MODE ONLY)
  // In demo mode, agents are triggered at T+5 seconds via the simulation loop for staged reveal
  useEffect(() => {
    if (!engine || !state || initialAgentsTriggered.current) return;

    initialAgentsTriggered.current = true;

    // In demo mode, skip initial load - agents will appear at T+5 seconds for staged reveal effect
    if (demoMode) {
      return;
    }

    // Live mode: call LLM agents immediately
    setAgentThinking(true);
    (async () => {
      try {
        await runAgents(engine.getState());
      } finally {
        setAgentThinking(false);
      }
    })();
  }, [engine, state, runAgents, demoMode]);

  // Re-sync agents when toggling demo mode (only triggers on demoMode change)
  const prevDemoMode = useRef(demoMode);
  useEffect(() => {
    if (!engine) return;
    if (prevDemoMode.current === demoMode) return; // Skip if demoMode didn't change
    prevDemoMode.current = demoMode;

    const currentState = engine.getState();

    // In demo mode: if past T+5, apply demo data immediately; otherwise wait for staged reveal
    if (demoMode) {
      if (currentState.timeline >= 5) {
        const demo = demoAgentDecisions(currentState, currentState.incidents.slice(0, 3));

        // Apply resource assignments (dispatch units)
        for (const assignment of demo.resource.decision.assignments) {
          engine.assignResource(assignment.resourceId, assignment.incidentId);
        }

        // Apply hospital routing
        for (const routing of demo.logistics.decision.hospitalRouting) {
          engine.assignHospital(routing.incidentId, routing.targetHospital);
        }

        const updatedState = engine.getState();
        engine.setState({
          ...updatedState,
          agentDecisions: {
            triage: demo.triage,
            resource: demo.resource,
            logistics: demo.logistics,
            medical: demo.medical,
            communications: demo.communications,
            commander: demo.commander,
          },
        });
        setState(engine.getState());
        setLastAgentUpdate(currentState.timeline);
      }
      // If before T+5, let the simulation loop handle the staged reveal
      return;
    }

    // Switching to live mode: call LLM agents
    setAgentThinking(true);
    (async () => {
      try {
        await runAgents(currentState);
      } finally {
        setAgentThinking(false);
      }
    })();
  }, [demoMode, engine, runAgents]);

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
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-ops-panel to-ops-panel-light border-b border-ops-border px-4 py-2 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Title & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow"></span>
              <span className="text-xs uppercase tracking-wide text-gray-500">Multi-Agent Simulation</span>
            </div>
            <div className="h-4 w-px bg-ops-border"></div>
            <h1 className="text-sm font-display font-semibold text-accent-amber">
              Toronto Emergency Operations Console
            </h1>
          </div>

          {/* Center: Key Metrics */}
          <div className="flex items-center gap-2">
            {/* Scenario Selector */}
            <select
              value={selectedScenario}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="bg-ops-panel-light border border-ops-border hover:border-blue-500/50 rounded-md px-3 py-1.5 text-xs transition-all focus:ring-1 focus:ring-blue-500 focus:outline-none"
              disabled={scenariosLoading}
              title="Select scenario"
            >
              <optgroup label="Built-In">
                {scenarioOptions.builtIn.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </option>
                ))}
              </optgroup>
              {scenarioOptions.custom.length > 0 && (
                <optgroup label="Custom">
                  {scenarioOptions.custom.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Timeline */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-ops-panel-light border border-blue-500/30">
              <span className="font-mono text-sm text-accent-amber font-semibold">{formatTime(state.timeline)}</span>
            </div>

            {/* Incidents */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-ops-panel-light border border-ops-border">
              <span className="text-[10px] text-gray-500 uppercase">Incidents</span>
              <span className="font-mono text-xs text-accent-amber font-semibold">
                {state.stats.resolvedIncidents}/{state.stats.totalIncidents}
              </span>
            </div>

            {/* Hospital Load */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-ops-panel-light border border-ops-border">
              <span className="text-[10px] text-gray-500 uppercase">Hospital Load</span>
              <span className="font-mono text-xs text-emerald-300 font-semibold">
                {state.stats.hospitalUtilization}%
              </span>
            </div>
          </div>

          {/* Right: Layout Toggle, Demo Mode & Builder */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDemoMode((v) => !v)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                demoMode
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                  : 'bg-ops-panel-light border-ops-border text-gray-300 hover:border-blue-500/50'
              }`}
              title="Use cached agent responses for demos"
            >
              {demoMode ? 'Demo Mode: ON' : 'Demo Mode: OFF'}
            </button>

            {/* Layout Toggle */}
            <div className="flex gap-1 bg-ops-panel-light rounded-md p-0.5 border border-ops-border">
              <button
                onClick={() => setLayout('default')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                  layout === 'default'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Split view"
              >
                ⊞ Split
              </button>
              <button
                onClick={() => setLayout('map-focus')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                  layout === 'map-focus'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Map focus"
              >
                🗺️ Map
              </button>
              <button
                onClick={() => setLayout('data-focus')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                  layout === 'data-focus'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Data focus"
              >
                📊 Data
              </button>
            </div>

            {/* Builder Link */}
            <Link
              href="/console/builder"
              className="text-xs rounded-md border border-ops-border px-3 py-1.5 hover:bg-ops-panel-light hover:border-blue-500/50 transition-all"
            >
              Scenario Builder
            </Link>
          </div>
        </div>
        
        {scenarioError && (
          <div className="mt-1 text-[10px] text-amber-400 flex items-center gap-1">
            <span>⚠️</span>
            {scenarioError}
          </div>
        )}
      </div>

      {/* Main Content - Dynamic Layout */}
      <div className={`flex flex-col lg:flex-row lg:h-[calc(100vh-120px)] p-4 gap-4 pb-24 overflow-y-auto lg:overflow-hidden transition-all duration-500 ${
        layout === 'map-focus' ? 'lg:flex-col' : ''
      }`}>
        {/* Map Panel */}
        <div className={`transition-all duration-500 ${
          layout === 'default' ? 'w-full lg:w-[65%] h-[50vh] lg:h-full' :
          layout === 'map-focus' ? 'w-full h-[70vh] lg:h-[70vh]' :
          'w-full lg:w-[35%] h-[40vh] lg:h-full'
        } flex-shrink-0`}>
          <TorontoMap state={state} />
        </div>

        {/* Data Panel */}
        <div className={`flex flex-col gap-3 transition-all duration-500 ${
          layout === 'default' ? 'w-full lg:w-[35%] lg:h-full lg:overflow-y-auto' :
          layout === 'map-focus' ? 'w-full flex-row lg:flex-row h-auto' :
          'w-full lg:w-[65%] lg:h-full lg:overflow-y-auto'
        }`}>
          {/* Multi-Agent System */}
          <div className={`transition-all duration-500 ${
            layout === 'map-focus' ? 'flex-1 min-h-[250px]' : 'flex-shrink-0'
          }`}>
            <AgentPanel
              state={state}
              agentThinking={agentThinking}
              lastAgentUpdate={lastAgentUpdate}
            />
          </div>

          {/* Active Incidents & Event Timeline */}
          <div className={`flex gap-3 flex-1 min-h-[200px] transition-all duration-500 ${
            layout === 'map-focus' ? 'flex-col lg:flex-row' : 'flex-col'
          }`}>
            <div className="flex-1 min-h-[200px]">
              <IncidentList incidents={state.incidents} />
            </div>
            <div className="flex-1 min-h-[200px]">
              <EventLog events={state.events} />
            </div>
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
