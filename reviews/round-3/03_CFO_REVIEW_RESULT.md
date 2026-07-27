# CFO Portfolio Review

**Round:** 3 (first review of the Multi-LLM Copilot / Enterprise UX build)
**Reviewer persona:** CFO, Geolabs Cloud
**Review date:** 2026-07-27
**Question I am answering:** is spending interview hours — and eventually salary — on this candidate a sensible use of company money?

---

## Business Verdict

**YES — and the caveat I placed on the record last round is resolved.**

In Round 2 I approved interview time while noting that this candidate "presents estimates in the visual language of measurements." Every one of the specific figures I objected to is gone or corrected. The zone panel now states outright that its aggregate numbers are illustrative references, not official readings. The service-status endpoint no longer reports fabricated counters under an `OPERATIONAL` banner. The invented latency and frame-rate figures are gone, replaced in one case by a live measurement of the actual page.

That is the response I wanted, and the speed of it tells me something useful about how this person takes feedback.

What is new this round is a piece of work with real commercial implications, so most of this review is about that.

---

## First Impression

Ten seconds gave me the same clear picture as before: Systems Engineer, Cochabamba, builds web interfaces, APIs, maps and automation. Still the clearest positioning of anyone in this pile.

The new element is a button offering an "AI Map Copilot." My reflex on seeing AI on a CV is to assume a thin wrapper around someone else's API, priced as though it were original work. I clicked expecting to be unimpressed.

Instead I got a split screen: a census map of Bolivia on one side, a chat on the other, and a dropdown letting me choose between **three different AI vendors**. I asked it to show me areas with high fibre coverage. It changed the map and explained what it had done.

I want to be precise about why that dropdown matters to me specifically, because it is not an aesthetic detail.

---

## What I Understood Without Technical Knowledge

1. **He built one thing that works with three different AI suppliers.** Not three integrations — one, that any of them plug into. If a vendor raises prices, changes terms, or has an outage, you switch with a dropdown instead of a rewrite.

2. **The AI does work, rather than describing work.** It moved the map, filtered it, and explained the result. That is the difference between a feature and a demo.

3. **The census map is a real analysis tool.** A quarter of a million city blocks from the national census, explorable, with the caveat about which numbers are official stated on screen.

4. **The four capability panels are working software, not pictures of software.** One measures the page's own performance while you watch. One sends live requests to his own services and shows the real response. I clicked both.

5. **He protects his contact details from scrapers,** and had found and fixed a spot where his own CV was leaking the number the contact form protected.

---

## The vendor-independence point

This is the finding I would raise at a budget meeting, so let me set it out plainly.

Anyone can integrate an AI provider. The integration is usually written directly against that provider's SDK, and the provider's assumptions end up spread through the codebase. Switching later means rewriting, which is why so many companies stay on a supplier they have outgrown or that has become expensive.

What this candidate built is a single adapter that all three vendors plug into, because all three speak a common request shape. Adding a fourth is a configuration entry, not a project. The application does not know or care which vendor answered.

The commercial consequence is straightforward: **no vendor lock-in, and price competition stays available to us permanently.** In a market where AI pricing has moved repeatedly and unpredictably, that is a durable saving, and it costs nothing extra to build in from the start — but almost nobody does, because it requires seeing the problem before it bites.

He also built the cost controls I would have asked for and did not have to:
- Conversation length capped, request size capped — before anything reaches a metered endpoint.
- Output length capped per request.
- A client can *ask* for a specific vendor, but the server only honours it if that vendor is actually configured, so a malformed or malicious request cannot trigger spend on an unintended account.
- The whole feature degrades gracefully with no vendor configured at all: the site still works and the chat explains what is missing.

That last one matters more than it sounds. It means the site can be deployed and demonstrated **at zero AI cost** and only starts spending when someone deliberately turns a provider on.

---

## Where I Lost Trust

Short list this round, and nothing on it concerns honesty.

