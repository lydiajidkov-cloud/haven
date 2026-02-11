// Haven - Retention-Optimized Tutorial: Fast to fun, progressive disclosure
// Goal: First merge in <10s, first chain in <45s, first creature discovery <3min
// Only teaches 3 systems: merging, orders, quests. Everything else unlocks later.
'use strict';

var Tutorial = (function() {

    // ─── SINGLE STORY SCREEN (replaces 3 slow screens) ────────────
    // One screen, one tap, into the action. Story is told THROUGH gameplay.
    var STORY_SCREEN = {
        title: 'Haven',
        body: 'A storm shattered this island\u2019s magic. Merge to restore it.',
        bg: 'linear-gradient(180deg, #0d1b2a 0%, #1a3050 50%, #2d5a3d 100%)',
        symbol: '\u{1F3DD}\uFE0F'
    };

    // ─── TUTORIAL STEPS (reduced from 10 to 6) ────────────────────
    // Removed: separate spawn steps (board is pre-populated instead),
    //          island-hint and quests-hint (shown as post-tutorial breadcrumbs),
    //          celebrate card (replaced by inline floating text),
    //          orders-deliver card (merged into orders-intro tooltip)
    //
    // Flow: Story(1 tap) -> Merge(instant!) -> Chain setup -> Orders -> Goal prompt -> Done

    var STEPS = [
        {
            id: 'first-merge',
            type: 'spotlight',
            target: 'board',
            instruction: 'Tap a twig, then tap its match to merge!',
            position: 'above',
            event: 'mergeCompleted',
            setupFn: 'setupFirstMerge'
        },
        {
            id: 'chain-merge',
            type: 'spotlight',
            target: 'wood-node',
            instruction: 'Great! Tap Wood to spawn items (costs 1 energy each). Matching neighbors merge automatically!',
            position: 'above',
            event: 'mergeCompleted',
            setupFn: 'setupChainMerge'
        },
        {
            id: 'freeplay',
            type: 'spotlight',
            target: 'resource-nodes',
            instruction: 'Try different resources! Merge to climb 10 tiers and discover new items.',
            position: 'above',
            event: 'mergeCompleted',
            setupFn: 'setupFreeplayStep'
        },
        {
            id: 'orders-intro',
            type: 'spotlight',
            target: 'orders-panel',
            instruction: 'Orders need specific items. Tap an order, then tap a matching item on the board to deliver it!',
            position: 'below',
            event: 'orderTapped',
            setupFn: 'setupOrdersStep'
        },
        {
            id: 'goal-prompt',
            type: 'card',
            title: 'Your First Goal',
            body: 'Fill that order to earn stars and gems! Stars restore the island \u2014 check the Island tab when you\u2019re ready.',
            btn: 'Let\u2019s Go!'
        }
    ];

    // ─── STATE ──────────────────────────────────────────────────
    var currentStep = -1;       // -1 = story phase, 0+ = tutorial steps
    var overlayEl = null;
    var spotlightEl = null;
    var cardEl = null;
    var tooltipEl = null;
    var skipBtnEl = null;
    var eventHandler = null;
    var debounceTimer = null;
    var navInterceptor = null;
    var orderTapInterceptor = null;
    var isRunning = false;
    var chainSpawnCount = 0;    // track spawns during chain-merge step

    // ─── PUBLIC ─────────────────────────────────────────────────

    function start() {
        var state = Game.getState();
        if (!state.firstPlay) return;

        isRunning = true;
        currentStep = -1;

        // Hide the default board hint during tutorial
        var hint = document.getElementById('board-hint');
        if (hint) hint.classList.add('hidden');

        // Hide complex UI elements until tutorial teaches them (progressive disclosure)
        hideAdvancedUI();

        // Pre-populate the board with starter items BEFORE the story screen
        // This means items are already visible when the player dismisses the story
        Board.spawnStarterItems();

        showStoryScreen();
    }

    function isActive() {
        return isRunning;
    }

    // ─── PROGRESSIVE DISCLOSURE: hide advanced UI during tutorial ──
    // These elements are revealed after the tutorial or when the system is taught

    function hideAdvancedUI() {
        // Hide orders until we teach them (step 3)
        var ordersPanel = document.getElementById('orders-panel');
        if (ordersPanel) ordersPanel.style.display = 'none';

        // Hide surge bar (confusing during tutorial)
        var surgeBar = document.getElementById('surge-bar');
        if (surgeBar) surgeBar.style.display = 'none';

        // Hide power-up bar
        var powerupBar = document.getElementById('powerup-bar');
        if (powerupBar) powerupBar.style.display = 'none';

        // Hide crystal and creature nodes (only show wood, stone, flora)
        var crystalNode = document.querySelector('.node[data-chain="crystal"]');
        var creatureNode = document.querySelector('.node[data-chain="creature"]');
        if (crystalNode) crystalNode.style.display = 'none';
        if (creatureNode) creatureNode.style.display = 'none';

        // Hide shop tab (overwhelming for new players)
        var shopNav = document.querySelector('.nav-btn[data-screen="shop"]');
        if (shopNav) shopNav.style.display = 'none';

        // Hide achievements button
        var achieveBtn = document.getElementById('achievements-btn');
        if (achieveBtn) achieveBtn.style.display = 'none';
    }

    function revealOrdersUI() {
        var ordersPanel = document.getElementById('orders-panel');
        if (ordersPanel) {
            ordersPanel.style.display = '';
            ordersPanel.classList.add('tut-reveal-anim');
            setTimeout(function() {
                ordersPanel.classList.remove('tut-reveal-anim');
            }, 600);
        }
    }

    function revealAllUI() {
        // Restore everything hidden during tutorial
        var surgeBar = document.getElementById('surge-bar');
        if (surgeBar) surgeBar.style.display = '';

        var powerupBar = document.getElementById('powerup-bar');
        if (powerupBar) powerupBar.style.display = '';

        var crystalNode = document.querySelector('.node[data-chain="crystal"]');
        var creatureNode = document.querySelector('.node[data-chain="creature"]');
        if (crystalNode) {
            crystalNode.style.display = '';
            crystalNode.classList.add('tut-reveal-anim');
        }
        if (creatureNode) {
            creatureNode.style.display = '';
            creatureNode.classList.add('tut-reveal-anim');
        }

        var shopNav = document.querySelector('.nav-btn[data-screen="shop"]');
        if (shopNav) {
            shopNav.style.display = '';
            shopNav.classList.add('tut-reveal-anim');
        }

        var achieveBtn = document.getElementById('achievements-btn');
        if (achieveBtn) {
            achieveBtn.style.display = '';
            achieveBtn.classList.add('tut-reveal-anim');
        }

        // Clean up reveal animations after they play
        setTimeout(function() {
            var anims = document.querySelectorAll('.tut-reveal-anim');
            for (var i = 0; i < anims.length; i++) {
                anims[i].classList.remove('tut-reveal-anim');
            }
        }, 800);
    }

    // ─── SINGLE STORY SCREEN ──────────────────────────────────────

    function showStoryScreen() {
        cleanup();

        var screen = STORY_SCREEN;

        // Full-screen overlay with themed background
        overlayEl = document.createElement('div');
        overlayEl.className = 'tut-overlay tut-story-overlay';
        overlayEl.style.background = screen.bg;

        // Story card
        cardEl = document.createElement('div');
        cardEl.className = 'tut-story-card';

        // Large symbol
        var symbolEl = document.createElement('div');
        symbolEl.className = 'tut-story-symbol';
        symbolEl.textContent = screen.symbol;
        cardEl.appendChild(symbolEl);

        // Title
        var titleEl = document.createElement('h2');
        titleEl.className = 'tut-story-title';
        titleEl.textContent = screen.title;
        cardEl.appendChild(titleEl);

        // Body text
        var bodyEl = document.createElement('p');
        bodyEl.className = 'tut-story-body';
        bodyEl.textContent = screen.body;
        cardEl.appendChild(bodyEl);

        // Begin button (no dots, no multi-screen, just GO)
        var btnEl = document.createElement('button');
        btnEl.className = 'tut-btn tut-btn-pulse';
        btnEl.textContent = 'Restore the Island \u2192';
        btnEl.addEventListener('click', function() {
            Sound.init();
            Sound.playTap();
            // Jump straight to tutorial steps
            currentStep = 0;
            showStep(0);
        });
        cardEl.appendChild(btnEl);

        overlayEl.appendChild(cardEl);

        // Skip button (always present)
        addSkipButton(overlayEl);

        document.getElementById('app').appendChild(overlayEl);

        // Entrance animation
        requestAnimationFrame(function() {
            cardEl.classList.add('tut-story-enter');
        });
    }

    // ─── STEP ROUTER ────────────────────────────────────────────

    function showStep(idx) {
        cleanup();

        if (idx >= STEPS.length) {
            finish();
            return;
        }

        currentStep = idx;
        var step = STEPS[idx];

        if (step.type === 'card') {
            showCard(step);
        } else if (step.type === 'spotlight') {
            showSpotlight(step);
        }
    }

    // ─── CARD STEPS ─────────────────────────────────────────────

    function showCard(step) {
        // Dark overlay
        overlayEl = document.createElement('div');
        overlayEl.className = 'tut-overlay';

        // Card
        cardEl = document.createElement('div');
        cardEl.className = 'tut-card';

        var h2 = document.createElement('h2');
        h2.textContent = step.title;
        cardEl.appendChild(h2);

        var p = document.createElement('p');
        p.textContent = step.body;
        cardEl.appendChild(p);

        var btn = document.createElement('button');
        btn.className = 'tut-btn tut-btn-pulse';
        btn.textContent = step.btn;
        btn.addEventListener('click', function() {
            Sound.init();
            Sound.playTap();
            advance();
        });
        cardEl.appendChild(btn);

        overlayEl.appendChild(cardEl);
        addSkipButton(overlayEl);
        document.getElementById('app').appendChild(overlayEl);
    }

    // ─── SPOTLIGHT STEPS ────────────────────────────────────────

    function showSpotlight(step) {
        var targetEl = getTargetElement(step.target);
        if (!targetEl) {
            // Target not found, skip this step
            advance();
            return;
        }

        // Run setup function if specified
        if (step.setupFn && SETUP_FNS[step.setupFn]) {
            SETUP_FNS[step.setupFn](step);
        }

        // Full-screen blocker overlay
        overlayEl = document.createElement('div');
        overlayEl.className = 'tut-overlay tut-overlay-transparent';

        // Spotlight cutout
        spotlightEl = document.createElement('div');
        spotlightEl.className = 'tut-spotlight';
        positionSpotlight(targetEl);

        // Tooltip with instruction text
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'tut-tooltip';
        if (step.position === 'below') {
            tooltipEl.classList.add('tut-tooltip-below');
        }

        // Instruction text (no step counter -- reduces "homework" feeling)
        var textSpan = document.createElement('span');
        textSpan.textContent = step.instruction;
        tooltipEl.appendChild(textSpan);

        positionTooltip(targetEl, step.position);

        // Lift the target above the overlay so it is clickable
        targetEl.classList.add('tut-lifted');

        // Add glow effect to resource nodes
        if (step.target === 'wood-node' || step.target === 'resource-nodes') {
            targetEl.classList.add('tut-glow');
        }

        var appEl = document.getElementById('app');
        appEl.appendChild(overlayEl);
        appEl.appendChild(spotlightEl);
        appEl.appendChild(tooltipEl);

        // Add skip button on the overlay
        addSkipButton(appEl);

        // Listen for game event to auto-advance (with debounce)
        if (step.event) {
            listenForEvent(step.event, step);
        }
    }

    // ─── SETUP FUNCTIONS ────────────────────────────────────────
    // Called before a spotlight step renders, to configure game state

    var SETUP_FNS = {
        setupFirstMerge: function(step) {
            // Board already has starter items (3 wood twigs adjacent).
            // Player just needs to tap two matching items to merge.
            Board.clearForcedSpawnTier();
            Board.setAutoMergeSuppressed(false);
        },
        setupChainMerge: function(step) {
            // After the first merge, we want the player to see a chain reaction.
            // They will spawn 2 wood items that land near existing wood items,
            // causing an automatic chain merge. This is the "wow" moment.
            Board.setForcedSpawnTier(0);
            Board.setAutoMergeSuppressed(false);
            chainSpawnCount = 0;

            // We need to track spawns, not just the merge event.
            // When 2 items are spawned, the auto-merge should trigger naturally.
            // The merge event will advance us.
        },
        setupFreeplayStep: function(step) {
            // Let normal gameplay happen -- all 3 visible resource nodes
            Board.clearForcedSpawnTier();
            Board.setAutoMergeSuppressed(false);
        },
        setupOrdersStep: function(step) {
            Board.clearForcedSpawnTier();
            Board.setAutoMergeSuppressed(false);

            // Reveal orders panel with animation
            revealOrdersUI();

            // Small delay so the panel is visible before we set up the interceptor
            setTimeout(function() {
                // Listen for any click on the orders panel
                var ordersPanel = document.getElementById('orders-panel');
                if (ordersPanel) {
                    orderTapInterceptor = function() {
                        Game.emit('orderTapped');
                    };
                    ordersPanel.addEventListener('click', orderTapInterceptor);

                    // Lift orders panel so it is clickable
                    ordersPanel.classList.add('tut-lifted');
                }
            }, 100);
        }
    };

    // ─── TARGET ELEMENT LOOKUP ──────────────────────────────────

    function getTargetElement(target) {
        switch (target) {
            case 'wood-node':
                return document.querySelector('.node[data-chain="wood"]');
            case 'board':
                return document.getElementById('board-wrapper');
            case 'resource-nodes':
                return document.getElementById('resource-nodes');
            case 'orders-panel':
                return document.getElementById('orders-panel');
            case 'island-nav':
                return document.querySelector('.nav-btn[data-screen="island"]');
            case 'quests-nav':
                return document.querySelector('.nav-btn[data-screen="quest"]');
            default:
                return null;
        }
    }

    // ─── POSITIONING ────────────────────────────────────────────

    function positionSpotlight(el) {
        var rect = el.getBoundingClientRect();
        var appRect = document.getElementById('app').getBoundingClientRect();
        var pad = 8;

        spotlightEl.style.left   = (rect.left   - appRect.left - pad) + 'px';
        spotlightEl.style.top    = (rect.top    - appRect.top  - pad) + 'px';
        spotlightEl.style.width  = (rect.width  + pad * 2) + 'px';
        spotlightEl.style.height = (rect.height + pad * 2) + 'px';
    }

    function positionTooltip(el, position) {
        var rect = el.getBoundingClientRect();
        var appRect = document.getElementById('app').getBoundingClientRect();

        // Always center horizontally
        tooltipEl.style.left = '50%';

        if (position === 'below') {
            // Below the target
            tooltipEl.style.top = (rect.bottom - appRect.top + 16) + 'px';
            tooltipEl.style.bottom = 'auto';
        } else {
            // Above the target (default)
            tooltipEl.style.bottom = (appRect.bottom - rect.top + 12) + 'px';
            tooltipEl.style.top = 'auto';
        }

        // For the board target, place above the board area
        if (el.id === 'board-wrapper') {
            tooltipEl.style.top = (rect.top - appRect.top - 44) + 'px';
            tooltipEl.style.bottom = 'auto';
        }
    }

    // ─── EVENT LISTENER (debounced) ─────────────────────────────

    function listenForEvent(eventName, step) {
        // Reduced debounce from 600ms to 300ms for snappier feel
        var armed = false;
        debounceTimer = setTimeout(function() {
            armed = true;
        }, 300);

        eventHandler = function() {
            if (!armed) return;
            advance();
        };

        Game.on(eventName, eventHandler);
    }

    // ─── SKIP BUTTON ────────────────────────────────────────────

    function addSkipButton(parentEl) {
        // Remove any existing skip button first
        var existing = document.querySelector('.tut-skip-btn');
        if (existing) existing.remove();

        skipBtnEl = document.createElement('button');
        skipBtnEl.className = 'tut-skip-btn';
        skipBtnEl.textContent = 'Skip Tutorial';
        skipBtnEl.addEventListener('click', function(e) {
            e.stopPropagation();
            Sound.playTap();
            finish();
        });
        parentEl.appendChild(skipBtnEl);
    }

    // ─── ADVANCE / CLEANUP ──────────────────────────────────────

    function advance() {
        cleanup();
        currentStep++;
        showStep(currentStep);
    }

    function cleanup() {
        // Remove overlay + spotlight + tooltip + skip button
        if (overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
        if (spotlightEl && spotlightEl.parentNode) spotlightEl.parentNode.removeChild(spotlightEl);
        if (tooltipEl && tooltipEl.parentNode) tooltipEl.parentNode.removeChild(tooltipEl);
        if (skipBtnEl && skipBtnEl.parentNode) skipBtnEl.parentNode.removeChild(skipBtnEl);
        if (cardEl && cardEl.parentNode && cardEl.parentNode !== overlayEl) {
            cardEl.parentNode.removeChild(cardEl);
        }
        overlayEl = null;
        spotlightEl = null;
        tooltipEl = null;
        cardEl = null;
        skipBtnEl = null;

        // Remove lifted/glow from any target
        var lifted = document.querySelectorAll('.tut-lifted');
        for (var i = 0; i < lifted.length; i++) {
            lifted[i].classList.remove('tut-lifted');
            lifted[i].classList.remove('tut-glow');
        }

        // Remove event listeners
        if (eventHandler) {
            // Unregister from all possible events
            Game.off('itemSpawned', eventHandler);
            Game.off('mergeCompleted', eventHandler);
            Game.off('orderTapped', eventHandler);
            Game.off('navTapped', eventHandler);
            eventHandler = null;
        }

        // Remove order tap interceptor
        if (orderTapInterceptor) {
            var ordersPanel = document.getElementById('orders-panel');
            if (ordersPanel) ordersPanel.removeEventListener('click', orderTapInterceptor);
            orderTapInterceptor = null;
        }

        // Remove nav interceptor
        if (navInterceptor) {
            var navBtns = document.querySelectorAll('.nav-btn');
            for (var j = 0; j < navBtns.length; j++) {
                navBtns[j].removeEventListener('click', navInterceptor);
            }
            navInterceptor = null;
        }

        // Clear debounce
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    }

    function finish() {
        cleanup();
        isRunning = false;

        // Clear any tutorial overrides on the board
        Board.clearForcedSpawnTier();
        Board.setAutoMergeSuppressed(false);

        // Mark tutorial as completed
        var state = Game.getState();
        state.firstPlay = false;
        state.tutorialCompletedAt = Date.now();
        Game.save();

        // Reveal all hidden UI elements with animation
        revealAllUI();

        // Show post-tutorial breadcrumbs: gentle nudges, not spotlight overlays
        showPostTutorialBreadcrumbs();
    }

    // ─── POST-TUTORIAL BREADCRUMBS ──────────────────────────────
    // Instead of forcing the player to tap Island and Quests tabs during
    // the tutorial (which navigates them away from the fun), we show
    // non-blocking toast hints that point them to those features.

    function showPostTutorialBreadcrumbs() {
        // First breadcrumb: immediate -- point to quests
        showBreadcrumbToast('Check the Quests tab for bonus rewards! \u{1F4CB}', 2000);

        // Second breadcrumb: after 30s of play -- point to daily login
        setTimeout(function() {
            showBreadcrumbToast('Visit the Shop tab to claim your daily login bonus! \u{1F525}', 30000);
        }, 30000);

        // Third breadcrumb: after 90s -- hint at creatures
        setTimeout(function() {
            showBreadcrumbToast('Try the Egg resource to discover creatures for your island! \u{1F95A}', 90000);
        }, 90000);

        // Fourth breadcrumb: after 3 min -- hint at island
        setTimeout(function() {
            showBreadcrumbToast('Earn stars to restore the Island \u2014 tap the Island tab! \u{1F3DD}\uFE0F', 180000);
        }, 180000);

        // Pulsing nav badge for Quests tab (draws attention without blocking)
        var questNav = document.querySelector('.nav-btn[data-screen="quest"]');
        if (questNav) {
            questNav.classList.add('nav-badge-pulse');
            // Remove after they visit
            var removeQuestPulse = function() {
                questNav.classList.remove('nav-badge-pulse');
                questNav.removeEventListener('click', removeQuestPulse);
            };
            questNav.addEventListener('click', removeQuestPulse);
        }
    }

    function showBreadcrumbToast(msg, duration) {
        var existing = document.querySelector('.tut-breadcrumb');
        if (existing) existing.remove();

        var el = document.createElement('div');
        el.className = 'tut-breadcrumb';
        el.textContent = msg;
        document.getElementById('app').appendChild(el);

        // Animate in
        setTimeout(function() { el.classList.add('tut-breadcrumb-show'); }, 10);

        // Auto-dismiss
        setTimeout(function() {
            el.classList.remove('tut-breadcrumb-show');
            setTimeout(function() { el.remove(); }, 300);
        }, 4000);
    }

    return {
        start: start,
        isActive: isActive
    };

})();
