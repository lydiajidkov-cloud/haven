// Haven - Procedural Sound Effects (Web Audio API)
'use strict';

const Sound = (() => {
    let ctx = null;
    let enabled = true;
    let initialized = false;

    function init() {
        if (initialized) return;
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            initialized = true;
        } catch (e) {
            console.warn('Web Audio not supported:', e);
            enabled = false;
        }
    }

    function ensureContext() {
        if (!ctx) init();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    function playTone(freq, duration, type, volume, delay) {
        if (!enabled || !ctx) return;
        ensureContext();

        type = type || 'sine';
        volume = volume !== undefined ? volume : 0.3;
        delay = delay || 0;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
    }

    function playNoise(duration, volume, delay) {
        if (!enabled || !ctx) return;
        ensureContext();

        volume = volume !== undefined ? volume : 0.1;
        delay = delay || 0;

        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start(ctx.currentTime + delay);
    }

    function playMerge(tier, chain) {
        if (!enabled) return;

        // Material-specific sound character
        switch (chain) {
            case 'crystal':
            case 'arcane':
                // Crystal: bright bell/ding — high sine with shimmer
                playCrystalMerge(tier);
                break;
            case 'wood':
            case 'living':
                // Wood: warm thunk — low triangle, quick decay
                playWoodMerge(tier);
                break;
            case 'stone':
            case 'shelter':
                // Stone: sharp clack — square filtered, snappy
                playStoneMerge(tier);
                break;
            case 'flora':
            case 'mystic':
                // Flora: gentle chime — soft sine, airy
                playFloraMerge(tier);
                break;
            case 'creature':
                // Creature: chirpy warble — rising triangle
                playCreatureMerge(tier);
                break;
            default:
                playGenericMerge(tier);
        }
    }

    function playCrystalMerge(tier) {
        // Bright bell ding — high frequencies, long sustain, shimmer
        var base = 880 + tier * 120;
        playTone(base, 0.25, 'sine', 0.18);
        playTone(base * 1.5, 0.2, 'sine', 0.12, 0.02);
        playTone(base * 2, 0.15, 'sine', 0.06, 0.04);
        if (tier >= 2) {
            // Shimmer overtone
            playTone(base * 3, 0.12, 'sine', 0.04, 0.06);
        }
        if (tier >= 4) {
            playTone(base * 4, 0.1, 'sine', 0.03, 0.08);
            playNoise(0.06, 0.02, 0.08);
        }
    }

    function playWoodMerge(tier) {
        // Warm thunk — low frequency, triangle wave, quick decay
        var base = 200 + tier * 40;
        playTone(base, 0.12, 'triangle', 0.22);
        playTone(base * 1.5, 0.08, 'triangle', 0.1, 0.02);
        if (tier >= 3) {
            playTone(base * 2, 0.06, 'sine', 0.06, 0.04);
        }
        // Woody knock texture
        playNoise(0.04, 0.06, 0);
    }

    function playStoneMerge(tier) {
        // Sharp clack — mid frequency, square wave, filtered
        var base = 350 + tier * 60;
        playTone(base, 0.08, 'square', 0.12);
        playTone(base * 0.75, 0.1, 'triangle', 0.08, 0.01);
        if (tier >= 2) {
            playTone(base * 1.5, 0.06, 'square', 0.05, 0.03);
        }
        // Impact noise
        playNoise(0.05, 0.08, 0);
        if (tier >= 4) {
            playTone(base * 2, 0.08, 'sine', 0.04, 0.05);
        }
    }

    function playFloraMerge(tier) {
        // Gentle chime — soft sine, airy, ascending
        var base = 523 + tier * 90;
        playTone(base, 0.2, 'sine', 0.14);
        playTone(base * 1.25, 0.18, 'sine', 0.08, 0.05);
        if (tier >= 2) {
            playTone(base * 1.5, 0.15, 'sine', 0.06, 0.08);
        }
        if (tier >= 4) {
            // Breathy shimmer
            playNoise(0.08, 0.02, 0.06);
            playTone(base * 2, 0.1, 'sine', 0.04, 0.1);
        }
    }

    function playCreatureMerge(tier) {
        // Chirpy warble — rising pitch, triangle wave
        var base = 400 + tier * 70;
        playTone(base, 0.1, 'triangle', 0.15);
        playTone(base * 1.3, 0.08, 'triangle', 0.12, 0.04);
        playTone(base * 1.6, 0.06, 'sine', 0.08, 0.08);
        if (tier >= 3) {
            playTone(base * 2, 0.06, 'sine', 0.05, 0.1);
        }
        if (tier >= 5) {
            // Dramatic creature sound
            playTone(base * 2.5, 0.08, 'triangle', 0.04, 0.12);
            playNoise(0.06, 0.03, 0.1);
        }
    }

    function playGenericMerge(tier) {
        // Fallback — original sound
        var baseFreq = 440 + tier * 80;
        playTone(baseFreq, 0.15, 'sine', 0.2);
        playTone(baseFreq * 1.5, 0.1, 'triangle', 0.12, 0.03);
        if (tier >= 3) {
            playTone(baseFreq * 2, 0.08, 'sine', 0.08, 0.06);
        }
        if (tier >= 5) {
            playTone(baseFreq * 2.5, 0.06, 'sine', 0.06, 0.08);
        }
        if (tier >= 2) {
            playNoise(0.08, 0.03 + tier * 0.01, 0.05);
        }
    }

    function playSpawn() {
        if (!enabled) return;
        playTone(350, 0.08, 'sine', 0.12);
        playTone(500, 0.06, 'sine', 0.08, 0.04);
    }

    function playChain(count) {
        if (!enabled) return;
        // Escalating chime — each chain reaction goes higher
        const baseFreq = 523 + count * 120;
        playTone(baseFreq, 0.2, 'sine', 0.25);
        playTone(baseFreq * 1.25, 0.15, 'triangle', 0.15, 0.08);
        playTone(baseFreq * 1.5, 0.12, 'sine', 0.12, 0.12);
    }

    function playCelebration() {
        if (!enabled) return;
        // Triumphant ascending arpeggio
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((freq, i) => {
            playTone(freq, 0.35, 'sine', 0.15, i * 0.08);
            playTone(freq * 1.005, 0.35, 'sine', 0.08, i * 0.08); // slight detune for richness
        });
        playNoise(0.15, 0.04, 0.3);
    }

    function playTap() {
        if (!enabled) return;
        playTone(600, 0.04, 'sine', 0.08);
    }

    function playError() {
        if (!enabled) return;
        playTone(200, 0.15, 'square', 0.1);
        playTone(160, 0.2, 'square', 0.08, 0.1);
    }

    function playEnergyEmpty() {
        if (!enabled) return;
        playTone(280, 0.15, 'triangle', 0.12);
        playTone(220, 0.25, 'triangle', 0.08, 0.12);
    }

    function playPowerUp(type) {
        if (!enabled) return;
        switch (type) {
            case 'mass_match':
                // Dramatic rising burst
                playTone(440, 0.15, 'sine', 0.2);
                playTone(660, 0.12, 'sine', 0.18, 0.05);
                playTone(880, 0.1, 'sine', 0.15, 0.1);
                playTone(1100, 0.15, 'sine', 0.12, 0.15);
                playNoise(0.08, 0.05, 0.1);
                break;
            case 'sort_sweep':
                // Ascending sweep — quick clean notes
                playTone(300, 0.08, 'triangle', 0.15);
                playTone(400, 0.08, 'triangle', 0.14, 0.06);
                playTone(500, 0.08, 'triangle', 0.13, 0.12);
                playTone(600, 0.08, 'triangle', 0.12, 0.18);
                playTone(750, 0.12, 'sine', 0.1, 0.24);
                break;
            case 'shuffle':
                // Quick rattling shuffle sound
                playNoise(0.06, 0.08, 0);
                playTone(350, 0.05, 'square', 0.1, 0.02);
                playNoise(0.06, 0.07, 0.06);
                playTone(450, 0.05, 'square', 0.1, 0.08);
                playNoise(0.06, 0.06, 0.12);
                playTone(550, 0.08, 'sine', 0.12, 0.16);
                break;
            case 'upgrade_wand':
                // Magical sparkle — high shimmery
                playTone(800, 0.2, 'sine', 0.12);
                playTone(1200, 0.15, 'sine', 0.1, 0.03);
                playTone(1600, 0.12, 'sine', 0.08, 0.06);
                playTone(2000, 0.1, 'sine', 0.06, 0.1);
                playNoise(0.05, 0.03, 0.08);
                break;
            case 'lightning':
                // Sharp crack + rumble
                playNoise(0.1, 0.12, 0);
                playTone(100, 0.25, 'sawtooth', 0.1, 0.02);
                playTone(1200, 0.04, 'square', 0.15, 0);
                playTone(80, 0.3, 'triangle', 0.08, 0.1);
                break;
            case 'golden_spawn':
                // Warm chime — heavenly
                playTone(523, 0.25, 'sine', 0.15);
                playTone(659, 0.22, 'sine', 0.12, 0.05);
                playTone(784, 0.2, 'sine', 0.1, 0.1);
                playTone(1047, 0.25, 'sine', 0.08, 0.15);
                playNoise(0.08, 0.02, 0.15);
                break;
        }
    }

    function setEnabled(val) {
        enabled = val;
    }

    function isEnabled() {
        return enabled;
    }

    return {
        init,
        playMerge,
        playSpawn,
        playChain,
        playCelebration,
        playTap,
        playError,
        playEnergyEmpty,
        playPowerUp,
        setEnabled,
        isEnabled
    };
})();
