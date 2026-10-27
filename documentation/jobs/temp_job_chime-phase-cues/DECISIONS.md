# Decisions — chime-phase-cues

Job: `temp_job_chime-phase-cues`
Updated: 2026-10-27

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Which events get a chime | closed | Each phase start (inhale, exhale, hold) and each round end | loop-refine | clear-winner: vision Goal 2 says every phase change is signalled by sound |
| D2 | Chime vs the continuous bed | closed | Chimes layered over the existing binaural / isochronic bed; bed unchanged | loop-refine | clear-winner: replacing the bed would drop the binaural design the owner asked for |
| D3 | Chimes with sound off | closed | No chimes; the sound switch governs all audio | loop-refine | clear-winner: the switch already gates all sound (vision) |
| D4 | Chime sound and pitch | closed | Soft sine bell; inhale higher, exhale lower, hold a neutral third; round end a distinct chime, also at the last round's end | agent-pick | timbre and pitch are swappable details inside "soft tone" (agent-behavior § When to ask); owner can change at Stop 2 |
| D5 | Round boundary: phase chime or round-end chime | closed | At a round boundary only the round-end chime plays; the next round's inhale chime is skipped | loop-plan | agent-pick: two chimes on the same instant would blur into one. Recorded as a detail, not a product choice |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|

## Log

- 2026-10-27 — D1, D2, D3 closed via loop-refine (clear-winner)
- 2026-10-27 — D4 closed via loop-refine (agent-pick)
