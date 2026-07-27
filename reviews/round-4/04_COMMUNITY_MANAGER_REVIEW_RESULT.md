# Community / Brand Portfolio Review

**Round:** 4 (Header rework + micro-apps/code-block eradication pass)
**Reviewer persona:** Community Manager / Communications, Geolabs Cloud
**Review date:** 2026-07-27
**Method:** attempted to browse as a normal visitor (Browser pane), independently re-fetched with `WebFetch`, and independently re-fetched with `curl -D -` for raw headers; retried three times including a cache-busted query string; probed the git-branch preview alias as a fallback; read the source for the two commits under review (`8e1a808`, `fe0a2b2`) to determine what a working deploy would currently show

---

## Brand Verdict

**DO NOT SHARE — the link is dead.**

I opened `https://dev-portfolio-lilac-chi.vercel.app` the same way a recruiter forwarding this to a hiring manager would: I clicked it. It does not load the portfolio. It returns:

```
HTTP/2 404
x-vercel-error: DEPLOYMENT_NOT_FOUND
server: Vercel
```

with the body `The deployment could not be found on Vercel.` I confirmed this four separate ways — the Browser pane, an independent `WebFetch` call, a raw `curl` with headers, and a cache-busted retry a few minutes later — and the result was identical every time, at the exact timestamp this round is dated. This is not a cold start, not a transient blip, and not a rendering artifact of my tools: it is Vercel's own edge network stating the deployment this domain is supposed to point to does not exist.

I also checked whether the work simply moved to a different address. The README (`README.md:7`) and `app/layout.tsx:15` both still declare `https://dev-portfolio-lilac-chi.vercel.app` as canonical, so this was not an intentional migration. I tried the project's git-branch preview alias as a fallback (`dev-portfolio-git-master-marinsebastians-projects.vercel.app`); it exists but 302-redirects to `vercel.com/sso-api` — a Vercel login wall. So even a visitor who somehow knew to try the branch URL cannot get past a sign-in screen that only Sebastian can pass. Right now, from outside this repository, **there is no way for anyone to see this portfolio at all.**

Everything below this line is therefore a two-track review: (1) what the outage itself means for brand and shareability, which I verified directly, and (2) what the *source code* behind the two new commits — header rework and micro-app cleanup — would show *if* the deployment were restored. I read the components and CSS directly rather than trusting the spec docs' own claims, and I flag every finding by which track it came from. I want to be explicit: nothing below in track (2) is a live visual judgment. I did not see a single rendered pixel of this site this round, and I am not going to pretend otherwise by describing a hero section I never looked at.

---

## First 10 Seconds

There were no first 10 seconds. The screen a visitor sees is Vercel's generic infrastructure error page — no logo, no teal, no monospace, no "Sebastian Marin," nothing that belongs to this brand. It is indistinguishable from any other broken Vercel deployment on the internet. If I did not already know this was Sebastian's project, nothing on that page would tell me.

Would I remember this person from this experience? I would remember that the link a candidate sent me didn't work.

---

## Copywriting Issues

*(Source-level only — I could not read this copy rendered on the page.)*

1. **"PATRÓN VERIFICADO" is still in the codebase and still wired up.** `data/translations.ts:286` (`verifiedPattern: "PATRÓN VERIFICADO"`), consumed by `components/sections/WhatIBuild.tsx`. Flagged in Round 3 as unexplained certification language (L2). Neither of this round's two commits touched it. Three rounds, no change.

2. **The five "Relevancia para el Rol" boxes are still in the codebase and still wired up.** `data/translations.ts:305` (`relevanceTitle: "Relevancia para el Rol Full-Stack"`), consumed by `CaseStudiesSection.tsx` and `FlagshipGeoSection.tsx`. Flagged in Round 3 as special pleading (L3). Unchanged.

