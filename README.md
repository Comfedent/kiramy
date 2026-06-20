# Kira — Web Portfolio

Portfolio and product collection by **You Ruheng**, a management student and independent web builder in Malaysia.

Live site: [kira-malaysia.com](https://www.kira-malaysia.com/)

## Projects

### KiraMY

Seven privacy-friendly Malaysian financial calculators:

- Income tax (YA 2025)
- Home loan and amortisation
- EPF retirement projection
- Property stamp duty and legal fees
- PTPTN repayment
- Car hire purchase
- Rent vs buy comparison

### Shiye Notes / 拾页

A calm, browser-based notes application with automatic saving, search, pinning, responsive navigation, and local-only storage.

## Why I built this

Many useful web tasks do not need accounts, a large framework, or a server. These projects explore how clear interfaces and small, transparent codebases can solve real local problems while keeping user data private.

## Tech stack

- Semantic HTML
- Responsive CSS
- Vanilla JavaScript
- LocalStorage
- Node.js built-in test runner
- GitHub + Vercel deployment

## Product principles

- **Useful first** — one clear job per tool
- **Private by default** — calculations and notes stay in the browser
- **Transparent** — assumptions, update dates, and source links are visible
- **Made to last** — minimal dependencies and static hosting

## Structure

```text
index.html                 Portfolio home
case-studies/              Detailed project case studies
projects/shiye-notes/      Notes application
*-loan.html, epf.html...   KiraMY calculators
sitemap.xml                Search engine sitemap
```

## Testing

The Shiye Notes state layer includes tests for creation, editing, deletion, sorting, search, serialization, and malformed-data recovery.

```powershell
node --test tests/note-store.test.js
```

## Roadmap

- Add versioned test cases for financial rules
- Expand official source citations and calculation explanations
- Add Malay and Chinese interfaces
- Add export/shareable result summaries
- Add a lightweight user feedback channel

## Important note

The financial calculators are educational estimates, not financial, tax, or legal advice. Users should verify results with the linked official agencies or a qualified professional.
