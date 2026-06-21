# Kira Malaysia 2.0 - Personal Finance Decision Engine

Kira Malaysia 2.0 is a Next.js product prototype that moves KiraMY from a calculator collection into a financial decision assistant for Malaysian users.

It helps users:

- evaluate housing and loan affordability;
- compare Malaysia bank loan options;
- simulate interest, income, and tenure changes;
- understand risk level and debt service ratio;
- receive recommendation text and next actions instead of only raw numbers.

## Architecture

```text
app/                  Next.js App Router pages and global CSS
components/           Reusable product UI modules
lib/                  Pure financial calculation engine
services/             Bank data and recommendation logic
tests/                Node.js built-in test runner tests
```

## Run locally

```powershell
npm install
npm run dev
```

## Test calculation engine

```powershell
npm test
```

## Disclaimer

This app provides educational estimates only. It is not financial, legal, lending, tax, or investment advice. Bank rates are sample scenario inputs, not live offers.
