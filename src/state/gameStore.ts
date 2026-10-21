import type { GameState, InventorySlot, PlotState, Season, Weather, DailyReport, QuestData } from '../types/game';
import { ITEMS, INITIAL_QUESTS, INITIAL_NPCS, TOOL_UPGRADE_INFO } from '../data/gameData';
import { soundManager } from '../utils/sound';

const SAVE_KEY = 'nong_trai_mong_mo_save_v1';

// Khu vực ruộng ban đầu: r từ 8 đến 13, c từ 9 đến 20 (6x12 = 72 ô)
// Khu vực ruộng mở rộng phía Nam: r từ 15 đến 18, c từ 9 đến 20 (4x12 = 48 ô)
export function createInitialPlots(unlockedSouth: boolean = false): Record<string, PlotState> {
  const plots: Record<string, PlotState> = {};
  for (let r = 8; r <= 13; r++) {
    for (let c = 9; c <= 20; c++) {
      const key = `${r},${c}`;
      plots[key] = {
        r,
        c,
        state: 'grass',
        watered: false,
        daysGrown: 0,
        growDaysNeeded: 0,
        readyToHarvest: false
      };
    }
  }
  if (unlockedSouth) {
    for (let r = 15; r <= 18; r++) {
      for (let c = 9; c <= 20; c++) {
        const key = `${r},${c}`;
        plots[key] = {
          r,
          c,
          state: 'grass',
          watered: false,
          daysGrown: 0,
          growDaysNeeded: 0,
          readyToHarvest: false
        };
      }
    }
  }

  // Tạo sẵn 12 ô ruộng mẫu đa dạng cây trồng để nông trại trù phú ngay khi vào
  plots['9,9'] = {
    r: 9,
    c: 9,
    state: 'planted',
    watered: true,
    seedId: 'seed_turnip',
    cropId: 'crop_turnip',
    daysGrown: 2,
    growDaysNeeded: 2,
    readyToHarvest: true
  };
  plots['9,10'] = {
    r: 9,
    c: 10,
    state: 'planted',
    watered: true,
    seedId: 'seed_strawberry',
    cropId: 'crop_strawberry',
    daysGrown: 4,
    growDaysNeeded: 4,
    readyToHarvest: true
  };
  plots['9,11'] = {
    r: 9,
    c: 11,
    state: 'planted',
    watered: true,
    seedId: 'seed_carrot',
    cropId: 'crop_carrot',
    daysGrown: 2,
    growDaysNeeded: 3,
    readyToHarvest: false
  };
  plots['9,12'] = {
    r: 9,
    c: 12,
    state: 'planted',
    watered: true,
    seedId: 'seed_sunflower',
    cropId: 'crop_sunflower',
    daysGrown: 4,
    growDaysNeeded: 4,
    readyToHarvest: true
  };
  plots['9,13'] = {
    r: 9,
    c: 13,
    state: 'planted',
    watered: true,
    seedId: 'seed_corn',
    cropId: 'crop_corn',
    daysGrown: 3,
    growDaysNeeded: 4,
    readyToHarvest: false
  };
  plots['9,14'] = {
    r: 9,
    c: 14,
    state: 'planted',
    watered: true,
    seedId: 'seed_cabbage',
    cropId: 'crop_cabbage',
    daysGrown: 3,
    growDaysNeeded: 3,
    readyToHarvest: true
  };
  plots['10,9'] = {
    r: 10,
    c: 9,
    state: 'planted',
    watered: true,
    seedId: 'seed_potato',
    cropId: 'crop_potato',
    daysGrown: 1,
    growDaysNeeded: 3,
    readyToHarvest: false
  };
  plots['10,10'] = {
    r: 10,
    c: 10,
    state: 'planted',
    watered: false,
    seedId: 'seed_tomato',
    cropId: 'crop_tomato',
    daysGrown: 2,
    growDaysNeeded: 4,
    readyToHarvest: false
  };
  plots['10,11'] = {
    r: 10,
    c: 11,
    state: 'planted',
    watered: true,
    seedId: 'seed_pumpkin',
    cropId: 'crop_pumpkin',
    daysGrown: 2,
    growDaysNeeded: 4,
    readyToHarvest: false
  };
  plots['10,12'] = {
    r: 10,
    c: 12,
    state: 'planted',
    watered: true,
    seedId: 'seed_blueberry',
    cropId: 'crop_blueberry',
    daysGrown: 3,
    growDaysNeeded: 4,
    readyToHarvest: false
  };
  plots['10,13'] = {
    r: 10,
    c: 13,
    state: 'tilled',
    watered: false,
    daysGrown: 0,
    growDaysNeeded: 0,
    readyToHarvest: false
  };
  plots['10,14'] = {
    r: 10,
    c: 14,
    state: 'tilled',
    watered: true,
    daysGrown: 0,
    growDaysNeeded: 0,
    readyToHarvest: false
  };

  return plots;
}

