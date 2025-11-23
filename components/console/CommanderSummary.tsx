// Commander Summary Component - Synthesizes all agent decisions
// Shows conflicts, resolutions, equity notes, and overall status

import { CommanderDecision, AgentConflict } from '@/lib/types';

interface CommanderSummaryProps {
  commander: CommanderDecision | null;
}

export default function CommanderSummary({ commander }: CommanderSummaryProps) {
  if (!commander) {
    return (
      <div className="ops-panel p-4 bg-gradient-to-br from-ops-panel via-ops-panel to-ops-panel-light">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚡</span>
          <h2 className="text-lg font-display font-semibold text-accent-amber">Commander AI</h2>
        </div>
        <div className="text-sm text-gray-500 text-center py-4">
          Waiting for agent decisions...
        </div>
      </div>
    );
  }

  const { summary } = commander.decision;
  const statusColors = {
    stable: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    stressed: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-300', dot: 'bg-amber-400' },
    critical: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-300', dot: 'bg-red-400' },
  };
  const status = statusColors[summary.overallStatus];

  return (
    <div className="ops-panel p-4 bg-gradient-to-br from-ops-panel via-ops-panel to-ops-panel-light flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <h2 className="text-lg font-display font-semibold text-accent-amber">Commander AI</h2>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bg} ${status.border} border`}>
          <span className={`h-2 w-2 rounded-full ${status.dot} animate-pulse`}></span>
          <span className={`text-xs font-semibold uppercase ${status.text}`}>
            {summary.overallStatus}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
        {/* Conflicts Section */}
        {summary.conflicts.length > 0 && (
          <div className="ops-panel-light p-3 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚠️</span>
              <span className="text-xs font-semibold text-amber-300 uppercase">
                Agent Conflicts Resolved ({summary.conflicts.length})
              </span>
            </div>
            {summary.conflicts.map((conflict: AgentConflict) => (
              <div key={conflict.id} className="mb-2 last:mb-0">
                <div className="text-[11px] text-gray-300 mb-1">
                  <span className="text-amber-400 font-semibold">
                    {conflict.agents[0].toUpperCase()} vs {conflict.agents[1].toUpperCase()}:
                  </span>{' '}
                  {conflict.description}
                </div>
                <div className="text-[11px] text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded">
                  {conflict.resolution}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Equity Notes Section */}
        {summary.equityNotes.length > 0 && (
          <div className="ops-panel-light p-3 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚖️</span>
              <span className="text-xs font-semibold text-accent-amber uppercase">
                Equity & Fairness Checks
              </span>
            </div>
            <ul className="space-y-1">
              {summary.equityNotes.map((note, i) => (
                <li key={i} className="text-[11px] text-gray-200">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Decisions Section */}
        {summary.keyDecisions.length > 0 && (
          <div className="ops-panel-light p-3 border border-ops-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📋</span>
              <span className="text-xs font-semibold text-gray-300 uppercase">
                Key Decisions
              </span>
            </div>
            <ul className="space-y-1">
              {summary.keyDecisions.map((decision, i) => (
                <li key={i} className="text-[11px] text-gray-300">
                  • {decision}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Toronto Context */}
        {summary.torontoContext.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {summary.torontoContext.map((context, i) => (
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

      {/* Footer - Reasoning */}
      <div className="mt-2 pt-2 border-t border-ops-border flex-shrink-0">
        <div className="text-[10px] text-gray-400 italic">
          {commander.reasoning}
        </div>
        <div className="text-[10px] text-gray-500 mt-1 font-mono">
          Confidence: {(commander.confidence * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
