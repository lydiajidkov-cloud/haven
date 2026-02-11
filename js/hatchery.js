// Haven - Hatchery: Creature Collection & Discovery System (Biome Edition)
'use strict';

var Hatchery = (function() {

    var creatures = CreatureData.creatures;
    var biomes = CreatureData.biomes;

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

    // Tier thresholds for rarity access
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

    // Biome gating by creature tier — higher tiers unlock exotic biomes
    var TIER_BIOME_ACCESS = {
        0: [],
        1: ['meadow', 'forest', 'ocean', 'garden'],
        2: ['meadow', 'forest', 'ocean', 'garden', 'mountain', 'sky', 'swamp'],
        3: ['meadow', 'forest', 'ocean', 'garden', 'mountain', 'sky', 'swamp', 'desert', 'jungle', 'spring', 'summer'],
        4: ['meadow', 'forest', 'ocean', 'garden', 'mountain', 'sky', 'swamp', 'desert', 'jungle', 'spring', 'summer', 'autumn', 'winter', 'arctic'],
        5: ['meadow', 'forest', 'ocean', 'garden', 'mountain', 'sky', 'swamp', 'desert', 'jungle', 'spring', 'summer', 'autumn', 'winter', 'arctic', 'enchanted', 'celestial'],
        6: ['meadow', 'forest', 'ocean', 'garden', 'mountain', 'sky', 'swamp', 'desert', 'jungle', 'spring', 'summer', 'autumn', 'winter', 'arctic', 'enchanted', 'celestial'],
        7: ['meadow', 'forest', 'ocean', 'garden', 'mountain', 'sky', 'swamp', 'desert', 'jungle', 'spring', 'summer', 'autumn', 'winter', 'arctic', 'enchanted', 'celestial']
    };

    var DISCOVERY_CHANCE = {
        0: 0.0,
        1: 0.30,
        2: 0.40,
        3: 0.50,
        4: 0.60,
        5: 0.70,
        6: 0.80,
        7: 1.00
    };

    var discovered = {};
    var collapsedBiomes = {}; // track collapsed state per biome

    // ─── INIT ───────────────────────────────────────────────────

    function init() {
        var state = Game.getState();
        if (state.hatchery && state.hatchery.discovered) {
            discovered = state.hatchery.discovered;
        } else {
            discovered = {};
        }

        Game.on('itemProduced', onItemProduced);

        // Creature order discovery bonus — boost next discovery chance
        Game.on('orderDiscoveryBonus', function() {
            // Force-discover a random undiscovered creature from available biomes
            var gs = Game.getState();
            var highestTier = (gs.stats && gs.stats.highestTier) || 0;
            var biomeKey = Math.min(highestTier, 7);
            var availableBiomes = TIER_BIOME_ACCESS[biomeKey] || TIER_BIOME_ACCESS[0];
            var candidate = pickUndiscovered('common', availableBiomes) ||
                            pickUndiscovered('uncommon', availableBiomes);
            if (candidate) {
                discovered[candidate.id] = { discoveredAt: Date.now(), tier: 0 };
                saveState();
                showDiscoveryModal(candidate);
                Game.emit('creatureDiscovered', { creature: candidate.id, rarity: candidate.rarity, biome: candidate.biome, total: Object.keys(discovered).length });
            }
        });
    }

    // ─── DISCOVERY MECHANIC ─────────────────────────────────────

    function onItemProduced(data) {
        if (data.chain !== 'creature') return;

        var tier = data.tier;
        var chance = DISCOVERY_CHANCE[tier] || 0;
        // Apply creature passive discovery chance bonus
        if (typeof Creatures !== 'undefined') {
            var gs = Game.getState();
            if (gs.hatchery && gs.hatchery.discovered) {
                var bonuses = Creatures.calculatePassiveBonuses(gs.hatchery.discovered);
                chance = Math.min(1, chance * (1 + bonuses.discovery_chance / 100));
            }
        }
        if (Math.random() > chance) return;

        // Get available biomes for this tier
        var availableBiomes = TIER_BIOME_ACCESS[Math.min(tier, 7)] || [];
        if (availableBiomes.length === 0) return;

        // Roll for rarity
        var availableRarities = TIER_RARITY_ACCESS[Math.min(tier, 7)] || ['common'];
        var rarity = rollRarity(availableRarities);

        // Pick undiscovered creature of that rarity from available biomes
        var candidate = pickUndiscovered(rarity, availableBiomes);

        // Fallback to other rarities
        if (!candidate) {
            for (var i = 0; i < availableRarities.length; i++) {
                candidate = pickUndiscovered(availableRarities[i], availableBiomes);
                if (candidate) break;
            }
        }

        if (!candidate) return;

        discovered[candidate.id] = {
            discoveredAt: Date.now(),
            tier: tier
        };
        saveState();

        showDiscoveryModal(candidate);

        Game.emit('creatureDiscovered', {
            creature: candidate.id,
            rarity: candidate.rarity,
            biome: candidate.biome,
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

    function pickUndiscovered(rarity, availableBiomes) {
        var pool = [];
        for (var i = 0; i < creatures.length; i++) {
            var c = creatures[i];
            if (c.rarity === rarity && !discovered[c.id] && availableBiomes.indexOf(c.biome) !== -1) {
                pool.push(c);
            }
        }
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // ─── DISCOVERY MODAL ────────────────────────────────────────

    function showDiscoveryModal(creature) {
        var colors = RARITY_COLORS[creature.rarity];
        var biomeInfo = getBiomeInfo(creature.biome);

        var modal = document.getElementById('island-modal');
        if (!modal) {
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
                '<p style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">' + biomeInfo.icon + ' ' + biomeInfo.name + ' Biome</p>' +
                '<p class="modal-desc">' + creature.desc + '</p>' +
                '<p style="font-size:12px;color:var(--text-secondary);margin-top:8px;">' +
                    Object.keys(discovered).length + '/' + creatures.length + ' creatures discovered' +
                '</p>' +
                '<button class="modal-close-btn" style="background:linear-gradient(135deg,' + colors.border + ',' + colors.label + ');color:#1a1a2e;border:none;">Amazing!</button>' +
            '</div>';

        modal.classList.remove('hidden');
        Sound.playCreatureDiscover();
        Game.vibrate([20, 40, 30, 40, 20]);

        modal.querySelector('.modal-close-btn').addEventListener('click', function() {
            modal.classList.add('hidden');
            if (modal.id === 'hatchery-modal') modal.remove();
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
                if (modal.id === 'hatchery-modal') modal.remove();
            }
        });
    }

    function getBiomeInfo(biomeId) {
        for (var i = 0; i < biomes.length; i++) {
            if (biomes[i].id === biomeId) return biomes[i];
        }
        return { id: biomeId, name: biomeId, icon: '' };
    }

    // ─── COLLECTION RENDERING ───────────────────────────────────

    function renderCollection(containerEl) {
        if (!containerEl) return;
        containerEl.innerHTML = '';

        // Header with total count
        var header = document.createElement('div');
        header.className = 'hatchery-header';
        header.innerHTML =
            '<h3>\u{1F95A} Hatchery</h3>' +
            '<span class="hatchery-count">' + Object.keys(discovered).length + '/' + creatures.length + '</span>';
        containerEl.appendChild(header);

        // Overall progress bar
        var pct = Math.round((Object.keys(discovered).length / creatures.length) * 100);
        var progressBar = document.createElement('div');
        progressBar.className = 'hatchery-progress';
        progressBar.innerHTML = '<div class="hatchery-progress-fill" style="width:' + pct + '%;"></div>';
        containerEl.appendChild(progressBar);

        // Passive bonuses summary
        if (typeof Creatures !== 'undefined' && Object.keys(discovered).length > 0) {
            var bonuses = Creatures.calculatePassiveBonuses(discovered);
            var summaryEl = document.createElement('div');
            summaryEl.className = 'hatchery-bonuses';
            summaryEl.style.cssText = 'background:rgba(255,255,255,0.05);border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;text-align:center;';
            var parts = [];
            if (bonuses.gem_bonus > 0) parts.push('+' + bonuses.gem_bonus.toFixed(1) + '% \u{1F48E}');
            if (bonuses.discovery_chance > 0) parts.push('+' + bonuses.discovery_chance.toFixed(1) + '% \u{1F50D}');
            if (bonuses.energy_regen > 0) parts.push('-' + (bonuses.energy_regen * 0.25).toFixed(1) + 's \u26A1');
            if (bonuses.xp_bonus > 0) parts.push('+' + bonuses.xp_bonus.toFixed(1) + '% XP');
            if (bonuses.spawn_quality > 0) parts.push('+' + bonuses.spawn_quality.toFixed(1) + '% \u2728');
            summaryEl.innerHTML = '<span style="color:var(--text-secondary);">Your creatures give:</span> ' + parts.join(' \u00B7 ');
            containerEl.appendChild(summaryEl);
        }

        // Render each biome section
        for (var b = 0; b < biomes.length; b++) {
            var biome = biomes[b];
            var biomeCreatures = getCreaturesByBiome(biome.id);
            if (biomeCreatures.length === 0) continue;

            var discoveredInBiome = countDiscoveredInBiome(biome.id);
            var isCollapsed = !!collapsedBiomes[biome.id];

            var section = document.createElement('div');
            section.className = 'hatchery-biome-section';

            // Biome header (clickable to toggle)
            var biomeHeader = document.createElement('div');
            biomeHeader.className = 'hatchery-biome-header';
            biomeHeader.innerHTML =
                '<div class="biome-header-left">' +
                    '<span class="biome-toggle">' + (isCollapsed ? '\u25B6' : '\u25BC') + '</span>' +
                    '<span class="biome-icon">' + biome.icon + '</span>' +
                    '<span class="biome-name">' + biome.name + '</span>' +
                '</div>' +
                '<span class="biome-count">' + discoveredInBiome + '/' + biomeCreatures.length + '</span>';

            // Biome progress mini-bar
            var biomePct = biomeCreatures.length > 0 ? Math.round((discoveredInBiome / biomeCreatures.length) * 100) : 0;
            var biomeProg = document.createElement('div');
            biomeProg.className = 'hatchery-biome-progress';
            biomeProg.innerHTML = '<div class="hatchery-biome-progress-fill" style="width:' + biomePct + '%;"></div>';

            (function(biomeId, sectionEl) {
                biomeHeader.addEventListener('click', function() {
                    collapsedBiomes[biomeId] = !collapsedBiomes[biomeId];
                    renderCollection(containerEl);
                    Sound.playTap();
                });
            })(biome.id, section);

            section.appendChild(biomeHeader);
            section.appendChild(biomeProg);

            // Grid of creatures (hidden if collapsed)
            if (!isCollapsed) {
                var grid = document.createElement('div');
                grid.className = 'hatchery-grid';

                for (var i = 0; i < biomeCreatures.length; i++) {
                    var c = biomeCreatures[i];
                    var isFound = !!discovered[c.id];
                    var colors = RARITY_COLORS[c.rarity];

                    var card = document.createElement('div');
                    card.className = 'hatchery-card' + (isFound ? ' discovered' : ' undiscovered');
                    card.style.borderColor = isFound ? colors.border : 'rgba(255,255,255,0.06)';
                    if (isFound) card.style.background = colors.bg;

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
            }

            containerEl.appendChild(section);
        }

        // Hint text
        var hint = document.createElement('p');
        hint.className = 'hatchery-hint';
        hint.textContent = 'Merge creature eggs to discover new friends! Higher tiers unlock rarer creatures and exotic biomes.';
        containerEl.appendChild(hint);
    }

    function getCreaturesByBiome(biomeId) {
        var result = [];
        for (var i = 0; i < creatures.length; i++) {
            if (creatures[i].biome === biomeId) result.push(creatures[i]);
        }
        return result;
    }

    function countDiscoveredInBiome(biomeId) {
        var count = 0;
        for (var i = 0; i < creatures.length; i++) {
            if (creatures[i].biome === biomeId && discovered[creatures[i].id]) count++;
        }
        return count;
    }

    function showCreatureDetail(creature) {
        var colors = RARITY_COLORS[creature.rarity];
        var rarityLabel = creature.rarity.charAt(0).toUpperCase() + creature.rarity.slice(1);
        var biomeInfo = getBiomeInfo(creature.biome);

        var modal = document.getElementById('island-modal');
        if (!modal) return;

        modal.innerHTML =
            '<div class="island-modal-card">' +
                '<div class="modal-creature-emoji" style="font-size:48px;">' + creature.emoji + '</div>' +
                '<h3>' + creature.name + '</h3>' +
                '<p class="modal-species" style="color:' + colors.label + ';">' + creature.species + ' \u2022 ' + rarityLabel + '</p>' +
                '<p style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">' + biomeInfo.icon + ' ' + biomeInfo.name + ' Biome</p>' +
                '<p class="modal-desc">' + creature.desc + '</p>' +
                (function() {
                    if (typeof Creatures === 'undefined') return '';
                    var al = Creatures.getAbilityLabel(creature.ability);
                    var val = Creatures.formatBonus(creature.ability, creature.abilityValue);
                    var html = '<p style="font-size:11px;margin-top:8px;color:' + colors.label + ';">' +
                        al.icon + ' ' + al.label + ': ' + val + '</p>';
                    if (creature.companionAbility) {
                        var cl = Creatures.getCompanionLabel(creature.companionAbility);
                        html += '<p style="font-size:10px;color:var(--text-secondary);margin-top:4px;">' +
                            '\u2694\uFE0F Companion: ' + cl.label + ' \u2014 ' + cl.desc +
                            ' (every ' + cl.trigger + ' merges)</p>';
                    }
                    return html;
                })() +
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
        state.hatchery = { discovered: discovered };
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
