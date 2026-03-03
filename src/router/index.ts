import { createRouter, createWebHistory } from 'vue-router';
import routes from '@/router/routes';
import { setupRouterGuards } from '@/router/guards';

/**
 * 路由实例。
 */
const router = createRouter({
  history: createWebHistory(),
  routes
});

setupRouterGuards(router);

export default router;
