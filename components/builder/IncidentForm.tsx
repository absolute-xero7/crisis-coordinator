import { ChangeEvent } from 'react';
import { ScenarioDefinition } from '@/lib/types';
import { INCIDENT_TYPE_OPTIONS } from '@/lib/scenarioBuilder';

interface IncidentFormProps {
  incident: ScenarioDefinition['initialIncidents'][number];
  citySize: ScenarioDefinition['citySize'];
  onChange: (incident: ScenarioDefinition['initialIncidents'][number]) => void;
  onRemove: () => void;
}

function clampCoordinate(value: number, max: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(Math.max(0, value), max - 1);
}

export default function IncidentForm({ incident, citySize, onChange, onRemove }: IncidentFormProps) {
  const minutes = Math.floor((incident.reportedAt || 0) / 60);
  const seconds = (incident.reportedAt || 0) % 60;

  function handleNumberChange(
    event: ChangeEvent<HTMLInputElement>,
    key: keyof ScenarioDefinition['initialIncidents'][number],
    parser: (value: number) => number = (v) => v
  ) {
    const value = Number(event.target.value || '0');
    onChange({
      ...incident,
      [key]: parser(value),
    });
  }

  return (
    <div className="rounded border border-ops-border bg-ops-panel-light p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{incident.id}</p>
          <p className="text-xs text-gray-500">Configure Toronto-specific details</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-300 hover:text-red-200"
        >
          Remove
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          Type
          <select
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={incident.type}
            onChange={(event) => onChange({ ...incident, type: event.target.value as any })}
          >
            {INCIDENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs uppercase text-gray-400 tracking-wide">
          Severity {incident.severity}/5
          <input
            type="range"
            min={1}
            max={5}
            className="mt-1 w-full"
            value={incident.severity}
            onChange={(event) =>
              onChange({ ...incident, severity: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 })
            }
          />
        </label>

        <label className="text-xs uppercase text-gray-400 tracking-wide">
          People Affected
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={incident.peopleAffected}
            onChange={(event) => handleNumberChange(event, 'peopleAffected', (v) => Math.max(0, v))}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          Grid X
          <input
            type="number"
            min={0}
            max={citySize.width - 1}
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={incident.location.x}
            onChange={(event) =>
              onChange({
                ...incident,
                location: {
                  ...incident.location,
                  x: clampCoordinate(Number(event.target.value), citySize.width),
                },
              })
            }
          />
        </label>
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          Grid Y
          <input
            type="number"
            min={0}
            max={citySize.height - 1}
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={incident.location.y}
            onChange={(event) =>
              onChange({
                ...incident,
                location: {
                  ...incident.location,
                  y: clampCoordinate(Number(event.target.value), citySize.height),
                },
              })
            }
          />
        </label>
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          T+ Minutes
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={minutes}
            onChange={(event) => {
              const mins = Number(event.target.value || '0');
              onChange({ ...incident, reportedAt: mins * 60 + seconds });
            }}
          />
        </label>
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          Seconds
          <input
            type="number"
            min={0}
            max={59}
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={seconds}
            onChange={(event) => {
              const secs = clampCoordinate(Number(event.target.value), 60);
              onChange({ ...incident, reportedAt: minutes * 60 + Math.min(59, secs) });
            }}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          Address / Landmark
          <input
            type="text"
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={incident.location.address || ''}
            onChange={(event) =>
              onChange({
                ...incident,
                location: { ...incident.location, address: event.target.value },
              })
            }
          />
        </label>
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          Neighborhood
          <input
            type="text"
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={incident.location.neighborhood || ''}
            onChange={(event) =>
              onChange({
                ...incident,
                location: { ...incident.location, neighborhood: event.target.value },
              })
            }
          />
        </label>
      </div>

      <label className="text-xs uppercase text-gray-400 tracking-wide">
        Details
        <textarea
          className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
          rows={3}
          value={incident.details}
          onChange={(event) => onChange({ ...incident, details: event.target.value })}
        />
      </label>
    </div>
  );
}
