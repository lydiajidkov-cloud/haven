// Haven - Celebration Overlay System
// Shared, configurable celebration for major game milestones
'use strict';

var Celebration = (function() {

    // ─── CELEBRATION CONFIGS ───────────────────────────────────
    // Each trigger type maps to a display configuration.
    // type: 'overlay' (full-screen) or 'banner' (brief top banner)

    var CONFIGS = {
        maxTierMerge: {
            type: 'overlay',
            title: 'MAX TIER!',
            subtitle: function(data) { return data.chain ? (data.chainName || data.chain) + ' chain mastered!' : 'Legendary merge!'; },
            icon: function(data) { return data.emoji || '\u2728'; },
            gradient: ['#FFD700', '#FF8C00'],
            sound: 'celebration',
            duration: 3000
        },
        highTierMerge: {
            type: 'overlay',
            title: function(data) { return 'TIER ' + data.tier + '!'; },
            subtitle: function(data) { return (data.chainName || data.chain || 'Amazing') + ' merge!'; },
            icon: function(data) { return data.emoji || '\u2B50'; },
            gradient: ['#7B68EE', '#4169E1'],
            sound: 'celebration',
            duration: 3000
        },
        midTierMerge: {
            type: 'banner',
            title: function(data) { return 'Tier ' + data.tier + '! ' + (data.emoji || '\u2728'); },
            gradient: ['#5B6EAE', '#3D4F8F'],
            sound: null,
            duration: 1500
        },
        creatureDiscovery: {
            type: 'overlay',
            title: 'NEW CREATURE!',
            subtitle: function(data) { return data.name + ' \u2022 ' + (data.rarity || 'common').charAt(0).toUpperCase() + (data.rarity || 'common').slice(1); },
            icon: function(data) { return data.emoji || '\u{1F95A}'; },
            gradient: function(data) {
                var colors = {
                    common: ['#78909C', '#546E7A'],
                    uncommon: ['#66BB6A', '#388E3C'],
                    rare: ['#42A5F5', '#1976D2'],
                    epic: ['#AB47BC', '#7B1FA2'],
                    legendary: ['#FFD54F', '#FF8F00']
                };
                return colors[data.rarity] || colors.common;
            },
            sound: 'creatureDiscover',
            duration: 3000,
            showShare: true
        },
        hybridUnlock: {
            type: 'overlay',
            title: 'RECIPE DISCOVERED!',
            subtitle: function(data) { return (data.chainName || 'Hybrid') + ' Chain unlocked!'; },
            icon: function(data) { return data.emoji || '\u{1F52E}'; },
            gradient: ['#FFD700', '#E040FB'],
            sound: 'celebration',
            duration: 3000
        },
        battlePassTier: {
            type: 'overlay',
            title: 'PASS TIER UP!',
            subtitle: function(data) { return 'Tier ' + (data.tier || '?') + ' reward unlocked!'; },
            icon: function(data) { return data.emoji || '\u{1F3C6}'; },
            gradient: ['#26C6DA', '#00838F'],
            sound: 'celebration',
            duration: 3000
        },
        eventTier: {
            type: 'overlay',
            title: function(data) { return (data.tierLabel || 'REWARD') + ' CLAIMED!'; },
            subtitle: function(data) { return data.eventName || 'Event reward'; },
            icon: function(data) { return data.emoji || '\u{1F3AA}'; },
            gradient: ['#FF7043', '#D84315'],
            sound: 'achievement',
            duration: 3000
        }
    };

    var activeOverlay = null;
    var activeBanner = null;
    var dismissTimer = null;
    var bannerTimer = null;

    // ─── RESOLVE CONFIG VALUES ─────────────────────────────────

    function resolve(val, data) {
        return typeof val === 'function' ? val(data) : val;
    }

    // ─── SHOW CELEBRATION ──────────────────────────────────────

    function show(triggerType, data) {
        data = data || {};
        var config = CONFIGS[triggerType];
        if (!config) return;

        var type = config.type;
        if (type === 'overlay') {
            showOverlay(config, data);
        } else if (type === 'banner') {
            showBanner(config, data);
        }
    }

    // ─── FULL-SCREEN OVERLAY ───────────────────────────────────

    function showOverlay(config, data) {
        // Dismiss any existing overlay immediately
        if (activeOverlay) {
            dismissOverlay(true);
        }

        var gradient = resolve(config.gradient, data);
        var g1 = gradient[0];
        var g2 = gradient[1];

        var title = resolve(config.title, data);
        var subtitle = resolve(config.subtitle, data);
        var icon = resolve(config.icon, data);

        var overlay = document.createElement('div');
        overlay.className = 'celeb-overlay';
        overlay.innerHTML =
            '<div class="celeb-overlay-bg"></div>' +
            '<div class="celeb-card">' +
                '<div class="celeb-shimmer"></div>' +
                '<div class="celeb-icon">' + icon + '</div>' +
                '<h2 class="celeb-title" style="background:linear-gradient(135deg,' + g1 + ',' + g2 + ');-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">' + title + '</h2>' +
                (subtitle ? '<p class="celeb-subtitle">' + subtitle + '</p>' : '') +
                (config.showShare ? '<button class="celeb-share-btn">Share</button>' : '') +
                '<p class="celeb-tap-hint">Tap to dismiss</p>' +
            '</div>';

        document.getElementById('app').appendChild(overlay);
        activeOverlay = overlay;

        // Play sound
        if (config.sound && typeof Sound !== 'undefined') {
            if (config.sound === 'celebration') Sound.playCelebration();
            else if (config.sound === 'creatureDiscover') Sound.playCreatureDiscover();
            else if (config.sound === 'achievement') Sound.playAchievement();
        }

        // Emit particles at center
        if (typeof Particles !== 'undefined') {
            var app = document.getElementById('app');
            var rect = app.getBoundingClientRect();
            Particles.emit(rect.width / 2, rect.height / 2, 'legendary');
        }

        // Animate in
        requestAnimationFrame(function() {
            overlay.classList.add('celeb-overlay-show');
        });

        // Share button
        if (config.showShare) {
            var shareBtn = overlay.querySelector('.celeb-share-btn');
            if (shareBtn) {
                shareBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    shareDiscovery(data);
                });
            }
        }

        // Tap to dismiss
        overlay.addEventListener('click', function() {
            dismissOverlay(false);
        });

        // Auto-dismiss
        dismissTimer = setTimeout(function() {
            dismissOverlay(false);
        }, config.duration || 3000);
    }

    function dismissOverlay(immediate) {
        if (!activeOverlay) return;
        clearTimeout(dismissTimer);
        dismissTimer = null;

        var overlay = activeOverlay;
        activeOverlay = null;

        if (immediate) {
            overlay.remove();
        } else {
            overlay.classList.remove('celeb-overlay-show');
            overlay.classList.add('celeb-overlay-hide');
            setTimeout(function() { overlay.remove(); }, 300);
        }
    }

    // ─── BRIEF BANNER (TIER 5-6) ──────────────────────────────

    function showBanner(config, data) {
        // Dismiss existing banner
        if (activeBanner) {
            dismissBanner(true);
        }

        var gradient = resolve(config.gradient, data);
        var g1 = gradient[0];
        var g2 = gradient[1];
        var title = resolve(config.title, data);

        var banner = document.createElement('div');
        banner.className = 'celeb-banner';
        banner.style.background = 'linear-gradient(135deg, ' + g1 + ', ' + g2 + ')';
        banner.textContent = title;

        document.getElementById('app').appendChild(banner);
        activeBanner = banner;

        // Enhanced particle burst at board center
        if (typeof Particles !== 'undefined') {
            var boardEl = document.getElementById('board');
            if (boardEl) {
                var rect = boardEl.getBoundingClientRect();
                var appRect = document.getElementById('app').getBoundingClientRect();
                var cx = rect.left - appRect.left + rect.width / 2;
                var cy = rect.top - appRect.top + rect.height / 2;
                Particles.emit(cx, cy, 'legendary');
            }
        }

        // Animate in
        requestAnimationFrame(function() {
            banner.classList.add('celeb-banner-show');
        });

        // Auto-dismiss
        bannerTimer = setTimeout(function() {
            dismissBanner(false);
        }, config.duration || 1500);
    }

    function dismissBanner(immediate) {
        if (!activeBanner) return;
        clearTimeout(bannerTimer);
        bannerTimer = null;

        var banner = activeBanner;
        activeBanner = null;

        if (immediate) {
            banner.remove();
        } else {
            banner.classList.remove('celeb-banner-show');
            banner.classList.add('celeb-banner-hide');
            setTimeout(function() { banner.remove(); }, 300);
        }
    }

    // ─── WEB SHARE API ─────────────────────────────────────────

    function shareDiscovery(data) {
        var text = 'I just discovered ' + (data.name || 'a new creature') + ' in Haven! ' +
                   (data.emoji || '') + ' #HavenGame';

        if (navigator.share) {
            navigator.share({
                title: 'Haven - Creature Discovered!',
                text: text
            }).catch(function() {
                // User cancelled or share failed — silently ignore
            });
        } else {
            // Fallback: copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function() {
                    if (typeof Board !== 'undefined' && Board.showToast) {
                        Board.showToast('Copied to clipboard!', Board.TOAST_PRIORITY.NORMAL);
                    }
                }).catch(function() {});
            }
        }
    }

    // ─── PUBLIC API ────────────────────────────────────────────

    return {
        show: show,
        dismiss: function() { dismissOverlay(false); dismissBanner(false); },
        CONFIGS: CONFIGS
    };

})();