export function createInitialGameState(): GameState {
  const inventory: (InventorySlot | null)[] = Array(24).fill(null);
  inventory[0] = { itemId: 'tool_hoe', quantity: 1 };
  inventory[1] = { itemId: 'tool_watering', quantity: 1 };
  inventory[2] = { itemId: 'tool_scythe', quantity: 1 };
  inventory[3] = { itemId: 'tool_axe', quantity: 1 };
  inventory[4] = { itemId: 'tool_rod', quantity: 1 };
  inventory[5] = { itemId: 'seed_turnip', quantity: 8 };
  inventory[6] = { itemId: 'seed_carrot', quantity: 6 };
  inventory[7] = { itemId: 'seed_strawberry', quantity: 4 };
  inventory[8] = { itemId: 'item_fodder', quantity: 6 };
  inventory[9] = { itemId: 'food_bread', quantity: 2 };

  return {
    playerName: 'An Nhiên',
    farmName: 'Nông Trại Mộng Mơ',
    day: 1,
    season: 'Xuân',
    year: 1,
    timeMinutes: 390, // 06:30 sáng
    weather: 'Nắng Đẹp',
    gold: 450,
    totalGoldEarned: 450,
    energy: 100,
    maxEnergy: 100,
    selectedSlot: 0,
    inventory,
    plots: createInitialPlots(false),
    unlockedSouthField: false,
    animals: [
      {
        id: 'animal_chicken_1',
        type: 'chicken',
        name: 'Gà Mơ Trắng',
        fedToday: true,
        pettedToday: false,
        hasProduct: true,
        affection: 30,
        x: 2 * 32 + 16,
        y: 11 * 32 + 16
      },
      {
        id: 'animal_chicken_2',
        type: 'chicken',
        name: 'Gà Ri Nâu',
        fedToday: false,
        pettedToday: false,
        hasProduct: false,
        affection: 25,
        x: 4 * 32 + 16,
        y: 12 * 32 + 16
      },
      {
        id: 'animal_chicken_3',
        type: 'chicken',
        name: 'Gà Tơ Vàng',
        fedToday: true,
        pettedToday: false,
        hasProduct: true,
        affection: 35,
        x: 5 * 32 + 16,
        y: 13 * 32 + 16
      },
      {
        id: 'animal_cow_1',
        type: 'cow',
        name: 'Bò Sữa Mây',
        fedToday: false,
        pettedToday: false,
        hasProduct: true,
        affection: 25,
        x: 3 * 32 + 16,
        y: 6 * 32 + 16
      },
      {
        id: 'animal_cow_2',
        type: 'cow',
        name: 'Bò Sữa Nâu',
        fedToday: true,
        pettedToday: false,
        hasProduct: false,
        affection: 30,
        x: 5 * 32 + 16,
        y: 7 * 32 + 16
      },
      {
        id: 'animal_cow_3',
        type: 'cow',
        name: 'Bò Kem Tươi',
        fedToday: true,
        pettedToday: false,
        hasProduct: true,
        affection: 40,
        x: 3 * 32 + 16,
        y: 8 * 32 + 16
      }
    ],
    quests: JSON.parse(JSON.stringify(INITIAL_QUESTS)),
    npcs: JSON.parse(JSON.stringify(INITIAL_NPCS)),
    toolLevels: {
      hoe: 1,
      watering: 1,
      axe: 1,
      rod: 1
    },
    shippingBin: [],
    dailyEarnings: 0,
    dailySoldCount: 0,
    settings: {
      bgmVolume: 0.4,
      sfxVolume: 0.7,
      muted: false,
      showGridHint: true,
      touchControls: 'auto'
    },
    stats: {
      cropsHarvested: 0,
      fishCaught: 0,
      daysPlayed: 1
    }
  };
}

type Listener = () => void;
type ToastListener = (msg: string, type?: 'info' | 'success' | 'warning' | 'gold') => void;
type ModalListener = (modal: string | null, payload?: unknown) => void;

class GameStore {
  private state: GameState;
  private listeners: Set<Listener> = new Set();
  private toastListeners: Set<ToastListener> = new Set();
  private modalListeners: Set<ModalListener> = new Set();
  public lastDailyReport: DailyReport | null = null;

  constructor() {
    this.state = createInitialGameState();
  }

  public getState(): GameState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public onToast(listener: ToastListener): () => void {
    this.toastListeners.add(listener);
    return () => this.toastListeners.delete(listener);
  }

