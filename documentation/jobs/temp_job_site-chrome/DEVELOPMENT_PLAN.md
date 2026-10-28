# Development plan — site-chrome (size M)

Brief: `documentation/jobs/temp_job_site-chrome/BRIEF.md` · Decisions: `DECISIONS.md` (D1–D6)

## Conflict & compliance

- **Placement:** all edits are in existing files (`src/layouts/Topbar/`, `src/layouts/ProfileMenu/`, `src/App.tsx`, `src/pages/HomePage.tsx`). New test files are colocated (`src/App.test.tsx`, `src/layouts/Topbar/Topbar.test.tsx`). No new folders; `pnpm validate:structure` is the gate.
- **Layers:** `pages` routes the timer (already allowed: pages import features). `layouts` keeps importing only its own menu and shared components. No feature imports another feature's internals.
- **Feature removal:** `HomePage.tsx` is removed (its only routed use goes away; `HomePage.test.tsx` goes with it). The `harness-overview` and `auth` feature folders are NOT removed (brief out of scope): their README lines are updated, and their components stay tested. `loop-plan/references/remove-feature.md` is not applied because no feature folder is deleted.
- **Auth:** routes `/login`, `/reset-password`, `/auth/callback` stay in code. Only the sign-in items are removed from the profile menu and the sign-in panel from `/`. No change to the auth model, the Supabase calls or RLS (`.claude/rules/security.md`).
- **Naming:** brand text "Breathwork Timer" is copy, not an identifier. The trigger label changes from "Sign in"/"Account" to "Theme" (the menu now holds only the theme toggle; the label names what is there).
- **Protected files:** none. `src/config/app-tasks*.json` is updated at Pass by `loop-verdict`, not in this lap.
- **Feature README updates (staged with the code):** `src/features/harness-overview/README.md` (card no longer rendered on `/`) and `src/features/auth/README.md` (sign-in panel no longer rendered on `/`, sign-in items gone from the profile menu, routes kept).
- **Review:** size M. Done inline (no parallel lenses): the change is small and the risks are the routing and the auth tests. The only must-fix found is in phase 3: the redirect from `/breathe` must be `replace`, or the back button loops between `/` and `/breathe`.

## Acceptance test (red first)

`src/App.test.tsx`: with the URL set to `/`, the breathwork settings form renders (its Play button is present), and with the URL set to `/breathe`, the URL ends at `/`.

## Phases

### Phase 1 — top bar brand (red → green)

1. Write `src/layouts/Topbar/Topbar.test.tsx` first (red): the brand link has the text "Breathwork Timer" and href `/`; the text "Plate Harness" is not rendered.
2. `Topbar.tsx`: change the brand text to "Breathwork Timer". Same classes, height and elevation (D5).

Gate: `pnpm exec vitest run src/layouts/Topbar` passes.

### Phase 2 — profile menu holds only the theme toggle (red → green)

1. Update `src/layouts/ProfileMenu/ProfileMenu.test.tsx` first (red): the menu opens to the theme toggle only; signed-out and signed-in users see no "Sign in with Google", "Sign in with email", "Sign out" or account info; the trigger's accessible name is "Theme". Keep the existing colour-mode tests (they still apply).
2. `ProfileMenuContent.tsx`: render only the `ColorModeToggle` footer. Drop the `AccountMenuItems` block and its separator from the content.
3. `ProfileMenuTrigger.tsx`: `label` is "Theme" (for both states).
4. Delete `AccountMenuItems`, `SignInMenuItems`, `ProfileInfo` and `useAccountMenuActions` only if nothing else imports them (check with grep before deleting; the tests import `ProfileMenu` only). If anything else imports them, leave them and record it in Notes.

Gate: `pnpm exec vitest run src/layouts/ProfileMenu` passes.

### Phase 3 — the front door (red → green)

