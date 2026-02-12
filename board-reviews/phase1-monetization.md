## HEAD OF MONETIZATION: Haven Review

### Executive Summary (3 sentences max)
Haven has a surprisingly complete monetization scaffold for a prototype -- dual-track battle pass, piggy bank, daily deals, starter pack, and simulated IAP are all present and structurally sound. The biggest strength is the natural gem sink layering: power-ups, creature eggs, island node skips, and daily deals create multiple competing demands on a single hard currency. The biggest risk is a grossly over-generous free gem economy that will crater payer conversion -- players can self-fund almost indefinitely through merges, chain reactions, daily login, events, and worker income without ever opening the shop.

### Dimension Scores
| Dimension | Score | Evidence |
|-----------|-------|----------|
| Economy balance (sinks vs sources) | 2/5 | Free sources vastly outpace sinks. See detailed findings below. |
| IAP/purchase integration naturalness | 3/5 | Starter pack (shop.js:64-73), piggy bank (shop.js:76,220-234), and daily deals (shop.js:80-143) are well-placed but IAPs use `confirm()` dialogs (shop.js:188) -- no native purchase flow friction reduction. |
| Scarcity & urgency mechanics | 3/5 | Daily deals with timer (shop.js:308), battle pass season countdown (pass.js:186-192), weekly events with 7-day expiry (events.js:6-8), and login streak reset (daily.js:117-120) all create time pressure. But no limited-quantity offers, no VIP exclusivity, no flash sales beyond daily deals. |
| Revenue ceiling potential | 2/5 | Gem bundles cap at $19.99 (shop.js:61), battle pass is $7.99 (pass.js:163), starter pack $1.99 (shop.js:69), piggy bank $2.99 (shop.js:225). No subscription, no VIP tiers, no seasonal cosmetics, no whale-tier bundles ($49.99-$99.99). Maximum single-session spend is roughly $31. |
| Ad monetization readiness | 1/5 | Single rewarded ad placement (shop.js:236-247) buried inside the shop tab. No interstitial ad hooks, no ad-to-continue on energy depletion, no ad-for-double-reward after merges, no ad frequency cap system. Simulated with `setTimeout` -- zero ad SDK integration. |

### Critical Findings

1. **[BLOCKER] Free gem income is catastrophically generous -- will destroy payer conversion**
   - **Sources identified (per session):**
     - Merge gem rewards starting at tier 3 with exponential scaling: `Math.pow(1.8, nextTier - 3)` (board.js:890) -- tier 7 = 18 gems BASE per merge
     - Random 2x/3x multiplier on merge rewards with generous 5%/20% rates PLUS pity timer at 12/24 merges (board.js:893-896) -- guarantees bonus every 12 merges
     - Surge mode end bonus: `surgeMergeCount * 1.5 + 2` gems (board.js:627) -- easy 6-8 gems per surge
     - Surge active: +1 gem per merge (board.js:783)
     - Chain reaction bonus: `depth * depth * 2` gems PLUS energy refund (board.js:949-950) -- a depth-3 chain = 18 gems + 3 energy
     - Lucky auto-merge: `2 + connected.length` gems + 1 energy (board.js:1205-1207)
     - Max-tier completion: +10 gems + 1 star (board.js:817)
     - Item discovery reward: 1-3 gems per new chain+tier (board.js:1382)
     - Piggy bank passive: 1-3 gems per merge (shop.js:156) -- accumulates without player effort
     - Daily login calendar: 25 + 15 + 50 + 25 + 100 + 50 + 250 = **515 gems per 7-day cycle** (daily.js:7-13), scaling with streak multiplier up to 2x (daily.js:152)
     - Daily quests: 3 quests x 10-25 gems each = ~45 gems/day (daily.js:18-30)
     - Weekly event challenges: 50 + 150 + 400 = **600 gems per event** (events.js:20-22, same pattern across all 8 events)
     - Battle pass free track: tiers 1-10 alone yield 5+7+9+11+13+15+17+19+21+25 = **142 gems** (pass.js:23)
     - Island node unlock rewards: 10-50 gems per node (island.js:12-79)
     - Worker offline income: up to 30 gems/hr per legendary creature, 8hr cap = **240 gems overnight** (island.js:111-112)
     - Creature passive gem bonus applied to ALL positive gem gains: `n * (1 + bonuses.gem_bonus / 100)` (game.js:173)
   - **Sinks identified:**
     - Power-up gem purchases: 10-50 gems each (powerups.js:12-53) -- but earnable free every 20-80 actions (powerups.js:12-53)
     - Shop items: energy 20-35 gems, eggs 50-900 gems (shop.js:5-55)
     - Island node skip: 50 gems (island.js:209) -- rarely needed since stars accumulate naturally
   - **Impact:** A moderately active player will accumulate 200-500+ gems/day through free sources. The most expensive single gem-purchasable item (Celestial Egg) costs 900 gems -- about 2-3 days of free play. With no meaningful gem drain, players have zero incentive to purchase gem bundles. Expected payer conversion: <1%, far below the 2-5% benchmark.
   - **Recommendation:** Cut free gem income by 60-70%. Specifically: (a) raise merge gem reward threshold from tier 3 to tier 4, (b) remove pity timer or set to 30+ merges, (c) halve daily login gems, (d) cap worker income at 50 gems/8hr regardless of rarity, (e) remove gem rewards from chain reactions (keep energy only), (f) add gem sinks -- board expansion costs, cosmetic tiles, creature upgrades. Effort: 2-3 days of rebalancing + playtesting.