1. **PHP is still the gap.** Our posting leads with it. He shows competent PHP and now labels the related endpoint honestly as an example rather than implying a running service — which resolved my Round 2 objection. But there is still nothing I can click and watch PHP do. If a comparable candidate has a running PHP service, that is where the comparison turns.

2. **No spending limit on the AI feature.** The caps prevent an accidental blowout from one oversized request. Nothing prevents someone hitting the endpoint repeatedly. For a personal portfolio with his own key that is his risk, not ours — but if this pattern moved into our product unchanged, it would be a live cost exposure. I would want to hear him volunteer that before I asked.

3. **The commercial work is still invisible.** Awtu Commerce is the project with actual revenue attached, and it remains a paragraph with no screenshot and no link — with an honest note that the code is the client's. The honesty is right. The absence of any picture still means the paid work is the least tangible thing on a site full of tangible things.

4. **The page is doing a lot.** Four interactive tools, a chat console, a test runner, a live map. Each is genuinely good. Collectively it is a demanding page, and demanding pages get skimmed. There is a shorter version of this site that would sell him better.

---

## Business Value of Projects

| Project | Business translation | Value | Verifiable? |
|---|---|:---:|:---:|
| **AI Map Copilot** | Lets a non-technical person interrogate a large public dataset by asking, rather than by learning an interface. Works with three interchangeable AI suppliers, so no lock-in. | **Highest** | Yes — I used it |
| **GeoInsights Bolivia** | Turns the national census into something explorable. Precisely the class of product we sell. | **High** | Yes — it's the site |
| **Awtu Commerce** | Online shop with automatic bank-QR payment confirmation, replacing manual transfer checking. | **High as work, low as evidence** | No link (client-owned, stated) |
| **Facility Reservation System** | Removed manual classroom assignment and the double-bookings it caused. | **Medium-high** | Coursework, stated |
| **PHP Sync Service** | Scheduled background data movement between systems, no manual re-keying. | **Medium** | Contract published, service not running |
| **Live micro-apps** | Demonstrations that also *are* the thing demonstrated. Cheap to build, disproportionately persuasive. | **Medium** | Yes — I used them |

---

## Cost and Risk Perception

**Operating cost: very low, and deliberately so.** Static prerendering, no database, no tile server, no hosted map service. The census map streams from a public archive using range requests, which means the expensive part of any GIS product — serving tiles — costs nothing here. Deployment is Vercel. The AI spend is opt-in per provider key and capped per request. This is someone who builds things that do not generate monthly invoices unless you ask them to.

**Vendor risk: actively mitigated,** per the section above. This is the strongest cost-discipline signal I have seen from any candidate this cycle.

**Maintenance risk: substantially improved.** Round 2 found 28 lint problems, a default framework README, and documentation describing a previous version. All three are resolved: linting is clean, the README describes the actual architecture, and there is a document specifically explaining which data is real and which is illustrative. The automated test suite has gone from 5 tests to 39, and now covers the features that were previously broken. Those are the costs that surface six months later when somebody else touches the code, and they have gone down.

**Accuracy risk: resolved.** The specific issue I raised last round — presenting estimates as measurements — has been addressed everywhere I checked. One figure that was being inflated by a factor of 350 through a stray multiplier is now reported in its real units. That was found and fixed rather than defended.

**Remaining exposure: no rate limiting.** Small, and correctly scoped to his own deployment. Worth one interview question.

---

## Portfolio vs CV

Round 2's finding was that the CV was the more trustworthy document, because the portfolio wrapped true facts in unverifiable metrics. **That has reversed.** The portfolio now demonstrates more than the CV claims, and everything it demonstrates I could operate myself.

The one asset still underused: the CV mentions an in-progress Diploma in Data Science & AI. Given that he has just shipped a multi-provider AI integration, "currently formalising this" is a forward-looking statement worth more prominence than it gets.

---

## Scores

