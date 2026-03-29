---
name: renewal-monitor
description: Track annual renewals and subscriptions — car insurance, home insurance, MOT, broadband, etc. Sends alerts 6 weeks before renewal dates. Use when managing or checking renewal schedules.
---

# Renewal Monitor

## When to Use
- Adding or updating a renewal date
- User asks "when is the car insurance due?"
- 6 weeks before any renewal (proactive alert)
- Morning briefing needs renewal data

## Data File

`data/renewals/renewals.md` — all tracked renewals.

Format:

```markdown
## Car Insurance — [Provider]
- **Account holder:** [Dan/Zhen]
- **Policy number:** [if known]
- **Renewal date:** [DD MMM YYYY]
- **Last year's cost:** £[amount]
- **Auto-renew:** [Yes/No]
- **Notes:** [e.g., "shop around from 6 weeks out"]

## MOT — [Vehicle]
- **Registration:** [reg]
- **Due date:** [DD MMM YYYY]
- **Garage:** [if known]
- **Notes:**

## Broadband — [Provider]
- **Account holder:** [Dan/Zhen]
- **Contract end:** [DD MMM YYYY]
- **Monthly cost:** £[amount]
- **Notes:** [e.g., "minimum term ends, can negotiate"]
```

## Alert Schedule

| Timing | Action |
|--------|--------|
| 6 weeks before | First alert: "Your [service] renews on [date]. Want me to research alternatives?" |
| 4 weeks before | Follow-up if no action taken |
| 2 weeks before | "Just 2 weeks until [service] renews. Current cost: £X. Auto-renew is [on/off]." |
| 1 week before | Final reminder |

Send alerts to the **account holder** listed on the renewal.

## Adding Renewals

When user tells you about a renewal:
1. Add to `data/renewals/renewals.md`
2. Also check `FAMILY.md` subscriptions table and keep in sync
3. Confirm: "Logged. I'll remind you 6 weeks before [date]."

## Research (Autonomous)

When 6-week alert fires, offer to research:
- Current best deals for the same service
- Comparison sites to check
- Whether the current deal has a loyalty discount

Research is autonomous. Booking or switching is **gated**.
