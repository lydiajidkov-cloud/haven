# Events System — Integration Guide

This document describes the HTML and init changes needed to wire up the weekly events system.

---

## 1. Add CSS link to `index.html`

In the `<head>`, add the events stylesheet after the existing CSS links:

```html
<link rel="stylesheet" href="css/events.css">
```

Insert it after `<link rel="stylesheet" href="css/shop.css">` (line 14), so it becomes:

```html
<link rel="stylesheet" href="css/shop.css">
<link rel="stylesheet" href="css/events.css">
```

---

## 2. Add script tag to `index.html`

Add the events script **after `quests.js`** and **before `island.js`** in the script loading order. The events module depends on `Game` (for state, events, save) and is referenced by `Board` (for modifier queries), so it must load after `game.js` but before systems that might check event modifiers.

Insert after line 188 (`<script src="js/quests.js"></script>`):

```html
<script src="js/events.js"></script>
```

The full script block becomes:
```html
<script src="js/items.js"></script>
<script src="js/audio.js"></script>
<script src="js/particles.js"></script>
<script src="js/game.js"></script>
<script src="js/powerups.js"></script>
<script src="js/board.js"></script>
<script src="js/orders.js"></script>
<script src="js/quests.js"></script>
<script src="js/events.js"></script>     <!-- NEW -->
<script src="js/island.js"></script>
<script src="js/creatures.js"></script>
<script src="js/hatchery.js"></script>
<script src="js/shop.js"></script>
<script src="js/pass.js"></script>
<script src="js/daily.js"></script>
<script src="js/tutorial.js"></script>
```

---

## 3. Add `Events.init()` to the initialization block

In the inline `<script>` at the bottom of `index.html`, add `Events.init()` after `Quests.init()`:

```javascript
Game.init();
Board.init();
PowerUps.init();
Orders.init();
Quests.init();
Events.init();          // NEW
Island.init();
Hatchery.init();
Creatures.initCompanions();
Shop.init();
Pass.init();
Daily.init();
```

---

## 4. Emit `energyUsed` event from `Game.useEnergy()`

The "Speed Demon" event tracks energy usage. The existing `useEnergy()` function in `game.js` does not emit a game event, so add one.

In `game.js`, inside the `useEnergy()` function, after `emit('energyChanged', state.energy);` add:

```javascript
emit('energyUsed', {});
```

So the function becomes:
```javascript
function useEnergy() {
    if (state.energy <= 0) {
        emit('energyEmpty');
        return false;
    }
    state.energy--;
    if (state.energy === state.maxEnergy - 1) {
        state.lastEnergyTime = Date.now();
    }
    emit('energyChanged', state.energy);
    emit('energyUsed', {});          // NEW — for event tracking
    save();
    return true;
}
```

---

## 5. Hook modifiers into game systems (optional, for full modifier effect)

The events module exposes modifier queries that other systems can call. Below are the integration points for each modifier type. These are all **optional enhancements** — the challenge tracking works without them, but these make the event bonuses actually affect gameplay.

### 5a. Crystal Rush — gem multiplier on crystal merges

In `board.js`, in the `executeMerge` function, where gem rewards are calculated for high tiers (around the `if (nextTier >= 4)` block), wrap the gem reward:

```javascript
// After calculating gemReward
if (typeof Events !== 'undefined' && Events.hasModifier('gem_multiplier', chain)) {
    gemReward *= Events.getModifierValue('gem_multiplier', chain);
}
```

### 5b. Timber Time — wood spawns 1 tier higher

In `board.js`, in the `spawnItem` function, after the item is created via `Items.spawnRandomItem(chain)`, add:

```javascript
if (typeof Events !== 'undefined' && Events.hasModifier('spawn_tier_boost', chain)) {
    var boost = Events.getModifierValue('spawn_tier_boost', chain);
    var maxT = Items.getMaxTier(chain);
    if (item.tier + boost <= maxT) {
        item.tier += boost;
    }
}
```

### 5c. Stone Surge — surge meter fills 2x for stone merges

In `board.js`, in the `feedSurge` function (or where `SURGE_PER_MERGE` is used), conditionally double it:

```javascript
var surgeGain = SURGE_PER_MERGE;
// Check for event modifier (called from executeMerge, so chain is in scope via closure)
if (typeof Events !== 'undefined' && Events.hasModifier('surge_boost', 'stone')) {
    // Only boost if the merge involves stone — need to pass chain context
    surgeGain *= Events.getModifierValue('surge_boost', 'stone');
}
surgeLevel = Math.min(100, surgeLevel + surgeGain);
```

Note: `feedSurge` doesn't currently receive the chain. You'd need to add a parameter: `feedSurge(chain)` and pass it from `executeMerge`.

### 5d. Speed Demon — energy regens 2x faster

In `game.js`, in the `updateEnergy` function, where `regenMs` is calculated, add:

```javascript
if (typeof Events !== 'undefined' && Events.hasModifier('energy_regen_multiplier')) {
    regenMs = Math.round(regenMs / Events.getModifierValue('energy_regen_multiplier'));
}
```

### 5e. Chain Master — cross-chain rewards 3x

In `board.js`, in `executeCrossChainMerge`, where surge gems are awarded, add a multiplier:

```javascript
if (surgeActive) {
    var ccGems = 1;
    if (typeof Events !== 'undefined' && Events.hasModifier('crosschain_reward_multiplier')) {
        ccGems *= Events.getModifierValue('crosschain_reward_multiplier');
    }
    Game.addGems(ccGems);
}
```

### 5f. Merge Mania — MIN_MERGE reduced to 2

This event's value is already 2, and `Board.MIN_MERGE` is already 2. If `MIN_MERGE` were higher in the future, you'd add:

```javascript
function getEffectiveMinMerge() {
    if (typeof Events !== 'undefined' && Events.hasModifier('min_merge_override')) {
        return Events.getModifierValue('min_merge_override');
    }
    return MIN_MERGE;
}
```

And replace `MIN_MERGE` references in merge logic with `getEffectiveMinMerge()`.

### 5g. Discovery Week — creature discovery doubled

In the creature/hatchery discovery logic, when calculating discovery chance:

```javascript
if (typeof Events !== 'undefined' && Events.hasModifier('discovery_boost', 'creature')) {
    discoveryChance *= Events.getModifierValue('discovery_boost', 'creature');
}
```

---

## 6. Save data structure

The events system stores its state under `Game.getState().weeklyEvent`:

```javascript
{
    eventId: 'crystal_rush',      // Current event ID
    weekNumber: 108,               // Week number since epoch
    progress: 73,                  // Cumulative progress toward challenges
    claimed: {
        bronze: true,
        silver: false,
        gold: false
    }
}
```

This resets automatically when the week number changes (new event starts).

---

## Summary of files changed

| File | Change |
|------|--------|
| `index.html` | Add `<link>` for `css/events.css`, add `<script>` for `js/events.js`, add `Events.init()` |
| `js/game.js` | Add `emit('energyUsed', {})` in `useEnergy()` |
| `js/board.js` | (Optional) Hook modifier checks into merge/spawn/surge logic |
| `js/events.js` | **New file** — full weekly event system |
| `css/events.css` | **New file** — event banner and modal styles |
