# Haven -- Playtest Report: First Impressions from a Merge Game Addict

**Tester profile:** Casual mobile gamer. 2,000+ hours across Merge Dragons, EverMerge, Merge Magic. Plays while watching TV, on the bus, in waiting rooms. Spends occasionally ($5-$10/month on merge games). Knows exactly what "flow state" merging feels like -- and when a game fails to create it.

**Date:** 2026-02-11
**Build:** Prototype (web/PWA, code review playtest)

---

## 1. First 5 Minutes -- What Do I See? What Do I Do? Am I Hooked or Confused?

The game opens with a clean dark UI -- deep navy, gold accents. It looks polished for a prototype. The title "HAVEN" has a nice gradient treatment. I immediately see energy (100/100) and gems (50) in the top bar, and a 6x8 grid of empty cells. Below the grid: five resource buttons -- Wood, Stone, Flora, Crystal, Egg.

The tutorial fires: a welcome card ("Rebuild a magical island by merging resources and discovering creatures"), then a spotlight on the Wood button. Tap it once. Tap it again. Two items appear on the grid. The tutorial tells me to tap one, then tap the other. They merge. Done. Tutorial is maybe 30 seconds.

**Verdict: Not confused, but not hooked either.**

The tutorial is efficient but it undersells the game badly. After 3 steps I'm dumped into the full experience with 5 resource chains, 6 power-ups, 4 navigation tabs, and zero context for any of it. I know how to merge, but I have no idea *why* I'm merging. There's no narrative setup -- no "your island was shattered by a storm" cutscene, no sad little creature looking at me with big eyes. The tutorial says "rebuild a magical island" but I can't see the island yet. In Merge Dragons, you see the dead land *immediately* and healing it is viscerally satisfying. Here, the island is behind a tab I might not even tap for 10 minutes.

The board starts with 6 pre-placed items (3 Wood, 2 Flora, 1 Stone) which is good -- gives me something to do before I start spending energy. But the items themselves are... abstract. Unicode symbols on colored squares. A Twig is a backslash character. A Seed is a filled circle. In Merge Dragons, a Life Flower Sprout *looks* like a life flower sprout. Here I'm reading tiny labels to figure out what things are. The emoji-based resource buttons (tree, mountain, flower, gem, egg) are more readable than the actual board items.

**The first 5 minutes feel competent but sterile.** There's no emotional pull. The mechanical loop works, but nothing is tugging at my "one more merge" instinct yet.

---

## 2. The "Aha" Moment -- When Does the Game Click?

There are actually *several* potential aha moments built into the code, but their timing and discoverability are problems:

**Cross-chain recipes (flora + wood = living chain).** This is genuinely clever and I don't think Merge Dragons has an equivalent. Combining a Tier 1 Wood item with a Tier 1 Flora item to create a Vine from the "Living" hybrid chain? That's cool. But there's zero tutorialisation of this mechanic. A new player would need to accidentally drag a wood item onto a flora item of the same tier and notice the purple "recipe-target" highlight. Or they'd need to read a quest that says "Create a Vine" and figure it out. I'd bet 80% of players never discover this in their first session.

**The surge system.** Merge fast enough and a momentum bar fills up. Hit 40% and you enter SURGE mode -- faster animations, bonus gems per merge, and a pulsing orange glow on the board. This is the closest thing to "flow state" the game has, and it feels good in theory. The escalating audio is particularly well done -- the pentatonic scale that climbs with each rapid merge, adding overtones and cascading notes at higher streaks. At streak 25+ you'd get harmonic washes. That's thoughtful sound design.

**Creature discovery.** Merging creature eggs at higher tiers rolls a gacha for one of 184 creatures across 16 biomes. Getting a "New Creature Discovered!" popup with a little emoji creature, a rarity color, and a flavour text description would be the first real dopamine hit. But the creature chain requires investing energy into eggs specifically, and there's no guidance to do this early.

