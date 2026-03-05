// 像素农产 - 常量配置 (复古8位风格)
export const COLORS = {
  // 调色板 - 复古像素风
  sky: '#5C94FC',           // 经典蓝天
  ground: '#C84C0C',        // 土地棕
  grass: '#00A800',         // 草地绿
  dirt: '#AC7C00',         // 泥土
  stone: '#7C7C7C',        // 石头灰
  water: '#3030FF',         // 水蓝
  fire: '#FF0',            // 火红
  coin: '#FFD700',          // 金币黄
  uiBg: '#000000',         // UI黑
  uiBorder: '#FFFFFF',      // UI白边框
  text: '#FFFFFF',         // 文字白
  textShadow: '#000000',   // 文字阴影
  
  // 季节配色
  spring: '#00FF00',
  summer: '#FFFF00',
  autumn: '#FF8800',
  winter: '#00FFFF',
};

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASONS: Record<Season, { name: string; bg: string; cropBonus: number }> = {
  spring: { name: '春', bg: '#98D98E', cropBonus: 1.0 },
  summer: { name: '夏', bg: '#F8D878', cropBonus: 1.5 },
  autumn: { name: '秋', bg: '#D8A048', cropBonus: 1.2 },
  winter: { name: '冬', bg: '#B8B8D0', cropBonus: 0.5 },
};

// 作物 (像素风格emoji)
export type CropType = 'carrot' | 'tomato' | 'corn' | 'watermelon' | 'pumpkin' | 'strawberry';

export const CROPS: Record<CropType, { 
  name: string; 
  seedPrice: number; 
  sellPrice: number; 
  daysToGrow: number; 
  sprite: string;
}> = {
  carrot: { name: '胡萝卜', seedPrice: 10, sellPrice: 25, daysToGrow: 2, sprite: '🥕' },
  tomato: { name: '番茄', seedPrice: 20, sellPrice: 50, daysToGrow: 3, sprite: '🍅' },
  corn: { name: '玉米', seedPrice: 30, sellPrice: 80, daysToGrow: 4, sprite: '🌽' },
  watermelon: { name: '西瓜', seedPrice: 50, sellPrice: 150, daysToGrow: 5, sprite: '🍉' },
  pumpkin: { name: '南瓜', seedPrice: 40, sellPrice: 120, daysToGrow: 3, sprite: '🎃' },
  strawberry: { name: '草莓', seedPrice: 25, sellPrice: 60, daysToGrow: 2, sprite: '🍓' },
};

// 动物
export type AnimalType = 'chicken' | 'cow' | 'sheep' | 'pig';

export const ANIMALS: Record<AnimalType, { 
  name: string; 
  price: number; 
  product: string; 
  productPrice: number; 
  sprite: string;
}> = {
  chicken: { name: '小鸡', price: 100, product: '鸡蛋', productPrice: 20, sprite: '🐤' },
  cow: { name: '奶牛', price: 300, product: '牛奶', productPrice: 50, sprite: '🐄' },
  sheep: { name: '绵羊', price: 500, product: '羊毛', productPrice: 80, sprite: '🐑' },
  pig: { name: '小猪', price: 400, product: '猪肉', productPrice: 100, sprite: '🐖' },
};

// 工具
export type ToolType = 'hoe' | 'water' | 'harvest' | 'sickle';

export const TOOLS: Record<ToolType, { name: string; sprite: string; key: string }> = {
  hoe: { name: '锄头', sprite: '⛏️', key: '1' },
  water: { name: '水壶', sprite: '🚿', key: '2' },
  harvest: { name: '镰刀', sprite: '🌾', key: '3' },
  sickle: { name: '剪刀', sprite: '✂️', key: '4' },
};

// 地形
export type TerrainType = 'grass' | 'soil' | 'water' | 'stone' | 'path';

export const TERRAIN: Record<TerrainType, { sprite: string; color: string }> = {
  grass: { sprite: '🌱', color: '#00A800' },
  soil: { sprite: '🟫', color: '#8B4513' },
  water: { sprite: '🌊', color: '#3030FF' },
  stone: { sprite: '🪨', color: '#7C7C7C' },
  path: { sprite: '🟨', color: '#C8A048' },
};

// 成长阶段
export type GrowthStage = 'seed' | 'sprout' | 'growing' | 'mature' | 'ripe';

export const GROWTH_SPRITES: Record<GrowthStage, string> = {
  seed: '🟤',      // 种子
  sprout: '🌱',     // 发芽
  growing: '🌿',   // 生长中
  mature: '🌳',    // 成熟
  ripe: '🌾',      // 可收获
};

// 玩家状态
export interface Player {
  gold: number;
  day: number;
  season: Season;
  inventory: Record<CropType, number>;
  tools: ToolType[];
}

// 地块状态
export interface Plot {
  id: number;
  terrain: TerrainType;
  crop: CropType | null;
  growthDay: number;
  watered: boolean;
  hasItem: boolean;
}

// 动物
export interface Animal {
  id: number;
  type: AnimalType;
  name: string;
  fed: boolean;
  productReady: boolean;
}

// NPC
export interface NPC {
  id: number;
  name: string;
  dialogue: string;
  quest: string | null;
  x: number;
  y: number;
}

// 地图元素
export interface MapObject {
  id: number;
  type: 'tree' | 'rock' | 'flower' | 'chest';
  x: number;
  y: number;
}
