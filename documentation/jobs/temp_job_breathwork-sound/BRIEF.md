# Brief — Breathwork sound cues (lap 2)

Task: Breathwork sound cues (Web Audio or Tone.js) · Lap: temp_job_breathwork-sound · Harness: v0.44.0

## Problem
The breathing session is silent, but the sound switch says "on". A user who wants audio guidance cannot follow the phases with eyes closed. The owner wants binaural beats that change with the breath, with modifiable parameters, and a version that also works without headphones.

## Success check
With sound on and headphones mode, starting a session plays a binaural beat whose beat frequency rises across each inhale, falls across each exhale and stays steady through a hold. The left ear carries the carrier; the right ear carries carrier + beat. With speakers mode, the same beat is audible as an amplitude-modulated tone on one channel. With sound off, nothing plays. Pause and stop silence the audio. Unit tests pin the cue spec per phase and the scheduled oscillator frequencies.

## In scope
- Audio settings: mode (headphones or speakers), carrier Hz, beat low Hz, beat high Hz. Defaults and bounds below.
- Pure cue spec per phase (service, no Web Audio).
- A Web Audio scheduler: two oscillators into a channel merger (headphones), or one carrier with an LFO on its gain (speakers).
- A hook that owns the AudioContext: created on the Play click, suspended on pause, resumed on resume, closed on exit.
- The session screen plays the cue on each phase change, only when sound is on.
- The settings page gets the mode toggle and the three numeric inputs.

## Out of scope
- Will NOT do: overtone or "harmonic" layers (default off; no feature this lap).
- Will NOT do: a volume slider, or persistence of audio settings (page state, as in lap 1).
- Will NOT do: medical or wellness copy.
- Will NOT touch: the engine's phase list, the circle, the progress bar, the routes, the theme tokens, and any new package.

## Edges
| Feature area | Loop today | Hook point | Ride / new |
|---|---|---|---|
| `src/features/breathwork/services/` | engine (pure) | add `breathCueService.ts` (pure spec + scheduler) and audio bounds in types | new file |
| `src/features/breathwork/hooks/` | `useBreathSession` | add `useBreathAudio.ts` | new file |
| `src/features/breathwork/components/BreathSettingsForm/` | four numeric fields, sound toggle | add mode toggle and three audio fields | ride |
| `src/features/breathwork/components/BreathSessionScreen/` | runs session hook | takes audio settings, calls audio hook on phase change | ride |
| `src/pages/breathe/BreathePage.tsx` | holds settings and `soundOn` | holds audio settings; unlocks audio on Play | ride |

Overrun rule (skill-loop D51): a diff touching a feature area not in this table stops the lap.

## Size
M — one new cue service, one new hook, scheduler tests with a fake AudioContext, form and page wiring. No refactor needed.

## Decisions
See `DECISIONS.md` in this folder (D11–D15).
