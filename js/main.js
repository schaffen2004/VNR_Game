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
    terrain3d: document.getElementById('terrain-3d-screen'),
    game: document.getElementById('game-screen'),
    help: document.getElementById('help-screen'),
    authors: document.getElementById('authors-screen'),
    quiz: document.getElementById('quiz-screen'),
    pause: document.getElementById('pause-screen'),
    result: document.getElementById('result-screen')
  };

  const baseNames = ['menu', 'missions', 'detail', 'shop', 'equipment', 'history', 'settings', 'terrain3d', 'game'];
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
  let terrain3DMissionId = selectedMissionId;
  const terrainMapGeo = Object.freeze({
    center: [21.3949, 103.0145],
    defaultZoom: 13,
    minZoom: 9,
    maxZoom: 17,
    provinceBounds: Object.freeze([
      [20.95, 102.15],
      [22.55, 103.55]
    ]),
    missions: Object.freeze({
      'him-lam': Object.freeze({
        lat: 21.4048, lng: 103.0238,
        title: 'Đồi Him Lam',
        objectiveOffsets: Object.freeze([
          { lat: 0.0011, lng: -0.0012, label: 'Rào ngoài' },
          { lat: 0.0003, lng: -0.0001, label: 'Lô cốt' },
          { lat: -0.0007, lng: 0.0013, label: 'Pháo địch' }
        ])
      }),
      'doc-lap': Object.freeze({
        lat: 21.4172, lng: 103.0002,
        title: 'Đồi Độc Lập',
        objectiveOffsets: Object.freeze([
          { lat: -0.0011, lng: 0.0012, label: 'Bãi mìn' },
          { lat: -0.0002, lng: 0.0021, label: 'Lô cốt' },
          { lat: 0.0008, lng: 0.003, label: 'Pháo địch' }
        ])
      }),
      'c1': Object.freeze({
        lat: 21.3897, lng: 103.0247,
        title: 'Đồi C1',
        objectiveOffsets: Object.freeze([
          { lat: 0.0009, lng: -0.0016, label: 'Rào lớp 1' },
          { lat: 0.0001, lng: -0.0004, label: 'Lô cốt' },
          { lat: -0.0008, lng: 0.0011, label: 'Pháo địch' }
        ])
      }),
      'muong-thanh-airfield': Object.freeze({
        lat: 21.3972, lng: 103.0078,
        title: 'Sân bay Mường Thanh',
        objectiveOffsets: Object.freeze([
          { lat: 0.0005, lng: -0.0028, label: 'Mép đường băng' },
          { lat: -0.0002, lng: -0.0006, label: 'Xe tăng địch' },
          { lat: 0.0001, lng: 0.0024, label: 'Máy bay tiếp tế' }
        ])
      }),
      'de-castries-hq': Object.freeze({
        lat: 21.3951, lng: 103.0168,
        title: 'Hầm De Castries',
        objectiveOffsets: Object.freeze([
          { lat: 0.0008, lng: -0.002, label: 'Cầu Mường Thanh' },
          { lat: 0.0003, lng: -0.001, label: 'Phòng tuyến ngoài' },
          { lat: -0.0002, lng: 0.001, label: 'Hầm chỉ huy' }
        ])
      })
    })
  });
  let terrainMapInstance = null;
  let terrainMissionMarkers = new Map();
  let terrainObjectiveLayer = null;
  let terrainGuideActive = false;
  let terrainGuideTimer = 0;
  let terrainGuideStepIndex = -1;
  let terrainGuideFallbackDelay = 0;
  let terrainGuideSessionToken = 0;
  let terrainGuideAudio = null;

  function clearTerrainGuideTimer() {
    if (terrainGuideTimer) {
      window.clearTimeout(terrainGuideTimer);
      terrainGuideTimer = 0;
    }
  }

  function stopTerrainGuideAudio() {
    if (!terrainGuideAudio) return;
    terrainGuideAudio.onended = null;
    terrainGuideAudio.onerror = null;
    terrainGuideAudio.onpause = null;
    terrainGuideAudio.pause();
    terrainGuideAudio = null;
  }

  function getTerrainGuideButton() {
    return document.getElementById('terrain-guide-button');
  }

  function setTerrainGuideStatus(message) {
    const status = document.getElementById('terrain-guide-status');
    if (status) status.textContent = message;
  }

  function updateTerrainGuideButton() {
    const button = getTerrainGuideButton();
    if (!button) return;
    button.classList.toggle('is-active', terrainGuideActive);
    button.textContent = terrainGuideActive ? 'Dừng hướng dẫn viên' : 'Bật hướng dẫn viên';
  }

  function stopTerrainGuide(options) {
    const settings = options || {};
    terrainGuideSessionToken += 1;
    terrainGuideActive = false;
    terrainGuideStepIndex = -1;
    terrainGuideFallbackDelay = 0;
    clearTerrainGuideTimer();
    stopTerrainGuideAudio();
    updateTerrainGuideButton();
    if (!settings.keepStatus) {
      setTerrainGuideStatus('Marker đỏ là cứ điểm đang chọn. Bật hướng dẫn viên để đi lần lượt qua từng địa điểm.');
    }
  }

  function scheduleTerrainGuideAdvance(sessionToken) {
    clearTerrainGuideTimer();
    if (!terrainGuideActive || sessionToken !== terrainGuideSessionToken) return;
    terrainGuideTimer = window.setTimeout(() => {
      if (!terrainGuideActive || sessionToken !== terrainGuideSessionToken) return;
      runTerrainGuideStep(terrainGuideStepIndex + 1);
    }, terrainGuideFallbackDelay || 1600);
  }

  function playTerrainGuideAudio(mission, sessionToken) {
    stopTerrainGuideAudio();
    const audioPath = mission && mission.guideAudio;
    if (!audioPath) {
      terrainGuideFallbackDelay = 5000;
      setTerrainGuideStatus(`Chưa có audio thu sẵn cho ${mission.name}. Tour sẽ tự chuyển sang điểm tiếp theo.`);
      scheduleTerrainGuideAdvance(sessionToken);
      return;
    }

    const audio = new Audio(audioPath);
    terrainGuideAudio = audio;
    audio.preload = 'auto';
    audio.volume = game.audio && game.audio.sfxEnabled ? game.audio.sfxVolume : 1;
    audio.onended = () => {
      if (!terrainGuideActive || sessionToken !== terrainGuideSessionToken) return;
      terrainGuideFallbackDelay = 1600;
      scheduleTerrainGuideAdvance(sessionToken);
    };
    audio.onerror = () => {
      if (!terrainGuideActive || sessionToken !== terrainGuideSessionToken) return;
      terrainGuideFallbackDelay = 5000;
      setTerrainGuideStatus(`Không phát được audio của ${mission.name}. Kiểm tra file ${audioPath}.`);
      scheduleTerrainGuideAdvance(sessionToken);
    };
    const promise = audio.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        if (!terrainGuideActive || sessionToken !== terrainGuideSessionToken) return;
        terrainGuideFallbackDelay = 5000;
        setTerrainGuideStatus(`Audio của ${mission.name} chưa sẵn sàng phát. Kiểm tra file ${audioPath}.`);
        scheduleTerrainGuideAdvance(sessionToken);
      });
    }
  }

  function runTerrainGuideStep(index) {
    const missions = NS.CampaignMissions || [];
    if (!terrainGuideActive || !missions.length) return;
    if (index >= missions.length) {
      stopTerrainGuide({ keepStatus: true });
      setTerrainGuideStatus('Hướng dẫn viên đã đi hết các địa điểm trên bản đồ.');
      return;
    }

    const mission = missions[index];
    terrainGuideStepIndex = index;
    renderTerrain3DView(mission.id);
    setTerrainGuideStatus(`Hướng dẫn viên đang giới thiệu ${mission.name}.`);
    playTerrainGuideAudio(mission, terrainGuideSessionToken);
  }

  function startTerrainGuide() {
    stopTerrainGuide({ keepStatus: true });
    terrainGuideSessionToken += 1;
    terrainGuideActive = true;
    updateTerrainGuideButton();
    setTerrainGuideStatus('Hướng dẫn viên đang chuẩn bị lộ trình qua các cứ điểm.');
    const startIndex = Math.max(0, NS.CampaignMissions.findIndex((mission) => mission.id === terrain3DMissionId));
    runTerrainGuideStep(startIndex >= 0 ? startIndex : 0);
  }

  function formatCoins(value) {
    return Math.max(0, Math.round(Number(value) || 0)).toLocaleString('vi-VN');
  }

  function setBaseScreen(name) {
    if (name !== 'terrain3d') stopTerrainGuide();
    baseNames.forEach((key) => screens[key].classList.toggle('screen--active', key === name));
    ['help', 'authors', 'quiz', 'pause', 'result'].forEach((key) => screens[key].classList.remove('screen--active'));
    if (name !== 'game') {
      game.paused = false;
      if (game.running) game.running = false;
    }
  }

  function refreshWallet() {
    document.getElementById('wallet-value').textContent = formatCoins(profile.coins);
    document.querySelectorAll('.wallet-mirror').forEach((node) => { node.textContent = formatCoins(profile.coins); });
  }

  function refreshHomeDashboard() {
    const completedCount = profile.completedMissions.length;
    const totalMissions = NS.CampaignMissions.length;
    const progress = totalMissions ? Math.round(completedCount / totalMissions * 100) : 0;
    const completedNode = document.getElementById('home-star-value');
    const progressNode = document.getElementById('home-progress-value');
    const missionNode = document.getElementById('home-selected-mission');
    if (completedNode) completedNode.textContent = `${completedCount}/${totalMissions}`;
    if (progressNode) progressNode.textContent = `${progress}%`;
    if (missionNode) missionNode.textContent = 'Độc lập - Tự do - Hạnh phúc';
  }

  function refreshProfile() {
    profile = NS.Campaign.loadProfile();
    refreshWallet();
    refreshHomeDashboard();
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
      const status = completed ? '★ Đã chiến thắng' : (unlocked ? 'Sẵn sàng tác chiến' : '🔒 Chưa mở khóa');
      return `<article class="mission-card ${completed ? 'is-completed' : ''} ${unlocked ? '' : 'is-locked'}">
        <div class="mission-card__number">${mission.order}</div>
        <div class="mission-card__body">
          <div class="mission-card__status">${status}</div>
          <h3>${mission.name}</h3><p class="mission-card__subtitle">${mission.subtitle} · ${mission.period}</p>
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
    document.getElementById('detail-description').textContent = mission.historicalSummary;
    document.getElementById('detail-history').textContent = '';
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

  function populateTerrain3DSelect() {
    const select = document.getElementById('terrain-3d-mission-select');
    if (!select) return;
    select.innerHTML = NS.CampaignMissions.map((mission) => `<option value="${mission.id}">${mission.order}. ${mission.name}</option>`).join('');
    select.value = terrain3DMissionId;
  }

  function openTerrain3DScreen(missionId) {
    terrain3DMissionId = missionId || selectedMissionId || 'him-lam';
    populateTerrain3DSelect();
    updateTerrainGuideButton();
    setTerrainGuideStatus('Marker đỏ là cứ điểm đang chọn. Bật hướng dẫn viên để đi lần lượt qua từng địa điểm.');
    setBaseScreen('terrain3d');
    requestAnimationFrame(() => renderTerrain3DView(terrain3DMissionId));
  }

  function createTerrainMarkerIcon(className, label) {
    return L.divIcon({
      className: '',
      html: `<div class="${className}">${label || ''}</div>`,
      iconSize: null,
      popupAnchor: [0, -14]
    });
  }

  function buildMissionPopup(mission, map) {
    return `<strong>${mission.name}</strong><br>${mission.period}`;
  }

  function initTerrainMap() {
    if (terrainMapInstance || typeof L === 'undefined') return terrainMapInstance;
    const container = document.getElementById('terrain-3d-canvas');
    if (!container) return null;
    terrainMapInstance = L.map(container, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
      minZoom: terrainMapGeo.minZoom,
      maxZoom: terrainMapGeo.maxZoom,
      maxBounds: terrainMapGeo.provinceBounds,
      maxBoundsViscosity: 1
    }).setView(terrainMapGeo.center, terrainMapGeo.defaultZoom);
    terrainMapInstance.attributionControl.setPrefix(false);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: terrainMapGeo.minZoom,
      maxZoom: 19,
      bounds: terrainMapGeo.provinceBounds,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(terrainMapInstance);
    terrainMapInstance.fitBounds(terrainMapGeo.provinceBounds, { animate: false });
    terrainObjectiveLayer = L.layerGroup().addTo(terrainMapInstance);

    NS.CampaignMissions.forEach((mission) => {
      const geo = terrainMapGeo.missions[mission.id];
      if (!geo) return;
      const marker = L.marker([geo.lat, geo.lng], {
        icon: createTerrainMarkerIcon('terrain-map-marker', String(mission.order))
      }).addTo(terrainMapInstance);
      marker.bindPopup(buildMissionPopup(mission, NS.getMapConfig(mission.id)));
      marker.on('click', () => {
        if (terrainGuideActive) stopTerrainGuide({ keepStatus: true });
        terrain3DMissionId = mission.id;
        const select = document.getElementById('terrain-3d-mission-select');
        if (select) select.value = mission.id;
        renderTerrain3DView(mission.id);
        setTerrainGuideStatus(`Đang xem ${mission.name}. Bật hướng dẫn viên để tự động thuyết minh toàn tuyến.`);
      });
      terrainMissionMarkers.set(mission.id, marker);
    });
    return terrainMapInstance;
  }

  function renderTerrain3DView(missionId) {
    terrain3DMissionId = missionId || terrain3DMissionId || 'him-lam';
    const mission = NS.Campaign.getMission(terrain3DMissionId);
    const map = NS.getMapConfig(terrain3DMissionId);
    const geo = terrainMapGeo.missions[terrain3DMissionId];
    const terrainMap = initTerrainMap();
    if (!terrainMap || !mission || !map || !geo) return;

    document.getElementById('terrain-3d-title').textContent = mission.name;
    document.getElementById('terrain-3d-period').textContent = mission.period;
    document.getElementById('terrain-3d-history').textContent = mission.historicalSummary;
    const select = document.getElementById('terrain-3d-mission-select');
    if (select && select.value !== terrain3DMissionId) select.value = terrain3DMissionId;

    terrainMissionMarkers.forEach((marker, id) => {
      const missionOrder = NS.Campaign.getMission(id).order;
      const className = id === terrain3DMissionId ? 'terrain-map-marker terrain-map-marker--active' : 'terrain-map-marker';
      marker.setIcon(createTerrainMarkerIcon(className, String(missionOrder)));
    });

    const focusBounds = L.latLngBounds([[geo.lat, geo.lng]]);
    if (terrainObjectiveLayer) terrainObjectiveLayer.clearLayers();
    requestAnimationFrame(() => {
      terrainMap.invalidateSize(false);
      terrainMap.fitBounds(focusBounds.pad(0.5), { animate: false });
      const missionMarker = terrainMissionMarkers.get(terrain3DMissionId);
      if (missionMarker) missionMarker.openPopup();
    });
  }

  function renderShopIcon(item) {
    const start = '<svg viewBox="0 0 80 80" aria-hidden="true" focusable="false" class="shop-card__icon-svg">';
    const end = '</svg>';
    const icons = {
      'tank-count': `${start}
        <rect x="14" y="37" width="42" height="16" rx="4" fill="#51603c"/>
        <rect x="28" y="30" width="18" height="10" rx="3" fill="#69794f"/>
        <rect x="45" y="33" width="20" height="4" rx="2" fill="#d8b44a"/>
        <circle cx="24" cy="56" r="6" fill="#3a2d1f"/><circle cx="46" cy="56" r="6" fill="#3a2d1f"/>
        <path d="M12 26h14l6 6H18z" fill="#8f2c1a" opacity=".8"/>
      ${end}`,
      'tank-ammo': `${start}
        <rect x="25" y="14" width="18" height="34" rx="8" fill="#d0a23d"/>
        <path d="M25 24h18v16H25z" fill="#6f130d" opacity=".28"/>
        <path d="M29 8h10l4 7H25z" fill="#f0d17a"/>
        <rect x="31" y="48" width="6" height="17" rx="2" fill="#6a140d"/>
        <rect x="42" y="22" width="9" height="29" rx="4" fill="#e2bc5d"/>
      ${end}`,
      'infantry-size': `${start}
        <circle cx="26" cy="24" r="7" fill="#43513a"/>
        <circle cx="40" cy="20" r="8" fill="#59684d"/>
        <circle cx="55" cy="25" r="7" fill="#43513a"/>
        <rect x="21" y="32" width="10" height="18" rx="4" fill="#43513a"/>
        <rect x="34" y="29" width="12" height="22" rx="4" fill="#59684d"/>
        <rect x="50" y="33" width="10" height="17" rx="4" fill="#43513a"/>
        <path d="M18 57h46" stroke="#d8b44a" stroke-width="4" stroke-linecap="round"/>
      ${end}`,
      'ammo-he': `${start}
        <rect x="24" y="14" width="20" height="42" rx="10" fill="#dc6d33"/>
        <path d="M24 28h20v16H24z" fill="#7f170f" opacity=".25"/>
        <path d="M28 9h12l4 8H24z" fill="#ffd38e"/>
        <path d="M48 45l10 10" stroke="#7f170f" stroke-width="4" stroke-linecap="round"/>
        <circle cx="60" cy="58" r="6" fill="#ffcf65"/>
      ${end}`,
      'ammo-ap': `${start}
        <rect x="26" y="12" width="16" height="46" rx="8" fill="#c4a44d"/>
        <path d="M30 7h8l5 9H25z" fill="#fff0ad"/>
        <path d="M34 58V70" stroke="#6f140d" stroke-width="5" stroke-linecap="round"/>
        <path d="M47 34h12" stroke="#6f140d" stroke-width="4" stroke-linecap="round"/>
      ${end}`,
      'ammo-smoke': `${start}
        <rect x="24" y="42" width="32" height="14" rx="7" fill="#8f958d"/>
        <circle cx="30" cy="29" r="8" fill="#d5d2ca"/>
        <circle cx="40" cy="22" r="10" fill="#c3c0ba"/>
        <circle cx="51" cy="30" r="9" fill="#ddd9d1"/>
      ${end}`,
      'ammo-breach': `${start}
        <rect x="16" y="42" width="38" height="12" rx="6" fill="#cb9733"/>
        <path d="M54 48h10" stroke="#6d130d" stroke-width="4" stroke-linecap="round"/>
        <path d="M61 22l-9 10-7-7-17 20" fill="none" stroke="#f2d36d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      ${end}`,
      'ammo-cluster': `${start}
        <rect x="32" y="12" width="14" height="36" rx="7" fill="#c65b45"/>
        <path d="M35 7h8l4 7H31z" fill="#ffd0a7"/>
        <circle cx="23" cy="54" r="7" fill="#e79273"/>
        <circle cx="38" cy="59" r="8" fill="#d96d56"/>
        <circle cx="54" cy="53" r="7" fill="#e79273"/>
      ${end}`
    };
    return icons[item.id] || `${start}<circle cx="40" cy="40" r="18" fill="#d9b44f"/>${end}`;
  }

  function renderShop() {
    const container = document.getElementById('shop-list');
    container.innerHTML = NS.ShopItems.map((item) => {
      const state = NS.Campaign.getItemState(profile, item);
      const price = NS.Campaign.getItemPrice(profile, item);
      return `<article class="shop-card ${state.owned ? 'is-owned' : ''}">
        <div class="shop-card__icon shop-card__icon--${item.id}">${renderShopIcon(item)}</div><h3>${item.name}</h3><p>${item.description}</p>
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
    const container = document.getElementById('mission-rules-list');
    if (!container) return;
    container.innerHTML = '';
    container.hidden = true;
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

  function showAuthors(show) {
    screens.authors.classList.toggle('screen--active', Boolean(show));
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
  function continueSavedGame() {
    if (game.loadGame()) {
      selectedMissionId = game.currentMissionId;
      selectedLevel = game.difficulty;
      setBaseScreen('game');
      game.start();
    }
  }
  function refreshContinueButton() {
    const canContinue = hasSave();
    const continueMenuButton = document.getElementById('home-continue-menu-button');
    if (continueMenuButton) continueMenuButton.disabled = !canContinue;
  }

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
  document.getElementById('terrain-3d-button').addEventListener('click', () => { game.audio.resume(); openTerrain3DScreen(selectedMissionId); });
  document.getElementById('shop-menu-button').addEventListener('click', () => { game.audio.resume(); setBaseScreen('shop'); });
  document.getElementById('equipment-menu-button').addEventListener('click', () => { game.audio.resume(); setBaseScreen('equipment'); });
  document.getElementById('history-menu-button').addEventListener('click', () => setBaseScreen('history'));
  document.getElementById('settings-menu-button').addEventListener('click', () => { game.audio.resume(); refreshSettings(); setBaseScreen('settings'); });
  document.getElementById('home-continue-menu-button').addEventListener('click', () => { game.audio.resume(); continueSavedGame(); });
  document.getElementById('authors-button').addEventListener('click', () => showAuthors(true));
  document.querySelectorAll('[data-home-screen]').forEach((button) => button.addEventListener('click', () => {
    const target = button.dataset.homeScreen;
    if (!target || !screens[target]) return;
    game.audio.resume();
    setBaseScreen(target);
  }));
  document.querySelectorAll('.back-home-button').forEach((button) => button.addEventListener('click', () => { refreshProfile(); setBaseScreen('menu'); }));
  document.getElementById('back-missions-button').addEventListener('click', () => setBaseScreen('missions'));
  document.getElementById('start-mission-button').addEventListener('click', startMission);
  document.getElementById('terrain-guide-button').addEventListener('click', () => {
    if (terrainGuideActive) stopTerrainGuide();
    else startTerrainGuide();
  });
  document.getElementById('terrain-3d-mission-select').addEventListener('change', (event) => {
    if (terrainGuideActive) stopTerrainGuide({ keepStatus: true });
    renderTerrain3DView(event.target.value);
    const mission = NS.Campaign.getMission(event.target.value);
    setTerrainGuideStatus(`Đang xem ${mission.name}. Bật hướng dẫn viên để tự động thuyết minh toàn tuyến.`);
  });
  document.querySelectorAll('.level-option').forEach((button) => button.addEventListener('click', () => {
    selectedLevel = button.dataset.level;
    document.querySelectorAll('.level-option').forEach((node) => node.classList.toggle('is-selected', node === button));
  }));

  // Hướng dẫn, cài đặt, lịch sử
  document.getElementById('help-button').addEventListener('click', () => showHelp(true, false));
  document.getElementById('game-help-button').addEventListener('click', () => showHelp(true, true));
  document.getElementById('close-help-button').addEventListener('click', () => showHelp(false));
  document.getElementById('close-authors-button').addEventListener('click', () => showAuthors(false));
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
  // Pause, kết quả, tiếp tục
  document.getElementById('resume-button').addEventListener('click', () => game.togglePause(false));
  document.getElementById('restart-button').addEventListener('click', () => { screens.pause.classList.remove('screen--active'); game.resetGame(); game.start(); });
  document.getElementById('back-menu-button').addEventListener('click', () => { game.running = false; screens.pause.classList.remove('screen--active'); refreshProfile(); setBaseScreen('menu'); });
  document.getElementById('result-restart-button').addEventListener('click', () => { screens.result.classList.remove('screen--active'); game.resetGame(); setBaseScreen('game'); game.start(); });
  document.getElementById('result-menu-button').addEventListener('click', () => { screens.result.classList.remove('screen--active'); refreshProfile(); setBaseScreen('menu'); });
  // Tutorial
  document.getElementById('tutorial-next-button').addEventListener('click', () => { tutorialIndex += 1; renderTutorialStep(); });
  document.getElementById('tutorial-skip-button').addEventListener('click', completeTutorial);

  window.addEventListener('beforeunload', () => { if (game.running && !game.result) game.saveGame(false); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && game.running && !game.result) game.saveGame(false); });
  window.addEventListener('resize', () => { if (screens.terrain3d.classList.contains('screen--active')) renderTerrain3DView(terrain3DMissionId); });

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
