import type { RouteRecordRaw } from 'vue-router';
import loginRoute from '@/features/auth/routes/login';

/**
 * 静态基础路由。
 * 说明：
 * 1. 业务菜单页面不在这里写死；
 * 2. 登录后由 RBAC 菜单接口动态注册到 Root 子路由。
 */
const routes: RouteRecordRaw[] = [
  loginRoute,
  {
    path: '/',
    name: 'Root',
    component: () => import('@/layouts/AppShell.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '403',
        name: 'Forbidden',
        component: () => import('@/features/rbac/views/Forbidden.vue'),
        meta: {
          title: '无权限',
          hidden: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/features/rbac/views/NotFound.vue'),
    meta: {
      public: true,
      hidden: true
    }
  }
];

export default routes;
