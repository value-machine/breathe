# Development plan: Breathwork timer (lap 1)

## Summary

- **Goal:** A settings page and a breathing timer page, backed by a pure session engine, at route `/breathe`.
- **Why:** The first working slice of `documentation/DOC_APP_VISION.md` § Core session flow.
- **Brief:** `BRIEF.md` (problem, success check, in / out, edges)
- **Size:** M — new feature (engine, hook, 3 components, page), one route line, tests, README.
- **Acceptance test:** `src/features/breathwork/services/breathSessionService.test.ts` (failing first; written before the engine).
- **Plan review:** Done inline 2026-10-26 (self-review against the rules below; the parallel lens review was not run — see Conflict & compliance).
- **Scope / constraints:** No sound (lap 2), no persistence, no new dependencies, tokens only for color (no raw colors), kit components only (no new UI kit pieces).

## Phase overview

| Phase | Goal | Gate | Status |
|-------|------|------|--------|
| 1 | Pure session engine: types, settings validation, hold progression, phase list | acceptance test + engine tests pass | Done |
| 2 | `useBreathSession` hook: idle → running → paused → finished, pause/resume/stop | hook tests pass | Done |
| 3 | Components: `BreathCircle`, `BreathSettingsForm`, `BreathTimerView` | component tests pass | Done |
| 4 | Page, route, feature README, `ARCHITECTURE.md` entry | full repo gate list passes | Done |

## Conflict & compliance

- **Applicable rules:** `architecture` (feature layers, services pure, pages thin), `code-style` (naming, explicit return types, no `any`, complexity limits), `testing` (colocated `*.test.ts(x)`, `should … when …` names), `file-placement` (structure whitelist), `debugging` (no leftover logs), `security` (no secrets, no server calls).
- **File placements:**
  - `src/features/breathwork/README.md` (required, strict headings Purpose / Structure / Dependencies)
  - `src/features/breathwork/types/breathwork.types.ts`
  - `src/features/breathwork/services/breathSessionService.ts` (+ `.test.ts`)
  - `src/features/breathwork/hooks/useBreathSession.ts` (+ `.test.ts`)
  - `src/features/breathwork/components/BreathCircle/BreathCircle.tsx`, `BreathSettingsForm/BreathSettingsForm.tsx`, `BreathTimerView/BreathTimerView.tsx` (+ tests)
  - `src/pages/breathe/BreathePage.tsx` (+ test)
  - `src/App.tsx`: one lazy route `/breathe` inside the `MainLayout` group
- **Reuse / packages:** `spec-reuse-package` skipped — a 4-phase breathing timer with fixed rules is small bespoke business logic (architecture rule: skip for small bespoke logic). Kit components reused: `Button`, `Input`, `Label`, `FormField`, `Card`, `Badge`. No Slider or Switch exists in the kit: settings use number inputs (D8).
- **Foundation cleanup:** none needed — the path touches no shared module beyond `App.tsx` routing.
- **Standards diversions:** the design names Framer Motion and Tone.js; both are deferred (D7, D2). The design-named Firebase is replaced by the repo's Cloudflare hosting (vision open question).
- **Risks / open questions:**
  - Timer drift in background tabs: `setInterval` throttles when hidden. Mitigation: the hook computes remaining time from `performance.now()` deltas, not from tick counts.
  - Circle animation under `prefers-reduced-motion`: the reduced-motion token set already shortens durations; the circle transition uses `duration-normal` tokens so it follows the reduced set.
  - Pattern & precedent: skipped — the behavior is a standard guided-timer contract with no novel UX; nothing to compare beyond the design doc.

## Review contract

- **Rules pinned:** `rules@<short SHA>` (`git log -1 --format=%h -- .claude/rules`) — `architecture`, `code-style`, `testing`, `file-placement`, `debugging`, `security`
- **Required lenses:** Reuse / packages (done, above), Feature decomposition (one feature: one domain concept, the breathing session), Foundation cleanup (none), Naming (`code-style` § Naming: role names — `breathSessionService`, `useBreathSession`, `BreathCircle`); Pattern & precedent skipped (reason above).
- **Tooling gate:** the full list in `.agents/skills/loop-check/references/rule-audit.md` § Tooling pass (`pnpm lint`, `pnpm type-check`, `pnpm test:run`, `pnpm validate:structure`, `pnpm validate:feature-size`, `pnpm validate:feature-docs:strict`, `pnpm arch:check`, `pnpm format:check`).
- **Locked decisions:** `DECISIONS.md` D1–D7 and D8 below.

### Amendments

| # | Date | Source | Change | Applied to |
|---|------|--------|--------|------------|
| — | — | — | none yet | — |

## Pattern & precedent

Pattern review: skipped — no new behavioral contract beyond the design document; the behavior is a fixed guided-breathing sequence.

## Notes during development

