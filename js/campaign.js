(function (NS) {
  'use strict';

  const PROFILE_KEY = 'duongToiChienThangProfileV1';

  NS.CampaignMissions = Object.freeze([
    Object.freeze({
      id: 'him-lam', order: 1, name: 'Cứ điểm Him Lam', subtitle: 'Trận mở màn chiến dịch', reward: 14000, enemyScale: 0.9,
      period: '13/3/1954',
      description: 'Mô phỏng tuyến tiến công từ rừng, vượt sông Nậm Rốm, qua đất trống, bãi mìn và dây thép gai để đánh lô cốt, chiến hào và hầm chỉ huy trên đồi.',
      historicalSummary: 'Him Lam là mục tiêu mở màn của Chiến dịch Điện Biên Phủ. Bản đồ trong game là sơ đồ chiến thuật giản lược, nhấn mạnh các lớp chướng ngại và địa hình đồi.',
      mapCaption: 'Rừng → sông Nậm Rốm → đất trống → bãi mìn → dây thép gai → lô cốt ngoài → chiến hào → hầm chỉ huy.'
    }),
    Object.freeze({
      id: 'doc-lap', order: 2, name: 'Cứ điểm Độc Lập', subtitle: 'Cửa ngõ phía Bắc', reward: 18000, enemyScale: 1,
      period: '15/3/1954',
      description: 'Xuất phát từ khu tập kết, vượt đồng trống và chân đồi, mở bãi mìn–dây thép gai, phá công sự vòng ngoài rồi đánh lên lô cốt và hầm chỉ huy trên đỉnh.',
      historicalSummary: 'Độc Lập là một trung tâm đề kháng ở phía Bắc. Game tái hiện đặc trưng tiến công từ địa hình thấp lên một cao điểm có nhiều lớp phòng ngự.',
      mapCaption: 'Khu tập kết → đồng trống → chân đồi → bãi mìn và dây thép gai → công sự vòng ngoài → chiến hào → lô cốt trên đỉnh → hầm chỉ huy.'
    }),
    Object.freeze({
      id: 'muong-thanh-airfield', order: 3, name: 'Sân bay Mường Thanh', subtitle: 'Cắt cầu hàng không', reward: 23000, enemyScale: 1.08,
      period: 'Đợt 2–3 của chiến dịch',
      description: 'Đào hào lấn dần, phá các cứ điểm bảo vệ, bố trí pháo khống chế đường băng và ngăn máy bay tiếp tế.',
      historicalSummary: 'Sân bay Mường Thanh là đầu mối tiếp tế quan trọng của tập đoàn cứ điểm. Bản đồ nhấn mạnh chiến thuật đào hào tiếp cận và khống chế đường băng.',
      mapCaption: 'Đào hào → phá cứ điểm bảo vệ → bố trí pháo → khống chế đường băng → ngăn máy bay.'
    }),
    Object.freeze({
      id: 'muong-thanh-hq', order: 4, name: 'Sở chỉ huy Mường Thanh', subtitle: 'Mục tiêu cuối', reward: 30000, enemyScale: 1.18,
      period: '7/5/1954',
      description: 'Siết chiến hào bao vây trong lòng chảo, phá công sự vòng ngoài, ụ súng và xe tăng, vượt chiến hào trung tâm rồi chiếm hầm chỉ huy.',
      historicalSummary: 'Phân khu trung tâm nằm trong lòng chảo Mường Thanh với hệ thống công sự liên hoàn. Game sử dụng sơ đồ giản lược để người chơi dễ thao tác.',
      mapCaption: 'Chiến hào bao vây → công sự vòng ngoài → ụ súng và xe tăng → chiến hào trung tâm → hầm trú ẩn → hầm chỉ huy.'
    })
  ]);

  NS.ShopItems = Object.freeze([
    Object.freeze({ id: 'tank-count', category: 'tank', name: 'Số xe tăng yểm trợ', icon: '▰', basePrice: 18000, maxLevel: 2, unit: 'xe', description: 'Mỗi cấp mở thêm 1 xe tăng yểm trợ; tối đa 3 xe.' }),
    Object.freeze({ id: 'tank-ammo', category: 'tank', name: 'Cơ số đạn xe tăng', icon: '◆', basePrice: 7000, maxLevel: 5, unit: 'viên/xe', description: 'Mỗi cấp tăng 1 viên cho mỗi xe; từ 3 lên tối đa 8 viên.' }),
    Object.freeze({ id: 'infantry-size', category: 'infantry', name: 'Quân số mỗi đại đội', icon: '♟', basePrice: 6000, maxLevel: 8, unit: 'người/đơn vị', description: 'Mỗi cấp tăng 1 bộ binh cho mỗi đơn vị; từ 10 lên tối đa 18.' }),
    Object.freeze({ id: 'ammo-he', category: 'artillery', ammo: 'he', name: 'Cơ số đạn nổ mạnh', icon: 'HE', basePrice: 4500, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn nổ mạnh.' }),
    Object.freeze({ id: 'ammo-ap', category: 'artillery', ammo: 'ap', name: 'Cơ số đạn xuyên phá', icon: 'AP', basePrice: 5200, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn xuyên phá.' }),
    Object.freeze({ id: 'ammo-smoke', category: 'artillery', ammo: 'smoke', name: 'Cơ số đạn khói', icon: 'SMK', basePrice: 4000, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn khói.' }),
    Object.freeze({ id: 'ammo-breach', category: 'artillery', ammo: 'breach', name: 'Cơ số đạn phá rào', icon: 'BR', basePrice: 4800, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn phá hàng rào.' }),
    Object.freeze({ id: 'ammo-cluster', category: 'artillery', ammo: 'cluster', name: 'Cơ số đạn chùm', icon: 'CL', basePrice: 6000, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn chùm.' })
  ]);

  function defaultProfile() {
    return {
      version: 1,
      coins: 50000,
      completedMissions: [],
      purchases: {
        tankCount: 1,
        tankAmmoLevel: 0,
        infantryLevel: 0,
        artilleryAmmoLevels: { he: 0, ap: 0, smoke: 0, breach: 0, cluster: 0 }
      },
      loadout: { tanks: 1, infantryPerSquad: 10 },
      history: [],
      selectedMission: 'him-lam',
      selectedLevel: 'easy',
      recentQuestionIds: []
    };
  }

  function normalizeProfile(raw) {
    const defaults = defaultProfile();
    const profile = Object.assign({}, defaults, raw || {});
    profile.coins = Math.max(0, Math.round(Number(profile.coins) || 0));
    profile.completedMissions = Array.isArray(profile.completedMissions) ? profile.completedMissions.filter(Boolean) : [];
    profile.history = Array.isArray(profile.history) ? profile.history.slice(0, 100) : [];
    profile.recentQuestionIds = Array.isArray(profile.recentQuestionIds) ? profile.recentQuestionIds.slice(-12) : [];
    profile.purchases = Object.assign({}, defaults.purchases, raw && raw.purchases || {});
    profile.purchases.artilleryAmmoLevels = Object.assign({}, defaults.purchases.artilleryAmmoLevels, profile.purchases.artilleryAmmoLevels || {});
    profile.purchases.tankCount = Math.max(1, Math.min(3, Math.round(Number(profile.purchases.tankCount) || 1)));
    profile.purchases.tankAmmoLevel = Math.max(0, Math.min(5, Math.round(Number(profile.purchases.tankAmmoLevel) || 0)));
    profile.purchases.infantryLevel = Math.max(0, Math.min(8, Math.round(Number(profile.purchases.infantryLevel) || 0)));
    Object.keys(profile.purchases.artilleryAmmoLevels).forEach((key) => {
      profile.purchases.artilleryAmmoLevels[key] = Math.max(0, Math.min(5, Math.round(Number(profile.purchases.artilleryAmmoLevels[key]) || 0)));
    });
    const maxInfantry = 10 + profile.purchases.infantryLevel;
    profile.loadout = Object.assign({}, defaults.loadout, raw && raw.loadout || {});
    profile.loadout.tanks = Math.max(1, Math.min(profile.purchases.tankCount, Math.round(Number(profile.loadout.tanks) || 1)));
    profile.loadout.infantryPerSquad = Math.max(8, Math.min(maxInfantry, Math.round(Number(profile.loadout.infantryPerSquad) || maxInfantry)));
    if (!NS.MapConfigs[profile.selectedMission]) profile.selectedMission = 'him-lam';
    if (!NS.Difficulty[profile.selectedLevel]) profile.selectedLevel = 'easy';
    return profile;
  }

  function itemLevel(profile, item) {
    if (item.id === 'tank-count') return profile.purchases.tankCount - 1;
    if (item.id === 'tank-ammo') return profile.purchases.tankAmmoLevel;
    if (item.id === 'infantry-size') return profile.purchases.infantryLevel;
    if (item.ammo) return profile.purchases.artilleryAmmoLevels[item.ammo] || 0;
    return 0;
  }

  const Campaign = {
    loadProfile() {
      try { return normalizeProfile(JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null')); }
      catch (error) { return defaultProfile(); }
    },

    saveProfile(profile) {
      const normalized = normalizeProfile(profile);
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized)); } catch (error) { /* local file có thể chặn storage */ }
      return normalized;
    },

    resetProfile() { const profile = defaultProfile(); this.saveProfile(profile); return profile; },
    getMission(id) { return NS.CampaignMissions.find((mission) => mission.id === id) || NS.CampaignMissions[0]; },
    isMissionUnlocked() { return true; },
    getTankMaxShells(profile) { return 3 + Math.max(0, Math.min(5, profile.purchases.tankAmmoLevel || 0)); },
    getMaxInfantryPerSquad(profile) { return 10 + Math.max(0, Math.min(8, profile.purchases.infantryLevel || 0)); },

    getItemState(profile, item) {
      const level = itemLevel(profile, item);
      return { level, max: item.maxLevel, owned: level >= item.maxLevel };
    },

    getItemPrice(profile, item) {
      const level = itemLevel(profile, item);
      return Math.round(item.basePrice * (1 + level * 0.62));
    },

    getItemValue(profile, item) {
      if (item.id === 'tank-count') return `${profile.purchases.tankCount} xe`;
      if (item.id === 'tank-ammo') return `${this.getTankMaxShells(profile)} viên/xe`;
      if (item.id === 'infantry-size') return `${this.getMaxInfantryPerSquad(profile)} người/đơn vị`;
      if (item.ammo) return `${NS.AmmoTypes[item.ammo].baseCount + itemLevel(profile, item) * 2} viên`;
      return '';
    },

    buy(profile, itemId) {
      const item = NS.ShopItems.find((entry) => entry.id === itemId);
      if (!item) return { ok: false, message: 'Không tìm thấy mặt hàng.' };
      const state = this.getItemState(profile, item);
      if (state.owned) return { ok: false, message: 'Mặt hàng đã đạt mức tối đa.' };
      const price = this.getItemPrice(profile, item);
      if (profile.coins < price) return { ok: false, message: 'Không đủ xu.' };
      profile.coins -= price;
      if (item.id === 'tank-count') profile.purchases.tankCount += 1;
      else if (item.id === 'tank-ammo') profile.purchases.tankAmmoLevel += 1;
      else if (item.id === 'infantry-size') profile.purchases.infantryLevel += 1;
      else if (item.ammo) profile.purchases.artilleryAmmoLevels[item.ammo] += 1;
      profile.loadout.tanks = Math.min(profile.loadout.tanks, profile.purchases.tankCount);
      profile.loadout.infantryPerSquad = Math.min(profile.loadout.infantryPerSquad, this.getMaxInfantryPerSquad(profile));
      this.saveProfile(profile);
      return { ok: true, message: `Đã mua nâng cấp “${item.name}”.`, price };
    },

    updateLoadout(profile, patch) {
      if (patch && Number.isFinite(Number(patch.tanks))) {
        profile.loadout.tanks = Math.max(1, Math.min(profile.purchases.tankCount, Math.round(Number(patch.tanks))));
      }
      if (patch && Number.isFinite(Number(patch.infantryPerSquad))) {
        profile.loadout.infantryPerSquad = Math.max(8, Math.min(this.getMaxInfantryPerSquad(profile), Math.round(Number(patch.infantryPerSquad))));
      }
      return this.saveProfile(profile);
    },

    applyMissionLoadout(profile, mission, game) {
      const tankMax = this.getTankMaxShells(profile);
      game.squads.forEach((unit) => {
        if (unit.type === 'tank') { unit.maxShells = tankMax; unit.shells = tankMax; unit.shotsRemaining = 1; }
      });
      game.resources.ammo = NS.createInitialAmmo(profile);
      const difficulty = NS.Difficulty[game.difficulty] || NS.Difficulty.medium;
      const scale = mission.enemyScale * difficulty.enemyScale;
      game.fortresses.forEach((structure) => {
        const scaledMax = Math.max(1, Math.round(structure.maxHealth * scale));
        structure.maxHealth = scaledMax;
        structure.health = scaledMax;
        if (structure.attackDamage) structure.attackDamage *= Math.max(0.8, scale);
      });
    },

    getRandomQuestion(profile, difficulty) {
      const pool = (NS.QuizQuestions || []).filter((item) => item.difficulty === difficulty);
      if (!pool.length) return null;
      let available = pool.filter((item) => !profile.recentQuestionIds.includes(item.id));
      if (!available.length) available = pool;
      const question = available[Math.floor(Math.random() * available.length)];
      profile.recentQuestionIds.push(question.id);
      profile.recentQuestionIds = profile.recentQuestionIds.slice(-12);
      this.saveProfile(profile);
      return question;
    },

    recordResult(profile, payload) {
      const mission = this.getMission(payload.missionId);
      const difficulty = NS.Difficulty[payload.level] || NS.Difficulty.easy;
      let reward = 0;
      if (payload.victory) {
        const bonus = payload.level === 'hard' ? 1.55 : payload.level === 'medium' ? 1.25 : 1;
        reward = Math.round((mission.reward + Math.max(0, (payload.score || 0) * 0.45)) * bonus);
        profile.coins += reward;
        if (!profile.completedMissions.includes(mission.id)) profile.completedMissions.push(mission.id);
      }
      profile.history.unshift({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        missionId: mission.id,
        missionName: mission.name,
        victory: Boolean(payload.victory),
        level: payload.level || 'easy',
        levelLabel: difficulty.label,
        turns: Math.max(1, Number(payload.turns) || 1),
        score: Math.max(0, Math.round(Number(payload.score) || 0)),
        reward,
        date: new Date().toISOString()
      });
      profile.history = profile.history.slice(0, 100);
      this.saveProfile(profile);
      return reward;
    }
  };

  NS.Campaign = Campaign;
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
