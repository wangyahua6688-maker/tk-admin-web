// src/features/users/routes.ts - 用户管理相关路由模块
import { RouteRecordRaw } from 'vue-router';

// 用户管理路由配置
const userRoutes: RouteRecordRaw[] = [
  { 
    path: 'users', 
    name: 'Users', 
    component: () => import('@/features/users/views/Users.vue'), 
    meta: { 
      title: '平台用户管理', 
      icon: 'User' 
    } 
  }
];

export default userRoutes;
