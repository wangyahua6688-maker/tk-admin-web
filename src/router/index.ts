// src/router/index.ts - 路由入口文件
// 负责创建路由实例并设置路由守卫

import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';              // 导入路由配置
import { setupRouterGuards } from './guards'; // 导入路由守卫设置函数

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),  // 使用 HTML5 History 模式
  routes                        // 注册路由配置
});

// 设置路由守卫
setupRouterGuards(router);

// 导出配置好的路由实例
export default router;