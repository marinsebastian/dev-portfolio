# CEO Portfolio Review

**Round:** 3 (first review of the Multi-LLM Copilot / Enterprise UX build)
**Reviewer persona:** CEO, Geolabs Cloud
**Review date:** 2026-07-27
**Time budget simulated:** 5 minutes browsing, then 15 minutes of follow-up

---

## Executive Verdict

**STRONG CANDIDATE — forward immediately.**

Two rounds ago I wrote "interesting, here's what to check." One round ago I found out the census map I'd been admiring had never actually drawn anything, and I held the send. This time I clicked through the same journey and everything I was promised was there.

More than that: he built something I did not ask for and did not expect. You can now talk to the map. In Spanish. And it moves.

---

## First 10 Seconds

Same strong hero as before — name, discipline, country, one clear sentence about what he does. It still passes the ten-second test, and the small annoyances I flagged last round are gone. The status chip no longer says "READY TO DEPLOY" about a human being; it says available for interviews. The QA claim is now "Playwright E2E" instead of an unexplained "100%."

What is new in the first screen: a button with a slowly rotating coloured border, labelled *Abrir Copiloto IA del Mapa*. It is the only animated thing on the page, which is exactly why my eye went to it. Good instinct — one moving element reads as an invitation; five would read as a template.

I kept scrolling. Then I went back and clicked the button.

---

## What I Clicked and Why

| # | What I clicked | Why | What happened |
|---|---|---|---|
| 1 | **"Abrir Copiloto IA del Mapa"** | It moved, and I wanted to know if it was real. | The screen split: census map on the left, chat on the right. A provider dropdown offering NVIDIA, Gemini and OpenAI. |
| 2 | The chip **"Ver áreas con fibra > 80%"** | Fastest way to find out whether this actually does anything. | The map switched layers, dimmed everything below 80% fibre coverage, and the assistant explained in Spanish what it had just done and what the pattern meant. |
| 3 | An individual city block | To see whether the detail was real. | Population, density in inhabitants per hectare, internet, water and education — with a note saying which figures come from the census file and which are illustrative. |
| 4 | The **"Bolivia Nacional"** tab | It gave me a black rectangle last round. | A clear amber notice: the census file has no data at this zoom, here is a button to zoom to where it does. |
| 5 | The four capability pillars | These used to be code snippets I couldn't read. | Four working tools: a live page-performance readout, an API tester that actually calls his endpoints, a map showing where it thinks I am, and a replayable server console. |
| 6 | **"Ejecutar pruebas"** in the QA section | Curiosity. | A test runner walked through ten checks in a simulated browser and reported them all passing. |
| 7 | The phone number | Habit — I wanted his contact details. | It was blurred behind a button. I clicked; it appeared. |

I did not have to force myself through any of that. That is the difference from last round.

---

## What Made Me Trust Him

1. **He fixed the thing that was broken, and made sure it can't quietly break again.** Last round the census map rendered nothing while the repository claimed it worked. It renders now — thousands of blocks — and my engineers tell me there is a specific automated test whose only job is to fail if it ever goes blank. Fixing a bug is ordinary. Building the tripwire so the same class of mistake cannot hide again is what I actually wanted to see.

2. **The AI feature is not a chatbot bolted to a corner.** It reads the map, changes the map, and explains what it changed. When I asked for high-fibre areas it did three separate operations and then described the result. That is the difference between "we added AI" and "AI does something here."

3. **He supports three AI providers, not one.** From a business standpoint this is the detail I care most about: he is not locked to a single vendor's pricing or availability. If one gets expensive or goes down, the dropdown switches. Most people building this would have hardwired whichever one they had a key for.

4. **He tells me which numbers he trusts.** The map panel says outright that the summary figures are illustrative references and the block-level data comes from the census file. Last round I flagged that gap as a serious credibility problem. Volunteering the limits of your own data is a mark of someone I could put in front of a client.

5. **The tools are real.** The API tester sent an actual request while I watched and showed me the actual response. The performance readout measures the page I am on. He could have faked all of that with static screenshots and I would not have known.

6. **He protects his own phone number** from scrapers, and had noticed that his CV section was printing it in plain text and quietly defeating the whole exercise. Small thing. Tells me he checks his own work.

---

## What Made Me Doubt Him

Fewer items than any previous round, and none of them are trust problems.

1. **Still no PHP I can actually see running.** It is the first requirement in our posting. He shows competent PHP code and honestly labels the endpoint as an example rather than pretending it is live — which is a real improvement — but I still cannot click anything and watch PHP do work. If someone else applies with a running PHP service, that is where they beat him.

2. **The location prompt interrupts me before I have decided I care.** Two and a half seconds in, a dialogue asks for my location. The explanation is good and the privacy note is genuinely reassuring. But it arrives before I have any reason to want it. Let me discover the map first, then offer.

3. **The site is now dense.** Four interactive micro-apps, a chat console, a test runner, a map with layers and filters. Every piece is good. Together it is a lot to take in, and a reviewer with three minutes may bounce off the density rather than the quality. There is a version of this page with a third less on it that would land harder.

