# Combo System Integration Guide

Two changes needed to wire up the combo display.

---

## 1. Add CSS and JS to `index.html`

### CSS (in `<head>`, after the existing stylesheets)

Add this line after `<link rel="stylesheet" href="css/shop.css">`:

```html
<link rel="stylesheet" href="css/combo.css">
```

### JS (in the script list, after `board.js`)

Add this line after `<script src="js/board.js"></script>`:

```html
<script src="js/combo.js"></script>
```

combo.js must load **after** game.js (it calls `Game.on`) and **after** board.js (it appends to `#board-container`).

---

## 2. Initialize Combo in the startup block

In the `<script>` initialization block at the bottom of `index.html`, add `Combo.init()` after `Board.init()`:

```javascript
Game.init();
Board.init();
Combo.init();    // <-- add this line
PowerUps.init();
```

That's it. The combo system creates its own DOM elements inside `#board-container` and listens for `mergeCompleted` events automatically.

---

## What it does

| Feature | Trigger | Visual |
|---------|---------|--------|
| Combo counter | 3+ rapid merges (within 1.5s) | "x3", "x4"... in top-right, with punch animation |
| Color escalation | Streak thresholds | White (3-4), Yellow (5-7), Orange (8-12), Red (13-19), Rainbow (20+) |
| Timer bar | Any merge during a streak | Small bar below counter depleting over 1.5s |
| "Nice!" | x5 streak | Quick centered flash |
| "Amazing!" + edge glow | x10 streak | Larger flash + gold edge glow |
| "Incredible!" | x15 streak | Larger flash + gold edge glow |
| "UNSTOPPABLE!" + shake | x20 streak | Epic flash + red edge glow + screen shake |
| "LEGENDARY!" | x25+ (every 5th) | Rainbow text + red glow + screen shake |
| Fade out | 2s after streak ends | Counter fades, timer bar hides |

The combo system tracks its own streak independently using the same 1.5s window as `audio.js`, so the visual feedback stays perfectly synced with the Ode to Joy melody.