**The aha moment I think most players would hit:** The first chain reaction. You merge two items, the result lands next to another matching item, and it cascades. The code gives escalating rewards for chain reactions (depth * 3 gems, +energy, floating text "Chain x2!"). This would feel good. But it's luck-dependent unless you're deliberately setting up the board, and with a 6x8 grid and random spawn placement, intentional setup is hard.

**When does the game click?** Probably around minute 10-15, when you've completed a couple of quests, seen the star counter go up, and opened the Island tab to realize "oh, I'm unlocking nodes on a map." If you happen to discover a creature or trigger a chain reaction before that, maybe minute 8. If not... some players will bounce before it clicks at all.

---

## 3. What Keeps Me Coming Back? Is There a Compelling Reason to Open This Tomorrow?

Let me inventory the retention mechanics:

- **Energy system (100 energy, 2-min regen per point).** 100 energy is generous. Each spawn costs 1 energy. You can do a LOT in one session before running out. That's good for day-1 retention but bad for forming a "check back" habit. In Merge Dragons, the chalice system (5 chalices, 3-hour regen) creates natural session breaks that pull you back. Here, a full session could burn 100 energy in 15 minutes, then you wait ~3.3 hours for a full refill. That's actually a decent session cadence, but the game doesn't communicate it well.

- **Quests (4 active, auto-refilling from a pool of ~55).** "Produce 3 Branches." "Merge 10 times." These are functional but uninspired. No daily quest rotation with time pressure. No weekly challenge. The quests just silently replace themselves when claimed. There's no "log in today because there's a special quest" urgency.

- **Island progression (7 regions, ~38 nodes).** This is the long-term goal: spend stars to unlock nodes, discover named creatures at boss nodes, get lore snippets. This is Haven's equivalent of healing dead land in Merge Dragons. The problem: it's entirely passive. You earn stars from quests, spend them on the map. There's no *gameplay* on the island itself. In Merge Dragons, you play levels ON the healed land. In EverMerge, you chop fog on the map. Here, the island is just a rewards screen with a pretty path.

- **Season Pass (40 tiers, free + premium track).** Standard battle pass. XP from merging, spawning, completing quests. This is a proven retention tool but it's not differentiated.

- **Worker system (assign discovered creatures to island nodes for passive gem income).** This is actually a good idle mechanic -- come back after hours and collect gem income. Workers earn 3-50 gems/hour depending on rarity. Max 12 hours offline accumulation. This is the strongest "open tomorrow" hook in the game, but it requires discovering creatures AND unlocking island nodes, so it's a late-game feature.

- **Daily rewards tab.** Exists in the UI but I didn't see the implementation details. If it's a standard 7-day login streak, that helps.

**Honest answer: I might open Haven tomorrow, but I wouldn't feel pulled to.** The energy timer would bring me back, and the worker income toast would make me smile. But there's no "I need to finish this" cliff-hanger. No event. No limited-time content. Nothing is expiring.

---

## 4. What Annoys Me -- Friction Points, Confusing UI, Things That Feel Bad

**4.1 -- The items look bad.**
This is the single biggest problem. The board is where 80% of gameplay happens, and the items are colored rectangles with tiny Unicode symbols. The item name is rendered at `calc(cell-size * 0.16)` -- that's roughly 8-9 pixels on a phone. Unreadable. The tier dots at the bottom are 3px circles. I'd struggle to tell a Tier 2 from a Tier 3 at a glance. Merge Dragons uses bright, detailed 2D sprites with clear visual evolution (a sprout LOOKS different from a flower). Here, a Twig (backslash) and a Branch (psi character) are functionally identical colored squares.

**4.2 -- Five resource chains from the start is overwhelming.**
Merge Dragons starts with one chain (life flowers) and one resource (life orbs). You spend 20 minutes mastering "tap orb, merge flowers, heal land" before anything new appears. Haven throws 5 chains at you immediately plus 4 hybrid chains that aren't explained. I'd cut this to 2 chains (Wood + Flora) and unlock Stone, Crystal, and Creature progressively.

