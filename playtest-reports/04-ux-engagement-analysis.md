# Haven - UX & Engagement Analysis Report

**Agent:** UX & Retention Specialist
**Date:** 2026-02-11

---

## Overall Grade: B- (solid foundation, critical meta-systems lack visibility)

## FTUE (First-Time User Experience) — Grade: C+

### Tutorial Teaches:
1. Welcome card (meta-goal explanation)
2. Spawn first Wood item
3. Spawn second Wood item
4. First tap-to-merge
5. Celebration
6. Directs to Quests

### Tutorial MISSES:
- Swipe-merge (most satisfying interaction)
- Surge momentum system
- Energy regeneration
- The 5 resource chains
- Cross-chain recipes
- Creature collection / Hatchery
- Island / Shop tabs

Board hint ("Tap a resource button...") disappears after 3 spawns — too early.

## Feedback Gaps

### Strong Feedback (keep these):
- Merge: flash, particle, sound, shake, haptic
- Spawn: pop-in animation, particles
- Surge activation: board glow, bar animation, haptic
- High-tier items: auto-glow, legendary particles

### Missing Feedback:
| Moment | Current | Should Have |
|--------|---------|-------------|
| Earning gems | Brief 150ms scale | Particle burst + coin sound + floating text tracking to counter |
| Energy regen | Silent countdown | Visual ping when energy refills |
| Creature discovery | Modal interrupts flow | Anticipation buildup (egg glow → shake → modal) |
| Quest progress | Bar updates silently | Sound + haptic on progress |
| Quest complete | Pulse glow on Claim | Confetti + notification badge on tab |
| Surge bar building | 18px bar, easy to miss | Larger bar (24px), activation sound |
| Recipe targets | Purple glow at 0.2 opacity | Increase to 0.4 opacity |
| Battle Pass XP | Invisible | "+10 XP" floating text on merges |

## Navigation Issues

### Hidden Gems:
- **Hatchery** is buried inside Island tab → needs "NEW" badge
- **Stars** not shown on board screen → critical currency is hidden
- **Battle Pass XP** gain is invisible → players don't know how to progress
- **Creature Egg button** looks same as other chains → needs gold glow differentiation

### Information Hierarchy:
- Energy + Gems: Prominent (top bar) ✓
- Stars: Hidden (only in Island/Quest tabs) ✗
- Surge bar: 18px tall, collapses to 0 ✗
- Quest claim: Gold pulse ✓ but no tab notification ✗

## Touch Quality

- Cell size: min(14vw, 8vh, 58px) → 50-54px on mobile → adequate but borderline
- Cell gap: 3px → too small, increase to 4-5px on small screens
- Drag threshold: 12px → appropriate
- Multi-touch handled correctly (single pointer tracking)
- Context menu / pull-to-refresh properly disabled

## Critical UX Fixes (Ship First)

1. **Swipe-merge tutorial** — "Pro Tip: Swipe across matching items to chain-merge!"
2. **Gems gain visibility** — particle burst at counter + coin sound + larger floating text
3. **Stars in top bar** — show next to gems
4. **Creature egg glow** — pulsing gold border on Egg button
5. **Quest completion fanfare** — particles + sound + red dot on Quests tab
6. **Surge activation sound** — whoosh + flash
7. **Surge bar height** — 18px → 24px

## High Priority Fixes (Next Iteration)

8. Energy refill notification toast
9. Auto-navigate to Hatchery on first creature discovery
10. Cross-chain recipe hint tooltip
11. Battle Pass XP feedback (+10 XP floating text)
12. Undiscovered creature silhouettes (instead of "???")
13. Island node unlock particles
14. Hatchery "NEW" badge on tab

## Retention Hook Rankings

| Hook | Strength | Notes |
|------|----------|-------|
| Creature Collection | Strong | 184 creatures, rarity excitement |
| Island Roadmap | Strong | Clear % progress, boss reveals |
| Daily Login | Medium | Calendar visible, no streak penalty |
| Battle Pass | Weak | XP invisible, completes too fast |
| Quests | Medium | Clear goals, silent completion |

### Compared to Top Merge Games — Haven is Missing:
- Timed events (weekend challenges)
- Leaderboards
- Social features (guilds, gifting)
- Limited-time offers
- Comeback mechanics ("welcome back" gifts)
