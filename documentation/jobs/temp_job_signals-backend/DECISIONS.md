# Decisions — signals-backend

Job: `temp_job_signals-backend`
Updated: 2026-10-24

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Default for forks | closed | Forks get error logging and feedback by default | loop-refine | owner, carried from onboarding-requirements D3 |
| D2 | Admin model | closed | Role claim in auth `app_metadata` (never `user_metadata`); admins and local dev may read | loop-refine | owner, carried from onboarding-requirements D4 |
| D3 | Table shapes | closed | Follow `loop-backlog/references/signal-adapter.md`: `error_logs` (hash cluster, status open/review/resolved/muted), `app_feedback` (open/review/handled/completed), `bugs` (open/in_progress/fixed) | loop-refine | clear-winner: the adapter already reads and writes exactly these; rejected: designing new columns and then changing the adapter |
| D4 | Rollout path | closed | Migrations as repo files first; applied to staging, production only after merge | loop-refine | clear-winner: `.claude/rules/database.md` § Staging first |
| D5 | Who may write error rows | closed | Anyone (including anon), only through one deduping `SECURITY DEFINER` function; no direct table writes; message and field size caps; 90-day retention | loop-refine | asked; owner took the recommended option. Rejected: signed-in only (loses login/OAuth errors), rate-limited Edge Function (more parts), hosted tracker (new service, rewrites the epic). Per-visitor rate limits are not possible in Postgres alone; revisit if abuse appears |
| D6 | Who may write feedback rows | closed | Signed-in users insert their own rows only (`user_id = auth.uid()`); no anon | loop-refine | clear-winner: feedback needs an identity to reply to; rejected: anon feedback (spam, no follow-up) |
| D7 | Staging project | closed | Created `plate-harness-staging` (ref `oqbzkenmrycpyabiemuo`, org T-supabase, eu-west-1, free plan) through the Supabase connector | loop-refine | asked; owner took the recommended option. Uses the second free active-project slot. Rejected: local-only (defers real-Supabase verification), reusing a paused project (holds other data); renamed by the owner to `bronze-plate-harness`, now the only project (D10) |
| D8 | `db:push-staging` script | closed | Not added in this lap; `supabase/README.md` says the connector or the CLI applies migrations. A follow-up task decides between a pinned CLI script and updating the adapter's reference | loop-plan | clear-winner: a script needs the Supabase CLI (new tool) plus project linking, which cannot be verified here; rejected: shipping an untested script, editing the protected adapter text in this lap |
| D9 | Staging history parity | closed | Staging was reset once (empty project) and the corrected migration applied as one history entry; the repo file carries the recorded version `20261024081200` | loop-build | the first apply showed two Supabase advisor findings (initplan on the jwt() call, missing FK index) that the local mock could not catch |
| D10 | One project vs two | closed | One Supabase project (`bronze-plate-harness`, ref `oqbzkenmrycpyabiemuo`, the project formerly named `plate-harness-staging`) shared by local dev, previews and production while the app has no real users; isolate staging (Branching staging branch, or a second project) before real users arrive | loop-refine | owner: staging and production should not be separate projects; after reading the Branching docs the owner chose to stay on the Free plan. Supersedes the two-project requirement from #5 (`DOC_CLOUDFLARE_WORKERS.md` § Staging backend, `database.md` § Environments and migrations, `cloud-functions.md`, onboarding tables). Branching: not on the Free plan (Pro and above, usage-priced per branch-hour), a branch is its own instance with its own URL and keys. Rejected: keep two projects (#5), one project forever with the two-project text deleted, Branching now (paid) |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|

## Log

- 2026-10-24 — D10 closed via loop-refine (asked, after the owner linked the Branching docs)
- 2026-10-24 — D8 (clear-winner), D9 closed via loop-plan/loop-build
- 2026-10-24 — D7 closed via loop-refine (asked); project created
- 2026-10-24 — D5 closed via loop-refine (asked); D6 clear-winner
- 2026-10-24 — D1–D4 closed via loop-refine (D1–D2 asked earlier, D3–D4 clear-winner)
