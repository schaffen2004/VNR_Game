(function (NS) {
  'use strict';

  class Trench {
    constructor(config) {
      const cfg = config || {};
      this.id = cfg.id || `trench-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      this.type = cfg.type || 'communication';
      this.startX = Number(cfg.startX) || 0;
      this.endX = Number(cfg.endX) || this.startX + 60;
      this.startY = Number(cfg.startY) || 0;
      this.endY = Number(cfg.endY) || 0;
      this.progress = NS.clamp(Number(cfg.progress) || 0, 0, 100);
      this.maxProgress = 100;
      this.durability = NS.clamp(Number(cfg.durability) || 100, 0, 100);
      this.completed = Boolean(cfg.completed || this.progress >= 100);
      this.connectedTrenches = Array.isArray(cfg.connectedTrenches) ? cfg.connectedTrenches.slice() : [];
      this.builderId = cfg.builderId || null;
    }

    get length() {
      return Math.hypot(this.endX - this.startX, this.endY - this.startY);
    }

    get direction() {
      return Math.sign(this.endX - this.startX) || 1;
    }

    getBuiltRatio() {
      return NS.clamp(this.progress / this.maxProgress, 0, 1);
    }

    getBuildFrontX() {
      return NS.lerp(this.startX, this.endX, this.getBuiltRatio());
    }

    getBuiltEndY(terrain) {
      const x = this.getBuildFrontX();
      return terrain ? terrain.getHeight(x) : NS.lerp(this.startY, this.endY, this.getBuiltRatio());
    }

    build(amount) {
      if (this.completed || this.durability <= 0) return 0;
      const before = this.progress;
      this.progress = NS.clamp(this.progress + Math.max(0, amount), 0, this.maxProgress);
      if (this.progress >= this.maxProgress) this.completed = true;
      return this.progress - before;
    }

    takeDamage(amount) {
      this.durability = NS.clamp(this.durability - Math.max(0, amount), 0, 100);
      if (this.durability <= 0) {
        this.completed = false;
        this.progress = Math.min(this.progress, 35);
      }
    }

    repair(amount) {
      this.durability = NS.clamp(this.durability + Math.max(0, amount), 0, 100);
      if (this.progress >= 100 && this.durability > 20) this.completed = true;
    }

    containsUnit(unit) {
      if (this.progress < 18 || this.durability <= 15 || !unit || unit.state === 'dead' || unit.type !== 'infantry') return false;
      const builtEndX = this.getBuildFrontX();
      const builtEndY = NS.lerp(this.startY, this.endY, this.getBuiltRatio());
      const distance = NS.distanceToSegment(unit.x, unit.y, this.startX, this.startY, builtEndX, builtEndY);
      return distance <= 24;
    }

    getCoverFor(unit) {
      if (!this.containsUnit(unit)) return 0;
      const progressCover = this.completed ? 0.58 : 0.26 + this.getBuiltRatio() * 0.27;
      return NS.clamp(progressCover * (this.durability / 100), 0, 0.62);
    }

    isNearEndpoint(x, maxDistance) {
      const distance = Math.min(Math.abs(x - this.startX), Math.abs(x - this.endX));
      return distance <= (Number(maxDistance) || 45);
    }

    getNearestEndpoint(x) {
      return Math.abs(x - this.startX) <= Math.abs(x - this.endX) ? this.startX : this.endX;
    }

    serialize() {
      return {
        id: this.id, type: this.type, startX: this.startX, startY: this.startY,
        endX: this.endX, endY: this.endY, progress: this.progress,
        durability: this.durability, completed: this.completed,
        connectedTrenches: this.connectedTrenches.slice(), builderId: this.builderId
      };
    }
  }

  NS.Trench = Trench;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
