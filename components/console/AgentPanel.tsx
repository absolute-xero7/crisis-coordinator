import { SimulationState } from '@/lib/types';
import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/utils/timeUtils';

interface AgentPanelProps {
  state: SimulationState;
  agentThinking: boolean;
  lastAgentUpdate: number | null;
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

export default function AgentPanel({ state, agentThinking, lastAgentUpdate }: AgentPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agents = Object.entries(state.agentDecisions);

  useEffect(() => {
    if (selectedAgent) return;
    const firstActive = agents.find(([, decision]) => !!decision);
    if (firstActive) {
      setSelectedAgent(firstActive[0]);
    }
  }, [agents, selectedAgent]);

  const secondsUntilNextSync = agentThinking
    ? null
    : (() => {
        const remainder = state.timeline % 60;
        const next = 60 - remainder;
        return next === 0 ? 60 : next;
      })();

  return (
    <div className="ops-panel p-4 flex flex-col overflow-hidden bg-gradient-to-br from-ops-panel via-ops-panel to-ops-panel-light">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-display font-semibold text-blue-300">Multi-Agent System</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono">
            {agents.filter(([, d]) => d !== null).length}/{agents.length}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          {agentThinking ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <div className="spinner w-3 h-3"></div>
              <span className="font-medium">Analyzing</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow"></span>
              <span className="font-medium text-xs">
                {lastAgentUpdate !== null
                  ? `${formatTime(lastAgentUpdate)}`
                  : 'Waiting'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-3">
        {agents.map(([agentId, decision]) => {
          const info = AGENT_INFO[agentId as keyof typeof AGENT_INFO];
          const isActive = decision !== null;
          const pct = Math.min(Math.max((decision?.confidence || 0) * 100, 0), 100);

          return (
            <button
              key={agentId}
              onClick={() => setSelectedAgent(agentId)}
              className={`ops-panel-light p-2 rounded-lg text-center transition-all duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 relative overflow-hidden group ${
                selectedAgent === agentId
                  ? 'ring-2 ring-blue-500 bg-gradient-to-br from-ops-panel-light to-blue-900/20'
                  : 'ring-1 ring-transparent hover:ring-1 hover:ring-blue-500/50'
              } ${isActive ? 'opacity-100' : 'opacity-50'}`}
              title={`${info.name} - ${info.description}`}
            >
              <div className="relative z-10">
                <div className="text-xl mb-1">{info.icon}</div>
                <div className="text-[10px] text-gray-300 truncate">{info.name.split(' ')[0]}</div>
                {isActive && (
                  <div className="text-[9px] font-mono text-emerald-300 mt-0.5">{pct.toFixed(0)}%</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Agent Details - Compact */}
      {selectedAgent && state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions] && (
        <div className="ops-panel-light p-3 rounded-lg border border-blue-500/30 bg-gradient-to-br from-ops-panel-light to-blue-900/10 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{AGENT_INFO[selectedAgent as keyof typeof AGENT_INFO].icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-blue-300 truncate">
                {AGENT_INFO[selectedAgent as keyof typeof AGENT_INFO].name}
              </h3>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              {(state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions]!.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed bg-ops-panel/50 p-2 rounded line-clamp-3">
            {state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions]?.reasoning}
          </p>

          {state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions]
            ?.torontoContext &&
            state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions]!
              .torontoContext.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {state.agentDecisions[
                  selectedAgent as keyof typeof state.agentDecisions
                ]!.torontoContext.slice(0, 3).map((context, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30"
                  >
                    {context}
                  </span>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
