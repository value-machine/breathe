# Brief — Breathwork UI redesign

Task: Redesign the breathwork UI to the calm feel of the vision · Lap: temp_job_ui-redesign · Harness: v0.44.0

## Problem
The settings and timer pages were plain stacks of default inputs and full-width buttons: four bare number fields, a "Sound: on" button, a column of effect buttons, a flat circle and a text-button control row. They worked, but did not feel like a calm breathing app (`documentation/DOC_APP_VISION.md` § Design direction), and the kit lacked the atoms the screens need.

## Success check
- Settings page: a Breathing card with touch-sized − / + steppers (typeable), a hold-progression hint, a Sound card with a switch, a headphones/speakers segmented control, effect tiles with icon and band, a collapsible Advanced section, and a sticky Play bar with the session length.
- Timer page: round label and progress bar at the top, a glowing orb between full-breath and empty-breath guide rings (mint on breaths, lighter on holds) with the phase and countdown over it, Stop and a large Pause/Resume at the bottom.
- Both pages read well at 390 px and on desktop, in light and dark mode.
- Existing behavior is unchanged; tests cover the new atoms and summary helpers.

## In scope
- Kit atoms in `src/components/common/`: `Switch`, `Progress`, `Collapsible` (shadcn/ui on Radix), `NumberStepper`, `ChoiceCard` (not in shadcn), round icon sizes on `Button`, a softer `SegmentedControl`.
- Global tokens: Fraunces headings, 1rem radius, pill buttons (resolves the vision's open typography question).
- Topbar: translucent, product name "Breathe".
- Light-mode palette "Dawn" (owner pick at Stop 2 from four rendered options: current, Mist, Dawn, Lavender).

## Out of scope
- Routing (the brand still links to `/`), the home and auth pages beyond the global token change, persistence, new sounds.

## Size
M — one feature's screens plus five kit atoms.
