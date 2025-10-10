// src/store/auth.ts - 认证状态管理
// 使用 Pinia 进行状态管理
import { defineStore } from 'pinia';

// 用户信息接口定义
interface UserProfile {
  id: string;        // 用户ID
  name: string;      // 用户名
  role: 'admin' | 'editor' | 'viewer'; // 用户角色
}

// 认证状态接口定义
interface AuthState {
  token: string | null;     // 认证令牌
  user: UserProfile | null; // 用户信息
}

// 定义认证 store
export const useAuthStore = defineStore('auth', {
  // 状态初始化
  state: (): AuthState => ({
    // 从 localStorage 中获取 token，如果不存在则为 null
    token: localStorage.getItem('token'),
    // 从 localStorage 中获取用户信息，如果不存在则为 null
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null
  }),
  
  // 计算属性
  getters: {
    // 判断用户是否已认证（是否有 token）
    isAuthenticated: (state) => Boolean(state.token)
  },
  
  // 修改状态的方法
  actions: {
    // 用户登录：保存 token 和用户信息到状态和 localStorage
    login(token: string, user: UserProfile) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    
    // 用户登出：清除 token 和用户信息
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});