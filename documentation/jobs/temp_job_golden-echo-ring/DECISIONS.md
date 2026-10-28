# Decisions — golden-echo-ring

Job: `temp_job_golden-echo-ring`
Updated: 2026-10-27

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Which moments get a ring | closed | End of each inhale (full size) and end of each exhale (smallest size) | loop-refine | clear-winner: the task says "reaching a limit"; holds keep the last size and reach no new limit |
| D2 | Rings during a hold | closed | No ring at hold start | loop-refine | clear-winner: a hold does not move the circle |
| D3 | Reduced motion | closed | No ring under `prefers-reduced-motion` | loop-refine | clear-winner: matches the circle's `motion-reduce` convention; a static ring would only be a glow with no meaning |
| D4 | Colour | closed | New golden theme token, light and dark, not hard-coded | loop-refine | clear-winner: the theme is token-driven (`agent-behavior` § Styling scope: global tokens by default) |
| D5 | Exact gold and size of the ring | closed | Light gold #b8860b, dark gold #e0b050; grows scale 1 → 1.3, fades opacity 0.6 → 0 over 1.2 s | agent-pick | hex and timing are swappable details inside "golden"; the owner can change them at Stop 2 |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|

## Log

- 2026-10-27 — D1, D2, D3, D4 closed via loop-refine (clear-winner)
- 2026-10-27 — D5 closed via loop-refine (agent-pick)