3. **A humanizing line was removed, not added.** Round 3 specifically praised the change from "LISTO PARA DESPLIEGUE" to **"DISPONIBLE PARA ENTREVISTAS"** — quote: *"He is a person again, not a container image."* This round's own spec doc (`07_HEADER_AND_AI_BUTTON_SPEC.md`, row 3) states plainly: *"'RESUMEN PROFESIONAL' Card | Included 'Disponible para Entrevistas' badge. | Removed status badge to allow 'RESUMEN PROFESIONAL' title to expand cleanly."* I confirmed this in source: `telemetryStatus` is still defined in `data/translations.ts` (line 277: `"DISPONIBLE PARA ENTREVISTAS"`; line 514 EN: `"AVAILABLE FOR INTERVIEWS"`) but a full-repo search of `components/` for "entrevistas," "interviews," or "Disponible" returns **zero matches**. The key is now dead code — defined, translated, unused. The one sentence that made him "a person again" was cut for a typography tweak. That is a regression on the exact axis this persona review exists to protect.

4. **Still no first-person voice above the CV section.** `HeroSection.tsx` headline (`hero.titleStart` / `hero.titleAccent`) still reads "Desarrollador Full-Stack enfocado en Interfaces, APIs, Datos Espaciales y Automatización" — third-person/system voice, unchanged from Round 3's finding.

---

## Design and Visual Issues

*(I want to be honest about what I can and can't claim here. I read the component and CSS source; I did not see any of it rendered. A layout can look correct in JSX and still overflow, misalign, or clip in a browser — that's exactly the kind of bug two of the last three commits before this round were fixing. So treat this section as "the code says X," not "the page looks like X.")*

**What the source confirms was actually built** (not just claimed in the spec docs):
- `components/layout/Header.tsx` does carry the name + title branding ("Sebastian Marin" / "Ingeniero de Sistemas | Full-Stack") that the Hero no longer repeats — the de-duplication is real, not just documented.
- The desktop nav does use icon-first links that expand a text label on `group-hover` (`max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100`).
- `app/globals.css` does carry a conic-gradient rotating border (`copilot-border-spin`, 3.5s) with a `prefers-reduced-motion` override that disables the animation — matching what Round 3 called "a considered detail most people skip." At least the code for that detail survived this round's refactor.

**What is still open, confirmed in source:**
- **Zero project screenshots or photos exist anywhere in the repository.** `Glob` for `public/**/*.{png,jpg,jpeg,webp,gif}` and `app/**/*.{png,jpg,jpeg,webp}` returns nothing. Two full spec documents and two commits landed since Round 3 flagged this (H2) for the third consecutive round, and neither touched it. This is now a four-round-old finding on the highest-leverage, lowest-difficulty item on the Round 3 synthesis's own Top 10 list (Rank 2, "Low difficulty").
- **The OG/social share card is unchanged and still purely typographic.** `app/opengraph-image.tsx` — same layout Round 3 described: dark background, "SM" monogram, name, headline, four tech chips. No census-map choropleth, no product screenshot. L6 unresolved, byte-for-byte the same design.
- **The geolocation modal still interrupts at exactly 2,500ms.** `components/geo/GeolocationConsent.client.tsx:75` — `setTimeout(() => setPhase('asking'), 2500)`. M3, flagged by three reviewers in Round 3, untouched.
- **Density did not go down; the one thing that changed made it go up.** Per this round's own spec (`08_..._SPEC.md`), the API Explorer micro-app grew from 3 to 5 endpoints. M4 asked for thinning; the actual change added surface area to one of the four micro-apps the CM already called dense.

