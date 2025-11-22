# DEMO_SCRIPT.md – 4-Minute Presentation

## Setup Checklist
- **Tabs**: Landing page, Console (PATH scenario paused at T+05:00), Console (T+20:00 hospital stress), Scenario Builder, Backup video.
- **Screen Size**: 1440×900 preferred; zoom 90% to fit full console.
- **Data Prep**: Run `npm run dev`, ensure Supabase URL keys present, pre-save the "PATH Flood & Union Station" custom scenario for builder demo.

## Minute-by-Minute Flow

### 0:00 – 1:00 · Hook & Stakes
1. **Visual**: Landing page hero with Toronto skyline fade-in.
2. **Script**: “Imagine Monday, 8:30 AM. Water main ruptures at King & Bay. The PATH—30km of tunnels—is flooding. 2,000 commuters underground. Union Station evacuating while rush hour gridlocks King Street. You’re the coordinator deciding who gets help first.”
3. **Action**: Click “Open Operations Console.” Pause simulation at T+05:00 showing stacked incidents.

### 1:00 – 2:00 · Multi-Agent System
1. **Focus**: Agent panel (now visible beside the map).
2. **Lines**:
   - “Five AI agents assist Toronto coordinators: Triage prioritizes incidents, Resource dispatches TFS/EMS/TPS units, Logistics routes to hospitals, Medical watches capacity, Communications drafts alerts.”
   - Highlight countdown + last-sync indicator to prove agents are live.
3. **Action**: Click each agent card; open reasoning for Triage to show Toronto-specific trade-offs (“PATH flood vs York Street diabetic patient”).
4. **Show**: Map with unit markers + hospital capacity bars.

### 2:00 – 3:00 · Explainability + Toronto Context
1. **Commander Summary**: scroll to show TTC Line 1 suspension, Metro Convention Centre shelter, St. Michael’s 85% utilization.
2. **Quote**: “Every recommendation cites real Toronto geography—hospitals, TTC lines, shelters—so coordinators understand the ‘why,’ not just the ‘what.’”
3. **Event Log**: Point out timeline of scripted events (gas leak, secondary flooding) to show situational awareness.
4. **Stats Panel**: Mention resolved incidents + hospital utilization metrics for human-in-the-loop confidence.

### 3:00 – 4:00 · Scenario Builder + Close
1. **Navigate**: Switch to `/console/builder`.
2. **Demo**:
   - Edit Basic Info: change duration to 90 minutes.
   - Add Incident via form (severity slider, grid coords, address autocomplete field).
   - Show Map Preview updating live.
   - Add scripted event (“T+30:00 TTC Line 1 power failure”).
   - Press **Test Run** → console auto-loads custom scenario through query param.
3. **Close Script**:
   - “CrisisCoordinator is a human-centered AI copilot for Toronto’s Emergency Operations Centre—transparent, Toronto-aware, and configurable in minutes.”
   - “Because when disaster hits our city, every decision matters, and every decision deserves an explanation.”

## Backup Talking Points
- Hospitals modeled: Toronto General, St. Michael’s, Mount Sinai, Sunnybrook, North York General.
- Resources include TFS pumpers/aerials, TPS traffic units, Paramedic mass-casualty bus.
- Builder exports/imports JSON for regional sharing; saves to Supabase and local draft for iterative authoring.
- Ethical stance: Training prototype, not production dispatch; human retains final say.

## Q&A Reference
- **Why Human-Centered?** Transparent reasoning + Toronto data keep coordinators in control.
- **Scalability?** Scenario Builder demonstrates how other cities could upload their own geography + infrastructure.
- **LLM Safety?** Agents run every 60s with deterministic simulation state; human can pause/override anytime.
