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
    COMMAND_ACTION_POINTS: 9,
    MAX_TRENCH_LENGTH: 150,
    MIN_TRENCH_LENGTH: 88,
    TRENCH_FRONT_OFFSET: 48,
    TRENCH_WORK_DISTANCE: 34,
    TRENCH_DEPTH: 17,
    DUGOUT_DEPTH: 30,
    DUGOUT_MAX_CAPACITY: 4,
    TRENCH_MOVE_MULTIPLIER: 0.82,
    MAX_PARTICLES: 160,
    MAX_FLOATING_TEXTS: 20,
    ENEMY_ARTILLERY_SAFE_MARGIN: 48,
    STORAGE_KEY: 'duongToiChienThangSaveV5',
    SETTINGS_KEY: 'duongToiChienThangSettingsV2',
    HIGH_SCORE_KEY: 'duongToiChienThangHighScoreV2',
    TUTORIAL_KEY: 'duongToiChienThangTutorialV3'
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
    he: { id: 'he', name: 'Đạn nổ mạnh', symbol: 'HE', color: '#ff9c43', baseCount: 10, radius: 78, damage: 92, terrainDamage: 62, structureDamage: 1, fenceDamage: 0.7 },
    ap: { id: 'ap', name: 'Đạn xuyên phá', symbol: 'AP', color: '#f4e2a4', baseCount: 10, radius: 42, damage: 76, terrainDamage: 28, structureDamage: 2.25, fenceDamage: 0.45 },
    smoke: { id: 'smoke', name: 'Đạn khói', symbol: 'SMK', color: '#b9c0ba', baseCount: 10, radius: 96, damage: 12, terrainDamage: 8, structureDamage: 0.1, fenceDamage: 0.1, smokeTurns: 3 },
    breach: { id: 'breach', name: 'Đạn phá hàng rào', symbol: 'BR', color: '#e8cc66', baseCount: 10, radius: 58, damage: 44, terrainDamage: 34, structureDamage: 0.45, fenceDamage: 3.1 },
    cluster: { id: 'cluster', name: 'Đạn chùm', symbol: 'CL', color: '#df795d', baseCount: 10, radius: 52, damage: 50, terrainDamage: 25, structureDamage: 0.55, fenceDamage: 0.8, cluster: true }
  });

  const f = (id, type, name, x, width, height, health, armor, extra) => Object.assign({
    id, type, name, x, width, height, health, maxHealth: health, armor
  }, extra || {});

  NS.MapConfigs = Object.freeze({
    'him-lam': Object.freeze({
      id: 'him-lam', name: 'Đồi Him Lam', terrainProfile: 'himLam', flagX: 2390,
      startFocusX: 440, artilleryX: 150, unitStartX: 260,
      primaryObjectiveId: 'enemy-artillery', assaultThreshold: 1650, requiredTrenches: 1, requiresFence: true,
      stageOneTargetIds: ['bunker-01'],
      stageObjectives: [
        'Từ rừng quan sát đất trống, dùng pháo chế áp lô cốt.',
        'Đào hầm trú ẩn vượt đất trống và mở dây thép gai.',
        'Vô hiệu hóa pháo địch rồi đưa bộ binh chiếm đỉnh Him Lam.'
      ],
      route: ['Rừng', 'Đất trống', 'Dây thép gai', 'Lô cốt', 'Pháo địch'],
      landmarks: [
        { type: 'forest', from: 0, to: 620, label: 'RỪNG XUẤT PHÁT' },
        { type: 'open', from: 620, to: 1480, label: 'ĐẤT TRỐNG' },
        { type: 'hill', from: 1480, to: 2600, label: 'ĐỒI HIM LAM' }
      ],
      fortresses: [
        f('wire-01', 'wire', 'Dây thép gai Him Lam', 1540, 104, 28, 145, 7),
        f('bunker-01', 'bunker', 'Lô cốt Him Lam', 1810, 102, 58, 320, 54, { attackRange: 430, attackDamage: 6.2, fireRate: 0.82 }),
        f('enemy-artillery', 'artillery', 'Pháo 105 mm địch', 2220, 104, 48, 230, 32, { attackRange: 1600, attackDamage: 58, fireRate: 0.32 })
      ]
    }),

    'doc-lap': Object.freeze({
      id: 'doc-lap', name: 'Đồi Độc Lập', terrainProfile: 'docLap', flagX: 2440,
      startFocusX: 430, artilleryX: 150, unitStartX: 260,
      primaryObjectiveId: 'enemy-artillery', assaultThreshold: 1740, requiredTrenches: 2, requiresFence: true,
      stageOneTargetIds: ['bunker-01', 'mg-01'],
      stageObjectives: [
        'Từ rừng chế áp lô cốt và ụ súng trên sườn đồi.',
        'Đào hầm trú ẩn trên sườn trống, mở bãi mìn và hàng rào.',
        'Đánh chiếm đỉnh Độc Lập, vô hiệu hóa pháo địch.'
      ],
      route: ['Rừng', 'Sườn đồi trống', 'Bãi mìn', 'Hàng rào', 'Lô cốt', 'Ụ súng', 'Pháo địch'],
      landmarks: [
        { type: 'forest', from: 0, to: 520, label: 'RỪNG XUẤT PHÁT' },
        { type: 'openSlope', from: 520, to: 1320, label: 'SƯỜN ĐỒI TRỐNG' },
        { type: 'minefield', from: 1320, to: 1510, label: 'BÃI MÌN' },
        { type: 'hill', from: 1510, to: 2600, label: 'ĐỒI ĐỘC LẬP' }
      ],
      fortresses: [
        f('mine-01', 'minefield', 'Bãi mìn Độc Lập', 1410, 170, 18, 170, 0),
        f('wire-01', 'wire', 'Hàng rào Độc Lập', 1580, 100, 28, 155, 8),
        f('bunker-01', 'bunker', 'Lô cốt sườn đồi', 1790, 102, 58, 335, 56, { attackRange: 440, attackDamage: 6.4, fireRate: 0.82 }),
        f('mg-01', 'machineGun', 'Ụ súng máy đỉnh đồi', 2010, 72, 40, 175, 24, { attackRange: 480, attackDamage: 8.4, fireRate: 1.55 }),
        f('enemy-artillery', 'artillery', 'Pháo 105 mm Độc Lập', 2290, 104, 48, 245, 34, { attackRange: 1650, attackDamage: 60, fireRate: 0.32 })
      ]
    }),

    'c1': Object.freeze({
      id: 'c1', name: 'Đồi C1', terrainProfile: 'c1', flagX: 2450,
      startFocusX: 430, artilleryX: 150, unitStartX: 275,
      primaryObjectiveId: 'enemy-artillery', assaultThreshold: 1820, requiredTrenches: 2, requiresFence: true,
      stageOneTargetIds: ['bunker-01', 'mg-01'],
      stageObjectives: [
        'Xuất phát từ chiến hào, xác định các lớp mìn–rào đan xen.',
        'Mở từng cửa đột phá, tiến quân có che chắn.',
        'Phá lô cốt, ụ súng và vô hiệu hóa pháo địch trên C1.'
      ],
      route: ['Chiến hào xuất phát', 'Mìn và hàng rào đan xen', 'Lô cốt', 'Ụ súng', 'Pháo địch'],
      landmarks: [
        { type: 'approachTrench', from: 120, to: 650, label: 'CHIẾN HÀO XUẤT PHÁT' },
        { type: 'obstacleBelt', from: 720, to: 1680, label: 'MÌN – RÀO ĐAN XEN' },
        { type: 'hill', from: 1680, to: 2600, label: 'ĐỒI C1' }
      ],
      fortresses: [
        f('mine-01', 'minefield', 'Bãi mìn C1 lớp 1', 820, 125, 18, 125, 0),
        f('wire-01', 'wire', 'Hàng rào C1 lớp 1', 970, 82, 28, 125, 6),
        f('mine-02', 'minefield', 'Bãi mìn C1 lớp 2', 1110, 120, 18, 135, 0),
        f('wire-02', 'wire', 'Hàng rào C1 lớp 2', 1250, 82, 28, 135, 7),
        f('mine-03', 'minefield', 'Bãi mìn C1 lớp 3', 1395, 118, 18, 145, 0),
        f('wire-03', 'wire', 'Hàng rào C1 lớp 3', 1535, 84, 28, 145, 8),
        f('bunker-01', 'bunker', 'Lô cốt C1', 1815, 104, 60, 365, 60, { attackRange: 450, attackDamage: 6.8, fireRate: 0.86 }),
        f('mg-01', 'machineGun', 'Ụ súng máy C1', 2040, 74, 42, 190, 26, { attackRange: 500, attackDamage: 8.8, fireRate: 1.62 }),
        f('enemy-artillery', 'artillery', 'Pháo địch trên C1', 2320, 106, 50, 260, 36, { attackRange: 1700, attackDamage: 62, fireRate: 0.32 })
      ]
    }),

    'muong-thanh-airfield': Object.freeze({
      id: 'muong-thanh-airfield', name: 'Sân bay Mường Thanh', terrainProfile: 'airfield', flagX: 2400,
      startFocusX: 420, artilleryX: 150, unitStartX: 275,
      primaryObjectiveId: 'aircraft-01', assaultThreshold: 1620, requiredTrenches: 1, requiresFence: false,
      stageOneTargetIds: ['enemy-tank-01'],
      stageObjectives: [
        'Từ chiến hào tiến ra mép đường băng và quan sát xe tăng bảo vệ.',
        'Chế áp xe tăng, đưa pháo vào vị trí khống chế sân bay.',
        'Bắn hạ máy bay tiếp tế và chiếm đường băng Mường Thanh.'
      ],
      route: ['Chiến hào xuất phát', 'Đường băng', 'Xe tăng địch', 'Bắn máy bay'],
      landmarks: [
        { type: 'approachTrench', from: 120, to: 690, label: 'CHIẾN HÀO XUẤT PHÁT' },
        { type: 'runway', from: 720, to: 2500, label: 'ĐƯỜNG BĂNG MƯỜNG THANH' }
      ],
      fortresses: [
        f('enemy-tank-01', 'enemyTank', 'Xe tăng M24 bảo vệ sân bay', 1510, 106, 48, 300, 58, { attackRange: 560, attackDamage: 11, fireRate: 0.62 }),
        f('aircraft-01', 'aircraft', 'Máy bay C-47 tiếp tế', 2220, 150, 54, 240, 20, { altitude: 185 })
      ]
    }),

    'de-castries-hq': Object.freeze({
      id: 'de-castries-hq', name: 'Hầm De Castries', terrainProfile: 'deCastries', flagX: 2440,
      startFocusX: 390, artilleryX: 140, unitStartX: 250,
      primaryObjectiveId: 'command-bunker', assaultThreshold: 1720, requiredTrenches: 2, requiresFence: true,
      stageOneTargetIds: ['enemy-tank-01', 'bunker-01'],
      stageObjectives: [
        'Xuất phát từ hầm, vượt cầu Mường Thanh và quan sát tuyến chướng ngại.',
        'Mở dây thép gai, bãi mìn; chế áp xe tăng và lô cốt.',
        'Vô hiệu hóa pháo địch, bao vây và chiếm hầm chỉ huy.'
      ],
      route: ['Hầm xuất phát', 'Cầu Mường Thanh', 'Dây thép gai', 'Bãi mìn', 'Xe tăng', 'Lô cốt', 'Pháo địch', 'Hầm chỉ huy'],
      landmarks: [
        { type: 'dugout', from: 80, to: 470, label: 'HẦM XUẤT PHÁT' },
        { type: 'river', from: 610, to: 830, label: 'SÔNG NẬM RỐM', labelOffsetX: -70 },
        { type: 'bridge', from: 640, to: 800, label: 'CẦU MƯỜNG THANH', labelOffsetX: 70, labelOffsetY: -30 },
        { type: 'basin', from: 830, to: 2600, label: 'LÒNG CHẢO MƯỜNG THANH' }
      ],
      fortresses: [
        f('wire-01', 'wire', 'Dây thép gai sở chỉ huy', 1030, 104, 28, 160, 8),
        f('mine-01', 'minefield', 'Bãi mìn sở chỉ huy', 1230, 160, 18, 175, 0),
        f('enemy-tank-01', 'enemyTank', 'Xe tăng M24 Conti', 1510, 108, 50, 320, 62, { attackRange: 580, attackDamage: 11.5, fireRate: 0.64 }),
        f('bunker-01', 'bunker', 'Lô cốt bảo vệ hầm', 1770, 106, 60, 385, 64, { attackRange: 470, attackDamage: 7.1, fireRate: 0.88 }),
        f('enemy-artillery', 'artillery', 'Pháo 105 mm Mường Thanh', 2080, 106, 50, 275, 38, { attackRange: 1750, attackDamage: 64, fireRate: 0.32 }),
        f('command-bunker', 'command', 'Hầm chỉ huy De Castries', 2390, 150, 72, 560, 82)
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
      morale: 100, speed: index === 3 ? 60 : 60, diggingSpeed: index === 2 ? 22 : 15,
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
      configs.push({
        id: `tank-0${i + 1}`, type: 'tank', name: `Xe tăng yểm trợ ${i + 1}`, x: baseX + i * 78,
        health: 215, maxHealth: 215, crew: 4, speed: 29, armor: 0.4, attackDamage: 36, attackRange: 300, maxShells: 10, shells: 10
      });
    }
    return configs;
  };

  NS.createFortressConfigs = function (missionId) {
    return NS.getMapConfig(missionId).fortresses.map((item) => Object.assign({}, item));
  };

  NS.MissionStages = Object.freeze([
    { id: 1, name: 'Giai đoạn 1: Trinh sát và chế áp', objective: 'Quan sát địa hình, chế áp hỏa điểm và tạo lối tiếp cận.' },
    { id: 2, name: 'Giai đoạn 2: Tiếp cận', objective: 'Đào hầm trú ẩn, cho quân chui xuống và mở chướng ngại để áp sát.' },
    { id: 3, name: 'Giai đoạn 3: Chiếm mục tiêu', objective: 'Vô hiệu hóa mục tiêu cuối và đưa bộ binh vào điểm chiếm.' }
  ]);

  NS.TutorialSteps = Object.freeze([
    ['Quan sát bản đồ', 'Kéo bản đồ hoặc dùng A/D để xem toàn tuyến. Các nhãn trên địa hình cho biết từng khu vực thực địa.'],
    ['Câu hỏi theo lượt', 'Khi bắt đầu lượt tấn công, trả lời một câu theo level. Trả lời sai vẫn được đánh nhưng sát thương giảm 50% trong lượt.'],
    ['Bắn pháo', 'Chọn đạn, chỉnh góc/lực rồi khai hỏa. Mỗi lượt pháo binh bắn một phát.'],
    ['Điều quân', 'Chọn bộ binh hoặc xe tăng, rồi dùng Di chuyển, Đào hầm hoặc Tấn công. Khi đã nhận lệnh, đơn vị tự bắn liên tục đến khi mục tiêu bị phá hoặc hết đạn.'],
    ['Đào hầm', 'Chọn một hoặc nhiều tổ bộ binh, bật Đào hầm rồi chọn vị trí. Các tổ được chọn cùng đào; khi hoàn thành, họ tự chui xuống hầm trú ẩn và được che chắn cao. Ra lệnh di chuyển hoặc tấn công để rời hầm.'],
    ['Chiếm cứ điểm', 'Vô hiệu hóa mục tiêu trọng yếu và đưa ít nhất một đơn vị bộ binh tới cờ mục tiêu.']
  ]);
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
