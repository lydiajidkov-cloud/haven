// Haven - Canvas Particle System
'use strict';

const Particles = (() => {
    let canvas, ctx;
    let particles = [];
    let running = false;

    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
    }

    function resize() {
        if (!canvas || !canvas.parentElement) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    function emit(x, y, type, options) {
        options = options || {};
        const color = options.color || '#FFD700';
        const count = options.count || 12;

        switch (type) {
            case 'merge':
                emitMerge(x, y, color, count);
                break;
            case 'spawn':
                emitSpawn(x, y, color);
                break;
            case 'chain':
                emitChain(x, y, color, count);
                break;
            case 'legendary':
                emitLegendary(x, y);
                break;
        }

        if (!running) startLoop();
    }

    function emitMerge(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
            const speed = 70 + Math.random() * 60;
            particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.5 + Math.random() * 0.3,
                size: 2.5 + Math.random() * 2.5,
                color: color,
                shape: 'circle'
            });
        }
    }

    function emitSpawn(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 25 + Math.random() * 20;
            particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.3 + Math.random() * 0.15,
                maxLife: 0.3 + Math.random() * 0.15,
                size: 2 + Math.random() * 1.5,
                color: color,
                shape: 'circle'
            });
        }
    }

    function emitChain(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 100;
            particles.push({
                x: x + (Math.random() - 0.5) * 15,
                y: y + (Math.random() - 0.5) * 15,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50,
                life: 0.7 + Math.random() * 0.4,
                maxLife: 0.7 + Math.random() * 0.4,
                size: 2 + Math.random() * 3.5,
                color: color,
                shape: 'star'
            });
        }
    }

    function emitLegendary(x, y) {
        const colors = ['#FFD700', '#FF6347', '#7B68EE', '#00CED1', '#FF69B4', '#ADFF2F'];
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 180;
            particles.push({
                x: x || canvas.width / 2,
                y: y || canvas.height / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 30,
                life: 0.8 + Math.random() * 0.6,
                maxLife: 0.8 + Math.random() * 0.6,
                size: 2.5 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: Math.random() > 0.5 ? 'star' : 'circle'
            });
        }
    }

    function startLoop() {
        running = true;
        let lastTime = performance.now();

        function loop(time) {
            const dt = Math.min((time - lastTime) / 1000, 0.05); // cap delta
            lastTime = time;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.life -= dt;
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vy += 60 * dt; // light gravity
                p.vx *= (1 - 0.8 * dt); // friction

                const alpha = Math.min(1, p.life / p.maxLife);
                const size = p.size * (0.5 + 0.5 * alpha);

                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;

                if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.shape === 'star') {
                    drawStar(p.x, p.y, size);
                }
            }

            ctx.globalAlpha = 1;

            if (particles.length > 0) {
                requestAnimationFrame(loop);
            } else {
                running = false;
            }
        }

        requestAnimationFrame(loop);
    }

    function drawStar(x, y, size) {
        const points = 4;
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const r = i % 2 === 0 ? size : size * 0.35;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    return { init, emit, resize };
})();
