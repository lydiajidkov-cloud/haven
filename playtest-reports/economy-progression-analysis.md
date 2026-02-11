# Haven -- Economy, Progression & Reward Loop Playtest Report

**Date:** 2026-02-11
**Analyst:** Economy Design Playtest (Claude Opus 4.6)
**Build:** Current prototype (pre-monetisation)
**Focus:** Gem income vs spending, progression pacing, passive systems, endgame retention

---

## Executive Summary

Haven's economy is **generous in active play but stingy at rest**. An engaged 10-minute session produces roughly 50-120 gems depending on chain reactions and surge frequency, which makes small purchases (energy, boosts) feel affordable but biome eggs (250-900 gems) remain multi-session aspirational goals -- exactly the right tension for a merge game. The worker passive income system is currently **too weak to matter** for most players and needs a rebalance. Creature passive bonuses create a satisfying power curve but only become noticeable after collecting 20+ creatures. The biggest structural risk is **endgame retention**: once a player has unlocked most island nodes and collected most creatures, there is no repeating challenge system to keep them playing.

---

## 1. Gem Income vs Spending -- 10-Minute Session Simulation

### Income Sources (Active Play)

I modelled a 10-minute session assuming an experienced player making roughly 1 merge every 6-8 seconds (active, focused play):

| Source | Rate / Trigger | Est. Gems per 10 min | Notes |
|--------|---------------|----------------------|-------|
| **Tier 4+ merge rewards** | `max(1, tier - 4)` gems per merge | 5-12 | Assumes ~5-8 high-tier merges. Tier 4 = 0 gems (formula gives 0), Tier 5 = 1, Tier 6 = 2, Tier 7 = 3. Most merges are lower-tier. |
| **Max-tier completion** | 10 gems + 1 star | 10-20 | Assumes 1-2 max-tier chain completions per session |
| **Chain reactions** | `depth * 3` gems + `min(depth, 3)` energy | 12-30 | Chain depth 1 = 3 gems, depth 2 = 6 gems, depth 3 = 9 gems. Very variable -- skilled board management triggers more chains. |
| **Surge end bonus** | `surgeMergeCount * 1` gem (if >= 3 merges during surge) | 8-15 | Surge activates at 40% meter, SURGE_PER_MERGE is 30 (so 2 merges fills it). 3-5 merges during surge before decay drops it = 3-5 gems per surge. Multiple surges per session. |
| **Surge active bonus** | +1 gem per merge while surging | 5-10 | Roughly 5-10 merges happen during active surge windows |
| **Lucky auto-merge** | `2 + connected.length` gems + 1 energy | 4-12 | Spawning adjacent to matching items. Happens ~1-3 times per session. |
| **Piggy bank accumulation** | 1-3 gems per merge (stored, not spendable) | 80-240 stored | This is behind a $2.99 paywall. Not free income. |
| **Rewarded ads** | 5-10 gems + 2 energy per ad | 5-10 | Assuming player watches 1 ad per session |

**Estimated total free gem income per 10 min: ~50-120 gems**

A realistic median for a skilled player is around **75 gems per 10-minute session**.

### Spending Sinks

| Item | Cost | Sessions to Earn (at 75 gems/session) |
|------|------|---------------------------------------|
| Energy Pack (5 energy) | 20 gems | 0.27 sessions (impulse buy) |
| Full Recharge (100 energy) | 35 gems | 0.47 sessions (impulse buy) |
| Lucky Spawn boost | 30 gems | 0.40 sessions |
| Merge Bonus (2x gems, 10 min) | 40 gems | 0.53 sessions |
| Common Egg | 50 gems | 0.67 sessions |
| Rare Egg | 150 gems | 2.0 sessions |
| Meadow/Forest Biome Egg | 250 gems | 3.3 sessions |
| Ocean Biome Egg | 350 gems | 4.7 sessions |
| Epic Egg | 400 gems | 5.3 sessions |
| Enchanted Biome Egg | 600 gems | 8.0 sessions |
| Celestial Biome Egg | 900 gems | 12.0 sessions |
| Mass Match x3 | 60 gems | 0.8 sessions |
| Power Pack (2 of each) | 120 gems | 1.6 sessions |
| Island node skip | 50 gems | 0.67 sessions |

### Verdict

