// Haven - Orders System: Player-directed delivery contracts
'use strict';

const Orders = (() => {
    const MAX_ORDERS = 3;

    // Chain-specific bonuses — THIS is what makes each chain different
    var CHAIN_BONUSES = {
        wood:     { type: 'stars',     value: 1, label: '+1 ⭐',       icon: '🌲' },
        stone:    { type: 'stars',     value: 1, label: '+1 ⭐',       icon: '⛰️' },
        flora:    { type: 'energy',    value: 3, label: '+3 ⚡',       icon: '🌸' },
        crystal:  { type: 'gem_mult',  value: 1.5, label: '+50% 💎', icon: '💎' },
        creature: { type: 'discovery', value: 1, label: '🔍 Discovery', icon: '🥚' }
    };

    var orders = [];
    var ordersCompleted = 0;
    var specialSchedule = null; // loaded from data/orders.json
    var urgentTimerId = null;

    function init() {
        var state = Game.getState();
        if (state.orders && state.orders.active && state.orders.active.length > 0) {
            orders = state.orders.active;
            ordersCompleted = state.orders.completed || 0;
        }

        // On first play, ensure the first order is trivially completable
        if (state.firstPlay && orders.length === 0) {
            orders.push(generateFirstPlayOrder());
        }

        // Load special order schedule from JSON, then fill orders
        loadOrderSchedule(function() {
            // Expire any timed-out urgent orders
            expireUrgentOrders();

            while (orders.length < MAX_ORDERS) {
                orders.push(generateOrder());
            }

            // Try to inject a special order if today has one scheduled
            injectSpecialOrder();

            renderOrders();
            saveState();

            // Start urgent order countdown ticker
            urgentTimerId = setInterval(function() {
                expireUrgentOrders();
                renderOrders();
            }, 1000);
        });

        // Player-directed delivery: no auto-fulfillment
        // Items must be manually delivered by tapping deliverable items on the board
    }

    function loadOrderSchedule(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/orders.json', true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.schedule) specialSchedule = data.schedule;
                } catch (e) {
                    console.warn('Haven: orders.json parse error', e);
                }
            }
            callback();
        };
        xhr.onerror = function() { callback(); };
        xhr.send();
    }

    // Generate a trivially easy first order: 1x Branch (wood tier 1)
    // This is completable with the starter items on the board.
    function generateFirstPlayOrder() {
        return {
            id: 'ord_first_' + Date.now(),
            requirements: [
                { chain: 'wood', tier: 1, count: 1, delivered: 0 }
            ],
            reward: {
                gems: 15,
                stars: 2
            },
            primaryChain: 'wood',
            completed: false,
            claimed: false
        };
    }

    // ─── SPECIAL ORDERS (urgent + mega) ────────────────────────

    function injectSpecialOrder() {
        if (!specialSchedule) return;
        var today = new Date().getDay(); // 0=Sun
        var todaySchedule = null;
        for (var i = 0; i < specialSchedule.length; i++) {
            if (specialSchedule[i].dayOfWeek === today) {
                todaySchedule = specialSchedule[i];
                break;
            }
        }
        if (!todaySchedule) return;

        // Check if we already have a special order today
        var todayStr = new Date().toISOString().slice(0, 10);
        for (var j = 0; j < orders.length; j++) {
            if (orders[j].orderType && orders[j].orderType !== 'normal' && orders[j].createdDate === todayStr) {
                return; // Already have today's special order
            }
        }

        // Generate the special order and replace the last normal slot
        var special;
        if (todaySchedule.type === 'urgent') {
            special = generateUrgentOrder(todaySchedule.urgentMinutes, todaySchedule.rewardMultiplier);
        } else if (todaySchedule.type === 'mega') {
            special = generateMegaOrder(todaySchedule.megaReqCount, todaySchedule.rewardMultiplier);
        }
        if (special) {
            special.createdDate = todayStr;
            // Replace last slot (or add if under max)
            if (orders.length >= MAX_ORDERS) {
                orders[MAX_ORDERS - 1] = special;
            } else {
                orders.push(special);
            }
        }
    }

    function generateUrgentOrder(minutes, rewardMult) {
        var base = generateOrder();
        base.orderType = 'urgent';
        base.deadline = Date.now() + minutes * 60 * 1000;
        base.urgentMinutes = minutes;
        base.reward.gems = Math.round(base.reward.gems * rewardMult);
        if (base.reward.stars) base.reward.stars = Math.round(base.reward.stars * rewardMult);
        return base;
    }

    function generateMegaOrder(reqCount, rewardMult) {
        var mainChains = ['wood', 'stone', 'flora', 'crystal'];
        var requirements = [];
        var usedChains = {};
        var difficultyBoost = Math.min(5, Math.floor(ordersCompleted / 8));

        for (var i = 0; i < reqCount; i++) {
            var chain;
            do {
                chain = mainChains[Math.floor(Math.random() * mainChains.length)];
            } while (usedChains[chain] && i < mainChains.length);
            usedChains[chain] = true;

            var minTier = 1 + difficultyBoost;
            var maxTier = Math.min(3 + difficultyBoost, 8);
            var tier = minTier + Math.floor(Math.random() * (maxTier - minTier + 1));
            var count = tier >= 4 ? 1 : (1 + Math.floor(Math.random() * 2));
            requirements.push({ chain: chain, tier: tier, count: count, delivered: 0 });
        }

        var difficulty = 0;
        for (var r = 0; r < requirements.length; r++) {
            difficulty += requirements[r].tier * requirements[r].count * 8;
        }

        var primaryChain = requirements[0].chain;
        var gemReward = Math.round(difficulty * (1 + Math.random() * 0.3) * rewardMult);

        return {
            id: 'ord_mega_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            orderType: 'mega',
            requirements: requirements,
            reward: {
                gems: gemReward,
                stars: Math.max(1, Math.floor(difficulty / 10)) * rewardMult
            },
            primaryChain: primaryChain,
            completed: false,
            claimed: false
        };
    }

    function expireUrgentOrders() {
        var now = Date.now();
        var changed = false;
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].deadline && !orders[i].completed && !orders[i].claimed) {
                if (now >= orders[i].deadline) {
                    // Check near-miss: if 80%+ complete, offer rush
                    var totalReqs = 0, totalDelivered = 0;
                    for (var r = 0; r < orders[i].requirements.length; r++) {
                        totalReqs += orders[i].requirements[r].count;
                        totalDelivered += orders[i].requirements[r].delivered;
                    }
                    var progress = totalReqs > 0 ? totalDelivered / totalReqs : 0;
                    if (progress >= 0.8 && orders[i].rushCost) {
                        // Near-miss: don't expire yet, flag for rush prompt
                        orders[i].nearMissExpired = true;
                        changed = true;
                        if (typeof Board !== 'undefined' && Board.showToast) {
                            Board.showToast('Almost done! Rush for ' + orders[i].rushCost + '\u{1F48E}?',
                                (typeof Board.TOAST_PRIORITY !== 'undefined') ? Board.TOAST_PRIORITY.HIGH : undefined);
                        }
                    } else {
                        // Time expired — replace with a new order (lost reward)
                        orders[i] = generateOrder();
                        changed = true;
                        if (typeof Board !== 'undefined' && Board.showToast) {
                            Board.showToast('\u23F0 Order expired!',
                                (typeof Board.TOAST_PRIORITY !== 'undefined') ? Board.TOAST_PRIORITY.HIGH : undefined);
                        }
                    }
                }
            }
        }
        if (changed) saveState();
    }

    function generateOrder() {
        var mainChains = ['wood', 'stone', 'flora', 'crystal'];
        var reqCount = Math.random() < 0.25 ? 2 : 1;
        var requirements = [];
        var usedChains = {};

        // Scale difficulty with total orders completed (cap raised to 60)
        var difficultyBoost = Math.min(5, Math.floor(ordersCompleted / 10));

        for (var i = 0; i < reqCount; i++) {
            var chain;
            do {
                chain = mainChains[Math.floor(Math.random() * mainChains.length)];
            } while (usedChains[chain] && reqCount > 1);
            usedChains[chain] = true;

            var minTier = 1 + difficultyBoost;
            var maxTier = Math.min(3 + difficultyBoost, 8);
            var tier = minTier + Math.floor(Math.random() * (maxTier - minTier + 1));
            var count = tier >= 4 ? 1 : (1 + Math.floor(Math.random() * 2));
            requirements.push({ chain: chain, tier: tier, count: count, delivered: 0 });
        }

        // Calculate reward based on difficulty
        var difficulty = 0;
        for (var r = 0; r < requirements.length; r++) {
            difficulty += requirements[r].tier * requirements[r].count * 8;
        }

        var primaryChain = requirements[0].chain;
        var gemReward = Math.round(difficulty * (1 + Math.random() * 0.3));
        // Crystal orders give more gems as their chain bonus
        if (primaryChain === 'crystal') {
            gemReward = Math.round(gemReward * 1.5);
        }

        // Energy reward: +8-15 energy based on difficulty (orders are the primary energy source)
        var energyReward = Math.min(15, Math.max(8, Math.round(difficulty / 4)));

        // Timer: 4-8 hours based on difficulty (harder orders get more time)
        var timerMinutes = Math.min(480, Math.max(240, Math.round(difficulty * 3)));
        var deadline = Date.now() + timerMinutes * 60 * 1000;

        // Rush cost: 10-30 gems based on difficulty
        var rushCost = Math.min(30, Math.max(10, Math.round(difficulty / 3)));

        return {
            id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            requirements: requirements,
            reward: {
                gems: gemReward,
                energy: energyReward,
                stars: Math.max(1, Math.floor(difficulty / 10))
            },
            primaryChain: primaryChain,
            deadline: deadline,
            rushCost: rushCost,
            completed: false,
            claimed: false
        };
    }

    // ─── PLAYER-DIRECTED DELIVERY ────────────────────────────

    // Returns array of {orderIndex, reqIndex} for orders that need this chain+tier
    function getDeliverableOrders(chain, tier) {
        var results = [];
        for (var i = 0; i < orders.length; i++) {
            var order = orders[i];
            if (order.completed || order.claimed) continue;

            for (var r = 0; r < order.requirements.length; r++) {
                var req = order.requirements[r];
                if (req.delivered >= req.count) continue;
                if (req.chain === chain && req.tier === tier) {
                    results.push({ orderIndex: i, reqIndex: r });
                }
            }
        }
        return results;
    }

    // Returns list of {chain, tier} pairs needed by any active order (for board highlighting)
    function getDeliverableItemSpecs() {
        var specs = [];
        var seen = {};
        for (var i = 0; i < orders.length; i++) {
            var order = orders[i];
            if (order.completed || order.claimed) continue;

            for (var r = 0; r < order.requirements.length; r++) {
                var req = order.requirements[r];
                if (req.delivered >= req.count) continue;
                var key = req.chain + '_' + req.tier;
                if (!seen[key]) {
                    seen[key] = true;
                    specs.push({ chain: req.chain, tier: req.tier });
                }
            }
        }
        return specs;
    }

    // Deliver an item to a specific order. Returns true if successful.
    function deliverItem(chain, tier, orderIndex) {
        if (orderIndex === undefined) {
            // Auto-pick: deliver to whichever matching order has fewer remaining reqs
            var matches = getDeliverableOrders(chain, tier);
            if (matches.length === 0) return false;

            // Pick the order with fewest remaining requirements (simplest UX)
            var bestMatch = matches[0];
            var bestRemaining = Infinity;
            for (var m = 0; m < matches.length; m++) {
                var order = orders[matches[m].orderIndex];
                var remaining = 0;
                for (var rr = 0; rr < order.requirements.length; rr++) {
                    remaining += order.requirements[rr].count - order.requirements[rr].delivered;
                }
                if (remaining < bestRemaining) {
                    bestRemaining = remaining;
                    bestMatch = matches[m];
                }
            }
            orderIndex = bestMatch.orderIndex;
        }

        var order = orders[orderIndex];
        if (!order || order.completed || order.claimed) return false;

        // Find matching requirement
        var delivered = false;
        for (var r = 0; r < order.requirements.length; r++) {
            var req = order.requirements[r];
            if (req.delivered >= req.count) continue;
            if (req.chain === chain && req.tier === tier) {
                req.delivered++;
                delivered = true;
                break;
            }
        }

        if (!delivered) return false;

        // Check if order is fully completed
        var allDone = true;
        for (var j = 0; j < order.requirements.length; j++) {
            if (order.requirements[j].delivered < order.requirements[j].count) {
                allDone = false;
                break;
            }
        }
        if (allDone) {
            autoClaimOrder(orderIndex);
        }

        renderOrders();
        saveState();
        return true;
    }

    function autoClaimOrder(orderIndex) {
        var order = orders[orderIndex];
        if (!order) return;

        order.completed = true;
        order.claimed = true;

        // Grant base rewards
        Game.addGems(order.reward.gems);
        if (order.reward.energy) Game.addEnergy(order.reward.energy);
        if (order.reward.stars) Game.addStars(order.reward.stars);

        // Grant chain-specific bonus
        var bonus = CHAIN_BONUSES[order.primaryChain];
        if (bonus) {
            switch (bonus.type) {
                case 'stars':
                    Game.addStars(bonus.value);
                    break;
                case 'energy':
                    Game.addEnergy(bonus.value);
                    break;
                case 'discovery':
                    Game.emit('orderDiscoveryBonus');
                    break;
                // gem_mult already applied in generateOrder
            }
        }

        // Show floating reward text
        var rewardText = '+' + order.reward.gems + '💎';
        if (order.reward.energy) rewardText += ' +' + order.reward.energy + '⚡';
        if (order.reward.stars) rewardText += ' +' + order.reward.stars + '⭐';
        if (bonus && bonus.label) rewardText += ' ' + bonus.label;

        if (typeof Board !== 'undefined' && Board.showToast) {
            Board.showToast('✅ Order complete! ' + rewardText, Board.TOAST_PRIORITY.HIGH);
        }

        Sound.playOrderClaim();
        Game.vibrate([10, 20, 10]);

        ordersCompleted++;

        // Replace with new order after a brief visual moment
        setTimeout(function() {
            orders[orderIndex] = generateOrder();
            saveState();
            renderOrders();
        }, 600);

        Game.emit('orderCompleted', { orderId: order.id });
    }

    // ─── RENDERING (compact strip) ──────────────────────────

    var currentOrderIndex = 0;
    var orderRotateTimer = null;

    function renderOrders() {
        var panel = document.getElementById('orders-panel');
        if (!panel) return;

        if (orders.length === 0) {
            panel.innerHTML = '';
            return;
        }

        // Clamp index
        if (currentOrderIndex >= orders.length) currentOrderIndex = 0;

        // Find first incomplete order to show by default
        var showIndex = currentOrderIndex;
        var order = orders[showIndex];
        var isUrgent = order.orderType === 'urgent';
        var isMega = order.orderType === 'mega';
        var allDone = order.completed || order.claimed;

        var html = '<div class="order-display">';

        // Counter: "1/3"
        html += '<span class="order-counter">' + (showIndex + 1) + '/' + orders.length + '</span>';

        // Timer (all orders now have deadlines)
        if (!allDone && order.deadline) {
            var timeLeft = Math.max(0, order.deadline - Date.now());
            var hrs = Math.floor(timeLeft / 3600000);
            var mins = Math.floor((timeLeft % 3600000) / 60000);
            var secs = Math.floor((timeLeft % 60000) / 1000);
            var timeStr = hrs > 0 ? hrs + 'h ' + mins + 'm' : mins + ':' + (secs < 10 ? '0' : '') + secs;
            var timerClass = isUrgent ? 'order-timer order-timer-urgent' : 'order-timer';
            if (timeLeft < 1800000) timerClass += ' order-timer-low'; // < 30 min
            html += '<span class="' + timerClass + '">\u23F0 ' + timeStr + '</span>';
        }

        // Mega tag
        if (isMega) {
            html += '<span class="order-mega-tag">⭐ MEGA</span>';
        }

        // Requirements
        html += '<span class="order-reqs">';
        for (var r = 0; r < order.requirements.length; r++) {
            var req = order.requirements[r];
            var chainData = Items.chains[req.chain];
            var tierDef = chainData ? chainData.tiers[req.tier] : null;
            var itemName = tierDef ? tierDef.name : 'T' + req.tier;
            var chainIcon = chainData ? chainData.icon : '';
            var reqDone = req.delivered >= req.count;

            if (r > 0) html += '<span class="order-req-sep">+</span>';
            html += '<span class="order-req' + (reqDone ? ' req-done' : '') + '">';
            html += chainIcon + ' ' + itemName + ' ' + req.delivered + '/' + req.count;
            html += '</span>';
        }
        html += '</span>';

        // Reward
        html += '<span class="order-reward-hint">';
        if (order.reward.energy) html += '\u26A1' + order.reward.energy + ' ';
        html += '\u{1F48E}' + order.reward.gems;
        if (order.reward.stars) html += ' \u2B50' + order.reward.stars;
        html += '</span>';

        if (allDone) {
            html += '<span class="order-done-badge">✓</span>';
        }

        html += '</div>';

        panel.innerHTML = html;

        // Tap to cycle to next order
        panel.onclick = function() {
            currentOrderIndex = (currentOrderIndex + 1) % orders.length;
            renderOrders();
            resetOrderRotation();
        };

        // Auto-rotate every 5 seconds
        resetOrderRotation();
    }

    function resetOrderRotation() {
        if (orderRotateTimer) clearInterval(orderRotateTimer);
        orderRotateTimer = setInterval(function() {
            if (orders.length > 1) {
                currentOrderIndex = (currentOrderIndex + 1) % orders.length;
                renderOrders();
            }
        }, 5000);
    }

    // ─── RUSH ORDER ──────────────────────────────────────────

    function rushOrder(orderIndex) {
        var order = orders[orderIndex];
        if (!order || order.completed || order.claimed) return false;
        var cost = order.rushCost || 20;
        if (Game.getGems() < cost) {
            if (typeof Board !== 'undefined' && Board.showToast) {
                Board.showToast('Not enough gems!', Board.TOAST_PRIORITY.HIGH);
            }
            Sound.playError();
            return false;
        }

        Game.addGems(-cost);

        // Auto-complete all remaining requirements
        for (var r = 0; r < order.requirements.length; r++) {
            order.requirements[r].delivered = order.requirements[r].count;
        }

        autoClaimOrder(orderIndex);
        return true;
    }

    // Check for near-miss (1 item away from completion)
    function checkNearMiss(orderIndex) {
        var order = orders[orderIndex];
        if (!order || order.completed || order.claimed) return null;

        var totalRemaining = 0;
        for (var r = 0; r < order.requirements.length; r++) {
            totalRemaining += order.requirements[r].count - order.requirements[r].delivered;
        }

        if (totalRemaining === 1) {
            return { orderIndex: orderIndex, rushCost: order.rushCost || 10 };
        }
        return null;
    }

    // ─── PERSISTENCE ──────────────────────────────────────────

    function saveState() {
        var state = Game.getState();
        state.orders = {
            active: orders,
            completed: ordersCompleted
        };
        Game.save();
    }

    return {
        init: init,
        renderOrders: renderOrders,
        getOrdersCompleted: function() { return ordersCompleted; },
        getDeliverableOrders: getDeliverableOrders,
        getDeliverableItemSpecs: getDeliverableItemSpecs,
        deliverItem: deliverItem,
        rushOrder: rushOrder,
        checkNearMiss: checkNearMiss
    };
})();
