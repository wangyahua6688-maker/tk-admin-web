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
  const hasUserMgmt = nodes.some((node) => normalizePath(node.path) === '/user-mgmt');
  const hasBizConfig = nodes.some((node) => normalizePath(node.path) === '/biz-config');

  const patched = [...nodes];
  if (!hasDashboard) {
    patched.unshift({
      id: -1,
      title: '后台首页',
      path: '/dashboard',
      icon: 'ep:HomeFilled',
      order: -999,
      children: []
    });
  }

  if (!hasUserMgmt) {
    patched.push({
      id: -2,
      title: '用户管理',
      path: '/user-mgmt',
      icon: 'lucide:Users',
      order: -100,
      children: [
        {
          id: -201,
          title: '客户端用户列表',
          path: '/user-mgmt/client-users',
          icon: 'lucide:UserRound',
          order: 1,
          children: []
        },
        {
          id: -202,
          title: '帖子管理',
          path: '/user-mgmt/post-articles',
          icon: 'lucide:MessageSquare',
          order: 2,
          children: []
        },
        {
          id: -203,
          title: '热点评论',
          path: '/user-mgmt/hot-comments',
          icon: 'lucide:TrendingUp',
          order: 3,
          children: []
        }
      ]
    });
  }

  if (!hasBizConfig) {
    patched.push({
      id: -3,
      title: '业务管理',
      path: '/biz-config',
      icon: 'lucide:Settings2',
      order: -99,
      children: [
        {
          id: -301,
          title: 'Banner配置',
          path: '/biz-config/banners',
          icon: 'lucide:Image',
          order: 1,
          children: []
        },
        {
          id: -302,
          title: '系统广播',
          path: '/biz-config/broadcasts',
          icon: 'lucide:Bell',
          order: 2,
          children: []
        },
        {
          id: -303,
          title: '图库管理',
          path: '/biz-config/lottery-categories',
          icon: 'lucide:Tags',
          order: 3,
          children: []
        },
        {
          id: -304,
          title: '开奖区配置',
          path: '/biz-config/lottery',
          icon: 'lucide:Activity',
          order: 4,
          children: []
        },
        {
          id: -305,
          title: '官方发帖管理',
          path: '/biz-config/official-posts',
          icon: 'lucide:FileText',
          order: 5,
          children: []
        },
        {
          id: -306,
          title: '外链配置',
          path: '/biz-config/external-links',
          icon: 'lucide:Share2',
          order: 6,
          children: []
        },
        {
          id: -307,
          title: '首屏弹窗配置',
          path: '/biz-config/home-popups',
          icon: 'lucide:MonitorSmartphone',
          order: 7,
          children: []
        },
        {
          id: -308,
          title: '短信通道配置',
          path: '/biz-config/sms-channels',
          icon: 'lucide:MessageSquareMore',
          order: 8,
          children: []
        }
      ]
    });
  }

  // 后端已存在业务管理菜单时，也补齐前端需要的标准子菜单。
  return ensureBizConfigChildren(patched);
}

// ensureBizConfigChildren 确保“业务管理”下的标准页面存在。
function ensureBizConfigChildren(nodes: NavMenuNode[]): NavMenuNode[] {
  // 定义标准子菜单模板。
  const standardChildren: NavMenuNode[] = [
    { id: -301, title: 'Banner配置', path: '/biz-config/banners', icon: 'lucide:Image', order: 1, children: [] },
    { id: -302, title: '系统广播', path: '/biz-config/broadcasts', icon: 'lucide:Bell', order: 2, children: [] },
    { id: -303, title: '图库管理', path: '/biz-config/lottery-categories', icon: 'lucide:Tags', order: 3, children: [] },
    { id: -304, title: '开奖区配置', path: '/biz-config/lottery', icon: 'lucide:Activity', order: 4, children: [] },
    { id: -305, title: '官方发帖管理', path: '/biz-config/official-posts', icon: 'lucide:FileText', order: 5, children: [] },
    { id: -306, title: '外链配置', path: '/biz-config/external-links', icon: 'lucide:Share2', order: 6, children: [] },
    { id: -307, title: '首屏弹窗配置', path: '/biz-config/home-popups', icon: 'lucide:MonitorSmartphone', order: 7, children: [] },
    { id: -308, title: '短信通道配置', path: '/biz-config/sms-channels', icon: 'lucide:MessageSquareMore', order: 8, children: [] }
  ];

  // 在菜单树中找到业务管理节点。
  const target = nodes.find((node) => normalizePath(node.path) === '/biz-config');
  if (!target) {
    return nodes;
  }

  // 记录已有子菜单路径，避免重复插入。
  const existedPathSet = new Set((target.children || []).map((child) => normalizePath(child.path)));
  const mergedChildren = [...(target.children || [])];

  // 仅补齐缺失节点，不覆盖后端已配置节点。
  standardChildren.forEach((item) => {
    if (!existedPathSet.has(normalizePath(item.path))) {
      mergedChildren.push(item);
    }
  });

  // 保持 order 排序，避免菜单顺序混乱。
  mergedChildren.sort((a, b) => (a.order || 0) - (b.order || 0));
  target.children = mergedChildren;
  return nodes;
}
