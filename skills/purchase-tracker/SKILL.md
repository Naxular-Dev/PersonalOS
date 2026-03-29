---
name: purchase-tracker
description: Log purchases, track returns windows, warranties, and BNPL payment schedules. Use when a user says they bought something, needs to return something, or asks about recent purchases.
---

# Purchase Tracker

## When to Use
- User says "I/we just bought...", "ordered...", "picked up..."
- User asks "can I still return the...?", "when does the warranty expire?"
- User asks "what have we spent this month?"

## Logging a Purchase

When a user reports a purchase, capture:

```markdown
### [Item Name]
- **Date:** [DD MMM YYYY, Day]
- **Store:** [retailer]
- **Cost:** £[amount]
- **Payment:** [cash/card/Klarna/Clearpay/etc]
- **Returns window:** [date — calculate from store policy if known]
- **Warranty:** [duration if mentioned]
- **Receipt:** [email confirmation / physical / none]
- **Buyer:** [Dan/Zhen]
- [ ] Return window open
```

Save to `data/purchases/YYYY-MM.md`, creating the file if needed.

## Returns Window Tracking

Common retailer return policies (use as defaults unless told otherwise):
- Amazon: 30 days
- John Lewis: 35 days
- Currys: 30 days
- IKEA: 365 days
- Argos: 30 days
- Next: 28 days
- M&S: 35 days

When a returns window is within 3 days of closing, alert the buyer.
When expired, update the checkbox to `[x]` and note "Return window closed".

## BNPL Tracking

If payment method is Klarna, Clearpay, or any BNPL:
1. Log the purchase as normal
2. Also add to `data/payments/active.md` with the payment schedule
3. Ensure payment-monitor skill can pick it up

## Querying Purchases

When asked "what have we spent this month?":
1. Read current month's purchase file
2. Sum totals, group by category if possible
3. Present a clean summary with total

When asked about a specific purchase:
1. Search recent month files
2. Return the full record including return/warranty status
