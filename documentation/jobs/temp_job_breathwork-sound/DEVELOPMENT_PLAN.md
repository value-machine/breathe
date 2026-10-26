# Development plan: Breathwork sound (lap 2)

> **Written after the build.** The lap was built before this plan existed, which breaks the loop order. The plan below records what was built and how it was checked. It is not a pre-build plan.

## Summary

- **Goal:** binaural beats that follow the breath (headphones), and an isochronic-style tone for speakers, with user-modifiable carrier and beat range.
- **Brief:** `BRIEF.md` (success check, in / out, edges)
- **Size:** M — new cue service, new hook, form and page wiring, tests.
- **Acceptance test:** `breathCueService.test.ts` (cue spec per phase, scheduled oscillators and automation).
- **Plan review:** not run. The parallel lens review was not performed for this lap.
- **Scope / constraints:** Web Audio only (D11), no copied code, no timers in the audio path (architecture of `breathCueService`), no overtones (D15).

## Phase overview

| Phase | Goal | Gate | Status |
|-------|------|------|--------|
| 1 | Cue spec per phase: beat ramps and peak gain | cue spec tests | Done (test first) |
| 2 | Session scheduler: one voice, beat carried across phases, level crossfades | scheduler tests | Done, but the rewrite to one voice was **not** test-first (see Notes) |
| 3 | Audio settings, validation, bounds | validation tests | Done (test first) |
| 4 | `useBreathAudio` hook: create on Play, suspend, resume, close | hook tests with a fake AudioContext | Done (test first) |
| 5 | Form fields, page wiring, README | component and page tests, feature README | Done |

## Conflict & compliance

- **Applicable rules:** `architecture` (services pure, components get types from the types file and bounds as props), `code-style` (naming, max params 3, max statements 15), `testing` (test names `should … when …`), `file-placement`, `security` (no secrets), `debugging` (no leftover logs).
- **File placements:** services in `services/`, hook in `hooks/`, components in `components/`, page in `src/pages/breathe/`. Types in `types/breathwork.types.ts`.
- **Reuse / packages:** no new package. 1ps0/binaural was used as a reference only (MIT, not copied).
- **Foundation cleanup:** none.
- **Risks / open questions:**
  - Audio not heard by anyone yet. Behaviour is verified through Web Audio call logs in Chromium, not by ear.
  - Browser autoplay: the context is created inside the Play click; Safari has not been tested.

## Notes during development

- Pass 1 (cue per phase, one oscillator pair per phase) produced a silent gap at each phase boundary. Owner feedback on the preview.
- Pass 2 (one continuous voice) was written before its tests were revised. The old scheduler tests were replaced, not run red first.
- The hold after an inhale first held at the low beat, which jumped in pitch at the boundary. Fixed by carrying the beat across phases (D12, revised).
- Test titles were renamed to include a `when` clause after the check (two titles).

## Verification

- Unit tests: 55 tests in the breathwork feature and page, all green.
- Gates: type-check, `test:run` (217 total), lint (no new warnings), format, structure, feature size, feature docs strict, docs, build, arch (no breathwork violations).
- Chromium call log on the production build: two oscillators per session; level crossfades of 0.3 s at each phase boundary; pause, resume and stop call suspend, resume and close.

## Not verified

- Listening: whether the beat is audible on headphones and on speakers, and whether the crossfades sound smooth.
- Safari and Firefox behaviour of the AudioContext and the channel merger.
- Plan review (lenses) and the `loop-check` rule audit by subagents.
