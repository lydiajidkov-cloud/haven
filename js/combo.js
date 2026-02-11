// Haven - Visual Combo/Streak Display
// Shows combo counter, streak timer bar, and milestone flashes
// Listens for Game 'mergeCompleted' events and tracks its own streak
'use strict';

const Combo = (() => {
    // ─── CONFIG ──────────────────────────────────────────────
    var STREAK_WINDOW = 2000;     // ms — must match audio.js STREAK_WINDOW (was 1500)
    var FADE_DELAY = 2000;        // ms after last merge before combo fades
    var TIMER_TICK_MS = 16;       // ~60fps for smooth timer bar depletion
    var MIN_DISPLAY_STREAK = 3;   // show counter at 3+ (matches audio streak layer)

    // ─── STATE ───────────────────────────────────────────────
    var streak = 0;
    var lastMergeTime = 0;
    var fadeTimer = null;
    var timerAnimFrame = null;
    var initialized = false;

    // ─── DOM REFS ────────────────────────────────────────────
    var overlayEl = null;
    var counterEl = null;
    var timerBarEl = null;
    var timerFillEl = null;
    var milestoneEl = null;
    var edgeGlowEl = null;
    var boardContainerEl = null;

    // ─── MILESTONE DEFINITIONS ───────────────────────────────
    var MILESTONES = {
        5:  { text: 'Nice!',         size: '',              color: 'ms-white' },
        10: { text: 'Amazing!',       size: 'milestone-big', color: 'ms-gold' },
        15: { text: 'Incredible!',    size: 'milestone-big', color: 'ms-orange' },
        20: { text: 'UNSTOPPABLE!',   size: 'milestone-epic', color: 'ms-red' },
        25: { text: 'LEGENDARY!',     size: 'milestone-epic', color: 'ms-rainbow' }
    };

    // ─── INIT ────────────────────────────────────────────────

    function init() {
        if (initialized) return;

        boardContainerEl = document.getElementById('board-container');
        if (!boardContainerEl) return; // board not ready

        createDOM();
        bindEvents();
        initialized = true;
    }

    function createDOM() {
        // Create overlay container inside board-container
        overlayEl = document.createElement('div');
        overlayEl.id = 'combo-overlay';

        // Combo counter
        counterEl = document.createElement('div');
        counterEl.id = 'combo-counter';
        overlayEl.appendChild(counterEl);

        // Streak timer bar
        timerBarEl = document.createElement('div');
        timerBarEl.id = 'streak-timer-bar';
        timerFillEl = document.createElement('div');
        timerFillEl.id = 'streak-timer-fill';
        timerBarEl.appendChild(timerFillEl);
        overlayEl.appendChild(timerBarEl);

        // Milestone flash text
        milestoneEl = document.createElement('div');
        milestoneEl.id = 'combo-milestone';
        overlayEl.appendChild(milestoneEl);

        // Edge glow
        edgeGlowEl = document.createElement('div');
        edgeGlowEl.id = 'combo-edge-glow';
        overlayEl.appendChild(edgeGlowEl);

        boardContainerEl.appendChild(overlayEl);
    }

    function bindEvents() {
        // Listen for merge events from the game
        Game.on('mergeCompleted', onMerge);
    }

    // ─── MERGE HANDLER ───────────────────────────────────────

    function onMerge(data) {
        var now = Date.now();

        // Track streak with same window as audio.js
        if (now - lastMergeTime < STREAK_WINDOW) {
            streak++;
        } else {
            streak = 1;
        }
        lastMergeTime = now;

        // Clear any pending fade-out
        if (fadeTimer) {
            clearTimeout(fadeTimer);
            fadeTimer = null;
        }

        // Update visuals if streak is high enough
        if (streak >= MIN_DISPLAY_STREAK) {
            showCounter(streak);
            startTimerBar();
            checkMilestone(streak);
        }

        // Schedule fade-out
        fadeTimer = setTimeout(function() {
            hideCombo();
        }, STREAK_WINDOW + FADE_DELAY);
    }

    // ─── COMBO COUNTER ───────────────────────────────────────

    function showCounter(count) {
        counterEl.textContent = 'x' + count;

        // Remove all color/animation classes
        counterEl.className = '';
        counterEl.id = 'combo-counter';

        // Apply color tier
        var colorClass = getColorClass(count);
        counterEl.classList.add('visible', colorClass);

        // Trigger punch animation (force reflow to restart)
        void counterEl.offsetWidth;
        counterEl.classList.add('combo-punch');

        // Remove punch class after animation completes so it can retrigger
        setTimeout(function() {
            counterEl.classList.remove('combo-punch');
        }, 260);
    }

    function getColorClass(count) {
        if (count >= 20) return 'combo-rainbow';
        if (count >= 13) return 'combo-red';
        if (count >= 8)  return 'combo-orange';
        if (count >= 5)  return 'combo-yellow';
        return 'combo-white';
    }

    function hideCombo() {
        // Fade out counter
        counterEl.classList.remove('visible', 'combo-punch');
        counterEl.classList.add('combo-fade-out');

        // Hide timer bar
        timerBarEl.classList.remove('visible');

        // Clean up after fade animation
        setTimeout(function() {
            counterEl.classList.remove('combo-fade-out');
            counterEl.className = '';
            counterEl.id = 'combo-counter';
            counterEl.textContent = '';
        }, 800);

        // Reset streak (it will restart on next merge)
        streak = 0;
        stopTimerBar();
    }

    // ─── STREAK TIMER BAR ────────────────────────────────────
    // Depletes from 100% to 0% over STREAK_WINDOW ms, resets on each merge

    function startTimerBar() {
        timerBarEl.classList.add('visible');
        timerBarEl.classList.remove('timer-urgent');

        // Cancel any existing animation
        stopTimerBar();

        // Animate the fill bar depleting
        var startTime = Date.now();

        function tick() {
            var elapsed = Date.now() - lastMergeTime;
            var remaining = Math.max(0, 1 - elapsed / STREAK_WINDOW);

            timerFillEl.style.width = (remaining * 100) + '%';

            // Add urgency color when < 30% remaining
            if (remaining < 0.3 && remaining > 0) {
                timerBarEl.classList.add('timer-urgent');
            } else {
                timerBarEl.classList.remove('timer-urgent');
            }

            if (remaining > 0) {
                timerAnimFrame = requestAnimationFrame(tick);
            }
        }

        timerAnimFrame = requestAnimationFrame(tick);
    }

    function stopTimerBar() {
        if (timerAnimFrame) {
            cancelAnimationFrame(timerAnimFrame);
            timerAnimFrame = null;
        }
    }

    // ─── MILESTONE FLASHES ───────────────────────────────────

    function checkMilestone(count) {
        var milestone = MILESTONES[count];

        // Also check for multiples of 5 above 25 (all "LEGENDARY!")
        if (!milestone && count > 25 && count % 5 === 0) {
            milestone = MILESTONES[25]; // reuse LEGENDARY config
        }

        if (!milestone) return;

        showMilestoneFlash(milestone, count);

        // Edge glow for x10+
        if (count >= 10) {
            triggerEdgeGlow(count);
        }

        // Screen shake for x20+
        if (count >= 20) {
            triggerComboShake();
        }
    }

    function showMilestoneFlash(milestone, count) {
        // Clear any existing milestone animation
        milestoneEl.className = '';
        milestoneEl.id = 'combo-milestone';
        milestoneEl.textContent = milestone.text;

        // Force reflow to restart animation
        void milestoneEl.offsetWidth;

        // Apply size + color + show class
        if (milestone.size) milestoneEl.classList.add(milestone.size);
        milestoneEl.classList.add(milestone.color);
        milestoneEl.classList.add('milestone-show');

        // Clean up after animation (1.2s)
        setTimeout(function() {
            milestoneEl.classList.remove('milestone-show');
            milestoneEl.className = '';
            milestoneEl.id = 'combo-milestone';
        }, 1300);
    }

    function triggerEdgeGlow(count) {
        // Remove existing glow classes
        edgeGlowEl.className = '';
        edgeGlowEl.id = 'combo-edge-glow';

        // Force reflow
        void edgeGlowEl.offsetWidth;

        // Red glow for 20+, gold for 10+
        if (count >= 20) {
            edgeGlowEl.classList.add('glow-red');
        } else {
            edgeGlowEl.classList.add('glow-active');
        }

        // Clean up after animation (0.8s)
        setTimeout(function() {
            edgeGlowEl.className = '';
            edgeGlowEl.id = 'combo-edge-glow';
        }, 850);
    }

    function triggerComboShake() {
        if (!boardContainerEl) return;

        boardContainerEl.classList.remove('combo-shake');
        void boardContainerEl.offsetWidth;
        boardContainerEl.classList.add('combo-shake');

        setTimeout(function() {
            boardContainerEl.classList.remove('combo-shake');
        }, 450);
    }

    // ─── PUBLIC API ──────────────────────────────────────────

    return {
        init: init,
        // Expose streak for other systems if needed
        getStreak: function() { return streak; }
    };
})();
