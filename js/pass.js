// Haven - Battle Pass (Haven Pass): Tier progression, free + premium tracks
'use strict';

const Pass = (() => {
    const TOTAL_TIERS = 40;
    // Graduated XP curve — fast early tiers, challenging late tiers
    function xpForTier(tier) {
        if (tier <= 5) return 60;       // Quick wins for new players
        if (tier <= 15) return 80;      // Moderate mid-game
        if (tier <= 30) return 100;     // Standard late
        return 130;                      // Challenging final stretch
    }
    var XP_PER_TIER = 100; // fallback default

    // Tier rewards: free and premium track
    function getTierReward(tier) {
        var free = null;
        var premium = null;

        if (tier <= 10) {
            free = { type: 'gems', amount: 5 + tier * 2, label: '\u{1F48E} ' + (5 + tier * 2) };
            premium = { type: 'gems', amount: 15 + tier * 5, label: '\u{1F48E} ' + (15 + tier * 5) };
        } else if (tier <= 25) {
            free = { type: 'gems', amount: 10 + tier, label: '\u{1F48E} ' + (10 + tier) };
            premium = tier % 5 === 0 ?
                { type: 'egg', tier: 2, label: '\u{1F95A} Rare Egg' } :
                { type: 'gems', amount: 20 + tier * 2, label: '\u{1F48E} ' + (20 + tier * 2) };
        } else if (tier <= 39) {
            free = { type: 'energy', amount: 3, label: '\u26A1 3 Energy' };
            premium = tier % 5 === 0 ?
                { type: 'egg', tier: 3, label: '\u{1F95A} Epic Egg' } :
                { type: 'gems', amount: 30 + tier * 2, label: '\u{1F48E} ' + (30 + tier * 2) };
        } else {
            // Tier 40 — final reward
            free = { type: 'stars', amount: 5, label: '\u2B50 5 Stars' };
            premium = { type: 'gems', amount: 500, label: '\u{1F48E} 500 + \u{1F3C6}' };
        }

        // Power-up overrides for specific tiers
        // Free track: tier 5 → Shuffle, tier 10 → Mass Match, tier 35 → 2 Shuffles
        if (tier === 5)  free = { type: 'powerup', powerup: 'shuffle', amount: 1, label: '\u{1F500} Shuffle' };
        if (tier === 10) free = { type: 'powerup', powerup: 'mass_match', amount: 1, label: '\u{1F4A5} Mass Match' };
        if (tier === 35) free = { type: 'powerup', powerup: 'shuffle', amount: 2, label: '\u{1F500} Shuffle \u00D72' };

        // Premium track: tier 15 → 2 Upgrade Wands, tier 25 → Power Pack, tier 30 → 2 Golden Spawns
        if (tier === 15) premium = { type: 'powerup', powerup: 'upgrade_wand', amount: 2, label: '\u{1FA84} Wand \u00D72' };
        if (tier === 25) premium = { type: 'powerup_pack', label: '\u{1F381} Power Pack' };
        if (tier === 30) premium = { type: 'powerup', powerup: 'golden_spawn', amount: 2, label: '\u{1F31F} Golden \u00D72' };

        return { free: free, premium: premium };
    }

    let currentTier = 0;
    let currentXP = 0;
    let hasPremium = false;
    let claimedFree = {};
    let claimedPremium = {};

    function init() {
        var state = Game.getState();
        if (state.pass) {
            currentTier = state.pass.tier || 0;
            currentXP = state.pass.xp || 0;
            hasPremium = state.pass.premium || false;
            claimedFree = state.pass.claimedFree || {};
            claimedPremium = state.pass.claimedPremium || {};
        }

        // Earn XP from game actions
        Game.on('mergeCompleted', function(data) {
            addXP(10 + (data.tier || 0) * 5);
        });
        Game.on('questCompleted', function() {
            addXP(50);
        });
        Game.on('itemSpawned', function() {
            addXP(2);
        });

        renderPass();
    }

    function addXP(amount) {
        // Apply creature passive XP bonus
        if (typeof Creatures !== 'undefined') {
            var gs = Game.getState();
            if (gs.hatchery && gs.hatchery.discovered) {
                var bonuses = Creatures.calculatePassiveBonuses(gs.hatchery.discovered);
                if (bonuses.xp_bonus > 0) {
                    amount = Math.round(amount * (1 + bonuses.xp_bonus / 100));
                }
            }
        }
        currentXP += amount;
        var tierXP = xpForTier(currentTier + 1);
        while (currentXP >= tierXP && currentTier < TOTAL_TIERS) {
            currentXP -= tierXP;
            currentTier++;
            tierXP = xpForTier(currentTier + 1);
        }
        if (currentTier >= TOTAL_TIERS) {
            currentXP = 0;
        }
        savePassState();
        renderPass();
    }

    function claimTierReward(tier, track) {
        var rewards = getTierReward(tier);
        var reward = track === 'free' ? rewards.free : rewards.premium;
        if (!reward) return;

        if (track === 'free') {
            if (claimedFree[tier]) return;
            claimedFree[tier] = true;
        } else {
            if (!hasPremium) return;
            if (claimedPremium[tier]) return;
            claimedPremium[tier] = true;
        }

        // Grant reward
        switch (reward.type) {
            case 'gems':
                Game.addGems(reward.amount);
                break;
            case 'energy':
                Game.addEnergy(reward.amount);
                break;
            case 'stars':
                Game.addStars(reward.amount);
                break;
            case 'egg':
                Game.emit('shopSpawnRequest', { chain: 'creature', tier: reward.tier || 0 });
                break;
            case 'powerup':
                if (typeof PowerUps !== 'undefined') {
                    PowerUps.addToInventory(reward.powerup, reward.amount || 1);
                }
                break;
            case 'powerup_pack':
                if (typeof PowerUps !== 'undefined') {
                    var types = ['mass_match', 'sort_sweep', 'shuffle', 'upgrade_wand', 'lightning', 'golden_spawn'];
                    for (var p = 0; p < types.length; p++) {
                        PowerUps.addToInventory(types[p], 2);
                    }
                }
                break;
        }

        Sound.playCelebration();
        savePassState();
        renderPass();
    }

    function purchasePremium() {
        var confirmed = confirm('DEMO: Unlock Haven Pass Premium for $7.99?\n(This is a prototype — no real charge)');
        if (confirmed) {
            hasPremium = true;
            Sound.playCelebration();
            Game.vibrate([20, 40, 30]);
            savePassState();
            renderPass();
        }
    }

    // ─── RENDERING ───────────────────────────────────────────

    function renderPass() {
        var container = document.getElementById('pass-content');
        if (!container) return;

        var tierXPNeeded = xpForTier(currentTier + 1);
        var pct = currentTier >= TOTAL_TIERS ? 100 : Math.round((currentXP / tierXPNeeded) * 100);

        var html = '';

        // Header
        html += '<div class="pass-header">';
        html += '<h3 class="pass-title">Haven Pass — Season 1</h3>';
        if (!hasPremium) {
            html += '<button class="pass-premium-btn" id="pass-buy-premium">Unlock Premium $7.99</button>';
        } else {
            html += '<span class="pass-premium-badge">✨ Premium Active</span>';
        }
        html += '</div>';

        // Progress
        html += '<div class="pass-progress">';
        html += '<span class="pass-tier-label">Tier ' + currentTier + '/' + TOTAL_TIERS + '</span>';
        html += '<div class="pass-xp-bar"><div class="pass-xp-fill" style="width:' + pct + '%"></div></div>';
        html += '<span class="pass-xp-label">' + currentXP + '/' + tierXPNeeded + ' XP</span>';
        html += '</div>';

        // Tier list (show current tier ±5)
        html += '<div class="pass-tiers">';
        var startTier = Math.max(1, currentTier - 2);
        var endTier = Math.min(TOTAL_TIERS, startTier + 8);

        for (var t = startTier; t <= endTier; t++) {
            var rewards = getTierReward(t);
            var reached = t <= currentTier;
            var fClaimed = !!claimedFree[t];
            var pClaimed = !!claimedPremium[t];

            html += '<div class="pass-tier-row' + (reached ? ' reached' : '') + (t === currentTier ? ' current' : '') + '">';
            html += '<span class="pass-tier-num">' + t + '</span>';

            // Free track
            html += '<div class="pass-reward free' + (fClaimed ? ' claimed' : '') + '">';
            html += '<span class="pass-reward-label">' + rewards.free.label + '</span>';
            if (reached && !fClaimed) {
                html += '<button class="pass-claim-btn" data-tier="' + t + '" data-track="free">Claim</button>';
            } else if (fClaimed) {
                html += '<span class="pass-claimed-check">✓</span>';
            }
            html += '</div>';

            // Premium track
            html += '<div class="pass-reward premium' + (pClaimed ? ' claimed' : '') + (!hasPremium ? ' locked' : '') + '">';
            if (hasPremium || reached) {
                html += '<span class="pass-reward-label">' + rewards.premium.label + '</span>';
            } else {
                html += '<span class="pass-reward-label locked-label">🔒</span>';
            }
            if (reached && hasPremium && !pClaimed) {
                html += '<button class="pass-claim-btn" data-tier="' + t + '" data-track="premium">Claim</button>';
            } else if (pClaimed) {
                html += '<span class="pass-claimed-check">✓</span>';
            }
            html += '</div>';

            html += '</div>';
        }
        html += '</div>';

        container.innerHTML = html;

        // Event listeners
        var buyBtn = document.getElementById('pass-buy-premium');
        if (buyBtn) buyBtn.addEventListener('click', purchasePremium);

        container.querySelectorAll('.pass-claim-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                claimTierReward(parseInt(btn.dataset.tier), btn.dataset.track);
            });
        });
    }

    function savePassState() {
        var state = Game.getState();
        state.pass = {
            tier: currentTier,
            xp: currentXP,
            premium: hasPremium,
            claimedFree: claimedFree,
            claimedPremium: claimedPremium
        };
        Game.save();
    }

    return {
        init: init,
        addXP: addXP,
        renderPass: renderPass,
        getCurrentTier: function() { return currentTier; }
    };
})();
