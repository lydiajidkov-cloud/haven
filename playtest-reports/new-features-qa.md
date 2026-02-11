# Haven -- New Features QA Report

**Date:** 2026-02-11
**Tester:** Claude Opus 4.6 (automated code review)
**Scope:** Passive Collection Bonuses, Island Workers, Board Companions, Merge Streak Audio, Edge Cases

---

## 1. Passive Collection Bonuses

### 1.1 calculatePassiveBonuses logic

**Status: PASS**

`Creatures.calculatePassiveBonuses(discoveredMap)` in `creatures.js:312-329` correctly:
- Initializes all 5 bonus types to 0
- Iterates every creature in the full creature list
- Checks `discoveredMap[cr.id]` for each creature
- Accumulates `cr.abilityValue` into `bonuses[cr.ability]`
- Returns early with zeroed bonuses if `discoveredMap` is null/undefined

The ability assignment loop (`creatures.js:286-296`) assigns abilities deterministically using a 20-element cycle (`ABILITY_CYCLE`), and values scale by rarity (`RARITY_BONUS`). The distribution is 40% gem_bonus, 25% discovery, 20% energy_regen, 10% xp, 5% spawn -- which means spawn_quality will accumulate slowly and only from roughly 1-in-20 creatures. This seems intentional for balance but worth noting: a player with 40 creatures discovered might have only ~2 creatures contributing to spawn quality.

### 1.2 Wiring into game systems

| Bonus Type       | Location                  | Wired In? | Notes |
|------------------|---------------------------|-----------|-------|
| gem_bonus        | game.js:155-159            | YES       | Multiplies gem gains by `(1 + bonus/100)` |
| energy_regen     | game.js:109-110            | YES       | Subtracts `bonus * 250ms` from regen timer, clamped at 60s minimum |
| spawn_quality    | board.js:980-989           | YES       | Random roll against bonus %; upgrades spawned item +1 tier if not max |
| discovery_chance | hatchery.js:82-87          | YES       | Multiplies base discovery chance by `(1 + bonus/100)` |
| xp_bonus         | pass.js:77-83              | YES       | Multiplies XP amounts by `(1 + bonus/100)` |

All 5 bonus types are confirmed wired in.

### 1.3 Hatchery UI bonus summary

**Status: PASS**

`hatchery.js:228-241` renders a bonus summary panel at the top of the Hatchery collection view when the player has at least 1 discovered creature. It calls `Creatures.calculatePassiveBonuses(discovered)` and formats each non-zero bonus into a readable string with icons. The energy_regen bonus correctly shows the converted seconds value (raw * 0.25).

### 1.4 Issues Found

**BUG (Minor) -- energy_regen unit display inconsistency:**
In `creatures.js:270`, the ABILITY_LABELS for energy_regen show unit `'s'` (seconds). In the hatchery summary (`hatchery.js:236`), it displays `-Xs` which is correct. But in the creature detail modal (`hatchery.js:372`), it uses `Creatures.formatBonus()` which also shows `-Xs`. This is consistent. No bug here on closer inspection.

**DESIGN NOTE -- spawn_quality feels very rare:**
With only ~5% of the ABILITY_CYCLE being spawn_quality, and common creatures contributing just 0.5% each, a player would need to discover roughly 20 creatures before seeing even a ~5% chance of spawn upgrade. The feedback loop is very slow. Consider whether players will notice this bonus exists.

---

## 2. Island Workers

### 2.1 Creature assignment to nodes

**Status: PASS with one issue**

- `assignWorker(nodeIndex, creatureId)` in `island.js:531-538` correctly stores the creature ID and sets `lastCollected` to `Date.now()`.
- The worker assignment modal (`island.js:602-710`) shows all discovered creatures, excludes those already assigned to other nodes, and sorts by rarity (legendary first).
- Clicking a creature option calls `assignWorker()` and closes the modal.
- Only unlocked non-boss nodes can have workers assigned (the click handler at line 368 calls `showWorkerAssignModal` only for `unlocked` non-boss nodes).
- Workers are visually rendered on the roadmap as their creature emoji (`island.js:340-341`).

### 2.2 Offline income calculation

**Status: PASS**

