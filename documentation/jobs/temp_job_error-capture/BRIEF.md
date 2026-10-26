# Brief — Capture app errors to the database

Task: Capture app errors to the database · Lap: temp_job_error-capture · Harness: v0.43.0

## Problem
Runtime errors in users' browsers vanish, so the owner and the signal adapter never learn about them even though the `error_logs` table and `upsert_error_log()` now exist.

## Success check
In the unit-test environment, an uncaught error, an unhandled rejection and an error caught by the route boundary each produce exactly one `upsert_error_log` call whose payload has a stable hash (same error → same hash, different errors → different hashes), an environment tag, and a message, stack and URL with emails, tokens, query strings and fragments removed; the same hash is sent at most once per page load, at most 20 reports are sent per page load, a failing or missing backend never throws or re-reports, and nothing is sent when Supabase is not configured.

## In scope
- New feature `src/features/error-reporting/` (services + types + README): fingerprint, redaction, environment tag, throttled reporter, global listener installer.
- Wire-up: `installGlobalErrorReporting()` in `src/main.tsx`; `onError={reportError}` on the existing `QueryErrorBoundary` in `src/App.tsx`.
- Build-time branch for the environment tag: `vite.config.ts` defines `__BUILD_BRANCH__` from `WORKERS_CI_BRANCH` (set by Cloudflare Workers Builds); typed in `src/vite-env.d.ts`.
- `supabase/README.md` line on client capture.

## Out of scope
- Will NOT do: feedback widget, admin view, switching the signal adapter on, retention scheduling — deferred (queued tasks).
- Will NOT do: a user-visible "report sent" UI, source-map upload, breadcrumbs, performance tracing.
- Will NOT touch: `QueryErrorBoundary` (it already has `onError`), auth flows, `supabaseService.ts`, the migration, protected rules/skills/configs.

## Edges
| Feature area | Loop today | Hook point | Ride / new |
|---|---|---|---|
| `src/features/error-reporting/` | Not found | new feature (bounded context: error reporting) | new — no existing feature owns it; auth and tasks are other contexts |
| App root (`main.tsx`, `App.tsx`) | render tree → `QueryErrorBoundary` catches render errors, calls optional `onError` | `installGlobalErrorReporting()` before render; `onError` prop | ride |
| Build config (`vite.config.ts`, `src/vite-env.d.ts`) | Vite plugins and alias only | `define` for `__BUILD_BRANCH__` | ride |
| Supabase client (`shared/services/supabaseService.ts`) | `getSupabase()` / `isSupabaseConfigured()` | reporter calls `getSupabase().rpc(...)` | ride, read-only |
| Supabase schema | `upsert_error_log(p_hash, p_message, p_environment, p_type, p_stack, p_url, p_user_agent)` | called as RPC | ride, unchanged |

Overrun rule (skill-loop D51): a diff that touches a feature area **not** in this table stops the lap.

## Size
S — one new small feature (about 6 files), two one-line wire-ups, one config `define`; no refactor, no new dependency.
Cut into laps: none.

## Decisions
DECISIONS.md D1–D7. Vision is `DRAFT`: deferred (infrastructure lap, no product meaning changes).

## Plan (S: plan lives here)
Tests come first and fail first (acceptance test = `errorReportService.test.ts`), then each step makes its tests pass.
1. Types + `redact.ts` (emails, JWT-shaped tokens, publishable keys, URL query/fragment) with tests.
2. `errorFingerprint.ts` (normalize message and top stack frame, 53-bit hash → 16 hex chars) with tests.
3. `reportEnvironment.ts` (override → dev → build branch → production) with tests.
4. `errorReportService.ts`: `createErrorReporter` (dedupe per hash, cap 20, re-entrancy guard, swallow failures) + default `reportError` bound to Supabase, with tests including the acceptance cases.
5. `installGlobalErrorReporting.ts` (`error` + `unhandledrejection`, ignore resource errors and the ResizeObserver noise, idempotent) with tests.
6. Wire `main.tsx`, `App.tsx`; `vite.config.ts` define; `vite-env.d.ts` types; feature README; `supabase/README.md`.
Gate after each step: `pnpm test:run` for the new files; after step 6 the full tooling list (lint, type-check, format, structure, arch, feature-docs strict, build).