2. **[BLOCKER] Power-ups are earnable for free at trivially low thresholds -- eliminates a major sink**
   - Lightning earned every 20 spawns (powerups.js:44-45) -- that is roughly 20 energy or 40 minutes of play
   - Shuffle earned every 25 merges (powerups.js:28-29)
   - Sort & Sweep earned every 50 spawns (powerups.js:19-20)
   - Mass Match earned every 30 merges (powerups.js:12-13)
   - Only Golden Spawn has a meaningful threshold at 80 merges (powerups.js:52-53)
   - **Impact:** Players rarely need to spend gems on power-ups. The Power Pack shop bundle (120 gems, shop.js:35) competes with free earning that takes ~2 hours of normal play. Power-ups should be one of the top 3 gem sinks.
   - **Recommendation:** Triple all earnThreshold values. Consider removing free earning entirely for premium power-ups (Upgrade Wand, Golden Spawn) -- make those purchase-only. Effort: 30 minutes.

3. **[RISK] No ad monetization infrastructure -- leaving $14.83 ARPU benchmark entirely on the table**
   - The only ad placement is a voluntary "Watch Ad" button in the shop (shop.js:236-247) that awards 5-10 gems + 2 energy
   - No interstitial placement after energy depletion (game.js:144-147 emits `energyEmpty` but nothing hooks an ad)
   - No "watch ad to double reward" after high-tier merges (board.js:888-918 shows rewards but no ad prompt)
   - No "watch ad to continue" when board is full (board.js:1127-1154)
   - No ad-to-skip-timer on energy regeneration (game.js:107-141)
   - No rewarded ad for extra daily quest (daily.js has 3 quests, no "watch ad for 4th quest" option)
   - **Impact:** For casual merge games, ad revenue typically represents 40-60% of total revenue. Merge Dragons benchmark ad ARPU is $14.83. Haven is currently generating $0 from ads. This is the single largest revenue gap.
   - **Recommendation:** Add 5 ad placements: (1) ad-to-continue on energy empty, (2) ad-to-double after tier 4+ merge rewards, (3) ad-to-unlock 4th daily quest, (4) interstitial every 15 merges (skippable for premium pass holders), (5) ad-to-speed-up energy regen timer. Effort: 3-5 days with ad SDK integration.

