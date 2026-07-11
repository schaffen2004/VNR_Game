(function (NS) {
  'use strict';

  NS.GamePhase = Object.freeze({
    OBSERVATION: 'observation', ARTILLERY: 'artillery', COMMAND: 'command', ENEMY: 'enemy'
  });

  NS.PhaseLabels = Object.freeze({
    observation: 'Quan sát', artillery: 'Pháo kích', command: 'Điều binh', enemy: 'Phản công'
  });

  NS.Constants = Object.freeze({
    WORLD_WIDTH: 2600,
    WORLD_HEIGHT: 900,
    TERRAIN_STEP: 5,
    GRAVITY: 150,
    MAX_TURNS: Number.POSITIVE_INFINITY,
    FLAG_HOLD_TURNS: 1,
    COMMAND_ACTION_POINTS: 9,
    MAX_TRENCH_LENGTH: 120,
    MIN_TRENCH_LENGTH: 36,
    TRENCH_FRONT_OFFSET: 36,
    TRENCH_WORK_DISTANCE: 24,
    MAX_PARTICLES: 160,
    MAX_FLOATING_TEXTS: 20,
    STORAGE_KEY: 'duongToiChienThangSaveV1',
    SETTINGS_KEY: 'duongToiChienThangSettingsV1',
    HIGH_SCORE_KEY: 'duongToiChienThangHighScoreV1',
    TUTORIAL_KEY: 'duongToiChienThangTutorialV1'
  });

  NS.PerformanceProfiles = Object.freeze({
    low: Object.freeze({
      id: 'low', label: 'CPU/RAM tiết kiệm', dprLimit: 1, targetFps: 45,
      maxParticles: 160, maxFloatingTexts: 20, particleScale: 0.5,
      minimapInterval: 0.28, backgroundDetail: 0.58, useScreenVignette: false
    })
  });

  NS.detectDefaultPerformanceMode = function () { return 'low'; };
  NS.getPerformanceProfile = function () { return NS.PerformanceProfiles.low; };

  NS.Difficulty = Object.freeze({
    easy: { label: 'Dễ', questionLabel: 'Dễ', enemyDamage: 0.66, enemyAccuracy: 0.56, enemyDelay: 1.3, counterBattery: 0.12, enemyScale: 0.86 },
    medium: { label: 'Trung bình', questionLabel: 'Trung bình', enemyDamage: 0.92, enemyAccuracy: 0.78, enemyDelay: 1.05, counterBattery: 0.34, enemyScale: 1 },
    hard: { label: 'Khó', questionLabel: 'Khó', enemyDamage: 1.15, enemyAccuracy: 0.98, enemyDelay: 0.86, counterBattery: 0.62, enemyScale: 1.16 }
  });

  NS.AmmoTypes = Object.freeze({
    he: { id: 'he', name: 'Đạn nổ mạnh', symbol: 'HE', color: '#ff9c43', baseCount: 9, radius: 78, damage: 92, terrainDamage: 62, structureDamage: 1, fenceDamage: 0.7 },
    ap: { id: 'ap', name: 'Đạn xuyên phá', symbol: 'AP', color: '#f4e2a4', baseCount: 5, radius: 42, damage: 76, terrainDamage: 28, structureDamage: 2.25, fenceDamage: 0.45 },
    smoke: { id: 'smoke', name: 'Đạn khói', symbol: 'SMK', color: '#b9c0ba', baseCount: 4, radius: 96, damage: 12, terrainDamage: 8, structureDamage: 0.1, fenceDamage: 0.1, smokeTurns: 3 },
    breach: { id: 'breach', name: 'Đạn phá hàng rào', symbol: 'BR', color: '#e8cc66', baseCount: 4, radius: 58, damage: 44, terrainDamage: 34, structureDamage: 0.45, fenceDamage: 3.1 },
    cluster: { id: 'cluster', name: 'Đạn chùm', symbol: 'CL', color: '#df795d', baseCount: 3, radius: 52, damage: 50, terrainDamage: 25, structureDamage: 0.55, fenceDamage: 0.8, cluster: true }
  });

  const f = (id, type, name, x, width, height, health, armor, extra) => Object.assign({
    id, type, name, x, width, height, health, maxHealth: health, armor
  }, extra || {});

  NS.MapConfigs = Object.freeze({
    'him-lam': Object.freeze({
      id: 'him-lam', name: 'Cứ điểm Him Lam', terrainProfile: 'hill', flagX: 2360,
      startFocusX: 500, artilleryX: 180, unitStartX: 300,
      stageObjectives: ['Chế áp lô cốt ngoài và quan sát tuyến vượt sông.', 'Đào hào qua đất trống, mở bãi mìn và dây thép gai.', 'Vô hiệu hóa hầm chỉ huy rồi đưa bộ binh cắm cờ trên đồi.'],
      route: ['Rừng', 'Sông Nậm Rốm', 'Đất trống', 'Bãi mìn', 'Dây thép gai', 'Lô cốt ngoài', 'Chiến hào', 'Hầm chỉ huy trên đồi'],
      landmarks: [
        { type: 'forest', from: 0, to: 430, label: 'RỪNG' },
        { type: 'river', from: 500, to: 650, label: 'SÔNG NẬM RỐM' },
        { type: 'open', from: 650, to: 1220, label: 'ĐẤT TRỐNG' },
        { type: 'minefield', from: 1240, to: 1450, label: 'BÃI MÌN' },
        { type: 'hill', from: 1680, to: 2600, label: 'ĐỒI HIM LAM' }
      ],
      fortresses: [
        f('mine-01', 'minefield', 'Bãi mìn Him Lam', 1340, 190, 18, 130, 0),
        f('wire-01', 'wire', 'Dây thép gai lớp 1', 1510, 70, 24, 110, 4),
        f('wire-02', 'wire', 'Dây thép gai lớp 2', 1600, 72, 24, 125, 6),
        f('bunker-01', 'bunker', 'Lô cốt vòng ngoài', 1740, 76, 48, 235, 42, { attackRange: 390, attackDamage: 5.2, fireRate: 0.72 }),
        f('def-trench-01', 'defensiveTrench', 'Chiến hào phòng thủ', 1900, 190, 18, 180, 5, { defenseRadius: 140, coverReduction: 0.26 }),
        f('mg-01', 'machineGun', 'Ụ súng máy Tây', 2040, 54, 32, 120, 18, { attackRange: 440, attackDamage: 7.2, fireRate: 1.45 }),
        f('mortar-01', 'mortar', 'Trận địa súng cối', 2110, 58, 34, 145, 20, { attackRange: 850, attackDamage: 30, fireRate: 0.45 }),
        f('enemy-artillery', 'artillery', 'Pháo địch tầm xa', 2240, 72, 38, 180, 26, { attackRange: 1500, attackDamage: 52, fireRate: 0.32 }),
        f('command-bunker', 'command', 'Hầm chỉ huy Him Lam', 2360, 112, 64, 390, 62)
      ]
    }),
    'doc-lap': Object.freeze({
      id: 'doc-lap', name: 'Cứ điểm Độc Lập', terrainProfile: 'ridge', flagX: 2450,
      startFocusX: 470, artilleryX: 180, unitStartX: 300,
      stageObjectives: ['Chế áp công sự vòng ngoài ở chân đồi.', 'Mở bãi mìn, dây thép gai và đào hào lên sườn đồi.', 'Phá lô cốt trên đỉnh, chiếm hầm chỉ huy Độc Lập.'],
      route: ['Khu tập kết', 'Đồng trống', 'Chân đồi', 'Bãi mìn và dây thép gai', 'Công sự vòng ngoài', 'Chiến hào', 'Lô cốt trên đỉnh', 'Hầm chỉ huy'],
      landmarks: [
        { type: 'assembly', from: 0, to: 430, label: 'KHU TẬP KẾT' },
        { type: 'open', from: 430, to: 1040, label: 'ĐỒNG TRỐNG' },
        { type: 'foothill', from: 1040, to: 1390, label: 'CHÂN ĐỒI' },
        { type: 'minefield', from: 1400, to: 1590, label: 'BÃI MÌN' },
        { type: 'hill', from: 1600, to: 2600, label: 'ĐỒI ĐỘC LẬP' }
      ],
      fortresses: [
        f('mine-01', 'minefield', 'Bãi mìn Độc Lập', 1480, 170, 18, 145, 0),
        f('wire-01', 'wire', 'Dây thép gai vòng ngoài', 1620, 82, 24, 135, 7),
        f('mg-01', 'machineGun', 'Ụ súng vòng ngoài', 1740, 54, 32, 135, 19, { attackRange: 450, attackDamage: 7.8, fireRate: 1.5 }),
        f('bunker-01', 'bunker', 'Lô cốt vòng ngoài', 1840, 78, 50, 260, 46, { attackRange: 410, attackDamage: 5.8, fireRate: 0.78 }),
        f('def-trench-01', 'defensiveTrench', 'Chiến hào sườn đồi', 1995, 205, 18, 205, 7, { defenseRadius: 145, coverReduction: 0.28 }),
        f('mortar-01', 'mortar', 'Súng cối trên đồi', 2140, 58, 34, 160, 22, { attackRange: 900, attackDamage: 34, fireRate: 0.45 }),
        f('bunker-02', 'bunker', 'Lô cốt trên đỉnh', 2250, 84, 54, 310, 54, { attackRange: 450, attackDamage: 6.4, fireRate: 0.82 }),
        f('enemy-artillery', 'artillery', 'Pháo địch Độc Lập', 2340, 72, 38, 195, 28, { attackRange: 1550, attackDamage: 56, fireRate: 0.32 }),
        f('command-bunker', 'command', 'Hầm chỉ huy Độc Lập', 2450, 114, 66, 430, 66)
      ]
    }),
    'muong-thanh-airfield': Object.freeze({
      id: 'muong-thanh-airfield', name: 'Sân bay Mường Thanh', terrainProfile: 'airfield', flagX: 2410,
      startFocusX: 480, artilleryX: 180, unitStartX: 300,
      stageObjectives: ['Đào hào tiếp cận và chế áp các cứ điểm bảo vệ đường băng.', 'Mở tuyến cho pháo và bộ binh áp sát sân bay.', 'Vô hiệu hóa máy bay tiếp tế, đài chỉ huy và chiếm đường băng.'],
      route: ['Đào hào tiếp cận', 'Phá cứ điểm bảo vệ', 'Bố trí pháo', 'Khống chế đường băng', 'Ngăn máy bay tiếp tế'],
      landmarks: [
        { type: 'approachTrench', from: 300, to: 1050, label: 'TUYẾN HÀO TIẾP CẬN' },
        { type: 'fortZone', from: 1080, to: 1600, label: 'CỨ ĐIỂM BẢO VỆ' },
        { type: 'gunZone', from: 1620, to: 1820, label: 'VỊ TRÍ ĐẶT PHÁO' },
        { type: 'runway', from: 1840, to: 2520, label: 'ĐƯỜNG BĂNG MƯỜNG THANH' }
      ],
      fortresses: [
        f('wire-01', 'wire', 'Rào bảo vệ sân bay', 1120, 78, 24, 120, 5),
        f('bunker-01', 'bunker', 'Cứ điểm bảo vệ Tây', 1240, 78, 50, 245, 44, { attackRange: 405, attackDamage: 5.5, fireRate: 0.75 }),
        f('mg-01', 'machineGun', 'Ụ súng bảo vệ đường băng', 1370, 54, 32, 130, 18, { attackRange: 450, attackDamage: 7.5, fireRate: 1.5 }),
        f('def-trench-01', 'defensiveTrench', 'Hào bảo vệ sân bay', 1510, 190, 18, 185, 5, { defenseRadius: 130, coverReduction: 0.25 }),
        f('bunker-02', 'bunker', 'Cứ điểm bảo vệ Đông', 1660, 78, 50, 260, 46, { attackRange: 420, attackDamage: 5.8, fireRate: 0.78 }),
        f('mortar-01', 'mortar', 'Súng cối sân bay', 1770, 58, 34, 150, 20, { attackRange: 880, attackDamage: 32, fireRate: 0.45 }),
        f('enemy-artillery', 'artillery', 'Pháo bảo vệ sân bay', 2050, 72, 38, 185, 26, { attackRange: 1500, attackDamage: 53, fireRate: 0.32 }),
        f('aircraft-01', 'aircraft', 'Máy bay tiếp tế', 2260, 98, 32, 190, 18),
        f('command-bunker', 'command', 'Đài chỉ huy sân bay', 2430, 110, 62, 390, 60)
      ]
    }),
    'muong-thanh-hq': Object.freeze({
      id: 'muong-thanh-hq', name: 'Sở chỉ huy Mường Thanh', terrainProfile: 'basin', flagX: 2420,
      startFocusX: 480, artilleryX: 180, unitStartX: 300,
      stageObjectives: ['Khép chiến hào bao vây và chế áp công sự vòng ngoài.', 'Vô hiệu hóa ụ súng, xe tăng và chiến hào trung tâm.', 'Chiếm hầm chỉ huy Mường Thanh trong lòng chảo.'],
      route: ['Chiến hào bao vây', 'Công sự vòng ngoài', 'Ụ súng và xe tăng', 'Chiến hào trung tâm', 'Hầm trú ẩn', 'Bao vây và chiếm hầm chỉ huy'],
      landmarks: [
        { type: 'encircle', from: 350, to: 1050, label: 'HÀO BAO VÂY' },
        { type: 'outerFort', from: 1120, to: 1700, label: 'CÔNG SỰ VÒNG NGOÀI' },
        { type: 'basin', from: 1700, to: 2600, label: 'LÒNG CHẢO MƯỜNG THANH' }
      ],
      fortresses: [
        f('wire-01', 'wire', 'Dây thép gai vòng ngoài', 1190, 82, 24, 135, 7),
        f('bunker-01', 'bunker', 'Lô cốt vòng ngoài Tây', 1320, 82, 52, 275, 48, { attackRange: 420, attackDamage: 5.9, fireRate: 0.8 }),
        f('mg-01', 'machineGun', 'Ụ súng trung tâm', 1470, 56, 34, 140, 20, { attackRange: 470, attackDamage: 8.2, fireRate: 1.55 }),
        f('enemy-tank-01', 'enemyTank', 'Xe tăng M24 phòng thủ', 1620, 92, 42, 260, 52, { attackRange: 520, attackDamage: 10, fireRate: 0.6 }),
        f('def-trench-01', 'defensiveTrench', 'Chiến hào trung tâm Tây', 1780, 190, 18, 210, 7, { defenseRadius: 145, coverReduction: 0.28 }),
        f('bunker-02', 'bunker', 'Hầm trú ẩn', 1940, 92, 58, 330, 58, { attackRange: 420, attackDamage: 6.2, fireRate: 0.78 }),
        f('def-trench-02', 'defensiveTrench', 'Chiến hào trung tâm Đông', 2095, 190, 18, 220, 8, { defenseRadius: 145, coverReduction: 0.29 }),
        f('mortar-01', 'mortar', 'Súng cối sở chỉ huy', 2240, 58, 34, 170, 24, { attackRange: 930, attackDamage: 35, fireRate: 0.45 }),
        f('enemy-artillery', 'artillery', 'Pháo Mường Thanh', 2320, 72, 38, 205, 30, { attackRange: 1600, attackDamage: 58, fireRate: 0.32 }),
        f('command-bunker', 'command', 'Hầm chỉ huy Mường Thanh', 2440, 122, 68, 480, 72)
      ]
    })
  });

  NS.getMapConfig = function (missionId) {
    return NS.MapConfigs[missionId] || NS.MapConfigs['him-lam'];
  };

  NS.createInitialAmmo = function (profile) {
    const levels = profile && profile.purchases && profile.purchases.artilleryAmmoLevels || {};
    const result = {};
    Object.keys(NS.AmmoTypes).forEach((key) => {
      result[key] = NS.AmmoTypes[key].baseCount + Math.max(0, Number(levels[key]) || 0) * 2;
    });
    return result;
  };

  NS.createSoldierConfigs = function (profile, mapConfig) {
    const size = Math.max(8, Math.min(18, Number(profile && profile.loadout && profile.loadout.infantryPerSquad) || 10));
    const baseX = (mapConfig && mapConfig.unitStartX) || 300;
    const names = ['Đại đội xung kích 1', 'Đại đội xung kích 2', 'Đại đội công binh', 'Đại đội hỏa lực'];
    return names.map((name, index) => ({
      id: `squad-0${index + 1}`, type: 'infantry', name, x: baseX + index * 72,
      health: 110 + (index === 2 ? -5 : 0), maxHealth: 110 + (index === 2 ? -5 : 0), soldiers: size,
      morale: 100, speed: index === 3 ? 37 : 41, diggingSpeed: index === 2 ? 22 : 15,
      digWorkPerTurn: index === 2 ? 44 : 31, attackDamage: index === 3 ? 13 : 10,
      attackRange: index === 3 ? 205 : 178, engineer: index === 2
    }));
  };

  NS.createTankConfigs = function (profile, mapConfig) {
    const owned = Math.max(1, Math.min(3, Number(profile && profile.purchases && profile.purchases.tankCount) || 1));
    const active = Math.max(1, Math.min(owned, Number(profile && profile.loadout && profile.loadout.tanks) || owned));
    const baseX = ((mapConfig && mapConfig.unitStartX) || 300) + 340;
    const configs = [];
    for (let i = 0; i < active; i += 1) {
      configs.push({ id: `tank-0${i + 1}`, type: 'tank', name: `Xe tăng yểm trợ ${i + 1}`, x: baseX + i * 78,
        health: 215, maxHealth: 215, crew: 4, speed: 29, armor: 0.4, attackDamage: 36, attackRange: 300 });
    }
    return configs;
  };

  NS.createFortressConfigs = function (missionId) {
    return NS.getMapConfig(missionId).fortresses.map((item) => Object.assign({}, item));
  };

  NS.MissionStages = Object.freeze([
    { id: 1, name: 'Giai đoạn 1: Trinh sát và chế áp', objective: 'Quan sát địa hình, chế áp hỏa điểm và tạo lối tiếp cận.' },
    { id: 2, name: 'Giai đoạn 2: Tiếp cận', objective: 'Đào hào phía trước, mở chướng ngại và đưa lực lượng áp sát.' },
    { id: 3, name: 'Giai đoạn 3: Chiếm mục tiêu', objective: 'Vô hiệu hóa hầm chỉ huy và đưa bộ binh vào điểm chiếm.' }
  ]);

  NS.TutorialSteps = Object.freeze([
    ['Quan sát bản đồ', 'Kéo bản đồ hoặc dùng A/D để xem toàn tuyến. Các nhãn trên địa hình cho biết từng khu vực thực địa.'],
    ['Câu hỏi theo lượt', 'Khi bắt đầu lượt tấn công, trả lời một câu theo level. Trả lời sai vẫn được đánh nhưng sát thương giảm 50% trong lượt.'],
    ['Bắn pháo', 'Chọn đạn, chỉnh góc/lực rồi khai hỏa. Mỗi lượt pháo binh bắn một phát.'],
    ['Điều quân', 'Chọn bộ binh hoặc xe tăng, rồi dùng Di chuyển, Đào hào hoặc Tấn công.'],
    ['Đào hào', 'Hào bắt đầu phía trước đội hình; lính đứng sau đầu hào và cần nhiều lượt để hoàn thành.'],
    ['Chiếm cứ điểm', 'Vô hiệu hóa hầm chỉ huy và đưa ít nhất một đơn vị bộ binh tới cờ mục tiêu.']
  ]);
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
