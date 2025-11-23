# 🎬 CrisisCoordinator: Toronto Demo Script (Under 5 Minutes)

## Pre-Demo Setup Checklist

- [ ] Open browser to `http://localhost:3000/console`
- [ ] Ensure **Demo Mode: ON** (green button in header)
- [ ] Select **"PATH System Flood"** scenario from dropdown
- [ ] Simulation **paused at T+00:00**
- [ ] Screen: 1440×900 preferred, zoom 90% to fit full console
- [ ] Backup: Have video recording ready in case of technical issues

---

## 0. The Hook (0:00–0:30)

**[Visual: Console paused at T+00:00, map showing downtown Toronto with red incident markers]**

**Speaker:** "It's Monday morning, 8:30 AM. A water main bursts in Toronto's PATH network. 2,000 commuters are trapped underground between Union Station and the TD Centre. Water is rising. You're the emergency coordinator. You have 50 units to deploy, 5 hospitals to manage, and 15 minutes before panic sets in."

**[Action: Gesture at the incident list showing the flood incidents]**

**Speaker:** "The cognitive load is impossible for one human. This is CrisisCoordinator—a multi-agent AI command center that turns chaos into clarity."

---

## 1. Starting the Simulation (0:30–1:00)

**[Action: Click PLAY button. Timeline starts advancing: T+00:01, T+00:02...]**

**Speaker:** "Watch what happens when we start the clock. The system is processing the incoming incident reports..."

**[Visual: At T+5 seconds, all 6 agent panels populate with data. "Synced @ T+05" appears]**

**Speaker:** "In 5 seconds, six AI agents have analyzed the situation. Triage has prioritized incidents. Resources are being dispatched. Look—the TFS trucks and ambulances are already moving on the map."

**[Action: Point to map showing unit icons moving toward incident markers]**

---

## 2. The Agent Conflict—The "Magic" (1:00–2:00)

**[Action: Click on "Commander AI" agent button (amber with conflict badge)]**

**Speaker:** "Here's where it gets interesting. See this conflict badge? Our agents don't always agree—and that's by design."

**[Visual: Commander panel opens showing the conflict section]**

**Speaker:** "The Medical Agent demanded immediate ambulance extraction via Bay Street for hypothermia patients at King Station. But the Logistics Agent rejected that route—Bay Street is gridlocked at 90% traffic density from the evacuation crowds."

**[Action: Point to the resolution text]**

**Speaker:** "The Commander AI resolved this automatically: reroute to University Avenue exit. ETA reduced by 8 minutes. In a flood, 8 minutes saves lives. The human operator didn't have to wade through radio chatter to figure this out."

---

## 3. Trust & Fairness—Human-Centered AI (2:00–2:50)

**[Action: Scroll down in Commander panel to show "Equity & Fairness Checks" section]**

**Speaker:** "But speed isn't enough. How do we trust the AI? We surface the 'why' behind every decision."

**[Visual: Blue panel showing equity checkmarks]**

**Speaker:** "Look at these equity checks. The system explicitly prioritized the PATH evacuation—2,000 trapped people—over a property alarm at the Ritz-Carlton. Human vulnerability over property value."

**[Action: Click on "Triage Agent" to show its reasoning]**

**Speaker:** "Every agent shows its reasoning. The Triage Agent explains: 'Mass-casualty and medical emergencies receive top priority regardless of location or property value.' This isn't a black box. It's an auditable, ethical system."

---

## 4. Real Toronto Infrastructure (2:50–3:30)

**[Action: Click on "Medical Agent" to show hospital routing]**

**Speaker:** "This isn't a generic simulation. These are real Toronto hospitals—St. Michael's, Toronto General, Mount Sinai."

**[Visual: Medical Agent showing hospital capacity alerts]**

**Speaker:** "The Medical Agent is monitoring capacity in real-time. St. Michael's is at 93%—it's recommending we divert non-critical cases to prevent overload."

**[Action: Click on "Logistics Agent"]**