  public onModalRequest(listener: ModalListener): () => void {
    this.modalListeners.add(listener);
    return () => this.modalListeners.delete(listener);
  }

  public notify() {
    this.listeners.forEach((l) => l());
  }

  public showToast(msg: string, type: 'info' | 'success' | 'warning' | 'gold' = 'info') {
    this.toastListeners.forEach((l) => l(msg, type));
  }

  public requestModal(modal: string | null, payload?: unknown) {
    this.modalListeners.forEach((l) => l(modal, payload));
  }

  public hasSaveFile(): boolean {
    try {
      return Boolean(localStorage.getItem(SAVE_KEY));
    } catch {
      return false;
    }
  }

  public saveGame(silent: boolean = false): boolean {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      if (!silent) {
        soundManager.playSfx('quest');
        this.showToast('Đã lưu tiến trình thành công!', 'success');
      }
      return true;
    } catch {
      if (!silent) {
        this.showToast('Không thể lưu dữ liệu vào trình duyệt.', 'warning');
      }
      return false;
    }
  }

  public loadGame(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as GameState;
      if (parsed && parsed.inventory && parsed.plots) {
        const initial = createInitialGameState();
        // Hợp nhất lưới ruộng mở rộng mới (Cols 9..20) với tiến trình trồng trọt đã lưu
        const basePlots = createInitialPlots(Boolean(parsed.unlockedSouthField));
        const mergedPlots: Record<string, PlotState> = { ...basePlots };
        Object.entries(parsed.plots).forEach(([k, p]) => {
          // Bỏ các ô cột 8 chưa trồng cây để nhường chỗ cho lối đi cạnh Khu Chăn Nuôi mở rộng
          if (p.c === 8 && p.state === 'grass') return;
          mergedPlots[k] = p;
        });

        // Nếu bản save cũ có ít hơn 6 vật nuôi, tự động bổ sung thêm từ đàn vật nuôi khởi đầu
        const existingAnimals = Array.isArray(parsed.animals) ? [...parsed.animals] : [];
        initial.animals.forEach((initAnimal) => {
          if (!existingAnimals.some((a) => a.id === initAnimal.id) && existingAnimals.length < 6) {
            existingAnimals.push(initAnimal);
          }
        });

        this.state = {
          ...initial,
          ...parsed,
          plots: mergedPlots,
          animals: existingAnimals
        };
        soundManager.updateSettings(
          this.state.settings.bgmVolume,
          this.state.settings.sfxVolume,
          this.state.settings.muted
        );
        this.notify();
        this.showToast('Đã tải tiến trình nông trại!', 'success');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public resetNewGame() {
    this.state = createInitialGameState();
    this.saveGame(true);
    this.notify();
    this.showToast('Chào mừng bạn đến với Nông Trại Mộng Mơ!', 'success');
  }

  public setSelectedSlot(index: number) {
    if (index >= 0 && index < 24) {
      this.state.selectedSlot = index;
      soundManager.playSfx('click');
      this.notify();
    }
  }

  public swapInventorySlots(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= 24 || toIdx >= 24) return;
    const temp = this.state.inventory[fromIdx];
    this.state.inventory[fromIdx] = this.state.inventory[toIdx];
    this.state.inventory[toIdx] = temp;
    soundManager.playSfx('click');
    this.notify();
  }

  public getSelectedItem() {
    const slot = this.state.inventory[this.state.selectedSlot];
    if (!slot) return null;
    return {
      slot,
      def: ITEMS[slot.itemId]
    };
  }

  public addItem(itemId: string, quantity: number = 1): boolean {
    if (quantity <= 0) return true;
    // Cộng dồn vào ô đã có
    for (let i = 0; i < this.state.inventory.length; i++) {
      const s = this.state.inventory[i];
      if (s && s.itemId === itemId && ITEMS[itemId]?.category !== 'tool') {
        s.quantity += quantity;
        this.notify();
        return true;
      }
    }
    // Tìm ô trống
    for (let i = 0; i < this.state.inventory.length; i++) {
      if (!this.state.inventory[i]) {
        this.state.inventory[i] = { itemId, quantity };
        this.notify();
        return true;
      }
    }
    this.showToast('Túi đồ đã đầy! Hãy bán bớt nông sản.', 'warning');
    return false;
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    for (let i = 0; i < this.state.inventory.length; i++) {
      const s = this.state.inventory[i];
      if (s && s.itemId === itemId) {
        if (s.quantity < quantity) return false;
        s.quantity -= quantity;
        if (s.quantity <= 0) {
          this.state.inventory[i] = null;
        }
        this.notify();
        return true;
      }
    }
    return false;
  }

  public getItemCount(itemId: string): number {
    return this.state.inventory.reduce((sum, s) => (s && s.itemId === itemId ? sum + s.quantity : sum), 0);
  }

  public consumeEnergy(amount: number): boolean {
    if (this.state.energy < amount) {
      soundManager.playSfx('error');
      this.showToast('Bạn đã thấm mệt! Hãy ăn món ngon hoặc về nhà nghỉ ngơi.', 'warning');
      return false;
    }
    this.state.energy = Math.max(0, Math.round((this.state.energy - amount) * 10) / 10);
    this.notify();
    return true;
  }

  public eatSelectedItem(): boolean {
    const selected = this.getSelectedItem();
    if (!selected || !selected.def.energyRestore) return false;
    if (this.state.energy >= this.state.maxEnergy) {
      this.showToast('Thể lực của bạn đang tràn đầy!', 'info');
      return false;
    }
    const restore = selected.def.energyRestore;
    this.removeItem(selected.def.id, 1);
    this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + restore);
    soundManager.playSfx('eat');
    this.showToast(`Đã thưởng thức ${selected.def.name} (+${restore} Thể lực)!`, 'success');
    this.notify();
    return true;
  }

  public advanceTime(minutes: number) {
    this.state.timeMinutes += minutes;
    if (this.state.timeMinutes >= 1440) {
      this.showToast('Trời đã khuya (24:00), bạn trở về nhà nghỉ ngơi...', 'info');
      this.sleepAndAdvanceDay();
    } else {
      this.notify();
    }
  }

  public incrementQuestProgress(type: QuestData['type'], targetId?: string, amount: number = 1) {
    let anyCompleted = false;
    this.state.quests.forEach((q) => {
      if (q.completed || q.type !== type) return;
      if (q.targetId && q.targetId !== targetId) return;
      q.currentCount = Math.min(q.requiredCount, q.currentCount + amount);
      if (q.currentCount >= q.requiredCount && !q.completed) {
        q.completed = true;
        anyCompleted = true;
        soundManager.playSfx('quest');
        this.showToast(`Hoàn thành nhiệm vụ: "${q.title}"! Nhấn Nhiệm Vụ để nhận thưởng.`, 'gold');
      }
    });
    if (anyCompleted) {
      this.saveGame(true);
    }
    this.notify();
  }

  public claimQuestReward(questId: string) {
    const quest = this.state.quests.find((q) => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;
    quest.claimed = true;
    this.state.gold += quest.rewardGold;
    this.state.totalGoldEarned += quest.rewardGold;
    if (quest.rewardItem) {
      this.addItem(quest.rewardItem.itemId, quest.rewardItem.quantity);
    }
    soundManager.playSfx('coin');
    this.showToast(`Nhận thưởng nhiệm vụ: +${quest.rewardGold} Vàng!`, 'gold');
    this.saveGame(true);
    this.notify();
  }

  // THAO TÁC TRÊN Ô RUỘNG (FARMING ACTIONS)
  public interactWithPlot(r: number, c: number): { action: string; cropId?: string } {
    const key = `${r},${c}`;
    const plot = this.state.plots[key];
    if (!plot) return { action: 'none' };

    const selected = this.getSelectedItem();

    // Nếu cây đã chín, ưu tiên thu hoạch dù cầm bất kỳ công cụ gì (hoặc Liềm)
    if (plot.state === 'planted' && plot.readyToHarvest && plot.cropId) {
      const harvestedCropId = plot.cropId;
      const cropDef = ITEMS[harvestedCropId];
      if (!this.addItem(harvestedCropId, 1)) {
        return { action: 'inventory_full' };
      }
      plot.state = 'tilled';
      plot.watered = this.state.weather === 'Mưa Rào';
      plot.seedId = undefined;
      plot.cropId = undefined;
      plot.daysGrown = 0;
      plot.growDaysNeeded = 0;
      plot.readyToHarvest = false;
      this.state.stats.cropsHarvested += 1;
      soundManager.playSfx('harvest');
      this.showToast(`Thu hoạch +1 ${cropDef?.name || 'Nông sản'}!`, 'success');
      this.incrementQuestProgress('harvest', harvestedCropId, 1);
      this.saveGame(true);
      this.notify();
      return { action: 'harvested', cropId: harvestedCropId };
    }

    if (!selected) {
      this.showToast('Hãy chọn công cụ hoặc hạt giống trên thanh công cụ.', 'info');
      return { action: 'none' };
    }

    const { def } = selected;

    // 1. Dùng Cuốc Đất
    if (def.id === 'tool_hoe') {
      if (plot.state === 'grass') {
        const energyCost = Math.max(1, 3 - TOOL_UPGRADE_INFO[this.state.toolLevels.hoe].energySave);
        if (!this.consumeEnergy(energyCost)) return { action: 'no_energy' };
        plot.state = 'tilled';
        plot.watered = this.state.weather === 'Mưa Rào';
        soundManager.playSfx('till');
        this.incrementQuestProgress('till', undefined, 1);
        this.notify();
        return { action: 'tilled' };
      } else {
        this.showToast('Ô đất này đã được xới rồi! Hãy chọn hạt giống để gieo.', 'info');
        return { action: 'none' };
      }
    }

    // 2. Gieo Hạt Giống
    if (def.category === 'seed') {
      if (plot.state === 'grass') {
        // Hỗ trợ thông minh: Nếu đất chưa xới, tự động xới đất và gieo hạt luôn nếu đủ thể lực!
        const energyCost = Math.max(1, 3 - TOOL_UPGRADE_INFO[this.state.toolLevels.hoe].energySave);
        if (!this.consumeEnergy(energyCost)) return { action: 'no_energy' };
        plot.state = 'tilled';
      }
      if (plot.state === 'tilled') {
        if (!this.removeItem(def.id, 1)) return { action: 'none' };
        plot.state = 'planted';
        plot.seedId = def.id;
        plot.cropId = def.cropId;
        plot.daysGrown = 0;
        plot.growDaysNeeded = def.growDays || 2;
        plot.readyToHarvest = false;
        if (this.state.weather === 'Mưa Rào') {
          plot.watered = true;
        }
        soundManager.playSfx('seed');
        this.showToast(`Đã gieo ${def.name}! Nhớ tưới nước mỗi ngày nhé.`, 'info');
        this.notify();
        return { action: 'planted' };
      } else if (plot.state === 'planted') {
        const cropName = plot.cropId ? ITEMS[plot.cropId]?.name : 'Cây trồng';
        this.showToast(
          `${cropName}: Đã lớn ${plot.daysGrown}/${plot.growDaysNeeded} ngày ${plot.watered ? '(Đã tưới ẩm)' : '(Chưa tưới nước)'}`,
          'info'
        );
        return { action: 'inspect' };
      }
    }

    // 3. Dùng Bình Tưới Nước
    if (def.id === 'tool_watering') {
      if (plot.state === 'grass') {
        this.showToast('Hãy dùng Cuốc Đất xới ô ruộng trước khi tưới nước.', 'info');
        return { action: 'none' };
      }
      if (plot.watered) {
        this.showToast('Ô đất này đã được tưới đẫm nước hôm nay rồi.', 'info');
        return { action: 'none' };
      }
      const energyCost = Math.max(1, 2.5 - TOOL_UPGRADE_INFO[this.state.toolLevels.watering].energySave);
      if (!this.consumeEnergy(energyCost)) return { action: 'no_energy' };
      plot.watered = true;
      soundManager.playSfx('water');
      this.incrementQuestProgress('water', undefined, 1);
      this.notify();
      return { action: 'watered' };
    }

    // 4. Dùng Liềm khi cây chưa chín
    if (def.id === 'tool_scythe' && plot.state === 'planted' && !plot.readyToHarvest) {
      const cropName = plot.cropId ? ITEMS[plot.cropId]?.name : 'Cây trồng';
      this.showToast(
        `${cropName} đang lớn (${plot.daysGrown}/${plot.growDaysNeeded} ngày). Hãy tưới nước và đợi thêm nhé!`,
        'info'
      );
      return { action: 'inspect' };
    }

    return { action: 'none' };
  }

  // CHĂN NUÔI (ANIMALS)
  public interactWithAnimal(animalId: string): string {
    const animal = this.state.animals.find((a) => a.id === animalId);
    if (!animal) return 'none';

    // 1. Nếu có sản phẩm (Trứng / Sữa), thu hoạch ngay
    if (animal.hasProduct) {
      const prodId = animal.type === 'chicken' ? 'product_egg' : 'product_milk';
      const prodDef = ITEMS[prodId];
      if (this.addItem(prodId, 1)) {
        animal.hasProduct = false;
        animal.affection = Math.min(100, animal.affection + 8);
        soundManager.playSfx('harvest');
        this.showToast(`Thu hoạch +1 ${prodDef.name} từ ${animal.name}!`, 'success');
        if (animal.type === 'chicken') {
          this.incrementQuestProgress('collect_egg', undefined, 1);
        }
        this.saveGame(true);
        this.notify();
        return 'collected';
      }
      return 'full';
    }

    // 2. Nếu chưa ăn hôm nay và trong túi có Cỏ Khô Chăn Nuôi
    if (!animal.fedToday && this.getItemCount('item_fodder') > 0) {
      this.removeItem('item_fodder', 1);
      animal.fedToday = true;
      animal.affection = Math.min(100, animal.affection + 10);
      soundManager.playSfx('animal');
      this.showToast(`Đã cho ${animal.name} ăn Cỏ Khô Chăn Nuôi! Ngày mai sẽ có nông sản tươi.`, 'success');
      this.notify();
      return 'fed';
    }

    // 3. Vuốt ve thú cưng
    if (!animal.pettedToday) {
      animal.pettedToday = true;
      animal.affection = Math.min(100, animal.affection + 5);
      soundManager.playSfx('animal');
      const statusMsg = animal.fedToday
        ? `${animal.name} rất vui vẻ và đã ăn no hôm nay!`
        : `${animal.name} kêu mừng rỡ! Hãy mua Cỏ Khô Chăn Nuôi để cho ăn nhé.`;
      this.showToast(statusMsg, 'info');
      this.notify();
      return 'petted';
    }

    this.showToast(
      `${animal.name} (Độ thân thiết: ${animal.affection}/100) — ${
        animal.fedToday ? 'Đã ăn no, ngày mai sẽ cho thu hoạch!' : 'Đang đói, cần Cỏ Khô Chăn Nuôi.'
      }`,
      'info'
    );
    return 'inspected';
  }

  // MUA BÁN & NÂNG CẤP (SHOP & UPGRADES)
  public buyItem(itemId: string, quantity: number = 1): boolean {
    const def = ITEMS[itemId];
    if (!def || !def.buyPrice) return false;
    const totalCost = def.buyPrice * quantity;
    if (this.state.gold < totalCost) {
      soundManager.playSfx('error');
      this.showToast('Bạn không đủ Vàng để mua mặt hàng này!', 'warning');
      return false;
    }
    if (!this.addItem(itemId, quantity)) return false;
    this.state.gold -= totalCost;
    soundManager.playSfx('coin');
    this.showToast(`Đã mua ${quantity}x ${def.name} (-${totalCost} Vàng)`, 'gold');
    this.saveGame(true);
    this.notify();
    return true;
  }

  public sellItem(itemId: string, quantity: number = 1): boolean {
    const def = ITEMS[itemId];
    if (!def || !def.sellPrice || def.category === 'tool') return false;
    if (!this.removeItem(itemId, quantity)) return false;
    const earned = def.sellPrice * quantity;
    this.state.gold += earned;
    this.state.totalGoldEarned += earned;
    this.state.dailyEarnings += earned;
    this.state.dailySoldCount += quantity;
    soundManager.playSfx('coin');
    this.showToast(`Đã bán ${quantity}x ${def.name} (+${earned} Vàng)!`, 'gold');
    this.incrementQuestProgress('sell', undefined, quantity);
    this.saveGame(true);
    this.notify();
    return true;
  }

  public sellAllHarvestedCrops(): number {
    let totalEarned = 0;
    let totalCount = 0;
    for (let i = 0; i < this.state.inventory.length; i++) {
      const slot = this.state.inventory[i];
      if (!slot) continue;
      const def = ITEMS[slot.itemId];
      if (
        def &&
        def.sellPrice &&
        (def.category === 'crop' || def.category === 'animal_product' || def.category === 'fish')
      ) {
        totalEarned += def.sellPrice * slot.quantity;
        totalCount += slot.quantity;
        this.state.inventory[i] = null;
      }
    }
    if (totalCount > 0) {
      this.state.gold += totalEarned;
      this.state.totalGoldEarned += totalEarned;
      this.state.dailyEarnings += totalEarned;
      this.state.dailySoldCount += totalCount;
      soundManager.playSfx('coin');
      this.showToast(`Đã giao bán ${totalCount} nông sản thu về +${totalEarned} Vàng!`, 'gold');
      this.incrementQuestProgress('sell', undefined, totalCount);
      this.saveGame(true);
      this.notify();
    } else {
      this.showToast('Trong túi đồ chưa có nông sản, cá hay trứng sữa để bán.', 'info');
    }
    return totalEarned;
  }

  public upgradeTool(toolKey: keyof GameState['toolLevels']): boolean {
    const currentLevel = this.state.toolLevels[toolKey];
    if (currentLevel >= 4) {
      this.showToast('Công cụ này đã đạt cấp độ Hoàng Kim tối đa!', 'info');
      return false;
    }
    const nextLevel = currentLevel + 1;
    const info = TOOL_UPGRADE_INFO[nextLevel];
    if (this.state.gold < info.cost) {
      soundManager.playSfx('error');
      this.showToast(`Cần ${info.cost} Vàng để rèn nâng cấp lên ${info.name}!`, 'warning');
      return false;
    }
    this.state.gold -= info.cost;
    this.state.toolLevels[toolKey] = nextLevel;
    soundManager.playSfx('quest');
    this.showToast(`Đã rèn nâng cấp công cụ lên ${info.name}!`, 'gold');
    this.saveGame(true);
    this.notify();
    return true;
  }

  public unlockSouthField(): boolean {
    if (this.state.unlockedSouthField) return false;
    const cost = 450;
    if (this.state.gold < cost) {
      soundManager.playSfx('error');
      this.showToast(`Cần ${cost} Vàng để mở rộng Khu Ruộng Phía Nam!`, 'warning');
      return false;
    }
    this.state.gold -= cost;
    this.state.unlockedSouthField = true;
    for (let r = 15; r <= 18; r++) {
      for (let c = 9; c <= 20; c++) {
        const key = `${r},${c}`;
        if (!this.state.plots[key]) {
          this.state.plots[key] = {
            r,
            c,
            state: 'grass',
            watered: false,
            daysGrown: 0,
            growDaysNeeded: 0,
            readyToHarvest: false
          };
        }
      }
    }
    soundManager.playSfx('quest');
    this.showToast('Đã mở khóa Khu Ruộng Phía Nam (+48 ô đất màu mỡ)!', 'gold');
    this.saveGame(true);
    this.notify();
    return true;
  }

  public buyNewAnimal(type: 'chicken' | 'cow'): boolean {
    const cost = type === 'chicken' ? 220 : 480;
    if (this.state.gold < cost) {
      soundManager.playSfx('error');
      this.showToast(`Cần ${cost} Vàng để đón ${type === 'chicken' ? 'Gà Đẻ Trứng' : 'Bò Sữa'} mới!`, 'warning');
      return false;
    }
    if (this.state.animals.length >= 12) {
      this.showToast('Khu đồng cỏ chăn nuôi đã đạt tối đa 12 vật nuôi!', 'info');
      return false;
    }
    this.state.gold -= cost;
    const idx = this.state.animals.length + 1;
    const namesChicken = ['Gà Hoa Mơ', 'Gà Nâu Nhỏ', 'Gà Vàng Óng', 'Gà Trắng Mây', 'Gà Đốm Hoa'];
    const namesCow = ['Bò Sữa Bơ', 'Bò Đốm Trắng', 'Bò Kem Tươi', 'Bò Nâu Mật'];
    const name =
      type === 'chicken'
        ? namesChicken[idx % namesChicken.length]
        : namesCow[idx % namesCow.length];

    this.state.animals.push({
      id: `animal_${type}_${Date.now()}`,
      type,
      name,
      fedToday: true,
      pettedToday: false,
      hasProduct: false,
      affection: 25,
      x: (2 + (idx % 4)) * 32 + 16,
      y: (type === 'chicken' ? 11 + (idx % 3) : 6 + (idx % 3)) * 32 + 16
    });
    soundManager.playSfx('quest');
    this.showToast(`Chào mừng ${name} về với Khu Đồng Cỏ Nông Trại Mộng Mơ!`, 'gold');
    this.saveGame(true);
    this.notify();
    return true;
  }

  // NPC INTERACTION
  public talkToNPC(npcId: string) {
    const npc = this.state.npcs[npcId];
    if (!npc) return;
    if (!npc.talkedToday) {
      npc.talkedToday = true;
      npc.hearts = Math.min(10, Math.round((npc.hearts + 0.5) * 10) / 10);
      this.incrementQuestProgress('talk', undefined, 1);
    }
    soundManager.playSfx('click');
    this.notify();
    this.requestModal('npc_dialog', npcId);
  }

  public giftItemToNPC(npcId: string, itemId: string): boolean {
    const npc = this.state.npcs[npcId];
    const def = ITEMS[itemId];
    if (!npc || !def || def.category === 'tool') return false;
    if (npc.giftedToday) {
      this.showToast(`Hôm nay bạn đã tặng quà cho ${npc.name} rồi!`, 'info');
      return false;
    }
    if (!this.removeItem(itemId, 1)) return false;
    npc.giftedToday = true;
    const isFav = npc.favoriteItems.includes(itemId);
    npc.hearts = Math.min(10, Math.round((npc.hearts + (isFav ? 1.5 : 0.5)) * 10) / 10);
    soundManager.playSfx('quest');
    this.showToast(
      isFav
        ? `${npc.name} vô cùng yêu thích món quà ${def.name} của bạn! (+1.5 Tim)`
        : `${npc.name} c���m ơn món quà ${def.name} của bạn! (+0.5 Tim)`,
      'gold'
    );
    this.saveGame(true);
    this.notify();
    return true;
  }

  // CÂU CÁ & ĐỐN GỖ (FISHING & FORAGING)
  public catchFish(): string {
    const energyCost = Math.max(1.5, 4 - TOOL_UPGRADE_INFO[this.state.toolLevels.rod].energySave);
    if (!this.consumeEnergy(energyCost)) return 'no_energy';

    const roll = Math.random();
    let fishId = 'fish_perch';
    if (roll > 0.82) {
      fishId = 'fish_golden';
    } else if (roll > 0.4) {
      fishId = 'fish_carp';
    }

    const fishDef = ITEMS[fishId];
    if (this.addItem(fishId, 1)) {
      this.state.stats.fishCaught += 1;
      soundManager.playSfx('fish');
      this.showToast(`Tuyệt vời! Bạn đã câu được ${fishDef.name}!`, 'gold');
      this.incrementQuestProgress('fish', undefined, 1);
      this.saveGame(true);
      this.notify();
      return fishId;
    }
    return 'full';
  }

  public chopWood(): boolean {
    const energyCost = Math.max(1.5, 3.5 - TOOL_UPGRADE_INFO[this.state.toolLevels.axe].energySave);
    if (!this.consumeEnergy(energyCost)) return false;
    if (this.addItem('mat_wood', 1)) {
      soundManager.playSfx('till');
      this.showToast('Đã thu thập +1 Khúc Gỗ Thông!', 'success');
      this.notify();
      return true;
    }
    return false;
  }

  // CHUYỂN NGÀY MỚI (SLEEP & DAY TRANSITION)
  public sleepAndAdvanceDay() {
    soundManager.playSfx('sleep');

    const report: DailyReport = {
      day: this.state.day,
      season: this.state.season,
      cropsSoldCount: this.state.dailySoldCount,
      goldEarnedToday: this.state.dailyEarnings,
      questsCompletedToday: this.state.quests.filter((q) => q.completed).length
    };
    this.lastDailyReport = report;

    // 1. Tăng ngày và mùa (10 ngày mỗi mùa để người chơi dễ trải nghiệm trọn vẹn 4 mùa)
    this.state.day += 1;
    this.state.stats.daysPlayed += 1;
    const seasons: Season[] = ['Xuân', 'Hạ', 'Thu', 'Đông'];
    if (this.state.day > 10) {
      this.state.day = 1;
      const idx = seasons.indexOf(this.state.season);
      if (idx === 3) {
        this.state.season = 'Xuân';
        this.state.year += 1;
      } else {
        this.state.season = seasons[idx + 1];
      }
    }

    this.state.timeMinutes = 360; // 06:00 sáng
    this.state.energy = this.state.maxEnergy;
    this.state.dailyEarnings = 0;
    this.state.dailySoldCount = 0;

    // 2. Thời tiết ngày mới
    const weatherRoll = Math.random();
    let newWeather: Weather = 'Nắng Đẹp';
    if (weatherRoll < 0.25) {
      newWeather = 'Mưa Rào';
    } else if (weatherRoll < 0.45) {
      newWeather = 'Gió Mát';
    }
    this.state.weather = newWeather;

    // 3. Cập nhật cây trồng qua đêm
    Object.values(this.state.plots).forEach((plot) => {
      if (plot.state === 'planted') {
        if (plot.watered && !plot.readyToHarvest) {
          plot.daysGrown += 1;
          if (plot.daysGrown >= plot.growDaysNeeded) {
            plot.readyToHarvest = true;
          }
        }
      }
      // Nếu ngày mới trời mưa, tự động tưới ẩm toàn bộ ruộng đã xới/gieo!
      if (plot.state === 'tilled' || plot.state === 'planted') {
        plot.watered = newWeather === 'Mưa Rào';
      }
    });

    // 4. Cập nhật vật nuôi
    this.state.animals.forEach((animal) => {
      if (animal.fedToday) {
        animal.hasProduct = true;
      }
      animal.fedToday = false;
      animal.pettedToday = false;
    });

    // 5. Reset trạng thái trò chuyện NPC
    Object.values(this.state.npcs).forEach((npc) => {
      npc.talkedToday = false;
      npc.giftedToday = false;
    });

    this.saveGame(true);
    this.notify();
    this.requestModal('daily_report', report);
  }

  public updateSettings(partial: Partial<GameState['settings']>) {
    this.state.settings = {
      ...this.state.settings,
      ...partial
    };
    soundManager.updateSettings(
      this.state.settings.bgmVolume,
      this.state.settings.sfxVolume,
      this.state.settings.muted
    );
    this.saveGame(true);
    this.notify();
  }
}

export const gameStore = new GameStore();