**The balance feels intentionally calibrated for a F2P merge game.** Small utility purchases (energy, boosts, basic power-ups) are within reach of a single session, creating a satisfying "earn and spend" loop. The high-end biome eggs (600-900 gems) are clearly designed to be multi-session goals or IAP conversion points. This is healthy tension.

**One concern:** The Merge Bonus boost (2x gems for 10 min, costs 40 gems) is mathematically questionable. If a session produces ~75 gems and half of that comes from gem-yielding sources, the player doubles ~37 gems to ~74 extra gems for a 40-gem investment. The ROI is positive but **barely** -- and the player has to trust the math, which most casual players won't. Consider either reducing the cost to 25 gems (making it an obvious good deal) or extending the duration to 15 minutes.

---

## 2. Worker Passive Income Analysis

### The System

Workers are discovered creatures assigned to unlocked island nodes. Income rates by rarity:

| Rarity | Gems/hour | Gems per 8-hour overnight | Gems per 12-hour cap |
|--------|-----------|--------------------------|---------------------|
| Common | 3 | 24 | 36 |
| Uncommon | 8 | 64 | 96 |
| Rare | 20 | 160 | 240 |
| Legendary | 50 | 400 | 600 |

Max offline collection: 12 hours.

### How Many Worker Slots Exist?

The island has 37 total nodes. Boss nodes (7 total, one per region) show the region creature and cannot have workers. That leaves **30 assignable worker slots**. However, workers require discovered creatures, and creatures assigned as workers cannot also be companions.

### Realistic Worker Income Scenarios

**Early game (1 week in, ~5 nodes unlocked, 5-10 creatures discovered):**
- 3-4 workers assigned, mostly common/uncommon
- Overnight income: ~24-64 gems total
- Compared to a single 10-min play session (75 gems): **negligible**

**Mid game (1 month in, ~15 nodes unlocked, 30+ creatures):**
- 10-12 workers assigned, mix of commons through rares
- Overnight income: ~200-400 gems
- Compared to two 10-min sessions (150 gems): **meaningful supplement**

**Late game (3+ months, 25+ nodes, 60+ creatures):**
- 20+ workers, several rares and legendaries
- Overnight income: ~600-1200 gems
- This is **significant** -- equivalent to 8-16 play sessions of gem income

### Verdict

**Worker income is negligible in early game and only becomes meaningful in mid-to-late game.** This is a common mobile game pattern (reward long-term players with compounding passive income), but the early game rates are so low that players may not bother assigning workers at all.

**Recommendation:** Bump common worker income from 3 to 5 gems/hr and uncommon from 8 to 12 gems/hr. This makes early workers feel worth the effort of assignment (an overnight common worker producing 40-60 gems instead of 24-36 becomes psychologically noticeable -- "I came back to free gems!").

---

## 3. Passive Creature Bonuses -- Power Curve Analysis

### How Bonuses Work

Every creature has one of five passive abilities, assigned by a cycling pattern. The bonus magnitude depends on rarity:

| Rarity | Bonus per creature |
|--------|-------------------|
| Common | +0.5 |
| Uncommon | +1.5 |
| Rare | +3.0 |
| Legendary | +7.0 |

The five bonus types and their distribution weighting:

| Bonus | Weight | Effect |
|-------|--------|--------|
| gem_bonus | 40% | +X% to all gem income |
| discovery_chance | 25% | +X% creature discovery rate |
| energy_regen | 20% | -X*0.25 seconds off energy regen timer (base: 120s) |
| xp_bonus | 10% | +X% to Haven Pass XP |
| spawn_quality | 5% | X% chance to upgrade spawned item tier |

### Stacking Scenarios

**10 creatures discovered (early game, mostly common):**
- gem_bonus: ~4 creatures x 0.5 = +2% (imperceptible)
- energy_regen: ~2 creatures x 0.5 = 1 point = -0.25s off 120s timer (meaningless)
- spawn_quality: ~0-1 creature x 0.5 = 0.25-0.5% (essentially zero)

**50 creatures discovered (mid game, mix of rarities):**
- gem_bonus: ~20 creatures averaging ~1.2 each = +24% (noticeable -- earning 93 gems instead of 75)
- energy_regen: ~10 creatures averaging ~1.0 = 10 points = -2.5s (timer goes from 120s to 117.5s -- still weak)
- spawn_quality: ~2-3 creatures x ~1.5 = 3-4.5% (occasional tier upgrade, mildly satisfying)

