// Haven - Ad Adapter: simulated ad SDK behind event bus
// Simulates 3-second ads for now; will connect to real SDK (AdMob/IronSource) later.
// Rewarded ads capped at 5/day to protect IAP value.
'use strict';

const AdAdapter = (() => {
    const MAX_REWARDED_ADS_PER_DAY = 5;
    const AD_DURATION_MS = 3000; // Simulated ad length

    // Ad types
    const AD_TYPE = {
        REWARDED_ENERGY: 'rewarded_energy',   // Watch ad for energy refill
        REWARDED_DOUBLE: 'rewarded_double'     // Watch ad for double gem reward (Task 16)
    };

    function getAdState() {
        var state = Game.getState();
        if (!state.adAdapter) {
            state.adAdapter = { adsToday: 0, adDate: null };
        }
        return state.adAdapter;
    }

    function getTodayString() {
        return new Date().toISOString().slice(0, 10);
    }

    // Returns how many rewarded ads have been watched today
    function getAdsWatchedToday() {
        var adState = getAdState();
        var today = getTodayString();
        if (adState.adDate !== today) {
            // New day: reset counter
            adState.adsToday = 0;
            adState.adDate = today;
            Game.save();
        }
        return adState.adsToday;
    }

    // Returns how many rewarded ads remain today
    function getAdsRemaining() {
        return Math.max(0, MAX_REWARDED_ADS_PER_DAY - getAdsWatchedToday());
    }

    // Check if a rewarded ad can be shown
    function canShowRewarded() {
        return getAdsRemaining() > 0;
    }

    // Show a simulated ad. type is one of AD_TYPE values.
    // callback(success) is called when ad completes or fails.
    function show(type, callback) {
        if (!canShowRewarded()) {
            if (callback) callback(false);
            return;
        }

        // Emit ad start event
        Game.emit('adStarted', { type: type });

        // Show simulated ad overlay
        showAdOverlay(type, function(completed) {
            if (completed) {
                // Increment daily counter
                var adState = getAdState();
                var today = getTodayString();
                if (adState.adDate !== today) {
                    adState.adsToday = 0;
                    adState.adDate = today;
                }
                adState.adsToday++;
                Game.save();

                Game.emit('adCompleted', { type: type });
            } else {
                Game.emit('adSkipped', { type: type });
            }

            if (callback) callback(completed);
        });
    }

    // Simulated ad overlay UI
    function showAdOverlay(type, callback) {
        // Remove any existing ad overlay
        var existing = document.getElementById('ad-overlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = 'ad-overlay';
        overlay.className = 'ad-overlay';

        var content = document.createElement('div');
        content.className = 'ad-overlay-content';

        var icon = document.createElement('div');
        icon.className = 'ad-overlay-icon';
        icon.textContent = '\uD83C\uDFAC'; // film clapper

        var title = document.createElement('div');
        title.className = 'ad-overlay-title';
        title.textContent = 'Watching Ad...';

        var progress = document.createElement('div');
        progress.className = 'ad-overlay-progress';
        var bar = document.createElement('div');
        bar.className = 'ad-overlay-progress-fill';
        progress.appendChild(bar);

        var timer = document.createElement('div');
        timer.className = 'ad-overlay-timer';
        timer.textContent = '3';

        var note = document.createElement('div');
        note.className = 'ad-overlay-note';
        note.textContent = '(Simulated — real ad SDK will replace this)';

        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(progress);
        content.appendChild(timer);
        content.appendChild(note);
        overlay.appendChild(content);

        document.getElementById('app').appendChild(overlay);

        // Animate: show overlay
        requestAnimationFrame(function() {
            overlay.classList.add('ad-overlay-show');
            bar.style.width = '100%';
        });

        // Countdown timer
        var secondsLeft = 3;
        var countdownId = setInterval(function() {
            secondsLeft--;
            if (secondsLeft > 0) {
                timer.textContent = '' + secondsLeft;
            } else {
                timer.textContent = '';
                clearInterval(countdownId);
            }
        }, 1000);

        // Complete after duration
        setTimeout(function() {
            clearInterval(countdownId);
            overlay.classList.remove('ad-overlay-show');
            setTimeout(function() {
                overlay.remove();
            }, 300);
            callback(true);
        }, AD_DURATION_MS);
    }

    // Energy-empty bottom sheet: shown when energy hits zero
    // Non-blocking, dismissible by tapping outside. Two options:
    // (1) Watch Ad — Free Refill, (2) Buy Refill — 75 gems.
    var bottomSheetCooldown = 0;
    function showEnergyBottomSheet() {
        // Don't show if already visible or recently dismissed
        if (document.getElementById('energy-bottom-sheet')) return;
        if (Date.now() < bottomSheetCooldown) return;

        var backdrop = document.createElement('div');
        backdrop.id = 'energy-bottom-sheet';
        backdrop.className = 'bottom-sheet-backdrop';

        var sheet = document.createElement('div');
        sheet.className = 'bottom-sheet';

        var handle = document.createElement('div');
        handle.className = 'bottom-sheet-handle';

        var title = document.createElement('div');
        title.className = 'bottom-sheet-title';
        title.textContent = 'Out of Energy';

        var subtitle = document.createElement('div');
        subtitle.className = 'bottom-sheet-subtitle';
        subtitle.textContent = 'Choose how to recharge:';

        var options = document.createElement('div');
        options.className = 'bottom-sheet-options';

        // Option 1: Watch Ad (free refill)
        var adsLeft = getAdsRemaining();
        var adOption = document.createElement('button');
        adOption.className = 'bottom-sheet-btn bottom-sheet-btn-ad';
        if (adsLeft <= 0) {
            adOption.className += ' bottom-sheet-btn-disabled';
            adOption.innerHTML = '<span class="bs-btn-icon">\uD83D\uDCFA</span>' +
                '<span class="bs-btn-text"><span class="bs-btn-label">Watch Ad</span>' +
                '<span class="bs-btn-sub">No ads remaining today</span></span>';
        } else {
            adOption.innerHTML = '<span class="bs-btn-icon">\uD83D\uDCFA</span>' +
                '<span class="bs-btn-text"><span class="bs-btn-label">Watch Ad</span>' +
                '<span class="bs-btn-sub">Free Refill \u00B7 ' + adsLeft + '/' + MAX_REWARDED_ADS_PER_DAY + ' left today</span></span>' +
                '<span class="bs-btn-badge">FREE</span>';
        }

        // Option 2: Buy refill (75 gems)
        var gemOption = document.createElement('button');
        gemOption.className = 'bottom-sheet-btn bottom-sheet-btn-gems';
        var canAfford = Game.getGems() >= 75;
        if (!canAfford) {
            gemOption.className += ' bottom-sheet-btn-disabled';
        }
        gemOption.innerHTML = '<span class="bs-btn-icon">\uD83D\uDD0B</span>' +
            '<span class="bs-btn-text"><span class="bs-btn-label">Buy Refill</span>' +
            '<span class="bs-btn-sub">Full recharge to ' + Game.getMaxEnergy() + '</span></span>' +
            '<span class="bs-btn-badge bs-btn-badge-gems">\uD83D\uDC8E 75</span>';

        options.appendChild(adOption);
        options.appendChild(gemOption);

        sheet.appendChild(handle);
        sheet.appendChild(title);
        sheet.appendChild(subtitle);
        sheet.appendChild(options);
        backdrop.appendChild(sheet);

        document.getElementById('app').appendChild(backdrop);

        // Animate in
        requestAnimationFrame(function() {
            backdrop.classList.add('bottom-sheet-show');
        });

        // Dismiss by tapping backdrop (outside sheet)
        function dismiss() {
            backdrop.classList.remove('bottom-sheet-show');
            setTimeout(function() { backdrop.remove(); }, 300);
            // 10-second cooldown to prevent re-showing on rapid spawn taps
            bottomSheetCooldown = Date.now() + 10000;
        }

        backdrop.addEventListener('click', function(e) {
            if (e.target === backdrop) {
                dismiss();
            }
        });

        // Handle swipe-down to dismiss
        var startY = 0;
        sheet.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });
        sheet.addEventListener('touchmove', function(e) {
            var dy = e.touches[0].clientY - startY;
            if (dy > 60) {
                dismiss();
            }
        }, { passive: true });

        // Watch Ad button
        adOption.addEventListener('click', function() {
            if (adsLeft <= 0) return;
            dismiss();
            show(AD_TYPE.REWARDED_ENERGY, function(success) {
                if (success) {
                    Game.addEnergy(Game.getMaxEnergy());
                    if (typeof Sound !== 'undefined') Sound.playCelebration();
                    if (typeof Board !== 'undefined' && Board.showToast) {
                        Board.showToast('Energy fully recharged!', Board.TOAST_PRIORITY.HIGH);
                    }
                    Game.vibrate([10, 20, 10]);
                }
            });
        });

        // Buy Refill button
        gemOption.addEventListener('click', function() {
            if (!canAfford) {
                if (typeof Sound !== 'undefined') Sound.playError();
                if (typeof Board !== 'undefined' && Board.showToast) {
                    Board.showToast('Not enough gems!', Board.TOAST_PRIORITY.NORMAL);
                }
                return;
            }
            dismiss();
            Game.addGems(-75);
            Game.addEnergy(Game.getMaxEnergy());
            if (typeof Sound !== 'undefined') Sound.playPurchase();
            if (typeof Board !== 'undefined' && Board.showToast) {
                Board.showToast('Energy fully recharged!', Board.TOAST_PRIORITY.HIGH);
            }
            Game.vibrate([10, 20, 10]);
        });
    }

    function init() {
        // Listen for energyEmpty event to show the bottom sheet
        Game.on('energyEmpty', function() {
            showEnergyBottomSheet();
        });
    }

    return {
        init: init,
        show: show,
        canShowRewarded: canShowRewarded,
        getAdsRemaining: getAdsRemaining,
        getAdsWatchedToday: getAdsWatchedToday,
        showEnergyBottomSheet: showEnergyBottomSheet,
        AD_TYPE: AD_TYPE,
        MAX_REWARDED_ADS_PER_DAY: MAX_REWARDED_ADS_PER_DAY
    };
})();
