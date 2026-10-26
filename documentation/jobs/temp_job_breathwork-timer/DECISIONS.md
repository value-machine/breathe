# Decisions — temp_job_breathwork-timer

Clear winners logged by loop-refine. Each row names the alternatives. Owner-facing choices are listed in the brief's Out of scope.

| # | Decision | Alternatives considered | Why this one |
|---|----------|-------------------------|--------------|
| D1 | Breathing app lives at a new route `/breathe`; `/` (HomePage) is unchanged. | Replace `/` with the timer; put it under `/harness` | Keeps the boilerplate home and its onboarding card intact. Moving it to `/` later is a one-line route change. |
| D2 | Lap 1 has no sound. Sound cues are lap 2 (backlog task). | Include Web Audio now; include Tone.js now | Sound needs a choice between Web Audio (no dependency) and Tone.js (a new dependency, which is an owner stop). Splitting it keeps lap 1 free of that stop. |
| D3 | Settings are component state for lap 1 (not persisted). | localStorage; Supabase for logged-in users | The design names no storage, and the vision says the core session needs no backend. Persistence is a follow-up if the owner wants it. |
| D4 | Hold progression: for rounds before the last, round *i* uses ⅓ for i = 1, ⅔ for i ≥ 2; the last round uses the full target. Durations are rounded to whole seconds. | Linear ⅓ steps; ⅓ then ⅔ then full only for three rounds | The design fixes ⅓, ⅔, full for three rounds and does not cover other counts. This keeps the same shape for any round count and makes the final round always the target. |
| D5 | Default settings: 3 breaths before hold, 4 s inhale/exhale, 60 s hold target, 3 rounds. | Empty or zero defaults | The design gives no defaults. These are reversible values, not a data choice. |
| D6 | Settings bounds: breaths 1–20, inhale/exhale 1–20 s, hold target 5–300 s, rounds 1–10. Invalid values are rejected in the engine, not silently clamped. | Clamp on input | Keeps the engine's error path testable and the UI honest about what is allowed. |
| D7 | Circle motion is CSS transitions (no animation library). Hold phases hold the circle still. | Framer Motion (named in the design) | Framer Motion is a new dependency, and the transition is simple enough for CSS. Adding it later is an owner choice. |
| D8 | Settings use number inputs (kit `Input` + `FormField`) instead of sliders and switches. The sound toggle is a `Button` with `aria-pressed`. | Add a Slider and Switch to the kit | The kit has no Slider or Switch. Adding kit components is more than lap 1 needs, and number inputs are accessible as they are. |
| D9 | The circle's size follows the session clock across the whole inhale and exhale (0.5 → 1 → 0.5). A hold keeps the size of the last breath. Pause freezes it. | CSS transition at the start of each phase (the first build) | Owner feedback on the preview: the circle must move through the whole breath, not jump at the phase boundary. |
| D10 | The progress bar shows the share of the current round that has elapsed. It resets each round. | Completed rounds (the first build) | Owner feedback on the preview: the bar must move during a round, relative to that round's length. Design § 2.2 names rounds remaining, but the owner asked for progress within the round. |

## Owner-visible questions parked for lap 2 or the owner
- Sound library: Web Audio (no dependency) vs Tone.js (named in the design, new dependency). Asked when lap 2 is refined.
- Settings persistence: open, see the brief.