| Area | Score | Notes | Δ vs R2 |
|---|---:|---|:---:|
| Clarity of value | 9 | I understood every project, and now I could use most of them. | ▲ +1 |
| Business relevance | 9 | Vendor-independent AI over public data is our business, described in our language. | ▲ +2 |
| Trustworthiness | 8 | Every fabricated figure I objected to is gone or corrected. | ▲ +3 |
| Cost/risk awareness | 10 | Multi-vendor by design, capped requests, opt-in spend, graceful zero-cost degradation. | ▲ +2 |
| Communication quality | 8 | Clear and bilingual. The page is denser than it needs to be. | — |
| Project maturity | 8 | Working features, honest empty states, 39 automated tests. | ▲ +3 |
| Authenticity | 9 | States the limits of his own data unprompted. | ▲ +3 |
| Likelihood I would approve interview time | 9 | Yes, and I would move quickly. | ▲ +1 |

**Average: 8.8 / 10** (Round 2: 6.9)

---

## Top Fixes Before Sending

### Three changes that would increase business trust

1. **Put one outcome number on one project.** Still the single highest-value sentence he could add. *"Eliminó los cruces de horario que ocurrían cada semestre en una facultad."* Every metric on this site describes software; none yet describes what changed for the people using it.
2. **Add a spending guard to the AI feature and say so.** He has thought about cost more carefully than most engineers I meet. Making the last piece explicit converts good instinct into a demonstrated discipline.
3. **Show Awtu Commerce.** One screenshot. The revenue-generating project should not be the least visible thing on the page.

### Three things to remove because they create risk or confusion

1. **The illustrative zone summary cards.** Now honestly labelled, which fixed the credibility problem — but since the block-level data is genuinely real, leading with that and dropping the illustrative panel removes the question entirely.
2. **The superseded AI endpoint.** Two code paths doing one job will drift, and drift is what produces the next wrong number.
3. **One of the four micro-apps.** Not because any is weak, but because attention is the scarce resource on a page a reviewer gives three minutes.

### Three ways to make projects sound like operational value rather than tech demos

1. **Open each case study with the manual process it replaced.** "Before: someone checked bank transfers by hand." The technology becomes the footnote it should be.
2. **Name the user.** A shop owner. A faculty administrator. Ninety students trying to book a room.
3. **Say what it would cost to extend.** "Next step: automatic invoicing — about a week." That sentence signals someone who thinks in scope and effort, which is what I need from anyone whose work I have to budget.

### One better headline

> **"Construyo herramientas que reemplazan trabajo manual — y que no dependen de un solo proveedor para seguir funcionando."**

Same person, same projects, and it leads with the two things a CFO actually buys: less manual work, and no lock-in.

### One better project description style

> **Copiloto de Mapas con IA — pregúntale al Censo 2024**
> *Antes:* explorar los datos censales exigía saber qué capa activar y qué umbral aplicar.
> *Ahora:* se pide en lenguaje natural y el mapa se mueve solo.
> *Por qué importa comercialmente:* funciona con tres proveedores de IA intercambiables (NVIDIA, Gemini, OpenAI). Si uno sube de precio o falla, se cambia desde un menú, sin reescribir nada.
> *Coste:* cero hasta que se activa una clave; consumo acotado por petición.

Five lines, no unverifiable numbers, and the third line is the one I would repeat to the board.

---

## Final Recommendation

**Approve the interview, and move quickly.**

The business case: he builds operational software that removes manual work, his cost instincts are better than most engineers I meet, and he has now demonstrated the specific piece of architectural foresight — vendor independence — that saves real money later and that almost nobody builds in at the start.

The Round 2 caveat is discharged. I flagged a habit of presenting estimates as measurements and said it needed correcting early. It was corrected comprehensively, including one case where a real figure was being inflated 350-fold by a stray multiplier — found by checking rather than by being told. A candidate who audits their own work harder after criticism than before it is a candidate worth hiring.

**Remaining question for the panel:** PHP is our first stated requirement and the only one still without a running artifact. Everything else he claims, I was able to use myself.
