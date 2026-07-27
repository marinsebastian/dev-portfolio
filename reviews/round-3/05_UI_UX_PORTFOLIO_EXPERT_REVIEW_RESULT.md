# UI/UX Portfolio Expert Review

**Round:** 3 (first review of the Multi-LLM Copilot / Enterprise UX build)
**Reviewer persona:** Senior UI/UX designer — developer portfolios and premium SaaS interfaces
**Review date:** 2026-07-27
**Method:** used the live production build as a visitor, then instrumented every viewport, then read source to diagnose what I found

---

## Overall Verdict

**SHIP.**

Round 2 was FIX BEFORE SENDING, and the reason was blunt: the site presented a complete control surface — scope tabs, layer pills, a legend with a colour ramp — for data that was never on screen. That is the most misleading state an interface can be in, and it is fixed.

What replaced it is a genuinely good piece of interaction design. Not "good for a portfolio." The focused-mode console — map left, chat right, ask a question and watch the map respond — is a product-quality interaction that I would be pleased to ship.

Every blocker from Round 2 is closed. The measurements below back that up.

---

## First 10 Seconds

| Question | Answered? | How fast |
|---|:---:|---|
| Who is this person? | **Yes** | Immediately |
| What kind of work do they do? | **Yes** | Immediately |
| What proof exists? | **Yes** | Now demonstrable rather than asserted |
| Which project should I click first? | **Yes** | The one glowing button, unmistakably |
| Can I contact or interview them easily? | **Yes** | Email and phone both work; the form is honest |

Five out of five, up from four-and-a-half. The change is in rows three and five: proof is now something you operate, and the contact form no longer claims to send.

The rotating conic-gradient border is the right amount of animation — one moving element on the first screen, everything else still. And it is implemented properly: the angle is a registered `@property` custom property so the browser interpolates it on the compositor rather than repainting a background string every frame. That is a detail almost nobody gets right.

---

## Measured Results

Instrumented across five viewports on the production build:

| Viewport | Page h-scroll | Elements clipped | Controls < 40px | Missing focus rings |
|---|:---:|:---:|:---:|:---:|
| 360 | none | 4 (decorative glow + `<code>` in scrollable `<pre>`) | 16 | **0** |
| 390 | none | 4 (same) | 16 | **0** |
| 768 | none | 1 (`<code>` in `<pre>`) | 16 | **0** |
| 1024 | none | 1 (`<code>` in `<pre>`) | 16 | **0** |
| 1440 | none | 0 | 22 | **0** |

Against Round 2, where 360px had **22** clipped elements, **32** undersized controls and **no focus indicators anywhere**. The remaining "clipped" items are a decorative background glow that is intentionally oversized, and `<code>` elements inside `overflow-x: auto` containers — which is correct behaviour, not a defect.

Focused mode on a 390×844 phone: overlay 844px, map canvas 337px, composer bottom at 816px — **on screen**. Using `dvh` rather than `vh` means the collapsing mobile address bar cannot push the input out of reach, which is the classic failure of full-screen mobile chat.

---

## Navigation and Scroll Behaviour

**Fixed since Round 2:**
- **The 1024px header collision is gone.** The six-link nav now appears from `xl`; below that everything gets the drawer. Measured: zero overflow at 1024.
- **The 640–1023px navigation gap is gone.** The trigger and the drawer share a breakpoint, so no width is left without navigation.

**Still open:**
- **No active-section indication.** Six nav links, none ever highlights. On a single-page site the nav is the reader's map, and this one never says "you are here." Unchanged from Round 2 and now the most conspicuous navigation gap.

---

## Project Section Review

**The flagship is transformed.** Real census blocks in a legible colour ramp, a selected block picked out with a glowing teal stroke, a threshold filter that *dims* rather than hides non-matching blocks — keeping the street grid visible so a filtered view still reads as a city. That last choice is the mark of someone who thought about what the filter is for.

**The layer selector is better as a grouped dropdown than it was as pills**, and critically each option carries its unit: `Densidad poblacional (hab/ha)`, `Cobertura de internet (%)`. Density and coverage cannot be misread as the same scale. Small typographic decision, real analytical consequence.

**The national view has an honest empty state** — amber notice explaining the archive has no geometry below zoom 8, with a button to jump to where it does. Round 2 had a black rectangle.

**Focused mode is the best thing on the site.** Split 50/50 on desktop; on mobile the map takes the top ~40% and the chat the rest. The spec says 50/50 and it is closer to 40/60 — the controls strip and chat header take the difference. I would call that the *right* deviation: the composer staying reachable matters more than hitting an exact ratio, and the controls collapse to a single scrollable row in this mode rather than eating the map.

**Escape closes it and focus returns to the trigger.** Body scroll is locked while open. Both correct.

---

## Interaction and Animation Review

