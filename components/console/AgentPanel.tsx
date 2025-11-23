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
  commander: {
    name: 'Commander AI',
    icon: '⚡',
    description: 'Conflict resolution & synthesis',
    color: 'amber',
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
          <h2 className="text-lg font-display font-semibold text-accent-amber">Multi-Agent System</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/30 text-accent-amber font-mono">
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
                  ? `Synced @ ${formatTime(lastAgentUpdate)}`
                  : 'Waiting'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Selected agent label */}
      <div className="flex items-center justify-between mb-2 text-[11px] text-gray-400">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wide text-gray-500">Selected:</span>
          <span className="px-2 py-1 rounded-full bg-ops-panel-light border border-accent-amber/30 text-accent-amber font-semibold">
            {selectedAgent ? AGENT_INFO[selectedAgent as keyof typeof AGENT_INFO].name : 'None'}
          </span>
        </div>
        <span className="text-gray-500">
          {lastAgentUpdate !== null ? `Last sync ${formatTime(lastAgentUpdate)}` : 'Awaiting first sync'}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
        {agents.map(([agentId, decision]) => {
          const info = AGENT_INFO[agentId as keyof typeof AGENT_INFO];
          const isActive = decision !== null;
          const pct = Math.min(Math.max((decision?.confidence || 0) * 100, 0), 100);

          // Check for conflicts in commander decision
          const commanderDecision = agentId === 'commander' && decision
            ? (decision as import('@/lib/types').CommanderDecision)
            : null;
          const conflictCount = commanderDecision?.decision?.summary?.conflicts?.length ?? 0;
          const hasConflicts = conflictCount > 0;

          return (
            <button
              key={agentId}
              onClick={() => setSelectedAgent(agentId)}
              className={`ops-panel-light p-2 text-center transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-amber relative overflow-hidden group border ${
                selectedAgent === agentId
                  ? 'ring-2 ring-accent-amber border-accent-amber/80 bg-gradient-to-br from-[rgba(245,183,95,0.22)] via-ops-panel-light to-[rgba(245,183,95,0.12)] shadow-lg shadow-accent-amber/20 scale-[1.04]'
                  : 'ring-1 ring-transparent border-ops-border hover:border-accent-amber/50 hover:bg-ops-panel opacity-80'
              } ${isActive ? 'opacity-100' : 'opacity-50'} ${
                agentId === 'commander' && isActive ? 'bg-gradient-to-br from-amber-900/15 to-ops-panel-light' : ''
              }`}
              title={`${info.name} - ${info.description}`}
              aria-pressed={selectedAgent === agentId}
              aria-selected={selectedAgent === agentId}
            >
              {selectedAgent === agentId && (
                <span className="absolute inset-x-0 top-0 h-0.5 bg-accent-amber/80"></span>
              )}
              {/* Conflict badge for commander */}
              {hasConflicts && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-black z-50 ring-2 ring-black shadow-xl shadow-amber-500/60 animate-pulse">
                  {conflictCount}
                </div>
              )}
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
        <div className={`ops-panel-light p-3 border bg-gradient-to-br ${
          selectedAgent === 'commander'
            ? 'border-amber-500/30 from-ops-panel-light to-amber-900/10'
            : 'border-blue-500/30 from-ops-panel-light to-blue-900/10'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{AGENT_INFO[selectedAgent as keyof typeof AGENT_INFO].icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold truncate ${
                selectedAgent === 'commander' ? 'text-amber-300' : 'text-accent-amber'
              }`}>
                {AGENT_INFO[selectedAgent as keyof typeof AGENT_INFO].name}
              </h3>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              {(state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions]!.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Commander-specific content */}
          {selectedAgent === 'commander' && (() => {
            const cmd = state.agentDecisions.commander as import('@/lib/types').CommanderDecision | null;
            const summary = cmd?.decision?.summary;
            if (!summary) return null;

            return (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {/* Conflicts */}
                {summary.conflicts.length > 0 && (
                  <div className="bg-amber-500/10 p-2 rounded border border-amber-500/30">
                    <div className="text-[10px] font-semibold text-amber-300 uppercase mb-1">
                      Conflicts Resolved ({summary.conflicts.length})
                    </div>
                    {summary.conflicts.map((c) => (
                      <div key={c.id} className="text-[11px] mb-1 last:mb-0">
                        <span className="text-amber-400">{c.agents[0]} vs {c.agents[1]}:</span>{' '}
                        <span className="text-gray-300">{c.description}</span>
                        <div className="text-emerald-300 mt-0.5 pl-2 border-l border-emerald-500/30">
                          {c.resolution}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Equity Notes */}
                {summary.equityNotes.length > 0 && (
                  <div className="bg-blue-500/10 p-2 rounded border border-blue-500/30">
                    <div className="text-[10px] font-semibold text-blue-300 uppercase mb-1">
                      Equity & Fairness Checks
                    </div>
                    {summary.equityNotes.map((note, i) => (
                      <div key={i} className="text-[11px] text-gray-200">{note}</div>
                    ))}
                  </div>
                )}

                {/* Key Decisions */}
                {summary.keyDecisions.length > 0 && (
                  <div className="text-[11px] text-gray-300">
                    {summary.keyDecisions.map((d, i) => (
                      <div key={i}>• {d}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Regular agent content */}
          {selectedAgent !== 'commander' && (
            <div className="text-xs text-gray-100 leading-relaxed bg-ops-panel/60 p-2 rounded max-h-28 overflow-y-auto pr-2">
              <ul className="list-disc list-inside space-y-1">
                {(state.agentDecisions[selectedAgent as keyof typeof state.agentDecisions]?.reasoning || '')
                  // Split on periods followed by space and uppercase letter (sentence boundaries)
                  // but not after common abbreviations like St., Dr., Mt., etc.
                  .split(/(?<!\b(?:St|Dr|Mt|Ave|Blvd|Rd|Gen|Lt|Sgt|Corp|Inc|Ltd|vs|etc|approx|min|max|avg))\.(?=\s+[A-Z])/)
                  .filter((line) => line.trim().length > 0)
                  .map((line, idx) => (
                    <li key={idx}>{line.trim()}{!line.trim().endsWith('.') ? '.' : ''}</li>
                  ))}
              </ul>
            </div>
          )}

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
                    className="text-[10px] bg-accent-amber/15 text-accent-amber px-2 py-0.5 rounded-full border border-accent-amber/30"
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
