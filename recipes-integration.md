# Recipe Book - Integration Guide

## Files Created

- `js/recipes.js` - Recipe Book IIFE module (discovery tracking, modal UI, detail view, hint system)
- `css/recipes.css` - All Recipe Book styles (button, modal, cards, discovery animation)

## HTML Changes Required (index.html)

### 1. Add the CSS link

In the `<head>`, after the existing stylesheet links, add:

```html
<link rel="stylesheet" href="css/recipes.css">
```

Place it after `<link rel="stylesheet" href="css/shop.css">`.

### 2. Add the script

In the scripts section, add **before** `js/tutorial.js`:

```html
<script src="js/recipes.js"></script>
```

### 3. Add init call

In the inline `<script>` initialization block, add this line after `Daily.init();`:

```javascript
Recipes.init();
```

## What Each Change Does

### CSS link
Loads the Recipe Book visual styles (button, modal overlay, recipe cards, discovery animation).

### Script tag placement
`recipes.js` depends on `Items` (chain definitions), `Game` (state, events, save), and `Sound` (tap feedback). All of these load before it. It must load before `tutorial.js` in case the tutorial ever references recipes.

### Init call
`Recipes.init()` does four things:
1. Ensures `state.recipes.discovered` exists in the game state (with backward-compatible backfill)
2. Creates the modal DOM elements inside `#app`
3. Creates the recipe book button and places it after `#powerup-bar`
4. Registers a listener on the `crossChainMerge` event so recipes auto-discover

## How It Works

- **Button**: A small book icon appears on the board screen, between the powerup bar and orders panel
- **Modal**: Opens as an overlay (not a new screen/tab) with a 2x2 grid of recipe cards
- **Undiscovered cards**: Show "???" with silhouetted icons and a flavour hint
- **Discovered cards**: Show the parent chain icons, arrow, and hybrid chain icon/name; tapping opens a detail view
- **Detail view**: Full tier progression (5 tiers with item previews), merge formula, and "higher tier = higher result" hint
- **Discovery**: When `crossChainMerge` fires from Board.js, the recipe auto-discovers with a celebration overlay
- **Hint banner**: After 20+ total merges, undiscovered recipes show "Try merging items from different chains..."
- **Save**: Discovery state persists in `state.recipes.discovered` via Game.save()

## State Shape

```javascript
state.recipes = {
    discovered: {
        living: false,   // wood + flora
        arcane: false,   // crystal + stone
        shelter: false,  // stone + wood
        mystic: false    // crystal + flora
    }
};
```

## No Existing Code Modified

The recipe book is entirely additive. Board.js already emits `crossChainMerge` events (line 931 of board.js) -- Recipes.js just listens for them.
