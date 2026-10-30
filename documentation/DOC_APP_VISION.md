# App vision & goals

> **Vision status:** `ACTIVE` — Source of truth for product decisions. Functional scope comes from the Breathwork Timer app design document (`TomFranse/breathwork`, `documentation/app-design-document.txt`); the stack and architecture follow this repo.

Static product brief for this fork. Agents read this before ambiguous product or UX work. **SSOT** for problem, persona, and the app’s role relative to users.

---

## Problem statement

People who want to calm down, reduce stress, or practice a breathing technique (box breathing, Wim Hof, pranayama) need to keep a paced breathing rhythm, track rounds, and hold their breath for the right durations. Doing this by counting or watching a clock breaks the rhythm and pulls attention away from the breath. Without a guided tool, the practice is harder to repeat consistently and the intended effect (stress reduction, focus, meditation) is harder to reach.

---

## User persona

**Name / label:** The self-directed breath practitioner

- **Goals:** Start a breathing session quickly, with the pattern they chose (inhale/exhale length, breaths before a hold, hold target, number of rounds). Relax without having to look at a timer.
- **Frustrations:** Counting by hand, switching between a timer and a breathing guide, sessions that run on without an easy pause or stop.
- **Constraints:** Usually on a phone, sometimes on a desktop. Often sitting with eyes closed or with low attention to the screen. Needs audio cues and a large, readable control set.
- **Success in a day:** Completes one or more rounds calmly and returns to the settings page without friction.

---

## App’s role

The Breathwork Timer is a single-page web app that guides a user through a configurable breathing session. It shows an expanding and contracting circle for the breathing rhythm, plays sound cues for each phase, and shows how many rounds remain.

- **In one sentence, this app:** guides a breathing session with a visual circle, sound cues and round tracking, configured by the user before each session.
- **It is not:** a medical, therapy or diagnostic tool; a meditation library; a social or sharing product (social sharing is a future idea only); a multi-technique coach (the first version covers one round-based pattern; other techniques are future work).
- **Integrates with / assumes:** a browser with audio output. No backend is required for the core session. Hosting follows this repo (Cloudflare Workers, see `documentation/DOC_CLOUDFLARE_WORKERS.md`).

### Core session flow

1. **Settings page** — the user sets:
   - *Breaths before hold*: inhale/exhale cycles before the hold phase.
   - *Inhale/exhale time* (seconds).
   - *Breath hold target* (seconds): the maximum hold, reached in the final round.
   - *Number of rounds*.
   - Options such as sound on or off.
2. **Hold progression** — the hold length grows across rounds: ⅓ of the target in round 1, ⅔ in round 2, the full target in the final round.
3. **Round sequence** — each round is:
   - the main breathing phase: inhale and exhale, repeated for the configured number of breaths;
   - the hold sequence: hold (round-based length), inhale, a fixed 15-second hold, exhale.
4. **Controls** — Play starts the session, Pause pauses and resumes it, Stop ends it and returns to the settings page. A finished session also returns to the settings page automatically.
5. **Cues** — a rising soft tone on inhale, a falling soft tone on exhale, and a silent or subtle drone during a hold.

### Design direction

- Calm, soft palette ("Dawn", picked by the owner over the original lavender-and-peach design colors and two other options): warm cream background, off-white cards, sage mint for breath surfaces, and a deep teal for interactive elements. Text is soft warm dark gray.
- Mobile-first layout that also scales to desktop. Large, centered breathing circle; play button centrally placed on the settings page; play, pause and stop at the bottom of the timer page.
- Smooth transitions and fades between phases.
- Typography and shape (decided in the UI redesign lap): Fraunces headings, Inter body, soft 1rem corners and pill buttons. The breathing orb is mint during breaths and lightens to the card color during a hold, between two guide rings that mark a full and an empty breath.

The palette is mapped to the theme tokens in `src/shared/theme/tokens/`. Two adjustments were needed for WCAG AA: the primary teal is set a shade deeper than the design teal so white button text reaches 4.5:1, and the muted text is darkened for the same reason. Dark mode is not in the design; its values are a derived counterpart.

---

## Optional: north-star goals

- **Goal 1:** A user can configure and complete a full session (all rounds, including holds) from the settings page without reading the screen during the session.
- **Goal 2:** Every phase change is signaled by sound and by the circle's motion, so the session works with eyes closed.
- **Goal 3:** The session runs smoothly on a phone: pause, resume and stop are reachable with one tap at all times.

---

## Optional: open questions

- Hosting: the design names Firebase; this repo deploys to Cloudflare Workers. Confirm Workers is the target.
- Settings persistence: the design does not say whether settings or completed sessions are stored (per device, or in Supabase for logged-in users).
- Sound: the design specifies a silent or subtle tone for holds, but not the default for the sound on/off switch or whether sound is allowed before the first user tap (browser audio policy).
- Future techniques (box breathing and others), a PWA, and a moving wave visualization are listed as future ideas, not in scope.
