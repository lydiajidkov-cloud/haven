// Haven - Core Game State, Energy System, Save/Load
'use strict';

const Game = (() => {
    const SAVE_KEY = 'haven_save';
    const BACKUP_KEY = 'haven-backup';
    const SAVE_VERSION = 6;
    const SAVE_DEBOUNCE_MS = 200;
    const QUOTA_WARN_BYTES = 4.5 * 1024 * 1024; // Warn at 4.5MB (localStorage limit ~5MB)
    const DEFAULT_ROWS = 8;
    const DEFAULT_COLS = 6;
    var ROWS = DEFAULT_ROWS;
    var COLS = DEFAULT_COLS;
    const MAX_ENERGY = 100;

    // Board expansion tiers: [rows, cols, gem cost]
    const BOARD_EXPANSIONS = [
        { rows: 9,  cols: 6, cost: 500,  label: '6\u00D79' },
        { rows: 10, cols: 6, cost: 1000, label: '6\u00D710' },
        { rows: 10, cols: 7, cost: 2000, label: '7\u00D710' }
    ];
    // Cosmetic board themes: purchasable at 300 gems each
    const BOARD_THEMES = [
        { id: 'ocean',   name: 'Ocean Depths',    icon: '\u{1F30A}', cost: 300, desc: 'Deep blue tones of the abyss' },
        { id: 'forest',  name: 'Enchanted Forest', icon: '\u{1F332}', cost: 300, desc: 'Lush green woodland hues' },
        { id: 'crystal', name: 'Crystal Cavern',   icon: '\u{1F48E}', cost: 300, desc: 'Mystical purple crystal glow' },
        { id: 'shadow',  name: 'Shadow Realm',     icon: '\u{1F311}', cost: 300, desc: 'Deep darkness with crimson accents' }
    ];

    const ENERGY_REGEN_MS = 2 * 60 * 1000; // 2 minutes

    let state = null;
    let listeners = {};
    let updateTimer = null;
    let saveTimer = null;
    let savePending = false;

    function defaultState() {
        const board = [];
        for (let r = 0; r < DEFAULT_ROWS; r++) {
            board[r] = [];
            for (let c = 0; c < DEFAULT_COLS; c++) {
                board[r][c] = null;
            }
        }
        return {
            _saveVersion: SAVE_VERSION,
            boardRows: DEFAULT_ROWS,
            boardCols: DEFAULT_COLS,
            energy: MAX_ENERGY,
            maxEnergy: MAX_ENERGY,
            lastEnergyTime: Date.now(),
            gems: 50,
            stars: 0,
            board: board,
            stats: {
                totalMerges: 0,
                highestTier: 0,
                chainRecord: 0,
                totalSpawns: 0,
                playCount: 0
            },
            firstPlay: true,
            tutorialCompletedAt: null,
            uiUnlocks: {
                // Progressive disclosure: track which UI elements have been revealed
                crystalNode: false,
                creatureNode: false,
                shopTab: false,
                achievementsBtn: false,
                surgeBar: false,
                powerupBar: false
            },
            discoveredItems: {},
            evolvedCreatures: {},
            boardTheme: null,
            ownedThemes: {},
            soundEnabled: true,
            vibrationEnabled: true
        };
    }

    function init() {
        const loaded = load();
        state = loaded || defaultState();

        // Apply dynamic board dimensions from save state
        ROWS = state.boardRows || DEFAULT_ROWS;
        COLS = state.boardCols || DEFAULT_COLS;

        if (loaded) {
            state.stats.playCount = (state.stats.playCount || 0) + 1;
        }

        updateEnergy();

        // Tick every second for energy regen timer
        updateTimer = setInterval(function() {
            updateEnergy();
        }, 1000);

        // Flush any pending save on page close/navigation
        window.addEventListener('beforeunload', function() {
            flushSave();
        });

        emit('stateChanged', state);
        emit('energyChanged', state.energy);
        emit('gemsChanged', state.gems);
    }

    // ─── SAVE SYSTEM (debounced, versioned, backed up) ──────

    function save() {
        // Debounced save: coalesces rapid save calls into one write per 200ms
        savePending = true;
        if (saveTimer) return;
        saveTimer = setTimeout(function() {
            saveTimer = null;
            flushSave();
        }, SAVE_DEBOUNCE_MS);
    }

    function flushSave() {
        if (!savePending || !state) return;
        savePending = false;
        if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
        }

        // Stamp version on every save
        state._saveVersion = SAVE_VERSION;

        try {
            var json = JSON.stringify(state);

            // Quota check: warn if approaching 5MB localStorage limit
            var totalBytes = estimateLocalStorageUsage();
            if (totalBytes + json.length * 2 > QUOTA_WARN_BYTES) {
                console.warn('Haven: localStorage approaching quota limit (' +
                    Math.round(totalBytes / 1024) + 'KB used, save is ' +
                    Math.round(json.length * 2 / 1024) + 'KB)');
                emit('saveQuotaWarning', { usedBytes: totalBytes, saveBytes: json.length * 2 });
            }

            localStorage.setItem(SAVE_KEY, json);

            // Backup to secondary key after successful primary save
            try {
                localStorage.setItem(BACKUP_KEY, json);
            } catch (backupErr) {
                console.warn('Haven backup save failed:', backupErr);
            }
        } catch (e) {
            console.warn('Haven save failed:', e);
            emit('saveFailed', { error: e });
        }
    }

    function estimateLocalStorageUsage() {
        var total = 0;
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                total += key.length * 2; // UTF-16
                total += (localStorage.getItem(key) || '').length * 2;
            }
        } catch (e) {
            // If we can't enumerate, return 0 (don't block saves)
        }
        return total;
    }

    function loadFromKey(key) {
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return null;
            var data = JSON.parse(raw);
            // Validate basic structure
            if (!data.board || !data.stats) return null;
            return data;
        } catch (e) {
            return null;
        }
    }

    function migrateState(data) {
        if (!data._saveVersion) {
            data._saveVersion = 1;
        }
        // v1 → v2: MIN_MERGE raised from 2 to 3, gem threshold from tier 3 to tier 4.
        if (data._saveVersion < 2) {
            data._saveVersion = 2;
        }
        // v2 → v3: Board expansion support. Add boardRows/boardCols if missing.
        if (data._saveVersion < 3) {
            if (!data.boardRows) data.boardRows = DEFAULT_ROWS;
            if (!data.boardCols) data.boardCols = DEFAULT_COLS;
            // Ensure board array matches declared dimensions (pad rows/cols if needed)
            while (data.board.length < data.boardRows) {
                var newRow = [];
                for (var nc = 0; nc < data.boardCols; nc++) newRow.push(null);
                data.board.push(newRow);
            }
            for (var mr = 0; mr < data.board.length; mr++) {
                while ((data.board[mr] || []).length < data.boardCols) {
                    data.board[mr].push(null);
                }
            }
            data._saveVersion = 3;
        }
        // v3 → v4: Creature evolution + cosmetic tile themes
        if (data._saveVersion < 4) {
            if (!data.evolvedCreatures) data.evolvedCreatures = {};
            if (!data.boardTheme) data.boardTheme = null;
            if (!data.ownedThemes) data.ownedThemes = {};
            data._saveVersion = 4;
        }
        // v4 → v5: Economy rebalancing (reduced login gems, island gems, energy refill cost)
        if (data._saveVersion < 5) {
            data._saveVersion = 5;
        }
        // v5 → v6: Pity timer for creature eggs (add pityCounter to hatchery state)
        if (data._saveVersion < 6) {
            if (data.hatchery && typeof data.hatchery.pityCounter !== 'number') {
                data.hatchery.pityCounter = 0;
            }
            data._saveVersion = 6;
        }
        return data;
    }

    function restoreItemIdCounter(data) {
        var maxId = 0;
        for (var r = 0; r < data.board.length; r++) {
            for (var c = 0; c < (data.board[r] || []).length; c++) {
                var item = data.board[r][c];
                if (item && item.id > maxId) maxId = item.id;
            }
        }
        Items.setNextId(maxId + 1);
    }

    function load() {
        // Try primary save first
        var data = loadFromKey(SAVE_KEY);
        if (data) {
            data = migrateState(data);
            restoreItemIdCounter(data);
            return data;
        }

        // Primary corrupted or missing — try backup
        console.warn('Haven: primary save missing or corrupted, trying backup...');
        data = loadFromKey(BACKUP_KEY);
        if (data) {
            console.warn('Haven: restored from backup successfully');
            data = migrateState(data);
            restoreItemIdCounter(data);
            // Heal primary from backup
            try {
                localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            } catch (e) { /* best-effort heal */ }
            return data;
        }

        console.warn('Haven: no valid save data found');
        return null;
    }

    function updateEnergy() {
        if (!state) return;

        if (state.energy >= state.maxEnergy) {
            state.lastEnergyTime = Date.now();
            emit('energyTimer', null);
            return;
        }

        // Apply creature passive energy regen bonus (each point = 250ms faster)
        var regenMs = ENERGY_REGEN_MS;
        if (typeof Creatures !== 'undefined' && state.hatchery && state.hatchery.discovered) {
            var bonuses = Creatures.calculatePassiveBonuses(state.hatchery.discovered);
            regenMs = Math.max(60000, ENERGY_REGEN_MS - Math.round(bonuses.energy_regen * 250));
        }
        // Event modifier: energy_regen_multiplier (e.g., Speed Demon 2x faster regen)
        if (typeof Events !== 'undefined' && Events.hasModifier('energy_regen_multiplier')) {
            regenMs = Math.max(30000, Math.floor(regenMs / Events.getModifierValue('energy_regen_multiplier')));
        }

        const now = Date.now();
        const elapsed = now - state.lastEnergyTime;
        const gained = Math.floor(elapsed / regenMs);

        if (gained > 0) {
            state.energy = Math.min(state.maxEnergy, state.energy + gained);
            state.lastEnergyTime = now - (elapsed % regenMs);
            emit('energyChanged', state.energy);
            save();
        }

        // Emit timer for UI
        if (state.energy < state.maxEnergy) {
            const msLeft = regenMs - (now - state.lastEnergyTime);
            emit('energyTimer', msLeft);
        } else {
            emit('energyTimer', null);
        }
    }

    function useEnergy() {
        if (state.energy <= 0) {
            emit('energyEmpty');
            return false;
        }
        state.energy--;
        if (state.energy === state.maxEnergy - 1) {
            // Just started regenerating
            state.lastEnergyTime = Date.now();
        }
        emit('energyChanged', state.energy);
        emit('energyUsed', {});
        if (state.energy === 10) {
            emit('energyLow');
        }
        save();
        return true;
    }

    function addEnergy(n) {
        state.energy = Math.min(state.maxEnergy, state.energy + n);
        emit('energyChanged', state.energy);
        save();
    }

    function addGems(n) {
        // Apply creature passive gem bonus
        if (n > 0 && typeof Creatures !== 'undefined' && state.hatchery && state.hatchery.discovered) {
            var bonuses = Creatures.calculatePassiveBonuses(state.hatchery.discovered);
            if (bonuses.gem_bonus > 0) {
                n = Math.round(n * (1 + bonuses.gem_bonus / 100));
            }
        }
        state.gems = (state.gems || 0) + n;
        emit('gemsChanged', state.gems);
        save();
    }

    function addStars(n) {
        state.stars = (state.stars || 0) + n;
        emit('starsChanged', state.stars);
        save();
    }

    function updateStat(key, value) {
        if (typeof value === 'function') {
            state.stats[key] = value(state.stats[key] || 0);
        } else {
            state.stats[key] = value;
        }
    }

    function vibrate(pattern) {
        if (state.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // Simple event system
    function on(event, callback) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
    }

    function off(event, callback) {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter(function(cb) { return cb !== callback; });
    }

    function emit(event, data) {
        if (!listeners[event]) return;
        for (let i = 0; i < listeners[event].length; i++) {
            listeners[event][i](data);
        }
    }

    function getState() { return state; }
    function getEnergy() { return state ? state.energy : 0; }
    function getMaxEnergy() { return state ? state.maxEnergy : MAX_ENERGY; }
    function getGems() { return state ? state.gems : 0; }
    function getStars() { return state ? state.stars : 0; }

    function resetGame() {
        ROWS = DEFAULT_ROWS;
        COLS = DEFAULT_COLS;
        state = defaultState();
        flushSave();
        emit('stateChanged', state);
        emit('energyChanged', state.energy);
        emit('gemsChanged', state.gems);
    }

    function getNextBoardExpansion() {
        for (var i = 0; i < BOARD_EXPANSIONS.length; i++) {
            var exp = BOARD_EXPANSIONS[i];
            if (ROWS < exp.rows || (ROWS === exp.rows && COLS < exp.cols)) {
                return exp;
            }
        }
        return null; // fully expanded
    }

    function purchaseBoardExpansion() {
        var exp = getNextBoardExpansion();
        if (!exp) return false;
        if (state.gems < exp.cost) return false;

        addGems(-exp.cost);

        // Update dimensions
        ROWS = exp.rows;
        COLS = exp.cols;
        state.boardRows = ROWS;
        state.boardCols = COLS;

        // Expand board array: add new rows and pad existing rows to new column count
        while (state.board.length < ROWS) {
            var newRow = [];
            for (var c = 0; c < COLS; c++) newRow.push(null);
            state.board.push(newRow);
        }
        for (var r = 0; r < state.board.length; r++) {
            while ((state.board[r] || []).length < COLS) {
                state.board[r].push(null);
            }
        }

        save();
        emit('boardExpanded', { rows: ROWS, cols: COLS });
        return true;
    }

    // ─── EXIT HOOK: "Come back" message when player leaves ──────
    // This is the single most impactful retention feature for Day 1.
    // When the player backgrounds the app or closes the tab, show them
    // a reason to return. Uses the Page Visibility API.

    function initExitHook() {
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                showExitHookIfNeeded();
            }
        });
    }

    function showExitHookIfNeeded() {
        if (!state) return;
        // Only show for players who have completed the tutorial
        if (state.firstPlay) return;
        // Don't show if player just started (< 60s in session)
        if (state.tutorialCompletedAt && (Date.now() - state.tutorialCompletedAt < 60000)) return;

        // Calculate what they will gain by returning
        var energyDeficit = state.maxEnergy - state.energy;
        if (energyDeficit <= 0) return; // No reason to show if energy is full

        var minutesToFull = Math.ceil(energyDeficit * (ENERGY_REGEN_MS / 60000));
        var hoursToFull = Math.floor(minutesToFull / 60);
        var minsRemaining = minutesToFull % 60;

        var timeStr = '';
        if (hoursToFull > 0) {
            timeStr = hoursToFull + 'h ' + minsRemaining + 'm';
        } else {
            timeStr = minsRemaining + ' min';
        }

        // Use the document title as a lightweight "notification"
        // This shows in the browser tab and in recent apps on mobile
        document.title = 'Haven - Energy full in ' + timeStr + '!';

        // Restore title when they come back
        var restoreTitle = function() {
            document.title = 'Haven';
            document.removeEventListener('visibilitychange', restoreTitle);
        };
        document.addEventListener('visibilitychange', function handler() {
            if (document.visibilityState === 'visible') {
                restoreTitle();
                document.removeEventListener('visibilitychange', handler);
            }
        });
    }

    // ─── BOARD THEMES ─────────────────────────────────────────

    function purchaseBoardTheme(themeId) {
        var theme = null;
        for (var i = 0; i < BOARD_THEMES.length; i++) {
            if (BOARD_THEMES[i].id === themeId) { theme = BOARD_THEMES[i]; break; }
        }
        if (!theme) return false;
        if (state.ownedThemes && state.ownedThemes[themeId]) return false; // already owned
        if (state.gems < theme.cost) return false;

        addGems(-theme.cost);
        if (!state.ownedThemes) state.ownedThemes = {};
        state.ownedThemes[themeId] = { purchasedAt: Date.now() };
        state.boardTheme = themeId;
        save();
        emit('boardThemeChanged', themeId);
        return true;
    }

    function setBoardTheme(themeId) {
        // themeId can be null (default) or an owned theme
        if (themeId && !(state.ownedThemes && state.ownedThemes[themeId])) return false;
        state.boardTheme = themeId;
        save();
        emit('boardThemeChanged', themeId);
        return true;
    }

    function getBoardTheme() {
        return state ? state.boardTheme : null;
    }

    function getOwnedThemes() {
        return (state && state.ownedThemes) || {};
    }

    var exports = {
        init: init,
        save: save,
        flushSave: flushSave,
        resetGame: resetGame,
        useEnergy: useEnergy,
        addEnergy: addEnergy,
        addGems: addGems,
        addStars: addStars,
        updateStat: updateStat,
        vibrate: vibrate,
        on: on,
        off: off,
        emit: emit,
        getState: getState,
        getEnergy: getEnergy,
        getMaxEnergy: getMaxEnergy,
        getGems: getGems,
        getStars: getStars,
        initExitHook: initExitHook,
        MAX_ENERGY: MAX_ENERGY,
        ENERGY_REGEN_MS: ENERGY_REGEN_MS,
        SAVE_VERSION: SAVE_VERSION,
        DEFAULT_ROWS: DEFAULT_ROWS,
        DEFAULT_COLS: DEFAULT_COLS,
        BOARD_EXPANSIONS: BOARD_EXPANSIONS,
        getNextBoardExpansion: getNextBoardExpansion,
        purchaseBoardExpansion: purchaseBoardExpansion,
        BOARD_THEMES: BOARD_THEMES,
        purchaseBoardTheme: purchaseBoardTheme,
        setBoardTheme: setBoardTheme,
        getBoardTheme: getBoardTheme,
        getOwnedThemes: getOwnedThemes
    };

    // ROWS and COLS are dynamic (change on board expansion), so use getters
    Object.defineProperty(exports, 'ROWS', { get: function() { return ROWS; } });
    Object.defineProperty(exports, 'COLS', { get: function() { return COLS; } });

    return exports;
})();
