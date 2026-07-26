You are acting as a portfolio review orchestrator for Sebastian Marin's developer portfolio.

The goal is to evaluate whether the portfolio is ready to send to Geolabs Cloud for a developer position.

This is not a design-generation task.

Do not modify code.
Do not rewrite the portfolio.
Do not implement fixes.
Do not create new designs.
Do not change files except for writing review reports.

Your job is to run five separate reviews using the provided review prompt files, then synthesize the findings into a clear action plan.

## Context

Sebastian Marin is applying to a developer role at Geolabs Cloud.

The official job ad values:

- PHP intermedio-avanzado, with real production experience.
- Interactive responsive web interfaces.
- MySQL or PostgreSQL; PostGIS is valued.
- cURL and REST API integrations.
- Linux CLI, cron jobs and process debugging.
- Habitual use of AI tools and agents in development.
- Geospatial technology, maps, photogrammetry or GIS.
- Server automation or systems administration.
- Git, clean code, documentation and maintainability.
- MCP experience is valued but should not be claimed unless real.

Sebastian's CV includes experience with:

- Next.js, React, TypeScript, JavaScript.
- APIs REST and JSON.
- Node.js, Python, Django.
- Previous PHP CRUD and secure MySQLi integration.
- MySQL, PostgreSQL, Supabase and SQL Server.
- Linux CLI, Bash, PowerShell, Git, SSH, Docker, Docker Compose, cron jobs, environment variables and logs.
- Playwright.
- Gemini API.
- AI-assisted development tools.
- Leaflet and spatial visualization familiarity.
- Awtu Commerce: catalog admin, product filters, BCP QR payment API using polling/webhook, Gemini support assistant through an internal API.
- UMSS IT automation.
- Freelance portfolios with Next.js/Firebase.
- A reservation system with CRUD, schedules and availability constraints.
- Diplomado en Ciencia de Datos e Inteligencia Artificial.

Do not exaggerate beyond this.

## Inputs

Use these files:

- 01_CEO_REVIEW.md
- 02_CTO_REVIEW.md
- 03_CFO_REVIEW.md
- 04_COMMUNITY_MANAGER_REVIEW.md
- 05_UI_UX_PORTFOLIO_EXPERT_REVIEW.md

Use this live portfolio URL:

dev-portfolio-lilac-chi.vercel.app

Use this CV/resume file or path:

../CV Sebastian Marin.pdf

Use this portfolio codebase path if available:

../

## Very Important Review Rules

All five reviewers must judge the same exact baseline version of the portfolio.

Do not apply fixes between reviews.

For each reviewer:

1. Open the live portfolio URL first.
2. Browse the website like a real person in that role.
3. Form a first impression before reading the CV.
4. Only after the portfolio impression, compare against the CV.
5. Inspect code only when the review prompt asks for it or when credibility needs verification.
6. If a project link, demo, button or GitHub repo is broken, flag it clearly.
7. Be harsh but constructive.
8. Do not invent missing project functionality.
9. Do not give credit for side projects that do not actually work.
10. Prioritize whether the portfolio is credible enough to send.

If you cannot access the live URL in a browser, state that limitation clearly and perform the review from available screenshots/code, but mark confidence as lower.

## Browser Testing Requirements

For the UI/UX and CTO reviews, test or simulate:

- 360px mobile
- 390px mobile
- 768px tablet
- 1024px laptop
- 1440px desktop

For all reviewers, at minimum inspect:

- hero section;
- navigation;
- project section;
- project links;
- contact CTA;
- CV download/link;
- mobile behavior;
- whether projects actually work;
- whether the site feels AI-generated or authentic.

## Output Files

Create a directory:

reviews/round-1/

Inside it, create exactly these files:

1. reviews/round-1/01_CEO_REVIEW_RESULT.md
2. reviews/round-1/02_CTO_REVIEW_RESULT.md
3. reviews/round-1/03_CFO_REVIEW_RESULT.md
4. reviews/round-1/04_COMMUNITY_MANAGER_REVIEW_RESULT.md
5. reviews/round-1/05_UI_UX_PORTFOLIO_EXPERT_REVIEW_RESULT.md
6. reviews/round-1/REVIEW_SYNTHESIS.md

## How to Run Each Review

Read each prompt file completely and follow its output format.

The five reviews should feel like five different people reviewed the same portfolio:

- CEO: strategy, maturity, fit, whether they would forward it.
- CTO: technical credibility, broken demos, code quality, job-ad fit.
- CFO: business value, risk, cost discipline, trust.
- Community Manager: brand, tone, story, shareability.
- UI/UX Expert: visual quality, interaction, responsiveness, conversion.

Do not collapse them into one generic review.

## Synthesis Requirements

