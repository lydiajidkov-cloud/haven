# Haven Sound Integration Guide

Where to wire each new sound into the codebase. **Do NOT modify any JS files** until reviewing this guide.

All line numbers refer to the files as they exist before any integration changes.

---

## 1. playPurchase()

**Purpose:** Ka-ching when spending gems in the shop.

### File: `js/shop.js`

**Location 1 — Gem purchases (line 109)**
Replace `Sound.playCelebration();` with `Sound.playPurchase();`
```js
// Current (line 109):
Sound.playCelebration();

// Change to:
Sound.playPurchase();
```

**Location 2 — Simulated IAP purchases (line 126)**
Replace `Sound.playCelebration();` with `Sound.playPurchase();`
```js
// Current (line 126):
Sound.playCelebration();

// Change to:
Sound.playPurchase();
```

**Location 3 — Starter pack purchase (line 147)**
Replace `Sound.playCelebration();` with `Sound.playPurchase();`
```js
// Current (line 147):
Sound.playCelebration();

// Change to:
Sound.playPurchase();
```

**Location 4 — Piggy bank break (line 161)**
Replace `Sound.playCelebration();` with `Sound.playPurchase();`
```js
// Current (line 161):
Sound.playCelebration();

// Change to:
Sound.playPurchase();
```

**Location 5 — Rewarded ad completion (line 176)**
Keep `Sound.playCelebration();` here. Ads are free rewards, not purchases. No change needed.

---

## 2. playOrderDeliver()

**Purpose:** Warm two-note chime when an item is successfully delivered to an order slot.

### File: `js/orders.js`

**Location — Inside `deliverItem()`, after `req.delivered++` but before the allDone check (line ~133)**
Add `Sound.playOrderDeliver();` after the delivery increment. Currently there is no sound for individual deliveries (only for completion). Insert after line 133:
```js
// After line 133 (req.delivered++):
req.delivered++;
Sound.playOrderDeliver();  // ADD THIS LINE
```

---

## 3. playOrderComplete()

**Purpose:** Triumphant fanfare when all requirements of an order are fulfilled.

### File: `js/orders.js`

**Location — Inside `deliverItem()`, when allDone is true (line 146)**
Replace `Sound.playCelebration();` with `Sound.playOrderComplete();`
```js
// Current (line 146):
Sound.playCelebration();

// Change to:
Sound.playOrderComplete();
```

---

## 4. playWorkerAssign()

**Purpose:** Gentle placement sound when assigning a creature as a worker on an island node.

### File: `js/island.js`

**Location — Inside `showWorkerAssignModal()`, the worker-option click handler (line ~706)**
Replace `Sound.playCelebration();` with `Sound.playWorkerAssign();`
```js
// Current (line 706):
Sound.playCelebration();

// Change to:
Sound.playWorkerAssign();
```

---

## 5. playWorkerCollect()

**Purpose:** Coins/gems collecting sound when worker income is awarded.

### File: `js/island.js`

**Location — Inside `collectAllWorkerIncome()`, after totalGems > 0 check (line ~571)**
Add `Sound.playWorkerCollect();` just after `Game.addGems(totalGems);`:
```js
// After line 571 (Game.addGems(totalGems)):
Game.addGems(totalGems);
Sound.playWorkerCollect();  // ADD THIS LINE
saveIslandState();
```

---

## 6. playCompanionEquip()

**Purpose:** Magical equip sound when a creature is equipped in a companion slot.

### File: `js/creatures.js`

**Location — Inside `showCompanionModal()`, the comp-option click handler (line ~567)**
Replace `Sound.playCelebration();` with `Sound.playCompanionEquip();`
```js
// Current (line 567):
Sound.playCelebration();

// Change to:
Sound.playCompanionEquip();
```

---

## 7. playCompanionTrigger()

**Purpose:** Punchy effect when a companion's ability triggers during merge.

### File: `js/board.js`

**Location — Inside the companion trigger loop, after `executeCompanionEffect()` is called (line ~854)**
Add `Sound.playCompanionTrigger();` inside the loop, after `executeCompanionEffect`:
```js
// Current (line 853-854):
var companionTriggers = Creatures.onCompanionMerge();
for (var ct = 0; ct < companionTriggers.length; ct++) {
    executeCompanionEffect(companionTriggers[ct]);
}

// Change to:
var companionTriggers = Creatures.onCompanionMerge();
for (var ct = 0; ct < companionTriggers.length; ct++) {
    executeCompanionEffect(companionTriggers[ct]);
    Sound.playCompanionTrigger();  // ADD THIS LINE
}
```

---

## 8. playCreatureDiscover()

**Purpose:** Exciting discovery sound when a new creature is found.

### File: `js/hatchery.js`

**Location — Inside `showDiscoveryModal()` (line 184)**
Replace `Sound.playCelebration();` with `Sound.playCreatureDiscover();`
```js
// Current (line 184):
Sound.playCelebration();

// Change to:
Sound.playCreatureDiscover();
```

### File: `js/shop.js`

**Location — Inside `discoverBiomeCreature()` (line 203)**
Replace `Sound.playCelebration();` with `Sound.playCreatureDiscover();`
```js
// Current (line 203):
Sound.playCelebration();

// Change to:
Sound.playCreatureDiscover();
```