1. Write `src/App.test.tsx` first (red) per the acceptance test. Set `window.history.pushState({}, "", "/")` in each case; stub the auth provider as the other page tests do, if App needs it.
2. `src/App.tsx`: `/` renders `BreathePage` inside `MainLayout`. `/breathe` renders `<Navigate to="/" replace />` (the review must-fix). Remove the `HomePage` lazy import and its route. Keep `/harness`, `/login`, `/reset-password`, `/auth/callback`, `/tasks`, and the `*` redirect as they are.
3. Delete `src/pages/HomePage.tsx` and `src/pages/HomePage.test.tsx` (unrouted after step 2).
4. `src/pages/breathe/BreathePage.test.tsx`: unchanged; it still renders the page directly.

Gate: `pnpm exec vitest run src/App.test.tsx src/pages` passes; `pnpm type-check` is clean (no dangling `HomePage` import).

### Phase 4 — feature READMEs and gates

1. `src/features/harness-overview/README.md`: one line: the card is no longer rendered on `/` (the route `/harness` and the component remain; its backlog task removes them).
2. `src/features/auth/README.md`: one line: the sign-in panel is no longer on `/`; the profile menu no longer offers sign-in; the routes and components remain.
3. Full gates: `pnpm test:run`, `pnpm type-check`, `pnpm lint` (no new warnings), `pnpm arch:check`, `pnpm validate:structure`, `pnpm validate:feature-docs`, `pnpm validate:feature-size`, `node scripts/sync-agent-config.mjs --check`, `pnpm build`.
4. Browser check: run `pnpm dev` (or the built preview) and load `/` at phone width (390 px): the top bar reads "Breathwork Timer", the menu opens to the theme toggle only, the timer settings show, no harness card or sign-in panel. Record the result in Notes.

## Notes

- Stop 2 summary must say: `/` is now the timer; sign-in is hidden from the chrome but the auth routes and feature remain; `HomePage.tsx` was removed; `/harness` and `/tasks` are still routed but not linked.
- Lap commits wait for PR #8 to land (same branch), like the echo lap.

## Plan status

- Phase 1 (top bar brand): Done. Topbar tests 2/2.
- Phase 2 (profile menu theme-only): Done. ProfileMenu tests 11/11. Trigger labelled "Theme".
- Phase 3 (front door): Done. `src/pages/AppRouting.test.tsx` 2/2 (acceptance test). `HomePage.tsx` and its test removed.
- Phase 4 (READMEs and gates): Done. Gates: `pnpm test:run` 234/234 (32 files), `pnpm type-check` 0, `pnpm arch:check` exit 0 (info-level orphan notice only), `pnpm validate:structure` 0, `pnpm validate:feature-docs` 0, `pnpm validate:feature-size` 0, `sync-agent-config --check` 0, `pnpm build` 0. Lint: no errors; 1 warning in `ProfileMenu.test.tsx` (describe length, pre-existing); 2 warnings in `ResetPasswordPage.tsx` (not touched).

### Notes during development

- Acceptance test moved from `src/App.test.tsx` to `src/pages/AppRouting.test.tsx`: `projectStructure.config.cjs` allows only `App.tsx` at the `src/` root, and the whitelist is protected (not changed).
- Removed dead sign-in code in the menu cluster: `ProfileChips.tsx`, `ProfileEmail.tsx`, `ProfileInfo.tsx`, `ProfileName.tsx`, `SignInMenuItems.tsx`, and `src/shared/hooks/useAccountMenuActions.ts`. Nothing outside the cluster imported them (grep before deleting). Edges absorbed: these are inside `layouts/ProfileMenu` (in the brief) and one shared hook used only by that menu; Stop 2 summary should say so.
- `ProfileMenu` no longer runs the auth-backend or profile-query hooks for sign-in; it still calls `useUserProfileQuery` for the trigger. Left as is.
- Browser check (Playwright, built preview at 390×640): top bar reads "Breathwork Timer"; Play button present; no "Plate Harness", no harness card, no sign-in text; no horizontal overflow. The open menu was not captured in the browser (menu read came back empty); its contents are covered by the unit tests.
- `/harness`, `/login`, `/reset-password`, `/auth/callback`, `/tasks` stay routed and unlinked in production (site-chrome D4, D6).
