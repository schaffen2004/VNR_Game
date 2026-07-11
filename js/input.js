(function (NS) {
  'use strict';

  class InputManager {
    constructor(game, canvas) {
      this.game = game;
      this.canvas = canvas;
      this.keys = new Set();
      this.pointerDown = false;
      this.pointerButton = 0;
      this.startScreen = null;
      this.startWorld = null;
      this.lastScreen = null;
      this.draggingCamera = false;
      this.selectionDragging = false;
      this.touchPointers = new Map();
      this.lastPinchDistance = null;
      this.bindEvents();
    }

    bindEvents() {
      window.addEventListener('keydown', (event) => this.onKeyDown(event));
      window.addEventListener('keyup', (event) => this.keys.delete(event.code));
      window.addEventListener('blur', () => this.keys.clear());
      window.addEventListener('resize', () => this.game.renderer.resize());

      this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
      this.canvas.addEventListener('pointerdown', (event) => this.onPointerDown(event));
      this.canvas.addEventListener('pointermove', (event) => this.onPointerMove(event));
      this.canvas.addEventListener('pointerup', (event) => this.onPointerUp(event));
      this.canvas.addEventListener('pointercancel', (event) => this.onPointerUp(event));
      this.canvas.addEventListener('wheel', (event) => this.onWheel(event), { passive: false });

      this.bindControls();
    }

    bindControls() {
      // Các nút HUD được nối một lần trong main.js để tránh gọi lệnh hai lần.
      // InputManager chỉ phụ trách điều khiển trực tiếp trên Canvas và minimap.
      const minimap = document.getElementById('minimap-canvas');
      if (minimap) {
        minimap.addEventListener('click', (event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / Math.max(1, rect.width) * NS.Constants.WORLD_WIDTH;
          const y = (event.clientY - rect.top) / Math.max(1, rect.height) * NS.Constants.WORLD_HEIGHT;
          this.game.camera.focus(x, y);
        });
      }
    }

    update(dt) {
      if (!this.game.running || this.game.paused) return;
      const panSpeed = 470 * dt;
      if (this.keys.has('KeyA')) this.game.camera.pan(-panSpeed, 0);
      if (this.keys.has('KeyD')) this.game.camera.pan(panSpeed, 0);
    }

    onKeyDown(event) {
      const targetTag = event.target && event.target.tagName;
      if (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'TEXTAREA') return;
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(event.code)) event.preventDefault();
      this.keys.add(event.code);
      if (!this.game.running) return;

      switch (event.code) {
        case 'KeyW':
          this.game.camera.setZoom(this.game.camera.zoom + 0.08, this.game.camera.viewportWidth / 2, this.game.camera.viewportHeight / 2);
          break;
        case 'KeyS':
          this.game.camera.setZoom(this.game.camera.zoom - 0.08, this.game.camera.viewportWidth / 2, this.game.camera.viewportHeight / 2);
          break;
        case 'ArrowLeft':
          this.game.setArtilleryAim(this.game.artillery.angle - 1, this.game.artillery.power);
          break;
        case 'ArrowRight':
          this.game.setArtilleryAim(this.game.artillery.angle + 1, this.game.artillery.power);
          break;
        case 'ArrowUp':
          this.game.setArtilleryAim(this.game.artillery.angle, this.game.artillery.power + 5);
          break;
        case 'ArrowDown':
          this.game.setArtilleryAim(this.game.artillery.angle, this.game.artillery.power - 5);
          break;
        case 'Space':
          this.game.fireArtillery();
          break;
        case 'Tab':
          this.game.selectNextUnit();
          break;
        case 'KeyE':
          this.game.endCurrentPhase();
          break;
        case 'KeyT':
          this.game.setCommandMode('dig');
          break;
        case 'KeyM':
          this.game.setCommandMode('move');
          break;
        case 'KeyF':
          this.game.setCommandMode('attack');
          break;
        case 'KeyR':
          this.game.setCommandMode('retreat');
          break;
        case 'Escape':
          if (this.game.selectionBox) this.game.selectionBox = null;
          else this.game.togglePause(!this.game.paused);
          break;
        default:
          break;
      }
    }

    getScreenPoint(event) {
      const rect = this.canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    onPointerDown(event) {
      if (!this.game.running || this.game.paused) return;
      this.canvas.setPointerCapture(event.pointerId);
      const screen = this.getScreenPoint(event);
      const world = this.game.camera.screenToWorld(screen.x, screen.y);
      this.pointerDown = true;
      this.pointerButton = event.button;
      this.startScreen = screen;
      this.lastScreen = screen;
      this.startWorld = world;
      this.selectionDragging = false;
      this.draggingCamera = event.button === 1 || event.pointerType === 'touch';

      if (event.pointerType === 'touch') {
        this.touchPointers.set(event.pointerId, screen);
        if (this.touchPointers.size === 2) {
          const points = Array.from(this.touchPointers.values());
          this.lastPinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        }
      }

      if (event.button === 2) {
        this.game.issueCommand(world.x, world.y);
        this.pointerDown = false;
      }
    }

    onPointerMove(event) {
      if (!this.game.running || this.game.paused) return;
      const screen = this.getScreenPoint(event);
      if (event.pointerType === 'touch' && this.touchPointers.has(event.pointerId)) {
        this.touchPointers.set(event.pointerId, screen);
        if (this.touchPointers.size === 2) {
          const points = Array.from(this.touchPointers.values());
          const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
          const centerX = (points[0].x + points[1].x) / 2;
          const centerY = (points[0].y + points[1].y) / 2;
          if (this.lastPinchDistance) this.game.camera.setZoom(this.game.camera.zoom * (distance / this.lastPinchDistance), centerX, centerY);
          this.lastPinchDistance = distance;
          return;
        }
      }
      if (!this.pointerDown || !this.lastScreen) return;
      const dx = screen.x - this.lastScreen.x;
      const dy = screen.y - this.lastScreen.y;
      const totalDistance = Math.hypot(screen.x - this.startScreen.x, screen.y - this.startScreen.y);

      if (this.draggingCamera) {
        if (totalDistance > 5) this.game.camera.pan(-dx, -dy);
      } else if (this.pointerButton === 0 && totalDistance > 6) {
        this.selectionDragging = true;
        const currentWorld = this.game.camera.screenToWorld(screen.x, screen.y);
        this.game.selectionBox = {
          x: Math.min(this.startWorld.x, currentWorld.x),
          y: Math.min(this.startWorld.y, currentWorld.y),
          width: Math.abs(currentWorld.x - this.startWorld.x),
          height: Math.abs(currentWorld.y - this.startWorld.y)
        };
      }
      this.lastScreen = screen;
    }

    onPointerUp(event) {
      const screen = this.getScreenPoint(event);
      const world = this.game.camera.screenToWorld(screen.x, screen.y);
      if (event.pointerType === 'touch') {
        this.touchPointers.delete(event.pointerId);
        if (this.touchPointers.size < 2) this.lastPinchDistance = null;
      }
      if (!this.pointerDown) return;
      const totalDistance = this.startScreen ? Math.hypot(screen.x - this.startScreen.x, screen.y - this.startScreen.y) : 0;
      if (this.selectionDragging && this.game.selectionBox) {
        this.game.selectInBox(this.game.selectionBox);
      } else if (totalDistance < 7 && this.pointerButton === 0) {
        const selected = this.game.selectAt(world.x, world.y, event.shiftKey);
        if (!selected && event.pointerType === 'touch' && this.game.phase === NS.GamePhase.COMMAND && this.game.getSelectedSquads().length) {
          this.game.issueCommand(world.x, world.y);
        }
      }
      this.game.selectionBox = null;
      this.pointerDown = false;
      this.draggingCamera = false;
      this.selectionDragging = false;
      this.startScreen = null;
      this.startWorld = null;
      this.lastScreen = null;
    }

    onWheel(event) {
      event.preventDefault();
      if (!this.game.running) return;
      const screen = this.getScreenPoint(event);
      const factor = event.deltaY < 0 ? 1.1 : 0.9;
      this.game.camera.setZoom(this.game.camera.zoom * factor, screen.x, screen.y);
    }
  }

  NS.InputManager = InputManager;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
