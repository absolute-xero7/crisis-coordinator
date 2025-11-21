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
    <div className="ops-panel p-4 flex flex-col h-full">
      <h2 className="text-lg font-display font-semibold mb-4">Event Timeline</h2>

      <div className="flex-1 overflow-y-auto space-y-2">
        {recentEvents.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No events yet</p>
        )}

        {recentEvents.map((event) => (
          <div
            key={event.id}
            className="text-xs p-2 bg-ops-panel-light rounded border-l-2"
            style={{
              borderLeftColor:
                event.type === 'incident'
                  ? '#DC2626'
                  : event.type === 'decision'
                  ? '#3B82F6'
                  : event.type === 'arrival'
                  ? '#10B981'
                  : event.type === 'resolution'
                  ? '#22C55E'
                  : '#6B7280',
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-base">{getEventIcon(event.type)}</span>
              <div className="flex-1">
                <div className="font-mono text-[10px] text-gray-500 mb-1">
                  {formatTime(event.timestamp)}
                </div>
                <div className="text-gray-300">{event.description}</div>
                {event.torontoContext && (
                  <div className="mt-1 text-[10px] text-blue-400">
                    📍 {event.torontoContext}
                  </div>
                )}
                {event.agentId && (
                  <div className="mt-1 text-[10px] text-purple-400">
                    🤖 {event.agentId} agent
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
