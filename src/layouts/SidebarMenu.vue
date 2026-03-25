<template>
  <aside class="sidebar" :class="sidebarClass">
    <div
      class="brand"
      role="button"
      tabindex="0"
      @click="onToggleCollapse"
      @keydown.enter.prevent="onToggleCollapse"
      @keydown.space.prevent="onToggleCollapse"
    >
      <img src="@/assets/logo.svg" alt="logo" class="brand-logo" />
      <div v-if="!collapsed" class="brand-text">Go Admin</div>
    </div>

    <el-menu
      class="menu"
      :default-active="activePath"
      @select="onSelect"
      :collapse="menuCollapsed"
      :collapse-transition="false"
      background-color="transparent"
      text-color="var(--text-secondary)"
      active-text-color="var(--brand-primary)"
    >
      <template v-for="item in menus" :key="item.id">
        <el-menu-item v-if="item.children.length === 0" :index="normalizePath(item.path)">
          <MenuIcon :icon="item.icon" />
          <span>{{ item.title }}</span>
        </el-menu-item>

        <el-sub-menu v-else :index="`group-${item.id}`">
          <template #title>
            <div class="submenu-title">
              <MenuIcon :icon="item.icon" />
              <span>{{ item.title }}</span>
            </div>
          </template>

          <el-menu-item
            v-for="child in item.children"
            :key="child.id"
            :index="normalizePath(child.path)"
          >
            <MenuIcon :icon="child.icon" />
            <span>{{ child.title }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNavigationStore } from '@/features/rbac/store/navigation';
import { normalizePath } from '@/features/rbac/routes/dynamic';
import MenuIcon from '@/features/rbac/components/MenuIcon.vue';

const props = defineProps<{ collapsed?: boolean; mobile?: boolean }>();
const emit = defineEmits<{
  'mobile-select': [];
  'toggle-collapse': [];
}>();

const route = useRoute();
const router = useRouter();
const navigation = useNavigationStore();

/**
 * 侧边栏折叠态。
 */
const collapsed = computed(() => Boolean(props.collapsed));
const mobile = computed(() => Boolean(props.mobile));

const sidebarClass = computed(() => ({
  collapsed: !mobile.value && collapsed.value,
  mobile: mobile.value,
  'mobile-open': mobile.value && !collapsed.value
}));

/**
 * 只有桌面端才使用 Element Menu 的折叠模式。
 * 移动端采用抽屉式侧栏，不做 icon-only 折叠。
 */
const menuCollapsed = computed(() => !mobile.value && collapsed.value);

/**
 * 当前激活菜单路径。
 */
const activePath = computed(() => normalizePath(route.path));

/**
 * 当前用户可访问菜单（来自后端 RBAC）。
 */
const menus = computed(() => navigation.menus);

/**
 * 菜单点击跳转。
 * 说明：
 * 1. 子菜单组（group-xxx）只负责展开；
 * 2. 普通菜单统一走显式 router.push，避免动态路由场景下 router 模式偶发不跳转。
 */
function onSelect(index: string) {
  if (!index || index.startsWith('group-')) return;
  if (mobile.value) {
    emit('mobile-select');
  }

  const target = normalizePath(index);
  if (target === normalizePath(route.path)) return;
  router.push(target);
}

/**
 * 点击侧栏品牌区域也可折叠/展开：
 * 1. 桌面端支持除 Header 按钮外的第二入口；
 * 2. 移动端不在此处切换，避免与抽屉展开手势冲突。
 */
function onToggleCollapse() {
  if (mobile.value) return;
  emit('toggle-collapse');
}
</script>

<style scoped>
.sidebar {
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 72px;
  width: var(--sidebar-width);
  background: linear-gradient(180deg, var(--sidebar-bg-from) 0%, var(--sidebar-bg-to) 100%);
  border-right: 1px solid rgba(147, 163, 184, 0.22);
  box-shadow: 6px 0 30px rgba(15, 23, 42, 0.06);
  transition: width 0.28s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.brand {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  cursor: pointer;
  user-select: none;
}

.brand:focus-visible {
  outline: 2px solid rgba(var(--brand-primary-rgb), 0.35);
  outline-offset: -2px;
}

.brand-logo {
  width: 30px;
  height: 30px;
}

.brand-text {
  font-size: clamp(15px, 1.5vw, 18px);
  font-weight: 680;
  letter-spacing: 0.4px;
  color: var(--text-primary);
}

.menu {
  border-right: none;
  padding: 10px;
}

.submenu-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

/* 折叠态专属样式：仅显示图标，文字完全隐藏并放大图标。 */
.sidebar.collapsed .submenu-title {
  justify-content: center;
  gap: 0;
}

.sidebar.collapsed .brand {
  justify-content: center;
  padding: 0;
}

.sidebar.collapsed .submenu-title > span {
  display: none !important;
}

.sidebar.collapsed :deep(.el-menu-item > span),
.sidebar.collapsed :deep(.el-sub-menu__title > span) {
  display: none !important;
}

.sidebar.collapsed :deep(.el-menu-item),
.sidebar.collapsed :deep(.el-sub-menu__title) {
  justify-content: center;
  padding: 0 !important;
}

.sidebar.collapsed :deep(.el-menu-item .menu-icon),
.sidebar.collapsed :deep(.el-sub-menu__title .menu-icon) {
  margin-right: 0 !important;
  font-size: 22px !important;
}

.sidebar.collapsed :deep(.el-sub-menu__icon-arrow) {
  display: none !important;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  margin: 6px 0;
  border-radius: 10px;
  transition: all 0.2s ease;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(
    90deg,
    rgba(var(--brand-primary-rgb), 0.17) 0%,
    rgba(var(--brand-primary-rgb), 0.08) 100%
  );
  font-weight: 600;
}

@media (max-width: 1440px) {
  .sidebar {
    --sidebar-width: 230px;
  }
}

@media (max-width: 1200px) {
  .sidebar {
    --sidebar-width: 210px;
    --sidebar-collapsed-width: 68px;
  }
}

@media (max-width: 992px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1200;
    --sidebar-width: min(78vw, 280px);
    width: var(--sidebar-width);
    height: 100dvh;
    transform: translateX(-104%);
    transition: transform 0.25s ease;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar .brand {
    justify-content: flex-start;
    padding: 0 14px;
  }

  .sidebar .brand-text,
  .sidebar :deep(.el-menu-item span),
  .sidebar :deep(.el-sub-menu__title span) {
    display: inline;
  }

  .sidebar :deep(.el-menu-item),
  .sidebar :deep(.el-sub-menu__title) {
    justify-content: flex-start;
    padding-left: 12px !important;
  }

  .sidebar :deep(.el-menu-item .menu-icon),
  .sidebar :deep(.el-sub-menu__title .menu-icon) {
    margin-right: 8px !important;
    font-size: 18px !important;
  }
}
</style>
