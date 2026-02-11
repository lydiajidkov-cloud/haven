// Haven - Interactive Tutorial: Spotlight-driven first-play experience
'use strict';

var Tutorial = (function() {

    var STEPS = [
        { type: 'card', id: 'welcome' },
        { type: 'spotlight', id: 'spawn1', target: 'wood-node', event: 'itemSpawned' },
        { type: 'spotlight', id: 'spawn2', target: 'wood-node', event: 'itemSpawned' },
        { type: 'spotlight', id: 'spawn3', target: 'board',     event: 'mergeCompleted' },
        { type: 'card', id: 'celebration' },
        { type: 'card', id: 'quests' }
    ];

    var CARD_CONTENT = {
        welcome: {
            title: 'Welcome to Haven!',
            body: 'Rebuild a magical island by merging resources and discovering creatures.',
            btn: 'Show Me \u2192'
        },
        celebration: {
            title: 'Nice Merge!',
            body: 'Two matching items became one higher-tier item. Keep merging to discover new things!',
            btn: 'What Else? \u2192'
        },
        quests: {
            title: 'Check Your Quests',
            body: 'Open the Quests tab for goals. Earn stars to restore the island!',
            btn: "Let\u2019s Play!"
        }
    };

    var TOOLTIP_TEXT = {
        spawn1: 'Tap the Wood button!',
        spawn2: 'Tap again \u2014 you need two matching items to merge.',
        spawn3: 'Tap one Seed, then tap the other!'
    };

    var currentStep = 0;
    var overlayEl = null;
    var spotlightEl = null;
    var cardEl = null;
    var tooltipEl = null;
    var eventHandler = null;
    var debounceTimer = null;

    // ─── PUBLIC ──────────────────────────────────────────────

    function start() {
        var state = Game.getState();
        if (!state.firstPlay) return;
        currentStep = 0;
        showStep(currentStep);
    }

    // ─── STEP ROUTER ─────────────────────────────────────────

    function showStep(idx) {
        cleanup();
        if (idx >= STEPS.length) {
            finish();
            return;
        }

        var step = STEPS[idx];
        if (step.type === 'card') {
            showCard(step.id);
        } else if (step.type === 'spotlight') {
            showSpotlight(step);
        }
    }

    // ─── CARD STEPS ──────────────────────────────────────────

    function showCard(id) {
        var content = CARD_CONTENT[id];

        // Dark overlay
        overlayEl = document.createElement('div');
        overlayEl.className = 'tut-overlay';

        // Card
        cardEl = document.createElement('div');
        cardEl.className = 'tut-card';

        var h2 = document.createElement('h2');
        h2.textContent = content.title;
        cardEl.appendChild(h2);

        var p = document.createElement('p');
        p.textContent = content.body;
        cardEl.appendChild(p);

        var btn = document.createElement('button');
        btn.className = 'tut-btn';
        btn.textContent = content.btn;
        btn.addEventListener('click', function() {
            Sound.init();
            Sound.playTap();
            advance();
        });
        cardEl.appendChild(btn);

        overlayEl.appendChild(cardEl);
        document.getElementById('app').appendChild(overlayEl);
    }

    // ─── SPOTLIGHT STEPS ─────────────────────────────────────

    function showSpotlight(step) {
        var targetEl = getTargetElement(step.target);
        if (!targetEl) {
            advance();
            return;
        }

        // Force tier 0 spawns and suppress auto-merge during spawn steps
        if (step.target === 'wood-node') {
            Board.setForcedSpawnTier(0);
            Board.setAutoMergeSuppressed(true);
        }
        // Release spawn overrides when moving to the merge step
        if (step.target === 'board') {
            Board.clearForcedSpawnTier();
            Board.setAutoMergeSuppressed(false);
        }

        // Full-screen blocker overlay
        overlayEl = document.createElement('div');
        overlayEl.className = 'tut-overlay tut-overlay-transparent';

        // Spotlight cutout
        spotlightEl = document.createElement('div');
        spotlightEl.className = 'tut-spotlight';
        positionSpotlight(targetEl);

        // Tooltip
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'tut-tooltip';
        tooltipEl.textContent = TOOLTIP_TEXT[step.id];
        positionTooltip(targetEl);

        // Lift the target above the overlay so it's clickable
        targetEl.classList.add('tut-lifted');
        if (step.target === 'wood-node') {
            targetEl.classList.add('tut-glow');
        }

        document.getElementById('app').appendChild(overlayEl);
        document.getElementById('app').appendChild(spotlightEl);
        document.getElementById('app').appendChild(tooltipEl);

        // Listen for game event to auto-advance (with debounce)
        listenForEvent(step.event);
    }

    function getTargetElement(target) {
        if (target === 'wood-node') {
            return document.querySelector('.node[data-chain="wood"]');
        }
        if (target === 'board') {
            return document.getElementById('board-wrapper');
        }
        return null;
    }

    function positionSpotlight(el) {
        var rect = el.getBoundingClientRect();
        var appRect = document.getElementById('app').getBoundingClientRect();
        var pad = 8;

        spotlightEl.style.left   = (rect.left   - appRect.left - pad) + 'px';
        spotlightEl.style.top    = (rect.top    - appRect.top  - pad) + 'px';
        spotlightEl.style.width  = (rect.width  + pad * 2) + 'px';
        spotlightEl.style.height = (rect.height + pad * 2) + 'px';
    }

    function positionTooltip(el) {
        var rect = el.getBoundingClientRect();
        var appRect = document.getElementById('app').getBoundingClientRect();

        // Always center tooltip horizontally in the app (not on the target)
        tooltipEl.style.left = '50%';

        // Place tooltip above the target by default
        tooltipEl.style.bottom = (appRect.bottom - rect.top + 12) + 'px';
        tooltipEl.style.top = 'auto';

        // If target is the board, place above the board instead
        if (el.id === 'board-wrapper') {
            tooltipEl.style.top = (rect.top - appRect.top - 40) + 'px';
            tooltipEl.style.bottom = 'auto';
        }
    }

    // ─── EVENT LISTENER (debounced) ──────────────────────────

    function listenForEvent(eventName) {
        // 600ms debounce to prevent auto-merge from previous step advancing us
        var armed = false;
        debounceTimer = setTimeout(function() {
            armed = true;
        }, 600);

        eventHandler = function() {
            if (!armed) return;
            advance();
        };

        Game.on(eventName, eventHandler);
    }

    // ─── ADVANCE / CLEANUP ───────────────────────────────────

    function advance() {
        cleanup();
        currentStep++;
        showStep(currentStep);
    }

    function cleanup() {
        // Remove overlay + spotlight + tooltip
        if (overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
        if (spotlightEl && spotlightEl.parentNode) spotlightEl.parentNode.removeChild(spotlightEl);
        if (tooltipEl && tooltipEl.parentNode) tooltipEl.parentNode.removeChild(tooltipEl);
        if (cardEl && cardEl.parentNode && cardEl.parentNode !== overlayEl) {
            cardEl.parentNode.removeChild(cardEl);
        }
        overlayEl = null;
        spotlightEl = null;
        tooltipEl = null;
        cardEl = null;

        // Remove lifted/glow from any target
        var lifted = document.querySelectorAll('.tut-lifted');
        for (var i = 0; i < lifted.length; i++) {
            lifted[i].classList.remove('tut-lifted');
            lifted[i].classList.remove('tut-glow');
        }

        // Remove event listener
        if (eventHandler) {
            Game.off('itemSpawned', eventHandler);
            Game.off('mergeCompleted', eventHandler);
            eventHandler = null;
        }

        // Clear debounce
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    }

    function finish() {
        cleanup();
        Board.clearForcedSpawnTier();
        Board.setAutoMergeSuppressed(false);
        var state = Game.getState();
        state.firstPlay = false;
        Game.save();
    }

    return {
        start: start
    };

})();
