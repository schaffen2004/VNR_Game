(function (NS) {
  'use strict';

  const PROFILE_KEY = 'duongToiChienThangProfileV2';
  const LEGACY_PROFILE_KEY = 'duongToiChienThangProfileV1';

  NS.CampaignMissions = Object.freeze([
    Object.freeze({
      id: 'him-lam', order: 1, name: 'Đồi Him Lam', subtitle: 'Trận mở màn chiến dịch', reward: 14000, enemyScale: 0.9,
      guideAudio: 'assets/sounds/guides/him-lam.mp3',
      period: '13/3/1954',
      description: 'Theo Wikipedia, Him Lam là cứ điểm Béatrice và là nơi cuộc tiến công mở màn bắt đầu ngày 13/3/1954. Sau đợt pháo kích dữ dội và xung phong trong đêm, quân ta đánh chiếm cứ điểm này, mở ra giai đoạn đầu của trận Điện Biên Phủ.',
      historicalSummary: 'Cứ điểm Him Lam, tên quân sự của Pháp là Beatrice, nằm ở phía bắc tập đoàn cứ điểm Điện Biên Phủ và cách trung tâm Mường Thanh khoảng 2,5 km. Đây là một trong ba cứ điểm thuộc phân khu Bắc, được quân Pháp xây dựng với hệ thống hầm ngầm, chiến hào, lô cốt và nhiều lớp hàng rào dây thép gai để tạo thành tuyến phòng thủ tiền tiêu bảo vệ cửa ngõ phía bắc của toàn bộ tập đoàn cứ điểm. Với vị trí khống chế các hướng tiếp cận từ Tuần Giáo vào Điện Biên, Him Lam được xem là lá chắn đầu tiên ngăn cản cuộc tiến công vào trung tâm Mường Thanh. Ngày 13/3/1954, Bộ Chỉ huy Chiến dịch Điện Biên Phủ chọn Him Lam làm mục tiêu mở màn. Sau nhiều giờ chiến đấu quyết liệt với sự phối hợp giữa pháo binh và bộ binh, quân ta đã tiêu diệt hoàn toàn cứ điểm này, mở ra bước ngoặt đầu tiên cho chiến dịch và làm lung lay hệ thống phòng thủ của quân Pháp.',
      mapCaption: 'Rừng → đất trống → dây thép gai → lô cốt → pháo địch.'
    }),
    Object.freeze({
      id: 'doc-lap', order: 2, name: 'Đồi Độc Lập', subtitle: 'Cửa ngõ phía Bắc', reward: 18000, enemyScale: 1,
      guideAudio: 'assets/sounds/guides/doc-lap.mp3',
      period: '15/3/1954',
      description: 'Theo Wikipedia, Đồi Độc Lập là cứ điểm Gabrielle, bị tiến công ngay sau Him Lam. Sau một đêm giao tranh lớn và nỗ lực phản kích không thành của quân Pháp, cứ điểm này bị bỏ lại vào sáng 15/3/1954.',
      historicalSummary: 'Cứ điểm Độc Lập, tên quân sự của Pháp là Gabrielle, nằm ở phía đông bắc tập đoàn cứ điểm Điện Biên Phủ, cách Him Lam khoảng 2 km và cách trung tâm Mường Thanh gần 4 km. Cùng với Him Lam và Bản Kéo, Độc Lập tạo thành tuyến phòng thủ phía Bắc có nhiệm vụ cảnh giới từ xa, ngăn chặn các mũi tiến công của Quân đội Nhân dân Việt Nam và bảo vệ trực tiếp khu trung tâm chỉ huy của quân Pháp. Cứ điểm được xây dựng trên địa hình cao, có hệ thống công sự kiên cố, nhiều lớp hàng rào thép gai, bãi mìn và hỏa lực mạnh, đồng thời được hỗ trợ bởi pháo binh và xe tăng từ Mường Thanh. Sau khi Him Lam bị tiêu diệt, Độc Lập trở thành mục tiêu tiếp theo trong kế hoạch phá vỡ tuyến phòng thủ vòng ngoài của quân Pháp. Đêm 14 rạng sáng 15/3/1954, quân ta mở cuộc tiến công quyết liệt và nhanh chóng làm chủ cứ điểm. Việc đánh chiếm Độc Lập đã làm tan rã hoàn toàn phân khu Bắc, buộc quân Pháp phải co cụm về khu trung tâm, đồng thời tạo điều kiện để quân ta chuyển sang giai đoạn tiến công các cụm cứ điểm trọng yếu ở phía Đông.',
      mapCaption: 'Rừng → sườn đồi trống → bãi mìn → hàng rào → lô cốt → ụ súng → pháo địch.'
    }),
    Object.freeze({
      id: 'c1', order: 3, name: 'Đồi C1', subtitle: 'Cao điểm phía Đông', reward: 22000, enemyScale: 1.08,
      guideAudio: 'assets/sounds/guides/c1.mp3',
      period: 'Đợt 2 của chiến dịch',
      description: 'Theo Wikipedia, C1 nằm trong cụm cao điểm phía đông, khu vực mà giao tranh kéo dài và dữ dội nhất quanh trung tâm Điện Biên Phủ. Tại đây, quân ta liên tục đào hào áp sát, đánh lấn từng bước và làm suy kiệt lực lượng phòng thủ Pháp.',
      historicalSummary: 'Đồi C1, tên quân sự của Pháp là Eliane 1, là một trong những cao điểm quan trọng thuộc cụm cứ điểm phía Đông của tập đoàn cứ điểm Điện Biên Phủ. Nằm gần trung tâm Mường Thanh, C1 cùng với các cao điểm A1, C2, D1 và E tạo thành vành đai phòng thủ vững chắc bảo vệ sở chỉ huy của tướng Christian de Castries. Từ đỉnh đồi, quân Pháp có thể quan sát và kiểm soát hầu hết các hướng tiến công của quân ta vào khu trung tâm, đồng thời phối hợp hỏa lực với các cứ điểm lân cận để tạo thành mạng lưới phòng thủ liên hoàn. Vì vậy, C1 được xây dựng với nhiều lớp chiến hào, hầm ngầm và công sự kiên cố. Trong giai đoạn hai của Chiến dịch Điện Biên Phủ, từ cuối tháng 3 đến đầu tháng 5/1954, đồi C1 trở thành chiến trường diễn ra nhiều trận chiến giằng co ác liệt giữa hai bên. Sau khi các cao điểm xung quanh lần lượt bị quân ta đánh chiếm, đặc biệt là đồi A1, quân Pháp không còn khả năng giữ vững C1. Việc làm chủ cao điểm này đã góp phần hoàn thiện vòng vây quanh Mường Thanh và tạo điều kiện cho cuộc tổng tiến công cuối cùng.',
      mapCaption: 'Chiến hào xuất phát → mìn và hàng rào đan xen → lô cốt → ụ súng → pháo địch.'
    }),
    Object.freeze({
      id: 'muong-thanh-airfield', order: 4, name: 'Sân bay Mường Thanh', subtitle: 'Cắt cầu hàng không', reward: 26000, enemyScale: 1.12,
      guideAudio: 'assets/sounds/guides/muong-thanh-airfield.mp3',
      period: 'Đợt 2–3 của chiến dịch',
      description: 'Theo Wikipedia, sân bay Mường Thanh là trục tiếp tế sống còn của quân Pháp trong lòng chảo Điện Biên. Khi pháo phòng không và hỏa lực mặt đất của Việt Minh khống chế đường băng, việc hạ cánh trở nên nguy hiểm và sân bay dần mất tác dụng.',
      historicalSummary: 'Sân bay Mường Thanh nằm ở trung tâm lòng chảo Điện Biên, ngay cạnh sở chỉ huy của quân Pháp và là căn cứ hậu cần quan trọng nhất của tập đoàn cứ điểm Điện Biên Phủ. Đây là sân bay dã chiến được quân Pháp mở rộng để phục vụ việc vận chuyển quân, tiếp tế lương thực, vũ khí, đạn dược và sơ tán thương binh hoàn toàn bằng đường hàng không. Do Điện Biên Phủ nằm cách xa các căn cứ lớn của Pháp và bị bao quanh bởi địa hình núi cao, sân bay Mường Thanh giữ vai trò là huyết mạch quyết định khả năng duy trì sức chiến đấu của toàn bộ tập đoàn cứ điểm. Nhận thức được tầm quan trọng đó, ngay từ đầu chiến dịch, pháo binh Quân đội Nhân dân Việt Nam đã tập trung hỏa lực bắn phá liên tục, khiến sân bay nhanh chóng bị tê liệt. Khi máy bay không còn thể hạ cánh, quân Pháp chỉ có thể tiếp tế bằng cách thả dù, nhưng phần lớn vật tư lại rơi vào khu vực do quân ta kiểm soát. Việc vô hiệu hóa sân bay Mường Thanh đã cắt đứt tuyến hậu cần chủ yếu của đối phương, góp phần làm suy yếu nghiêm trọng khả năng phòng thủ của quân Pháp trong những tuần cuối chiến dịch.',
      mapCaption: 'Chiến hào xuất phát → đường băng → xe tăng địch → bắn máy bay.'
    }),
    Object.freeze({
      id: 'de-castries-hq', order: 5, name: 'Hầm De Castries', subtitle: 'Mục tiêu cuối chiến dịch', reward: 34000, enemyScale: 1.22,
      guideAudio: 'assets/sounds/guides/de-castries-hq.mp3',
      period: '7/5/1954',
      description: 'Theo Wikipedia, hầm De Castries là sở chỉ huy trung tâm của quân Pháp tại Điện Biên Phủ. Chiều 7/5/1954, khi các vị trí còn lại bị tràn ngập, tướng De Castries điện về Hà Nội báo tình hình tuyệt vọng trước khi toàn bộ trung tâm đề kháng sụp đổ.',
      historicalSummary: 'Hầm De Castries là sở chỉ huy trung tâm của tập đoàn cứ điểm Điện Biên Phủ, nằm giữa cánh đồng Mường Thanh và được bao bọc bởi hệ thống cứ điểm phòng ngự dày đặc. Đây là nơi làm việc của tướng Christian de Castries, Chỉ huy trưởng tập đoàn cứ điểm, cùng toàn bộ Bộ tham mưu quân Pháp. Hầm được xây dựng kiên cố bằng gỗ, bê tông, bao cát và các lớp đất dày để chống pháo kích, đồng thời được kết nối với hệ thống giao thông hào và hầm ngầm dẫn đến các cứ điểm xung quanh nhằm bảo đảm khả năng chỉ huy trong mọi tình huống. Trong suốt chiến dịch, mọi mệnh lệnh điều động quân, tổ chức phòng thủ và liên lạc với Bộ chỉ huy Pháp tại Hà Nội đều được phát đi từ hầm này. Sau gần 56 ngày đêm chiến đấu, khi các cứ điểm trọng yếu xung quanh lần lượt bị tiêu diệt và hệ thống phòng thủ trung tâm bị phá vỡ, chiều 7/5/1954 các đơn vị Quân đội Nhân dân Việt Nam tiến vào khu trung tâm Mường Thanh, chiếm hầm chỉ huy và bắt sống tướng De Castries cùng toàn bộ Bộ tham mưu. Sự kiện này đánh dấu sự sụp đổ hoàn toàn của tập đoàn cứ điểm Điện Biên Phủ và trở thành biểu tượng cho thắng lợi lịch sử của quân và dân Việt Nam trong cuộc kháng chiến chống thực dân Pháp.',
      mapCaption: 'Hầm → cầu Mường Thanh → dây thép gai → bãi mìn → xe tăng → lô cốt → pháo địch → hầm chỉ huy.'
    })
  ]);

  NS.ShopItems = Object.freeze([
    Object.freeze({ id: 'tank-count', category: 'tank', name: 'Số xe tăng yểm trợ', icon: 'XE', basePrice: 18000, maxLevel: 2, unit: 'xe', description: 'Mỗi cấp mở thêm 1 xe tăng yểm trợ; tối đa 3 xe.' }),
    Object.freeze({ id: 'tank-ammo', category: 'tank', name: 'Cơ số đạn xe tăng', icon: 'ĐN', basePrice: 7000, maxLevel: 5, unit: 'viên/xe', description: 'Mỗi xe có tối thiểu 10 viên; mỗi cấp tăng thêm 1 viên, tối đa 15 viên/xe.' }),
    Object.freeze({ id: 'infantry-size', category: 'infantry', name: 'Quân số mỗi đại đội', icon: 'BB', basePrice: 6000, maxLevel: 8, unit: 'người/đơn vị', description: 'Mỗi cấp tăng 1 bộ binh cho mỗi đơn vị; từ 10 lên tối đa 18.' }),
    Object.freeze({ id: 'ammo-he', category: 'artillery', ammo: 'he', name: 'Cơ số đạn nổ mạnh', icon: 'HE', basePrice: 4500, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn nổ mạnh.' }),
    Object.freeze({ id: 'ammo-ap', category: 'artillery', ammo: 'ap', name: 'Cơ số đạn xuyên phá', icon: 'AP', basePrice: 5200, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn xuyên phá.' }),
    Object.freeze({ id: 'ammo-smoke', category: 'artillery', ammo: 'smoke', name: 'Cơ số đạn khói', icon: 'KH', basePrice: 4000, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn khói.' }),
    Object.freeze({ id: 'ammo-breach', category: 'artillery', ammo: 'breach', name: 'Cơ số đạn phá rào', icon: 'PR', basePrice: 4800, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn phá hàng rào.' }),
    Object.freeze({ id: 'ammo-cluster', category: 'artillery', ammo: 'cluster', name: 'Cơ số đạn chùm', icon: 'CH', basePrice: 6000, maxLevel: 5, description: 'Mỗi cấp tăng 2 viên đạn chùm.' })
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
