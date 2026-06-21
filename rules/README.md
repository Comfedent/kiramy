# KiraMY calculator rules

Each rule file exposes metadata alongside the constants or assumptions used by a calculator:

- `ruleVersion`
- `effectiveYear`
- `sourceName`
- `sourceUrl`
- `lastUpdated`
- `assumptions`
- `knownLimitations`

Calculator pages should also expose a user-facing way to report mismatches. The shared next-steps module links to a prefilled GitHub issue so rule errors, edge cases, and missing official-source updates can be tracked instead of disappearing into private messages.

Current migration status:

- Done: `income-tax.html`, `home-loan.html`
- Pure calculation modules added for tests: EPF and car loan
- Metadata placeholder added: stamp duty
- TODO: migrate `epf.html`, `car-loan.html`, `stamp-duty.html`, `ptptn.html`, `rent-vs-buy.html` and their Chinese mirrors so their DOM scripts consume the shared modules directly.
