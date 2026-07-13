(function (NS) {
  'use strict';

  const PROFILE_KEY = 'duongToiChienThangProfileV2';
  const LEGACY_PROFILE_KEY = 'duongToiChienThangProfileV1';

  NS.CampaignMissions = Object.freeze([
    Object.freeze({
      id: 'him-lam', order: 1, name: 'Đồi Him Lam', subtitle: 'Trận mở màn chiến dịch', reward: 14000, enemyScale: 0.9,
      period: '13/3/1954',
      description: 'Xuất phát trong rừng, vượt đất trống, mở dây thép gai rồi chế áp lô cốt và trận địa pháo địch trên đồi.',
      historicalSummary: 'Him Lam là mục tiêu mở màn của Chiến dịch Điện Biên Phủ. Bản đồ là sơ đồ 2D giản lược, ưu tiên thể hiện hướng tiếp cận và các lớp phòng ngự chính.',
      mapCaption: 'Rừng → đất trống → dây thép gai → lô cốt → pháo địch.'
    }),
    Object.freeze({
      id: 'doc-lap', order: 2, name: 'Đồi Độc Lập', subtitle: 'Cửa ngõ phía Bắc', reward: 18000, enemyScale: 1,
      period: '15/3/1954',
      description: 'Từ rừng tiến lên sườn đồi trống, mở bãi mìn và hàng rào trước khi đánh lô cốt, ụ súng và pháo địch.',
      historicalSummary: 'Độc Lập là trung tâm đề kháng ở phía Bắc. Game nhấn mạnh khó khăn của việc tiến công từ địa hình thấp lên sườn đồi trống có chướng ngại.',
      mapCaption: 'Rừng → sườn đồi trống → bãi mìn → hàng rào → lô cốt → ụ súng → pháo địch.'
    }),
    Object.freeze({
      id: 'c1', order: 3, name: 'Đồi C1', subtitle: 'Cao điểm phía Đông', reward: 22000, enemyScale: 1.08,
      period: 'Đợt 2 của chiến dịch',
      description: 'Xuất phát từ chiến hào, mở nhiều lớp mìn và hàng rào đan xen rồi đánh lô cốt, ụ súng và pháo địch trên cao điểm.',
      historicalSummary: 'C1 thuộc hệ thống cao điểm phía Đông phân khu trung tâm. Bản đồ tập trung vào mạng chướng ngại dày và cách tiến công từng bước có hào che chắn.',
      mapCaption: 'Chiến hào xuất phát → mìn và hàng rào đan xen → lô cốt → ụ súng → pháo địch.'
    }),
    Object.freeze({
      id: 'muong-thanh-airfield', order: 4, name: 'Sân bay Mường Thanh', subtitle: 'Cắt cầu hàng không', reward: 26000, enemyScale: 1.12,
      period: 'Đợt 2–3 của chiến dịch',
      description: 'Từ chiến hào tiến ra đường băng, vô hiệu hóa xe tăng bảo vệ và dùng pháo bắn hạ máy bay tiếp tế.',
      historicalSummary: 'Sân bay Mường Thanh là đầu mối tiếp tế quan trọng. Game mô phỏng việc áp sát bằng chiến hào, khống chế đường băng và ngăn tiếp tế đường không.',
      mapCaption: 'Chiến hào xuất phát → đường băng → xe tăng địch → bắn máy bay.'
    }),
    Object.freeze({
      id: 'de-castries-hq', order: 5, name: 'Hầm De Castries', subtitle: 'Mục tiêu cuối chiến dịch', reward: 34000, enemyScale: 1.22,
      period: '7/5/1954',
      description: 'Xuất phát từ hầm, vượt cầu Mường Thanh, mở dây thép gai và bãi mìn, đánh xe tăng, lô cốt, pháo địch rồi chiếm hầm chỉ huy.',
      historicalSummary: 'Hầm chỉ huy De Castries nằm gần cầu Mường Thanh trong lòng chảo. Bản đồ là mô hình chiến thuật giản lược cho trận đánh mục tiêu cuối.',
      mapCaption: 'Hầm → cầu Mường Thanh → dây thép gai → bãi mìn → xe tăng → lô cốt → pháo địch → hầm chỉ huy.'
    })
  ]);

  NS.ShopItems = Object.freeze([
    Object.freeze({ id: 'tank-count', category: 'tank', name: 'Số xe tăng yểm trợ', icon: '▰', basePrice: 18000, maxLevel: 2, unit: 'xe', description: 'Mỗi cấp mở thêm 1 xe tăng yểm trợ; tối đa 3 xe.' }),
    Object.freeze({ id: 'tank-ammo', category: 'tank', name: 'Cơ số đạn xe tăng', icon: '◆', basePrice: 7000, maxLevel: 5, unit: 'viên/xe', description: 'Mỗi xe có tối thiểu 10 viên; mỗi cấp tăng thêm 1 viên, tối đa 15 viên/xe.' }),
    Object.freeze({ id: 'infantry-size', category: 'infantry', name: 'Quân số mỗi đại đội', icon: '♟', basePrice: 6000, maxLevel: 8, unit: 'người/đơn vị', description: 'Mỗi cấp tăng 1 bộ binh cho mỗi đơn vị; từ 10 lên tối đa 18.' }),
    Object.freeze({ id: 'ammo-he', category: 'artillery', ammo: 'he', name: 'Cơ số đạn nổ mạnh', icon: 'HE', basePrice: 4500, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn nổ mạnh.' }),
    Object.freeze({ id: 'ammo-ap', category: 'artillery', ammo: 'ap', name: 'Cơ số đạn xuyên phá', icon: 'AP', basePrice: 5200, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn xuyên phá.' }),
    Object.freeze({ id: 'ammo-smoke', category: 'artillery', ammo: 'smoke', name: 'Cơ số đạn khói', icon: 'SMK', basePrice: 4000, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn khói.' }),
    Object.freeze({ id: 'ammo-breach', category: 'artillery', ammo: 'breach', name: 'Cơ số đạn phá rào', icon: 'BR', basePrice: 4800, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn phá hàng rào.' }),
    Object.freeze({ id: 'ammo-cluster', category: 'artillery', ammo: 'cluster', name: 'Cơ số đạn chùm', icon: 'CL', basePrice: 6000, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn chùm.' })
  ]);

  function defaultProfile() {
    return {
      version: 2,
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
    profile.completedMissions = profile.completedMissions.map((id) => id === 'muong-thanh-hq' ? 'de-castries-hq' : id);
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
    if (profile.selectedMission === 'muong-thanh-hq') profile.selectedMission = 'de-castries-hq';
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
      try {
        const raw = localStorage.getItem(PROFILE_KEY) || localStorage.getItem(LEGACY_PROFILE_KEY) || 'null';
        return normalizeProfile(JSON.parse(raw));
      } catch (error) { return defaultProfile(); }
    },

    saveProfile(profile) {
      const normalized = normalizeProfile(profile);
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized)); } catch (error) { /* local file có thể chặn storage */ }
      return normalized;
    },

    resetProfile() { const profile = defaultProfile(); this.saveProfile(profile); return profile; },
    getMission(id) { return NS.CampaignMissions.find((mission) => mission.id === id) || NS.CampaignMissions[0]; },
    isMissionUnlocked(profile, missionId) {
      const mission = this.getMission(missionId);
      if (!mission || mission.order <= 1) return true;
      const previous = NS.CampaignMissions.find((item) => item.order === mission.order - 1);
      return Boolean(previous && profile && profile.completedMissions.includes(previous.id));
    },
    getTankMaxShells(profile) { return 10 + Math.max(0, Math.min(5, profile.purchases.tankAmmoLevel || 0)); },
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
        if (unit.type === 'tank') { unit.maxShells = tankMax; unit.shells = tankMax; unit.shotsRemaining = tankMax; }
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
