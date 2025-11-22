# CrisisCoordinator – Local Setup Guide

Follow these steps to get the simulation running locally for demos or development.

---

## 1. Prerequisites

| Requirement | Notes |
| --- | --- |
| Node.js 18+ | Use `node -v` to verify. |
| npm 9+ | Bundled with Node. |
| Git | To clone/pull the repo. |
| Supabase project | Free tier is fine; you need the project URL, anon key, and service-role key. |
| Anthropic API key | Claude 3.5 Sonnet access for live agent calls during the hackathon. |
| Supabase CLI *(optional but recommended)* | `npm i -g supabase` for running migrations from the terminal. |

---

## 2. Clone and install dependencies

```bash
# clone if you have not already
git clone https://github.com/absolute-xero7/crisis-coordinator.git
cd crisis-coordinator

# install npm packages (Next.js, Supabase client, etc.)
npm install
```

---

## 3. Configure environment variables

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` with your values. You will need:
   - `ANTHROPIC_API_KEY` – Claude key (keep private).
   - `SUPABASE_URL` – project URL (https://xyz.supabase.co).
   - `SUPABASE_SERVICE_ROLE_KEY` – service role key (server-side only).
   - `NEXT_PUBLIC_SUPABASE_URL` – usually matches `SUPABASE_URL`.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon/public key for browser reads.

> **Never commit `.env.local`.** The service role key must only be used by server-side API routes.

---

## 4. Apply the Supabase schema

Run the SQL contained in `supabase/schema.sql` to create the `scenarios`, `simulation_runs`, and `simulation_events` tables.

### Option A – Supabase CLI
```bash
supabase db push --file supabase/schema.sql
```

### Option B – Supabase Dashboard
1. Navigate to **SQL Editor**.
2. Paste the entire contents of `supabase/schema.sql`.
3. Execute the query.

> You can rerun the same SQL to reset a dev database. Primary keys are UUID/bigserial, so duplicates are not an issue.

---

## 5. Seed scenarios (optional)

The app always loads built-in scenarios from code, but you may want editable copies inside Supabase:

1. Start the dev server (`npm run dev`).
2. Use the Scenario Builder (once implemented) or POST to `/api/scenarios` with a scenario JSON payload to store a custom version.

Built-in examples live in `lib/scenarios/*.ts` if you want ready-made payloads.

---

## 6. Run the dev server

```bash
npm run dev
```

- Open http://localhost:3000.
- The landing page lets you launch the console or upcoming builder.
- Scenario selector will show built-ins immediately and custom Supabase scenarios once they exist.

### Useful npm scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Starts Next.js in dev mode with hot reload. |
| `npm run lint` | Runs `next lint` to catch issues. |
| `npm run build` | Production build sanity check. |
| `npm start` | Starts the production build (after `npm run build`). |

---

## 7. Verifying connectivity

1. **Supabase** – open http://localhost:3000/api/scenarios. You should see built-in scenarios plus any Supabase records. If it fails, recheck env vars and schema.
2. **Anthropic** – start a simulation (PATH scenario) and watch the Agent Panel logs. If the API key is missing/invalid, the console will show fallback decisions and log an error in the terminal.

---

## 8. Troubleshooting

| Issue | Fix |
| --- | --- |
| `Missing Supabase server credentials` | Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist in `.env.local` before `npm run dev`. |
| `/api/scenarios` returns 500 | Run the schema SQL; check Supabase logs for permission errors. |
| Agents always use fallback logic | Confirm `ANTHROPIC_API_KEY` is valid and not over quota; restart the dev server after editing env vars. |
| Browser cannot reach Supabase | Verify `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` match the project and allow anon reads on the `scenarios` table. |
| Port already in use | `PORT=4000 npm run dev` to run on a different port. |

---

## 9. Next steps for demos

- Use the Scenario Builder (once fully implemented) to craft custom Toronto incidents and save them to Supabase.
- Keep the Anthropic key handy for live judging, but rotate it afterwards.
- Before demo day, run `npm run lint && npm run build` to confirm everything compiles.

Happy coordinating! 🚨🍁
