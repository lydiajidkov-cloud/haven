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

        const now = Date.now();
        const elapsed = now - state.lastEnergyTime;
        const gained = Math.floor(elapsed / ENERGY_REGEN_MS);

        if (gained > 0) {
            state.energy = Math.min(state.maxEnergy, state.energy + gained);
            state.lastEnergyTime = now - (elapsed % ENERGY_REGEN_MS);
            emit('energyChanged', state.energy);
            save();
        }

        // Emit timer for UI
        if (state.energy < state.maxEnergy) {
            const msLeft = ENERGY_REGEN_MS - (now - state.lastEnergyTime);
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
        save();
        return true;
    }

    function addEnergy(n) {
        state.energy = Math.min(state.maxEnergy, state.energy + n);
        emit('energyChanged', state.energy);
        save();
    }

    function addGems(n) {
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
        ROWS: ROWS,
        COLS: COLS,
        MAX_ENERGY: MAX_ENERGY,
        ENERGY_REGEN_MS: ENERGY_REGEN_MS
    };
})();
