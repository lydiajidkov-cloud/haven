// Haven - Quest System: Definitions, Tracking, Completion
'use strict';

const Quests = (() => {
    const MAX_ACTIVE = 4;

    // Quest pool — each has a unique id, type, requirements, and rewards
    const questPool = [
        // Wood chain
        { id: 'w1', desc: 'Produce 3 Branches',   type: 'produce', chain: 'wood',    tier: 1, target: 3, reward: { stars: 1, gems: 5 } },
        { id: 'w2', desc: 'Produce 2 Logs',        type: 'produce', chain: 'wood',    tier: 2, target: 2, reward: { stars: 1, gems: 10 } },
        { id: 'w3', desc: 'Produce 1 Plank',       type: 'produce', chain: 'wood',    tier: 3, target: 1, reward: { stars: 2, gems: 15 } },
        { id: 'w4', desc: 'Produce 1 Beam',        type: 'produce', chain: 'wood',    tier: 4, target: 1, reward: { stars: 3, gems: 20 } },
        { id: 'w5', desc: 'Produce 1 Frame',       type: 'produce', chain: 'wood',    tier: 5, target: 1, reward: { stars: 4, gems: 30 } },
        // Stone chain
        { id: 's1', desc: 'Produce 3 Rocks',       type: 'produce', chain: 'stone',   tier: 1, target: 3, reward: { stars: 1, gems: 5 } },
        { id: 's2', desc: 'Produce 2 Boulders',    type: 'produce', chain: 'stone',   tier: 2, target: 2, reward: { stars: 1, gems: 10 } },
        { id: 's3', desc: 'Produce 1 Slab',        type: 'produce', chain: 'stone',   tier: 3, target: 1, reward: { stars: 2, gems: 15 } },
        { id: 's4', desc: 'Produce 1 Block',       type: 'produce', chain: 'stone',   tier: 4, target: 1, reward: { stars: 3, gems: 20 } },
        // Flora chain
        { id: 'f1', desc: 'Produce 3 Sprouts',     type: 'produce', chain: 'flora',   tier: 1, target: 3, reward: { stars: 1, gems: 5 } },
        { id: 'f2', desc: 'Produce 2 Buds',        type: 'produce', chain: 'flora',   tier: 2, target: 2, reward: { stars: 1, gems: 10 } },
        { id: 'f3', desc: 'Produce 1 Flower',      type: 'produce', chain: 'flora',   tier: 3, target: 1, reward: { stars: 2, gems: 15 } },
        { id: 'f4', desc: 'Produce 1 Bouquet',     type: 'produce', chain: 'flora',   tier: 4, target: 1, reward: { stars: 3, gems: 20 } },
        // Crystal chain
        { id: 'c1', desc: 'Produce 3 Fragments',   type: 'produce', chain: 'crystal', tier: 1, target: 3, reward: { stars: 1, gems: 5 } },
        { id: 'c2', desc: 'Produce 2 Gems',        type: 'produce', chain: 'crystal', tier: 2, target: 2, reward: { stars: 1, gems: 10 } },
        { id: 'c3', desc: 'Produce 1 Crystal',     type: 'produce', chain: 'crystal', tier: 3, target: 1, reward: { stars: 2, gems: 15 } },
        { id: 'c4', desc: 'Produce 1 Prism',       type: 'produce', chain: 'crystal', tier: 4, target: 1, reward: { stars: 3, gems: 25 } },
        // Creature chain
        { id: 'cr1', desc: 'Produce 2 Hatchlings', type: 'produce', chain: 'creature', tier: 1, target: 2, reward: { stars: 1, gems: 10 } },
        { id: 'cr2', desc: 'Produce 1 Fledgling',  type: 'produce', chain: 'creature', tier: 2, target: 1, reward: { stars: 2, gems: 15 } },
        { id: 'cr3', desc: 'Produce 1 Juvenile',   type: 'produce', chain: 'creature', tier: 3, target: 1, reward: { stars: 3, gems: 25 } },
        // General quests
        { id: 'g1', desc: 'Merge 10 times',        type: 'merge_count',  target: 10, reward: { stars: 1, gems: 5 } },
        { id: 'g2', desc: 'Merge 25 times',        type: 'merge_count',  target: 25, reward: { stars: 2, gems: 10 } },
        { id: 'g3', desc: 'Spawn 15 items',        type: 'spawn_count',  target: 15, reward: { stars: 1, gems: 5 } },
        { id: 'g4', desc: 'Create a Tier 4 item',  type: 'reach_tier',   tier: 4,    target: 1, reward: { stars: 3, gems: 20 } },
        { id: 'g5', desc: 'Create a Tier 5 item',  type: 'reach_tier',   tier: 5,    target: 1, reward: { stars: 4, gems: 30 } },
        { id: 'g6', desc: 'Create a Tier 6 item',  type: 'reach_tier',   tier: 6,    target: 1, reward: { stars: 5, gems: 50 } },
    ];

    let activeQuests = [];   // Current active quests with progress
    let completedIds = [];   // IDs of all-time completed quests

    function init() {
        var state = Game.getState();
        if (state.quests && state.quests.active) {
            activeQuests = state.quests.active;
            completedIds = state.quests.completedIds || [];
        } else {
            activeQuests = [];
            completedIds = [];
            // Fill initial quests — pick easy ones first
            fillQuests();
        }

        // Listen for game events
        Game.on('itemProduced', onItemProduced);
        Game.on('mergeCompleted', onMergeCompleted);
        Game.on('itemSpawned', onItemSpawned);

        renderQuestPanel();
    }

    function fillQuests() {
        while (activeQuests.length < MAX_ACTIVE) {
            var next = pickNextQuest();
            if (!next) break;
            activeQuests.push({
                id: next.id,
                desc: next.desc,
                type: next.type,
                chain: next.chain || null,
                tier: next.tier || 0,
                target: next.target,
                current: 0,
                reward: next.reward,
                completed: false,
                claimed: false
            });
        }
        saveQuestState();
    }

    function pickNextQuest() {
        // Get IDs already active or completed
        var usedIds = {};
        for (var i = 0; i < activeQuests.length; i++) usedIds[activeQuests[i].id] = true;
        for (var j = 0; j < completedIds.length; j++) usedIds[completedIds[j]] = true;

        // Filter available quests
        var available = questPool.filter(function(q) { return !usedIds[q.id]; });

        if (available.length === 0) {
            // All quests completed — reset completed list to recycle (with higher targets)
            completedIds = [];
            available = questPool.filter(function(q) {
                for (var k = 0; k < activeQuests.length; k++) {
                    if (activeQuests[k].id === q.id) return false;
                }
                return true;
            });
        }

        if (available.length === 0) return null;

        // Sort by difficulty (stars) and pick from the easier half
        available.sort(function(a, b) { return a.reward.stars - b.reward.stars; });
        var pickRange = Math.max(1, Math.ceil(available.length * 0.6));
        var idx = Math.floor(Math.random() * pickRange);
        return available[idx];
    }

    // ─── EVENT HANDLERS ──────────────────────────────────────

    function onItemProduced(data) {
        // data: { chain, tier }
        var changed = false;
        for (var i = 0; i < activeQuests.length; i++) {
            var q = activeQuests[i];
            if (q.completed || q.claimed) continue;

            if (q.type === 'produce' && q.chain === data.chain && q.tier === data.tier) {
                q.current = Math.min(q.current + 1, q.target);
                if (q.current >= q.target) q.completed = true;
                changed = true;
            }
            if (q.type === 'reach_tier' && data.tier >= q.tier) {
                q.current = Math.min(q.current + 1, q.target);
                if (q.current >= q.target) q.completed = true;
                changed = true;
            }
        }
        if (changed) {
            saveQuestState();
            renderQuestPanel();
        }
    }

    function onMergeCompleted(data) {
        var changed = false;
        for (var i = 0; i < activeQuests.length; i++) {
            var q = activeQuests[i];
            if (q.completed || q.claimed) continue;
            if (q.type === 'merge_count') {
                q.current = Math.min(q.current + 1, q.target);
                if (q.current >= q.target) q.completed = true;
                changed = true;
            }
        }
        if (changed) {
            saveQuestState();
            renderQuestPanel();
        }
    }

    function onItemSpawned(data) {
        var changed = false;
        for (var i = 0; i < activeQuests.length; i++) {
            var q = activeQuests[i];
            if (q.completed || q.claimed) continue;
            if (q.type === 'spawn_count') {
                q.current = Math.min(q.current + 1, q.target);
                if (q.current >= q.target) q.completed = true;
                changed = true;
            }
        }
        if (changed) {
            saveQuestState();
            renderQuestPanel();
        }
    }

    // ─── CLAIM REWARDS ───────────────────────────────────────

    function claimQuest(questId) {
        for (var i = 0; i < activeQuests.length; i++) {
            var q = activeQuests[i];
            if (q.id === questId && q.completed && !q.claimed) {
                q.claimed = true;
                completedIds.push(q.id);

                // Grant rewards
                if (q.reward.stars) Game.addStars(q.reward.stars);
                if (q.reward.gems) Game.addGems(q.reward.gems);

                Sound.playCelebration();
                Game.vibrate([15, 30, 15]);

                // Remove claimed quest and fill slot
                activeQuests.splice(i, 1);
                fillQuests();
                renderQuestPanel();

                // Notify island system
                Game.emit('questCompleted', { questId: q.id, stars: q.reward.stars });
                return;
            }
        }
    }

    // ─── RENDERING ───────────────────────────────────────────

    function renderQuestPanel() {
        var panel = document.getElementById('quest-list');
        if (!panel) return;

        panel.innerHTML = '';

        if (activeQuests.length === 0) {
            panel.innerHTML = '<div class="quest-empty">All quests complete! More coming soon...</div>';
            return;
        }

        for (var i = 0; i < activeQuests.length; i++) {
            var q = activeQuests[i];
            var card = document.createElement('div');
            card.className = 'quest-card' + (q.completed ? ' quest-complete' : '');

            var pct = Math.min(100, Math.round((q.current / q.target) * 100));

            // Chain icon
            var chainIcon = '';
            if (q.chain) {
                var chainData = Items.chains[q.chain];
                chainIcon = chainData ? chainData.icon : '';
            } else {
                chainIcon = '\u2B50'; // star for general quests
            }

            card.innerHTML =
                '<div class="quest-header">' +
                    '<span class="quest-icon">' + chainIcon + '</span>' +
                    '<span class="quest-desc">' + q.desc + '</span>' +
                '</div>' +
                '<div class="quest-progress-bar">' +
                    '<div class="quest-progress-fill" style="width:' + pct + '%"></div>' +
                '</div>' +
                '<div class="quest-footer">' +
                    '<span class="quest-count">' + q.current + '/' + q.target + '</span>' +
                    '<span class="quest-reward">' +
                        (q.reward.stars ? '\u2B50 ' + q.reward.stars + ' ' : '') +
                        (q.reward.gems ? '\u{1F48E} ' + q.reward.gems : '') +
                    '</span>' +
                    (q.completed ?
                        '<button class="quest-claim-btn" data-quest="' + q.id + '">Claim!</button>' :
                        '') +
                '</div>';

            panel.appendChild(card);
        }

        // Attach claim button handlers
        var claimBtns = panel.querySelectorAll('.quest-claim-btn');
        for (var j = 0; j < claimBtns.length; j++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    claimQuest(btn.dataset.quest);
                });
            })(claimBtns[j]);
        }
    }

    function saveQuestState() {
        var state = Game.getState();
        state.quests = {
            active: activeQuests,
            completedIds: completedIds
        };
        Game.save();
    }

    function getActiveQuests() { return activeQuests; }
    function getCompletedCount() { return completedIds.length; }

    return {
        init: init,
        claimQuest: claimQuest,
        getActiveQuests: getActiveQuests,
        getCompletedCount: getCompletedCount,
        renderQuestPanel: renderQuestPanel
    };
})();
