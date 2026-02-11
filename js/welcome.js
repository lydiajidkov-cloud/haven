// Haven - Welcome Back Screen: Offline earnings summary overlay
'use strict';

var Welcome = (function() {

    var MIN_AWAY_MS = 5 * 60 * 1000;       // 5 minutes minimum to trigger
    var MAX_OFFLINE_HOURS = 12;             // Cap offline earnings at 12h
    var AUTO_DISMISS_MS = 10000;            // Auto-dismiss after 10 seconds
    var COUNTUP_DURATION_MS = 1500;         // Animated countup duration

    var WORKER_INCOME = { common: 3, uncommon: 8, rare: 15, legendary: 30 }; // gems per hour (mirror island.js)

    var dismissTimer = null;

    // ─── TIMESTAMP MANAGEMENT ─────────────────────────────────

    function getLastSeen() {
        var state = Game.getState();
        return state ? (state.lastSeen || 0) : 0;
    }

    function saveLastSeen() {
        var state = Game.getState();
        if (state) {
            state.lastSeen = Date.now();
            Game.save();
        }
    }

    // Hook into Game.save to always update lastSeen
    function patchGameSave() {
        var originalSave = Game.save;
        Game.save = function() {
            var state = Game.getState();
            if (state) {
                state.lastSeen = Date.now();
            }
            return originalSave.apply(this, arguments);
        };
    }

    // Save on visibility change (tab hidden, app backgrounded)
    function initVisibilityTracking() {
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                saveLastSeen();
            }
        });
    }

    // ─── CALCULATE OFFLINE EARNINGS ───────────────────────────

    function calculateOfflineData(awayMs) {
        var data = {
            awayMs: awayMs,
            awayText: formatDuration(awayMs),
            workerGems: 0,
            workerCreatures: [],
            energyBefore: 0,
            energyAfter: 0,
            maxEnergy: Game.getMaxEnergy(),
            passiveBonuses: null,
            hasPassiveBonuses: false
        };

        var state = Game.getState();
        if (!state) return data;

        // ─── Worker income (preview calculation, actual collection in island.js) ───
        if (state.island && state.island.workers && typeof Creatures !== 'undefined') {
            var workers = state.island.workers;
            var workerKeys = Object.keys(workers);
            var now = Date.now();

            for (var i = 0; i < workerKeys.length; i++) {
                var nodeIdx = workerKeys[i];
                var worker = workers[nodeIdx];
                if (!worker) continue;

                var creature = Creatures.getCreatureById(worker.creatureId);
                if (!creature) continue;

                var elapsed = Math.min(now - worker.lastCollected, MAX_OFFLINE_HOURS * 3600000);
                var hours = elapsed / 3600000;
                var income = Math.floor(hours * (WORKER_INCOME[creature.rarity] || 3));

                if (income > 0) {
                    data.workerGems += income;
                    data.workerCreatures.push({
                        emoji: creature.emoji,
                        name: creature.name,
                        income: income
                    });
                }
            }
        }

        // ─── Energy state (pre-regen snapshot vs current max) ───
        // Energy regen happens in Game.init() before we show the overlay,
        // so we calculate what it WAS before regen based on timestamps.
        var lastEnergyTime = state.lastEnergyTime || Date.now();
        var energyAtSave = state.energy || 0;

        // Since Game.init() already ran updateEnergy(), current state.energy
        // is already the post-regen value. We estimate what it was before.
        var regenMs = Game.ENERGY_REGEN_MS;
        if (typeof Creatures !== 'undefined' && state.hatchery && state.hatchery.discovered) {
            var bonuses = Creatures.calculatePassiveBonuses(state.hatchery.discovered);
            regenMs = Math.max(60000, Game.ENERGY_REGEN_MS - Math.round(bonuses.energy_regen * 250));
        }

        // Estimate pre-regen energy: reverse-calculate from elapsed time
        var elapsedSinceEnergy = Date.now() - lastEnergyTime;
        var energyGained = Math.floor(elapsedSinceEnergy / regenMs);
        var estimatedBefore = Math.max(0, state.energy - energyGained);

        data.energyBefore = Math.min(estimatedBefore, state.maxEnergy);
        data.energyAfter = state.energy;

        // ─── Passive bonuses from creatures ───
        if (typeof Creatures !== 'undefined' && state.hatchery && state.hatchery.discovered) {
            var pb = Creatures.calculatePassiveBonuses(state.hatchery.discovered);
            if (pb.gem_bonus > 0 || pb.discovery_chance > 0 || pb.energy_regen > 0 ||
                pb.xp_bonus > 0 || pb.spawn_quality > 0) {
                data.passiveBonuses = pb;
                data.hasPassiveBonuses = true;
            }
        }

        return data;
    }

    // ─── FORMAT HELPERS ───────────────────────────────────────

    function formatDuration(ms) {
        var totalSeconds = Math.floor(ms / 1000);
        var days = Math.floor(totalSeconds / 86400);
        var hours = Math.floor((totalSeconds % 86400) / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);

        var parts = [];
        if (days > 0) parts.push(days + 'd');
        if (hours > 0) parts.push(hours + 'h');
        if (minutes > 0) parts.push(minutes + 'm');
        if (parts.length === 0) parts.push('a few moments');

        return parts.join(' ');
    }

    // ─── ANIMATED COUNTUP ─────────────────────────────────────

    function animateCountUp(element, targetValue, duration, suffix) {
        suffix = suffix || '';
        if (targetValue <= 0) {
            element.textContent = '0' + suffix;
            return;
        }

        var startTime = null;
        var startValue = 0;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for satisfying deceleration
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(startValue + (targetValue - startValue) * eased);

            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = targetValue + suffix;
            }
        }

        requestAnimationFrame(step);
    }

    // ─── BUILD OVERLAY ────────────────────────────────────────

    function buildOverlay(data) {
        // Create container
        var overlay = document.createElement('div');
        overlay.id = 'welcome-overlay';
        overlay.className = 'welcome-overlay';

        var card = document.createElement('div');
        card.className = 'welcome-card';

        // Header
        var header = document.createElement('div');
        header.className = 'welcome-header';
        header.innerHTML = '<div class="welcome-sun">&#x2600;&#xFE0F;</div>' +
            '<h2 class="welcome-title">Welcome Back!</h2>' +
            '<p class="welcome-away">You were gone for <strong>' + data.awayText + '</strong></p>';
        card.appendChild(header);

        // Divider
        card.appendChild(createDivider());

        // ─── Worker Income Section ───
        if (data.workerGems > 0) {
            var workerSection = document.createElement('div');
            workerSection.className = 'welcome-section';

            // Worker creature row
            if (data.workerCreatures.length > 0) {
                var creatureRow = document.createElement('div');
                creatureRow.className = 'welcome-creature-row';
                for (var i = 0; i < data.workerCreatures.length; i++) {
                    var span = document.createElement('span');
                    span.className = 'welcome-creature-emoji';
                    span.textContent = data.workerCreatures[i].emoji;
                    span.title = data.workerCreatures[i].name + ': +' + data.workerCreatures[i].income + ' gems';
                    creatureRow.appendChild(span);
                }
                workerSection.appendChild(creatureRow);
            }

            var gemLine = document.createElement('div');
            gemLine.className = 'welcome-stat-line';
            gemLine.innerHTML = '<span class="welcome-stat-label">Your workers earned</span>' +
                '<span class="welcome-stat-value"><span class="welcome-countup" data-target="' + data.workerGems + '" data-suffix="">0</span> &#x1F48E;</span>';
            workerSection.appendChild(gemLine);

            card.appendChild(workerSection);
            card.appendChild(createDivider());
        }

        // ─── Energy Section ───
        var energySection = document.createElement('div');
        energySection.className = 'welcome-section';

        var energyLine = document.createElement('div');
        energyLine.className = 'welcome-stat-line';

        if (data.energyBefore < data.energyAfter) {
            energyLine.innerHTML = '<span class="welcome-stat-label">Energy restored</span>' +
                '<span class="welcome-stat-value">' +
                '<span class="welcome-energy-before">' + data.energyBefore + '</span>' +
                ' &#x2192; ' +
                '<span class="welcome-countup welcome-energy-after" data-target="' + data.energyAfter + '" data-suffix="">' + data.energyBefore + '</span>' +
                '/' + data.maxEnergy + ' &#x26A1;</span>';
        } else {
            energyLine.innerHTML = '<span class="welcome-stat-label">Energy</span>' +
                '<span class="welcome-stat-value">' + data.energyAfter + '/' + data.maxEnergy + ' &#x26A1; Full!</span>';
        }
        energySection.appendChild(energyLine);
        card.appendChild(energySection);

        // ─── Passive Bonuses Section ───
        if (data.hasPassiveBonuses) {
            card.appendChild(createDivider());

            var bonusSection = document.createElement('div');
            bonusSection.className = 'welcome-section welcome-bonus-section';

            var bonusLabel = document.createElement('div');
            bonusLabel.className = 'welcome-bonus-label';
            bonusLabel.textContent = 'Your creatures give:';
            bonusSection.appendChild(bonusLabel);

            var bonusList = document.createElement('div');
            bonusList.className = 'welcome-bonus-list';

            var pb = data.passiveBonuses;
            if (pb.gem_bonus > 0) {
                bonusList.appendChild(createBonusPill('+' + pb.gem_bonus.toFixed(1) + '% &#x1F48E;'));
            }
            if (pb.discovery_chance > 0) {
                bonusList.appendChild(createBonusPill('+' + pb.discovery_chance.toFixed(1) + '% &#x1F50D;'));
            }
            if (pb.energy_regen > 0) {
                bonusList.appendChild(createBonusPill('-' + (pb.energy_regen * 0.25).toFixed(1) + 's &#x26A1;'));
            }
            if (pb.xp_bonus > 0) {
                bonusList.appendChild(createBonusPill('+' + pb.xp_bonus.toFixed(1) + '% &#x1F4CA;'));
            }
            if (pb.spawn_quality > 0) {
                bonusList.appendChild(createBonusPill('+' + pb.spawn_quality.toFixed(1) + '% &#x2728;'));
            }

            bonusSection.appendChild(bonusList);
            card.appendChild(bonusSection);
        }

        // ─── Collect Button ───
        card.appendChild(createDivider());

        var btnWrap = document.createElement('div');
        btnWrap.className = 'welcome-btn-wrap';

        var collectBtn = document.createElement('button');
        collectBtn.className = 'welcome-collect-btn';
        collectBtn.innerHTML = 'Collect &amp; Play!';
        btnWrap.appendChild(collectBtn);

        // Auto-dismiss countdown bar
        var countdownBar = document.createElement('div');
        countdownBar.className = 'welcome-countdown-bar';
        var countdownFill = document.createElement('div');
        countdownFill.className = 'welcome-countdown-fill';
        countdownBar.appendChild(countdownFill);
        btnWrap.appendChild(countdownBar);

        card.appendChild(btnWrap);
        overlay.appendChild(card);

        return { overlay: overlay, collectBtn: collectBtn, countdownFill: countdownFill };
    }

    function createDivider() {
        var div = document.createElement('div');
        div.className = 'welcome-divider';
        return div;
    }

    function createBonusPill(html) {
        var pill = document.createElement('span');
        pill.className = 'welcome-bonus-pill';
        pill.innerHTML = html;
        return pill;
    }

    // ─── SHOW / DISMISS ───────────────────────────────────────

    function show(data) {
        var parts = buildOverlay(data);
        var overlay = parts.overlay;
        var collectBtn = parts.collectBtn;
        var countdownFill = parts.countdownFill;

        var app = document.getElementById('app');
        if (!app) return;

        app.appendChild(overlay);

        // Trigger entrance animation after DOM paint
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                overlay.classList.add('welcome-visible');

                // Start animated countups
                var countups = overlay.querySelectorAll('.welcome-countup');
                for (var i = 0; i < countups.length; i++) {
                    var el = countups[i];
                    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
                    var suffix = el.getAttribute('data-suffix') || '';
                    animateCountUp(el, target, COUNTUP_DURATION_MS, suffix);
                }

                // Start countdown bar animation
                countdownFill.style.transition = 'width ' + (AUTO_DISMISS_MS / 1000) + 's linear';
                countdownFill.style.width = '0%';
            });
        });

        // Dismiss handler
        function dismiss() {
            if (dismissTimer) {
                clearTimeout(dismissTimer);
                dismissTimer = null;
            }
            overlay.classList.remove('welcome-visible');
            overlay.classList.add('welcome-exit');
            setTimeout(function() {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 400);
        }

        collectBtn.addEventListener('click', function() {
            dismiss();
            if (typeof Sound !== 'undefined') Sound.playTap();
        });

        // Also dismiss on backdrop tap
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) dismiss();
        });

        // Auto-dismiss timer
        dismissTimer = setTimeout(dismiss, AUTO_DISMISS_MS);
    }

    // ─── INIT: Check if we should show welcome screen ─────────

    function init() {
        patchGameSave();
        initVisibilityTracking();

        var lastSeen = getLastSeen();
        var now = Date.now();

        // First ever play or no lastSeen yet -- just set it and skip
        if (lastSeen === 0) {
            saveLastSeen();
            return;
        }

        var awayMs = now - lastSeen;

        // Not away long enough
        if (awayMs < MIN_AWAY_MS) {
            saveLastSeen();
            return;
        }

        // Calculate and show
        var data = calculateOfflineData(awayMs);
        show(data);

        // Update lastSeen
        saveLastSeen();
    }

    // ─── PUBLIC API ───────────────────────────────────────────

    return {
        init: init,
        saveLastSeen: saveLastSeen
    };

})();
