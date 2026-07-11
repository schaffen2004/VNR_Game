(function (NS) {
  'use strict';

  class Renderer {
    constructor(game, canvas, minimapCanvas) {
      this.game = game;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      this.minimapCanvas = minimapCanvas;
      this.minimapCtx = minimapCanvas.getContext('2d', { alpha: false });
      this.dpr = 1;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.frameTime = 0;
      this.lastMinimapRender = -Infinity;
      this.skyGradient = null;
      this.sunGlow = null;
      this.hazeGradient = null;
      this.vignetteGradient = null;
      this.flashGradient = null;
      this.soilGradient = null;
      this.terrainPattern = this.createTerrainPattern();
      this.resize();
    }

    createTerrainPattern() {
      const tile = document.createElement('canvas');
      tile.width = 96;
      tile.height = 96;
      const ctx = tile.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 96, 96);
      gradient.addColorStop(0, '#7a5d3b');
      gradient.addColorStop(1, '#4f3b29');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 96, 96);
      let seed = 7319;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let i = 0; i < 150; i += 1) {
        const light = random() > 0.54;
        ctx.fillStyle = light ? 'rgba(210,180,118,.13)' : 'rgba(24,20,16,.16)';
        const size = 0.7 + random() * 2.4;
        ctx.beginPath();
        ctx.arc(random() * 96, random() * 96, size, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 12; i += 1) {
        ctx.strokeStyle = 'rgba(33,28,21,.18)';
        ctx.lineWidth = 1;
        const x = random() * 96;
        const y = random() * 96;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 5 + random() * 11, y + (random() - 0.5) * 7);
        ctx.stroke();
      }
      return this.ctx.createPattern(tile, 'repeat');
    }

    resize() {
      const profile = this.game.performance || NS.getPerformanceProfile('low');
      this.dpr = Math.min(profile.dprLimit || 1, window.devicePixelRatio || 1);
      this.width = Math.max(320, window.innerWidth);
      this.height = Math.max(240, window.innerHeight);
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.buildScreenCaches();
      this.game.camera.resize(this.width, this.height);
    }


    buildScreenCaches() {
      const ctx = this.ctx;
      this.skyGradient = ctx.createLinearGradient(0, 0, 0, this.height);
      this.skyGradient.addColorStop(0, '#354b4a');
      this.skyGradient.addColorStop(0.44, '#7b8069');
      this.skyGradient.addColorStop(0.76, '#aa9870');
      this.skyGradient.addColorStop(1, '#c0a776');

      const sunX = this.width * 0.72;
      const sunY = this.height * 0.18;
      this.sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, this.height * 0.42);
      this.sunGlow.addColorStop(0, 'rgba(255,225,155,.3)');
      this.sunGlow.addColorStop(0.3, 'rgba(238,194,118,.12)');
      this.sunGlow.addColorStop(1, 'rgba(238,194,118,0)');

      this.hazeGradient = ctx.createLinearGradient(0, this.height * 0.45, 0, this.height);
      this.hazeGradient.addColorStop(0, 'rgba(205,194,157,0)');
      this.hazeGradient.addColorStop(1, 'rgba(194,164,112,.18)');

      this.flashGradient = ctx.createRadialGradient(this.width * 0.5, this.height * 0.5, 0, this.width * 0.5, this.height * 0.5, Math.max(this.width, this.height) * 0.7);
      this.flashGradient.addColorStop(0, '#ffe7a3');
      this.flashGradient.addColorStop(1, 'rgba(255,216,134,0)');

      this.vignetteGradient = ctx.createRadialGradient(this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.28, this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.68);
      this.vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
      this.vignetteGradient.addColorStop(1, 'rgba(7,10,7,.22)');

      this.soilGradient = ctx.createLinearGradient(0, 280, 0, NS.Constants.WORLD_HEIGHT);
      this.soilGradient.addColorStop(0, '#8c6b43');
      this.soilGradient.addColorStop(0.28, '#654a31');
      this.soilGradient.addColorStop(0.68, '#463326');
      this.soilGradient.addColorStop(1, '#211b17');
    }

    render() {
      const ctx = this.ctx;
      this.frameTime = performance.now() / 1000;
      ctx.save();
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      // Nền được vẽ kín toàn màn hình nên không cần clearRect trên Canvas opaque.
      this.drawBackground(ctx);
      ctx.save();
      const camera = this.game.camera;
      ctx.translate(camera.shakeX, camera.shakeY);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.x, -camera.y);
      this.drawWorld(ctx);
      ctx.restore();
      this.drawScreenEffects(ctx);
      ctx.restore();
      const minimapInterval = (this.game.performance && this.game.performance.minimapInterval) || 0.2;
      if (this.frameTime - this.lastMinimapRender >= minimapInterval) {
        this.drawMinimap();
        this.lastMinimapRender = this.frameTime;
      }
    }

    drawBackground(ctx) {
      const detail = (this.game.performance && this.game.performance.backgroundDetail) || 0.55;
      ctx.fillStyle = this.skyGradient || '#6f7968';
      ctx.fillRect(0, 0, this.width, this.height);

      if (detail > 0.5 && this.sunGlow) {
        ctx.fillStyle = this.sunGlow;
        ctx.fillRect(0, 0, this.width, this.height);
      }

      const drift = (this.game.camera.x * 0.018) % (this.width + 360);
      const cloudCount = detail >= 0.95 ? 7 : (detail >= 0.75 ? 5 : 3);
      for (let i = 0; i < cloudCount; i += 1) {
        const x = (i * 310 + 100 - drift + this.width + 360) % (this.width + 360) - 180;
        const y = 70 + (i % 3) * 48;
        ctx.fillStyle = 'rgba(226,224,202,.075)';
        ctx.beginPath();
        ctx.ellipse(x, y, 120 + (i % 2) * 38, 22 + (i % 3) * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (detail > 0.6 && this.hazeGradient) {
        ctx.fillStyle = this.hazeGradient;
        ctx.fillRect(0, this.height * 0.4, this.width, this.height * 0.6);
      }
    }

    drawWorld(ctx) {
      this.drawDistantHills(ctx);
      this.drawTerrain(ctx);
      this.drawCraterMarks(ctx);
      this.drawTrenches(ctx);
      this.drawDecorations(ctx);
      this.drawFlag(ctx);
      this.game.fortresses.forEach((structure) => {
        if (this.game.camera.isVisible(structure.x, structure.y, 150)) this.drawFortress(ctx, structure);
      });
      this.drawArtillery(ctx, this.game.artillery);
      this.game.squads.forEach((unit) => {
        if (!this.game.camera.isVisible(unit.x, unit.y, 90)) return;
        if (unit.type === 'tank') this.drawTank(ctx, unit);
        else this.drawSquad(ctx, unit);
      });
      this.game.projectiles.forEach((projectile) => this.drawProjectile(ctx, projectile));
      this.drawSmokeZones(ctx);
      this.drawWarnings(ctx);
      this.drawParticles(ctx);
      this.drawFloatingTexts(ctx);
      this.drawTrajectoryPreview(ctx);
      this.drawSelectionBox(ctx);
    }

    drawDistantHills(ctx) {
      const camera = this.game.camera;
      const drawLayer = (baseY, amplitude, color, speed, frequency) => {
        ctx.save();
        ctx.translate(camera.x * speed, 0);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-500, NS.Constants.WORLD_HEIGHT);
        for (let x = -500; x <= NS.Constants.WORLD_WIDTH + 500; x += 70) {
          const y = baseY + Math.sin(x * frequency) * amplitude + Math.sin(x * frequency * 2.7) * amplitude * 0.28;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(NS.Constants.WORLD_WIDTH + 500, NS.Constants.WORLD_HEIGHT);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
      const detail = (this.game.performance && this.game.performance.backgroundDetail) || 0.55;
      if (detail > 0.7) drawLayer(360, 46, 'rgba(42,58,48,.22)', 0.72, 0.0034);
      drawLayer(425, 62, 'rgba(45,62,43,.32)', 0.48, 0.0045);
      drawLayer(500, 52, 'rgba(50,61,39,.46)', 0.25, 0.0061);
    }

    drawTerrain(ctx) {
      const terrain = this.game.terrain;
      const startX = Math.max(0, Math.floor(this.game.camera.x / terrain.step) * terrain.step - 40);
      const endX = Math.min(terrain.width, this.game.camera.x + this.game.camera.viewportWidth / this.game.camera.zoom + 60);
      const makePath = () => {
        ctx.beginPath();
        ctx.moveTo(startX, NS.Constants.WORLD_HEIGHT);
        ctx.lineTo(startX, terrain.getHeight(startX));
        for (let x = startX; x <= endX; x += terrain.step) ctx.lineTo(x, terrain.getHeight(x));
        ctx.lineTo(endX, NS.Constants.WORLD_HEIGHT);
        ctx.closePath();
      };

      makePath();
      ctx.fillStyle = this.soilGradient || '#5f4630';
      ctx.fill();

      ctx.save();
      makePath();
      ctx.clip();
      ctx.globalAlpha = 0.62;
      ctx.fillStyle = this.terrainPattern || '#60472f';
      ctx.fillRect(startX, 250, endX - startX, NS.Constants.WORLD_HEIGHT - 250);
      ctx.globalAlpha = 0.11;
      for (let y = 560; y < NS.Constants.WORLD_HEIGHT; y += 34) {
        ctx.fillStyle = y % 68 === 0 ? '#d0aa6a' : '#171513';
        ctx.fillRect(startX, y, endX - startX, 2);
      }
      ctx.restore();

      ctx.strokeStyle = '#b99a5c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX, terrain.getHeight(startX));
      for (let x = startX; x <= endX; x += terrain.step) ctx.lineTo(x, terrain.getHeight(x));
      ctx.stroke();
      ctx.strokeStyle = 'rgba(51,55,31,.72)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(startX, terrain.getHeight(startX) - 2);
      for (let x = startX; x <= endX; x += 13) ctx.lineTo(x, terrain.getHeight(x) - 2 - Math.sin(x * 0.9) * 1.3);
      ctx.stroke();
    }

    drawCraterMarks(ctx) {
      this.game.terrain.craters.forEach((crater) => {
        const radius = Math.max(10, crater.radius * 0.76);
        if (this.game.performanceMode === 'low') {
          ctx.fillStyle = 'rgba(28,22,18,.58)';
        } else {
          const gradient = ctx.createRadialGradient(crater.x, crater.y + 6, radius * 0.08, crater.x, crater.y + 5, radius);
          gradient.addColorStop(0, 'rgba(14,14,12,.72)');
          gradient.addColorStop(0.54, 'rgba(42,31,22,.5)');
          gradient.addColorStop(1, 'rgba(130,94,55,0)');
          ctx.fillStyle = gradient;
        }
        ctx.beginPath();
        ctx.ellipse(crater.x, crater.y + 5, radius, radius * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(183,132,71,.28)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(crater.x, crater.y + 1, radius * 0.94, radius * 0.22, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
      });
    }

    drawDecorations(ctx) {
      const terrain = this.game.terrain;
      const landmarks = this.game.mapConfig && this.game.mapConfig.landmarks || [];
      ctx.save();
      landmarks.forEach((zone) => {
        const mid = (zone.from + zone.to) * 0.5;
        const y = terrain.getHeight(mid);
        if (zone.type === 'river') {
          ctx.fillStyle = 'rgba(57,112,135,.74)';
          ctx.beginPath();
          ctx.moveTo(zone.from, terrain.getHeight(zone.from) - 2);
          for (let x = zone.from; x <= zone.to; x += 16) ctx.lineTo(x, terrain.getHeight(x) + 10 + Math.sin(x * 0.08) * 3);
          ctx.lineTo(zone.to, terrain.getHeight(zone.to) + 25);
          ctx.lineTo(zone.from, terrain.getHeight(zone.from) + 25);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(196,229,222,.45)'; ctx.lineWidth = 2;
          for (let row = 0; row < 3; row += 1) {
            ctx.beginPath();
            for (let x = zone.from + 8; x <= zone.to - 8; x += 20) {
              const yy = terrain.getHeight(x) + 8 + row * 5 + Math.sin(x * 0.09 + row) * 2;
              if (x === zone.from + 8) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
            }
            ctx.stroke();
          }
        } else if (zone.type === 'forest') {
          for (let x = zone.from + 24; x < zone.to - 14; x += 46) {
            const treeY = terrain.getHeight(x);
            ctx.strokeStyle = '#3c3323'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(x, treeY); ctx.lineTo(x, treeY - 35 - (x % 3) * 4); ctx.stroke();
            ctx.fillStyle = 'rgba(48,70,40,.78)';
            ctx.beginPath(); ctx.arc(x, treeY - 38, 15, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x - 10, treeY - 29, 12, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 10, treeY - 28, 12, 0, Math.PI * 2); ctx.fill();
          }
        } else if (zone.type === 'runway') {
          const runwayY = terrain.getHeight(mid) - 3;
          ctx.fillStyle = '#77766f';
          ctx.fillRect(zone.from, runwayY - 9, zone.to - zone.from, 18);
          ctx.strokeStyle = '#d7d0b6'; ctx.lineWidth = 2; ctx.setLineDash([22, 18]);
          ctx.beginPath(); ctx.moveTo(zone.from + 15, runwayY); ctx.lineTo(zone.to - 15, runwayY); ctx.stroke(); ctx.setLineDash([]);
        } else if (zone.type === 'approachTrench' || zone.type === 'encircle') {
          ctx.strokeStyle = 'rgba(54,39,27,.8)'; ctx.lineWidth = 8; ctx.setLineDash([38, 18]);
          ctx.beginPath();
          ctx.moveTo(zone.from, terrain.getHeight(zone.from) + 4);
          for (let x = zone.from + 20; x <= zone.to; x += 20) ctx.lineTo(x, terrain.getHeight(x) + 4);
          ctx.stroke(); ctx.setLineDash([]);
        } else if (zone.type === 'open' || zone.type === 'assembly' || zone.type === 'fortZone' || zone.type === 'gunZone' || zone.type === 'outerFort' || zone.type === 'basin') {
          ctx.fillStyle = zone.type === 'gunZone' ? 'rgba(155,128,70,.13)' : 'rgba(206,190,137,.06)';
          ctx.fillRect(zone.from, y - 10, zone.to - zone.from, 14);
        }

        // Nhãn khu vực được đặt cao hơn mặt đất và tự co để không đè lên công sự.
        ctx.fillStyle = 'rgba(27,31,24,.72)';
        ctx.roundRect(mid - 62, y - 82, 124, 24, 6); ctx.fill();
        ctx.fillStyle = '#f5e6a2'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(zone.label, mid, y - 66);
      });
      ctx.restore();
    }

    drawTrenches(ctx) {
      const terrain = this.game.terrain;
      this.game.trenches.forEach((trench) => {
        const builtEndX = trench.getBuildFrontX();
        const direction = trench.direction;
        const sampleStep = 10 * direction;
        const drawTerrainPath = (fromX, toX) => {
          ctx.beginPath();
          ctx.moveTo(fromX, terrain.getHeight(fromX) + 5);
          if (direction > 0) {
            for (let x = fromX + sampleStep; x < toX; x += sampleStep) ctx.lineTo(x, terrain.getHeight(x) + 5);
          } else {
            for (let x = fromX + sampleStep; x > toX; x += sampleStep) ctx.lineTo(x, terrain.getHeight(x) + 5);
          }
          ctx.lineTo(toX, terrain.getHeight(toX) + 5);
        };

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Phần chưa đào chỉ là tuyến dự kiến, hiển thị nét đứt mảnh.
        if (!trench.completed) {
          ctx.strokeStyle = 'rgba(221, 199, 130, 0.62)';
          ctx.lineWidth = 3;
          ctx.setLineDash([9, 8]);
          drawTerrainPath(builtEndX, trench.endX);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if (trench.progress > 0) {
          const durabilityAlpha = 0.45 + 0.55 * trench.durability / 100;
          ctx.globalAlpha = durabilityAlpha;

          // Rãnh tối nằm thấp hơn mặt đất, thay vì một đường nổi trên bề mặt.
          ctx.strokeStyle = '#2b2119';
          ctx.lineWidth = 20;
          drawTerrainPath(trench.startX, builtEndX);
          ctx.stroke();

          ctx.strokeStyle = '#4a3827';
          ctx.lineWidth = 10;
          drawTerrainPath(trench.startX, builtEndX);
          ctx.stroke();

          // Bờ đất hai mép hào.
          ctx.strokeStyle = '#a0824e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(trench.startX, terrain.getHeight(trench.startX) - 4);
          if (direction > 0) {
            for (let x = trench.startX + sampleStep; x < builtEndX; x += sampleStep) ctx.lineTo(x, terrain.getHeight(x) - 4);
          } else {
            for (let x = trench.startX + sampleStep; x > builtEndX; x += sampleStep) ctx.lineTo(x, terrain.getHeight(x) - 4);
          }
          ctx.lineTo(builtEndX, terrain.getHeight(builtEndX) - 4);
          ctx.stroke();

          ctx.strokeStyle = '#6f5638';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(trench.startX, terrain.getHeight(trench.startX) + 11);
          if (direction > 0) {
            for (let x = trench.startX + sampleStep; x < builtEndX; x += sampleStep) ctx.lineTo(x, terrain.getHeight(x) + 11);
          } else {
            for (let x = trench.startX + sampleStep; x > builtEndX; x += sampleStep) ctx.lineTo(x, terrain.getHeight(x) + 11);
          }
          ctx.lineTo(builtEndX, terrain.getHeight(builtEndX) + 11);
          ctx.stroke();
        }

        if (!trench.completed) {
          const barX = builtEndX - 38;
          const barY = terrain.getHeight(builtEndX) - 36;
          this.drawProgressBar(ctx, barX, barY, 76, trench.progress / 100, '#c8ae62');
        }
        ctx.restore();
      });
    }

    drawFlag(ctx) {
      const x = this.game.mapConfig && this.game.mapConfig.flagX || 2360;
      const y = this.game.terrain.getHeight(x);
      ctx.strokeStyle = '#36372f';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 115); ctx.stroke();
      const captured = this.game.squads && this.game.squads.some((unit) => unit.type === 'infantry' && unit.state !== 'dead' && Math.abs(unit.x - x) < 72);
      ctx.fillStyle = captured ? '#d3132a' : '#b8ad8d';
      ctx.fillRect(x + 3, y - 112, 66, 42);
      if (captured) {
        const cx = x + 36, cy = y - 91, outer = 13, inner = 5.2;
        ctx.fillStyle = '#ffdf36'; ctx.beginPath();
        for (let i = 0; i < 10; i += 1) {
          const angle = -Math.PI / 2 + i * Math.PI / 5;
          const radius = i % 2 === 0 ? outer : inner;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#fff0aa'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('ĐIỂM CHIẾM CỨ ĐIỂM', x + 20, y - 128);
    }

    drawArtillery(ctx, artillery) {
      ctx.save();
      ctx.translate(artillery.x, artillery.y);
      if (!artillery.active && artillery.health <= 0) {
        ctx.globalAlpha = 0.58;
        ctx.fillStyle = '#22231f';
        ctx.fillRect(-36, -10, 72, 18);
        ctx.strokeStyle = '#151714';
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(42, -34); ctx.stroke();
        ctx.restore();
        return;
      }
      const radians = artillery.angle * Math.PI / 180;
      ctx.fillStyle = 'rgba(16,18,14,.28)';
      ctx.beginPath(); ctx.ellipse(0, 10, 48, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3d4935';
      ctx.roundRect(-34, -22, 62, 23, 4); ctx.fill();
      ctx.fillStyle = '#242a22';
      [-22, 18].forEach((wheelX) => { ctx.beginPath(); ctx.arc(wheelX, 3, 13, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#667055'; ctx.lineWidth = 2; ctx.stroke(); });
      ctx.save();
      ctx.rotate(-radians);
      const barrelGradient = ctx.createLinearGradient(0, 0, 61, 0);
      barrelGradient.addColorStop(0, '#293127');
      barrelGradient.addColorStop(0.55, '#4b5941');
      barrelGradient.addColorStop(1, '#222820');
      ctx.fillStyle = barrelGradient;
      ctx.roundRect(2, -6, 62, 12, 4); ctx.fill();
      ctx.fillStyle = '#171b17'; ctx.fillRect(58, -7, 9, 14);
      ctx.restore();
      ctx.fillStyle = '#5b654a';
      ctx.beginPath(); ctx.arc(2, -21, 11, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      this.drawProgressBar(ctx, artillery.x - 42, artillery.y - 56, 84, artillery.health / artillery.maxHealth, '#78a955');
    }

    drawSquad(ctx, unit) {
      const dead = unit.state === 'dead';
      ctx.save();
      ctx.globalAlpha = dead ? 0.34 : 1;
      if (unit.selected && !dead) {
        const pulse = 1 + Math.sin(this.frameTime * 5) * 0.06;
        ctx.strokeStyle = '#f3dc79';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(unit.x, unit.y + 7, 29 * pulse, 9 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      const count = Math.max(1, Math.min(6, Math.ceil(unit.soldiers / 2)));
      const moving = unit.state === 'moving' || unit.state === 'charging' || unit.state === 'retreating';
      const bob = moving ? Math.sin(this.frameTime * (unit.state === 'charging' ? 12 : 8) + unit.x * 0.05) * 1.7 : 0;
      for (let i = 0; i < count; i += 1) {
        const row = i % 2;
        const offsetX = (i - (count - 1) / 2) * 9;
        const x = unit.x + offsetX;
        const y = unit.y + row * 3 + bob * (i % 2 ? 0.7 : 1);
        const bodyColor = unit.flashTime > 0 ? '#b65d4a' : (unit.engineer ? '#52634a' : '#43533d');
        ctx.strokeStyle = '#263126';
        ctx.lineWidth = 2.4;
        ctx.fillStyle = bodyColor;
        ctx.beginPath(); ctx.roundRect(x - 3.5, y - 15, 7, 12, 2); ctx.fill();
        ctx.fillStyle = '#68795d';
        ctx.beginPath(); ctx.arc(x, y - 20, 4.4, Math.PI, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#b08b62';
        ctx.beginPath(); ctx.arc(x, y - 18.2, 3.1, 0, Math.PI * 2); ctx.fill();
        const stride = moving ? Math.sin(this.frameTime * 10 + i) * 4 : 2.8;
        ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x - stride, y + 5); ctx.moveTo(x, y - 4); ctx.lineTo(x + stride, y + 5); ctx.stroke();
        const facing = unit.attackTarget ? Math.sign(unit.attackTarget.x - unit.x) || 1 : 1;
        ctx.strokeStyle = '#1d211c';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + facing * 10, y - 9); ctx.stroke();
        ctx.strokeStyle = '#4a3a27';
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(x + facing * 5, y - 11); ctx.lineTo(x + facing * 14, y - 10); ctx.stroke();
      }
      if (!dead) {
        this.drawProgressBar(ctx, unit.x - 27, unit.y - 43, 54, unit.health / unit.maxHealth, '#74ad55');
        this.drawProgressBar(ctx, unit.x - 27, unit.y - 36, 54, unit.morale / 100, '#d6b145');
        if (unit.cover > 0.25) {
          ctx.fillStyle = '#d0d8bc';
          ctx.font = 'bold 9px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('CHE CHẮN', unit.x, unit.y - 50);
        }
      }
      ctx.restore();
    }

    drawTank(ctx, tank) {
      const dead = tank.state === 'dead';
      ctx.save();
      ctx.globalAlpha = dead ? 0.4 : 1;
      ctx.translate(tank.x, tank.y);
      if (tank.selected && !dead) {
        ctx.strokeStyle = '#f3dc79';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 8, 39, 12, 0, 0, Math.PI * 2); ctx.stroke();
      }
      const facing = tank.attackTarget ? Math.sign(tank.attackTarget.x - tank.x) || 1 : 1;
      ctx.fillStyle = 'rgba(12,14,11,.3)';
      ctx.beginPath(); ctx.ellipse(0, 9, 43, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#242b23';
      ctx.roundRect(-38, -6, 76, 15, 6); ctx.fill();
      ctx.strokeStyle = '#5f694f'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = tank.flashTime > 0 ? '#8f7652' : '#4b5940';
      ctx.beginPath();
      ctx.moveTo(-32, -24); ctx.lineTo(26, -24); ctx.lineTo(35, -6); ctx.lineTo(-37, -6); ctx.closePath(); ctx.fill();
      for (let i = -28; i <= 28; i += 14) {
        ctx.fillStyle = '#1c211b'; ctx.beginPath(); ctx.arc(i, 1.5, 6.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#667057'; ctx.lineWidth = 1.4; ctx.stroke();
      }
      ctx.fillStyle = '#3d4937';
      ctx.beginPath(); ctx.ellipse(0, -25, 21, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#283027';
      ctx.fillRect(facing > 0 ? 4 : -48, -30, 47, 7);
      ctx.fillStyle = '#171c17';
      ctx.fillRect(facing > 0 ? 47 : -52, -31, 6, 9);
      ctx.fillStyle = '#6e7659';
      ctx.beginPath(); ctx.arc(-5, -31, 4, 0, Math.PI * 2); ctx.fill();
      if (!dead) {
        this.drawProgressBar(ctx, -36, -51, 72, tank.health / tank.maxHealth, '#78aa54');
        ctx.fillStyle = '#eee4bd'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(`ĐẠN ${tank.shotsRemaining}`, 0, -58);
      }
      ctx.restore();
    }

    drawFortress(ctx, structure) {
      if (structure.type === 'defensiveTrench') {
        this.drawEnemyDefensiveTrench(ctx, structure);
        return;
      }
      if (structure.type === 'wire') {
        this.drawWire(ctx, structure);
        return;
      }
      if (structure.type === 'minefield') {
        this.drawMinefield(ctx, structure);
        return;
      }
      const rect = structure.getRect();
      ctx.save();
      ctx.globalAlpha = structure.active ? 1 : 0.45;
      ctx.fillStyle = 'rgba(12,13,11,.28)';
      ctx.beginPath(); ctx.ellipse(structure.x, rect.y + rect.height + 6, structure.width * 0.58, 9, 0, 0, Math.PI * 2); ctx.fill();

      if (structure.type === 'bunker' || structure.type === 'command') {
        const concrete = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.height);
        concrete.addColorStop(0, structure.flashTime > 0 ? '#b9a07e' : '#77796f');
        concrete.addColorStop(1, '#434742');
        ctx.fillStyle = concrete;
        ctx.roundRect(rect.x, rect.y + 10, rect.width, rect.height - 10, 5); ctx.fill();
        ctx.fillStyle = '#85877c';
        ctx.beginPath(); ctx.moveTo(rect.x - 9, rect.y + 13); ctx.lineTo(rect.x + 10, rect.y); ctx.lineTo(rect.x + rect.width - 10, rect.y); ctx.lineTo(rect.x + rect.width + 9, rect.y + 13); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#161a17';
        const slitX = rect.x + rect.width * 0.31;
        const slitY = rect.y + rect.height * 0.45;
        ctx.roundRect(slitX, slitY, rect.width * 0.38, 11, 2); ctx.fill();
        if (structure.type === 'bunker' && structure.flashTime > 0) {
          ctx.fillStyle = '#ffc85b';
          ctx.beginPath();
          ctx.moveTo(slitX - 2, slitY + 5);
          ctx.lineTo(slitX - 15, slitY - 2);
          ctx.lineTo(slitX - 12, slitY + 12);
          ctx.closePath();
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(32,31,28,.45)'; ctx.lineWidth = 1;
        for (let x = rect.x + 12; x < rect.x + rect.width - 8; x += 20) { ctx.beginPath(); ctx.moveTo(x, rect.y + 13); ctx.lineTo(x + 5, rect.y + rect.height - 5); ctx.stroke(); }
      } else if (structure.type === 'machineGun') {
        ctx.fillStyle = '#55594f'; ctx.roundRect(rect.x, rect.y + 12, rect.width, rect.height - 12, 4); ctx.fill();
        ctx.fillStyle = '#242b25'; ctx.beginPath(); ctx.arc(structure.x + 8, structure.y + 10, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(structure.x - 34, structure.y + 6, 45, 6);
        if (structure.flashTime > 0) { ctx.fillStyle = '#ffc45d'; ctx.beginPath(); ctx.arc(structure.x - 38, structure.y + 9, 7, 0, Math.PI * 2); ctx.fill(); }
      } else if (structure.type === 'mortar') {
        ctx.fillStyle = '#394336'; ctx.roundRect(rect.x, rect.y + 18, rect.width, rect.height - 18, 4); ctx.fill();
        ctx.strokeStyle = '#20271f'; ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(structure.x + 5, structure.y + 23); ctx.lineTo(structure.x - 10, structure.y - 8); ctx.stroke();
        ctx.strokeStyle = '#6d765c'; ctx.lineWidth = 2; ctx.stroke();
      } else if (structure.type === 'artillery') {
        ctx.fillStyle = '#3b4536'; ctx.roundRect(rect.x, rect.y + 16, rect.width, rect.height - 16, 5); ctx.fill();
        ctx.fillStyle = '#222921';
        ctx.beginPath(); ctx.arc(structure.x - 19, rect.y + rect.height, 10, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(structure.x + 18, rect.y + rect.height, 10, 0, Math.PI * 2); ctx.fill();
        const angle = structure.aimVX ? Math.atan2(structure.aimVY, structure.aimVX) : Math.PI + 0.18;
        ctx.save(); ctx.translate(structure.x, structure.y + 10); ctx.rotate(angle);
        const barrel = ctx.createLinearGradient(0, 0, 72, 0); barrel.addColorStop(0, '#4f5a45'); barrel.addColorStop(1, '#1f251f');
        ctx.fillStyle = barrel; ctx.roundRect(0, -5, 70, 10, 3); ctx.fill(); ctx.fillStyle = '#151a16'; ctx.fillRect(65, -7, 8, 14); ctx.restore();
      } else if (structure.type === 'enemyTank') {
        ctx.fillStyle = '#43483d';
        ctx.roundRect(rect.x, rect.y + 16, rect.width, rect.height - 16, 7); ctx.fill();
        ctx.fillStyle = '#1d211d';
        ctx.roundRect(rect.x - 3, rect.y + rect.height - 11, rect.width + 6, 15, 7); ctx.fill();
        for (let wx = rect.x + 12; wx < rect.x + rect.width - 5; wx += 18) {
          ctx.fillStyle = '#697061'; ctx.beginPath(); ctx.arc(wx, rect.y + rect.height - 4, 6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#5a6254'; ctx.beginPath(); ctx.ellipse(structure.x, rect.y + 13, 23, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#252b25'; ctx.fillRect(rect.x - 38, rect.y + 8, 47, 7);
        if (structure.flashTime > 0) { ctx.fillStyle = '#ffc45d'; ctx.beginPath(); ctx.arc(rect.x - 42, rect.y + 11, 8, 0, Math.PI * 2); ctx.fill(); }
      } else if (structure.type === 'aircraft') {
        ctx.save(); ctx.translate(structure.x, structure.y + 12);
        ctx.fillStyle = structure.flashTime > 0 ? '#c3a06b' : '#9a9d94';
        ctx.beginPath(); ctx.moveTo(-48, 0); ctx.lineTo(36, -7); ctx.lineTo(49, 0); ctx.lineTo(35, 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#777b73';
        ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-24, -25); ctx.lineTo(12, -4); ctx.lineTo(30, -2); ctx.lineTo(12, 4); ctx.lineTo(-24, 25); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#555a54'; ctx.fillRect(-37, -12, 8, 24); ctx.restore();
      }

      if (structure.status === 'damaged' || structure.status === 'disabled') {
        for (let i = 0; i < 4; i += 1) {
          ctx.fillStyle = `rgba(37,39,36,${0.15 + i * 0.055})`;
          ctx.beginPath(); ctx.arc(structure.x + i * 8 - 14, structure.y - 10 - i * 9, 10 + i * 4, 0, Math.PI * 2); ctx.fill();
        }
      }
      this.drawProgressBar(ctx, structure.x - 38, structure.y - 27, 76, structure.health / structure.maxHealth, '#ad604b');
      ctx.fillStyle = '#f1e8cb'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(structure.name, structure.x, structure.y - 35);
      ctx.restore();
    }

    drawEnemyDefensiveTrench(ctx, trench) {
      const y = this.game.terrain.getHeight(trench.x);
      const left = trench.x - trench.width / 2;
      const right = trench.x + trench.width / 2;
      ctx.save();
      ctx.globalAlpha = trench.active ? 1 : 0.25;

      // Lòng hào chìm và mép đất đắp ở hai phía.
      ctx.strokeStyle = trench.flashTime > 0 ? '#d6a45b' : '#3a2b20';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(left, y - 3);
      ctx.quadraticCurveTo(trench.x, y + 8, right, y - 3);
      ctx.stroke();

      ctx.strokeStyle = '#7b5a37';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(left, y - 10);
      ctx.quadraticCurveTo(trench.x, y - 2, right, y - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(left, y + 2);
      ctx.quadraticCurveTo(trench.x, y + 11, right, y + 2);
      ctx.stroke();

      // Bao cát/cọc gỗ biểu thị đây là tuyến phòng thủ của địch.
      for (let x = left + 12; x < right - 6; x += 22) {
        ctx.fillStyle = '#8b774c';
        ctx.roundRect(x, y - 16 + Math.sin(x * 0.06) * 2, 15, 7, 3);
        ctx.fill();
      }

      this.drawProgressBar(ctx, trench.x - 42, y - 42, 84, trench.health / trench.maxHealth, '#a86a45');
      ctx.fillStyle = '#f1e8cb';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(trench.name, trench.x, y - 49);
      ctx.restore();
    }

    drawWire(ctx, wire) {
      const y = this.game.terrain.getHeight(wire.x);
      ctx.save();
      ctx.globalAlpha = wire.active ? 1 : 0.22;
      ctx.strokeStyle = wire.flashTime > 0 ? '#e5c66d' : '#6a665d';
      ctx.lineWidth = 3;
      const left = wire.x - wire.width / 2;
      const right = wire.x + wire.width / 2;
      for (let row = 0; row < 3; row += 1) {
        ctx.beginPath();
        for (let x = left; x <= right; x += 10) {
          const yy = y - 8 - row * 8 + ((x / 10) % 2 === 0 ? -5 : 5);
          if (x === left) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      this.drawProgressBar(ctx, wire.x - 30, y - 52, 60, wire.health / wire.maxHealth, '#9b5b49');
      ctx.restore();
    }

    drawMinefield(ctx, minefield) {
      const y = this.game.terrain.getHeight(minefield.x);
      const left = minefield.x - minefield.width / 2;
      ctx.save(); ctx.globalAlpha = minefield.active ? 1 : 0.22;
      ctx.fillStyle = 'rgba(92,66,42,.28)'; ctx.fillRect(left, y - 12, minefield.width, 18);
      ctx.strokeStyle = '#b5914b'; ctx.lineWidth = 2;
      for (let x = left + 15; x < left + minefield.width - 10; x += 34) {
        ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + 8, y - 20); ctx.lineTo(x + 16, y - 4); ctx.stroke();
        ctx.fillStyle = '#c9a849'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('!', x + 8, y - 7);
      }
      this.drawProgressBar(ctx, minefield.x - 38, y - 47, 76, minefield.health / minefield.maxHealth, '#a86a45');
      ctx.fillStyle = '#f1e8cb'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText(minefield.name, minefield.x, y - 54);
      ctx.restore();
    }

    drawProjectile(ctx, projectile) {
      const color = projectile.owner === 'enemy' ? '#ff7048' : projectile.getAmmo().color;
      const angle = Math.atan2(projectile.vy, projectile.vx);
      ctx.save();
      ctx.translate(projectile.x, projectile.y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      if (this.game.performanceMode !== 'low') {
        ctx.shadowColor = color;
        ctx.shadowBlur = projectile.owner === 'enemy' ? 10 : 7;
      }
      ctx.beginPath();
      ctx.ellipse(0, 0, projectile.radius * 1.65, projectile.radius * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(230,226,207,.45)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-projectile.radius * 2, 0); ctx.lineTo(-projectile.radius * 5.5, 0); ctx.stroke();
      ctx.restore();
    }

    drawSmokeZones(ctx) {
      this.game.effects.smokeZones.forEach((zone) => {
        if (this.game.performanceMode === 'low') {
          ctx.fillStyle = 'rgba(143,151,143,.28)';
        } else {
          const gradient = ctx.createRadialGradient(zone.x, zone.y, 8, zone.x, zone.y, zone.radius);
          gradient.addColorStop(0, 'rgba(205,210,202,.6)');
          gradient.addColorStop(0.65, 'rgba(126,134,127,.36)');
          gradient.addColorStop(1, 'rgba(90,96,91,0)');
          ctx.fillStyle = gradient;
        }
        ctx.beginPath(); ctx.arc(zone.x, zone.y - 16, zone.radius, 0, Math.PI * 2); ctx.fill();
      });
    }

    drawWarnings(ctx) {
      const now = performance.now() * 0.008;
      this.game.effects.warnings.forEach((warning) => {
        if (warning.triggered) return;
        const pulse = 0.55 + Math.sin(now) * 0.24;
        ctx.save();
        ctx.strokeStyle = `rgba(235,72,47,${pulse})`;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 7]);
        ctx.beginPath(); ctx.arc(warning.x, warning.y, warning.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(138,31,24,.12)';
        ctx.beginPath(); ctx.arc(warning.x, warning.y, warning.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffe0b8'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(`${warning.sourceType === 'mortar' ? 'CỐI' : 'PHÁO'}: ${Math.max(0, warning.time).toFixed(1)}s`, warning.x, warning.y - warning.radius - 10);
        if (Number.isFinite(warning.sourceX) && Number.isFinite(warning.sourceY)) {
          ctx.strokeStyle = 'rgba(238,139,83,.22)'; ctx.lineWidth = 2; ctx.setLineDash([4, 12]);
          ctx.beginPath(); ctx.moveTo(warning.sourceX, warning.sourceY); ctx.lineTo(warning.x, warning.y); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = `rgba(255,155,78,${0.35 + pulse * 0.35})`;
          ctx.beginPath(); ctx.arc(warning.sourceX, warning.sourceY, 8 + pulse * 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      });
    }

    drawParticles(ctx) {
      this.game.effects.particles.forEach((p) => {
        const alpha = NS.clamp((p.life / p.maxLife) * p.alpha, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        if (p.shape === 'square') ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        else { ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.2, p.size), 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      });
    }

    drawFloatingTexts(ctx) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 15px system-ui';
      this.game.effects.floatingTexts.forEach((f) => {
        ctx.save();
        ctx.globalAlpha = f.life / f.maxLife;
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      });
    }

    drawTrajectoryPreview(ctx) {
      const game = this.game;
      if (game.phase !== NS.GamePhase.ARTILLERY || game.firedThisPhase || !game.artillery.active) return;
      const artillery = game.artillery;
      const start = artillery.getMuzzlePosition();
      const radians = artillery.angle * Math.PI / 180;
      let x = start.x;
      let y = start.y;
      let vx = Math.cos(radians) * artillery.power;
      let vy = -Math.sin(radians) * artillery.power;
      ctx.save();
      ctx.fillStyle = 'rgba(245,232,176,.55)';
      for (let i = 0; i < 16; i += 1) {
        const dt = 0.055;
        vx += game.wind * dt;
        vy += NS.Constants.GRAVITY * dt;
        x += vx * dt;
        y += vy * dt;
        if (i % 2 === 0) { ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill(); }
        if (y >= game.terrain.getHeight(x)) break;
      }
      ctx.restore();
    }

    drawSelectionBox(ctx) {
      const box = this.game.selectionBox;
      if (!box) return;
      ctx.save();
      ctx.fillStyle = 'rgba(234,220,142,.12)';
      ctx.strokeStyle = '#eadc8e';
      ctx.lineWidth = 1.5 / this.game.camera.zoom;
      ctx.setLineDash([8 / this.game.camera.zoom, 5 / this.game.camera.zoom]);
      ctx.fillRect(box.x, box.y, box.width, box.height);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.restore();
    }

    drawProgressBar(ctx, x, y, width, ratio, color) {
      ctx.fillStyle = 'rgba(18,18,16,.72)';
      ctx.fillRect(x, y, width, 5);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width * NS.clamp(ratio, 0, 1), 5);
    }

    drawScreenEffects(ctx) {
      if (this.game.effects.muzzleFlash > 0) {
        ctx.save();
        ctx.globalAlpha = this.game.effects.muzzleFlash * 1.25;
        ctx.fillStyle = this.flashGradient || 'rgba(255,225,160,.14)';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();
      }
      if (this.game.performance && this.game.performance.useScreenVignette && this.vignetteGradient) {
        ctx.fillStyle = this.vignetteGradient;
        ctx.fillRect(0, 0, this.width, this.height);
      }
      if (this.game.paused) {
        ctx.save(); ctx.globalAlpha = 0.17; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, this.width, this.height); ctx.restore();
      }
    }

    drawMinimap() {
      const ctx = this.minimapCtx;
      const width = this.minimapCanvas.width;
      const height = this.minimapCanvas.height;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#7d846b';
      ctx.fillRect(0, 0, width, height);
      const sx = width / NS.Constants.WORLD_WIDTH;
      const sy = height / NS.Constants.WORLD_HEIGHT;
      ctx.fillStyle = '#55452f';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= NS.Constants.WORLD_WIDTH; x += 20) ctx.lineTo(x * sx, this.game.terrain.getHeight(x) * sy);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      this.game.squads.forEach((unit) => {
        if (unit.state === 'dead') return;
        ctx.fillStyle = unit.type === 'tank' ? '#d4bd65' : '#8bb267';
        const size = unit.type === 'tank' ? 6 : 4;
        ctx.fillRect(unit.x * sx - size / 2, unit.y * sy - size / 2, size, size);
      });
      ctx.fillStyle = '#ba5a48';
      this.game.fortresses.forEach((item) => { if (item.active) ctx.fillRect(item.x * sx - 2, item.y * sy - 2, 4, 4); });
      const camera = this.game.camera;
      ctx.strokeStyle = '#f5e8ae';
      ctx.lineWidth = 2;
      ctx.strokeRect(camera.x * sx, camera.y * sy, camera.viewportWidth / camera.zoom * sx, camera.viewportHeight / camera.zoom * sy);
    }
  }

  NS.Renderer = Renderer;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
