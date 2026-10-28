# Brief — Site chrome fits the app and hides unused elements

Task: Site chrome fits the app and hides unused elements · Lap: temp_job_site-chrome · Harness: v0.44.0

## Problem
The top bar still says "Plate Harness" and offers sign-in, and the front door (/) shows the template's harness card and a sign-in panel. None of that belongs to the breathwork timer, so a visitor sees template leftovers instead of the app.

## Success check
A visitor who opens / sees the breathwork timer (settings, then session) with the top bar reading "Breathwork Timer"; the profile menu offers only the theme toggle; no harness card, sign-in panel or "Plate Harness" text is rendered on any page the app serves.

## In scope
- The front door: / renders the breathwork settings page (the same page /breathe renders now). /breathe redirects to /, so there is one address for the timer.
- Top bar: brand text "Breathwork Timer" (the vision's app name), linking to /. Same tokens, height and elevation as now; no restyle.
- Profile menu: keep only the theme toggle. Remove the sign-in and sign-out items and the account panel. Owner decision: breathwork needs no account.
- Home: remove the harness overview card and the sign-in panel from the front door (they are no longer rendered).
- Hidden routes: /harness and /login stay in code and stay reachable by URL, but no link to them is rendered anywhere.
- Dev tasks: /tasks keeps its route. No link to it is rendered in production builds; in local dev it is reachable by URL as before.
- Tests: ProfileMenu tests that assert sign-in items are updated to assert the theme toggle only.

## Out of scope
- Will NOT do: delete the auth feature, its routes, its tests or the Supabase setup — deferred (owner did not ask; auth stays in code).
- Will NOT do: delete the harness-overview feature folder — its own backlog task ("Remove the harness overview card before launching your product") covers it.
- Will NOT do: restyle the top bar or the breathwork page beyond the chrome text and removed items — the look already uses the app tokens.
- Will NOT do: change the theme tokens or the colour mode toggle.
- Will NOT touch: the breathwork engine, audio, the echo ring, the settings form, the timer view.

## Edges
| Feature area | Loop today | Hook point | Ride / new |
|---|---|---|---|
| layouts · Topbar | brand "Plate Harness" → /; renders ProfileMenu | brand text and link target | ride |
| layouts · ProfileMenu | sign-in / sign-out items, account panel, theme toggle | render only the theme toggle | ride — edits menu content, no new component |
| pages · HomePage | renders HarnessOverviewCard and SignInPanel for signed-out users | replaced at / by the breathwork page | ride — HomePage is no longer routed at / |
| pages · breathe · BreathePage | route /breathe; owns audio state | rendered at / ; /breathe redirects | ride |
| src/App.tsx · routes | / → HomePage; /breathe → BreathePage; /harness, /login, /tasks | / → BreathePage; /breathe → Navigate to / | ride |
| features/harness-overview | card on HomePage; route /harness | card no longer imported; route kept | ride — import removed only |
| features/auth | SignInPanel on HomePage; sign-in items in ProfileMenu | imports removed from HomePage and ProfileMenu; routes kept | ride — removal of imports only |

Overrun rule (skill-loop D51): a diff that touches a feature area **not** in this table stops the lap.

## Size
M — four feature areas touched (layouts, pages, routing in App.tsx, and the removed imports from harness-overview and auth), plus three test files. Each change is small; no refactor needed.
Cut into laps: none

## Requirements
Not required (one user journey: a visitor opens the timer).

## Decisions
See `DECISIONS.md` (D1–D6). Two are owner answers at refine (front door, sign-in); the rest are clear winners or agent picks.
