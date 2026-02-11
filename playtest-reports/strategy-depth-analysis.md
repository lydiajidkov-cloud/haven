# Haven - Playtest Report: Strategic Depth & Decision-Making

**Date:** 2026-02-11
**Analyst:** Game Design Playtest (Claude)
**Files reviewed:** `board.js`, `game.js`, `items.js`, `powerups.js`
**Focus:** Does this game have real decisions, or is it a tap-and-watch screensaver?

---

## 1. What Decisions Does the Player Actually Make?

### A Typical Session, Step by Step

1. **Open the game.** Board loads from save. You have some energy and leftover items.
2. **Tap a resource node** (wood, stone, flora, crystal, creature). An item spawns at a random empty cell, at a random tier (60% tier 0, 25% tier 1, 12% tier 2, 3% tier 3). **Decision: which chain to tap.** But there is almost no information to make this decision well, because the spawn location is random. You cannot aim.
3. **Look at the board** for matching adjacent pairs. Drag/tap/swipe to merge them.
4. **Repeat** until energy runs out.

### Where Real Decisions Exist

| Decision Point | Quality | Notes |
|---|---|---|
| Which resource node to tap | **Weak** | You are picking a chain, but the tier is random and placement is random. No way to target where the item lands. |
| Whether to merge now or wait | **Very weak** | Almost always merge immediately (see section 3). |
| Where to move items before merging | **Moderate** | You can relocate items to set up adjacencies. This is the closest thing to spatial planning. |
| Cross-chain recipe awareness | **Moderate** | Knowing that Flora+Wood=Living, Stone+Crystal=Arcane, etc. adds a layer, but only 4 recipes exist and they require same-tier items at tier 1+. |
| Which power-up to use and when | **Moderate** | 6 power-ups with varying gem costs. Timing Sort & Sweep vs. Shuffle vs. Lightning is the most interesting tactical decision in the game. |
| Spending gems on power-ups vs. saving | **Weak** | No competing gem sinks visible in these core files. |

### Where It's Autopilot

- **Merging itself** -- there is no downside to merging any time two matching items are adjacent. Merge = always correct. The game even auto-merges on spawn if items happen to land next to a match ("Lucky merge!"), rewarding you extra gems and energy for what was pure RNG.
- **Chain reactions** -- fully automatic, no player input. The game chains merges, gives escalating gem+energy rewards, and all you did was trigger the first one.
- **Surge momentum** -- fills passively as you merge. No player action activates or directs it (see section 7).
- **Spawn placement** -- entirely random. You cannot influence where the new item appears. This is the single biggest strategy killer in the design.

**Verdict: roughly 70% of gameplay is "tap node, scan for matches, merge them." The remaining 30% (item repositioning, cross-chain recipes, power-up timing) is where any real thought lives.**

---

## 2. Do the 5 Resource Chains Matter Differently?

**Short answer: No. They are functionally identical.**

All 5 base chains behave identically in terms of mechanics:
- Same spawn weight distribution (60/25/12/3)
- Same merge rules (2+ adjacent, same chain, same tier)
- Same gem/star rewards at the same tier thresholds
- No chain has a unique mechanic, special ability, or different merge count

The only functional differences:
- **Tier count:** Wood, stone, flora, and crystal have 10 tiers (0-9). Creature has only 8 tiers (0-7). This means creature maxes out faster but this is minor.
- **Cross-chain recipes:** Only 4 of the 10 possible pairings produce hybrids (flora+wood, crystal+stone, stone+wood, crystal+flora). The creature chain is entirely excluded from recipes. It participates in zero cross-chain interactions.

This means the **creature chain is strictly worse** than the other four. It has fewer tiers AND no hybrid recipes. There is no reason to prioritize spawning creatures unless a quest demands it.

The other four chains are interchangeable. There is no reason to specialize, rush one chain over another, or balance your production. Nothing about wood makes it play differently from stone.

**What's missing:** Chain-specific perks, different merge counts per chain (e.g., stone requires 3 but yields higher tier), chain synergies beyond the 4 fixed recipes, or resource-gating where certain chains are required for progression milestones.

---

## 3. Is There Any Reason NOT to Merge Immediately?

**Almost never.**

I looked hard for holdback incentives. Here is every possible reason I could find to delay a merge:

