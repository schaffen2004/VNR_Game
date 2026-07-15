(function (NS) {
  'use strict';

  class Game {
    constructor(canvas, minimapCanvas) {
      this.canvas = canvas;
      this.minimapCanvas = minimapCanvas;
      this.performanceMode = NS.detectDefaultPerformanceMode();
      this.performance = NS.getPerformanceProfile(this.performanceMode);
      this.audio = new NS.AudioManager();
      this.camera = new NS.Camera(NS.Constants.WORLD_WIDTH, NS.Constants.WORLD_HEIGHT);
      this.mapConfig = NS.getMapConfig('him-lam');
      this.terrain = new NS.Terrain(NS.Constants.WORLD_WIDTH, NS.Constants.WORLD_HEIGHT, NS.Constants.TERRAIN_STEP, this.mapConfig);
      this.effects = new NS.EffectsSystem(this.performance);
      this.renderer = new NS.Renderer(this, canvas, minimapCanvas);
      this.input = new NS.InputManager(this, canvas);
      this.hudTimer = 0;
      this.logEntries = [];
      this.running = false;
      this.paused = false;
      this.result = null;
      this.difficulty = 'easy';
      this.soundEnabled = true;
      this.attackPowerMultiplier = 1;
      this.turnQuestionAnswered = false;
      this.commandMode = 'move';
      this.selectionBox = null;
      this.profile = NS.Campaign ? NS.Campaign.loadProfile() : null;
      this.currentMissionId = this.profile && this.profile.selectedMission ? this.profile.selectedMission : 'him-lam';
      this.missionConfig = NS.Campaign ? NS.Campaign.getMission(this.currentMissionId) : null;
      this.lastReward = 0;
      this.initNewGame('easy', this.currentMissionId);
    }

    initNewGame(difficulty, missionId) {
      this.difficulty = NS.Difficulty[difficulty] ? difficulty : 'easy';
      this.profile = NS.Campaign ? NS.Campaign.loadProfile() : this.profile;
      this.currentMissionId = missionId || this.currentMissionId || 'him-lam';
      this.missionConfig = NS.Campaign ? NS.Campaign.getMission(this.currentMissionId) : { id: 'him-lam', name: 'Đồi Him Lam', enemyScale: 1 };
      this.mapConfig = NS.getMapConfig(this.currentMissionId);
      if (this.profile) { this.profile.selectedMission = this.currentMissionId; NS.Campaign.saveProfile(this.profile); }
      this.terrain = new NS.Terrain(NS.Constants.WORLD_WIDTH, NS.Constants.WORLD_HEIGHT, NS.Constants.TERRAIN_STEP, this.mapConfig);
      this.camera = new NS.Camera(NS.Constants.WORLD_WIDTH, NS.Constants.WORLD_HEIGHT);
      this.camera.resize(this.renderer ? this.renderer.width : window.innerWidth, this.renderer ? this.renderer.height : window.innerHeight);
      this.effects = new NS.EffectsSystem(this.performance);
      this.artillery = new NS.Artillery({ id: 'player-artillery', name: 'Lựu pháo 105 mm', x: this.mapConfig.artilleryX || 180, angle: 45, power: 430, health: 260 });
      this.artillery.updatePosition(this.terrain);
      const infantry = NS.createSoldierConfigs(this.profile, this.mapConfig).map((config) => new NS.SoldierSquad(config));
      const tankConfigs = NS.createTankConfigs(this.profile, this.mapConfig);
      const tanks = tankConfigs.map((config) => new NS.TankUnit(config));
      this.squads = infantry.concat(tanks);
      this.squads.forEach((unit) => {
        unit.y = this.terrain.getHeight(unit.x) - (unit.type === 'tank' ? 12 : 10);
        if (typeof unit.startTurn === 'function') unit.startTurn();
      });
      this.trenches = [];
      this.fortresses = NS.createFortressConfigs(this.currentMissionId).map((config) => new NS.Fortress(config));
      this.fortresses.forEach((item) => {
        const groundY = this.terrain.getHeight(item.x);
        item.y = item.type === 'aircraft'
          ? groundY - item.height - Math.max(90, Number(item.altitude) || 165)
          : groundY - item.height;
      });
      this.projectiles = [];
      this.enemyAI = new NS.EnemyAI(this);
      this.phase = NS.GamePhase.OBSERVATION;
      this.turn = 1;
      this.wind = this.generateWind();
      this.selectedAmmo = 'he';
      this.firedThisPhase = false;
      this.enemyPhaseTimer = 0;
      this.enemyIndirectShotFired = false;
      this.attackPowerMultiplier = 1;
      this.turnQuestionAnswered = false;
      this.missionStage = 1;
      this.commandMode = 'move';
      this.selectionBox = null;
      this.resources = {
        ammo: NS.createInitialAmmo(this.profile),
        actionPoints: 0,
        engineeringPoints: 160,
        commandPoints: 60,
        reinforcements: 0
      };
      if (NS.Campaign && this.profile) NS.Campaign.applyMissionLoadout(this.profile, this.missionConfig, this);
      this.stats = {
        trenchesCompleted: 0,
        structuresDestroyed: 0,
        smokeUsed: false,
        fenceBreached: false
      };
      this.shotsFired = 0;
      this.shotsHit = 0;
      this.result = null;
      this.paused = false;
      this.logEntries = [];
      this.log(`Nhiệm vụ ${this.missionConfig.name} bắt đầu. Quan sát địa hình và hỏa lực cứ điểm.`, 'important');
      const focusX = this.mapConfig.startFocusX || 480;
      this.camera.focus(focusX, this.terrain.getHeight(focusX) - 160);
      this.populateAmmoSelect();
      this.updateHUD(true);
    }

    start() {
      this.running = true;
      this.paused = false;
      this.result = null;
      this.audio.resume();
      this.audio.setSfxEnabled(this.soundEnabled);
      this.audio.play('deploy');
      this.updateHUD(true);
    }

    update(dt) {
      if (!this.running || this.result) return;
      this.camera.update(dt);
      this.input.update(dt);
      if (this.paused) return;

      const unitDt = this.phase === NS.GamePhase.COMMAND ? dt : 0;
      this.squads.forEach((unit) => unit.update(unitDt, this));
      this.fortresses.forEach((structure) => structure.update(dt, this));
      this.artillery.updatePosition(this.terrain);

      for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
        this.projectiles[i].update(dt, this);
        if (!this.projectiles[i].alive) this.projectiles.splice(i, 1);
      }

      this.effects.update(dt);
      this.effects.triggerReadyWarnings();

      if (this.phase === NS.GamePhase.ENEMY) {
        this.enemyPhaseTimer -= dt;
        if (this.enemyPhaseTimer <= 0 && this.projectiles.length === 0 && this.effects.warnings.every((w) => w.triggered)) {
          this.startNextTurn();
        }
      }

      this.updateMissionStage();
      this.checkDefeat();
      this.checkVictory();
      this.hudTimer -= dt;
      if (this.hudTimer <= 0) {
        this.updateHUD();
        this.hudTimer = this.performanceMode === 'low' ? 0.28 : 0.15;
      }
    }

    render() {
      if (this.renderer) this.renderer.render();
    }

    generateWind() {
      const raw = (Math.random() - 0.5) * 34;
      return Math.round(raw * 10) / 10;
    }

    setPerformanceMode(mode, persist) {
      this.performanceMode = 'low';
      this.performance = NS.getPerformanceProfile('low');
      document.body.dataset.performance = 'low';
      if (this.effects && typeof this.effects.configure === 'function') this.effects.configure(this.performance);
      if (this.renderer) this.renderer.resize();
      if (persist !== false) this.saveSettings();
      this.updateHUD(true);
    }

    setArtilleryAim(angle, power) {
      if (!this.artillery) return;
      this.artillery.aim(angle, power);
      this.updateHUD(true);
    }

    fireArtillery() {
      if (!this.running || this.paused || this.result) return false;
      if (this.phase !== NS.GamePhase.ARTILLERY) {
        this.log('Chỉ được khai hỏa trong giai đoạn Pháo kích.', 'danger');
        return false;
      }
      if (this.firedThisPhase || this.projectiles.length > 0) {
        this.log('Lượt pháo kích này đã sử dụng một phát bắn.', 'danger');
        return false;
      }
      if ((this.resources.ammo[this.selectedAmmo] || 0) <= 0) {
        this.log('Loại đạn đã hết.', 'danger');
        return false;
      }
      const fired = this.artillery.fire(this, this.selectedAmmo);
      if (fired) {
        this.firedThisPhase = true;
        this.updateHUD(true);
      }
      return fired;
    }

    changePhase(nextPhase) {
      if (this.result || this.paused) return;
      // Lệnh tự động tấn công chỉ hoạt động trong giai đoạn Điều binh hiện tại.
      // Khi kết thúc giai đoạn, đơn vị dừng bắn để không bỏ qua câu hỏi của lượt sau.
      if (this.phase === NS.GamePhase.COMMAND && nextPhase !== NS.GamePhase.COMMAND) {
        this.squads.forEach((unit) => {
          if (unit.state === 'attacking') {
            if (typeof unit.stopAttack === 'function') unit.stopAttack();
            else { unit.attackTarget = null; unit.state = 'idle'; }
          }
        });
      }
      this.phase = nextPhase;
      if (nextPhase === NS.GamePhase.ARTILLERY) {
        this.firedThisPhase = false;
        this.camera.focus(this.artillery.x + 100, this.artillery.y - 120);
        this.log('Giai đoạn Pháo kích: chọn đạn, góc và lực bắn.', 'important');
      } else if (nextPhase === NS.GamePhase.COMMAND) {
        this.resources.actionPoints = NS.Constants.COMMAND_ACTION_POINTS;
        this.camera.focus(this.getFrontlineX(), this.terrain.getHeight(this.getFrontlineX()) - 150);
        this.log('Giai đoạn Điều binh: sử dụng điểm hành động để cơ động, đào hầm trú ẩn và tiến công.', 'important');
      } else if (nextPhase === NS.GamePhase.ENEMY) {
        this.resources.actionPoints = 0;
        this.enemyIndirectShotFired = false;
        this.enemyPhaseTimer = this.difficulty === 'hard' ? 5.2 : 4.8;
        this.log('Đối phương bắt đầu phản công.', 'danger');
        this.enemyAI.executeTurn();
      } else if (nextPhase === NS.GamePhase.OBSERVATION) {
        this.log(`Lượt ${this.turn}: quan sát tình hình và chuẩn bị tác chiến.`, 'important');
      }
      this.updateHUD(true);
    }

    endCurrentPhase() {
      if (!this.running || this.paused || this.result) return;
      if (this.phase === NS.GamePhase.ENEMY) return;
      if (this.projectiles.length > 0) {
        this.log('Chờ quả đạn hiện tại kết thúc hành trình.', 'danger');
        return;
      }
      if (this.phase === NS.GamePhase.OBSERVATION) {
        if (window.DuongToiChienThangUI && typeof window.DuongToiChienThangUI.requestTurnQuiz === 'function') {
          window.DuongToiChienThangUI.requestTurnQuiz();
          return;
        }
        this.beginAttackTurn(1, true);
      }
      else if (this.phase === NS.GamePhase.ARTILLERY) this.changePhase(NS.GamePhase.COMMAND);
      else if (this.phase === NS.GamePhase.COMMAND) this.changePhase(NS.GamePhase.ENEMY);
    }

    beginAttackTurn(multiplier, correct) {
      if (this.phase !== NS.GamePhase.OBSERVATION || this.result) return;
      this.attackPowerMultiplier = multiplier >= 1 ? 1 : 0.5;
      this.turnQuestionAnswered = true;
      if (correct) this.log('Trả lời đúng: lực tấn công giữ 100% trong lượt này.', 'important');
      else this.log('Trả lời chưa đúng: lực tấn công giảm còn 50% trong lượt này.', 'danger');
      this.changePhase(NS.GamePhase.ARTILLERY);
    }

    startNextTurn() {
      this.effects.nextTurn();
      if (this.result) return;
      this.turn += 1;
      this.wind = this.generateWind();
      this.firedThisPhase = false;
      this.enemyIndirectShotFired = false;
      this.attackPowerMultiplier = 1;
      this.turnQuestionAnswered = false;
      this.projectiles.length = 0;
      this.effects.warnings.length = 0;
      this.squads.forEach((unit) => {
        if (typeof unit.startTurn === 'function') unit.startTurn();
        if (unit.state !== 'dead' && unit.type === 'infantry' && unit.cover > 0.35) unit.boostMorale(4);
      });
      this.changePhase(NS.GamePhase.OBSERVATION);
      this.saveGame(false);
    }

    setCommandMode(mode) {
      const allowed = ['move', 'dig', 'attack', 'hide', 'charge', 'retreat'];
      if (!allowed.includes(mode)) return;
      if (this.phase !== NS.GamePhase.COMMAND) {
        this.log('Mệnh lệnh bộ binh chỉ dùng trong giai đoạn Điều binh.', 'danger');
        return;
      }
      this.commandMode = mode;
      document.querySelectorAll('.command-button').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.command === mode);
      });
      if (mode === 'hide' || mode === 'retreat') this.executeImmediateCommand(mode);
      if (mode === 'charge') this.audio.play('charge');
      this.updateHUD(true);
    }

    executeImmediateCommand(mode) {
      const selected = this.getSelectedSquads();
      if (!selected.length) {
        this.log('Hãy chọn ít nhất một đơn vị.', 'danger');
        return;
      }
      const cost = mode === 'hide' ? 1 : 1;
      if (!this.spendActionPoints(cost)) return;
      let affected = 0;
      selected.forEach((unit) => {
        if (mode === 'hide') {
          if (unit.type === 'infantry') { unit.hide(); affected += 1; }
        } else {
          unit.retreat(this);
          affected += 1;
        }
      });
      if (mode === 'hide' && affected === 0) {
        this.resources.actionPoints = Math.min(NS.Constants.COMMAND_ACTION_POINTS, this.resources.actionPoints + cost);
        this.log('Xe tăng không thể dùng trạng thái ẩn nấp như bộ binh.', 'danger');
        return;
      }
      this.log(mode === 'hide' ? 'Bộ binh được lệnh tận dụng địa hình để ẩn nấp.' : 'Đơn vị được lệnh rút lui.');
    }

    issueCommand(x, y) {
      if (this.phase !== NS.GamePhase.COMMAND || this.paused || this.result) return;
      const selected = this.getSelectedSquads();
      if (!selected.length) {
        this.log('Chưa chọn đơn vị bộ binh.', 'danger');
        return;
      }

      if (this.commandMode === 'move' || this.commandMode === 'charge') {
        const cost = this.commandMode === 'charge' ? 2 : 1;
        if (!this.spendActionPoints(cost)) return;
        selected.forEach((unit, index) => unit.moveTo(x - index * 16, y, this.commandMode === 'charge', this));
        this.log(this.commandMode === 'charge' ? 'Các tổ bộ binh bắt đầu xung phong.' : 'Đã ban lệnh di chuyển.');
      } else if (this.commandMode === 'dig') {
        this.createTrenchesForSelected(selected, x);
      } else if (this.commandMode === 'attack') {
        const target = this.getStructureAtPoint(x, y) || this.getNearestStructure(x, y, 90);
        if (!target || !target.active) {
          this.log('Không có mục tiêu địch hợp lệ tại vị trí đã chọn.', 'danger');
          return;
        }
        const eligible = selected.filter((unit) => unit.type !== 'tank' || unit.shotsRemaining > 0);
        if (!eligible.length) {
          this.log('Các xe tăng đã hết đạn hoặc không còn khả năng khai hỏa.', 'danger');
          return;
        }
        const attackCost = eligible.reduce((sum, unit) => sum + (unit.type === 'tank' ? 2 : 1), 0);
        if (!this.spendActionPoints(attackCost)) return;
        eligible.forEach((unit) => unit.attack(target, this));
        this.log(`Đã lệnh cho ${eligible.length} đơn vị tự động tấn công ${target.name} đến khi mục tiêu bị phá hoặc hết đạn (${attackCost} điểm hành động).`, 'important');
      }
      this.updateHUD(true);
    }

    createTrenchesForSelected(selected, targetX) {
      const infantry = selected.filter((unit) => unit.type === 'infantry' && unit.state !== 'dead');
      if (!infantry.length) {
        this.log('Chỉ bộ binh mới có thể đào hầm trú ẩn.', 'danger');
        return;
      }

      const builders = infantry.slice(0, NS.Constants.DUGOUT_MAX_CAPACITY);
      const averageX = builders.reduce((sum, unit) => sum + unit.x, 0) / builders.length;
      const direction = Math.sign(targetX - averageX) || 1;
      let centerX = NS.clamp(Number(targetX), 80, NS.Constants.WORLD_WIDTH - 80);
      if (Math.abs(centerX - averageX) < NS.Constants.TRENCH_FRONT_OFFSET) {
        centerX = NS.clamp(averageX + direction * NS.Constants.TRENCH_FRONT_OFFSET, 80, NS.Constants.WORLD_WIDTH - 80);
      }

      const width = NS.clamp(84 + builders.length * 18, 102, 150);
      const startX = centerX - width * 0.5;
      const endX = centerX + width * 0.5;
      const validation = this.validateTrenchPath(startX, endX);
      if (!validation.valid) {
        this.log(validation.reason.replace(/hào/gi, 'hầm'), 'danger');
        return;
      }

      const cost = 10 + builders.length * 3;
      if (this.resources.engineeringPoints < cost) {
        this.log('Không đủ điểm công binh để đào hầm trú ẩn.', 'danger');
        return;
      }
      if (!this.spendActionPoints(2)) return;

      const dugout = new NS.Trench({
        type: 'dugout',
        startX,
        startY: this.terrain.getHeight(centerX),
        endX,
        endY: this.terrain.getHeight(centerX),
        centerX,
        width,
        depth: NS.Constants.DUGOUT_DEPTH,
        capacity: builders.length,
        assignedUnitIds: builders.map((unit) => unit.id),
        progress: 0,
        durability: 100,
        builderId: builders[0].id
      });

      this.resources.engineeringPoints = Math.max(0, this.resources.engineeringPoints - cost);
      this.trenches.push(dugout);
      builders.forEach((unit, index) => unit.digTrench(dugout, index, this));
      this.log(`${builders.length} tổ bộ binh bắt đầu đào hầm trú ẩn. Khi hoàn thành, các tổ được chọn sẽ tự chui xuống hầm.`, 'important');
    }

    findTrenchStart(unit, targetX) {
      const direction = Math.sign(targetX - unit.x) || 1;
      const endpoints = [];
      this.trenches.forEach((trench) => {
        if (!trench.completed || trench.durability <= 20) return;
        [trench.startX, trench.endX].forEach((endpoint) => {
          const signedAhead = (endpoint - unit.x) * direction;
          const unitDistance = Math.abs(endpoint - unit.x);
          if (signedAhead >= 8 && unitDistance <= 90) endpoints.push({ x: endpoint, unitDistance });
        });
      });
      if (endpoints.length) {
        endpoints.sort((a, b) => a.unitDistance - b.unitDistance);
        return endpoints[0].x;
      }

      // Hào mới bắt đầu cách đội hình một khoảng rõ ràng, luôn ở phía trước mặt quân.
      return NS.clamp(
        unit.x + direction * NS.Constants.TRENCH_FRONT_OFFSET,
        25,
        NS.Constants.WORLD_WIDTH - 25
      );
    }

    validateTrenchPath(startX, endX) {
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const blocking = this.fortresses.find((item) => item.active && item.x > minX + 12 && item.x < maxX - 12);
      if (blocking) return { valid: false, reason: `Không thể đào xuyên qua ${blocking.name}.` };

      for (let x = minX; x <= maxX; x += 10) {
        if (Math.abs(this.terrain.getSlope(x)) > 1.15) {
          return { valid: false, reason: 'Địa hình đoạn này quá dốc hoặc đã bị phá hủy nặng để đào hầm ổn định.' };
        }
      }

      const overlaps = this.trenches.some((trench) => {
        const trenchMin = Math.min(trench.startX, trench.endX);
        const trenchMax = Math.max(trench.startX, trench.endX);
        const overlap = Math.min(maxX, trenchMax) - Math.max(minX, trenchMin);
        return overlap > 28;
      });
      if (overlaps) return { valid: false, reason: 'Vị trí hầm mới chồng lên một hầm trú ẩn đã có.' };
      return { valid: true, reason: '' };
    }

    connectTrench(trench) {
      this.trenches.forEach((other) => {
        const close = Math.min(
          Math.abs(other.startX - trench.startX), Math.abs(other.endX - trench.startX),
          Math.abs(other.startX - trench.endX), Math.abs(other.endX - trench.endX)
        ) < 36;
        if (close) {
          trench.connectedTrenches.push(other.id);
          other.connectedTrenches.push(trench.id);
        }
      });
    }

    spendActionPoints(amount) {
      if (this.resources.actionPoints < amount) {
        this.log('Không đủ điểm hành động.', 'danger');
        return false;
      }
      this.resources.actionPoints = Math.max(0, this.resources.actionPoints - amount);
      return true;
    }

    getSelectedSquads() {
      return this.squads.filter((unit) => unit.selected && unit.state !== 'dead');
    }

    getInfantryUnits(aliveOnly) {
      return this.squads.filter((unit) => unit.type === 'infantry' && (!aliveOnly || unit.state !== 'dead'));
    }

    getTanks(aliveOnly) {
      return this.squads.filter((unit) => unit.type === 'tank' && (!aliveOnly || unit.state !== 'dead'));
    }

    getTroopCount() {
      return this.getInfantryUnits(false).reduce((sum, unit) => sum + unit.soldiers, 0);
    }

    deselectAll() {
      this.squads.forEach((unit) => { unit.selected = false; });
    }

    selectAt(x, y, additive) {
      const candidates = this.squads.filter((unit) => {
        const radius = unit.type === 'tank' ? 46 : 34;
        return unit.state !== 'dead' && Math.hypot(unit.x - x, unit.y - y) < radius;
      });
      if (!candidates.length) {
        if (!additive) this.deselectAll();
        this.updateHUD(true);
        return false;
      }
      candidates.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
      if (!additive) this.deselectAll();
      candidates[0].selected = additive ? !candidates[0].selected : true;
      this.audio.play('select');
      this.camera.focus(candidates[0].x, candidates[0].y - 100);
      this.updateHUD(true);
      return true;
    }

    selectInBox(box) {
      this.deselectAll();
      this.squads.forEach((unit) => {
        if (unit.state !== 'dead' && unit.x >= box.x && unit.x <= box.x + box.width && unit.y >= box.y && unit.y <= box.y + box.height) unit.selected = true;
      });
      this.audio.play('select');
      this.updateHUD(true);
    }

    selectUnitById(id) {
      const unit = this.squads.find((item) => item.id === id && item.state !== 'dead');
      if (!unit) return;
      this.deselectAll();
      unit.selected = true;
      this.camera.focus(unit.x, unit.y - 100);
      this.audio.play('select');
      this.updateHUD(true);
    }

    selectNextUnit() {
      const alive = this.squads.filter((unit) => unit.state !== 'dead');
      if (!alive.length) return;
      const currentIndex = alive.findIndex((unit) => unit.selected);
      const next = alive[(currentIndex + 1 + alive.length) % alive.length];
      this.selectUnitById(next.id);
    }

    getStructureAtPoint(x, y) {
      return this.fortresses.find((structure) => {
        if (!structure.active) return false;
        if (structure.type === 'wire' || structure.type === 'defensiveTrench') {
          const surface = this.terrain.getHeight(structure.x);
          const topOffset = structure.type === 'wire' ? 65 : 35;
          return x >= structure.x - structure.width / 2 && x <= structure.x + structure.width / 2 && y >= surface - topOffset && y <= surface + 20;
        }
        return NS.pointInRect(x, y, structure.getRect());
      }) || null;
    }

    getNearestStructure(x, y, radius) {
      let nearest = null;
      let best = radius;
      this.fortresses.forEach((structure) => {
        if (!structure.active) return;
        const d = Math.hypot(structure.x - x, structure.y - y);
        if (d < best) { best = d; nearest = structure; }
      });
      return nearest;
    }

    getBlockingWire(fromX, toX) {
      const min = Math.min(fromX, toX);
      const max = Math.max(fromX, toX);
      return this.fortresses.find((item) => item.type === 'wire' && item.active && item.x > min && item.x < max) || null;
    }

    getMovementMultiplier(x, unitType) {
      const landmark = (this.mapConfig.landmarks || []).find((zone) => x >= zone.from && x <= zone.to);
      if (!landmark) return 1;
      if (landmark.type === 'river') return unitType === 'tank' ? 0.58 : 0.52;
      if (landmark.type === 'forest') return unitType === 'tank' ? 0.7 : 0.82;
      if (landmark.type === 'foothill' || landmark.type === 'hill' || landmark.type === 'openSlope') return unitType === 'tank' ? 0.82 : 0.9;
      if (landmark.type === 'bridge') return unitType === 'tank' ? 0.78 : 0.94;
      if (landmark.type === 'runway') return 1.05;
      return 1;
    }

    applyMinefieldHazard(unit) {
      if (!unit || unit.state === 'dead' || unit.mineTriggerCooldown > 0) return;
      if (unit.type === 'infantry' && unit.inTrench) return;
      const minefield = this.fortresses.find((item) => item.type === 'minefield' && item.active && Math.abs(item.x - unit.x) <= item.width * 0.5);
      if (!minefield) return;
      unit.mineTriggerCooldown = 1.4;
      const baseDamage = unit.type === 'tank' ? 16 : 24;
      unit.takeDamage(baseDamage * (0.85 + Math.random() * 0.3), this, 'minefield');
      minefield.takeDamage(unit.type === 'tank' ? 14 : 7, { id: 'mine-trigger', structureDamage: 0.7, fenceDamage: 0.2 }, this);
      this.effects.explosion(unit.x, unit.y + 4, unit.type === 'tank' ? 24 : 18, '#d39b4a');
      this.audio.play('explosion');
      this.log(`${unit.name} gặp mìn trong khu vực chướng ngại.`, 'danger');
    }

    getFrontlineX() {
      const alive = this.squads.filter((unit) => unit.state !== 'dead');
      return alive.length ? Math.max(...alive.map((unit) => unit.x)) : this.artillery.x;
    }

    applyExplosion(x, y, ammo, owner) {
      const attackScale = owner === 'player' ? this.attackPowerMultiplier : 1;
      const effectiveAmmo = Object.assign({}, ammo, { damage: (Number(ammo.damage) || 0) * attackScale });
      const radius = Number(ammo.radius) || 50;
      const color = ammo.color || '#ef8a43';
      this.effects.explosion(x, y, radius, color);
      this.effects.dirt(x, y, Math.min(32, Math.floor(radius / 2.3)));
      this.audio.play('explosion');
      this.camera.focus(x, y - 80);
      this.camera.shake(Math.min(24, radius * 0.22), 0.5);
      if ((ammo.terrainDamage || 0) > 0) this.terrain.carveCrater(x, y, radius, ammo.terrainDamage);
      if (ammo.id === 'smoke' || ammo.smokeTurns) {
        this.effects.addSmokeZone(x, y - 12, radius, ammo.smokeTurns || 3);
        if (owner === 'player') this.stats.smokeUsed = true;
      }

      let hitSomething = false;
      this.squads.forEach((unit) => {
        if (unit.state === 'dead') return;
        const distance = Math.hypot(unit.x - x, unit.y - y);
        if (distance <= radius) {
          const falloff = 1 - distance / radius;
          unit.takeDamage((effectiveAmmo.damage || 0) * (0.35 + falloff * 0.65), this, 'artillery');
          hitSomething = true;
        }
        unit.y = this.terrain.getHeight(unit.x) - (unit.type === 'tank' ? 12 : 10);
      });

      const artilleryDistance = Math.hypot(this.artillery.x - x, this.artillery.y - y);
      if (this.artillery.active && artilleryDistance <= radius) {
        const falloff = 1 - artilleryDistance / radius;
        this.artillery.takeDamage((effectiveAmmo.damage || 0) * (0.3 + falloff * 0.7), this);
        hitSomething = true;
      }

      this.fortresses.forEach((structure) => {
        if (!structure.active) return;
        // Tắt sát thương đồng đội của hỏa lực gián tiếp địch. Pháo địch vẫn có thể
        // làm biến dạng địa hình và gây sát thương cho quân ta, nhưng không phá công sự của chính nó.
        if (owner === 'enemy') return;
        const rect = (structure.type === 'wire' || structure.type === 'defensiveTrench')
          ? {
              x: structure.x - structure.width / 2,
              y: this.terrain.getHeight(structure.x) - (structure.type === 'wire' ? 60 : 28),
              width: structure.width,
              height: structure.type === 'wire' ? 70 : 45
            }
          : structure.getRect();
        if (NS.circleRectOverlap(x, y, radius, rect)) {
          const distance = Math.hypot(structure.x - x, (structure.y + structure.height / 2) - y);
          const falloff = NS.clamp(1 - distance / (radius + structure.width / 2), 0.2, 1);
          structure.takeDamage((effectiveAmmo.damage || 0) * falloff, effectiveAmmo, this);
          hitSomething = true;
        }
      });

      this.trenches.forEach((trench) => {
        const distance = NS.distanceToSegment(x, y, trench.startX, trench.startY, trench.endX, trench.endY);
        if (distance <= radius) trench.takeDamage((ammo.terrainDamage || 20) * (1 - distance / radius));
      });

      if (owner === 'player' && hitSomething && this.shotsHit < this.shotsFired) this.shotsHit += 1;
      this.stats.fenceBreached = this.fortresses.some((item) => item.type === 'wire' && !item.active);
      this.updateHUD(true);
    }

    updateMissionStage() {
      const map = this.mapConfig || {};
      if (this.missionStage === 1) {
        const targetIds = Array.isArray(map.stageOneTargetIds) ? map.stageOneTargetIds : [];
        const targetsSuppressed = targetIds.length === 0 || targetIds.every((id) => {
          const target = this.fortresses.find((item) => item.id === id);
          return !target || !target.active || target.health < target.maxHealth * 0.72;
        });
        if (targetsSuppressed) {
          this.missionStage = 2;
          this.log('Đã chế áp các hỏa điểm vòng ngoài. Chuyển sang tiếp cận mục tiêu.', 'important');
        }
      } else if (this.missionStage === 2) {
        const threshold = Number(map.assaultThreshold) || 1540;
        const requiredTrenches = Math.max(0, Number(map.requiredTrenches) || 0);
        const forward = this.squads.some((unit) => unit.type === 'infantry' && unit.state !== 'dead' && unit.x > threshold);
        const fenceReady = !map.requiresFence || this.fortresses.some((item) => item.type === 'wire' && !item.active);
        if (this.stats.trenchesCompleted >= requiredTrenches && forward && fenceReady) {
          this.missionStage = 3;
          this.log('Đã mở hướng tiếp cận. Mục tiêu tiếp theo: vô hiệu hóa mục tiêu cuối và chiếm cờ.', 'important');
        }
      }
    }

    getPrimaryObjective() {
      const objectiveId = this.mapConfig && this.mapConfig.primaryObjectiveId;
      return objectiveId ? this.fortresses.find((item) => item.id === objectiveId) : null;
    }

    getActiveMajorDefenses() {
      return this.fortresses.filter((item) => ['bunker', 'machineGun', 'mortar', 'artillery', 'enemyTank'].includes(item.type) && item.active).length;
    }

    checkVictory() {
      if (this.result) return;
      const objective = this.getPrimaryObjective();
      const flagX = this.mapConfig.flagX || 2360;
      const occupier = this.squads.some((unit) => unit.type === 'infantry' && unit.state !== 'dead' && Math.abs(unit.x - flagX) < 72);
      const fenceReady = !this.mapConfig.requiresFence || this.fortresses.some((item) => item.type === 'wire' && !item.active);
      if (objective && !objective.active && occupier && fenceReady) {
        this.finishGame(true, `Bộ binh đã chiếm điểm mục tiêu. ${this.missionConfig.name} được giải phóng ngay, không cần giữ thêm lượt.`);
      }
    }

    checkDefeat() {
      if (this.result) return;
      const infantryGone = this.getInfantryUnits(true).length === 0;
      const tanksGone = this.getTanks(true).length === 0;
      const artilleryGone = !this.artillery.active;
      if (infantryGone && tanksGone && artilleryGone) {
        this.finishGame(false, 'Toàn bộ bộ binh, xe tăng yểm trợ và pháo binh đều không còn khả năng chiến đấu.');
      }
    }

    finishGame(victory, reason) {
      if (this.result) return;
      this.result = { victory, reason };
      this.running = false;
      if (victory) this.audio.play('victory'); else this.audio.play('defeat');
      const score = this.calculateScore(victory);
      this.lastReward = 0;
      if (NS.Campaign) {
        this.profile = NS.Campaign.loadProfile();
        this.lastReward = NS.Campaign.recordResult(this.profile, {
          missionId: this.currentMissionId, level: this.difficulty, victory, turns: this.turn, score,
          troops: this.getTroopCount(), tanks: this.getTanks(true).length
        });
        this.profile = NS.Campaign.loadProfile();
      }
      try {
        const highScore = Number(localStorage.getItem(NS.Constants.HIGH_SCORE_KEY) || 0);
        if (score > highScore) localStorage.setItem(NS.Constants.HIGH_SCORE_KEY, String(score));
        localStorage.removeItem(NS.Constants.STORAGE_KEY);
      } catch (error) {
        // Trò chơi vẫn kết thúc bình thường nếu LocalStorage bị chặn.
      }
      if (window.DuongToiChienThangUI) window.DuongToiChienThangUI.showResult(victory, reason, this.getResultStats(score));
    }

    calculateScore(victory) {
      const troops = this.getTroopCount();
      const tanks = this.getTanks(true).length;
      const accuracy = this.shotsFired ? this.shotsHit / this.shotsFired : 0;
      return Math.max(0, Math.round((victory ? 3000 : 0) + troops * 48 + tanks * 260 + this.stats.structuresDestroyed * 180 + this.stats.trenchesCompleted * 110 + accuracy * 800 - Math.min(this.turn, 60) * 18));
    }

    getResultStats(score) {
      const troops = this.getTroopCount();
      const tanks = this.getTanks(true).length;
      const accuracy = this.shotsFired ? Math.round(this.shotsHit / this.shotsFired * 100) : 0;
      return {
        'Số lượt đã dùng': this.turn,
        'Quân số còn lại': troops,
        'Xe tăng còn hoạt động': tanks,
        'Công trình vô hiệu hóa': this.stats.structuresDestroyed,
        'Độ chính xác pháo binh': `${accuracy}%`,
        'Hầm trú ẩn hoàn thành': this.stats.trenchesCompleted,
        'Điểm tổng kết': score,
        'Thưởng Việt Nam đồng': this.lastReward > 0 ? `+${this.lastReward.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ',
        'Số dư hiện tại': this.profile ? `${this.profile.coins.toLocaleString('vi-VN')} VNĐ` : '—'
      };
    }

    togglePause(force) {
      if (!this.running && !this.paused) return;
      this.paused = typeof force === 'boolean' ? force : !this.paused;
      if (window.DuongToiChienThangUI) window.DuongToiChienThangUI.showPause(this.paused);
    }

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      this.audio.setSfxEnabled(this.soundEnabled);
      this.saveSettings();
      this.updateHUD(true);
      if (window.DuongToiChienThangUI) window.DuongToiChienThangUI.updateSoundButtons(this.soundEnabled);
    }

    populateAmmoSelect() {
      const select = document.getElementById('ammo-select');
      if (!select) return;
      select.innerHTML = '';
      Object.keys(NS.AmmoTypes).forEach((key) => {
        const ammo = NS.AmmoTypes[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${ammo.symbol} — ${ammo.name}`;
        select.appendChild(option);
      });
      select.value = this.selectedAmmo;
    }

    updateHUD(force) {
      if (!this.artillery || (!force && !this.running)) return;
      const phaseLabel = NS.PhaseLabels[this.phase] || this.phase;
      const missionTitle = document.getElementById('mission-title-value');
      if (missionTitle) missionTitle.textContent = `Tiến công ${this.missionConfig.name}`;
      document.getElementById('turn-value').textContent = this.turn;
      document.getElementById('max-turn-value').textContent = '∞';
      document.getElementById('phase-indicator').textContent = phaseLabel;
      document.getElementById('wind-value').textContent = `${this.wind > 0 ? '→' : this.wind < 0 ? '←' : '•'} ${Math.abs(this.wind).toFixed(1)}`;
      document.getElementById('angle-value').textContent = `${Math.round(this.artillery.angle)}°`;
      document.getElementById('power-value').textContent = Math.round(this.artillery.power);
      document.getElementById('angle-input').value = this.artillery.angle;
      document.getElementById('power-input').value = this.artillery.power;
      document.getElementById('action-points-value').textContent = this.resources.actionPoints;
      document.getElementById('engineering-points-value').textContent = this.resources.engineeringPoints;
      document.getElementById('command-points-value').textContent = this.resources.commandPoints;
      document.getElementById('troop-count-value').textContent = this.getTroopCount();
      const tankCount = document.getElementById('tank-count-value');
      if (tankCount) tankCount.textContent = this.getTanks(true).length;
      const tankAmmo = document.getElementById('tank-ammo-value');
      if (tankAmmo) {
        const tanks = this.getTanks(false);
        tankAmmo.textContent = `${tanks.reduce((sum, tank) => sum + (tank.shells || 0), 0)}/${tanks.reduce((sum, tank) => sum + (tank.maxShells || 0), 0)}`;
      }
      const mission = NS.MissionStages[this.missionStage - 1];
      const mapObjective = this.mapConfig.stageObjectives && this.mapConfig.stageObjectives[this.missionStage - 1];
      document.getElementById('objective-value').textContent = mapObjective || (mission ? mission.objective : '');
      const powerNode = document.getElementById('attack-power-value');
      if (powerNode) powerNode.textContent = `${Math.round(this.attackPowerMultiplier * 100)}%`;
      const ammoSelect = document.getElementById('ammo-select');
      if (ammoSelect.value !== this.selectedAmmo) ammoSelect.value = this.selectedAmmo;
      Array.from(ammoSelect.options).forEach((option) => {
        const ammo = NS.AmmoTypes[option.value];
        option.textContent = `${ammo.symbol} — ${ammo.name} (${this.resources.ammo[option.value] || 0})`;
      });
      const playerShellActive = this.projectiles.some((p) => p.owner === 'player');
      document.getElementById('fire-button').disabled = this.phase !== NS.GamePhase.ARTILLERY || this.firedThisPhase || playerShellActive || !this.artillery.active || (this.resources.ammo[this.selectedAmmo] || 0) <= 0;
      document.getElementById('end-phase-button').disabled = this.phase === NS.GamePhase.ENEMY || this.projectiles.length > 0;
      document.querySelectorAll('.command-button').forEach((button) => {
        button.disabled = this.phase !== NS.GamePhase.COMMAND;
        button.classList.toggle('is-active', button.dataset.command === this.commandMode);
      });
      document.getElementById('sound-button').textContent = this.soundEnabled ? '🔊' : '🔇';
      this.renderBattleLog();
    }

    log(message, type) {
      this.logEntries.unshift({ message, type: type || 'normal', turn: this.turn || 1 });
      if (this.logEntries.length > 12) this.logEntries.length = 12;
      this.renderBattleLog();
    }

    renderBattleLog() {
      const log = document.getElementById('battle-log');
      if (!log) return;
      log.innerHTML = this.logEntries.map((entry) => `<div class="log-line ${entry.type === 'important' ? 'log-line--important' : entry.type === 'danger' ? 'log-line--danger' : ''}">[L${entry.turn}] ${entry.message}</div>`).join('');
    }

    saveGame(showMessage) {
      try {
        const data = {
          version: 1,
          missionId: this.currentMissionId,
          difficulty: this.difficulty,
          turn: this.turn,
          phase: this.phase === NS.GamePhase.ENEMY ? NS.GamePhase.OBSERVATION : this.phase,
          wind: this.wind,
          selectedAmmo: this.selectedAmmo,
          resources: this.resources,
          artillery: this.artillery.serialize(),
          squads: this.squads.map((unit) => unit.serialize()),
          fortresses: this.fortresses.map((item) => item.serialize()),
          trenches: this.trenches.map((trench) => trench.serialize()),
          terrain: this.terrain.serialize(),
          missionStage: this.missionStage,
          stats: this.stats,
          shotsFired: this.shotsFired,
          shotsHit: this.shotsHit,
          attackPowerMultiplier: this.attackPowerMultiplier,
          turnQuestionAnswered: this.turnQuestionAnswered
        };
        localStorage.setItem(NS.Constants.STORAGE_KEY, JSON.stringify(data));
        if (showMessage) this.log('Đã lưu tiến trình vào trình duyệt.', 'important');
        return true;
      } catch (error) {
        if (showMessage) this.log('Không thể lưu tiến trình trên trình duyệt này.', 'danger');
        return false;
      }
    }

    loadGame() {
      try {
        const raw = localStorage.getItem(NS.Constants.STORAGE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        this.initNewGame(data.difficulty || 'easy', data.missionId || 'him-lam');
        this.turn = Math.max(1, Number(data.turn) || 1);
        this.phase = Object.values(NS.GamePhase).includes(data.phase) ? data.phase : NS.GamePhase.OBSERVATION;
        this.wind = Number(data.wind) || 0;
        this.selectedAmmo = NS.AmmoTypes[data.selectedAmmo] ? data.selectedAmmo : 'he';
        if (data.resources) {
          this.resources.actionPoints = Math.max(0, Number(data.resources.actionPoints) || 0);
          this.resources.engineeringPoints = Math.max(0, Number(data.resources.engineeringPoints) || 0);
          this.resources.commandPoints = Math.max(0, Number(data.resources.commandPoints) || 0);
          Object.keys(this.resources.ammo).forEach((key) => {
            this.resources.ammo[key] = Math.max(0, Number(data.resources.ammo && data.resources.ammo[key]) || 0);
          });
        }
        this.artillery.restore(data.artillery);
        (data.squads || []).forEach((saved) => {
          const unit = this.squads.find((item) => item.id === saved.id);
          if (unit) unit.restore(saved);
        });
        (data.fortresses || []).forEach((saved) => {
          const item = this.fortresses.find((fort) => fort.id === saved.id);
          if (item) item.restore(saved);
        });
        this.trenches = (data.trenches || []).map((saved) => new NS.Trench(saved));
        this.terrain.restore(data.terrain);
        this.squads.forEach((unit) => {
          unit.y = this.terrain.getHeight(unit.x) - (unit.type === 'tank' ? 12 : 10);
          if (unit.type === 'infantry') {
            if (unit.savedActiveTrenchId) {
              const dugout = this.trenches.find((item) => item.id === unit.savedActiveTrenchId);
              if (dugout && !dugout.completed) {
                unit.activeTrench = dugout;
                const index = Math.max(0, dugout.assignedUnitIds.indexOf(unit.id));
                const side = index % 2 === 0 ? -1 : 1;
                unit.digStandX = Number.isFinite(unit.digStandX)
                  ? unit.digStandX
                  : NS.clamp(dugout.centerX + side * (dugout.width * 0.5 + 18), 20, NS.Constants.WORLD_WIDTH - 20);
                unit.state = 'digging';
              }
            } else if (unit.savedTrenchId) {
              const dugout = this.trenches.find((item) => item.id === unit.savedTrenchId && item.completed && item.durability > 15);
              if (dugout && dugout.addOccupant(unit.id)) {
                unit.inTrench = true;
                unit.trenchId = dugout.id;
                unit.state = 'sheltered';
                unit.x = dugout.getSlotX(unit.id);
                unit.y = dugout.getFloorY(this.terrain) - 8;
              }
            }
          }
        });
        this.missionStage = NS.clamp(Number(data.missionStage) || 1, 1, 3);
        this.stats = Object.assign(this.stats, data.stats || {});
        this.shotsFired = Math.max(0, Number(data.shotsFired) || 0);
        this.shotsHit = Math.max(0, Number(data.shotsHit) || 0);
        this.attackPowerMultiplier = data.turnQuestionAnswered ? NS.clamp(Number(data.attackPowerMultiplier) || 1, 0.5, 1) : 1;
        this.turnQuestionAnswered = Boolean(data.turnQuestionAnswered);
        this.populateAmmoSelect();
        this.log('Đã khôi phục tiến trình đã lưu.', 'important');
        this.updateHUD(true);
        return true;
      } catch (error) {
        return false;
      }
    }

    resetGame() {
      localStorage.removeItem(NS.Constants.STORAGE_KEY);
      this.initNewGame(this.difficulty, this.currentMissionId);
    }

    saveSettings() {
      try {
        localStorage.setItem(NS.Constants.SETTINGS_KEY, JSON.stringify({
          difficulty: this.difficulty,
          soundEnabled: this.soundEnabled,
          sfxEnabled: this.audio.sfxEnabled,
          musicEnabled: this.audio.musicEnabled,
          sfxVolume: this.audio.sfxVolume,
          musicVolume: this.audio.musicVolume,
          performanceMode: 'low'
        }));
      } catch (error) {
        // Một số trình duyệt chặn LocalStorage khi mở file cục bộ.
      }
    }

    loadSettings() {
      try {
        const raw = localStorage.getItem(NS.Constants.SETTINGS_KEY);
        if (!raw) return;
        const settings = JSON.parse(raw);
        if (NS.Difficulty[settings.difficulty]) this.difficulty = settings.difficulty;
        this.soundEnabled = settings.sfxEnabled !== false && settings.soundEnabled !== false;
        this.audio.setSfxEnabled(this.soundEnabled);
        this.audio.setMusicEnabled(settings.musicEnabled !== false);
        if (typeof settings.sfxVolume === 'number') this.audio.setSfxVolume(settings.sfxVolume);
        if (typeof settings.musicVolume === 'number') this.audio.setMusicVolume(settings.musicVolume);
        this.performanceMode = 'low';
        this.performance = NS.getPerformanceProfile('low');
        this.effects.configure(this.performance);
      } catch (error) {
        // Dùng cài đặt mặc định nếu dữ liệu không hợp lệ.
      }
    }
  }

  NS.Game = Game;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
