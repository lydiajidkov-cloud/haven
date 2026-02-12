## HEAD OF MARKETING: Haven Review

### Executive Summary (3 sentences max)
Haven has a genuinely differentiated core mechanic (surge + combo + cross-chain recipes) that no competitor offers, giving us a real creative hook for ad performance — but the emoji-based art style will cap store conversion rates against polished competitors like Merge Dragons and Travel Town. The creature collection (184 across 16 biomes with named personalities) is our strongest IP asset and the foundation for character-driven marketing campaigns. The biggest risk is zero social/viral mechanics and no narrative wrapper — the two things that drive the cheapest installs in the merge genre.

### Dimension Scores
| Dimension | Score | Evidence |
|-----------|-------|----------|
| Hook clarity | 3/5 | The core concept ("merge items to restore an island") is simple enough for a 5-second pitch (index.html:33 title "Haven", island restoration narrative in tutorial). However, the game opens on a board screen with 5 resource nodes (index.html:71-92) and no visible narrative goal — a new player sees an 8x6 grid with emojis, not a compelling "what am I saving?" moment. Merge Mansion's "what is Grandma hiding?" or Merge Dragons' "heal the land" are more visually immediate hooks. The surge bar (index.html:51-54) and combo counter are invisible until played — they can't sell in a screenshot. |
| Competitive differentiation | 4/5 | The competitive analysis (competitive-analysis.md:80-98) confirms Haven has genuine first-in-genre mechanics: surge momentum, combo counter with Ode to Joy musical progression, cross-chain hybrid recipes (4 chains: living, arcane, shelter, mystic), and swipe-merge input. No competitor has ANY of these. The Surge system specifically (competitive-analysis.md:198-206) is called "Haven's single biggest competitive advantage." These are demonstrable in video ads — a 15-second clip of a surge chain with musical escalation would be thumb-stopping. |
| Shareable/viral moments | 2/5 | Zero social features exist (competitive-analysis.md:231 confirms "Social pressure: None"). No friend lists, leaderboards, card trading, or sharing buttons anywhere in the codebase. The creature discovery modal (hatchery.js:172-213) with its rarity celebration animation is inherently shareable content ("Look what I hatched!") but there's no share button. The Ode to Joy combo system would make excellent TikTok/Reels content but again, no capture or share mechanism. The event exclusive creatures (events.js:17, 33, 49, etc.) create bragging-rights content with no way to brag. |
| Character/IP appeal | 3.5/5 | 184 named creatures with personality-rich descriptions across 16 biomes (creatures.js:24-240). Every creature has a unique name (Sparky, Nibbles, Bramble, Leviathan), species, rarity, and lore blurb. The seasonal sets (Spring/Summer/Autumn/Winter, 6 each) are natural for seasonal marketing campaigns. Legendary creatures like "Arcanum: A deer made of pure starlight" or "Poseidon: A wise kraken" have genuine character appeal. However — all creatures are emoji-rendered (creatures.js uses emoji field like '\u{1F430}'). Emoji characters cannot compete with Merge Dragons' hand-drawn dragon art or Travel Town's detailed item sprites in store screenshots or ad creatives. The CHARACTER DESIGN is there; the VISUAL EXECUTION is not. |
| Store listing readiness | 2/5 | The game has a manifest.json (index.html:10) and mobile-optimized viewport (index.html:4-6), but the visual presentation is emoji-based throughout. Store screenshot potential is limited: an 8x6 grid of emoji (index.html:57-61) does not look premium next to competitors. The four-screen navigation (Board/Quests/Island/Shop, index.html:142-158) gives us 4 distinct screenshots, but none would pass the "thumb-stopping in the store" test against established titles. The creature collection screen with biome categories (hatchery.js:225-353) is the most visually rich screen but still emoji-based. |

### Critical Findings

