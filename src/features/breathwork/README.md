# Breathwork

## Purpose

A guided breathing session: the user sets the breathing pattern (breaths before hold, inhale/exhale length, hold target, rounds), then a breathing circle, phase labels and optional binaural or isochronic sound guide each phase. Source of the behavior: `documentation/DOC_APP_VISION.md` § Core session flow.

## Structure

- `services/breathSessionService.ts`: pure session engine. Settings validation and bounds, hold progression (D4), the phase list, progress/advance helpers, circle scale and round progress. No React.
- `services/breathCueService.ts`: pure audio cue spec per phase (beat rises on inhale, falls on exhale, stays low on hold) and the Web Audio scheduler. Headphones mode plays a binaural beat (carrier left, carrier plus beat right). Speakers mode modulates one carrier at the beat rate. The whole session is one continuous voice (two oscillators, not one pair per phase), scheduled at Play on the AudioContext clock. The beat follows a session trend that moves linearly from the high end of the range to the low end over the whole session. Each breath swings a quarter of the range above (after an inhale) or below (after an exhale) that trend; a hold keeps the side of the last breath. Every phase starts where the previous one ended, and each level change is a 0.3 s crossfade. In speakers mode the carrier pulses between 0.4 and 1 of its level, so it does not gate off. No timers in the audio path.
- `hooks/useBreathSession.ts`: runs a phase list with pause, resume and stop. Time comes from `performance.now()`.
- `hooks/useBreathAudio.ts`: owns one AudioContext per session. Created inside the Play click, suspended on pause, resumed on resume, closed on exit. Does nothing when sound is off.
- Circle and bar are driven by the session clock, not by CSS phase transitions. The circle scale moves across the whole inhale (0.5 → 1) and exhale (1 → 0.5), and a hold keeps the size of the last breath. The round bar shows the share of the current round that has elapsed. Pause freezes both with the countdown.
- `components/`: `BreathCircle`, `BreathSettingsForm` (settings page), `BreathAudioFields` (sound mode and beat range), `BreathTimerView` (timer page), `BreathSessionScreen` (connects the hooks to the timer view).
- `types/breathwork.types.ts`: `BreathSettings`, `BreathPhase`, the audio types (`BreathAudioSettings`, `BreathAudioMode`) and the validation result type. Components import types from here; bounds come from the page as props.
- Page: `src/pages/breathe/BreathePage.tsx`, mounted at `/breathe`. It owns the audio controller and the audio settings.

Tests are colocated with their module (`*.test.ts(x)`). Engine and audio tests run without a browser; the audio scheduler is tested against a fake AudioContext.

Settings and audio settings are component state only (no storage).

Effects: the user picks one of four presets (Calm, Focus, Sleep, Energize). Each sets a carrier and beat range (`EFFECT_PRESETS` in `breathCueService.ts`) and is labelled with the band it synthesises, not with an effect claim. The Hz fields sit behind "Advanced"; editing one switches the effect to "custom". Headphones mode is the default. Overtone layers are not implemented.

## Dependencies

- Uses kit components from `@/components/common/` (`Alert`, `Button`, `FormField`) and token utilities from the theme. No external packages.
- Web Audio API from the browser. No copied code from other projects.
- Imported only by `src/pages/breathe/BreathePage.tsx`.
