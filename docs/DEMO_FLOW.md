# CrisisCoordinator Toronto Demo Flow

This guide outlines a full walkthrough for showcasing the CrisisCoordinator platform during a live or recorded demo. Each step highlights what to display, what to say, and what to click to keep the narrative tight and Toronto-focused.

---

## Demo Length Options

| Version | Duration | Sections to Include |
|---------|----------|---------------------|
| **Quick** | ~2 min | 1, 2, 3, 7 (skip explainability & builder) |
| **Standard** | ~4 min | All sections 1–7 |
| **Extended** | 6+ min | All sections + Bonus scenarios |

---

## 0. Pre-Demo Checklist
- ✅ Local dev server or deployed build running without errors (`npm run dev` or Vercel preview)
- ✅ Seeded Supabase DB (or mock) with PATH, DVP, Billy Bishop scenarios
- ✅ Browser tabs arranged:
  1. Landing page / hero section
  2. Console loaded with PATH scenario paused around **T+5:00**
  3. Console mid-scenario (T+20:00) showing hospital warnings
  4. Scenario Builder with draft scenario open
  5. Backup video (YouTube/VLC) in case of live issues
- ✅ Audio narration script printed / on secondary screen
- ✅ Screen resolution set to 1920×1080 or 1280×720 for recording clarity
- ✅ Keyboard shortcut reminder: **Space** toggles play/pause

---

## 1. Opening Hook (0:00–0:20)
1. Start on a dark slide or landing page.
2. Narrate: *"Monday, 8:30 AM. Toronto’s PATH network floods. Thousands trapped underground."*
3. Transition quickly to the console tab (Tab 2).

**Goal:** Establish urgency and Toronto context immediately.

---

## 2. Console Overview (0:20–1:00)

**Layout:** Split-screen design—Toronto map (65% left), operational sidebar (35% right) with Agent Panel, Incidents, and Timeline stacked vertically.

1. With PATH scenario paused at **T+5:00**, gesture across the Toronto map on the left.
2. Point out incident markers (King & Bay, Union Station, TD Centre).
3. Highlight the **T+ timer** in the header—critical for drill timing.
4. Call out the sidebar: *"All operational data visible at once—no scrolling needed."*
5. Mention real hospital names (Toronto General, St. Michael's, Mount Sinai) visible on the map.

**Key lines:**
- *"This isn't a generic map—these are real Toronto streets, stations, and hospitals."*
- *"The split-screen layout means coordinators never lose sight of critical information."*

---

## 3. Multi-Agent Spotlight (1:00–2:10)

1. Focus on the **Multi-Agent System** panel in the sidebar.
2. Point out the compact agent icons showing active/inactive status and confidence %.
3. **Click each agent card** to expand its decision details:
   - **Triage:** Show priority reasoning with PATH flood ranked highest.
   - **Resource:** Show TFS/EMS/TPS unit assignments to specific incidents.
   - **Logistics:** Show hospital routing decisions (Toronto General, St. Michael's capacity).
   - **Medical:** Show hospital load warnings and capacity alerts.
   - **Communications:** Display public alert referencing TTC or Metro Convention Centre.
4. Note the **Toronto Context tags** that appear below each decision.

**Talking points:**
- *"Five specialized AI agents coordinate like a real emergency ops center."*
- *"Every decision references actual Toronto infrastructure."*
- *"Click any agent to see its reasoning—full transparency."*

---

## 4. Explainability Moment (2:10–3:00)

1. **Click the Triage Agent card** to expand its decision panel.
2. Read a short excerpt from the reasoning text explaining why PATH evacuations outrank the York Street diabetic patient.
3. Highlight the **confidence percentage** and how it reflects scenario complexity.
4. Switch to the **Commander Summary** (if available) to show a high-level brief with TTC, hospital, and weather notes.

**Messaging:**
- *"We surface the 'why' behind every AI decision, so coordinators trust the recommendations."*
- *"No black boxes—every priority, every assignment is explainable."*

---

## 5. Live Simulation Burst (Optional 15–20 sec)

1. Hit **Play** (or press **Space**) for ~10 seconds to show:
   - Units moving on the map
   - Stats updating in the header (Incidents resolved, Hospital Load %)
   - Events streaming in the Timeline panel
2. Pause again (Space) before transitions to keep the state controlled.

**Optional narration:** *"Notice how hospital utilization spikes as casualties arrive—the Medical Agent will flag capacity warnings."*

---

## 6. Scenario Builder Showcase (3:00–3:40)

1. Switch to the builder tab (Tab 4) or click **"Scenario Builder"** link in console header.
2. Walk through the layout briefly:
   - **Basic Info:** Scenario name, Toronto neighborhood focus
   - **Incident cards:** Address inputs with geocoding, severity levels
   - **Scripted events:** Trigger times in T+MM:SS format
   - **Resources:** TFS/EMS/TPS unit configuration
   - **Hospitals:** Toronto facility checkboxes
3. Click **"Validate"** (if available) or describe live validation messages.
4. Mention Save/Test workflow: saving exposes scenario in console dropdown immediately.

**Narration focus:**
- *"Any Toronto coordinator can create their own drill—Chinatown fires, Etobicoke outages, Scarborough transit disruptions."*
- *"No coding required. Build, save, and run in minutes."*

---

## 7. Wrap & Call to Action (3:40–4:00)
1. Return to the main console view.
2. Deliver final message:
   - *"CrisisCoordinator gives Toronto emergency teams transparent, city-specific AI support."*
   - *"Built for training today, adaptable to real-time decision support tomorrow."*
3. End on the logo / demo URL.

---

## Bonus: Alternative Scenario Beats
If time allows or for longer demos:
- **DVP Blizzard Scenario:** emphasize cold-weather triage, hypothermia, Sunnybrook diversion.
- **Billy Bishop Scenario:** highlight marine units, fuel spill hazmat, waterfront crowd management.
- **Custom Scenario (Builder → Console):** demonstrate saving a scenario in the builder and immediately loading it in the console.

---

## Troubleshooting Tips
- If Supabase API fails, switch to a backup JSON scenario stored locally and refresh the page.
- If LLM calls are blocked, mention “development mode” fallback reasoning and continue.
- Keep a static PNG of the console as an emergency backup slide.

---

Deliver this flow with energy, keep Toronto specifics front and center, and remind the audience that every decision is auditable—exactly what emergency coordinators demand.

---

## Visual Reference Guide

When creating screenshots or video captures, ensure you capture these key views:

| Section | Screenshot to Capture |
|---------|----------------------|
| Console Overview | Full split-screen layout with map + sidebar visible |
| Agent Panel | Expanded agent card showing reasoning + Toronto Context tags |
| Incidents | Incident list with severity indicators and status badges |
| Timeline | Event log showing decision and arrival events |
| Scenario Builder | Form with incident cards and resource configuration |
| Header | T+ timer, incident stats, hospital load percentage |

**Tip:** Use browser DevTools (Cmd+Shift+P → "Capture full size screenshot") for clean captures without scrollbars.
