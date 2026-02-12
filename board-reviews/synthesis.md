# Haven: Board of Directors Synthesis

**Date:** 2026-02-11
**Prepared by:** CEO / Studio Head
**Input:** 6 Phase 1 independent reviews + 6 Phase 2 cross-agent challenges

---

## Executive Summary

Haven is a casual mobile merge game with the best core merge feel in the genre -- surge momentum, combo counters with procedural Ode to Joy audio, cross-chain hybrid recipes, and swipe-merge input are genuine first-in-category innovations that no competitor (Merge Dragons, Merge Mansion, Travel Town) offers. The prototype is technically impressive: 20 vanilla JS modules with a clean event-bus architecture, zero external dependencies, and layered "juice" that rivals shipped commercial titles. However, the game is not shippable in its current state. Three blockers must be resolved (broken event modifiers, emoji art ceiling, over-generous free economy), and the absence of ad monetization infrastructure leaves an estimated 40-60% of potential revenue on the table. My verdict: **AMBER -- conditional green light**, contingent on 4-6 weeks of focused pre-soft-launch work across art, economy, and infrastructure.

## Composite Scorecard

### Phase 1 Dimension Scores (All Departments)

#### Game Design
| Dimension | Score | Evidence Summary |
|-----------|-------|------------------|
| Core loop satisfaction | 4.5/5 | Surge momentum (1 merge nearly triggers surge), variable-ratio gem rewards with pity counter, chain reactions with exponential scaling, critical merge 4% chance, near-miss feedback system |
| Progression depth & meaningful choices | 3.5/5 | 70 unique items across 5 base + 4 hybrid chains; cross-chain recipes are genuine discovery mechanic; but order difficulty scaling is linear, caps after 40 orders, no branching goals |
| Session pacing & energy management | 3/5 | 100 energy / 2-min regen is generous for casual; clutter tax mechanic is clever; but no session-end hook, no return incentive, no "come back" prompt beyond browser title change |
| Meta-game engagement | 4/5 | 184 creatures / 16 biomes, companion system with 2 slots and triggered abilities, 8 weekly events, 40-tier battle pass, 50 achievements -- substantial depth for a prototype |
| Tutorial & onboarding effectiveness | 4.5/5 | 5 steps (down from 10), pre-populated board, progressive disclosure, skip button, non-blocking post-tutorial breadcrumbs, debounce tuned to 300ms for snappy feel |

#### Engineering
| Dimension | Score | Evidence Summary |
|-----------|-------|------------------|
| Code architecture & maintainability | 3.5/5 | 20 IIFE modules with event-bus communication; clean separation; but mixed ES5/ES6, 20 script tags with hardcoded load order, some magic numbers remain |
| Performance (render, memory, events) | 3/5 | Cached grid lookup, per-cell locking for concurrent animations, canvas particles with delta-time; but O(n^2) particle splice, full innerHTML rebuild per cell, querySelectorAll on every tap |
| Save system robustness | 2/5 | Single localStorage key, no debouncing (3-5 saves/sec during play), no versioning, no corruption recovery, no backup, ~5MB limit risk as state grows |
| Error handling & edge cases | 2.5/5 | Good board edge cases (energy refund, free shuffle, cell locking, pointer cancel); but only one try/catch in codebase, confirm() for IAP, event modifiers are dead code |
| Scalability & extensibility | 3/5 | Event bus makes adding systems trivial; item/power-up definition tables are extensible; but all content hardcoded in JS arrays, fixed 8x6 board, no build system, no tests |

#### Monetization
| Dimension | Score | Evidence Summary |
|-----------|-------|------------------|
| Economy balance (sinks vs sources) | 2/5 | Free sources vastly outpace sinks: 200-500+ gems/day free vs. most expensive item 900 gems; payer conversion projected <1% |
| IAP/purchase integration naturalness | 3/5 | Starter pack, piggy bank, daily deals well-placed; but confirm() dialogs for purchase, no native flow friction reduction |
| Scarcity & urgency mechanics | 3/5 | Daily deal timers, battle pass countdown, weekly event expiry, login streak reset; but no limited-quantity offers, no VIP exclusivity, no flash sales |
| Revenue ceiling potential | 2/5 | Max single-session spend ~$31; no subscription, no whale bundles ($49.99+), no seasonal cosmetics; ARPPU will be well below $20 benchmark |
| Ad monetization readiness | 1/5 | Single rewarded ad button buried in shop; no interstitials, no ad-to-continue, no double-reward ads; zero SDK integration; leaving 40-60% of casual game revenue untapped |

