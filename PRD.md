# Haven — Pre-Soft-Launch Sprint PRD (v2)

> Based on Board of Directors synthesis, all 12 board review files, 9 playtest reports, and competitive analysis.
> Verdict: AMBER — conditional green light. 4-6 week sprint needed.
> Goal: Make this the most addictive merge game on the market.
> Constraint: ALL assets (art, audio, visuals) must be AI-generated. No human illustrators or external contractors.

## Decisions Made

- **Energy-depletion UX:** Option B — Non-blocking bottom sheet with 2 options (watch ad / buy refill)
- **FOMO messaging:** Option B — Moderate. "EXCLUSIVE" badges on event creatures, "X hours left" on deals. No flashing/shouting.
- **Social features:** Option A — Share button only (static brag card via Web Share API) for soft launch
- **Narrative:** Option B — 2-3 sentences of boss flavour text per island boss
- **Art pipeline:** AI-generated using Midjourney/Leonardo/Scenario AI. Lydia generates assets; Ralph wires them in.

## Rules

- Do ONE task per iteration, then stop
- Read the full task description and any referenced files before making changes
- Read `board-reviews/synthesis.md` for context on WHY each change matters
- After each change, verify `index.html` loads without console errors
- Commit with a descriptive message
- Update `progress.txt` with what you did and the date
- Mark the task `[x]` when done
- If a task says "DEPENDS ON" another task, check progress.txt first. If the dependency isn't done, skip to the next available task.
- Tasks marked "LYDIA" require human action and should be skipped by Ralph Loop.

## Architecture Notes

- 20 IIFE modules communicating via event bus (`Game.on` / `Game.emit`)
- All state in `Game.state`, persisted to localStorage via `Game.save()`
- No build system, no frameworks — pure vanilla JS
- CSS custom properties for theming in `css/style.css`

---

## Phase 0: Critical Bug Fixes

- [x] **1. Fix 3 critical bugs** — (a) Audio clipping at high merge streaks (15+): add a `DynamicsCompressorNode` to the audio chain in `js/audio.js` to prevent ~25 simultaneous oscillators from exceeding 1.0 volume. (b) Worker/companion mutual exclusion bug in `js/creatures.js`: the worker assignment modal doesn't check if a creature is already a companion. Add a check so a creature can't be both worker and companion simultaneously. (c) `double_reward` companion ability in `js/creatures.js` wastes on 0-gem merges: make it persist until a merge actually awards gems (tier 4+ after task 4 changes, currently tier 3+).

## Phase 1: Critical Blockers

- [x] **2. Wire event modifiers into gameplay** — The Events module (`js/events.js`) defines 8 weekly events with gameplay modifiers (gem multiplier, spawn boost, min-merge override, energy regen, surge duration, critical merge rate, companion cooldown, cross-chain rewards) but `board.js` and `game.js` never read them. Find the 4 insertion points: (1) where merges award gems, (2) where items spawn, (3) where merge-count thresholds are checked, (4) where energy regeneration ticks. At each point, query the Events module for active modifiers and apply them. BLOCKER — 4 departments flagged independently.

- [x] **3. Harden save system** — Implement: (a) 200ms debounce on `Game.save()` with `beforeunload` flush for safety, (b) save format version number in state for future migration, (c) backup to a second localStorage key (`haven-backup`) on each save, (d) try/catch around save/load with fallback to backup if primary is corrupted, (e) quota check before save (warn if approaching 5MB localStorage limit). Must ship before any economy changes.

- [x] **4. Raise thresholds: merge gems + MIN_MERGE** — Two related changes: (a) Raise the minimum tier that awards gems from tier 3 to tier 4 (~30% reduction in free gem income). (b) Raise MIN_MERGE from 2 to 3 (currently players can merge just 2 items, which eliminates strategic tension). This also makes the "Merge Mania" event (min-merge reduced to 2) actually meaningful instead of being a no-op. DEPENDS ON: Task 3 (save versioning).

## Phase 2: Addiction & Engagement Amplifiers

These features directly increase the "one more merge" compulsion loop and player retention.

- [x] **5. Celebration overlay system** — Build a shared, configurable full-screen celebration overlay that fires for: tier 7+ merges, creature discoveries, first hybrid unlocks, battle pass tier unlocks, and event tier completions. Tap-skippable, auto-dismisses in 3 seconds. Tier 5-6 merges get enhanced particle burst + brief banner instead (NOT full-screen — fires too frequently during surge). One system, configured per trigger. Store config in a data structure. Include share button on creature discovery celebrations.