| Potential Reason | Does It Work? | Why / Why Not |
|---|---|---|
| Save items for a bigger merge (5+) | **Barely** | Merging 5+ gives one bonus item at the next tier. But you cannot control spawn placement, so engineering a 5-cluster requires moving items around manually and hoping new spawns don't land elsewhere. The bonus (1 extra item) is small vs. the board space cost of holding 5 same-chain-same-tier items. |
| Cross-chain recipe setup | **Slightly** | If you have a Flora tier-2 and want to pair it with a Wood tier-2 for a Living hybrid, you might hold off merging the Flora. But this is very situational and the recipe output (tier = input tier - 1) means you actually lose a tier level. The recipe is a net downgrade in tier. |
| Wait for surge | **No** | Surge builds FROM merging. You cannot "save" merges to do them during surge. The optimal play is to merge as fast as possible to build and sustain surge. |
| Board space conservation | **No** | Merging always reduces board population (2 items become 1). NOT merging wastes space. |

**The cross-chain recipe math is actually anti-holdback.** Two tier-3 items from different chains produce a tier-2 hybrid. You sacrifice two tier-3s to get one tier-2. The only incentive is if hybrid chains are needed for quests or if the hybrid chain's tiers are inherently more valuable -- but based on `items.js`, hybrid chains max out at tier 4 (5 tiers total), while base chains go to tier 9. Hybrids are a dead end.

**Bottom line: merge everything immediately, every time.** The game never punishes you for merging and always rewards it. There is no concept of saving resources, timing your merges, or sacrificing short-term gains for long-term payoff.

---

## 4. Board Space Pressure

**Grid:** 8 rows x 6 columns = **48 cells**

With 5 resource chains and tiers 0-3 spawning, the board can hold a lot of variety. Let's do some math:

- A new player starts with 6 items on a 48-cell grid (12.5% full).
- Each spawn adds 1 item, each merge removes 1 net (2 become 1). So the board grows by +1 per spawn, -1 per merge.
- Energy is 100 max with 2-minute regen. If you spam-tap one node 100 times, you add 100 items and must merge to keep up.

**In practice, the board probably stays 30-60% full during normal play.** You would need to aggressively spam spawns without merging to fill it. The game even has a "Board is full!" message and refunds your energy -- so it handles the edge case but doesn't use it as a tension lever.

**Does space create meaningful tension?** Rarely. 48 cells is generous for a MIN_MERGE of 2. In most merge games (Merge Dragons, EverMerge), the board gets tight because you need 3 or 5 to merge. Here, any 2 adjacent matches can merge, which means the board clears much faster.

**What's missing:** Board space becomes interesting when it forces trade-offs -- "do I make room by merging this pair suboptimally, or hold out for a triple?" Haven's MIN_MERGE of 2 means there's no such thing as a suboptimal merge. Every merge is the optimal merge.

---

## 5. Merge Threshold (2+ Adjacent)

`const MIN_MERGE = 2;`

**This is too low for strategic depth.**

In most successful merge games:
- **Merge-3** (match-3 style): Creates a "do I merge now or wait for a bigger combo?" tension.
- **Merge-5** (Merge Dragons): Forces board management, cluster planning, and sometimes painful decisions about what to sacrifice.

Haven's merge-2 means:
- **Any two touching matches can merge.** The probability of spawning next to a match is high on a 48-cell grid.
- **No planning required.** You never need to set up a cluster or arrange items. Two touching = done.
- **Accidental merges are common.** The auto-merge on spawn (lucky merge) fires whenever a spawned item lands next to a match. On a board with 20+ items, this happens frequently. The game rewards this with bonus gems and energy, which means **random chance is rewarded more than deliberate play.**
- **Swipe-merge compounds the problem.** Swiping through 2+ adjacent same-type items merges them all. This is essentially "draw a line through matches" which is fun but requires zero forward thinking.

**The merge-2 threshold turns the game into a reactive cleanup task rather than a proactive puzzle.** You are not arranging the board; you are triaging it.

**What would improve it:** Raise MIN_MERGE to 3. Immediately, every merge requires one more item, which means:
- Board fills up faster (tension)
- You sometimes have 2 of something and must wait (anticipation)
- Big merges (5+) become meaningfully harder to set up (skill expression)
- Auto-merge on spawn becomes rarer (less RNG dominance)

---

## 6. Energy System

**Stats:**
- Max energy: 100
- Regen rate: 1 per 2 minutes (base), modified by creature bonuses
- Cost: 1 energy per spawn
- No energy cost for merging, moving, or power-ups

**Does it gate play meaningfully?**

100 energy is extremely generous. At 1 energy per spawn, you get 100 spawns per session. Given that each spawn eventually leads to a merge (which is free), a single full-energy session could involve 100+ actions. That is a long play session for a mobile game.

Energy does NOT gate merging -- only spawning. So if your board is full of items, you can merge indefinitely for free. This means:
- A player who returns after a long break has full energy (100) AND a board of items to merge = a huge, uninterrupted session.
- Energy only "runs out" if you spam-spawn without merging, which is suboptimal play.

