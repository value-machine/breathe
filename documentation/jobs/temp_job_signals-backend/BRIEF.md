# Brief — Signals backend: error logs, feedback and bugs tables

Task: Signals backend: error logs, feedback and bugs tables · Lap: temp_job_signals-backend · Harness: v0.43.0

## Problem
A fork has nowhere to store runtime errors or user feedback, so the signal adapter in `loop-backlog` cannot read anything and the owner never hears about failures.

## Success check
Applied to an empty Postgres, the migration creates `error_logs`, `app_feedback`, `bugs` and `upsert_error_log`; as `anon` all direct reads and writes on the three tables fail; `anon` and `authenticated` can call `upsert_error_log`, and a repeat call with the same hash raises `count` instead of adding a row; a signed-in user can insert only an `app_feedback` row with their own `user_id`; a JWT with the admin role claim in `app_metadata` can select and update all three tables and a JWT with the same claim in `user_metadata` cannot; replaying the migration changes nothing.

## In scope
- `supabase/migrations/<ts>_signals_tables.sql`: tables, indexes, RLS, `is_admin()` helper (reads `app_metadata`), `upsert_error_log` (SECURITY DEFINER, size caps), 90-day retention function.
- The adapter's statuses and columns exactly (`signal-adapter.md`).
- Applied and verified on the real staging project through the Supabase connector; `DOC_CLOUDFLARE_WORKERS.md` § Staging backend says the connector or the CLI applies migrations. No `db:push-staging` script (D8; follow-up task).
- `supabase/` README stating the tables, roles, and how admin is granted (requirement, not click path).

## Out of scope
- Will NOT do: client error capture, feedback widget, admin view, switching the adapter on, scheduled retention job — deferred (follow-up backlog tasks).
- Will NOT do: typed `database.types.ts` wiring — deferred until a consumer exists.
- Will NOT touch: auth flows, `supabaseService.ts`, existing features, the adapter text.

## Edges
| Feature area | Loop today | Hook point | Ride / new |
|---|---|---|---|
| Supabase schema (`supabase/migrations/`) | Not found (no `supabase/` folder) | new migration | new — first migration of the repo |
| Staging backend doc | requirement text only | `DOC_CLOUDFLARE_WORKERS.md` § Staging backend | ride |
| Signal adapter | reads tables that do not exist | table/column contract | ride — no edits |

Overrun rule (skill-loop D51): a diff that touches a feature area **not** in this table stops the lap.

## Size
M — first migration of the repo, security-sensitive (RLS, SECURITY DEFINER, admin claim), applies to two live databases.
Cut into laps: capture, widget, admin view already queued.

## Requirements
Roles: anon (write errors via function only), authenticated (insert own feedback), admin (read/update all), local dev (service role or admin session). Rows an admin may update: `status`, `resolved`, `fix_notes`, `bug_id`.

## Decisions
DECISIONS.md D1–D6.
