# Breathwork

## Purpose

A guided breathing session: the user sets the breathing pattern (breaths before hold, inhale/exhale length, hold target, rounds), then a breathing circle and phase labels guide each phase. Lap 1 has no sound; sound cues come in a follow-up lap. Source of the behavior: `documentation/DOC_APP_VISION.md` § Core session flow.

## Structure

- `services/breathSessionService.ts`: pure session engine. Settings validation and bounds, hold progression (D4), the phase list, and progress/advance helpers. No React.
- `hooks/useBreathSession.ts`: runs a phase list with pause, resume and stop. Time comes from `performance.now()`.
- `components/`: `BreathCircle` (breathing guide), `BreathSettingsForm` (settings page), `BreathTimerView` (timer page), `BreathSessionScreen` (connects the hook to the timer view).
- `types/breathwork.types.ts`: `BreathSettings`, `BreathPhase`, and the validation result type.
- Page: `src/pages/breathe/BreathePage.tsx`, mounted at `/breathe`.

Settings are component state only (no storage) in lap 1.

## Dependencies

- Uses kit components from `@/components/common/` (`Alert`, `Button`, `FormField`) and token utilities from the theme. No external packages.
- Imported only by `src/pages/breathe/BreathePage.tsx`.
