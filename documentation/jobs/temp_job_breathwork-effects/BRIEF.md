# Brief — Breathwork effect selection

Task: Breathwork effect selection (choose an effect instead of Hz) · Lap: temp_job_breathwork-effects · Harness: v0.44.0

## Problem
The sound settings ask for carrier and beat in Hz. A user who wants a sound for a purpose has to know those numbers. The owner wants to pick the effect they are aiming for instead.

## Success check
On the settings page, the user picks one effect from a short list. The carrier and beat range are set from that effect's preset. The Hz fields are hidden by default and can be opened as "advanced". A test pins each preset to its carrier and beat range, and the copy for each effect passes the existing no-claims rule (it names what is synthesised, not what it does).

## Proposed presets (owner to confirm)
| Effect (label) | Beat band | Beat low → high | Carrier |
|---|---|---|---|
| Calm | theta, 4–8 Hz | 4 → 8 Hz | 200 Hz |
| Focus | beta, 13–20 Hz | 13 → 20 Hz | 200 Hz |
| Sleep | delta, 1–4 Hz | 1 → 4 Hz | 150 Hz |
| Energize | beta / low gamma, 20–30 Hz | 20 → 30 Hz | 250 Hz |

Band names are EEG nomenclature applied to a number, not a promise (the rule for copy in this project).

## Open questions for the owner
1. **Effect list:** these four, or a different set?
2. **Labels:** effect words ("Calm", "Focus", "Sleep", "Energize") name the goal, which the vision does not allow as a claim. The options are: (a) neutral labels that name the band ("Theta 4–8 Hz", "Beta 13–20 Hz", …), or (b) goal words with the band shown next to them and no claim about effect. My recommendation is (b): the goal word stays, and the band is shown beside it so the copy describes what is synthesised.
3. **Advanced Hz:** keep the Hz fields behind an "advanced" toggle, or remove them?

## Publishing note
The branch `claude/upbeat-fermat-zio2pb` was merged in PR #4. Publishing this lap needs one of: a force-push that replaces the old merged commits on that branch (blocked earlier, needs your explicit OK), a new branch name (needs your OK, since pushes go to the designated branch), or a merge that brings `main` into the branch (adds a merge commit, no content change).

## Out of scope
- Overtones, volume slider, persistence, medical or wellness claims.

## Size
S — settings page, a preset table, tests.
