# CFO Portfolio Review

**Round:** 2
**Reviewer persona:** CFO, Geolabs Cloud
**Review date:** 2026-07-26
**Question I am answering:** is spending interview hours on this candidate a sensible use of the company's time?

---

## Business Verdict

**YES — with a caveat I want on the record.**

I would approve interview time. The candidate demonstrably builds things that reduce manual work, he is cost-disciplined in ways that show up in the architecture rather than in the copy, and the work is grounded in real commercial engagements rather than tutorials.

The caveat is that this portfolio contains several numbers that look measured and are not. That is a category of risk I am professionally allergic to. It does not read to me as dishonesty — it reads as a junior habit of filling in a number because the layout has a slot for one. But it is the habit I would most want corrected before this person is anywhere near a client deliverable or an invoice.

---

## First Impression

Ten seconds on the hero told me:

- He is a Systems Engineer from Cochabamba.
- He builds web interfaces, APIs, maps, and automation.
- He has commercial experience with a named employer and a named payment integration.

That is more than most technical portfolios give me in ten seconds, and I did not need to understand a single acronym to get it. The line *"Construyo sistemas web que convierten datos, APIs, información espacial y procesos en herramientas operativas simples de usar"* is the best business writing on the page — it describes an outcome, not a stack.

The right-hand card is well judged for my role: qualification, employer, specialty, three lines, no jargon. Someone thought about who reads this page.

I scrolled. That is the test the hero had to pass, and it passed.

---

## What I Understood Without Technical Knowledge

Without knowing what any of the technologies are, I understood:

1. **He built a real online shop that takes real money.** Awtu Commerce with BCP QR payments — automated verification of bank transactions. I know what that is worth, because manual payment reconciliation is a cost line I recognize instantly.
2. **He built a room-booking system that stops double-bookings.** A university had people assigning classrooms by hand and getting conflicts. He automated the conflict away. This is the clearest operational-value story on the site and it is described in plain language.
3. **He built a service that copies data between systems automatically, on a schedule, so nobody does it by hand.** Fine. I understand the shape of the value.
4. **He built a map that turns Bolivia's 2024 census into something you can click through.** This is the one I spent the most time on, and I'll come back to it.

Four projects, four understandable value propositions, zero requirement that I learn what "PMTiles" means. That is good communication and it is rarer than it should be among engineers.

What I did *not* find anywhere: **a single number describing business impact.** Not one. How many orders did the shop process? How many hours per week did the booking system save the faculty? How many records does the sync service move? How many people were double-booking rooms before? Every metric on this site describes the software (milliseconds, frames per second, test suites) and none describes the outcome (hours, bolivianos, errors avoided, people served).

That is exactly backwards for the two people on the review panel who control budget.

---

## Where I Lost Trust

I want to separate these carefully, because they are not equally serious.

### Serious — the numbers that aren't measurements

The flagship map displays a panel headed with 2024 census branding showing "POBLACIÓN ESTIMADA 84.500 hab.", "DENSIDAD 4.200 hab/km²", "COBERTURA INTERNET/FIBRA 94.5%". Those figures are typed into a source file by hand. They sit directly beside a map that genuinely is streaming official census geometry. Nothing on screen tells a reader which is which.

I want to be fair about the engineering: the map itself is real and, I'm told, technically impressive. That makes the problem worse, not better — the credibility of the real component is being lent to the invented one.

The same pattern repeats:

- A service status endpoint reporting `"status": "OPERATIONAL"`, `"recordsSynced": 1420`, `"health": "100% PASS"` for a service that is not running. The numbers are literals in a file.
- An AI response reporting `"tokensUsed": 168` — a constant, not a measurement, in the field that would tell me what the feature costs to run.
- Case-study metrics: "60 FPS", "AI Summary Latency < 800ms", "Execution Overhead < 45ms", "Calculation Speed < 16ms (Inmediato)". None of these were measured. They are plausible numbers occupying slots in a template.

Individually, each is small. Collectively they describe a person who is comfortable presenting an estimate in the visual language of a measurement. In an engineer, that costs rework. In anyone touching a client report, a data deliverable, or a cost projection, it costs credibility that is expensive to rebuild.

I'll add the thing that partly redeems this: **he does not inflate the claims that would be easy to inflate.** The skills matrix says "Intermediate+" for PHP and Docker where a less honest candidate writes "Expert." He does not claim PostGIS. He does not claim MCP. The restraint where it counts is genuine, which is why I read the fabricated metrics as a bad habit rather than a character issue.

### Serious — the contact form

I filled it in. It said the message was sent. Nothing was sent anywhere; the button only changes what's on screen.

Set aside what it says about diligence. Consider the direct business consequence *to him*: if anyone on our side uses that form to reach out, he never receives it, we conclude he didn't reply, and he loses the opportunity without ever knowing it existed. This is the one item on this page that could cost him the job silently.

### Moderate — nothing is verifiable

