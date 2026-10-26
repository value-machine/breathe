# Brief — Fix Google sign-in returning to the wrong site with a PKCE error

Task: Fix Google sign-in returning to the wrong site with a PKCE error · Lap: temp_job_google-signin-return · Harness: v0.43.0

## Problem
After signing in with Google from a preview site, the owner lands on the production site with "PKCE code verifier not found in storage", and a correct return would still show that error because the callback exchanges the same code twice.

## Success check
(1) The Google redirect address sent to Supabase ends with `/`, so an allow-list pattern of the form `<origin>/**` matches it on every host. (2) With the real supabase-js client, a `?code=` that the library already exchanged during initialization is not exchanged a second time: `handleCodeExchange` returns no error, calls the token endpoint exactly once, and navigates on.

## In scope
- `signInWithGoogle` redirects to `<origin>/` (via `getAppUrl("/")`).
- `authService.hasSignedInSession()` (waits for client initialization, ignores anonymous sessions) and `handleCodeExchange` checking it before exchanging.
- Auth README note; Google setup doc note on redirect URL patterns.
- Backlog: archive the finished error-capture task; new follow-up task "Decide whether the app uses anonymous sign-ins".

## Out of scope
- Will NOT do: enabling or removing anonymous sign-ins (auth permission model, owner decision, queued as a task).
- Will NOT do: changing `detectSessionInUrl`, the PKCE flow, the callback routes, or password-recovery handling.
- Will NOT touch: Supabase project settings (owner changes them; the lap only documents them), protected rules and skills.

## Edges
| Feature area | Loop today | Hook point | Ride / new |
|---|---|---|---|
| `src/features/auth/services` | Google button → `signInWithOAuth` with bare-origin `redirectTo` → return to `/?code=` → library exchanges during init → `useAuthCallbackHandler` exchanges again | `authService.ts`, `authCallbackService.ts` | ride |
| Auth README, Google setup doc | describe the flow and the redirect URLs | one note each | ride |
| Backlog JSON | seeded and queued tasks | archive + new task | ride |

Overrun rule (skill-loop D51): a diff that touches a feature area **not** in this table stops the lap.

## Size
S — two service files, one new function, tests, two doc notes; no new dependency.
Cut into laps: anonymous sign-ins decision queued as a task.

## Decisions
DECISIONS.md D1–D4. Vision `DRAFT`: deferred.

## Plan (S: plan lives here)
Tests first and red first.
1. `authService.test.ts`: `signInWithGoogle` passes `redirectTo` ending in `/`; `hasSignedInSession` cases (no session, anonymous, signed in, not configured, error).
2. `authCallbackService.test.ts`: real client via `supabaseService` with a stubbed environment and `fetch`, URL `/?code=…` and a stored verifier. Red before the fix: the second exchange fails with the verifier message. Plus mocked cases: exchange when no session, mapped error, same code twice.
3. Implement `getAppUrl("/")`, `hasSignedInSession`, and the check in `handleCodeExchange`.
4. README and Google doc notes. Full gate list.
