# Tutorial Integration Guide

## Changes needed in `index.html`

### 1. Add the tutorial CSS stylesheet

In the `<head>` section, add this line **after** the existing stylesheets:

```html
<link rel="stylesheet" href="css/tutorial.css">
```

So the full stylesheet block becomes:

```html
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/animations.css">
<link rel="stylesheet" href="css/island.css">
<link rel="stylesheet" href="css/shop.css">
<link rel="stylesheet" href="css/tutorial.css">
```

### 2. That's it

No other changes are needed. The tutorial JS file is already loaded via `<script src="js/tutorial.js"></script>` and `Tutorial.start()` is already called in the initialization block. The new tutorial.js is a drop-in replacement that uses the same public API (`Tutorial.start()`).

## What changed

### `js/tutorial.js` (rewritten)
- **Story intro**: 3-screen narrative overlay before any gameplay ("paradise... storm... you restore it")
- **10 guided steps** instead of 6, covering spawning, merging, orders, island navigation, and quests
- **Skip button** present on every screen (top-right corner, subtle styling)
- **Step counter** shown in tooltips (e.g., "3/10") and cards ("Step 3 of 10")
- **Setup functions** per step to control board state (forced tiers, auto-merge suppression)
- **Event-based progression**: each spotlight step listens for a specific game event to advance
- **Arrow pointers** on tooltips (CSS pseudo-elements) pointing toward the highlighted element
- **Tutorial state saved**: sets `firstPlay = false` on completion, same as before

### `css/tutorial.css` (new file)
- Story intro screen styling (themed gradients, floating symbol animation, progress dots)
- Tooltip arrow pointers (above and below variants via `::before`/`::after`)
- Step indicator styling inside card overlays
- Skip button styling (top-right, subtle, doesn't distract)
- Glow animations for nav buttons and orders panel during their tutorial steps

### Existing styles preserved
All existing tutorial CSS in `style.css` (`.tut-overlay`, `.tut-spotlight`, `.tut-card`, `.tut-btn`, `.tut-tooltip`, `.tut-lifted`, `.tut-glow`) remains unchanged and is still used by the new tutorial. The new `tutorial.css` only adds new classes that layer on top.

## How the tutorial flows

1. **Story screen 1**: "This island was once a paradise..." (island emoji, green gradient)
2. **Story screen 2**: "A great storm scattered its magic..." (lightning emoji, dark purple gradient)
3. **Story screen 3**: "Only you can restore it." (sparkles emoji, blue-green gradient)
4. **Step 1**: Spotlight on Wood node -- "Tap the Wood button to spawn a twig!"
5. **Step 2**: Spotlight on Wood node -- "Tap Wood again"
6. **Step 3**: Spotlight on board -- "Tap one twig, then tap the other to merge!"
7. **Step 4**: Card -- "Nice Merge!" celebration
8. **Step 5**: Spotlight on all resource nodes -- "Try spawning more and merging again"
9. **Step 6**: Spotlight on orders panel -- "See the orders? Tap an order!"
10. **Step 7**: Card -- explains delivery mode and chain bonuses
11. **Step 8**: Spotlight on Island nav -- "Explore the Island tab"
12. **Step 9**: Spotlight on Quests nav -- "Complete quests to earn stars"
13. **Step 10**: Card -- "You're Ready!" with mention of Hatchery/creatures

Players can skip at any time via the "Skip Tutorial" button in the top-right corner.