**What I cannot evaluate this round, and won't fake:** whether the enlarged "RESUMEN PROFESIONAL" typography actually fits its card at narrow widths, whether the 2×4 hero badge grid wraps cleanly on a 360px phone, whether the mobile pulse glow on the AI button is visible against the console background, whether the header's hover-expand nav has any effect on a touch device (hover doesn't exist there) — all of these are exactly the class of bug this project has shipped and then fixed in prior rounds (the two commits immediately before this round were both testing/fixing a button-targeting issue at the 360px breakpoint). I have no live evidence either way this round.

---

## Most Shareable Project

Per source, unchanged from Round 3: the **AI Map Copilot** remains the built feature most likely to produce a "just try this" reaction — `components/ai/MapCopilot.client.tsx` and the function-calling tool set were not touched by either of this round's two commits.

But the honest answer to "most shareable" this round is: **none of them, because none of them are reachable.** A feature's shareability is a property of the live experience, and there is currently no live experience to have an opinion about. The strongest asset this portfolio has built over three rounds is, as of this review, unverifiable by definition.

---

## Least Convincing Section

**The URL itself.** Nothing on the page can be more or less convincing than anything else when the page does not resolve.

If I set that aside and look only at what didn't change in source: the stack matrix that Round 3 called the weakest section (L4, "the matrix asserts what the micro-apps now demonstrate") was not touched by either commit this round. Same nineteen badges, same lack of connection to the interactive work sitting next to it.

---

## Does It Feel Too Tailored to Geolabs?

Same tells as Round 3, confirmed unchanged in source: the five "Relevancia para el Rol" boxes and the stack-matrix-as-requirements-list both persist untouched. I have no new evidence either way — this round's two commits were about header branding and micro-app polish, not case-study copy.

---

## Social / Link Sharing Notes

This is where the outage matters most, because it is literally this section's job.

- **What a WhatsApp/Slack/email unfurl bot gets right now if someone pastes this link:** nothing usable. A 404 response with `content-type: text/plain` and a 107-byte error body has no `<meta property="og:*">` tags to read — those only exist on pages the app actually serves, and the app is not serving anything. Depending on the platform, the recipient sees either a bare link with no card at all, or a generic "page not found" preview. The og:image code (`app/opengraph-image.tsx`), the `twitter:card` meta, the Spanish locale tag Round 3 verified in the rendered `<head>` — none of it is reachable to be unfurled. It doesn't matter that the code for a good card exists; a crawler hitting a 404 never sees it.
- **Is the link email-ready and WhatsApp-ready?** No. Sending it right now actively damages the impression: the recipient's first data point about this candidate is a broken production link, which is a worse signal than any content issue found in three prior rounds.
- **The short intro line I'd have sent** (see Round 3's, unchanged since — "Mira esto: Sebastian Marin puso los 247.346 manzanos del Censo 2024 en un mapa...") is now a line I cannot respons­ibly hand to anyone, because the payoff it promises is currently unreachable.

---

## Scores

| Area | Score | Notes | Δ vs R3 |
|---|---:|---|:---:|
| Visual memorability | N/A | Could not load the site to observe anything. Source-level identity (palette, header, gradient button) is intact and unchanged, but "memorable" is a judgment about a rendered page I never saw. Declining to fabricate one. | n/a |
| Copywriting clarity | 5 | PATRÓN VERIFICADO and the relevancia boxes persist (source-confirmed); the humanizing "DISPONIBLE PARA ENTREVISTAS" line was actively removed, not added to. A real regression on top of two unresolved items. | ▼ −3 |
| Authenticity | N/A | Same reasoning as visual memorability — this is a live-impression judgment I cannot make from source alone. | n/a |
| Brand fit without imitation | 6 | Case-study and stack-matrix copy untouched by this round's commits, so Round 3's "still mirrors the job posting in three places" stands unchanged by default, not by re-verification. | ▼ −1 (default, unverified) |
| Project storytelling | N/A | Same — requires seeing the page. | n/a |
| Screenshot / media quality | 3 | Directly verifiable without a live site: repo-wide search confirms zero image assets exist. Unchanged from Round 3's 3/10 for the fourth straight round. | flat |
| Mobile polish | N/A | Explicitly the category most likely to hide a regression — recent commits were fixing a 360px button-targeting bug — and the one I am least willing to guess at. Could not verify. | n/a |
| Shareability | 0 | The link returns `DEPLOYMENT_NOT_FOUND`. There is nothing to share. This is not a partial score — it is a fact, verified four independent ways. | ▼ −8 |

