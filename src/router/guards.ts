// src/router/guards.ts - 路由守卫API文件
// 负责处理路由前置守卫和后置守卫逻辑

import { Router } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/auth';

/**
 * 设置路由守卫
 * @param router 路由实例
 */
export function setupRouterGuards(router: Router) {
  // 路由前置守卫 - 在每次路由跳转前执行
  router.beforeEach(async (to) => {
    const auth = useAuthStore(); // 获取认证状态

    // 0. 初始化会话（基于 HttpOnly Cookie）
    if (!auth.sessionChecked) {
      await auth.bootstrap();
    }
    
    // 1. 处理公共路由（如登录页）
    if (to.meta.public) {
      // 已登录用户尝试访问登录页，重定向到首页
      if (auth.isAuthenticated && to.path === '/login') {
        return { path: '/' };
      }
      return true; // 允许访问公共路由
    }
    
    // 2. 验证登录状态 - 未登录用户重定向到登录页
    if (!auth.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } };
    }
    
    // 3. 权限验证 (如果需要)
    // 此处可以根据实际需求添加角色或权限验证逻辑
    // 例如：if (!hasPermission(auth.user.roles, to.meta.requiredRoles)) { ... }
    
    // 4. 继续导航
    return true;
  });

  // 路由错误处理 - 捕获路由加载或解析过程中的错误
  router.onError((error) => {
    console.error('路由错误:', error);
    // 可以在这里添加错误处理逻辑，例如跳转到错误页面
  });

  // 路由后置守卫 - 在路由跳转完成后执行
  router.afterEach((to, from) => {
    // 可以在这里添加页面访问统计、面包屑更新等逻辑
    
    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - 管理系统`;
    } else {
      document.title = '管理系统';
    }
  });
}
