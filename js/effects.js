(function (NS) {
  'use strict';

  const PARTICLE_DEFAULTS = Object.freeze({
    x: 0, y: 0, vx: 0, vy: 0, size: 4, color: '#fff', life: 1, maxLife: 1,
    alpha: 1, gravity: 0, growth: 0, shape: 'circle'
  });

  class EffectsSystem {
    constructor(profile) {
      this.particles = [];
      this.particlePool = [];
      this.floatingTexts = [];
      this.smokeZones = [];
      this.warnings = [];
      this.muzzleFlash = 0;
      this.configure(profile || NS.getPerformanceProfile('low'));
    }

    configure(profile) {
      this.profile = profile || NS.getPerformanceProfile('low');
      this.maxParticles = Math.max(60, Number(this.profile.maxParticles) || NS.Constants.MAX_PARTICLES);
      this.maxFloatingTexts = Math.max(8, Number(this.profile.maxFloatingTexts) || NS.Constants.MAX_FLOATING_TEXTS);
      this.particleScale = NS.clamp(Number(this.profile.particleScale) || 0.5, 0.25, 1);
      while (this.particles.length > this.maxParticles) this.recycleParticle(this.particles.shift());
      if (this.floatingTexts.length > this.maxFloatingTexts) this.floatingTexts.length = this.maxFloatingTexts;
    }

    update(dt) {
      for (let i = this.particles.length - 1; i >= 0; i -= 1) {
        const p = this.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          const last = this.particles.pop();
          if (i < this.particles.length) this.particles[i] = last;
          this.recycleParticle(p);
          continue;
        }
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.size += p.growth * dt;
      }
      for (let i = this.floatingTexts.length - 1; i >= 0; i -= 1) {
        const f = this.floatingTexts[i];
        f.life -= dt;
        f.y -= 26 * dt;
        if (f.life <= 0) this.floatingTexts.splice(i, 1);
      }
      for (let i = this.warnings.length - 1; i >= 0; i -= 1) {
        const warning = this.warnings[i];
        warning.time -= dt;
        if (warning.time <= 0 && warning.triggered) this.warnings.splice(i, 1);
      }
      this.muzzleFlash = Math.max(0, this.muzzleFlash - dt);
    }

    nextTurn() {
      for (let i = this.smokeZones.length - 1; i >= 0; i -= 1) {
        this.smokeZones[i].turns -= 1;
        if (this.smokeZones[i].turns <= 0) this.smokeZones.splice(i, 1);
      }
    }

    recycleParticle(particle) {
      if (!particle || this.particlePool.length >= this.maxParticles) return;
      this.particlePool.push(particle);
    }

    emitParticle(config) {
      if (this.particles.length >= this.maxParticles) this.recycleParticle(this.particles.shift());
      const p = this.particlePool.pop() || {};
      const cfg = config || {};
      p.x = Number.isFinite(cfg.x) ? cfg.x : PARTICLE_DEFAULTS.x;
      p.y = Number.isFinite(cfg.y) ? cfg.y : PARTICLE_DEFAULTS.y;
      p.vx = Number.isFinite(cfg.vx) ? cfg.vx : PARTICLE_DEFAULTS.vx;
      p.vy = Number.isFinite(cfg.vy) ? cfg.vy : PARTICLE_DEFAULTS.vy;
      p.size = Number.isFinite(cfg.size) ? cfg.size : PARTICLE_DEFAULTS.size;
      p.color = cfg.color || PARTICLE_DEFAULTS.color;
      p.life = Number.isFinite(cfg.life) ? cfg.life : PARTICLE_DEFAULTS.life;
      p.maxLife = Number.isFinite(cfg.maxLife) ? cfg.maxLife : p.life;
      p.alpha = Number.isFinite(cfg.alpha) ? cfg.alpha : PARTICLE_DEFAULTS.alpha;
      p.gravity = Number.isFinite(cfg.gravity) ? cfg.gravity : PARTICLE_DEFAULTS.gravity;
      p.growth = Number.isFinite(cfg.growth) ? cfg.growth : PARTICLE_DEFAULTS.growth;
      p.shape = cfg.shape || PARTICLE_DEFAULTS.shape;
      this.particles.push(p);
      return p;
    }

    scaledCount(base, minimum) {
      return Math.max(minimum || 1, Math.round(base * this.particleScale));
    }

    explosion(x, y, radius, color) {
      const count = this.scaledCount(Math.min(56, Math.floor(radius * 0.65)), 12);
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 45 + Math.random() * 230;
        const life = 0.35 + Math.random() * 0.85;
        this.emitParticle({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 30,
          size: 3 + Math.random() * 9, color: i % 3 === 0 ? '#3a3026' : color,
          life, maxLife: life, gravity: 125, growth: i % 4 === 0 ? 10 : -1
        });
      }
      const smokeCount = this.scaledCount(18, 5);
      for (let i = 0; i < smokeCount; i += 1) {
        const life = 1.2 + Math.random() * 1.4;
        this.emitParticle({
          x: x + (Math.random() - 0.5) * radius * 0.45,
          y: y - Math.random() * 12,
          vx: (Math.random() - 0.5) * 25,
          vy: -22 - Math.random() * 35,
          size: 12 + Math.random() * 22,
          color: '#373832', alpha: 0.55, life, maxLife: life, growth: 16
        });
      }
    }

    muzzle(x, y) {
      this.muzzleFlash = 0.09;
      const count = this.scaledCount(12, 4);
      for (let i = 0; i < count; i += 1) {
        const life = 0.15 + Math.random() * 0.25;
        this.emitParticle({
          x, y, vx: 60 + Math.random() * 100, vy: (Math.random() - 0.5) * 70,
          size: 3 + Math.random() * 7, color: '#f7c353', life, maxLife: life, growth: -4
        });
      }
    }

    enemyMuzzle(x, y, direction, weaponType) {
      const dir = direction || -1;
      const isMortar = weaponType === 'mortar';
      this.muzzleFlash = Math.max(this.muzzleFlash, isMortar ? 0.045 : 0.075);
      const count = this.scaledCount(isMortar ? 10 : 18, isMortar ? 4 : 6);
      for (let i = 0; i < count; i += 1) {
        const life = 0.14 + Math.random() * (isMortar ? 0.22 : 0.34);
        const speed = (isMortar ? 42 : 78) + Math.random() * (isMortar ? 80 : 150);
        this.emitParticle({
          x, y,
          vx: dir * speed + (Math.random() - 0.5) * 24,
          vy: (isMortar ? -55 : -18) + (Math.random() - 0.5) * (isMortar ? 70 : 90),
          size: 3 + Math.random() * (isMortar ? 6 : 9),
          color: i % 4 === 0 ? '#5a554a' : '#ffb34f',
          alpha: i % 4 === 0 ? 0.52 : 0.95,
          life, maxLife: life,
          growth: i % 4 === 0 ? 10 : -4,
          gravity: i % 4 === 0 ? -8 : 12
        });
      }
    }

    tracer(x1, y1, x2, y2, color) {
      const segments = this.scaledCount(5, 2);
      for (let i = 0; i < segments; i += 1) {
        const t = i / segments;
        const life = 0.08 + i * 0.012;
        this.emitParticle({
          x: NS.lerp(x1, x2, t), y: NS.lerp(y1, y2, t),
          vx: (x2 - x1) * 8.5, vy: (y2 - y1) * 8.5,
          size: 2.1, color: color || '#f5d77e', life, maxLife: life,
          alpha: 0.9, shape: 'square'
        });
      }
    }

    rifleMuzzle(x, y, direction) {
      const dir = direction || 1;
      const count = this.scaledCount(5, 2);
      for (let i = 0; i < count; i += 1) {
        const life = 0.08 + Math.random() * 0.1;
        this.emitParticle({
          x, y, vx: dir * (45 + Math.random() * 75), vy: (Math.random() - 0.5) * 38,
          size: 2 + Math.random() * 3, color: '#f7ce68', life, maxLife: life, growth: -6
        });
      }
    }

    tankMuzzle(x, y, direction) {
      const dir = direction || 1;
      const count = this.scaledCount(14, 5);
      for (let i = 0; i < count; i += 1) {
        const life = 0.16 + Math.random() * 0.24;
        this.emitParticle({
          x, y, vx: dir * (70 + Math.random() * 150), vy: (Math.random() - 0.5) * 95,
          size: 4 + Math.random() * 7, color: i % 3 === 0 ? '#5b5b54' : '#f4b84f',
          life, maxLife: life, growth: i % 3 === 0 ? 8 : -5
        });
      }
    }

    projectileTrail(x, y, color) {
      if (this.profile.id === 'low' && Math.random() > 0.52) return;
      const life = 0.32 + Math.random() * 0.2;
      this.emitParticle({
        x, y, vx: -8 + Math.random() * 16, vy: -5 + Math.random() * 10,
        size: 3 + Math.random() * 3, color: color || '#b8b8ae', alpha: 0.55,
        life, maxLife: life, growth: 5
      });
    }

    dirt(x, y, amount) {
      const count = this.scaledCount(amount, 1);
      for (let i = 0; i < count; i += 1) {
        const life = 0.5 + Math.random() * 0.7;
        this.emitParticle({
          x, y, vx: (Math.random() - 0.5) * 170, vy: -50 - Math.random() * 150,
          size: 2 + Math.random() * 5, color: '#6e5335', life, maxLife: life, gravity: 180
        });
      }
    }

    addSmokeZone(x, y, radius, turns) {
      if (this.smokeZones.length >= 8) this.smokeZones.shift();
      this.smokeZones.push({ x, y, radius, turns, maxTurns: turns });
    }

    addWarning(x, y, radius, time, callback, metadata) {
      if (this.warnings.length >= 4) this.warnings.shift();
      const warning = Object.assign({ x, y, radius, time, maxTime: time, callback, triggered: false }, metadata || {});
      this.warnings.push(warning);
      return warning;
    }

    triggerReadyWarnings() {
      this.warnings.forEach((warning) => {
        if (!warning.triggered && warning.time <= 0) {
          warning.triggered = true;
          if (typeof warning.callback === 'function') warning.callback();
        }
      });
    }

    addFloatingText(x, y, text, color) {
      if (this.floatingTexts.length >= this.maxFloatingTexts) this.floatingTexts.shift();
      this.floatingTexts.push({ x, y, text, color: color || '#fff', life: 1.15, maxLife: 1.15 });
    }

    isPointInSmoke(x, y) {
      return this.smokeZones.some((zone) => Math.hypot(zone.x - x, zone.y - y) <= zone.radius);
    }
  }

  NS.EffectsSystem = EffectsSystem;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