`collectAllWorkerIncome()` (`island.js:546-589`):
- Correctly caps elapsed time at `MAX_OFFLINE_HOURS * 3600000` (12 hours = 43,200,000ms)
- Converts elapsed to hours and multiplies by rarity-based income rate
- Uses `Math.floor()` to avoid fractional gems
- Updates `lastCollected` for each worker that earned income
- Adds total gems via `Game.addGems()` and saves state
- Shows a toast notification for the player

Income rates per rarity: common=3, uncommon=8, rare=20, legendary=50 gems/hr. A legendary worker capped at 12 hours earns 600 gems -- significant but not game-breaking.

### 2.3 Auto-collect on init

**Status: PASS**

`init()` at `island.js:162` calls `collectAllWorkerIncome()` after loading worker state. This fires every time the app opens, correctly crediting offline earnings.

### 2.4 Worker/Companion mutual exclusion

**Status: PARTIAL -- one direction is missing**

The **companion modal** (`creatures.js:481-496`) correctly excludes workers:
- It calls `Island.getAssignedCreatureIds()` and filters those creatures out of the available list.

However, the **worker assignment modal** (`island.js:614-619`) does NOT exclude companions:
- It only checks `assignedIds` (which is `getAssignedCreatureIds()` -- other workers).
- It never checks `Creatures.isCreatureCompanion(c.id)`.

**BUG (Medium): A creature can be assigned as both a worker and a companion.** The companion side prevents assigning a worker as a companion, but the worker side does not prevent assigning a companion as a worker. If a player equips a companion first, then goes to the island and assigns that same creature as a worker, it will be in both roles simultaneously. This breaks the intended mutual exclusion.

**Fix:** Add a companion check in `showWorkerAssignModal()`:
```javascript
// After line 618, add:
if (typeof Creatures !== 'undefined' && Creatures.isCreatureCompanion(c.id)) continue;
```

---

## 3. Board Companions

### 3.1 Merge count tracking and trigger thresholds

**Status: PASS**

`onCompanionMerge()` (`creatures.js:399-429`):
- Iterates both slots (slot1, slot2)
- Increments `mergeCount` on each call
- Triggers when `mergeCount >= info.trigger`
- Resets count to 0 after triggering
- Saves state and re-renders the companion bar

Trigger thresholds are correctly defined in `COMPANION_LABELS`:
- Rare effects (auto_merge, free_spawn, energy_refund): trigger at 8 merges
- Legendary effects (upgrade_item, double_reward, surge_boost): trigger at 12 merges

### 3.2 Companion effect implementations

| Effect          | Implemented? | Quality | Notes |
|-----------------|-------------|---------|-------|
| auto_merge      | YES         | OK      | See edge case in section 5 |
| free_spawn      | YES         | GOOD    | Spawns tier 2 item from random chain; handles full board (see 5.1) |
| energy_refund   | YES         | GOOD    | Simple `Game.addEnergy(1)` |
| upgrade_item    | YES         | GOOD    | Picks random non-max-tier item; handles max tier (see 5.3) |
| double_reward   | YES         | OK      | Sets flag; consumed on next tier 4+ merge only |
| surge_boost     | YES         | GOOD    | Adds +40 to surge level; correctly activates surge if threshold met |

### 3.3 Companion bar rendering and updates

**Status: PASS**

`renderCompanionBar()` (`creatures.js:431-470`):
- Hides the bar (`display:none`) when no companions are equipped
- Shows the bar (`display:flex`) when at least one companion is equipped
- Renders each slot with the creature emoji, a circular SVG cooldown ring, and proper styling
- The cooldown ring fills proportionally based on `mergeCount / trigger`
- Gold color when full (100%), dim gold otherwise
- Called after every merge via `onCompanionMerge()` and after equip/unequip

The HTML structure in `index.html:55-58` matches what `renderCompanionBar()` expects (two `companion-slot` divs with `data-slot` attributes).

CSS in `style.css:908-964` provides proper styling: centered flex layout, 40px circular slots, dashed border for empty, solid purple border for filled, SVG cooldown overlay.

Click handlers are set up in `index.html:346-354` to open the companion modal.

### 3.4 double_reward consumption

**Status: PASS with design concern**

`isDoubleRewardActive()` (`creatures.js:386-392`) reads and clears the flag atomically, returning `true` only once. `board.js:827` checks this flag only for tier 4+ merges.

