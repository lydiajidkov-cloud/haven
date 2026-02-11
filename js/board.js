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

    // Drag state
    let dragItem = null;
    let dragFrom = null;
    let dragEl = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

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

        setupDragEvents();
        setupResourceNodes();
        Particles.init(document.getElementById('particle-canvas'));
    }

    // ─── DRAG AND DROP ───────────────────────────────────────────

    function setupDragEvents() {
        boardEl.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
    }

    function onPointerDown(e) {
        if (animating) return;
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        if (!items[r][c]) return;

        e.preventDefault();
        boardEl.setPointerCapture && boardEl.releasePointerCapture(e.pointerId);
        Sound.playTap();

        dragItem = items[r][c];
        dragFrom = { row: r, col: c };

        // Create floating drag element
        const itemEl = cell.querySelector('.item');
        if (!itemEl) return;

        const rect = itemEl.getBoundingClientRect();
        dragEl = itemEl.cloneNode(true);
        dragEl.classList.add('dragging');
        dragEl.style.cssText = 'position:fixed;z-index:1000;pointer-events:none;' +
            'width:' + rect.width + 'px;height:' + rect.height + 'px;' +
            'left:' + rect.left + 'px;top:' + rect.top + 'px;' +
            'transition:none;';
        document.body.appendChild(dragEl);

        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        // Dim source
        itemEl.classList.add('drag-source');

        // Highlight valid merge targets
        highlightTargets(dragItem);
    }

    function onPointerMove(e) {
        if (!dragEl) return;
        e.preventDefault();

        dragEl.style.left = (e.clientX - dragOffsetX) + 'px';
        dragEl.style.top = (e.clientY - dragOffsetY) + 'px';

        // Highlight cell under pointer
        clearHighlight('drag-over');
        const target = getCellAtPoint(e.clientX, e.clientY);
        if (target && !(target.row === dragFrom.row && target.col === dragFrom.col)) {
            grid[target.row][target.col].classList.add('drag-over');
        }
    }

    function onPointerUp(e) {
        if (!dragEl) return;
        e.preventDefault();

        const target = getCellAtPoint(e.clientX, e.clientY);

        // Cleanup drag visual
        dragEl.remove();
        dragEl = null;
        clearHighlight('drag-over');
        clearHighlight('valid-target');

        // Restore source visual
        const srcCell = grid[dragFrom.row][dragFrom.col];
        const srcItem = srcCell.querySelector('.item');
        if (srcItem) srcItem.classList.remove('drag-source');

        if (!target || (target.row === dragFrom.row && target.col === dragFrom.col)) {
            // Dropped on same cell or outside — cancel
            dragItem = null;
            dragFrom = null;
            return;
        }

        const tr = target.row;
        const tc = target.col;

        if (items[tr][tc] && Items.canMerge(dragItem, items[tr][tc])) {
            // Merge attempt
            attemptMerge(dragFrom.row, dragFrom.col, tr, tc);
        } else if (!items[tr][tc]) {
            // Move to empty cell
            items[tr][tc] = items[dragFrom.row][dragFrom.col];
            items[dragFrom.row][dragFrom.col] = null;
            renderCell(dragFrom.row, dragFrom.col);
            renderCell(tr, tc);
            // Pop animation on the moved item
            const movedEl = grid[tr][tc].querySelector('.item');
            if (movedEl) {
                movedEl.classList.add('spawn-in');
                setTimeout(function() { movedEl.classList.remove('spawn-in'); }, 300);
            }
            syncToGameState();
        }
        // else: different item at target — cancel silently

        dragItem = null;
        dragFrom = null;
    }

    function getCellAtPoint(x, y) {
        // Use elementFromPoint for efficiency
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        const cell = el.closest('.cell');
        if (!cell || !cell.dataset.row) return null;
        return { row: parseInt(cell.dataset.row), col: parseInt(cell.dataset.col) };
    }

    function highlightTargets(item) {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (r === dragFrom.row && c === dragFrom.col) continue;
                if (items[r][c] && Items.canMerge(item, items[r][c])) {
                    grid[r][c].classList.add('valid-target');
                }
            }
        }
    }

    function clearHighlight(cls) {
        const els = boardEl.querySelectorAll('.' + cls);
        for (let i = 0; i < els.length; i++) {
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

        var item = Items.spawnRandomItem(chain);
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
        var connected = findConnected(empty.row, empty.col, item.chain, item.tier);
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
        spawnStarterItems: spawnStarterItems
    };
})();
