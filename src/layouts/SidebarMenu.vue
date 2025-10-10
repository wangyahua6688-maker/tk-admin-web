<!-- src/layouts/SidebarMenu.vue - 侧边栏菜单组件 -->
<template>
  <!-- 侧边栏容器 -->
  <div class="sidebar" :class="{ collapsed }">
    <!-- Logo区域 -->
    <div class="logo-container">
      <!-- Logo图标 -->
      <img src="@/assets/logo.svg" alt="Logo" class="logo-icon" />
      <!-- Logo文字（仅在非折叠状态下显示） -->
      <div class="logo" v-if="!collapsed"><span>管理系统</span></div>
    </div>
    <!-- 菜单 -->
    <el-menu
      :default-active="activeRouteName"
      router
      class="el-menu-vertical-demo menu"
      background-color="#ffffff"
      text-color="#333333"
      active-text-color="#0066ff"
      :collapse="collapsed">
      <!-- 遍历菜单项 -->
      <template v-for="menu in menus" :key="menu.index">
        <!-- 无子菜单的菜单项 -->
        <el-menu-item v-if="!menu.children" :index="menu.index">
          <el-icon>
            <component :is="iconMap[menu.icon] || iconMap.Menu" />
          </el-icon>
          <span>{{ menu.title }}</span>
        </el-menu-item>
        <!-- 有子菜单的菜单项 -->
        <el-sub-menu v-else :index="menu.index">
          <template #title>
            <el-icon>
              <component :is="iconMap[menu.icon] || iconMap.Menu" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </template>
          <!-- 子菜单项 -->
          <template v-for="child in menu.children" :key="child.index">
            <el-menu-item :index="child.index">
              <el-icon>
                <component :is="iconMap[child.icon] || iconMap.Menu" />
              </el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
// 侧边栏菜单逻辑
// 导入所需模块和组件
import { ref, computed } from 'vue';
import { useRoute, useRouter, RouteRecordRaw } from 'vue-router';
import * as Icons from '@element-plus/icons-vue';

// 菜单项接口定义
interface MenuItem {
  index: string;      // 菜单项索引（路径）
  title: string;      // 菜单项标题
  icon: string;       // 菜单项图标
  children?: MenuItem[]; // 子菜单项
}

// 组件属性定义
const props = defineProps<{ collapsed?: boolean }>();

// 侧边栏折叠状态计算属性
const collapsed = computed(() => props.collapsed || false);

// 获取路由实例
const route = useRoute();
const router = useRouter();

// 激活路由名称计算属性
const activeRouteName = computed(() => route.path as string);

// 图标映射对象
const iconMap = Icons as unknown as Record<string, any>;

// 生成菜单项函数 - 根据路由配置生成菜单项
const generateMenuItems = (routes: readonly RouteRecordRaw[], basePath = '/'): MenuItem[] => {
  const items: MenuItem[] = [];
  for (const route of routes) {
    // 跳过隐藏的路由
    if (route.meta?.hidden) continue;

    // 解析路径
    const newPath = route.path.startsWith('/') ? route.path : `${basePath}/${route.path}`.replace(/\/+/g, '/');

    // 创建菜单项
    const menuItem: MenuItem = {
      index: newPath,
      title: (route.meta?.title as string) || (route.name as string) || '',
      icon: (route.meta?.icon as string) || 'Menu',
      children: route.children ? generateMenuItems(route.children, newPath) : undefined,
    };

    // 处理子菜单
    if (menuItem.children && menuItem.children.length === 0) {
      delete menuItem.children;
    } else if (menuItem.children) {
      // 如果所有子菜单都隐藏，则不显示父菜单
      const allChildrenHidden = menuItem.children.every(child => routes.find(r => r.path === child.index)?.meta?.hidden);
      if (allChildrenHidden) {
        continue;
      }
    }

    items.push(menuItem);
  }
  return items;
};

// 获取应用主布局路由
const appShellRoute = router.options.routes.find(r => r.path === '/');

// 菜单数据
const menus = ref<MenuItem[]>(appShellRoute && appShellRoute.children ? generateMenuItems(appShellRoute.children) : []);
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--sidebar-bg);
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 64px;
}
.logo-container { display: flex; align-items: center; justify-content: center; height: 60px; padding: 0 10px; border-bottom: 1px solid var(--border-color); }
.logo-icon { width: 32px; height: 32px; }
.logo { height: 32px; font-size: 20px; font-weight: 600; color: var(--primary-color); margin-left: 8px; }
.menu { border: none; }
@media (max-width: 992px) {
  .sidebar { width: 64px; }
  .logo span { display: none; }
  .menu .el-menu-item span, .menu .el-sub-menu__title span { display: none; }
}

/* 收起状态样式 */
.sidebar.collapsed .logo span {
  display: none;
}

.sidebar.collapsed .menu .el-menu-item span,
.sidebar.collapsed .menu .el-sub-menu__title span {
  display: none;
}
</style>