After writing the five review files, create:

reviews/round-1/REVIEW_SYNTHESIS.md

This synthesis should not simply repeat all reviews.

It must combine them into an actionable plan.

Use this structure:

# Portfolio Review Synthesis

## Overall Verdict

Choose one:

- SENDABLE AFTER SMALL FIXES
- PROMISING BUT FIX BEFORE SEND
- DO NOT SEND YET
- PORTFOLIO DAMAGES APPLICATION

Explain in no more than 6 sentences.

## Common Findings Across Reviewers

List patterns that appeared in multiple reviews.

## Blockers Before Sending

Only include issues that would seriously damage credibility.

Examples:
- broken project demos;
- fake/non-working buttons;
- missing contact/CV links;
- mobile layout broken;
- exaggerated claims;
- portfolio feels obviously AI-generated;
- project claims unsupported by code/demo.

For each blocker include:
- issue;
- evidence;
- affected reviewer(s);
- required fix;
- priority.

## High-Impact Fixes

List fixes that would most improve perception.

Prioritize:
- making the site feel authentic;
- improving project credibility;
- reducing generic AI portfolio feel;
- making the strongest projects more prominent;
- removing or hiding weak projects;
- improving mobile and visual hierarchy.

## Nice-to-Have Polish

Only include lower priority improvements.

## Things to Remove or Hide

Identify projects, sections, claims or visual elements that hurt credibility.

Use this rule:

Working and useful → Featured.
Partially working but interesting → Labs / En progreso.
Broken, fake or placeholder → Hide.

## Things to Keep

Identify the strongest current elements that should not be redesigned unnecessarily.

## Portfolio vs CV Alignment

Explain:
- where the portfolio supports the CV;
- where the CV is stronger than the portfolio;
- where the portfolio creates doubt;
- which CV claims need better portfolio evidence.

## Geolabs Requirement Coverage

Create a table:

| Requirement | Portfolio Evidence | CV Evidence | Strength | Fix Needed |
|---|---|---|---|---|
| PHP |  |  | strong/medium/weak/missing |  |
| Responsive UI |  |  | strong/medium/weak/missing |  |
| MySQL/PostgreSQL |  |  | strong/medium/weak/missing |  |
| REST APIs/cURL |  |  | strong/medium/weak/missing |  |
| Linux/cron/processes |  |  | strong/medium/weak/missing |  |
| AI tools/agents |  |  | strong/medium/weak/missing |  |
| Maps/GIS |  |  | strong/medium/weak/missing |  |
| Git/docs/clean code |  |  | strong/medium/weak/missing |  |
| MCP |  |  | strong/medium/weak/missing |  |

Do not recommend claiming MCP unless it exists.

## Recommended Fix Branches

Propose fixes grouped into branches.

Use this structure:

### Branch 1: fix/portfolio-blockers

Purpose:
Fix only credibility blockers.

Include:
- broken links;
- dead demos;
- missing CV/contact;
- console errors;
- mobile overflow;
- fake buttons;
- anything that prevents sending.

### Branch 2: content/authenticity-and-case-studies

Purpose:
Make the portfolio sound human, honest and specific.

Include:
- reduce AI-sounding copy;
- remove buzzwords;
- add concrete project facts;
- explain “what I did”;
- label unfinished projects as labs;
- hide unsupported claims;
- make Geolabs fit subtle rather than obvious.

### Branch 3: polish/ui-ux-premium-pass

Purpose:
Make the site look less generic and more premium.

Include:
- spacing;
- typography;
- visual hierarchy;
- animations;
- project card structure;
- screenshot treatment;
- mobile polish.

### Optional Branch 4: feature/flagship-project

Only recommend this if the current portfolio lacks a strong working project.

Purpose:
Add or complete one strong flagship project, such as a map/data explorer, before sending.

## Recommended Order of Work

Give a clear step-by-step plan:

1. Freeze baseline.
2. Fix blockers.
3. Improve content authenticity.
4. Polish UI/UX.
5. Final review.
6. Deploy final.
7. Send.

## Top 10 Fixes

Rank the ten most important fixes across all reviewers.

For each include:
- task;
- why it matters;
- which branch it belongs to;
- expected impact;
- estimated difficulty: low / medium / high.

## Final Send Recommendation

Choose one:

- SEND AFTER BLOCKERS
- SEND AFTER BLOCKERS + CONTENT PASS
- SEND AFTER FULL POLISH
- DO NOT SEND UNTIL FLAGSHIP PROJECT WORKS

Explain clearly.

## Tone

Be direct and practical.

Do not be vague.

Do not say “improve design” without explaining exactly what to improve.

Do not recommend building many new side projects unless absolutely necessary.

A smaller honest portfolio is better than a large fake-looking one.