# Decisions — error-capture

Job: `temp_job_error-capture`
Updated: 2026-10-24

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Environment tag | closed | Derived: `VITE_APP_ENV` override, else dev server → `local`, else the Workers Builds branch (`WORKERS_CI_BRANCH`, injected into every build) not equal to `main` → `staging`, else `production` | loop-refine | clear-winner: needs no owner setting. Rejected: a `VITE_APP_ENV` build variable per environment (extra owner step), hostname matching (needs a configured production host) |
| D2 | What leaves the browser | closed | Message and stack have emails, JWT-like tokens and Supabase keys replaced; URL is origin + path only (no query, no fragment); user agent as-is | loop-refine | clear-winner (`security.md`: no secrets or PII in logs). OAuth callbacks carry codes in the query and fragment, so URLs must be cut |
| D3 | Flood control | closed | Each hash is sent once per page load; at most 20 sends per page load; the reporter never reports its own failures | loop-refine | clear-winner: complements the server-side 5000-cluster cap (signals-backend D5); counts live in the database, so one send per page load per hash is enough |
| D4 | Where the boundary hook lives | closed | Pass `reportError` to the existing `QueryErrorBoundary` `onError` prop in `App.tsx` | loop-refine | clear-winner: no UI-kit change; `components/common` may not import features |
| D5 | Home | closed | New feature `error-reporting` (services + types) | loop-refine | clear-winner: its own bounded context; budgets far below limits |
| D6 | Local development | closed | Local errors are reported too, tagged `local` | loop-refine | clear-winner: the owner asked that local dev can read the logs; the tag keeps them apart |
| D7 | Vision | closed | `DOC_APP_VISION.md` is `DRAFT`: deferred | loop-refine | infrastructure lap; no product meaning changes |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|

## Log

- 2026-10-24 — D1–D7 closed via loop-refine (clear-winner)
