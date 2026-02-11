# Haven — Mobile Merge-Puzzle Game (Web Prototype)

Merge creatures and resources to rebuild a magical island refuge, uncovering its mysteries through story-driven quests.

## How to Play

1. **Open `index.html`** in any browser (Chrome recommended)
2. **Tap resource nodes** at the bottom to spawn items (costs 1 energy)
3. **Drag matching items** together — merge 3+ identical items to create higher tiers
4. **Complete quests** to earn stars
5. **Unlock island areas** with stars to discover creatures and story

## Features

### Phase 1: Core Merge Gameplay
- 6x8 merge board with touch + mouse drag-drop
- 5 merge chains: Wood (7 tiers), Stone (7), Flora (7), Crystal (7), Creature (5)
- Chain reactions, 5-merge bonuses, particle effects, procedural audio
- Energy system (5 max, 25 min regen)
- localStorage save/load

### Phase 2: Quests + Island Map
- 25+ quests with progress tracking
- 12 island areas to unlock with star currency
- Creature collection with names, descriptions, and story fragments
- Island restoration percentage

### Phase 3: Meta Systems + Monetisation UI
- Gem shop with energy, boosts, creature eggs, gem bundles
- Haven Pass (40-tier battle pass with free + premium tracks)
- Daily login streak (30-day calendar with escalating rewards)
- Daily quests (3 per day with gem rewards)
- Simulated rewarded ads, starter pack, piggy bank

### Phase 4: Polish
- PWA manifest (add to home screen on mobile)
- Settings panel (sound, vibration, stats, reset)
- Responsive design for all screen sizes

## Tech Stack

Pure HTML/CSS/JavaScript — no frameworks, no build step, no dependencies.
- CSS Grid for the merge board
- CSS animations for game juice (merge flash, screen shake, particles)
- Canvas overlay for particle effects
- Web Audio API for procedural sound generation
- localStorage for persistent save data
- SVG/CSS-only graphics (no image assets)

## File Structure

```
haven/
├── index.html          Single-page app entry point
├── manifest.json       PWA manifest
├── css/
│   ├── style.css       Base layout, colours, typography
│   ├── animations.css  Merge effects, particles, transitions
│   ├── island.css      Quest panel + island map styles
│   └── shop.css        Shop, pass, daily login styles
└── js/
    ├── items.js        Item definitions, merge chains, rarity
    ├── audio.js        Procedural sound effects (Web Audio API)
    ├── particles.js    Canvas particle system
    ├── game.js         Core state, energy, save/load, events
    ├── board.js        Merge grid, drag-drop, merge logic
    ├── quests.js       Quest system + tracking
    ├── island.js       Island map, areas, creatures, story
    ├── shop.js         Gem shop, bundles, purchases
    ├── pass.js         Battle pass tier system
    └── daily.js        Login streak + daily quests
```

## Testing on Mobile

1. Serve the folder with any local server (e.g., `python -m http.server 8000`)
2. Open on your phone via your local IP (e.g., `http://192.168.1.x:8000`)
3. Or use Chrome DevTools → Toggle Device Toolbar for mobile emulation

## Design Document

Full game design doc: `C:\Users\lydia\Documents\Claude\research\game-concept-design.md`

## Research

- Game audio best practices: `research/research-game-audio-sfx.md`
- Visual styles guide: `research/research-game-visual-styles.md`
- Mobile game marketing: `research/research-mobile-game-marketing.md`
