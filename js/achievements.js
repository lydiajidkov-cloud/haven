// Haven - Achievement System: Permanent milestones with progress tracking
'use strict';

const Achievements = (() => {

    // ─── ACHIEVEMENT DEFINITIONS (50 total) ──────────────────────────

    const definitions = [

        // ── Merge Mastery (10) ───────────────────────────────────────
        { id: 'mm1',  name: 'First Steps',        desc: 'Perform your first merge',             icon: '\u2728', category: 'Merge Mastery',   type: 'total_merges',    target: 1,    reward: { gems: 10,  stars: 1 } },
        { id: 'mm2',  name: 'Getting Hooked',      desc: 'Perform 100 merges',                   icon: '\u{1F525}', category: 'Merge Mastery', type: 'total_merges', target: 100,  reward: { gems: 25,  stars: 2 } },
        { id: 'mm3',  name: 'Merge Addict',        desc: 'Perform 500 merges',                   icon: '\u{1F4AA}', category: 'Merge Mastery', type: 'total_merges', target: 500,  reward: { gems: 50,  stars: 3 } },
        { id: 'mm4',  name: 'Merge Master',        desc: 'Perform 1,000 merges',                 icon: '\u{1F451}', category: 'Merge Mastery', type: 'total_merges', target: 1000, reward: { gems: 100, stars: 5 } },
        { id: 'mm5',  name: 'Merge Legend',         desc: 'Perform 5,000 merges',                 icon: '\u{1F31F}', category: 'Merge Mastery', type: 'total_merges', target: 5000, reward: { gems: 200, stars: 10 } },
        { id: 'mm6',  name: 'Chain Starter',        desc: 'Trigger your first chain reaction',    icon: '\u26A1',    category: 'Merge Mastery', type: 'chain_reaction', target: 1, reward: { gems: 15, stars: 1 } },
        { id: 'mm7',  name: 'Chain Lightning',      desc: 'Trigger a x3 chain reaction',          icon: '\u26A1',    category: 'Merge Mastery', type: 'max_chain',      target: 3, reward: { gems: 30, stars: 2 } },
        { id: 'mm8',  name: 'Chain Tornado',        desc: 'Trigger a x5 chain reaction',          icon: '\u{1F32A}\uFE0F', category: 'Merge Mastery', type: 'max_chain', target: 5, reward: { gems: 75, stars: 4 } },
        { id: 'mm9',  name: 'Power Merge',          desc: 'Merge 5 items at once',                icon: '\u{1F4A5}', category: 'Merge Mastery', type: 'big_merge',     target: 5, reward: { gems: 30, stars: 2 } },
        { id: 'mm10', name: 'Mega Merge',           desc: 'Merge 7 items at once',                icon: '\u{1F4A5}', category: 'Merge Mastery', type: 'big_merge',     target: 7, reward: { gems: 75, stars: 4 } },

        // ── Tier Climber (8) ─────────────────────────────────────────
        { id: 'tc1', name: 'Tier 3 Reached',   desc: 'Create a Tier 3 item',     icon: '\u2B06\uFE0F', category: 'Tier Climber', type: 'reach_tier', target: 3, reward: { gems: 10, stars: 1 } },
        { id: 'tc2', name: 'Tier 4 Reached',   desc: 'Create a Tier 4 item',     icon: '\u2B06\uFE0F', category: 'Tier Climber', type: 'reach_tier', target: 4, reward: { gems: 15, stars: 1 } },
        { id: 'tc3', name: 'Tier 5 Reached',   desc: 'Create a Tier 5 item',     icon: '\u2B06\uFE0F', category: 'Tier Climber', type: 'reach_tier', target: 5, reward: { gems: 25, stars: 2 } },
        { id: 'tc4', name: 'Tier 6 Reached',   desc: 'Create a Tier 6 item',     icon: '\u2B06\uFE0F', category: 'Tier Climber', type: 'reach_tier', target: 6, reward: { gems: 40, stars: 3 } },
        { id: 'tc5', name: 'Tier 7 Reached',   desc: 'Create a Tier 7 item',     icon: '\u2B06\uFE0F', category: 'Tier Climber', type: 'reach_tier', target: 7, reward: { gems: 60, stars: 4 } },
        { id: 'tc6', name: 'Tier 8 Reached',   desc: 'Create a Tier 8 item',     icon: '\u2B06\uFE0F', category: 'Tier Climber', type: 'reach_tier', target: 8, reward: { gems: 80, stars: 5 } },
        { id: 'tc7', name: 'Tier 9 Reached',   desc: 'Create a Tier 9 item',     icon: '\u2B06\uFE0F', category: 'Tier Climber', type: 'reach_tier', target: 9, reward: { gems: 100, stars: 6 } },
        { id: 'tc8', name: 'Pinnacle',         desc: 'Create a max-tier item',   icon: '\u{1F3C6}', category: 'Tier Climber', type: 'reach_tier', target: 9, reward: { gems: 150, stars: 8 } },

        // ── Chain Champion (5) ───────────────────────────────────────
        { id: 'cc1', name: 'Woodworker',      desc: 'Create a Tier 7+ Wood item',     icon: '\u{1F332}', category: 'Chain Champion', type: 'chain_tier7', chain: 'wood',     target: 7, reward: { gems: 60, stars: 4 } },
        { id: 'cc2', name: 'Stonemason',       desc: 'Create a Tier 7+ Stone item',    icon: '\u26F0\uFE0F', category: 'Chain Champion', type: 'chain_tier7', chain: 'stone', target: 7, reward: { gems: 60, stars: 4 } },
        { id: 'cc3', name: 'Botanist',         desc: 'Create a Tier 7+ Flora item',    icon: '\u{1F338}', category: 'Chain Champion', type: 'chain_tier7', chain: 'flora',    target: 7, reward: { gems: 60, stars: 4 } },
        { id: 'cc4', name: 'Gem Cutter',       desc: 'Create a Tier 7+ Crystal item',  icon: '\u{1F48E}', category: 'Chain Champion', type: 'chain_tier7', chain: 'crystal',  target: 7, reward: { gems: 60, stars: 4 } },
        { id: 'cc5', name: 'Beast Tamer',      desc: 'Create a Tier 7+ Creature item', icon: '\u{1F409}', category: 'Chain Champion', type: 'chain_tier7', chain: 'creature', target: 7, reward: { gems: 80, stars: 5 } },

        // ── Hybrid Explorer (4) ──────────────────────────────────────
        { id: 'he1', name: 'Living Discovery',  desc: 'Discover the Living hybrid chain',  icon: '\u{1F33F}', category: 'Hybrid Explorer', type: 'discover_hybrid', chain: 'living',  target: 1, reward: { gems: 30, stars: 2 } },
        { id: 'he2', name: 'Arcane Discovery',  desc: 'Discover the Arcane hybrid chain',  icon: '\u{1F52E}', category: 'Hybrid Explorer', type: 'discover_hybrid', chain: 'arcane',  target: 1, reward: { gems: 30, stars: 2 } },
        { id: 'he3', name: 'Shelter Discovery',  desc: 'Discover the Shelter hybrid chain', icon: '\u{1F3E0}', category: 'Hybrid Explorer', type: 'discover_hybrid', chain: 'shelter', target: 1, reward: { gems: 30, stars: 2 } },
        { id: 'he4', name: 'Mystic Discovery',   desc: 'Discover the Mystic hybrid chain',  icon: '\u{1FA84}', category: 'Hybrid Explorer', type: 'discover_hybrid', chain: 'mystic',  target: 1, reward: { gems: 30, stars: 2 } },

        // ── Creature Collector (6) ───────────────────────────────────
        { id: 'cr1', name: 'Budding Collector',    desc: 'Discover 10 creatures',   icon: '\u{1F95A}', category: 'Creature Collector', type: 'creatures_discovered', target: 10,  reward: { gems: 15,  stars: 1 } },
        { id: 'cr2', name: 'Avid Collector',       desc: 'Discover 25 creatures',   icon: '\u{1F95A}', category: 'Creature Collector', type: 'creatures_discovered', target: 25,  reward: { gems: 30,  stars: 2 } },
        { id: 'cr3', name: 'Expert Collector',     desc: 'Discover 50 creatures',   icon: '\u{1F95A}', category: 'Creature Collector', type: 'creatures_discovered', target: 50,  reward: { gems: 50,  stars: 3 } },
        { id: 'cr4', name: 'Master Collector',     desc: 'Discover 100 creatures',  icon: '\u{1F95A}', category: 'Creature Collector', type: 'creatures_discovered', target: 100, reward: { gems: 100, stars: 5 } },
        { id: 'cr5', name: 'Grand Collector',      desc: 'Discover 150 creatures',  icon: '\u{1F95A}', category: 'Creature Collector', type: 'creatures_discovered', target: 150, reward: { gems: 150, stars: 7 } },
        { id: 'cr6', name: 'Complete Bestiary',     desc: 'Discover all 184 creatures', icon: '\u{1F4D6}', category: 'Creature Collector', type: 'creatures_discovered', target: 184, reward: { gems: 200, stars: 10 } },

        // ── Island Restorer (4) ──────────────────────────────────────
        { id: 'ir1', name: 'Shore Explorer',    desc: 'Restore 25% of the island',  icon: '\u{1F3DD}\uFE0F', category: 'Island Restorer', type: 'island_pct', target: 25,  reward: { gems: 25,  stars: 2 } },
        { id: 'ir2', name: 'Woodland Wanderer',  desc: 'Restore 50% of the island',  icon: '\u{1F3DD}\uFE0F', category: 'Island Restorer', type: 'island_pct', target: 50,  reward: { gems: 50,  stars: 4 } },
        { id: 'ir3', name: 'Peak Climber',       desc: 'Restore 75% of the island',  icon: '\u{1F3DD}\uFE0F', category: 'Island Restorer', type: 'island_pct', target: 75,  reward: { gems: 100, stars: 6 } },
        { id: 'ir4', name: 'Haven Guardian',     desc: 'Restore 100% of the island', icon: '\u{1F3DD}\uFE0F', category: 'Island Restorer', type: 'island_pct', target: 100, reward: { gems: 200, stars: 10 } },

        // ── Order Fulfiller (5) ──────────────────────────────────────
        { id: 'of1', name: 'First Delivery',     desc: 'Complete your first order',  icon: '\u{1F4E6}', category: 'Order Fulfiller', type: 'orders_completed', target: 1,   reward: { gems: 10,  stars: 1 } },
        { id: 'of2', name: 'Regular Supplier',   desc: 'Complete 10 orders',         icon: '\u{1F4E6}', category: 'Order Fulfiller', type: 'orders_completed', target: 10,  reward: { gems: 25,  stars: 2 } },
        { id: 'of3', name: 'Trusted Merchant',    desc: 'Complete 25 orders',         icon: '\u{1F4E6}', category: 'Order Fulfiller', type: 'orders_completed', target: 25,  reward: { gems: 50,  stars: 3 } },
        { id: 'of4', name: 'Trade Baron',         desc: 'Complete 50 orders',         icon: '\u{1F4E6}', category: 'Order Fulfiller', type: 'orders_completed', target: 50,  reward: { gems: 100, stars: 5 } },
        { id: 'of5', name: 'Logistics Legend',     desc: 'Complete 100 orders',        icon: '\u{1F4E6}', category: 'Order Fulfiller', type: 'orders_completed', target: 100, reward: { gems: 200, stars: 8 } },

        // ── Economy (5) ──────────────────────────────────────────────
        { id: 'ec1', name: 'Pocket Change',     desc: 'Earn 100 total gems',            icon: '\u{1F4B0}', category: 'Economy', type: 'gems_earned',  target: 100,   reward: { gems: 15,  stars: 1 } },
        { id: 'ec2', name: 'Comfortable',       desc: 'Earn 500 total gems',            icon: '\u{1F4B0}', category: 'Economy', type: 'gems_earned',  target: 500,   reward: { gems: 30,  stars: 2 } },
        { id: 'ec3', name: 'Wealthy',            desc: 'Earn 1,000 total gems',          icon: '\u{1F4B0}', category: 'Economy', type: 'gems_earned',  target: 1000,  reward: { gems: 50,  stars: 3 } },
        { id: 'ec4', name: 'Tycoon',             desc: 'Earn 5,000 total gems',          icon: '\u{1F4B0}', category: 'Economy', type: 'gems_earned',  target: 5000,  reward: { gems: 100, stars: 5 } },
        { id: 'ec5', name: 'Big Spender',        desc: 'Spend 1,000 gems in the shop',   icon: '\u{1F6D2}', category: 'Economy', type: 'gems_spent',   target: 1000,  reward: { gems: 50,  stars: 3 } },

        // ── Streak (3) ───────────────────────────────────────────────
        { id: 'st1', name: 'Warming Up',      desc: 'Reach a merge streak of 10',  icon: '\u{1F525}', category: 'Streak', type: 'merge_streak', target: 10, reward: { gems: 20,  stars: 1 } },
        { id: 'st2', name: 'On Fire',         desc: 'Reach a merge streak of 20',  icon: '\u{1F525}', category: 'Streak', type: 'merge_streak', target: 20, reward: { gems: 50,  stars: 3 } },
        { id: 'st3', name: 'Unstoppable',     desc: 'Reach a merge streak of 30',  icon: '\u{1F525}', category: 'Streak', type: 'merge_streak', target: 30, reward: { gems: 100, stars: 5 } },

        // ── Surge (3) ───────────────────────────────────────────────
        { id: 'sg1', name: 'First Surge',      desc: 'Activate your first Surge',      icon: '\u26A1', category: 'Surge', type: 'surgesActivated', target: 1,   reward: { gems: 15,  stars: 1 } },
        { id: 'sg2', name: 'Surge Rider',       desc: 'Activate 25 Surges',             icon: '\u26A1', category: 'Surge', type: 'surgesActivated', target: 25,  reward: { gems: 50,  stars: 3 } },
        { id: 'sg3', name: 'Surge Lord',         desc: 'Activate 100 Surges',            icon: '\u26A1', category: 'Surge', type: 'surgesActivated', target: 100, reward: { gems: 100, stars: 5 } },

        // ── Lucky (3) ───────────────────────────────────────────────
        { id: 'lk1', name: 'Lucky Break',       desc: 'Get your first lucky merge',     icon: '\u{1F340}', category: 'Lucky', type: 'luckyMerges', target: 1,   reward: { gems: 10,  stars: 1 } },
        { id: 'lk2', name: 'Fortune Favours',    desc: 'Get 10 lucky merges',            icon: '\u{1F340}', category: 'Lucky', type: 'luckyMerges', target: 10,  reward: { gems: 30,  stars: 2 } },
        { id: 'lk3', name: 'Born Lucky',          desc: 'Get 50 lucky merges',            icon: '\u{1F340}', category: 'Lucky', type: 'luckyMerges', target: 50,  reward: { gems: 75,  stars: 4 } },

        // ── Events (3) ──────────────────────────────────────────────
        // ── Discovery (3) ──────────────────────────────────────────
        { id: 'ds1', name: 'Curious Mind',        desc: 'Discover 10 unique items',       icon: '\u{1F50D}', category: 'Discovery', type: 'itemsDiscovered', target: 10,  reward: { gems: 15,  stars: 1 } },
        { id: 'ds2', name: 'Cataloguer',           desc: 'Discover 30 unique items',       icon: '\u{1F50D}', category: 'Discovery', type: 'itemsDiscovered', target: 30,  reward: { gems: 40,  stars: 3 } },
        { id: 'ds3', name: 'Encyclopedist',        desc: 'Discover all unique items',      icon: '\u{1F4D6}', category: 'Discovery', type: 'itemsDiscovered', target: 70,  reward: { gems: 100, stars: 5 } },

        // ── Events (3) ──────────────────────────────────────────────
        { id: 'ev1', name: 'Event Rookie',      desc: 'Claim your first event reward',  icon: '\u{1F3AA}', category: 'Events', type: 'eventTiersClaimed', target: 1,   reward: { gems: 15,  stars: 1 } },
        { id: 'ev2', name: 'Event Regular',      desc: 'Claim 10 event rewards',         icon: '\u{1F3AA}', category: 'Events', type: 'eventTiersClaimed', target: 10,  reward: { gems: 50,  stars: 3 } },
        { id: 'ev3', name: 'Event Champion',     desc: 'Claim 25 event rewards',         icon: '\u{1F3AA}', category: 'Events', type: 'eventTiersClaimed', target: 25,  reward: { gems: 100, stars: 5 } },
    ];

    // ─── STATE ───────────────────────────────────────────────────────

    var unlocked = {};     // { achievementId: true }
    var progress = {};     // { achievementId: currentValue } for progressive achievements
    var claimed = {};      // { achievementId: true } — reward collected

    // ─── INIT ────────────────────────────────────────────────────────

    function init() {
        var state = Game.getState();

        // Restore saved state
        if (state.achievements) {
            unlocked = state.achievements.unlocked || {};
            progress = state.achievements.progress || {};
            claimed  = state.achievements.claimed  || {};
        }

        // Back-fill progress from existing stats so achievements feel alive immediately
        syncProgressFromStats();

        // Listen for game events
        Game.on('mergeCompleted', onMergeCompleted);
        Game.on('itemProduced', onItemProduced);
        Game.on('chainReaction', onChainReaction);
        Game.on('crossChainMerge', onCrossChainMerge);
        Game.on('creatureDiscovered', onCreatureDiscovered);
        Game.on('orderCompleted', onOrderCompleted);
        Game.on('questCompleted', onQuestCompleted);
        Game.on('gemsChanged', onGemsChanged);
        Game.on('itemDiscovered', function(data) {
            updateProgress('ds1', data.total);
            updateProgress('ds2', data.total);
            updateProgress('ds3', data.total);
            checkAll();
        });
        Game.on('surgeActivated', function() {
            Game.updateStat('surgesActivated', function(v) { return (v || 0) + 1; });
            checkAll();
        });
        Game.on('luckyMerge', function() {
            Game.updateStat('luckyMerges', function(v) { return (v || 0) + 1; });
            checkAll();
        });
        Game.on('eventTierClaimed', function() {
            Game.updateStat('eventTiersClaimed', function(v) { return (v || 0) + 1; });
            checkAll();
        });

        // Wire up the trophy button
        var trophyBtn = document.getElementById('achievements-btn');
        if (trophyBtn) {
            trophyBtn.addEventListener('click', function() {
                openPanel();
                Sound.playTap();
            });
        }

        // Check all achievements on init (catches anything earned offline or pre-system)
        checkAll();
        saveState();
    }

    // ─── SYNC FROM EXISTING STATS ────────────────────────────────────
    // Reads current game stats/state to set progress counters for players
    // who already have progress before the achievement system was added.

    function syncProgressFromStats() {
        var state = Game.getState();
        var stats = state.stats || {};

        // Total merges
        if (stats.totalMerges) {
            progress['mm1'] = Math.max(progress['mm1'] || 0, stats.totalMerges);
            progress['mm2'] = Math.max(progress['mm2'] || 0, stats.totalMerges);
            progress['mm3'] = Math.max(progress['mm3'] || 0, stats.totalMerges);
            progress['mm4'] = Math.max(progress['mm4'] || 0, stats.totalMerges);
            progress['mm5'] = Math.max(progress['mm5'] || 0, stats.totalMerges);
        }

        // Highest tier reached
        if (stats.highestTier) {
            for (var t = 3; t <= 9; t++) {
                var tcId = 'tc' + (t - 2);
                if (stats.highestTier >= t) {
                    progress[tcId] = t;
                }
            }
            // Pinnacle (tc8) is also tier 9
            if (stats.highestTier >= 9) {
                progress['tc8'] = 9;
            }
        }

        // Chain record (chain reactions)
        if (stats.chainRecord) {
            progress['mm6'] = Math.max(progress['mm6'] || 0, stats.chainRecord > 0 ? 1 : 0);
            progress['mm7'] = Math.max(progress['mm7'] || 0, stats.chainRecord);
            progress['mm8'] = Math.max(progress['mm8'] || 0, stats.chainRecord);
        }

        // Creatures discovered
        if (state.hatchery && state.hatchery.discovered) {
            var creatureCount = Object.keys(state.hatchery.discovered).length;
            progress['cr1'] = Math.max(progress['cr1'] || 0, creatureCount);
            progress['cr2'] = Math.max(progress['cr2'] || 0, creatureCount);
            progress['cr3'] = Math.max(progress['cr3'] || 0, creatureCount);
            progress['cr4'] = Math.max(progress['cr4'] || 0, creatureCount);
            progress['cr5'] = Math.max(progress['cr5'] || 0, creatureCount);
            progress['cr6'] = Math.max(progress['cr6'] || 0, creatureCount);
        }

        // Island restoration
        if (typeof Island !== 'undefined') {
            var pct = Island.getRestorationPercent();
            progress['ir1'] = Math.max(progress['ir1'] || 0, pct);
            progress['ir2'] = Math.max(progress['ir2'] || 0, pct);
            progress['ir3'] = Math.max(progress['ir3'] || 0, pct);
            progress['ir4'] = Math.max(progress['ir4'] || 0, pct);
        }

        // Orders completed
        if (typeof Orders !== 'undefined' && Orders.getOrdersCompleted) {
            var oc = Orders.getOrdersCompleted();
            progress['of1'] = Math.max(progress['of1'] || 0, oc);
            progress['of2'] = Math.max(progress['of2'] || 0, oc);
            progress['of3'] = Math.max(progress['of3'] || 0, oc);
            progress['of4'] = Math.max(progress['of4'] || 0, oc);
            progress['of5'] = Math.max(progress['of5'] || 0, oc);
        }

        // Surges activated
        if (stats.surgesActivated) {
            progress['sg1'] = Math.max(progress['sg1'] || 0, stats.surgesActivated);
            progress['sg2'] = Math.max(progress['sg2'] || 0, stats.surgesActivated);
            progress['sg3'] = Math.max(progress['sg3'] || 0, stats.surgesActivated);
        }

        // Lucky merges
        if (stats.luckyMerges) {
            progress['lk1'] = Math.max(progress['lk1'] || 0, stats.luckyMerges);
            progress['lk2'] = Math.max(progress['lk2'] || 0, stats.luckyMerges);
            progress['lk3'] = Math.max(progress['lk3'] || 0, stats.luckyMerges);
        }

        // Items discovered
        if (stats.itemsDiscovered) {
            progress['ds1'] = Math.max(progress['ds1'] || 0, stats.itemsDiscovered);
            progress['ds2'] = Math.max(progress['ds2'] || 0, stats.itemsDiscovered);
            progress['ds3'] = Math.max(progress['ds3'] || 0, stats.itemsDiscovered);
        }

        // Event tiers claimed
        if (stats.eventTiersClaimed) {
            progress['ev1'] = Math.max(progress['ev1'] || 0, stats.eventTiersClaimed);
            progress['ev2'] = Math.max(progress['ev2'] || 0, stats.eventTiersClaimed);
            progress['ev3'] = Math.max(progress['ev3'] || 0, stats.eventTiersClaimed);
        }

        // Gems earned (track from now; we initialize from current total if no prior tracking)
        if (!progress['ec1'] && state.gems) {
            // Use current gems as starting estimate — not perfect but better than zero
            var existingGems = state.gems || 0;
            progress['ec1'] = Math.max(progress['ec1'] || 0, existingGems);
            progress['ec2'] = Math.max(progress['ec2'] || 0, existingGems);
            progress['ec3'] = Math.max(progress['ec3'] || 0, existingGems);
            progress['ec4'] = Math.max(progress['ec4'] || 0, existingGems);
        }
    }

    // ─── EVENT HANDLERS ──────────────────────────────────────────────

    function onMergeCompleted(data) {
        // data: { chain, tier, count, crossChain }
        var stats = Game.getState().stats || {};
        var totalMerges = stats.totalMerges || 0;

        // Merge count achievements
        updateProgress('mm1', totalMerges);
        updateProgress('mm2', totalMerges);
        updateProgress('mm3', totalMerges);
        updateProgress('mm4', totalMerges);
        updateProgress('mm5', totalMerges);

        // Big merge achievements
        if (data.count >= 5) {
            updateProgress('mm9', data.count);
        }
        if (data.count >= 7) {
            updateProgress('mm10', data.count);
        }

        // Streak tracking — read from Sound module
        if (typeof Sound !== 'undefined' && Sound.getMergeStreak) {
            var streak = Sound.getMergeStreak();
            updateProgress('st1', streak);
            updateProgress('st2', streak);
            updateProgress('st3', streak);
        }

        checkAll();
    }

    function onItemProduced(data) {
        // data: { chain, tier }
        var tier = data.tier;
        var chain = data.chain;

        // Tier climber achievements
        for (var t = 3; t <= 9; t++) {
            var tcId = 'tc' + (t - 2);
            if (tier >= t) {
                updateProgress(tcId, tier);
            }
        }
        if (tier >= 9) {
            updateProgress('tc8', tier);
        }

        // Chain champion — Tier 7+ in specific chains
        var chainMap = { wood: 'cc1', stone: 'cc2', flora: 'cc3', crystal: 'cc4', creature: 'cc5' };
        if (chainMap[chain] && tier >= 7) {
            updateProgress(chainMap[chain], tier);
        }

        // Hybrid explorer — discovering hybrid chains
        var hybridMap = { living: 'he1', arcane: 'he2', shelter: 'he3', mystic: 'he4' };
        if (hybridMap[chain]) {
            updateProgress(hybridMap[chain], 1);
        }

        // Island restoration check (producing items may indirectly cause star gain -> island unlock)
        if (typeof Island !== 'undefined') {
            var pct = Island.getRestorationPercent();
            updateProgress('ir1', pct);
            updateProgress('ir2', pct);
            updateProgress('ir3', pct);
            updateProgress('ir4', pct);
        }

        checkAll();
    }

    function onChainReaction(data) {
        // data: { depth }
        var depth = data.depth || 1;

        // Chain reaction achievements
        updateProgress('mm6', 1);    // any chain reaction
        updateProgress('mm7', depth);
        updateProgress('mm8', depth);

        checkAll();
    }

    function onCrossChainMerge(data) {
        // Hybrid chains produce crossChainMerge — covered in onItemProduced
        // This fires for every cross-chain merge event
        checkAll();
    }

    function onCreatureDiscovered(data) {
        // data: { creature, rarity, biome, total } — total is passed from hatchery
        var state = Game.getState();
        var count = 0;
        if (state.hatchery && state.hatchery.discovered) {
            count = Object.keys(state.hatchery.discovered).length;
        }

        updateProgress('cr1', count);
        updateProgress('cr2', count);
        updateProgress('cr3', count);
        updateProgress('cr4', count);
        updateProgress('cr5', count);
        updateProgress('cr6', count);

        checkAll();
    }

    function onOrderCompleted(data) {
        var oc = 0;
        if (typeof Orders !== 'undefined' && Orders.getOrdersCompleted) {
            oc = Orders.getOrdersCompleted();
        }

        updateProgress('of1', oc);
        updateProgress('of2', oc);
        updateProgress('of3', oc);
        updateProgress('of4', oc);
        updateProgress('of5', oc);

        checkAll();
    }

    function onQuestCompleted(data) {
        // Quest completion can give stars -> island unlock
        if (typeof Island !== 'undefined') {
            var pct = Island.getRestorationPercent();
            updateProgress('ir1', pct);
            updateProgress('ir2', pct);
            updateProgress('ir3', pct);
            updateProgress('ir4', pct);
        }
        checkAll();
    }

    function onGemsChanged(gems) {
        var state = Game.getState();

        // Track lifetime gems earned (we accumulate positive changes)
        // We use a separate counter in achievements.progress for accuracy
        if (!progress._gemsTotal) progress._gemsTotal = 0;
        if (!progress._lastGems) progress._lastGems = gems;

        var delta = gems - progress._lastGems;
        if (delta > 0) {
            progress._gemsTotal += delta;
            updateProgress('ec1', progress._gemsTotal);
            updateProgress('ec2', progress._gemsTotal);
            updateProgress('ec3', progress._gemsTotal);
            updateProgress('ec4', progress._gemsTotal);
        }
        if (delta < 0) {
            // Negative delta = spending
            if (!progress._gemsSpent) progress._gemsSpent = 0;
            progress._gemsSpent += Math.abs(delta);
            updateProgress('ec5', progress._gemsSpent);
        }
        progress._lastGems = gems;

        checkAll();
    }

    // ─── PROGRESS TRACKING ───────────────────────────────────────────

    function updateProgress(achievementId, value) {
        if (unlocked[achievementId]) return; // already unlocked, don't update
        progress[achievementId] = Math.max(progress[achievementId] || 0, value);
    }

    // ─── CHECK & UNLOCK ──────────────────────────────────────────────

    function checkAll() {
        var changed = false;

        for (var i = 0; i < definitions.length; i++) {
            var def = definitions[i];
            if (unlocked[def.id]) continue; // already unlocked

            var current = progress[def.id] || 0;

            if (current >= def.target) {
                unlocked[def.id] = true;
                changed = true;

                // Show notification (unless already claimed somehow)
                if (!claimed[def.id]) {
                    showUnlockToast(def);
                }
            }
        }

        if (changed) {
            saveState();
        }
    }

    // ─── CLAIM REWARD ────────────────────────────────────────────────

    function claimReward(achievementId) {
        if (!unlocked[achievementId] || claimed[achievementId]) return false;

        var def = getDefinition(achievementId);
        if (!def) return false;

        claimed[achievementId] = true;

        // Grant rewards
        if (def.reward.gems) Game.addGems(def.reward.gems);
        if (def.reward.stars) Game.addStars(def.reward.stars);

        Sound.playCelebration();
        Game.vibrate([15, 30, 15]);

        saveState();
        renderPanel(); // re-render if panel is open
        return true;
    }

    // ─── TOAST NOTIFICATION ──────────────────────────────────────────

    function showUnlockToast(def) {
        var toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML =
            '<span class="achievement-toast-icon">' + def.icon + '</span>' +
            '<div class="achievement-toast-text">' +
                '<span class="achievement-toast-label">Achievement Unlocked!</span>' +
                '<span class="achievement-toast-name">' + def.name + '</span>' +
            '</div>';

        var app = document.getElementById('app');
        if (app) {
            app.appendChild(toast);
            setTimeout(function() { toast.classList.add('achievement-toast-show'); }, 10);
            setTimeout(function() {
                toast.classList.remove('achievement-toast-show');
                setTimeout(function() { toast.remove(); }, 400);
            }, 3500);
        }

        if (typeof Sound !== 'undefined') Sound.playCelebration();
    }

    // ─── UI: MODAL PANEL ─────────────────────────────────────────────

    function openPanel() {
        var existing = document.getElementById('achievements-modal');
        if (existing) existing.remove();

        var modal = document.createElement('div');
        modal.id = 'achievements-modal';
        modal.className = 'achievements-modal';

        renderPanelInto(modal);

        document.getElementById('app').appendChild(modal);

        // Close on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closePanel();
        });
    }

    function closePanel() {
        var modal = document.getElementById('achievements-modal');
        if (modal) modal.remove();
    }

    function renderPanel() {
        var modal = document.getElementById('achievements-modal');
        if (!modal) return;
        renderPanelInto(modal);
    }

    function renderPanelInto(modal) {
        var unlockedCount = Object.keys(unlocked).length;
        var totalCount = definitions.length;
        var unclaimedCount = 0;

        for (var u in unlocked) {
            if (unlocked[u] && !claimed[u]) unclaimedCount++;
        }

        // Build category map preserving order
        var categoryOrder = [];
        var categoryMap = {};
        for (var i = 0; i < definitions.length; i++) {
            var cat = definitions[i].category;
            if (!categoryMap[cat]) {
                categoryMap[cat] = [];
                categoryOrder.push(cat);
            }
            categoryMap[cat].push(definitions[i]);
        }

        var html = '<div class="achievements-panel">';

        // Header
        html += '<div class="achievements-header">';
        html += '<h2>\u{1F3C6} Achievements</h2>';
        html += '<div class="achievements-summary">' + unlockedCount + '/' + totalCount + ' Unlocked</div>';

        // Overall progress bar
        var overallPct = Math.round((unlockedCount / totalCount) * 100);
        html += '<div class="achievements-overall-bar">';
        html += '<div class="achievements-overall-fill" style="width:' + overallPct + '%;"></div>';
        html += '</div>';

        html += '<button class="achievements-close-btn" id="achievements-close-btn">\u2715</button>';
        html += '</div>';

        // Scrollable body
        html += '<div class="achievements-body">';

        for (var c = 0; c < categoryOrder.length; c++) {
            var catName = categoryOrder[c];
            var items = categoryMap[catName];

            // Count unlocked in this category
            var catUnlocked = 0;
            for (var j = 0; j < items.length; j++) {
                if (unlocked[items[j].id]) catUnlocked++;
            }

            html += '<div class="achievements-category">';
            html += '<div class="achievements-category-header">';
            html += '<span class="achievements-category-name">' + catName + '</span>';
            html += '<span class="achievements-category-count">' + catUnlocked + '/' + items.length + '</span>';
            html += '</div>';

            for (var k = 0; k < items.length; k++) {
                var def = items[k];
                var isUnlocked = !!unlocked[def.id];
                var isClaimed = !!claimed[def.id];
                var current = Math.min(progress[def.id] || 0, def.target);
                var pct = Math.min(100, Math.round((current / def.target) * 100));

                html += '<div class="achievement-card' +
                    (isUnlocked ? ' achievement-unlocked' : '') +
                    (isClaimed ? ' achievement-claimed' : '') + '">';

                // Icon
                html += '<div class="achievement-icon' + (isUnlocked ? ' achievement-icon-unlocked' : '') + '">';
                html += isUnlocked ? def.icon : '\u{1F512}';
                html += '</div>';

                // Info
                html += '<div class="achievement-info">';
                html += '<div class="achievement-name">' + def.name + '</div>';
                html += '<div class="achievement-desc">' + def.desc + '</div>';

                // Progress bar
                html += '<div class="achievement-progress-bar">';
                html += '<div class="achievement-progress-fill' + (isUnlocked ? ' achievement-progress-complete' : '') + '" style="width:' + pct + '%;"></div>';
                html += '</div>';
                html += '<div class="achievement-progress-text">' + current + '/' + def.target + '</div>';

                html += '</div>'; // .achievement-info

                // Reward / Claim
                html += '<div class="achievement-reward">';
                if (isUnlocked && !isClaimed) {
                    html += '<button class="achievement-claim-btn" data-ach-id="' + def.id + '">Claim</button>';
                } else if (isClaimed) {
                    html += '<span class="achievement-claimed-label">\u2705</span>';
                } else {
                    // Preview reward
                    html += '<span class="achievement-reward-preview">';
                    if (def.reward.gems) html += '\u{1F48E}' + def.reward.gems;
                    if (def.reward.stars) html += ' \u2B50' + def.reward.stars;
                    html += '</span>';
                }
                html += '</div>';

                html += '</div>'; // .achievement-card
            }

            html += '</div>'; // .achievements-category
        }

        html += '</div>'; // .achievements-body
        html += '</div>'; // .achievements-panel

        modal.innerHTML = html;

        // Bind close button
        var closeBtn = modal.querySelector('#achievements-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() { closePanel(); });
        }

        // Bind claim buttons
        var claimBtns = modal.querySelectorAll('.achievement-claim-btn');
        for (var b = 0; b < claimBtns.length; b++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    claimReward(btn.dataset.achId);
                });
            })(claimBtns[b]);
        }
    }

    // ─── BADGE COUNT (for button indicator) ──────────────────────────

    function getUnclaimedCount() {
        var count = 0;
        for (var id in unlocked) {
            if (unlocked[id] && !claimed[id]) count++;
        }
        return count;
    }

    function updateBadge() {
        var badge = document.getElementById('achievements-badge');
        if (!badge) return;
        var count = getUnclaimedCount();
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // ─── SAVE / LOAD ─────────────────────────────────────────────────

    function saveState() {
        var state = Game.getState();
        state.achievements = {
            unlocked: unlocked,
            progress: progress,
            claimed: claimed
        };
        Game.save();
        updateBadge();
    }

    // ─── HELPERS ─────────────────────────────────────────────────────

    function getDefinition(id) {
        for (var i = 0; i < definitions.length; i++) {
            if (definitions[i].id === id) return definitions[i];
        }
        return null;
    }

    function getUnlockedCount() {
        return Object.keys(unlocked).length;
    }

    function getTotalCount() {
        return definitions.length;
    }

    // ─── PUBLIC API ──────────────────────────────────────────────────

    return {
        init: init,
        openPanel: openPanel,
        closePanel: closePanel,
        claimReward: claimReward,
        getUnlockedCount: getUnlockedCount,
        getTotalCount: getTotalCount,
        getUnclaimedCount: getUnclaimedCount,
        definitions: definitions
    };

})();
