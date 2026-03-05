// 指尖忆战 - 游戏常量配置

export const COLORS = {
  primary: '#9B59B6',     // 霓虹紫
  secondary: '#E91E63',   // 霓虹粉
  success: '#00FF88',     // 霓虹绿
  error: '#FF3366',       // 霓虹红
  warning: '#FFDD00',     // 霓虹黄
  background: '#0D0D1A',   // 深黑背景
  card: '#1A1A2E',        // 卡片背景
  text: '#FFFFFF',
  textSecondary: '#888899',
};

// 游戏模式类型
export type GameMode = 'classic' | 'rhythm' | 'shoot' | '连线' | '射箭' | '分类';

// 模式配置
export const MODE_CONFIG: Record<GameMode, {
  name: string;
  emoji: string;
  desc: string;
  unlockLevel: number;
  color: string;
}> = {
  classic: { name: '经典记忆格', emoji: '🧠', desc: '找出所有目标格子', unlockLevel: 0, color: '#9B59B6' },
  rhythm: { name: '节奏格', emoji: '🎵', desc: '跟随节拍点击', unlockLevel: 5, color: '#E91E63' },
  shoot: { name: '投篮格', emoji: '🏀', desc: '节奏投篮', unlockLevel: 10, color: '#FF9800' },
  '连线': { name: '连线格', emoji: '🔗', desc: '画出连线路径', unlockLevel: 15, color: '#00BCD4' },
  '射箭': { name: '射箭格', emoji: '🏹', desc: '精准射击', unlockLevel: 20, color: '#4CAF50' },
  '分类': { name: '分类格', emoji: '🗂️', desc: '分类归位', unlockLevel: 25, color: '#673AB7' },
};

// 主题配置
export const THEMES = {
  cybercat: {
    name: '赛博猫',
    bg: ['#0D0D1A', '#1A1A2E', '#2D1B4E'],
    card: '#1A1A2E',
    highlight: '#FF00FF',
    emoji: ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐱', '🐈', '🐈‍⬛'],
  },
  neon: {
    name: '霓虹都市',
    bg: ['#0F0F23', '#1A1A3E', '#2D2D5A'],
    card: '#1E1E3F',
    highlight: '#00FF88',
    emoji: ['🌃', '🌆', '🌉', '🏙️', '🌌', '💫', '⭐', '🌟', '💡', '🔮', '🪐', '🚀'],
  },
  ocean: {
    name: '深海世界',
    bg: ['#0A1628', '#0D2847', '#103A5C'],
    card: '#0D2847',
    highlight: '#00BFFF',
    emoji: ['🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🦈', '🐢', '🐊'],
  },
  space: {
    name: '太空漫游',
    bg: ['#0D0D1A', '#1A0A2E', '#2D0A3D'],
    card: '#1A0A2E',
    highlight: '#9B59B6',
    emoji: ['🚀', '🛸', '🌍', '🌙', '⭐', '🌟', '💫', '☄️', '🪐', '🔭', '👨‍🚀', '👩‍🚀'],
  },
};

export type ThemeType = keyof typeof THEMES;

// 难度配置
export const DIFFICULTY = {
  3: { gridSize: 3, targetCount: 3, showTime: 3000 },
  4: { gridSize: 3, targetCount: 4, showTime: 2800 },
  5: { gridSize: 4, targetCount: 4, showTime: 2600 },
  6: { gridSize: 4, targetCount: 5, showTime: 2400 },
  7: { gridSize: 4, targetCount: 6, showTime: 2200 },
  8: { gridSize: 5, targetCount: 6, showTime: 2000 },
  9: { gridSize: 5, targetCount: 7, showTime: 1800 },
  10: { gridSize: 5, targetCount: 8, showTime: 1600 },
};
