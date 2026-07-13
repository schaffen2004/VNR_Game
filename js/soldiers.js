(function (NS) {
  'use strict';

  class SoldierSquad {
    constructor(config) {
      const cfg = config || {};
      this.id = cfg.id || `squad-${Date.now()}`;
      this.name = cfg.name || this.id;
      this.type = 'infantry';
      this.x = Number(cfg.x) || 150;
      this.y = Number(cfg.y) || 400;
      this.health = Number(cfg.health) || 100;
      this.maxHealth = Number(cfg.maxHealth) || this.health;
      this.soldiers = Number(cfg.soldiers) || 10;
      this.maxSoldiers = Number(cfg.soldiers) || 10;
      this.morale = Number(cfg.morale) || 100;
      this.speed = Number(cfg.speed) || 30;
      this.diggingSpeed = Number(cfg.diggingSpeed) || 10;
      this.digWorkPerTurn = Number(cfg.digWorkPerTurn) || 28;
      this.digWorkRemaining = this.digWorkPerTurn;
      this.digPausedTurn = -1;
      this.attackDamage = Number(cfg.attackDamage) || 10;
      this.attackRange = Number(cfg.attackRange) || 170;
      this.cover = 0;
      this.state = cfg.state || 'idle';
      this.selected = false;
      this.targetX = null;
      this.targetY = null;
      this.attackTarget = null;
      this.activeTrench = null;
      this.digStandX = null;
      this.attackCooldown = 0;
      this.volleyShotsRemaining = 0;
      this.engineer = Boolean(cfg.engineer);
      this.flashTime = 0;
      this.lastDamageTurn = 0;
      this.mineTriggerCooldown = 0;
      this.muzzleFlashTime = 0;
      this.inTrench = false;
      this.trenchId = null;
    }

    startTurn() {
      if (this.state === 'dead') return;
      this.digWorkRemaining = this.digWorkPerTurn;
      this.digPausedTurn = -1;
      if (this.activeTrench && !this.activeTrench.completed) this.state = 'digging';
      if (this.state === 'attacking' && this.volleyShotsRemaining <= 0) this.state = 'idle';
    }

    update(dt, game) {
      if (this.state === 'dead') return;
      this.syncToGround(game);
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      this.flashTime = Math.max(0, this.flashTime - dt);
      this.muzzleFlashTime = Math.max(0, this.muzzleFlashTime - dt);
      this.mineTriggerCooldown = Math.max(0, this.mineTriggerCooldown - dt);
      this.cover = this.calculateCover(game);

      if (this.state === 'moving' || this.state === 'charging' || this.state === 'retreating') {
        this.updateMovement(dt, game);
      } else if (this.state === 'digging') {
        this.updateDigging(dt, game);
      } else if (this.state === 'attacking') {
        this.updateAttack(dt, game);
      } else if (this.state === 'capturing') {
        this.morale = NS.clamp(this.morale + 4 * dt, 0, 100);
      } else if (this.state === 'hiding') {
        this.morale = NS.clamp(this.morale + 2.2 * dt, 0, 100);
      }

      this.syncToGround(game);
      this.cover = this.calculateCover(game);

      if (this.morale <= 0 && this.state !== 'retreating') {
        this.retreat(game);
        game.log(`${this.name} mất tinh thần và rút lui.`, 'danger');
      }
    }

    syncToGround(game) {
      const dugout = this.trenchId
        ? game.trenches.find((item) => item.id === this.trenchId && item.completed && item.durability > 15)
        : null;
      if (dugout && this.inTrench) {
        this.x = dugout.getSlotX(this.id);
        this.y = dugout.getFloorY(game.terrain) - 8;
        return;
      }
      if (this.inTrench || this.trenchId) {
        this.inTrench = false;
        this.trenchId = null;
        if (this.state === 'sheltered') this.state = 'idle';
      }
      this.y = game.terrain.getHeight(this.x) - 10;
    }

    calculateCover(game) {
      let cover = 0;
      const dugout = this.trenchId ? game.trenches.find((item) => item.id === this.trenchId) : null;
      if (dugout && this.inTrench) cover = dugout.getCoverFor(this);
      if (game.effects.isPointInSmoke(this.x, this.y)) cover = Math.max(cover, 0.42);
      if (this.state === 'hiding') cover = Math.max(cover, 0.38);
      return NS.clamp(cover, 0, 0.84);
    }

    leaveShelter(game) {
      if (!this.trenchId) return;
      const dugout = game && game.trenches.find((item) => item.id === this.trenchId);
      if (dugout) dugout.removeOccupant(this.id);
      this.inTrench = false;
      this.trenchId = null;
      if (game) this.y = game.terrain.getHeight(this.x) - 10;
    }

    enterShelter(game, dugout) {
      if (!dugout || !dugout.completed || !dugout.addOccupant(this.id)) return false;
      this.inTrench = true;
      this.trenchId = dugout.id;
      this.x = dugout.getSlotX(this.id);
      this.y = dugout.getFloorY(game.terrain) - 8;
      this.state = 'sheltered';
      this.targetX = null;
      this.targetY = null;
      this.attackTarget = null;
      return true;
    }

    updateMovement(dt, game) {
      if (this.targetX === null) {
        this.state = 'idle';
        return;
      }
      const direction = Math.sign(this.targetX - this.x);
      const distance = Math.abs(this.targetX - this.x);
      if (distance < 4) {
        this.x = this.targetX;
        this.targetX = null;
        this.targetY = null;
        this.state = Math.abs(this.x - ((game.mapConfig && game.mapConfig.flagX) || 2360)) < 70 ? 'capturing' : 'idle';
        return;
      }

      const wire = game.getBlockingWire(this.x, this.targetX);
      if (wire && Math.abs(wire.x - this.x) < 30) {
        if (this.state === 'charging') {
          this.attack(wire, game);
        } else {
          this.state = 'idle';
          this.targetX = null;
          game.log(`${this.name} bị chặn bởi ${wire.name}.`, 'danger');
        }
        return;
      }

      let speedMultiplier = this.state === 'charging' ? 1.35 : 1;
      if (this.state === 'retreating') speedMultiplier = 1.2;
      if (this.inTrench) speedMultiplier *= NS.Constants.TRENCH_MOVE_MULTIPLIER;
      else if (this.cover > 0.45) speedMultiplier *= 0.72;
      speedMultiplier *= game.getMovementMultiplier ? game.getMovementMultiplier(this.x, this.type) : 1;
      const nextX = this.x + direction * this.speed * speedMultiplier * dt;
      this.x = NS.clamp(nextX, 20, NS.Constants.WORLD_WIDTH - 20);
      this.syncToGround(game);
      if (game.applyMinefieldHazard) game.applyMinefieldHazard(this);
    }

    updateDigging(dt, game) {
      const trench = this.activeTrench;
      if (!trench || trench.durability <= 0) {
        this.state = 'idle';
        this.activeTrench = null;
        this.digStandX = null;
        return;
      }

      // Các tổ được chọn đứng quanh cửa hầm trong lúc đào; vị trí hầm nằm phía trước đội hình.
      if (!Number.isFinite(this.digStandX)) {
        const index = Math.max(0, trench.assignedUnitIds.indexOf(this.id));
        const side = index % 2 === 0 ? -1 : 1;
        const rank = Math.floor(index / 2);
        this.digStandX = trench.centerX + side * (trench.width * 0.5 + 18 + rank * 13);
      }
      this.x = NS.clamp(this.digStandX, 20, NS.Constants.WORLD_WIDTH - 20);
      this.y = game.terrain.getHeight(this.x) - 10;

      if (trench.completed) {
        this.finishTrench(game);
        return;
      }

      if (this.digWorkRemaining <= 0) {
        if (this.digPausedTurn !== game.turn) {
          this.digPausedTurn = game.turn;
          game.log(`${this.name} đã hết sức đào trong lượt này; công việc sẽ tiếp tục ở lượt sau.`);
        }
        return;
      }

      const intended = this.diggingSpeed * (this.engineer ? 1.15 : 1) * dt;
      const amount = Math.min(intended, this.digWorkRemaining);
      const built = trench.build(amount);
      this.digWorkRemaining = Math.max(0, this.digWorkRemaining - built);
      const workX = trench.getBuildFrontX();
      const workY = game.terrain.getHeight(workX);

      if (Math.random() < dt * 1.25) {
        game.effects.dirt(workX, workY, 2);
        game.audio.play('dig');
      }
      if (trench.completed) this.finishTrench(game);
    }

    finishTrench(game) {
      const dugout = this.activeTrench;
      if (!dugout) return;
      this.activeTrench = null;
      this.digStandX = null;
      if (!dugout.completionRegistered) {
        dugout.completionRegistered = true;
        game.stats.trenchesCompleted += 1;
        game.log('Hầm trú ẩn đã hoàn thành; các tổ được chọn đang chui xuống hầm.', 'important');
      }
      if (!this.enterShelter(game, dugout)) {
        this.state = 'idle';
        this.x = NS.clamp(dugout.centerX - dugout.width * 0.5 - 20, 20, NS.Constants.WORLD_WIDTH - 20);
        this.y = game.terrain.getHeight(this.x) - 10;
      }
    }

    updateAttack(dt, game) {
      const target = this.attackTarget;
      if (!target || !target.active || target.health <= 0) {
        this.stopAttack();
        return;
      }

      const dx = target.x - this.x;
      const distance = Math.abs(dx);
      const targetHalfWidth = (Number(target.width) || 30) * 0.5;
      if (distance > this.attackRange + targetHalfWidth) {
        const wire = game.getBlockingWire(this.x, target.x);
        if (wire && wire !== target) {
          this.stopAttack();
          game.log(`${this.name} không thể tiến đến tầm bắn vì ${wire.name} đang chặn bộ binh.`, 'danger');
          return;
        }
        this.x += Math.sign(dx) * this.speed * 0.5 * dt;
        this.syncToGround(game);
        return;
      }

      // Tự động chiến đấu hết cỡ: sau một lệnh tấn công, bộ binh tiếp tục
      // bắn từng loạt cho đến khi mục tiêu bị phá hủy hoặc người chơi ra lệnh khác.
      if (this.attackCooldown <= 0) {
        this.fireRifleVolley(target, game);
        this.attackCooldown = 0.48;
      }
    }

    fireRifleVolley(target, game) {
      const moraleMultiplier = 0.65 + this.morale / 250;
      const typeMultiplier = {
        wire: 0.72,
        defensiveTrench: 0.58,
        machineGun: 0.82,
        mortar: 0.9,
        artillery: 0.9,
        bunker: 0.3,
        command: 0.24
      }[target.type] || 0.7;
      const damage = this.attackDamage * moraleMultiplier * typeMultiplier * (0.82 + Math.random() * 0.34) * (game.attackPowerMultiplier || 1);
      const muzzleX = this.x + Math.sign(target.x - this.x) * 24;
      const muzzleY = this.y - 12;
      const impactY = target.y + (target.height || 30) * 0.45;
      const tracers = Math.max(2, Math.min(5, Math.ceil(this.soldiers / 3)));

      for (let i = 0; i < tracers; i += 1) {
        const spreadY = impactY + (Math.random() - 0.5) * Math.max(12, target.height || 24);
        game.effects.tracer(muzzleX, muzzleY + (Math.random() - 0.5) * 8, target.x, spreadY, '#f2d178');
      }
      game.effects.rifleMuzzle(muzzleX, muzzleY, Math.sign(target.x - this.x));
      game.audio.play('rifle');
      this.muzzleFlashTime = 0.12;
      target.takeDamage(damage, { id: 'rifle', structureDamage: 1, fenceDamage: 1 }, game);
      game.effects.addFloatingText(target.x, target.y - 30, `-${Math.round(damage)}`, '#f4d575');
    }

    stopAttack() {
      this.attackTarget = null;
      this.volleyShotsRemaining = 0;
      if (this.state !== 'dead') this.state = 'idle';
    }

    moveTo(x, y, charge, game) {
      if (this.state === 'dead') return;
      this.leaveShelter(game);
      this.targetX = NS.clamp(Number(x), 20, NS.Constants.WORLD_WIDTH - 20);
      this.targetY = Number(y) || this.y;
      this.state = charge ? 'charging' : 'moving';
      this.attackTarget = null;
      this.volleyShotsRemaining = 0;
      this.activeTrench = null;
      this.digStandX = null;
    }

    digTrench(dugout, slotIndex, game) {
      if (this.state === 'dead' || !dugout) return;
      this.leaveShelter(game);
      this.activeTrench = dugout;
      const index = Number.isFinite(Number(slotIndex)) ? Number(slotIndex) : Math.max(0, dugout.assignedUnitIds.indexOf(this.id));
      const side = index % 2 === 0 ? -1 : 1;
      const rank = Math.floor(index / 2);
      this.digStandX = NS.clamp(dugout.centerX + side * (dugout.width * 0.5 + 18 + rank * 13), 20, NS.Constants.WORLD_WIDTH - 20);
      this.x = this.digStandX;
      this.targetX = dugout.centerX;
      this.state = 'digging';
      this.attackTarget = null;
      this.volleyShotsRemaining = 0;
    }

    attack(target, game) {
      if (this.state === 'dead' || !target) return;
      this.leaveShelter(game);
      this.attackTarget = target;
      this.volleyShotsRemaining = Number.POSITIVE_INFINITY;
      this.attackCooldown = 0;
      this.state = 'attacking';
      this.activeTrench = null;
      this.digStandX = null;
    }

    hide() {
      if (this.state !== 'dead') {
        this.state = this.inTrench ? 'sheltered' : 'hiding';
        this.targetX = null;
        this.attackTarget = null;
      }
    }

    retreat(game) {
      if (this.state === 'dead') return;
      this.leaveShelter(game);
      this.targetX = 180;
      this.state = 'retreating';
      this.attackTarget = null;
      this.volleyShotsRemaining = 0;
      this.activeTrench = null;
      this.digStandX = null;
      if (game) game.audio.play('charge');
    }

    takeDamage(amount, game, source) {
      if (this.state === 'dead') return;
      const sourceMultiplier = source === 'machineGun' && this.state === 'charging' ? 1.22 : 1;
      const effective = Math.max(0.5, amount * sourceMultiplier * (1 - this.cover));
      this.health = Math.max(0, this.health - effective);
      this.flashTime = 0.18;
      this.lastDamageTurn = game.turn;
      const oldSoldiers = this.soldiers;
      this.soldiers = Math.max(0, Math.ceil(this.maxSoldiers * this.health / this.maxHealth));
      const casualties = Math.max(0, oldSoldiers - this.soldiers);
      this.morale = NS.clamp(this.morale - effective * 0.3 - casualties * 3.5, 0, 100);
      game.effects.addFloatingText(this.x, this.y - 30, `-${Math.round(effective)}`, '#ff8f78');
      if (this.health <= 0 || this.soldiers <= 0) {
        this.health = 0;
        this.soldiers = 0;
        this.state = 'dead';
        this.selected = false;
        this.leaveShelter(game);
        this.activeTrench = null;
        this.digStandX = null;
        game.log(`${this.name} không còn khả năng chiến đấu.`, 'danger');
      }
    }

    boostMorale(amount) {
      if (this.state !== 'dead') this.morale = NS.clamp(this.morale + amount, 0, 100);
    }

    serialize() {
      return {
        id: this.id, type: this.type, x: this.x, health: this.health, soldiers: this.soldiers,
        morale: this.morale, state: this.state, targetX: this.targetX,
        selected: this.selected, activeTrenchId: this.activeTrench ? this.activeTrench.id : null,
        digWorkRemaining: this.digWorkRemaining, digStandX: this.digStandX,
        inTrench: this.inTrench, trenchId: this.trenchId
      };
    }

    restore(data) {
      if (!data) return;
      this.x = Number(data.x) || this.x;
      this.health = NS.clamp(Number(data.health), 0, this.maxHealth);
      this.soldiers = NS.clamp(Number(data.soldiers), 0, this.maxSoldiers);
      this.morale = NS.clamp(Number(data.morale), 0, 100);
      this.state = this.health <= 0 ? 'dead' : (data.state || 'idle');
      this.targetX = data.targetX === null ? null : Number(data.targetX);
      this.selected = Boolean(data.selected && this.state !== 'dead');
      this.savedActiveTrenchId = data.activeTrenchId || null;
      this.savedTrenchId = data.trenchId || null;
      this.inTrench = Boolean(data.inTrench && this.savedTrenchId);
      this.trenchId = this.inTrench ? this.savedTrenchId : null;
      this.digStandX = Number.isFinite(Number(data.digStandX)) ? Number(data.digStandX) : null;
      const savedDigWork = Number(data.digWorkRemaining);
      this.digWorkRemaining = Number.isFinite(savedDigWork) ? NS.clamp(savedDigWork, 0, this.digWorkPerTurn) : this.digWorkPerTurn;
    }
  }

  class TankUnit {
    constructor(config) {
      const cfg = config || {};
      this.id = cfg.id || `tank-${Date.now()}`;
      this.name = cfg.name || this.id;
      this.type = 'tank';
      this.x = Number(cfg.x) || 520;
      this.y = Number(cfg.y) || 400;
      this.health = Number(cfg.health) || 200;
      this.maxHealth = Number(cfg.maxHealth) || this.health;
      this.crew = Number(cfg.crew) || 4;
      this.maxCrew = this.crew;
      this.soldiers = this.crew;
      this.maxSoldiers = this.crew;
      this.morale = 100;
      this.speed = Number(cfg.speed) || 30;
      this.armor = NS.clamp(Number(cfg.armor) || 0.35, 0, 0.7);
      this.attackDamage = Number(cfg.attackDamage) || 32;
      this.attackRange = Number(cfg.attackRange) || 280;
      this.cover = 0.08;
      this.state = 'idle';
      this.selected = false;
      this.targetX = null;
      this.targetY = null;
      this.attackTarget = null;
      this.attackCooldown = 0;
      this.maxShells = Math.max(10, Number(cfg.maxShells) || 10);
      this.shells = Math.max(0, Math.min(this.maxShells, Number.isFinite(Number(cfg.shells)) ? Number(cfg.shells) : this.maxShells));
      this.shotsRemaining = this.shells > 0 ? this.shells : 0;
      this.flashTime = 0;
      this.muzzleFlashTime = 0;
      this.lastDamageTurn = 0;
      this.mineTriggerCooldown = 0;
      this.activeTrench = null;
    }

    startTurn() {
      if (this.state === 'dead') return;
      this.shotsRemaining = this.shells > 0 ? this.shells : 0;
      if (this.state === 'attacking') this.state = 'idle';
    }

    update(dt, game) {
      if (this.state === 'dead') return;
      this.y = game.terrain.getHeight(this.x) - 12;
      this.flashTime = Math.max(0, this.flashTime - dt);
      this.muzzleFlashTime = Math.max(0, this.muzzleFlashTime - dt);
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      this.mineTriggerCooldown = Math.max(0, this.mineTriggerCooldown - dt);
      this.cover = game.effects.isPointInSmoke(this.x, this.y) ? 0.22 : 0.08;

      if (this.state === 'moving' || this.state === 'charging' || this.state === 'retreating') this.updateMovement(dt, game);
      else if (this.state === 'attacking') this.updateAttack(dt, game);
    }

    updateMovement(dt, game) {
      if (this.targetX === null) {
        this.state = 'idle';
        return;
      }
      const distance = Math.abs(this.targetX - this.x);
      if (distance < 5) {
        this.x = this.targetX;
        this.targetX = null;
        this.state = 'idle';
        return;
      }
      const wire = game.getBlockingWire(this.x, this.targetX);
      const direction = Math.sign(this.targetX - this.x);
      const slope = Math.abs(game.terrain.getSlope(this.x));
      const slopePenalty = NS.clamp(1 - slope * 0.55, 0.45, 1);
      let obstaclePenalty = 1;

      // Dây thép gai chỉ chặn bộ binh. Xe tăng có thể cán qua nhưng bị chậm
      // và gây hư hại trực tiếp cho hàng rào khi đi xuyên qua.
      if (wire && Math.abs(wire.x - this.x) < 54) {
        obstaclePenalty = 0.48;
        if (Math.abs(wire.x - this.x) < 28) {
          wire.takeDamage(18 * dt, { id: 'tank-crush', structureDamage: 0.2, fenceDamage: 2.1 }, game);
        }
      }
      this.x = NS.clamp(this.x + direction * this.speed * slopePenalty * obstaclePenalty * (game.getMovementMultiplier ? game.getMovementMultiplier(this.x, this.type) : 1) * dt, 20, NS.Constants.WORLD_WIDTH - 20);
      this.y = game.terrain.getHeight(this.x) - 12;
      if (game.applyMinefieldHazard) game.applyMinefieldHazard(this);
    }

    updateAttack(dt, game) {
      const target = this.attackTarget;
      if (!target || !target.active || target.health <= 0 || this.shotsRemaining <= 0 || this.shells <= 0) {
        this.attackTarget = null;
        this.state = 'idle';
        return;
      }
      const dx = target.x - this.x;
      const distance = Math.abs(dx);
      if (distance > this.attackRange + target.width * 0.5) {
        const desiredX = target.x - Math.sign(dx) * this.attackRange * 0.82;
        const direction = Math.sign(desiredX - this.x);
        const slope = Math.abs(game.terrain.getSlope(this.x));
        const slopePenalty = NS.clamp(1 - slope * 0.55, 0.45, 1);
        const wire = game.getBlockingWire(this.x, desiredX);
        let obstaclePenalty = 1;
        if (wire && Math.abs(wire.x - this.x) < 54) {
          obstaclePenalty = 0.48;
          if (Math.abs(wire.x - this.x) < 28) {
            wire.takeDamage(18 * dt, { id: 'tank-crush', structureDamage: 0.2, fenceDamage: 2.1 }, game);
          }
        }
        this.x = NS.clamp(this.x + direction * this.speed * slopePenalty * obstaclePenalty * (game.getMovementMultiplier ? game.getMovementMultiplier(this.x, this.type) : 1) * dt, 20, NS.Constants.WORLD_WIDTH - 20);
        this.y = game.terrain.getHeight(this.x) - 12;
        if (game.applyMinefieldHazard) game.applyMinefieldHazard(this);
        return;
      }
      if (this.attackCooldown <= 0) this.fireMainGun(target, game);
    }

    fireMainGun(target, game) {
      const direction = Math.sign(target.x - this.x) || 1;
      const muzzleX = this.x + direction * 38;
      const muzzleY = this.y - 24;
      const impactY = target.y + (target.height || 30) * 0.45;
      game.effects.tankMuzzle(muzzleX, muzzleY, direction);
      game.effects.tracer(muzzleX, muzzleY, target.x, impactY, '#ffd47a');
      game.effects.explosion(target.x, impactY, 18, '#e9a54d');
      game.audio.play('tank');
      this.muzzleFlashTime = 0.15;
      this.shotsRemaining = Math.max(0, this.shotsRemaining - 1);
      this.shells = Math.max(0, this.shells - 1);
      this.attackCooldown = 1.1;
      const ammo = { id: 'tank-shell', structureDamage: 1.35, fenceDamage: 0.55 };
      const damage = this.attackDamage * (0.9 + Math.random() * 0.2) * (game.attackPowerMultiplier || 1);
      target.takeDamage(damage, ammo, game);
      game.effects.addFloatingText(target.x, target.y - 34, `-${Math.round(damage)}`, '#ffd47a');
      // Giữ nguyên mục tiêu để xe tăng tự bắn tiếp cho đến khi mục tiêu bị phá
      // hoặc toàn bộ số đạn khả dụng đã được sử dụng.
      if (!target.active || target.health <= 0 || this.shotsRemaining <= 0 || this.shells <= 0) {
        this.stopAttack();
      }
    }

    stopAttack() {
      this.attackTarget = null;
      if (this.state !== 'dead') this.state = 'idle';
    }

    moveTo(x, y, charge, game) {
      if (this.state === 'dead') return;
      this.leaveShelter(game);
      this.targetX = NS.clamp(Number(x), 20, NS.Constants.WORLD_WIDTH - 20);
      this.targetY = Number(y) || this.y;
      this.state = charge ? 'charging' : 'moving';
      this.attackTarget = null;
    }

    attack(target) {
      if (this.state === 'dead' || !target || this.shotsRemaining <= 0 || this.shells <= 0) return;
      this.attackTarget = target;
      this.state = 'attacking';
      this.attackCooldown = 0;
    }

    hide() {
      // Xe tăng không nhận trạng thái ẩn nấp như bộ binh.
    }

    retreat() {
      if (this.state === 'dead') return;
      this.targetX = 230;
      this.state = 'retreating';
      this.attackTarget = null;
    }

    takeDamage(amount, game, source) {
      if (this.state === 'dead') return;
      const sourceFactor = source === 'machineGun' ? 0.22 : 1;
      const effective = Math.max(0.5, amount * sourceFactor * (1 - this.armor) * (1 - this.cover));
      this.health = Math.max(0, this.health - effective);
      this.flashTime = 0.18;
      this.lastDamageTurn = game.turn;
      game.effects.addFloatingText(this.x, this.y - 38, `-${Math.round(effective)}`, '#ff9b78');
      if (this.health <= 0) {
        this.health = 0;
        this.crew = 0;
        this.soldiers = 0;
        this.state = 'dead';
        this.selected = false;
        game.log(`${this.name} đã bị loại khỏi vòng chiến.`, 'danger');
      }
    }

    boostMorale() {}

    serialize() {
      return {
        id: this.id, type: this.type, x: this.x, health: this.health, crew: this.crew,
        state: this.state, targetX: this.targetX, selected: this.selected,
        shotsRemaining: this.shotsRemaining, maxShells: this.maxShells, shells: this.shells
      };
    }

    restore(data) {
      if (!data) return;
      this.x = Number(data.x) || this.x;
      this.health = NS.clamp(Number(data.health), 0, this.maxHealth);
      this.crew = this.health > 0 ? NS.clamp(Number(data.crew) || this.crew, 1, this.maxCrew) : 0;
      this.soldiers = this.crew;
      this.state = this.health <= 0 ? 'dead' : (data.state || 'idle');
      this.targetX = data.targetX === null ? null : Number(data.targetX);
      this.selected = Boolean(data.selected && this.state !== 'dead');
      const savedMaxShells = Number(data.maxShells);
      if (Number.isFinite(savedMaxShells)) this.maxShells = Math.max(1, Math.round(savedMaxShells));
      const savedShells = Number(data.shells);
      this.shells = Number.isFinite(savedShells) ? NS.clamp(Math.round(savedShells), 0, this.maxShells) : this.maxShells;
      const savedShots = Number(data.shotsRemaining);
      this.shotsRemaining = Number.isFinite(savedShots) ? NS.clamp(savedShots, 0, this.shells) : (this.shells > 0 ? this.shells : 0);
    }
  }

  NS.SoldierSquad = SoldierSquad;
  NS.TankUnit = TankUnit;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
