// Haven - 7-Day Rolling Login Calendar & Daily Quests + Streak System
'use strict';

const Daily = (() => {
    // ─── 7-DAY ROLLING CALENDAR REWARDS ─────────────────────
    // Gem rewards reduced ~48% (was 310/week, now 160/week ≈ 640/month)
    const CALENDAR_REWARDS = [
        { day: 1, rewards: { gems: 10 },                              label: '10 gems',           icons: '\uD83D\uDC8E 10' },
        { day: 2, rewards: { energy: 3, gems: 5 },                    label: '3 energy + 5 gems', icons: '\u26A1 3 + \uD83D\uDC8E 5' },
        { day: 3, rewards: { gems: 15 },                              label: '15 gems',           icons: '\uD83D\uDC8E 15' },
        { day: 4, rewards: { energy: 5, gems: 10 },                   label: '5 energy + 10 gems', icons: '\u26A1 5 + \uD83D\uDC8E 10' },
        { day: 5, rewards: { gems: 30, stars: 1 },                    label: '30 gems + 1 star',  icons: '\uD83D\uDC8E 30 + \u2B50 1' },
        { day: 6, rewards: { gems: 15, egg: 'common' },               label: 'Common Egg + 15 gems', icons: '\uD83E\uDD5A + \uD83D\uDC8E 15' },
        { day: 7, rewards: { gems: 75, stars: 3, egg: 'rare' },       label: '75 gems + 3 stars + Rare Egg', icons: '\uD83C\uDF81 JACKPOT' }
    ];

    // ─── STREAK SYSTEM CONSTANTS ──────────────────────────────
    var STREAK_WARN_HOURS = 20;          // Show warning after 20h since last claim
    var STREAK_SAVE_GEM_COST = 50;       // Gems to save a streak
    var STREAK_SAVE_COOLDOWN_MS = 7 * 24 * 3600000; // 1 save per week

    // ─── DAILY QUESTS ───────────────────────────────────────
    const dailyQuestPool = [
        { id: 'dq_merge5',   desc: 'Merge 5 times',       type: 'merge_count',  target: 5,  reward: { gems: 5 } },
        { id: 'dq_merge15',  desc: 'Merge 15 times',      type: 'merge_count',  target: 15, reward: { gems: 12 } },
        { id: 'dq_spawn5',   desc: 'Spawn 5 items',       type: 'spawn_count',  target: 5,  reward: { gems: 5 } },
        { id: 'dq_spawn10',  desc: 'Spawn 10 items',      type: 'spawn_count',  target: 10, reward: { gems: 8 } },
        { id: 'dq_tier2',    desc: 'Create a Tier 2 item', type: 'reach_tier',  tier: 2, target: 1, reward: { gems: 5 } },
        { id: 'dq_tier3',    desc: 'Create a Tier 3 item', type: 'reach_tier',  tier: 3, target: 1, reward: { gems: 8 } },
        { id: 'dq_wood',     desc: 'Produce 3 Wood items', type: 'produce_any', chain: 'wood',  target: 3, reward: { gems: 5 } },
        { id: 'dq_stone',    desc: 'Produce 3 Stone items', type: 'produce_any', chain: 'stone', target: 3, reward: { gems: 5 } },
        { id: 'dq_flora',    desc: 'Produce 3 Flora items', type: 'produce_any', chain: 'flora', target: 3, reward: { gems: 5 } },
        { id: 'dq_crystal',  desc: 'Produce 3 Crystal items', type: 'produce_any', chain: 'crystal', target: 3, reward: { gems: 5 } },
        { id: 'dq_powerup1', desc: 'Use a power-up',       type: 'powerup_use', target: 1, reward: { gems: 8 } },
        { id: 'dq_powerup3', desc: 'Use 3 power-ups',      type: 'powerup_use', target: 3, reward: { gems: 15 } },
    ];

    // Calendar state
    let calendar = {
        currentDay: 1,       // 1-7, which day of the cycle the player is on
        lastClaimDate: null,  // 'YYYY-MM-DD' string of last claim
        streak: 0             // consecutive days claimed
    };

    let todayCanClaim = false;
    let dailyQuests = [];
    var pendingStreakBreak = null;  // { oldStreak: N } when a streak break needs acknowledgment
    var streakWarningTimerId = null;

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

        // Start streak warning check (runs periodically while app is open)
        startStreakWarningCheck();
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

    function getHoursSinceLastClaim() {
        if (!calendar.lastClaimDate) return Infinity;
        var claimDate = new Date(calendar.lastClaimDate + 'T00:00:00');
        var now = new Date();
        return (now - claimDate) / 3600000;
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
                // Streak broken — show acknowledgment instead of silent reset
                if (calendar.streak > 0) {
                    pendingStreakBreak = { oldStreak: calendar.streak };
                }
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

        // Show streak break acknowledgment after a brief delay (let UI settle)
        if (pendingStreakBreak) {
            var breakData = pendingStreakBreak;
            pendingStreakBreak = null;
            setTimeout(function() {
                showStreakBreakModal(breakData.oldStreak);
            }, 800);
        }
    }

    // ─── STREAK WARNING BANNER ────────────────────────────────
    // At 20 hours since last claim, show a warning banner on the board screen.
    // This runs on a timer while the app is open.

    function startStreakWarningCheck() {
        // Check every 60 seconds
        if (streakWarningTimerId) clearInterval(streakWarningTimerId);
        streakWarningTimerId = setInterval(checkStreakWarning, 60000);
        // Also check immediately
        checkStreakWarning();
    }

    function checkStreakWarning() {
        // Only warn if the player has an active streak and hasn't claimed today
        if (calendar.streak <= 0) {
            removeStreakWarningBanner();
            return;
        }

        var today = getDateString();
        if (calendar.lastClaimDate === today) {
            // Already claimed today, no risk
            removeStreakWarningBanner();
            return;
        }

        var hoursSince = getHoursSinceLastClaim();
        if (hoursSince >= STREAK_WARN_HOURS) {
            var hoursLeft = Math.max(0, Math.floor(48 - hoursSince));
            // Streak expires at end of the "missed" day, i.e., 2 calendar days after last claim
            // But from user perspective: they need to claim before end of today
            // So "hours left" = hours until midnight tonight
            var now = new Date();
            var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
            var msLeft = midnight - now;
            var hLeft = Math.floor(msLeft / 3600000);
            var mLeft = Math.floor((msLeft % 3600000) / 60000);
            var timeStr = hLeft > 0 ? hLeft + 'h ' + mLeft + 'm' : mLeft + 'm';

            showStreakWarningBanner(calendar.streak, timeStr);

            // Emit streakAtRisk event for push notifications
            Game.emit('streakAtRisk', { streak: calendar.streak, hoursLeft: hLeft });

            // Also show a toast on the board (once per session)
            showStreakWarningToast(calendar.streak, timeStr);
        } else {
            removeStreakWarningBanner();
        }
    }

    var streakWarningToastShown = false;

    function showStreakWarningToast(streak, timeStr) {
        if (streakWarningToastShown) return;
        streakWarningToastShown = true;

        if (typeof Board !== 'undefined' && Board.showToast) {
            Board.showToast(
                '\uD83D\uDD25 Your ' + streak + '-day streak expires in ' + timeStr + '! Claim now!',
                (typeof Board.TOAST_PRIORITY !== 'undefined') ? Board.TOAST_PRIORITY.CRITICAL : undefined
            );
        }
    }

    function showStreakWarningBanner(streak, timeStr) {
        var existing = document.getElementById('streak-warning-banner');
        if (existing) {
            // Update time
            var timeEl = existing.querySelector('.streak-warn-time');
            if (timeEl) timeEl.textContent = timeStr;
            return;
        }

        var banner = document.createElement('div');
        banner.id = 'streak-warning-banner';
        banner.className = 'streak-warning-banner';
        banner.innerHTML =
            '<span class="streak-warn-icon">\u26A0\uFE0F</span>' +
            '<span class="streak-warn-text">Your <strong>' + streak + '-day streak</strong> expires in ' +
            '<strong class="streak-warn-time">' + timeStr + '</strong>!</span>' +
            '<button class="streak-warn-claim-btn">Claim</button>';

        // Insert at top of board screen
        var boardScreen = document.getElementById('board-screen');
        if (boardScreen) {
            boardScreen.insertBefore(banner, boardScreen.firstChild);
        }

        // Click "Claim" navigates to Daily tab
        var claimBtn = banner.querySelector('.streak-warn-claim-btn');
        if (claimBtn) {
            claimBtn.addEventListener('click', function() {
                navigateToDaily();
            });
        }
    }

    function removeStreakWarningBanner() {
        var existing = document.getElementById('streak-warning-banner');
        if (existing) existing.remove();
    }

    function navigateToDaily() {
        // Navigate to shop screen, daily tab
        var navBtns = document.querySelectorAll('.nav-btn');
        for (var j = 0; j < navBtns.length; j++) navBtns[j].classList.remove('active');
        var shopBtn = document.querySelector('[data-screen="shop"]');
        if (shopBtn) shopBtn.classList.add('active');
        document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
        var shopScreen = document.getElementById('shop-screen');
        if (shopScreen) shopScreen.classList.add('active');

        // Activate daily tab
        var shopTabs = document.querySelectorAll('.shop-tab');
        for (var t = 0; t < shopTabs.length; t++) shopTabs[t].classList.remove('active');
        var dailyTab = document.querySelector('[data-shop-tab="daily"]');
        if (dailyTab) dailyTab.classList.add('active');
        document.querySelectorAll('.shop-tab-content').forEach(function(c) { c.classList.remove('active'); });
        var dailyContent = document.getElementById('shop-tab-daily');
        if (dailyContent) dailyContent.classList.add('active');

        renderDaily();

        if (typeof Sound !== 'undefined') Sound.playNavSwitch();
    }

    // ─── STREAK BREAK ACKNOWLEDGMENT MODAL ────────────────────
    // When a streak breaks, show a modal instead of silently resetting.
    // Offers streak-save option (50 gems or watch ad).

    function showStreakBreakModal(oldStreak) {
        // Don't show for streaks of 0 (no streak to break)
        if (oldStreak <= 0) return;

        // Check if streak-save is available
        var canSaveWithGems = canStreakSave() && Game.getGems() >= STREAK_SAVE_GEM_COST;
        var canSaveWithAd = canStreakSave() && (typeof AdAdapter !== 'undefined' && AdAdapter.canShowRewarded());

        var overlay = document.createElement('div');
        overlay.id = 'streak-break-overlay';
        overlay.className = 'streak-break-overlay';

        var card = document.createElement('div');
        card.className = 'streak-break-card';

        // Broken flame icon
        card.innerHTML =
            '<div class="streak-break-icon">\uD83D\uDD25</div>' +
            '<h2 class="streak-break-title">Streak Lost</h2>' +
            '<p class="streak-break-message">Your <strong>' + oldStreak + '-day streak</strong> has ended.</p>' +
            '<p class="streak-break-encourage">Don\'t worry, you can start a new one today!</p>';

        // Streak-save section (if available)
        if (canSaveWithGems || canSaveWithAd) {
            var saveSection = document.createElement('div');
            saveSection.className = 'streak-save-section';

            var saveLabel = document.createElement('div');
            saveLabel.className = 'streak-save-label';
            saveLabel.textContent = 'Save your streak?';
            saveSection.appendChild(saveLabel);

            if (canSaveWithGems) {
                var gemBtn = document.createElement('button');
                gemBtn.className = 'streak-save-btn streak-save-gems';
                gemBtn.innerHTML = '\uD83D\uDC8E ' + STREAK_SAVE_GEM_COST + ' gems';
                gemBtn.addEventListener('click', function() {
                    if (executeStreakSave('gems', oldStreak)) {
                        dismissStreakBreakModal(overlay);
                    }
                });
                saveSection.appendChild(gemBtn);
            }

            if (canSaveWithAd) {
                var adBtn = document.createElement('button');
                adBtn.className = 'streak-save-btn streak-save-ad';
                var adsLeft = (typeof AdAdapter !== 'undefined') ? AdAdapter.getAdsRemaining() : 0;
                adBtn.innerHTML = '\uD83C\uDFAC Watch Ad <span class="streak-save-ad-count">(' + adsLeft + ' left)</span>';
                adBtn.addEventListener('click', function() {
                    adBtn.disabled = true;
                    adBtn.textContent = 'Watching...';
                    executeStreakSaveWithAd(oldStreak, overlay);
                });
                saveSection.appendChild(adBtn);
            }

            var capNote = document.createElement('div');
            capNote.className = 'streak-save-cap-note';
            capNote.textContent = '1 streak save per week';
            saveSection.appendChild(capNote);

            card.appendChild(saveSection);
        }

        // Continue button
        var continueBtn = document.createElement('button');
        continueBtn.className = 'streak-break-continue-btn';
        continueBtn.textContent = 'Start Fresh';
        continueBtn.addEventListener('click', function() {
            dismissStreakBreakModal(overlay);
        });
        card.appendChild(continueBtn);

        overlay.appendChild(card);

        // Backdrop dismiss
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) dismissStreakBreakModal(overlay);
        });

        var app = document.getElementById('app');
        if (app) {
            app.appendChild(overlay);
            // Trigger entrance animation
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    overlay.classList.add('streak-break-visible');
                });
            });
        }
    }

    function dismissStreakBreakModal(overlay) {
        overlay.classList.remove('streak-break-visible');
        overlay.classList.add('streak-break-exit');
        setTimeout(function() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 300);
    }

    // ─── STREAK SAVE LOGIC ────────────────────────────────────

    function canStreakSave() {
        var state = Game.getState();
        state.daily = state.daily || {};
        var lastSave = state.daily.lastStreakSaveDate || null;
        if (!lastSave) return true;
        var elapsed = Date.now() - lastSave;
        return elapsed >= STREAK_SAVE_COOLDOWN_MS;
    }

    function executeStreakSave(method, oldStreak) {
        if (!canStreakSave()) return false;

        if (method === 'gems') {
            if (Game.getGems() < STREAK_SAVE_GEM_COST) return false;
            Game.addGems(-STREAK_SAVE_GEM_COST);
        }

        // Restore the old streak
        calendar.streak = oldStreak;
        // Set lastClaimDate to yesterday so today's claim extends the streak
        calendar.lastClaimDate = getDateString(-1);
        // currentDay needs to recalculate: if streak was at N, we're on day (N % 7) + 1
        calendar.currentDay = ((oldStreak) % 7) + 1;
        todayCanClaim = true;

        // Record streak save timestamp
        var state = Game.getState();
        state.daily = state.daily || {};
        state.daily.lastStreakSaveDate = Date.now();

        saveDailyState();

        // Effects
        if (typeof Sound !== 'undefined') Sound.playCelebration();
        Game.vibrate([30, 50, 30]);

        if (typeof Board !== 'undefined' && Board.showToast) {
            Board.showToast(
                '\uD83D\uDD25 Streak saved! Your ' + oldStreak + '-day streak continues!',
                (typeof Board.TOAST_PRIORITY !== 'undefined') ? Board.TOAST_PRIORITY.HIGH : undefined
            );
        }

        renderDaily();
        return true;
    }

    function executeStreakSaveWithAd(oldStreak, overlay) {
        if (!canStreakSave()) return;
        if (typeof AdAdapter === 'undefined' || !AdAdapter.canShowRewarded()) return;

        AdAdapter.show('rewarded_streak_save', function(completed) {
            if (completed) {
                // Restore streak same as gem save
                calendar.streak = oldStreak;
                calendar.lastClaimDate = getDateString(-1);
                calendar.currentDay = ((oldStreak) % 7) + 1;
                todayCanClaim = true;

                var state = Game.getState();
                state.daily = state.daily || {};
                state.daily.lastStreakSaveDate = Date.now();

                saveDailyState();

                if (typeof Sound !== 'undefined') Sound.playCelebration();
                Game.vibrate([30, 50, 30]);

                if (typeof Board !== 'undefined' && Board.showToast) {
                    Board.showToast(
                        '\uD83D\uDD25 Streak saved! Your ' + oldStreak + '-day streak continues!',
                        (typeof Board.TOAST_PRIORITY !== 'undefined') ? Board.TOAST_PRIORITY.HIGH : undefined
                    );
                }

                dismissStreakBreakModal(overlay);
                renderDaily();
            } else {
                // Ad failed or was skipped, re-enable button
                var adBtn = overlay.querySelector('.streak-save-ad');
                if (adBtn) {
                    adBtn.disabled = false;
                    var adsLeft = AdAdapter.getAdsRemaining();
                    adBtn.innerHTML = '\uD83C\uDFAC Watch Ad <span class="streak-save-ad-count">(' + adsLeft + ' left)</span>';
                }
            }
        });
    }

    // ─── CLAIM CALENDAR REWARD ──────────────────────────────

    function claimCalendarReward() {
        if (!todayCanClaim) return;

        var dayIndex = calendar.currentDay - 1; // 0-based index
        var dayData = CALENDAR_REWARDS[dayIndex];
        if (!dayData) return;

        // Grant rewards — streak multiplier increases each full week
        var streakMultiplier = Math.min(2, 1 + Math.floor(calendar.streak / 7) * 0.25);
        var rewards = dayData.rewards;
        var gemsEarned = rewards.gems ? Math.floor(rewards.gems * streakMultiplier) : 0;
        if (gemsEarned) Game.addGems(gemsEarned);
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

        // Remove streak warning banner since we just claimed
        removeStreakWarningBanner();
        streakWarningToastShown = false;

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
                Sound.playCelebration();
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
        var currentMultiplier = Math.min(2, 1 + Math.floor(calendar.streak / 7) * 0.25);
        if (calendar.streak > 0) {
            html += '<span class="cal-streak-fire">\uD83D\uDD25</span>';
            html += '<span class="cal-streak-text">Day ' + calendar.streak + ' streak';
            if (currentMultiplier > 1) {
                html += ' \u2014 ' + currentMultiplier.toFixed(2).replace(/\.?0+$/, '') + 'x gem bonus!';
            } else if (calendar.streak < 7) {
                html += ' \u2014 7 days = 1.25x gems!';
            }
            html += '</span>';
        } else {
            html += '<span class="cal-streak-text">Start a streak for bonus gems!</span>';
        }
        html += '</div>';

        // ── Streak at-risk warning (inline in daily tab) ──
        if (calendar.streak > 0 && todayCanClaim) {
            // Check if streak is at risk (20+ hours since last claim, not yet claimed today)
            if (getHoursSinceLastClaim() >= STREAK_WARN_HOURS) {
                html += '<div class="cal-streak-atrisk">';
                html += '<span class="cal-streak-atrisk-icon">\u26A0\uFE0F</span>';
                html += '<span class="cal-streak-atrisk-text">Claim now to keep your streak!</span>';
                html += '</div>';
            }
        }

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
        // lastStreakSaveDate is preserved (written directly to state.daily)
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