**4.3 -- No visual feedback for "what's mergeable."**
When I select an item, valid targets get a subtle `rgba(255, 215, 0, 0.15)` background. That's almost invisible on a dark theme. Merge Dragons draws bright connecting lines and pulses the matching items. Haven's highlight is too subtle for quick scanning.

**4.4 -- Spawns go to random cells.**
I tap Wood. A twig appears... somewhere on the 48-cell grid. I have to visually scan the entire board to find it. In EverMerge, new items appear near where you tapped or in a predictable area. Random placement makes it hard to plan.

**4.5 -- The power-up bar is always visible and initially confusing.**
Six small circular buttons with emoji icons, no labels, and tiny gem-cost numbers underneath. A new player sees these and either ignores them (because they're cryptic) or accidentally spends gems on them (because the confirm dialog uses `window.confirm()`, which is ugly and jarring). Power-ups should be introduced gradually, not dumped in a row from minute one.

**4.6 -- MIN_MERGE is 2, not 3.**
This is a design choice but it makes the game feel too easy. In Merge Dragons, you need 3 to merge (and 5 gives a bonus). Here, 2 items merge into 1. This means any pair of matching adjacent items will merge. The board clears faster, there's less setup involved, and the "big merge" bonus at 5 feels less special when 2 is the baseline. I understand the developer's concern about mashing (see section 6) -- a lower merge requirement makes mashing *more* effective, not less.

**4.7 -- The swipe-merge and tap-to-select dual input model.**
The code supports three interaction modes: tap-to-select (tap item, tap target), drag (pick up, drop on target), and swipe-merge (draw a path through adjacent matching items). This is technically impressive but potentially confusing. If a player tries to drag and accidentally starts a swipe, or vice versa, the result could be unexpected. The 12px drag threshold is very small.

**4.8 -- No undo.**
If I accidentally merge the wrong pair, there's no way to reverse it. Merge Dragons doesn't have undo either, so this is genre-standard, but it stings more here because the 2-item minimum means accidental merges happen more easily.

---

## 5. Comparison to Competitors -- How Does This Stack Up?

| Feature | Merge Dragons | EverMerge | Haven |
|---------|--------------|-----------|-------|
| Art quality | Detailed 2D sprites | Rich cartoon art | Unicode symbols on colored squares |
| Starting complexity | 1 chain, gradual unlock | 2-3 chains | 5 chains + 4 hybrids |
| Map/world | Playable healed land | Fog-clearing overworld | Passive node path |
| Creatures | Dragons with levels, homes | Heroes with abilities | 184 creatures (gacha discovery) |
| Events | Camp & Chill, seasonal | Treasure hunts, events | None |
| Social | Dens (guilds), leaderboards | Co-op events | None |
| Merge minimum | 3 | 3 | 2 |
| Monetization | Aggressive (time gates, gem gates, $$$) | Moderate (energy, chest keys) | Light (gems, pass, starter pack) |

**What Merge Dragons has that Haven doesn't:**
- Playable levels separate from the camp (huge for variety and progression)
- Land to heal (direct, visual impact of merging)
- Challenge events with unique rewards
- Dragon homes and a camp-building meta-game
- Wonders (the thrilling end-of-chain item that produces rare stuff)

**What EverMerge has that Haven doesn't:**
- Character progression (heroes level up and unlock abilities)
- Building pieces that combine into structures (a more satisfying visual payoff)
- Seasonal events and limited-time islands
- Social/cooperative features

**What Haven has that competitors don't:**
- Cross-chain recipes (genuinely novel mechanic)
- Surge momentum system (rewards speed, creates flow state)
- 184 creature collection with biome organization
- Companion system (equip creatures for board-level effects)
- Procedural audio that evolves with merge streaks (seriously impressive)
- Swipe-merge input (draw through matching adjacent items)
- Worker placement on island nodes

Haven has some genuinely innovative mechanics buried under a presentation problem. The cross-chain recipes and creature companion system are more strategically interesting than anything in Merge Dragons. But the art gap is enormous, and art is what sells a merge game.

---

## 6. The Mashing Problem -- Can You Just Mindlessly Mash Buttons?

**The developer is right to be concerned. Yes, you can absolutely mash.**

Here's the mashing loop: Tap Wood. Tap Wood. Tap any matching pair. Repeat. With MIN_MERGE at 2, you only need two of anything to merge. The auto-merge on spawn means sometimes you don't even need to tap a pair -- just spam the resource button and let the game merge for you when a spawn lands next to a match. The "Lucky merge!" toast and gem bonus actually *reward* mindless spawning.

The surge system also rewards mashing. Merge fast, build the surge meter, get bonus gems. The decay timer punishes *thinking* -- if you pause to consider your moves, the surge bar drops. The game is literally telling you: go faster, don't think.

**When do I think in merge games?** Here's what makes me slow down and plan in Merge Dragons:

1. **Space pressure.** My camp is crowded. I need to decide what to merge, what to sell, what to save. Every cell matters. Haven's 48-cell board is spacious enough that pressure rarely builds.

2. **3-merge vs 5-merge decisions.** In Merge Dragons, merging 3 gives you 1 result. Merging 5 gives you 2 results. This means I'm constantly asking "should I merge 3 now, or wait for 2 more to get the bonus?" That tension is the core of strategic merging. Haven's 2-merge minimum removes this entirely -- there's never a reason to wait for a bigger group unless you're chasing the 5+ bonus item.

3. **Chain planning across tiers.** In Merge Dragons, I might need 243 life flower sprouts to make one life tree. I'm mentally tracking "I need 3 more to make a flower, then 2 more flowers to get a nice flower." Haven's chains are the same structure but the 2-merge minimum halves the investment, so it's less engaging.

4. **Resource gating.** Merge Dragons puts valuable chains behind other chains (you need stone to build things that produce flowers). Haven's chains are independent -- any chain from any resource button at any time. There's no "I need stone to progress wood" dependency.

5. **Limited-time pressure.** Events in Merge Dragons give you a score to maximise in limited time. You HAVE to think about efficiency. Haven has no events.

**How to fix the mashing problem:**

The single most impactful change would be raising MIN_MERGE from 2 to 3. This instantly creates the "wait for 5?" decision, increases the planning depth of every move, and makes accidental merges less likely. It also makes the board more interesting because more items coexist at once.

Beyond that:
- Spawn placement near the tapped resource node (not random) would let players set up combos intentionally
- Chain reaction planning becomes more meaningful when you need 3-of-a-kind
- Cross-chain recipes could be the "thinking player's" mechanic if they were better surfaced -- planning which chains to progress in parallel to create hybrids is genuinely strategic

---

## 7. What Would Make Me Spend Money?

**Current IAP offerings review:**

- **Gem bundles ($0.99-$19.99):** Standard and fine. The value scaling is reasonable (100 gems for $0.99 up to 3,500 for $19.99).
- **Starter Pack ($1.99, marked down from $12.99):** 500 gems + 30 energy + rare egg. This is the right format. I'd buy this in a real game. Good impulse price point.
- **Piggy Bank ($2.99 to break):** Clever. Accumulates gems passively as you merge, then charges to collect. This is directly stolen from Coin Master and it works. I'd probably buy this once when it hits 200+ gems.
- **Haven Pass Premium ($7.99):** 40 tiers of enhanced rewards. Standard battle pass. Whether I buy this depends entirely on how engaged I am after a week. The rewards are mostly "more gems" which isn't exciting enough. I'd want exclusive creatures, unique cosmetics, or special power-ups on the premium track.
- **Rewarded ads (5-10 gems + 2 energy):** Yes, I'd watch these. The reward is appropriate for a ~30 second ad. I'd do 3-5 per session.
- **Biome eggs (250-900 gems):** These are interesting for creature collectors. The Celestial Egg at 900 gems is expensive enough to drive gem purchases. Smart.

**What's missing that would make me spend:**

1. **A "no energy" subscription.** $4.99/month for unlimited energy. This is the #1 thing I'd pay for in any energy-gated merge game. Merge Dragons doesn't offer this (they want you buying chalices individually), which is why I eventually churned from it.

2. **Exclusive creature cosmetics.** If my favourite creature could have a golden variant or a unique animation that only comes from the premium pass, I'd buy the pass for that alone.

3. **Board skins/themes.** A winter board, a garden board, a crystal cave board. $1.99 each. Cheap, cosmetic, no gameplay advantage. I'd collect these.

4. **"Second chance" undo for gems.** 5 gems to reverse your last merge. I'd use this constantly.

---

## 8. One Thing to Add That Would Transform the Game

**Playable island levels.**

Right now, the island is a passive unlock screen. You earn stars on the board, spend them on the map. There's no *reason* to be on the island.

What if each island node, when unlocked, revealed a small self-contained merge puzzle? A 4x4 grid with pre-placed items, a specific goal ("create a Plank using only these items"), and a star rating (1-3 stars based on moves used). This would:

1. **Give the island a reason to exist.** It's no longer just a rewards path -- it's content.
2. **Break up the infinite merge grind.** The main board is open-ended. Levels would be focused and finite. This alternation is exactly why Merge Dragons works -- camp for open merging, levels for structured challenges.
3. **Teach cross-chain recipes.** A level could pre-place a Wood tier-2 and a Flora tier-2 and ask you to "create a Vine." Players learn the mechanic through structured play.
4. **Create the "one more level" hook.** "I unlocked a new node, let me just play this one puzzle before bed" is the most powerful retention loop in mobile gaming.
5. **Give stars tangible meaning.** Right now stars are just a number that goes up. If each star is earned by completing a puzzle well, they feel *earned*.
6. **Surface the strategic depth that's already in the code.** Cross-chain recipes, power-up usage, and board management become real skills when you're solving a constrained puzzle instead of tapping random resources on an open board.

The code already supports everything needed: the grid system, merge logic, cross-chain recipes, and power-ups. A "level" is just a smaller grid with pre-set items and a win condition. The island infrastructure (regions, nodes, unlock costs) is already built as the progression framework.

This single feature would transform Haven from "a merge game with some interesting ideas" into "a merge game I'd actually play daily."

---

## Summary

| Category | Rating (out of 10) | Notes |
|----------|:-------------------:|-------|
| First impression | 5 | Clean but sterile. No emotional hook. |
| Core loop | 7 | Merging works. Surge and chains feel good. |
| Visual design | 3 | The UI chrome is nice. The actual items are unreadable. |
| Sound design | 9 | Procedural audio with material-specific tones and streak escalation. Outstanding for a prototype. |
| Depth / strategy | 5 | Cross-chain recipes and companions add depth, but MIN_MERGE=2 undermines it. |
| Retention | 4 | Worker income is the only next-day hook. No events, no daily rotation, no urgency. |
| Monetization | 6 | Reasonable offerings, nothing predatory. Missing a subscription tier. |
| Innovation | 8 | Cross-chain recipes, surge system, companion effects, procedural audio. Novel ideas. |
| Content volume | 7 | 184 creatures, 9 chains, 4 hybrids, 7 island regions. Lots of stuff. |
| Overall "would I keep playing?" | 5 | I'd give it 3 days. Without island levels or events, I'd drift back to Merge Dragons. |

**Bottom line:** Haven has a surprisingly sophisticated engine underneath a presentation that undersells it. The cross-chain recipe system is something I haven't seen in any merge game, and the procedural audio is legitimately best-in-class. But the game is fighting an uphill battle without proper art assets, and the MIN_MERGE=2 design decision saps the strategic tension that makes merge games addictive. Fix the art, raise the merge minimum to 3, add playable island puzzles, and this could compete. As-is, it's a promising tech demo that happens to be playable.
