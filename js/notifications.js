// Haven - Push Notification Infrastructure
// Handles permission requests, notification triggers, and frequency caps
'use strict';

var Notifications = (function() {
    var MAX_PER_DAY = 3;
    var PERMISSION_SESSION_THRESHOLD = 3; // Ask after 3rd session
    var NOTIFY_TAG_PREFIX = 'haven-';

    // Trigger types
    var TRIGGERS = {
        EVENT_LAUNCH: 'event_launch',
        STREAK_AT_RISK: 'streak_at_risk',
        WORKER_EARNINGS: 'worker_earnings',
        PASS_EXPIRING: 'pass_expiring',
        ENERGY_FULL: 'energy_full'
    };

    var swRegistration = null;
    var permissionAsked = false;

    function init() {
        registerServiceWorker();
        listenForTriggers();
        checkPermissionPrompt();
    }

    // ─── SERVICE WORKER REGISTRATION ─────────────────────

    function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('./sw.js').then(function(reg) {
            swRegistration = reg;
        }).catch(function(err) {
            console.warn('Haven SW registration failed:', err);
        });
    }

    // ─── PERMISSION REQUEST FLOW ──────────────────────────

    function checkPermissionPrompt() {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') return; // Already granted
        if (Notification.permission === 'denied') return; // Already denied, don't bother

        var state = typeof Game !== 'undefined' ? Game.getState() : null;
        if (!state) return;

        var sessionCount = (state.stats && state.stats.playCount) || 0;

        // Trigger 1: After 3rd session
        if (sessionCount >= PERMISSION_SESSION_THRESHOLD) {
            schedulePermissionAsk();
            return;
        }

        // Trigger 2: First creature discovery (listen for event)
        if (typeof Game !== 'undefined') {
            Game.on('creatureDiscovered', function onFirstCreature() {
                if (!permissionAsked && Notification.permission === 'default') {
                    schedulePermissionAsk();
                }
                // Only need to trigger once
                Game.off('creatureDiscovered', onFirstCreature);
            });
        }
    }

    function schedulePermissionAsk() {
        if (permissionAsked) return;
        // Delay 5 seconds so it doesn't interrupt gameplay immediately
        setTimeout(function() {
            showPermissionPrompt();
        }, 5000);
    }

    function showPermissionPrompt() {
        if (permissionAsked) return;
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'default') return;

        permissionAsked = true;

        // Create a friendly in-game prompt before the browser prompt
        var overlay = document.createElement('div');
        overlay.id = 'notif-permission-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:95;display:flex;align-items:center;justify-content:center;';

        var card = document.createElement('div');
        card.style.cssText = 'background:#1a2332;border:1px solid rgba(255,215,0,0.3);border-radius:16px;padding:24px;max-width:300px;text-align:center;color:#e0e0e0;font-family:inherit;';
        card.innerHTML =
            '<div style="font-size:36px;margin-bottom:12px;">🔔</div>' +
            '<div style="font-size:16px;font-weight:600;color:#ffd700;margin-bottom:8px;">Stay in the loop?</div>' +
            '<div style="font-size:13px;color:#b0b0b0;margin-bottom:16px;">Get notified when your creatures earn gems, events launch, or your streak is at risk.</div>' +
            '<div style="display:flex;gap:10px;justify-content:center;">' +
                '<button id="notif-yes" style="padding:10px 20px;border-radius:10px;border:none;background:linear-gradient(135deg,#ffd700,#ffb300);color:#1a1a2e;font-weight:600;font-size:14px;cursor:pointer;">Yes please!</button>' +
                '<button id="notif-no" style="padding:10px 20px;border-radius:10px;border:none;background:#2a3040;color:#888;font-size:13px;cursor:pointer;">Not now</button>' +
            '</div>';

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        document.getElementById('notif-yes').addEventListener('click', function() {
            overlay.remove();
            Notification.requestPermission();
        });

        document.getElementById('notif-no').addEventListener('click', function() {
            overlay.remove();
        });

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    // ─── NOTIFICATION SENDING ──────────────────────────────

    function getNotifState() {
        var state = typeof Game !== 'undefined' ? Game.getState() : null;
        if (!state) return { count: 0, date: '' };
        if (!state.notifications) {
            state.notifications = { todayCount: 0, todayDate: '', lastNotifTimes: {} };
        }
        // Reset counter on new day
        var today = new Date().toISOString().slice(0, 10);
        if (state.notifications.todayDate !== today) {
            state.notifications.todayCount = 0;
            state.notifications.todayDate = today;
        }
        return state.notifications;
    }

    function canSendNotification() {
        if (!('Notification' in window)) return false;
        if (Notification.permission !== 'granted') return false;
        // Don't notify if page is visible (player is actively playing)
        if (document.visibilityState === 'visible') return false;
        var ns = getNotifState();
        return ns.todayCount < MAX_PER_DAY;
    }

    function sendNotification(trigger, title, body, tag) {
        if (!canSendNotification()) return false;

        var ns = getNotifState();

        // Dedupe: don't send same trigger type within 30 minutes
        var now = Date.now();
        if (ns.lastNotifTimes && ns.lastNotifTimes[trigger]) {
            if (now - ns.lastNotifTimes[trigger] < 30 * 60 * 1000) return false;
        }

        ns.todayCount++;
        if (!ns.lastNotifTimes) ns.lastNotifTimes = {};
        ns.lastNotifTimes[trigger] = now;
        if (typeof Game !== 'undefined') Game.save();

        var notifTag = NOTIFY_TAG_PREFIX + (tag || trigger);

        // Use service worker if available, otherwise direct Notification API
        if (swRegistration) {
            swRegistration.showNotification(title, {
                body: body,
                tag: notifTag,
                renotify: true
            }).catch(function() {
                // Fallback to direct notification
                try { new Notification(title, { body: body, tag: notifTag }); } catch (e) {}
            });
        } else {
            try { new Notification(title, { body: body, tag: notifTag }); } catch (e) {}
        }

        return true;
    }

    // ─── TRIGGER LISTENERS ─────────────────────────────────

    function listenForTriggers() {
        if (typeof Game === 'undefined') return;

        // (a) Event launches
        Game.on('eventStarted', function(data) {
            var name = (data && data.name) || 'A new event';
            sendNotification(TRIGGERS.EVENT_LAUNCH,
                'New Event: ' + name,
                name + ' has started in Haven! Special bonuses await.',
                'event'
            );
        });

        // (b) Streak-at-risk — fired by Daily module at 20 hours
        Game.on('streakAtRisk', function(data) {
            var streak = (data && data.streak) || 0;
            var hoursLeft = (data && data.hoursLeft) || '?';
            sendNotification(TRIGGERS.STREAK_AT_RISK,
                'Your ' + streak + '-day streak is at risk!',
                'Claim your daily reward in the next ' + hoursLeft + ' hours to keep your streak.',
                'streak'
            );
        });

        // (c) Worker gem earnings ready
        Game.on('workerEarningsReady', function(data) {
            var gems = (data && data.gems) || 0;
            if (gems > 0) {
                sendNotification(TRIGGERS.WORKER_EARNINGS,
                    'Your creatures earned ' + gems + ' gems!',
                    'Come back to Haven and collect your worker earnings.',
                    'workers'
                );
            }
        });

        // (d) Battle pass about to expire
        Game.on('passExpiringSoon', function(data) {
            var days = (data && data.daysLeft) || 0;
            sendNotification(TRIGGERS.PASS_EXPIRING,
                'Haven Pass expires in ' + days + ' day' + (days === 1 ? '' : 's') + '!',
                'Finish earning rewards before the season ends.',
                'pass'
            );
        });

        // (e) Energy full — notify when energy regen completes while backgrounded
        var wasLowEnergy = false;
        Game.on('energyChanged', function(energy) {
            var max = Game.getMaxEnergy();
            if (energy < max) {
                wasLowEnergy = true;
            }
            if (wasLowEnergy && energy >= max) {
                wasLowEnergy = false;
                sendNotification(TRIGGERS.ENERGY_FULL,
                    'Energy is full!',
                    'Your energy has fully recharged. Time to merge!',
                    'energy'
                );
            }
        });
    }

    // ─── PUBLIC API ─────────────────────────────────────────

    return {
        init: init,
        TRIGGERS: TRIGGERS,
        sendNotification: sendNotification,
        canSendNotification: canSendNotification
    };
})();
