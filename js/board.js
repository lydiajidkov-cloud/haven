// Haven - Merge Board: Grid, Spawning, Drag-Merge, Chain Reactions
'use strict';

const Board = (() => {
    const ROWS = Game.ROWS;
    const COLS = Game.COLS;
    const MIN_MERGE = 2;

    let boardEl, containerEl;
    let grid = [];   // DOM elements [row][col]
    let items = [];  // Item data [row][col] or null
    let animating = false;

    // Tutorial overrides
    var forcedSpawnTier = null;
    var autoMergeSuppressed = false;

    // Interaction state (tap-to-select + drag fallback)
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
    }

    // ─── TAP-TO-SELECT + DRAG ─────────────────────────────────────

    function setupPointerEvents() {
        boardEl.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
    }

    function onPointerDown(e) {
        if (animating) return;
        var cell = e.target.closest('.cell');
        if (!cell) return;

        var r = parseInt(cell.dataset.row);
        var c = parseInt(cell.dataset.col);
        e.preventDefault();

        // If we already have a selection, handle the second tap
        if (selectedPos) {
            handleTapWithSelection(r, c);
            return;
        }

        // Nothing selected — need an item to interact with
        if (!items[r][c]) return;

        Sound.playTap();
        dragItem = items[r][c];
        dragFrom = { row: r, col: c };
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStarted = false;

        boardEl.setPointerCapture && boardEl.releasePointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
        if (!dragFrom || !dragItem) return;

        // Check if we've moved enough to start a drag
        if (!dragStarted) {
            var dx = e.clientX - dragStartX;
            var dy = e.clientY - dragStartY;
            if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
            dragStarted = true;
            clearSelection();
            startDragVisual(e);
        }

        e.preventDefault();
        dragEl.style.left = (e.clientX - dragOffsetX) + 'px';
        dragEl.style.top = (e.clientY - dragOffsetY) + 'px';

        // Highlight cell under pointer
        clearHighlight('drag-over');
        var target = getCellAtPoint(e.clientX, e.clientY);
        if (target && !(target.row === dragFrom.row && target.col === dragFrom.col)) {
            grid[target.row][target.col].classList.add('drag-over');
        }
    }

    function onPointerUp(e) {
        if (!dragFrom) return;
        e.preventDefault();

        if (!dragStarted) {
            // It was a TAP — select the item
            selectItem(dragFrom.row, dragFrom.col);
            dragItem = null;
            dragFrom = null;
            return;
        }

        // It was a DRAG — complete it
        var target = getCellAtPoint(e.clientX, e.clientY);

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
            'transition:none;opacity:0.85;';
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

    function getCellAtPoint(x, y) {
        var el = document.elementFromPoint(x, y);
        if (!el) return null;
        var cell = el.closest('.cell');
        if (!cell || !cell.dataset.row) return null;
        return { row: parseInt(cell.dataset.row), col: parseInt(cell.dataset.col) };
    }

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
        animating = true;
        const nextTier = tier + 1;
        const isMaxTier = !Items.hasNextTier(chain, tier);
        const isBigMerge = totalCount >= 5;
        const nextDef = Items.getItemDef(chain, isMaxTier ? tier : nextTier);

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

        // Sound + haptic
        Sound.playMerge(tier);
        Game.vibrate(tier >= 4 ? [15, 30, 25] : [10]);

        // After flash, execute
        setTimeout(function() {
            // Remove all merging items
            cells.forEach(function(pos) {
                items[pos.row][pos.col] = null;
                grid[pos.row][pos.col].classList.remove('merging');
                renderCell(pos.row, pos.col);
            });

            if (isMaxTier) {
                // Already at max tier — special celebration, give rewards
                Sound.playCelebration();
                Game.vibrate([20, 40, 30, 40, 20]);
                emitParticlesAtCell(targetRow, targetCol, 'legendary');
                Game.addGems(10);
                Game.addStars(1);
                animating = false;
                syncToGameState();
                return;
            }

            // Create merged item at target
            const newItem = Items.createItem(chain, nextTier);
            items[targetRow][targetCol] = newItem;
            renderCell(targetRow, targetCol);

            // Emit event for quest tracking
            Game.emit('itemProduced', { chain: chain, tier: nextTier });

            // Pop animation
            const newEl = grid[targetRow][targetCol].querySelector('.item');
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
                const empty = getRandomEmptyCell();
                if (empty) {
                    const bonus = Items.createItem(chain, nextTier);
                    items[empty.row][empty.col] = bonus;
                    renderCell(empty.row, empty.col);
                    const bonusEl = grid[empty.row][empty.col].querySelector('.item');
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
            }, 250);
        }, 350);
    }

    function checkChainReaction(row, col, depth) {
        const item = items[row][col];
        if (!item) {
            animating = false;
            syncToGameState();
            return;
        }

        const connected = findConnected(row, col, item.chain, item.tier);
        if (connected.length >= MIN_MERGE) {
            // Chain reaction!
            Sound.playChain(depth);
            Game.updateStat('chainRecord', function(v) { return Math.max(v || 0, depth); });
            executeMerge(connected, item.chain, item.tier, row, col, connected.length);
        } else {
            animating = false;
            syncToGameState();
        }
    }

    // ─── CROSS-CHAIN MERGE ───────────────────────────────────────

    function executeCrossChainMerge(fromRow, fromCol, toRow, toCol, recipe) {
        animating = true;

        // Flash both cells
        grid[fromRow][fromCol].classList.add('merging');
        grid[toRow][toCol].classList.add('merging');

        Sound.playMerge(recipe.tier + 2);
        Game.vibrate([15, 30, 15]);

        Game.updateStat('totalMerges', function(v) { return (v || 0) + 1; });
        Game.emit('mergeCompleted', { chain: recipe.chain, tier: recipe.tier, count: 2, crossChain: true });

        setTimeout(function() {
            // Remove both source items
            items[fromRow][fromCol] = null;
            items[toRow][toCol] = null;
            grid[fromRow][fromCol].classList.remove('merging');
            grid[toRow][toCol].classList.remove('merging');
            renderCell(fromRow, fromCol);

            // Place hybrid result
            var newItem = Items.createItem(recipe.chain, recipe.tier);
            items[toRow][toCol] = newItem;
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

            animating = false;
            syncToGameState();
        }, 350);
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
        if (animating) return;

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

        var item = (forcedSpawnTier !== null)
            ? Items.createItem(chain, forcedSpawnTier)
            : Items.spawnRandomItem(chain);
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

    return {
        init: init,
        spawnItem: spawnItem,
        spawnStarterItems: spawnStarterItems,
        setForcedSpawnTier: function(t) { forcedSpawnTier = t; },
        clearForcedSpawnTier: function() { forcedSpawnTier = null; },
        setAutoMergeSuppressed: function(v) { autoMergeSuppressed = v; }
    };
})();
