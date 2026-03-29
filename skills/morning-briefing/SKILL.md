---
name: morning-briefing
description: Compile and send a daily morning briefing to both Dan and Zhen via Telegram. Covers payments due, renewals approaching, open tasks, returns windows, and calendar highlights.
---

# Morning Briefing

## When to Use
- Daily at 7:00 AM (automated via cron)
- User says "briefing", "what's on today?", "morning update"

## Briefing Structure

```
Good morning. Here's your daily briefing for [Day, DD MMM YYYY].

PAYMENTS DUE
- [Item] — £[amount] due [date] (via [provider])
- (or: No payments due this week)

RENEWALS APPROACHING
- [Service] renews [date] — [X weeks away]
- (or: Nothing coming up)

RETURNS CLOSING
- [Item] from [store] — return by [date] ([X days left])
- (or: All clear)

TASKS
- [Any open tasks or follow-ups]
- (or: Nothing pending)

Have a good day.
```

## Data Sources

Pull from these files:
1. `data/payments/active.md` — unchecked payments in the next 7 days
2. `data/renewals/renewals.md` — renewals in the next 6 weeks
3. `data/purchases/[current-month].md` — returns windows closing in next 5 days

## Rules

- Keep it scannable — no paragraphs, just bullet points
- Only include sections that have items (skip empty sections)
- Lead with the most urgent item
- Send to BOTH Dan and Zhen
- If nothing to report: "Good morning. All clear today — nothing due or expiring this week."
- Never include financial advice or commentary, just facts
