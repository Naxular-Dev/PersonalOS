# PersonalOS Build Log

## Last Session: Sunday 29th March 2026

### What We Built
PersonalOS — a family life management AI assistant running on Cloudflare, accessible via Telegram for Dan and Zhen.

### Architecture
- **Runtime:** OpenClaw Gateway inside Cloudflare Sandbox (Containers)
- **Entrypoint Worker:** `moltbot-sandbox` on Cloudflare Workers
- **Persistence:** R2 bucket (`moltbot-data`) mounted as filesystem via Sandbox SDK
- **Auth:** Cloudflare Access (OTP, Dan's personal email only) protects `/_admin/`
- **Channel:** Telegram bot (DM policy: open)
- **AI Provider:** Anthropic (Claude) via direct API key
- **Source:** https://github.com/Naxular-Dev/PersonalOS (forked from cloudflare/moltworker)

### URLs
- **Worker:** https://moltbot-sandbox.daniel-r-alexander81.workers.dev
- **Admin UI:** https://moltbot-sandbox.daniel-r-alexander81.workers.dev/_admin/
- **Control UI:** Worker URL + `?token=GATEWAY_TOKEN`
- **Cloudflare Dashboard:** Personal account (daniel.r.alexander81@gmail.com)

### Secrets Configured (via `wrangler secret put`)
- `ANTHROPIC_API_KEY` — Anthropic Claude key
- `MOLTBOT_GATEWAY_TOKEN` — hex token for Control UI access (saved locally)
- `TELEGRAM_BOT_TOKEN` — from @BotFather
- `CF_ACCESS_TEAM_DOMAIN` — dalexander.cloudflareaccess.com
- `CF_ACCESS_AUD` — Access application audience tag
- `CLOUDFLARE_ACCOUNT_ID` — personal CF account ID
- `R2_ACCESS_KEY_ID` — R2 API token (Object Read & Write, scoped to moltbot-data)
- `R2_SECRET_ACCESS_KEY` — R2 secret key
- `TELEGRAM_DM_POLICY` — set to "open" (bypasses pairing)
- `DEBUG_ROUTES` — set to "true" (enables /debug/* endpoints)

### Workspace Files Deployed
All files go to `/home/openclaw/.openclaw/workspace/` inside the container.

| File | Purpose |
|------|---------|
| `AGENTS.md` | Core agent instructions — two users, action gating, notification routing, file structure |
| `SOUL.md` | Personality — warm, British, concise, different styles for Dan vs Zhen |
| `FAMILY.md` | Template for family data — vehicles, renewals, schools, subscriptions (NEEDS FILLING IN) |

### Skills Deployed
Copied to `/home/openclaw/.openclaw/workspace/skills/` AND `/home/openclaw/clawd/skills/`.

| Skill | What it does |
|-------|-------------|
| `purchase-tracker` | Log purchases, returns windows (default retailer policies), warranties, BNPL handoff |
| `payment-monitor` | BNPL schedules, 3-day advance reminders, archive when complete |
| `renewal-monitor` | 6-week alert cycle for annual renewals, autonomous research, gated switching |
| `morning-briefing` | Daily digest pulling payments due, renewals approaching, returns closing |
| `cloudflare-browser` | Bundled — headless Chrome via Cloudflare Browser Rendering (not yet configured) |

### Key Gotchas Discovered
1. **Workspace path:** OpenClaw reads from `/home/openclaw/.openclaw/workspace/`, NOT `/home/openclaw/clawd/`. The Dockerfile must COPY to the correct path.
2. **Container provisioning:** Takes 2-3 mins after each deploy. Don't panic if it 503s immediately.
3. **Secret naming:** Must be exact. `CLOUDFLARE_ACCOUNT_ID` not `CF_ACCOUNT_ID`. Check admin UI warnings.
4. **Docker required:** Wrangler needs Docker Desktop running locally to build container images.
5. **Image push:** "Image already exists remotely, skipping push" is normal if layers haven't changed. Check the image tag in deploy diff to confirm new image.
6. **R2 backup:** Click "Backup Now" in admin UI after confirming config is working. No backup = data lost on container restart.
7. **Wrangler version:** Running 4.60.0, latest is 4.78.0. May want to update eventually.

### What Needs Doing Next

#### Priority 1 — Make It Useful
- [ ] Fill in FAMILY.md with real family data (vehicles, renewals, schools, subscriptions, BNPL)
- [ ] Test purchase logging on Telegram: "I just bought X from Y for £Z"
- [ ] Test payment tracking: "I bought a sofa from DFS on Klarna, 3 payments of £200"
- [ ] Click "Backup Now" in admin UI once config is confirmed working
- [ ] Add Zhen's Telegram access (she messages the bot, you approve in admin)

#### Priority 2 — Enhance
- [ ] Install community skills: EvoClaw (learning/reflection), weather (morning briefing), summarize
- [ ] Set up morning briefing cron (7am daily) — check Automation section in Control UI
- [ ] Enable weather skill for morning briefing data
- [ ] Set `TELEGRAM_DM_POLICY` back to "pairing" once both devices are approved (security)
- [ ] Set `DEBUG_ROUTES` to "false" once stable (security)

#### Priority 3 — Explore
- [ ] Browse https://clawskills.sh for family-relevant skills (Shopping, Calendar, Smart Home, Health)
- [ ] Set up AI Gateway for cost tracking and analytics
- [ ] Configure Browser Rendering (CDP) for holiday research skill
- [ ] Build holiday research skill (web search, comparison, term-date aware)
- [ ] Build email triage skill (requires Gmail OAuth investigation)
- [ ] Consider calendar skill for write access (book appointments etc.)

### Spec Improvements Agreed (Not Yet Implemented)
1. **Notification routing** — who gets pinged (buyer, account holder, or both). Partially in AGENTS.md, needs real-world tuning.
2. **Multi-user session handling** — shared state, isolated sessions. Default OpenClaw behaviour for now.
3. **Budget tracker** — referenced in data/budget/ but no skill. Manual file for Phase 1.
4. **Holiday research skill** — deferred to Phase 2 (needs web search tooling + Browser Rendering)
5. **Email triage skill** — deferred (Gmail OAuth is the hard part)
6. **Calendar write skill** — deferred (needs Google Calendar API)

### Cost Estimate
- Cloudflare Sandbox: ~$10-11/mo with sleep-after (or ~$34.50 always-on)
- Anthropic Claude API: ~£20-40/mo for two users
- R2 storage: negligible (pennies)
- **Total: ~£35-55/mo** (matches original spec estimate)

### Useful Commands
```bash
# Deploy
cd ~/Projects/personalos && npm run deploy

# Check secrets
npx wrangler secret list

# Live logs
npx wrangler tail

# Add a secret
npx wrangler secret put SECRET_NAME

# Check container status
curl https://moltbot-sandbox.daniel-r-alexander81.workers.dev/debug/processes
```

### Reference Links
- Moltworker blog post: https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/
- OpenClaw docs: https://docs.openclaw.ai
- OpenClaw skills: https://docs.openclaw.ai/skills
- Awesome skills list: https://github.com/VoltAgent/awesome-openclaw-skills (5,200+ curated)
- ClawHub registry: https://clawskills.sh
- EvoClaw (learning/reflection): https://github.com/slhleosun/EvoClaw
- Original spec: ~/Desktop/personalos-spec.docx
