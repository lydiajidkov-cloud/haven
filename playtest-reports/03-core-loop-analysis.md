# Haven - Core Loop & Progression Analysis Report

**Agent:** Core Loop & Progression Analyst
**Date:** 2026-02-11

---

## Ratings
- **Core Loop:** 7/10 (polished merge mechanics, shallow strategy)
- **Progression:** 8/10 (well-paced island, fast battle pass)
- **Engagement:** 6/10 (no idle progression, no events, no social)

## Core Loop: Spawn → Merge → Rewards

### What's Strong
- **Three merge methods** (tap, drag, swipe) — each has a clear use case
- **Chain reactions** with escalating rewards (depth x 5 gems)
- **Cross-chain recipes** (wood+flora=living, stone+crystal=arcane, etc.)
- **Big merge bonuses** (5+ items = free duplicate)
- **Cell-level locking** allows rapid interaction during animations
- **Surge momentum** rewards fast play with +44% animation speed

### What's Shallow
- No "bad merge" penalty — you can always merge
- No item destruction — items never expire
- No merge ordering strategy
- No resource scarcity trade-offs between chains
- Cross-chain recipes are **not discoverable** (no recipe book, no tutorial)

## Surge Momentum Analysis

| Parameter | Value |
|-----------|-------|
| Activation threshold | 40/100 |
| Deactivation threshold | 10/100 |
| Per-merge gain | +30 |
| Decay rate | 12/sec |
| Window after activation | ~2.5 sec without merging |
| Animation speedup | 320ms → 180ms (44% faster) |

**Trigger frequency:** Active players get 5-10 surges per session. Casual: 1-2.
**Impact:** Moderate. +1 gem/merge + end bonus (merges x 2) is modest.

**Recommendation:** Change from flat +1 gem to **2x all merge rewards** during surge. Makes surge scale with player progress.

## Progression Pacing

### Island Roadmap (37 nodes, 7 regions)
| Region | Stars Needed | Est. Time |
|--------|-------------|-----------|
| The Shore | 2-10 | 30 min - 1 hr |
| Whispering Woods | 12-27 | 2-4 hours |
| Sunlit Meadows | 30-50 | 5-10 hours |
| Stone Peaks | 54-79 | 15-25 hours |
| Crystal Depths | 84-112 | 30-50 hours |
| Cloud Realm | 118-150 | 60-100 hours |
| Ancient Ruins | 157-193 | 120-200 hours |

Well-tuned. Early regions feel achievable, late regions are aspirational.

### Battle Pass (40 tiers, 100 XP each)
- **Completable in 8-16 days** (too fast for a seasonal pass)
- Recommendation: Increase to 200 XP/tier or extend season to 30+ days

## Session Design
- Energy: 100 max, 2 min regen = **20-30 min active sessions**
- Return trigger: 3-4 hour energy refill
- **Missing:** No 30-minute return hooks (no idle progression, no timed boosts)

## Missing Engagement Layers

| Feature | Merge Dragons | EverMerge | Haven |
|---------|--------------|-----------|-------|
| Camp/Base Building | Yes | Yes | No |
| Timed Events | Yes | Yes | No |
| Leaderboards | Yes | Yes | No |
| Creature Abilities | Yes | No | No |
| Idle Progression | Yes (dragons harvest) | Yes | No |
| Prestige System | No | No | No |

## Top Recommendations

### Priority 1: Discoverability
1. Add Recipe Book UI (show all cross-chain combos)
2. Tutorial must cover swipe-merge, surge, cross-chain
3. Add just-in-time tooltips ("Board almost full — try Shuffle!")

### Priority 2: Return Hooks
4. Idle creature generation (1 low-tier item/hour while away, max 5)
5. Daily micro-events ("Happy Hour: 2x gems for 1 hour")
6. Energy overflow warning notification

### Priority 3: Strategic Depth
7. Item modifiers (10% "Glowing" = skip 1 tier, 5% "Cursed" = merge within 10 moves)
8. Creature passive abilities (Meadow Butterfly: +5 surge per flora merge)
9. Energy strategy options (spend 5 energy for guaranteed tier 2 spawn)

### Priority 4: Surge Excitement
10. Surge escalation: 5 merges=+10 gems, 10=+25 gems+star, 20=+50 gems+rare egg

### Priority 5: Endgame
11. Prestige system ("New Island" reset with permanent bonus)
12. Weekly leaderboards with gem rewards
