class JuiceManager {
    constructor() {
        this.hitStopFrames = 0;
        this.screenShake = { intensity: 0, duration: 0, timer: 0 };
        this.particles = [];
    }

    triggerHitStop(frames) {
        this.hitStopFrames = Math.max(this.hitStopFrames, frames);
    }

    update() {
        if (this.hitStopFrames > 0) {
            this.hitStopFrames--;
        }
        if (this.screenShake.timer > 0) {
            this.screenShake.timer--;
        }
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0.2;
            p.life--;
        });
    }

    isHitStopActive() {
        return this.hitStopFrames > 0;
    }

    triggerScreenShake(intensity, durationMs) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = durationMs;
        this.screenShake.timer = Math.ceil(durationMs / (1000/60));
    }

    getScreenShakeOffset() {
        if (this.screenShake.timer > 0) {
            return {
                x: (Math.random() - 0.5) * this.screenShake.intensity,
                y: (Math.random() - 0.5) * this.screenShake.intensity
            };
        }
        return { x: 0, y: 0 };
    }

    createParticles(config) {
        // config: { x, y, count, color, life, speed, gravity }
        for (let i = 0; i < (config.count || 10); i++) {
            this.particles.push({
                x: config.x,
                y: config.y,
                vx: (Math.random() - 0.5) * (config.speed || 2),
                vy: (Math.random() - 0.5) * (config.speed || 2),
                color: config.color || 'yellow',
                life: config.life || 30,
                gravity: config.gravity || 0.2
            });
        }
    }

    drawParticles(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life / 30);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}

export default new JuiceManager();
