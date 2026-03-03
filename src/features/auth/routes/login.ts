import type { RouteRecordRaw } from 'vue-router';

/**
 * 登录页路由（公共路由）。
 */
const loginRoute: RouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/features/auth/views/Login.vue'),
  meta: {
    public: true,
    hidden: true,
    title: '登录'
  }
};

export default loginRoute;