**DESIGN CONCERN:** If `double_reward` triggers and the next merge is tier 3 or below (which gives 0 gem reward), the flag persists and is consumed on the next tier 4+ merge. This is actually good -- the player doesn't "waste" the bonus on a low-tier merge. However, there's no visual indicator that double_reward is pending, which could confuse players. The toast appears when it triggers, but if many merges happen before the next tier 4+ merge, the player may forget.

---

## 4. Merge Streak Audio

### 4.1 Streak counter reset

**Status: PASS**

`playMerge()` (`audio.js:160-206`):
- Compares `Date.now()` against `lastMergeTime`
- If elapsed < `STREAK_WINDOW` (1500ms), increments `mergeStreak`
- Otherwise resets `mergeStreak` to 1
- Updates `lastMergeTime` after the check

The 1.5s window feels appropriate for a casual merge game -- fast enough to require active play but not so tight that normal merge speed breaks the streak.

### 4.2 Layer buildup at thresholds

| Streak | Layers Added | Description |
|--------|-------------|-------------|
| 1-2    | Base merge sound only | Material-specific sound plays |
| 3+     | Rising pentatonic note | Single note climbing the scale |
| 5+     | + Shimmer overtone | Note * 2 at 40% volume |
| 7+     | + Sparkle burst | Note * 1.5 triangle + noise burst |
| 10+    | + Chorus detune + cascade | Detuned pair + ascending scale walk |
| 15+    | + Bass pulse | Low octave triangle note |
| 20+    | + Staccato trill | Rapid alternating square wave notes |
| 25+    | + Harmonic wash | Wide chord (root + major third + fifth + octave) + noise swell |

Layers are additive -- at streak 25, the player hears: base merge sound + pentatonic note + shimmer + sparkle + chorus + cascade + bass + trill + wash. That is a LOT of simultaneous audio.

### 4.3 Audio clipping/distortion risk

**BUG (Medium-High): Risk of audio distortion at high streaks.**

At streak 25, a single `playStreakLayer()` call creates:
- 1 pentatonic note (vol ~0.41 capped at 0.24)
- 1 shimmer overtone (vol ~0.096)
- 1 sparkle note + 1 noise (vol ~0.072 + 0.02)
- 2 chorus detune notes (vol ~0.072 each)
- Up to 6 cascade notes (vol ~0.048 each)
- 1 bass pulse (vol ~0.084)
- 4 trill notes (vol ~0.029 each)
- 1 trill noise (vol 0.04)
- 4 wash notes (vol 0.036 + 0.029 + 0.024 + 0.019)
- 1 wash noise (vol 0.05)

That is approximately 20 oscillators + 3 noise sources from `playStreakLayer` alone, PLUS the base material merge sound (3-5 more oscillators). Total simultaneous oscillators: ~23-25.

The volume cap at 0.24 on the main note helps, but the additive volumes of all layers combined can approach or exceed 1.0, which causes clipping at `ctx.destination`. The Web Audio API does not automatically compress output.

**Recommendation:** Add a `DynamicsCompressorNode` between the gain nodes and `ctx.destination` to prevent clipping. Alternatively, insert a master gain node set to ~0.5 to leave headroom.

**Volume calculation at streak 25:**
- Vol cap on main note: 0.24
- All other sources sum to roughly: 0.096 + 0.072 + 0.02 + 0.144 + 0.288 + 0.084 + 0.116 + 0.04 + 0.108 + 0.05 = ~1.02
- Total peak: ~1.26 (clipping territory)

This is worst-case simultaneous, but many of these overlap in time, so real peak could be slightly lower due to different start times (staggered by 20-60ms). Still, clipping is likely at streaks above 15-20.

### 4.4 Streak scale design

**Status: GOOD**

The pentatonic scale across 3 octaves (523Hz to 3520Hz) is a smart choice -- pentatonic scales sound pleasing regardless of which notes are combined, so the layering always sounds musical. The varying cascade offsets (`(streak * 3) % 3`) prevent repetition, and the detuning creates natural chorusing. This is well-designed audio architecture.

---

## 5. Edge Cases & Bugs

### 5.1 Board full + companion free_spawn

**Status: HANDLED (silently)**

In `board.js:1473`, `free_spawn` calls `getRandomEmptyCell()`. If the board is full, it returns `null`, and the `if (freeEmpty)` check on line 1474 means the spawn simply doesn't happen.