**100 creatures discovered (late game, including rares/legendaries):**
- gem_bonus: ~40 creatures averaging ~1.5 = +60% (significant -- 120 gems per session instead of 75)
- energy_regen: ~20 creatures averaging ~1.2 = 24 points = -6s (timer goes from 120s to 114s -- noticeable but not transformative)
- spawn_quality: ~5 creatures x ~2.0 = 10% (1 in 10 spawns gets an upgrade -- feels good)

**All 184 creatures discovered (completionist endgame):**
- gem_bonus: ~74 creatures averaging ~1.5 = +111% (huge -- more than doubling gem income)
- energy_regen: ~37 creatures averaging ~1.5 = 55.5 points = -13.9s (timer goes from 120s to 106s, capped at 60s minimum)
- spawn_quality: ~9 creatures x ~2.5 = 22.5% (nearly 1 in 4 spawns upgraded -- powerful)

### Verdict

**The power curve is back-loaded -- early discoveries barely matter, but the cumulative effect becomes genuinely powerful.** The gem_bonus weighting at 40% is smart because it amplifies the most visible currency. However, **energy_regen is the weakest passive by far**: even at 100 creatures, shaving 6 seconds off a 120-second timer is barely perceptible. Players will never "feel" this bonus.

**Recommendation:** Either increase the energy_regen multiplier from 250ms per point to 500ms per point (so 100 creatures = -12s instead of -6s), or change the mechanic entirely to a percentage chance of free spawns (e.g., each energy_regen point = 0.5% chance that a spawn costs 0 energy). That creates a noticeable, exciting moment.

---

## 4. Board Companions -- Trigger Rates and Impact

### The System

Players equip 1-2 rare/legendary creatures as board companions. These trigger effects after a set number of merges:

| Effect | Rarity | Trigger | What It Does |
|--------|--------|---------|--------------|
| Auto Merge | Rare | Every 8 merges | Merges a random matching pair on the board |
| Free Spawn | Rare | Every 8 merges | Spawns a free tier 2 item |
| Energy Refund | Rare | Every 8 merges | Refunds 1 energy |
| Upgrade Item | Legendary | Every 12 merges | Upgrades a random board item +1 tier |
| Double Reward | Legendary | Every 12 merges | Next merge gives 2x gem reward |
| Surge Boost | Legendary | Every 12 merges | Adds +40 to surge meter |

### Trigger Frequency

In a 10-minute session with ~80-120 merges:
- Rare companion fires: **10-15 times** per session
- Legendary companion fires: **7-10 times** per session
- With both slots filled: **17-25 total triggers** per session

### Impact Assessment

**Rare companions:**
- **Auto Merge** -- Fires 10-15 times. Each auto-merge can cascade into chain reactions. This is the most impactful rare companion by far because it generates additional merges (which feed surge, which generate more gems). Over a session, this probably adds 10-20 extra merges and 15-30 bonus gems from chain reactions. **Feels great.**
- **Free Spawn** -- Fires 10-15 times. Spawns a tier 2 item without spending energy. That is 10-15 energy saved. At 2 min per energy regen, that is 20-30 minutes of energy regen saved. **Feels good, especially when energy is low.**
- **Energy Refund** -- Fires 10-15 times. Refunds 1 energy each time = 10-15 energy back. Similar value to Free Spawn but less visible (you get energy back versus a board item appearing). **Mechanically fine but less satisfying.**

**Legendary companions:**
- **Upgrade Item** -- Fires 7-10 times. Each time, a random item jumps up a tier. This is **visually exciting and strategically powerful** -- it accelerates merge chains and can push items past the high-tier gem reward threshold. Best legendary companion.
- **Double Reward** -- Fires 7-10 times. Doubles the gem reward of the next merge. At high tiers (5+, which yield 1-3 gems), doubling is 2-6 extra gems per trigger = 14-60 extra gems per session. **Decent but not thrilling** unless the player happens to merge a tier 7+ right after the trigger.
- **Surge Boost** -- Fires 7-10 times. Adds +40 to surge meter (activation threshold is 40). This essentially guarantees permanent surge uptime, which means +1 gem per merge and faster animations. Over a session: **5-10 extra gems + quality-of-life speed boost.** Good supporting effect.