---

## 9. playNavSwitch()

**Purpose:** Subtle click/swoosh for navigation tab switches.

### File: `index.html`

**Location 1 — Bottom nav buttons (line 292)**
Replace `Sound.playTap();` with `Sound.playNavSwitch();`
```js
// Current (line 292):
Sound.playTap();

// Change to:
Sound.playNavSwitch();
```

**Location 2 — Shop tabs (line 310)**
Replace `Sound.playTap();` with `Sound.playNavSwitch();`
```js
// Current (line 310):
Sound.playTap();

// Change to:
Sound.playNavSwitch();
```

**Location 3 — Island tabs (line 329)**
Replace `Sound.playTap();` with `Sound.playNavSwitch();`
```js
// Current (line 329):
Sound.playTap();

// Change to:
Sound.playNavSwitch();
```

---

## 10. playAchievement()

**Purpose:** Achievement/quest reward fanfare.

### File: `js/quests.js`

**Location — Inside `claimQuest()` (line 245)**
Replace `Sound.playCelebration();` with `Sound.playAchievement();`
```js
// Current (line 245):
Sound.playCelebration();

// Change to:
Sound.playAchievement();
```

### File: `js/events.js`

**Location — Inside event tier claim handler (line 552)**
Replace `Sound.playCelebration();` with `Sound.playAchievement();`
```js
// Current (line 552):
if (typeof Sound !== 'undefined') Sound.playCelebration();

// Change to:
if (typeof Sound !== 'undefined') Sound.playAchievement();
```

---

## 11. playOrderClaim()

**Purpose:** Satisfying collect sound when claiming a completed order's rewards.

### File: `js/orders.js`

**Location — Inside `claimOrder()` (line 187)**
Replace `Sound.playCelebration();` with `Sound.playOrderClaim();`
```js
// Current (line 187):
Sound.playCelebration();

// Change to:
Sound.playOrderClaim();
```

---

## 12. playStreakMilestone(level)

**Purpose:** Extra audio punch at streak milestones (5, 10, 15, 20, 25) during merge streaks.

### File: `js/audio.js` (internal wiring)

**Location — Inside `playMerge()`, after the streak layer call (line ~217-219)**
Add milestone check after the streak layer:
```js
// Current (lines 217-219):
if (mergeStreak >= 3) {
    playStreakLayer(mergeStreak);
}

// Change to:
if (mergeStreak >= 3) {
    playStreakLayer(mergeStreak);
}
// Milestone punctuation at 5, 10, 15, 20, 25
if (mergeStreak > 0 && mergeStreak % 5 === 0) {
    playStreakMilestone(mergeStreak);
}
```

---

## Summary Table

| Sound | Replaces | File(s) | Function |
|---|---|---|---|
| `playPurchase()` | `playCelebration()` | shop.js | `purchaseItem`, `simulatePurchase`, `purchaseStarterPack`, `breakPiggyBank` |
| `playOrderDeliver()` | (new — no sound before) | orders.js | `deliverItem` |
| `playOrderComplete()` | `playCelebration()` | orders.js | `deliverItem` (allDone branch) |
| `playWorkerAssign()` | `playCelebration()` | island.js | `showWorkerAssignModal` click handler |
| `playWorkerCollect()` | (new — no sound before) | island.js | `collectAllWorkerIncome` |
| `playCompanionEquip()` | `playCelebration()` | creatures.js | `showCompanionModal` click handler |
| `playCompanionTrigger()` | (new — no sound before) | board.js | companion trigger loop |
| `playCreatureDiscover()` | `playCelebration()` | hatchery.js, shop.js | `showDiscoveryModal`, `discoverBiomeCreature` |
| `playNavSwitch()` | `playTap()` | index.html | bottom nav, shop tabs, island tabs |
| `playAchievement()` | `playCelebration()` | quests.js, events.js | `claimQuest`, event tier claim |
| `playOrderClaim()` | `playCelebration()` | orders.js | `claimOrder` |
| `playStreakMilestone()` | (new — internal to audio.js) | audio.js | `playMerge` |

---

## Sounds That Should Keep playCelebration()

These existing call sites should NOT be changed — they are appropriate uses of the general celebration:

- `js/island.js` line 189, 219 — Node unlock / skip (island progression)
- `js/board.js` line 775, 827 — High-tier merge celebration, surge activation
- `js/board.js` line 1355 — Cross-chain recipe first discovery
- `js/daily.js` line 126 — Daily login reward claim
- `js/pass.js` line 142, 151 — Battle pass reward claims

## Sounds That Should Keep playTap()

These existing call sites should NOT be changed:

- All `Sound.playTap()` calls in `board.js` — board cell interactions
- `Sound.playTap()` in order card click (orders.js line 300) — entering delivery mode
- `Sound.playTap()` in island node clicks (island.js line 374) — generic node taps
- `Sound.playTap()` in hatchery biome toggle (hatchery.js line 276) — accordion toggle
- `Sound.playTap()` in modal close/detail views — informational taps
- `Sound.playTap()` in events.js, recipes.js, tutorial.js, welcome.js — UI interaction taps