**UX CONCERN:** The toast still shows "CreatureName: Free Spawn!" (line 1458) even though nothing spawns. The player sees the notification but gets nothing. This is mildly confusing.

**Recommendation:** Add an else clause that shows a different toast like "Board full -- free spawn lost!" or refund the merge count so the companion can try again later.

### 5.2 auto_merge can't find a matching pair

**Status: HANDLED (silently)**

In `board.js:1462`, `findRandomMatchingPair()` iterates the board looking for any connected cluster of size >= 2. If none exist, it returns `null`, and the `if (pair)` check means nothing happens.

**BUG (Minor):** In the auto_merge handler at line 1465, the null check is wrong:
```javascript
if (items[pair.from.row] && items[pair.from.col] !== undefined) {
```
This checks `items[pair.from.row]` (which is a row array -- always truthy) and `items[pair.from.col]` (which accesses the items array by column index as if it were a row -- wrong). The intent was likely:
```javascript
if (items[pair.from.row] && items[pair.from.row][pair.from.col]) {
```
However, because `items[pair.from.row]` is always an array (truthy) and `items[pair.from.col]` will also be an array if `pair.from.col < ROWS` (which it usually is, since ROWS=8 and COLS=6), this bug is **masked** -- the condition almost always passes when it should. But if `pair.from.col >= ROWS`, this could access an undefined row, though with COLS=6 and ROWS=8 this never happens in practice.

Still, this is incorrect code that works by coincidence. Should be fixed for clarity and correctness.

### 5.3 upgrade_item targets a max-tier item

**Status: HANDLED**

In `board.js:1494-1508`, the `upgrade_item` handler pre-filters candidates to only those where `item.tier < maxTier`. Max-tier items are excluded from the target pool. If the pool is empty (all items are max tier), nothing happens.

Additionally, the `upgradeItem()` function itself (`board.js:1334-1366`) has a fallback: if the item is already max tier, it gives a celebration + 10 gems + 1 star instead. This is a nice safety net, though the companion handler shouldn't ever reach it due to the pre-filter.

### 5.4 Worker creature deleted/undiscovered

**Status: PARTIALLY HANDLED**

Workers are stored by `creatureId` in `island.workers`. If a game reset occurs, the `discovered` map is cleared but `workers` are stored as part of `state.island`. On reload:

1. `collectAllWorkerIncome()` (`island.js:557`) calls `Creatures.getCreatureById(worker.creatureId)` which does a lookup in the static creature map. Since creature data is hardcoded (not based on discovery state), this will always return a valid creature object. The worker will continue earning income even if "undiscovered."

2. The **roadmap rendering** (`island.js:341`) also looks up the creature by ID and shows its emoji. This will work fine regardless of discovery state.

3. However, a full game reset (`localStorage.removeItem('haven_save')`) followed by `location.reload()` wipes all state including workers, so this is a non-issue for resets.

**DESIGN QUESTION:** Should workers be automatically removed if a creature becomes unavailable (e.g., through some future "release creature" feature)? Currently there's no such mechanism, so this is not a real bug.

### 5.5 Additional edge case: double_reward flag persistence across saves

**BUG (Minor):** `doubleRewardActive` is a module-level variable in `creatures.js:349`, NOT saved to game state. If the player closes the app after `double_reward` triggers but before the next tier 4+ merge, the flag is lost on reload. The bonus is wasted silently.

**Recommendation:** Either save `doubleRewardActive` to game state, or consider this acceptable given it's a small bonus.

### 5.6 Additional edge case: companion bar not shown on first equip from empty

**Status: PASS** -- The bar starts with `style="display:none"` in HTML. When `equipCompanion()` is called, it calls `renderCompanionBar()` which checks `hasAny` and sets `display:flex`. This works correctly.

### 5.7 Additional edge case: equipping same creature in both companion slots

**Status: HANDLED** -- In `showCompanionModal()` (`creatures.js:487`), the code checks `otherCompId` and filters out the creature in the other slot from the available list. A creature cannot be in both slots simultaneously.

---

## 6. Summary Table

