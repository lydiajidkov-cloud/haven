// Haven - Hatchery: Creature Collection & Discovery System
'use strict';

var Hatchery = (function() {

    // ─── CREATURE POOL ──────────────────────────────────────────
    // Each creature has: id, name, species, emoji, desc, rarity
    // Rarities: common (60%), uncommon (25%), rare (12%), legendary (3%)

    var creatures = [
        // Common
        { id: 'sparky',   name: 'Sparky',   species: 'Firefly',     emoji: '\u{1F41B}', rarity: 'common',    desc: 'A tiny firefly whose light flickers with excitement. She loves to dance around freshly merged items.' },
        { id: 'nibbles',  name: 'Nibbles',  species: 'Rabbit',      emoji: '\u{1F430}', rarity: 'common',    desc: 'A fluffy rabbit who collects tiny crystals in her burrow. She claims they sing to her at night.' },
        { id: 'puddles',  name: 'Puddles',  species: 'Frog',        emoji: '\u{1F438}', rarity: 'common',    desc: 'A cheerful frog who splashes in magical puddles. Each splash creates tiny rainbows.' },
        { id: 'dusty',    name: 'Dusty',    species: 'Mouse',       emoji: '\u{1F42D}', rarity: 'common',    desc: 'A curious mouse who maps the island\'s hidden tunnels. His whiskers twitch near magic.' },
        { id: 'chirp',    name: 'Chirp',    species: 'Cricket',     emoji: '\u{1F997}', rarity: 'common',    desc: 'A musical cricket whose songs make flowers bloom faster. He performs nightly concerts.' },
        { id: 'wisp',     name: 'Wisp',     species: 'Moth',        emoji: '\u{1FAB6}', rarity: 'common',    desc: 'A gentle moth drawn to magical light. Her wings shimmer with stardust patterns.' },

        // Uncommon
        { id: 'ember',    name: 'Ember',    species: 'Salamander',  emoji: '\u{1F98E}', rarity: 'uncommon',  desc: 'A warm salamander who keeps the island cozy. Her tail glows like a tiny campfire.' },
        { id: 'frost',    name: 'Frost',    species: 'Snow Owl',    emoji: '\u{1F989}', rarity: 'uncommon',  desc: 'A wise owl with feathers like fresh snow. She sees magic invisible to others.' },
        { id: 'ripple',   name: 'Ripple',   species: 'Otter',       emoji: '\u{1F9A6}', rarity: 'uncommon',  desc: 'A playful otter who juggles crystals for fun. He can hold his breath for hours exploring underwater caves.' },
        { id: 'thistle',  name: 'Thistle',  species: 'Hedgehog',    emoji: '\u{1F994}', rarity: 'uncommon',  desc: 'A gentle hedgehog whose spines glow at dusk. She tends the island\'s mushroom gardens.' },
        { id: 'breeze',   name: 'Breeze',   species: 'Hummingbird', emoji: '\u{1F426}', rarity: 'uncommon',  desc: 'A swift hummingbird who carries messages on the wind. Her wings hum ancient melodies.' },

        // Rare
        { id: 'storm',    name: 'Storm',    species: 'Wolf',        emoji: '\u{1F43A}', rarity: 'rare',      desc: 'A silver wolf who commands the weather. Lightning dances between his ears when he howls.' },
        { id: 'dusk',     name: 'Dusk',     species: 'Panther',     emoji: '\u{1F408}\u200D\u2B1B', rarity: 'rare', desc: 'A shadow panther who walks between worlds. She guards the island\'s deepest secrets.' },
        { id: 'tide',     name: 'Tide',     species: 'Dolphin',     emoji: '\u{1F42C}', rarity: 'rare',      desc: 'A luminous dolphin who navigates by starlight. His songs can calm the fiercest storms.' },
        { id: 'sage',     name: 'Sage',     species: 'Tortoise',    emoji: '\u{1F422}', rarity: 'rare',      desc: 'An ancient tortoise whose shell is a living garden. She remembers the island\'s first sunrise.' },

        // Legendary
        { id: 'solaris',  name: 'Solaris',  species: 'Griffin',     emoji: '\u{1F985}', rarity: 'legendary', desc: 'A golden griffin born from sunlight and stone. His wings scatter golden dust that makes plants grow.' },
        { id: 'nebula',   name: 'Nebula',   species: 'Cosmic Cat',  emoji: '\u{1F431}', rarity: 'legendary', desc: 'A mysterious cat with fur like the night sky. Stars swirl in her eyes and she purrs in constellations.' },
        { id: 'tempest',  name: 'Tempest',  species: 'Thunder Horse', emoji: '\u{1F40E}', rarity: 'legendary', desc: 'A magnificent horse wreathed in lightning. Her hooves crack with thunder and she runs on clouds.' }
    ];

    var RARITY_WEIGHTS = {
        common:    60,
        uncommon:  25,
        rare:      12,
        legendary: 3
    };

    var RARITY_COLORS = {
        common:    { border: '#8a9ab0', bg: 'rgba(138,154,176,0.15)', label: '#8a9ab0' },
        uncommon:  { border: '#5cb85c', bg: 'rgba(92,184,92,0.15)',   label: '#5cb85c' },
        rare:      { border: '#7b68ee', bg: 'rgba(123,104,238,0.15)', label: '#7b68ee' },
        legendary: { border: '#ffd700', bg: 'rgba(255,215,0,0.15)',   label: '#ffd700' }
    };

    // Tier thresholds: which rarities are available at each creature merge tier
    // Tier 1 (Hatchling): common only
    // Tier 2 (Fledgling): common + uncommon
    // Tier 3 (Juvenile):  common + uncommon + rare
    // Tier 4+ (Adult+):   all rarities
    var TIER_RARITY_ACCESS = {
        0: ['common'],
        1: ['common'],
        2: ['common', 'uncommon'],
        3: ['common', 'uncommon', 'rare'],
        4: ['common', 'uncommon', 'rare', 'legendary'],
        5: ['common', 'uncommon', 'rare', 'legendary'],
        6: ['common', 'uncommon', 'rare', 'legendary'],
        7: ['common', 'uncommon', 'rare', 'legendary']
    };

    // Discovery chance per tier (higher tier = higher chance)
    var DISCOVERY_CHANCE = {
        0: 0.0,   // Egg — no discovery
        1: 0.30,  // Hatchling — 30%
        2: 0.40,  // Fledgling — 40%
        3: 0.50,  // Juvenile — 50%
        4: 0.60,  // Adult — 60%
        5: 0.70,  // Elder — 70%
        6: 0.80,  // Mythic — 80%
        7: 1.00   // Dragon — guaranteed
    };

    var discovered = {};  // { creatureId: { discoveredAt, tier } }

    // ─── INIT ───────────────────────────────────────────────────

    function init() {
        var state = Game.getState();
        if (state.hatchery && state.hatchery.discovered) {
            discovered = state.hatchery.discovered;
        } else {
            discovered = {};
        }

        // Listen for creature chain productions
        Game.on('itemProduced', onItemProduced);
    }

    // ─── DISCOVERY MECHANIC ─────────────────────────────────────

    function onItemProduced(data) {
        if (data.chain !== 'creature') return;

        var tier = data.tier;
        var chance = DISCOVERY_CHANCE[tier] || 0;
        if (Math.random() > chance) return;

        // Roll for rarity based on tier
        var availableRarities = TIER_RARITY_ACCESS[Math.min(tier, 7)] || ['common'];
        var rarity = rollRarity(availableRarities);

        // Pick an undiscovered creature of that rarity
        var candidate = pickUndiscovered(rarity);

        // If all of that rarity are found, try other available rarities
        if (!candidate) {
            for (var i = 0; i < availableRarities.length; i++) {
                candidate = pickUndiscovered(availableRarities[i]);
                if (candidate) break;
            }
        }

        // All creatures discovered!
        if (!candidate) return;

        // Discover it
        discovered[candidate.id] = {
            discoveredAt: Date.now(),
            tier: tier
        };
        saveState();

        // Show discovery modal
        showDiscoveryModal(candidate);

        // Emit event for quests
        Game.emit('creatureDiscovered', {
            creature: candidate.id,
            rarity: candidate.rarity,
            total: Object.keys(discovered).length
        });
    }

    function rollRarity(available) {
        var totalWeight = 0;
        for (var i = 0; i < available.length; i++) {
            totalWeight += RARITY_WEIGHTS[available[i]];
        }

        var roll = Math.random() * totalWeight;
        for (var j = 0; j < available.length; j++) {
            roll -= RARITY_WEIGHTS[available[j]];
            if (roll <= 0) return available[j];
        }
        return available[0];
    }

    function pickUndiscovered(rarity) {
        var pool = [];
        for (var i = 0; i < creatures.length; i++) {
            if (creatures[i].rarity === rarity && !discovered[creatures[i].id]) {
                pool.push(creatures[i]);
            }
        }
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // ─── DISCOVERY MODAL ────────────────────────────────────────

    function showDiscoveryModal(creature) {
        var colors = RARITY_COLORS[creature.rarity];

        var modal = document.getElementById('island-modal');
        if (!modal) {
            // Create a floating modal if island modal isn't available
            modal = document.createElement('div');
            modal.id = 'hatchery-modal';
            modal.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px;';
            document.getElementById('app').appendChild(modal);
        }

        var rarityLabel = creature.rarity.charAt(0).toUpperCase() + creature.rarity.slice(1);

        modal.innerHTML =
            '<div class="island-modal-card reveal-card">' +
                '<div class="modal-reveal-badge" style="background:linear-gradient(135deg,' + colors.border + ',' + colors.label + ');">New Creature Discovered!</div>' +
                '<div class="modal-creature-emoji reveal-creature" style="font-size:56px;">' + creature.emoji + '</div>' +
                '<h3>' + creature.name + '</h3>' +
                '<p class="modal-species" style="color:' + colors.label + ';">' + creature.species + ' \u2022 ' + rarityLabel + '</p>' +
                '<p class="modal-desc">' + creature.desc + '</p>' +
                '<p style="font-size:12px;color:var(--text-secondary);margin-top:8px;">' +
                    Object.keys(discovered).length + '/' + creatures.length + ' creatures discovered' +
                '</p>' +
                '<button class="modal-close-btn" style="background:linear-gradient(135deg,' + colors.border + ',' + colors.label + ');color:#1a1a2e;border:none;">Amazing!</button>' +
            '</div>';

        modal.classList.remove('hidden');

        Sound.playCelebration();
        Game.vibrate([20, 40, 30, 40, 20]);

        modal.querySelector('.modal-close-btn').addEventListener('click', function() {
            modal.classList.add('hidden');
            // Clean up floating modal if we created one
            if (modal.id === 'hatchery-modal') {
                modal.remove();
            }
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
                if (modal.id === 'hatchery-modal') {
                    modal.remove();
                }
            }
        });
    }

    // ─── COLLECTION RENDERING ───────────────────────────────────

    function renderCollection(containerEl) {
        if (!containerEl) return;

        containerEl.innerHTML = '';

        // Header with count
        var header = document.createElement('div');
        header.className = 'hatchery-header';
        header.innerHTML =
            '<h3>\u{1F95A} Hatchery</h3>' +
            '<span class="hatchery-count">' + Object.keys(discovered).length + '/' + creatures.length + '</span>';
        containerEl.appendChild(header);

        // Progress bar
        var pct = Math.round((Object.keys(discovered).length / creatures.length) * 100);
        var progressBar = document.createElement('div');
        progressBar.className = 'hatchery-progress';
        progressBar.innerHTML = '<div class="hatchery-progress-fill" style="width:' + pct + '%;"></div>';
        containerEl.appendChild(progressBar);

        // Group by rarity
        var groups = ['legendary', 'rare', 'uncommon', 'common'];
        for (var g = 0; g < groups.length; g++) {
            var rarity = groups[g];
            var group = creatures.filter(function(c) { return c.rarity === rarity; });
            if (group.length === 0) continue;

            var colors = RARITY_COLORS[rarity];
            var label = rarity.charAt(0).toUpperCase() + rarity.slice(1);

            var section = document.createElement('div');
            section.className = 'hatchery-section';

            var sectionHeader = document.createElement('div');
            sectionHeader.className = 'hatchery-section-header';
            sectionHeader.innerHTML = '<span style="color:' + colors.label + ';">' + label + '</span>';
            section.appendChild(sectionHeader);

            var grid = document.createElement('div');
            grid.className = 'hatchery-grid';

            for (var i = 0; i < group.length; i++) {
                var c = group[i];
                var isFound = !!discovered[c.id];

                var card = document.createElement('div');
                card.className = 'hatchery-card' + (isFound ? ' discovered' : ' undiscovered');
                card.style.borderColor = isFound ? colors.border : 'rgba(255,255,255,0.06)';
                if (isFound) {
                    card.style.background = colors.bg;
                }

                var emoji = document.createElement('div');
                emoji.className = 'hatchery-emoji';
                emoji.textContent = isFound ? c.emoji : '?';
                if (!isFound) {
                    emoji.style.opacity = '0.3';
                    emoji.style.filter = 'grayscale(1)';
                }

                var name = document.createElement('div');
                name.className = 'hatchery-name';
                name.textContent = isFound ? c.name : '???';
                if (!isFound) name.style.color = 'var(--text-secondary)';

                card.appendChild(emoji);
                card.appendChild(name);

                // Click to see details if discovered
                if (isFound) {
                    (function(creature) {
                        card.addEventListener('click', function() {
                            showCreatureDetail(creature);
                        });
                    })(c);
                }

                grid.appendChild(card);
            }

            section.appendChild(grid);
            containerEl.appendChild(section);
        }

        // Hint text
        var hint = document.createElement('p');
        hint.className = 'hatchery-hint';
        hint.textContent = 'Merge creature eggs to discover new friends! Higher tiers reveal rarer creatures.';
        containerEl.appendChild(hint);
    }

    function showCreatureDetail(creature) {
        var colors = RARITY_COLORS[creature.rarity];
        var rarityLabel = creature.rarity.charAt(0).toUpperCase() + creature.rarity.slice(1);

        var modal = document.getElementById('island-modal');
        if (!modal) return;

        modal.innerHTML =
            '<div class="island-modal-card">' +
                '<div class="modal-creature-emoji" style="font-size:48px;">' + creature.emoji + '</div>' +
                '<h3>' + creature.name + '</h3>' +
                '<p class="modal-species" style="color:' + colors.label + ';">' + creature.species + ' \u2022 ' + rarityLabel + '</p>' +
                '<p class="modal-desc">' + creature.desc + '</p>' +
                '<button class="modal-close-btn">Close</button>' +
            '</div>';

        modal.classList.remove('hidden');
        Sound.playTap();

        modal.querySelector('.modal-close-btn').addEventListener('click', function() {
            modal.classList.add('hidden');
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    // ─── STATE ──────────────────────────────────────────────────

    function saveState() {
        var state = Game.getState();
        state.hatchery = {
            discovered: discovered
        };
        Game.save();
    }

    function getDiscoveredCount() {
        return Object.keys(discovered).length;
    }

    function getTotalCount() {
        return creatures.length;
    }

    return {
        init: init,
        renderCollection: renderCollection,
        getDiscoveredCount: getDiscoveredCount,
        getTotalCount: getTotalCount,
        creatures: creatures
    };

})();