**Genuinely good:**
- Streaming text renders progressively, batched to one update per animation frame. Naive per-chunk `setState` produces visible jank on a fast connection; this doesn't.
- The typing indicator lives on a separate element from the streamed content, so a multi-paragraph answer never lands in a `inline-flex` bubble and turns into a broken column layout.
- `overscroll-contain` on the message list — chat scrolling does not bleed into the page.
- Tool invocations surface as small chips (`set_map_layer()`) under the answer. The user can see what the AI did to their map. That is the right transparency for an agent that mutates state.
- The provider/model badge on each answer tells you which vendor produced it.
- The terminal's character-by-character typing and coloured log lines have real texture.

**Now handled, previously not:**
- **Reduced motion is honoured properly.** `SectionReveal` uses `useReducedMotion()` and renders a plain div — the CSS-only override in Round 2 could not touch Framer Motion's JS-driven transforms. The gradient border also stops rotating while keeping a static gradient, so the button retains its visual role.
- **The contact form is honest.** It composes a real `mailto:` draft and says so before you submit.

**Rough edges:**
- **No stop/cancel on a streaming response.** Once the copilot starts, you wait. A long answer with no way out feels like a hang.
- **No visible error state for a mid-stream failure.** Errors before the stream starts are handled well; a connection dropping halfway leaves partial text with no indication it stopped early.
- **The location modal interrupts at 2.5 seconds,** before the visitor has met the map it would help. The copy and privacy note are excellent. The timing is the problem.

---

## Accessibility Review

The weakest dimension in Round 2 (scored 3) and the most improved.

| Item | Round 2 | Now |
|---|---|---|
| Focus indicators | **None anywhere** | Present site-wide; measured 0 missing across all viewports |
| `<html lang>` | Frozen at `es` | Follows the toggle, with a test asserting it |
| Language switcher | No accessible name or state | `role="group"`, `aria-label`, `aria-pressed`, 44px targets |
| Tap targets | 32 of 56 under 44px | 16 under 40px; none below the 24px AA floor |
| PDF dialog | No role, no Escape, no focus restore | `role="dialog"`, `aria-modal`, Escape, focus returns to trigger |
| Reduced motion | CSS-only, ineffective on JS animation | Honoured by the motion library itself |
| Decorative `//` markers | Read aloud as "slash slash" | `aria-hidden` |

New components hold the same standard: the focused console is a labelled `role="dialog"` with Escape and focus restoration; the location modal is `aria-modal` with `aria-labelledby` and `aria-describedby`; the terminal and test log are `role="log"` with `aria-live="polite"`, so a screen-reader user hears output as it arrives.

**Still open:**
- **The map canvas has no keyboard path and no text alternative.** The copilot is arguably a better-than-usual mitigation — a keyboard user can drive the map by typing at it, which is more than most map interfaces offer — but the canvas itself remains unreachable and unlabelled.
- **Tab panels are still plain buttons** with `aria-pressed` rather than `role="tab"` / `aria-selected` / `aria-controls`.
- **10px monospace labels** remain widespread and are at the edge of legible.

---

## What Feels AI-Generated

Much less than Round 2. The fabricated metric pills are gone, the machine-voiced status labels are gone, and the invented latency figures are gone.

What remains:
1. **"PATRÓN VERIFICADO"** stamped on each capability card. Verified by whom?
2. **Seven identical section frames** — `//` marker, centred heading, centred paragraph, grid. The content inside varies now; the frames don't.
3. **The stack matrix.** Nineteen technologies with level badges, sitting next to four working demonstrations of the same skills. Exhaustive lists are what generators produce.
4. **"Relevancia para el rol"** on all five case studies.

**What does not feel generated,** emphatically: the copilot. The provider abstraction, the tool schemas, the handling of Gemini's signature quirk, the decision to strip leaked tool markup from the visible answer. No generator produces that; it comes from building something and watching it misbehave.

---

## What Feels Premium

- **Colour discipline.** One accent, still used only for interactive and live states.
- **The focused console.** Dark header, split panes, provider badge. Reads as a product.
- **The liquid-glass location modal.** Backdrop blur, soft teal glow, generous spacing. Best-looking single element on the site.
- **The gradient border,** for its restraint and its compositor-friendly implementation.
- **Unit labels on the layer options.** A one-word typographic decision that prevents a real analytical error.
- **The threshold filter dimming rather than hiding.** Preserves context under a filter.
- **The census map itself**, now that it renders.

---

## Broken / Nonfunctional Elements

**None.** For the first time across three rounds, I found nothing on this site that does not do what it appears to do.

Round 2's blocker list — empty map, form that lied, AI that answered about the wrong city — is fully closed. The map renders, the form composes a real draft and says so, and the copilot answers about the region you selected.

Remaining items are refinements, not defects:

| Item | Severity |
|---|:---:|
| No active-section indicator in the nav | Low |
| No stop button on a streaming response | Low |
| No visible error state for a mid-stream failure | Low |
| Location modal interrupts before the visitor has engaged | Low |
| Map canvas not keyboard-reachable or labelled | Medium (a11y) |
| Tab panels not marked up as tabs | Low (a11y) |
| No project screenshots anywhere | Medium (content) |

