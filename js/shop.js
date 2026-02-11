// Haven - Shop: Gems, Items, Bundles
'use strict';

const Shop = (() => {
    const shopItems = [
        // Energy
        { id: 'energy5',   name: 'Energy Pack',      desc: '5 Energy refill',             price: 20,  icon: '⚡', category: 'energy',
          action: function() { Game.addEnergy(5); } },
        { id: 'energy_full', name: 'Full Recharge',   desc: 'Fully recharge energy',       price: 35,  icon: '🔋', category: 'energy',
          action: function() { Game.addEnergy(Game.MAX_ENERGY); } },

        // Boosts
        { id: 'lucky_spawn', name: 'Lucky Spawn',     desc: 'Next 5 spawns are rare+',     price: 30,  icon: '🍀', category: 'boost',
          action: function() { applyBoost('lucky_spawn', 5); } },
        { id: 'merge_bonus', name: 'Merge Bonus',     desc: '2x gems from merges (10 min)', price: 40, icon: '✨', category: 'boost',
          action: function() { applyBoost('merge_bonus', 600); } },

        // Creature eggs
        { id: 'common_egg',  name: 'Common Egg',      desc: 'A common creature egg',        price: 50,  icon: '🥚', category: 'eggs',
          action: function() { spawnEgg(0); } },
        { id: 'rare_egg',    name: 'Rare Egg',        desc: 'A rare creature egg',          price: 150, icon: '🥚', category: 'eggs',
          action: function() { spawnEgg(2); } },
        { id: 'epic_egg',    name: 'Epic Egg',        desc: 'An epic creature egg',         price: 400, icon: '🥚', category: 'eggs',
          action: function() { spawnEgg(3); } },

        // Power-Ups
        { id: 'pu_mass3',    name: 'Mass Match \u00D73',  desc: '3 Mass Match power-ups',      price: 60,  icon: '\u{1F4A5}', category: 'powerups',
          action: function() { PowerUps.addToInventory('mass_match', 3); } },
        { id: 'pu_sort3',    name: 'Sort & Sweep \u00D73', desc: '3 Sort & Sweep power-ups',   price: 45,  icon: '\u{1F9F9}', category: 'powerups',
          action: function() { PowerUps.addToInventory('sort_sweep', 3); } },
        { id: 'pu_shuffle5', name: 'Shuffle \u00D75',     desc: '5 Shuffle power-ups',         price: 60,  icon: '\u{1F500}', category: 'powerups',
          action: function() { PowerUps.addToInventory('shuffle', 5); } },
        { id: 'pu_wand2',    name: 'Upgrade Wand \u00D72', desc: '2 Upgrade Wands',            price: 55,  icon: '\u{1FA84}', category: 'powerups',
          action: function() { PowerUps.addToInventory('upgrade_wand', 2); } },
        { id: 'pu_pack',     name: 'Power Pack',       desc: '2 of each power-up',           price: 120, icon: '\u{1F381}', category: 'powerups',
          action: function() {
              PowerUps.addToInventory('mass_match', 2);
              PowerUps.addToInventory('sort_sweep', 2);
              PowerUps.addToInventory('shuffle', 2);
              PowerUps.addToInventory('upgrade_wand', 2);
              PowerUps.addToInventory('lightning', 2);
              PowerUps.addToInventory('golden_spawn', 2);
          } },

        // Biome Eggs
        { id: 'egg_meadow',    name: 'Meadow Egg',     desc: 'Discover a Meadow creature',    price: 80,   icon: '\u{1F33E}', category: 'biome_eggs',
          action: function() { discoverBiomeCreature('meadow'); } },
        { id: 'egg_forest',    name: 'Forest Egg',     desc: 'Discover a Forest creature',    price: 80,   icon: '\u{1F332}', category: 'biome_eggs',
          action: function() { discoverBiomeCreature('forest'); } },
        { id: 'egg_ocean',     name: 'Ocean Egg',      desc: 'Discover an Ocean creature',    price: 100,  icon: '\u{1F30A}', category: 'biome_eggs',
          action: function() { discoverBiomeCreature('ocean'); } },
        { id: 'egg_enchanted', name: 'Enchanted Egg',  desc: 'Discover an Enchanted creature', price: 200, icon: '\u2728', category: 'biome_eggs',
          action: function() { discoverBiomeCreature('enchanted'); } },
        { id: 'egg_celestial', name: 'Celestial Egg',  desc: 'Discover a Celestial creature',  price: 300, icon: '\u{1F4AB}', category: 'biome_eggs',
          action: function() { discoverBiomeCreature('celestial'); } },

        // Gem bundles (simulated IAP)
        { id: 'gems_small',  name: 'Gem Pouch',       desc: '100 Gems',                    price: -1, priceLabel: '$0.99',  icon: '\u{1F48E}', category: 'gems', gems: 100 },
        { id: 'gems_medium', name: 'Gem Chest',       desc: '500 Gems + bonus',            price: -1, priceLabel: '$4.99',  icon: '\u{1F48E}', category: 'gems', gems: 550 },
        { id: 'gems_large',  name: 'Gem Vault',       desc: '1200 Gems + big bonus',       price: -1, priceLabel: '$9.99',  icon: '\u{1F48E}', category: 'gems', gems: 1350 },
        { id: 'gems_mega',   name: 'Gem Treasury',    desc: '3000 Gems + huge bonus',      price: -1, priceLabel: '$19.99', icon: '\u{1F48E}', category: 'gems', gems: 3500 },
    ];

    // Starter pack (appears once)
    const starterPack = {
        id: 'starter_pack',
        name: 'Starter Pack',
        desc: '500 Gems + 30 Energy + Rare Egg',
        priceLabel: '$1.99',
        originalLabel: '$12.99',
        icon: '🎁',
        gems: 500
    };

    // Piggy bank
    let piggyGems = 0;

    let boosts = {};

    function init() {
        var state = Game.getState();
        if (state.shop) {
            piggyGems = state.shop.piggyGems || 0;
            boosts = state.shop.boosts || {};
        }

        // Accumulate piggy gems on merges
        Game.on('mergeCompleted', function() {
            piggyGems += 1 + Math.floor(Math.random() * 3);
            saveShopState();
        });

        renderShop();
    }

    function purchaseItem(itemId) {
        var item = shopItems.find(function(i) { return i.id === itemId; });
        if (!item) return;

        if (item.price > 0) {
            // Gem purchase
            if (Game.getGems() < item.price) {
                showShopToast('Not enough gems!');
                Sound.playError();
                return;
            }
            Game.addGems(-item.price);
            if (item.action) item.action();
            Sound.playCelebration();
            showShopToast(item.name + ' purchased!');
        } else {
            // Simulated real money purchase
            simulatePurchase(item);
        }

        renderShop();
    }

    function simulatePurchase(item) {
        // Simulate IAP with a confirmation dialog
        var confirmed = confirm('DEMO: Purchase ' + item.name + ' for ' + item.priceLabel + '?\n(This is a prototype — no real charge)');
        if (confirmed) {
            if (item.gems) {
                Game.addGems(item.gems);
            }
            Sound.playCelebration();
            Game.vibrate([15, 30, 15]);
            showShopToast(item.name + ' — ' + (item.gems || 0) + ' gems added!');
        }
    }

    function purchaseStarterPack() {
        var state = Game.getState();
        if (state.shop && state.shop.starterBought) {
            showShopToast('Already purchased!');
            return;
        }
        var confirmed = confirm('DEMO: Purchase Starter Pack for ' + starterPack.priceLabel + '?\n(This is a prototype — no real charge)');
        if (confirmed) {
            Game.addGems(starterPack.gems);
            Game.addEnergy(30);
            // Spawn a rare egg on the board
            spawnEgg(2);
            state.shop = state.shop || {};
            state.shop.starterBought = true;
            Game.save();
            Sound.playCelebration();
            showShopToast('Starter Pack activated!');
            renderShop();
        }
    }

    function breakPiggyBank() {
        if (piggyGems <= 0) {
            showShopToast('Piggy bank is empty!');
            return;
        }
        var confirmed = confirm('DEMO: Unlock piggy bank with ' + piggyGems + ' gems for $2.99?\n(This is a prototype — no real charge)');
        if (confirmed) {
            Game.addGems(piggyGems);
            Sound.playCelebration();
            showShopToast(piggyGems + ' gems collected from piggy bank!');
            piggyGems = 0;
            saveShopState();
            renderShop();
        }
    }

    function simulateRewardedAd() {
        showShopToast('Watching ad...');
        // Simulate a 3-second ad
        setTimeout(function() {
            var reward = 5 + Math.floor(Math.random() * 6); // 5-10 gems
            Game.addGems(reward);
            Game.addEnergy(2);
            Sound.playCelebration();
            showShopToast('Ad reward: +' + reward + ' gems + 2 energy!');
            renderShop();
        }, 3000);
    }

    function discoverBiomeCreature(biomeId) {
        // Force a hatchery discovery from a specific biome
        var creatures = CreatureData.creatures;
        var state = Game.getState();
        var discovered = (state.hatchery && state.hatchery.discovered) || {};
        var pool = [];
        for (var i = 0; i < creatures.length; i++) {
            if (creatures[i].biome === biomeId && !discovered[creatures[i].id]) {
                pool.push(creatures[i]);
            }
        }
        if (pool.length === 0) {
            showShopToast('All ' + biomeId + ' creatures already discovered!');
            return;
        }
        var picked = pool[Math.floor(Math.random() * pool.length)];
        discovered[picked.id] = { discoveredAt: Date.now(), tier: 0 };
        state.hatchery = { discovered: discovered };
        Game.save();
        Game.emit('creatureDiscovered', { creature: picked.id, rarity: picked.rarity, biome: picked.biome });
        showShopToast(picked.emoji + ' Discovered ' + picked.name + '!');
        Sound.playCelebration();
    }

    function spawnEgg(tier) {
        // Spawn a creature item on the board
        Game.emit('shopSpawnRequest', { chain: 'creature', tier: tier });
    }

    function applyBoost(boostId, duration) {
        boosts[boostId] = Date.now() + duration * 1000;
        saveShopState();
    }

    function isBoostActive(boostId) {
        return boosts[boostId] && Date.now() < boosts[boostId];
    }

    // ─── RENDERING ───────────────────────────────────────────

    function renderShop() {
        var container = document.getElementById('shop-content');
        if (!container) return;

        var state = Game.getState();
        var html = '';

        // Rewarded Ad
        html += '<div class="shop-section">';
        html += '<h3 class="shop-section-title">Free Rewards</h3>';
        html += '<div class="shop-item ad-item" id="shop-ad">';
        html += '<span class="shop-item-icon">📺</span>';
        html += '<div class="shop-item-info"><span class="shop-item-name">Watch Ad</span>';
        html += '<span class="shop-item-desc">Gems + 2 energy</span></div>';
        html += '<button class="shop-buy-btn ad-btn">Watch</button>';
        html += '</div></div>';

        // Starter Pack (if not bought and enough play sessions)
        if (!state.shop || !state.shop.starterBought) {
            html += '<div class="shop-section">';
            html += '<h3 class="shop-section-title">🎁 Limited Offer</h3>';
            html += '<div class="shop-item starter-item" id="shop-starter">';
            html += '<span class="shop-item-icon">🎁</span>';
            html += '<div class="shop-item-info"><span class="shop-item-name">' + starterPack.name + '</span>';
            html += '<span class="shop-item-desc">' + starterPack.desc + '</span></div>';
            html += '<div class="shop-price-stack"><span class="shop-original-price">' + starterPack.originalLabel + '</span>';
            html += '<button class="shop-buy-btn iap-btn">' + starterPack.priceLabel + '</button></div>';
            html += '</div></div>';
        }

        // Piggy Bank
        html += '<div class="shop-section">';
        html += '<h3 class="shop-section-title">🐷 Piggy Bank</h3>';
        html += '<div class="shop-item piggy-item" id="shop-piggy">';
        html += '<span class="shop-item-icon">🐷</span>';
        html += '<div class="shop-item-info"><span class="shop-item-name">' + piggyGems + ' gems saved</span>';
        html += '<span class="shop-item-desc">Accumulates as you merge</span></div>';
        html += '<button class="shop-buy-btn iap-btn" ' + (piggyGems <= 0 ? 'disabled' : '') + '>$2.99</button>';
        html += '</div></div>';

        // Energy & Boosts
        html += '<div class="shop-section">';
        html += '<h3 class="shop-section-title">⚡ Energy & Boosts</h3>';
        shopItems.filter(function(i) { return i.category === 'energy' || i.category === 'boost'; }).forEach(function(item) {
            html += '<div class="shop-item" data-item="' + item.id + '">';
            html += '<span class="shop-item-icon">' + item.icon + '</span>';
            html += '<div class="shop-item-info"><span class="shop-item-name">' + item.name + '</span>';
            html += '<span class="shop-item-desc">' + item.desc + '</span></div>';
            html += '<button class="shop-buy-btn gem-btn">💎 ' + item.price + '</button>';
            html += '</div>';
        });
        html += '</div>';

        // Power-Ups
        html += '<div class="shop-section">';
        html += '<h3 class="shop-section-title">\u{1F4A5} Power-Ups</h3>';
        shopItems.filter(function(i) { return i.category === 'powerups'; }).forEach(function(item) {
            html += '<div class="shop-item" data-item="' + item.id + '">';
            html += '<span class="shop-item-icon">' + item.icon + '</span>';
            html += '<div class="shop-item-info"><span class="shop-item-name">' + item.name + '</span>';
            html += '<span class="shop-item-desc">' + item.desc + '</span></div>';
            html += '<button class="shop-buy-btn gem-btn">\u{1F48E} ' + item.price + '</button>';
            html += '</div>';
        });
        html += '</div>';

        // Creature Eggs
        html += '<div class="shop-section">';
        html += '<h3 class="shop-section-title">\u{1F95A} Creature Eggs</h3>';
        shopItems.filter(function(i) { return i.category === 'eggs'; }).forEach(function(item) {
            html += '<div class="shop-item" data-item="' + item.id + '">';
            html += '<span class="shop-item-icon">' + item.icon + '</span>';
            html += '<div class="shop-item-info"><span class="shop-item-name">' + item.name + '</span>';
            html += '<span class="shop-item-desc">' + item.desc + '</span></div>';
            html += '<button class="shop-buy-btn gem-btn">\u{1F48E} ' + item.price + '</button>';
            html += '</div>';
        });
        html += '</div>';

        // Biome Eggs
        html += '<div class="shop-section">';
        html += '<h3 class="shop-section-title">\u{1F30D} Biome Eggs</h3>';
        shopItems.filter(function(i) { return i.category === 'biome_eggs'; }).forEach(function(item) {
            html += '<div class="shop-item" data-item="' + item.id + '">';
            html += '<span class="shop-item-icon">' + item.icon + '</span>';
            html += '<div class="shop-item-info"><span class="shop-item-name">' + item.name + '</span>';
            html += '<span class="shop-item-desc">' + item.desc + '</span></div>';
            html += '<button class="shop-buy-btn gem-btn">\u{1F48E} ' + item.price + '</button>';
            html += '</div>';
        });
        html += '</div>';

        // Gem Bundles
        html += '<div class="shop-section">';
        html += '<h3 class="shop-section-title">💎 Gem Bundles</h3>';
        shopItems.filter(function(i) { return i.category === 'gems'; }).forEach(function(item) {
            html += '<div class="shop-item" data-item="' + item.id + '">';
            html += '<span class="shop-item-icon">' + item.icon + '</span>';
            html += '<div class="shop-item-info"><span class="shop-item-name">' + item.name + '</span>';
            html += '<span class="shop-item-desc">' + item.desc + '</span></div>';
            html += '<button class="shop-buy-btn iap-btn">' + item.priceLabel + '</button>';
            html += '</div>';
        });
        html += '</div>';

        container.innerHTML = html;

        // Attach event listeners
        container.querySelectorAll('.shop-item[data-item]').forEach(function(el) {
            el.querySelector('.shop-buy-btn').addEventListener('click', function() {
                purchaseItem(el.dataset.item);
            });
        });

        var adBtn = document.getElementById('shop-ad');
        if (adBtn) adBtn.querySelector('.shop-buy-btn').addEventListener('click', simulateRewardedAd);

        var starterBtn = document.getElementById('shop-starter');
        if (starterBtn) starterBtn.querySelector('.shop-buy-btn').addEventListener('click', purchaseStarterPack);

        var piggyBtn = document.getElementById('shop-piggy');
        if (piggyBtn) piggyBtn.querySelector('.shop-buy-btn').addEventListener('click', breakPiggyBank);
    }

    function showShopToast(msg) {
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();
        var el = document.createElement('div');
        el.className = 'toast';
        el.textContent = msg;
        document.getElementById('app').appendChild(el);
        setTimeout(function() { el.classList.add('toast-show'); }, 10);
        setTimeout(function() {
            el.classList.remove('toast-show');
            setTimeout(function() { el.remove(); }, 300);
        }, 2000);
    }

    function saveShopState() {
        var state = Game.getState();
        state.shop = state.shop || {};
        state.shop.piggyGems = piggyGems;
        state.shop.boosts = boosts;
        Game.save();
    }

    return {
        init: init,
        purchaseItem: purchaseItem,
        renderShop: renderShop,
        isBoostActive: isBoostActive,
        getPiggyGems: function() { return piggyGems; }
    };
})();
