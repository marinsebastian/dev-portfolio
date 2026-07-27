# CEO Portfolio Review

**Round:** 2
**Reviewer persona:** CEO, Geolabs Cloud
**Review date:** 2026-07-26
**Artifacts reviewed:** running production build (`npm run start`, localhost:3000), repository source, `CV Sebastian Marin.pdf`
**Time budget simulated:** 5 minutes browsing, then 20 minutes verification

---

## Executive Verdict

**INTERESTING CANDIDATE — worth CTO review, but hold the send until the map works.**

This is the same verdict as Round 1, and that is a problem. Round 1 gave a list of ten fixes; one of them (the map upgrade) was executed, and eight were not.

Worse, the one that *was* executed does not work. I spent several minutes exploring what I believed was a live census map of Bolivian city blocks. It was a plain street map centred on open ocean. The census layer — the thing this entire portfolio is built around — has never drawn a single polygon on the deployed site. I only learned this because my engineers verified it; nothing on the page told me.

I would still forward Sebastian, because the ambition and most of the machinery behind that map are real and unusual. But I would not send this link to anyone until it renders, and I would want to know why nobody checked.

---

## First 10 Seconds

What I understood immediately:

- Name, title, country. Good.
- "Desarrollador Full-Stack enfocado en Interfaces, APIs, Datos Espaciales y Automatización." That is a clear, un-generic positioning line. It survives the ten-second test.
- The quoted value line — *"Construyo sistemas web que convierten datos, APIs, información espacial y procesos en herramientas operativas simples de usar"* — is the best sentence on the site. It is written like a person, not like a template.
- The right-hand "DIAGNÓSTICO TÉCNICO" card gives me degree, employer, and specialty in one glance. For an executive, this card is doing real work.

What made me hesitate:

- The status chip says **"LISTO PARA DESPLIEGUE" / "READY TO DEPLOY."** Applied to a person, this reads as machine language about a machine. It is the first small signal that some of this copy was generated rather than written.
- The card says **"VERIFICACIÓN QA: 100% Playwright."** 100% of what? I later found the suite is five smoke tests. It is not a false statement, but it is a statement engineered to look bigger than it is, and that is the kind of thing I notice.

Verdict on the first ten seconds: **I kept scrolling.** That is the answer that matters.

---

## What I Clicked and Why

| # | What I clicked | Why | What happened |
|---|---|---|---|
| 1 | "Explorar GeoInsights Bolivia" | It is the primary CTA and the thing the site is proudest of. | Took me to the flagship map. Good. |
| 2 | The **"Bolivia Nacional (9 Dptos)"** scope tab | It is the leftmost tab and the broadest claim. | **The map went empty.** Dark basemap, no data. I assumed I had broken something. |
| 3 | "Santa Cruz" scope tab | To recover from the blank screen. | A dark street map appeared and I assumed the census layer had loaded. It had not — I was looking at a basemap over the Atlantic. |
| 4 | Where I thought a city block was | Curiosity — can I drill in? | Nothing happened. In hindsight, obvious: there were no blocks to click. |
| 5 | "Ejecutar Análisis IA Gemini" | To see whether the AI is real or decoration. | Returned a paragraph about *Equipetrol, Santa Cruz* — while I was looking at La Paz. |
| 6 | The `EN` language toggle | To check the English version before forwarding to an English-reading colleague. | Half the executive card stayed in Spanish. |
| 7 | Case study tabs (Awtu, Reservation, PHP Sync) | Commercial proof. | Well written. **No link to anything.** No demo, no repository, no screenshot. |
| 8 | The contact form | To test whether the site is finished. | Said "sent successfully." Nothing was sent. |

Attention dropped at step 5. By step 8 I had stopped reading and started auditing, which is not how I want an executive to spend their time on a portfolio.

---

## What Made Me Trust Him

1. **The flagship map is not decoration — even though it is currently not working.** The pipeline behind it is real: a 90 MB PMTiles archive of 247,346 census block polygons, streamed over HTTP byte-range requests, with the dataset's undocumented field encoding worked out by hand. That is not something you fake in an afternoon, and my engineers were more impressed by it than by anything else in the applicant pool. The failure is one bad line of camera coordinates, not an absence of substance.
2. **The positioning is honest about level.** The stack matrix says "Intermediate+" for PHP and Docker rather than "Expert" for everything. Candidates who inflate every bar are easy to spot; this one didn't.
3. **The commercial work is specific.** "Awtu Commerce — BCP QR payments, Gemini support assistant, admin catalogue CRUD" is a real, checkable claim about a real local business, not "e-commerce platform for a client."
4. **He built the thing he claims to build.** The portfolio itself *is* an operational interface over spatial data. The medium is the proof. I like that.
5. **The CV and the site agree with each other.** No invented employers, no invented years, no title inflation. The CV says Systems Engineer, UMSS 2024, and so does the site.