**Average of scorable items: 3.5 / 10** (4 of 8 categories; Round 3 average across all 8 was 7.3)

I am not filling in the N/A rows with estimates carried over from Round 3, because that would quietly launder a "could not check" into a "checked and it's fine," and the whole point of this exercise is catching exactly that kind of drift.

---

## Top Fixes Before Sending

### Fix zero, before anything else

**Get `dev-portfolio-lilac-chi.vercel.app` resolving again.** Check the Vercel project dashboard for a deleted deployment, an unassigned domain alias, or deployment protection accidentally left on (the git-branch URL redirecting to `vercel.com/sso-api` suggests protection may be enabled project-wide). Every fix below is moot until this is true. This is not a code change I can make or verify from this repository — it's an infrastructure/dashboard state check only the account owner can perform.

### Three copy changes to make it more human

1. **Restore "DISPONIBLE PARA ENTREVISTAS" / "AVAILABLE FOR INTERVIEWS" somewhere visible.** It was removed for a layout reason, not a content reason. Find it a home — footer, header badge, contact section — rather than leaving it as dead code in `translations.ts`.
2. **Drop "PATRÓN VERIFICADO."** Fourth round asking.
3. **Reframe the five "Relevancia para el Rol" boxes.** Third round asking; Round 3's point still stands — the work is strong enough now that the pleading undersells it.

### Three design changes to make it less generic

1. **Add one screenshot per project and one photo of Sebastian.** Fourth round asking. Two full spec docs shipped in the meantime touching header chrome and micro-app polish; this remains untouched. It is still the single highest-leverage, lowest-difficulty item outstanding.
2. **Put something other than typography on the OG card.** Second round asking specifically for the census choropleth.
3. **Reduce density instead of adding to it.** The API Explorer grew by two endpoints this round. Pick one micro-app to cut, as the Round 3 synthesis recommended, rather than expanding the ones that stayed.

### Three ways to improve project storytelling

1. Same as Round 3: give the copilot its one-sentence origin story.
2. Same as Round 3: open each case study with the person it was for.
3. New this round: **write a "why this repo currently 404s" line into nothing** — i.e., treat deployment reliability itself as part of the story. A portfolio for a systems engineer that goes down without anyone noticing across at least one commit cycle is a small, honest data point worth fixing quietly, not narrating.

### One better hero headline

Unchanged recommendation from Round 3, still not adopted in source:

> **"Ingeniero de sistemas en Cochabamba. Convierto datos públicos en herramientas que puedes preguntar en voz alta."**

### One short WhatsApp/email intro line for sharing

I'm not supplying a new one. The Round 3 line was good and the underlying feature is probably still good — but I cannot respons­ibly write a "send this" line for a link that returns a Vercel error page today. Fix the deployment first; the Round 3 line is ready to reuse the moment it does.

---

## Final Recommendation

**DO NOT SEND.**

Not because the work regressed technically — most of what I could verify in source is either unchanged or, in the header/nav case, a real improvement. But right now, at the moment of this review, **there is no portfolio for anyone outside this repository to look at.** `https://dev-portfolio-lilac-chi.vercel.app` returns `DEPLOYMENT_NOT_FOUND` from Vercel's own edge, confirmed independently four times including a cache-busted retry minutes apart. The fallback branch URL is walled behind a Vercel login screen. Three rounds of hard-won brand work — the census map, the multi-provider copilot, the OG card, the mobile fixes — are currently invisible to every one of their intended audiences.

This is a harsher verdict than any prior round reached, and it should be: a broken link is a worse first impression than any copy or density issue documented in Rounds 1 through 3 combined, because it forecloses the chance to make any impression at all. Everything on the Round 3 Top 10 list is still worth doing — screenshots, the OG image, "PATRÓN VERIFICADO," the relevancia boxes, the location-modal timing — but none of it can be evaluated, credited, or shared until the deployment itself is restored. That is fix zero, and it comes before every other line in this document.
