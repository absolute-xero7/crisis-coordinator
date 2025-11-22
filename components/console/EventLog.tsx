import { SimulationEvent } from '@/lib/types';
import { formatTime } from '@/lib/utils/timeUtils';

interface EventLogProps {
  events: SimulationEvent[];
}

export default function EventLog({ events }: EventLogProps) {
  // Show most recent events first
  const recentEvents = [...events].reverse().slice(0, 50);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return '🚨';
      case 'decision':
        return '🧠';
      case 'arrival':
        return '📍';
      case 'transport':
        return '🏥';
      case 'alert':
        return '⚠️';
      case 'resolution':
        return '✅';
      default:
        return '•';
    }
  };

  return (
    <div className="ops-panel p-3 flex flex-col h-full bg-gradient-to-br from-ops-panel via-ops-panel to-ops-panel-light">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h2 className="text-sm font-display font-semibold text-blue-300">Timeline</h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/30 text-gray-400 font-mono">
          {recentEvents.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {recentEvents.length === 0 && (
          <div className="text-xs text-gray-500 text-center py-4 flex flex-col items-center gap-1">
            <div className="text-2xl opacity-50">📋</div>
            <p>No events yet</p>
          </div>
        )}

        {recentEvents.map((event, idx) => {
          const borderColor =
            event.type === 'incident'
              ? '#DC2626'
              : event.type === 'decision'
              ? '#3B82F6'
              : event.type === 'arrival'
              ? '#10B981'
              : event.type === 'resolution'
              ? '#22C55E'
              : '#6B7280';

          return (
            <div
              key={event.id}
              className="text-[10px] p-1.5 bg-ops-panel-light rounded border-l-2 hover:bg-ops-panel transition-all duration-200 animate-fade-in"
              style={{
                borderLeftColor: borderColor,
                animationDelay: `${idx * 20}ms`,
              }}
            >
              <div className="flex items-start gap-1.5">
                <span className="text-sm flex-shrink-0">{getEventIcon(event.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[9px] text-gray-500">
                    {formatTime(event.timestamp)}
                  </div>
                  <div className="text-gray-200 leading-tight line-clamp-2">{event.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