**Speaker:** "Logistics is routing patients to the University Avenue hospital corridor and Sunnybrook for overflow. Every routing decision accounts for actual Toronto geography and traffic patterns."

---

## 5. Scenario Flexibility (3:30–4:10)

**[Action: Change scenario dropdown to "DVP Winter Blizzard"]**

**Speaker:** "The PATH flood is just one scenario. Watch this."

**[Visual: Map shifts to show Don Valley Parkway, new incident markers appear]**

**Speaker:** "Now we're simulating a 40-vehicle pileup on the DVP during a blizzard. Minus 25 wind chill. Hazmat spill. TTC buses stranded. Completely different crisis, same AI coordination."

**[Action: Click PLAY briefly, then pause. Point to scenario selector]**

**Speaker:** "We have three pre-built Toronto scenarios, and emergency managers can create custom drills in the Scenario Builder. Tabletop exercises that used to cost thousands of dollars and months to plan—now created in minutes."

---

## 6. Closing (4:10–4:30)

**[Action: Return to PATH Flooding scenario if time. Zoom out on map to show full response]**

**Speaker:** "CrisisCoordinator isn't about replacing human commanders. It's about empowering them. We reduce cognitive overload, surface conflicts before they become disasters, and ensure every decision is transparent and equitable."

**[Look at judges/camera]**

**Speaker:** "We're building the flight simulator for emergency management. So when the real crisis hits, Toronto's coordinators have already played through it fifty times. Thank you."

---

## ⏱️ Timing Summary

| Section | Time | Duration |
|---------|------|----------|
| Hook | 0:00-0:30 | 30 sec |
| Starting Simulation | 0:30-1:00 | 30 sec |
| Agent Conflict | 1:00-2:00 | 60 sec |
| Trust & Fairness | 2:00-2:50 | 50 sec |
| Toronto Infrastructure | 2:50-3:30 | 40 sec |
| Scenario Flexibility | 3:30-4:10 | 40 sec |
| Closing | 4:10-4:30 | 20 sec |
| **Total** | | **~4:30** |

---

## 🔑 Key Demo Points to Hit

1. **T+5 second reveal** - Agents sync visually after simulation starts
2. **Conflict badge on Commander** - Shows multi-agent disagreement
3. **Equity checkmarks** - Visible proof of fairness-aware AI
4. **Real Toronto names** - St. Michael's, TTC, Bay Street, PATH
5. **Multiple scenarios** - Switch dropdown to show flexibility

---

## ⚠️ Things to Avoid

- **Don't use Live Mode** - Claude API delays could kill demo flow
- **Don't wait too long at T+00:00** - Agents appear at T+5, keep it moving
- **Don't dive into scenario builder** - Mention it, don't demo it (time constraint)
- **Don't click too fast** - Let each panel render before moving on

---

## 🛡️ Backup Talking Points (for Q&A)

### Technical
- **Hospitals modeled**: Toronto General, St. Michael's, Mount Sinai, Sunnybrook, North York General
- **Resources**: TFS pumpers/aerials, TPS traffic units, Paramedic mass-casualty bus
- **LLM**: Claude API with parallel agent execution, ~2-3 second response time in live mode

### Human-Centered Design
- **Why transparent reasoning?** Coordinators need to trust recommendations; black boxes don't work in life-or-death situations
- **Why equity checks?** Emergency response historically disadvantages vulnerable populations; we make fairness explicit

### Scalability
- **Scenario Builder** exports/imports JSON for regional sharing
- Other cities could upload their own geography + infrastructure
- Training prototype, not production dispatch—human retains final say

---

## 📋 Q&A Quick Answers

**Q: Why human-centered?**
> Transparent reasoning + Toronto data keep coordinators in control. Every decision shows the "why."

**Q: How does it scale?**
> Scenario Builder lets any city create custom emergencies. JSON import/export for sharing.

**Q: Is this safe to use?**
> Training prototype only. Agents run with deterministic simulation state. Human can pause/override anytime.

**Q: What if agents are wrong?**
> That's why we show reasoning. Coordinators can reject recommendations. The AI assists, not dictates.
