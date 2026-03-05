// AI Steam - API 服务
const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android 模拟器访问 localhost

// 通用请求方法
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// 认证相关类型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
  message?: string;
}

// 应用相关类型
export interface AIApp {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  screenshots: string[];
  developer: string;
  version: string;
  downloads: number;
  rating: number;
  reviews: number;
  isFree: boolean;
  features: string[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AppsResponse {
  success: boolean;
  apps: AIApp[];
  total: number;
}

// 收藏/下载相关
export interface FavoriteRequest {
  appId: string;
}

export interface FavoritesResponse {
  success: boolean;
  favorites: AIApp[];
}

// API 服务
export const api = {
  // 认证
  auth: {
    login: (data: LoginRequest) => 
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    
    register: (data: RegisterRequest) => 
      request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    
    me: (token: string) => 
      request<{ success: boolean; user: any }>('/auth/me', { 
        headers: { Authorization: `Bearer ${token}` } 
      }),
  },
  
  // 应用
  apps: {
    list: (category?: string) => {
      const endpoint = category && category !== 'all' 
        ? `/apps?category=${encodeURIComponent(category)}` 
        : '/apps';
      return request<AppsResponse>(endpoint);
    },
    
    get: (id: string) => 
      request<{ success: boolean; app: AIApp }>(`/apps/${id}`),
    
    search: (query: string) => 
      request<AppsResponse>(`/apps?search=${encodeURIComponent(query)}`),
    
    featured: () => 
      request<AppsResponse>('/apps/featured'),
    
    byCategory: (category: string) => 
      request<AppsResponse>(`/apps?category=${encodeURIComponent(category)}`),
  },
  
  // 用户功能
  user: {
    favorites: (token: string) => 
      request<FavoritesResponse>('/users/favorites', { 
        headers: { Authorization: `Bearer ${token}` } 
      }),
    
    addFavorite: (token: string, appId: string) => 
      request<{ success: boolean }>('/users/favorites', { 
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appId }),
      }),
    
    removeFavorite: (token: string, appId: string) => 
      request<{ success: boolean }>(`/users/favorites/${appId}`, { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` } 
      }),
    
    downloads: (token: string) => 
      request<{ success: boolean; downloads: any[] }>('/users/downloads', { 
        headers: { Authorization: `Bearer ${token}` } 
      }),
    
    addDownload: (token: string, appId: string) => 
      request<{ success: boolean }>('/users/downloads', { 
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appId }),
      }),
  },
};

// 存储 Token
export const TokenStorage = {
  get: async (): Promise<string | null> => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem('auth_token');
    } catch {
      return null;
    }
  },
  
  set: async (token: string): Promise<void> => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('auth_token', token);
  },
  
  remove: async (): Promise<void> => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('auth_token');
  },
};

export default api;
