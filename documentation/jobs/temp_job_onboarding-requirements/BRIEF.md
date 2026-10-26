# Brief — Onboarding states requirements, not methods

Task: Onboarding states requirements, not methods · Lap: temp_job_onboarding-requirements · Harness: v0.43.0

## Problem
Fork owners get click-by-click vendor instructions from the onboarding gates; those go stale as GitHub, Supabase and Cloudflare change, and they omit the staging Supabase project decided in #5.

## Success check
`.agents/skills/loop-backlog/references/onboarding.md` and the four seeded tasks in `src/config/app-tasks.json` contain no vendor click-paths or menu steps and no legacy key name, state each setup requirement as end state + why + how the agent verifies + who acts, and `pnpm validate:skills`, `pnpm validate:docs` and `pnpm sync:agent-config --check` pass.

## In scope
- Rewrite `loop-backlog/references/onboarding.md`: "Core behavior", gates 1/3/4/5/7, communication rules. Requirement tables for Supabase (task #1) and hosting (task #2).
- Add the staging Supabase project requirement (decided in #5 / DOC_CLOUDFLARE_WORKERS § Staging backend).
- Update the Supabase and hosting seeded task descriptions: requirement wording, `VITE_SUPABASE_PUBLISHABLE_KEY` (not the legacy anon name), no "click-by-click".
- Add four follow-up backlog tasks for the signals epic (backend, error capture, feedback widget, admin view + adapter on).

## Out of scope
- Will NOT do: signals tables, error capture, feedback widget, admin view — deferred (follow-up tasks).
- Will NOT touch: `documentation/DOC_CLOUDFLARE_WORKERS.md` dashboard hand-off text, `documentation/DOC_SUPABASE_GOOGLE_OAUTH.md`, README Quick Start, `loop-backlog/SKILL.md`, any other skill — stay unchanged.
- Will NOT touch: gates 2 (vision), 6 (dev server), 8, 9, verification checklist, completion criteria — no vendor steps in them.

## Edges
| Feature area | Loop today | Hook point | Ride / new |
|---|---|---|---|
| loop-backlog onboarding reference | top task is a seeded onboarding task → gate text → agent hands owner click paths | `references/onboarding.md` | ride — rewrite in place |
| tasks config | `app-tasks.json` seeded tasks → `/tasks` UI + loop-backlog | `src/config/app-tasks.json` | ride — descriptions + 4 new tasks |

Overrun rule (skill-loop D51): a diff that touches a feature area **not** in this table stops the lap.

## Size
S — two files edited; no code; no new dependency.
Cut into laps: signals epic added as four backlog tasks.

## Decisions
DECISIONS.md D1–D4.

## Plan (S: plan lives here)
1. Edit `onboarding.md` per In scope; keep section order and every SSOT pointer.
2. Edit `app-tasks.json` (disk wins; keep titles so the loop-backlog eval still matches).
3. `node scripts/sync-agent-config.mjs` (regenerates `.claude/skills` mirror), then check list: grep for click/menu phrases, `pnpm validate:skills`, `pnpm validate:docs`, `pnpm format:check`.
