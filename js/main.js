(function (NS) {
  'use strict';

  const screens = {
    menu: document.getElementById('main-menu'),
    missions: document.getElementById('mission-screen'),
    detail: document.getElementById('mission-detail-screen'),
    shop: document.getElementById('shop-screen'),
    equipment: document.getElementById('equipment-screen'),
    history: document.getElementById('history-screen'),
    settings: document.getElementById('settings-screen'),
    game: document.getElementById('game-screen'),
    help: document.getElementById('help-screen'),
    quiz: document.getElementById('quiz-screen'),
    pause: document.getElementById('pause-screen'),
    result: document.getElementById('result-screen')
  };

  const baseNames = ['menu', 'missions', 'detail', 'shop', 'equipment', 'history', 'settings', 'game'];
  const canvas = document.getElementById('game-canvas');
  const minimapCanvas = document.getElementById('minimap-canvas');
  const game = new NS.Game(canvas, minimapCanvas);
  window.DuongToiChienThangGame = game;
  game.loadSettings();
  game.setPerformanceMode('low', false);

  let profile = NS.Campaign.loadProfile();
  let selectedMissionId = profile.selectedMission || 'him-lam';
  let selectedLevel = NS.Difficulty[profile.selectedLevel] ? profile.selectedLevel : 'easy';
  let helpReturn = 'menu';
  let tutorialIndex = 0;
  let currentQuestion = null;
  let quizMultiplier = 1;
  let quizCorrect = true;

  function formatCoins(value) {
    return Math.max(0, Math.round(Number(value) || 0)).toLocaleString('vi-VN');
  }

  function setBaseScreen(name) {
    baseNames.forEach((key) => screens[key].classList.toggle('screen--active', key === name));
    ['help', 'quiz', 'pause', 'result'].forEach((key) => screens[key].classList.remove('screen--active'));
    if (name !== 'game') {
      game.paused = false;
      if (game.running) game.running = false;
    }
  }

  function refreshWallet() {
    document.getElementById('wallet-value').textContent = formatCoins(profile.coins);
    document.querySelectorAll('.wallet-mirror').forEach((node) => { node.textContent = formatCoins(profile.coins); });
  }

  function refreshProfile() {
    profile = NS.Campaign.loadProfile();
    refreshWallet();
    renderMissionList();
    renderShop();
    renderEquipment();
    renderHistory();
    refreshSettings();
    refreshContinueButton();
  }

  function renderMissionList() {
    const container = document.getElementById('mission-list');
    container.innerHTML = NS.CampaignMissions.map((mission) => {
      const completed = profile.completedMissions.includes(mission.id);
      const unlocked = NS.Campaign.isMissionUnlocked(profile, mission.id);
      const map = NS.getMapConfig(mission.id);
      const status = completed ? '★ Đã chiến thắng' : (unlocked ? 'Sẵn sàng tác chiến' : '🔒 Chưa mở khóa');
      return `<article class="mission-card ${completed ? 'is-completed' : ''} ${unlocked ? '' : 'is-locked'}">
        <div class="mission-card__number">${mission.order}</div>
        <div class="mission-card__body">
          <div class="mission-card__status">${status}</div>
          <h3>${mission.name}</h3><p class="mission-card__subtitle">${mission.subtitle} · ${mission.period}</p>
          <p>${mission.description}</p>
          <div class="mission-route-mini">${map.route.map((item) => `<span>${item}</span>`).join('<b>→</b>')}</div>
          <div class="mission-card__reward"><span class="vnd-coin vnd-coin--small">★</span> Thưởng cơ bản ${formatCoins(mission.reward)} xu</div>
        </div>
        <button class="button button--primary mission-detail-button" data-mission-id="${mission.id}" ${unlocked ? '' : 'disabled'}>${unlocked ? 'Xem bản đồ' : 'Hoàn thành màn trước'}</button>
      </article>`;
    }).join('');
    container.querySelectorAll('.mission-detail-button').forEach((button) => {
      button.addEventListener('click', () => openMissionDetail(button.dataset.missionId));
    });
  }

  function openMissionDetail(missionId) {
    selectedMissionId = missionId;
    const mission = NS.Campaign.getMission(missionId);
    document.getElementById('detail-mission-name').textContent = mission.name;
    document.getElementById('detail-period').textContent = `${mission.subtitle} · ${mission.period}`;
    document.getElementById('detail-description').textContent = mission.description;
    document.getElementById('detail-history').textContent = mission.historicalSummary;
    document.getElementById('detail-map-caption').textContent = mission.mapCaption;
    document.querySelectorAll('.level-option').forEach((button) => button.classList.toggle('is-selected', button.dataset.level === selectedLevel));
    drawMissionPreview(missionId);
    setBaseScreen('detail');
  }

  function drawMissionPreview(missionId) {
    const preview = document.getElementById('mission-preview-canvas');
    const ctx = preview.getContext('2d', { alpha: false });
    const width = preview.width;
    const height = preview.height;
    const map = NS.getMapConfig(missionId);
    const terrain = new NS.Terrain(NS.Constants.WORLD_WIDTH, NS.Constants.WORLD_HEIGHT, 10, map);
    const sx = width / NS.Constants.WORLD_WIDTH;
    const sy = 0.36;
    ctx.fillStyle = '#6d7763'; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#87927b';
    ctx.beginPath(); ctx.moveTo(0, height);
    for (let x = 0; x <= NS.Constants.WORLD_WIDTH; x += 20) ctx.lineTo(x * sx, 60 + terrain.getHeight(x) * sy);
    ctx.lineTo(width, height); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#60452f';
    ctx.beginPath(); ctx.moveTo(0, height);
    for (let x = 0; x <= NS.Constants.WORLD_WIDTH; x += 20) ctx.lineTo(x * sx, 72 + terrain.getHeight(x) * sy);
    ctx.lineTo(width, height); ctx.closePath(); ctx.fill();

    map.landmarks.forEach((zone, index) => {
      const x1 = zone.from * sx;
      const x2 = zone.to * sx;
      const mid = (x1 + x2) / 2;
      const groundY = 63 + terrain.getHeight((zone.from + zone.to) / 2) * sy;
      const colors = { river: '#40839b', bridge: '#9b8a67', dugout: '#4a3828', forest: '#38583a', minefield: '#8b6037', obstacleBelt: '#725136', runway: '#7c7a72', hill: '#6d5a3d', basin: '#6f654c', openSlope: '#92734d', approachTrench: '#4a3828' };
      ctx.fillStyle = colors[zone.type] || (index % 2 ? 'rgba(250,220,130,.12)' : 'rgba(255,255,255,.06)');
      ctx.fillRect(x1, Math.max(40, groundY - 15), Math.max(4, x2 - x1), 14);
      const labelX = mid + (Number(zone.labelOffsetX) || 0) * sx;
      const labelY = 14 + (index % 2) * 30 + (Number(zone.labelOffsetY) || 0) * 0.45;
      ctx.fillStyle = 'rgba(74,5,15,.88)'; ctx.fillRect(labelX - 49, labelY, 98, 22);
      ctx.fillStyle = '#ffe56e'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(zone.label, labelX, labelY + 15);
    });

    map.fortresses.forEach((item) => {
      const x = item.x * sx;
      const groundY = 65 + terrain.getHeight(item.x) * sy;
      const y = item.type === 'aircraft' ? groundY - (Number(item.altitude) || 165) * sy : groundY;
      ctx.fillStyle = item.type === 'wire' ? '#b7ada0' : item.type === 'minefield' ? '#bc8d42' : item.type === 'command' ? '#d9c3a1' : item.type === 'enemyTank' ? '#5d684f' : '#454942';
      if (item.type === 'wire') {
        ctx.strokeStyle = '#d6d0c5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x - 6, y - 12); ctx.lineTo(x, y); ctx.lineTo(x + 6, y - 12); ctx.lineTo(x + 12, y); ctx.stroke();
      } else if (item.type === 'minefield') {
        ctx.beginPath(); ctx.ellipse(x, y - 4, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
      } else if (item.type === 'aircraft') {
        ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x + 18, y - 3); ctx.lineTo(x + 22, y); ctx.lineTo(x + 18, y + 3); ctx.closePath(); ctx.fill();
        ctx.fillRect(x - 7, y - 11, 14, 22);
      } else if (item.type === 'enemyTank') {
        ctx.fillRect(x - 15, y - 12, 30, 12); ctx.fillRect(x - 8, y - 18, 16, 7); ctx.fillRect(x - 24, y - 16, 18, 3);
      } else if (item.type === 'artillery') {
        ctx.beginPath(); ctx.arc(x - 6, y - 4, 5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(x + 6, y - 4, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(x - 22, y - 14, 28, 4);
      } else {
        ctx.fillRect(x - 8, y - 18, 16, 18);
      }
    });
    const flagX = map.flagX * sx;
    const flagY = 65 + terrain.getHeight(map.flagX) * sy;
    ctx.strokeStyle = '#2d2d28'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(flagX, flagY); ctx.lineTo(flagX, flagY - 48); ctx.stroke();
    ctx.fillStyle = '#c8102e'; ctx.fillRect(flagX + 2, flagY - 47, 32, 20);
    ctx.fillStyle = '#ffdf3d'; ctx.font = '16px serif'; ctx.fillText('★', flagX + 18, flagY - 31);
  }

  function renderShop() {
    const container = document.getElementById('shop-list');
    container.innerHTML = NS.ShopItems.map((item) => {
      const state = NS.Campaign.getItemState(profile, item);
      const price = NS.Campaign.getItemPrice(profile, item);
      return `<article class="shop-card ${state.owned ? 'is-owned' : ''}">
        <div class="shop-card__icon">${item.icon}</div><h3>${item.name}</h3><p>${item.description}</p>
        <strong class="shop-card__level">Cấp ${state.level}/${state.max} · ${NS.Campaign.getItemValue(profile, item)}</strong>
        <button class="button ${state.owned ? '' : 'button--primary'} shop-buy-button" data-item-id="${item.id}" ${state.owned ? 'disabled' : ''}>
          ${state.owned ? 'Đã đạt tối đa' : `<span class="vnd-coin vnd-coin--tiny">★</span> ${formatCoins(price)} xu`}
        </button>
      </article>`;
    }).join('');
    container.querySelectorAll('.shop-buy-button:not(:disabled)').forEach((button) => {
      button.addEventListener('click', () => {
        const result = NS.Campaign.buy(profile, button.dataset.itemId);
        const message = document.getElementById('shop-message');
        message.textContent = result.message;
        message.className = `status-message ${result.ok ? 'is-success' : 'is-error'}`;
        refreshProfile();
      });
    });
  }

  function renderEquipment() {
    const tankMax = profile.purchases.tankCount;
    const infantryMax = NS.Campaign.getMaxInfantryPerSquad(profile);
    const ammo = NS.createInitialAmmo(profile);
    document.getElementById('equipment-list').innerHTML = `
      <article class="equipment-card is-unlocked"><div class="equipment-card__icon">▰</div><div><h3>Xe tăng yểm trợ</h3><p>Đã mua ${tankMax} xe, mỗi xe ${NS.Campaign.getTankMaxShells(profile)} viên đạn. Chọn số xe mang vào trận.</p>
        <div class="equipment-control"><button class="button loadout-step" data-field="tanks" data-delta="-1">−</button><output id="loadout-tanks-value">${profile.loadout.tanks}/${tankMax} xe</output><button class="button loadout-step" data-field="tanks" data-delta="1">+</button></div></div></article>
      <article class="equipment-card is-unlocked"><div class="equipment-card__icon">♟</div><div><h3>Bộ binh</h3><p>Bốn đơn vị tác chiến. Quân số tối đa đã mua: ${infantryMax} người/đơn vị.</p>
        <div class="equipment-control"><button class="button loadout-step" data-field="infantryPerSquad" data-delta="-1">−</button><output id="loadout-infantry-value">${profile.loadout.infantryPerSquad}/${infantryMax} người</output><button class="button loadout-step" data-field="infantryPerSquad" data-delta="1">+</button></div></div></article>
      <article class="equipment-card is-unlocked"><div class="equipment-card__icon">✦</div><div><h3>Lựu pháo 105 mm</h3><p>Cơ số đạn hiện có theo từng loại:</p><div class="equipment-ammo-grid">${Object.keys(ammo).map((key) => `<span><b>${NS.AmmoTypes[key].symbol}</b><br>${ammo[key]} viên</span>`).join('')}</div></div></article>
      <article class="equipment-card is-unlocked"><div class="equipment-card__icon">⛏</div><div><h3>Công binh và hầm trú ẩn</h3><p>Chọn tối đa bốn tổ bộ binh cùng đào một hầm chìm dưới mặt đất. Khi hoàn thành, các tổ được chọn tự chui xuống hầm và nhận che chắn cao.</p><strong>Luôn có trong biên chế</strong></div></article>`;
    document.querySelectorAll('.loadout-step').forEach((button) => {
      button.addEventListener('click', () => {
        const field = button.dataset.field;
        const delta = Number(button.dataset.delta) || 0;
        const next = Number(profile.loadout[field]) + delta;
        profile = NS.Campaign.updateLoadout(profile, { [field]: next });
        renderEquipment();
      });
    });
  }

  function renderHistory() {
    const container = document.getElementById('history-list');
    if (!profile.history.length) {
      container.innerHTML = '<div class="empty-state"><strong>Chưa có lần chơi nào</strong><p>Tên cứ điểm, thời điểm, kết quả và level sẽ được lưu tại đây.</p></div>';
      return;
    }
    container.innerHTML = profile.history.map((entry) => {
      const date = new Date(entry.date);
      const dateText = Number.isNaN(date.getTime()) ? 'Không rõ thời gian' : date.toLocaleString('vi-VN');
      return `<article class="history-row ${entry.victory ? 'is-victory' : 'is-defeat'}"><div class="history-row__mark">${entry.victory ? '★' : '×'}</div><div><strong>${entry.missionName}</strong><small>${dateText}</small></div><div><span>${entry.victory ? 'Chiến thắng' : 'Thất bại'}</span><small>Level ${entry.levelLabel || entry.level} · ${entry.turns} lượt</small></div><div><strong>${entry.score} điểm</strong><small>${entry.reward ? `+${formatCoins(entry.reward)} xu` : 'Không có thưởng'}</small></div></article>`;
    }).join('');
  }

  function renderMissionRules() {
    document.getElementById('mission-rules-list').innerHTML = NS.CampaignMissions.map((mission) => `<article><h3>${mission.order}. ${mission.name}</h3><p>${mission.mapCaption}</p><p>${mission.historicalSummary}</p></article>`).join('');
  }

  function requestTurnQuiz() {
    if (!game.running || game.result || game.phase !== NS.GamePhase.OBSERVATION || screens.quiz.classList.contains('screen--active')) return;
    profile = NS.Campaign.loadProfile();
    currentQuestion = NS.Campaign.getRandomQuestion(profile, game.difficulty);
    if (!currentQuestion) { game.beginAttackTurn(1, true); return; }
    quizMultiplier = 1;
    quizCorrect = true;
    document.getElementById('quiz-level-label').textContent = `Level ${NS.Difficulty[game.difficulty].label}`;
    document.getElementById('quiz-turn-label').textContent = `Lượt ${game.turn}`;
    document.getElementById('quiz-mission-title').textContent = game.missionConfig.name;
    document.getElementById('quiz-question').textContent = currentQuestion.question;
    document.getElementById('quiz-feedback').textContent = 'Chọn một đáp án. Mỗi lượt chỉ được trả lời một lần.';
    document.getElementById('quiz-feedback').className = 'status-message';
    document.getElementById('quiz-explanation').textContent = '';
    document.getElementById('quiz-continue-button').hidden = true;
    document.getElementById('quiz-cancel-button').hidden = false;
    const options = document.getElementById('quiz-options');
    options.innerHTML = Object.entries(currentQuestion.options).map(([key, value]) => `<button class="quiz-option" data-answer="${key}"><span>${key}</span>${value}</button>`).join('');
    options.querySelectorAll('.quiz-option').forEach((button) => button.addEventListener('click', () => answerTurnQuiz(button.dataset.answer, button)));
    screens.quiz.classList.add('screen--active');
  }

  function answerTurnQuiz(answer, button) {
    if (!currentQuestion || !document.getElementById('quiz-continue-button').hidden) return;
    quizCorrect = answer === currentQuestion.answer;
    quizMultiplier = quizCorrect ? 1 : 0.5;
    document.querySelectorAll('.quiz-option').forEach((node) => {
      node.disabled = true;
      if (node.dataset.answer === currentQuestion.answer) node.classList.add('is-correct');
    });
    if (!quizCorrect) button.classList.add('is-wrong');
    const feedback = document.getElementById('quiz-feedback');
    feedback.textContent = quizCorrect ? 'Chính xác — lực tấn công giữ 100%.' : 'Chưa đúng — lực tấn công trong lượt này giảm còn 50%.';
    feedback.className = `status-message ${quizCorrect ? 'is-success' : 'is-error'}`;
    document.getElementById('quiz-explanation').textContent = currentQuestion.explanation || '';
    document.getElementById('quiz-continue-button').hidden = false;
    document.getElementById('quiz-cancel-button').hidden = true;
  }

  function continueAfterQuiz() {
    screens.quiz.classList.remove('screen--active');
    game.beginAttackTurn(quizMultiplier, quizCorrect);
    currentQuestion = null;
  }

  function startMission() {
    if (!NS.Campaign.isMissionUnlocked(profile, selectedMissionId)) {
      window.alert('Cần hoàn thành màn trước để mở khóa cứ điểm này.');
      setBaseScreen('missions');
      return;
    }
    profile.selectedMission = selectedMissionId;
    profile.selectedLevel = selectedLevel;
    profile = NS.Campaign.saveProfile(profile);
    game.initNewGame(selectedLevel, selectedMissionId);
    setBaseScreen('game');
    game.start();
    startTutorialIfNeeded();
  }

  function refreshSettings() {
    const musicEnabled = document.getElementById('music-enabled-input');
    if (!musicEnabled) return;
    musicEnabled.checked = game.audio.musicEnabled;
    document.getElementById('sfx-enabled-input').checked = game.audio.sfxEnabled;
    document.getElementById('music-volume-input').value = game.audio.musicVolume;
    document.getElementById('sfx-volume-input').value = game.audio.sfxVolume;
    document.getElementById('music-volume-value').textContent = `${Math.round(game.audio.musicVolume * 100)}%`;
    document.getElementById('sfx-volume-value').textContent = `${Math.round(game.audio.sfxVolume * 100)}%`;
  }

  function showHelp(show, fromGame) {
    if (show) { helpReturn = fromGame ? 'game' : 'menu'; screens.help.classList.add('screen--active'); if (fromGame) game.paused = true; }
    else { screens.help.classList.remove('screen--active'); if (helpReturn === 'game') game.paused = false; }
  }

  function showPause(show) { screens.pause.classList.toggle('screen--active', Boolean(show)); }

  function showResult(victory, reason, stats) {
    document.getElementById('result-title').textContent = victory ? 'Chiến thắng' : 'Thất bại';
    document.getElementById('result-reason').textContent = reason;
    document.getElementById('result-stats').innerHTML = Object.entries(stats).map(([key, value]) => `<div class="result-stat"><span>${key}</span><strong>${value}</strong></div>`).join('');
    screens.result.classList.add('screen--active');
    refreshProfile();
  }

  function updateSoundButtons(enabled) { document.getElementById('sound-button').textContent = enabled ? '🔊' : '🔇'; }
  function hasSave() { try { return Boolean(localStorage.getItem(NS.Constants.STORAGE_KEY)); } catch (error) { return false; } }
  function refreshContinueButton() { document.getElementById('continue-button').hidden = !hasSave(); }

  function startTutorialIfNeeded() {
    try { if (localStorage.getItem(NS.Constants.TUTORIAL_KEY)) return; } catch (error) { return; }
    tutorialIndex = 0; renderTutorialStep();
  }

  function renderTutorialStep() {
    const step = NS.TutorialSteps[tutorialIndex];
    const popover = document.getElementById('tutorial-popover');
    if (!step) { completeTutorial(); return; }
    document.getElementById('tutorial-title').textContent = step[0];
    document.getElementById('tutorial-text').textContent = step[1];
    popover.hidden = false;
  }

  function completeTutorial() {
    document.getElementById('tutorial-popover').hidden = true;
    try { localStorage.setItem(NS.Constants.TUTORIAL_KEY, '1'); } catch (error) { /* bỏ qua */ }
  }

  // Điều hướng chính
  document.getElementById('play-menu-button').addEventListener('click', () => { game.audio.resume(); setBaseScreen('missions'); });
  document.getElementById('shop-menu-button').addEventListener('click', () => { game.audio.resume(); setBaseScreen('shop'); });
  document.getElementById('equipment-menu-button').addEventListener('click', () => { game.audio.resume(); setBaseScreen('equipment'); });
  document.getElementById('history-menu-button').addEventListener('click', () => setBaseScreen('history'));
  document.getElementById('settings-menu-button').addEventListener('click', () => { game.audio.resume(); refreshSettings(); setBaseScreen('settings'); });
  document.querySelectorAll('.back-home-button').forEach((button) => button.addEventListener('click', () => { refreshProfile(); setBaseScreen('menu'); }));
  document.getElementById('back-missions-button').addEventListener('click', () => setBaseScreen('missions'));
  document.getElementById('start-mission-button').addEventListener('click', startMission);
  document.querySelectorAll('.level-option').forEach((button) => button.addEventListener('click', () => {
    selectedLevel = button.dataset.level;
    document.querySelectorAll('.level-option').forEach((node) => node.classList.toggle('is-selected', node === button));
  }));

  // Hướng dẫn, cài đặt, lịch sử
  document.getElementById('help-button').addEventListener('click', () => showHelp(true, false));
  document.getElementById('game-help-button').addEventListener('click', () => showHelp(true, true));
  document.getElementById('close-help-button').addEventListener('click', () => showHelp(false));
  document.getElementById('clear-history-button').addEventListener('click', () => { profile.history = []; profile = NS.Campaign.saveProfile(profile); renderHistory(); });
  document.getElementById('music-enabled-input').addEventListener('change', (event) => { game.audio.setMusicEnabled(event.target.checked); game.saveSettings(); });
  document.getElementById('sfx-enabled-input').addEventListener('change', (event) => { game.audio.setSfxEnabled(event.target.checked); game.soundEnabled = event.target.checked; updateSoundButtons(event.target.checked); game.saveSettings(); });
  document.getElementById('music-volume-input').addEventListener('input', (event) => { game.audio.setMusicVolume(event.target.value); document.getElementById('music-volume-value').textContent = `${Math.round(event.target.value * 100)}%`; game.saveSettings(); });
  document.getElementById('sfx-volume-input').addEventListener('input', (event) => { game.audio.setSfxVolume(event.target.value); document.getElementById('sfx-volume-value').textContent = `${Math.round(event.target.value * 100)}%`; game.saveSettings(); });
  document.getElementById('test-sound-button').addEventListener('click', () => game.audio.play('fire'));
  document.getElementById('reset-progress-button').addEventListener('click', () => {
    if (!window.confirm('Đặt lại toàn bộ xu, nâng cấp, biên chế và lịch sử chơi?')) return;
    profile = NS.Campaign.resetProfile(); refreshProfile(); setBaseScreen('menu');
  });

  // Câu hỏi lượt
  document.getElementById('quiz-cancel-button').addEventListener('click', () => { screens.quiz.classList.remove('screen--active'); currentQuestion = null; });
  document.getElementById('quiz-continue-button').addEventListener('click', continueAfterQuiz);

  // HUD game
  document.getElementById('angle-input').addEventListener('input', (event) => game.setArtilleryAim(Number(event.target.value), game.artillery.power));
  document.getElementById('power-input').addEventListener('input', (event) => game.setArtilleryAim(game.artillery.angle, Number(event.target.value)));
  document.getElementById('ammo-select').addEventListener('change', (event) => { if (NS.AmmoTypes[event.target.value]) game.selectedAmmo = event.target.value; game.updateHUD(true); });
  document.getElementById('fire-button').addEventListener('click', () => game.fireArtillery());
  document.getElementById('focus-artillery-button').addEventListener('click', () => game.camera.focus(game.artillery.x, game.artillery.y - 120));
  document.getElementById('end-phase-button').addEventListener('click', () => game.endCurrentPhase());
  document.getElementById('pause-button').addEventListener('click', () => game.togglePause(true));
  document.getElementById('save-button').addEventListener('click', () => game.saveGame(true));
  document.getElementById('sound-button').addEventListener('click', () => game.toggleSound());
  document.querySelectorAll('.command-button').forEach((button) => button.addEventListener('click', () => game.setCommandMode(button.dataset.command)));
  document.getElementById('unit-list').addEventListener('click', (event) => { const row = event.target.closest('[data-unit-id]'); if (row) game.selectUnitById(row.dataset.unitId); });

  // Pause, kết quả, tiếp tục
  document.getElementById('resume-button').addEventListener('click', () => game.togglePause(false));
  document.getElementById('restart-button').addEventListener('click', () => { screens.pause.classList.remove('screen--active'); game.resetGame(); game.start(); });
  document.getElementById('back-menu-button').addEventListener('click', () => { game.running = false; screens.pause.classList.remove('screen--active'); refreshProfile(); setBaseScreen('menu'); });
  document.getElementById('result-restart-button').addEventListener('click', () => { screens.result.classList.remove('screen--active'); game.resetGame(); setBaseScreen('game'); game.start(); });
  document.getElementById('result-menu-button').addEventListener('click', () => { screens.result.classList.remove('screen--active'); refreshProfile(); setBaseScreen('menu'); });
  document.getElementById('continue-button').addEventListener('click', () => { if (game.loadGame()) { selectedMissionId = game.currentMissionId; selectedLevel = game.difficulty; setBaseScreen('game'); game.start(); } });

  // Tutorial
  document.getElementById('tutorial-next-button').addEventListener('click', () => { tutorialIndex += 1; renderTutorialStep(); });
  document.getElementById('tutorial-skip-button').addEventListener('click', completeTutorial);

  window.addEventListener('beforeunload', () => { if (game.running && !game.result) game.saveGame(false); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && game.running && !game.result) game.saveGame(false); });

  let lastTime = 0;
  let lastRenderedAt = 0;
  function gameLoop(timestamp) {
    const minimumFrameTime = 1000 / 45;
    const deltaTime = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.033) : 0;
    lastTime = timestamp;
    if (game.running) {
      game.update(deltaTime);
      if (timestamp - lastRenderedAt >= minimumFrameTime) { game.render(); lastRenderedAt = timestamp; }
    }
    requestAnimationFrame(gameLoop);
  }

  renderMissionRules();
  refreshProfile();
  setBaseScreen('menu');
  requestAnimationFrame(gameLoop);

  window.DuongToiChienThangUI = { showPause, showResult, updateSoundButtons, requestTurnQuiz, showHelp };
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
