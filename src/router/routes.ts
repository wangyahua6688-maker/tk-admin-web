// src/router/routes.ts - 路由配置文件
// 导入 Vue Router 相关模块
import { RouteRecordRaw } from 'vue-router';

// 导入各模块路由配置
import loginRoute from '@/features/auth/routes/login';           // 登录路由
import dashboardRoutes from '@/features/dashboard/routes';       // 仪表盘路由
import userRoutes from '@/features/users/routes';               // 用户管理路由
import authRoutes from '@/features/auth/routes';                // 权限管理路由

// 定义路由配置数组
const routes: RouteRecordRaw[] = [
  // 登录页面路由 - 公开访问，不在菜单中显示
  loginRoute,
  
  // 主应用布局路由 - 包含侧边栏和顶部导航
  {
    path: '/',
    component: () => import('@/layouts/AppShell.vue'), // 应用主布局组件
    children: [
      // 仪表盘页面 - 默认首页
      ...dashboardRoutes,
      
      // 用户管理页面
      ...userRoutes,
      
      // 权限管理模块路由 - 使用嵌套路由组织相关功能
      ...authRoutes,
    ]
  },
  
  // 404 页面处理 - 匹配所有未定义的路径并重定向到首页
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

// 导出路由配置数组
export default routes;
