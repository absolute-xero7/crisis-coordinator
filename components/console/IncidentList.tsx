import { Incident } from '@/lib/types';
import { formatTime } from '@/lib/utils/timeUtils';

interface IncidentListProps {
  incidents: Incident[];
}

export default function IncidentList({ incidents }: IncidentListProps) {
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');

  return (
    <div className="ops-panel p-4 flex flex-col h-full">
      <h2 className="text-lg font-display font-semibold mb-4">Active Incidents</h2>

      <div className="flex-1 overflow-y-auto space-y-2">
        {activeIncidents.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No active incidents</p>
        )}

        {activeIncidents.map((incident) => (
          <div key={incident.id} className="ops-panel-light p-3 rounded">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="severity-indicator"
                  style={{
                    backgroundColor: `var(--severity-${incident.severity >= 5 ? 'critical' : incident.severity >= 4 ? 'high' : incident.severity >= 3 ? 'medium' : 'low'})`,
                  }}
                ></span>
                <span className="font-mono text-xs font-semibold">{incident.id}</span>
              </div>
              <span className={`status-badge status-${incident.status}`}>
                {incident.status}
              </span>
            </div>

            {/* Type & Location */}
            <div className="mb-2">
              <div className="text-sm font-semibold text-gray-200">
                {incident.type.toUpperCase()}
              </div>
              <div className="text-xs text-gray-400">
                {incident.location.address || `Grid ${incident.location.x},${incident.location.y}`}
              </div>
            </div>

            {/* Details */}
            <div className="text-xs text-gray-400 mb-2 line-clamp-2">
              {incident.details}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>👥 {incident.peopleAffected}</span>
              <span>🚨 {incident.assignedResources.length} units</span>
              <span>{formatTime(incident.reportedAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Resolved Count */}
      {resolvedIncidents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-ops-border">
          <div className="text-sm text-gray-400 text-center">
            ✅ {resolvedIncidents.length} incident{resolvedIncidents.length !== 1 ? 's' : ''}{' '}
            resolved
          </div>
        </div>
      )}
    </div>
  );
}