| Feature | Status | Bugs Found | Severity |
|---------|--------|------------|----------|
| Passive Bonuses -- calculation | PASS | 0 | -- |
| Passive Bonuses -- wiring (5 types) | PASS | 0 | -- |
| Passive Bonuses -- hatchery UI | PASS | 0 | -- |
| Island Workers -- assignment | PASS | 0 | -- |
| Island Workers -- offline income | PASS | 0 | -- |
| Island Workers -- auto-collect | PASS | 0 | -- |
| Island Workers -- mutual exclusion | PARTIAL | 1 | Medium |
| Board Companions -- merge tracking | PASS | 0 | -- |
| Board Companions -- 6 effects | PASS | 1 (minor code) | Low |
| Board Companions -- bar render | PASS | 0 | -- |
| Board Companions -- double_reward | PASS | 1 (not persisted) | Low |
| Merge Streak Audio -- reset | PASS | 0 | -- |
| Merge Streak Audio -- layers | PASS | 0 | -- |
| Merge Streak Audio -- clipping | FAIL | 1 | Medium-High |
| Edge: full board + free_spawn | OK | 0 (UX concern) | Low |
| Edge: auto_merge no pair | OK | 1 (wrong check) | Low |
| Edge: upgrade max-tier | PASS | 0 | -- |
| Edge: deleted worker creature | OK | 0 | -- |

---

## 7. Prioritized Bug List

### P1 -- Fix Before Release

1. **Audio clipping at high merge streaks (15+)**
   - File: `C:\Users\lydia\Documents\Claude\haven\js\audio.js`
   - Problem: ~25 simultaneous oscillators with combined volume exceeding 1.0
   - Fix: Add a `DynamicsCompressorNode` or master gain node (~0.4-0.5) before `ctx.destination`

2. **Worker/companion mutual exclusion is one-directional**
   - File: `C:\Users\lydia\Documents\Claude\haven\js\island.js`, line ~618
   - Problem: Worker modal doesn't exclude companions; creature can be both
   - Fix: Add `if (Creatures.isCreatureCompanion(c.id)) continue;` to the worker available list filter

### P2 -- Fix Soon

3. **auto_merge stale reference check is wrong**
   - File: `C:\Users\lydia\Documents\Claude\haven\js\board.js`, line 1465
   - Problem: `items[pair.from.col]` should be `items[pair.from.row][pair.from.col]`
   - Fix: Change to `if (items[pair.from.row] && items[pair.from.row][pair.from.col]) {`

4. **double_reward flag not persisted across app close**
   - File: `C:\Users\lydia\Documents\Claude\haven\js\creatures.js`, line 349
   - Problem: Module variable lost on reload; player silently loses pending bonus
   - Fix: Save/load `doubleRewardActive` in companion state

### P3 -- Polish

5. **free_spawn on full board shows misleading toast**
   - File: `C:\Users\lydia\Documents\Claude\haven\js\board.js`, line 1472-1487
   - Fix: Add "Board full!" feedback or defer the trigger

6. **No visual indicator for pending double_reward**
   - The companion bar shows merge progress but not the pending "2x next merge" state
   - Fix: Add a small "2x" badge on the companion slot or the board when active

---

## 8. UX Feel Assessment

### What Feels Good
- **Companion cooldown ring** is an elegant, non-intrusive progress indicator that gives satisfying visual feedback as you approach a trigger.
- **Material-specific merge sounds** with the streak layering system create a genuinely enjoyable audio landscape. The pentatonic scale choice means it always sounds musical.
- **Worker income toast on app open** is a great "welcome back" moment that rewards returning players.
- **Passive bonus summary in hatchery** directly ties creature collection to tangible gameplay benefits, making discovery feel rewarding beyond completionism.

### What Could Feel Better
- **Companion trigger effects are easy to miss.** During fast merging, the toast for "Auto Merge!" or "Free Spawn!" competes with merge animations and floating text. Consider a brief full-screen flash or a distinct sound effect for companion triggers to make them feel special.
- **Spawn quality bonus is nearly invisible.** At typical early-game discovery counts, the chance is so low (<5%) that players won't feel it. Consider either increasing the spawn_quality weight in ABILITY_CYCLE or adding a visual indicator when a spawn IS upgraded ("spawn quality!" floating text).
- **Worker income has no ongoing feedback.** Once assigned, workers silently earn gems with no in-game visibility until the next app open. A small per-hour notification or a "gems earned" counter on the node would help players feel the value.
- **The 1.5s streak window is generous** -- this feels right for casual mobile play. Players should be able to build and maintain streaks during normal gameplay, which keeps the audio experience rewarding.