- [x] **6. Item discovery rewards** — Award gems for every NEW item tier a player discovers for the first time (not just creature discoveries). Track discovered tiers in save state. Award: 5 gems for common tiers, 10 for uncommon, 25 for rare, 50 for legendary. Show floating "+5 NEW!" text with a distinct chime sound. This creates constant micro-dopamine hits throughout early and mid-game (competitive gap: Travel Town does this and it's their most addictive feature).

- [x] **7. Toast queue with cooldown + surge tooltip** — (a) Implement a toast notification queue with max one toast per 45 seconds and priority ranking. Surge tooltip = highest priority. Hybrid recipe hints only fire if no toast in 90 seconds. This prevents the post-tutorial toast fatigue. (b) Add a contextual tooltip on first surge activation after tutorial completes: "You triggered SURGE! Merge fast to keep it going!" This is the discovery moment for the game's best mechanic.

- [x] **8. Tutorial improvements** — Three additions to the tutorial or post-tutorial flow: (a) Add a swipe-merge tutorial step (the most satisfying input method is never taught). (b) Add a cross-chain recipe hint tooltip as just-in-time guidance when a player first has recipe ingredients adjacent. (c) Add a "Stars" display to the top bar (currently stars are only visible in Island/Quest tabs — this is a critical currency that's invisible on the main board screen).

- [x] **9. Surge system improvements** — (a) Increase surge bar height from 18px to 24px (currently too easy to miss). (b) Add a distinct surge activation sound (whoosh + flash) — currently surge is hard to notice during fast play. (c) Add surge escalation milestones with scaling rewards: 5 merges during surge = +10 gems, 10 merges = +25 gems + star, 20 merges = +50 gems + rare egg. These create the "just 3 more merges to hit the next milestone" compulsion.

- [x] **10. Battle Pass XP visibility + extension** — (a) Show "+X XP" floating text when merges award battle pass XP (currently XP gain is invisible — players don't know they're progressing). (b) Extend the battle pass season from the current completion speed (8-16 days reported) to require ~30 days. Adjust XP curve so the last 10 tiers require significantly more XP, creating urgency in the final week.

## Phase 3: Economy Rebalancing

Specific numbers from playtest analysis. All changes work together — sinks increase spending pressure while source cuts reduce free income.

- [x] **11. Gem sinks: board expansion** — Add purchasable board expansion: 6x8→6x9 (500 gems), 6x9→6x10 (1000 gems), 6x10→7x10 (2000 gems). Add a subtle "Expand" button at the board edge, purchase confirmation, persist expansion in save state. Update board rendering and CSS grid to handle variable dimensions. This is the single most important monetization lever in merge games. DEPENDS ON: Task 3 (save versioning).

- [x] **12. Gem sinks: creature evolution + cosmetic tiles** — (a) Creature evolution: spend gems (200-800 by rarity) to evolve creatures to a higher form with improved companion abilities. Add evolution UI to creature detail view. (b) Cosmetic tile themes: 3-4 purchasable board themes (ocean, forest, crystal, shadow) at 300 gems each. Add to shop. Both persist in save state. DEPENDS ON: Task 3.

- [x] **13. Economy number rebalancing** — Apply the specific cuts from playtest analysis: (a) Reduce daily login calendar gem rewards by 40% (1,340→800/month). (b) Cap Battle Pass free track total at 800 gems (currently 1,690). (c) Increase energy refill cost from 35 gems to 75 gems (current ROI is 2x — broken incentive where spending gems on energy returns MORE gems). (d) Reduce early island node gems by 50% (first 15 nodes: 500→250 total). (e) Fix energy refill being net-positive. DEPENDS ON: Task 3.

- [x] **14. Pity timer for creature eggs + legendary weight** — (a) Add a pity counter: guaranteed legendary creature every 30 egg discoveries (currently players can spend 3,300 gems and miss all legendaries). (b) Increase legendary discovery weight from 3% to 8% (current 3% means ~767 discoveries needed for all 23 legendaries — that's 85-130 hours, too punishing). (c) Add "Undiscovered Biome Egg" to shop at 2x price of regular biome egg, guaranteeing an undiscovered creature.

## Phase 4: Monetization Infrastructure

- [x] **15. AdAdapter module + energy-empty bottom sheet** — (a) Create `js/ad-adapter.js` as an IIFE behind the event bus. Define `AdAdapter.show(type, callback)` that simulates a 3-second ad for now (will connect to real SDK later). (b) When energy hits zero, show a non-blocking bottom sheet from screen bottom: "Watch Ad — Free Refill" and "Buy Refill — 75 gems." Dismissible by tapping outside. Subtle, dark-palette styling. Cap rewarded ads at 5/day to protect IAP value.

- [x] **16. Double-reward ad + first purchase bonus** — (a) After a tier 4+ merge that awards gems, 20% chance to show "Double your gems?" prompt. If accepted, play ad via AdAdapter, double the gem reward. Auto-dismiss after 5 seconds. Show AFTER merge animation (don't interrupt flow). (b) Add first-purchase bonus: ANY first real-money purchase (even $0.99) permanently unlocks +10% gem income. Display this benefit prominently in the shop to encourage first conversion.

- [x] **17. Starter pack + subscription + whale tiers** — (a) Update starter pack ($1.99) to include a "Starter Companion Egg" guaranteeing one rare creature (board-agreed compromise). (b) Add VIP subscription tier ($4.99/month): 200 gems/day, 50% faster energy regen, exclusive "VIP" badge. (c) Add whale gem bundles: $49.99 = 10,000 gems, $99.99 = 25,000 gems. (d) Add daily flash sale: 1 rotating item at 30% off, changes every 24 hours, creates daily re-open habit.

## Phase 5: Retention & Return

- [x] **18. Welcome-back chest (scaled)** — Enhance `welcome.js`. Scale reward by time away: 1-4h = small chest (5 gems + 10 energy), 4-12h = medium (15 gems + 25 energy + random item), 12-24h = large (30 gems + full energy + rare item), 7+ days = comeback chest (100 gems + 50 energy — special message to win back lapsed players). Show chest with satisfying opening animation and "claim" tap.

- [x] **19. Streak system overhaul** — Three changes: (a) At 20 hours since last claim, show warning banner: "Your X-day streak expires in Y hours!" with urgency colour. (b) When streak breaks, show acknowledgment screen (not silent reset): "Your X-day streak has ended" with encouragement. (c) Add streak-save option: spend 50 gems OR watch ad to preserve streak for 24 more hours. Cap at 1 save per week. All departments agreed silent resets are hostile design.

- [x] **20. Push notification infrastructure** — Add `sw.js` (service worker) with push notification support. Request permission after 3rd session OR first creature discovery (whichever first). Frame as: "Get notified when your creatures earn gems?" Triggers: (a) event launches, (b) streak-at-risk at 20 hours, (c) worker gem earnings ready, (d) battle pass about to expire, (e) energy full. Frequency cap: max 3/day. Marketing and Live Ops jointly own trigger catalogue.

## Phase 6: Content Pipeline

- [x] **21. Extract events + shop to config-driven JSON** — (a) Move event definitions from hardcoded JS arrays in `events.js` to `data/events.json`. Schema: name, duration, modifiers (with min/max validated ranges), reward tiers, scheduled start/end dates. (b) Move shop offer definitions from `shop.js` to `data/shop.json`. Schema: name, price, contents, display order, availability window. Both load at init with graceful fallback if JSON is malformed.

- [ ] **22. Urgent orders + mega orders** — Add two new order types: (a) Urgent orders: timed orders with countdown (e.g., "Deliver 2 Wood Tier 4 in 5 minutes") with 2x gem rewards. (b) Mega orders: require 3 items instead of the usual deliveries, with 3x rewards. Both must be calendar-driven (scheduled, not random) to prevent collisions with weekly events. Game Design owns mechanics, Live Ops owns scheduling. Add to `data/orders.json`.

## Phase 7: Visual & Audio Upgrade (Code Prep)

These tasks prepare the code for AI-generated assets. Lydia generates the actual art/audio separately (see LYDIA TASKS below).

- [ ] **23. Sprite rendering infrastructure** — Refactor `board.js` `renderCell()` to support `<img>` or inline `<svg>` instead of text nodes for item display. Create a sprite mapping system: `data/sprites.json` maps each chain+tier combination to a sprite file path. If no sprite exists, fall back to the current emoji rendering. This lets art assets be swapped in incrementally without breaking the game. Preserve existing CSS glow/shimmer layers from `tiles.css`.

- [ ] **24. Performance mode auto-detection** — Add auto-detection on first load via `navigator.hardwareConcurrency` + a quick canvas benchmark. Two tiers: "Balanced" (cuts decorative animations: per-tier box-shadow pulse, ::after sparkles, conic-gradient rainbow) and "Minimal" (cuts everything except core merge feedback). NEVER cut: merge-flash, particle bursts, combo escalation, golden merge-target pulses, purchase-moment animations (piggy bank break, battle pass unlock, deal reveal). No player-visible toggle — automatic.

- [ ] **25. Audio upgrade prep** — (a) Add an audio asset loading system that can play pre-recorded audio files (MP3/OGG) alongside or instead of procedural Web Audio sounds. Create `data/audio.json` mapping sound events to file paths, with fallback to procedural generation if no file exists. (b) Add background music support: a looping ambient track with volume control (separate from SFX volume). (c) Add a music toggle to the settings panel. This prepares for AI-generated SFX and music.

## Phase 8: Polish & Launch Features

- [ ] **26. FOMO moderate messaging + micro-text fix** — (a) Add "EXCLUSIVE" gold badges on event-only creatures in hatchery/creature collection. (b) Add "X hours left" countdown text on time-limited shop deals and event banners. Subtle gold badge, small countdown text — no flashing. (c) Audit all font sizes: set minimum 11px everywhere. Fix 8-9px fonts and 3px tier dots flagged by the board.

- [ ] **27. Boss flavour text + narrative hooks** — Add 2-3 sentences of story text to each island boss/region node. When a player reaches a boss, show a brief story snippet ("The Crystal Guardian hoards ancient gems in the frozen cavern..."). Store text in `data/bosses.json`. Light narrative hook for marketing ad creatives. Zero ongoing maintenance.

- [ ] **28. Brag card share mechanism** — Create a static "brag card" using Canvas: snapshot of the post-surge board with stats overlay (creatures discovered X/184, island X%, longest combo, total merges). Share via Web Share API. Add "Share" button to: (a) post-surge celebration screen, (b) creature discovery modal, (c) settings/stats panel. Fallback: copy image to clipboard.

- [ ] **29. UI polish pass** — Small high-impact fixes from playtest reports: (a) Add pulsing gold border glow on Creature Egg button (looks same as other chains, not discoverable). (b) Add "NEW" badge on Hatchery tab when new creatures are discovered. (c) Add quest completion fanfare: particles + sound + red notification dot on Quests tab. (d) Add energy refill notification toast when energy auto-refills. (e) Show creature silhouettes for undiscovered creatures instead of "???". (f) Increase cell gap from 3px to 4-5px on small screens for better touch distinction. (g) Show piggy bank icon + gem count only during surge mode (reduces HUD clutter on 5.5" screens).

---

## LYDIA TASKS (Human + AI Tools — Ralph Loop skips these)

These tasks require Lydia to generate assets using AI tools, then place them in the project folder. Ralph Loop task #23 (sprite infrastructure) makes these assets plug in automatically via `data/sprites.json`.

### Art Generation (2 weeks estimated)

**Recommended tool pipeline:** Leonardo AI (style development + transparent PNGs) → Scenario AI (train custom model on your style, batch generate) → Recraft AI (SVG vectors for simple items)

**Phase A (Week 1): 10 Hero Creatures**
- Generate the 10 most visually appealing creatures for store screenshots and ad creatives
- Style: 3/4 top-down view, soft pastels or Haven's dark palette, consistent outline weight
- Output: transparent PNG, 256x256
- Save to: `haven/assets/creatures/`

**Phase B (Week 2): 20 Highest-Tier Items**
- Generate the top-tier item for each merge chain (Wood 7, Stone 7, Flora 7, Crystal 7, Creature 5)
- Plus 15 mid-tier items for gameplay footage
- Same style as Phase A
- Save to: `haven/assets/items/`

**Phase C (Post-soft-launch): Remaining Items**
- Fill in remaining items based on player engagement data (which chains are most used)
- Save to same folders

### Audio Generation

**SFX:** Use ElevenLabs SFX or MakeSFX to generate:
- Improved merge sounds (tier-specific)
- Celebration fanfare (3 second)
- Chest opening sound
- Purchase confirmation chime
- Save to: `haven/assets/audio/sfx/`

**Music:** Use SOUNDRAW or Suno to generate:
- Looping ambient background track (calm, magical, 2-3 minutes)
- Surge mode music variant (faster, more intense)
- Save to: `haven/assets/audio/music/`

### Art Tool Quick Reference

| Need | Tool | Cost |
|------|------|------|
| Style development / hero art | Leonardo AI or Midjourney V7 | Free-$10/mo |
| Batch generation (consistent style) | Scenario AI (Pro) | ~$35/mo |
| SVG vector items | Recraft AI | Free tier |
| Background removal | Leonardo AI (built-in) or remove.bg | Free |
| SFX | ElevenLabs SFX or MakeSFX | Free tier |
| Background music | SOUNDRAW or Suno | ~$10/mo |

**Total: ~$45-55/month during active production, $0 after.**