---

## Scores

| Area | Score | Notes | Δ vs R2 |
|---|---:|---|:---:|
| Hero clarity | 9 | Five of five questions answered; one purposeful animation. | — |
| Visual originality | 9 | Console identity plus a focused workspace that reads as a product. | ▲ +1 |
| Premium feel | 9 | Glass modal, gradient border, streaming chat, unit-labelled controls. | ▲ +1 |
| Information hierarchy | 7 | Strong within sections; seven identical frames and a dense page. | — |
| Project-card quality | 6 | Well organised, honest about access — still no images. | ▲ +1 |
| Case-study depth | 7 | Real links where they exist, explicit notes where they don't. | ▲ +1 |
| Interaction polish | 9 | Streaming, rAF batching, tool chips, focus restoration, honest empty states. | ▲ +4 |
| Animation quality | 9 | Restrained, purposeful, and reduced-motion is genuinely honoured. | ▲ +1 |
| Mobile UX | 8 | Overflow gone, targets fixed, `dvh` keeps the composer reachable. Dense. | ▲ +3 |
| Accessibility | 7 | Focus rings, live `lang`, proper dialogs, live regions. Map canvas still unreachable. | ▲ +4 |
| Conversion / contact clarity | 8 | Form is honest; phone gated but reachable in one click. | ▲ +3 |
| Overall send-readiness | 9 | Nothing broken; remaining items are refinements. | ▲ +4 |

**Average: 8.1 / 10** (Round 2: 6.2)

---

## Must Fix Before Sending

**None.** For the first time in three rounds this section is empty. There is no blocker.

---

## High-Impact Improvements

1. **Add project screenshots.** Still the single highest-leverage change. A page about building visual interfaces where the only visuals are the interfaces on the page itself.
2. **Add an active-section indicator to the nav.** An `IntersectionObserver` over the section ids. On a single-page site this is the reader's orientation.
3. **Add a stop button to the streaming response.** Standard in every chat UI; its absence is noticeable.
4. **Move the location prompt behind a click** — attach it to a "usar mi ubicación" control on the map itself. Same feature, no interstitial.
5. **Give the map canvas a text alternative and a keyboard path.** Even a described summary of what is rendered plus keyboard scope switching would close the last real accessibility gap.
6. **Handle a mid-stream failure visibly.**
7. **Thin the page.** Four micro-apps, a chat console, a test runner and a full map console is a lot to absorb in three minutes. Three micro-apps would sharpen it.

---

## Remove or Hide

1. **"PATRÓN VERIFICADO."** Last piece of unexplained certification language.
2. **Half the stack matrix.** It asserts what the micro-apps now demonstrate.
3. **The illustrative zone summary cards.** Honestly labelled now, but the block-level data is real — leading with that and dropping the illustrative panel removes the question entirely.
4. **The per-project "relevancia para el rol" boxes.** Reframe as where the work applies.

---

## Make It Feel Less Like It Is Trying to Fit Geolabs

**Wording:** rename the five relevance boxes. Drop "PATRÓN VERIFICADO."

**Visual:** let one section look like something other than a console — a plainly typeset piece of writing about how he approaches a problem. The contrast would strengthen the console sections and prove the aesthetic is a choice.

**Ordering:** lead with Awtu Commerce. Paid work with a payment gateway is the reassuring artifact; the census copilot is the impressive one. Confident ordering puts reassurance first and lets the impressive thing land as a surprise.

**Range:** one thing with no map in it.

---

## Better Interaction Ideas

1. **Hover preview on the case-study tabs** — a small screenshot on hover. Solves the no-images problem and the which-to-click problem at once.
2. **Let the copilot cite the block it is describing** by flashing that polygon while it answers. The connection between sentence and geometry is currently left to the reader.
3. **A "compare two cities" mode.** The data is already loaded; this would turn a viewer into an analysis tool.
4. **Persist the conversation across a page reload.** Session memory would make return visits feel continuous.
5. **A share button on a copilot answer** that copies a link restoring scope, layer and threshold. That turns an interaction into something a reviewer can send a colleague — which is exactly what you want a portfolio to produce.

---

## Final Send Recommendation

**SHIP.**

Three rounds ago this was a well-designed page with a decorative map. Two rounds ago it was a well-designed page with a map that rendered nothing while claiming otherwise. It is now a well-designed page with a working spatial console you can talk to, and I could not find anything on it that does not do what it appears to do.

The measurements support the verdict rather than decorate it: page-level horizontal scroll eliminated at every viewport, clipped elements down from 22 to zero-of-consequence at 360px, focus indicators from none to complete, undersized tap targets halved, and the mobile composer staying reachable under a collapsing address bar.

What remains is a refinement list, and the top item has been the same for three rounds: **add screenshots.** It is the one thing this portfolio still asks its reader to imagine.