### Verdict

**Trigger rates feel satisfying.** Every 8 merges (roughly every 50-60 seconds of active play) is frequent enough that the player regularly sees their companion "doing something." The cooldown ring UI in the companion bar gives visual anticipation. Every 12 merges for legendaries (roughly every 70-90 seconds) still feels active.

**Balance concern:** Auto Merge is significantly stronger than Energy Refund for the rare tier. Auto Merge generates value (merges, chains, gems, surge) while Energy Refund only saves a small amount of energy. Consider buffing Energy Refund to 2 energy, or adding a small gem bonus (e.g., +2 gems) on top of the refund.

**Double Reward feels underwhelming for a legendary effect.** The problem is that it doubles the *next* merge reward, but most merges yield 0 gems (only tier 4+ gives gems). So the double often fires on a merge that gives nothing, and the effect is wasted. Consider changing it to "next merge at tier 4+ gives 2x" (persists until a qualifying merge happens) to avoid the feel-bad of wasted procs.

---

## 5. Island Progression Pacing

### Roadmap Structure

7 regions, 37 total nodes. Star costs escalate:

| Region | Nodes | Star Range | Total Stars to Complete Region |
|--------|-------|------------|-------------------------------|
| The Shore | 5 | 2-10 | 10 |
| Whispering Woods | 6 | 12-27 | 27 |
| Sunlit Meadows | 6 | 30-50 | 50 |
| Stone Peaks | 6 | 54-79 | 79 |
| Crystal Depths | 5 | 84-112 | 112 |
| Cloud Realm | 5 | 118-150 | 150 |
| Ancient Ruins | 5 | 157-193 | 193 |

### How Are Stars Earned?

Stars come from max-tier chain completions (1 star each) and the Haven Pass tier 40 reward (5 stars). Completing a max-tier merge (when you merge the highest-tier item in a chain and it "completes") awards 10 gems + 1 star.

### Star Earning Rate

A max-tier merge requires building an item up through the entire chain. Assuming a merge chain has 7-8 tiers, getting from tier 0 to max requires multiple rounds of spawning, collecting, and merging. A rough estimate:

- **Casual player:** 1-2 stars per 10-minute session
- **Active player:** 2-4 stars per 10-minute session (multiple chains in parallel)
- **Power player:** 4-6 stars per 10-minute session

### Time-to-Completion Estimates

| Region | Stars Needed | Sessions (casual, 1.5 stars/session) | Sessions (active, 3 stars/session) |
|--------|-------------|--------------------------------------|-----------------------------------|
| The Shore | 10 | 7 sessions | 4 sessions |
| Whispering Woods | 27 | 18 sessions | 9 sessions |
| Sunlit Meadows | 50 | 34 sessions | 17 sessions |
| Stone Peaks | 79 | 53 sessions | 27 sessions |
| Crystal Depths | 112 | 75 sessions | 38 sessions |
| Cloud Realm | 150 | 100 sessions | 50 sessions |
| Ancient Ruins | 193 | 129 sessions (cumulative) | 65 sessions |

**At 2 sessions per day:**
- Casual: ~65 days (2.2 months) to complete everything
- Active: ~33 days (1.1 months)

**At 1 session per day:**
- Casual: ~129 days (4.3 months)
- Active: ~65 days (2.2 months)

### Node Reward Structure

Each node grants gems (10-50) upon unlock. Boss nodes grant 50 gems and reveal a story creature. The total gem payout from completing all 37 nodes:

- Non-boss nodes (30): ~25 gems avg = 750 gems
- Boss nodes (7): 50 gems each = 350 gems
- **Total: ~1,100 gems from island progression**

Plus the skip option (50 gems to bypass a node) creates a gem sink for impatient players.

### Verdict

**Pacing is well-designed for the first 3 regions** (The Shore through Sunlit Meadows). These feel like clear, achievable milestones with visible progress. The boss node story reveals at each region end create emotional payoff.

**The back half (Stone Peaks onwards) risks feeling like a grind.** The star cost jumps dramatically -- Stone Peaks requires 79 stars cumulatively versus Sunlit Meadows at 50. The gap between nodes widens from 2-4 stars to 5-9 stars, meaning players go multiple sessions without unlocking anything new. The fog-of-war system (only showing 4 nodes ahead) helps psychologically, but the actual pace slows.

