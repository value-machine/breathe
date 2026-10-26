# Decisions — google-signin-return

Job: `temp_job_google-signin-return`
Updated: 2026-10-25

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Root cause | closed | Sign-in started on the preview origin; the bare-origin `redirectTo` did not match the `/**` allow-list pattern, so Supabase sent the user to the Site URL (production), where the stored code verifier does not exist (`bad_code_verifier`) | loop-refine | evidence: Supabase edge logs 2026-10-25 08:52 UTC (authorize with referer preview; token POST 400 with referer production); auth.users shows the Google user created with `last_sign_in_at` empty |
| D2 | Redirect address | closed | Send `<origin>/` so the documented `<origin>/**` patterns match on every host | loop-refine | clear-winner: one code change fixes local, preview and production. Rejected: telling every fork to list bare origins as well (easy to forget, and the Supabase docs do not confirm bare-origin matching) |
| D3 | Double exchange | closed | `handleCodeExchange` first checks for a signed-in session (which waits for the library's own exchange) and exchanges itself only when there is none | loop-refine | clear-winner: least invasive. Rejected: `detectSessionInUrl: false` (would also stop hash-based recovery links being picked up) |
| D4 | Anonymous sign-ins | closed | Out of this lap; queued as a task | loop-refine | auth permission model is an owner stop. Observed: Supabase refuses the app's anonymous sign-in on every visit (`anonymous_provider_disabled`) |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|

## Log

- 2026-10-25 — D1–D4 closed via loop-refine (clear-winner)
