// Haven - Orders System: Delivery contracts that give each chain purpose
'use strict';

const Orders = (() => {
    const MAX_ORDERS = 3;

    // Chain-specific bonuses — THIS is what makes each chain different
    var CHAIN_BONUSES = {
        wood:     { type: 'stars',     value: 1, label: '+1 \u2B50',       icon: '\u{1F332}' },
        stone:    { type: 'stars',     value: 1, label: '+1 \u2B50',       icon: '\u26F0\uFE0F' },
        flora:    { type: 'energy',    value: 3, label: '+3 \u26A1',       icon: '\u{1F338}' },
        crystal:  { type: 'gem_mult',  value: 1.5, label: '+50% \u{1F48E}', icon: '\u{1F48E}' },
        creature: { type: 'discovery', value: 1, label: '\u{1F50D} Discovery', icon: '\u{1F95A}' }
    };

    var orders = [];
    var deliveryMode = null; // null or { orderIndex: N }
    var ordersCompleted = 0;

    function init() {
        var state = Game.getState();
        if (state.orders && state.orders.active && state.orders.active.length > 0) {
            orders = state.orders.active;
            ordersCompleted = state.orders.completed || 0;
        }

        // On first play, ensure the first order is trivially completable
        // (tier 1 wood, count 1) so the player can complete it during the tutorial.
        // This gives them an instant win after learning the orders system.
        if (state.firstPlay && orders.length === 0) {
            orders.push(generateFirstPlayOrder());
        }

        while (orders.length < MAX_ORDERS) {
            orders.push(generateOrder());
        }
        renderOrders();
        saveState();
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

    function generateOrder() {
        var mainChains = ['wood', 'stone', 'flora', 'crystal'];
        var reqCount = Math.random() < 0.25 ? 2 : 1;
        var requirements = [];
        var usedChains = {};

        // Scale difficulty with total orders completed
        var difficultyBoost = Math.min(5, Math.floor(ordersCompleted / 8));

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

        return {
            id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            requirements: requirements,
            reward: {
                gems: gemReward,
                stars: Math.max(1, Math.floor(difficulty / 10))
            },
            primaryChain: primaryChain,
            completed: false,
            claimed: false
        };
    }

    // ─── DELIVERY MODE ────────────────────────────────────────

    function enterDeliveryMode(orderIndex) {
        if (orders[orderIndex].completed || orders[orderIndex].claimed) return;
        // Toggle off if same order tapped again
        if (deliveryMode && deliveryMode.orderIndex === orderIndex) {
            exitDeliveryMode();
            return;
        }
        deliveryMode = { orderIndex: orderIndex };
        highlightMatchingItems();
        renderOrders();
    }

    function exitDeliveryMode() {
        deliveryMode = null;
        clearHighlights();
        renderOrders();
    }

    function getDeliveryMode() {
        return deliveryMode;
    }

    // Check if an item at (row, col) matches any unfulfilled requirement of active order
    // EXACT-TIER matching: items must be precisely the requested tier.
    // This creates "deliver now vs. keep merging" tension — if you merge past
    // the needed tier, that item can no longer fill this order.
    function canDeliverItem(item) {
        if (!deliveryMode) return false;
        var order = orders[deliveryMode.orderIndex];
        if (!order || order.completed) return false;

        for (var i = 0; i < order.requirements.length; i++) {
            var req = order.requirements[i];
            if (req.delivered >= req.count) continue;
            if (item.chain === req.chain && item.tier === req.tier) {
                return true;
            }
        }
        return false;
    }

    // Called by Board when player taps a cell in delivery mode
    // Returns true if item was consumed
    function deliverItem(item) {
        if (!deliveryMode) return false;
        var order = orders[deliveryMode.orderIndex];
        if (!order || order.completed) return false;

        for (var i = 0; i < order.requirements.length; i++) {
            var req = order.requirements[i];
            if (req.delivered >= req.count) continue;
            if (item.chain === req.chain && item.tier === req.tier) {
                req.delivered++;
                Sound.playOrderDeliver();

                // Check if order is fully completed
                var allDone = true;
                for (var j = 0; j < order.requirements.length; j++) {
                    if (order.requirements[j].delivered < order.requirements[j].count) {
                        allDone = false;
                        break;
                    }
                }
                if (allDone) {
                    order.completed = true;
                    exitDeliveryMode();
                    Sound.playOrderComplete();
                    Game.vibrate([15, 30, 15]);
                } else {
                    highlightMatchingItems();
                }

                saveState();
                renderOrders();
                return true;
            }
        }
        return false;
    }

    function claimOrder(orderIndex) {
        var order = orders[orderIndex];
        if (!order || !order.completed || order.claimed) return;

        order.claimed = true;

        // Grant base rewards
        Game.addGems(order.reward.gems);
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

        Sound.playOrderClaim();
        Game.vibrate([10, 20, 10]);

        ordersCompleted++;

        // Replace with new order
        orders[orderIndex] = generateOrder();
        saveState();
        renderOrders();

        Game.emit('orderCompleted', { orderId: order.id });
    }

    // ─── BOARD HIGHLIGHTING ───────────────────────────────────

    function highlightMatchingItems() {
        clearHighlights();
        if (!deliveryMode) return;

        var order = orders[deliveryMode.orderIndex];
        if (!order) return;

        var boardEl = document.getElementById('board');
        if (!boardEl) return;
        var cells = boardEl.querySelectorAll('.cell');

        cells.forEach(function(cell) {
            var r = parseInt(cell.dataset.row);
            var c = parseInt(cell.dataset.col);
            // Access board items through the Board module's exposed method
            if (typeof Board !== 'undefined' && Board.getItemAt) {
                var item = Board.getItemAt(r, c);
                if (item && canDeliverItem(item)) {
                    cell.classList.add('delivery-target');
                }
            }
        });
    }

    function clearHighlights() {
        var cells = document.querySelectorAll('.delivery-target');
        for (var i = 0; i < cells.length; i++) {
            cells[i].classList.remove('delivery-target');
        }
    }

    // ─── RENDERING ────────────────────────────────────────────

    function renderOrders() {
        var panel = document.getElementById('orders-panel');
        if (!panel) return;

        var html = '';
        for (var i = 0; i < orders.length; i++) {
            var order = orders[i];
            var isActive = deliveryMode && deliveryMode.orderIndex === i;
            var primaryBonus = CHAIN_BONUSES[order.primaryChain];

            html += '<div class="order-card' +
                (order.completed ? ' order-complete' : '') +
                (isActive ? ' order-active' : '') +
                '" data-order="' + i + '">';

            // Requirements
            html += '<div class="order-reqs">';
            for (var r = 0; r < order.requirements.length; r++) {
                var req = order.requirements[r];
                var chainData = Items.chains[req.chain];
                var tierDef = chainData ? chainData.tiers[req.tier] : null;
                var itemName = tierDef ? tierDef.name : 'Tier ' + req.tier;
                var chainIcon = chainData ? chainData.icon : '';
                var done = req.delivered >= req.count;

                var remaining = req.count - req.delivered;
                html += '<div class="order-req' + (done ? ' req-done' : '') + (remaining === 1 ? ' req-almost' : '') + '">';
                html += '<span class="order-req-icon">' + chainIcon + '</span>';
                html += '<span class="order-req-text">' + req.delivered + '/' + req.count + ' ' + itemName + '</span>';
                if (!done) {
                    html += '<span class="order-exact-badge">Exact</span>';
                }
                if (!done && remaining === 1) {
                    html += '<span class="order-almost-badge">1 away!</span>';
                }
                html += '</div>';
            }
            html += '</div>';

            // Rewards row
            html += '<div class="order-rewards">';
            html += '<span class="order-gem-reward">\u{1F48E}' + order.reward.gems + '</span>';
            if (order.reward.stars) {
                html += '<span class="order-star-reward">\u2B50' + order.reward.stars + '</span>';
            }
            if (primaryBonus) {
                html += '<span class="order-chain-bonus">' + primaryBonus.label + '</span>';
            }
            html += '</div>';

            // Action
            if (order.completed && !order.claimed) {
                html += '<button class="order-claim-btn" data-claim="' + i + '">Claim!</button>';
            } else if (!order.completed) {
                html += '<div class="order-deliver-hint">' + (isActive ? 'Tap item \u2192' : 'Tap to fill') + '</div>';
            }

            html += '</div>';
        }

        panel.innerHTML = html;

        // Attach event listeners
        var cards = panel.querySelectorAll('.order-card');
        for (var ci = 0; ci < cards.length; ci++) {
            (function(card) {
                var idx = parseInt(card.dataset.order);
                card.addEventListener('click', function(e) {
                    // Don't trigger delivery mode if clicking claim button
                    if (e.target.classList.contains('order-claim-btn')) return;
                    if (orders[idx].completed) return;
                    enterDeliveryMode(idx);
                    Sound.playTap();
                });
            })(cards[ci]);
        }

        var claimBtns = panel.querySelectorAll('.order-claim-btn');
        for (var cb = 0; cb < claimBtns.length; cb++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    claimOrder(parseInt(btn.dataset.claim));
                });
            })(claimBtns[cb]);
        }
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
        getDeliveryMode: getDeliveryMode,
        canDeliverItem: canDeliverItem,
        deliverItem: deliverItem,
        exitDeliveryMode: exitDeliveryMode,
        renderOrders: renderOrders,
        getOrdersCompleted: function() { return ordersCompleted; }
    };
})();