4. **[RISK] Revenue ceiling is capped low -- no whale accommodation**
   - Gem bundles: $0.99 / $4.99 / $9.99 / $19.99 (shop.js:58-61)
   - Battle pass: $7.99 one-time (pass.js:163)
   - Starter pack: $1.99 one-time (shop.js:69)
   - Piggy bank: $2.99 repeating but slow accumulation (shop.js:225)
   - Total maximum first-month spend: ~$32 + repeated piggy banks (~$12 more) = ~$44
   - No subscription product (monthly gem pass / VIP)
   - No seasonal cosmetic shop (board themes, creature skins)
   - No exclusive bundles triggered by progression milestones
   - **Impact:** 80% of revenue comes from top 20% of payers. Haven has no product for a player willing to spend $50-100/month. ARPPU will be well below the $20+ strong benchmark. The game leaves whale money entirely uncaptured.
   - **Recommendation:** Add (a) "Gem Pass" monthly subscription: $4.99/mo for 50 gems/day + bonus energy regen, (b) milestone bundles at island region completions ($9.99-$24.99), (c) seasonal creature skins as cosmetic IAP ($2.99-$4.99 each), (d) whale bundle at $49.99 with 8000 gems + exclusive creature. Effort: 1-2 weeks.

5. **[RISK] Battle pass premium track is undervalued relative to price -- conversion will suffer**
   - Premium costs $7.99 (pass.js:163)
   - Premium rewards are mostly gems: e.g., tier 1 premium = 20 gems (pass.js:24: `15 + 1*5`), scaling up
   - Total premium-track gems across 40 tiers: roughly 2000-2500 gems (estimated from formula at pass.js:24,27-28,33-34,38)
   - The $9.99 Gem Vault gives 1350 gems (shop.js:60) -- the pass needs to clearly exceed this value to justify $7.99 + effort
   - Premium also gives 3 rare eggs, 2 epic eggs, 2 upgrade wands, a power pack, and 2 golden spawns (pass.js:43-50) -- decent but not prominently communicated
   - No exclusive cosmetic or creature for pass completion -- the tier 40 premium reward is just 500 gems + trophy emoji (pass.js:38)
   - **Impact:** Without a marquee exclusive reward, battle pass adoption will be 5-10% instead of the 15-25% seen in top merge games. Battle pass is the most retention-correlated IAP -- underperformance here cascades.
   - **Recommendation:** Add an exclusive creature and board theme at tier 40 premium. Add a "Premium Preview" showing all locked rewards with total value calculation ("$47 value for $7.99!"). Effort: 2-3 days.

