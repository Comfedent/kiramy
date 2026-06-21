# Kira - Web Portfolio and Product Collection

This repository contains the personal web portfolio and product collection of **You Ruheng**. The site focuses on practical web products for Malaysian local contexts: financial decision tools, local-first writing utilities, first-year planning, and a small-business validation concept.

Live site: [kira-malaysia.com](https://www.kira-malaysia.com/)

Evidence page: [Evidence & Proof](https://www.kira-malaysia.com/evidence.html)

## Project Overview

Kira is a static web portfolio built around product and engineering evidence, not only visual presentation. Each project is framed with a clear problem, current implementation, known limits, and next validation step.

The work is intentionally lightweight: semantic HTML, responsive CSS, Vanilla JavaScript, local-first storage where appropriate, and small testable modules for product logic.

## Product Portfolio

### KiraMY

Malaysian financial decision calculators for early-stage personal finance questions.

- **Problem:** Students, young workers, and early decision-stage users often need a quick way to understand tax, loans, EPF, PTPTN, property costs, car loans, and rent-vs-buy scenarios before speaking to official platforms or professionals.
- **Current status:** Live educational tool suite.
- **What is live:** Seven calculators, privacy-first browser-side calculations, next-step modules, official source references, rule metadata for migrated calculators, and test coverage for core examples.
- **What is not proven yet:** Repeat usage, user trust at scale, commercial conversion, partner demand, and every edge-case rule scenario.
- **Next improvement:** Expand rule versioning, add more calculator fixtures, improve result export/print summaries, and introduce a privacy-friendly feedback loop.

Links: [Case study](https://www.kira-malaysia.com/case-studies/kiramy.html) | [Income Tax calculator](https://www.kira-malaysia.com/income-tax.html)

### Shiye Notes

A local-first browser notes app designed for low-friction personal writing.

- **Problem:** Many simple note-taking needs do not require accounts, cloud sync, or a heavy editor, but users still need clear data portability and recovery expectations.
- **Current status:** Live local-first tool.
- **What is live:** Note creation, editing, search, pinning, deletion, local autosave, malformed LocalStorage recovery, JSON export/import, and backup reminders.
- **What is not proven yet:** Long-term retention, whether users back up regularly, cross-device demand, and trust in browser-only storage.
- **Next improvement:** Improve import/export UX, test backup reminders with users, and explore optional client-side encryption.

Links: [Case study](https://www.kira-malaysia.com/case-studies/shiye-notes.html) | [Open app](https://www.kira-malaysia.com/projects/shiye-notes/)

### KiraStart MY

A first-year financial planner for Malaysian students, interns, and fresh graduates.

- **Problem:** Early-career users often need a first version of a monthly plan before they understand every financial rule or cost category.
- **Current status:** Live prototype.
- **What is live:** Guided planning flow, simplified take-home pay estimate, living-cost inputs, recommendations, 36-month milestone timeline, local save, JSON import/export, copy, and print summary.
- **What is not proven yet:** Recommendation accuracy for different life situations, input quality, scenario realism, and whether users act on the plan.
- **Next improvement:** Add scenario comparison, clearer official-rule notes, and more user testing around decision usefulness.

Links: [Case study](https://www.kira-malaysia.com/case-studies/kirastart-my.html) | [Open planner](https://www.kira-malaysia.com/projects/kirastart-my/)

### Bukit Pala

A Balik Pulau nutmeg gift-set concept framed as a low-risk business validation case.

- **Problem:** Local products can have strong story value, but a gift-set concept still needs proof of demand, supply reliability, cost structure, shelf-life, and fulfilment feasibility.
- **Current status:** Concept validation.
- **What is live:** Concept landing page, case study, business assumptions, validation plan, unit economics categories, operations checklist, and go/no-go criteria.
- **What is not proven yet:** Real buyer demand, supplier terms, wholesale pricing, shelf-life, packaging time, loss rate, and fulfilment constraints.
- **Next improvement:** Interview potential buyers, confirm 1-2 suppliers, run a no-payment interest form, and only then consider a small paid pilot.

Links: [Case study](https://www.kira-malaysia.com/case-studies/balik-pulau-nutmeg.html) | [View concept](https://www.kira-malaysia.com/projects/balik-pulau-nutmeg/)

## Technical Architecture

- **Static site:** No backend is required for the current portfolio and tools.
- **Semantic HTML:** Pages are structured with readable sections, headings, labels, and accessible link text.
- **Responsive CSS:** Layouts are designed for desktop and mobile without a large UI framework.
- **Vanilla JavaScript:** Interactions and calculators are implemented with plain JS modules.
- **LocalStorage where used:** Shiye Notes and KiraStart MY store user data in the current browser, with JSON export/import for portability.
- **Rules and calculator modules:** Financial rules and pure calculation logic are being separated from DOM rendering for easier testing and maintenance.
- **Node.js built-in test runner:** Tests use `node --test` without adding a separate test framework.
- **Vercel deployment:** The site is deployed as a static project.

## Product Trade-offs

The project uses lightweight web technology because it is:

- **Fast:** Pages load quickly and tools can run without server round-trips.
- **Transparent:** Calculation assumptions, rule versions, source links, and limitations can be shown directly in the UI.
- **Simple to deploy:** Static hosting keeps infrastructure and maintenance small.
- **Privacy-first:** Sensitive inputs can stay in the browser instead of being sent to a backend.

The same choices also create limits:

- **No cross-device sync:** LocalStorage data stays in the current browser unless the user exports it.
- **Limited analytics:** Privacy-first pages provide less behavioral data for product decisions.
- **Limited commercial conversion:** Without accounts, lead capture, or backend workflows, business loops remain early-stage.
- **Rules require maintenance:** Financial calculators need updates when tax, EPF, PTPTN, stamp duty, or loan assumptions change.

These are current MVP trade-offs, not permanent architecture decisions.

## Testing

Tests currently cover local-first storage behavior, import/export handling, malformed LocalStorage recovery, plan-store behavior, and selected calculator rule examples.

Run all tests:

```powershell
node --test
```

Run individual test files:

```powershell
node --test tests/note-store.test.js
node --test tests/kirastart-plan-store.test.js
node --test tests/calculator-rules.test.js
```

Current calculator test coverage includes examples for:

- Income tax
- Home loan amortisation
- EPF projection
- Car loan
- Malformed input handling

## Run Locally

No build step or package installation is required. Serve the repository root with any static server:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Repository Structure

```text
index.html                         Portfolio home
evidence.html                      Evidence / proof page
case-studies/                      Product case studies
projects/shiye-notes/              Local-first notes app
projects/kirastart-my/             First-year financial planner
projects/balik-pulau-nutmeg/       Business validation concept
rules/                             Calculator rule metadata and assumptions
calculators/                       Pure calculator logic modules
tests/                             Node.js built-in test files
zh/                                Chinese version of key pages
sitemap.xml                        English sitemap
sitemap-zh.xml                     Chinese sitemap
```

## Roadmap

### Engineering reliability

- Complete calculator logic migration from DOM scripts into pure modules.
- Expand rule versioning and official source metadata.
- Add more test fixtures for edge cases and yearly rule changes.
- Keep known limitations visible on calculator pages.

### Product validation

- Add lightweight feedback forms where appropriate.
- Test whether users understand and trust calculator assumptions.
- Validate LocalStorage backup behavior for Shiye Notes and KiraStart MY.
- Run buyer and supplier research before treating Bukit Pala as a business.

### User experience

- Improve result export and print summaries.
- Add comparison flows for loans, rent-vs-buy, and first-year planning scenarios.
- Make backup reminders helpful without being intrusive.
- Continue mobile and accessibility QA.

### Commercial experiments

- Explore SEO content loops around tax, PTPTN, housing, EPF, and first-job planning.
- Test optional update subscriptions without collecting sensitive calculator inputs.
- For Bukit Pala, start with no-payment interest validation before any inventory commitment.
- Only consider backend workflows or partnerships after demand is measured.

## Important Disclaimer

KiraMY financial calculators provide **educational estimates only**. They are not tax, legal, financial, lending, or investment advice. Users should verify results with official Malaysian agencies, banks, lawyers, or qualified professionals before making decisions.
