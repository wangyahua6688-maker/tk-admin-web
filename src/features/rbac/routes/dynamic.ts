import type { RouteRecordRaw, Router } from 'vue-router';
import type { NavMenuNode } from '@/features/rbac/types/menu';

/**
 * 菜单路径与页面组件映射。
 * 说明：
 * 1. 以“后端菜单 path”为唯一键，避免前后端命名不一致。
 * 2. 新增页面时，只需在这里补充映射即可自动接入动态路由。
 */
const routeComponentMap: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('@/features/dashboard/views/Dashboard.vue'),
  '/system/users': () => import('@/features/users/views/Users.vue'),
  '/system/roles': () => import('@/features/rbac/views/Roles.vue'),
  '/system/permissions': () => import('@/features/rbac/views/Permissions.vue'),
  '/system/menus': () => import('@/features/rbac/views/Menus.vue'),
  // 用户角色能力已并入用户管理页，这里保留路由兼容。
  '/system/user-roles': () => import('@/features/users/views/Users.vue'),
  '/audit/login-logs': () => import('@/features/rbac/views/LoginLogs.vue')
};

/**
 * 标题兜底映射。
 * 说明：
 * 1. 当后端菜单 title 为空时，避免页面头部出现“未命名页面”；
 * 2. 只对已接入的标准页面生效，不影响自定义动态菜单。
 */
const routeTitleFallbackMap: Record<string, string> = {
  '/dashboard': '后台首页',
  '/system/users': '用户与角色管理',
  '/system/roles': '角色管理',
  '/system/permissions': '权限管理',
  '/system/menus': '菜单管理',
  '/system/user-roles': '用户与角色管理',
  '/audit/login-logs': '登录日志'
};

/**
 * 规范化路径，统一用于权限匹配和路由注册。
 */
export function normalizePath(path: string): string {
  if (!path) return '/';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.length > 1 && normalized.endsWith('/')) {
    return normalized.slice(0, -1);
  }
  return normalized;
}

/**
 * 深度优先提取菜单树所有路径。
 */
export function collectMenuPaths(menus: NavMenuNode[]): string[] {
  const paths: string[] = [];

  const walk = (nodes: NavMenuNode[]) => {
    nodes.forEach((node) => {
      const path = normalizePath(node.path);
      if (path) paths.push(path);
      if (node.children.length > 0) {
        walk(node.children);
      }
    });
  };

  walk(menus);
  return Array.from(new Set(paths));
}

/**
 * 仅提取“叶子菜单路径”，用于真正可访问页面判断。
 */
export function collectLeafPaths(menus: NavMenuNode[]): string[] {
  const result: string[] = [];

  const walk = (nodes: NavMenuNode[]) => {
    nodes.forEach((node) => {
      if (node.children.length === 0) {
        result.push(normalizePath(node.path));
        return;
      }
      walk(node.children);
    });
  };

  walk(menus);
  return Array.from(new Set(result));
}

/**
 * 获取首个可访问叶子路由。
 */
export function findFirstLeafPath(menus: NavMenuNode[]): string {
  const leafPaths = collectLeafPaths(menus);
  return leafPaths[0] || '/403';
}

/**
 * 生成动态子路由。
 */
export function buildDynamicRoutes(menus: NavMenuNode[]): RouteRecordRaw[] {
  const leafPaths = collectLeafPaths(menus);
  const routeMetaMap = buildMetaMap(menus);

  return leafPaths.map((path, index) => {
    const normalizedPath = normalizePath(path);
    const meta = routeMetaMap.get(normalizedPath);
    const componentLoader = routeComponentMap[normalizedPath] || (() => import('@/features/rbac/views/FallbackPage.vue'));

    return {
      // addRoute('Root', childRoute) 时，子路由 path 使用相对路径。
      path: normalizedPath.replace(/^\//, ''),
      name: `RBAC_DYNAMIC_${index}_${path.replace(/\W+/g, '_')}`,
      component: componentLoader as any,
      meta: {
        title: meta?.title || routeTitleFallbackMap[normalizedPath] || normalizedPath,
        icon: meta?.icon || 'Menu',
        dynamic: true,
        menuPath: normalizedPath
      }
    };
  });
}

function buildMetaMap(menus: NavMenuNode[]): Map<string, { title: string; icon: string }> {
  const map = new Map<string, { title: string; icon: string }>();

  const walk = (nodes: NavMenuNode[]) => {
    nodes.forEach((node) => {
      map.set(normalizePath(node.path), {
        title: node.title || normalizePath(node.path),
        icon: node.icon || 'Menu'
      });
      if (node.children.length > 0) {
        walk(node.children);
      }
    });
  };

  walk(menus);
  return map;
}

/**
 * 注册动态菜单路由。
 * 返回值：本次实际注册的路由名列表，用于后续注销。
 */
export function registerDynamicRoutes(router: Router, menus: NavMenuNode[]): string[] {
  const routes = buildDynamicRoutes(menus);
  const registeredNames: string[] = [];

  routes.forEach((route) => {
    const name = String(route.name);
    if (!router.hasRoute(name)) {
      router.addRoute('Root', route);
      registeredNames.push(name);
    }
  });

  return registeredNames;
}

/**
 * 注销动态路由，避免退出登录后残留权限页面。
 */
export function unregisterDynamicRoutes(router: Router, routeNames: string[]): void {
  routeNames.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
}