**Recommendation:** Introduce mid-region milestone rewards. Currently, only boss nodes (end of region) have story/creature reveals. Adding a mini-event or bonus at the midpoint of each region (e.g., a short narrative beat, a free egg, or a temporary boost) would break up the monotony of the back-half grind.

---

## 6. Premium Currency Pressure

### When Does the Player Feel Gem-Starved?

Tracking the player journey through pinch points:

**Session 1-5 (Tutorial/Early Game):**
- Start with 50 gems
- Earning ~50-75 gems per session
- Spending: maybe 1 energy pack (20 gems) or a common egg (50 gems)
- **Feeling: Gems flow freely.** No pressure.

**Session 10-20 (Discovery Phase):**
- Player has discovered the shop, seen biome eggs, wants specific creatures
- Cheapest biome egg: 250 gems = 3+ sessions of saving
- They see the Enchanted Egg at 600 and Celestial at 900 and think: "That's a lot."
- **Feeling: First awareness of scarcity.** Player starts making choices about what to spend on.

**Session 20-40 (Engagement Hook):**
- Player wants to fill out their creature collection (hatchery/codex completionism)
- Multiple biome eggs needed per biome (16 creatures in meadow alone -- not all from eggs, but some are)
- Power-ups become tempting (Mass Match at 60 gems is efficient when the board is full)
- Haven Pass premium ($7.99) is dangling with juicy rewards
- **Feeling: "I want to buy everything but can only afford some things."** This is the sweet spot for F2P conversion pressure.

**Session 40+ (Mid Game):**
- Worker income starts supplementing active play
- Creature passive gem_bonus is adding 15-30% more gems per session
- But the most expensive items (Celestial Egg at 900, Epic Egg at 400) still require dedicated saving
- **Feeling: Moderate pressure.** Player can afford small things freely but big things require discipline or IAP.

### IAP Conversion Points

The game creates several natural conversion moments:

1. **Starter Pack ($1.99):** 500 gems + 30 energy + rare egg. Appears early. The value is extreme compared to earning 500 gems organically (7+ sessions). This is the "gateway purchase."

2. **Piggy Bank ($2.99):** Accumulates 1-3 gems per merge passively. After ~200 merges (2-3 sessions), it holds 200-600 gems. The psychological trick works: "I already earned these, I just need to unlock them."

3. **Haven Pass Premium ($7.99):** The free track gives modest rewards. The premium track includes rare eggs, epic eggs, power packs, and 500 gems at tier 40. Over the full pass, premium adds ~1,500+ gems in value. Strong conversion for engaged players.

4. **Gem bundles ($0.99-$19.99):** Standard IAP. The value scaling is good (100 gems for $0.99, 3500 for $19.99 = 3.5x the per-gem value).

### Verdict

**The gem economy has healthy tension but is not predatory.** Players can meaningfully progress without spending money, but spending accelerates the experience significantly. The three clearest pressure points are:

1. Wanting a specific biome egg (250-900 gems) and not wanting to wait 3-12 sessions
2. Running out of energy during an exciting merge chain (20-35 gems for a refill is an impulse buy)
3. The piggy bank "I already have these gems, just pay to unlock" psychology

**No hard paywall exists.** Every item purchasable with gems can be earned through gameplay. This is important for player goodwill.

**One risk:** The energy system regenerates at 1 energy per 2 minutes, and the player has 100 max energy. A 10-minute session uses roughly 30-50 energy (one spawn per tap). With 100 energy, a player can play for ~20-30 minutes before running dry. The 35-gem full recharge is affordable but if the player has already spent gems on eggs/boosts, they might feel squeezed. **Consider a daily free energy refill (e.g., first session of the day gives +25 energy) to smooth this out.**

---

## 7. Endgame -- What Keeps Players Playing?

### Current Endgame Content

Once a player has:
- Unlocked all 37 island nodes (~2-4 months)
- Discovered most of the 184 creatures
- Completed Haven Pass Season 1 (40 tiers)
- Maxed out multiple merge chains

...what is left?

