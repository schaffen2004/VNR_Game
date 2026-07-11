(function (NS) {
  'use strict';

  class EnemyAI {
    constructor(game) {
      this.game = game;
      this.lastTargetId = null;
    }

    calculateTargetScore(target) {
      const game = this.game;
      if (!target || target.state === 'dead') return -Infinity;
      const isTank = target.type === 'tank';
      const unitThreat = isTank ? 58 : (target.state === 'charging' || target.state === 'attacking' ? 50 : 15);
      const unitCount = (Number(target.soldiers) || 1) * (isTank ? 4 : 1.5);
      const distanceScore = target.x / 38;
      const recentAttackScore = target.lastDamageTurn === game.turn ? 25 : 0;
      const exposureScore = (1 - (Number(target.cover) || 0)) * (isTank ? 34 : 55);
      const clusterScore = game.squads.filter((unit) => unit.state !== 'dead' && Math.abs(unit.x - target.x) < 95).length * 10;
      return unitThreat * 2 + unitCount + distanceScore + recentAttackScore + exposureScore + clusterScore;
    }

    selectTarget() {
      const game = this.game;
      const alive = game.squads.filter((unit) => unit.state !== 'dead');
      const candidates = alive.slice();
      if (game.artillery.active) {
        candidates.push({
          id: game.artillery.id,
          x: game.artillery.x,
          y: game.artillery.y,
          type: 'artillery',
          state: 'artillery',
          soldiers: 8,
          cover: 0.28,
          lastDamageTurn: game.artillery.lastFireTurn
        });
      }
      candidates.sort((a, b) => this.calculateTargetScore(b) - this.calculateTargetScore(a));
      const best = candidates[0] || null;
      this.lastTargetId = best ? best.id : null;
      return best;
    }

    executeTurn() {
      const game = this.game;
      if (game.enemyIndirectShotFired) return;

      const difficulty = NS.Difficulty[game.difficulty] || NS.Difficulty.medium;
      const activeArtillery = game.fortresses.find((item) => item.id === 'enemy-artillery' && item.active);
      const activeMortar = game.fortresses.find((item) => item.type === 'mortar' && item.active);
      const target = this.selectTarget();
      if (!target) return;

      // Mỗi giai đoạn phản công chỉ có đúng một quả đạn gián tiếp.
      // Ưu tiên pháo; nếu pháo đã bị vô hiệu hóa mới dùng súng cối.
      const sourceStructure = activeArtillery || activeMortar;
      if (!sourceStructure) {
        game.log('Pháo và súng cối địch đã bị vô hiệu hóa; không có phát bắn gián tiếp.', 'important');
        return;
      }

      const sourceType = sourceStructure.type === 'mortar' ? 'mortar' : 'artillery';
      const strike = sourceType === 'mortar'
        ? { source: 'mortar', sourceId: sourceStructure.id, delay: 1.65 * difficulty.enemyDelay, radius: 50, damage: 36 }
        : { source: 'artillery', sourceId: sourceStructure.id, delay: 1.35 * difficulty.enemyDelay, radius: 70, damage: 58 };

      let targetX = target.x;
      if (game.artillery.lastFireTurn >= game.turn - 1 && activeArtillery && Math.random() < difficulty.counterBattery) {
        targetX = game.artillery.x;
        game.log('Trận địa pháo địch đang chuẩn bị một phát phản pháo!', 'danger');
      }

      const scatterBase = sourceType === 'mortar' ? 75 : 58;
      const scatter = scatterBase / difficulty.enemyAccuracy;
      const impactX = NS.clamp(targetX + (Math.random() - 0.5) * scatter * 2, 30, NS.Constants.WORLD_WIDTH - 30);
      const impactY = game.terrain.getHeight(impactX);

      game.enemyIndirectShotFired = true;
      game.effects.addWarning(impactX, impactY, strike.radius, strike.delay, () => {
        this.launchEnemyShell(sourceStructure, impactX, strike);
      }, {
        sourceX: sourceStructure.x,
        sourceY: sourceStructure.y,
        sourceType
      });

      game.audio.play('warning');
      game.log(`${sourceStructure.name} được lệnh bắn đúng một phát vào khu vực x=${Math.round(impactX)}.`, 'danger');
    }

    getMuzzlePosition(source, sourceType) {
      if (sourceType === 'mortar') {
        return { x: source.x - 9, y: source.y - 7 };
      }
      return { x: source.x - source.width * 0.62, y: source.y + 5 };
    }

    calculateBallisticVelocity(start, target, sourceType) {
      const dx = target.x - start.x;
      const dy = target.y - start.y;
      const distance = Math.abs(dx);
      const gravity = NS.Constants.GRAVITY;
      const flightTime = sourceType === 'mortar'
        ? NS.clamp(2.25 + distance / 950, 2.35, 4.25)
        : NS.clamp(1.55 + distance / 1100, 1.8, 3.55);
      return {
        vx: dx / flightTime,
        vy: (dy - 0.5 * gravity * flightTime * flightTime) / flightTime,
        flightTime
      };
    }

    launchEnemyShell(sourceStructure, targetX, strike) {
      const game = this.game;
      if (game.phase !== NS.GamePhase.ENEMY) return;
      if (!sourceStructure || !sourceStructure.active) {
        game.log('Khẩu pháo địch bị vô hiệu hóa trước khi kịp khai hỏa.', 'important');
        return;
      }

      const targetY = game.terrain.getHeight(targetX);
      const muzzle = this.getMuzzlePosition(sourceStructure, strike.source);
      const velocity = this.calculateBallisticVelocity(muzzle, { x: targetX, y: targetY }, strike.source);
      const ammo = {
        id: `enemy-${strike.source}`,
        name: strike.source === 'mortar' ? 'Đạn cối địch' : 'Đạn pháo địch',
        color: strike.source === 'mortar' ? '#e0b36d' : '#ff7650',
        radius: strike.radius,
        damage: strike.damage * NS.Difficulty[game.difficulty].enemyDamage * ((game.missionConfig && game.missionConfig.enemyScale) || 1),
        terrainDamage: strike.source === 'mortar' ? 34 : 52,
        structureDamage: 1,
        fenceDamage: 0.5
      };

      sourceStructure.flashTime = 0.24;
      sourceStructure.aimVX = velocity.vx;
      sourceStructure.aimVY = velocity.vy;
      sourceStructure.lastTargetX = targetX;
      game.effects.enemyMuzzle(muzzle.x, muzzle.y, -1, strike.source);
      game.audio.play(strike.source === 'mortar' ? 'mortar' : 'enemyFire');
      game.camera.focus(sourceStructure.x - 120, sourceStructure.y - 115);

      game.projectiles.push(new NS.Projectile({
        x: muzzle.x,
        y: muzzle.y,
        vx: velocity.vx,
        vy: velocity.vy,
        customAmmo: ammo,
        ammoType: 'he',
        owner: 'enemy',
        ignoreWind: true,
        sourceId: sourceStructure.id,
        collisionGrace: strike.source === 'mortar' ? 0.28 : 0.22,
        followCamera: true,
        shellType: strike.source
      }));
      game.log(`${sourceStructure.name} khai hỏa; quả đạn đang bay tới khu vực cảnh báo.`, 'danger');
    }
  }

  NS.EnemyAI = EnemyAI;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