#### Art/UX
| Dimension | Score | Evidence Summary |
|-----------|-------|------------------|
| Visual coherence & style consistency | 3.5/5 | Consistent dark palette via CSS custom properties, chain identity through border-radius silhouettes, unified card gradients across 12 CSS files; deducted for emoji-as-art ceiling |
| "Juice" factor | 4.5/5 | 30+ keyframe animations, 4-layer merge feedback (flash + pop + particles + audio + haptic), combo color escalation, Ode to Joy musical progression, legendary rainbow borders |
| UX clarity & information hierarchy | 3.5/5 | Spotlight tutorial system, valid merge target pulses, near-miss highlighting, order delivery pulses; but 8-9px fonts in multiple UI elements, 3px tier dots, readability risk for 35+ demographic |
| Mobile-first design | 4/5 | Viewport meta, safe area insets, touch-action manipulation, pull-to-refresh blocked, responsive breakpoints, swipe-merge with undo; but some touch targets below 44pt minimum |
| Store/marketing screenshot potential | 2/5 | Emoji renders differently per OS/browser, destroying screenshot consistency; dark UI misaligned with merge genre's bright/whimsical expectations; zero custom promotional assets |

#### Marketing
| Dimension | Score | Evidence Summary |
|-----------|-------|------------------|
| Hook clarity | 3/5 | "Merge to restore an island" is simple enough; but opens on a grid of emojis with no visible narrative goal; surge/combo invisible until played, can't sell in screenshots |
| Competitive differentiation | 4/5 | First-in-genre: surge momentum, combo counter with Ode to Joy, cross-chain recipes, swipe-merge; demonstrable in video ads as thumb-stopping content |
| Shareable/viral moments | 2/5 | Zero social features; creature discovery is inherently shareable but no share button exists; Ode to Joy combos are TikTok-ready but no capture mechanism |
| Character/IP appeal | 3.5/5 | 184 named creatures with personality-rich lore, seasonal sets, legendary characters with genuine appeal; but all emoji-rendered, can't compete visually with hand-drawn competitor art |
| Store listing readiness | 2/5 | Manifest.json and mobile viewport exist; but emoji-based screenshots will read as "prototype" in App Store; none of 4 tab screens pass the thumb-stopping test |

#### Live Ops
| Dimension | Score | Evidence Summary |
|-----------|-------|------------------|
| Event system depth & variety | 3.5/5 | 8 weekly events with gameplay modifiers (gem multiplier, spawn boost, min-merge override); bronze/silver/gold tiers with exclusive creatures; but 8-week full cycle, industry benchmark is 73-89 events/month |
| Content pipeline sustainability | 2/5 | All content hardcoded in JS arrays; no JSON config, no CMS; every content change requires engineer + code deploy; live ops team cannot operate independently |
| Retention mechanic layers | 4.5/5 | 6 interconnected layers: session (surge/combo), daily (login/quests), weekly (events), monthly (battle pass), long-term (creatures/achievements/island), return (offline earnings) |
| FOMO & urgency calibration | 3/5 | Event countdowns, pass timers, streak resets exist structurally; but no scarcity messaging ("EXCLUSIVE"), no push-style urgency on deals, silent streak resets |
| Reactivation potential | 3/5 | Welcome-back screen with animated worker earnings, energy restoration; but no push notifications, no email reactivation, document.title trick only works on desktop |

### Overall Assessment

**Strongest areas (4+ scores):**
- Core loop satisfaction (4.5) -- the merge feel is genuinely best-in-genre
- Juice factor (4.5) -- layered feedback rivals commercial titles
- Tutorial & onboarding (4.5) -- clean progressive disclosure
- Retention mechanic layers (4.5) -- 6 interconnected retention systems
- Meta-game engagement (4.0) -- 184 creatures, companions, events, battle pass
- Competitive differentiation (4.0) -- first-in-genre mechanics
- Mobile-first design (4.0) -- thoughtful touch optimization

