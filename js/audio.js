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

    function playMerge(tier) {
        if (!enabled) return;
        // Higher tier = higher pitch, richer sound
        const baseFreq = 440 + tier * 80;
        playTone(baseFreq, 0.15, 'sine', 0.2);
        playTone(baseFreq * 1.5, 0.1, 'triangle', 0.12, 0.03);
        if (tier >= 3) {
            playTone(baseFreq * 2, 0.08, 'sine', 0.08, 0.06);
        }
        if (tier >= 5) {
            playTone(baseFreq * 2.5, 0.06, 'sine', 0.06, 0.08);
        }
        // Subtle sparkle noise for higher tiers
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
        setEnabled,
        isEnabled
    };
})();
