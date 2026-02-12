## ENGINEERING: Phase 2 Cross-Agent Response

### Agreements

**Event modifiers are dead code -- unanimous BLOCKER, agreed.** Game Design and I both flagged this independently. I've already scoped the 4 insertion points (gem rewards, spawn tier, min-merge override, energy regen). Half-day effort with tests. This ships first.

**Config-driven content pipeline (Live Ops).** Agreed this is necessary. Extracting eventPool, dailyQuestPool, achievement definitions, and pass rewards into JSON files is a clean refactor -- the data is already structured as arrays/objects. I estimate 1-2 days, not because it's complex, but because each extraction needs a loader with schema validation and graceful fallback if a JSON file is malformed. I will not ship config files that silently break the game when someone fat-fingers a comma.

**Micro-text legibility (Art/UX).** Pure CSS changes, no engineering gatekeeping needed. Art/UX can ship this independently. Agreed on 11px minimum.

**Push notifications via service worker (Live Ops).** Agreed this is needed pre-launch. The event bus makes this straightforward -- subscribe to energyFull, eventStart, streakAtRisk events and route to the notification API. 2-3 hours is realistic.

### Challenges

**5 ad placements + ad SDK integration (Monetization).** I challenge the scope, not the principle. An ad SDK is our first external dependency. It introduces async loading, network failure states, GDPR consent flows, and a third-party script with access to our DOM. I will not scatter 5 ad hooks across the codebase in week one. Proposed approach: build an AdAdapter module behind the event bus -- other modules emit 'adOpportunity' with a placement type, the adapter decides whether to show. This isolates the SDK entirely. Start with 2 placements (energy-empty and double-reward), measure fill rates and revenue, then expand. Shipping 5 untested ad placements is how you get 1-star reviews about ads.

**Custom sprites replacing emoji (Art/UX, Marketing).** I agree this is the highest-ROI investment, but the claim that renderCell() needs significant changes understates the real work. Currently board.js:1303-1305 renders `def.symbol` as a text node. Swapping to `<img>` or inline SVG requires: preloading an asset manifest, handling load failures gracefully, ensuring hit-testing still works for drag/swipe, and maintaining the existing CSS glow/shimmer layers that currently wrap a text character. This is a 2-3 day engineering effort alongside the art pipeline, not a drop-in replacement. I'll build it, but Art needs to deliver assets in a single sprite sheet with consistent dimensions, not 50 individual files.

**Share/replay mechanism (Marketing).** I challenge "LOW effort." Capturing a surge replay requires recording board state deltas per frame, which we don't do. A simpler alternative: generate a static "brag card" -- a canvas snapshot of the post-surge board state with stats overlay (merge count, gems earned, streak length). That is genuinely low effort (half day) and shareable via Web Share API. Full replay recording is a v2 feature.

### Proposed Compromises

**Performance Mode (Art/UX) vs. visual fidelity (Game Design).** I propose a device-capability detection pass on first load: check `navigator.hardwareConcurrency` and a quick canvas benchmark. Below threshold, auto-enable Performance Mode (opacity-only pulses, disabled pseudo-element particles, capped animation count). Above threshold, full fidelity. Players never see a toggle; low-end devices get smooth performance automatically. 1-day effort.

**Economy rebalancing (Monetization) vs. retention (Game Design).** Not my call on the numbers, but engineering-relevant: save system versioning (my Phase 1 Finding #2) must ship before any economy rebalance. If we change gem rates without a save migration path, returning players with old-format saves will hit undefined behavior. I'll prioritize save versioning this sprint so both teams can rebalance safely.
