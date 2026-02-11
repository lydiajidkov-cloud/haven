# Tiles Visual Overhaul — Integration Guide

## 1. Link the CSS file in index.html

Add this line in `<head>`, **after** the existing CSS links (so it can override base styles):

```html
<link rel="stylesheet" href="css/tiles.css">
```

It should go after `css/animations.css` (or any other CSS file). Final order:

```html
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/animations.css">
<link rel="stylesheet" href="css/island.css">
<link rel="stylesheet" href="css/shop.css">
<link rel="stylesheet" href="css/tiles.css">   <!-- ADD THIS -->
```

## 2. Changes needed in board.js renderCell()

In `board.js`, the `renderCell()` function (around line 1077) currently sets the item element's className like this:

```js
el.className = 'item ' + item.chain + ' tier-' + item.tier;
```

**Change it to:**

```js
el.className = 'item ' + item.chain + ' tier-' + item.tier + ' item-' + item.chain + ' item-tier-' + item.tier;
```

This adds two new classes alongside the existing ones:
- `.item-{chain}` — chain visual identity (e.g., `item-wood`, `item-crystal`)
- `.item-tier-{N}` — tier progression styling (e.g., `item-tier-0`, `item-tier-7`)

The existing `.wood`, `.stone`, etc. and `.tier-0`, `.tier-4`, etc. classes are preserved so nothing breaks.

### What each class does

| Class | Purpose |
|-------|---------|
| `.item-wood` | Warm brown tones, woodgrain texture, rounded organic corners |
| `.item-stone` | Cool grey/slate, angular sharp edges, crack texture |
| `.item-flora` | Green-to-pink soft glow, petal-shaped asymmetric corners |
| `.item-crystal` | Blue-to-purple facets, sparkle animation on ::after |
| `.item-creature` | Gold/amber, egg-like oval shape, inner glow |
| `.item-living` | Wood+Flora hybrid: brown-to-green dual gradient |
| `.item-arcane` | Stone+Crystal hybrid: grey-to-purple dual gradient |
| `.item-shelter` | Wood+Stone hybrid: warm-to-cool sturdy look |
| `.item-mystic` | Flora+Crystal hybrid: green-to-purple ethereal |
| `.item-tier-0` to `.item-tier-1` | Muted, small symbol, no glow |
| `.item-tier-2` to `.item-tier-3` | Medium symbol, brighter, subtle chain-colored glow |
| `.item-tier-4` to `.item-tier-5` | Large symbol, vivid, prominent glow + pulse animation |
| `.item-tier-6` to `.item-tier-7` | Full glow halo (::before), shimmer animation |
| `.item-tier-8` to `.item-tier-9` | Legendary: rainbow rotating border, sparkle particles |

### Additional enhancements included

- **Depth**: All items get inner shadow + 3D lift via box-shadow
- **Hover**: Desktop hover lifts the tile slightly
- **Press**: Active state presses the tile down (tactile feel)
- **Merge flash**: Merging cells get a white radial flash via ::after
- **Spawn bounce**: Spawn-in animation is bouncier with a brightness flash
- **Crystal sparkle**: ::after pseudo-element sparkles, intensity scales with tier

### Note on ::before and ::after usage

- **::before** is used by tier 6-7 (glow halo) and tier 8-9 (rainbow border)
- **::after** is used by crystal chain (sparkle) and tier 8-9 (legendary particles)
- For crystal items at tier 8-9, the legendary sparkle particles on ::after override the crystal sparkle — this is intentional since the legendary effect is more impressive

### Note on existing animations

The file `animations.css` has tier-based glow animations (`.item.tier-4`, `.item.tier-5`, `.item.tier-6`). The new tile classes use more specific selectors (`.item-wood.item-tier-4`) which will take precedence. The old animation rules are harmless but can optionally be removed from `animations.css` if desired.
