// Haven - Recipe Book: Discovery, Display, Hints for Cross-Chain Recipes
'use strict';

const Recipes = (() => {
    // Recipe definitions keyed by hybrid chain name
    const RECIPE_DEFS = {
        living: {
            chainA: 'wood',
            chainB: 'flora',
            hybridChain: 'living',
            hint: 'Something magical happens when nature meets timber...'
        },
        arcane: {
            chainA: 'crystal',
            chainB: 'stone',
            hybridChain: 'arcane',
            hint: 'Ancient power sleeps where gems touch stone...'
        },
        shelter: {
            chainA: 'stone',
            chainB: 'wood',
            hybridChain: 'shelter',
            hint: 'A sturdy foundation needs both earth and wood...'
        },
        mystic: {
            chainA: 'crystal',
            chainB: 'flora',
            hybridChain: 'mystic',
            hint: 'Blossoms shimmer when touched by crystal light...'
        }
    };

    const RECIPE_ORDER = ['living', 'arcane', 'shelter', 'mystic'];

    let modalEl = null;
    let detailEl = null;
    let hintShown = false;

    // ─── INIT ────────────────────────────────────────────────

    function init() {
        ensureState();
        createModal();
        createButton();
        listenForDiscoveries();
    }

    function ensureState() {
        var state = Game.getState();
        if (!state.recipes) {
            state.recipes = {
                discovered: {
                    living: false,
                    arcane: false,
                    shelter: false,
                    mystic: false
                }
            };
            Game.save();
        }
        // Backfill any missing keys
        var disc = state.recipes.discovered;
        RECIPE_ORDER.forEach(function(key) {
            if (disc[key] === undefined) disc[key] = false;
        });
    }

    // ─── BUTTON ON BOARD SCREEN ──────────────────────────────

    function createButton() {
        var powerupBar = document.getElementById('powerup-bar');
        if (!powerupBar) return;

        var btn = document.createElement('button');
        btn.id = 'recipe-book-btn';
        btn.className = 'recipe-book-btn';
        btn.title = 'Recipe Book';
        btn.innerHTML = '<span class="recipe-book-icon">\u{1F4D6}</span>';
        btn.addEventListener('click', function() {
            openBook();
            if (typeof Sound !== 'undefined') Sound.playTap();
        });

        // Place it after the powerup bar, before the orders panel
        powerupBar.insertAdjacentElement('afterend', btn);
    }

    // ─── MODAL ───────────────────────────────────────────────

    function createModal() {
        modalEl = document.createElement('div');
        modalEl.id = 'recipe-modal';
        modalEl.className = 'hidden';
        modalEl.innerHTML =
            '<div class="recipe-modal-backdrop"></div>' +
            '<div class="recipe-modal-content">' +
                '<div class="recipe-modal-header">' +
                    '<h2>\u{1F4D6} Recipe Book</h2>' +
                    '<button class="recipe-close-btn">\u2715</button>' +
                '</div>' +
                '<div id="recipe-grid" class="recipe-grid"></div>' +
                '<div id="recipe-hint-banner" class="recipe-hint-banner hidden"></div>' +
            '</div>';

        document.getElementById('app').appendChild(modalEl);

        // Close button
        modalEl.querySelector('.recipe-close-btn').addEventListener('click', closeBook);
        modalEl.querySelector('.recipe-modal-backdrop').addEventListener('click', closeBook);

        // Detail view (created but hidden)
        detailEl = document.createElement('div');
        detailEl.id = 'recipe-detail';
        detailEl.className = 'recipe-detail hidden';
        modalEl.querySelector('.recipe-modal-content').appendChild(detailEl);
    }

    function openBook() {
        ensureState();
        renderGrid();
        renderHintBanner();
        modalEl.classList.remove('hidden');

        // Hide detail view when opening
        detailEl.classList.add('hidden');
        document.getElementById('recipe-grid').classList.remove('hidden');
    }

    function closeBook() {
        modalEl.classList.add('hidden');
    }

    // ─── GRID RENDER ─────────────────────────────────────────

    function renderGrid() {
        var gridEl = document.getElementById('recipe-grid');
        gridEl.innerHTML = '';
        var state = Game.getState();

        RECIPE_ORDER.forEach(function(key) {
            var def = RECIPE_DEFS[key];
            var discovered = state.recipes.discovered[key];
            var card = document.createElement('div');
            card.className = 'recipe-card' + (discovered ? ' discovered' : ' undiscovered');
            card.dataset.recipe = key;

            if (discovered) {
                card.innerHTML = buildDiscoveredCard(key, def);
                card.addEventListener('click', function() {
                    showDetail(key);
                    if (typeof Sound !== 'undefined') Sound.playTap();
                });
            } else {
                card.innerHTML = buildUndiscoveredCard(def);
            }

            gridEl.appendChild(card);
        });
    }

    function buildDiscoveredCard(key, def) {
        var chainA = Items.chains[def.chainA];
        var chainB = Items.chains[def.chainB];
        var hybrid = Items.chains[def.hybridChain];

        return '' +
            '<div class="recipe-card-parents">' +
                '<span class="recipe-chain-icon" style="color:' + chainA.nodeColor + '">' + chainA.icon + '</span>' +
                '<span class="recipe-plus">+</span>' +
                '<span class="recipe-chain-icon" style="color:' + chainB.nodeColor + '">' + chainB.icon + '</span>' +
            '</div>' +
            '<div class="recipe-card-arrow">\u2192</div>' +
            '<div class="recipe-card-result">' +
                '<span class="recipe-result-icon">' + hybrid.icon + '</span>' +
                '<span class="recipe-result-name">' + hybrid.name + '</span>' +
            '</div>' +
            '<div class="recipe-card-tap">Tap for details</div>';
    }

    function buildUndiscoveredCard(def) {
        return '' +
            '<div class="recipe-card-parents">' +
                '<span class="recipe-chain-icon silhouetted">\u2753</span>' +
                '<span class="recipe-plus">+</span>' +
                '<span class="recipe-chain-icon silhouetted">\u2753</span>' +
            '</div>' +
            '<div class="recipe-card-arrow">\u2192</div>' +
            '<div class="recipe-card-result">' +
                '<span class="recipe-result-icon silhouetted">?</span>' +
                '<span class="recipe-result-name undiscovered-name">???</span>' +
            '</div>' +
            '<div class="recipe-card-hint">' + def.hint + '</div>';
    }

    // ─── DETAIL VIEW ─────────────────────────────────────────

    function showDetail(key) {
        var def = RECIPE_DEFS[key];
        var chainA = Items.chains[def.chainA];
        var chainB = Items.chains[def.chainB];
        var hybrid = Items.chains[def.hybridChain];

        var tiersHTML = '';
        for (var i = 0; i < hybrid.tiers.length; i++) {
            var t = hybrid.tiers[i];
            tiersHTML +=
                '<div class="recipe-tier-row">' +
                    '<div class="recipe-tier-item" style="background:radial-gradient(circle at 35% 35%,' + t.bg[0] + ',' + t.bg[1] + ');box-shadow:0 0 8px ' + t.glow + '">' +
                        '<span class="recipe-tier-symbol">' + t.symbol + '</span>' +
                    '</div>' +
                    '<div class="recipe-tier-info">' +
                        '<span class="recipe-tier-name">' + t.name + '</span>' +
                        '<span class="recipe-tier-label">Tier ' + (i + 1) + '</span>' +
                    '</div>' +
                '</div>';
        }

        detailEl.innerHTML =
            '<button class="recipe-detail-back">\u2190 Back</button>' +
            '<div class="recipe-detail-header">' +
                '<span class="recipe-detail-icon">' + hybrid.icon + '</span>' +
                '<h3>' + hybrid.name + ' Chain</h3>' +
            '</div>' +
            '<div class="recipe-detail-formula">' +
                '<span class="recipe-chain-icon" style="color:' + chainA.nodeColor + '">' + chainA.icon + '</span>' +
                '<span class="recipe-chain-label">' + chainA.name + '</span>' +
                '<span class="recipe-plus">+</span>' +
                '<span class="recipe-chain-icon" style="color:' + chainB.nodeColor + '">' + chainB.icon + '</span>' +
                '<span class="recipe-chain-label">' + chainB.name + '</span>' +
            '</div>' +
            '<div class="recipe-detail-rule">' +
                'Combine two <strong>Tier N</strong> items from <strong>' + chainA.name + '</strong> and <strong>' + chainB.name + '</strong> ' +
                'to create a <strong>Tier N\u22121</strong> ' + hybrid.name + ' item.' +
            '</div>' +
            '<div class="recipe-detail-hint">' +
                'Higher tier inputs create higher tier hybrids!' +
            '</div>' +
            '<div class="recipe-tier-list">' +
                tiersHTML +
            '</div>';

        detailEl.querySelector('.recipe-detail-back').addEventListener('click', function() {
            detailEl.classList.add('hidden');
            document.getElementById('recipe-grid').classList.remove('hidden');
            if (typeof Sound !== 'undefined') Sound.playTap();
        });

        document.getElementById('recipe-grid').classList.add('hidden');
        detailEl.classList.remove('hidden');
    }

    // ─── HINT BANNER ─────────────────────────────────────────

    function renderHintBanner() {
        var banner = document.getElementById('recipe-hint-banner');
        var state = Game.getState();
        var totalMerges = (state.stats && state.stats.totalMerges) || 0;
        var allDiscovered = RECIPE_ORDER.every(function(k) { return state.recipes.discovered[k]; });

        if (allDiscovered) {
            banner.classList.add('hidden');
            return;
        }

        if (totalMerges >= 20) {
            banner.textContent = 'Try merging items from different chains...';
            banner.classList.remove('hidden');
        } else {
            banner.classList.add('hidden');
        }
    }

    // ─── DISCOVERY ───────────────────────────────────────────

    function listenForDiscoveries() {
        Game.on('crossChainMerge', function(data) {
            if (!data || !data.chain) return;
            discoverRecipe(data.chain);
        });
    }

    function discoverRecipe(hybridChain) {
        ensureState();
        var state = Game.getState();

        if (!state.recipes.discovered.hasOwnProperty(hybridChain)) return;
        if (state.recipes.discovered[hybridChain]) return; // already discovered

        state.recipes.discovered[hybridChain] = true;
        Game.save();

        showDiscoveryAnimation(hybridChain);
    }

    function showDiscoveryAnimation(hybridChain) {
        var hybrid = Items.chains[hybridChain];
        if (!hybrid) return;

        // Create a full-screen celebration overlay
        var overlay = document.createElement('div');
        overlay.className = 'recipe-discovery-overlay';
        overlay.innerHTML =
            '<div class="recipe-discovery-card">' +
                '<div class="recipe-discovery-sparkle"></div>' +
                '<div class="recipe-discovery-icon">' + hybrid.icon + '</div>' +
                '<h3>Recipe Discovered!</h3>' +
                '<p class="recipe-discovery-name">' + hybrid.name + ' Chain</p>' +
                '<p class="recipe-discovery-sub">Check the Recipe Book for details</p>' +
                '<button class="recipe-discovery-btn">Awesome!</button>' +
            '</div>';

        document.getElementById('app').appendChild(overlay);

        // Fade in
        requestAnimationFrame(function() {
            overlay.classList.add('recipe-discovery-show');
        });

        var closeOverlay = function() {
            overlay.classList.remove('recipe-discovery-show');
            setTimeout(function() { overlay.remove(); }, 300);
        };

        overlay.querySelector('.recipe-discovery-btn').addEventListener('click', closeOverlay);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeOverlay();
        });

        // Pulse the recipe book button
        var bookBtn = document.getElementById('recipe-book-btn');
        if (bookBtn) {
            bookBtn.classList.add('recipe-btn-pulse');
            setTimeout(function() { bookBtn.classList.remove('recipe-btn-pulse'); }, 3000);
        }
    }

    // ─── PUBLIC API ──────────────────────────────────────────

    return {
        init: init,
        openBook: openBook,
        closeBook: closeBook,
        discoverRecipe: discoverRecipe
    };
})();
