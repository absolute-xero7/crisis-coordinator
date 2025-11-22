'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ScenarioBuilder from '@/components/builder/ScenarioBuilder';
import { ScenarioDefinition } from '@/lib/types';
import { validateScenario } from '@/lib/scenarios/scenarioLoader';
import { DEFAULT_SCENARIO_DRAFT } from '@/lib/scenarioBuilder';
import {
  clearScenarioDraft,
  loadScenarioDraft,
  saveScenarioDraft,
} from '@/lib/scenarioStorage';

type SaveStatus = { type: 'idle' | 'success' | 'error'; message: string };

function ScenarioBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scenario, setScenario] = useState<ScenarioDefinition>(DEFAULT_SCENARIO_DRAFT);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>({ type: 'idle', message: '' });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const stored = loadScenarioDraft();
    if (stored) {
      setScenario(stored);
    }
  }, []);

  useEffect(() => {
    saveScenarioDraft(scenario);
  }, [scenario]);

  useEffect(() => {
    if (searchParams?.get('template') === 'path') {
      setScenario(DEFAULT_SCENARIO_DRAFT);
    }
  }, [searchParams]);

  const validation = useMemo(() => validateScenario(scenario), [scenario]);

  async function persistScenario(options?: { redirect?: boolean }) {
    if (!validation.valid) {
      setStatus({ type: 'error', message: 'Resolve validation errors to continue.' });
      return;
    }

    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    const payload: ScenarioDefinition = {
      ...scenario,
      metadata: {
        ...scenario.metadata,
        createdAt: scenario.metadata?.createdAt || new Date().toISOString(),
        createdBy: scenario.metadata?.createdBy || 'Scenario Builder',
        tags: scenario.metadata?.tags || ['custom', 'toronto'],
      },
    };

    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(message.error || 'Failed to save scenario');
      }

      const saved = (await response.json()) as ScenarioDefinition;
      setScenario(saved);
      clearScenarioDraft();
      saveScenarioDraft(saved);
      setStatus({ type: 'success', message: `Saved “${saved.name}”. Available in the console.` });

      if (options?.redirect) {
        router.push(`/console?scenario=${saved.id}`);
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to save scenario' });
    } finally {
      setSaving(false);
    }
  }

  function handleResetTemplate() {
    setScenario(DEFAULT_SCENARIO_DRAFT);
    setStatus({ type: 'idle', message: '' });
    clearScenarioDraft();
  }

  function handleDownloadJson() {
    const blob = new Blob([JSON.stringify(scenario, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${scenario.id || 'toronto-scenario'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJson(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const parsed = JSON.parse(text) as ScenarioDefinition;
        setScenario(parsed);
        setStatus({ type: 'success', message: `Loaded scenario “${parsed.name}” from file.` });
      } catch (error) {
        setStatus({ type: 'error', message: 'File was not valid scenario JSON.' });
      }
    });
  }

  return (
    <div className="min-h-screen bg-ops-bg text-gray-100 page-transition">
      <input
        type="file"
        accept="application/json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImportJson}
      />
      <div className="border-b border-ops-border bg-gradient-to-r from-ops-panel to-ops-panel-light px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between sticky top-0 z-50 shadow-lg backdrop-blur-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse-glow"></span>
            Scenario Builder
          </p>
          <h1 className="text-2xl font-display font-bold text-blue-300">Toronto Scenario Design Studio</h1>
          <p className="text-sm text-gray-400">Form-driven builder with map preview and validation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleResetTemplate}
            className="rounded-lg border-2 border-ops-border px-4 py-2 text-sm hover:bg-ops-panel-light hover:border-blue-500/50 transition-all duration-300"
          >
            🔄 Reset
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border-2 border-ops-border px-4 py-2 text-sm hover:bg-ops-panel-light hover:border-blue-500/50 transition-all duration-300"
          >
            📥 Import
          </button>
          <button
            onClick={handleDownloadJson}
            className="rounded-lg border-2 border-ops-border px-4 py-2 text-sm hover:bg-ops-panel-light hover:border-blue-500/50 transition-all duration-300"
          >
            📤 Export
          </button>
          <Link
            href="/console"
            className="rounded-lg border-2 border-ops-border px-4 py-2 text-sm hover:bg-ops-panel-light hover:border-blue-500/50 transition-all duration-300 flex items-center gap-1"
          >
            ← Console
          </Link>
          <button
            onClick={() => persistScenario()}
            disabled={saving}
            className="btn-secondary-enhanced px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? '⏳ Saving…' : '💾 Save Scenario'}
          </button>
          <button
            onClick={() => persistScenario({ redirect: true })}
            disabled={saving}
            className="btn-primary-enhanced px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? '⏳ Preparing…' : '🚀 Test Run'}
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {status.message && (
          <div
            className={`rounded-lg border-2 px-4 py-3 text-sm animate-fade-in flex items-center gap-2 ${
              status.type === 'success'
                ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-200'
                : status.type === 'error'
                ? 'border-red-500/50 bg-red-950/50 text-red-200'
                : 'border-ops-border bg-ops-panel'
            }`}
          >
            <span className="text-lg">
              {status.type === 'success' ? '✅' : status.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            {status.message}
          </div>
        )}

        <div className="rounded-lg border-2 bg-gradient-to-br from-ops-panel to-ops-panel-light p-4 text-sm text-gray-300 animate-fade-in-up animation-delay-100 ${validation.valid ? 'border-emerald-500/30' : 'border-amber-500/30'}">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{validation.valid ? '✅' : '⚠️'}</span>
            <p className="text-base font-semibold text-blue-300">Validation Status</p>
          </div>
          {validation.valid ? (
            <p className="mt-2 text-emerald-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow"></span>
              Scenario passes all validation checks. Ready to deploy!
            </p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-300">
              {validation.errors.map((err) => (
                <li key={err} className="leading-relaxed">{err}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="animate-fade-in-up animation-delay-200">
          <ScenarioBuilder scenario={scenario} onChange={setScenario} />
        </div>
      </div>
    </div>
  );
}

export default function ScenarioBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ops-bg flex items-center justify-center text-gray-400">
          Loading scenario builder...
        </div>
      }
    >
      <ScenarioBuilderContent />
    </Suspense>
  );
}
