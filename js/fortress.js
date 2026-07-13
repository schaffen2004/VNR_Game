(function (NS) {
  'use strict';

  class Fortress {
    constructor(config) {
      const cfg = config || {};
      Object.assign(this, cfg);
      this.width = Number(cfg.width) || 60;
      this.height = Number(cfg.height) || 35;
      this.health = Number(cfg.health) || 100;
      this.maxHealth = Number(cfg.maxHealth) || this.health;
      this.armor = Number(cfg.armor) || 0;
      this.attackRange = Number(cfg.attackRange) || 0;
      this.attackDamage = Number(cfg.attackDamage) || 0;
      this.fireRate = Number(cfg.fireRate) || 0;
      this.defenseRadius = Number(cfg.defenseRadius) || 0;
      this.coverReduction = NS.clamp(Number(cfg.coverReduction) || 0, 0, 0.5);
      this.active = cfg.active !== false;
      this.status = 'active';
      this.y = Number(cfg.y) || 0;
      this.cooldown = Math.random() * 1.2;
      this.flashTime = 0;
      this.captured = false;
    }

    update(dt, game) {
      const groundY = game.terrain.getHeight(this.x);
      this.y = this.type === 'aircraft'
        ? groundY - this.height - Math.max(90, Number(this.altitude) || 165)
        : groundY - this.height;
      this.flashTime = Math.max(0, this.flashTime - dt);
      if (!this.active || this.health <= 0) return;
      this.cooldown = Math.max(0, this.cooldown - dt);

      // Chỉ lô cốt và ụ súng bắn thẳng. Hào chỉ phòng thủ;
      // pháo/cối chỉ bắn xa qua EnemyAI trong giai đoạn phản công.
      if ((this.type === 'machineGun' || this.type === 'bunker' || this.type === 'enemyTank') &&
          (game.phase === NS.GamePhase.COMMAND || game.phase === NS.GamePhase.ENEMY)) {
        this.updateDirectFire(game);
      }
      this.updateStatus();
    }

    updateDirectFire(game) {
      if (this.cooldown > 0 || this.attackRange <= 0 || this.attackDamage <= 0) return;
      const candidates = game.squads.filter((unit) => {
        if (unit.state === 'dead' || unit.type !== 'infantry') return false;
        const distance = Math.abs(unit.x - this.x);
        return distance <= this.attackRange && unit.x < this.x + 40;
      });
      if (!candidates.length) return;

      candidates.sort((a, b) => this.targetScore(b, game) - this.targetScore(a, game));
      const target = candidates[0];
      const inSmoke = game.effects.isPointInSmoke(target.x, target.y) || game.effects.isPointInSmoke(this.x, this.y);
      const weaponAccuracy = this.type === 'bunker' ? 0.72 : (this.type === 'enemyTank' ? 0.76 : 0.84);
      const smokePenalty = inSmoke ? 0.42 : 1;
      const coverPenalty = target.cover > 0.45 ? 0.45 : (target.cover > 0.2 ? 0.66 : 1);
      const accuracy = weaponAccuracy * smokePenalty * coverPenalty;
      const shotCount = this.type === 'bunker' ? 3 : (this.type === 'enemyTank' ? 2 : 4);
      const muzzle = this.getDirectFireMuzzle();

      game.audio.play(this.type === 'enemyTank' ? 'tank' : 'machinegun');
      this.flashTime = 0.1;
      this.cooldown = (1 / Math.max(0.1, this.fireRate)) * (1.15 + Math.random() * 0.75);
      for (let i = 0; i < shotCount; i += 1) {
        game.effects.emitParticle({
          x: muzzle.x,
          y: muzzle.y,
          vx: (target.x - muzzle.x) * 2.5,
          vy: (target.y - muzzle.y) * 2.5 + (Math.random() - 0.5) * 80,
          size: 2,
          color: '#f1ce72',
          life: 0.16,
          maxLife: 0.16
        });
      }

      if (Math.random() < accuracy) {
        const difficulty = NS.Difficulty[game.difficulty] || NS.Difficulty.medium;
        target.takeDamage(this.attackDamage * difficulty.enemyDamage, game, this.type);
      }
    }

    getDirectFireMuzzle() {
      if (this.type === 'enemyTank') {
        return { x: this.x - this.width * 0.52, y: this.y + this.height * 0.25 };
      }
      if (this.type === 'bunker') {
        return { x: this.x - this.width * 0.22, y: this.y + this.height * 0.54 };
      }
      return { x: this.x - 36, y: this.y + 12 };
    }

    targetScore(unit, game) {
      let score = 100 - Math.abs(unit.x - this.x) / 5;
      if (unit.state === 'charging') score += 100;
      if (unit.state === 'attacking') score += 70;
      if (unit.cover < 0.2) score += 50;
      if (game.effects.isPointInSmoke(unit.x, unit.y)) score -= 55;
      return score;
    }

    getDefensiveTrenchCover(game, ammoData) {
      if (!game || this.type === 'wire' || this.type === 'defensiveTrench') return 0;
      const trench = game.fortresses.find((item) => {
        if (!item.active || item.type !== 'defensiveTrench') return false;
        const radius = item.defenseRadius || item.width * 0.65;
        return Math.abs(item.x - this.x) <= radius;
      });
      if (!trench) return 0;

      // Đạn xuyên phá bỏ qua một phần lớn lợi ích của hào; các loại khác chịu đủ hiệu ứng.
      const penetrationFactor = ammoData && ammoData.id === 'ap' ? 0.45 : 1;
      return NS.clamp((trench.coverReduction || 0.22) * penetrationFactor, 0, 0.42);
    }

    getDamageMultiplier(ammoData) {
      if (this.type === 'wire') return ammoData.fenceDamage || 1;
      if (this.type === 'minefield') {
        const byAmmo = { he: 1.5, breach: 1.8, cluster: 1.15, ap: 0.45, smoke: 0.05, rifle: 0.08, 'tank-shell': 0.8, 'mine-trigger': 0.7 };
        return byAmmo[ammoData.id] || 0.35;
      }
      if (this.type === 'aircraft') {
        const byAmmo = { he: 1.2, cluster: 1.6, ap: 0.75, smoke: 0.05, rifle: 0.25, 'tank-shell': 1.2 };
        return byAmmo[ammoData.id] || 0.7;
      }
      if (this.type === 'defensiveTrench') {
        const byAmmo = {
          he: 1.35,
          cluster: 0.9,
          breach: 0.75,
          ap: 0.5,
          smoke: 0.08,
          rifle: 0.45,
          'tank-shell': 0.9,
          'tank-crush': 0.25
        };
        return byAmmo[ammoData.id] || 0.75;
      }
      return ammoData.structureDamage || 1;
    }

    takeDamage(amount, ammo, game) {
      if (!this.active || this.health <= 0) return 0;
      const ammoData = ammo || { id: 'generic', structureDamage: 1, fenceDamage: 1 };
      const multiplier = this.getDamageMultiplier(ammoData);
      const armorReduction = (this.type === 'wire' || this.type === 'defensiveTrench' || this.type === 'minefield')
        ? Math.min(0.25, this.armor / 160)
        : Math.min(0.72, this.armor / 160);
      const trenchCover = this.getDefensiveTrenchCover(game, ammoData);
      const damage = Math.max(1, amount * multiplier * (1 - armorReduction) * (1 - trenchCover));
      this.health = Math.max(0, this.health - damage);
      this.flashTime = 0.18;
      this.updateStatus();
      if (this.health <= 0) {
        this.active = false;
        this.status = 'destroyed';
        if (game) {
          game.stats.structuresDestroyed += 1;
          game.log(`${this.name} đã bị vô hiệu hóa.`, 'important');
          game.squads.forEach((unit) => unit.boostMorale(6));
        }
      }
      return damage;
    }

    updateStatus() {
      const ratio = this.health / this.maxHealth;
      if (ratio <= 0) this.status = 'destroyed';
      else if (ratio < 0.28) this.status = 'disabled';
      else if (ratio < 0.65) this.status = 'damaged';
      else this.status = 'active';
    }

    getRect() {
      return { x: this.x - this.width / 2, y: this.y, width: this.width, height: this.height };
    }

    serialize() {
      return {
        id: this.id,
        health: this.health,
        active: this.active,
        status: this.status,
        captured: this.captured
      };
    }

    restore(data) {
      if (!data) return;
      this.health = NS.clamp(Number(data.health), 0, this.maxHealth);
      this.active = Boolean(data.active && this.health > 0);
      this.status = data.status || (this.active ? 'active' : 'destroyed');
      this.captured = Boolean(data.captured);
    }
  }

  NS.Fortress = Fortress;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