6. **[OPPORTUNITY] Piggy bank is a strong monetization mechanic -- but under-leveraged**
   - Currently accumulates 1-3 gems per merge (shop.js:156: `1 + Math.floor(Math.random() * 3)`)
   - Unlocked for $2.99 (shop.js:225)
   - But there is no visual urgency -- no "piggy is almost full!" notification, no capacity cap creating break-or-lose pressure
   - No accelerated accumulation during surge mode or events
   - **Impact:** Piggy bank has proven to be a 3-5% conversion mechanic in competitors (Merge Mansion reports piggy as their #2 IAP). Currently it's a passive background system with no emotional hook.
   - **Recommendation:** Add a capacity cap (e.g., 500 gems). Show a "piggy is 80% full!" banner when approaching cap. Add 2x piggy accumulation during weekly events. Show the piggy gem count on the main board HUD (not just in shop). Effort: 1 day.

7. **[OPPORTUNITY] Daily deals are well-designed but lack purchase moment triggers**
   - 3 rotating deals at 50% off (shop.js:81-90) with clear strikethrough pricing (shop.js:320-321) -- solid price anchoring
   - Timer shows hours remaining (shop.js:308)
   - BUT: no notification/banner when daily deals refresh, no "deal of the day" pop-up on first session open, deals are only visible if the player navigates to the shop tab
   - **Impact:** Daily deal visibility drives casual payer conversion. If players don't see the deals, the 50% discount psychology is wasted.
   - **Recommendation:** Show a "New Daily Deals!" toast on first session open each day. Add a red badge/dot on the shop tab icon when unclaimed daily deals are available. Effort: 2 hours.

8. **[OPPORTUNITY] Energy economy creates natural purchase moments -- but they're not monetized**
   - Energy cap: 100, regen: 1 per 2 minutes (game.js:8-9)
   - `energyEmpty` event is emitted (game.js:145) but no purchase prompt follows
   - `energyLow` event at 10 energy (game.js:156) -- also unmonetized
   - Clutter tax increases energy cost (board.js:1047-1048) -- creates additional drain
   - Energy shop items exist (shop.js:7-10) but require navigating to shop tab manually
   - **Impact:** Energy depletion is the #1 purchase moment in merge games. Every competitor surfaces a "Buy energy?" or "Watch ad?" modal at the moment of depletion. Haven lets the moment pass silently.
   - **Recommendation:** Hook `energyEmpty` event to show a modal with 3 options: (1) Watch ad for 5 energy (free), (2) Buy 5 energy for 20 gems (soft currency), (3) Full recharge for $0.99 (hard currency). This single change could increase revenue 20-30%. Effort: half a day.

9. **[OPPORTUNITY] Starter pack value perception is strong but timing is uncontrolled**
   - $1.99 marked down from $12.99 (shop.js:69-70) -- 85% discount framing is excellent
   - Contents: 500 gems + 30 energy + rare egg (shop.js:68)
   - One-time purchase enforced (shop.js:201)
   - BUT: visible from first session (shop.js:328) -- no gating by tutorial completion or play count
   - **Impact:** Starter packs convert best at the "aha moment" -- typically after 5-10 minutes of play when the player has experienced the core loop. Showing it immediately dilutes impact.
   - **Recommendation:** Gate starter pack visibility behind `state.stats.playCount >= 2 || state.stats.totalMerges >= 20`. Show it as a pop-up modal rather than an inline shop item. Add a 24-hour expiry timer to create urgency. Effort: 2 hours.

10. **[OPPORTUNITY] Island node skip is a hidden gem sink with no upsell path**
    - Skip costs 50 gems flat (island.js:209)
    - But node costs escalate from 2 stars to 193 stars (island.js:12-79) -- a flat 50-gem skip for a 193-star node is far too cheap
    - No tiered skip pricing based on node cost
    - No "skip bundle" (buy 5 skips at a discount)
    - **Impact:** Impatient players willing to pay to progress are being undercharged. Skip pricing should scale with node value.
    - **Recommendation:** Price skip at `max(50, node.stars * 3)` gems. Top-tier nodes would cost 579 gems to skip -- meaningful enough to drive IAP. Offer a "Skip Pack" IAP bundle of 5 skips for $4.99. Effort: 1 hour.

### Trade-off Flags
- **vs. Game Design/Retention:** Cutting free gem income (Finding #1) and raising power-up earn thresholds (Finding #2) will make the game feel less generous. The game design team will argue this hurts retention and session length. Counter-argument: current generosity is so extreme that there is zero pressure to engage with the shop -- "easy fun" is not the same as "sustainable fun." The goal is to find the scarcity sweet spot where players feel rewarded but occasionally want more.
- **vs. UX/Player Experience:** Adding ad placements (Finding #3) and energy-depletion modals (Finding #8) adds friction. The UX team will push back on interrupting flow. Counter-argument: rewarded ads are opt-in and perceived positively by 70%+ of casual players. The key is giving the player agency (3 options: ad/gems/money) rather than forcing anything.
- **vs. Narrative/Creative:** Adding cosmetic IAPs and whale bundles (Finding #4) requires creature skins and board themes that the art team needs to create. This is a production dependency, not a design disagreement.
- **vs. Retention team:** The battle pass timer urgency (pass.js:192, "days left" with urgent styling at <=7 days) and daily streak reset (daily.js:117-120) both create FOMO. If the retention team wants to be gentler on lapsed players, the streak reset could offer a "gem restore" option ($0.99 to preserve streak) -- turning a retention pain point into a revenue opportunity.

### Go/No-Go Signal
**AMBER** -- The monetization architecture is structurally present and thoughtfully designed (daily deals, piggy bank, battle pass, starter pack, tiered events), which is unusual and impressive for a prototype. However, the free economy is so generous that it actively undermines every paid offering, and the absence of ad monetization leaves the largest casual-game revenue stream completely untapped. With the economy rebalancing and ad integration described above (estimated 2-3 weeks of work), this moves to GREEN. Without those changes, expected LTV per user will be under $0.50 -- well below the $1.50-3.00 needed to sustain UA profitability in the merge game market.
