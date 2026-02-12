// Haven - Weekly Events: Rotating Time-Limited Events with Tiered Challenges
'use strict';

const Events = (() => {
    // ─── CONSTANTS ─────────────────────────────────────────────
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    // Epoch anchor: Monday 2024-01-01T00:00:00Z (a known Monday)
    const EPOCH = new Date('2024-01-01T00:00:00Z').getTime();

    // ─── EVENT POOL (8 rotating weekly events) ─────────────────
    const eventPool = [
        {
            id: 'crystal_rush',
            name: 'Crystal Rush',
            desc: 'Crystal merges award 2x gems!',
            icon: '\u{1F48E}',
            exclusiveCreature: { id: 'crystal_sprite', name: 'Crystal Sprite', emoji: '\u{1F48E}', rarity: 'rare', biome: 'enchanted', passive: { type: 'gem_bonus', value: 3 } },
            modifier: { type: 'gem_multiplier', chain: 'crystal', value: 2 },
            challenges: [
                { tier: 'bronze', desc: 'Merge 50 crystals',  target: 50,  reward: { gems: 50 } },
                { tier: 'silver', desc: 'Merge 150 crystals', target: 150, reward: { gems: 150, stars: 3 } },
                { tier: 'gold',   desc: 'Merge 300 crystals', target: 300, reward: { gems: 400, stars: 8, egg: true } }
            ],
            trackEvent: 'mergeCompleted',
            trackFilter: function(data) { return data.chain === 'crystal'; },
            trackIncrement: function(data) { return data.count || 1; }
        },
        {
            id: 'timber_time',
            name: 'Timber Time',
            desc: 'Wood items spawn 1 tier higher!',
            icon: '\u{1F332}',
            exclusiveCreature: { id: 'timber_stag', name: 'Timber Stag', emoji: '\u{1F98C}', rarity: 'rare', biome: 'forest', passive: { type: 'energy_regen', value: 3 } },
            modifier: { type: 'spawn_tier_boost', chain: 'wood', value: 1 },
            challenges: [
                { tier: 'bronze', desc: 'Spawn 40 wood items',  target: 40,  reward: { gems: 50 } },
                { tier: 'silver', desc: 'Spawn 120 wood items', target: 120, reward: { gems: 150, stars: 3 } },
                { tier: 'gold',   desc: 'Spawn 250 wood items', target: 250, reward: { gems: 400, stars: 8, egg: true } }
            ],
            trackEvent: 'itemSpawned',
            trackFilter: function(data) { return data.chain === 'wood'; },
            trackIncrement: function() { return 1; }
        },
        {
            id: 'flora_festival',
            name: 'Flora Festival',
            desc: 'Flora chain reactions are 2x more likely!',
            icon: '\u{1F338}',
            exclusiveCreature: { id: 'blossom_fae', name: 'Blossom Fae', emoji: '\u{1F33A}', rarity: 'rare', biome: 'spring', passive: { type: 'discovery_chance', value: 3 } },
            modifier: { type: 'chain_reaction_boost', chain: 'flora', value: 2 },
            challenges: [
                { tier: 'bronze', desc: 'Merge 60 flora items',  target: 60,  reward: { gems: 50 } },
                { tier: 'silver', desc: 'Merge 180 flora items', target: 180, reward: { gems: 150, stars: 3 } },
                { tier: 'gold',   desc: 'Merge 350 flora items', target: 350, reward: { gems: 400, stars: 8, egg: true } }
            ],
            trackEvent: 'mergeCompleted',
            trackFilter: function(data) { return data.chain === 'flora'; },
            trackIncrement: function(data) { return data.count || 1; }
        },
        {
            id: 'stone_surge',
            name: 'Stone Surge',
            desc: 'Stone merges fill surge meter 2x faster!',
            icon: '\u26F0\uFE0F',
            exclusiveCreature: { id: 'granite_golem', name: 'Granite Golem', emoji: '\u{1FAA8}', rarity: 'rare', biome: 'ocean', passive: { type: 'xp_bonus', value: 3 } },
            modifier: { type: 'surge_boost', chain: 'stone', value: 2 },
            challenges: [
                { tier: 'bronze', desc: 'Merge 50 stone items',  target: 50,  reward: { gems: 50 } },
                { tier: 'silver', desc: 'Merge 150 stone items', target: 150, reward: { gems: 150, stars: 3 } },
                { tier: 'gold',   desc: 'Merge 300 stone items', target: 300, reward: { gems: 400, stars: 8, egg: true } }
            ],
            trackEvent: 'mergeCompleted',
            trackFilter: function(data) { return data.chain === 'stone'; },
            trackIncrement: function(data) { return data.count || 1; }
        },
        {
            id: 'discovery_week',
            name: 'Discovery Week',
            desc: 'Creature discovery chance doubled!',
            icon: '\u{1F95A}',
            exclusiveCreature: { id: 'egg_oracle', name: 'Egg Oracle', emoji: '\u{1F52E}', rarity: 'rare', biome: 'celestial', passive: { type: 'discovery_chance', value: 5 } },
            modifier: { type: 'discovery_boost', chain: 'creature', value: 2 },
            challenges: [
                { tier: 'bronze', desc: 'Spawn 30 creature eggs',  target: 30,  reward: { gems: 50 } },
                { tier: 'silver', desc: 'Spawn 80 creature eggs',  target: 80,  reward: { gems: 150, stars: 3 } },
                { tier: 'gold',   desc: 'Spawn 160 creature eggs', target: 160, reward: { gems: 400, stars: 8, egg: true } }
            ],
            trackEvent: 'itemSpawned',
            trackFilter: function(data) { return data.chain === 'creature'; },
            trackIncrement: function() { return 1; }
        },
        {
            id: 'merge_mania',
            name: 'Merge Mania',
            desc: 'All merges need only 2 items!',
            icon: '\u{1F525}',
            exclusiveCreature: { id: 'merge_spirit', name: 'Merge Spirit', emoji: '\u{1F525}', rarity: 'legendary', biome: 'celestial', passive: { type: 'gem_bonus', value: 7 } },
            modifier: { type: 'min_merge_override', value: 2 },
            challenges: [
                { tier: 'bronze', desc: 'Perform 40 merges',  target: 40,  reward: { gems: 50 } },
                { tier: 'silver', desc: 'Perform 120 merges', target: 120, reward: { gems: 150, stars: 3 } },
                { tier: 'gold',   desc: 'Perform 250 merges', target: 250, reward: { gems: 400, stars: 8, egg: true } }
            ],
            trackEvent: 'mergeCompleted',
            trackFilter: function() { return true; },
            trackIncrement: function() { return 1; }
        },
        {
            id: 'chain_master',
            name: 'Chain Master',
            desc: 'Cross-chain recipes give 3x rewards!',
            icon: '\u{1F517}',
            exclusiveCreature: { id: 'chain_weaver', name: 'Chain Weaver', emoji: '\u{1F578}\uFE0F', rarity: 'rare', biome: 'enchanted', passive: { type: 'xp_bonus', value: 3 } },
            modifier: { type: 'crosschain_reward_multiplier', value: 3 },
            challenges: [
                { tier: 'bronze', desc: 'Perform 10 cross-chain merges',  target: 10,  reward: { gems: 50 } },
                { tier: 'silver', desc: 'Perform 30 cross-chain merges',  target: 30,  reward: { gems: 150, stars: 3 } },
                { tier: 'gold',   desc: 'Perform 60 cross-chain merges',  target: 60,  reward: { gems: 400, stars: 8, egg: true } }
            ],
            trackEvent: 'crossChainMerge',
            trackFilter: function() { return true; },
            trackIncrement: function() { return 1; }
        },
        {
            id: 'speed_demon',
            name: 'Speed Demon',
            desc: 'Energy regenerates 2x faster!',
            icon: '\u26A1',
            exclusiveCreature: { id: 'lightning_lynx', name: 'Lightning Lynx', emoji: '\u26A1', rarity: 'rare', biome: 'summer', passive: { type: 'energy_regen', value: 5 } },
            modifier: { type: 'energy_regen_multiplier', value: 2 },
            challenges: [
                { tier: 'bronze', desc: 'Use 80 energy',  target: 80,  reward: { gems: 50 } },
                { tier: 'silver', desc: 'Use 250 energy', target: 250, reward: { gems: 150, stars: 3 } },
                { tier: 'gold',   desc: 'Use 500 energy', target: 500, reward: { gems: 400, stars: 8, egg: true } }
            ],
            trackEvent: 'energyUsed',
            trackFilter: function() { return true; },
            trackIncrement: function() { return 1; }
        }
    ];

    // ─── STATE ─────────────────────────────────────────────────
    let currentEvent = null;    // The full event definition (from pool)
    let eventState = null;      // Persisted: { eventId, weekNumber, progress, claimed }
    let countdownTimer = null;
    let bannerEl = null;
    let modalEl = null;

    // ─── WEEK CALCULATION ──────────────────────────────────────

    function getWeekNumber() {
        var now = Date.now();
        return Math.floor((now - EPOCH) / WEEK_MS);
    }

    function getWeekStart(weekNum) {
        return EPOCH + weekNum * WEEK_MS;
    }

    function getWeekEnd(weekNum) {
        return EPOCH + (weekNum + 1) * WEEK_MS;
    }

    function getEventForWeek(weekNum) {
        // Deterministic: same week number = same event for all players
        var index = weekNum % eventPool.length;
        return eventPool[index];
    }

    function getTimeRemaining() {
        var weekNum = getWeekNumber();
        var endMs = getWeekEnd(weekNum);
        return Math.max(0, endMs - Date.now());
    }

    function formatTimeRemaining(ms) {
        if (ms <= 0) return 'Ended';
        var totalSec = Math.floor(ms / 1000);
        var days = Math.floor(totalSec / 86400);
        var hours = Math.floor((totalSec % 86400) / 3600);
        var mins = Math.floor((totalSec % 3600) / 60);
        var secs = totalSec % 60;

        if (days > 0) {
            return days + 'd ' + hours + 'h';
        }
        if (hours > 0) {
            return hours + 'h ' + mins + 'm';
        }
        return mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's';
    }

    // ─── INIT ──────────────────────────────────────────────────

    function init() {
        var weekNum = getWeekNumber();
        var eventDef = getEventForWeek(weekNum);
        currentEvent = eventDef;

        // Load persisted state
        var state = Game.getState();
        if (state.weeklyEvent && state.weeklyEvent.weekNumber === weekNum) {
            // Same week — restore progress
            eventState = state.weeklyEvent;
        } else {
            // New week — fresh state
            eventState = {
                eventId: eventDef.id,
                weekNumber: weekNum,
                progress: 0,
                claimed: { bronze: false, silver: false, gold: false }
            };
            saveEventState();
        }

        // Subscribe to game events for challenge tracking
        setupTracking();

        // Build UI
        createBannerElement();
        createModalElement();
        renderBanner();

        // Start countdown ticker (every second)
        countdownTimer = setInterval(function() {
            updateCountdown();
            // Check if event week has rolled over
            var newWeek = getWeekNumber();
            if (newWeek !== eventState.weekNumber) {
                // New event!
                currentEvent = getEventForWeek(newWeek);
                eventState = {
                    eventId: currentEvent.id,
                    weekNumber: newWeek,
                    progress: 0,
                    claimed: { bronze: false, silver: false, gold: false }
                };
                saveEventState();
                renderBanner();
                showEventTransitionToast();
            }
        }, 1000);
    }

    // ─── TRACKING ──────────────────────────────────────────────

    function setupTracking() {
        // Each handler is bound to a specific event type string, so only
        // the handler matching currentEvent.trackEvent will increment progress.
        Game.on('mergeCompleted', function(data) { handleTrackedEvent('mergeCompleted', data); });
        Game.on('itemSpawned', function(data) { handleTrackedEvent('itemSpawned', data); });
        Game.on('crossChainMerge', function(data) { handleTrackedEvent('crossChainMerge', data); });
        Game.on('energyUsed', function(data) { handleTrackedEvent('energyUsed', data); });
    }

    function handleTrackedEvent(eventType, data) {
        if (!currentEvent || !eventState) return;
        if (currentEvent.trackEvent !== eventType) return;
        if (!currentEvent.trackFilter(data || {})) return;

        var increment = currentEvent.trackIncrement(data || {});
        eventState.progress += increment;
        saveEventState();
        renderBanner();

        // Check if any tier was just completed
        checkTierCompletion();
    }

    function checkTierCompletion() {
        if (!currentEvent) return;
        var challenges = currentEvent.challenges;
        for (var i = 0; i < challenges.length; i++) {
            var c = challenges[i];
            if (!eventState.claimed[c.tier] && eventState.progress >= c.target) {
                // Tier just completed — pulse the banner
                if (bannerEl) {
                    bannerEl.classList.add('event-banner-pulse');
                    setTimeout(function() {
                        if (bannerEl) bannerEl.classList.remove('event-banner-pulse');
                    }, 600);
                }
                break;
            }
        }
    }

    // ─── MODIFIER QUERIES (called by other systems) ───────────

    function getModifier() {
        if (!currentEvent) return null;
        return currentEvent.modifier;
    }

    function isActive() {
        return currentEvent !== null;
    }

    function getActiveEventId() {
        return currentEvent ? currentEvent.id : null;
    }

    // Convenience: check if a specific modifier type is active
    function hasModifier(type, chain) {
        if (!currentEvent) return false;
        var mod = currentEvent.modifier;
        if (mod.type !== type) return false;
        if (chain && mod.chain && mod.chain !== chain) return false;
        return true;
    }

    function getModifierValue(type, chain) {
        if (!hasModifier(type, chain)) return 1;
        return currentEvent.modifier.value;
    }

    // ─── UI: BANNER ────────────────────────────────────────────

    function createBannerElement() {
        bannerEl = document.getElementById('event-banner');
        if (!bannerEl) {
            // Create the banner element dynamically
            bannerEl = document.createElement('div');
            bannerEl.id = 'event-banner';
            bannerEl.className = 'event-banner';

            bannerEl.innerHTML =
                '<div class="event-banner-inner">' +
                    '<span class="event-banner-icon" id="event-banner-icon"></span>' +
                    '<div class="event-banner-info">' +
                        '<span class="event-banner-name" id="event-banner-name"></span>' +
                        '<span class="event-banner-timer" id="event-banner-timer"></span>' +
                    '</div>' +
                    '<div class="event-banner-progress-wrap">' +
                        '<div class="event-banner-progress" id="event-banner-progress"></div>' +
                    '</div>' +
                '</div>';

            // Insert into board-screen, after surge-bar
            var surgeBar = document.getElementById('surge-bar');
            if (surgeBar && surgeBar.parentNode) {
                surgeBar.parentNode.insertBefore(bannerEl, surgeBar.nextSibling);
            }
        }

        // Tap to open challenge modal
        bannerEl.addEventListener('click', function() {
            openChallengeModal();
            if (typeof Sound !== 'undefined') Sound.playTap();
        });
    }

    function renderBanner() {
        if (!bannerEl || !currentEvent) return;

        document.getElementById('event-banner-icon').textContent = currentEvent.icon;
        document.getElementById('event-banner-name').textContent = currentEvent.name;

        updateCountdown();
        updateBannerProgress();
    }

    function updateCountdown() {
        var timerEl = document.getElementById('event-banner-timer');
        if (timerEl) {
            timerEl.textContent = formatTimeRemaining(getTimeRemaining());
        }
    }

    function updateBannerProgress() {
        var progressEl = document.getElementById('event-banner-progress');
        if (!progressEl || !currentEvent) return;

        // Show progress toward the highest unclaimed tier
        var challenges = currentEvent.challenges;
        var activeTier = null;
        for (var i = 0; i < challenges.length; i++) {
            if (!eventState.claimed[challenges[i].tier]) {
                activeTier = challenges[i];
                break;
            }
        }

        if (!activeTier) {
            // All claimed
            progressEl.style.width = '100%';
            progressEl.classList.add('event-progress-complete');
            return;
        }

        progressEl.classList.remove('event-progress-complete');
        var pct = Math.min(100, Math.round((eventState.progress / activeTier.target) * 100));
        progressEl.style.width = pct + '%';
    }

    // ─── UI: CHALLENGE MODAL ───────────────────────────────────

    function createModalElement() {
        modalEl = document.getElementById('event-modal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'event-modal';
            modalEl.className = 'event-modal hidden';
            document.getElementById('app').appendChild(modalEl);
        }

        // Close on backdrop click
        modalEl.addEventListener('click', function(e) {
            if (e.target === modalEl) {
                closeChallengeModal();
            }
        });
    }

    function openChallengeModal() {
        if (!modalEl || !currentEvent) return;
        renderChallengeModal();
        modalEl.classList.remove('hidden');
    }

    function closeChallengeModal() {
        if (modalEl) modalEl.classList.add('hidden');
    }

    function renderChallengeModal() {
        if (!modalEl || !currentEvent) return;

        var challenges = currentEvent.challenges;
        var html = '';

        html += '<div class="event-modal-card">';
        html += '<div class="event-modal-header">';
        html += '<span class="event-modal-icon">' + currentEvent.icon + '</span>';
        html += '<div class="event-modal-title-wrap">';
        html += '<h2 class="event-modal-title">' + currentEvent.name + '</h2>';
        html += '<p class="event-modal-desc">' + currentEvent.desc + '</p>';
        html += '</div>';
        html += '</div>';

        html += '<div class="event-modal-timer">';
        html += '<span class="event-timer-label">Ends in</span>';
        html += '<span class="event-timer-value" id="event-modal-timer">' + formatTimeRemaining(getTimeRemaining()) + '</span>';
        html += '</div>';

        html += '<div class="event-challenges">';

        var tierColors = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700' };
        var tierLabels = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' };
        var tierIcons = { bronze: '\u{1F949}', silver: '\u{1F948}', gold: '\u{1F947}' };

        for (var i = 0; i < challenges.length; i++) {
            var c = challenges[i];
            var claimed = eventState.claimed[c.tier];
            var completed = eventState.progress >= c.target;
            var pct = Math.min(100, Math.round((eventState.progress / c.target) * 100));

            var cardClass = 'event-challenge-card';
            if (claimed) cardClass += ' challenge-claimed';
            else if (completed) cardClass += ' challenge-complete';

            html += '<div class="' + cardClass + '" style="--tier-color:' + tierColors[c.tier] + '">';
            html += '<div class="challenge-header">';
            html += '<span class="challenge-tier-icon">' + tierIcons[c.tier] + '</span>';
            html += '<span class="challenge-tier-label" style="color:' + tierColors[c.tier] + '">' + tierLabels[c.tier] + '</span>';
            html += '</div>';

            html += '<p class="challenge-desc">' + c.desc + '</p>';

            html += '<div class="challenge-progress-bar">';
            html += '<div class="challenge-progress-fill" style="width:' + pct + '%;background:' + tierColors[c.tier] + '"></div>';
            html += '</div>';

            html += '<div class="challenge-footer">';
            html += '<span class="challenge-count">' + Math.min(eventState.progress, c.target) + ' / ' + c.target + '</span>';

            // Rewards display
            var rewardText = '';
            if (c.reward.gems) rewardText += '\u{1F48E} ' + c.reward.gems;
            if (c.reward.stars) rewardText += ' \u2B50 ' + c.reward.stars;
            if (c.reward.egg) rewardText += ' \u{1F95A}';
            html += '<span class="challenge-reward">' + rewardText + '</span>';
            html += '</div>';

            // Event-exclusive creature badge on gold tier
            if (currentEvent.exclusiveCreature && c.tier === 'gold') {
                html += '<div class="challenge-exclusive-badge">' + currentEvent.exclusiveCreature.emoji + ' ' + currentEvent.exclusiveCreature.name + ' <span class="exclusive-tag">EVENT ONLY</span></div>';
            }

            if (claimed) {
                html += '<div class="challenge-claimed-badge">Claimed</div>';
            } else if (completed) {
                html += '<button class="challenge-claim-btn" data-tier="' + c.tier + '">Claim!</button>';
            }

            html += '</div>';
        }

        html += '</div>'; // .event-challenges

        html += '<button class="event-modal-close">Close</button>';
        html += '</div>'; // .event-modal-card

        modalEl.innerHTML = html;

        // Attach event listeners
        var claimBtns = modalEl.querySelectorAll('.challenge-claim-btn');
        for (var j = 0; j < claimBtns.length; j++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    claimTier(btn.dataset.tier);
                });
            })(claimBtns[j]);
        }

        var closeBtn = modalEl.querySelector('.event-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeChallengeModal();
            });
        }
    }

    // ─── CLAIM REWARDS ─────────────────────────────────────────

    function claimTier(tier) {
        if (!currentEvent || !eventState) return;
        if (eventState.claimed[tier]) return;

        // Find the challenge definition
        var challenge = null;
        for (var i = 0; i < currentEvent.challenges.length; i++) {
            if (currentEvent.challenges[i].tier === tier) {
                challenge = currentEvent.challenges[i];
                break;
            }
        }
        if (!challenge) return;
        if (eventState.progress < challenge.target) return;

        // Mark as claimed
        eventState.claimed[tier] = true;
        saveEventState();

        // Grant rewards
        if (challenge.reward.gems) Game.addGems(challenge.reward.gems);
        if (challenge.reward.stars) Game.addStars(challenge.reward.stars);
        if (challenge.reward.egg && currentEvent.exclusiveCreature && tier === 'gold') {
            // Grant event-exclusive creature
            var ec = currentEvent.exclusiveCreature;
            var gState = Game.getState();
            gState.hatchery = gState.hatchery || { discovered: {} };
            if (!gState.hatchery.discovered) gState.hatchery.discovered = {};
            gState.hatchery.discovered[ec.id] = { discoveredAt: Date.now(), tier: 0, eventExclusive: true };
            Game.save();
            Game.emit('creatureDiscovered', { creature: ec.id, rarity: ec.rarity, biome: ec.biome, exclusive: true });
        } else if (challenge.reward.egg) {
            // Spawn a rare egg via shop system
            Game.emit('shopSpawnRequest', { chain: 'creature', tier: 2 });
        }

        // Effects — celebration overlay handles sound + particles
        Game.emit('eventTierClaimed', { eventId: currentEvent.id, tier: tier });

        if (typeof Celebration !== 'undefined') {
            var tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
            Celebration.show('eventTier', {
                tierLabel: tierLabel,
                eventName: currentEvent.name,
                emoji: currentEvent.icon || '\u{1F3AA}'
            });
        } else {
            if (typeof Sound !== 'undefined') Sound.playAchievement();
            Game.vibrate([15, 30, 15, 30, 15]);
        }

        // Show toast with reward details
        showEventToast(
            '\u{1F3C6} ' + tier.charAt(0).toUpperCase() + tier.slice(1) +
            ' reward claimed! ' +
            (challenge.reward.gems ? '+' + challenge.reward.gems + ' gems ' : '') +
            (challenge.reward.stars ? '+' + challenge.reward.stars + ' stars ' : '') +
            (challenge.reward.egg ? '+rare egg' : '')
        );

        // Re-render
        renderBanner();
        renderChallengeModal();
    }

    // ─── PERSISTENCE ───────────────────────────────────────────

    function saveEventState() {
        var state = Game.getState();
        state.weeklyEvent = eventState;
        Game.save();
    }

    // ─── TOAST ─────────────────────────────────────────────────

    function showEventToast(msg) {
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();
        var el = document.createElement('div');
        el.className = 'toast';
        el.textContent = msg;
        document.getElementById('app').appendChild(el);
        setTimeout(function() { el.classList.add('toast-show'); }, 10);
        setTimeout(function() {
            el.classList.remove('toast-show');
            setTimeout(function() { el.remove(); }, 300);
        }, 2500);
    }

    function showEventTransitionToast() {
        if (!currentEvent) return;
        showEventToast(
            currentEvent.icon + ' New event: ' + currentEvent.name + '!'
        );
    }

    // ─── PUBLIC API ────────────────────────────────────────────

    return {
        init: init,
        isActive: isActive,
        getActiveEventId: getActiveEventId,
        getModifier: getModifier,
        hasModifier: hasModifier,
        getModifierValue: getModifierValue,
        getTimeRemaining: getTimeRemaining,
        openChallengeModal: openChallengeModal,
        closeChallengeModal: closeChallengeModal
    };
})();
