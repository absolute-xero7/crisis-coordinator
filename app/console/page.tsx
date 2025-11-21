'use client';

import { useState, useEffect } from 'react';
import { SimulationState } from '@/lib/types';
import { SimulationEngine } from '@/lib/simulation/SimulationEngine';
import { getScenarioById, BUILT_IN_SCENARIOS } from '@/lib/scenarios/scenarioLoader';
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

export default function ConsolePage() {
  const [engine, setEngine] = useState<SimulationEngine | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('path-flooding');
  const [agentThinking, setAgentThinking] = useState(false);

  // Initialize simulation
  useEffect(() => {
    const scenario = getScenarioById(selectedScenario);
    if (scenario) {
      const newEngine = new SimulationEngine(scenario);
      setEngine(newEngine);
      setState(newEngine.getState());
    }
  }, [selectedScenario]);

  // Simulation loop
  useEffect(() => {
    if (!engine || !state || state.isPaused) return;

    const interval = setInterval(async () => {
      // Run simulation step
      const newState = await engine.step();

      // Run agents every 60 seconds
      if (newState.timeline % 60 === 0 && !agentThinking) {
        setAgentThinking(true);
        await runAgents(newState);
        setAgentThinking(false);
      }

      setState(newState);

      // Stop if complete
      if (engine.isComplete()) {
        setIsRunning(false);
      }
    }, 1000 / (state.speed || 1)); // Adjust speed

    return () => clearInterval(interval);
  }, [engine, state, agentThinking]);

  // Run all agents
  async function runAgents(currentState: SimulationState) {
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
    } catch (error) {
      console.error('Agent error:', error);
    }
  }

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
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading simulation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ops-bg text-gray-100">
      {/* Header */}
      <div className="bg-ops-panel border-b border-ops-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">
              Toronto Emergency Operations Console
            </h1>
            <p className="text-sm text-gray-400">
              Multi-Agent Simulation: {state.scenario.name}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {/* Scenario selector */}
            <select
              value={selectedScenario}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="bg-ops-panel-light border border-ops-border rounded px-3 py-2 text-sm"
            >
              {BUILT_IN_SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>

            {/* Timeline */}
            <div className="time-display">{formatTime(state.timeline)}</div>

            {/* Stats */}
            <div className="text-right text-sm">
              <div className="text-gray-400">
                Incidents: {state.stats.resolvedIncidents}/{state.stats.totalIncidents}{' '}
                resolved
              </div>
              <div className="text-gray-400">
                Hospital Utilization: {state.stats.hospitalUtilization}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-120px)]">
        {/* Left Sidebar - Incidents */}
        <div className="col-span-3 flex flex-col gap-4">
          <IncidentList incidents={state.incidents} />
        </div>

        {/* Center - Map & Agents */}
        <div className="col-span-6 flex flex-col gap-4">
          <TorontoMap state={state} />
          <AgentPanel state={state} agentThinking={agentThinking} />
        </div>

        {/* Right Sidebar - Event Log */}
        <div className="col-span-3 flex flex-col gap-4">
          <EventLog events={state.events} />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-ops-panel border-t border-ops-border px-6 py-4">
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
