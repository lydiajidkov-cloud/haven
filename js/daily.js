// Haven - Daily Login Streak & Daily Quests
'use strict';

const Daily = (() => {
    const STREAK_REWARDS = [
        { day: 1,  reward: { gems: 10 },       label: '💎 10' },
        { day: 2,  reward: { gems: 15 },       label: '💎 15' },
        { day: 3,  reward: { gems: 20 },       label: '💎 20' },
        { day: 4,  reward: { energy: 5, powerup: 'shuffle' }, label: '⚡ 5 + 🔀' },
        { day: 5,  reward: { gems: 30 },       label: '💎 30' },
        { day: 6,  reward: { gems: 35 },       label: '💎 35' },
        { day: 7,  reward: { gems: 50, stars: 2 }, label: '💎 50 + ⭐ 2' },
        { day: 8,  reward: { gems: 20 },       label: '💎 20' },
        { day: 9,  reward: { gems: 25 },       label: '💎 25' },
        { day: 10, reward: { gems: 30 },       label: '💎 30' },
        { day: 11, reward: { energy: 5 },      label: '⚡ 5' },
        { day: 12, reward: { gems: 40 },       label: '💎 40' },
        { day: 13, reward: { gems: 45 },       label: '💎 45' },
        { day: 14, reward: { gems: 75, stars: 3 }, label: '💎 75 + ⭐ 3' },
        { day: 15, reward: { gems: 30 },       label: '💎 30' },
        { day: 16, reward: { gems: 35 },       label: '💎 35' },
        { day: 17, reward: { gems: 40 },       label: '💎 40' },
        { day: 18, reward: { energy: 5, powerup: 'mass_match' }, label: '⚡ 5 + 💥' },
        { day: 19, reward: { gems: 50 },       label: '💎 50' },
        { day: 20, reward: { gems: 55 },       label: '💎 55' },
        { day: 21, reward: { gems: 100, stars: 4 }, label: '💎 100 + ⭐ 4' },
        { day: 22, reward: { gems: 40 },       label: '💎 40' },
        { day: 23, reward: { gems: 45 },       label: '💎 45' },
        { day: 24, reward: { gems: 50 },       label: '💎 50' },
        { day: 25, reward: { energy: 5 },      label: '⚡ 5' },
        { day: 26, reward: { gems: 60 },       label: '💎 60' },
        { day: 27, reward: { gems: 70 },       label: '💎 70' },
        { day: 28, reward: { gems: 80 },       label: '💎 80' },
        { day: 29, reward: { gems: 90 },       label: '💎 90' },
        { day: 30, reward: { gems: 200, stars: 5 }, label: '💎 200 + ⭐ 5 🏆' },
    ];

    // Daily quests
    const dailyQuestPool = [
        { id: 'dq_merge5',   desc: 'Merge 5 times',       type: 'merge_count',  target: 5,  reward: { gems: 10 } },
        { id: 'dq_merge15',  desc: 'Merge 15 times',      type: 'merge_count',  target: 15, reward: { gems: 20 } },
        { id: 'dq_spawn5',   desc: 'Spawn 5 items',       type: 'spawn_count',  target: 5,  reward: { gems: 10 } },
        { id: 'dq_spawn10',  desc: 'Spawn 10 items',      type: 'spawn_count',  target: 10, reward: { gems: 15 } },
        { id: 'dq_tier2',    desc: 'Create a Tier 2 item', type: 'reach_tier',  tier: 2, target: 1, reward: { gems: 10 } },
        { id: 'dq_tier3',    desc: 'Create a Tier 3 item', type: 'reach_tier',  tier: 3, target: 1, reward: { gems: 15 } },
        { id: 'dq_wood',     desc: 'Produce 3 Wood items', type: 'produce_any', chain: 'wood',  target: 3, reward: { gems: 10 } },
        { id: 'dq_stone',    desc: 'Produce 3 Stone items', type: 'produce_any', chain: 'stone', target: 3, reward: { gems: 10 } },
        { id: 'dq_flora',    desc: 'Produce 3 Flora items', type: 'produce_any', chain: 'flora', target: 3, reward: { gems: 10 } },
        { id: 'dq_crystal',  desc: 'Produce 3 Crystal items', type: 'produce_any', chain: 'crystal', target: 3, reward: { gems: 10 } },
        { id: 'dq_powerup1', desc: 'Use a power-up',       type: 'powerup_use', target: 1, reward: { gems: 15 } },
        { id: 'dq_powerup3', desc: 'Use 3 power-ups',      type: 'powerup_use', target: 3, reward: { gems: 25 } },
    ];

    let streak = 0;
    let lastLoginDate = null;
    let todayClaimed = false;
    let dailyQuests = [];

    function init() {
        var state = Game.getState();
        if (state.daily) {
            streak = state.daily.streak || 0;
            lastLoginDate = state.daily.lastLoginDate || null;
            todayClaimed = state.daily.todayClaimed || false;
            dailyQuests = state.daily.quests || [];
        }

        checkNewDay();

        // Listen for game events (for daily quests)
        Game.on('mergeCompleted', function(data) { updateDailyQuests('merge_count', data); });
        Game.on('itemSpawned', function(data) { updateDailyQuests('spawn_count', data); });
        Game.on('itemProduced', function(data) { updateDailyQuests('reach_tier', data); updateDailyQuests('produce_any', data); });
        Game.on('powerupUsed', function(data) { updateDailyQuests('powerup_use', data); });

        renderDaily();
    }

    function checkNewDay() {
        var today = getDateString();

        if (lastLoginDate !== today) {
            // New day!
            if (lastLoginDate === getDateString(-1)) {
                // Consecutive day — continue streak
                streak++;
            } else if (lastLoginDate === null) {
                // First ever login
                streak = 1;
            } else {
                // Streak broken — restart
                streak = 1;
            }
            todayClaimed = false;
            lastLoginDate = today;

            // Generate new daily quests
            generateDailyQuests();

            saveDailyState();
        }
    }

    function getDateString(offsetDays) {
        var d = new Date();
        if (offsetDays) d.setDate(d.getDate() + offsetDays);
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    function claimDailyReward() {
        if (todayClaimed) return;

        var dayIdx = ((streak - 1) % 30);
        var dayReward = STREAK_REWARDS[dayIdx];
        if (!dayReward) return;

        todayClaimed = true;

        if (dayReward.reward.gems) Game.addGems(dayReward.reward.gems);
        if (dayReward.reward.energy) Game.addEnergy(dayReward.reward.energy);
        if (dayReward.reward.stars) Game.addStars(dayReward.reward.stars);
        if (dayReward.reward.powerup && typeof PowerUps !== 'undefined') {
            PowerUps.addToInventory(dayReward.reward.powerup, 1);
        }

        Sound.playCelebration();
        Game.vibrate([15, 30, 15]);
        saveDailyState();
        renderDaily();
    }

    function generateDailyQuests() {
        dailyQuests = [];
        var shuffled = dailyQuestPool.slice().sort(function() { return Math.random() - 0.5; });
        for (var i = 0; i < 3 && i < shuffled.length; i++) {
            dailyQuests.push({
                id: shuffled[i].id,
                desc: shuffled[i].desc,
                type: shuffled[i].type,
                chain: shuffled[i].chain || null,
                tier: shuffled[i].tier || 0,
                target: shuffled[i].target,
                current: 0,
                reward: shuffled[i].reward,
                completed: false,
                claimed: false
            });
        }
    }

    function updateDailyQuests(eventType, data) {
        var changed = false;
        for (var i = 0; i < dailyQuests.length; i++) {
            var q = dailyQuests[i];
            if (q.completed || q.claimed) continue;

            var match = false;
            if (q.type === 'merge_count' && eventType === 'merge_count') match = true;
            if (q.type === 'spawn_count' && eventType === 'spawn_count') match = true;
            if (q.type === 'reach_tier' && eventType === 'reach_tier' && data.tier >= (q.tier || 0)) match = true;
            if (q.type === 'produce_any' && eventType === 'produce_any' && data.chain === q.chain) match = true;
            if (q.type === 'powerup_use' && eventType === 'powerup_use') match = true;

            if (match) {
                q.current = Math.min(q.current + 1, q.target);
                if (q.current >= q.target) q.completed = true;
                changed = true;
            }
        }
        if (changed) {
            saveDailyState();
            renderDaily();
        }
    }

    function claimDailyQuest(questId) {
        for (var i = 0; i < dailyQuests.length; i++) {
            var q = dailyQuests[i];
            if (q.id === questId && q.completed && !q.claimed) {
                q.claimed = true;
                if (q.reward.gems) Game.addGems(q.reward.gems);
                if (q.reward.energy) Game.addEnergy(q.reward.energy);
                Sound.playMerge(4);
                saveDailyState();
                renderDaily();
                return;
            }
        }
    }

    // ─── RENDERING ───────────────────────────────────────────

    function renderDaily() {
        var container = document.getElementById('daily-content');
        if (!container) return;

        var dayIdx = ((streak - 1) % 30);
        var html = '';

        // Login streak
        html += '<div class="daily-section">';
        html += '<h3 class="daily-section-title">🔥 Login Streak: Day ' + streak + '</h3>';

        if (!todayClaimed) {
            var todayReward = STREAK_REWARDS[dayIdx];
            html += '<div class="daily-claim-box">';
            html += '<span class="daily-claim-reward">' + todayReward.label + '</span>';
            html += '<button class="daily-claim-btn" id="daily-claim-login">Claim Today\'s Reward!</button>';
            html += '</div>';
        } else {
            html += '<div class="daily-claimed-box">✅ Today\'s reward claimed!</div>';
        }

        // Calendar preview (show 7 days)
        html += '<div class="daily-calendar">';
        var startDay = Math.max(0, dayIdx - 2);
        for (var d = startDay; d < startDay + 7 && d < 30; d++) {
            var r = STREAK_REWARDS[d];
            var isCurrent = d === dayIdx;
            var isPast = d < dayIdx;
            html += '<div class="daily-cal-day' + (isCurrent ? ' current' : '') + (isPast ? ' past' : '') + '">';
            html += '<span class="cal-day-num">Day ' + r.day + '</span>';
            html += '<span class="cal-day-reward">' + r.label + '</span>';
            if (isPast) html += '<span class="cal-check">✓</span>';
            html += '</div>';
        }
        html += '</div></div>';

        // Daily Quests
        html += '<div class="daily-section">';
        html += '<h3 class="daily-section-title">📋 Daily Quests</h3>';
        for (var i = 0; i < dailyQuests.length; i++) {
            var q = dailyQuests[i];
            var pct = Math.round((q.current / q.target) * 100);
            html += '<div class="daily-quest' + (q.completed ? ' complete' : '') + '">';
            html += '<div class="dq-info">';
            html += '<span class="dq-desc">' + q.desc + '</span>';
            html += '<span class="dq-progress">' + q.current + '/' + q.target + '</span>';
            html += '</div>';
            html += '<div class="dq-bar"><div class="dq-fill" style="width:' + pct + '%"></div></div>';
            if (q.completed && !q.claimed) {
                html += '<button class="dq-claim-btn" data-dq="' + q.id + '">💎 ' + q.reward.gems + '</button>';
            } else if (q.claimed) {
                html += '<span class="dq-claimed">✓</span>';
            }
            html += '</div>';
        }
        html += '</div>';

        container.innerHTML = html;

        // Event listeners
        var loginBtn = document.getElementById('daily-claim-login');
        if (loginBtn) loginBtn.addEventListener('click', claimDailyReward);

        container.querySelectorAll('.dq-claim-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                claimDailyQuest(btn.dataset.dq);
            });
        });
    }

    function saveDailyState() {
        var state = Game.getState();
        state.daily = {
            streak: streak,
            lastLoginDate: lastLoginDate,
            todayClaimed: todayClaimed,
            quests: dailyQuests
        };
        Game.save();
    }

    return {
        init: init,
        renderDaily: renderDaily,
        getStreak: function() { return streak; }
    };
})();
