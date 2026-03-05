// 应用类型定义
export interface AIApp {
  id: string;
  name: string;
  description: string;
  category: AppCategory;
  icon: string;
  screenshots: string[];
  developer: string;
  version: string;
  downloads: number;
  rating: number;
  reviews: number;
  isFree: boolean;
  price?: number;
  apkUrl?: string;
  apiUrl?: string;
  features: string[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type AppCategory = 
  | 'image generation'
  | 'text processing'
  | 'voice synthesis'
  | 'code assistant'
  | 'video generation'
  | 'audio processing'
  | 'productivity'
  | 'entertainment'
  | 'other';

export interface Review {
  id: string;
  appId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  favorites: string[];
  downloads: string[];
  isDeveloper: boolean;
}