- Phase 2: the first hook draft returned the last phase as `current` after finishing; a hook test caught it, and `current` is now null when the status is `finished`.
- Phase 3: the first draft imported the service from components, which the `no-direct-service-in-feature-components` rule warns on. The circle state moved into the hook (`circleExpanded`), and the settings bounds are passed in from the page.
- Gates after build: type-check, test:run (all tests), lint (0 new warnings; 20 pre-existing in auth/tasks/layouts), format:check, validate:structure, validate:feature-size, validate:feature-docs:strict, validate:docs, arch:check (0 errors, 0 warnings from breathwork), build. Browser check at 390 px: settings and timer render, no horizontal overflow, no console errors.
- Not verified: sound (lap 2), the timer across a real background tab, screen-reader pass.

## Decisions made

| # | Topic | Choice | Precedent? |
|---|-------|--------|------------|
| D8 | Settings controls | Number inputs (kit `Input` + `FormField`) instead of sliders and switches, because the kit has no Slider or Switch. The sound switch is a `Button` toggle, inert until lap 2. | No — kit gap |

## Phase details

### Phase 1 — Pure session engine

- **Goal:** Settings validation, hold progression and phase list as pure functions.
- **Steps:**
  1. `types/breathwork.types.ts`: `BreathSettings`, `BreathPhaseKind = "inhale" | "exhale" | "hold"`, `BreathPhase { kind, seconds, round }`, `BreathSettingsResult` union (`{ ok: true, value }` | `{ ok: false, error }`).
  2. `services/breathSessionService.ts`:
     - `BREATH_SETTINGS_BOUNDS` (breaths 1–20, inhale/exhale 1–20 s, hold target 5–300 s, rounds 1–10, integers).
     - `validateBreathSettings(settings)` → rejects out of range and non-integer values (D6).
     - `holdSecondsForRound(round, rounds, target)`: last round = target; earlier rounds = `Math.round(target * min(round, 2) / 3)` (D4).
     - `buildBreathPhases(settings)`: per round: `breathsBeforeHold` × (inhale, exhale); then hold(holdSeconds), inhale, hold(15), exhale. The fixed 15 s is a named constant `HOLD_FINAL_SECONDS`.
     - `DEFAULT_BREATH_SETTINGS` (D5).
- **Gate:** `pnpm vitest run src/features/breathwork/services` passes all five tests. The acceptance test is the first one to go green. Lint and type-check on the touched files.

### Phase 2 — Session hook

- **Goal:** Time-based state machine that runs the phase list.
- **Steps:**
  1. `hooks/useBreathSession.ts`: `useBreathSession(phases)` returns `{ status: "idle" | "running" | "paused" | "finished", current: BreathPhase | null, phaseIndex, phaseRemainingSeconds, roundsRemaining, start(), pause(), resume(), stop() }`.
  2. Timing: each frame reads `performance.now()`; elapsed since the last tick is subtracted from the phase's remaining time; when it reaches 0 the next phase starts (carry the overshoot). Pause stores the remaining time; resume restarts from it.
  3. `stop()` returns to idle and clears the index.
- **Gate:** hook tests with fake timers (`vi.useFakeTimers()`, `vi.advanceTimersByTime`) cover: start → first phase; pause freezes remaining time; resume continues; a full short session ends in `finished`; stop resets to idle.

### Phase 3 — Components

- **Goal:** Circle, settings form and timer view as presentational components with props only.
- **Steps:**
  1. `BreathCircle`: a `div` with a size driven by a CSS transition (`duration-normal`, `ease-standard` tokens). Props: `kind` (expanded for inhale, contracted for exhale, still for hold). Colors: `bg-secondary` (mint) fill with `bg-primary` ring; no raw colors.
  2. `BreathSettingsForm`: four `FormField` + number `Input`s with labels, the sound toggle `Button`, a `Play` `Button`. Errors shown from `validateBreathSettings` (`Alert` kit). Props: `settings`, `onChange`, `onPlay`.
  3. `BreathTimerView`: the circle, phase label (Inhale / Exhale / Hold), remaining seconds, rounds-remaining bar (`bg-primary` on `bg-muted`), Pause/Resume and Stop buttons at the bottom. Props from the hook state.
- **Gate:** component tests: the form shows an error for an out-of-range value; `BreathTimerView` renders the phase label and calls `onPause`/`onStop`.

### Phase 4 — Page, route, docs

- **Goal:** Wire it together and document it.
- **Steps:**
  1. `src/pages/breathe/BreathePage.tsx`: holds the settings state, validates, starts the session with `buildBreathPhases`, switches between the form and the timer view. Stop and finish return to the form.
  2. `src/App.tsx`: lazy `BreathePage` and `<Route path="/breathe" element={<BreathePage />} />` inside the `MainLayout` group.
  3. `src/features/breathwork/README.md` with `## Purpose`, `## Structure`, `## Dependencies`.
  4. `ARCHITECTURE.md`: one feature entry in the existing feature list.
  5. Page test: Play with valid settings shows the timer view; Stop returns to the form.
- **Gate:** the full tooling gate list in the Review contract passes, then `pnpm build`.
