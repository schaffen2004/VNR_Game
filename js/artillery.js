(function (NS) {
  'use strict';

  class Artillery {
    constructor(config) {
      const cfg = config || {};
      this.id = cfg.id || 'player-artillery';
      this.name = cfg.name || 'Pháo 105 mm';
      this.x = Number(cfg.x) || 170;
      this.y = Number(cfg.y) || 560;
      this.angle = Number(cfg.angle) || 45;
      this.power = Number(cfg.power) || 430;
      this.health = Number(cfg.health) || 260;
      this.maxHealth = Number(cfg.maxHealth) || 260;
      this.active = true;
      this.lastFireX = null;
      this.lastFireTurn = 0;
    }

    updatePosition(terrain) {
      this.y = terrain.getHeight(this.x) - 12;
    }

    aim(angle, power) {
      this.angle = NS.clamp(Number(angle), 15, 80);
      this.power = NS.clamp(Number(power), 150, 600);
    }

    getMuzzlePosition() {
      const radians = this.angle * Math.PI / 180;
      return {
        x: this.x + Math.cos(radians) * 42,
        y: this.y - 16 - Math.sin(radians) * 42
      };
    }

    fire(game, ammoType) {
      if (!this.active || this.health <= 0) return false;
      const ammo = NS.AmmoTypes[ammoType];
      if (!ammo || game.resources.ammo[ammoType] <= 0) return false;
      const muzzle = this.getMuzzlePosition();
      const radians = this.angle * Math.PI / 180;
      const projectile = new Projectile({
        x: muzzle.x,
        y: muzzle.y,
        vx: Math.cos(radians) * this.power,
        vy: -Math.sin(radians) * this.power,
        ammoType,
        owner: 'player'
      });
      game.projectiles.push(projectile);
      game.resources.ammo[ammoType] = Math.max(0, game.resources.ammo[ammoType] - 1);
      game.shotsFired += 1;
      this.lastFireX = this.x;
      this.lastFireTurn = game.turn;
      game.effects.muzzle(muzzle.x, muzzle.y);
      game.audio.play('fire');
      game.camera.focus(projectile.x + 120, projectile.y);
      game.log(`${this.name} khai hỏa ${ammo.name}.`, 'important');
      return true;
    }

    takeDamage(amount, game) {
      if (!this.active) return;
      const damage = Math.max(1, Number(amount) || 0);
      this.health = Math.max(0, this.health - damage);
      if (game) game.effects.addFloatingText(this.x, this.y - 45, `-${Math.round(damage)}`, '#ff8e72');
      if (this.health <= 0) {
        this.active = false;
        if (game) game.log('Trận địa pháo của ta đã bị phá hủy!', 'danger');
      }
    }

    serialize() {
      return {
        x: this.x, angle: this.angle, power: this.power, health: this.health,
        active: this.active, lastFireX: this.lastFireX, lastFireTurn: this.lastFireTurn
      };
    }

    restore(data) {
      if (!data) return;
      this.x = Number(data.x) || this.x;
      this.angle = Number(data.angle) || this.angle;
      this.power = Number(data.power) || this.power;
      this.health = NS.clamp(Number(data.health), 0, this.maxHealth);
      this.active = Boolean(data.active && this.health > 0);
      this.lastFireX = data.lastFireX;
      this.lastFireTurn = Number(data.lastFireTurn) || 0;
    }
  }

  class Projectile {
    constructor(config) {
      const cfg = config || {};
      this.x = Number(cfg.x) || 0;
      this.y = Number(cfg.y) || 0;
      this.vx = Number(cfg.vx) || 0;
      this.vy = Number(cfg.vy) || 0;
      this.ammoType = cfg.ammoType || 'he';
      this.owner = cfg.owner || 'player';
      this.customAmmo = cfg.customAmmo || null;
      this.radius = cfg.radius || 5;
      this.alive = true;
      this.age = 0;
      this.splitDone = Boolean(cfg.splitDone);
      this.ignoreWind = Boolean(cfg.ignoreWind);
      this.sourceId = cfg.sourceId || null;
      this.collisionGrace = Math.max(0, Number(cfg.collisionGrace) || 0);
      this.followCamera = cfg.followCamera !== false;
      this.shellType = cfg.shellType || 'artillery';
    }

    getAmmo() {
      return this.customAmmo || NS.AmmoTypes[this.ammoType] || NS.AmmoTypes.he;
    }

    update(dt, game) {
      if (!this.alive) return;
      this.age += dt;
      if (!this.ignoreWind) this.vx += game.wind * dt;
      this.vy += NS.Constants.GRAVITY * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      game.effects.projectileTrail(this.x, this.y, this.owner === 'enemy' ? '#7c7770' : '#c7c5b8');

      const ammo = this.getAmmo();
      if (ammo.cluster && !this.splitDone && this.vy > 20 && this.y < game.terrain.getHeight(this.x) - 110) {
        this.split(game);
        return;
      }

      // Đạn địch không va chạm với công sự cùng phe trên đường bay.
      // Điểm rơi an toàn đã được EnemyAI chọn trước khi khai hỏa.
      const structure = this.owner === 'enemy' ? null : game.getStructureAtPoint(this.x, this.y);
      const canCollide = this.age >= this.collisionGrace;
      if (structure && canCollide && structure.id !== this.sourceId) {
        this.explode(game, this.x, this.y);
        return;
      }

      if (this.x < -80 || this.x > NS.Constants.WORLD_WIDTH + 80 || this.y > NS.Constants.WORLD_HEIGHT + 100) {
        this.alive = false;
        if (this.owner === 'player') game.log('Đạn rơi ngoài khu vực tác chiến.');
        return;
      }

      if (canCollide && this.x >= 0 && this.x <= NS.Constants.WORLD_WIDTH && game.terrain.isBelowSurface(this.x, this.y)) {
        this.explode(game, this.x, game.terrain.getHeight(this.x));
      } else if (this.followCamera) {
        game.camera.focus(this.x, this.y - 35);
      }
    }

    split(game) {
      this.alive = false;
      const ammo = Object.assign({}, this.getAmmo(), { cluster: false, radius: 38, damage: 34, terrainDamage: 18 });
      for (let i = 0; i < 6; i += 1) {
        game.projectiles.push(new Projectile({
          x: this.x + (i - 2.5) * 4,
          y: this.y,
          vx: this.vx * 0.55 + (i - 2.5) * 28,
          vy: this.vy * 0.25 - 45 + Math.random() * 34,
          ammoType: this.ammoType,
          customAmmo: ammo,
          owner: this.owner,
          splitDone: true
        }));
      }
      game.effects.explosion(this.x, this.y, 25, '#e1b163');
    }

    explode(game, x, y) {
      if (!this.alive) return;
      this.alive = false;
      const ammo = this.getAmmo();
      game.applyExplosion(x, y, ammo, this.owner);
    }
  }

  NS.Artillery = Artillery;
  NS.Projectile = Projectile;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
