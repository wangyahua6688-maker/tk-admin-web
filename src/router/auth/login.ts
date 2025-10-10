// src/router/auth/login.ts - 登录页面路由模块
import { RouteRecordRaw } from 'vue-router';

// 登录页面路由配置
const loginRoute: RouteRecordRaw = { 
  path: '/login', 
  name: 'Login', 
  component: () => import('@/views/auth/Login.vue'), // 懒加载登录组件
  meta: { 
    public: true,    // 标记为公开路由，无需认证
    hidden: true     // 在菜单中隐藏该路由
  } 
};

export default loginRoute;