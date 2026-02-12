// Haven - Shop: Gems, Items, Bundles
'use strict';

const Shop = (() => {
    const shopItems = [
        // Energy
        { id: 'energy5',   name: 'Energy Pack',      desc: '5 Energy refill',             price: 20,  icon: '⚡', category: 'energy',
          action: function() { Game.addEnergy(5); } },
        { id: 'energy_full', name: 'Full Recharge',   desc: 'Fully recharge energy',       price: 75,  icon: '🔋', category: 'energy',
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
        { id: 'egg_meadow',    name: 'Meadow Egg',     desc: 'Discover a Meadow creature',    price: 250,  icon: '\u{1F33E}', category: 'biome_eggs',
          action: function() { discoverBiomeCreature('meadow'); } },
        { id: 'egg_forest',    name: 'Forest Egg',     desc: 'Discover a Forest creature',    price: 250,  icon: '\u{1F332}', category: 'biome_eggs',
          action: function() { discoverBiomeCreature('forest'); } },
        { id: 'egg_ocean',     name: 'Ocean Egg',      desc: 'Discover an Ocean creature',    price: 350,  icon: '\u{1F30A}', category: 'biome_eggs',
          action: function() { discoverBiomeCreature('ocean'); } },
        { id: 'egg_enchanted', name: 'Enchanted Egg',  desc: 'Discover an Enchanted creature', price: 600, icon: '\u2728', category: 'biome_eggs',
          action: function() { discoverBiomeCreature('enchanted'); } },
        { id: 'egg_celestial', name: 'Celestial Egg',  desc: 'Discover a Celestial creature',  price: 900, icon: '\u{1F4AB}', category: 'biome_eggs',
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

    // ─── DAILY DEALS (rotating, time-limited) ─────────────────
    var DAILY_DEAL_POOL = [
        { id: 'dd_energy10',   name: 'Energy Mega Pack',   desc: '10 Energy (50% off!)',         normalPrice: 40,  dealPrice: 20,  icon: '\u26A1',     action: function() { Game.addEnergy(10); } },
        { id: 'dd_rare_egg',   name: 'Rare Egg Deal',      desc: 'Rare Egg at half price',       normalPrice: 150, dealPrice: 75,  icon: '\u{1F95A}',  action: function() { spawnEgg(2); } },
        { id: 'dd_epic_egg',   name: 'Epic Egg Flash Sale', desc: 'Epic Egg 40% off',            normalPrice: 400, dealPrice: 240, icon: '\u{1F95A}',  action: function() { spawnEgg(3); } },
        { id: 'dd_power_pack', name: 'Power Combo',        desc: '3 of each power-up',           normalPrice: 180, dealPrice: 90,  icon: '\u{1F4A5}',  action: function() { var types = ['mass_match','sort_sweep','shuffle','upgrade_wand','lightning','golden_spawn']; for(var i=0;i<types.length;i++) PowerUps.addToInventory(types[i],3); } },
        { id: 'dd_gem200',     name: 'Gem Jackpot',        desc: '200 gems for price of 100',    normalPrice: 200, dealPrice: 100, icon: '\u{1F48E}',  action: function() { Game.addGems(200); } },
        { id: 'dd_merge_boost',name: 'Merge Bonanza',      desc: '2x gems from merges (30 min)', normalPrice: 80,  dealPrice: 35,  icon: '\u2728',     action: function() { applyBoost('merge_bonus', 1800); } },
        { id: 'dd_biome_rand', name: 'Mystery Biome Egg',  desc: 'Random biome creature!',       normalPrice: 350, dealPrice: 175, icon: '\u{1F30D}',  action: function() { var b = ['meadow','forest','ocean','enchanted']; discoverBiomeCreature(b[Math.floor(Math.random()*b.length)]); } },
        { id: 'dd_shuffle10',  name: 'Shuffle Stash',      desc: '10 Shuffles (60% off!)',       normalPrice: 120, dealPrice: 48,  icon: '\u{1F500}',  action: function() { PowerUps.addToInventory('shuffle', 10); } },
    ];
    var dailyDeals = [];
    var dailyDealDate = null;

    function generateDailyDeals() {
        var today = new Date().toISOString().slice(0, 10);
        if (dailyDealDate === today && dailyDeals.length > 0) return;

        // Seeded random from date for deterministic daily deals
        var seed = 0;
        for (var i = 0; i < today.length; i++) seed += today.charCodeAt(i) * (i + 1);

        var shuffled = DAILY_DEAL_POOL.slice();
        for (var j = shuffled.length - 1; j > 0; j--) {
            seed = (seed * 16807 + 1) % 2147483647;
            var k = seed % (j + 1);
            var temp = shuffled[j]; shuffled[j] = shuffled[k]; shuffled[k] = temp;
        }

        dailyDeals = shuffled.slice(0, 3);
        dailyDealDate = today;

        // Load purchased state
        var state = Game.getState();
        var purchased = (state.shop && state.shop.dailyDealsPurchased && state.shop.dailyDealsPurchased.date === today)
            ? state.shop.dailyDealsPurchased.ids : {};
        for (var d = 0; d < dailyDeals.length; d++) {
            dailyDeals[d].purchased = !!purchased[dailyDeals[d].id];
        }
    }

    function purchaseDailyDeal(dealIndex) {
        var deal = dailyDeals[dealIndex];
        if (!deal || deal.purchased) return;
        if (Game.getGems() < deal.dealPrice) {
            showShopToast('Not enough gems!');
            Sound.playError();
            return;
        }
        Game.addGems(-deal.dealPrice);
        deal.action();
        deal.purchased = true;

        var state = Game.getState();
        state.shop = state.shop || {};
        state.shop.dailyDealsPurchased = state.shop.dailyDealsPurchased || { date: dailyDealDate, ids: {} };
        state.shop.dailyDealsPurchased.date = dailyDealDate;
        state.shop.dailyDealsPurchased.ids[deal.id] = true;
        Game.save();

        Sound.playPurchase();
        showShopToast(deal.name + ' purchased!');
        renderShop();
    }

    function init() {
        var state = Game.getState();
        if (state.shop) {
            piggyGems = state.shop.piggyGems || 0;
            boosts = state.shop.boosts || {};
        }

        generateDailyDeals();

        // Accumulate piggy gems on merges
        Game.on('mergeCompleted', function() {
            piggyGems += 1 + Math.floor(Math.random() * 3);
            saveShopState();
        });

        // Re-render shop when board is expanded (update/remove expand option)
        Game.on('boardExpanded', function() {
            renderShop();
        });

        // Re-render shop when a creature is evolved or theme changes
        Game.on('creatureEvolved', function() { renderShop(); });
        Game.on('boardThemeChanged', function() { renderShop(); });

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
            Sound.playPurchase();
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
            Sound.playPurchase();
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
            Sound.playPurchase();
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
            Sound.playPurchase();
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
        Sound.playCreatureDiscover();
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

        // Daily Deals
        generateDailyDeals();
        var dealHoursLeft = 24 - new Date().getHours();
        html += '<div class="shop-section shop-daily-deals">';
        html += '<h3 class="shop-section-title">\u{1F525} Daily Deals <span class="deal-timer">Refreshes in ' + dealHoursLeft + 'h</span></h3>';
        for (var dd = 0; dd < dailyDeals.length; dd++) {
            var deal = dailyDeals[dd];
            html += '<div class="shop-item deal-item' + (deal.purchased ? ' deal-purchased' : '') + '" data-deal="' + dd + '">';
            html += '<span class="shop-item-icon">' + deal.icon + '</span>';
            html += '<div class="shop-item-info"><span class="shop-item-name">' + deal.name + '</span>';
            html += '<span class="shop-item-desc">' + deal.desc + '</span></div>';
            if (deal.purchased) {
                html += '<span class="deal-sold-badge">SOLD</span>';
            } else {
                html += '<div class="shop-price-stack"><span class="shop-original-price">\u{1F48E}' + deal.normalPrice + '</span>';
                html += '<button class="shop-buy-btn deal-btn">\u{1F48E} ' + deal.dealPrice + '</button></div>';
            }
            html += '</div>';
        }
        html += '</div>';

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

        // Board Expansion
        var nextExp = Game.getNextBoardExpansion();
        if (nextExp) {
            html += '<div class="shop-section">';
            html += '<h3 class="shop-section-title">\u{1F4D0} Board Expansion</h3>';
            html += '<div class="shop-item" id="shop-expand">';
            html += '<span class="shop-item-icon">\u2795</span>';
            html += '<div class="shop-item-info"><span class="shop-item-name">Expand to ' + nextExp.label + '</span>';
            html += '<span class="shop-item-desc">More space for items and merges!</span></div>';
            html += '<button class="shop-buy-btn gem-btn">\u{1F48E} ' + nextExp.cost + '</button>';
            html += '</div></div>';
        }

        // Creature Evolution
        if (typeof Creatures !== 'undefined') {
            var discoveredMap = (state.hatchery && state.hatchery.discovered) || {};
            var evolvedMap = state.evolvedCreatures || {};
            var evolvable = [];
            for (var ei = 0; ei < CreatureData.creatures.length; ei++) {
                var ec = CreatureData.creatures[ei];
                if (discoveredMap[ec.id] && !evolvedMap[ec.id]) {
                    evolvable.push(ec);
                }
            }
            if (evolvable.length > 0) {
                html += '<div class="shop-section">';
                html += '<h3 class="shop-section-title">\u2728 Creature Evolution</h3>';
                // Show up to 6 evolvable creatures (prioritize rarer ones)
                var rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
                evolvable.sort(function(a, b) { return (rarityOrder[a.rarity] || 3) - (rarityOrder[b.rarity] || 3); });
                var showCount = Math.min(6, evolvable.length);
                for (var ej = 0; ej < showCount; ej++) {
                    var evo = evolvable[ej];
                    var evoCost = Creatures.getEvolutionCost(evo);
                    var rarLabel = evo.rarity.charAt(0).toUpperCase() + evo.rarity.slice(1);
                    html += '<div class="shop-item" data-evolve="' + evo.id + '">';
                    html += '<span class="shop-item-icon">' + evo.emoji + '</span>';
                    html += '<div class="shop-item-info"><span class="shop-item-name">Evolve ' + evo.name + '</span>';
                    html += '<span class="shop-item-desc">' + rarLabel + ' \u2022 1.75x bonus + faster companion</span></div>';
                    html += '<button class="shop-buy-btn gem-btn">\u{1F48E} ' + evoCost + '</button>';
                    html += '</div>';
                }
                if (evolvable.length > showCount) {
                    html += '<p style="font-size:10px;color:var(--text-secondary);text-align:center;padding:4px;">+' + (evolvable.length - showCount) + ' more in Hatchery</p>';
                }
                html += '</div>';
            }
        }

        // Cosmetic Board Themes
        var themes = Game.BOARD_THEMES || [];
        var ownedThemes = Game.getOwnedThemes();
        var currentTheme = Game.getBoardTheme();
        var hasUnowned = false;
        for (var ti = 0; ti < themes.length; ti++) {
            if (!ownedThemes[themes[ti].id]) { hasUnowned = true; break; }
        }
        if (themes.length > 0) {
            html += '<div class="shop-section">';
            html += '<h3 class="shop-section-title">\u{1F3A8} Board Themes</h3>';
            // Default theme option
            html += '<div class="shop-item" data-theme-select="default" style="' + (!currentTheme ? 'border:1px solid rgba(255,215,0,0.3);background:rgba(255,215,0,0.05);' : '') + '">';
            html += '<span class="shop-item-icon">\u2B1C</span>';
            html += '<div class="shop-item-info"><span class="shop-item-name">Default</span>';
            html += '<span class="shop-item-desc">Classic dark palette</span></div>';
            html += (!currentTheme ? '<span style="color:#ffd700;font-size:11px;font-weight:700;">ACTIVE</span>' : '<button class="shop-buy-btn" style="font-size:11px;">Use</button>');
            html += '</div>';
            for (var tj = 0; tj < themes.length; tj++) {
                var th = themes[tj];
                var owned = !!ownedThemes[th.id];
                var active = currentTheme === th.id;
                html += '<div class="shop-item" data-theme-id="' + th.id + '" ' + (owned ? 'data-theme-select="' + th.id + '"' : '') +
                    ' style="' + (active ? 'border:1px solid rgba(255,215,0,0.3);background:rgba(255,215,0,0.05);' : '') + '">';
                html += '<span class="shop-item-icon">' + th.icon + '</span>';
                html += '<div class="shop-item-info"><span class="shop-item-name">' + th.name + '</span>';
                html += '<span class="shop-item-desc">' + th.desc + '</span></div>';
                if (active) {
                    html += '<span style="color:#ffd700;font-size:11px;font-weight:700;">ACTIVE</span>';
                } else if (owned) {
                    html += '<button class="shop-buy-btn" style="font-size:11px;">Use</button>';
                } else {
                    html += '<button class="shop-buy-btn gem-btn" data-theme-buy="' + th.id + '">\u{1F48E} ' + th.cost + '</button>';
                }
                html += '</div>';
            }
            html += '</div>';
        }

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

        var expandBtn = document.getElementById('shop-expand');
        if (expandBtn) expandBtn.querySelector('.shop-buy-btn').addEventListener('click', function() {
            purchaseBoardExpansionFromShop();
        });

        // Daily deal buttons
        container.querySelectorAll('.deal-item[data-deal]').forEach(function(el) {
            var btn = el.querySelector('.deal-btn');
            if (btn) {
                btn.addEventListener('click', function() {
                    purchaseDailyDeal(parseInt(el.dataset.deal));
                });
            }
        });

        // Creature evolution buttons
        container.querySelectorAll('.shop-item[data-evolve]').forEach(function(el) {
            el.querySelector('.shop-buy-btn').addEventListener('click', function() {
                var creatureId = el.dataset.evolve;
                if (typeof Creatures !== 'undefined' && Creatures.evolveCreature) {
                    var success = Creatures.evolveCreature(creatureId);
                    if (success) {
                        var cr = Creatures.getCreatureById(creatureId);
                        showShopToast(cr ? (cr.emoji + ' ' + cr.name + ' evolved!') : 'Evolved!');
                    } else {
                        if (Game.getGems() < (Creatures.getEvolutionCost(Creatures.getCreatureById(creatureId)) || 200)) {
                            showShopToast('Not enough gems!');
                            Sound.playError();
                        }
                    }
                }
            });
        });

        // Board theme purchase buttons
        container.querySelectorAll('[data-theme-buy]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var themeId = btn.dataset.themeBuy;
                if (!themeId) return;
                var success = Game.purchaseBoardTheme(themeId);
                if (success) {
                    showShopToast('Theme unlocked!');
                    Sound.playPurchase();
                } else {
                    showShopToast('Not enough gems!');
                    Sound.playError();
                }
            });
        });

        // Board theme select buttons (owned themes)
        container.querySelectorAll('.shop-item[data-theme-select]').forEach(function(el) {
            var btn = el.querySelector('.shop-buy-btn');
            if (btn) {
                btn.addEventListener('click', function() {
                    var themeId = el.dataset.themeSelect;
                    Game.setBoardTheme(themeId === 'default' ? null : themeId);
                    showShopToast('Theme applied!');
                    Sound.playTap();
                });
            }
        });
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

    function purchaseBoardExpansionFromShop() {
        var exp = Game.getNextBoardExpansion();
        if (!exp) return;
        if (Game.getGems() < exp.cost) {
            showShopToast('Not enough gems!');
            Sound.playError();
            return;
        }
        var confirmed = confirm('Expand board to ' + exp.label + ' for ' + exp.cost + ' gems?');
        if (!confirmed) return;

        // Navigate to board screen first so expansion is visible
        var navBtns = document.querySelectorAll('.nav-btn');
        for (var j = 0; j < navBtns.length; j++) navBtns[j].classList.remove('active');
        var boardNav = document.querySelector('[data-screen="board"]');
        if (boardNav) boardNav.classList.add('active');
        document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
        document.getElementById('board-screen').classList.add('active');

        // Emit event for Board to handle the expansion
        Game.emit('shopExpandRequest', { expansion: exp });
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
