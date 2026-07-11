(function (NS) {
  'use strict';

  NS.clamp = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  };

  NS.lerp = function (a, b, t) {
    return a + (b - a) * t;
  };

  NS.distance = function (a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  NS.pointInRect = function (px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height;
  };

  NS.circleRectOverlap = function (cx, cy, radius, rect) {
    const nearestX = NS.clamp(cx, rect.x, rect.x + rect.width);
    const nearestY = NS.clamp(cy, rect.y, rect.y + rect.height);
    return Math.hypot(cx - nearestX, cy - nearestY) <= radius;
  };

  NS.distanceToSegment = function (px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
    const t = NS.clamp(((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy), 0, 1);
    const sx = x1 + dx * t;
    const sy = y1 + dy * t;
    return Math.hypot(px - sx, py - sy);
  };

  class Terrain {
    constructor(width, height, step, mapConfig) {
      this.width = width;
      this.height = height;
      this.step = step;
      this.mapConfig = mapConfig || NS.getMapConfig('him-lam');
      this.heights = [];
      this.craters = [];
      this.generate();
    }

    generate() {
      const count = Math.ceil(this.width / this.step) + 1;
      const profile = this.mapConfig && this.mapConfig.terrainProfile || 'hill';
      this.heights.length = count;
      for (let i = 0; i < count; i += 1) {
        const x = i * this.step;
        let y = 650 + Math.sin(x * 0.008) * 10 + Math.sin(x * 0.021 + 1.2) * 6;

        if (profile === 'hill') {
          // Him Lam: vùng thấp ở đầu bản đồ, vượt sông rồi leo dần lên đồi.
          if (x > 1500) {
            const t = NS.clamp((x - 1500) / 850, 0, 1);
            y -= 245 * (t * t * (3 - 2 * t));
          }
          if (x >= 500 && x <= 650) y += 24 * Math.sin(((x - 500) / 150) * Math.PI);
        } else if (profile === 'ridge') {
          // Độc Lập: chân đồi dài và đỉnh cao, sườn dốc hơn Him Lam.
          if (x > 980) {
            const t = NS.clamp((x - 980) / 1320, 0, 1);
            y -= 285 * (t * t * (3 - 2 * t));
          }
          if (x > 2200) y += (x - 2200) * 0.12;
        } else if (profile === 'airfield') {
          // Mường Thanh: lòng chảo tương đối phẳng, đường băng nằm ở nửa phải.
          y = 610 + Math.sin(x * 0.008) * 8;
          if (x < 950) y += Math.sin(x * 0.022) * 12;
          if (x >= 1800) y = 603 + Math.sin(x * 0.004) * 2.5;
        } else if (profile === 'basin') {
          // Sở chỉ huy ở lòng chảo: hai rìa cao, vùng trung tâm thấp.
          const center = 1900;
          const d = Math.abs(x - center) / 1500;
          y = 565 + Math.min(125, d * d * 150) + Math.sin(x * 0.014) * 7;
          if (x > 2200) y -= 22;
        }

        y += Math.sin(x * 0.038) * 3.5;
        this.heights[i] = NS.clamp(y, 285, this.height - 70);
      }
    }

    getHeight(x) {
      const safeX = NS.clamp(x, 0, this.width);
      const position = safeX / this.step;
      const left = Math.floor(position);
      const right = Math.min(this.heights.length - 1, left + 1);
      return NS.lerp(this.heights[left], this.heights[right], position - left);
    }

    getSlope(x) {
      return (this.getHeight(x + 4) - this.getHeight(x - 4)) / 8;
    }

    isBelowSurface(x, y) {
      return y >= this.getHeight(x);
    }

    carveCrater(x, y, radius, strength) {
      const craterRadius = Math.max(8, radius * (strength / 60));
      const startIndex = Math.max(0, Math.floor((x - craterRadius) / this.step));
      const endIndex = Math.min(this.heights.length - 1, Math.ceil((x + craterRadius) / this.step));
      for (let i = startIndex; i <= endIndex; i += 1) {
        const worldX = i * this.step;
        const dx = worldX - x;
        const inside = craterRadius * craterRadius - dx * dx;
        if (inside <= 0) continue;
        const depth = Math.sqrt(inside) * 0.56;
        this.heights[i] = NS.clamp(Math.max(this.heights[i], y + depth * 0.34), 180, this.height - 35);
      }
      this.smooth(startIndex, endIndex, 2);
      this.craters.push({ x, y: this.getHeight(x), radius: craterRadius });
      if (this.craters.length > 70) this.craters.shift();
    }

    smooth(start, end, passes) {
      for (let pass = 0; pass < passes; pass += 1) {
        const copy = this.heights.slice();
        for (let i = Math.max(1, start); i <= Math.min(this.heights.length - 2, end); i += 1) {
          this.heights[i] = copy[i] * 0.58 + copy[i - 1] * 0.21 + copy[i + 1] * 0.21;
        }
      }
    }

    serialize() {
      return { heights: this.heights.slice() };
    }

    restore(data) {
      if (!data || !Array.isArray(data.heights) || data.heights.length !== this.heights.length) return false;
      this.heights = data.heights.map((v) => Number(v));
      return true;
    }
  }

  class Camera {
    constructor(worldWidth, worldHeight) {
      this.x = 0;
      this.y = 0;
      this.zoom = 1;
      this.targetX = null;
      this.targetY = null;
      this.worldWidth = worldWidth;
      this.worldHeight = worldHeight;
      this.viewportWidth = window.innerWidth;
      this.viewportHeight = window.innerHeight;
      this.shakeTime = 0;
      this.shakePower = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }

    resize(width, height) {
      this.viewportWidth = width;
      this.viewportHeight = height;
      this.clampPosition();
    }

    update(dt) {
      if (this.targetX !== null) {
        const desiredX = this.targetX - this.viewportWidth / (2 * this.zoom);
        const desiredY = this.targetY - this.viewportHeight / (2 * this.zoom);
        this.x = NS.lerp(this.x, desiredX, 1 - Math.pow(0.001, dt));
        this.y = NS.lerp(this.y, desiredY, 1 - Math.pow(0.001, dt));
        if (Math.abs(this.x - desiredX) < 2 && Math.abs(this.y - desiredY) < 2) {
          this.targetX = null;
          this.targetY = null;
        }
      }
      if (this.shakeTime > 0) {
        this.shakeTime -= dt;
        this.shakeX = (Math.random() - 0.5) * this.shakePower;
        this.shakeY = (Math.random() - 0.5) * this.shakePower;
        this.shakePower *= 0.93;
      } else {
        this.shakeX = 0;
        this.shakeY = 0;
      }
      this.clampPosition();
    }

    focus(x, y) {
      this.targetX = NS.clamp(x, 0, this.worldWidth);
      this.targetY = NS.clamp(y, 0, this.worldHeight);
    }

    pan(dx, dy) {
      this.targetX = null;
      this.targetY = null;
      this.x += dx / this.zoom;
      this.y += dy / this.zoom;
      this.clampPosition();
    }

    setZoom(nextZoom, pivotScreenX, pivotScreenY) {
      const oldZoom = this.zoom;
      const beforeX = this.x + pivotScreenX / oldZoom;
      const beforeY = this.y + pivotScreenY / oldZoom;
      this.zoom = NS.clamp(nextZoom, 0.6, 1.65);
      this.x = beforeX - pivotScreenX / this.zoom;
      this.y = beforeY - pivotScreenY / this.zoom;
      this.clampPosition();
    }

    shake(power, duration) {
      this.shakePower = Math.max(this.shakePower, power);
      this.shakeTime = Math.max(this.shakeTime, duration);
    }

    clampPosition() {
      const maxX = Math.max(0, this.worldWidth - this.viewportWidth / this.zoom);
      const maxY = Math.max(0, this.worldHeight - this.viewportHeight / this.zoom);
      this.x = NS.clamp(this.x, 0, maxX);
      this.y = NS.clamp(this.y, 0, maxY);
    }

    worldToScreen(x, y) {
      return {
        x: (x - this.x) * this.zoom + this.shakeX,
        y: (y - this.y) * this.zoom + this.shakeY
      };
    }

    screenToWorld(x, y) {
      return {
        x: (x - this.shakeX) / this.zoom + this.x,
        y: (y - this.shakeY) / this.zoom + this.y
      };
    }

    isVisible(x, y, margin) {
      const m = margin || 0;
      return x >= this.x - m && x <= this.x + this.viewportWidth / this.zoom + m && y >= this.y - m && y <= this.y + this.viewportHeight / this.zoom + m;
    }
  }

  NS.Terrain = Terrain;
  NS.Camera = Camera;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
