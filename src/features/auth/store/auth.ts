// src/features/auth/store/auth.ts - 认证状态管理
// 使用 Pinia 进行状态管理
import { defineStore } from 'pinia';
import authAPI, { type AuthUser } from '@/features/auth/api/auth';

// 用户信息接口定义
export type UserProfile = AuthUser;

// 认证状态接口定义
interface AuthState {
  user: UserProfile | null;   // 用户信息
  sessionChecked: boolean;    // 是否已检查会话状态
}

// 定义认证 store
export const useAuthStore = defineStore('auth', {
  // 状态初始化
  state: (): AuthState => ({
    user: null,
    sessionChecked: false
  }),
  
  // 计算属性
  getters: {
    // 判断用户是否已认证（是否有有效会话）
    isAuthenticated: (state) => Boolean(state.user)
  },
  
  // 修改状态的方法
  actions: {
    // 初始化会话（基于 HttpOnly Cookie）
    async bootstrap() {
      if (this.sessionChecked) return;
      try {
        const res = await authAPI.me();
        this.user = res.user;
      } catch (error) {
        this.user = null;
      } finally {
        this.sessionChecked = true;
      }
    },

    // 用户登录：仅保存用户信息到内存
    login(user: UserProfile) {
      this.user = user;
      this.sessionChecked = true;
    },
    
    // 用户登出：清除本地会话状态
    logout() {
      this.user = null;
      this.sessionChecked = true;
    }
  }
});