**Weakest areas (sub-2.5 scores):**
- Ad monetization readiness (1.0) -- zero infrastructure for 40-60% of revenue
- Economy balance (2.0) -- free gems catastrophically generous
- Revenue ceiling (2.0) -- no whale accommodation, max spend ~$31
- Save system robustness (2.0) -- no debouncing, no corruption recovery
- Content pipeline sustainability (2.0) -- hardcoded content, no CMS
- Store screenshot potential (2.0) -- emoji art is unmarketable
- Store listing readiness (2.0) -- will read as student project

**Aggregate: 3.1/5 across all 30 dimensions.** The game excels at what players experience (loop, juice, tutorial, retention design) and fails at what the business needs (monetization, art assets, infrastructure, content pipeline). This is a prototype built by someone who deeply understands game design but has not yet built for commercial viability.

## Consensus Items (Where All Departments Agree)

These are settled. No debate needed.

- **Event modifiers are broken and must be fixed before any player-facing test.** Game Design (Finding #4), Engineering (Finding #1), Monetization (Phase 2 agreement), and Live Ops (Phase 2 agreement) all independently identified this as a BLOCKER. The modifier API exists, the data exists, but the gameplay code never reads them. Players who grind Crystal Rush for "2x gems" and get nothing will leave 1-star reviews.

- **Emoji art is a hard blocker for store conversion and paid UA.** Art/UX (Finding #1), Marketing (Finding #1), Monetization (Phase 2 agreement) all aligned. CPI will be 2-3x higher than necessary. Custom sprites are the single highest-ROI investment.

- **The core merge feel is best-in-genre and must be protected.** Game Design, Engineering, Art/UX, and Marketing all call out surge momentum, combo counter, procedural audio, and swipe-merge as genuine competitive advantages no competitor has. Any economy rebalancing or performance optimization must not degrade the merge feel.

- **The event bus architecture is production-quality.** Engineering (Finding #5), Marketing (Phase 2), and Live Ops all recognize the pub/sub pattern as the right foundation for analytics, A/B testing, ad integration, and replay capture. Protect and extend it.

- **Content must move from hardcoded JS to config-driven JSON.** Engineering (Phase 2 agreement), Live Ops (Finding #1), and Monetization (Phase 2 agreement) all aligned. Live ops cannot operate without it.

- **Save system needs hardening before real users.** Engineering (Finding #2) and Monetization (Phase 2 agreement) aligned. Gem purchases lost to localStorage corruption mean chargebacks and 1-star reviews.

- **Push notification infrastructure is needed before soft launch.** Live Ops (Finding #4), Marketing (Phase 2), and Art/UX (Phase 2 compromise on permission timing) all agreed. The only debate is UX timing of the permission prompt, not whether to build it.

- **Daily login streak reset should not be silent.** Game Design (Phase 2 agreement), Live Ops (Finding #6), and Monetization (Phase 2 compromise) all aligned. Players losing a 6-day streak with no warning is hostile design.

## Resolved Conflicts (Phase 2 Produced a Compromise)

### 1. Economy Rebalancing: Blanket Cut vs. Phased Approach
- **Original tension:** Monetization wanted 60-70% cut to free gem income immediately. Game Design argued this kills the dopamine architecture (surge bonuses, chain reaction gems, pity timer) that creates "one more merge" pull.
- **Compromise reached:** Phased approach. Phase 1 (pre-launch): add new gem sinks (board expansion 500/1000/2000 gems, creature evolution 200-800 gems, cosmetic tiles 300 gems) AND raise merge gem threshold from tier 3 to tier 4 (~30% income cut). Phase 2 (soft launch): measure real accumulation over 14 days. Phase 3: tune sources from data. Event and battle pass rewards ring-fenced at current levels for first two seasons per Live Ops request.
- **Signed off by:** Game Design, Monetization, Live Ops. **I endorse this approach.** Sinks before source cuts is the right sequencing -- you cannot measure whether income is "too generous" until meaningful sinks exist.

### 2. Full-Screen Celebration Overlay: Tier 5+ vs. Tier 7+
- **Original tension:** Art/UX wanted full-screen celebrations for tier 5+ merges, creature discoveries, and hybrid unlocks. Game Design argued tier 5 fires too frequently during surge streaks and interrupts the flow state.
- **Compromise reached:** Full-screen overlay for tier 7+ merges, creature discoveries, and first hybrid unlocks only. Tier 5-6 get enhanced particle burst with brief banner. Overlay is tap-skippable, auto-dismisses in 3 seconds. Art/UX builds one configurable celebration system shared across events, creatures, battle pass, and max-tier merges (per Live Ops request).
- **Signed off by:** Game Design, Art/UX, Live Ops.

### 3. Ad SDK Integration: 5 Placements vs. 2 Starter Placements
- **Original tension:** Monetization wanted 5 ad placements (energy-empty, double-reward, 4th daily quest, interstitial every 15 merges, energy regen speed-up). Engineering challenged the scope as first external dependency introducing async loading, GDPR consent, and third-party DOM access. Art/UX issued a hard no on interstitials during merging.
- **Compromise reached:** Build an AdAdapter module behind the event bus (Engineering's architecture). Start with 2 placements: energy-empty modal and double-reward after tier 4+ merges. Measure fill rates and revenue before expanding. Interstitials during merge loop permanently rejected. Art/UX stipulated: energy-empty gets a subtle banner with one "Refill" button, not a 3-option modal at the moment of frustration.
- **Signed off by:** Engineering, Monetization, Art/UX. **I side with the 2-placement start.** Shipping 5 untested ad placements is how you get 1-star reviews. Prove the adapter works, measure revenue, then expand.

### 4. Performance Mode vs. Visual Fidelity
- **Original tension:** Art/UX recommended performance mode for low-end Android. Game Design worried it diminishes aspirational value of high-tier items.
- **Compromise reached:** Engineering builds auto-detection via `navigator.hardwareConcurrency` + canvas benchmark on first load. Two tiers: "Balanced" (cuts decorative animations: per-tier box-shadow pulse, ::after sparkle, conic-gradient rainbow) and "Minimal" (cuts everything except merge feedback). Merge-flash, particle bursts, combo escalation, and golden merge-target pulses are never cut. Monetization stipulated purchase-moment animations (piggy bank break, battle pass unlock, deal reveal) are excluded from all performance reductions.
- **Signed off by:** Engineering, Art/UX, Game Design, Monetization.

### 5. Rare Creature Early Access: Free vs. Starter Pack Incentive
- **Original tension:** Game Design wanted guaranteed rare creature in first 10 creature-chain merges to fill empty companion slots. Monetization pushed back -- giving rares away free teaches "just wait and the game gives you everything."
- **Compromise reached:** Starter pack ($1.99) includes a "Starter Companion Egg" guaranteeing one rare creature. Players who refuse to spend still discover rares through normal play. This makes the starter pack dramatically more compelling while preserving rare creature aspirational value.
- **Signed off by:** Game Design, Monetization. **Smart compromise.** Solves both the empty-companion-slot problem and the starter pack conversion rate in one move.

### 6. Config-Driven Content: Full Extraction vs. Prioritized Extraction
- **Original tension:** Live Ops wanted all content extracted to JSON. Monetization and Engineering wanted to prioritize by business impact.
- **Compromise reached:** Phased extraction: events.json first (unblocks weekly content calendar), then shop offers and event-linked bundles (unblocks monetization A/B testing), then daily-quests.json and pass-rewards.json. Live Ops co-owns the schema spec to ensure it supports scheduled content (start/end dates, priority weights) from day one. Game Design stipulated modifier values must fall within pre-approved ranges; anything outside requires sign-off.
- **Signed off by:** Engineering, Live Ops, Monetization, Game Design.

### 7. Urgent/Mega Orders: Always-On vs. Calendar-Driven
- **Original tension:** Game Design proposed urgent orders with timers and mega orders requiring 3 items. Live Ops flagged collision risk with weekly events (urgent order during Speed Demon trivializes the timer).
- **Compromise reached:** Urgent and mega orders become config-driven content scheduled by Live Ops via the content calendar. Game Design owns mechanic design; Live Ops owns scheduling. Prevents event/order collisions and adds another content calendar lever.
- **Signed off by:** Game Design, Live Ops.

### 8. Push Notification Permission Timing
- **Original tension:** Live Ops wanted push notifications ASAP for event launches and streak warnings. Art/UX warned the permission prompt is one-shot -- aggressive prompting kills the channel permanently.
- **Compromise reached:** Delay permission request until after 3rd session or first creature discovery (whichever first). Frame as "Get notified when your creatures earn gems?" -- tied to a reward the player already values. Marketing and Live Ops jointly define trigger catalogue; neither team sends notifications without the other's sign-off.
- **Signed off by:** Art/UX, Live Ops, Marketing.

### 9. Custom Art Phasing
- **Original tension:** Art/UX wanted full 50-item sprite sheets before any UA. Marketing wanted to start producing creatives within 1 week. Monetization wanted A/B testing to begin immediately.
- **Compromise reached:** Three-phase art pipeline: Phase A (1 week) -- 10 hero creatures for store screenshots and ad creatives. Phase B (week 2) -- 20 highest-tier items across all chains for gameplay footage. Phase C (post-soft-launch) -- remaining items based on actual player engagement data. Marketing begins creative production after Phase A while art continues in parallel.
- **Signed off by:** Marketing, Art/UX, Monetization.

## Unresolved Tensions (Flagged for Human Decision)

### Decision 1: Energy-Depletion Monetization UX
- **Monetization's position:** Energy depletion is the #1 purchase moment in merge games. Show a 3-option modal (watch ad / spend gems / buy with money) at the exact moment energy hits zero. This single change could increase revenue 20-30%.
- **Art/UX's position:** That moment is already frustrating. Layering purchase decisions on negative emotion creates resentment. Show a subtle banner with one "Refill" button. Let the player initiate.
- **Phase 2 partial resolution:** Agreed on no 3-option modal, but the "subtle banner" approach may leave significant revenue on the table. The exact design of the energy-empty experience remains contested.
- **Stakes:** This is a 20-30% revenue swing in either direction. Too aggressive = 1-star reviews about monetization (Merge Dragons' #1 complaint). Too subtle = players leave without knowing they could refill.
- **Decision needed:** How prominent should the energy-empty monetization prompt be? Options: (A) Subtle banner with single button, player-initiated (Art/UX preference). (B) Non-blocking bottom sheet with 2 options -- watch ad for free or buy refill (middle ground). (C) Centered modal with 3 options, dismissible (Monetization preference). **My recommendation: Option B.** A/B test during soft launch.

### Decision 2: FOMO Messaging Aggressiveness
- **Live Ops' position:** Haven's urgency structures exist but aren't loud enough. Need "EXCLUSIVE" badges, "LAST CHANCE!" banners, and more aggressive countdown styling to match competitor benchmarks.
- **Art/UX's position:** Haven's calm, dark-palette aesthetic is a differentiator. Aggressive FOMO banners undermine the premium feel that justifies premium pricing. The structures exist; they don't need to shout.
- **Stakes:** This defines Haven's brand identity. Aggressive FOMO = higher short-term conversion, potential perception as "just another predatory merge game." Calm approach = lower conversion, but premium positioning that attracts higher-value players and better press.
- **Decision needed:** Where does Haven sit on the FOMO spectrum? Options: (A) Minimal -- current approach, trust players to notice timers. (B) Moderate -- add "EXCLUSIVE" badges on event creatures and "X hours left" on deals, but no flashing/shouting. (C) Aggressive -- match competitor FOMO language with banners and countdown urgency. **My recommendation: Option B.** Haven's premium feel is a differentiator worth preserving, but completely silent urgency wastes the FOMO infrastructure we built.

### Decision 3: Social Features Timing and Scope
- **Marketing's position:** Zero social features means viral coefficient k=0. Every install is paid. Even a simple share button and creature collection sharing would help. Long-term, card trading drives retention.
- **Monetization's position:** Social features (trading) actively complicate the economy -- traded items bypass the shop. Defer until core spend loop is validated and server-side economy controls exist.
- **Stakes:** Social features could reduce CPI through organic installs and improve retention through social bonds. But premature social features without server-side controls create exploit vectors that undermine monetization.
- **Decision needed:** When do social features ship? Options: (A) Share button only for soft launch (1-2 days, no economy risk). (B) Share button + simple friend leaderboard for soft launch, trading deferred to post-validation. (C) Full social suite (sharing, friends, trading) post-soft-launch once server-side controls exist. **My recommendation: Option A for soft launch, with Option C planned for the post-validation roadmap.** A share button has zero economy risk and Engineering confirmed a static "brag card" via Web Share API is half a day of work.

### Decision 4: Narrative Investment Level
- **Marketing's position:** Narrative-driven ads achieve 30-40% lower CPI. Haven needs a guide character and mystery dialogue for ad creatives.
- **Game Design's position:** Haven's identity is tactile and musical, not textual. A guide character creates story expectations we cannot sustain at our content velocity. Maximum: 2-3 sentence flavour text per island boss.
- **Stakes:** This determines Haven's UA strategy. Narrative ads = lower CPI but ongoing story content costs. Gameplay ads = higher CPI but zero narrative maintenance burden.
- **Decision needed:** How much narrative to add? Options: (A) No change -- pure gameplay marketing. (B) 2-3 sentences of flavour text per island boss (Game Design's ceiling). (C) Simple guide character with 10-15 mystery lines spread across island progression (Marketing's ask). **My recommendation: Option B for soft launch, with option to expand to C if CPI data supports narrative ads.** Game Design is right that we cannot sustain deep story at our content velocity. But Marketing is right that even light narrative hooks reduce CPI. Boss flavour text is a low-cost test.

## Prioritized Action List (Top 10)

### 1. Wire Event Modifiers into Gameplay
- **Why it matters:** Players grinding events for advertised bonuses that don't work will leave 1-star reviews and never return -- this is a trust-breaking bug identified by 4 of 6 departments.
- **Effort estimate:** Half day (2-4 hours with testing)
- **Owner:** Engineering (4 insertion points in board.js and game.js)
- **Dependencies:** None
- **Phase 2 status:** Consensus (Game Design, Engineering, Monetization, Live Ops all flagged independently)

### 2. Harden Save System (Debouncing + Versioning + Backup)
- **Why it matters:** Without save robustness, any real-money transaction is at risk of being lost to localStorage corruption, causing chargebacks and trust destruction.
- **Effort estimate:** Half day
- **Owner:** Engineering
- **Dependencies:** Must ship before any economy rebalancing (Engineering Phase 2 requirement) and before real IAP integration
- **Phase 2 status:** Consensus (Engineering, Monetization aligned; Game Design agreed on 200ms debounce with beforeunload flush)

### 3. Commission Custom Art Assets (Phase A: 10 Hero Creatures)
- **Why it matters:** Emoji art caps store conversion at sub-1% where competitors achieve 3-5%. No marketing spend is viable until custom art exists for screenshots and ad creatives.
- **Effort estimate:** 1 week (external illustrator), parallel with engineering work
- **Owner:** Art/UX (art direction) + external contractor (production)
- **Dependencies:** Engineering must prepare renderCell() for sprite integration (2-3 day engineering effort alongside)
- **Phase 2 status:** Consensus on need; compromise reached on phased approach (10 creatures > 20 items > remaining)

### 4. Build Ad Adapter Module + First 2 Placements
- **Why it matters:** Ad revenue represents 40-60% of casual game income. Haven currently generates $0 from ads. Even 2 placements (energy-empty, double-reward) at industry fill rates could generate $5-8 ARPU.
- **Effort estimate:** 3-5 days (adapter architecture + SDK integration + 2 placements + GDPR consent flow)
- **Owner:** Engineering (adapter architecture), Monetization (placement strategy and SDK selection)
- **Dependencies:** Event bus architecture (already exists). Energy-empty UX design decision (Unresolved Tension #1) must be resolved first.
- **Phase 2 status:** Compromise (2 placements, not 5; adapter behind event bus; no interstitials during merge loop)

### 5. Add Gem Sinks (Board Expansion + Creature Evolution + Cosmetic Tiles)
- **Why it matters:** The economy cannot be properly balanced until meaningful sinks exist. Current sinks are too shallow to absorb 200-500+ free gems/day. Sinks must precede source cuts.
- **Effort estimate:** 2-3 days
- **Owner:** Game Design (sink design and pricing) + Engineering (implementation)
- **Dependencies:** Save versioning (Action #2) must ship first so economy changes don't break old saves
- **Phase 2 status:** Compromise (Game Design's phased approach: sinks first, then measure, then tune sources)

### 6. Extract Content to Config-Driven JSON (Events First, Then Shop)
- **Why it matters:** Live Ops cannot operate independently of engineering without config-driven content. Every new event or seasonal offer currently requires a code deploy.
- **Effort estimate:** 1-2 days (events.json first, then shop offers)
- **Owner:** Engineering (loader + schema validation) + Live Ops (co-owns schema spec for scheduling support)
- **Dependencies:** None, but prioritize events.json before shop config
- **Phase 2 status:** Consensus (all departments aligned on need; compromise on extraction sequence and modifier guard rails)

### 7. Implement Return Incentives (Welcome Back Chest + Streak Warning)
- **Why it matters:** D1 retention will suffer without compelling return reasons. Players leave when energy depletes and have no reason to come back. Silent streak resets are hostile.
- **Effort estimate:** 1 day total (half day for Welcome Back chest scaling, 2 hours for streak-at-risk warning at 20 hours, 2 hours for streak save mechanic at 50 gems)
- **Owner:** Game Design (reward tuning) + Engineering (implementation) + Monetization (streak save as gem sink / ad opportunity)
- **Dependencies:** None
- **Phase 2 status:** Consensus on streak warning; compromise on streak-save-for-gems as monetization moment

### 8. Add Push Notification Infrastructure (Service Worker)
- **Why it matters:** D2-D7 retention is heavily driven by reactivation nudges. Without push notifications, Haven relies entirely on player habit. "Your workers earned 45 gems!" and "Crystal Rush starts now!" are proven reactivation messages.
- **Effort estimate:** 2-3 hours for service worker + notification logic; ongoing trigger definition with Marketing/Live Ops
- **Owner:** Engineering (service worker) + Live Ops and Marketing (jointly define trigger catalogue and frequency caps)
- **Dependencies:** Notification permission UX (compromise reached: delay until 3rd session or first creature discovery)
- **Phase 2 status:** Consensus on need; compromise on permission timing

### 9. Raise Merge Gem Threshold from Tier 3 to Tier 4
- **Why it matters:** The single most impactful immediate economy adjustment (~30% reduction in merge gem income) that Game Design agreed to as an acceptable change that doesn't touch the reward moments that feel best.
- **Effort estimate:** 30 minutes (single constant change + testing)
- **Owner:** Game Design (approval) + Engineering (implementation)
- **Dependencies:** Save versioning (Action #2) should ship first; gem sinks (Action #5) should ship concurrently so the economy tightens from both sides
- **Phase 2 status:** Compromise (Game Design conceded this specific change as part of the phased economy approach)

### 10. Build Lightweight Share Mechanism (Static Brag Card)
- **Why it matters:** Viral coefficient is currently k=0. Every install must be paid. A static brag card (canvas snapshot of post-surge board with stats overlay) shared via Web Share API gives players a free organic acquisition channel at minimal engineering cost.
- **Effort estimate:** Half day
- **Owner:** Engineering (brag card generation) + Marketing (share destinations and social copy)
- **Dependencies:** None, but more impactful after custom art assets exist (Action #3)
- **Phase 2 status:** Compromise (Engineering proposed static brag card as realistic alternative to Marketing's full replay capture; full replay is v2)

## Go/No-Go Recommendation

### **AMBER -- Conditional Green Light**

Haven is worth betting the studio on, but not in its current state. Here is my detailed reasoning.

### Kill Criteria Assessment

| Metric | Benchmark | Kill Threshold | Haven Projection | Assessment |
|--------|-----------|----------------|-----------------|------------|
| D1 Retention | >35% | Kill below 25% | 28-35% currently (no return incentive, no push notifications); 38-42% projected with Actions #7 and #8 | **AT RISK without fixes, VIABLE with fixes** |
| D7 Retention | >12% | Kill below 8% | 10-14% currently (strong retention layers but event modifiers broken, mid-game monotony); 15-18% projected with working events + return incentives | **VIABLE with fixes** |
| LTV > 3x CPI | LTV $1.50-3.00+ needed | LTV < CPI | LTV currently projected <$0.50 (Monetization estimate) due to zero ad revenue and over-generous free economy; LTV $2.50-4.00 projected with ad adapter + economy rebalancing | **NOT VIABLE without fixes, VIABLE with fixes** |
| Revenue per Download | $3.20-$4.70 benchmark | Below $1.00 | Currently ~$0.30-0.50 (no ads, weak conversion); $2.80-4.20 projected with full monetization stack | **NOT VIABLE without fixes, APPROACHING benchmark with fixes** |

### What Must Happen Before Soft Launch (4-6 Weeks)

These are non-negotiable. The game does not go to soft launch without all of these:

1. **Event modifiers wired in** (Action #1) -- half day. Ship this week.
2. **Save system hardened** (Action #2) -- half day. Ship this week.
3. **Custom art Phase A complete** (Action #3) -- 1 week with external contractor.
4. **Ad adapter + 2 placements live** (Action #4) -- 3-5 days after art is ready for testing.
5. **Gem sinks implemented** (Action #5) -- 2-3 days.
6. **Content extracted to JSON** (Action #6) -- 1-2 days.
7. **Return incentives implemented** (Action #7) -- 1 day.
8. **Push notifications working** (Action #8) -- 2-3 hours.
9. **Merge gem threshold raised to tier 4** (Action #9) -- 30 minutes.
10. **Micro-text legibility fixed** (11px minimum) -- 1-2 days, Art/UX can ship independently.

### What Can Wait Until After Soft Launch

- Full economy rebalancing Phase 2-3 (needs real player data)
- Brag card / share mechanism (more impactful with custom art)
- Event pool expansion to 16+ (8 events covers first 2 months)
- Battle pass exclusive cosmetic at tier 40
- Piggy bank urgency mechanics (capacity cap, HUD visibility)
- Starter pack timing gate (needs conversion funnel data)
- Board expansion mechanic (high-impact but high-effort)
- Inventory/storage system (proven monetization lever but substantial scope)
- Performance mode auto-detection (ship after soft launch device telemetry)
- Full replay/capture system for social sharing
- Narrative expansion beyond boss flavour text
- Automated test suite (ship incrementally, start with merge logic)

### The Single Biggest Risk to the Business

**The free economy.** Not the emoji art (that's fixable with money and time), not the broken event modifiers (that's a half-day fix), not the missing ad infrastructure (that's a week of work). The fundamental risk is that Haven's economy is designed to make players feel good, not to make them spend money. The gem sources are generous because generous feels better. The power-ups are earnable because earnable feels fair. The clutter tax is soft because soft is elegant.

Every one of those design instincts is correct from a game design perspective and catastrophic from a business perspective. The phased compromise (sinks first, measure, then tune) is the right approach, but it requires discipline. If soft launch data shows 95% of players never open the shop because they never need to, the studio must be willing to tighten the economy even though it will make the game feel slightly less generous. The alternative is a beautifully designed game that generates $0.30 per download in a market where viability requires $3.20+.

I have seen studios die because they loved their game too much to make it profitable. Haven's core loop deserves to reach millions of players. That only happens if it generates the revenue to fund user acquisition. The economy rebalancing is not about making the game worse -- it is about giving Haven the commercial foundation to survive.

### Final Verdict

**GREEN LIGHT to proceed to soft launch preparation, with a 4-6 week pre-launch sprint addressing the 10 priority actions above.** Re-evaluate for formal soft launch GO after Actions #1-9 are complete and custom art Phase A is delivered. If soft launch D1 falls below 30% or LTV/CPI ratio falls below 2x after 14 days of data, convene an emergency board review.

The game is genuinely good. The merge feel is the best I have seen in the genre. The question is not "is this game worth making?" -- it is "can we build a business around it?" The answer is yes, but only if we treat the next 6 weeks as seriously as we treated the prototype.

---

*This synthesis reflects the consolidated judgment of 6 department heads across 12 reports (Phase 1 independent reviews + Phase 2 cross-agent challenges). All findings are referenced by department and finding number. Disagreements are documented with the positions, stakes, and recommended resolutions. The CEO's recommendations are noted where they deviate from or endorse specific department positions.*
