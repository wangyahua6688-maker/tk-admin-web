// src/features/dashboard/routes.ts - 仪表盘路由模块
import { RouteRecordRaw } from 'vue-router';

// 仪表盘路由配置
const dashboardRoutes: RouteRecordRaw[] = [
  { 
    path: '', 
    name: 'Dashboard', 
    component: () => import('@/features/dashboard/views/Dashboard.vue'), 
    meta: { 
      title: '仪表盘',     // 页面标题，用于菜单和浏览器标签页
      icon: 'HomeFilled'  // 菜单图标
    } 
  }
];

export default dashboardRoutes;
