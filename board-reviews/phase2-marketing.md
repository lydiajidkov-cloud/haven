## MARKETING: Phase 2 Cross-Agent Response

### Agreements

**Art/UX: Emoji blocker is confirmed and worse than I thought.** Art/UX's finding that emoji renders differently across iOS, Android, and Samsung means we cannot even produce consistent store screenshots. This is not just an aesthetic problem — it is a functional one. I fully support commissioning custom SVG/WebP sprites as the single highest-ROI investment. I would go further: we need **20 hero creatures** done first, not 50 base items. Creatures sell the game. Items are furniture.

**Game Design: Surge/combo is the secret weapon.** Agreed without reservation. The musical escalation (Ode to Joy emerging from merges) is the most marketable mechanic I have seen in a merge game. No competitor has anything like it. Game Design's recommendation to add a tooltip when surge first activates is correct — if players do not know it exists, we cannot build ads around players reacting to it.

**Engineering: The event bus architecture enables replay/share.** Engineering's suggestion to add event logging with timestamps (Finding #5) is exactly the infrastructure Marketing needs for a replay-capture system. A recorded surge chain, auto-edited to 15 seconds, with a share button — that is our TikTok strategy. I formally request this be prioritised.

**Live Ops: 8 rotating events are marketing-friendly.** Weekly rotation gives us a reason to post every week. "Crystal Rush is LIVE" social posts, themed ad creatives per event — this is a content calendar. I agree with expanding to 16+, but 8 is workable for soft launch if the content pipeline gets unblocked.

**Monetization: Starter pack timing matters for ads.** Monetization's recommendation to gate the starter pack behind 20+ merges aligns with ad strategy. If our video ads end with "Download now — starter pack waiting," the player needs to experience the game before seeing the offer, not land on it cold.

### Challenges

**Monetization: Do NOT rebalance the economy before we lock ad creatives.** Monetization wants to cut free gem income by 60-70% and triple power-up thresholds. I understand the reasoning. But if we build video ads showing gem showers and chain reactions at current generosity, then ship a nerfed version, our Day 1 retention collapses because the ad-to-gameplay gap destroys trust. The economy rebalance and the ad creative pipeline must be synchronised. I need 2 weeks of stable economy before I produce creatives. Rebalance first, then freeze, then I build ads.

**Art/UX: The "full-screen celebration" is less urgent than a share button.** Art/UX's Finding #2 calls for a celebration overlay for tier 5+ merges and creature discoveries. That is nice polish, but Marketing's priority is a **share button on the existing creature discovery modal**. The hatchery modal already exists (hatchery.js:172-213) with rarity celebration animation. Adding "Share" to that screen costs 1 day. A full-screen cinematic costs 3-5 days. Do the share button first.

**Live Ops: Marketing FOMO without push notifications is not impossible.** Live Ops flags no push notification infrastructure as a risk for reactivation. True. But Marketing can partially compensate with external channels — email drip campaigns, social media event announcements, even SMS for opted-in users. Push notifications are ideal but not a blocker for soft launch marketing.

### Proposed Compromises

**Art investment phasing (Marketing + Art/UX + Engineering).** Full custom art for 50+ items is weeks of work. I propose a three-phase approach: (1) **Phase A — 10 hero creatures** as marketing-ready illustrations for store screenshots and ad creatives (1 week). (2) **Phase B — 20 highest-tier items** across all chains for gameplay footage (week 2). (3) **Phase C — remaining items** post-soft-launch based on what players actually engage with. This lets Marketing start producing creatives after Phase A while Art continues in parallel.

**Replay/share system (Marketing + Engineering).** Engineering has no share or replay mechanism. I propose a lightweight "Surge Replay" feature: the event bus logs the last surge chain, auto-generates a 10-15 second clip (or animated screenshot sequence), and surfaces a share button at the end-of-surge celebration. Engineering builds the event capture; Marketing provides the share destinations (native share API covers Instagram, TikTok, WhatsApp). Estimated k-factor improvement: 0.05-0.10 — small but free installs compound.

**Event marketing without push (Marketing + Live Ops).** For soft launch, I will build a social content calendar around the 8-week event rotation. Each event gets a themed social post, an email to opted-in players, and a refreshed ad creative highlighting the modifier ("This week: merge only 2 items!"). Live Ops builds push notifications in parallel. We converge when push is ready.

**Creature-driven campaigns (Marketing + Game Design).** Game Design's 184 named creatures with personality lore are unused IP gold. I propose a "Creature of the Week" social campaign that introduces one creature per week with its lore, timed to the matching event. This costs nothing to produce, builds brand identity before launch, and tests which creatures resonate for future ad creatives. If Arcanum (the starlight deer) outperforms Nibbles (the rabbit) on social engagement, that tells us which creature leads our App Store icon.
