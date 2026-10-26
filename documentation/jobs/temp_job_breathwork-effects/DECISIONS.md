# Decisions — temp_job_breathwork-effects

| # | Decision | Alternatives considered | Why this one |
|---|----------|-------------------------|--------------|
| D17 | Four effect presets (Calm, Focus, Sleep, Energize) replace the Hz fields as the main choice. Each maps to a carrier and beat range. | A free-form Hz only; a longer effect list | Owner picked the four proposed presets. |
| D18 | Labels are the goal word plus the band and range it synthesises ("Calm · theta band · beat 4–8 Hz"). A test blocks health or effect claim words in labels. | Band only (no goal word); goal words alone | Owner picked goal plus band. The band keeps the copy about what is synthesised, as the vision requires. |
| D19 | The Hz fields sit behind "Advanced", hidden by default. Editing one switches the effect to "custom". | Remove the Hz fields; keep them visible | Owner picked advanced. Power users keep control without the default screen showing raw numbers. |
| D20 | Publishing: the designated branch merges `origin/main` (merge commit, no content change). No force-push. | Force-push replacing the merged commits; a new branch name | Owner picked the merge, which avoids rewriting the remote branch. |
| D21 | Default is now Calm (carrier 200 Hz, beat 4–8 Hz), replacing the lap 2 default of 4–10 Hz. | Keep 4–10 Hz as a non-preset default | The default should be one of the presets so the picker shows it as selected. |
| D22 | The beat moves over the whole session: a linear trend from the high end of the range to the low end. Each breath swings a quarter of the range around the trend. | Per-breath movement only (D12, the first version of this lap) | Owner asked for the beat to move across the whole session and per breath. Direction high → low is a choice: calmer toward the low end. Flip or tune with the owner. |
| D23 | Speakers mode pulses the carrier between 0.4 and 1 of its level (base 0.7, depth 0.3), instead of fully gating off. | Full on/off modulation (depth 0.5 on a 0.5 base) | Owner heard the speakers mode as choppy or gated. Full amplitude gating is the cause; a partial pulse keeps the beat audible without the gate. |
