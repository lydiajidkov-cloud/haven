// Haven - Brag Card Share Mechanism (Canvas + Web Share API)
'use strict';

const Share = (() => {

    // ─── BRAG CARD GENERATION ────────────────────────────────────

    function generateBragCard(context) {
        // context: { trigger: 'surge'|'creature'|'stats', data: {} }
        var canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        var ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Background gradient
        var bg = ctx.createLinearGradient(0, 0, 600, 400);
        bg.addColorStop(0, '#0d1b2a');
        bg.addColorStop(0.5, '#1b2838');
        bg.addColorStop(1, '#0d1b2a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 600, 400);

        // Border
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(4, 4, 592, 392);

        // Inner glow border
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, 580, 380);

        // Title
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 32px -apple-system, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Haven', 300, 50);

        // Subtitle based on trigger
        ctx.fillStyle = '#8a9ab0';
        ctx.font = '16px -apple-system, "Segoe UI", Roboto, sans-serif';
        var subtitle = 'My Haven Journey';
        if (context.trigger === 'surge') subtitle = 'Surge Complete!';
        if (context.trigger === 'creature') subtitle = 'New Discovery!';
        ctx.fillText(subtitle, 300, 75);

        // Divider line
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(100, 90);
        ctx.lineTo(500, 90);
        ctx.stroke();

        // Gather stats
        var state = Game.getState();
        var stats = state.stats || {};
        var discovered = state.hatchery ? Object.keys(state.hatchery.discovered || {}).length : 0;
        var totalCreatures = 184; // from PRD
        var islandPct = typeof Island !== 'undefined' ? Island.getRestorationPercent() : 0;

        // Context-specific content
        var yStart = 120;

        if (context.trigger === 'creature' && context.data) {
            // Creature discovery card
            ctx.font = '48px -apple-system, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(context.data.emoji || '?', 300, yStart + 40);

            ctx.fillStyle = '#e8e8e8';
            ctx.font = 'bold 22px -apple-system, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(context.data.name || 'Unknown Creature', 300, yStart + 75);

            ctx.fillStyle = '#8a9ab0';
            ctx.font = '14px -apple-system, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(context.data.rarity ? context.data.rarity.toUpperCase() : '', 300, yStart + 95);

            yStart += 120;
        }

        if (context.trigger === 'surge' && context.data) {
            // Surge stats
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 48px -apple-system, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(context.data.mergeCount + ' Merges', 300, yStart + 40);

            ctx.fillStyle = '#5cb85c';
            ctx.font = '18px -apple-system, "Segoe UI", Roboto, sans-serif';
            ctx.fillText('+' + context.data.gemsEarned + ' gems earned', 300, yStart + 68);

            yStart += 100;
        }

        // Stats grid (always shown)
        var statItems = [
            { label: 'Creatures', value: discovered + '/' + totalCreatures, icon: '\uD83D\uDC3E' },
            { label: 'Island', value: islandPct + '%', icon: '\uD83C\uDFDD\uFE0F' },
            { label: 'Longest Combo', value: '' + (stats.chainRecord || 0), icon: '\u26A1' },
            { label: 'Total Merges', value: '' + (stats.totalMerges || 0), icon: '\uD83E\uDDE9' }
        ];

        var cols = 2;
        var colW = 240;
        var startX = 60;

        for (var i = 0; i < statItems.length; i++) {
            var col = i % cols;
            var row = Math.floor(i / cols);
            var x = startX + col * colW;
            var y = yStart + row * 55;

            // Stat box background
            ctx.fillStyle = 'rgba(42, 63, 85, 0.6)';
            roundRect(ctx, x, y, 220, 42, 8);
            ctx.fill();

            // Icon
            ctx.font = '18px -apple-system, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#e8e8e8';
            ctx.fillText(statItems[i].icon, x + 10, y + 28);

            // Label
            ctx.fillStyle = '#8a9ab0';
            ctx.font = '12px -apple-system, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(statItems[i].label, x + 36, y + 18);

            // Value
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 16px -apple-system, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(statItems[i].value, x + 36, y + 35);
        }

        // Footer
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.font = '12px -apple-system, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('#HavenGame', 300, 375);

        return canvas;
    }

    // Helper: rounded rectangle path
    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // ─── SHARE ───────────────────────────────────────────────────

    function shareBragCard(trigger, data) {
        var canvas = generateBragCard({ trigger: trigger, data: data || {} });
        if (!canvas) return;

        canvas.toBlob(function(blob) {
            if (!blob) return;

            var file = new File([blob], 'haven-brag.png', { type: 'image/png' });

            // Try Web Share API with file
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    title: 'Haven',
                    text: getShareText(trigger, data),
                    files: [file]
                }).catch(function() {});
            } else if (navigator.share) {
                // Share text only (no file support)
                navigator.share({
                    title: 'Haven',
                    text: getShareText(trigger, data)
                }).catch(function() {});
            } else {
                // Fallback: copy image to clipboard
                copyImageToClipboard(blob);
            }
        }, 'image/png');
    }

    function getShareText(trigger, data) {
        var state = Game.getState();
        var stats = state.stats || {};
        var discovered = state.hatchery ? Object.keys(state.hatchery.discovered || {}).length : 0;

        if (trigger === 'creature' && data) {
            return 'I just discovered ' + (data.name || 'a creature') + ' ' + (data.emoji || '') + ' in Haven! ' + discovered + '/184 creatures found. #HavenGame';
        }
        if (trigger === 'surge' && data) {
            return 'Surge mode! ' + data.mergeCount + ' merges in one surge! #HavenGame';
        }
        return 'My Haven stats: ' + (stats.totalMerges || 0) + ' merges, ' + discovered + '/184 creatures, combo record ' + (stats.chainRecord || 0) + '. #HavenGame';
    }

    function copyImageToClipboard(blob) {
        if (navigator.clipboard && navigator.clipboard.write) {
            var item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(function() {
                if (typeof Board !== 'undefined' && Board.showToast) {
                    Board.showToast('Brag card copied to clipboard!', Board.TOAST_PRIORITY.NORMAL);
                }
            }).catch(function() {
                // Clipboard failed — fall back to text
                copyTextFallback();
            });
        } else {
            copyTextFallback();
        }
    }

    function copyTextFallback() {
        var text = getShareText('stats');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                if (typeof Board !== 'undefined' && Board.showToast) {
                    Board.showToast('Stats copied to clipboard!', Board.TOAST_PRIORITY.NORMAL);
                }
            }).catch(function() {});
        }
    }

    // ─── SHARE BUTTON HELPER ─────────────────────────────────────

    function createShareButton(trigger, data) {
        var btn = document.createElement('button');
        btn.className = 'share-brag-btn';
        btn.textContent = '\uD83D\uDCE4 Share';
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            shareBragCard(trigger, data);
        });
        return btn;
    }

    return {
        shareBragCard: shareBragCard,
        createShareButton: createShareButton,
        generateBragCard: generateBragCard
    };

})();