---

## What Made Me Doubt Him

Ordered by how much each one cost him with me.

1. **The headline feature shows nothing — anywhere.** I clicked "Bolivia Nacional" and got a black rectangle. I assumed I'd broken it, switched to Santa Cruz, and saw a map. Only later, when the engineers checked properly, did it turn out that the census blocks I thought I was looking at were never there at all. The map was showing a plain street backdrop centred on open ocean, in every city. The specific cause is a latitude/longitude ordering mistake left over from swapping map libraries — the sort of thing a test would have caught in a second.

   I want to be fair about the magnitude and about what it means. It is one small mistake, and the ambitious part of the work — pulling a quarter of a million real census records into a browser — is genuinely built and genuinely difficult. But the headline claim on this site is currently not true on the deployed page, and I would have forwarded it to my CTO believing it was. That is the part I mind. It reads as "not verified" rather than "not capable."
2. **The AI button gives the wrong answer.** I selected La Paz; the AI described Equipetrol in Santa Cruz. I confirmed this is repeatable. An AI feature that confidently returns the wrong region is worse than no AI feature, because it makes me question every other number on the page.
3. **A contact form that lies.** It says the message was sent successfully. No message is sent anywhere. If a recruiter uses that form and waits for a reply, the candidate loses the opportunity and never knows. This is the one item on the list I would call a genuine business risk to him personally.
4. **The English version isn't finished.** Twelve visible strings stay in Spanish after switching to EN, including the entire executive card that I called this site's strongest asset. I share candidate links with people who don't read Spanish. Right now I can't.
5. **Numbers I can't source.** The zone panel shows "POBLACIÓN ESTIMADA 84.500 hab." and "COBERTURA INTERNET/FIBRA 94.5%" under a heading that says Censo 2024. Those specific figures are hand-authored in the codebase, not read from the census file the map is streaming. The map is real; the numbers next to it are illustrative. Nothing on screen tells the reader which is which. That distinction matters enormously to a company whose product *is* trustworthy geographic data.
6. **Claims that describe an older version of the site.** The flagship section still says "Leaflet," "GeoJSON department layers," and "Next.js 14." The site actually uses MapLibre GL, PMTiles, and Next.js 16. He upgraded the engine and forgot to update the brochure. Small, but it is exactly the kind of drift that makes a reviewer stop believing the brochure.
7. **No proof I can open.** Four case studies, zero links. I cannot see Awtu Commerce. I cannot see the reservation system. I cannot see the PHP repository. For a candidate whose main asset is "I have shipped real things," giving me no door to walk through is a strategic mistake.

---

## Strategic Fit for Geolabs

**Can he convert data and processes into usable tools?** Yes, and the flagship proves it better than any bullet point could. He took an open census archive that most people would look at once and close, and turned it into something a non-technical person can click through. That is precisely the skill we hire for.

**Can he learn fast inside a platform like ours?** The evidence says yes. Between Round 1 and Round 2 he replaced a Leaflet/GeoJSON map with a MapLibre GL vector-tile pipeline, including protocol registration and byte-range tile streaming. That is a real jump in capability, executed quickly.

**Does he show autonomy?** Strongly. Nobody told him to find `@mauforonda`'s atlas. He went looking for Bolivian open data and found the best available source.

**Can he document and explain his work?** This is the gap. He can write *marketing* copy about his work — the case studies read well. He does not yet reliably keep that copy synchronized with what the code actually does, and the repository's own README is still the unmodified `create-next-app` template. In a small team, documentation drift is expensive. This is the one area where I'd want the CTO to probe hard.

**Would he collaborate well in a small team?** Nothing here suggests otherwise. The concern is not attitude, it's finishing discipline: the last 10% of each feature — the empty state, the error path, the English string, the link — is consistently the part left undone.

---

## Scores

