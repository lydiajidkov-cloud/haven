// Haven - Power-Ups System: Definitions, Inventory, Activation, UI
'use strict';

var PowerUps = (function() {
    // ─── DEFINITIONS ──────────────────────────────────────────────
    var POWER_UPS = {
        mass_match: {
            name: 'Mass Match',
            icon: '\u{1F4A5}',
            desc: 'All items of one chain at same tier merge simultaneously',
            cost: 30,
            earnEvent: 'mergeCompleted',
            earnThreshold: 60
        },
        sort_sweep: {
            name: 'Sort & Sweep',
            icon: '\u{1F9F9}',
            desc: 'Group items by chain, then auto-merge new matches',
            cost: 25,
            earnEvent: 'itemSpawned',
            earnThreshold: 100
        },
        shuffle: {
            name: 'Shuffle',
            icon: '\u{1F500}',
            desc: 'Randomize all positions — may create lucky adjacencies',
            cost: 15,
            earnEvent: null,
            earnThreshold: Infinity
        },
        upgrade_wand: {
            name: 'Upgrade Wand',
            icon: '\u{1FA84}',
            desc: 'Tap any item to promote it +1 tier instantly',
            cost: 40,
            earnEvent: 'mergeCompleted',
            earnThreshold: 80
        },
        lightning: {
            name: 'Lightning',
            icon: '\u26A1',
            desc: 'Destroy all tier-0 items, +1 gem per destroyed item',
            cost: 15,
            earnEvent: 'itemSpawned',
            earnThreshold: 50
        },
        golden_spawn: {
            name: 'Golden Spawn',
            icon: '\u{1F31F}',
            desc: 'Next 3 spawns guaranteed tier 2-3',
            cost: 60,
            earnEvent: 'mergeCompleted',
            earnThreshold: 150
        }
    };

    var POWER_UP_ORDER = ['mass_match', 'sort_sweep', 'shuffle', 'upgrade_wand', 'lightning', 'golden_spawn'];

    // ─── STATE ────────────────────────────────────────────────────
    var inventory = {};      // { mass_match: 2, shuffle: 1, ... }
    var earnProgress = {};   // { mass_match: 12, ... } progress toward free earn
    var activeEffect = null; // 'upgrade_wand' when in target mode
    var goldenSpawnCount = 0; // remaining golden spawns

    // ─── INIT / SAVE / LOAD ───────────────────────────────────────

    function init() {
        var state = Game.getState();
        if (state.powerups) {
            inventory = state.powerups.inventory || {};
            earnProgress = state.powerups.earnProgress || {};
            goldenSpawnCount = state.powerups.goldenSpawnCount || 0;
        }

        // Ensure all keys exist
        for (var i = 0; i < POWER_UP_ORDER.length; i++) {
            var key = POWER_UP_ORDER[i];
            if (!inventory[key]) inventory[key] = 0;
            if (!earnProgress[key]) earnProgress[key] = 0;
        }

        // Listen for earn events
        Game.on('mergeCompleted', function() { trackEarn('mergeCompleted'); });
        Game.on('itemSpawned', function() { trackEarn('itemSpawned'); });

        renderBar();
        saveState();
    }

    function saveState() {
        var state = Game.getState();
        state.powerups = {
            inventory: inventory,
            earnProgress: earnProgress,
            goldenSpawnCount: goldenSpawnCount
        };
        Game.save();
    }

    // ─── FREE EARN TRACKING ───────────────────────────────────────

    function trackEarn(eventType) {
        var earned = false;
        for (var i = 0; i < POWER_UP_ORDER.length; i++) {
            var key = POWER_UP_ORDER[i];
            var def = POWER_UPS[key];
            if (def.earnEvent !== eventType) continue;

            earnProgress[key] = (earnProgress[key] || 0) + 1;
            if (earnProgress[key] >= def.earnThreshold) {
                earnProgress[key] = 0;
                inventory[key] = (inventory[key] || 0) + 1;
                earned = true;
                showEarnToast(def);
            }
        }
        if (earned) {
            saveState();
            renderBar();
        }
    }

    function showEarnToast(def) {
        var el = document.createElement('div');
        el.className = 'toast';
        el.textContent = def.icon + ' Free ' + def.name + ' earned!';
        document.getElementById('app').appendChild(el);
        setTimeout(function() { el.classList.add('toast-show'); }, 10);
        setTimeout(function() {
            el.classList.remove('toast-show');
            setTimeout(function() { el.remove(); }, 300);
        }, 2000);
    }

    // ─── ACTIVATION ───────────────────────────────────────────────

    function activate(key) {
        var def = POWER_UPS[key];
        if (!def) return;

        var count = inventory[key] || 0;

        // If none owned, offer gem purchase
        if (count <= 0) {
            if (Game.getGems() < def.cost) {
                Sound.playError();
                return;
            }
            if (!confirm('Use ' + def.cost + '\u{1F48E} for ' + def.name + '?')) return;
            Game.addGems(-def.cost);
        } else {
            inventory[key] = count - 1;
        }

        Sound.playPowerUp(key);

        // Execute the power-up effect
        switch (key) {
            case 'mass_match':
                Board.executeMassMatch();
                break;
            case 'sort_sweep':
                Board.sortBoard();
                break;
            case 'shuffle':
                Board.shuffleBoard();
                break;
            case 'upgrade_wand':
                enterTargetMode('upgrade_wand');
                saveState();
                renderBar();
                return; // Don't save/render yet — waiting for tap
            case 'lightning':
                Board.clearTierZero();
                break;
            case 'golden_spawn':
                goldenSpawnCount = 3;
                highlightResourceNodes(true);
                break;
        }

        Game.emit('powerupUsed', { type: key });
        saveState();
        renderBar();
    }

    // ─── TARGET MODE (Upgrade Wand) ──────────────────────────────

    function enterTargetMode(type) {
        activeEffect = type;
        document.getElementById('board').classList.add('target-mode');
        var btn = document.querySelector('.powerup-btn[data-power="' + type + '"]');
        if (btn) btn.classList.add('powerup-active-btn');
        renderBar();
    }

    function exitTargetMode() {
        activeEffect = null;
        document.getElementById('board').classList.remove('target-mode');
        var btn = document.querySelector('.powerup-btn.powerup-active-btn');
        if (btn) btn.classList.remove('powerup-active-btn');
        renderBar();
    }

    function getActivePowerUp() {
        return activeEffect;
    }

    function onTargetCellTapped(row, col) {
        if (activeEffect === 'upgrade_wand') {
            Board.upgradeItem(row, col);
            Game.emit('powerupUsed', { type: 'upgrade_wand' });
            exitTargetMode();
            saveState();
            renderBar();
            return true;
        }
        return false;
    }

    // ─── GOLDEN SPAWN ─────────────────────────────────────────────

    function isGoldenSpawnActive() {
        return goldenSpawnCount > 0;
    }

    function consumeGoldenSpawn() {
        if (goldenSpawnCount > 0) {
            goldenSpawnCount--;
            if (goldenSpawnCount <= 0) {
                highlightResourceNodes(false);
            }
            saveState();
            renderBar();
        }
    }

    function highlightResourceNodes(on) {
        var nodes = document.querySelectorAll('.node');
        for (var i = 0; i < nodes.length; i++) {
            if (on) {
                nodes[i].classList.add('golden-glow');
            } else {
                nodes[i].classList.remove('golden-glow');
            }
        }
    }

    // ─── INVENTORY MANAGEMENT ─────────────────────────────────────

    function addToInventory(key, amount) {
        if (!POWER_UPS[key]) return;
        inventory[key] = (inventory[key] || 0) + (amount || 1);
        saveState();
        renderBar();
    }

    function getCount(key) {
        return inventory[key] || 0;
    }

    function getDef(key) {
        return POWER_UPS[key] || null;
    }

    // ─── UI RENDERING ─────────────────────────────────────────────

    function renderBar() {
        var bar = document.getElementById('powerup-bar');
        if (!bar) return;

        bar.innerHTML = '';

        for (var i = 0; i < POWER_UP_ORDER.length; i++) {
            var key = POWER_UP_ORDER[i];
            var def = POWER_UPS[key];
            var count = inventory[key] || 0;

            var btn = document.createElement('button');
            btn.className = 'powerup-btn';
            btn.dataset.power = key;
            btn.title = def.name + ': ' + def.desc;

            if (activeEffect === key) {
                btn.classList.add('powerup-active-btn');
            }

            // Icon
            var iconSpan = document.createElement('span');
            iconSpan.className = 'powerup-icon';
            iconSpan.textContent = def.icon;
            btn.appendChild(iconSpan);

            // Count badge (if owned)
            if (count > 0) {
                var badge = document.createElement('span');
                badge.className = 'powerup-badge';
                badge.textContent = count;
                btn.appendChild(badge);
            }

            // Cost label (shown when count is 0)
            if (count <= 0) {
                var costLabel = document.createElement('span');
                costLabel.className = 'powerup-cost';
                costLabel.textContent = def.cost + '\u{1F48E}';
                btn.appendChild(costLabel);
            }

            // Golden spawn counter
            if (key === 'golden_spawn' && goldenSpawnCount > 0) {
                btn.classList.add('powerup-effect-active');
                var gsCounter = document.createElement('span');
                gsCounter.className = 'powerup-badge powerup-badge-active';
                gsCounter.textContent = goldenSpawnCount;
                btn.appendChild(gsCounter);
            }

            (function(k) {
                btn.addEventListener('click', function() {
                    activate(k);
                });
            })(key);

            bar.appendChild(btn);
        }
    }

    // ─── PUBLIC API ───────────────────────────────────────────────

    return {
        init: init,
        renderBar: renderBar,
        getActivePowerUp: getActivePowerUp,
        onTargetCellTapped: onTargetCellTapped,
        exitTargetMode: exitTargetMode,
        isGoldenSpawnActive: isGoldenSpawnActive,
        consumeGoldenSpawn: consumeGoldenSpawn,
        addToInventory: addToInventory,
        getCount: getCount,
        getDef: getDef,
        POWER_UPS: POWER_UPS,
        POWER_UP_ORDER: POWER_UP_ORDER
    };
})();
