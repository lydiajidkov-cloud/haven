# Achievement System — Integration Guide

Three changes needed in `index.html` to wire everything up.

---

## 1. Add the CSS link

In the `<head>`, after the existing stylesheet links, add:

```html
<link rel="stylesheet" href="css/achievements.css">
```

Place it after `<link rel="stylesheet" href="css/shop.css">` (line 14).

---

## 2. Add the trophy button + achievements script tag

### 2a. Trophy button in the top bar

In the `<header id="top-bar">`, find the `<div>` that wraps the gems display and settings button (around line 26):

```html
<div style="display:flex;align-items:center;gap:6px;">
```

Add the trophy button **before** the settings gear button, inside that same div:

```html
<button id="achievements-btn" title="Achievements">
    🏆
    <span id="achievements-badge" class="hidden">0</span>
</button>
```

The full div should then look like:

```html
<div style="display:flex;align-items:center;gap:6px;">
    <div id="gems-display">
        <span class="gems-icon">💎</span>
        <span id="gems-count">50</span>
    </div>
    <button id="achievements-btn" title="Achievements">
        🏆
        <span id="achievements-badge" class="hidden">0</span>
    </button>
    <button id="settings-btn" class="settings-gear" title="Settings">⚙️</button>
</div>
```

### 2b. Script tag

Add the achievements script **after** `quests.js` and **before** `island.js` in the script loading order (around line 188). It needs Game, Items, and Quests to exist, and must load before Island/Creatures/Orders are initialized:

```html
<script src="js/achievements.js"></script>
```

Recommended position in the script list:

```html
<script src="js/orders.js"></script>
<script src="js/quests.js"></script>
<script src="js/achievements.js"></script>   <!-- ADD HERE -->
<script src="js/island.js"></script>
<script src="js/creatures.js"></script>
```

---

## 3. Add the init call

In the inline `<script>` initialization block (around line 207), add `Achievements.init();` **after** all other systems have initialized, but before the UI bindings. The best position is right after `Daily.init();`:

```javascript
// Init core systems
Game.init();
Board.init();
PowerUps.init();
Orders.init();
Quests.init();
Island.init();
Hatchery.init();
Creatures.initCompanions();
Shop.init();
Pass.init();
Daily.init();
Achievements.init();    // <── ADD THIS LINE
```

---

## Summary of files

| File | Action |
|------|--------|
| `js/achievements.js` | NEW — Achievement system IIFE module |
| `css/achievements.css` | NEW — Styles for modal, cards, toast, button |
| `index.html` | EDIT — Add CSS link, trophy button, script tag, init call |

---

## How it works

- **50 achievements** across 9 categories (Merge Mastery, Tier Climber, Chain Champion, Hybrid Explorer, Creature Collector, Island Restorer, Order Fulfiller, Economy, Streak)
- Listens to existing Game events: `mergeCompleted`, `itemProduced`, `chainReaction`, `crossChainMerge`, `creatureDiscovered`, `orderCompleted`, `questCompleted`, `gemsChanged`
- On first load, syncs progress from existing stats (totalMerges, highestTier, chainRecord, etc.) so existing players get credit
- Progress counters stored in `state.achievements.progress`
- Unlocked achievements never re-lock
- Toast notification on unlock, claim button in the panel for gem + star rewards
- Red badge on trophy button shows unclaimed achievement count
- Rewards range from 10-200 gems and 1-10 stars