Four case studies. Zero links. No live demo, no repository, no screenshot, no recording. For Awtu Commerce — real commercial work, the single most valuable thing on this site from my chair — I am asked to take an unlinked paragraph on faith.

I understand that client work is often private. Then say so: *"Código privado del cliente — puedo mostrarlo en una llamada."* That sentence costs nothing and converts an unverifiable claim into a professional boundary. Silence converts it into a question mark.

### Moderate — a headline feature that does nothing

The map's first tab, "Bolivia Nacional," renders an empty screen. I clicked it, saw nothing, and assumed I had broken it. I am told this is because the underlying dataset has no coverage at that zoom level. That is a legitimate technical constraint with a five-word fix ("zoom in to see blocks") and it was left as a blank screen instead. Unfinished work presented as finished work is a maintenance-cost signal.

### Minor — the description doesn't match the product

The flagship section describes technologies the site no longer uses and a version of the framework two major releases behind what is installed. He rebuilt the thing and didn't update the brochure. On its own, trivial. Alongside the items above, it reinforces the same theme: the last 10% is consistently skipped.

---

## Business Value of Projects

| Project | What it does in business terms | Value signal | Verifiable? |
|---|---|:---:|:---:|
| **Awtu Commerce** | Online store that automatically confirms bank QR payments instead of someone checking transfers by hand, plus an AI assistant that answers customer questions without staff time. | **Highest** — revenue-generating, labour-replacing, and it is paid work he actually did. | No link |
| **Facility Reservation System** | Replaces manual classroom assignment; eliminates double-bookings and capacity breaches. | **High** — the cleanest "this removed a recurring manual process" story on the site. | No link |
| **PHP Data Sync Service** | Moves data between systems automatically on a schedule; nobody re-keys anything. | **Medium** — classic back-office cost reduction, but presented as fake live telemetry. | No link |
| **GeoInsights Bolivia** | Turns the national census from static documents into something you can explore visually. | **Medium-high as capability, low as product** — nobody is paying for this, but it proves he can build the kind of thing we sell. | It *is* the site |
| **Voronoi Lab** | Sketch of a service-coverage planning tool. | **Low** — and the description claims a specific method the code doesn't implement. | It *is* the site |

The two most commercially meaningful projects are the two I cannot see. The two I can see are the two nobody paid for. That is the wrong way round.

---

## Cost and Risk Perception

This is where the candidate does genuinely well, and I want to give proper credit.

**AI usage is disciplined, and the discipline is architectural.** The Gemini integration runs through a server-side proxy — the API key never reaches the browser, so it cannot be lifted and run up a bill on his account. The call caps output at 250 tokens. When no key is configured, the feature degrades to a local response instead of failing or hammering the endpoint. Someone who caps `maxOutputTokens` without being asked is someone who has thought about what an API costs per call. That is a habit I want in the building.

**The infrastructure choices are cheap by design.** Static prerendering, no database, no tile server, no hosted map service. The census map streams from a public archive over range requests — meaning the expensive part of a GIS platform, tile serving, costs him nothing. Deployment is Vercel. This is a person who builds things that don't generate monthly invoices.

**AI is presented as a tool, not a personality.** "Uso diario: Antigravity, Gemini CLI, Hermes" — stated as a working practice, not a revolution. No agent-swarm language, no claims about autonomous systems. Refreshing, and it tells me he'd use our tooling budget sensibly.

**Maintenance risk is the open question.** Against the discipline above, I have to weigh: a 20-error lint run, four hundred lines of dead code left in the repository, a project README that is still the framework's default template, and documentation that describes a previous version of the software. Those are the costs that show up six months later when somebody else has to touch the code. For a small team, that matters more than it would at scale.

**Net:** low operating-cost risk, moderate maintenance risk, moderate accuracy risk.

---

## Portfolio vs CV

The CV is the more disciplined document, and I found that interesting.

The CV states facts: Systems Engineer, UMSS 2024; Awtu Commerce with Next.js, TypeScript, MySQL, Firebase, BCP QR, Gemini; daily Linux; Git, Docker, SSH, Bash, cron, Playwright; currently completing a diploma in Data Science and AI. Every line is a claim about experience that a reference check can confirm or deny.

The portfolio takes those same true facts and dresses them in metrics that cannot be checked. The CV says "integrated BCP QR payments." The portfolio says "Payment Verification: Polling Tiempo Real / API Key Exposure: 0% / QA Coverage: Suites Playwright." The first is a fact. The second is a dashboard, and two of its three cells are unfalsifiable.

**Nothing in the portfolio contradicts the CV.** There is no inflation of role, employer, or dates. The alignment is good. But the portfolio is currently *less* trustworthy than the CV, which is the opposite of what a portfolio is for. The CV would survive a reference check unchanged; parts of the portfolio would not survive a technical one.

The ongoing Data Science & AI diploma appears on the CV and barely registers on the site. For a company doing spatial analytics, "currently studying data science" is a forward-looking asset worth more page space than a fabricated latency figure.

---

## Scores

