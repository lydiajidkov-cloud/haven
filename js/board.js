// Haven - Merge Board: Grid, Spawning, Drag-Merge, Chain Reactions
'use strict';

const Board = (() => {
    // Board dimensions — initialized from Game, updated on expansion
    var ROWS = Game.ROWS;
    var COLS = Game.COLS;
    var MIN_MERGE = 3;

    // Query current effective MIN_MERGE (may be overridden by event modifier)
    function getEffectiveMinMerge() {
        if (typeof Events !== 'undefined' && Events.hasModifier('min_merge_override')) {
            return Events.getModifierValue('min_merge_override');
        }
        return MIN_MERGE;
    }

    let boardEl, containerEl;
    let grid = [];   // DOM elements [row][col]
    let items = [];  // Item data [row][col] or null
    // Per-cell locking replaces global `animating` — allows rapid tapping
    var lockedCells = {};  // "row,col" → true for cells in mid-animation

    // ─── SURGE MOMENTUM SYSTEM ──────────────────────────────────────
    var surgeLevel = 0;           // 0–100
    var surgeActive = false;
    var surgeDecayTimer = null;
    var surgeMergeCount = 0;      // merges during current surge
    var surgeHighestMilestone = 0; // highest milestone reached this surge (5/10/20)
    var SURGE_ACTIVATE = 30;      // level to activate (was 40 — easier to trigger)
    var SURGE_DEACTIVATE = 5;     // level to deactivate (was 10 — stays active longer)
    var SURGE_PER_MERGE = 35;     // added per merge (was 30 — one merge nearly triggers)
    var SURGE_DECAY_RATE = 8;     // lost per second (was 12 — wider window)
    var SURGE_ANIM_FAST = 140;    // ms merge animation during surge (was 180)
    var SURGE_ANIM_NORMAL = 250;  // ms merge animation normally (was 320)

    // Pity counter — guarantees gem multiplier every N merges
    var mergesSinceBonus = 0;
    var PITY_THRESHOLD = 12;

    // Tutorial overrides
    var forcedSpawnTier = null;
    var autoMergeSuppressed = false;

    // Interaction state (tap-to-select + drag fallback + swipe-merge)
    var selectedPos = null;  // {row, col} of selected item
    var dragItem = null;
    var dragFrom = null;
    var dragEl = null;
    var dragOffsetX = 0;
    var dragOffsetY = 0;
    var dragStartX = 0;
    var dragStartY = 0;
    var dragStarted = false;
    var DRAG_THRESHOLD = 12; // px before a touch becomes a drag
    var activePointerId = null; // track which finger/pointer owns the interaction

    // Cached grid layout for coordinate math (no elementFromPoint needed)
    var gridOriginX = 0;
    var gridOriginY = 0;
    var cellStepX = 0;
    var cellStepY = 0;
    var cellW = 0;
    var cellH = 0;

    // Swipe-merge state
    var swipeChain = [];     // [{row, col}, ...] cells in swipe path
    var swipeActive = false; // true when swiping across matching tiles
    var lastSwipeCell = null; // last cell entered during swipe

    function init() {
        containerEl = document.getElementById('board-container');
        boardEl = document.getElementById('board');

        // Read dynamic dimensions (may have been expanded in a previous session)
        ROWS = Game.ROWS;
        COLS = Game.COLS;

        // Load sprite map for image-based rendering
        loadSpriteMap();

        // Apply CSS grid dimensions
        updateBoardGridCSS();

        // Create grid cells
        for (let r = 0; r < ROWS; r++) {
            grid[r] = [];
            items[r] = [];
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                boardEl.appendChild(cell);
                grid[r][c] = cell;
                items[r][c] = null;
            }
        }

        // Load saved board state
        const state = Game.getState();
        if (state.board) {
            for (let r = 0; r < ROWS; r++) {
                if (!state.board[r]) continue;
                for (let c = 0; c < COLS; c++) {
                    if (state.board[r][c]) {
                        items[r][c] = state.board[r][c];
                        renderCell(r, c);
                    }
                }
            }
        }

        setupPointerEvents();
        setupResourceNodes();
        Particles.init(document.getElementById('particle-canvas'));

        // Check clutter state on load
        updateClutterIndicator();

        // Board expansion button
        renderExpandButton();

        // Listen for shop-initiated expansion requests
        Game.on('shopExpandRequest', function() {
            confirmBoardExpansionDirect();
        });

        // Apply saved board theme
        applyBoardTheme(Game.getBoardTheme());
        Game.on('boardThemeChanged', function(themeId) {
            applyBoardTheme(themeId);
        });

        // Cache grid layout for touch coordinate math
        requestAnimationFrame(function() { cacheGridLayout(); });
        window.addEventListener('resize', function() { cacheGridLayout(); });
    }

    // ─── TAP-TO-SELECT + DRAG + SWIPE ──────────────────────────────

    function setupPointerEvents() {
        boardEl.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerCancel);

        // Prevent context menu (long-press on Android) and text selection
        boardEl.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    }

    // Cache grid layout dimensions for fast coordinate math (no elementFromPoint)
    function cacheGridLayout() {
        var r0 = grid[0][0].getBoundingClientRect();
        var r1 = grid[0][1].getBoundingClientRect();
        var r2 = grid[1][0].getBoundingClientRect();
        gridOriginX = r0.left;
        gridOriginY = r0.top;
        cellW = r0.width;
        cellH = r0.height;
        cellStepX = r1.left - r0.left;
        cellStepY = r2.top - r0.top;
    }

    // Pure math cell lookup — no DOM queries during touch move
    function getCellFromCoords(clientX, clientY) {
        var relX = clientX - gridOriginX;
        var relY = clientY - gridOriginY;

        // Quick bounds check
        if (relX < -cellW * 0.3 || relY < -cellH * 0.3) return null;

        var col = Math.floor(relX / cellStepX);
        var row = Math.floor(relY / cellStepY);

        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;

        // Check finger is over the cell, not the gap
        var colOffset = relX - col * cellStepX;
        var rowOffset = relY - row * cellStepY;
        if (colOffset > cellW || rowOffset > cellH) return null;

        return { row: row, col: col };
    }

    function onPointerDown(e) {
        // Reject second finger / additional pointers
        if (activePointerId !== null) return;

        var cell = e.target.closest('.cell');
        if (!cell) return;

        var r = parseInt(cell.dataset.row);
        var c = parseInt(cell.dataset.col);

        // Skip if this specific cell is mid-animation
        if (isCellLocked(r, c)) return;

        e.preventDefault();

        // Order delivery mode: intercept tap to deliver items
        if (typeof Orders !== 'undefined' && Orders.getDeliveryMode()) {
            if (items[r][c] && Orders.canDeliverItem(items[r][c])) {
                Orders.deliverItem(items[r][c]);
                items[r][c] = null;
                renderCell(r, c);
                emitParticlesAtCell(r, c, 'spawn', { color: '#ffd700' });
                syncToGameState();
            } else {
                Orders.exitDeliveryMode();
            }
            return;
        }

        // Power-up target mode: intercept tap for Upgrade Wand
        if (typeof PowerUps !== 'undefined' && PowerUps.getActivePowerUp()) {
            if (items[r][c]) {
                PowerUps.onTargetCellTapped(r, c);
            }
            return;
        }

        // Lock to this pointer
        activePointerId = e.pointerId;

        // Cache grid layout once per interaction (handles resize/scroll)
        cacheGridLayout();

        // If we already have a selection, handle the second tap
        if (selectedPos) {
            handleTapWithSelection(r, c);
            activePointerId = null;
            return;
        }

        // Nothing selected — need an item to interact with
        if (!items[r][c]) {
            activePointerId = null;
            return;
        }

        Sound.playTap();
        dragItem = items[r][c];
        dragFrom = { row: r, col: c };
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStarted = false;
    }

    function onPointerMove(e) {
        // Only track the pointer that started the interaction
        if (e.pointerId !== activePointerId) return;
        if (!dragFrom || !dragItem) return;

        // Check if we've moved enough to start a drag/swipe
        if (!dragStarted && !swipeActive) {
            var dx = e.clientX - dragStartX;
            var dy = e.clientY - dragStartY;
            if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
            dragStarted = true;
            clearSelection();

            // Check if we should start swipe mode
            var firstTarget = getCellFromCoords(e.clientX, e.clientY);
            if (firstTarget && isAdjacent(dragFrom, firstTarget) &&
                items[firstTarget.row] && items[firstTarget.row][firstTarget.col] &&
                Items.canMerge(dragItem, items[firstTarget.row][firstTarget.col])) {
                // Start swipe-merge mode!
                startSwipe(dragFrom.row, dragFrom.col);
                addToSwipe(firstTarget.row, firstTarget.col);
            } else {
                startDragVisual(e);
            }
        }

        e.preventDefault();

        // Swipe mode: track finger across cells
        if (swipeActive) {
            var target = getCellFromCoords(e.clientX, e.clientY);
            if (target && !isCellInSwipe(target.row, target.col)) {
                // Must be adjacent to the last cell in the chain
                var last = swipeChain[swipeChain.length - 1];
                if (isAdjacent(last, target) &&
                    items[target.row] && items[target.row][target.col] &&
                    Items.canMerge(dragItem, items[target.row][target.col])) {
                    addToSwipe(target.row, target.col);
                }
            }
            // Allow un-doing: if finger moves back to previous cell, pop the last one
            if (target && swipeChain.length >= 2) {
                var prev = swipeChain[swipeChain.length - 2];
                if (target.row === prev.row && target.col === prev.col) {
                    removeLastFromSwipe();
                }
            }
            return;
        }

        // Regular drag mode
        if (dragEl) {
            dragEl.style.left = (e.clientX - dragOffsetX) + 'px';
            dragEl.style.top = (e.clientY - dragOffsetY) + 'px';

            // Highlight cell under pointer
            clearHighlight('drag-over');
            var dragTarget = getCellFromCoords(e.clientX, e.clientY);
            if (dragTarget && !(dragTarget.row === dragFrom.row && dragTarget.col === dragFrom.col)) {
                grid[dragTarget.row][dragTarget.col].classList.add('drag-over');
            }
        }
    }

    function onPointerUp(e) {
        if (e.pointerId !== activePointerId) return;
        if (!dragFrom) {
            activePointerId = null;
            return;
        }
        e.preventDefault();
        activePointerId = null;

        // Swipe-merge completion
        if (swipeActive) {
            var chain = swipeChain.slice(); // copy
            endSwipe();

            if (chain.length >= getEffectiveMinMerge()) {
                var firstCell = chain[0];
                var item = items[firstCell.row][firstCell.col];
                executeMerge(chain, item.chain, item.tier, chain[chain.length - 1].row, chain[chain.length - 1].col, chain.length);
            }

            dragItem = null;
            dragFrom = null;
            return;
        }

        if (!dragStarted) {
            // It was a TAP — select the item
            selectItem(dragFrom.row, dragFrom.col);
            dragItem = null;
            dragFrom = null;
            return;
        }

        // It was a DRAG — complete it
        var target = getCellFromCoords(e.clientX, e.clientY);

        // Cleanup drag visual
        if (dragEl) { dragEl.remove(); dragEl = null; }
        clearHighlight('drag-over');
        clearHighlight('valid-target');
        clearHighlight('recipe-target');

        // Restore source visual
        var srcItem = grid[dragFrom.row][dragFrom.col].querySelector('.item');
        if (srcItem) srcItem.classList.remove('drag-source');

        if (!target || (target.row === dragFrom.row && target.col === dragFrom.col)) {
            dragItem = null;
            dragFrom = null;
            return;
        }

        var tr = target.row;
        var tc = target.col;

        if (items[tr][tc] && Items.canMerge(dragItem, items[tr][tc])) {
            attemptMerge(dragFrom.row, dragFrom.col, tr, tc);
        } else if (items[tr][tc]) {
            var recipe = Items.getCrossChainResult(dragItem, items[tr][tc]);
            if (recipe) {
                executeCrossChainMerge(dragFrom.row, dragFrom.col, tr, tc, recipe);
            }
        } else if (!items[tr][tc]) {
            moveItem(dragFrom.row, dragFrom.col, tr, tc);
        }

        dragItem = null;
        dragFrom = null;
    }

    // Handle pointer lost (finger left screen, browser cancelled, etc.)
    function onPointerCancel(e) {
        if (e.pointerId !== activePointerId) return;
        activePointerId = null;

        // Clean up any in-progress interaction
        if (swipeActive) endSwipe();
        if (dragEl) { dragEl.remove(); dragEl = null; }
        clearHighlight('drag-over');
        clearHighlight('valid-target');
        clearHighlight('recipe-target');

        if (dragFrom) {
            var srcItem = grid[dragFrom.row][dragFrom.col].querySelector('.item');
            if (srcItem) srcItem.classList.remove('drag-source');
        }

        dragItem = null;
        dragFrom = null;
        dragStarted = false;
    }

    function startDragVisual(e) {
        var cell = grid[dragFrom.row][dragFrom.col];
        var itemEl = cell.querySelector('.item');
        if (!itemEl) return;

        var rect = itemEl.getBoundingClientRect();
        dragEl = itemEl.cloneNode(true);
        dragEl.classList.add('dragging');
        dragEl.style.cssText = 'position:fixed;z-index:1000;pointer-events:none;' +
            'width:' + rect.width + 'px;height:' + rect.height + 'px;' +
            'left:' + rect.left + 'px;top:' + rect.top + 'px;' +
            'transition:none;opacity:0.85;will-change:left,top;';
        document.body.appendChild(dragEl);

        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        itemEl.classList.add('drag-source');
        highlightTargets(dragItem, dragFrom.row, dragFrom.col);
    }

    // ─── TAP SELECTION ────────────────────────────────────────────

    function selectItem(r, c) {
        clearSelection();
        if (!items[r][c]) return;
        selectedPos = { row: r, col: c };
        grid[r][c].classList.add('selected');
        highlightTargets(items[r][c], r, c);
        Sound.playTap();
    }

    function clearSelection() {
        if (selectedPos) {
            grid[selectedPos.row][selectedPos.col].classList.remove('selected');
        }
        selectedPos = null;
        clearHighlight('valid-target');
        clearHighlight('recipe-target');
    }

    function handleTapWithSelection(r, c) {
        var sr = selectedPos.row;
        var sc = selectedPos.col;

        // Tap same cell = deselect
        if (r === sr && c === sc) {
            clearSelection();
            Sound.playTap();
            return;
        }

        // Tap matching item = merge
        if (items[r][c] && Items.canMerge(items[sr][sc], items[r][c])) {
            clearSelection();
            attemptMerge(sr, sc, r, c);
            return;
        }

        // Cross-chain recipe
        if (items[r][c]) {
            var recipe = Items.getCrossChainResult(items[sr][sc], items[r][c]);
            if (recipe) {
                clearSelection();
                executeCrossChainMerge(sr, sc, r, c, recipe);
                return;
            }
        }

        // Tap empty cell = move
        if (!items[r][c]) {
            clearSelection();
            moveItem(sr, sc, r, c);
            return;
        }

        // Tap different non-matching item = select that one instead
        clearSelection();
        selectItem(r, c);
    }

    function moveItem(fromR, fromC, toR, toC) {
        items[toR][toC] = items[fromR][fromC];
        items[fromR][fromC] = null;
        renderCell(fromR, fromC);
        renderCell(toR, toC);
        var movedEl = grid[toR][toC].querySelector('.item');
        if (movedEl) {
            movedEl.classList.add('spawn-in');
            setTimeout(function() { movedEl.classList.remove('spawn-in'); }, 300);
        }
        Sound.playTap();
        syncToGameState();
    }

    // ─── SHARED HELPERS ───────────────────────────────────────────

    function highlightTargets(item, skipRow, skipCol) {
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (r === skipRow && c === skipCol) continue;
                if (!items[r][c]) continue;
                if (Items.canMerge(item, items[r][c])) {
                    grid[r][c].classList.add('valid-target');
                } else if (Items.getCrossChainResult(item, items[r][c])) {
                    grid[r][c].classList.add('recipe-target');
                }
            }
        }
    }

    function clearHighlight(cls) {
        var els = boardEl.querySelectorAll('.' + cls);
        for (var i = 0; i < els.length; i++) {
            els[i].classList.remove(cls);
        }
    }

    // ─── SWIPE-MERGE HELPERS ────────────────────────────────────────

    function isAdjacent(a, b) {
        if (!a || !b) return false;
        var dr = Math.abs(a.row - b.row);
        var dc = Math.abs(a.col - b.col);
        return (dr + dc) === 1; // orthogonal only
    }

    function startSwipe(r, c) {
        swipeActive = true;
        swipeChain = [{ row: r, col: c }];
        grid[r][c].classList.add('swipe-active');
        lastSwipeCell = { row: r, col: c };
        Sound.playTap();
    }

    function addToSwipe(r, c) {
        swipeChain.push({ row: r, col: c });
        grid[r][c].classList.add('swipe-active');
        lastSwipeCell = { row: r, col: c };

        // Draw connector line between last two cells
        if (swipeChain.length >= 2) {
            var prev = swipeChain[swipeChain.length - 2];
            drawSwipeConnector(prev, { row: r, col: c });
        }

        Sound.playTap();
    }

    function removeLastFromSwipe() {
        if (swipeChain.length <= 1) return;
        var removed = swipeChain.pop();
        grid[removed.row][removed.col].classList.remove('swipe-active');
        lastSwipeCell = swipeChain[swipeChain.length - 1];

        // Remove the last connector
        var connectors = boardEl.querySelectorAll('.swipe-connector');
        if (connectors.length > 0) {
            connectors[connectors.length - 1].remove();
        }
    }

    function isCellInSwipe(r, c) {
        for (var i = 0; i < swipeChain.length; i++) {
            if (swipeChain[i].row === r && swipeChain[i].col === c) return true;
        }
        return false;
    }

    function drawSwipeConnector(from, to) {
        var fromRect = grid[from.row][from.col].getBoundingClientRect();
        var toRect = grid[to.row][to.col].getBoundingClientRect();
        var boardRect = boardEl.getBoundingClientRect();

        var fx = fromRect.left - boardRect.left + fromRect.width / 2;
        var fy = fromRect.top - boardRect.top + fromRect.height / 2;
        var tx = toRect.left - boardRect.left + toRect.width / 2;
        var ty = toRect.top - boardRect.top + toRect.height / 2;

        var dx = tx - fx;
        var dy = ty - fy;
        var len = Math.sqrt(dx * dx + dy * dy);
        var angle = Math.atan2(dy, dx) * 180 / Math.PI;

        var conn = document.createElement('div');
        conn.className = 'swipe-connector';
        conn.style.cssText =
            'position:absolute;height:4px;border-radius:2px;' +
            'background:rgba(255,215,0,0.5);pointer-events:none;z-index:5;' +
            'left:' + fx + 'px;top:' + (fy - 2) + 'px;' +
            'width:' + len + 'px;' +
            'transform-origin:0 50%;' +
            'transform:rotate(' + angle + 'deg);';

        boardEl.appendChild(conn);
    }

    function endSwipe() {
        swipeActive = false;
        clearHighlight('swipe-active');
        // Remove all connectors
        var connectors = boardEl.querySelectorAll('.swipe-connector');
        for (var i = 0; i < connectors.length; i++) {
            connectors[i].remove();
        }
        swipeChain = [];
        lastSwipeCell = null;
        dragStarted = false;
    }

    // ─── CELL LOCKING (replaces global animating flag) ────────────

    function lockCell(r, c) { lockedCells[r + ',' + c] = true; }
    function unlockCell(r, c) { delete lockedCells[r + ',' + c]; }
    function isCellLocked(r, c) { return !!lockedCells[r + ',' + c]; }
    function hasAnyLock() { return Object.keys(lockedCells).length > 0; }

    function getMergeDelay() {
        return surgeActive ? SURGE_ANIM_FAST : SURGE_ANIM_NORMAL;
    }

    // ─── SURGE FUNCTIONS ────────────────────────────────────────────

    function feedSurge(chain) {
        var surgeGain = SURGE_PER_MERGE;
        // Event modifier: surge_boost (e.g., Stone Surge 2x surge fill for stone)
        if (typeof Events !== 'undefined' && Events.hasModifier('surge_boost', chain)) {
            surgeGain = Math.floor(surgeGain * Events.getModifierValue('surge_boost', chain));
        }
        surgeLevel = Math.min(100, surgeLevel + surgeGain);

        if (!surgeActive && surgeLevel >= SURGE_ACTIVATE) {
            activateSurge();
        }

        if (surgeActive) {
            surgeMergeCount++;
            checkSurgeMilestone();
        }

        renderSurgeBar();
        startSurgeDecay();
    }

    // Surge escalation milestones: scaling rewards for sustained surge play
    // 5 merges = +10 gems, 10 merges = +25 gems + star, 20 merges = +50 gems + rare egg
    var SURGE_MILESTONES = [
        { count: 5,  gems: 10, star: false, egg: false, label: '5 SURGE MERGES!' },
        { count: 10, gems: 25, star: true,  egg: false, label: '10 SURGE MERGES!' },
        { count: 20, gems: 50, star: false, egg: true,  label: '20 SURGE MERGES!' }
    ];

    function checkSurgeMilestone() {
        for (var i = SURGE_MILESTONES.length - 1; i >= 0; i--) {
            var m = SURGE_MILESTONES[i];
            if (surgeMergeCount >= m.count && surgeHighestMilestone < m.count) {
                surgeHighestMilestone = m.count;

                // Award gems
                Game.addGems(m.gems);

                // Award star at 10-merge milestone
                if (m.star) {
                    Game.addStars(1);
                }

                // Award rare egg at 20-merge milestone: spawn a high-tier creature item
                if (m.egg) {
                    var eggCell = getRandomEmptyCell();
                    if (eggCell && typeof Items !== 'undefined') {
                        var eggItem = Items.createItem('creature', 3); // tier 3 = rare discovery chance
                        items[eggCell.row][eggCell.col] = eggItem;
                        renderCell(eggCell.row, eggCell.col);
                        var eggEl = grid[eggCell.row][eggCell.col].querySelector('.item');
                        if (eggEl) {
                            eggEl.classList.add('spawn-in');
                            setTimeout(function() { eggEl.classList.remove('spawn-in'); }, 300);
                        }
                        emitParticlesAtCell(eggCell.row, eggCell.col, 'legendary', {
                            color: '#a855f7', count: 20
                        });
                    }
                }

                // Visual feedback
                showFloatingText(3, 2, '\u26A1 ' + m.label + ' +' + m.gems + ' \u{1F48E}' + (m.star ? ' +\u2B50' : '') + (m.egg ? ' +\u{1F95A}' : ''));
                Game.vibrate([20, 40, 30, 40, 20]);

                // Sound
                if (typeof Sound !== 'undefined' && Sound.playSurgeMilestone) {
                    Sound.playSurgeMilestone(m.count);
                }

                // Show milestone toast
                var toastMsg = '\u26A1 ' + m.label + ' +' + m.gems + ' gems';
                if (m.star) toastMsg += ' +1 star';
                if (m.egg) toastMsg += ' +rare egg';
                showToast(toastMsg, TOAST_PRIORITY.HIGH);

                // Particles burst for milestone
                emitParticlesAtCell(3, 2, m.count >= 20 ? 'legendary' : 'chain', {
                    color: '#f97316',
                    count: m.count >= 20 ? 30 : (m.count >= 10 ? 20 : 15)
                });

                break; // Only fire one milestone per merge
            }
        }
    }

    function activateSurge() {
        surgeActive = true;
        surgeMergeCount = 0;
        surgeHighestMilestone = 0;
        boardEl.classList.add('surge-active');
        Game.vibrate([15, 30, 20, 30, 15]);
        if (typeof Sound !== 'undefined' && Sound.playSurgeActivate) {
            Sound.playSurgeActivate();
        } else {
            Sound.playCelebration();
        }
        showToast('\u26A1 SURGE MODE!', TOAST_PRIORITY.HIGH);
        Game.emit('surgeActivated');

        // Contextual surge tooltip: fires once, after tutorial completes
        var state = Game.getState();
        if (!state.firstPlay && !state.surgeTooltipShown) {
            state.surgeTooltipShown = true;
            Game.save();
            // Show the educational tooltip after a brief delay so SURGE toast is seen first
            setTimeout(function() {
                showToast('\u{1F4A1} You triggered SURGE! Merge fast to keep it going!', TOAST_PRIORITY.CRITICAL);
            }, 2200);
        }
    }

    function deactivateSurge() {
        if (!surgeActive) return;
        surgeActive = false;
        boardEl.classList.remove('surge-active');

        // End-of-surge summary (replaces old flat bonus — milestones now handle rewards)
        if (surgeMergeCount >= 3) {
            var bonus = Math.floor(surgeMergeCount * 1.5) + 2;
            Game.addGems(bonus);
            showFloatingText(3, 2, 'Surge! +' + bonus + ' \u{1F48E}');
            showToast('\u26A1 Surge ended! ' + surgeMergeCount + ' merges \u2192 +' + bonus + ' gems', TOAST_PRIORITY.HIGH);
        }

        surgeMergeCount = 0;
        surgeHighestMilestone = 0;
        Sound.playSurgeEnd();
        Game.emit('surgeEnded');
    }

    function startSurgeDecay() {
        if (surgeDecayTimer) return; // already running
        surgeDecayTimer = setInterval(function() {
            surgeLevel = Math.max(0, surgeLevel - SURGE_DECAY_RATE * 0.1);

            if (surgeActive && surgeLevel < SURGE_DEACTIVATE) {
                deactivateSurge();
            }

            renderSurgeBar();

            if (surgeLevel <= 0) {
                clearInterval(surgeDecayTimer);
                surgeDecayTimer = null;
            }
        }, 100);
    }

    function renderSurgeBar() {
        var bar = document.getElementById('surge-bar');
        var fill = document.getElementById('surge-fill');
        var label = document.getElementById('surge-label');
        if (!bar || !fill) return;

        fill.style.width = surgeLevel + '%';

        if (surgeActive) {
            bar.classList.add('surge-on');
            bar.classList.remove('surge-almost');
            if (label) {
                // Show merge count and next milestone target during surge
                var nextMilestone = null;
                for (var mi = 0; mi < SURGE_MILESTONES.length; mi++) {
                    if (surgeMergeCount < SURGE_MILESTONES[mi].count) {
                        nextMilestone = SURGE_MILESTONES[mi].count;
                        break;
                    }
                }
                if (nextMilestone) {
                    label.textContent = 'SURGE ' + surgeMergeCount + '/' + nextMilestone;
                } else {
                    label.textContent = 'SURGE ' + surgeMergeCount + '\u26A1';
                }
            }
        } else if (!surgeActive && surgeLevel >= SURGE_ACTIVATE * 0.7) {
            bar.classList.remove('surge-on');
            bar.classList.add('surge-almost');
            if (label) label.textContent = 'Almost...';
        } else if (surgeLevel > 0) {
            bar.classList.remove('surge-on');
            bar.classList.remove('surge-almost');
            if (label) label.textContent = '';
        } else {
            bar.classList.remove('surge-on');
            bar.classList.remove('surge-almost');
            if (label) label.textContent = '';
        }

        // Show/hide bar
        if (surgeLevel > 0) {
            bar.classList.remove('hidden');
        } else {
            bar.classList.add('hidden');
        }
    }

    // ─── MERGE LOGIC ─────────────────────────────────────────────

    function attemptMerge(fromRow, fromCol, toRow, toCol) {
        const item = items[fromRow][fromCol];
        const chain = item.chain;
        const tier = item.tier;

        // Remove dragged item from its source cell
        items[fromRow][fromCol] = null;
        renderCell(fromRow, fromCol);

        // Find all connected matching items at the drop target
        const connected = findConnected(toRow, toCol, chain, tier);
        // +1 for the dragged item
        const totalCount = connected.length + 1;

        if (totalCount >= getEffectiveMinMerge()) {
            executeMerge(connected, chain, tier, toRow, toCol, totalCount);
        } else {
            // Not enough — put item back
            items[fromRow][fromCol] = item;
            renderCell(fromRow, fromCol);
            Sound.playError();

            // Near-miss: flash matching items elsewhere on the board
            var nearMissPlayed = false;
            for (var nr = 0; nr < ROWS; nr++) {
                for (var nc = 0; nc < COLS; nc++) {
                    if (nr === fromRow && nc === fromCol) continue;
                    if (items[nr][nc] && items[nr][nc].chain === item.chain && items[nr][nc].tier === item.tier) {
                        var nmEl = grid[nr][nc].querySelector('.item');
                        if (nmEl) {
                            nmEl.classList.add('near-match-pulse');
                            (function(el) { setTimeout(function() { el.classList.remove('near-match-pulse'); }, 600); })(nmEl);
                            nearMissPlayed = true;
                        }
                    }
                }
            }
            if (nearMissPlayed) Sound.playNearMiss();
        }
    }

    function findConnected(startRow, startCol, chain, tier) {
        const visited = {};
        const result = [];
        const queue = [[startRow, startCol]];

        while (queue.length > 0) {
            const pos = queue.shift();
            const r = pos[0];
            const c = pos[1];
            const key = r + ',' + c;

            if (visited[key]) continue;
            visited[key] = true;

            if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
            if (!items[r][c]) continue;
            if (isCellLocked(r, c)) continue;  // skip cells mid-animation
            if (items[r][c].chain !== chain || items[r][c].tier !== tier) continue;

            result.push({ row: r, col: c });

            queue.push([r - 1, c]);
            queue.push([r + 1, c]);
            queue.push([r, c - 1]);
            queue.push([r, c + 1]);
        }

        return result;
    }

    function executeMerge(cells, chain, tier, targetRow, targetCol, totalCount) {
        var delay = getMergeDelay();
        var nextTier = tier + 1;
        var isMaxTier = !Items.hasNextTier(chain, tier);
        var isBigMerge = totalCount >= 5;
        // Near-miss: "Almost 5x!" when one more match would have been a big merge
        if (totalCount === 4) {
            showFloatingText(targetRow, targetCol, 'Almost 5x!');
        }
        var nextDef = Items.getItemDef(chain, isMaxTier ? tier : nextTier);

        // Lock all involved cells
        cells.forEach(function(pos) { lockCell(pos.row, pos.col); });
        lockCell(targetRow, targetCol);

        // Feed the surge meter
        feedSurge(chain);

        // Surge bonus: extra gems per merge while active
        if (surgeActive) {
            Game.addGems(1);
        }

        // Stats + events
        Game.updateStat('totalMerges', function(v) { return (v || 0) + 1; });
        if (nextTier > (Game.getState().stats.highestTier || 0)) {
            Game.updateStat('highestTier', nextTier);
        }
        Game.emit('mergeCompleted', { chain: chain, tier: tier, count: totalCount });

        // Flash all merging cells
        cells.forEach(function(pos) {
            grid[pos.row][pos.col].classList.add('merging');
        });

        // Sound + haptic (material-specific)
        Sound.playMerge(tier, chain);
        Game.vibrate(tier >= 4 ? [15, 30, 25] : [10]);

        // After flash, execute
        setTimeout(function() {
            // Remove all merging items and unlock cells
            cells.forEach(function(pos) {
                items[pos.row][pos.col] = null;
                grid[pos.row][pos.col].classList.remove('merging');
                unlockCell(pos.row, pos.col);
                renderCell(pos.row, pos.col);
            });

            if (isMaxTier) {
                Sound.playCelebration();
                Game.vibrate([20, 40, 30, 40, 20]);
                emitParticlesAtCell(targetRow, targetCol, 'legendary');
                var maxTierGems = 10;
                // Apply double_reward companion bonus to max-tier merges
                if (typeof Creatures !== 'undefined' && Creatures.isDoubleRewardActive()) {
                    maxTierGems *= 2;
                }
                // Event modifier: gem_multiplier (e.g., Crystal Rush 2x gems)
                if (typeof Events !== 'undefined' && Events.hasModifier('gem_multiplier', chain)) {
                    maxTierGems = Math.floor(maxTierGems * Events.getModifierValue('gem_multiplier', chain));
                }
                showFloatingText(targetRow, targetCol, '+' + maxTierGems + ' \u{1F48E}');
                Game.addGems(maxTierGems);
                Game.addStars(1);
                // Item discovery reward for reaching max tier
                checkItemDiscovery(chain, tier, targetRow, targetCol);
                // Celebration overlay for max-tier merge
                if (typeof Celebration !== 'undefined') {
                    var maxDef = Items.getItemDef(chain, tier);
                    Celebration.show('maxTierMerge', {
                        chain: chain,
                        chainName: maxDef ? maxDef.chainName : chain,
                        emoji: maxDef ? maxDef.symbol : undefined,
                        tier: tier
                    });
                }
                unlockCell(targetRow, targetCol);
                syncToGameState();
                return;
            }

            // Critical merge: 4% chance of +2 tier jump
            var actualTier = nextTier;
            if (Math.random() < 0.04 && Items.hasNextTier(chain, nextTier)) {
                actualTier = nextTier + 1;
                showFloatingText(targetRow, targetCol, '\u2728 CRITICAL!');
                Sound.playCelebration();
                Game.vibrate([20, 40, 30, 40, 20]);
                emitParticlesAtCell(targetRow, targetCol, 'legendary');
            }

            // Create merged item at target
            var newItem = Items.createItem(chain, actualTier);
            items[targetRow][targetCol] = newItem;
            unlockCell(targetRow, targetCol);
            renderCell(targetRow, targetCol);

            // Emit event for quest tracking
            Game.emit('itemProduced', { chain: chain, tier: actualTier });

            // Item discovery reward — first time reaching any chain+tier
            checkItemDiscovery(chain, actualTier, targetRow, targetCol);

            // Pop animation
            var newEl = grid[targetRow][targetCol].querySelector('.item');
            if (newEl) {
                newEl.classList.add('merge-result');
                setTimeout(function() { newEl.classList.remove('merge-result'); }, 400);
            }

            // Particles
            emitParticlesAtCell(targetRow, targetCol, isBigMerge ? 'chain' : 'merge', {
                color: nextDef ? nextDef.glow : '#FFD700',
                count: isBigMerge ? 25 : 15
            });

            // Big merge bonus: extra item
            if (isBigMerge) {
                var empty = getRandomEmptyCell();
                if (empty) {
                    var bonus = Items.createItem(chain, nextTier);
                    items[empty.row][empty.col] = bonus;
                    renderCell(empty.row, empty.col);
                    var bonusEl = grid[empty.row][empty.col].querySelector('.item');
                    if (bonusEl) {
                        bonusEl.classList.add('spawn-in');
                        setTimeout(function() { bonusEl.classList.remove('spawn-in'); }, 300);
                    }
                    emitParticlesAtCell(empty.row, empty.col, 'spawn', {
                        color: nextDef ? nextDef.glow : '#FFD700'
                    });
                }
            }

            // High-tier celebration
            if (nextTier >= 7) {
                Sound.playCelebration();
                Game.vibrate([20, 40, 30, 40, 20]);
                emitParticlesAtCell(targetRow, targetCol, 'legendary');
                boardEl.classList.add('screen-shake');
                setTimeout(function() { boardEl.classList.remove('screen-shake'); }, 400);
                // Full-screen celebration overlay for tier 7+
                if (typeof Celebration !== 'undefined') {
                    var htDef = Items.getItemDef(chain, actualTier);
                    Celebration.show('highTierMerge', {
                        chain: chain,
                        chainName: htDef ? htDef.chainName : chain,
                        emoji: htDef ? htDef.symbol : undefined,
                        tier: actualTier
                    });
                }
            } else if (nextTier >= 5) {
                Sound.playCelebration();
                Game.vibrate([20, 40, 30, 40, 20]);
                emitParticlesAtCell(targetRow, targetCol, 'legendary');
                boardEl.classList.add('screen-shake');
                setTimeout(function() { boardEl.classList.remove('screen-shake'); }, 400);
                // Brief banner for tier 5-6 (fires too frequently for full-screen)
                if (typeof Celebration !== 'undefined') {
                    var mtDef = Items.getItemDef(chain, actualTier);
                    Celebration.show('midTierMerge', {
                        chain: chain,
                        chainName: mtDef ? mtDef.chainName : chain,
                        emoji: mtDef ? mtDef.symbol : undefined,
                        tier: actualTier
                    });
                }
            } else if (nextTier >= 3) {
                boardEl.classList.add('screen-shake');
                setTimeout(function() { boardEl.classList.remove('screen-shake'); }, 250);
            }

            // Gem rewards — exponential scaling, starts at tier 4
            if (nextTier >= 4) {
                var gemReward = Math.max(1, Math.floor(Math.pow(1.8, nextTier - 4)));
                // Random multiplier — variable ratio reinforcement
                var roll = Math.random();
                var gemMultiplier = 1;
                mergesSinceBonus++;
                if (roll < 0.05 || mergesSinceBonus >= PITY_THRESHOLD * 2) { gemMultiplier = 3; mergesSinceBonus = 0; }
                else if (roll < 0.20 || mergesSinceBonus >= PITY_THRESHOLD) { gemMultiplier = 2; mergesSinceBonus = 0; }
                if (gemMultiplier > 1) {
                    gemReward *= gemMultiplier;
                }
                // Companion double reward check
                if (typeof Creatures !== 'undefined' && Creatures.isDoubleRewardActive()) {
                    gemReward *= 2;
                }
                // Event modifier: gem_multiplier (e.g., Crystal Rush 2x gems)
                if (typeof Events !== 'undefined' && Events.hasModifier('gem_multiplier', chain)) {
                    var eventGemMult = Events.getModifierValue('gem_multiplier', chain);
                    gemReward = Math.floor(gemReward * eventGemMult);
                }
                // Show appropriate floating text + distinct haptics per multiplier
                if (gemMultiplier === 3) {
                    showFloatingText(targetRow, targetCol, '3x JACKPOT! +' + gemReward + ' \u{1F48E}');
                    Sound.playCelebration();
                    Game.vibrate([10, 20, 10, 20, 10, 20, 30]);
                    emitParticlesAtCell(targetRow, targetCol, 'legendary');
                } else if (gemMultiplier === 2) {
                    showFloatingText(targetRow, targetCol, '2x BONUS! +' + gemReward + ' \u{1F48E}');
                    Sound.playCelebration();
                    Game.vibrate([10, 20, 15]);
                } else {
                    showFloatingText(targetRow, targetCol, '+' + gemReward + ' \u{1F48E}');
                }
                Game.addGems(gemReward);

                // Double-reward ad prompt: 20% chance after tier 4+ gem reward
                // Shows AFTER merge animation (delayed) — don't interrupt flow
                (function(gr, tr, tc) {
                    setTimeout(function() {
                        if (typeof AdAdapter !== 'undefined' && AdAdapter.maybeShowDoubleReward) {
                            AdAdapter.maybeShowDoubleReward(gr, tr, tc);
                        }
                    }, 600);
                })(gemReward, targetRow, targetCol);
            }

            // Trigger companion effects
            if (typeof Creatures !== 'undefined' && Creatures.onCompanionMerge) {
                var companionTriggers = Creatures.onCompanionMerge();
                for (var ct = 0; ct < companionTriggers.length; ct++) {
                    executeCompanionEffect(companionTriggers[ct]);
                    Sound.playCompanionTrigger();
                }
            }

            // Check chain reactions after a short delay
            setTimeout(function() {
                checkChainReaction(targetRow, targetCol, 1);
            }, Math.min(delay, 200));

            syncToGameState();
            updateClutterIndicator();
        }, delay);
    }

    function checkChainReaction(row, col, depth) {
        var item = items[row][col];
        if (!item) {
            syncToGameState();
            return;
        }

        var connected = findConnected(row, col, item.chain, item.tier);
        var minMerge = getEffectiveMinMerge();
        // Event modifier: chain_reaction_boost — near-misses get a bonus roll
        var chainReactionTriggered = connected.length >= minMerge;
        if (!chainReactionTriggered && connected.length === minMerge - 1 &&
            typeof Events !== 'undefined' && Events.hasModifier('chain_reaction_boost', item.chain)) {
            // "2x more likely" = 50% chance to chain when 1 item short
            if (Math.random() < 0.5) {
                chainReactionTriggered = true;
            }
        }
        if (chainReactionTriggered) {
            // Chain reaction bonus — exponential scaling for jackpot feel!
            var chainGems = Math.floor(depth * depth * 2);
            var chainEnergy = Math.min(depth, 3);
            Game.addGems(chainGems);
            Game.addEnergy(chainEnergy);
            showFloatingText(row, col, 'Chain x' + depth + '! +' + chainGems + '\u{1F48E} +' + chainEnergy + '\u26A1');
            Game.emit('chainReaction', { depth: depth });

            Sound.playChain(depth);
            Game.updateStat('chainRecord', function(v) { return Math.max(v || 0, depth); });
            executeMerge(connected, item.chain, item.tier, row, col, connected.length);
        } else if (connected.length === minMerge - 1) {
            // Near-miss! One more match would have chained
            showFloatingText(row, col, 'Almost chain...');
            Game.vibrate([5]);
            syncToGameState();
        } else {
            syncToGameState();
        }
    }

    // ─── CROSS-CHAIN MERGE ───────────────────────────────────────

    function executeCrossChainMerge(fromRow, fromCol, toRow, toCol, recipe) {
        var delay = getMergeDelay();

        // Lock both cells
        lockCell(fromRow, fromCol);
        lockCell(toRow, toCol);

        // Feed surge meter
        feedSurge(recipe.chain);
        if (surgeActive) Game.addGems(1);

        // Flash both cells
        grid[fromRow][fromCol].classList.add('merging');
        grid[toRow][toCol].classList.add('merging');

        Sound.playMerge(recipe.tier + 2, recipe.chain);
        Game.vibrate([15, 30, 15]);

        Game.updateStat('totalMerges', function(v) { return (v || 0) + 1; });
        Game.emit('mergeCompleted', { chain: recipe.chain, tier: recipe.tier, count: 2, crossChain: true });

        setTimeout(function() {
            // Remove both source items
            items[fromRow][fromCol] = null;
            items[toRow][toCol] = null;
            grid[fromRow][fromCol].classList.remove('merging');
            grid[toRow][toCol].classList.remove('merging');
            unlockCell(fromRow, fromCol);
            renderCell(fromRow, fromCol);

            // Place hybrid result
            var newItem = Items.createItem(recipe.chain, recipe.tier);
            items[toRow][toCol] = newItem;
            unlockCell(toRow, toCol);
            renderCell(toRow, toCol);

            Game.emit('itemProduced', { chain: recipe.chain, tier: recipe.tier });
            Game.emit('crossChainMerge', { chain: recipe.chain, tier: recipe.tier });

            // Item discovery reward for cross-chain results
            checkItemDiscovery(recipe.chain, recipe.tier, toRow, toCol);

            // Cross-chain gem reward (base: tier-scaled)
            var crossGems = Math.max(2, Math.floor(Math.pow(1.5, recipe.tier)));
            // Event modifier: crosschain_reward_multiplier (e.g., Chain Master 3x)
            if (typeof Events !== 'undefined' && Events.hasModifier('crosschain_reward_multiplier')) {
                crossGems = Math.floor(crossGems * Events.getModifierValue('crosschain_reward_multiplier'));
            }
            Game.addGems(crossGems);
            showFloatingText(toRow, toCol, '+' + crossGems + ' \u{1F48E}');

            // Pop animation + particles
            var newEl = grid[toRow][toCol].querySelector('.item');
            if (newEl) {
                newEl.classList.add('merge-result');
                setTimeout(function() { newEl.classList.remove('merge-result'); }, 400);
            }

            var def = Items.getItemDef(recipe.chain, recipe.tier);
            emitParticlesAtCell(toRow, toCol, 'chain', {
                color: def ? def.glow : '#FFD700',
                count: 20
            });

            boardEl.classList.add('screen-shake');
            setTimeout(function() { boardEl.classList.remove('screen-shake'); }, 300);

            syncToGameState();
        }, delay);
    }

    // ─── RESOURCE NODES ──────────────────────────────────────────

    function setupResourceNodes() {
        var nodes = document.querySelectorAll('.node');
        for (var i = 0; i < nodes.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    spawnItem(btn.dataset.chain);
                });
            })(nodes[i]);
        }
    }

    // ─── TIER-0 CLUTTER TAX ─────────────────────────────────────────
    // When too many tier-0 items clog the board, spawns cost extra energy.
    // This creates pressure to merge or clear junk, making Lightning and
    // merge planning strategically important.
    var CLUTTER_THRESHOLD = 8;  // tier-0 items before tax kicks in
    var CLUTTER_EXTRA_COST = 1; // extra energy per spawn when cluttered

    function countTierZero() {
        var count = 0;
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (items[r][c] && items[r][c].tier === 0) count++;
            }
        }
        return count;
    }

    function isCluttered() {
        return countTierZero() > CLUTTER_THRESHOLD;
    }

    // Update visual clutter warning on resource nodes
    function updateClutterIndicator() {
        var nodesEl = document.getElementById('resource-nodes');
        if (!nodesEl) return;
        if (isCluttered()) {
            nodesEl.classList.add('cluttered');
            // Ensure warning label exists
            if (!nodesEl.querySelector('.clutter-warning')) {
                var warn = document.createElement('div');
                warn.className = 'clutter-warning';
                warn.textContent = 'Cluttered! Spawns cost 2 energy';
                nodesEl.appendChild(warn);
            }
        } else {
            nodesEl.classList.remove('cluttered');
            var existing = nodesEl.querySelector('.clutter-warning');
            if (existing) existing.remove();
        }
    }

    function spawnItem(chain) {
        // Check clutter tax: if board is cluttered with tier-0 items, extra energy cost
        var cluttered = isCluttered();
        var totalCost = 1 + (cluttered ? CLUTTER_EXTRA_COST : 0);

        if (Game.getEnergy() < totalCost) {
            Sound.playEnergyEmpty();
            var energyEl = document.getElementById('energy-display');
            energyEl.classList.add('shake');
            setTimeout(function() { energyEl.classList.remove('shake'); }, 500);
            if (cluttered) {
                showToast('Cluttered! Spawns cost ' + totalCost + ' energy. Merge or clear tier-0 items!', TOAST_PRIORITY.NORMAL);
            } else {
                // Show energy-empty bottom sheet (ad + gem refill options)
                if (typeof AdAdapter !== 'undefined' && AdAdapter.showEnergyBottomSheet) {
                    AdAdapter.showEnergyBottomSheet();
                }
                // Count available merges to encourage continued play
                var availableMerges = 0;
                var visitedCells = {};
                for (var er = 0; er < ROWS; er++) {
                    for (var ec = 0; ec < COLS; ec++) {
                        var ek = er + ',' + ec;
                        if (visitedCells[ek] || !items[er][ec]) continue;
                        var cluster = findConnected(er, ec, items[er][ec].chain, items[er][ec].tier);
                        for (var ci = 0; ci < cluster.length; ci++) { visitedCells[cluster[ci].row + ',' + cluster[ci].col] = true; }
                        if (cluster.length >= getEffectiveMinMerge()) availableMerges++;
                    }
                }
                if (availableMerges > 0) {
                    showToast('No energy, but ' + availableMerges + ' merge' + (availableMerges > 1 ? 's' : '') + ' ready!', TOAST_PRIORITY.NORMAL);
                }
            }
            return;
        }

        // Consume energy (base cost)
        if (!Game.useEnergy()) {
            Sound.playEnergyEmpty();
            return;
        }
        // Consume extra clutter tax energy
        if (cluttered) {
            Game.useEnergy(); // second point
        }

        var empty = getRandomEmptyCell();
        if (!empty) {
            Sound.playBoardFull();
            Game.addEnergy(totalCost); // Refund full cost
            showToast('Board is full! Merge some items first.', TOAST_PRIORITY.CRITICAL);
            // Free shuffle safety valve if no merges possible
            var hasMerge = false;
            for (var fr = 0; fr < ROWS && !hasMerge; fr++) {
                for (var fc = 0; fc < COLS && !hasMerge; fc++) {
                    if (!items[fr][fc]) continue;
                    var adj = [[fr-1,fc],[fr+1,fc],[fr,fc-1],[fr,fc+1]];
                    for (var a = 0; a < adj.length; a++) {
                        var ar = adj[a][0], ac = adj[a][1];
                        if (ar >= 0 && ar < ROWS && ac >= 0 && ac < COLS && items[ar][ac] &&
                            items[ar][ac].chain === items[fr][fc].chain && items[ar][ac].tier === items[fr][fc].tier) {
                            hasMerge = true; break;
                        }
                    }
                }
            }
            if (!hasMerge) {
                showToast('No merges possible! Free shuffle incoming...', TOAST_PRIORITY.CRITICAL);
                setTimeout(function() {
                    if (typeof PowerUps !== 'undefined' && PowerUps.activateShuffle) {
                        PowerUps.activateShuffle();
                    }
                }, 800);
            }
            return;
        }

        var item;
        if (forcedSpawnTier !== null) {
            item = Items.createItem(chain, forcedSpawnTier);
        } else if (typeof PowerUps !== 'undefined' && PowerUps.isGoldenSpawnActive()) {
            // Golden Spawn: force tier 2-3
            var gsTier = Math.random() < 0.5 ? 2 : 3;
            item = Items.createItem(chain, gsTier);
            PowerUps.consumeGoldenSpawn();
        } else {
            item = Items.spawnRandomItem(chain);
            // Apply spawn quality bonus — chance to upgrade tier
            if (typeof Creatures !== 'undefined') {
                var gs = Game.getState();
                if (gs.hatchery && gs.hatchery.discovered) {
                    var bonuses = Creatures.calculatePassiveBonuses(gs.hatchery.discovered);
                    if (bonuses.spawn_quality > 0 && Math.random() * 100 < bonuses.spawn_quality) {
                        var mTier = Items.getMaxTier(chain);
                        if (item.tier < mTier) {
                            item.tier++;
                        }
                    }
                }
            }
            // Event modifier: spawn_tier_boost (e.g., Timber Time +1 tier for wood)
            if (typeof Events !== 'undefined' && Events.hasModifier('spawn_tier_boost', chain)) {
                var boostAmt = Events.getModifierValue('spawn_tier_boost', chain);
                var spawnMax = Items.getMaxTier(chain);
                item.tier = Math.min(spawnMax, item.tier + boostAmt);
            }
        }
        items[empty.row][empty.col] = item;
        renderCell(empty.row, empty.col);

        // Animation
        var itemEl = grid[empty.row][empty.col].querySelector('.item');
        if (itemEl) {
            itemEl.classList.add('spawn-in');
            setTimeout(function() { itemEl.classList.remove('spawn-in'); }, 300);
        }

        Sound.playSpawn();
        Game.vibrate([5]); // Tiny tap on every spawn — no dead interactions
        var def = Items.getItemDef(chain, item.tier);
        emitParticlesAtCell(empty.row, empty.col, 'spawn', {
            color: def ? def.glow : '#FFD700'
        });

        Game.updateStat('totalSpawns', function(v) { return (v || 0) + 1; });
        Game.emit('itemSpawned', { chain: chain, tier: item.tier });

        // Item discovery reward for spawned items (first encounter of each chain+tier)
        checkItemDiscovery(chain, item.tier, empty.row, empty.col);

        // Check if spawn created an auto-merge
        var connected = autoMergeSuppressed ? [] : findConnected(empty.row, empty.col, item.chain, item.tier);
        if (connected.length >= getEffectiveMinMerge()) {
            // Lucky auto-merge bonus!
            var luckyGems = 2 + connected.length;
            Game.addGems(luckyGems);
            Game.addEnergy(1);
            showFloatingText(empty.row, empty.col, 'Lucky! +' + luckyGems + ' \u{1F48E} +1\u26A1');
            showToast('\u{1F340} Lucky merge! +' + luckyGems + ' gems, +1 energy', TOAST_PRIORITY.HIGH);
            Game.emit('luckyMerge', { count: connected.length });
            setTimeout(function() {
                executeMerge(connected, item.chain, item.tier, empty.row, empty.col, connected.length);
            }, 400);
        } else {
            // Near-miss: spawned item is adjacent to exactly 1 matching item
            // findConnected includes the starting cell, so length===2 means self + 1 neighbor
            var nearMatch = findConnected(empty.row, empty.col, item.chain, item.tier);
            if (nearMatch.length === 2) {
                var adjCell = grid[nearMatch[1].row][nearMatch[1].col];
                var adjEl = adjCell ? adjCell.querySelector('.item') : null;
                if (adjEl) {
                    adjEl.classList.add('near-match-pulse');
                    setTimeout(function() { adjEl.classList.remove('near-match-pulse'); }, 600);
                    Sound.playNearMiss();
                }
            }
            syncToGameState();
        }

        // Update clutter indicator after every spawn
        updateClutterIndicator();
    }

    // First play: place starter items designed for the tutorial flow
    // Layout is carefully designed so that:
    // 1. Two wood twigs are obviously adjacent (row 3) -- first merge target
    // 2. A third wood twig is adjacent to where the merge result lands (row 4)
    //    so spawning one more wood item creates a chain reaction
    // 3. Flora pair is visible but separate -- breadcrumb for freeplay step
    // 4. A stone pebble sits alone -- shows variety exists
    function spawnStarterItems() {
        var starters = [
            // Two twigs side by side -- the FIRST merge (obvious pair)
            { chain: 'wood', tier: 0, row: 3, col: 2 },
            { chain: 'wood', tier: 0, row: 3, col: 3 },
            // Third twig below -- after merging the pair above, this twig + result
            // will be adjacent, setting up a chain when another wood is spawned
            { chain: 'wood', tier: 0, row: 4, col: 3 },
            // Another twig nearby -- ensures chain reaction happens after first merge
            { chain: 'wood', tier: 0, row: 4, col: 2 },
            // Flora pair -- visible reward for exploring the freeplay step
            { chain: 'flora', tier: 0, row: 5, col: 1 },
            { chain: 'flora', tier: 0, row: 5, col: 2 },
            // Lone stone -- shows variety, not yet mergeable (curiosity hook)
            { chain: 'stone', tier: 0, row: 2, col: 4 }
        ];

        starters.forEach(function(s, i) {
            setTimeout(function() {
                if (!items[s.row][s.col]) {
                    items[s.row][s.col] = Items.createItem(s.chain, s.tier);
                    renderCell(s.row, s.col);
                    var el = grid[s.row][s.col].querySelector('.item');
                    if (el) {
                        el.classList.add('spawn-in');
                        setTimeout(function() { el.classList.remove('spawn-in'); }, 300);
                    }
                    Sound.playSpawn();
                    checkItemDiscovery(s.chain, s.tier, s.row, s.col);
                }
            }, i * 150);
        });

        setTimeout(function() {
            syncToGameState();
        }, starters.length * 150 + 100);
    }

    // ─── RENDERING ───────────────────────────────────────────────

    // Sprite mapping: loaded from data/sprites.json at init
    var spriteMap = null;

    function loadSpriteMap() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/sprites.json', true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.sprites && typeof data.sprites === 'object') {
                        spriteMap = data.sprites;
                    }
                } catch (e) {
                    console.warn('Haven: sprites.json parse error', e);
                }
            }
        };
        xhr.onerror = function() {};
        xhr.send();
    }

    function createSymbolEl(symbol) {
        var el = document.createElement('span');
        el.className = 'item-symbol';
        el.textContent = symbol;
        return el;
    }

    function renderCell(row, col) {
        var cell = grid[row][col];
        cell.innerHTML = '';
        cell.className = 'cell';

        var item = items[row][col];
        if (!item) return;

        var def = Items.getItemDef(item.chain, item.tier);
        if (!def) return;

        var el = document.createElement('div');
        el.className = 'item ' + item.chain + ' tier-' + item.tier + ' item-' + item.chain + ' item-tier-' + item.tier;
        el.style.background = 'radial-gradient(circle at 35% 35%, ' + def.bg[0] + ', ' + def.bg[1] + ')';

        if (item.tier >= 4) {
            el.style.boxShadow = '0 0 ' + (8 + item.tier * 4) + 'px ' + def.glow +
                ', inset 0 1px 2px rgba(255,255,255,0.3)';
        } else {
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.15)';
        }

        // Symbol — use sprite image if available, otherwise emoji text
        var spriteKey = item.chain + '_' + item.tier;
        var spritePath = spriteMap && spriteMap[spriteKey];
        if (spritePath) {
            var imgEl = document.createElement('img');
            imgEl.className = 'item-sprite';
            imgEl.src = spritePath;
            imgEl.alt = def.name;
            imgEl.draggable = false;
            imgEl.onerror = function() {
                // Fallback to emoji on load failure
                this.replaceWith(createSymbolEl(def.symbol));
            };
            el.appendChild(imgEl);
        } else {
            el.appendChild(createSymbolEl(def.symbol));
        }

        // Name
        var nameEl = document.createElement('span');
        nameEl.className = 'item-name';
        nameEl.textContent = def.name;
        el.appendChild(nameEl);

        // Tier dots
        if (item.tier > 0) {
            var dotsEl = document.createElement('div');
            dotsEl.className = 'tier-dots';
            var dotCount = Math.min(item.tier, 7);
            for (var i = 0; i < dotCount; i++) {
                var dot = document.createElement('span');
                dot.className = 'tier-dot';
                dotsEl.appendChild(dot);
            }
            el.appendChild(dotsEl);
        }

        cell.appendChild(el);
    }

    // ─── UTILITIES ───────────────────────────────────────────────

    // Spawn a specific item at a specific tier without using energy (used by chest rewards)
    function spawnItemDirect(chain, tier) {
        var empty = getRandomEmptyCell();
        if (!empty) return false;

        var item = Items.createItem(chain, tier);
        items[empty.row][empty.col] = item;
        renderCell(empty.row, empty.col);

        var itemEl = grid[empty.row][empty.col].querySelector('.item');
        if (itemEl) {
            itemEl.classList.add('spawn-in');
            setTimeout(function() { itemEl.classList.remove('spawn-in'); }, 300);
        }

        Sound.playSpawn();
        var def = Items.getItemDef(chain, item.tier);
        emitParticlesAtCell(empty.row, empty.col, 'spawn', {
            color: def ? def.glow : '#FFD700'
        });

        Game.emit('itemSpawned', { chain: chain, tier: item.tier });
        checkItemDiscovery(chain, item.tier, empty.row, empty.col);
        syncToGameState();
        return true;
    }

    function getRandomEmptyCell() {
        var empty = [];
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (!items[r][c]) empty.push({ row: r, col: c });
            }
        }
        if (empty.length === 0) return null;
        return empty[Math.floor(Math.random() * empty.length)];
    }

    function syncToGameState() {
        var state = Game.getState();
        state.board = [];
        for (var r = 0; r < ROWS; r++) {
            state.board[r] = [];
            for (var c = 0; c < COLS; c++) {
                state.board[r][c] = items[r][c] ? {
                    id: items[r][c].id,
                    chain: items[r][c].chain,
                    tier: items[r][c].tier
                } : null;
            }
        }
        Game.save();
    }

    function emitParticlesAtCell(row, col, type, options) {
        var cellRect = grid[row][col].getBoundingClientRect();
        var boardRect = containerEl.getBoundingClientRect();
        var px = cellRect.left - boardRect.left + cellRect.width / 2;
        var py = cellRect.top - boardRect.top + cellRect.height / 2;
        Particles.emit(px, py, type, options);
    }

    // ─── ITEM DISCOVERY REWARDS ──────────────────────────────────
    // Award gems the first time any chain+tier combo is produced (Travel Town mechanic).
    // Creates constant micro-dopamine hits: "New Discovery! Mossy Log (Wood Tier 3) +2 gems"

    function checkItemDiscovery(chain, tier, targetRow, targetCol) {
        var state = Game.getState();
        if (!state.discoveredItems) state.discoveredItems = {};
        var key = chain + '_' + tier;
        if (state.discoveredItems[key]) return; // already discovered

        // Mark as discovered
        state.discoveredItems[key] = Date.now();
        Game.save();

        // Gem reward by rarity bracket (PRD Task 6)
        // Common (tiers 0-2): 5 gems, Uncommon (3-4): 10, Rare (5-6): 25, Legendary (7+): 50
        var gemReward;
        if (tier <= 2) { gemReward = 5; }
        else if (tier <= 4) { gemReward = 10; }
        else if (tier <= 6) { gemReward = 25; }
        else { gemReward = 50; }
        Game.addGems(gemReward);

        // Get item name for the toast
        var def = Items.getItemDef(chain, tier);
        var itemName = def ? def.name : ('Tier ' + tier);
        var chainName = def ? def.chainName : chain;

        // Show floating "+X NEW!" text at the merge target cell (or board center as fallback)
        var floatRow = (targetRow !== undefined) ? targetRow : 0;
        var floatCol = (targetCol !== undefined) ? targetCol : 3;
        showFloatingText(floatRow, floatCol, '+' + gemReward + ' NEW!');
        showToast('\u{1F50D} New Discovery: ' + itemName + ' (' + chainName + ') +' + gemReward + ' \u{1F48E}', TOAST_PRIORITY.NORMAL);

        // Distinct discovery chime sound
        if (typeof Sound !== 'undefined' && Sound.playItemDiscovery) {
            Sound.playItemDiscovery();
        }

        // Track stat for achievements
        var totalDiscovered = Object.keys(state.discoveredItems).length;
        Game.updateStat('itemsDiscovered', totalDiscovered);
        Game.emit('itemDiscovered', { chain: chain, tier: tier, total: totalDiscovered });
    }

    function showFloatingText(row, col, text) {
        var cellRect = grid[row][col].getBoundingClientRect();
        var el = document.createElement('div');
        el.className = 'floating-text';
        el.textContent = text;
        el.style.left = (cellRect.left + cellRect.width / 2) + 'px';
        el.style.top = cellRect.top + 'px';
        document.body.appendChild(el);
        setTimeout(function() { el.remove(); }, 1200);
    }

    // ─── TOAST QUEUE WITH COOLDOWN + PRIORITY ─────────────────────
    // Max one toast per 45s for normal/low priority.
    // High/critical bypass the cooldown.
    // Low priority (recipe hints) only fires if no toast in 90s.
    var TOAST_PRIORITY = { CRITICAL: 100, HIGH: 80, NORMAL: 50, LOW: 20 };
    var TOAST_COOLDOWN = 45000;      // 45s between normal+ toasts
    var TOAST_LOW_COOLDOWN = 90000;  // 90s quiet period required for low-priority
    var lastToastTime = 0;           // timestamp of last displayed toast
    var toastQueue = [];             // { msg, priority, ts }
    var toastDisplayTimer = null;    // timer for auto-showing next queued toast
    var currentToastEl = null;       // currently visible toast element
    var currentToastDismissTimer = null;

    function showToast(msg, priority) {
        if (priority === undefined) priority = TOAST_PRIORITY.NORMAL;
        enqueueToast(msg, priority);
    }

    function enqueueToast(msg, priority) {
        var now = Date.now();
        var sinceLastToast = now - lastToastTime;

        // Critical and high priority bypass cooldown — show immediately
        if (priority >= TOAST_PRIORITY.HIGH) {
            displayToast(msg);
            return;
        }

        // Low priority requires 90s of silence
        if (priority <= TOAST_PRIORITY.LOW && sinceLastToast < TOAST_LOW_COOLDOWN) {
            return; // silently dropped
        }

        // Normal priority respects 45s cooldown
        if (sinceLastToast < TOAST_COOLDOWN) {
            // Queue it (max 3 items, drop lowest priority if full)
            if (toastQueue.length >= 3) {
                // Find lowest priority in queue
                var lowestIdx = 0;
                for (var i = 1; i < toastQueue.length; i++) {
                    if (toastQueue[i].priority < toastQueue[lowestIdx].priority) lowestIdx = i;
                }
                if (toastQueue[lowestIdx].priority < priority) {
                    toastQueue.splice(lowestIdx, 1);
                } else {
                    return; // new toast is lower priority than everything queued
                }
            }
            toastQueue.push({ msg: msg, priority: priority, ts: now });
            // Schedule drain if not already scheduled
            if (!toastDisplayTimer) {
                var waitTime = TOAST_COOLDOWN - sinceLastToast + 50;
                toastDisplayTimer = setTimeout(drainToastQueue, waitTime);
            }
            return;
        }

        // Cooldown expired — show immediately
        displayToast(msg);
    }

    function drainToastQueue() {
        toastDisplayTimer = null;
        if (toastQueue.length === 0) return;

        // Sort by priority desc, pick highest
        toastQueue.sort(function(a, b) { return b.priority - a.priority; });
        var next = toastQueue.shift();

        var now = Date.now();
        var sinceLastToast = now - lastToastTime;

        // Re-check low-priority cooldown
        if (next.priority <= TOAST_PRIORITY.LOW && sinceLastToast < TOAST_LOW_COOLDOWN) {
            // Skip this low-priority toast, try next
            if (toastQueue.length > 0) {
                drainToastQueue();
            }
            return;
        }

        if (sinceLastToast >= TOAST_COOLDOWN) {
            displayToast(next.msg);
        }

        // Schedule next drain if queue still has items
        if (toastQueue.length > 0 && !toastDisplayTimer) {
            toastDisplayTimer = setTimeout(drainToastQueue, TOAST_COOLDOWN + 50);
        }
    }

    function displayToast(msg) {
        // Remove any existing toast
        if (currentToastEl && currentToastEl.parentNode) {
            currentToastEl.remove();
        }
        if (currentToastDismissTimer) {
            clearTimeout(currentToastDismissTimer);
        }

        lastToastTime = Date.now();

        var el = document.createElement('div');
        el.className = 'toast';
        el.textContent = msg;
        document.getElementById('app').appendChild(el);
        currentToastEl = el;
        setTimeout(function() { el.classList.add('toast-show'); }, 10);
        currentToastDismissTimer = setTimeout(function() {
            el.classList.remove('toast-show');
            setTimeout(function() {
                if (el.parentNode) el.remove();
                if (currentToastEl === el) currentToastEl = null;
            }, 300);
            currentToastDismissTimer = null;
        }, 2000);
    }

    // ─── POWER-UP METHODS ─────────────────────────────────────────

    function executeMassMatch() {
        // Group all items by chain+tier, find connected groups, merge them
        var groups = {};
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (!items[r][c] || isCellLocked(r, c)) continue;
                var key = items[r][c].chain + ':' + items[r][c].tier;
                if (!groups[key]) groups[key] = [];
                groups[key].push({ row: r, col: c });
            }
        }

        var mergeDelay = 0;
        var anyMerged = false;

        Object.keys(groups).forEach(function(key) {
            var cells = groups[key];
            if (cells.length < getEffectiveMinMerge()) return;

            // Find connected clusters within this group
            var visited = {};
            cells.forEach(function(pos) {
                var k = pos.row + ',' + pos.col;
                if (visited[k]) return;

                var item = items[pos.row][pos.col];
                if (!item) return;
                var cluster = findConnected(pos.row, pos.col, item.chain, item.tier);
                cluster.forEach(function(cp) { visited[cp.row + ',' + cp.col] = true; });

                if (cluster.length >= getEffectiveMinMerge()) {
                    anyMerged = true;
                    var target = cluster[cluster.length - 1];
                    setTimeout(function() {
                        executeMerge(cluster, item.chain, item.tier, target.row, target.col, cluster.length);
                    }, mergeDelay);
                    mergeDelay += 100;
                }
            });
        });

        if (anyMerged) {
            boardEl.classList.add('powerup-activate');
            setTimeout(function() { boardEl.classList.remove('powerup-activate'); }, 400);
        }
    }

    function sortBoard() {
        // Collect all items, sort by chain then tier, place back
        var allItems = [];
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (items[r][c] && !isCellLocked(r, c)) {
                    allItems.push(items[r][c]);
                    items[r][c] = null;
                    renderCell(r, c);
                }
            }
        }

        // Sort: by chain name, then tier descending
        allItems.sort(function(a, b) {
            if (a.chain < b.chain) return -1;
            if (a.chain > b.chain) return 1;
            return b.tier - a.tier;
        });

        // Place back left-to-right, top-to-bottom
        var idx = 0;
        for (var r2 = 0; r2 < ROWS; r2++) {
            for (var c2 = 0; c2 < COLS; c2++) {
                if (idx < allItems.length) {
                    items[r2][c2] = allItems[idx++];
                }
            }
        }

        // Re-render with staggered animation
        var cellIdx = 0;
        for (var r3 = 0; r3 < ROWS; r3++) {
            for (var c3 = 0; c3 < COLS; c3++) {
                if (items[r3][c3]) {
                    (function(row, col, delay) {
                        setTimeout(function() {
                            renderCell(row, col);
                            var el = grid[row][col].querySelector('.item');
                            if (el) {
                                el.classList.add('sort-slide');
                                setTimeout(function() { el.classList.remove('sort-slide'); }, 300);
                            }
                        }, delay);
                    })(r3, c3, cellIdx * 15);
                    cellIdx++;
                }
            }
        }

        boardEl.classList.add('powerup-activate');
        setTimeout(function() { boardEl.classList.remove('powerup-activate'); }, 400);

        // Sort organizes — player still merges manually (strategic depth)
        setTimeout(function() {
            syncToGameState();
        }, cellIdx * 15 + 200);
    }

    function shuffleBoard() {
        // Fisher-Yates shuffle of all non-null items
        var positions = [];
        var itemList = [];
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (items[r][c] && !isCellLocked(r, c)) {
                    positions.push({ row: r, col: c });
                    itemList.push(items[r][c]);
                    items[r][c] = null;
                }
            }
        }

        // Fisher-Yates
        for (var i = itemList.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = itemList[i];
            itemList[i] = itemList[j];
            itemList[j] = temp;
        }

        // Place back
        for (var k = 0; k < positions.length; k++) {
            items[positions[k].row][positions[k].col] = itemList[k];
        }

        // Re-render with spin animation
        for (var p = 0; p < positions.length; p++) {
            (function(pos) {
                renderCell(pos.row, pos.col);
                var el = grid[pos.row][pos.col].querySelector('.item');
                if (el) {
                    el.classList.add('shuffle-spin');
                    setTimeout(function() { el.classList.remove('shuffle-spin'); }, 350);
                }
            })(positions[p]);
        }

        boardEl.classList.add('powerup-activate');
        setTimeout(function() { boardEl.classList.remove('powerup-activate'); }, 400);

        // Check for auto-merges after shuffle
        setTimeout(function() {
            scanForAutoMerges();
            syncToGameState();
        }, 400);
    }

    function upgradeItem(row, col) {
        var item = items[row][col];
        if (!item) return;

        var maxTier = Items.getMaxTier(item.chain);
        if (item.tier >= maxTier) {
            // Already max — celebrate instead
            Sound.playCelebration();
            Game.addGems(10);
            Game.addStars(1);
            showFloatingText(row, col, 'Max tier! +10\u{1F48E} +1\u2B50');
            return;
        }

        item.tier++;
        renderCell(row, col);

        // Item discovery reward for upgraded tier
        checkItemDiscovery(item.chain, item.tier, row, col);

        // Upgrade animation
        var el = grid[row][col].querySelector('.item');
        if (el) {
            el.classList.add('upgrade-pop');
            setTimeout(function() { el.classList.remove('upgrade-pop'); }, 450);
        }

        var def = Items.getItemDef(item.chain, item.tier);
        emitParticlesAtCell(row, col, 'merge', {
            color: def ? def.glow : '#FFD700',
            count: 20
        });

        Game.emit('itemProduced', { chain: item.chain, tier: item.tier });
        syncToGameState();
    }

    function clearTierZero() {
        var destroyed = 0;
        var cellsToDestroy = [];

        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (items[r][c] && items[r][c].tier === 0 && !isCellLocked(r, c)) {
                    cellsToDestroy.push({ row: r, col: c });
                }
            }
        }

        if (cellsToDestroy.length === 0) return;

        boardEl.classList.add('powerup-activate');
        setTimeout(function() { boardEl.classList.remove('powerup-activate'); }, 400);

        cellsToDestroy.forEach(function(pos, i) {
            setTimeout(function() {
                var el = grid[pos.row][pos.col].querySelector('.item');
                if (el) {
                    el.classList.add('item-dissolve');
                }
                setTimeout(function() {
                    items[pos.row][pos.col] = null;
                    renderCell(pos.row, pos.col);
                    destroyed++;

                    if (destroyed === cellsToDestroy.length) {
                        Game.addGems(destroyed);
                        showFloatingText(
                            cellsToDestroy[0].row,
                            cellsToDestroy[0].col,
                            '\u26A1 +' + destroyed + '\u{1F48E}'
                        );
                        syncToGameState();
                        updateClutterIndicator();
                    }
                }, 400);
            }, i * 40);
        });
    }

    // Helper: scan entire board for auto-mergeable groups after sort/shuffle
    function scanForAutoMerges() {
        var visited = {};
        var mergeDelay = 0;
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                var key = r + ',' + c;
                if (visited[key] || !items[r][c] || isCellLocked(r, c)) continue;

                var item = items[r][c];
                var cluster = findConnected(r, c, item.chain, item.tier);
                cluster.forEach(function(cp) { visited[cp.row + ',' + cp.col] = true; });

                if (cluster.length >= getEffectiveMinMerge()) {
                    var target = cluster[cluster.length - 1];
                    (function(cl, ch, ti, tr, tc, cnt, delay) {
                        setTimeout(function() {
                            executeMerge(cl, ch, ti, tr, tc, cnt);
                        }, delay);
                    })(cluster, item.chain, item.tier, target.row, target.col, cluster.length, mergeDelay);
                    mergeDelay += 150;
                }
            }
        }
    }

    // ─── COMPANION EFFECT EXECUTION ─────────────────────────────

    function findRandomMatchingPair() {
        // Find any two adjacent matching items
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (!items[r][c] || isCellLocked(r, c)) continue;
                var it = items[r][c];
                var cluster = findConnected(r, c, it.chain, it.tier);
                if (cluster.length >= getEffectiveMinMerge()) {
                    return { from: cluster[0], to: cluster[1] };
                }
            }
        }
        return null;
    }

    function executeCompanionEffect(trigger) {
        var effect = trigger.effect;
        var creature = trigger.creature;
        var label = Creatures.getCompanionLabel(effect);

        showToast(creature.emoji + ' ' + creature.name + ': ' + label.label + '!', TOAST_PRIORITY.NORMAL);

        switch (effect) {
            case 'auto_merge':
                var pair = findRandomMatchingPair();
                if (pair) {
                    setTimeout(function() {
                        if (items[pair.from.row] && items[pair.from.row][pair.from.col]) {
                            attemptMerge(pair.from.row, pair.from.col, pair.to.row, pair.to.col);
                        }
                    }, 300);
                }
                break;

            case 'free_spawn':
                var freeEmpty = getRandomEmptyCell();
                if (freeEmpty) {
                    var chains = ['wood', 'stone', 'flora', 'crystal', 'creature'];
                    var rChain = chains[Math.floor(Math.random() * chains.length)];
                    var freeItem = Items.createItem(rChain, 2);
                    items[freeEmpty.row][freeEmpty.col] = freeItem;
                    renderCell(freeEmpty.row, freeEmpty.col);
                    var freeEl = grid[freeEmpty.row][freeEmpty.col].querySelector('.item');
                    if (freeEl) {
                        freeEl.classList.add('spawn-in');
                        setTimeout(function() { freeEl.classList.remove('spawn-in'); }, 300);
                    }
                    emitParticlesAtCell(freeEmpty.row, freeEmpty.col, 'spawn', { color: '#7b68ee' });
                    checkItemDiscovery(rChain, 2, freeEmpty.row, freeEmpty.col);
                }
                break;

            case 'energy_refund':
                Game.addEnergy(1);
                break;

            case 'upgrade_item':
                var upgTargets = [];
                for (var r2 = 0; r2 < ROWS; r2++) {
                    for (var c2 = 0; c2 < COLS; c2++) {
                        if (items[r2][c2] && !isCellLocked(r2, c2)) {
                            var mxT = Items.getMaxTier(items[r2][c2].chain);
                            if (items[r2][c2].tier < mxT) {
                                upgTargets.push({ row: r2, col: c2 });
                            }
                        }
                    }
                }
                if (upgTargets.length > 0) {
                    var pick = upgTargets[Math.floor(Math.random() * upgTargets.length)];
                    upgradeItem(pick.row, pick.col);
                }
                break;

            case 'double_reward':
                Creatures.setDoubleReward();
                break;

            case 'surge_boost':
                surgeLevel = Math.min(100, surgeLevel + 40);
                if (!surgeActive && surgeLevel >= SURGE_ACTIVATE) {
                    activateSurge();
                }
                renderSurgeBar();
                startSurgeDecay();
                break;
        }

        syncToGameState();
    }

    // ─── BOARD EXPANSION ───────────────────────────────────────
    // Purchasable board expansion: 6x8 → 6x9 → 6x10 → 7x10

    function updateBoardGridCSS() {
        boardEl.style.gridTemplateColumns = 'repeat(' + COLS + ', var(--cell-size))';
        boardEl.style.gridTemplateRows = 'repeat(' + ROWS + ', var(--cell-size))';
    }

    function applyBoardTheme(themeId) {
        if (!boardEl) return;
        // Remove any existing theme class
        var classes = boardEl.className.split(' ');
        var filtered = [];
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].indexOf('board-theme-') !== 0) {
                filtered.push(classes[i]);
            }
        }
        boardEl.className = filtered.join(' ');
        // Apply new theme if specified
        if (themeId) {
            boardEl.classList.add('board-theme-' + themeId);
        }
    }

    function renderExpandButton() {
        // Remove existing expand button if any
        var existing = document.getElementById('board-expand-btn');
        if (existing) existing.remove();

        var exp = Game.getNextBoardExpansion();
        if (!exp) return; // fully expanded

        var btn = document.createElement('button');
        btn.id = 'board-expand-btn';
        btn.className = 'board-expand-btn';
        btn.innerHTML = '\u2795 Expand to ' + exp.label + ' <span class="expand-cost">\u{1F48E} ' + exp.cost + '</span>';
        btn.addEventListener('click', function() {
            confirmBoardExpansion();
        });

        // Place below the board inside the board-wrapper
        var wrapper = document.getElementById('board-wrapper');
        if (wrapper) {
            wrapper.appendChild(btn);
        }
    }

    function confirmBoardExpansion() {
        var exp = Game.getNextBoardExpansion();
        if (!exp) return;

        if (Game.getGems() < exp.cost) {
            showToast('Not enough gems! Need \u{1F48E}' + exp.cost, TOAST_PRIORITY.HIGH);
            Sound.playError();
            return;
        }

        var confirmed = confirm('Expand board to ' + exp.label + ' for ' + exp.cost + ' gems?');
        if (!confirmed) return;

        executeBoardExpansion(exp);
    }

    // Called from shop (confirmation already done there)
    function confirmBoardExpansionDirect() {
        var exp = Game.getNextBoardExpansion();
        if (!exp) return;
        executeBoardExpansion(exp);
    }

    function executeBoardExpansion(exp) {
        // Remember old dimensions before expansion
        var oldRows = ROWS;
        var oldCols = COLS;

        var success = Game.purchaseBoardExpansion();
        if (!success) return;

        // Read the new dimensions
        var newRows = Game.ROWS;
        var newCols = Game.COLS;

        // Add new cells to the grid
        // First, pad existing rows if columns increased
        for (var r = 0; r < ROWS; r++) {
            while ((grid[r] || []).length < newCols) {
                var c = grid[r].length;
                var cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                boardEl.appendChild(cell);
                grid[r][c] = cell;
                items[r][c] = null;
            }
        }
        // Then add new rows
        for (var nr = ROWS; nr < newRows; nr++) {
            grid[nr] = [];
            items[nr] = [];
            for (var nc = 0; nc < newCols; nc++) {
                var newCell = document.createElement('div');
                newCell.className = 'cell';
                newCell.dataset.row = nr;
                newCell.dataset.col = nc;
                boardEl.appendChild(newCell);
                grid[nr][nc] = newCell;
                items[nr][nc] = null;
            }
        }

        ROWS = newRows;
        COLS = newCols;

        // Update CSS grid
        updateBoardGridCSS();

        // Re-order DOM children to match row-major order (grid needs cells in order)
        for (var gr = 0; gr < ROWS; gr++) {
            for (var gc = 0; gc < COLS; gc++) {
                boardEl.appendChild(grid[gr][gc]);
            }
        }

        // Recache grid layout
        requestAnimationFrame(function() { cacheGridLayout(); });

        // Visual feedback
        Sound.playPurchase();
        Game.vibrate([15, 30, 15]);
        showToast('\u2705 Board expanded to ' + exp.label + '!', TOAST_PRIORITY.HIGH);

        // Animate only the newly added cells (beyond old dimensions)
        for (var ar = 0; ar < ROWS; ar++) {
            for (var ac = 0; ac < COLS; ac++) {
                if (ar >= oldRows || ac >= oldCols) {
                    grid[ar][ac].classList.add('expand-new-cell');
                    (function(el) {
                        setTimeout(function() { el.classList.remove('expand-new-cell'); }, 600);
                    })(grid[ar][ac]);
                }
            }
        }

        // Update expand button (next tier or remove)
        renderExpandButton();
        syncToGameState();
    }

    return {
        init: init,
        spawnItem: spawnItem,
        spawnItemDirect: spawnItemDirect,
        spawnStarterItems: spawnStarterItems,
        setForcedSpawnTier: function(t) { forcedSpawnTier = t; },
        clearForcedSpawnTier: function() { forcedSpawnTier = null; },
        setAutoMergeSuppressed: function(v) { autoMergeSuppressed = v; },
        executeMassMatch: executeMassMatch,
        sortBoard: sortBoard,
        shuffleBoard: shuffleBoard,
        upgradeItem: upgradeItem,
        clearTierZero: clearTierZero,
        getItemAt: function(r, c) { return items[r] ? items[r][c] : null; },
        isCluttered: isCluttered,
        countTierZero: countTierZero,
        CLUTTER_THRESHOLD: CLUTTER_THRESHOLD,
        showToast: showToast,
        showFloatingText: showFloatingText,
        TOAST_PRIORITY: TOAST_PRIORITY
    };
})();