| System | Endgame Loop | Repeatable? |
|--------|-------------|-------------|
| Island roadmap | Fully explored | No -- finite, 37 nodes, done once |
| Creature collection | 184 creatures to find | No -- finite, completable |
| Haven Pass | Season 1 has 40 tiers | No -- unless new seasons are added |
| Worker income | Passive gems forever | Yes, but not engaging (no interaction) |
| Merge gameplay | Core loop continues | Yes -- always more to merge |
| Surge system | Continues to function | Yes -- but no escalating reward |
| Board companions | Continue triggering | Yes -- but no progression |

### The Problem

**Haven has no repeating endgame challenge system.** Once the finite content is consumed, the core merge loop continues but there is nothing to *aim at*. The gems become meaningless because there is nothing left to buy (all creatures discovered, all eggs purchased). Stars accumulate with nothing to spend them on.

This is the classic merge game retention cliff. Players who reach endgame either:
1. Churn (most common)
2. Wait for new content updates
3. Become completionists grinding for the last few creatures

### Recommendations for Endgame Retention

1. **Seasonal/rotating challenges:** Weekly challenges with unique rewards (e.g., "Merge 50 flora items this week" for a limited-edition creature variant). Creates a reason to log in even after completing all permanent content.

2. **Prestige system:** Allow players to "reset" an island region for bonus rewards. Each prestige run gives a cosmetic star rating on the node and a small permanent bonus (e.g., +1% gem income per prestige).

3. **Community events:** Time-limited collaborative goals ("All players collectively merge 1 million items this weekend" for a shared reward). Even if implemented as a local simulation, creates urgency.

4. **Endless dungeon / deep merge mode:** A special board mode with escalating difficulty (more chains, smaller board, timer) that gives leaderboard ranking and exclusive rewards. This serves the competitive/mastery audience.

5. **Creature evolution / ascension:** Allow fully-collected biomes to be "ascended," resetting creature discovery for that biome but granting evolved versions with stronger passives and new visual designs. Creates a collectionist loop that extends indefinitely.

6. **Season 2, 3, etc. of Haven Pass:** The pass infrastructure already exists. Adding new seasons with new tier rewards is the lowest-effort, highest-impact endgame extension. Consider making seasons time-limited (8 weeks) to create urgency.

---

## Summary Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Gem income vs spending balance | 8/10 | Well-calibrated. Small purchases affordable, big purchases aspirational. Merge Bonus boost ROI is too close to break-even. |
| Worker passive income | 5/10 | Early game rates are too low to feel rewarding. Late game is fine. Needs a bump at common/uncommon tiers. |
| Creature passive bonuses | 7/10 | Good power curve overall. energy_regen is the weakest passive -- barely perceptible even with many creatures. |
| Board companions | 8/10 | Trigger rates are satisfying. Auto Merge outclasses Energy Refund. Double Reward often wastes on 0-gem merges. |
| Island progression pacing | 7/10 | First 3 regions feel great. Back half risks becoming a grind. Mid-region milestones would help. |
| Premium currency pressure | 8/10 | Healthy tension, not predatory. No hard paywalls. Piggy bank and starter pack are well-designed conversion tools. |
| Endgame retention | 4/10 | Biggest gap. All content is finite and completable. No repeating challenge system. Players will churn after 2-4 months without new content systems. |

### Top 3 Priority Fixes

1. **Design an endgame system** -- seasonal challenges, prestige, or endless mode. Without this, engaged players will churn after completing the island.
2. **Buff common/uncommon worker income** -- 3 gems/hr is too low to motivate early players to engage with the worker system. Raise to 5/12.
3. **Fix Double Reward companion** -- Make it persist until a tier 4+ merge occurs, so the effect is never "wasted" on a 0-gem merge.

### Top 3 Things That Already Work Well

1. **The surge system** -- building momentum through rapid merges is visceral and rewarding. The escalating gems + speed boost + screen effects create genuine excitement.
2. **Chain reaction rewards** -- the escalating `depth * 3` gems formula makes deep chains feel incredibly rewarding. A depth-3 chain (3 + 6 + 9 = 18 gems) plus the energy refunds feels like hitting a jackpot.
3. **The creature collection** -- 184 creatures across 16 biomes with individual descriptions, abilities, and companion effects gives tremendous depth to the collection meta. The passive bonus stacking creates a tangible sense of "my collection is making me stronger."

---

*Report generated 2026-02-11. Based on static code analysis of shop.js, board.js, game.js, island.js, creatures.js, and pass.js.*