| Area | Score | Notes |
|---|---:|---|
| Clarity of value | 8 | I understood all four projects without technical knowledge. Genuinely well communicated. |
| Business relevance | 7 | Operational tools, not toys. Loses points for zero outcome metrics. |
| Trustworthiness | 5 | Real substrate undermined by fabricated measurements and a form that reports false success. |
| Cost/risk awareness | 8 | Server-side key proxy, token caps, graceful degradation, no tile server, no database. Genuinely cost-literate. |
| Communication quality | 8 | Clear, human, mostly free of buzzwords. Bilingual, though the English version is incomplete. |
| Project maturity | 5 | Empty flagship tab, non-functional form, description drift, dead code, default README. |
| Authenticity | 6 | Real projects and honest skill levels, wrapped in template-generated polish that reads machine-written. |
| Likelihood I would approve interview time | 8 | Yes. The underlying capability is real and the cost instincts are good. |

**Average: 6.9 / 10**

---

## Top Fixes Before Sending

### Three changes that would increase business trust

1. **Put a number on the outcome of one project.** One sentence: *"Reemplazó la asignación manual de aulas en una facultad, eliminando los cruces de horario que ocurrían cada semestre."* Even without a currency figure, an outcome stated in operational terms is worth more than every millisecond on this page combined. Right now every metric describes the software and none describes what changed for the people using it.
2. **Delete every number you did not measure, and label every figure you estimated.** "60 FPS", "< 800ms", "< 45ms", "< 16ms", `tokensUsed: 168`, `recordsSynced: 1420`, `health: 100% PASS`. Then add one line to the census panel: *"Indicadores ilustrativos de zona — la geometría y sus atributos provienen del archivo oficial del Censo 2024."* Volunteering the limits of your own data is the single strongest trust signal available to you, and it is free.
3. **Fix the contact form or remove it.** It currently tells people their message was delivered when it was not.

### Three things to remove because they create risk or confusion

1. **The `OPERATIONAL` service-status endpoint.** It reports live health for a service that isn't running. Relabel it as an example response contract — which is a perfectly respectable thing to show — or take it down.
2. **The Voronoi Lab's method claim.** It names a specific algorithm and a library that the code does not use. Either implement it or describe what it actually does.
3. **The dashboard-style metric pills on the case studies.** Three cells per project, most of them unfalsifiable. Replace with one honest sentence about what the project changed. Fewer claims, better claims.

### Three ways to make projects sound like operational value rather than tech demos

1. **Lead every case study with the manual process it replaced.** "Before: someone checked bank transfers by hand and confirmed each order. After: confirmed automatically in seconds." That is the structure. The technology becomes the footnote it should be.
2. **State the user, not the stack.** Who used this? A shop owner. A faculty administrator. Ninety students trying to book a room. Naming the human makes the value legible instantly.
3. **Say what you would do next and what it would cost.** "Next step: add automatic invoice generation — about a week." That sentence signals someone who thinks in scope and effort, which is what I need from anyone whose work I have to budget for.

### One better headline

> **"Construyo herramientas que reemplazan trabajo manual: tiendas que cobran solas, sistemas que evitan errores de agenda y mapas que hacen usable la información pública."**

Same person, same projects, zero jargon, and every clause names an outcome rather than a technology.

### One better project description style

**Current:**
> "Integrated BCP QR payment gateway with real-time transaction status polling and webhook callbacks."
> `Payment Verification: Polling Tiempo Real | API Key Exposure: 0% | QA Coverage: Suites Playwright`

**Better:**
> **Awtu Commerce — tienda en línea con cobro automático**
> *Antes:* cada pago por QR se verificaba a mano revisando la cuenta del banco antes de confirmar el pedido.
> *Ahora:* la plataforma consulta el estado de la transacción con el BCP y confirma el pedido automáticamente.
> *Mi rol:* integración de la pasarela de pagos, panel de administración del catálogo y asistente de soporte con IA.
> *Código privado del cliente — puedo mostrarlo en una llamada.*

Four lines. No unverifiable numbers. A named boundary instead of an awkward silence. Every sentence is one I could repeat to a colleague and defend.

---

## Final Recommendation

**Approve the interview.**

The business case: he builds operational software that removes manual work, he has done it for money, and his instincts on running costs are better than most engineers I meet — the server-side key proxy, the token cap, the graceful fallback, and the deliberate absence of any server that bills monthly are all decisions someone made on purpose. Those instincts save real money in a small company and they are difficult to teach.

The risk to manage: he currently presents estimates in the visual language of measurements. Not to deceive — the pattern is too clumsy and too consistent for that, and the places where inflation would actually pay off are conspicuously honest. It reads as a junior habit of treating an empty metric slot as something to be filled rather than something to be earned. That habit is correctable, and correcting it early is worth doing, because it is precisely the habit that becomes expensive the first time it appears in something a client reads.

**My recommendation to the panel:** interview him, and in the interview ask him where three specific numbers came from. If he answers straight — "those are illustrative, the real data is the geometry" — hire him and correct the habit in review. If he defends them, that tells us something more important than anything else on the page.
