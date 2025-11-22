import { ScenarioDefinition } from '@/lib/types';
import { INCIDENT_TYPE_OPTIONS } from '@/lib/scenarioBuilder';

interface EventFormProps {
  event: ScenarioDefinition['scriptedEvents'][number];
  citySize: ScenarioDefinition['citySize'];
  onChange: (event: ScenarioDefinition['scriptedEvents'][number]) => void;
  onRemove: () => void;
}

const EVENT_TYPES: ScenarioDefinition['scriptedEvents'][number]['type'][] = [
  'spawn_incident',
  'hospital_capacity',
  'weather',
  'road_closure',
];

export default function EventForm({ event, citySize, onChange, onRemove }: EventFormProps) {
  const minutes = Math.floor((event.triggerTime || 0) / 60);
  const seconds = (event.triggerTime || 0) % 60;

  function updatePayload(payload: any) {
    onChange({ ...event, payload: { ...(event.payload || {}), ...payload } });
  }

  function renderPayloadFields() {
    switch (event.type) {
      case 'spawn_incident': {
        const payload = {
          id: event.payload?.id || `${event.id}-incident`,
          type: event.payload?.type || 'medical',
          location: event.payload?.location || { x: 6, y: 6 },
          severity: event.payload?.severity || 3,
          peopleAffected: event.payload?.peopleAffected || 20,
          details: event.payload?.details || 'Describe the secondary incident.',
        };
        return (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-xs uppercase text-gray-400 tracking-wide">
                Incident ID
                <input
                  className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                  value={payload.id}
                  onChange={(event) => updatePayload({ ...payload, id: event.target.value })}
                />
              </label>
              <label className="text-xs uppercase text-gray-400 tracking-wide">
                Type
                <select
                  className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                  value={payload.type}
                  onChange={(event) => updatePayload({ ...payload, type: event.target.value })}
                >
                  {INCIDENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs uppercase text-gray-400 tracking-wide">
                Severity {payload.severity}/5
                <input
                  type="range"
                  min={1}
                  max={5}
                  className="mt-1 w-full"
                  value={payload.severity}
                  onChange={(event) =>
                    updatePayload({ ...payload, severity: Number(event.target.value) })
                  }
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
                  value={payload.location.x}
                  onChange={(event) =>
                    updatePayload({
                      ...payload,
                      location: {
                        ...payload.location,
                        x: Math.min(Math.max(0, Number(event.target.value)), citySize.width - 1),
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
                  value={payload.location.y}
                  onChange={(event) =>
                    updatePayload({
                      ...payload,
                      location: {
                        ...payload.location,
                        y: Math.min(Math.max(0, Number(event.target.value)), citySize.height - 1),
                      },
                    })
                  }
                />
              </label>
              <label className="text-xs uppercase text-gray-400 tracking-wide">
                People Affected
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                  value={payload.peopleAffected}
                  onChange={(event) =>
                    updatePayload({ ...payload, peopleAffected: Math.max(0, Number(event.target.value)) })
                  }
                />
              </label>
              <label className="text-xs uppercase text-gray-400 tracking-wide">
                Address
                <input
                  className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                  value={payload.location.address || ''}
                  onChange={(event) =>
                    updatePayload({
                      ...payload,
                      location: { ...payload.location, address: event.target.value },
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
                value={payload.details}
                onChange={(event) => updatePayload({ ...payload, details: event.target.value })}
              />
            </label>
          </div>
        );
      }
      case 'hospital_capacity': {
        const payload = {
          hospitalId: event.payload?.hospitalId || 'toronto-general',
          capacityTotal: event.payload?.capacityTotal || 60,
          capacityUsed: event.payload?.capacityUsed || 50,
          note: event.payload?.note || 'Adjust surge / diversion status.',
        };
        return (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs uppercase text-gray-400 tracking-wide">
              Hospital ID
              <input
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                value={payload.hospitalId}
                onChange={(event) => updatePayload({ ...payload, hospitalId: event.target.value })}
              />
            </label>
            <label className="text-xs uppercase text-gray-400 tracking-wide">
              Capacity Used
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                value={payload.capacityUsed}
                onChange={(event) => updatePayload({ ...payload, capacityUsed: Number(event.target.value) })}
              />
            </label>
            <label className="text-xs uppercase text-gray-400 tracking-wide">
              Capacity Total
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                value={payload.capacityTotal}
                onChange={(event) => updatePayload({ ...payload, capacityTotal: Number(event.target.value) })}
              />
            </label>
            <label className="text-xs uppercase text-gray-400 tracking-wide">
              Note
              <input
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                value={payload.note}
                onChange={(event) => updatePayload({ ...payload, note: event.target.value })}
              />
            </label>
          </div>
        );
      }
      default: {
        const payload = {
          description: event.payload?.description || 'Describe how this affects operations.',
          impact: event.payload?.impact || 'Transit disruption, visibility issues, etc.',
        };
        return (
          <div className="space-y-3">
            <label className="text-xs uppercase text-gray-400 tracking-wide">
              Description
              <textarea
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                rows={3}
                value={payload.description}
                onChange={(event) => updatePayload({ ...payload, description: event.target.value })}
              />
            </label>
            <label className="text-xs uppercase text-gray-400 tracking-wide">
              Operational Impact
              <textarea
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                rows={2}
                value={payload.impact}
                onChange={(event) => updatePayload({ ...payload, impact: event.target.value })}
              />
            </label>
          </div>
        );
      }
    }
  }

  return (
    <div className="rounded border border-ops-border bg-ops-panel-light p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{event.id}</p>
          <p className="text-xs text-gray-500">Scripted event fires mid-scenario</p>
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
          Event Type
          <select
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={event.type}
            onChange={(evt) => onChange({ ...event, type: evt.target.value as any })}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          T+ Minutes
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={minutes}
            onChange={(evt) => onChange({ ...event, triggerTime: Number(evt.target.value || '0') * 60 + seconds })}
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
            onChange={(evt) =>
              onChange({ ...event, triggerTime: minutes * 60 + Math.min(59, Number(evt.target.value || '0')) })
            }
          />
        </label>
      </div>

      {renderPayloadFields()}
    </div>
  );
}