1. **[BLOCKER] Emoji art style will fail store conversion benchmarks**
   - Evidence: Every visual element uses system emoji — creatures (creatures.js:26-239, all use emoji field), resource nodes (index.html:73-91: 🌲⛰️🌸💎🥚), board items, UI elements. The competitive analysis (competitive-analysis.md:4-5) lists competitors with $780M+ lifetime revenue — all have custom hand-drawn art.
   - Impact: Store conversion rates for casual games are driven by first 3 screenshots. Emoji art screams "hobby project" and will result in sub-1% conversion rates where competitors achieve 3-5%. CPI will be 2-3x higher than necessary. No amount of UA spend fixes bad creatives.
   - Recommendation: Commission custom creature sprites for at least the top 20 most common/marketable creatures as a minimum viable art pass. This is a "fix before any marketing spend" blocker. MEDIUM-HIGH effort (external art required).

2. **[RISK] No narrative hook for ad creatives**
   - Evidence: The game's narrative is a single sentence: "A storm shattered this island's magic. Merge to restore it" (referenced in tutorial, competitive-analysis.md:50 shows "Narrative/Story: Island boss story (light)"). Merge Mansion's entire $9M/month ad strategy is built on narrative mystery (competitive-analysis.md:106-107). Haven's island has boss creatures per region but no character dialogue, cutscenes, or mystery.
   - Impact: Narrative-driven ads achieve 30-40% lower CPI than pure gameplay ads in the merge genre. Without a narrative hook, Haven is competing on gameplay alone — which is actually strong, but harder to communicate in 3 seconds.
   - Recommendation: Add a "Grandma/Guide character" with 5-6 lines of mystery dialogue for the island bosses. Even minimal narrative gives ad creatives a character to build around. LOW effort (writing + small UI additions).

3. **[OPPORTUNITY] Surge/combo system is a unique video ad differentiator**
   - Evidence: Competitive analysis confirms no competitor has surge momentum or procedural audio escalation (competitive-analysis.md:198-206). The surge bar fills at 35/merge, activates at 30 threshold, with visual/audio escalation — this is inherently exciting to watch. The Ode to Joy combo system with musical progression at 5/10/15/20/25 merges creates "listen to this!" moments.
   - Impact: Video ads showing a 20-second surge chain with musical escalation would be genuinely novel in the merge genre. This could achieve viral organic reach on TikTok/Reels before any paid spend.
   - Recommendation: Build a "replay mode" that captures the best surge chain from each session as a 15-second clip. Add a "Share" button to the end-of-surge celebration. LOW effort for huge potential ROI.

4. **[RISK] Zero social/viral coefficient**
   - Evidence: No social features exist anywhere in the codebase: no friend list, no sharing, no leaderboards, no card trading (competitive-analysis.md:230-231, 235-236). Travel Town's card trading system alone drives significant organic installs through social obligation.
   - Impact: Viral coefficient k=0. Every install must be paid for. In a genre where CPI ranges from $0.63 (Android) to $2.23 (iOS), this means higher CAC and lower LTV than competitors with social loops.
   - Recommendation: Add a simple "Share your creature collection" feature as a minimum. Long-term, consider card/sticker collection with trading (competitive-analysis.md:326-336). SHORT-TERM: LOW effort. LONG-TERM: MEDIUM effort.

### Trade-off Flags
- Custom art investment (my recommendation) conflicts with Engineering's "ship what we have" mentality — art assets need to be integrated without breaking the existing emoji pipeline
- Adding narrative wrapper (my recommendation) may conflict with Game Design's "keep the tutorial under 60 seconds" principle
- Social features add complexity that Engineering may push back on for v1, but without them Marketing is fighting with one hand tied behind our back

### Go/No-Go Signal
AMBER — Haven has genuine competitive differentiation and a marketable creature IP, but the emoji art style is a hard blocker for store conversion. Do not spend marketing budget until custom art assets exist for store screenshots and ad creatives. The game could be marketed successfully with: (1) custom art pass on key creatures/items, (2) a basic share mechanism, and (3) video ad creatives built around the surge/combo system.
