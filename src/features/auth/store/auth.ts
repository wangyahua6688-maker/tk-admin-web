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
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * 认证状态存储。
 * 说明：
 * 1. accessToken 负责接口鉴权；
 * 2. refreshToken 用于续期；
 * 3. sessionChecked 防止每次路由切换重复 bootstrap。
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    sessionChecked: false,
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY) || '',
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || ''
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
    username: (state) => state.user?.username || ''
  },

  actions: {
    setTokens(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    clearTokens() {
      this.accessToken = '';
      this.refreshToken = '';
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    /**
     * 清空登录态。
     */
    clearAuth() {
      this.user = null;
      this.clearTokens();
      this.sessionChecked = true;
    },

    /**
     * 启动时恢复会话：
     * 1. 先尝试用 access token 拉取资料；
     * 2. access 失效时尝试 refresh 一次；
     * 3. refresh 失败则清空登录态。
     */
    async bootstrap() {
      if (this.sessionChecked) return;

      if (!this.accessToken) {
        this.user = null;
        this.sessionChecked = true;
        return;
      }

      try {
        this.user = await authAPI.me();
      } catch {
        // access token 可能过期，尝试使用 refresh token 续期。
        if (!this.refreshToken) {
          this.clearTokens();
          this.user = null;
          this.sessionChecked = true;
          return;
        }

        try {
          const refreshed = await authAPI.refresh(this.refreshToken);
          this.setTokens(refreshed.access_token, refreshed.refresh_token);
          this.user = await authAPI.me();
        } catch {
          this.clearTokens();
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
      this.setTokens(res.access_token, res.refresh_token);

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
     * 2. 清理本地 token；
     * 3. 清理动态路由和菜单权限缓存。
     */
    async logout() {
      try {
        if (this.accessToken) {
          await authAPI.logout();
        }
      } finally {
        const navigation = useNavigationStore();
        navigation.reset();
        this.clearAuth();
      }
    }
  }
});
