import { defineStore } from 'pinia';
import type { Router } from 'vue-router';
import menuAPI from '@/features/rbac/api/menus';
import type { NavMenuNode } from '@/features/rbac/types/menu';
import {
  collectLeafPaths,
  collectMenuPaths,
  findFirstLeafPath,
  normalizePath,
  registerDynamicRoutes,
  unregisterDynamicRoutes
} from '@/features/rbac/routes/dynamic';

interface NavigationState {
  menus: NavMenuNode[];
  initialized: boolean;
  dynamicRouteNames: string[];
}

/**
 * RBAC 导航状态。
 * 职责：
 * 1. 拉取当前用户菜单树；
 * 2. 动态注册路由；
 * 3. 提供路径权限判断。
 */
export const useNavigationStore = defineStore('navigation', {
  state: (): NavigationState => ({
    menus: [],
    initialized: false,
    dynamicRouteNames: []
  }),

  getters: {
    allMenuPaths: (state): string[] => collectMenuPaths(state.menus),
    leafPaths: (state): string[] => collectLeafPaths(state.menus),
    firstPath: (state): string => findFirstLeafPath(state.menus)
  },

  actions: {
    /**
     * 初始化菜单与动态路由。
     */
    async init(router: Router) {
      if (this.initialized) return;

      const tree = withHomeMenu(mergeMenus(await menuAPI.getFrontendTree()));
      this.menus = tree;
      this.dynamicRouteNames = registerDynamicRoutes(router, this.menus);
      this.initialized = true;
    },

    /**
     * 刷新菜单与动态路由。
     * 使用场景：
     * 1. 菜单管理页面新增/编辑/删除菜单后；
     * 2. 菜单与权限绑定关系变更后，需要立即更新左侧导航展示。
     */
    async refresh(router: Router) {
      if (this.dynamicRouteNames.length > 0) {
        unregisterDynamicRoutes(router, this.dynamicRouteNames);
      }

      const tree = withHomeMenu(mergeMenus(await menuAPI.getFrontendTree()));
      this.menus = tree;
      this.dynamicRouteNames = registerDynamicRoutes(router, this.menus);
      this.initialized = true;
    },

    /**
     * 清空导航状态，并移除动态路由。
     */
    reset(router?: Router) {
      if (router && this.dynamicRouteNames.length > 0) {
        unregisterDynamicRoutes(router, this.dynamicRouteNames);
      }

      this.menus = [];
      this.initialized = false;
      this.dynamicRouteNames = [];
    },

    /**
     * 判断是否可访问某个路径。
     * 策略：
     * - 叶子路径必须精确命中（避免越权访问未授权页面）；
     * - 一级菜单路径允许访问（用于展开菜单、父级跳转兼容）。
     */
    canAccess(path: string): boolean {
      const target = normalizePath(path);

      if (target === '/403') return true;

      const leafPathSet = new Set(this.leafPaths.map(normalizePath));
      if (leafPathSet.has(target)) {
        return true;
      }

      const allPathSet = new Set(this.allMenuPaths.map(normalizePath));
      return allPathSet.has(target);
    }
  }
});

/**
 * 菜单结构裁剪：
 * - “用户角色管理”已并入“用户管理”，这里隐藏旧菜单节点。
 */
function mergeMenus(nodes: NavMenuNode[]): NavMenuNode[] {
  const hiddenPathSet = new Set(['/system/user-roles']);

  return nodes
    .filter((node) => !hiddenPathSet.has(normalizePath(node.path)))
    .map((node) => ({
      ...node,
      children: mergeMenus(node.children || [])
    }));
}

/**
 * 注入后台首页菜单：
 * 1. 首页始终可见，避免首次进入落到非首页业务页面；
 * 2. 若后端已返回 dashboard 菜单，则不重复注入。
 */
function withHomeMenu(nodes: NavMenuNode[]): NavMenuNode[] {
  const hasDashboard = nodes.some((node) => normalizePath(node.path) === '/dashboard');
  if (hasDashboard) return nodes;

  const homeMenu: NavMenuNode = {
    id: -1,
    title: '后台首页',
    path: '/dashboard',
    icon: 'ep:HomeFilled',
    order: -999,
    children: []
  };

  return [homeMenu, ...nodes];
}
