# Breathwork

## Purpose

A guided breathing session: the user sets the breathing pattern (breaths before hold, inhale/exhale length, hold target, rounds), then a breathing circle, phase labels and optional binaural or isochronic sound guide each phase. Source of the behavior: `documentation/DOC_APP_VISION.md` § Core session flow.

## Structure

- `services/breathSessionService.ts`: pure session engine. Settings validation and bounds, hold progression (D4), the phase list, progress/advance helpers, circle scale and round progress. No React.
- `services/breathCueService.ts`: pure audio cue spec per phase (beat rises on inhale, falls on exhale, stays low on hold) and the Web Audio scheduler. Headphones mode plays a binaural beat (carrier left, carrier plus beat right). Speakers mode modulates one carrier at the beat rate. The whole session is scheduled at Play on the AudioContext clock. No timers in the audio path.
- `hooks/useBreathSession.ts`: runs a phase list with pause, resume and stop. Time comes from `performance.now()`.
- `hooks/useBreathAudio.ts`: owns one AudioContext per session. Created inside the Play click, suspended on pause, resumed on resume, closed on exit. Does nothing when sound is off.
- Circle and bar are driven by the session clock, not by CSS phase transitions. The circle scale moves across the whole inhale (0.5 → 1) and exhale (1 → 0.5), and a hold keeps the size of the last breath. The round bar shows the share of the current round that has elapsed. Pause freezes both with the countdown.
- `components/`: `BreathCircle`, `BreathSettingsForm` (settings page), `BreathAudioFields` (sound mode and beat range), `BreathTimerView` (timer page), `BreathSessionScreen` (connects the hooks to the timer view).
- `types/breathwork.types.ts`: `BreathSettings`, `BreathPhase`, the audio types (`BreathAudioSettings`, `BreathAudioMode`) and the validation result type. Components import types from here; bounds come from the page as props.
- Page: `src/pages/breathe/BreathePage.tsx`, mounted at `/breathe`. It owns the audio controller and the audio settings.

Settings and audio settings are component state only (no storage).

Audio defaults: carrier 200 Hz (100–400), beat 4 Hz at the low point and 10 Hz at the high point (1–40). Headphones mode is the default. Overtone layers are not implemented.

## Dependencies

- Uses kit components from `@/components/common/` (`Alert`, `Button`, `FormField`) and token utilities from the theme. No external packages.
- Web Audio API from the browser. No copied code from other projects.
- Imported only by `src/pages/breathe/BreathePage.tsx`.