4. **The projects still have no screenshots.** Awtu Commerce — his actual paid work — is a well-written paragraph with no picture and no link. Everything I can *see* on this site is self-initiated. The commercial work, which is the reassuring part, remains the part I have to take on faith.

---

## Strategic Fit for Geolabs

**Can he convert data and processes into usable tools?** This is now beyond argument. He took a census archive most people would open once and close, made it explorable, and then made it conversational. That is precisely our business.

**Can he learn fast?** Three rounds of evidence: Leaflet outlines → real vector tiles → a multi-provider AI layer that drives them. Each step was a genuine capability jump, delivered quickly.

**Does he show autonomy?** Nobody asked for a provider-agnostic AI adapter. He built one because vendor lock-in is a real problem.

**Can he document and explain?** Yes now. The README describes the architecture accurately, there is a document explaining exactly which data is real and which is illustrative, and the commit history explains causes rather than just listing changes. Two rounds ago the README was still the framework's default template.

**Would he collaborate well in a small team?** The finishing discipline I complained about in Rounds 1 and 2 has visibly improved. Empty states are explained, error paths are handled, claims match behaviour. The remaining gap is prioritisation — he builds the impressive thing before the requested thing. That is a conversation, not a concern.

---

## Scores

| Area | Score | Notes | Δ vs R2 |
|---|---:|---|:---:|
| First impression | 9 | The hero is clean and the copilot button earns the one animation on the page. | ▲ +1 |
| Professional credibility | 9 | Everything he claims, I could click. | ▲ +2 |
| Clarity of positioning | 9 | Unchanged and still the site's strongest asset. | — |
| Business relevance | 8 | Multi-vendor AI and a working data console are directly our business. | ▲ +1 |
| Authenticity | 8 | Honest labels, stated data limits, no invented metrics left. | ▲ +2 |
| Evidence of initiative | 10 | Nobody asked for a provider-agnostic AI adapter. | ▲ +1 |
| Fit for a growing technical team | 8 | Fast and capable; still builds the impressive thing before the asked-for thing. | ▲ +1 |
| Likelihood I would keep reading | 9 | I clicked seven things without forcing myself. | ▲ +1 |
| Likelihood I would forward to CTO | 9 | Already done. | ▲ +2 |

**Average: 8.8 / 10** (Round 2: 7.6)

---

## Top Fixes Before Sending

### The top 3 changes that would increase executive trust

1. **Give me one PHP thing that runs.** It is our first stated requirement and the last one resting on assertion. A small containerised service behind a documented endpoint would close the only real gap left.
2. **Show me Awtu Commerce.** A screenshot. One image of the real commercial product. Right now the impressive things are the ones he built for himself, and the reassuring thing is the one I cannot see.
3. **Move the location prompt behind a click.** Let the map earn the request. An interstitial before I have engaged costs more goodwill than the feature gains.

### The top 3 things to remove or simplify

1. **Cut one micro-app.** All four are good; three would be sharper. The page currently asks a reviewer to absorb a great deal in a short visit.
2. **The zone summary cards.** They are now honestly labelled as illustrative, which solved the credibility problem — but a reviewer still meets invented numbers beside real ones. Since the block-level data is real, lead with that and drop the illustrative panel entirely.
3. **The older AI endpoint.** My engineers tell me the copilot has superseded it and both still exist. Two things doing one job will drift apart.

### The top 3 ways to make it feel less like it was made only for Geolabs

1. **The per-project "relevance to the role" boxes are still there.** Rename them to describe where the work applies generally. The site is strong enough now that the special pleading actively undersells it.
2. **Lead with the commercial work.** A shop that takes real payments is the more reassuring artifact; the census console is the more impressive one. Confident ordering puts the reassuring one first.
3. **Show one thing with no map in it.** Everything spatial is excellent. One piece of range would prove the geospatial focus is a choice.

### The one project or section that should be featured most prominently

**The AI Map Copilot.** It is the most differentiating thing in the entire applicant pool, and it demonstrates three of our requirements simultaneously — AI tooling, geospatial work and API integration — in a way a non-technical person can evaluate in thirty seconds by clicking one chip.

### The one sentence that should appear near the top of the site

> "Ingeniero de Sistemas boliviano — construyo herramientas donde los datos públicos se vuelven algo que puedes preguntar, tocar y usar."

It keeps his positioning, adds where he is from, and captures the thing that is genuinely new here: you can talk to this data.

---

## Final Recommendation

**Forward immediately. Book the technical screen.**

My note to the CTO: *"Third look at this one. Round 2 I held it because the flagship map turned out to be rendering nothing. He fixed it, added a test so it can't hide again, and then built a multi-provider AI copilot that actually drives the map — which nobody else in this pile has attempted. Still no running PHP, which is our first requirement, so probe that. Everything else he claims, I clicked."*

The trajectory across three rounds matters more than any single score: he ships ambitious work fast, and he is visibly getting better at finishing it. That is a good person to hire early.
