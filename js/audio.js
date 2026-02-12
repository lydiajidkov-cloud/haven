// Haven - Procedural Sound Effects (Web Audio API)
'use strict';

const Sound = (() => {
    let ctx = null;
    let masterOut = null; // compressor → destination (prevents clipping)
    let enabled = true;
    let initialized = false;

    function init() {
        if (initialized) return;
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            // Master compressor prevents clipping when many oscillators play simultaneously
            var compressor = ctx.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-12, ctx.currentTime);
            compressor.knee.setValueAtTime(10, ctx.currentTime);
            compressor.ratio.setValueAtTime(8, ctx.currentTime);
            compressor.attack.setValueAtTime(0.003, ctx.currentTime);
            compressor.release.setValueAtTime(0.15, ctx.currentTime);
            var masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.85, ctx.currentTime);
            compressor.connect(masterGain);
            masterGain.connect(ctx.destination);
            masterOut = compressor;
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
        gain.connect(masterOut || ctx.destination);

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
        gain.connect(masterOut || ctx.destination);

        source.start(ctx.currentTime + delay);
    }

    // ─── Merge streak tracking ──────────────────────────────
    // Melody: "Ode to Joy" by Ludwig van Beethoven (1824, public domain)
    // Each rapid merge plays the next note — the tune emerges as you keep merging
    var mergeStreak = 0;
    var lastMergeTime = 0;
    var STREAK_WINDOW = 2000; // ms — merges within this window build the streak (was 1500)

    // Ode to Joy in C major (two full phrases)
    // Phrase 1: E E F G | G F E D | C C D E | E. D D
    // Phrase 2: E E F G | G F E D | C C D E | D. C C
    var ODE_TO_JOY = [
        329.63, 329.63, 349.23, 392.00,   // E E F G
        392.00, 349.23, 329.63, 293.66,   // G F E D
        261.63, 261.63, 293.66, 329.63,   // C C D E
        329.63, 293.66, 293.66,           // E. D D
        329.63, 329.63, 349.23, 392.00,   // E E F G
        392.00, 349.23, 329.63, 293.66,   // G F E D
        261.63, 261.63, 293.66, 329.63,   // C C D E
        293.66, 261.63, 261.63            // D. C C
    ];

    function playStreakLayer(streak) {
        // Walk through the melody, looping with octave shift
        var melodyIdx = (streak - 3) % ODE_TO_JOY.length;
        var octaveShift = Math.floor((streak - 3) / ODE_TO_JOY.length);
        var note = ODE_TO_JOY[melodyIdx] * Math.pow(2, octaveShift);
        // Cap at 3 octaves up to avoid piercing frequencies
        note = Math.min(note, 4200);
        var vol = Math.min(0.08 + streak * 0.012, 0.24);

        // Melody note — clear sine tone
        playTone(note, 0.18, 'sine', vol, 0.02);

        // Gentle harmony a third above (streak 5+)
        if (streak >= 5) {
            playTone(note * 1.25, 0.12, 'sine', vol * 0.3, 0.03);
        }

        // Shimmer overtone (streak 7+)
        if (streak >= 7) {
            playTone(note * 2, 0.08, 'sine', vol * 0.2, 0.04);
        }

        // ─── 10+ : fuller arrangement ───
        if (streak >= 10) {
            // Chorus detune for richness
            var detune = 3 + (streak % 5) * 1.2;
            playTone(note * (1 + detune / 1000), 0.12, 'sine', vol * 0.2, 0.02);
            playTone(note * (1 - detune / 1000), 0.12, 'sine', vol * 0.2, 0.02);

            // Fifth harmony
            playTone(note * 1.5, 0.1, 'sine', vol * 0.15, 0.04);
        }

        // 15+ : bass root note — grounds the melody
        if (streak >= 15) {
            // Play the root note of the current phrase section
            var bassNote = 261.63 * Math.pow(2, octaveShift); // C at current octave
            playTone(bassNote * 0.5, 0.2, 'triangle', vol * 0.3, 0.01);
        }

        // 20+ : full chord arpeggiation
        if (streak >= 20) {
            var chordNotes = [note, note * 1.25, note * 1.5, note * 2];
            for (var i = 0; i < chordNotes.length; i++) {
                playTone(chordNotes[i], 0.06, 'sine', vol * 0.12, 0.06 + i * 0.03);
            }
        }

        // 25+ : triumphant swell — full harmony + sparkle
        if (streak >= 25) {
            playTone(note * 0.5, 0.25, 'sine', vol * 0.15, 0.02);
            playTone(note * 0.75, 0.22, 'sine', vol * 0.12, 0.03);
            playTone(note * 1.5, 0.18, 'sine', vol * 0.1, 0.05);
            playTone(note * 2, 0.15, 'sine', vol * 0.08, 0.07);
            playNoise(0.06, 0.03, 0.08);
        }
    }

    function playMerge(tier, chain) {
        if (!enabled) return;

        // Track merge streak
        var now = Date.now();
        if (now - lastMergeTime < STREAK_WINDOW) {
            mergeStreak++;
        } else {
            mergeStreak = 1;
        }
        lastMergeTime = now;

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

        // Layer streak sounds on top when mashing (3+ rapid merges)
        if (mergeStreak >= 3) {
            playStreakLayer(mergeStreak);
        }
        // Milestone punctuation at 5, 10, 15, 20, 25
        if (mergeStreak > 0 && mergeStreak % 5 === 0) {
            playStreakMilestone(mergeStreak);
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

    // ─── UI SOUND EFFECTS ───────────────────────────────────────

    function playPurchase() {
        // Ka-ching! Bright bell + coin jingle — satisfying shop purchase
        if (!enabled) return;
        // Bell strike
        playTone(1200, 0.18, 'sine', 0.12);
        playTone(1800, 0.12, 'sine', 0.08, 0.02);
        // Coin jingle — rapid high plinks
        playTone(2400, 0.06, 'sine', 0.06, 0.06);
        playTone(2800, 0.05, 'sine', 0.05, 0.09);
        playTone(3200, 0.04, 'sine', 0.04, 0.12);
        playTone(2600, 0.05, 'sine', 0.05, 0.14);
        // Metallic shimmer
        playNoise(0.06, 0.03, 0.05);
    }

    function playOrderDeliver() {
        // Warm two-note ascending chime — item delivered to an order
        if (!enabled) return;
        playTone(523, 0.12, 'sine', 0.1);       // C5
        playTone(659, 0.15, 'sine', 0.1, 0.08); // E5 — a third up
        playTone(659, 0.1, 'triangle', 0.04, 0.08); // subtle warmth layer
    }

    function playOrderComplete() {
        // Triumphant 4-note ascending arpeggio — order fully completed
        // Distinct from playCelebration: uses triangle wave, shorter, different intervals
        if (!enabled) return;
        var notes = [440, 554, 659, 880]; // A4 C#5 E5 A5 — A major arpeggio
        for (var i = 0; i < notes.length; i++) {
            playTone(notes[i], 0.2, 'triangle', 0.12, i * 0.07);
            playTone(notes[i] * 1.003, 0.18, 'sine', 0.06, i * 0.07); // slight detune
        }
        playNoise(0.08, 0.03, 0.25);
    }

    function playWorkerAssign() {
        // Gentle placement — soft thud + sparkle for assigning a worker
        if (!enabled) return;
        // Soft thud (low triangle, quick decay)
        playTone(180, 0.08, 'triangle', 0.1);
        playTone(120, 0.06, 'triangle', 0.06, 0.02);
        // Sparkle (high sine plinks)
        playTone(1400, 0.06, 'sine', 0.05, 0.06);
        playTone(1800, 0.05, 'sine', 0.04, 0.1);
        playTone(2200, 0.04, 'sine', 0.03, 0.13);
    }

    function playWorkerCollect() {
        // Coins/gems collecting — rapid ascending plinks like coins falling
        if (!enabled) return;
        var baseFreqs = [800, 1000, 1200, 1400, 1600, 1900];
        for (var i = 0; i < baseFreqs.length; i++) {
            playTone(baseFreqs[i], 0.06, 'sine', 0.07 - i * 0.008, i * 0.035);
        }
        // Tiny metallic shimmer at the end
        playNoise(0.04, 0.02, 0.18);
    }

    function playCompanionEquip() {
        // Magical equip — shimmery ascending sweep for companion slots
        if (!enabled) return;
        // Ascending sweep of harmonics
        playTone(600, 0.15, 'sine', 0.08);
        playTone(800, 0.13, 'sine', 0.08, 0.04);
        playTone(1100, 0.11, 'sine', 0.07, 0.08);
        playTone(1500, 0.1, 'sine', 0.06, 0.12);
        playTone(2000, 0.12, 'sine', 0.05, 0.16);
        // Shimmer texture
        playNoise(0.06, 0.02, 0.12);
        // Warm resolution chord
        playTone(800, 0.2, 'triangle', 0.04, 0.2);
        playTone(1200, 0.18, 'triangle', 0.03, 0.2);
    }

    function playCompanionTrigger() {
        // Punchy ability trigger — quick burst + tone
        if (!enabled) return;
        // Impact burst
        playNoise(0.04, 0.08, 0);
        // Punchy mid tone
        playTone(500, 0.08, 'square', 0.1, 0.02);
        // Bright confirmation
        playTone(900, 0.1, 'sine', 0.1, 0.04);
        playTone(1100, 0.08, 'sine', 0.06, 0.07);
    }

    function playCreatureDiscover() {
        // Dramatic discovery — silence → burst → ascending arpeggio
        if (!enabled) return;
        // Initial dramatic burst (after brief silence)
        playNoise(0.08, 0.06, 0.05);
        playTone(300, 0.08, 'triangle', 0.1, 0.05);
        // Ascending arpeggio — C E G C E (major, bright, wonder)
        var notes = [523, 659, 784, 1047, 1319];
        for (var i = 0; i < notes.length; i++) {
            playTone(notes[i], 0.25, 'sine', 0.1, 0.15 + i * 0.1);
            playTone(notes[i] * 1.005, 0.22, 'sine', 0.05, 0.15 + i * 0.1);
        }
        // Sparkle shimmer at the peak
        playTone(2600, 0.08, 'sine', 0.03, 0.6);
        playTone(3000, 0.06, 'sine', 0.02, 0.65);
        playNoise(0.1, 0.03, 0.55);
    }

    function playNavSwitch() {
        // Subtle tab switch — very quiet short click/swoosh
        if (!enabled) return;
        playTone(700, 0.025, 'sine', 0.04);
        playNoise(0.02, 0.015, 0.01);
    }

    function playAchievement() {
        // Achievement unlocked fanfare — building 5-note arpeggio with shimmer
        // Longer than celebration, more grand
        if (!enabled) return;
        // Building arpeggio — G B D G B (G major, triumphant)
        var notes = [392, 494, 587, 784, 988];
        for (var i = 0; i < notes.length; i++) {
            var vol = 0.08 + i * 0.02; // crescendo
            playTone(notes[i], 0.3 + i * 0.04, 'sine', vol, i * 0.12);
            playTone(notes[i] * 1.003, 0.28 + i * 0.04, 'sine', vol * 0.5, i * 0.12);
        }
        // Shimmering high overtones at the peak
        playTone(1976, 0.15, 'sine', 0.04, 0.55);
        playTone(2400, 0.12, 'sine', 0.03, 0.6);
        playNoise(0.12, 0.03, 0.55);
        // Warm sustain pad
        playTone(784, 0.4, 'triangle', 0.04, 0.6);
        playTone(988, 0.35, 'triangle', 0.03, 0.6);
    }

    function playOrderClaim() {
        // Claiming order reward — descending coins + chime
        if (!enabled) return;
        // Descending coin cascade
        var coinFreqs = [2200, 2000, 1700, 1400, 1100, 900];
        for (var i = 0; i < coinFreqs.length; i++) {
            playTone(coinFreqs[i], 0.06, 'sine', 0.07, i * 0.04);
        }
        // Satisfying low chime to punctuate
        playTone(523, 0.2, 'triangle', 0.1, 0.22);
        playTone(659, 0.18, 'sine', 0.08, 0.25);
        playNoise(0.05, 0.02, 0.2);
    }

    function playStreakMilestone(level) {
        // Extra audio punch at streak milestones (5, 10, 15, 20, 25)
        // Escalates with level — more layers and richer at higher milestones
        if (!enabled) return;

        // Base impact — always present
        playNoise(0.06, 0.06 + level * 0.005, 0);
        playTone(200, 0.1, 'triangle', 0.12);

        // Ascending power chord — escalates with level
        var base = 440;
        var vol = Math.min(0.08 + level * 0.01, 0.18);

        // Major chord burst
        playTone(base, 0.15, 'sine', vol, 0.03);
        playTone(base * 1.25, 0.13, 'sine', vol * 0.8, 0.05);
        playTone(base * 1.5, 0.12, 'sine', vol * 0.6, 0.07);

        // Level 10+: octave ring
        if (level >= 10) {
            playTone(base * 2, 0.15, 'sine', vol * 0.5, 0.08);
            playTone(base * 2 * 1.003, 0.14, 'sine', vol * 0.25, 0.08); // detune
        }

        // Level 15+: deep bass thump
        if (level >= 15) {
            playTone(110, 0.15, 'triangle', 0.1, 0.02);
            playTone(base * 2.5, 0.1, 'sine', vol * 0.4, 0.1);
        }

        // Level 20+: full harmonic explosion
        if (level >= 20) {
            var harmonics = [base * 1.5, base * 2, base * 2.5, base * 3];
            for (var i = 0; i < harmonics.length; i++) {
                playTone(harmonics[i], 0.08, 'sine', vol * 0.2, 0.1 + i * 0.025);
            }
            playNoise(0.05, 0.04, 0.12);
        }

        // Level 25+: triumphant swell
        if (level >= 25) {
            playTone(base * 0.5, 0.25, 'triangle', vol * 0.6, 0.05);
            playTone(base * 3, 0.2, 'sine', vol * 0.3, 0.12);
            playTone(base * 4, 0.15, 'sine', vol * 0.2, 0.15);
            playNoise(0.08, 0.04, 0.15);
        }
    }

    function playItemDiscovery() {
        // Bright discovery chime — ascending sparkle, shorter than creature discover
        // "Ding-ding-ding!" micro-dopamine hit for new item tier found
        if (!enabled) return;
        // Quick bright ascending triad — C6 E6 G6
        playTone(1047, 0.12, 'sine', 0.1);
        playTone(1319, 0.12, 'sine', 0.1, 0.06);
        playTone(1568, 0.15, 'sine', 0.1, 0.12);
        // Sparkle shimmer at the top
        playTone(2093, 0.08, 'sine', 0.05, 0.18);
        playNoise(0.04, 0.02, 0.16);
    }

    function playNearMiss() {
        // Quick two-note descending chime — "so close" sigh
        if (!enabled) return;
        playTone(600, 0.1, 'triangle', 0.06);
        playTone(420, 0.15, 'triangle', 0.05, 0.06);
    }

    function playSurgeEnd() {
        // Descending 3-note phrase — winding down cue
        if (!enabled) return;
        playTone(659, 0.12, 'triangle', 0.08);       // E5
        playTone(523, 0.12, 'triangle', 0.07, 0.1);   // C5
        playTone(440, 0.15, 'triangle', 0.06, 0.2);   // A4
        playNoise(0.06, 0.03, 0.25);                   // low rumble
    }

    function playBoardFull() {
        // Deep ominous descending tone — board is stuck
        if (!enabled) return;
        playTone(180, 0.2, 'triangle', 0.1);
        playTone(120, 0.25, 'triangle', 0.08, 0.1);
        playNoise(0.04, 0.04, 0.15);
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
        playPurchase,
        playOrderDeliver,
        playOrderComplete,
        playWorkerAssign,
        playWorkerCollect,
        playCompanionEquip,
        playCompanionTrigger,
        playCreatureDiscover,
        playNavSwitch,
        playAchievement,
        playOrderClaim,
        playStreakMilestone,
        playItemDiscovery,
        playNearMiss,
        playSurgeEnd,
        playBoardFull,
        setEnabled,
        isEnabled,
        getMergeStreak: function() { return mergeStreak; }
    };
})();
