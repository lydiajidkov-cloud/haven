// Haven - Hatchery: Creature Collection & Discovery System (Biome Edition)
'use strict';

var Hatchery = (function() {

    var creatures = CreatureData.creatures;
    var biomes = CreatureData.biomes;

    var RARITY_WEIGHTS = {
        common:    55,
        uncommon:  25,
        rare:      12,
        legendary: 8
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
        1: 0.12,
        2: 0.18,
        3: 0.22,
        4: 0.28,
        5: 0.35,
        6: 0.45,
        7: 0.60
    };

    var PITY_THRESHOLD = 50; // guaranteed legendary every 50 egg discoveries (was 30)

    // Discovery cooldown: minimum 30 seconds between discoveries
    var DISCOVERY_COOLDOWN_MS = 30000;
    var lastDiscoveryTime = 0;

    var discovered = {};
    var collapsedBiomes = {}; // track collapsed state per biome
    var hasNewCreature = false; // true when creature discovered but hatchery not viewed

    // ─── INIT ───────────────────────────────────────────────────

    function init() {
        var state = Game.getState();
        if (state.hatchery && state.hatchery.discovered) {
            discovered = state.hatchery.discovered;
        } else {
            discovered = {};
        }

        // Initialize pity counter from save state (lazy init for existing saves)
        if (state.hatchery && typeof state.hatchery.pityCounter === 'number') {
            // pity counter already in state
        } else {
            // Ensure pity counter exists in state
            if (!state.hatchery) state.hatchery = { discovered: discovered };
            if (typeof state.hatchery.pityCounter !== 'number') state.hatchery.pityCounter = 0;
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
                // Pity counter: increment (order bonus doesn't discover legendaries)
                var pc = getPityCounter();
                setPityCounter(pc + 1);
                saveState();
                showDiscoveryModal(candidate);
                Game.emit('creatureDiscovered', { creature: candidate.id, rarity: candidate.rarity, biome: candidate.biome, total: Object.keys(discovered).length });
            }
        });

        // Listen for creature discoveries to show NEW badge on hatchery tab
        Game.on('creatureDiscovered', function() {
            hasNewCreature = true;
            updateHatcheryBadge();
        });
    }

    function updateHatcheryBadge() {
        var tab = document.querySelector('[data-island-tab="hatchery"]');
        if (!tab) return;
        if (hasNewCreature) {
            if (!tab.querySelector('.hatchery-new-badge')) {
                var badge = document.createElement('span');
                badge.className = 'hatchery-new-badge';
                badge.textContent = 'NEW';
                tab.appendChild(badge);
            }
        } else {
            var existing = tab.querySelector('.hatchery-new-badge');
            if (existing) existing.remove();
        }
    }

    function clearNewBadge() {
        hasNewCreature = false;
        updateHatcheryBadge();
    }

    // ─── DISCOVERY MECHANIC ─────────────────────────────────────

    function onItemProduced(data) {
        if (data.chain !== 'creature') return;

        // Discovery cooldown: max 1 discovery per 30 seconds
        if (Date.now() - lastDiscoveryTime < DISCOVERY_COOLDOWN_MS) return;

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
        // Event modifier: discovery_boost (e.g., Discovery Week 2x creature discovery)
        if (typeof Events !== 'undefined' && Events.hasModifier('discovery_boost', 'creature')) {
            chance = Math.min(1, chance * Events.getModifierValue('discovery_boost', 'creature'));
        }
        if (Math.random() > chance) return;

        // Get available biomes for this tier
        var availableBiomes = TIER_BIOME_ACCESS[Math.min(tier, 7)] || [];
        if (availableBiomes.length === 0) return;

        // Roll for rarity (with pity timer)
        var availableRarities = TIER_RARITY_ACCESS[Math.min(tier, 7)] || ['common'];
        var pityCounter = getPityCounter();
        var pityForced = false;
        var rarity;

        // Pity timer: if counter reaches threshold and legendary is accessible, force legendary
        if (pityCounter >= PITY_THRESHOLD - 1 && availableRarities.indexOf('legendary') !== -1) {
            rarity = 'legendary';
            pityForced = true;
        } else {
            rarity = rollRarity(availableRarities);
        }

        // Pick undiscovered creature of that rarity from available biomes
        var candidate = pickUndiscovered(rarity, availableBiomes);

        // Fallback to other rarities (if pity-forced legendary has none left, try others)
        if (!candidate) {
            for (var i = 0; i < availableRarities.length; i++) {
                candidate = pickUndiscovered(availableRarities[i], availableBiomes);
                if (candidate) break;
            }
        }

        if (!candidate) return;

        // Record discovery time for cooldown
        lastDiscoveryTime = Date.now();

        discovered[candidate.id] = {
            discoveredAt: Date.now(),
            tier: tier
        };

        // Update pity counter: reset on legendary discovery, increment otherwise
        if (candidate.rarity === 'legendary') {
            setPityCounter(0);
        } else {
            setPityCounter(pityCounter + 1);
        }

        saveState();

        showDiscoveryModal(candidate);

        Game.emit('creatureDiscovered', {
            creature: candidate.id,
            rarity: candidate.rarity,
            biome: candidate.biome,
            total: Object.keys(discovered).length,
            pityForced: pityForced
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

        // Fire celebration overlay (handles sound + particles + share button)
        if (typeof Celebration !== 'undefined') {
            Celebration.show('creatureDiscovery', {
                name: creature.name,
                emoji: creature.emoji,
                rarity: creature.rarity
            });
        } else {
            Sound.playCreatureDiscover();
            Game.vibrate([20, 40, 30, 40, 20]);
        }

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

                    // Evolved visual indicator
                    var creatureEvolved = isFound && typeof Creatures !== 'undefined' && Creatures.isEvolved(c.id);
                    if (creatureEvolved) {
                        card.style.borderColor = '#ffd700';
                        card.style.boxShadow = '0 0 6px rgba(255,215,0,0.25)';
                    }

                    var emoji = document.createElement('div');
                    emoji.className = 'hatchery-emoji';
                    emoji.textContent = c.emoji; // always show emoji (silhouette if undiscovered)
                    if (!isFound) {
                        emoji.style.opacity = '0.35';
                        emoji.style.filter = 'grayscale(1) brightness(0.3) contrast(2)';
                    }

                    var name = document.createElement('div');
                    name.className = 'hatchery-name';
                    name.textContent = isFound ? c.name : '???';
                    if (!isFound) name.style.color = 'var(--text-secondary)';
                    if (creatureEvolved) name.style.color = '#ffd700';

                    card.appendChild(emoji);
                    card.appendChild(name);

                    // EXCLUSIVE badge for event-only creatures
                    var eventExclusiveIds = typeof Events !== 'undefined' ? Events.getExclusiveCreatureIds() : {};
                    if (eventExclusiveIds[c.id] || (isFound && discovered[c.id] && discovered[c.id].eventExclusive)) {
                        var badge = document.createElement('div');
                        badge.className = 'hatchery-exclusive-badge';
                        badge.textContent = 'EXCLUSIVE';
                        card.appendChild(badge);
                    }

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

        // Evolution state
        var evolved = typeof Creatures !== 'undefined' && Creatures.isEvolved(creature.id);
        var evolvedBadge = evolved ? ' <span style="color:#ffd700;font-size:10px;font-weight:700;background:rgba(255,215,0,0.15);padding:1px 6px;border-radius:8px;border:1px solid rgba(255,215,0,0.3);">EVOLVED</span>' : '';

        modal.innerHTML =
            '<div class="island-modal-card">' +
                '<div class="modal-creature-emoji" style="font-size:48px;">' + creature.emoji + '</div>' +
                '<h3>' + creature.name + evolvedBadge + '</h3>' +
                '<p class="modal-species" style="color:' + colors.label + ';">' + creature.species + ' \u2022 ' + rarityLabel + '</p>' +
                '<p style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">' + biomeInfo.icon + ' ' + biomeInfo.name + ' Biome</p>' +
                '<p class="modal-desc">' + creature.desc + '</p>' +
                (function() {
                    if (typeof Creatures === 'undefined') return '';
                    var al = Creatures.getAbilityLabel(creature.ability);
                    var baseVal = creature.abilityValue;
                    var displayVal = evolved ? baseVal * 1.75 : baseVal;
                    var val = Creatures.formatBonus(creature.ability, displayVal);
                    var html = '<p style="font-size:11px;margin-top:8px;color:' + colors.label + ';">' +
                        al.icon + ' ' + al.label + ': ' + val;
                    if (evolved) html += ' <span style="color:#ffd700;font-size:9px;">(1.75x evolved)</span>';
                    html += '</p>';
                    if (creature.companionAbility) {
                        var cl = Creatures.getCompanionLabel(creature.companionAbility);
                        var effTrig = Creatures.getEffectiveCompanionTrigger(creature);
                        html += '<p style="font-size:10px;color:var(--text-secondary);margin-top:4px;">' +
                            '\u2694\uFE0F Companion: ' + cl.label + ' \u2014 ' + cl.desc +
                            ' (every ' + effTrig + ' merges)';
                        if (evolved) html += ' <span style="color:#ffd700;font-size:9px;">(faster)</span>';
                        html += '</p>';
                    }
                    return html;
                })() +
                // Evolution button (only if not already evolved)
                (function() {
                    if (typeof Creatures === 'undefined') return '';
                    if (evolved) return '';
                    var cost = Creatures.getEvolutionCost(creature);
                    var canAfford = Game.getGems() >= cost;
                    return '<button id="evolve-creature-btn" class="modal-evolve-btn" style="' +
                        'display:block;width:100%;margin-top:12px;padding:10px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;' +
                        'background:' + (canAfford ? 'linear-gradient(135deg, #ffd700, #f0a030)' : 'rgba(255,255,255,0.08)') + ';' +
                        'color:' + (canAfford ? '#1a1a2e' : 'var(--text-secondary)') + ';' +
                        'border:1px solid ' + (canAfford ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.1)') + ';' +
                        '">\u2728 Evolve \u2014 \u{1F48E} ' + cost + '</button>';
                })() +
                '<button class="modal-close-btn">Close</button>' +
            '</div>';

        modal.classList.remove('hidden');
        Sound.playTap();

        // Evolution button handler
        var evolveBtn = modal.querySelector('#evolve-creature-btn');
        if (evolveBtn) {
            evolveBtn.addEventListener('click', function() {
                var cost = Creatures.getEvolutionCost(creature);
                if (Game.getGems() < cost) {
                    if (typeof Board !== 'undefined' && Board.showToast) {
                        Board.showToast('Not enough gems!', typeof Board.TOAST_PRIORITY !== 'undefined' ? Board.TOAST_PRIORITY.HIGH : undefined);
                    }
                    Sound.playError();
                    return;
                }
                var success = Creatures.evolveCreature(creature.id);
                if (success) {
                    if (typeof Celebration !== 'undefined') {
                        Celebration.show('creatureDiscovery', {
                            name: creature.name + ' Evolved!',
                            emoji: creature.emoji,
                            rarity: creature.rarity
                        });
                    }
                    // Re-render detail modal with evolved state
                    showCreatureDetail(creature);
                    // Re-render collection to show evolved badge
                    renderCollection(document.getElementById('hatchery-container'));
                }
            });
        }

        modal.querySelector('.modal-close-btn').addEventListener('click', function() {
            modal.classList.add('hidden');
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    // ─── PITY COUNTER ────────────────────────────────────────────

    function getPityCounter() {
        var state = Game.getState();
        return (state.hatchery && typeof state.hatchery.pityCounter === 'number') ? state.hatchery.pityCounter : 0;
    }

    function setPityCounter(value) {
        var state = Game.getState();
        if (!state.hatchery) state.hatchery = { discovered: discovered };
        state.hatchery.pityCounter = value;
    }

    // ─── STATE ──────────────────────────────────────────────────

    function saveState() {
        var state = Game.getState();
        var currentPity = (state.hatchery && typeof state.hatchery.pityCounter === 'number') ? state.hatchery.pityCounter : 0;
        state.hatchery = { discovered: discovered, pityCounter: currentPity };
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
        clearNewBadge: clearNewBadge,
        getDiscoveredCount: getDiscoveredCount,
        getTotalCount: getTotalCount,
        getPityCounter: getPityCounter,
        PITY_THRESHOLD: PITY_THRESHOLD,
        creatures: creatures
    };

})();
