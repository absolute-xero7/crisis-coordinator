import { SimulationState } from '@/lib/types';
import { useState } from 'react';

interface AgentPanelProps {
  state: SimulationState;
  agentThinking: boolean;
}

const AGENT_INFO = {
  triage: {
    name: 'Triage Agent',
    icon: '🎯',
    description: 'Prioritizes incidents',
    color: 'blue',
  },
  resource: {
    name: 'Resource Agent',
    icon: '🚒',
    description: 'Assigns TFS/EMS/TPS units',
    color: 'red',
  },
  logistics: {
    name: 'Logistics Agent',
    icon: '🏥',
    description: 'Hospital routing',
    color: 'green',
  },
  medical: {
    name: 'Medical Agent',
    icon: '⚕️',
    description: 'Capacity monitoring',
    color: 'purple',
  },
  communications: {
    name: 'Communications Agent',
    icon: '📢',
    description: 'Public alerts',
    color: 'yellow',
  },
};

export default function AgentPanel({ state, agentThinking }: AgentPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agents = Object.entries(state.agentDecisions);

  return (
    <div className="ops-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold">Multi-Agent System</h2>
        {agentThinking && (
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <div className="spinner"></div>
            <span>Agents thinking...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {agents.map(([agentId, decision]) => {
          const info = AGENT_INFO[agentId as keyof typeof AGENT_INFO];
          const isActive = decision !== null;

          return (
            <button
              key={agentId}
              onClick={() => setSelectedAgent(agentId)}
              className={`ops-panel-light p-3 rounded cursor-pointer transition-all ${
                selectedAgent === agentId ? 'ring-2 ring-blue-500' : ''
              } ${isActive ? 'opacity-100' : 'opacity-50'}`}
            >
              <div className="text-2xl mb-1">{info.icon}</div>
              <div className="text-xs font-semibold">{info.name.split(' ')[0]}</div>
              <div className="text-[10px] text-gray-400 mt-1">{info.description}</div>
              {isActive && (
                <div className="mt-2">
                  <div className="w-full bg-ops-bg h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(decision.confidence || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions] && (
        <div className="mt-4 ops-panel-light p-4 rounded">
          <h3 className="font-semibold mb-2">
            {AGENT_INFO[selectedAgent as keyof typeof AGENT_INFO].name} - Reasoning
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            {state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions]?.reasoning}
          </p>

          {state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions]
            ?.torontoContext &&
            state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions]!
              .torontoContext.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">
                  Toronto Context:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {state.agentDecisions[
                    selectedAgent as keyof typeof state.agentDecisions
                  ]!.torontoContext.map((context, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded"
                    >
                      {context}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
