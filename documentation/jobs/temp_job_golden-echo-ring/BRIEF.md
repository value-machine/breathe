# Brief — Golden echo ring at the circle's limits (visual)

Task: Golden echo ring at the circle's limits (visual) · Lap: temp_job_golden-echo-ring · Harness: v0.44.0

## Problem
The breathing circle gives no visual sense of having reached its full size or its smallest size; the owner wants a decorative echo that marks each breath reaching a limit.

## Success check
When a running session finishes an inhale or an exhale, a golden ring starts at the circle's edge, grows outward and fades to nothing; during a hold, when the session is paused, and with reduced motion on, no ring is shown.

## In scope
- One golden ring per breath limit: at the end of each inhale (full size) and at the end of each exhale (smallest size).
- The ring grows (scale 1 → 1.3 of the circle) and fades (opacity 0.6 → 0) over 1.2 s, then disappears.
- Colour is a golden theme token (light and dark), so it follows the token system and is not hard-coded.
- No ring under `prefers-reduced-motion` (the repo's motion-reduce convention).
- The ring is decorative: `aria-hidden`, `pointer-events: none`, and it does not change the circle's scale or the session timing.
- Rings fire only while the session runs (pause suspends them, like the countdown).

## Out of scope
- Will NOT do: a ring at the start of a hold — holds keep the size of the last breath, so there is no new limit reached. Excluded.
- Will NOT do: a user setting for ring colour or on/off — deferred (needs a settings field and a product decision).
- Will NOT do: a ring linked to the sound — the chime lap already marks the phase starts.
- Will NOT touch: the circle's scale curve, the session timing, the sound engine, the settings page, the round bar.

## Edges
| Feature area | Loop today | Hook point | Ride / new |
|---|---|---|---|
| breathwork · components/BreathCircle | renders the circle with `scale(...)` from `circleScale` | add the echo layer as a sibling inside a relatively positioned wrapper | ride — same container, no change to the circle element |
| breathwork · components/BreathTimerView | passes `circleScale` and `current` to the circle | passes the echo trigger (phase index and kind) to the circle | ride |
| breathwork · hooks/useBreathSession | `phaseIndex` lives in state but is not returned | returns `phaseIndex` alongside `current` | ride — one returned field |
| breathwork · services/breathSessionService.ts | phase kinds and round logic | pure helper: which phase kinds end at a limit (inhale, exhale) | ride |
| shared · theme tokens (light / dark JSON, tokens.generated.css) | colour tokens for primary, accent, ring, etc. | new `echo-gold` token in both modes, built with `pnpm tokens:build` | new — one token, both modes |
| breathwork · README.md | describes the circle and its motion | one line on the echo rings | ride |

Overrun rule (skill-loop D51): a diff that touches a feature area **not** in this table stops the lap.

## Size
S — one feature (breathwork), one new component, one pure helper, a theme token, its tests and the README line. No refactor needed.
Cut into laps: none

## Requirements
Not required (size S, one role, one journey).

## Decisions
See `DECISIONS.md` (D1–D5). All five are clear winners or agent picks inside the vision and the existing circle design; none needs an owner question.

## Plan

Acceptance test (red now): `src/features/breathwork/services/breathSessionService.test.ts` › `describe("limitEchoCount")`. The echo count changes once per breath limit, so the ring fires when the count changes.

Conflict & compliance:
- Placement: the count is a pure service function in `breathSessionService.ts`; the animation is a hook in `features/breathwork/hooks/`; the ring is a component in `components/`. Imports stay downward (components → hooks → services).
- Animation: Web Animations API (`element.animate`) from a hook, not CSS keyframes, so no edit to `src/index.css` is needed (the edges table holds).
- Reduced motion: the hook checks `matchMedia("(prefers-reduced-motion: reduce)")` and skips the animation; no ring is drawn for reduced motion users.
- Colour: new `echo-gold` token in light and dark JSON, built with `pnpm tokens:build`. The token name follows the existing `--primary-gradient-start` style (no `color-` prefix); the ring uses it through the Tailwind mapping the repo already uses for tokens (checked in phase 2).
- Props: `BreathTimerView` gains a required `echoCount` prop; its test renders are updated in the same step.
- Naming: `limitEchoCount` (role: how many breath limits have been passed), `useLimitEcho` (role: play the echo when the count changes), `BreathEchoRing` (role: the ring element). No feature-specific copies.
- Test impact: the timer view test and the circle render change; no other feature imports these.
- README: one line in the breathwork README, staged with the code.

Phase 1 — pure count (red → green)
- Step 1: implement `limitEchoCount(phases, phaseIndex): number`: the number of phases before `phaseIndex` whose kind is `inhale` or `exhale`. Export it with JSDoc and an explicit return type.
- Gate: `pnpm exec vitest run src/features/breathwork/services/breathSessionService.test.ts` passes.

Phase 2 — the echo animation and the colour (red → green)
- Step 2: write `useLimitEcho.test.ts` first (red): (a) it calls `animate` on the element once when the count goes from 1 to 2; (b) it does nothing when the count is 0 or unchanged; (c) it does nothing when `prefers-reduced-motion: reduce` matches. Mock `element.animate` with `vi.fn()` and `window.matchMedia`.
- Step 3: implement `useLimitEcho(ref, count)` in `hooks/useLimitEcho.ts`. `useEffect` on `[count]`: skip when count is 0 or reduced motion matches; otherwise `ref.current?.animate([{ transform: "scale(1)", opacity: 0.6 }, { transform: "scale(1.3)", opacity: 0 }], { duration: 1200, easing: "ease-out", fill: "forwards" })`. The effect runs only on count change, so pause (count unchanged) gives no echo.
- Step 4: add `echo-gold` to `light.tokens.json` (#b8860b) and `dark.tokens.json` (#e0b050), run `pnpm tokens:build`, and check the generated CSS variable and the Tailwind mapping used by `primary-gradient-start`. Add the mapping only if the other tokens have one.
- Gate: `pnpm exec vitest run src/features/breathwork src/shared/theme` passes; `pnpm tokens:build` leaves no diff beyond the new token.

Phase 3 — the ring in the timer (red → green)
- Step 5: `BreathEchoRing` component (`components/BreathEchoRing/BreathEchoRing.tsx`): an absolutely positioned circle the same size as the breath circle, `bg-echo-gold` (or the token class from phase 2), `pointer-events-none`, `aria-hidden`, and a ref passed to `useLimitEcho(ref, count)`. Its `count` prop is `echoCount`.
- Step 6: `BreathCircle` gets a relatively positioned wrapper containing the circle and the ring. The circle's transform and transition stay exactly as they are.
- Step 7: `useBreathSession` returns `phaseIndex` (one new field; existing tests keep passing). `BreathSessionScreen` computes `echoCount = limitEchoCount(phases, phaseIndex)` and passes it to `BreathTimerView`, which passes it to the circle.
- Step 8: `BreathTimerView.test.tsx` renders with `echoCount`; add a test that the ring is rendered with `aria-hidden` and no pointer events.
- Gate: `pnpm test:run` passes; `pnpm type-check` is clean; `pnpm lint` shows no new warnings in breathwork.

Phase 4 — docs and gates
- Step 9: README line in `src/features/breathwork/README.md`: the golden ring at each inhale and exhale limit, fading and growing over 1.2 s; none in holds, paused, or reduced motion.
- Gate (lap end): `pnpm test:run`, `pnpm type-check`, `pnpm lint`, `pnpm arch:check`, `pnpm validate:structure`, `pnpm validate:feature-docs`, `pnpm validate:feature-size`.

Verification after build: the animation is verified by unit tests against a mocked `element.animate`, not by looking at it. The owner checks the look on the preview at Stop 2.

Size check: stays in size S. Touches only the breathwork edges and the theme tokens listed in the brief.

## Plan status

- Phase 1 (pure count): Done. `limitEchoCount` green (15 service tests).
- Phase 2 (animation hook and colour): Done. `useLimitEcho` green (5 hook tests); `echo-gold` token added in both modes and built; theme tests 93/93.
- Phase 3 (ring in the timer): Done. `BreathEchoRing` in the circle wrapper; `echoCount` flows from `useBreathSession` to the circle; timer test green.
- Phase 4 (docs and gates): Done. README line added. Gates: `pnpm test:run` 234/234, `pnpm type-check` 0, `pnpm lint` 0 errors (20 warnings, all pre-existing outside breathwork), `pnpm arch:check` exit 0 (info-level orphan notice only, pre-existing), `pnpm validate:structure` 0, `pnpm validate:feature-docs` passed, `pnpm validate:feature-size` 0, `sync-agent-config --check` 0, `pnpm build` 0 (the Tailwind output contains `ring-echo-gold` mapped to `--echo-gold`).

### Notes during development

- Two edges absorbed, both small and inside the theme/breathwork size: `src/index.css` (one `--color-echo-gold` mapping, same pattern as the other tokens) and `src/shared/theme/themeTokens.ts` (`echo-gold` added to `THEME_COLOR_TOKENS`; the DTCG contract test requires every colour token to be listed there). Stop 2 summary should mention both.
- The first version of `useLimitEcho` would have fired on mount when a session remounts with a count above zero; the test "should not animate on mount" caught the expectation I had written wrongly, and the hook now records the previous count from the first render.
- Architecture check flagged `BreathSessionScreen` importing the service. The count moved into `useBreathSession`, which returns `echoCount`, and the screen no longer imports the service. This is the same pattern the chime lap used.
- `BreathEchoRing` carries a `data-echo-ring` attribute so the test can find it; no other test hook is added.

### Decisions made

- The ring's animation runs through `element.animate` with `fill: forwards`, so the ring rests at opacity 0 after the echo; no CSS keyframes were needed.
- Not verified by eye: the look of the gold, the fade speed on a phone, and reduced motion on a real device. The animation is verified against a mocked `element.animate` and the `prefers-reduced-motion` mock only.
