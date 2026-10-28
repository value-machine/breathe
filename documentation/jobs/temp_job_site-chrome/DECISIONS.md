# Decisions — site-chrome

Job: `temp_job_site-chrome`
Updated: 2026-10-28

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Front door (/) | closed | The breathwork timer at /; /breathe redirects to / | owner | Owner answer at refine. Matches the vision's "single-page app" |
| D2 | Sign-in in the top bar | closed | Hide sign-in and sign-out; keep the theme toggle. Auth routes and code stay | owner | Owner answer at refine. Breathwork needs no account; no auth model change |
| D3 | Top bar name | closed | "Breathwork Timer" (the vision's app name), linking to / | loop-refine | clear-winner: the vision title names the app; "Plate Harness" is the template's name |
| D4 | Hidden routes | closed | /harness, /login and /tasks stay routed; no link is rendered in production | loop-refine | clear-winner: removing routes would delete code that other backlog tasks own (harness card removal, auth) |
| D5 | Look of the chrome | closed | Same tokens, height and elevation; only the text and the removed items change | agent-pick | the app already uses the tokens; a restyle is a design choice the owner has not asked for |
| D6 | Dev tasks link | closed | No /tasks link in production; reachable by URL in local dev | loop-refine | clear-winner: the tasks feature README marks it dev-only |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|

## Log

- 2026-10-28 — D1 closed via loop-refine (asked, owner answered: breathwork at /)
- 2026-10-28 — D2 closed via loop-refine (asked, owner answered: hide sign-in, keep theme toggle)
- 2026-10-28 — D3, D4, D6 closed via loop-refine (clear-winner)
- 2026-10-28 — D5 closed via loop-refine (agent-pick)
