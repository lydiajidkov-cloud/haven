// Haven - Core Game State, Energy System, Save/Load
'use strict';

const Game = (() => {
    const SAVE_KEY = 'haven_save';
    const ROWS = 8;
    const COLS = 6;
    const MAX_ENERGY = 100;
    const ENERGY_REGEN_MS = 2 * 60 * 1000; // 2 minutes

    let state = null;
    let listeners = {};
    let updateTimer = null;

    function defaultState() {
        const board = [];
        for (let r = 0; r < ROWS; r++) {
            board[r] = [];
            for (let c = 0; c < COLS; c++) {
                board[r][c] = null;
            }
        }
        return {
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
            soundEnabled: true,
            vibrationEnabled: true
        };
    }

    function init() {
        const loaded = load();
        state = loaded || defaultState();

        if (loaded) {
            state.stats.playCount = (state.stats.playCount || 0) + 1;
        }

        updateEnergy();

        // Tick every second for energy regen timer
        updateTimer = setInterval(function() {
            updateEnergy();
        }, 1000);

        emit('stateChanged', state);
        emit('energyChanged', state.energy);
        emit('gemsChanged', state.gems);
    }

    function save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Haven save failed:', e);
        }
    }

    function load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);

            // Validate basic structure
            if (!data.board || !data.stats) return null;

            // Restore item ID counter
            let maxId = 0;
            for (let r = 0; r < data.board.length; r++) {
                for (let c = 0; c < (data.board[r] || []).length; c++) {
                    const item = data.board[r][c];
                    if (item && item.id > maxId) maxId = item.id;
                }
            }
            Items.setNextId(maxId + 1);

            return data;
        } catch (e) {
            console.warn('Haven load failed:', e);
            return null;
        }
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
        state = defaultState();
        save();
        emit('stateChanged', state);
        emit('energyChanged', state.energy);
        emit('gemsChanged', state.gems);
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

    return {
        init: init,
        save: save,
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
        ROWS: ROWS,
        COLS: COLS,
        MAX_ENERGY: MAX_ENERGY,
        ENERGY_REGEN_MS: ENERGY_REGEN_MS
    };
})();
