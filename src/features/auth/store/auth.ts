import { defineStore } from 'pinia';
import { useNavigationStore } from '@/features/rbac/store/navigation';
import authAPI, {
  type LoginPayload,
  type LoginResponse,
  type ProfileResponse
} from '@/features/auth/api/auth';

export type UserProfile = ProfileResponse;

interface AuthState {
  user: UserProfile | null;
  sessionChecked: boolean;
}

/**
 * 认证状态存储。
 * 说明：
 * 1. token 由 HttpOnly Cookie 承载，前端不再持久化存储；
 * 2. sessionChecked 防止每次路由切换重复 bootstrap；
 * 3. isAuthenticated 以 user 是否已加载成功为准。
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    sessionChecked: false
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    username: (state) => state.user?.username || ''
  },

  actions: {
    /**
     * 清空登录态。
     */
    clearAuth() {
      this.user = null;
      this.sessionChecked = true;
    },

    /**
     * 启动时恢复会话：
     * 1. 先尝试用 access cookie 拉取资料；
     * 2. access 失效时尝试 refresh cookie 续期一次；
     * 3. refresh 失败则清空登录态。
     */
    async bootstrap() {
      if (this.sessionChecked) return;

      try {
        this.user = await authAPI.me();
      } catch {
        // access cookie 可能过期，尝试使用 refresh cookie 续期。
        try {
          await authAPI.refresh();
          this.user = await authAPI.me();
        } catch {
          this.user = null;
        }
      } finally {
        this.sessionChecked = true;
      }
    },

    /**
     * 用户名密码登录。
     */
    async loginByPassword(payload: LoginPayload) {
      const res: LoginResponse = await authAPI.login(payload);

      // 先用登录返回值兜底，随后再拉完整用户资料。
      this.user = {
        id: res.user_id,
        username: res.username,
        email: '',
        status: 1
      };

      try {
        this.user = await authAPI.me();
      } catch {
        // 不阻断登录流程。
      }

      this.sessionChecked = true;
    },

    /**
     * 退出登录：
     * 1. 调后端 logout；
     * 2. 清理本地用户态；
     * 3. 清理动态路由和菜单权限缓存。
     */
    async logout() {
      try {
        await authAPI.logout();
      } finally {
        const navigation = useNavigationStore();
        navigation.reset();
        this.clearAuth();
      }
    }
  }
});
