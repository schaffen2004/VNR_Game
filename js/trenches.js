(function (NS) {
  'use strict';

  // Giữ tên lớp Trench để tương thích dữ liệu cũ, nhưng trong phiên bản này
  // đối tượng đại diện cho một hầm trú ẩn đào chìm dưới mặt đất.
  class Trench {
    constructor(config) {
      const cfg = config || {};
      this.id = cfg.id || `dugout-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      this.type = 'dugout';
      this.startX = Number(cfg.startX) || 0;
      this.endX = Number(cfg.endX) || this.startX + (Number(cfg.width) || 112);
      this.startY = Number(cfg.startY) || 0;
      this.endY = Number(cfg.endY) || this.startY;
      this.width = Math.max(84, Number(cfg.width) || Math.abs(this.endX - this.startX) || 112);
      this.centerX = Number.isFinite(Number(cfg.centerX))
        ? Number(cfg.centerX)
        : (this.startX + this.endX) * 0.5;
      this.depth = Math.max(20, Number(cfg.depth) || NS.Constants.DUGOUT_DEPTH || 30);
      this.progress = NS.clamp(Number(cfg.progress) || 0, 0, 100);
      this.maxProgress = 100;
      this.durability = NS.clamp(Number(cfg.durability) || 100, 0, 100);
      this.completed = Boolean(cfg.completed || this.progress >= 100);
      this.capacity = Math.max(1, Number(cfg.capacity) || 4);
      this.assignedUnitIds = Array.isArray(cfg.assignedUnitIds) ? cfg.assignedUnitIds.slice() : [];
      this.occupantIds = Array.isArray(cfg.occupantIds) ? cfg.occupantIds.slice() : [];
      this.builderId = cfg.builderId || null;
      this.completionRegistered = Boolean(cfg.completionRegistered || this.completed);
      this.connectedTrenches = [];
    }

    get length() {
      return this.width;
    }

    get direction() {
      return 1;
    }

    getBuiltRatio() {
      return NS.clamp(this.progress / this.maxProgress, 0, 1);
    }

    getBuildFrontX() {
      return this.centerX;
    }

    getBuiltEndY(terrain) {
      return terrain ? terrain.getHeight(this.centerX) : this.startY;
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
        this.occupantIds.length = 0;
      }
    }

    repair(amount) {
      this.durability = NS.clamp(this.durability + Math.max(0, amount), 0, 100);
      if (this.progress >= 100 && this.durability > 20) this.completed = true;
    }

    containsPosition(x, margin) {
      if (!this.completed || this.durability <= 15) return false;
      return Math.abs(Number(x) - this.centerX) <= this.width * 0.46 + (Number(margin) || 0);
    }

    containsUnit(unit) {
      if (!unit || unit.state === 'dead' || unit.type !== 'infantry') return false;
      return this.completed && this.durability > 15 && unit.inTrench === true && unit.trenchId === this.id;
    }

    hasSpaceFor(unitId) {
      if (this.occupantIds.includes(unitId)) return true;
      return this.occupantIds.length < this.capacity;
    }

    addOccupant(unitId) {
      if (!unitId || !this.hasSpaceFor(unitId)) return false;
      if (!this.occupantIds.includes(unitId)) this.occupantIds.push(unitId);
      return true;
    }

    removeOccupant(unitId) {
      const index = this.occupantIds.indexOf(unitId);
      if (index >= 0) this.occupantIds.splice(index, 1);
    }

    getSlotX(unitId) {
      const ids = this.occupantIds.length ? this.occupantIds : this.assignedUnitIds;
      const index = Math.max(0, ids.indexOf(unitId));
      const count = Math.max(1, Math.min(this.capacity, ids.length || 1));
      const spacing = Math.min(22, (this.width - 34) / Math.max(1, count));
      return this.centerX + (index - (count - 1) * 0.5) * spacing;
    }

    getFloorY(terrain) {
      const surface = terrain ? terrain.getHeight(this.centerX) : this.startY;
      return surface + this.depth;
    }

    getCoverFor(unit) {
      if (!this.containsUnit(unit)) return 0;
      const integrity = this.durability / 100;
      return NS.clamp(0.82 * integrity, 0, 0.84);
    }

    isNearEndpoint(x, maxDistance) {
      return Math.abs(Number(x) - this.centerX) <= (Number(maxDistance) || 70);
    }

    getNearestEndpoint() {
      return this.centerX;
    }

    serialize() {
      return {
        id: this.id,
        type: this.type,
        startX: this.startX,
        startY: this.startY,
        endX: this.endX,
        endY: this.endY,
        centerX: this.centerX,
        width: this.width,
        depth: this.depth,
        progress: this.progress,
        durability: this.durability,
        completed: this.completed,
        capacity: this.capacity,
        assignedUnitIds: this.assignedUnitIds.slice(),
        occupantIds: this.occupantIds.slice(),
        builderId: this.builderId,
        completionRegistered: this.completionRegistered
      };
    }
  }

  NS.Trench = Trench;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
