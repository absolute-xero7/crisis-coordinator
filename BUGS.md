# BUGS.md – QA Tracker

_Last updated: 2025-11-21_

## Test Matrix

| Area | Scenario | Result | Notes |
| --- | --- | --- | --- |
| Simulation Engine | PATH Flooding baseline run (T+0 → T+75) | ✅ | Agents trigger every 60s, scripted events fire on schedule. |
| Simulation Engine | DVP Blizzard scenario | ✅ | Cold-weather scripted events spawn correctly; hospital diversion warnings logged. |
| Simulation Engine | Billy Bishop scenario | ✅ | Marine resources deploy; hospital routing remains within capacity. |
| Scenario Builder | Create + save new scenario | ✅ | Validation warnings shown for invalid inputs; save writes to Supabase + localStorage. |
| Scenario Builder | Test Run redirect | ✅ | After save, console opens with query `?scenario=<id>` and auto-selects the custom draft. |
| Scenario Builder | Import / Export JSON | ✅ | Round-trips existing draft without data loss. |
| UI Responsiveness | Console layout @ 1440px / 1200px widths | ✅ | Map + agent panel stay visible; Event Log stacks beneath panel on narrow widths. |
| Accessibility | Keyboard navigation on builder form | ⚠️ | Inputs accessible, but add/remove buttons need `aria-label`s for full clarity. |

## Known Issues / Backlog

1. **LLM Cost Guardrails** – No rate limiting on agent execution; rapidly adjusting sim speed can trigger multiple agent batches. _Severity: Medium. Suggested fix: debounce agent loop or add queued state._
2. **Scenario Builder Payload Editing** – Scripted events other than `spawn_incident` offer limited structured inputs (e.g., road closures lack street picker). _Severity: Low. Enhancement to add purpose-built fieldsets per event type._
3. **Accessibility Labels** – “Remove” buttons on incidents/events repeat the same text; screen reader users cannot distinguish without context. _Severity: Low. Add `aria-label` with incident/event id._
4. **ESLint Dependency Conflict** – `eslint-config-next@16` requires ESLint ≥9; repo currently installs 8.57.1. _Severity: High. Blocker for CI until version mismatch resolved._
5. **Mobile Layout** – Below 1024px width the console falls back to stacked layout, but controls overflow the bottom safe area on very short devices. _Severity: Low. Need extra padding for notch devices._

## Recently Fixed

- Scenario Builder upgraded from raw JSON textarea to guided form with live map preview, validation, and test-run workflow.
- Console center column refactored to flex layout so Toronto map + agent panel stay within viewport and no longer overlap with Event Log.
- Agent panel now shows sync timestamps and countdown for next reasoning cycle, giving users visibility into agent progress.

## Manual Regression Checklist

- [x] Start/stop controls work after scenario change.
- [x] Agent panel reasoning drawers open and close without console errors.
- [x] Custom scenario saved via builder appears in console dropdown (requires Supabase connectivity).
- [x] Map preview accurately reflects grid coordinates entered in builder.
- [x] Event Log caps to 50 most recent entries to avoid perf hits.

Please add new issues under "Known Issues" with severity + repro steps when discovered.
