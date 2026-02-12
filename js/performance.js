// Haven - Performance Mode Auto-Detection
// Detects device capability and applies CSS classes to reduce animations
'use strict';

const Performance = (() => {
    // Tiers: 'full' (default), 'balanced' (mid-range), 'minimal' (low-end)
    var currentTier = 'full';
    var STATE_KEY = 'haven_perf_tier';

    function init() {
        // Check if we already benchmarked this device
        var saved = null;
        try { saved = localStorage.getItem(STATE_KEY); } catch(e) {}

        if (saved === 'balanced' || saved === 'minimal' || saved === 'full') {
            currentTier = saved;
            applyTier(currentTier);
            return;
        }

        // First load — detect and benchmark
        var tier = detect();
        currentTier = tier;
        try { localStorage.setItem(STATE_KEY, tier); } catch(e) {}
        applyTier(tier);
    }

    function detect() {
        // Factor 1: CPU cores
        var cores = navigator.hardwareConcurrency || 4;

        // Factor 2: Quick canvas benchmark (draw ops in 16ms)
        var score = canvasBenchmark();

        // Factor 3: Check for reduced-motion preference
        var prefersReduced = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReduced) return 'minimal';

        // Scoring: cores contribute 0-100, benchmark contributes 0-100
        var coreScore = Math.min(cores / 8, 1) * 100;     // 8+ cores = 100
        var benchScore = Math.min(score / 800, 1) * 100;   // 800+ ops = 100
        var combined = (coreScore * 0.3) + (benchScore * 0.7); // benchmark weighted more

        if (combined < 30) return 'minimal';
        if (combined < 60) return 'balanced';
        return 'full';
    }

    function canvasBenchmark() {
        // Draw random rects on an offscreen canvas for ~12ms, count operations
        var canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        var ctx = canvas.getContext('2d');
        if (!ctx) return 500; // Can't test, assume mid-range

        var ops = 0;
        var start = performance.now();
        var deadline = start + 12; // 12ms budget (under one frame)

        while (performance.now() < deadline) {
            ctx.fillStyle = 'rgba(' + (ops % 255) + ',100,100,0.5)';
            ctx.fillRect(
                (ops * 7) % 180,
                (ops * 13) % 180,
                20, 20
            );
            ctx.beginPath();
            ctx.arc((ops * 11) % 180 + 10, (ops * 17) % 180 + 10, 8, 0, 6.28);
            ctx.fill();
            ops++;
        }

        // Clean up
        canvas.width = 0;
        canvas.height = 0;

        return ops;
    }

    function applyTier(tier) {
        var body = document.body;
        body.classList.remove('perf-balanced', 'perf-minimal');

        if (tier === 'balanced') {
            body.classList.add('perf-balanced');
        } else if (tier === 'minimal') {
            body.classList.add('perf-balanced', 'perf-minimal');
        }
        // 'full' = no classes, all animations enabled
    }

    function getTier() {
        return currentTier;
    }

    // Allow manual override (debug use)
    function setTier(tier) {
        if (tier !== 'full' && tier !== 'balanced' && tier !== 'minimal') return;
        currentTier = tier;
        try { localStorage.setItem(STATE_KEY, tier); } catch(e) {}
        applyTier(tier);
    }

    return {
        init: init,
        getTier: getTier,
        setTier: setTier
    };
})();
