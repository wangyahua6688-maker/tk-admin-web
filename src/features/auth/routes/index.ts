// src/features/auth/routes/index.ts - 权限管理相关路由模块
import { RouteRecordRaw } from 'vue-router';

// 权限管理模块路由配置
const authRoutes: RouteRecordRaw[] = [
  {
    path: 'auth',
    name: 'Auth',
    redirect: '/auth/admins',  // 默认重定向到管理员页面
    component: () => import('@/layouts/AuthLayout.vue'), // 权限管理专用布局
    meta: { 
      title: '权限管理', 
      icon: 'Lock' 
    },
    children: [
      // 管理员用户管理
      { 
        path: 'admins', 
        name: 'Admins', 
        component: () => import('@/features/auth/views/Admins.vue'), 
        meta: { 
          title: '管理员用户', 
          icon: 'User' 
        } 
      },
      
      // 角色管理
      { 
        path: 'roles', 
        name: 'Roles', 
        component: () => import('@/features/auth/views/Roles.vue'), 
        meta: { 
          title: '角色管理', 
          icon: 'UserFilled' 
        } 
      },
      
      // 权限管理
      { 
        path: 'permissions', 
        name: 'Permissions', 
        component: () => import('@/features/auth/views/Permissions.vue'), 
        meta: { 
          title: '权限管理', 
          icon: 'Key' 
        } 
      },
      
      // 菜单管理
      { 
        path: 'menus', 
        name: 'Menus', 
        component: () => import('@/features/auth/views/Menus.vue'), 
        meta: { 
          title: '菜单管理', 
          icon: 'Menu' 
        } 
      },
    ]
  }
];

export default authRoutes;
