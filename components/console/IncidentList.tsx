import { Incident } from '@/lib/types';
import { formatTime } from '@/lib/utils/timeUtils';

interface IncidentListProps {
  incidents: Incident[];
}

export default function IncidentList({ incidents }: IncidentListProps) {
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');

  return (
    <div className="ops-panel p-3 flex flex-col h-full bg-gradient-to-br from-ops-panel via-ops-panel to-ops-panel-light">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h2 className="text-sm font-display font-semibold text-accent-amber">Incidents</h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-coral/10 border border-accent-coral/30 text-accent-coral font-mono">
          {activeIncidents.length} active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {activeIncidents.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-8 flex flex-col items-center gap-2">
            <div className="text-4xl opacity-50">✓</div>
            <p>No active incidents</p>
          </div>
        )}

        {activeIncidents.map((incident, idx) => {
          const severityLevel = incident.severity >= 5 ? 'critical' : incident.severity >= 4 ? 'high' : incident.severity >= 3 ? 'medium' : 'low';

          return (
            <div
              key={incident.id}
              className="ops-panel-light p-2 hover-lift transition-all duration-200 border border-transparent hover:border-accent-amber/40"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${severityLevel === 'critical' ? 'pulse-critical' : ''}`}
                    style={{
                      backgroundColor: `var(--severity-${severityLevel})`,
                    }}
                  ></span>
                  <span className="font-mono text-[10px] font-semibold text-accent-amber">{incident.id}</span>
                </div>
                <span className={`status-badge status-${incident.status} text-[9px] px-1.5 py-0.5`}>
                  {incident.status}
                </span>
              </div>

              {/* Type & Location */}
              <div className="text-xs font-semibold text-gray-100 truncate">
                {incident.type.toUpperCase()}
              </div>
              <div className="text-[10px] text-gray-400 truncate mb-1">
                {incident.location.address || incident.location.landmark || incident.location.neighborhood || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span className="font-mono">{incident.peopleAffected} ppl</span>
                <span className="font-mono">{incident.assignedResources.length} units</span>
                <span className="font-mono opacity-70">{formatTime(incident.reportedAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolved Count */}
      {resolvedIncidents.length > 0 && (
        <div className="mt-2 pt-2 border-t border-ops-border flex-shrink-0">
          <div className="text-[10px] text-center px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-1">
            <span>✅</span>
            <span className="font-medium">{resolvedIncidents.length} resolved</span>
          </div>
        </div>
      )}
    </div>
  );
}
