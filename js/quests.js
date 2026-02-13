// Haven - Quest System: Definitions, Tracking, Completion
'use strict';

const Quests = (() => {
    const MAX_ACTIVE = 4;

    // Quest pool — each has a unique id, type, requirements, and rewards
    const questPool = [
        // Wood chain
        { id: 'w1', desc: 'Produce 3 Branches',      type: 'produce', chain: 'wood',    tier: 1, target: 3, reward: { stars: 1, gems: 5 } },
        { id: 'w2', desc: 'Produce 2 Logs',           type: 'produce', chain: 'wood',    tier: 2, target: 2, reward: { stars: 1, gems: 10 } },
        { id: 'w3', desc: 'Produce 1 Plank',          type: 'produce', chain: 'wood',    tier: 3, target: 1, reward: { stars: 2, gems: 15 } },
        { id: 'w4', desc: 'Produce 1 Beam',           type: 'produce', chain: 'wood',    tier: 4, target: 1, reward: { stars: 3, gems: 20 } },
        { id: 'w5', desc: 'Produce 1 Frame',          type: 'produce', chain: 'wood',    tier: 5, target: 1, reward: { stars: 4, gems: 30 } },
        { id: 'w6', desc: 'Produce 1 Workshop',       type: 'produce', chain: 'wood',    tier: 7, target: 1, reward: { stars: 6, gems: 60 } },
        { id: 'w7', desc: 'Produce 1 Treehouse',      type: 'produce', chain: 'wood',    tier: 9, target: 1, reward: { stars: 8, gems: 100 } },
        // Stone chain
        { id: 's1', desc: 'Produce 3 Rocks',          type: 'produce', chain: 'stone',   tier: 1, target: 3, reward: { stars: 1, gems: 5 } },
        { id: 's2', desc: 'Produce 2 Boulders',       type: 'produce', chain: 'stone',   tier: 2, target: 2, reward: { stars: 1, gems: 10 } },
        { id: 's3', desc: 'Produce 1 Slab',           type: 'produce', chain: 'stone',   tier: 3, target: 1, reward: { stars: 2, gems: 15 } },
        { id: 's4', desc: 'Produce 1 Block',          type: 'produce', chain: 'stone',   tier: 4, target: 1, reward: { stars: 3, gems: 20 } },
        { id: 's5', desc: 'Produce 1 Arch',           type: 'produce', chain: 'stone',   tier: 7, target: 1, reward: { stars: 6, gems: 60 } },
        { id: 's6', desc: 'Produce 1 Fortress',       type: 'produce', chain: 'stone',   tier: 9, target: 1, reward: { stars: 8, gems: 100 } },
        // Flora chain
        { id: 'f1', desc: 'Produce 3 Sprouts',        type: 'produce', chain: 'flora',   tier: 1, target: 3, reward: { stars: 1, gems: 5 } },
        { id: 'f2', desc: 'Produce 2 Buds',           type: 'produce', chain: 'flora',   tier: 2, target: 2, reward: { stars: 1, gems: 10 } },
        { id: 'f3', desc: 'Produce 1 Flower',         type: 'produce', chain: 'flora',   tier: 3, target: 1, reward: { stars: 2, gems: 15 } },
        { id: 'f4', desc: 'Produce 1 Bouquet',        type: 'produce', chain: 'flora',   tier: 4, target: 1, reward: { stars: 3, gems: 20 } },
        { id: 'f5', desc: 'Produce 1 Meadow',         type: 'produce', chain: 'flora',   tier: 7, target: 1, reward: { stars: 6, gems: 60 } },
        { id: 'f6', desc: 'Produce 1 Eden',           type: 'produce', chain: 'flora',   tier: 9, target: 1, reward: { stars: 8, gems: 100 } },
        // Crystal chain
        { id: 'c1', desc: 'Produce 3 Fragments',      type: 'produce', chain: 'crystal', tier: 1, target: 3, reward: { stars: 1, gems: 5 } },
        { id: 'c2', desc: 'Produce 2 Gems',           type: 'produce', chain: 'crystal', tier: 2, target: 2, reward: { stars: 1, gems: 10 } },
        { id: 'c3', desc: 'Produce 1 Crystal',        type: 'produce', chain: 'crystal', tier: 3, target: 1, reward: { stars: 2, gems: 15 } },
        { id: 'c4', desc: 'Produce 1 Prism',          type: 'produce', chain: 'crystal', tier: 4, target: 1, reward: { stars: 3, gems: 25 } },
        { id: 'c5', desc: 'Produce 1 Nexus',          type: 'produce', chain: 'crystal', tier: 7, target: 1, reward: { stars: 6, gems: 60 } },
        { id: 'c6', desc: 'Produce 1 Infinity',       type: 'produce', chain: 'crystal', tier: 9, target: 1, reward: { stars: 8, gems: 100 } },
        // Creature chain
        { id: 'cr1', desc: 'Produce 2 Hatchlings',    type: 'produce', chain: 'creature', tier: 1, target: 2, reward: { stars: 1, gems: 10 } },
        { id: 'cr2', desc: 'Produce 1 Fledgling',     type: 'produce', chain: 'creature', tier: 2, target: 1, reward: { stars: 2, gems: 15 } },
        { id: 'cr3', desc: 'Produce 1 Juvenile',      type: 'produce', chain: 'creature', tier: 3, target: 1, reward: { stars: 3, gems: 25 } },
        { id: 'cr4', desc: 'Produce 1 Elder',         type: 'produce', chain: 'creature', tier: 5, target: 1, reward: { stars: 5, gems: 40 } },
        { id: 'cr5', desc: 'Produce 1 Dragon',        type: 'produce', chain: 'creature', tier: 7, target: 1, reward: { stars: 8, gems: 100 } },
        // Hybrid chain discovery
        { id: 'h1', desc: 'Create a Vine',            type: 'produce', chain: 'living',   tier: 0, target: 1, reward: { stars: 3, gems: 25 } },
        { id: 'h2', desc: 'Create a Runestone',       type: 'produce', chain: 'arcane',   tier: 0, target: 1, reward: { stars: 3, gems: 25 } },
        { id: 'h3', desc: 'Create a Scaffold',        type: 'produce', chain: 'shelter',  tier: 0, target: 1, reward: { stars: 3, gems: 25 } },
        { id: 'h4', desc: 'Create Fairy Dust',        type: 'produce', chain: 'mystic',   tier: 0, target: 1, reward: { stars: 3, gems: 25 } },
        { id: 'h5', desc: 'Create a World Tree',      type: 'produce', chain: 'living',   tier: 4, target: 1, reward: { stars: 8, gems: 100 } },
        { id: 'h6', desc: "Create a Philosopher\u2019s Stone", type: 'produce', chain: 'arcane', tier: 4, target: 1, reward: { stars: 8, gems: 100 } },
        { id: 'h7', desc: 'Create a Citadel',         type: 'produce', chain: 'shelter',  tier: 4, target: 1, reward: { stars: 8, gems: 100 } },
        { id: 'h8', desc: 'Create a Celestial',       type: 'produce', chain: 'mystic',   tier: 4, target: 1, reward: { stars: 8, gems: 100 } },
        // General milestones
        { id: 'g1', desc: 'Merge 10 times',           type: 'merge_count',  target: 10,  reward: { stars: 1, gems: 5 } },
        { id: 'g2', desc: 'Merge 25 times',           type: 'merge_count',  target: 25,  reward: { stars: 2, gems: 10 } },
        { id: 'g3', desc: 'Merge 50 times',           type: 'merge_count',  target: 50,  reward: { stars: 3, gems: 20 } },
        { id: 'g4', desc: 'Merge 100 times',          type: 'merge_count',  target: 100, reward: { stars: 5, gems: 50 } },
        { id: 'g5', desc: 'Spawn 15 items',           type: 'spawn_count',  target: 15,  reward: { stars: 1, gems: 5 } },
        { id: 'g6', desc: 'Spawn 50 items',           type: 'spawn_count',  target: 50,  reward: { stars: 2, gems: 15 } },
        { id: 'g7', desc: 'Spawn 100 items',          type: 'spawn_count',  target: 100, reward: { stars: 3, gems: 25 } },
        // Tier milestones
        { id: 'g8',  desc: 'Create a Tier 4 item',    type: 'reach_tier',   tier: 4, target: 1, reward: { stars: 3, gems: 20 } },
        { id: 'g9',  desc: 'Create a Tier 5 item',    type: 'reach_tier',   tier: 5, target: 1, reward: { stars: 4, gems: 30 } },
        { id: 'g10', desc: 'Create a Tier 6 item',    type: 'reach_tier',   tier: 6, target: 1, reward: { stars: 5, gems: 50 } },
        { id: 'g11', desc: 'Create a Tier 7 item',    type: 'reach_tier',   tier: 7, target: 1, reward: { stars: 6, gems: 60 } },
        { id: 'g12', desc: 'Create a Tier 8 item',    type: 'reach_tier',   tier: 8, target: 1, reward: { stars: 7, gems: 80 } },
        { id: 'g13', desc: 'Create a Tier 9 item',    type: 'reach_tier',   tier: 9, target: 1, reward: { stars: 8, gems: 100 } },
        // Cross-chain achievements
        { id: 'x1', desc: 'Perform a cross-chain merge',       type: 'crosschain_count', target: 1,  reward: { stars: 2, gems: 15 } },
        { id: 'x2', desc: 'Perform 5 cross-chain merges',      type: 'crosschain_count', target: 5,  reward: { stars: 3, gems: 30 } },
        { id: 'x3', desc: 'Perform 15 cross-chain merges',     type: 'crosschain_count', target: 15, reward: { stars: 5, gems: 50 } },
        // Big merge achievements
        { id: 'b1', desc: 'Merge 5 items at once',    type: 'big_merge',    target: 5, reward: { stars: 3, gems: 20 } },
        { id: 'b2', desc: 'Merge 7 items at once',    type: 'big_merge',    target: 7, reward: { stars: 5, gems: 50 } },
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
        Game.on('crossChainMerge', onCrossChainMerge);

        renderQuestPanel();
    }

    function fillQuests() {
        while (activeQuests.length < MAX_ACTIVE) {
            // If we can show a choice, do so for the first empty slot
            if (activeQuests.length === MAX_ACTIVE - 1) {
                // Last slot: show choice overlay
                showQuestChoice();
                return; // Don't fill further until player chooses
            }
            var next = pickNextQuest();
            if (!next) break;
            var startProgress = 0;
            if (next.type === 'merge_count' || next.type === 'spawn_count') {
                startProgress = Math.min(Math.floor(next.target * 0.2), next.target - 1);
            }
            activeQuests.push({
                id: next.id,
                desc: next.desc,
                type: next.type,
                chain: next.chain || null,
                tier: next.tier || 0,
                target: next.target,
                current: startProgress,
                reward: next.reward,
                completed: false,
                claimed: false
            });
        }
        saveQuestState();
    }

    var questChoiceTimer = null;

    function showQuestChoice() {
        var option1 = pickNextQuest();
        if (!option1) {
            // No quests available, just fill normally
            var fallback = pickNextQuest();
            if (fallback) addQuestDirect(fallback);
            return;
        }

        // Pick a second option (exclude the first)
        var tempExclude = option1.id;
        var option2 = pickNextQuestExcluding(tempExclude);
        if (!option2) {
            // Only one quest available, auto-assign
            addQuestDirect(option1);
            return;
        }

        // Show overlay
        var overlay = document.createElement('div');
        overlay.id = 'quest-choice-overlay';
        overlay.className = 'quest-choice-overlay';

        var chainIcon1 = getQuestChainIcon(option1);
        var chainIcon2 = getQuestChainIcon(option2);

        overlay.innerHTML =
            '<div class="quest-choice-card">' +
                '<h3>Choose Your Quest</h3>' +
                '<p class="quest-choice-subtitle">Pick one to pursue</p>' +
                '<div class="quest-choice-options">' +
                    '<button class="quest-choice-option" data-choice="0">' +
                        '<span class="quest-choice-icon">' + chainIcon1 + '</span>' +
                        '<span class="quest-choice-desc">' + option1.desc + '</span>' +
                        '<span class="quest-choice-reward">' +
                            (option1.reward.stars ? '\u2B50' + option1.reward.stars + ' ' : '') +
                            (option1.reward.gems ? '\u{1F48E}' + option1.reward.gems : '') +
                        '</span>' +
                    '</button>' +
                    '<button class="quest-choice-option" data-choice="1">' +
                        '<span class="quest-choice-icon">' + chainIcon2 + '</span>' +
                        '<span class="quest-choice-desc">' + option2.desc + '</span>' +
                        '<span class="quest-choice-reward">' +
                            (option2.reward.stars ? '\u2B50' + option2.reward.stars + ' ' : '') +
                            (option2.reward.gems ? '\u{1F48E}' + option2.reward.gems : '') +
                        '</span>' +
                    '</button>' +
                '</div>' +
            '</div>';

        var app = document.getElementById('app');
        if (app) app.appendChild(overlay);

        // Handle choice
        var buttons = overlay.querySelectorAll('.quest-choice-option');
        buttons[0].addEventListener('click', function() {
            addQuestDirect(option1);
            dismissQuestChoice();
        });
        buttons[1].addEventListener('click', function() {
            addQuestDirect(option2);
            dismissQuestChoice();
        });

        // Auto-pick after 30 seconds
        questChoiceTimer = setTimeout(function() {
            addQuestDirect(option1);
            dismissQuestChoice();
        }, 30000);
    }

    function dismissQuestChoice() {
        if (questChoiceTimer) {
            clearTimeout(questChoiceTimer);
            questChoiceTimer = null;
        }
        var overlay = document.getElementById('quest-choice-overlay');
        if (overlay) overlay.remove();
    }

    function addQuestDirect(questDef) {
        var startProgress = 0;
        if (questDef.type === 'merge_count' || questDef.type === 'spawn_count') {
            startProgress = Math.min(Math.floor(questDef.target * 0.2), questDef.target - 1);
        }
        activeQuests.push({
            id: questDef.id,
            desc: questDef.desc,
            type: questDef.type,
            chain: questDef.chain || null,
            tier: questDef.tier || 0,
            target: questDef.target,
            current: startProgress,
            reward: questDef.reward,
            completed: false,
            claimed: false
        });
        saveQuestState();
        renderQuestPanel();
    }

    function pickNextQuestExcluding(excludeId) {
        var usedIds = {};
        for (var i = 0; i < activeQuests.length; i++) usedIds[activeQuests[i].id] = true;
        for (var j = 0; j < completedIds.length; j++) usedIds[completedIds[j]] = true;
        usedIds[excludeId] = true;

        var available = questPool.filter(function(q) { return !usedIds[q.id]; });

        if (available.length === 0) return null;

        available.sort(function(a, b) { return a.reward.stars - b.reward.stars; });
        var pickRange = Math.max(1, Math.ceil(available.length * 0.6));
        var idx = Math.floor(Math.random() * pickRange);
        return available[idx];
    }

    function getQuestChainIcon(questDef) {
        if (questDef.chain) {
            var chainData = Items.chains[questDef.chain];
            return chainData ? chainData.icon : '';
        }
        if (questDef.type === 'crosschain_count') return '\u{1F52E}';
        if (questDef.type === 'big_merge') return '\u{1F4A5}';
        return '\u2B50';
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
            if (q.type === 'big_merge' && data.count >= q.target) {
                q.current = 1;
                q.completed = true;
                changed = true;
            }
        }
        if (changed) {
            saveQuestState();
            renderQuestPanel();
        }
    }

    function onCrossChainMerge(data) {
        var changed = false;
        for (var i = 0; i < activeQuests.length; i++) {
            var q = activeQuests[i];
            if (q.completed || q.claimed) continue;
            if (q.type === 'crosschain_count') {
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

                Sound.playAchievement();
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
            } else if (q.type === 'crosschain_count') {
                chainIcon = '\u{1F52E}'; // crystal ball for cross-chain
            } else if (q.type === 'big_merge') {
                chainIcon = '\u{1F4A5}'; // explosion for big merge
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

        // Update red dot on quests nav button
        updateQuestNotificationDot();
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

    function updateQuestNotificationDot() {
        var questNavBtn = document.querySelector('[data-screen="quest"]');
        if (!questNavBtn) return;
        var hasClaimable = false;
        for (var i = 0; i < activeQuests.length; i++) {
            if (activeQuests[i].completed && !activeQuests[i].claimed) {
                hasClaimable = true;
                break;
            }
        }
        if (hasClaimable) {
            questNavBtn.classList.add('nav-badge-pulse');
        } else {
            questNavBtn.classList.remove('nav-badge-pulse');
        }
    }

    return {
        init: init,
        claimQuest: claimQuest,
        getActiveQuests: getActiveQuests,
        getCompletedCount: getCompletedCount,
        renderQuestPanel: renderQuestPanel
    };
})();
