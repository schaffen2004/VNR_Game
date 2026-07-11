(function (NS) {
  'use strict';

  const SOUND_FILES = Object.freeze({
    fire: 'assets/sounds/artillery-fire.wav',
    enemyFire: 'assets/sounds/enemy-artillery.wav',
    mortar: 'assets/sounds/mortar-fire.wav',
    explosion: 'assets/sounds/explosion.wav',
    machinegun: 'assets/sounds/machinegun.wav',
    rifle: 'assets/sounds/rifle.wav',
    tank: 'assets/sounds/tank-fire.wav',
    warning: 'assets/sounds/warning.wav',
    dig: 'assets/sounds/dig.wav',
    select: 'assets/sounds/select.wav',
    charge: 'assets/sounds/charge.wav',
    victory: 'assets/sounds/victory.wav',
    defeat: 'assets/sounds/defeat.wav',
    deploy: 'assets/sounds/deploy.wav'
  });

  class AudioManager {
    constructor() {
      this.sfxEnabled = true;
      this.musicEnabled = true;
      this.sfxVolume = 0.55;
      this.musicVolume = 0.22;
      this.started = false;
      this.cache = new Map();
      this.ambient = null;
    }

    configure() { /* Canvas 2D CPU/RAM mode: không tải thư viện âm thanh ngoài. */ }

    init() {
      if (this.started) return;
      this.started = true;
      this.ambient = new Audio('assets/sounds/battle-ambient.wav');
      this.ambient.loop = true;
      this.ambient.preload = 'none';
      this.ambient.volume = this.musicVolume;
    }

    resume() {
      this.init();
      if (this.musicEnabled && this.ambient && this.ambient.paused) {
        this.ambient.volume = this.musicVolume;
        const promise = this.ambient.play();
        if (promise && typeof promise.catch === 'function') promise.catch(() => {});
      }
    }

    pauseMusic() {
      if (this.ambient && !this.ambient.paused) this.ambient.pause();
    }

    setEnabled(enabled) { this.setSfxEnabled(enabled); }
    setVolume(value) { this.setSfxVolume(value); }

    setSfxEnabled(enabled) {
      this.sfxEnabled = Boolean(enabled);
    }

    setMusicEnabled(enabled) {
      this.musicEnabled = Boolean(enabled);
      this.init();
      if (this.musicEnabled) this.resume(); else this.pauseMusic();
    }

    setSfxVolume(value) {
      this.sfxVolume = NS.clamp(Number(value) || 0, 0, 1);
    }

    setMusicVolume(value) {
      this.musicVolume = NS.clamp(Number(value) || 0, 0, 1);
      if (this.ambient) this.ambient.volume = this.musicVolume;
    }

    getAudio(name) {
      if (!SOUND_FILES[name]) return null;
      let audio = this.cache.get(name);
      if (!audio) {
        audio = new Audio(SOUND_FILES[name]);
        audio.preload = 'none';
        this.cache.set(name, audio);
      }
      return audio;
    }

    play(name) {
      if (!this.sfxEnabled) return;
      this.init();
      const base = this.getAudio(name);
      if (!base) return;
      let audio = base;
      if (!base.paused && base.currentTime > 0) audio = base.cloneNode(false);
      audio.volume = this.sfxVolume;
      try { audio.currentTime = 0; } catch (error) { /* bỏ qua */ }
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    }
  }

  NS.AudioManager = AudioManager;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
