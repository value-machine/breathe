# Brief — Chime cues at breath phase changes (chime theme: deep improvement)

Task: Chime cues at breath phase changes (chime theme: deep improvement) · Lap: temp_job_chime-phase-cues · Harness: v0.44.0

## Problem
A user with eyes closed or low attention cannot tell when a phase changes: the sound is one continuous tone, so inhale, exhale, hold and round end are not signalled by sound (vision Goal 2 requires it).

## Success check
With sound on, every phase start (inhale, exhale, hold) and every round end plays one chime scheduled on the AudioContext clock at that phase boundary, and with sound off no chime plays.

## In scope
- One chime per phase start: inhale and exhale chimes differ in pitch (inhale higher, exhale lower); hold chime is a third, neutral pitch.
- One round-end chime at the end of every round, including the last (the session ends on it). It is distinct from the phase chimes. At a round boundary only the round-end chime plays (D5).
- Chimes are layered over the continuous binaural or isochronic bed; the bed, beat trend and crossfades stay as they are.
- Chimes follow the sound switch: sound off, no chimes, and no audio context work added.
- Chime scheduling is pure and tested like the existing cue scheduler (fake AudioContext).

## Out of scope
- Will NOT do: user choice of chime sound or chime volume — deferred (needs a settings field and a product decision).
- Will NOT do: chimes before the first breath or after the last round beyond the round-end chime — excluded (vision lists no pre-session cue).
- Will NOT touch: the binaural / isochronic bed, beat trend, swing, crossfade timing, the circle, the settings fields and the Hz / effect presets.

## Edges
| Feature area | Loop today | Hook point | Ride / new |
|---|---|---|---|
| breathwork · services/breathCueService.ts | `scheduleBreathSession` schedules the continuous voice and level once per session (Web Audio, AudioContext clock) | new chime scheduling beside `scheduleSessionBeat` / `scheduleSessionLevel`, called from `scheduleBreathSession` | ride — same clock and context, no new voice |
| breathwork · services/breathSessionService.ts | `BreathPhase` carries `kind`, `seconds`, `round`; round boundaries are derivable from the phase list | read only; no change expected | ride — round end is the last phase of a round |
| breathwork · hooks/useBreathAudio.ts | `begin(phases, audio)` calls the scheduler once per session when sound is on | none expected; the scheduler call already covers chimes | ride |
| breathwork · README.md | describes the audio design | fold the chime design line into the audio paragraph | ride |

Overrun rule (skill-loop D51): a diff that touches a feature area **not** in this table stops the lap.

## Size
S — one feature (breathwork), one service extended with a small pure chime scheduler, its tests, and the README line. No refactor needed.
Cut into laps: none

## Requirements
Not required (size S, one role, one journey).

## Decisions
See `DECISIONS.md` (D1–D5). All five are clear winners or agent picks inside the vision and the existing cue design; none needs an owner question.

## Plan

Acceptance test (red now): `src/features/breathwork/services/breathCueService.test.ts` › `describe("chimeSchedule")`, two tests.

Conflict & compliance:
- Placement: services stay pure, in `features/breathwork/services/breathCueService.ts`; no new files.
- Layers: no React, no new imports outside breathwork; `scheduleBreathSession` remains the only audio entry point.
- Test conflict: the existing test "should use two oscillators for the whole session" counts every oscillator. Chimes add oscillators, so that assertion changes to count only the bed (the first two, created before chimes) plus one oscillator per chime. This is a deliberate change to the assertion, not to the bed behavior.
- Naming: `chimeSchedule` (role: the timing plan of chimes), `scheduleBreathChimes` (role: schedule them on the context). Not named after a feature area.
- Sound off: no change needed. `useBreathAudio` schedules nothing when sound is off; the build verifies this with the existing hook behavior, not a new test.
- README: one line in the audio paragraph, staged with the code (pre-commit rule).

Phase 1 — pure timing (red → green)
- Step 1: implement `chimeSchedule(phases): { at: number; kind: ChimeKind }[]` in `breathCueService.ts`. `ChimeKind = "inhale" | "exhale" | "hold" | "roundEnd"`. Rules: a chime at each phase start (offset in seconds from session start), except a phase that starts a new round; a round-end chime at the end of each round, including the last.
- Gate: `pnpm exec vitest run src/features/breathwork/services/breathCueService.test.ts` passes both `chimeSchedule` tests.

Phase 2 — audible chimes on the context clock
- Step 2: add `scheduleBreathChimes(ctx, phases, startAt)`: one sine oscillator per chime, its own gain (peak 0.12, attack 0.02 s, decay to silence over 1.2 s), connected to `ctx.destination`. Pitches: inhale E5 (659.25 Hz), exhale A4 (440 Hz), hold C5 (523.25 Hz), roundEnd G5 (783.99 Hz). Each oscillator starts at `startAt + at` and stops at that plus 1.2 s.
- Step 3: call it from `scheduleBreathSession` after the bed.
- Step 4: add a test for the scheduler: one chime oscillator per `chimeSchedule` entry, started at `ctx.currentTime + at`. Adjust the "two oscillators" assertion as described above.
- Gate: the full `breathCueService.test.ts` passes.

Phase 3 — docs and gates
- Step 5: update `src/features/breathwork/README.md` audio paragraph: chimes at phase starts and round ends, pitches per kind, layered over the bed, follow the sound switch.
- Gate (lap end): `pnpm test:run`, `pnpm type-check`, `pnpm lint`, `pnpm arch:check`, `pnpm validate:feature-docs:staged`, `pnpm validate:structure`.

Verification after build: state in the report that the scheduler is verified through a fake AudioContext, not by listening. Ask the owner to listen on the preview at Stop 2.

Size check: stays in size S. Touches only `breathwork` edges listed above.

## Plan status

- Phase 1 (pure timing): Done. `chimeSchedule` green (21 tests in the cue service file).
- Phase 2 (audible chimes): Done. `scheduleBreathChimes` wired from `scheduleBreathSession`; scheduler test green.
- Phase 3 (docs and gates): Done. README audio paragraph updated. Gates: `pnpm test:run` 227/227, `pnpm type-check` 0, `pnpm lint` on breathwork clean, `pnpm arch:check` exit 0 (one info-level orphan notice in `src/shared/theme/themeTokens.ts`, outside this lap), `pnpm validate:structure` 0, `pnpm validate:feature-docs` passed.

### Notes during development

- Changed two existing assertions in `breathCueService.test.ts`: the "two oscillators" test now counts the two bed oscillators plus one per chime, and the "stop at 15 s" test checks only the bed oscillators. Chimes add oscillators with their own stop times, so the old assertions no longer describe the bed.
- Chime envelope ramps linearly from silence to the peak before the exponential decay. An exponential ramp starting from zero is not reliable in Web Audio.
- Moved the chime start test into its own describe block to avoid a new `max-lines-per-function` warning in the scheduler describe.
- Not verified by ear. The scheduler is verified through a fake AudioContext only.

### Decisions made

- Chime stops `CHIME_DECAY_SECONDS` (1.2 s) after its start; the level envelope is separate, so a chime can ring past a short phase. Recorded as an implementation detail (no owner question).
