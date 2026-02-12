## GAME DESIGN: Phase 2 Cross-Agent Response

### Agreements

**Engineering on event modifiers (Finding #1):** Full alignment -- I flagged this as my Finding #4 BLOCKER independently. Their four wiring points are exactly right. Two departments calling the same BLOCKER settles prioritisation.

**Art/UX on emoji art ceiling (Finding #1):** Agreed. My only flag: sprite migration must preserve the visual hierarchy tiles.css creates through border-radius silhouettes and glow tiers. Do not flatten readability on a crowded 48-cell board.

**Live Ops on streak save (Finding #6):** Agreed. Silent resets are hostile. 50-gem save is fair -- add a "Streak at risk!" warning at 20 hours, not after it breaks.

**Engineering on save debouncing (Finding #2):** Agreed on 200ms with bulletproof beforeunload flush.

### Challenges

**Monetization on cutting free gems 60-70% (Finding #1):** I challenge this scope. Surge bonuses, chain reaction gems, and the pity timer are the dopamine architecture that creates "one more merge" pull. Kill chain reaction gems and you kill the game's most exciting moment. Remove the pity timer and frustration streaks drive D1 churn.

The real problem: gems buy nothing interesting. The sinks are shallow, not the sources excessive. Monetization identified this themselves -- no cosmetic tiles, no board expansion, no creature upgrades. Build sinks first, measure with real players, then tune sources from data.

**Marketing on narrative wrapper (Finding #2):** Haven's identity is tactile and musical, not textual. A guide character creates Merge Mansion-style story expectations we cannot sustain at our content velocity. I will accept: 2-3 sentence flavour text per island boss for ad hooks. No dialogue system, no cutscenes.

### Proposed Compromises

**Economy rebalance -- phased, not blanket:** Phase 1 (pre-launch): add sinks -- board expansion 500/1000/2000 gems, creature evolution 200-800 gems, cosmetic tiles 300 gems. Phase 2 (soft launch): measure real accumulation over 14 days. Phase 3: tune sources from data. I concede one immediate change: raise merge gem threshold from tier 3 to tier 4, cutting merge income ~30% without touching the reward moments that feel best. Worker income (240 overnight) and daily login (515/week) are likelier outliers than merge rewards.

**Full-screen celebration overlay (Art/UX Finding #2):** Support for tier 7+ merges, creature discoveries, and first hybrid unlocks only. Not tier 5 -- it fires too frequently during surge streaks. The overlay must be tap-skippable and auto-dismiss in 3 seconds. For tier 5-6, enhance the existing particle burst with a brief banner instead. Session pacing is sacred: a full-screen interrupt mid-surge breaks the flow state that is literally our best feature.

**Config-driven content (Live Ops Finding #1):** Fully support JSON extraction. My condition: modifier values must fall within pre-approved ranges (gem_multiplier: 1.5-3x, spawn_tier_boost: 1-2, min_merge_override: 2-3). Anything outside requires game design sign-off. Live Ops gets autonomy for routine content; the economy stays protected.

**Event pool expansion (Live Ops Finding #2):** Agreed on 16+. I will draft 8 new modifiers on existing systems: Surge Duration +50%, Critical Merge 8%, Hybrid Tier Penalty Removed, Companion Cooldown Halved, Order Reward +50%, Discovery Doubled at Tier 4+, Energy Cap +25, Merge-4 Counts as Merge-5. No new mechanics -- engineering scope stays contained.