**The energy system is an annoyance timer, not a strategic constraint.** It does not force interesting decisions like "should I spend energy on wood or stone?" because the chains are interchangeable (see section 2). It does not create scarcity because 100 is so high.

**What would make it interesting:**
- Different energy costs per chain (crystal costs 3 energy, wood costs 1)
- Energy as a merge cost for high tiers (merging tier 5+ costs energy)
- Energy linked to board state (lower energy = higher tier spawns, creating a "push your luck" dynamic)

---

## 7. Surge Momentum

**How it works:**
- Each merge adds +30 to the surge meter (0-100 scale)
- Surge activates at 40, deactivates below 10
- Decays at 12/second (actually 1.2/second based on the 100ms tick at 0.1x rate)
- During surge: merge animations are faster (180ms vs 320ms), +1 bonus gem per merge
- On surge end (if 3+ merges happened): bonus of `mergeCount * 1` gems

**Does it add strategy?**

**No.** Surge is a pure feedback loop, not a decision point.

- You cannot choose to activate surge -- it activates automatically from merging.
- You cannot choose to save surge -- it decays whether you want it to or not.
- The optimal surge play is "merge as fast as possible" which is already the optimal non-surge play.
- The bonus is small: +1 gem per merge during surge, plus a handful of gems at the end. Not enough to change behavior.

Surge is a **feel-good mechanic**, not a **strategy mechanic**. It makes fast play feel rewarding (screen shake, faster animations, golden glow) but does not present any choice. Compare this to combo meters in puzzle games where maintaining a combo requires increasingly difficult moves -- Haven's surge just requires "keep merging," which you were already doing.

**What would make surge strategic:**
- Surge only counts specific chains (this round: wood + crystal = surge, others don't) -- forcing chain prioritization
- Surge consumes items faster (3-merge minimum during surge) -- creating risk/reward tension
- Surge enables special moves only available during surge windows
- Player can "bank" surge to spend later, rather than auto-activate/decay

---

## Overall Strategic Depth Rating

### 3 / 10

**What Haven has:**
- A functional merge loop with satisfying juice (particles, screen shake, haptics)
- Cross-chain recipes as a second-order merge system
- Power-ups that offer genuine tactical variety
- Swipe-merge as a physically satisfying input method

**What Haven is missing:**

1. **No meaningful resource differentiation.** The 5 chains are cosmetically distinct but mechanically identical. The creature chain is strictly worse. There is no reason to prefer one chain over another.

2. **No merge planning.** MIN_MERGE of 2, random spawn placement, and auto-merge rewards combine to eliminate forward-thinking. You react to what's on the board; you never plan what to build.

3. **No trade-offs.** There is never a moment where merging item A means you cannot merge item B. There is no scarcity, no opportunity cost, no sacrifice.

4. **No long-term strategy.** Each play session is isolated. You spawn, merge, run out of energy, leave. There is no persistent choice like "I'm investing in crystal this week" or "I need to reach tier 7 wood before I can unlock X."

5. **No failure state.** The board never pressures you. Energy is abundant. You cannot make a wrong move. A game without the possibility of a bad decision is a game without meaningful decisions.

6. **Excessive randomness in the one place it matters.** Spawn placement is random. Spawn tier is random. Auto-merges are random. The game actively rewards luck ("Lucky merge!") rather than skill. A game that celebrates when RNG does the player's job for them is telling the player their input doesn't matter.

### Recommendations (Priority Order)

| Priority | Change | Impact |
|---|---|---|
| 1 | **Raise MIN_MERGE to 3** | Single biggest improvement. Creates "I need one more" tension, reduces accidental merges, makes 5-merges a real achievement. |
| 2 | **Let players choose spawn column or row** | Gives placement agency. Even "pick a column" would transform spawning from slot-machine to spatial puzzle. |
| 3 | **Give chains unique mechanics** | Wood merges at 3 but gives energy back. Crystal merges at 2 but spawns at lower tiers. Creature merges trigger companion effects. Stone is slow but produces gems. Now chain selection matters. |
| 4 | **Add board pressure events** | Periodically spawn "blight" tiles that lock cells. Now board space is contested and clearing becomes urgent. |
| 5 | **Make surge player-activated** | Build the meter passively, let the player pop it when ready. Now surge timing is a decision. |
| 6 | **Create competing resource sinks** | Gems should be needed for multiple things: power-ups AND upgrades AND unlocking areas. Right now there's no tension in spending. |

---

*This game currently delivers a relaxation loop, not a strategy game. That is not inherently bad -- games like "Zen Koi" and "Alto's Odyssey" thrive on low-decision-count meditation. But if Haven intends to retain players long-term, it needs at least one system where the player can be **wrong**, and therefore can learn to be **right**.*
