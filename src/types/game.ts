export type Season = 'Xuân' | 'Hạ' | 'Thu' | 'Đông';
export type Weather = 'Nắng Đẹp' | 'Mưa Rào' | 'Gió Mát';

export type ItemCategory = 'tool' | 'seed' | 'crop' | 'animal_product' | 'fish' | 'food' | 'material';

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  buyPrice?: number;
  sellPrice?: number;
  energyRestore?: number;
  growDays?: number;
  seasons?: Season[];
  cropId?: string;
  regrowDays?: number;
  iconKey: string;
  color: string;
}

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

export interface PlotState {
  r: number;
  c: number;
  state: 'grass' | 'tilled' | 'planted';
  watered: boolean;
  seedId?: string;
  cropId?: string;
  daysGrown: number;
  growDaysNeeded: number;
  readyToHarvest: boolean;
}

export interface AnimalData {
  id: string;
  type: 'chicken' | 'cow';
  name: string;
  fedToday: boolean;
  pettedToday: boolean;
  hasProduct: boolean;
  affection: number; // 0 - 100
  x: number;
  y: number;
}

export interface QuestData {
  id: string;
  title: string;
  description: string;
  giver: string;
  type: 'till' | 'water' | 'harvest' | 'sell' | 'fish' | 'talk' | 'buy_animal' | 'collect_egg';
  targetId?: string;
  currentCount: number;
  requiredCount: number;
  rewardGold: number;
  rewardItem?: { itemId: string; quantity: number };
  completed: boolean;
  claimed: boolean;
}

export interface NPCRelationship {
  id: string;
  name: string;
  role: string;
  hearts: number; // 0 - 10
  talkedToday: boolean;
  giftedToday: boolean;
  favoriteItems: string[];
  portraitKey: string;
}

export interface ToolLevels {
  hoe: number;      // 1: Thường, 2: Đồng, 3: Bạc, 4: Vàng
  watering: number; // 1: Thường, 2: Đồng, 3: Bạc, 4: Vàng
  axe: number;
  rod: number;
}

export interface GameSettings {
  bgmVolume: number;
  sfxVolume: number;
  muted: boolean;
  showGridHint: boolean;
  touchControls: 'auto' | 'always' | 'off';
}

export interface DailyReport {
  day: number;
  season: Season;
  cropsSoldCount: number;
  goldEarnedToday: number;
  questsCompletedToday: number;
}

export interface GameState {
  playerName: string;
  farmName: string;
  day: number;
  season: Season;
  year: number;
  timeMinutes: number; // 360 (06:00) -> 1440 (24:00)
  weather: Weather;
  gold: number;
  totalGoldEarned: number;
  energy: number;
  maxEnergy: number;
  selectedSlot: number; // 0 - 8 (hotbar), up to 23 in backpack
  inventory: (InventorySlot | null)[];
  plots: Record<string, PlotState>; // key "r,c"
  unlockedSouthField: boolean;
  animals: AnimalData[];
  quests: QuestData[];
  npcs: Record<string, NPCRelationship>;
  toolLevels: ToolLevels;
  shippingBin: InventorySlot[]; // Items placed in shipping bin today or sold
  dailyEarnings: number;
  dailySoldCount: number;
  settings: GameSettings;
  stats: {
    cropsHarvested: number;
    fishCaught: number;
    daysPlayed: number;
  };
}
