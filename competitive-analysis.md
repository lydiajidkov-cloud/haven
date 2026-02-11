# Haven Competitive Analysis: vs Merge Dragons, Merge Mansion, Travel Town

*Analysis date: 11 February 2026*
*Haven codebase: 20 JS modules, full feature audit*
*Competitors: Merge Dragons ($780M+ lifetime), Merge Mansion ($9M/month), Travel Town ($0.35 ARPDAU)*

---

## Table of Contents

1. [Feature Matrix](#feature-matrix)
2. [Per-Competitor Breakdown](#per-competitor-breakdown)
3. [Addiction Mechanics Deep Dive](#addiction-mechanics-deep-dive)
4. [Top 5 Features to Steal](#top-5-features-to-steal)

---

## 1. Feature Matrix

| Feature | Haven | Merge Dragons | Merge Mansion | Travel Town |
|---------|:-----:|:-------------:|:-------------:|:-----------:|
| **Core Merge** | Merge-2 | Merge-3/5 | Merge-2 | Merge-2 |
| **Board Size** | 8x6 (48 cells) | Large camp (expandable) | Small fixed board | Single screen fixed |
| **Board Expansion** | No | Yes (via Dragon Power) | No | No |
| **Energy System** | 100 max, 2min/point | Chalices for levels; camp unlimited | Energy for spawning | 100 cap, slow regen |
| **Surge/Momentum** | Yes (unique) | No | No | No |
| **Chain Reactions** | Yes (auto-cascade) | Limited | No | No |
| **Combo Counter** | Yes (visual milestones) | No | No | No |
| **Swipe-Merge** | Yes | No | No | No |
| **Critical Merge (RNG tier jump)** | Yes (4% +2 tier) | No | No | No |
| **Clutter Tax** | Yes (>8 tier-0 = 2x energy) | No (bubbling instead) | No | No |
| **Cross-Chain Recipes** | Yes (4 hybrid chains) | No | Sort of (tool recipes) | Combined chains |
| **Creature Collection** | 184 creatures, 16 biomes | 400+ dragons, many breeds | No creatures | No creatures |
| **Creature Passive Bonuses** | Yes (5 stat types) | Dragon Power (single stat) | N/A | N/A |
| **Companion System** | Yes (2 slots, triggered abilities) | Dragons auto-work in camp | N/A | N/A |
| **Worker/Idle Income** | Yes (gems/hour offline) | Dragons harvest while idle | No | No |
| **Quest System** | 4 active quests | Dragon Quests + missions | Task-based renovation | Order-based |
| **Delivery Orders** | Yes (exact-tier matching) | Kala trades | Renovation tasks | Town orders |
| **Battle Pass** | Yes (40 tiers, 30-day) | Royal Pass (28-day seasons) | Season Pass | Season Pass |
| **Daily Login Calendar** | Yes (7-day rolling + streaks) | Daily chest | Daily rewards | Daily rewards |
| **Daily Quests** | Yes (3 per day) | Yes | Yes | Yes |
| **Weekly Events** | Yes (8 rotating, modifiers) | Yes (weekend events + seasons) | Yes (limited events) | Yes (seasonal) |
| **Exclusive Event Creatures** | Yes (gold tier reward) | Yes (seasonal dragons) | N/A | Themed rewards |
| **Achievements** | Yes (50 across 8 categories) | Yes | Yes | Yes |
| **Tutorial** | Yes (progressive disclosure) | Yes (guided) | Yes (guided) | Yes (guided) |
| **Power-ups** | Yes (6 types, earnable) | Rare/limited | Boosters | Boosters |
| **Shop/IAP** | Yes (full simulated store) | Yes (extensive) | Yes (gems + coins) | Yes (diamonds + energy) |
| **Rewarded Ads** | Yes | Yes | Limited | Yes |
| **Piggy Bank** | Yes | No | Yes (similar) | No |
| **Narrative/Story** | Island boss story (light) | Dragon camp lore (light) | **Deep narrative** | Town renovation (light) |
| **Meta-Progression Map** | Island (7 regions, 38 nodes) | World map levels | Mansion renovation | Town building |
| **Bubbling/Storage** | No | Yes (exploit/feature) | Inventory | Inventory |
| **Social/Trading** | No | No | No | Card trading |
| **Card Collection** | No | No | No | Yes (album system) |
| **Land Healing/Clearing** | No | Yes (core mechanic) | No | No |
| **Multiple Board Types** | No | Camp + level boards | Single board | Single board |
| **Procedural Audio** | Yes (Ode to Joy streak) | Basic SFX | Basic SFX | Basic SFX |
| **Offline Earnings Screen** | Yes (welcome back) | Basic | No | No |

---

## 2. Per-Competitor Breakdown

### 2A. Merge Dragons

**What Merge Dragons Has That Haven is MISSING:**

1. **Expandable Camp (Land Healing)** -- The single most important difference. In Merge Dragons, your camp starts small and wrapped in "Evil Fog." Collecting Dragon Power (by merging/leveling dragons) permanently unlocks new land. This creates an evergreen progression loop: merge better dragons -> unlock more space -> fill that space -> need better dragons. Haven's fixed 8x6 board has no equivalent spatial growth mechanic.

2. **Dual Board System (Camp + Levels)** -- Players have their persistent camp AND separate challenge levels on a world map. Levels are energy-gated (chalices), short-session puzzles that reward items brought back to camp. This creates two distinct play modes with different pacing. Haven's island is progression-gated but not a separate playable board.

3. **Massive Dragon Catalogue (400+)** -- Merge Dragons has 400+ dragon breeds across dozens of families. Haven's 184 creatures across 16 biomes is solid but roughly half the catalogue depth. More importantly, dragons in MD are visible workers that fly around your camp, creating ambient life.

4. **Bubbling as Space Management** -- Players can "bubble" items (an intentional exploit Gram Games never patched because it drives engagement). Bubbled items float above the board as storage. Haven has no equivalent inventory/storage system.

5. **Dragon Power as Unified Progression Metric** -- Every dragon contributes to a single visible number (Dragon Power) that gates content. It is the most legible "get stronger" metric in the merge genre. Haven distributes progression across stars, gems, island progress, achievements -- no single "power number."

6. **Kala Trades (Random Item Exchange)** -- A merchant who offers randomized item-for-item trades on a timer. Creates FOMO ("this trade expires in 4 hours") and gives purpose to excess items. Haven's orders are similar but lack the randomized "deal of the moment" excitement.

**What Haven Has That Merge Dragons Does NOT:**

1. **Surge Momentum System** -- MD has no equivalent to Haven's accelerating merge tempo with visual/audio escalation and bonus gem payouts. MD merges are individually satisfying but lack a building momentum mechanic.

2. **Combo Counter with Musical Progression** -- The Ode to Joy streak system (harmony at 5+, shimmer at 7+, chorus at 10+, bass at 15+, full swell at 25+) is completely unique. MD has no procedural audio escalation.

3. **Cross-Chain Recipes** -- MD chains are siloed. You cannot merge items from different chains to create hybrid items. Haven's 4 hybrid chains (living, arcane, shelter, mystic) from base-chain combinations are a genuine innovation.

4. **Clutter Tax** -- MD uses bubbling for board management. Haven's automatic energy penalty for hoarding tier-0 items is more elegant game design -- it creates natural pressure without relying on an exploit.

5. **Swipe-Merge Input** -- MD is tap-and-drag only. Haven's draw-a-line-across-matching-tiles is a faster, more satisfying input method for rapid merges.

6. **Companion Triggered Abilities** -- MD dragons auto-harvest but don't have triggered abilities (auto_merge, free_spawn, energy_refund, etc.) tied to merge counts. Haven's companion system adds strategic depth to creature selection.

**Where Haven Does It BETTER:**

- **Merge feel/juice**: Haven's combination of surge momentum + combo counter + procedural audio + critical merge RNG + near-miss feedback creates more moment-to-moment excitement per merge than MD's relatively static merge animations.
- **Board pressure design**: Clutter tax is smarter than hoping players discover the bubble exploit. It teaches players to merge up organically.
- **Recipe discovery**: Cross-chain recipes give "aha!" moments that MD's linear chains cannot provide.

---

### 2B. Merge Mansion

**What Merge Mansion Has That Haven is MISSING:**

1. **Deep Narrative Drive** -- Merge Mansion's killer feature. Grandma Ursula's mystery, family secrets, room-by-room mansion renovation -- players merge not just to progress but to find out what happens next. Story is delivered through character dialogue, cutscenes, and environmental storytelling. Haven's island has boss creatures with light story, but nothing approaching this narrative depth.

2. **Renovation as Visual Progression** -- Players see the mansion transform as they complete tasks. Before/after is visceral and shareable. Haven's island nodes unlock sequentially but there is no visible environmental transformation.

3. **Task-Based Merge Goals** -- Instead of open-ended merging, Merge Mansion gives specific renovation tasks ("find 2 paint cans and 1 hammer") that require working specific chains. This gives every merge session a concrete purpose. Haven's orders are similar but less narratively integrated.

4. **Social Media Virality Engine** -- Merge Mansion invested heavily in bizarre, meme-worthy ads (the Grandma Ursula "what is she hiding?" campaign). The game is designed to generate shareable moments and mystery speculation. Haven has no social/viral hooks.

5. **Inventory/Storage System** -- Players can store items off the board, managing limited board space strategically. Haven has no item storage.

**What Haven Has That Merge Mansion Does NOT:**

1. **Creature Collection & Companions** -- MM has no creatures, no collection, no passive bonuses, no companion abilities. Haven's entire creature meta-game is absent.

2. **Surge/Combo/Audio Systems** -- MM merges are functional but flat. No momentum building, no combo counter, no procedural audio escalation. Haven's merge feel is dramatically more engaging.

3. **Cross-Chain Recipes** -- MM chains are isolated (tools, furniture, plants). No hybrid discovery mechanic.

4. **Weekly Events with Game Modifiers** -- Haven's events change gameplay rules (Crystal Rush, Speed Demon, etc.). MM events are mostly "complete tasks for limited rewards" without changing core mechanics.

5. **Power-ups (Earnable)** -- Haven's 6 power-ups with free earn tracking give players agency. MM's boosters are primarily purchasable.

6. **Worker/Idle Income** -- No offline gem generation in MM. Haven's worker system gives reasons to return.

**Where Haven Does It BETTER:**

- **Moment-to-moment gameplay**: MM's merging is a means to an end (renovation). Haven's merging IS the end -- and it is more mechanically rich with surge, combos, swipe-merge, critical merges, and cross-chain recipes.
- **Creature meta-game**: Haven's 184 creatures with passive bonuses and companion abilities add a strategic layer MM completely lacks.
- **Event design**: Haven's game-modifier events change how you play. MM's events are just "more tasks."

---

### 2C. Travel Town

**What Travel Town Has That Haven is MISSING:**

1. **Card Album Collection System** -- During seasons, players collect cards from events and challenges to complete themed albums (18 sets of 9 cards). Complete sets earn energy, diamonds, Joker cards. Duplicate cards earn stars exchangeable for chests. Cards are tradeable with friends. This is an entire social meta-layer Haven lacks.

2. **Social Trading** -- Card trading creates social bonds and retention. Players add friends specifically to trade. Haven has zero social features.

3. **Town Building as Visual Progression** -- Like Merge Mansion but themed around travel destinations. Players see a town grow as they progress. More visually transformative than Haven's node-based island.

4. **No-Energy Generators** -- Some generators in Travel Town spawn items for free after a cooldown (no energy cost). This provides a "check back later" loop without energy expenditure. Haven's spawning always costs energy.

5. **Combined Chains** -- Travel Town has chains that require merging items from two different chains to progress. This is similar to Haven's cross-chain recipes but more deeply integrated into progression rather than being a separate discovery mechanic.

6. **Nested Chains** -- Some chains require you to create a generator as an intermediate step before continuing the chain. This adds complexity and planning depth that Haven's linear chains lack.

7. **500+ Discoverable Items** -- Travel Town's item catalogue dwarfs Haven's. More items = more discovery moments = longer engagement before "I've seen everything."

**What Haven Has That Travel Town Does NOT:**

1. **Creature Collection & Companions** -- TT has no creatures, no collection bonuses, no companion abilities. Haven's entire creature system is unique.

2. **Surge Momentum + Combo Counter** -- TT has no equivalent momentum or visual combo system. Merging is steady-state.

3. **Procedural Audio (Ode to Joy)** -- TT has standard SFX. Haven's musical merge streaks are unique in the genre.

4. **Weekly Events with Modifiers** -- TT has seasonal events but they don't change core gameplay rules the way Haven's modifier events do.

5. **Battle Pass (Structured)** -- Haven's 40-tier pass with clear XP curve is more structured than TT's seasonal approach.

6. **Power-ups (6 Types, Earnable)** -- TT has boosters but Haven's power-up variety and earn-through-play system is richer.

7. **Clutter Tax** -- TT relies on board space pressure + inventory. Haven's clutter tax is a more elegant anti-hoarding mechanic.

**Where Haven Does It BETTER:**

- **Core merge feel**: Surge + combo + audio + critical merge + swipe-merge makes Haven's moment-to-moment merging the best in the genre.
- **Creature depth**: 184 creatures with passive bonuses and companion abilities vs. zero creature system.
- **Power-up variety**: 6 earnable power-ups vs. basic purchasable boosters.

---

## 3. Addiction Mechanics Deep Dive

### 3A. The "Board Full" Problem

The central tension in every merge game: the board fills up, the player can't spawn new items, frustration spikes, they either spend money or quit.

| Game | Board Full Solution | Monetization Angle |
|------|--------------------|--------------------|
| **Merge Dragons** | Bubbling (store items off-board) + land expansion (Dragon Power unlocks permanent new space) | Sell dragon eggs to boost Dragon Power -> unlock more land. Also sell gems to speed up slow chains. Camp is theoretically unlimited. |
| **Merge Mansion** | Small fixed board + inventory storage (limited slots, expandable with gems) | Board space IS the monetization lever. Limited inventory forces "pay to store more" or "pay for energy to merge faster and clear space." Record $9M month driven by this pressure. |
| **Travel Town** | Fixed board + inventory (limited) + selling items | Board space is the primary pain point. Past level 30, nearly unplayable without paying. Inventory expansion costs diamonds. Board pressure is the #1 spending trigger. |
| **Haven** | Clutter tax (>8 tier-0 items = 2x energy cost) + no storage system | Clutter tax is smart but softer than competitors. No inventory means no "pay to expand storage" monetization. No board expansion means no Dragon-Power-style growth loop. The 8x6 board is what it is. |

**Analysis:** Haven's clutter tax is an elegant design solution but it is a weaker monetization lever than competitors. The board full problem is THE primary spending trigger in merge games. Haven should consider adding either:
- Limited inventory slots (expandable with gems) -- proven model
- Board expansion tied to progression -- aspirational model

### 3B. Surge System Equivalents

| Game | Momentum Mechanic | Effect |
|------|-------------------|--------|
| **Haven** | Surge bar (builds at 35/merge, activates at 30, decays at 8/sec) + Combo counter (milestones at 5/10/15/20/25) | Faster animations, bonus gems, end-of-surge payout, visual/audio escalation, screen shake, edge glow |
| **Merge Dragons** | None. Each merge is independent. | Dragons that auto-harvest create ambient momentum but no player-driven acceleration |
| **Merge Mansion** | None. Merges are purely functional. | No momentum, no acceleration |
| **Travel Town** | None. Steady-state merging. | No equivalent system |

**Analysis:** Haven is genuinely unique here. The surge system creates a "flow state" feedback loop that no competitor has. This is Haven's single biggest competitive advantage in moment-to-moment gameplay feel. The Ode to Joy musical progression layering is the kind of detail that creates viral "listen to this!" sharing moments.

### 3C. Discovery & Collection

| Game | Discovery System | Collection Depth | Dopamine Trigger |
|------|-----------------|-----------------|------------------|
| **Merge Dragons** | New dragon breeds discovered through merging eggs + event exclusives | 400+ dragons, dozens of families, Dragon Power as aggregate metric | "New dragon!" popup, Dragon Power number goes up, new camp land unlocks |
| **Merge Mansion** | New items discovered through chain progression | Task completion reveals new rooms/areas | Room renovation reveal, story cutscene unlock |
| **Travel Town** | First-time item discovery rewards 1 diamond each, 500+ items | 500+ items across many chains, card albums with 18 sets | Diamond reward per discovery, album completion rewards |
| **Haven** | Creature discovery (biome-gated, tier-gated), recipe discovery (4 hybrid chains) | 184 creatures across 16 biomes, 4 hybrid recipes | Creature celebration overlay, recipe book update, hatchery progress bars |

**Analysis:** Haven's creature discovery is good but the reward cadence is slower than Travel Town's "1 diamond per new item" which creates micro-dopamine hits constantly. Haven should consider adding a small gem reward for each first-time item tier reached (not just creatures) to increase discovery frequency.

### 3D. FOMO Mechanics

| Mechanic | Haven | Merge Dragons | Merge Mansion | Travel Town |
|----------|:-----:|:-------------:|:-------------:|:-----------:|
| **Limited-time events** | Weekly rotating (always available) | Weekend events + 28-day seasons | Time-limited renovation events | Seasonal events |
| **Exclusive creatures/rewards** | Gold-tier event creature | Seasonal Royal Pass dragons (pay-gated) | Event-exclusive items | Album cards (seasonal) |
| **Daily login streak** | 7-day rolling, streak multiplier | Daily chest | Daily rewards | Daily rewards |
| **Expiring daily deals** | 3 rotating (seeded by date) | Kala trades (4hr timer) | Limited offers | Timed offers |
| **Battle pass countdown** | 30-day season with tier rewards | 28-day Royal Pass | Season pass | Season pass |
| **"Use it or lose it" energy** | Caps at 100 (wastes regen when full) | Chalices cap | Energy caps | Energy caps at 100 |
| **Piggy bank pressure** | Accumulates on merges, $2.99 to break | No | Similar mechanic | No |
| **Social pressure** | None | None | None | Card trading creates social obligation |
| **Scarcity messaging** | None | "Royal Pass exclusive!" | "Limited time!" | "Album ends in X days!" |

**Analysis:** Haven has the structural FOMO mechanics (events, pass, daily login, deals) but lacks two critical FOMO amplifiers:
1. **Scarcity messaging** -- Haven doesn't tell you what you'll MISS. Competitors explicitly say "Royal Pass Exclusive!" or "Album ends in 3 days!" Haven should add "EXCLUSIVE" badges and countdown timers to event creatures and deal expirations.
2. **Social FOMO** -- Travel Town's card trading means friends pressure you to play ("I need your duplicate card!"). Haven has zero social hooks. Even a simple leaderboard or friend list would help.

### 3E. Energy Pacing

| Game | Max Energy | Regen Rate | Session Length | Monetization |
|------|-----------|------------|---------------|--------------|
| **Haven** | 100 | 1 per 2min (120s), modified by creature bonuses | ~15-25 min per full bar | Energy packs in shop, rewarded ads give 2 energy |
| **Merge Dragons** | 7 chalices (for levels) / unlimited camp time | 1 chalice per ~70 min | Levels: short burst. Camp: unlimited | Buy chalices with gems |
| **Merge Mansion** | ~50-80 (varies by level) | 1 per ~2-3 min | ~10-20 min per full bar | Energy packs, timed boosters |
| **Travel Town** | 100 | 1 per ~2 min | ~15-25 min per full bar | Diamonds buy energy, daily free energy links |

**Analysis:** Haven's energy pacing is competitive with Travel Town and slightly more generous than Merge Mansion. The key difference is that Merge Dragons separates "limited" play (levels with chalices) from "unlimited" play (camp), giving players a reason to keep the app open even when gated. Haven could consider a similar split: energy-gated spawning but free reorganization/selling, or an "idle mode" where companions work without energy.

### 3F. What Makes Players Spend Money

| Spending Trigger | Haven | Merge Dragons | Merge Mansion | Travel Town |
|-----------------|:-----:|:-------------:|:-------------:|:-----------:|
| **Board space pressure** | Weak (clutter tax is soft) | Medium (bubbling reduces urgency) | **Strong** (primary driver) | **Very Strong** (#1 driver) |
| **Energy impatience** | Medium | Medium (chalices for levels) | **Strong** | **Strong** |
| **Exclusive content (pass)** | Medium (premium track) | **Strong** (exclusive dragons) | Medium | Medium |
| **Piggy bank "almost full"** | Yes | No | Yes | No |
| **Starter pack value** | Yes ($1.99, one-time) | Yes | Yes | Yes |
| **Collection completion** | Medium (184 creatures) | **Strong** (400+ dragons, completionist drive) | Weak | Medium (500+ items, cards) |
| **Skip waiting** | Low (no obvious skip) | Medium | **Strong** | **Strong** |
| **Power-ups** | Medium (earnable reduces urgency) | Low | Medium | Medium |
| **Daily deal FOMO** | Medium (3 deals, no urgency) | **Strong** (Kala timer) | Medium | Medium |

**Analysis:** Haven's monetization pressure is the weakest of the four. This is partly by design (Haven simulates IAP rather than implementing real payments) but the structural incentives to spend are softer. The earnable power-ups, lack of inventory storage to sell, and soft clutter tax all reduce pressure compared to competitors. If Haven ever monetizes for real, it needs to tighten at least one of: board space pressure, energy scarcity, or collection completionism.

---

## 4. Top 5 Features to Steal

Ranked by **Retention Impact (high/medium/low)** vs **Implementation Difficulty (easy/medium/hard)**.

### #1: Item Discovery Rewards (from Travel Town)

**What:** Award 1-3 gems the first time ANY item tier is reached in any chain, not just creatures. "New Discovery! Mossy Log (Wood Tier 3) -- +2 gems"

**Why:** Travel Town's "1 diamond per new item" creates constant micro-dopamine hits in early game. With 5 base chains x 8-10 tiers + 4 hybrid chains x 5 tiers = 60-70 discovery moments in the first few hours alone. Currently Haven only rewards creature discoveries, which are much rarer.

| Retention Impact | Implementation Difficulty |
|:---:|:---:|
| **HIGH** -- Increases early-game dopamine frequency by 5-10x | **EASY** -- Add a `discovered` set to game state, check on merge, show toast + gem reward |

**Implementation notes:** Track `state.discoveredItems = {}` by chain+tier key. On merge result, check if new. If yes, show celebration toast, award gems (1 for common tiers, 2 for mid, 3 for high), play discovery sound. Maybe 2-3 hours of work.

---

### #2: Inventory/Storage System (from Merge Mansion / Travel Town)

**What:** Add 5 inventory slots below the board. Players can tap an item to store it, tap a stored item to place it back. Expand slots with gems (5 -> 8 -> 12 -> 16).

**Why:** This is the #1 monetization lever in the merge genre. Board space pressure is what makes players spend money. Currently Haven has NO way to temporarily store items, and the clutter tax is a softer version of this pressure. Inventory slots: (a) give players a strategic tool, (b) create "I need more slots" spending moments, (c) allow board planning for cross-chain recipes.

| Retention Impact | Implementation Difficulty |
|:---:|:---:|
| **HIGH** -- Proven primary monetization lever across all top merge games | **MEDIUM** -- New UI element below board, storage state management, shop integration for slot expansion |

**Implementation notes:** Add `state.inventory = []` with max slots. Render as a row below the 8x6 grid. Tap item on board -> moves to inventory (if slot free). Tap inventory item -> places on board (if cell free). Shop sells slot expansions. Maybe 4-6 hours of work.

---

### #3: Narrative Wrapper / Visual Renovation (from Merge Mansion)

**What:** Add a simple visual transformation to each island region. Before: crumbling ruins. After completing the region: beautiful restored environment. Show a brief "renovation reveal" animation when a region is completed.

**Why:** Merge Mansion's entire $9M/month business is built on "merge to renovate." The before/after transformation is emotionally satisfying, screenshot-worthy, and gives every merge session a tangible visual goal beyond numbers going up. Haven's island already has regions and bosses -- adding visual transformation to the existing structure would be high-impact for moderate effort.

| Retention Impact | Implementation Difficulty |
|:---:|:---:|
| **HIGH** -- Proven driver of long-term retention and social sharing | **MEDIUM-HARD** -- Requires before/after art assets for 7 regions, transition animations, UI for viewing restored regions |

**Implementation notes:** This is primarily an art/content challenge, not a code challenge. Each of the 7 island regions needs a "restored" visual state. When all nodes in a region are completed, play a transformation animation and swap the visual. Could use CSS transitions on emoji-based scenes for an MVP. Code: 3-4 hours. Art direction: the harder part.

---

### #4: Kala-Style Timed Trades (from Merge Dragons)

**What:** Add a "Wandering Merchant" who appears every 4-6 hours offering a randomized item-for-item trade (e.g., "Give me 2 Stone Tier-3 and receive 1 Crystal Tier-4"). Trade expires on timer. Optionally: accept for gems if you lack the items.

**Why:** This creates FOMO on a short timer (4-6 hours), gives purpose to excess/unwanted items, introduces variability into optimal strategy, and drives app re-opens. Merge Dragons' Kala is one of the most praised features in community discussions. Haven's orders are static and always available -- a timed merchant adds urgency.

| Retention Impact | Implementation Difficulty |
|:---:|:---:|
| **MEDIUM-HIGH** -- Proven re-open trigger, creates "I should check my trades" habit | **EASY-MEDIUM** -- Timer system, random trade generation (input items -> output item), notification on new trade, UI overlay |

**Implementation notes:** Add `state.merchant = { offer: {...}, expiresAt: timestamp }`. Generate offer based on player's discovered chains and current tier range. Show merchant icon on board with countdown badge. Tap to see offer. Accept = remove input items from board, spawn output item. Reject = wait for next cycle. Maybe 3-5 hours of work.

---

### #5: Card/Sticker Collection Album (from Travel Town)

**What:** Add a seasonal sticker album (e.g., 6 sets of 6 stickers). Stickers drop randomly from merges, events, and daily quests. Complete a set to earn bonus rewards (energy, gems, rare egg). Duplicate stickers contribute to a secondary "star" currency for bonus chests.

**Why:** Travel Town's card album is their strongest social and retention feature. It: (a) adds a collection layer on TOP of existing gameplay (no core loop changes needed), (b) creates social trading hooks if multiplayer is ever added, (c) provides seasonal renewal (new album each month), (d) gives duplicate items purpose instead of feeling wasted, (e) creates completionist FOMO ("album ends in 12 days!").

| Retention Impact | Implementation Difficulty |
|:---:|:---:|
| **MEDIUM** -- Strong for engaged players, less impactful for casual players | **MEDIUM** -- Album UI, sticker drop system, set completion logic, seasonal rotation, duplicate-to-stars conversion |

**Implementation notes:** Add `state.album = { season: 1, stickers: {}, stars: 0 }`. Stickers drop with configurable probability on tier 3+ merges, event completions, daily quest claims. Album UI shows sets with collected/missing stickers. Complete set = claim reward. Duplicates auto-convert to stars. Maybe 5-7 hours of work.

---

## Summary: Haven's Competitive Position

### Haven's Genuine Advantages (Defend These)
1. **Best-in-genre merge feel** -- Surge + combo + audio + critical merge + swipe-merge. No competitor comes close to Haven's moment-to-moment gameplay satisfaction.
2. **Cross-chain recipes** -- Unique discovery mechanic that adds strategic depth.
3. **Creature companion system** -- Triggered abilities every 8-12 merges add meaningful choice to creature selection.
4. **Clutter tax** -- Smarter than relying on an exploit (bubbling) or raw frustration (Merge Mansion board pressure).
5. **Procedural audio** -- Ode to Joy streak is genuinely delightful and potentially viral.

### Haven's Critical Gaps (Fix These)
1. **No board expansion or storage** -- The #1 monetization lever in the genre is board space pressure. Haven has the weakest version of this.
2. **No narrative drive** -- Merge Mansion proves that "why am I merging?" matters as much as "how does merging feel?"
3. **No social features** -- Travel Town's card trading is a retention multiplier Haven completely lacks.
4. **Low discovery frequency** -- Only creatures trigger discovery rewards. Should reward all first-time item tiers.
5. **Soft FOMO messaging** -- Competitors explicitly mark things "EXCLUSIVE" and "ENDS IN X HOURS." Haven's time pressure is implicit.

### The Bottom Line

Haven has the best core merge gameplay of any game in this comparison. Its surge system, combo counter, procedural audio, and cross-chain recipes create a moment-to-moment experience that is genuinely superior to Merge Dragons, Merge Mansion, and Travel Town.

What Haven lacks are the meta-game retention systems that keep players coming back for weeks and months: narrative progression, board space monetization pressure, social connections, and aggressive FOMO. These are the systems that turn a fun game into a $9M/month business.

The five features recommended above are ordered to address this gap: discovery rewards (easy win), inventory system (monetization foundation), visual renovation (narrative hook), timed trades (FOMO driver), and card albums (social + collection). Implementing all five would take roughly 20-30 hours of development and would close Haven's biggest competitive gaps.

---

## Sources

- [Merge Dragons Wiki - Events](https://mergedragons.fandom.com/wiki/Events)
- [Merge Dragons Wiki - Seasons](https://mergedragons.fandom.com/wiki/Seasons)
- [How to Bubble Items in Merge Dragons](https://mergegameplay.com/how-to-bubble-items-in-merge-dragons/)
- [Merge Mansion Monetization Strategy - Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/merge-mansion-monetization)
- [Merge Mansion Wiki - Story Lore](https://merge-mansion.fandom.com/wiki/Story_Lore)
- [Merge Mansion Revenue Recovery - HGConf](https://hgconf.com/hit-blog/tpost/319v02u9g1-how-was-merge-mansion-able-to-recapture)
- [Travel Town Review 2025 - AllLoot](https://allloot.com/travel-town-review/)
- [Why Travel Town Dominates Mobile Merge - Naavik](https://naavik.co/digest/why-travel-town-is-dominating-mobile-merge/)
- [Deconstructing Travel Town - PocketGamer.biz](https://www.pocketgamer.biz/deconstructing-magmatic-games-travel-town/)
- [Travel Town Collection Wiki](https://travel-town-mobile-game.fandom.com/wiki/Collection)
- [Travel Town Cards Wiki](https://travel-town-mobile-game.fandom.com/wiki/Cards)
- [Merge Games Market Evolution - Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/merge-games-market)
- [Merge Games Monetization - Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/merge-games-monetization)
- [Why Merge Could be the New Match3 - GameRefinery](https://www.gamerefinery.com/why-merge-could-be-the-new-match3/)
- [Q1 2024 Top Merge Games Revenue - Sensor Tower](https://sensortower.com/blog/2024-q1-unified-top-5-merge%20games-revenue-us-6012c135241bc16eb8902271)
- [Merge Genre History - Gamigion](https://www.gamigion.com/a-not-so-brief-history-of-the-merge-genre/)
- [Merge Gardens vs Merge Mansion vs Gossip Harbor - Plarium](https://plarium.com/en/blog/merge-gardens-vs-merge-mansion-vs-gossip-harbor/)
