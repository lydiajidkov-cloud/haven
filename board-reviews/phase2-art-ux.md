## ART/UX: Phase 2 Cross-Agent Response

### Agreements

**Marketing: Emoji art is a store conversion blocker.** Fully aligned. Marketing's framing is exactly right -- CPI will be 2-3x higher than necessary. I'll add: the migration path must preserve our CSS tile-styling system (glow halos, tier borders, shimmer effects), which currently wraps emoji glyphs. Custom SVG sprites slotted into the same `renderCell()` pipeline means zero throwaway work. Recommend a phased art pass: 20 hero creatures for store screenshots first, then the 50-item merge chain set, then remaining creatures. This lets Marketing begin UA creative production within 2-3 weeks, not 8.

**Engineering: innerHTML rendering limits UI iteration speed.** Agreed. Shop, Island, and Achievements all rebuild via string concatenation (shop.js:289-441, island.js:234-398). Every time I want to tweak layout, spacing, or add a micro-animation to a shop card, I'm editing nested string HTML -- error-prone and untestable visually without a full reload. I support extracting these into DocumentFragment helpers. Critical constraint: the DOM structure and CSS class names must remain identical during refactoring so my stylesheets don't break.

**Game Design: Post-tutorial surge tooltip is needed.** Agreed. The surge bar is hidden during tutorial (tutorial.js:123-124) and has no discovery moment afterward. A single contextual tooltip on first activation is the right approach -- it teaches without interrupting flow.

**Live Ops: Achievement back-fill pattern is excellent.** Agreed -- and I'll extend the principle to UX. Any new feature screen should show existing progress on first open. An empty screen is a dead screen.

### Challenges

**Monetization: Energy-depletion modal with 3 purchase options.** I push back on the proposed 3-option modal at the exact moment energy hits zero. That moment is already frustrating -- layering a purchase decision on top of negative emotion creates resentment, not conversion. Evidence: our own competitive analysis notes that Merge Dragons' aggressive monetization is their most-cited negative review theme. A 3-option modal (ad / gems / cash) is cognitively heavy during what should be a simple "take a break" signal. **Alternative:** Show a single subtle banner ("Energy refilling -- 12 min") with one unobtrusive "Refill" button. Move the ad-for-energy option to the energy bar itself as a persistent small icon. Let the player initiate, not the game.

**Monetization: Interstitial ads every 15 merges.** Hard no. Merging is the core action -- interrupting it every 15 taps destroys the flow state that Engineering and Game Design both identify as Haven's greatest asset. The surge system requires unbroken merge chains to activate. An interstitial at merge 15 would kill surge momentum mid-build. Rewarded opt-in ads are fine; forced interruptions in the merge loop are not.

**Live Ops: FOMO messaging needs to be "louder."** I challenge the premise. Haven's calm, dark-palette aesthetic is a differentiator against the visual noise of Merge Dragons and Travel Town. Aggressive "LAST CHANCE!" banners and flashing countdown timers would undermine the premium feel that justifies premium pricing. The urgency structures already exist (event countdowns, pass timers, streak resets) -- they don't need to shout.

### Proposed Compromises

**Game Design toast fatigue vs. discovery needs.** Game Design wants post-tutorial toasts at 0s, 30s, 90s, and 180s, plus surge tooltips and hybrid hints. I count 6+ toasts in the first 5 minutes. Compromise: implement a **toast queue with cooldown** -- maximum one toast per 45 seconds, priority-ranked. Surge tooltip gets highest priority. Hybrid hint fires only if no toast has shown in 90 seconds. This teaches without overwhelming.

**Engineering Performance Mode vs. visual fidelity.** I'll sacrifice: per-tier box-shadow pulse animations (replace with opacity-only), `::after` sparkle pseudo-elements on legendary items, and conic-gradient rainbow borders. I will NOT sacrifice: merge-flash feedback, particle bursts on merge, combo color escalation, or the golden pulse on valid merge targets. Those are core juice. Compromise: two tiers -- "Balanced" (cuts decorative animations) and "Minimal" (cuts everything except merge feedback). Ship Balanced as default on devices below a performance threshold detected at startup.

**Live Ops: Push notification permission UX.** Notifications are a retention necessity, but the permission prompt is a one-shot -- if the player declines, we lose the channel permanently. Compromise: delay the notification permission request until after the player's third session or first creature discovery (whichever comes first). Frame it as "Get notified when your creatures earn gems?" -- tie it to a reward the player already values, not a generic system prompt.

**Monetization: Piggy bank visibility on main HUD.** I agree the piggy bank should be more visible, but adding another persistent HUD element risks clutter on a 5.5" screen already showing energy bar, surge bar, gem count, star count, and combo counter. Compromise: show a small piggy icon with gem count only during surge mode (when accumulation is fastest and the player is most engaged). It disappears when surge ends, keeping the default board clean.
