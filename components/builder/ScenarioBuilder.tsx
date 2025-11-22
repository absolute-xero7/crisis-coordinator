import { useMemo } from 'react';
import { ScenarioDefinition } from '@/lib/types';
import IncidentForm from './IncidentForm';
import EventForm from './EventForm';
import ResourceConfig from './ResourceConfig';
import MapPreview from './MapPreview';
import {
  createIncidentTemplate,
  createScriptedEventTemplate,
  SPECIALIZED_UNITS,
} from '@/lib/scenarioBuilder';
import { TORONTO_HOSPITALS, TORONTO_SHELTERS } from '@/lib/torontoData';

interface ScenarioBuilderProps {
  scenario: ScenarioDefinition;
  onChange: (scenario: ScenarioDefinition) => void;
}

export default function ScenarioBuilder({ scenario, onChange }: ScenarioBuilderProps) {
  function updateScenario(partial: Partial<ScenarioDefinition>) {
    onChange({ ...scenario, ...partial });
  }

  const hospitalOptions = useMemo(() => TORONTO_HOSPITALS, []);
  const shelterOptions = useMemo(() => TORONTO_SHELTERS, []);

  function toggleHospital(id: string) {
    const exists = scenario.hospitals.some((hospital) => hospital.id === id);
    if (exists) {
      updateScenario({
        hospitals: scenario.hospitals.filter((hospital) => hospital.id !== id),
      });
    } else {
      const template = hospitalOptions.find((hospital) => hospital.id === id);
      if (template) {
        updateScenario({ hospitals: [...scenario.hospitals, { ...template }] });
      }
    }
  }

  function toggleShelter(id: string) {
    const exists = scenario.shelters.some((shelter) => shelter.id === id);
    if (exists) {
      updateScenario({ shelters: scenario.shelters.filter((shelter) => shelter.id !== id) });
    } else {
      const template = shelterOptions.find((shelter) => shelter.id === id);
      if (template) {
        updateScenario({ shelters: [...scenario.shelters, { ...template }] });
      }
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <section className="space-y-6">
        <div className="rounded border border-ops-border bg-ops-panel p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Basic Scenario Info</h2>
            <p className="text-sm text-gray-400">
              Define duration, area of focus, and metadata for Toronto emergency drills.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase tracking-wide text-gray-400">
              Scenario ID
              <input
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                value={scenario.id}
                onChange={(event) => updateScenario({ id: event.target.value })}
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-gray-400">
              Name
              <input
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                value={scenario.name}
                onChange={(event) => updateScenario({ name: event.target.value })}
              />
            </label>
          </div>
          <label className="text-xs uppercase tracking-wide text-gray-400">
            Description
            <textarea
              className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
              rows={3}
              value={scenario.description}
              onChange={(event) => updateScenario({ description: event.target.value })}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-xs uppercase tracking-wide text-gray-400">
              Duration (minutes)
              <input
                type="number"
                min={10}
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                value={scenario.duration}
                onChange={(event) => updateScenario({ duration: Number(event.target.value || '0') })}
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-gray-400">
              City Width
              <input
                type="number"
                min={10}
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                value={scenario.citySize.width}
                onChange={(event) =>
                  updateScenario({
                    citySize: { ...scenario.citySize, width: Math.max(10, Number(event.target.value || '10')) },
                  })
                }
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-gray-400">
              City Height
              <input
                type="number"
                min={10}
                className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                value={scenario.citySize.height}
                onChange={(event) =>
                  updateScenario({
                    citySize: { ...scenario.citySize, height: Math.max(10, Number(event.target.value || '10')) },
                  })
                }
              />
            </label>
          </div>
          <label className="text-xs uppercase tracking-wide text-gray-400">
            Location Focus
            <input
              className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
              value={scenario.locationFocus}
              onChange={(event) => updateScenario({ locationFocus: event.target.value })}
            />
          </label>
        </div>

        <div className="rounded border border-ops-border bg-ops-panel p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Initial Incidents</h2>
              <p className="text-sm text-gray-400">Map out Toronto incidents with severity, location, and context.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateScenario({
                  initialIncidents: [...scenario.initialIncidents, createIncidentTemplate(scenario.initialIncidents.length)],
                })
              }
              className="rounded border border-ops-border px-3 py-2 text-xs hover:bg-ops-panel-light"
            >
              + Add Incident
            </button>
          </div>
          <div className="space-y-4">
            {scenario.initialIncidents.map((incident, index) => (
              <IncidentForm
                key={incident.id}
                incident={incident}
                citySize={scenario.citySize}
                onChange={(updated) => {
                  const next = [...scenario.initialIncidents];
                  next[index] = updated;
                  updateScenario({ initialIncidents: next });
                }}
                onRemove={() => {
                  const next = scenario.initialIncidents.filter((_, i) => i !== index);
                  updateScenario({ initialIncidents: next });
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded border border-ops-border bg-ops-panel p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Scripted Events</h2>
              <p className="text-sm text-gray-400">Introduce TTC outages, weather shifts, or secondary incidents.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateScenario({
                  scriptedEvents: [...scenario.scriptedEvents, createScriptedEventTemplate(scenario.scriptedEvents.length)],
                })
              }
              className="rounded border border-ops-border px-3 py-2 text-xs hover:bg-ops-panel-light"
            >
              + Add Event
            </button>
          </div>
          {scenario.scriptedEvents.length === 0 && (
            <p className="text-sm text-gray-500">No scripted events yet. Use them to escalate complexity mid-run.</p>
          )}
          <div className="space-y-4">
            {scenario.scriptedEvents.map((event, index) => (
              <EventForm
                key={event.id}
                event={event}
                citySize={scenario.citySize}
                onChange={(updated) => {
                  const next = [...scenario.scriptedEvents];
                  next[index] = updated;
                  updateScenario({ scriptedEvents: next });
                }}
                onRemove={() => {
                  const next = scenario.scriptedEvents.filter((_, i) => i !== index);
                  updateScenario({ scriptedEvents: next });
                }}
              />
            ))}
          </div>
        </div>

        <ResourceConfig
          resources={scenario.resources}
          onChange={(resources) => updateScenario({ resources })}
        />

        <div className="rounded border border-ops-border bg-ops-panel p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Hospitals & Shelters</h2>
            <p className="text-sm text-gray-400">
              Toronto General, St. Michael&rsquo;s, Sunnybrook, and more. Toggle capacity per site.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-gray-400">Hospitals</p>
            <div className="grid gap-2 md:grid-cols-2">
              {hospitalOptions.map((hospital) => {
                const checked = scenario.hospitals.some((h) => h.id === hospital.id);
                return (
                  <label
                    key={hospital.id}
                    className={`flex items-center gap-2 rounded border border-ops-border px-3 py-2 text-sm cursor-pointer ${
                      checked ? 'bg-ops-panel-light' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-emerald-500"
                      checked={checked}
                      onChange={() => toggleHospital(hospital.id)}
                    />
                    {hospital.name}
                  </label>
                );
              })}
            </div>

            {scenario.hospitals.length > 0 && (
              <div className="mt-3 space-y-3">
                {scenario.hospitals.map((hospital, index) => (
                  <div key={hospital.id} className="rounded border border-ops-border bg-ops-panel-light p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{hospital.name}</p>
                        <p className="text-xs text-gray-500">{hospital.address}</p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-red-300 hover:text-red-200"
                        onClick={() =>
                          updateScenario({
                            hospitals: scenario.hospitals.filter((_, i) => i !== index),
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3 mt-3">
                      <label className="text-xs uppercase text-gray-400 tracking-wide">
                        Capacity Total
                        <input
                          type="number"
                          min={1}
                          className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                          value={hospital.capacityTotal}
                          onChange={(event) => {
                            const next = [...scenario.hospitals];
                            next[index] = { ...hospital, capacityTotal: Number(event.target.value || '0') };
                            updateScenario({ hospitals: next });
                          }}
                        />
                      </label>
                      <label className="text-xs uppercase text-gray-400 tracking-wide">
                        Capacity Used
                        <input
                          type="number"
                          min={0}
                          className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                          value={hospital.capacityUsed}
                          onChange={(event) => {
                            const next = [...scenario.hospitals];
                            next[index] = { ...hospital, capacityUsed: Number(event.target.value || '0') };
                            updateScenario({ hospitals: next });
                          }}
                        />
                      </label>
                      <label className="text-xs uppercase text-gray-400 tracking-wide">
                        Specialties
                        <input
                          className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                          value={hospital.specialties?.join(', ') || ''}
                          onChange={(event) => {
                            const next = [...scenario.hospitals];
                            next[index] = { ...hospital, specialties: event.target.value.split(',').map((s) => s.trim()) };
                            updateScenario({ hospitals: next });
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-gray-400">Shelters & Safe Zones</p>
            <div className="grid gap-2 md:grid-cols-2">
              {shelterOptions.map((shelter) => {
                const checked = scenario.shelters.some((s) => s.id === shelter.id);
                return (
                  <label
                    key={shelter.id}
                    className={`flex items-center gap-2 rounded border border-ops-border px-3 py-2 text-sm cursor-pointer ${
                      checked ? 'bg-ops-panel-light' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-emerald-500"
                      checked={checked}
                      onChange={() => toggleShelter(shelter.id)}
                    />
                    {shelter.name}
                  </label>
                );
              })}
            </div>

            {scenario.shelters.length > 0 && (
              <div className="mt-3 space-y-3">
                {scenario.shelters.map((shelter, index) => (
                  <div key={shelter.id} className="rounded border border-ops-border bg-ops-panel-light p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{shelter.name}</p>
                        <p className="text-xs text-gray-500">{shelter.address}</p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-red-300 hover:text-red-200"
                        onClick={() =>
                          updateScenario({ shelters: scenario.shelters.filter((_, i) => i !== index) })
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 mt-3">
                      <label className="text-xs uppercase text-gray-400 tracking-wide">
                        Capacity
                        <input
                          type="number"
                          min={0}
                          className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                          value={shelter.capacityTotal}
                          onChange={(event) => {
                            const next = [...scenario.shelters];
                            next[index] = { ...shelter, capacityTotal: Number(event.target.value || '0') };
                            updateScenario({ shelters: next });
                          }}
                        />
                      </label>
                      <label className="text-xs uppercase text-gray-400 tracking-wide">
                        Currently Used
                        <input
                          type="number"
                          min={0}
                          className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
                          value={shelter.capacityUsed}
                          onChange={(event) => {
                            const next = [...scenario.shelters];
                            next[index] = { ...shelter, capacityUsed: Number(event.target.value || '0') };
                            updateScenario({ shelters: next });
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <MapPreview scenario={scenario} />

        <div className="rounded border border-ops-border bg-ops-panel p-4 text-sm text-gray-300">
          <h3 className="text-lg font-semibold mb-2">Scenario Metadata</h3>
          <dl className="space-y-1">
            <div className="flex justify-between"><dt className="text-gray-500">Incidents</dt><dd>{scenario.initialIncidents.length}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Events</dt><dd>{scenario.scriptedEvents.length}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Hospitals</dt><dd>{scenario.hospitals.length}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Shelters</dt><dd>{scenario.shelters.length}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Resources</dt><dd>
              {scenario.resources.fireUnits + scenario.resources.ambulances + scenario.resources.policeUnits}
            </dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Specialized</dt><dd>{scenario.resources.specialized.length}/{SPECIALIZED_UNITS.length}</dd></div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
