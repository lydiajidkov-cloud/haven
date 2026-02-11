// Haven - Merge Board: Grid, Spawning, Drag-Merge, Chain Reactions
'use strict';

const Board = (() => {
    const ROWS = Game.ROWS;
    const COLS = Game.COLS;
    const MIN_MERGE = 2;

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
    var SURGE_ACTIVATE = 40;      // level to activate
    var SURGE_DEACTIVATE = 10;    // level to deactivate
    var SURGE_PER_MERGE = 30;     // added per merge
    var SURGE_DECAY_RATE = 12;    // lost per second
    var SURGE_ANIM_FAST = 180;    // ms merge animation during surge
    var SURGE_ANIM_NORMAL = 320;  // ms merge animation normally

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

            if (chain.length >= MIN_MERGE) {
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

    function feedSurge() {
        surgeLevel = Math.min(100, surgeLevel + SURGE_PER_MERGE);

        if (!surgeActive && surgeLevel >= SURGE_ACTIVATE) {
            activateSurge();
        }

        if (surgeActive) {
            surgeMergeCount++;
        }

        renderSurgeBar();
        startSurgeDecay();
    }

    function activateSurge() {
        surgeActive = true;
        surgeMergeCount = 0;
        boardEl.classList.add('surge-active');
        Game.vibrate([10, 20, 10]);
        Game.emit('surgeActivated');
    }

    function deactivateSurge() {
        if (!surgeActive) return;
        surgeActive = false;
        boardEl.classList.remove('surge-active');

        // End-of-surge bonus
        if (surgeMergeCount >= 3) {
            var bonus = surgeMergeCount * 2;
            Game.addGems(bonus);
            showFloatingText(3, 2, 'Surge! +' + bonus + ' \u{1F48E}');
            showToast('\u26A1 Surge ended! ' + surgeMergeCount + ' merges \u2192 +' + bonus + ' gems');
        }

        surgeMergeCount = 0;
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
            if (label) label.textContent = 'SURGE!';
        } else if (surgeLevel > 0) {
            bar.classList.remove('surge-on');
            if (label) label.textContent = '';
        } else {
            bar.classList.remove('surge-on');
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

        if (totalCount >= MIN_MERGE) {
            executeMerge(connected, chain, tier, toRow, toCol, totalCount);
        } else {
            // Not enough — put item back
            items[fromRow][fromCol] = item;
            renderCell(fromRow, fromCol);
            Sound.playError();
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
        var nextDef = Items.getItemDef(chain, isMaxTier ? tier : nextTier);

        // Lock all involved cells
        cells.forEach(function(pos) { lockCell(pos.row, pos.col); });
        lockCell(targetRow, targetCol);

        // Feed the surge meter
        feedSurge();

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
                Game.addGems(10);
                Game.addStars(1);
                unlockCell(targetRow, targetCol);
                syncToGameState();
                return;
            }

            // Create merged item at target
            var newItem = Items.createItem(chain, nextTier);
            items[targetRow][targetCol] = newItem;
            unlockCell(targetRow, targetCol);
            renderCell(targetRow, targetCol);

            // Emit event for quest tracking
            Game.emit('itemProduced', { chain: chain, tier: nextTier });

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
            if (nextTier >= 5) {
                Sound.playCelebration();
                Game.vibrate([20, 40, 30, 40, 20]);
                emitParticlesAtCell(targetRow, targetCol, 'legendary');
                boardEl.classList.add('screen-shake');
                setTimeout(function() { boardEl.classList.remove('screen-shake'); }, 400);
            } else if (nextTier >= 3) {
                boardEl.classList.add('screen-shake');
                setTimeout(function() { boardEl.classList.remove('screen-shake'); }, 250);
            }

            // Gem rewards for high tiers
            if (nextTier >= 4) {
                Game.addGems(nextTier - 3);
                showFloatingText(targetRow, targetCol, '+' + (nextTier - 3) + ' \u{1F48E}');
            }

            // Check chain reactions after a short delay
            setTimeout(function() {
                checkChainReaction(targetRow, targetCol, 1);
            }, Math.min(delay, 200));

            syncToGameState();
        }, delay);
    }

    function checkChainReaction(row, col, depth) {
        var item = items[row][col];
        if (!item) {
            syncToGameState();
            return;
        }

        var connected = findConnected(row, col, item.chain, item.tier);
        if (connected.length >= MIN_MERGE) {
            // Chain reaction bonus — escalating rewards!
            var chainGems = depth * 5;
            var chainEnergy = Math.min(depth, 3);
            Game.addGems(chainGems);
            Game.addEnergy(chainEnergy);
            showFloatingText(row, col, 'Chain x' + depth + '! +' + chainGems + '\u{1F48E} +' + chainEnergy + '\u26A1');
            Game.emit('chainReaction', { depth: depth });

            Sound.playChain(depth);
            Game.updateStat('chainRecord', function(v) { return Math.max(v || 0, depth); });
            executeMerge(connected, item.chain, item.tier, row, col, connected.length);
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
        feedSurge();
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

    function spawnItem(chain) {
        if (!Game.useEnergy()) {
            Sound.playEnergyEmpty();
            var energyEl = document.getElementById('energy-display');
            energyEl.classList.add('shake');
            setTimeout(function() { energyEl.classList.remove('shake'); }, 500);
            return;
        }

        var empty = getRandomEmptyCell();
        if (!empty) {
            Sound.playError();
            Game.addEnergy(1); // Refund
            showToast('Board is full! Merge some items first.');
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
        var def = Items.getItemDef(chain, item.tier);
        emitParticlesAtCell(empty.row, empty.col, 'spawn', {
            color: def ? def.glow : '#FFD700'
        });

        Game.updateStat('totalSpawns', function(v) { return (v || 0) + 1; });
        Game.emit('itemSpawned', { chain: chain, tier: item.tier });

        // Check if spawn created an auto-merge
        var connected = autoMergeSuppressed ? [] : findConnected(empty.row, empty.col, item.chain, item.tier);
        if (connected.length >= MIN_MERGE) {
            // Lucky auto-merge bonus!
            var luckyGems = 2 + connected.length;
            Game.addGems(luckyGems);
            Game.addEnergy(1);
            showFloatingText(empty.row, empty.col, 'Lucky! +' + luckyGems + ' \u{1F48E} +1\u26A1');
            showToast('\u{1F340} Lucky merge! +' + luckyGems + ' gems, +1 energy');
            Game.emit('luckyMerge', { count: connected.length });
            setTimeout(function() {
                executeMerge(connected, item.chain, item.tier, empty.row, empty.col, connected.length);
            }, 400);
        } else {
            syncToGameState();
        }
    }

    // First play: place a few starter items
    function spawnStarterItems() {
        var starters = [
            { chain: 'wood', tier: 0, row: 3, col: 2 },
            { chain: 'wood', tier: 0, row: 3, col: 3 },
            { chain: 'wood', tier: 0, row: 4, col: 3 },
            { chain: 'flora', tier: 0, row: 5, col: 1 },
            { chain: 'flora', tier: 0, row: 5, col: 2 },
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
                }
            }, i * 150);
        });

        setTimeout(function() {
            syncToGameState();
        }, starters.length * 150 + 100);
    }

    // ─── RENDERING ───────────────────────────────────────────────

    function renderCell(row, col) {
        var cell = grid[row][col];
        cell.innerHTML = '';
        cell.className = 'cell';

        var item = items[row][col];
        if (!item) return;

        var def = Items.getItemDef(item.chain, item.tier);
        if (!def) return;

        var el = document.createElement('div');
        el.className = 'item ' + item.chain + ' tier-' + item.tier;
        el.style.background = 'radial-gradient(circle at 35% 35%, ' + def.bg[0] + ', ' + def.bg[1] + ')';

        if (item.tier >= 4) {
            el.style.boxShadow = '0 0 ' + (8 + item.tier * 4) + 'px ' + def.glow +
                ', inset 0 1px 2px rgba(255,255,255,0.3)';
        } else {
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.15)';
        }

        // Symbol
        var symbolEl = document.createElement('span');
        symbolEl.className = 'item-symbol';
        symbolEl.textContent = def.symbol;
        el.appendChild(symbolEl);

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

    function showToast(msg) {
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();

        var el = document.createElement('div');
        el.className = 'toast';
        el.textContent = msg;
        document.getElementById('app').appendChild(el);
        setTimeout(function() { el.classList.add('toast-show'); }, 10);
        setTimeout(function() {
            el.classList.remove('toast-show');
            setTimeout(function() { el.remove(); }, 300);
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
            if (cells.length < MIN_MERGE) return;

            // Find connected clusters within this group
            var visited = {};
            cells.forEach(function(pos) {
                var k = pos.row + ',' + pos.col;
                if (visited[k]) return;

                var item = items[pos.row][pos.col];
                if (!item) return;
                var cluster = findConnected(pos.row, pos.col, item.chain, item.tier);
                cluster.forEach(function(cp) { visited[cp.row + ',' + cp.col] = true; });

                if (cluster.length >= MIN_MERGE) {
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

        // After placing, scan for auto-merges
        setTimeout(function() {
            scanForAutoMerges();
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

                if (cluster.length >= MIN_MERGE) {
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

    return {
        init: init,
        spawnItem: spawnItem,
        spawnStarterItems: spawnStarterItems,
        setForcedSpawnTier: function(t) { forcedSpawnTier = t; },
        clearForcedSpawnTier: function() { forcedSpawnTier = null; },
        setAutoMergeSuppressed: function(v) { autoMergeSuppressed = v; },
        executeMassMatch: executeMassMatch,
        sortBoard: sortBoard,
        shuffleBoard: shuffleBoard,
        upgradeItem: upgradeItem,
        clearTierZero: clearTierZero
    };
})();
