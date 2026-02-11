// Haven - Island Roadmap: Sequential node progression with winding path
'use strict';

var Island = (function() {

    // ─── REGIONS & NODES ──────────────────────────────────────────

    var REGIONS = [
        {
            name: 'The Shore', icon: '\u{1F3D6}\uFE0F', color: '#4ECDC4',
            nodes: [
                { stars: 2,  gems: 10 },
                { stars: 4,  gems: 12 },
                { stars: 6,  gems: 15 },
                { stars: 8,  gems: 18 },
                { stars: 10, gems: 50, boss: true, creature: { name: 'Lumina', species: 'Seahorse', emoji: '\u{1F41F}' }, story: 'The shore was once a thriving refuge. Lumina has waited here, guiding lost creatures back with her bioluminescent light.' }
            ]
        },
        {
            name: 'Whispering Woods', icon: '\u{1F332}', color: '#2D5F2D',
            nodes: [
                { stars: 12, gems: 15 },
                { stars: 15, gems: 18 },
                { stars: 18, gems: 20 },
                { stars: 21, gems: 22 },
                { stars: 24, gems: 25 },
                { stars: 27, gems: 50, boss: true, creature: { name: 'Whisper', species: 'Deer', emoji: '\u{1F98C}' }, story: 'The ancient pines remember everything. Whisper can hear the island\'s heartbeat in the trees.' }
            ]
        },
        {
            name: 'Sunlit Meadows', icon: '\u{1F33B}', color: '#98D87E',
            nodes: [
                { stars: 30, gems: 20 },
                { stars: 34, gems: 22 },
                { stars: 38, gems: 25 },
                { stars: 42, gems: 28 },
                { stars: 46, gems: 30 },
                { stars: 50, gems: 50, boss: true, creature: { name: 'Bloom', species: 'Butterfly', emoji: '\u{1F98B}' }, story: 'The meadow was the heart of celebrations. Bloom\'s wings shimmer with every colour, and where she flies, flowers grow.' }
            ]
        },
        {
            name: 'Stone Peaks', icon: '\u26F0\uFE0F', color: '#708090',
            nodes: [
                { stars: 54, gems: 25 },
                { stars: 59, gems: 28 },
                { stars: 64, gems: 30 },
                { stars: 69, gems: 32 },
                { stars: 74, gems: 35 },
                { stars: 79, gems: 50, boss: true, creature: { name: 'Boulder', species: 'Bear', emoji: '\u{1F43B}' }, story: 'The rocks along the peaks are carved with ancient symbols. Boulder sculpts shelters and tells the island\'s history.' }
            ]
        },
        {
            name: 'Crystal Depths', icon: '\u{1F48E}', color: '#9B88FF',
            nodes: [
                { stars: 84,  gems: 30 },
                { stars: 91,  gems: 32 },
                { stars: 98,  gems: 35 },
                { stars: 105, gems: 38 },
                { stars: 112, gems: 50, boss: true, creature: { name: 'Prism', species: 'Dragon', emoji: '\u{1F409}' }, story: 'Deep within the crystal caves, magic still pulses. Prism guards the light, breathing not fire but rainbows.' }
            ]
        },
        {
            name: 'Cloud Realm', icon: '\u2601\uFE0F', color: '#B0C4DE',
            nodes: [
                { stars: 118, gems: 32 },
                { stars: 126, gems: 35 },
                { stars: 134, gems: 38 },
                { stars: 142, gems: 40 },
                { stars: 150, gems: 50, boss: true, creature: { name: 'Zephyr', species: 'Eagle', emoji: '\u{1F985}' }, story: 'From the Cloud Realm, you can see the whole island and beyond \u2014 the faint shimmer of other havens, waiting.' }
            ]
        },
        {
            name: 'Ancient Ruins', icon: '\u{1F3DB}\uFE0F', color: '#FFD700',
            nodes: [
                { stars: 157, gems: 35 },
                { stars: 166, gems: 38 },
                { stars: 175, gems: 40 },
                { stars: 184, gems: 40 },
                { stars: 193, gems: 50, boss: true, creature: { name: 'Haven Guardian', species: 'Spirit', emoji: '\u2728' }, story: 'In the ruins, the truth is revealed: Haven was created as a sanctuary for all magical creatures. And now, you are its guardian.' }
            ]
        }
    ];

    // Build flat node list
    var allNodes = [];
    (function() {
        for (var r = 0; r < REGIONS.length; r++) {
            var region = REGIONS[r];
            for (var n = 0; n < region.nodes.length; n++) {
                allNodes.push({
                    index: allNodes.length,
                    regionIndex: r,
                    region: region,
                    stars: region.nodes[n].stars,
                    gems: region.nodes[n].gems,
                    boss: region.nodes[n].boss || false,
                    creature: region.nodes[n].creature || null,
                    story: region.nodes[n].story || null
                });
            }
        }
    })();

    // ─── STATE ────────────────────────────────────────────────────

    var unlockedNodes = [];  // array of node indices
    var currentNode = 0;     // highest unlocked + 1 (next to unlock)

    // ─── OLD AREA ID → NODE INDEX MAP (for migration) ────────────
    var OLD_AREA_MAP = {
        'coral-shore': 0, 'sandy-beach': 1, 'tide-pools': 2,
        'harbor': 3, 'pine-forest': 5, 'meadow': 10,
        'flower-fields': 12, 'rocky-shore': 16, 'crystal-cave': 22,
        'cloud-nest': 28, 'misty-peak': 32, 'ancient-ruins': 37
    };

    // ─── INIT ─────────────────────────────────────────────────────

    function init() {
        var state = Game.getState();

        if (state.island && state.island.unlockedNodes) {
            // New format
            unlockedNodes = state.island.unlockedNodes;
            currentNode = state.island.currentNode || 0;
        } else if (state.island && state.island.unlocked) {
            // Old format — migrate
            unlockedNodes = [];
            var oldIds = Object.keys(state.island.unlocked);
            var maxNode = -1;
            for (var i = 0; i < oldIds.length; i++) {
                var nodeIdx = OLD_AREA_MAP[oldIds[i]];
                if (nodeIdx !== undefined) {
                    // Unlock this node and all before it
                    for (var j = 0; j <= nodeIdx; j++) {
                        if (unlockedNodes.indexOf(j) === -1) {
                            unlockedNodes.push(j);
                        }
                    }
                    if (nodeIdx > maxNode) maxNode = nodeIdx;
                }
            }
            currentNode = maxNode + 1;
            if (currentNode >= allNodes.length) currentNode = allNodes.length - 1;
            saveIslandState();
        } else {
            unlockedNodes = [];
            currentNode = 0;
        }

        Game.on('starsChanged', function() { renderRoadmap(); });
        Game.on('questCompleted', function() { renderRoadmap(); });

        renderRoadmap();
    }

    // ─── UNLOCK ───────────────────────────────────────────────────

    function unlockNode(index) {
        if (index < 0 || index >= allNodes.length) return false;
        if (unlockedNodes.indexOf(index) !== -1) return false;

        var node = allNodes[index];
        if (Game.getStars() < node.stars) return false;

        // Must unlock sequentially
        if (index > 0 && unlockedNodes.indexOf(index - 1) === -1) return false;

        unlockedNodes.push(index);
        currentNode = index + 1;
        if (currentNode >= allNodes.length) currentNode = allNodes.length - 1;

        Game.addGems(node.gems);
        saveIslandState();

        Sound.playCelebration();
        Game.vibrate([20, 40, 30, 40, 20]);

        if (node.boss && node.creature) {
            showBossReveal(node);
        } else {
            showNodeUnlock(node);
        }

        renderRoadmap();
        return true;
    }

    function skipNode(index) {
        // Pay 50 gems to unlock without enough stars
        if (Game.getGems() < 50) return false;
        if (index < 0 || index >= allNodes.length) return false;
        if (unlockedNodes.indexOf(index) !== -1) return false;
        if (index > 0 && unlockedNodes.indexOf(index - 1) === -1) return false;

        Game.addGems(-50);

        var node = allNodes[index];
        unlockedNodes.push(index);
        currentNode = index + 1;
        if (currentNode >= allNodes.length) currentNode = allNodes.length - 1;

        Game.addGems(node.gems);
        saveIslandState();

        Sound.playCelebration();
        Game.vibrate([20, 40, 30, 40, 20]);

        if (node.boss && node.creature) {
            showBossReveal(node);
        } else {
            showNodeUnlock(node);
        }

        renderRoadmap();
        return true;
    }

    // ─── RENDERING ────────────────────────────────────────────────

    function renderRoadmap() {
        var map = document.getElementById('island-map');
        if (!map) return;

        var stars = Game.getStars();

        // Stats bar
        var statsEl = document.getElementById('island-stats');
        if (statsEl) {
            var pct = getRestorationPercent();
            statsEl.innerHTML =
                '<span class="island-stat">\u{1F3DD}\uFE0F ' + pct + '% Explored</span>' +
                '<span class="island-stat">\u2B50 ' + stars + ' Stars</span>' +
                '<span class="island-stat">\u{1F4CD} Node ' + unlockedNodes.length + '/' + allNodes.length + '</span>';
        }

        map.innerHTML = '';

        // Calculate visible range: current node + 3 ahead
        var visibleMax = Math.min(
            allNodes.length - 1,
            (unlockedNodes.length > 0 ? Math.max.apply(null, unlockedNodes) : -1) + 4
        );

        // Scrollable roadmap container
        var roadmap = document.createElement('div');
        roadmap.className = 'roadmap-scroll';

        var pathHeight = (visibleMax + 2) * 90 + 100;
        var inner = document.createElement('div');
        inner.className = 'roadmap-inner';
        inner.style.height = pathHeight + 'px';
        inner.style.position = 'relative';

        // SVG for path lines
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'roadmap-svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', pathHeight);
        svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';

        var currentRegionIndex = -1;
        var prevX = 0, prevY = 0;

        for (var i = 0; i <= visibleMax; i++) {
            var node = allNodes[i];
            var isUnlocked = unlockedNodes.indexOf(i) !== -1;
            var isNext = !isUnlocked && (i === 0 || unlockedNodes.indexOf(i - 1) !== -1);
            var canUnlock = isNext && stars >= node.stars;
            var isBeyondFog = i > visibleMax;

            // Sinusoidal x position (winding left-right)
            var xPct = 50 + Math.sin(i * 0.8) * 28;
            var yPos = 50 + i * 90;

            // Draw region label at first node of each region
            if (node.regionIndex !== currentRegionIndex) {
                currentRegionIndex = node.regionIndex;
                var regionLabel = document.createElement('div');
                regionLabel.className = 'roadmap-region-label';
                regionLabel.style.top = (yPos - 30) + 'px';
                regionLabel.innerHTML = '<span>' + node.region.icon + ' ' + node.region.name + '</span>';
                inner.appendChild(regionLabel);
            }

            // Draw path segment
            if (i > 0) {
                var pathLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                var mapWidth = 300; // approximate
                pathLine.setAttribute('x1', (prevX / 100 * mapWidth));
                pathLine.setAttribute('y1', prevY);
                pathLine.setAttribute('x2', (xPct / 100 * mapWidth));
                pathLine.setAttribute('y2', yPos);
                pathLine.setAttribute('stroke', isUnlocked ? node.region.color : 'rgba(255,255,255,0.15)');
                pathLine.setAttribute('stroke-width', '3');
                pathLine.setAttribute('stroke-dasharray', isUnlocked ? 'none' : '6,4');
                pathLine.setAttribute('stroke-linecap', 'round');
                svg.appendChild(pathLine);
            }

            prevX = xPct;
            prevY = yPos;

            // Node element
            var nodeEl = document.createElement('div');
            nodeEl.className = 'roadmap-node' +
                (node.boss ? ' roadmap-boss' : '') +
                (isUnlocked ? ' unlocked' : '') +
                (isNext ? ' next' : '') +
                (canUnlock ? ' can-unlock' : '') +
                (!isUnlocked && !isNext ? ' locked' : '');

            nodeEl.style.left = xPct + '%';
            nodeEl.style.top = yPos + 'px';

            if (isUnlocked) {
                nodeEl.style.borderColor = node.region.color;
                nodeEl.style.background = 'radial-gradient(circle, ' + node.region.color + '33, ' + node.region.color + '11)';
            }

            var nodeInner = '';
            if (isUnlocked && node.boss && node.creature) {
                nodeInner = '<span class="roadmap-node-emoji">' + node.creature.emoji + '</span>';
            } else if (isUnlocked) {
                nodeInner = '<span class="roadmap-node-emoji">\u2705</span>';
            } else if (canUnlock) {
                nodeInner = '<span class="roadmap-node-emoji">\u{1F513}</span>';
            } else if (isNext) {
                nodeInner = '<span class="roadmap-node-emoji">\u{1F512}</span>';
            } else {
                nodeInner = '<span class="roadmap-node-emoji">\u{1F512}</span>';
            }

            nodeInner += '<span class="roadmap-node-cost">\u2B50 ' + node.stars + '</span>';

            if (node.boss) {
                nodeInner += '<span class="roadmap-node-label">' + (node.creature ? node.creature.name : '') + '</span>';
            }

            nodeEl.innerHTML = nodeInner;

            // Click handler
            (function(n, idx, unlocked, next, canUn) {
                nodeEl.addEventListener('click', function() {
                    if (unlocked && n.boss) {
                        showBossDetail(n);
                    } else if (unlocked) {
                        // Already unlocked — just show info
                    } else if (canUn) {
                        unlockNode(idx);
                    } else if (next) {
                        showNodeLocked(n);
                    }
                    Sound.playTap();
                });
            })(node, i, isUnlocked, isNext, canUnlock);

            inner.appendChild(nodeEl);
        }

        // Fog overlay at bottom
        if (visibleMax < allNodes.length - 1) {
            var fog = document.createElement('div');
            fog.className = 'roadmap-fog';
            fog.style.top = ((visibleMax + 1) * 90 + 20) + 'px';
            inner.appendChild(fog);
        }

        inner.appendChild(svg);
        roadmap.appendChild(inner);
        map.appendChild(roadmap);

        // Auto-scroll to current position
        setTimeout(function() {
            var targetY = (unlockedNodes.length > 0 ? Math.max.apply(null, unlockedNodes) : 0) * 90;
            roadmap.scrollTop = Math.max(0, targetY - 150);
        }, 100);
    }

    // ─── MODALS ───────────────────────────────────────────────────

    function showNodeUnlock(node) {
        var modal = document.getElementById('island-modal');
        if (!modal) return;

        modal.innerHTML =
            '<div class="island-modal-card reveal-card">' +
                '<div class="modal-reveal-badge">Node Unlocked!</div>' +
                '<h3>' + node.region.name + '</h3>' +
                '<p class="modal-desc">You earned +' + node.gems + ' \u{1F48E} gems!</p>' +
                '<button class="modal-close-btn">Continue</button>' +
            '</div>';

        modal.classList.remove('hidden');
        modal.querySelector('.modal-close-btn').addEventListener('click', function() {
            modal.classList.add('hidden');
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    function showBossReveal(node) {
        var modal = document.getElementById('island-modal');
        if (!modal) return;

        modal.innerHTML =
            '<div class="island-modal-card reveal-card">' +
                '<div class="modal-reveal-badge" style="background:linear-gradient(135deg,' + node.region.color + ',var(--accent-gold));">Region Complete!</div>' +
                '<div class="modal-creature-emoji reveal-creature" style="font-size:56px;">' + node.creature.emoji + '</div>' +
                '<h3>' + node.creature.name + ' discovered!</h3>' +
                '<p class="modal-species">' + node.creature.species + ' of ' + node.region.name + '</p>' +
                '<p class="modal-desc">+' + node.gems + ' \u{1F48E} gems</p>' +
                '<div class="modal-divider"></div>' +
                '<p class="modal-story">\u201C' + node.story + '\u201D</p>' +
                '<button class="modal-close-btn" style="background:linear-gradient(135deg,' + node.region.color + ',var(--accent-gold));color:#1a1a2e;border:none;">Amazing!</button>' +
            '</div>';

        modal.classList.remove('hidden');
        modal.querySelector('.modal-close-btn').addEventListener('click', function() {
            modal.classList.add('hidden');
        });
    }

    function showBossDetail(node) {
        var modal = document.getElementById('island-modal');
        if (!modal) return;

        modal.innerHTML =
            '<div class="island-modal-card">' +
                '<div class="modal-creature-emoji" style="font-size:48px;">' + node.creature.emoji + '</div>' +
                '<h3>' + node.creature.name + '</h3>' +
                '<p class="modal-species">' + node.creature.species + ' of ' + node.region.name + '</p>' +
                '<div class="modal-divider"></div>' +
                '<p class="modal-story">\u201C' + node.story + '\u201D</p>' +
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

    function showNodeLocked(node) {
        var modal = document.getElementById('island-modal');
        if (!modal) return;

        var needed = node.stars - Game.getStars();
        var canSkip = Game.getGems() >= 50;

        modal.innerHTML =
            '<div class="island-modal-card">' +
                '<div class="modal-creature-emoji">\u{1F512}</div>' +
                '<h3>' + node.region.name + '</h3>' +
                '<p class="modal-desc">This node requires more stars.</p>' +
                '<p class="modal-cost">Need \u2B50 ' + node.stars + ' stars (' + needed + ' more)</p>' +
                '<p class="modal-hint">Complete quests to earn stars!</p>' +
                (canSkip ? '<button class="modal-skip-btn">Skip for 50\u{1F48E}</button>' : '') +
                '<button class="modal-close-btn">Close</button>' +
            '</div>';

        modal.classList.remove('hidden');
        modal.querySelector('.modal-close-btn').addEventListener('click', function() {
            modal.classList.add('hidden');
        });

        var skipBtn = modal.querySelector('.modal-skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', function() {
                modal.classList.add('hidden');
                skipNode(node.index);
            });
        }

        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    // ─── STATE ────────────────────────────────────────────────────

    function saveIslandState() {
        var state = Game.getState();
        state.island = {
            unlockedNodes: unlockedNodes,
            currentNode: currentNode
        };
        Game.save();
    }

    function getRestorationPercent() {
        return Math.round((unlockedNodes.length / allNodes.length) * 100);
    }

    function getCreatureCount() {
        var count = 0;
        for (var i = 0; i < unlockedNodes.length; i++) {
            if (allNodes[unlockedNodes[i]] && allNodes[unlockedNodes[i]].boss) count++;
        }
        return count;
    }

    return {
        init: init,
        unlockNode: unlockNode,
        skipNode: skipNode,
        getRestorationPercent: getRestorationPercent,
        getCreatureCount: getCreatureCount,
        renderIslandMap: renderRoadmap,
        allNodes: allNodes,
        REGIONS: REGIONS
    };
})();
