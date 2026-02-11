// Haven - Island Map: Areas, Creatures, Story Fragments
'use strict';

const Island = (() => {
    // 12 island areas with creatures and story
    const areas = [
        {
            id: 'coral-shore',    name: 'Coral Shore',    stars: 2,
            pos: { x: 30, y: 82 }, color: '#4ECDC4',
            creature: { name: 'Lumina', species: 'Seahorse', emoji: '🐟', desc: 'A gentle seahorse that glows with bioluminescent light. She guides lost creatures back to the island.' },
            story: 'The island was once a thriving refuge for magical creatures. When the storms came, they scattered across the sea...'
        },
        {
            id: 'sandy-beach',    name: 'Sandy Beach',    stars: 4,
            pos: { x: 55, y: 85 }, color: '#F5D6A0',
            creature: { name: 'Shelby', species: 'Sea Turtle', emoji: '🐢', desc: 'A wise turtle who remembers the island before the storms. Her shell is etched with ancient maps.' },
            story: 'The beaches were the first to recover. Shelby returned here year after year, waiting patiently for the magic to come back.'
        },
        {
            id: 'tide-pools',     name: 'Tide Pools',     stars: 6,
            pos: { x: 75, y: 78 }, color: '#77AADD',
            creature: { name: 'Coral', species: 'Hermit Crab', emoji: '🦀', desc: 'A curious crab who collects magical crystals in an ever-growing shell of treasures.' },
            story: 'The tide pools hold remnants of the island\'s magic — crystals that pulse faintly with forgotten power.'
        },
        {
            id: 'harbor',         name: 'Old Harbor',     stars: 9,
            pos: { x: 18, y: 68 }, color: '#8B7355',
            creature: { name: 'Captain', species: 'Pelican', emoji: '🐦', desc: 'A weathered pelican who once ferried messages between the islands. Now he watches the horizon, hoping.' },
            story: 'Ships once docked here from distant lands. The harbor master kept a logbook of every creature that called Haven home.'
        },
        {
            id: 'pine-forest',    name: 'Pine Forest',    stars: 13,
            pos: { x: 25, y: 48 }, color: '#2D5F2D',
            creature: { name: 'Whisper', species: 'Deer', emoji: '🦌', desc: 'A graceful deer whose antlers grow tiny crystals. She can hear the island\'s heartbeat in the trees.' },
            story: 'The ancient pines remember everything. Their roots connect the whole island in a web of living memory.'
        },
        {
            id: 'meadow',         name: 'Sunlit Meadow',  stars: 17,
            pos: { x: 50, y: 52 }, color: '#98D87E',
            creature: { name: 'Bloom', species: 'Butterfly', emoji: '🦋', desc: 'A butterfly whose wings shimmer with every colour. Where she flies, flowers bloom in her wake.' },
            story: 'The meadow was the heart of celebrations. Creatures gathered here to share stories under the stars.'
        },
        {
            id: 'flower-fields',  name: 'Flower Fields',  stars: 22,
            pos: { x: 72, y: 55 }, color: '#FF97B5',
            creature: { name: 'Petal', species: 'Fox', emoji: '🦊', desc: 'A playful fox with a flower crown that never wilts. She tends the fields with tireless joy.' },
            story: 'The Flower Fields are where Haven\'s magic is most visible — flora that grows in impossible colours and patterns.'
        },
        {
            id: 'rocky-shore',    name: 'Rocky Shore',    stars: 27,
            pos: { x: 10, y: 38 }, color: '#708090',
            creature: { name: 'Boulder', species: 'Bear', emoji: '🐻', desc: 'A gentle giant who sculpts the rocks into shelters. His stone carvings tell the island\'s history.' },
            story: 'The rocks along this shore are carved with symbols — a language that predates any creature\'s memory.'
        },
        {
            id: 'crystal-cave',   name: 'Crystal Cave',   stars: 33,
            pos: { x: 35, y: 30 }, color: '#9B88FF',
            creature: { name: 'Prism', species: 'Dragon', emoji: '🐉', desc: 'A small dragon who breathes not fire but light. His crystals amplify the island\'s fading magic.' },
            story: 'Deep within the cave, crystals still pulse with the old magic. Prism guards them, keeping the light alive.'
        },
        {
            id: 'cloud-nest',     name: 'Cloud Nest',     stars: 40,
            pos: { x: 65, y: 32 }, color: '#B0C4DE',
            creature: { name: 'Zephyr', species: 'Eagle', emoji: '🦅', desc: 'A majestic eagle who rides the winds between worlds. She brought the first creatures to Haven long ago.' },
            story: 'From the Cloud Nest, you can see the whole island — and beyond it, the faint shimmer of other havens, waiting.'
        },
        {
            id: 'misty-peak',     name: 'Misty Peak',     stars: 48,
            pos: { x: 45, y: 18 }, color: '#C8A8E8',
            creature: { name: 'Aurora', species: 'Phoenix', emoji: '🔥', desc: 'A radiant phoenix who rises with the dawn. Her song can heal the island\'s deepest wounds.' },
            story: 'At the peak, the veil between the magical and mundane grows thin. Aurora\'s fire is the island\'s beating heart.'
        },
        {
            id: 'ancient-ruins',  name: 'Ancient Ruins',  stars: 60,
            pos: { x: 48, y: 8 }, color: '#FFD700',
            creature: { name: 'Haven Guardian', species: 'Spirit', emoji: '✨', desc: 'The ancient spirit of Haven itself. She remembers the island\'s creation and guards its future.' },
            story: 'In the ruins, the truth is revealed: Haven was created as a sanctuary for all magical creatures. And now, you are its new guardian.'
        },
    ];

    let unlockedAreas = {};
    let selectedArea = null;

    function init() {
        var state = Game.getState();
        if (state.island && state.island.unlocked) {
            unlockedAreas = state.island.unlocked;
        } else {
            unlockedAreas = {};
        }

        Game.on('starsChanged', function() { renderIslandMap(); });
        Game.on('questCompleted', function() { renderIslandMap(); });

        renderIslandMap();
    }

    function unlockArea(areaId) {
        var area = areas.find(function(a) { return a.id === areaId; });
        if (!area) return false;
        if (unlockedAreas[areaId]) return false;
        if (Game.getStars() < area.stars) return false;

        unlockedAreas[areaId] = { unlockedAt: Date.now() };
        saveIslandState();

        Sound.playCelebration();
        Game.vibrate([20, 40, 30, 40, 20]);

        renderIslandMap();
        showAreaReveal(area);
        return true;
    }

    function getRestorationPercent() {
        var unlocked = Object.keys(unlockedAreas).length;
        return Math.round((unlocked / areas.length) * 100);
    }

    function getCreatureCount() {
        return Object.keys(unlockedAreas).length;
    }

    // ─── RENDERING ───────────────────────────────────────────

    function renderIslandMap() {
        var map = document.getElementById('island-map');
        if (!map) return;

        var stars = Game.getStars();
        var pct = getRestorationPercent();

        // Stats bar
        var statsEl = document.getElementById('island-stats');
        if (statsEl) {
            statsEl.innerHTML =
                '<span class="island-stat">🏝️ ' + pct + '% Restored</span>' +
                '<span class="island-stat">⭐ ' + stars + ' Stars</span>' +
                '<span class="island-stat">🐾 ' + getCreatureCount() + '/' + areas.length + ' Creatures</span>';
        }

        // Render areas
        map.innerHTML = '';

        // Water background (island outline)
        var waterEl = document.createElement('div');
        waterEl.className = 'island-water';
        map.appendChild(waterEl);

        // Island landmass
        var landEl = document.createElement('div');
        landEl.className = 'island-land';
        map.appendChild(landEl);

        for (var i = 0; i < areas.length; i++) {
            var area = areas[i];
            var isUnlocked = !!unlockedAreas[area.id];
            var canUnlock = !isUnlocked && stars >= area.stars;

            var areaEl = document.createElement('div');
            areaEl.className = 'island-area' +
                (isUnlocked ? ' unlocked' : ' locked') +
                (canUnlock ? ' can-unlock' : '');
            areaEl.style.left = area.pos.x + '%';
            areaEl.style.top = area.pos.y + '%';

            if (isUnlocked) {
                areaEl.style.borderColor = area.color;
                areaEl.style.background = 'radial-gradient(circle, ' + area.color + '33, ' + area.color + '11)';
            }

            var inner = '';
            if (isUnlocked) {
                inner =
                    '<span class="area-creature">' + area.creature.emoji + '</span>' +
                    '<span class="area-name">' + area.name + '</span>';
            } else if (canUnlock) {
                inner =
                    '<span class="area-lock">🔓</span>' +
                    '<span class="area-name">' + area.name + '</span>' +
                    '<span class="area-cost">⭐ ' + area.stars + '</span>';
            } else {
                inner =
                    '<span class="area-lock">🔒</span>' +
                    '<span class="area-name">' + area.name + '</span>' +
                    '<span class="area-cost">⭐ ' + area.stars + '</span>';
            }

            areaEl.innerHTML = inner;
            areaEl.dataset.areaId = area.id;

            (function(a, el, unlocked, canUn) {
                el.addEventListener('click', function() {
                    if (unlocked) {
                        showAreaDetail(a);
                    } else if (canUn) {
                        unlockArea(a.id);
                    } else {
                        showAreaLocked(a);
                    }
                });
            })(area, areaEl, isUnlocked, canUnlock);

            map.appendChild(areaEl);
        }
    }

    function showAreaDetail(area) {
        var modal = document.getElementById('island-modal');
        if (!modal) return;

        modal.innerHTML =
            '<div class="island-modal-card">' +
                '<div class="modal-creature-emoji">' + area.creature.emoji + '</div>' +
                '<h3>' + area.creature.name + '</h3>' +
                '<p class="modal-species">' + area.creature.species + '</p>' +
                '<p class="modal-desc">' + area.creature.desc + '</p>' +
                '<div class="modal-divider"></div>' +
                '<p class="modal-story">"' + area.story + '"</p>' +
                '<button class="modal-close-btn">Close</button>' +
            '</div>';

        modal.classList.remove('hidden');
        modal.querySelector('.modal-close-btn').addEventListener('click', function() {
            modal.classList.add('hidden');
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.add('hidden');
        });

        Sound.playTap();
    }

    function showAreaLocked(area) {
        var modal = document.getElementById('island-modal');
        if (!modal) return;

        var needed = area.stars - Game.getStars();

        modal.innerHTML =
            '<div class="island-modal-card locked-card">' +
                '<div class="modal-creature-emoji">🔒</div>' +
                '<h3>' + area.name + '</h3>' +
                '<p class="modal-desc">This area is still shrouded in mist.</p>' +
                '<p class="modal-cost">Need ⭐ ' + area.stars + ' stars (' + needed + ' more)</p>' +
                '<p class="modal-hint">Complete quests to earn stars!</p>' +
                '<button class="modal-close-btn">Close</button>' +
            '</div>';

        modal.classList.remove('hidden');
        modal.querySelector('.modal-close-btn').addEventListener('click', function() {
            modal.classList.add('hidden');
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    function showAreaReveal(area) {
        var modal = document.getElementById('island-modal');
        if (!modal) return;

        modal.innerHTML =
            '<div class="island-modal-card reveal-card">' +
                '<div class="modal-reveal-badge">New Area Restored!</div>' +
                '<div class="modal-creature-emoji reveal-creature">' + area.creature.emoji + '</div>' +
                '<h3>' + area.creature.name + ' discovered!</h3>' +
                '<p class="modal-species">' + area.creature.species + ' of ' + area.name + '</p>' +
                '<p class="modal-desc">' + area.creature.desc + '</p>' +
                '<div class="modal-divider"></div>' +
                '<p class="modal-story">"' + area.story + '"</p>' +
                '<button class="modal-close-btn">Amazing!</button>' +
            '</div>';

        modal.classList.remove('hidden');
        modal.querySelector('.modal-close-btn').addEventListener('click', function() {
            modal.classList.add('hidden');
        });
    }

    function saveIslandState() {
        var state = Game.getState();
        state.island = {
            unlocked: unlockedAreas
        };
        Game.save();
    }

    return {
        init: init,
        unlockArea: unlockArea,
        getRestorationPercent: getRestorationPercent,
        getCreatureCount: getCreatureCount,
        areas: areas,
        renderIslandMap: renderIslandMap
    };
})();
