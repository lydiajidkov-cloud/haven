// Haven - 7-Day Rolling Login Calendar & Daily Quests
'use strict';

const Daily = (() => {
    // ─── 7-DAY ROLLING CALENDAR REWARDS ─────────────────────
    const CALENDAR_REWARDS = [
        { day: 1, rewards: { gems: 25 },                              label: '25 gems',           icons: '\uD83D\uDC8E 25' },
        { day: 2, rewards: { energy: 3, gems: 15 },                   label: '3 energy + 15 gems', icons: '\u26A1 3 + \uD83D\uDC8E 15' },
        { day: 3, rewards: { gems: 50 },                              label: '50 gems',           icons: '\uD83D\uDC8E 50' },
        { day: 4, rewards: { energy: 5, gems: 25 },                   label: '5 energy + 25 gems', icons: '\u26A1 5 + \uD83D\uDC8E 25' },
        { day: 5, rewards: { gems: 100, stars: 1 },                   label: '100 gems + 1 star', icons: '\uD83D\uDC8E 100 + \u2B50 1' },
        { day: 6, rewards: { gems: 50, egg: 'common' },               label: 'Common Egg + 50 gems', icons: '\uD83E\uDD5A + \uD83D\uDC8E 50' },
        { day: 7, rewards: { gems: 250, stars: 3, egg: 'rare' },      label: '250 gems + 3 stars + Rare Egg', icons: '\uD83C\uDF81 JACKPOT' }
    ];

    // ─── DAILY QUESTS ───────────────────────────────────────
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

    // Calendar state
    let calendar = {
        currentDay: 1,       // 1-7, which day of the cycle the player is on
        lastClaimDate: null,  // 'YYYY-MM-DD' string of last claim
        streak: 0             // consecutive days claimed
    };

    let todayCanClaim = false;
    let dailyQuests = [];

    // ─── INIT ───────────────────────────────────────────────

    function init() {
        var state = Game.getState();

        // Load calendar state
        if (state.daily && state.daily.calendar) {
            calendar.currentDay = state.daily.calendar.currentDay || 1;
            calendar.lastClaimDate = state.daily.calendar.lastClaimDate || null;
            calendar.streak = state.daily.calendar.streak || 0;
        }

        // Load daily quests
        if (state.daily && state.daily.quests) {
            dailyQuests = state.daily.quests;
        }

        // Migrate from old streak system if it exists but calendar doesn't
        if (state.daily && !state.daily.calendar && state.daily.streak) {
            calendar.streak = 0;
            calendar.currentDay = 1;
            calendar.lastClaimDate = null;
        }

        checkNewDay();

        // Listen for game events (for daily quests)
        Game.on('mergeCompleted', function(data) { updateDailyQuests('merge_count', data); });
        Game.on('itemSpawned', function(data) { updateDailyQuests('spawn_count', data); });
        Game.on('itemProduced', function(data) { updateDailyQuests('reach_tier', data); updateDailyQuests('produce_any', data); });
        Game.on('powerupUsed', function(data) { updateDailyQuests('powerup_use', data); });

        renderDaily();
    }

    // ─── DATE HELPERS ───────────────────────────────────────

    function getDateString(offsetDays) {
        var d = new Date();
        if (offsetDays) d.setDate(d.getDate() + offsetDays);
        // Use YYYY-MM-DD with zero-padded month/day to avoid timezone issues
        var year = d.getFullYear();
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function daysBetween(dateStrA, dateStrB) {
        // Returns number of calendar days between two YYYY-MM-DD strings
        if (!dateStrA || !dateStrB) return Infinity;
        var a = new Date(dateStrA + 'T00:00:00');
        var b = new Date(dateStrB + 'T00:00:00');
        return Math.round((b - a) / (1000 * 60 * 60 * 24));
    }

    // ─── NEW DAY CHECK ──────────────────────────────────────

    function checkNewDay() {
        var today = getDateString();

        if (calendar.lastClaimDate === today) {
            // Already claimed today
            todayCanClaim = false;
        } else if (calendar.lastClaimDate === null) {
            // First ever login — start at day 1
            todayCanClaim = true;
            // Don't touch currentDay, it defaults to 1
        } else {
            // Haven't claimed today
            var gap = daysBetween(calendar.lastClaimDate, today);

            if (gap === 1) {
                // Consecutive day — player can claim the next day in the cycle
                todayCanClaim = true;
                // currentDay was already advanced when they last claimed
            } else if (gap > 1) {
                // Streak broken — reset to day 1
                calendar.currentDay = 1;
                calendar.streak = 0;
                todayCanClaim = true;
            } else {
                // Somehow the date went backwards (clock change?), don't allow re-claim
                todayCanClaim = false;
            }
        }

        // Generate new daily quests if it's a new day
        if (calendar.lastClaimDate !== today && calendar.lastClaimDate !== null) {
            var lastDate = calendar.lastClaimDate;
            // Only regenerate quests if it's actually a new calendar day
            if (lastDate !== today) {
                generateDailyQuests();
            }
        } else if (dailyQuests.length === 0) {
            generateDailyQuests();
        }

        saveDailyState();
    }

    // ─── CLAIM CALENDAR REWARD ──────────────────────────────

    function claimCalendarReward() {
        if (!todayCanClaim) return;

        var dayIndex = calendar.currentDay - 1; // 0-based index
        var dayData = CALENDAR_REWARDS[dayIndex];
        if (!dayData) return;

        // Grant rewards
        var rewards = dayData.rewards;
        if (rewards.gems) Game.addGems(rewards.gems);
        if (rewards.energy) Game.addEnergy(rewards.energy);
        if (rewards.stars) Game.addStars(rewards.stars);
        if (rewards.egg === 'common') {
            Game.emit('shopSpawnRequest', { chain: 'creature', tier: 0 });
        } else if (rewards.egg === 'rare') {
            Game.emit('shopSpawnRequest', { chain: 'creature', tier: 2 });
        }

        // Update calendar state
        calendar.streak = calendar.streak + 1;
        calendar.lastClaimDate = getDateString();

        // Advance to next day (wrap after 7)
        calendar.currentDay++;
        if (calendar.currentDay > 7) {
            calendar.currentDay = 1;
        }

        todayCanClaim = false;

        // Effects
        Sound.playCelebration();
        Game.vibrate([15, 30, 15]);

        // Trigger claim animation
        animateClaim(dayIndex);

        saveDailyState();

        // Re-render after animation delay
        setTimeout(function() {
            renderDaily();
        }, 800);
    }

    // ─── CLAIM ANIMATION ────────────────────────────────────

    function animateClaim(dayIndex) {
        var box = document.querySelector('.cal-box[data-day="' + (dayIndex + 1) + '"]');
        if (!box) return;

        // Add the "opening" class for the box burst animation
        box.classList.add('cal-box-claimed-anim');

        // Create flying reward particles
        var rect = box.getBoundingClientRect();
        var appRect = document.getElementById('app').getBoundingClientRect();

        var dayData = CALENDAR_REWARDS[dayIndex];
        var particles = [];

        if (dayData.rewards.gems) particles.push('\uD83D\uDC8E');
        if (dayData.rewards.energy) particles.push('\u26A1');
        if (dayData.rewards.stars) particles.push('\u2B50');
        if (dayData.rewards.egg) particles.push('\uD83E\uDD5A');

        for (var i = 0; i < particles.length; i++) {
            (function(emoji, index) {
                setTimeout(function() {
                    var el = document.createElement('div');
                    el.className = 'cal-reward-fly';
                    el.textContent = emoji;
                    el.style.left = (rect.left - appRect.left + rect.width / 2) + 'px';
                    el.style.top = (rect.top - appRect.top + rect.height / 2) + 'px';

                    // Fly towards the top bar (gems/energy counters)
                    var targetEl = emoji === '\u26A1' ? document.getElementById('energy-display') :
                                   document.getElementById('gems-display');
                    if (targetEl) {
                        var targetRect = targetEl.getBoundingClientRect();
                        el.style.setProperty('--fly-x', (targetRect.left - appRect.left + targetRect.width / 2 - rect.left + appRect.left - rect.width / 2) + 'px');
                        el.style.setProperty('--fly-y', (targetRect.top - appRect.top - rect.top + appRect.top) + 'px');
                    }

                    document.getElementById('app').appendChild(el);
                    setTimeout(function() { el.remove(); }, 900);
                }, index * 120);
            })(particles[i], i);
        }
    }

    // ─── DAILY QUESTS ───────────────────────────────────────

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

    // ─── RENDERING ──────────────────────────────────────────

    function renderDaily() {
        var container = document.getElementById('daily-content');
        if (!container) return;

        var html = '';

        // ── Streak banner ──
        html += '<div class="cal-streak-banner">';
        if (calendar.streak > 0) {
            html += '<span class="cal-streak-fire">\uD83D\uDD25</span>';
            html += '<span class="cal-streak-text">Day ' + calendar.streak + ' streak';
            if (calendar.streak < 7) {
                html += ' \u2014 Don\'t break it!';
            } else {
                html += ' \u2014 Amazing!';
            }
            html += '</span>';
        } else {
            html += '<span class="cal-streak-text">Start your streak today!</span>';
        }
        html += '</div>';

        // ── 7-Day Calendar Grid ──
        html += '<div class="cal-section">';
        html += '<h3 class="cal-section-title">\uD83D\uDCC5 Login Calendar</h3>';
        html += '<div class="cal-grid">';

        // Determine which days are past, current, future
        // currentDay = the day the player will claim NEXT (or is claiming now)
        // If todayCanClaim, currentDay is the active day
        // Days before currentDay in this cycle are "claimed" (past)
        // Days after currentDay are "locked" (future)

        var claimableDay = todayCanClaim ? calendar.currentDay : -1;

        for (var d = 1; d <= 7; d++) {
            var reward = CALENDAR_REWARDS[d - 1];
            var boxState = '';
            var isPast = false;
            var isCurrent = false;
            var isFuture = false;
            var isJackpot = (d === 7);

            if (todayCanClaim) {
                // Player hasn't claimed today
                if (d < calendar.currentDay) {
                    isPast = true;
                    boxState = 'cal-box-past';
                } else if (d === calendar.currentDay) {
                    isCurrent = true;
                    boxState = 'cal-box-current';
                } else {
                    isFuture = true;
                    boxState = 'cal-box-future';
                }
            } else {
                // Player already claimed today
                // currentDay has already been advanced to the NEXT day
                // So days before currentDay are "past" (claimed)
                if (d < calendar.currentDay) {
                    isPast = true;
                    boxState = 'cal-box-past';
                } else {
                    isFuture = true;
                    boxState = 'cal-box-future';
                }
            }

            html += '<div class="cal-box ' + boxState + (isJackpot ? ' cal-box-jackpot' : '') + '" data-day="' + d + '">';
            html += '<div class="cal-box-day">Day ' + d + '</div>';
            html += '<div class="cal-box-icon">' + getRewardIcon(reward) + '</div>';
            html += '<div class="cal-box-label">' + getRewardShortLabel(reward) + '</div>';

            if (isPast) {
                html += '<div class="cal-box-check">\u2713</div>';
            } else if (isCurrent && todayCanClaim) {
                html += '<button class="cal-claim-btn" id="cal-claim-btn">Claim!</button>';
            } else if (isFuture) {
                html += '<div class="cal-box-lock">\uD83D\uDD12</div>';
            }

            html += '</div>';
        }

        html += '</div>'; // .cal-grid
        html += '</div>'; // .cal-section

        // ── Daily Quests ──
        html += '<div class="daily-section">';
        html += '<h3 class="daily-section-title">\uD83D\uDCCB Daily Quests</h3>';
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
                html += '<button class="dq-claim-btn" data-dq="' + q.id + '">\uD83D\uDC8E ' + q.reward.gems + '</button>';
            } else if (q.claimed) {
                html += '<span class="dq-claimed">\u2713</span>';
            }
            html += '</div>';
        }
        html += '</div>';

        container.innerHTML = html;

        // ── Event Listeners ──
        var claimBtn = document.getElementById('cal-claim-btn');
        if (claimBtn) {
            claimBtn.addEventListener('click', function() {
                claimCalendarReward();
            });
        }

        container.querySelectorAll('.dq-claim-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                claimDailyQuest(btn.dataset.dq);
            });
        });
    }

    function getRewardIcon(reward) {
        var r = reward.rewards;
        if (reward.day === 7) return '\uD83C\uDF81';       // Gift box for jackpot
        if (r.egg === 'common') return '\uD83E\uDD5A';     // Egg
        if (r.stars) return '\u2B50';                        // Star
        if (r.energy && r.gems) return '\u26A1\uD83D\uDC8E'; // Energy + Gem
        return '\uD83D\uDC8E';                                // Gem
    }

    function getRewardShortLabel(reward) {
        var r = reward.rewards;
        var parts = [];
        if (r.gems) parts.push('\uD83D\uDC8E' + r.gems);
        if (r.energy) parts.push('\u26A1' + r.energy);
        if (r.stars) parts.push('\u2B50' + r.stars);
        if (r.egg === 'common') parts.push('Egg');
        if (r.egg === 'rare') parts.push('Rare!');
        return parts.join(' ');
    }

    // ─── SAVE STATE ─────────────────────────────────────────

    function saveDailyState() {
        var state = Game.getState();
        state.daily = state.daily || {};
        state.daily.calendar = {
            currentDay: calendar.currentDay,
            lastClaimDate: calendar.lastClaimDate,
            streak: calendar.streak
        };
        state.daily.quests = dailyQuests;
        Game.save();
    }

    // ─── PUBLIC API ─────────────────────────────────────────

    return {
        init: init,
        renderDaily: renderDaily,
        getStreak: function() { return calendar.streak; },
        getCalendar: function() { return calendar; }
    };
})();
