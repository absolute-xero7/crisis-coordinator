import { ChangeEvent } from 'react';
import { ScenarioDefinition } from '@/lib/types';
import { SPECIALIZED_UNITS } from '@/lib/scenarioBuilder';

interface ResourceConfigProps {
  resources: ScenarioDefinition['resources'];
  onChange: (resources: ScenarioDefinition['resources']) => void;
}

export default function ResourceConfig({ resources, onChange }: ResourceConfigProps) {
  function handleCountChange(key: keyof ScenarioDefinition['resources']) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(0, Number(event.target.value || '0'));
      onChange({ ...resources, [key]: value });
    };
  }

  function toggleSpecialized(id: string) {
    const exists = resources.specialized.includes(id);
    onChange({
      ...resources,
      specialized: exists
        ? resources.specialized.filter((item) => item !== id)
        : [...resources.specialized, id],
    });
  }

  return (
    <div className="rounded border border-ops-border bg-ops-panel p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Available Resources</h3>
        <p className="text-sm text-gray-400">
          Model TFS, Paramedic Services, and TPS availability at scenario start.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          Fire Units
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={resources.fireUnits}
            onChange={handleCountChange('fireUnits')}
          />
        </label>
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          Ambulances
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={resources.ambulances}
            onChange={handleCountChange('ambulances')}
          />
        </label>
        <label className="text-xs uppercase text-gray-400 tracking-wide">
          Police Units
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded border border-ops-border bg-ops-bg p-2 text-sm"
            value={resources.policeUnits}
            onChange={handleCountChange('policeUnits')}
          />
        </label>
      </div>

      <div>
        <p className="text-xs uppercase text-gray-400 tracking-wide mb-2">Specialized Teams</p>
        <div className="grid gap-2 md:grid-cols-2">
          {SPECIALIZED_UNITS.map((unit) => {
            const checked = resources.specialized.includes(unit.id);
            return (
              <label
                key={unit.id}
                className={`flex items-center gap-2 rounded border border-ops-border px-3 py-2 text-sm cursor-pointer ${
                  checked ? 'bg-ops-panel-light' : ''
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-emerald-500"
                  checked={checked}
                  onChange={() => toggleSpecialized(unit.id)}
                />
                {unit.label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
