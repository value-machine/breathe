# Brief — Build breathwork timer app (settings, breathing timer, sound cues)

Task: Build breathwork timer app (settings, breathing timer, sound cues) · Lap: temp_job_breathwork-timer · Harness: v0.44.0

## Problem
A self-directed breath practitioner needs a guided, configurable breathing session they can run without counting or watching a clock (vision: `documentation/DOC_APP_VISION.md`).

## Success check
Given settings {breathsBeforeHold: 1, inhaleExhaleSeconds: 2, holdTargetSeconds: 6, rounds: 2}, the session engine returns exactly this phase list: round 1 = inhale 2 s, exhale 2 s, hold 2 s, inhale 2 s, hold 15 s, exhale 2 s; round 2 = inhale 2 s, exhale 2 s, hold 6 s, inhale 2 s, hold 15 s, exhale 2 s. A unit test pins this list.

## In scope (lap 1 — the first slice)
- Session engine (pure TypeScript, no React): builds the phase list from settings using the round sequence and hold progression in the design (`TomFranse/breathwork` `documentation/app-design-document.txt` § 2.1 and § 4.2). Hold progression is decided in D4.
- Settings page: four controls for breaths before hold, inhale/exhale seconds, hold target seconds and rounds, plus a sound on/off switch that is shown but inert until lap 2. A Play button starts the session.
- Timer page: animated circle (expands on inhale, contracts on exhale, holds still on hold), phase label, remaining seconds, rounds-remaining progress, Pause/Resume, and Stop (returns to settings). Session end returns to settings.
- Route `/breathe` (new), inside the existing app shell. Home (`/`) is unchanged.
- Tests for the engine (success check plus error paths: invalid settings are rejected) and for the pages' key interactions (Play starts, Pause freezes, Stop returns to settings).
- Feature README at `src/features/breathwork/README.md` (required) and `ARCHITECTURE.md` update for the new feature.

## Out of scope
- Will NOT do: sound cues (Web Audio or Tone.js; new-dependency question) — deferred to a follow-up lap. Follow-up backlog task added.
- Will NOT do: persistence of settings or session history (no storage, no Supabase). Settings live in component state for lap 1.
- Will NOT do: PWA, other breathing techniques, social sharing, Firebase/Cloudflare changes, Supabase calls.
- Will NOT do: a medical/therapy claim or any copy beyond short labels.
- Will NOT touch: `HomePage`, `/harness`, `/tasks`, auth, error reporting, the theme tokens (already applied in the vision PR), dev task backlog except the task JSON edit.

## Edges
| Feature area | Loop today | Hook point | Ride / new |
|---|---|---|---|
| `src/features/breathwork/` | Not found | new feature folder: `services/` (engine), `hooks/` (session state), `components/` (circle, controls), `types/` | new — no existing breathing code |
| `src/pages/breathe/` | Not found | `BreathePage` (settings and timer as one page with two states, or two components) | new — page layer only, thin |
| `src/App.tsx` | `/` → HomePage, `/harness`, `/tasks`, auth routes | one `Route path="/breathe"` inside the `MainLayout` group | ride — one route line |
| `src/shared/theme/tokens/` | `bg-background`, `bg-primary`, `text-foreground`, `bg-secondary` (mint), `bg-accent` (mint) | token utilities only (no raw colors) | ride — tokens already applied |
| `src/components/common/` (Button, Slider, Switch) | kit components exist | reuse; add none | ride |

Overrun rule (skill-loop D51): a diff touching a feature area not in this table stops the lap.

## Size
M — one new feature (engine + hook + 3 components + page), one route line, tests, README, and the `ARCHITECTURE.md` entry. The cleanup a clean implementation needs is small (no existing breathing code to refactor).
Cut into laps: lap 2 = sound cues. Added to the backlog as "Breathwork sound cues (Web Audio or Tone.js)", directly after this task.

## Requirements
Not needed: one journey (settings → session → stop), one role (anonymous user), no auth or data-model spans.

## Decisions
See `DECISIONS.md` in this folder (D1–D7). No conflicts with a recorded decision: the vision is `ACTIVE`, the theme tokens are applied, and no feature README records a breathing decision.
