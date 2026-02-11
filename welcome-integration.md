# Welcome Back Screen - Integration Guide

## Files Created

| File | Purpose |
|------|---------|
| `js/welcome.js` | Welcome-back overlay logic (IIFE module, self-contained) |
| `css/welcome.css` | All styles for the overlay, animations, countdown |

## Changes Needed in `index.html`

### 1. Add the CSS link (in `<head>`, after the existing stylesheets)

Add this line after `<link rel="stylesheet" href="css/shop.css">`:

```html
<link rel="stylesheet" href="css/welcome.css">
```

### 2. Add the script tag (in the script section, after creatures.js)

Add this line after `<script src="js/creatures.js"></script>`:

```html
<script src="js/welcome.js"></script>
```

**Why after creatures.js?** The welcome module reads creature data and passive bonuses from the `Creatures` module, and worker data from `Island` -- both must be loaded first.

### 3. Call `Welcome.init()` in the initialization block

In the inline `<script>` at the bottom of index.html, add `Welcome.init()` **after** all the core systems have initialized but **before** the UI bindings and tutorial. Specifically, add it right after the existing init calls:

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

Welcome.init();   // <── ADD THIS LINE
```

## How It Works

### Flow

1. `Game.init()` runs first -- loads state, runs `updateEnergy()` to regen energy
2. `Island.init()` runs -- calls `collectAllWorkerIncome()` which adds gems and shows a toast
3. `Welcome.init()` runs:
   - Patches `Game.save()` to always update `state.lastSeen`
   - Adds a `visibilitychange` listener to save `lastSeen` when the tab is hidden
   - Checks `state.lastSeen` vs `Date.now()`
   - If gap > 5 minutes: calculates offline data and shows the overlay
   - If first play (no `lastSeen`): just sets the timestamp and skips

### What the overlay shows

- **Time away**: "You were gone for 3h 24m"
- **Worker income**: Animated gem countup with worker creature emoji row
- **Energy**: Shows before -> after transition (or "Full!" if already at max)
- **Passive bonuses**: Pill badges showing creature bonuses (gem%, discovery%, etc.)
- **Collect & Play button**: Dismisses the overlay

### Auto-dismiss

- A thin countdown bar beneath the button shrinks over 10 seconds
- After 10 seconds, the overlay auto-dismisses with an exit animation
- Tapping the button or the backdrop dismisses immediately

### Data accuracy note

The welcome screen **displays** what was earned but does not **perform** the collection. The actual income collection happens in `Island.init() -> collectAllWorkerIncome()` and `Game.init() -> updateEnergy()`, which both run before `Welcome.init()`. The welcome screen calculates the same values using the pre-collection timestamps to show accurate numbers.

### Island.js toast overlap

`Island.collectAllWorkerIncome()` shows a toast notification ("Your workers earned X gems while you were away!"). When the welcome overlay is visible, this toast will appear behind it and auto-dismiss before the welcome screen closes. If you want to suppress the toast when the welcome screen is showing, you could add a flag check, but it's not strictly necessary since the overlay covers it.

## State Changes

### New field in game state: `lastSeen`

- Type: `number` (Unix timestamp in milliseconds)
- Saved on every `Game.save()` call (via the patched save function)
- Also saved on `visibilitychange` (when tab/app is hidden)
- Used to calculate time away on next init

### No other state changes

The module is fully self-contained. It reads from existing state (`island.workers`, `hatchery.discovered`, `energy`, `lastEnergyTime`) but only writes `lastSeen`.

## Dependencies

| Module | What it reads |
|--------|---------------|
| `Game` | `getState()`, `getMaxEnergy()`, `ENERGY_REGEN_MS`, `save()` |
| `Creatures` | `getCreatureById()`, `calculatePassiveBonuses()` |
| `Island` | `state.island.workers` (read directly from game state) |
| `Sound` | `playTap()` (optional, checks existence) |

## Customization

| Constant | Default | Description |
|----------|---------|-------------|
| `MIN_AWAY_MS` | 5 minutes | Minimum away time to trigger the welcome screen |
| `MAX_OFFLINE_HOURS` | 12 hours | Cap on offline worker earnings |
| `AUTO_DISMISS_MS` | 10 seconds | Time before auto-dismiss |
| `COUNTUP_DURATION_MS` | 1.5 seconds | Animated number countup duration |
