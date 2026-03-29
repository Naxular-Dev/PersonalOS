---
name: payment-monitor
description: Track BNPL payment schedules and upcoming bills. Sends reminders 3 days before payments are due. Use when managing Klarna, Clearpay, or any instalment payments.
---

# Payment Monitor

## When to Use
- Checking upcoming payments
- Adding a new BNPL/instalment plan
- User asks "what payments are coming up?"
- Morning briefing needs payment data

## Data File

`data/payments/active.md` — all active payment schedules.

Format:

```markdown
## [Item Name] — [Provider]
- **Total:** £[amount]
- **Purchased:** [DD MMM YYYY]
- **Schedule:** [e.g., 3 x £33.33 / Pay in 30]
- **Buyer:** [Dan/Zhen]
- [ ] Payment 1: £33.33 — due [DD MMM YYYY]
- [ ] Payment 2: £33.33 — due [DD MMM YYYY]
- [ ] Payment 3: £33.33 — due [DD MMM YYYY]
```

## Payment Reminders

- **3 days before** a payment is due: send a reminder to the buyer
- **On the day**: send a final reminder if not yet marked paid
- **Overdue**: flag prominently in morning briefing

Reminder format (Telegram):
```
Heads up — Klarna payment of £33.33 for [Item] is due on [Day, DD MMM]. Make sure there's enough in the account.
```

## Marking Payments Complete

When user confirms payment is made, update the checkbox:
```markdown
- [x] Payment 1: £33.33 — due 15 Apr 2026 ✓ paid
```

When all payments are complete, move the entire block to `data/payments/archive.md`.

## Querying

"What payments are coming up?" — list all unchecked payments in date order.
"How much do we owe on Klarna?" — sum all unchecked Klarna payments.
"What's left on the [item]?" — show remaining payments for that item.