| Area | Score | Notes |
|---|---:|---|
| First impression | 8 | Strong hero, clear positioning, credible visual identity. Loses a point for machine-ish status copy. |
| Professional credibility | 7 | The map earns real credibility; unlinked case studies and unsourced numbers spend it back. |
| Clarity of positioning | 9 | Best attribute of the site. I know what he does in one sentence. |
| Business relevance | 7 | Projects are operational, not decorative. Weakened by absent outcome metrics (revenue, hours saved, users). |
| Authenticity | 6 | Real substrate, but "READY TO DEPLOY", "100% Playwright" and invented latency figures read as generated polish. |
| Evidence of initiative | 9 | Finding and integrating the atlasurbano PMTiles archive is genuine initiative. |
| Fit for a growing technical team | 7 | Capable and fast. Needs a habit of finishing the last 10%. |
| Likelihood I would keep reading | 8 | I read the whole page. |
| Likelihood I would forward to CTO | 7 | Yes — with caveats attached, not as a clean recommendation. |

**Average: 7.6 / 10**

---

## Top Fixes Before Sending

### The top 3 changes that would increase executive trust

1. **Make the map actually draw the census blocks, and add a test that proves it.** This is the whole ballgame. Once the blocks render, add the honest empty state for the national view too — "los manzanos INE se renderizan desde el nivel de zoom 8, acércate para verlos" — because that view legitimately has no data at that scale. An explained empty state beats a mysterious black box every single time.
2. **Separate verified data from illustrative data, visibly.** Add a small label to the zone metrics panel: "Indicadores ilustrativos de zona — los polígonos y sus atributos provienen del archivo PMTiles del Censo 2024." One sentence converts the biggest credibility liability on the site into evidence of rigour. A candidate who volunteers the limits of his own data is a candidate I trust more, not less.
3. **Make the contact form do something real, or delete it.** A form that reports success without sending is the only defect here that can silently cost him an interview.

### The top 3 things to remove or simplify

1. **"100% Playwright" and "VERIFICACIÓN QA."** Say "5 pruebas E2E automatizadas (Playwright)". The real number is more impressive than the percentage, because the real number is checkable.
2. **The invented performance figures** — "60 FPS", "< 800ms AI latency", "< 45ms execution overhead", "< 16ms calculation". Nobody asked for them, nobody can verify them, and each one is a small withdrawal from the trust account.
3. **"LISTO PARA DESPLIEGUE."** He is a person, not a container image. "Disponible para entrevistas" says the same thing in human.

### The top 3 ways to make it feel less like it was made only for Geolabs

1. **Rename the "RELEVANCIA PARA EL ROL FULL-STACK" boxes.** Every case study ends with a paragraph explaining why the project matters to *us*. It is well-intentioned and slightly uncomfortable — it reads as though the projects exist to match our job posting. Reframe them as "Dónde se aplica" / "Where this applies" and describe the general class of problem.
2. **Lead with the commercial work at least as prominently as the map.** Awtu Commerce is real paid work with a real payment gateway. Right now it sits behind a tab in the second half of the page while a self-initiated GIS demo takes the whole first screen. The GIS demo is the more impressive artifact; the commerce platform is the more reassuring one.
3. **Show one thing that has nothing to do with geospatial.** The Linux/automation and PHP work is currently represented only by code snippets in a viewer. One concrete story — "the university IT automation script that replaced N hours of manual work per week" — would prove range and remove the sense that this site was reverse-engineered from a job description.

### The one project or section that should be featured most prominently

**GeoInsights Bolivia — but repaired.** Once the Nacional view stops rendering empty, the AI returns the region I actually selected, and the panel is honest about which numbers come from the census file, this is a genuinely differentiating flagship. Nobody else applying to us will have streamed a quarter of a million real census polygons into a browser. Fix it, don't replace it.

### The one sentence that should appear near the top of the site

> "Ingeniero de Sistemas boliviano — construyo interfaces, APIs y mapas que convierten datos públicos y procesos manuales en herramientas que la gente usa todos los días."

It keeps the strongest existing line, adds where he is from (an asset, not a footnote, for a company operating in this region), and replaces deployment jargon with the thing he actually does.

---

## Final Recommendation

**Forward to CTO — with the caveats above stated explicitly in the handoff.**

My honest summary for the CTO: *"Ambitious and fast. Built a real vector-tile census map on his own initiative, which is more than anyone else in this pile has done. Also shipped it with an empty tab, an AI button that returns the wrong region, and a contact form that pretends to send. Find out in the interview whether the gap between those two facts is inexperience or carelessness — because if it's inexperience, this is a strong hire."*

If the seven items above are fixed, my verdict moves to **STRONG CANDIDATE — forward immediately.** None of them require new features. They require finishing the ones that are already there.
