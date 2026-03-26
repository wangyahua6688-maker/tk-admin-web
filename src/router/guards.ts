import type { Router } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/auth';
import { useNavigationStore } from '@/features/rbac/store/navigation';

/**
 * 路由守卫。
 * 核心流程：
 * 1. 校验登录态；
 * 2. 加载后端菜单并动态注册路由；
 * 3. 按 RBAC 判断页面访问权限。
 */
export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore();
    const navigation = useNavigationStore();

    // 首次路由切换先恢复会话。
    if (!auth.sessionChecked) {
      await auth.bootstrap();
    }

    // 兜底路由特殊处理：
    // 1. 直接刷新动态页面时，初始匹配可能先落到 NotFound；
    // 2. 若已登录则先初始化菜单并重试当前路径，避免误判为 404。
    if (to.name === 'NotFound') {
      if (!auth.isAuthenticated) {
        return {
          path: '/login',
          query: { redirect: to.fullPath }
        };
      }

      if (!navigation.initialized) {
        try {
          await navigation.init(router);
        } catch {
          navigation.reset(router);
          auth.clearAuth();
          return {
            path: '/login',
            query: { redirect: to.fullPath }
          };
        }

        return {
          path: to.fullPath,
          replace: true
        };
      }

      // 已初始化后，如果该路径确实可访问，则重试一次触发动态路由匹配。
      if (navigation.canAccess(to.path)) {
        return {
          path: to.fullPath,
          replace: true
        };
      }
    }

    // 公共路由（登录页、404 等）直接放行。
    if (to.meta.public) {
      if (to.path === '/login' && auth.isAuthenticated) {
        if (!navigation.initialized) {
          await navigation.init(router);
        }
        return navigation.firstPath || '/403';
      }
      return true;
    }

    // 未登录统一跳登录页。
    if (!auth.isAuthenticated) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      };
    }

    // 登录后首次进入时，拉菜单并注册动态路由。
    if (!navigation.initialized) {
      try {
        await navigation.init(router);
      } catch {
        // 菜单加载失败通常意味着 token 异常或权限配置错误，直接回登录页。
        navigation.reset(router);
        auth.clearAuth();
        return {
          path: '/login',
          query: { redirect: to.fullPath }
        };
      }

      // 动态路由注册完成后，重新进入当前路径，触发路由重新匹配。
      return {
        path: to.fullPath,
        replace: true
      };
    }

    // 默认入口统一跳首个可访问菜单页面。
    if (to.path === '/') {
      return navigation.firstPath || '/403';
    }

    // 403 页面允许访问。
    if (to.path === '/403') {
      return true;
    }

    // 未授权菜单路径统一拦截到 403。
    if (!navigation.canAccess(to.path)) {
      return '/403';
    }

    return true;
  });

  router.onError((error) => {
    console.error('路由加载失败:', error);
  });

  router.afterEach((to) => {
    const title = typeof to.meta.title === 'string' ? to.meta.title : '后台管理';
    document.title = `${title} - Go Admin`;
  });
}
