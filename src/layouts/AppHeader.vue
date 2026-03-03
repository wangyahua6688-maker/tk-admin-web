<template>
  <header class="app-header">
    <div class="header-left">
      <el-button
        class="collapse-btn"
        circle
        size="small"
        @click="$emit('toggle-collapse')"
      >
        <el-icon>
          <component :is="collapsed ? Expand : Fold" />
        </el-icon>
      </el-button>

      <div class="breadcrumb">{{ title }}</div>
    </div>

    <div class="header-right">
      <el-dropdown
        trigger="click"
        placement="bottom-end"
        popper-class="user-dropdown-popper"
        @command="handleUserCommand"
      >
        <button class="user-pill user-pill-trigger" type="button">
          <el-badge :is-dot="unreadCount > 0" class="avatar-badge">
            <div class="avatar">{{ userInitial }}</div>
          </el-badge>
          <span class="username-text">{{ auth.user?.username || '管理员' }}</span>
          <el-icon class="dropdown-link"><ArrowDown /></el-icon>
        </button>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="messages" class="user-dropdown-item">
              <div class="dropdown-item-content">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon-wrap notify">
                    <el-icon><BellFilled /></el-icon>
                  </span>
                  <span class="dropdown-item-label">系统消息</span>
                </span>
                <el-badge :hidden="unreadCount === 0" :value="unreadCount" :max="99" />
              </div>
            </el-dropdown-item>

            <el-dropdown-item command="logout" divided class="user-dropdown-item user-dropdown-item-danger">
              <div class="dropdown-item-content">
                <span class="dropdown-item-left">
                  <span class="dropdown-icon-wrap stop">
                    <el-icon><VideoPause /></el-icon>
                  </span>
                  <span class="dropdown-item-label danger-text">退出登录</span>
                </span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>

  <!-- 主题设置独立悬浮入口，点击后打开右侧样式抽屉。 -->
  <el-tooltip content="主题设置" placement="left">
    <el-button class="theme-fab" circle type="primary" @click="openAppearanceDrawer">
      <el-icon><Brush /></el-icon>
    </el-button>
  </el-tooltip>

  <el-drawer
    v-model="drawerVisible"
    direction="rtl"
    :size="drawerSize"
    :title="drawerTitle"
    class="right-drawer"
  >
    <template v-if="drawerMode === 'appearance'">
      <div class="drawer-section">
        <div class="section-title">配色主题（下拉选择）</div>
        <el-select
          v-model="schemeModel"
          placeholder="请选择主题色"
          style="width: 100%"
        >
          <el-option
            v-for="scheme in schemeOptions"
            :key="scheme.key"
            :label="scheme.label"
            :value="scheme.key"
          >
            <div class="scheme-option">
              <span class="scheme-dot" :style="{ background: schemePreviewMap[scheme.key] }"></span>
              <span>{{ scheme.label }}</span>
            </div>
          </el-option>
        </el-select>

        <div class="scheme-hint">
          <span class="scheme-hint-chip" :style="{ background: selectedSchemePreview }"></span>
          <span>{{ selectedSchemeDesc }}</span>
        </div>
      </div>

      <div class="drawer-section">
        <div class="section-title">字体（当前系统可用）</div>
        <el-select
          v-model="fontFamilyModel"
          placeholder="请选择字体"
          style="width: 100%"
        >
          <el-option
            v-for="font in fontOptions"
            :key="font.value"
            :label="font.label"
            :value="font.value"
          />
        </el-select>
      </div>

      <div class="drawer-section">
        <div class="section-title">字体粗细</div>
        <el-radio-group v-model="fontWeightModel" class="weight-radio-group">
          <el-radio-button
            v-for="option in fontWeightOptions"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="drawer-section">
        <div class="section-title">字号（{{ MIN_FONT_SIZE }}-{{ MAX_FONT_SIZE }}px）</div>
        <el-slider
          v-model="fontSizeModel"
          :min="MIN_FONT_SIZE"
          :max="MAX_FONT_SIZE"
          :step="1"
          show-input
        />
        <div class="font-size-note">可在安全区间调整字号，保持布局不变形。</div>
      </div>

      <div class="drawer-section preview-section">
        <div class="section-title">预览</div>
        <div class="preview-card" :style="previewStyle">
          当前示例：用户管理 / 角色权限 / 菜单配置
        </div>
      </div>
    </template>

    <template v-else>
      <div class="message-toolbar">
        <div class="message-count">未读消息 {{ unreadCount }} 条</div>
        <el-button text :disabled="unreadCount === 0" @click="markAllMessagesRead">全部已读</el-button>
      </div>

      <div v-if="messageItems.length === 0" class="message-empty-wrap">
        <el-empty description="暂无系统消息" :image-size="88" />
      </div>

      <div v-else class="message-list">
        <article
          v-for="msg in messageItems"
          :key="msg.id"
          class="message-card"
          :class="{ unread: !msg.read }"
        >
          <header class="message-head" @click="toggleMessageExpand(msg.id)">
            <div class="message-title-wrap">
              <span v-if="!msg.read" class="message-dot"></span>
              <span class="message-title">{{ msg.title }}</span>
              <el-tag size="small" effect="plain" :type="messageLevelTypeMap[msg.level]">
                {{ messageLevelLabelMap[msg.level] }}
              </el-tag>
            </div>
            <span class="message-time">{{ msg.createdAt }}</span>
          </header>

          <div class="message-content">{{ getMessageDisplayContent(msg.id, msg.content) }}</div>

          <div v-if="isLongMessage(msg.content)" class="message-actions">
            <el-button text size="small" @click="toggleMessageExpand(msg.id)">
              {{ isMessageExpanded(msg.id) ? '收起详情' : '展开详情' }}
            </el-button>
          </div>
        </article>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowDown,
  BellFilled,
  Brush,
  Expand,
  Fold,
  VideoPause
} from '@element-plus/icons-vue';
import { useAuthStore } from '@/features/auth/store/auth';
import { useNavigationStore } from '@/features/rbac/store/navigation';
import { normalizePath } from '@/features/rbac/routes/dynamic';
import {
  type AppearanceFontWeight,
  type AppearanceScheme,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  useAppearanceStore
} from '@/features/ui/store/appearance';
import { type SystemMessage, useMessageStore } from '@/features/ui/store/messages';

interface Props {
  collapsed: boolean;
}

type DrawerMode = 'appearance' | 'messages';

defineProps<Props>();

defineEmits<{
  'toggle-collapse': [];
}>();

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const navigation = useNavigationStore();
const appearance = useAppearanceStore();
const messageStore = useMessageStore();

const drawerVisible = ref(false);
const drawerMode = ref<DrawerMode>('appearance');
const drawerSize = 'min(420px, 92vw)';
const expandedMessageIds = ref<string[]>([]);

const schemePreviewMap: Record<AppearanceScheme, string> = {
  sky: 'linear-gradient(120deg, #3b82f6 0%, #60a5fa 100%)',
  graphite: 'linear-gradient(120deg, #475569 0%, #64748b 100%)',
  forest: 'linear-gradient(120deg, #0f766e 0%, #14b8a6 100%)',
  amber: 'linear-gradient(120deg, #b45309 0%, #f59e0b 100%)',
  ocean: 'linear-gradient(120deg, #0369a1 0%, #0ea5e9 100%)',
  rose: 'linear-gradient(120deg, #c2416c 0%, #fb7185 100%)',
  starlight: 'linear-gradient(120deg, #4f46e5 0%, #818cf8 100%)',
  titanium: 'linear-gradient(120deg, #5b6475 0%, #94a3b8 100%)',
  midnight: 'linear-gradient(120deg, #1e293b 0%, #475569 100%)',
  aurora: 'linear-gradient(120deg, #0ea5a4 0%, #2dd4bf 100%)',
  coral: 'linear-gradient(120deg, #ea580c 0%, #fb923c 100%)',
  glacier: 'linear-gradient(120deg, #0284c7 0%, #38bdf8 100%)',
  emerald: 'linear-gradient(120deg, #059669 0%, #34d399 100%)',
  nebula: 'linear-gradient(120deg, #7c3aed 0%, #a78bfa 100%)'
};

const messageLevelLabelMap: Record<SystemMessage['level'], string> = {
  info: '通知',
  success: '完成',
  warning: '提醒'
};

const messageLevelTypeMap: Record<SystemMessage['level'], '' | 'success' | 'warning' | 'danger' | 'info'> = {
  info: 'info',
  success: 'success',
  warning: 'warning'
};

/**
 * 抽屉标题：跟随当前模式切换。
 */
const drawerTitle = computed(() => (drawerMode.value === 'appearance' ? '系统界面设置' : '系统消息'));

/**
 * 面包屑标题优先取菜单元信息，再回退到路由路径。
 */
const title = computed(() => {
  const titleInMeta = typeof route.meta.title === 'string' ? route.meta.title : '';
  if (titleInMeta && titleInMeta !== '未命名页面') {
    return titleInMeta;
  }

  const menuPathFromMeta = typeof route.meta.menuPath === 'string' ? route.meta.menuPath : route.path;
  const titleByPath = findTitleByPath(navigation.menus, normalizePath(menuPathFromMeta));
  if (titleByPath) return titleByPath;
  return route.path;
});

const userInitial = computed(() => auth.user?.username?.slice(0, 1).toUpperCase() || 'A');
const unreadCount = computed(() => messageStore.unreadCount);
const messageItems = computed(() => messageStore.orderedItems);
const expandedMessageSet = computed(() => new Set(expandedMessageIds.value));

const schemeOptions = computed(() => appearance.schemeOptions);
const fontOptions = computed(() => appearance.fontOptions);
const fontWeightOptions = computed(() => appearance.fontWeightOptions);

const schemeModel = computed<AppearanceScheme>({
  get: () => appearance.scheme,
  set: (scheme) => appearance.setScheme(scheme)
});

const selectedSchemeMeta = computed(() => {
  return schemeOptions.value.find((item) => item.key === schemeModel.value) || schemeOptions.value[0];
});

const selectedSchemePreview = computed(() => {
  return schemePreviewMap[schemeModel.value] || schemePreviewMap.sky;
});

const selectedSchemeDesc = computed(() => {
  return selectedSchemeMeta.value?.desc || '';
});

const fontFamilyModel = computed({
  get: () => appearance.fontFamily,
  set: (font: string) => appearance.setFontFamily(font)
});

const fontWeightModel = computed<AppearanceFontWeight>({
  get: () => appearance.fontWeight,
  set: (weight) => appearance.setFontWeight(Number(weight))
});

const fontSizeModel = computed({
  get: () => appearance.fontSize,
  set: (size: number) => appearance.setFontSize(size)
});

const previewStyle = computed(() => ({
  fontFamily: `"${appearance.fontFamily}"`,
  fontSize: `${appearance.fontSize}px`,
  fontWeight: String(appearance.fontWeight)
}));

function openAppearanceDrawer() {
  drawerMode.value = 'appearance';
  drawerVisible.value = true;
}

function openMessageDrawer() {
  drawerMode.value = 'messages';
  drawerVisible.value = true;
  void safeEnsureMessagesLoaded();
}

/**
 * 头像下拉菜单命令处理。
 */
async function handleUserCommand(command: string | number | object) {
  const key = String(command || '');
  if (key === 'messages') {
    openMessageDrawer();
    return;
  }

  if (key === 'logout') {
    await onLogout();
  }
}

async function onLogout() {
  await auth.logout();
  drawerVisible.value = false;
  router.replace('/login');
}

function markAllMessagesRead() {
  void messageStore.markAllRead();
}

function isLongMessage(content: string): boolean {
  return String(content || '').length > 56;
}

function isMessageExpanded(messageId: string): boolean {
  return expandedMessageSet.value.has(messageId);
}

/**
 * 点击消息标题时：
 * 1. 长消息切换展开/收起；
 * 2. 同时将该消息标记为已读。
 */
function toggleMessageExpand(messageId: string) {
  const next = new Set(expandedMessageSet.value);
  if (next.has(messageId)) {
    next.delete(messageId);
  } else {
    next.add(messageId);
  }
  expandedMessageIds.value = Array.from(next);
  void messageStore.markAsRead(messageId);
}

function getMessageDisplayContent(messageId: string, content: string): string {
  if (!isLongMessage(content)) {
    return content;
  }

  if (isMessageExpanded(messageId)) {
    return content;
  }

  return `${content.slice(0, 56)}...`;
}

function findTitleByPath(
  menus: Array<{ title: string; path: string; children?: any[] }>,
  targetPath: string
): string {
  for (const menu of menus) {
    if (normalizePath(menu.path) === targetPath) {
      return menu.title;
    }
    const children = Array.isArray(menu.children) ? menu.children : [];
    const childTitle = findTitleByPath(children as any, targetPath);
    if (childTitle) return childTitle;
  }
  return '';
}

onMounted(() => {
  appearance.bootstrap();
  void safeEnsureMessagesLoaded();
});

async function safeEnsureMessagesLoaded() {
  try {
    await messageStore.ensureLoaded();
  } catch {
    // 忽略消息加载异常，避免阻断主界面交互。
  }
}
</script>

<style scoped>
.app-header {
  height: clamp(56px, 6.2vw, 64px);
  margin: clamp(10px, 1.4vw, 14px) clamp(10px, 1.6vw, 16px) 0;
  padding: 0 clamp(10px, 1.6vw, 16px);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
  overflow: hidden;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.collapse-btn {
  border-color: rgba(148, 163, 184, 0.4);
}

.breadcrumb {
  font-size: clamp(14px, 1.5vw, 15px);
  font-weight: var(--app-font-weight-semibold, 600);
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 10px;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.user-pill-trigger {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
  cursor: pointer;
  border-radius: 999px;
  padding: 4px 10px;
  transition: all 0.2s ease;
}

.user-pill-trigger:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(var(--brand-primary-rgb), 0.3);
  box-shadow: 0 12px 26px rgba(var(--brand-primary-rgb), 0.18);
}

.avatar {
  width: clamp(32px, 3vw, 34px);
  height: clamp(32px, 3vw, 34px);
  border-radius: 50%;
  background: linear-gradient(130deg, var(--brand-primary) 0%, #7ba9ff 100%);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: var(--app-font-weight-semibold, 600);
}

.avatar-badge :deep(.el-badge__content.is-fixed.is-dot) {
  top: 6px;
  right: 6px;
}

.username-text {
  color: var(--text-primary);
  font-size: clamp(13px, 1.4vw, 14px);
  font-weight: var(--app-font-weight-semibold, 600);
}

.dropdown-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.dropdown-item-content {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.dropdown-item-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item-label {
  color: var(--text-primary);
  font-weight: var(--app-font-weight-medium, 500);
  max-width: 106px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon-wrap {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.dropdown-icon-wrap.notify {
  background: rgba(59, 130, 246, 0.14);
  color: #2563eb;
}

.dropdown-icon-wrap.stop {
  background: rgba(239, 68, 68, 0.14);
  color: #dc2626;
}

.danger-text {
  color: #dc2626;
}

:deep(.user-dropdown-popper) {
  width: min(208px, calc(100vw - 22px));
  max-width: calc(100vw - 22px);
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  padding: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.14);
}

:deep(.user-dropdown-popper .el-dropdown-menu) {
  padding: 0;
  min-width: 0;
  width: 100%;
  background: transparent;
}

:deep(.user-dropdown-popper .el-dropdown-menu__item) {
  height: 42px;
  line-height: 42px;
  border-radius: 10px;
  margin: 2px 0;
  transition: all 0.2s ease;
}

:deep(.user-dropdown-popper .el-dropdown-menu__item.user-dropdown-item:hover) {
  background: rgba(var(--brand-primary-rgb), 0.09);
}

:deep(.user-dropdown-popper .el-dropdown-menu__item.user-dropdown-item-danger:hover) {
  background: rgba(239, 68, 68, 0.08);
}

.theme-fab {
  position: fixed;
  right: clamp(12px, 2vw, 20px);
  bottom: clamp(20px, 3vw, 30px);
  z-index: 1200;
  box-shadow: 0 12px 22px rgba(var(--brand-primary-rgb), 0.28);
}

.drawer-section {
  margin-bottom: 20px;
}

.section-title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: var(--app-font-weight-semibold, 600);
  color: var(--text-primary);
}

.scheme-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.scheme-dot {
  width: 28px;
  height: 14px;
  border-radius: 999px;
}

.scheme-hint {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.scheme-hint-chip {
  width: 42px;
  height: 16px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.weight-radio-group {
  display: inline-flex;
  flex-wrap: wrap;
}

.weight-radio-group :deep(.el-radio-button__inner) {
  min-width: 68px;
}

.font-size-note {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.preview-section {
  margin-top: 4px;
}

.preview-card {
  border-radius: 12px;
  border: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  padding: 12px;
  line-height: 1.6;
}

.message-toolbar {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message-count {
  font-size: 13px;
  color: var(--text-secondary);
}

.message-empty-wrap {
  padding-top: 18px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-card {
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.9);
}

.message-card.unread {
  border-color: rgba(var(--brand-primary-rgb), 0.34);
  background: rgba(var(--brand-primary-rgb), 0.04);
}

.message-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
}

.message-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.message-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.message-title {
  font-size: 14px;
  font-weight: var(--app-font-weight-semibold, 600);
  color: var(--text-primary);
}

.message-time {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.message-content {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.message-actions {
  margin-top: 6px;
}

@media (max-width: 768px) {
  .app-header {
    margin: 10px 10px 0;
    padding: 0 10px;
    border-radius: 12px;
  }

  .breadcrumb {
    display: none;
  }

  .username-text {
    display: none;
  }

  .header-right {
    margin-left: 6px;
  }

  .user-pill-trigger {
    padding: 3px 6px;
  }

  .theme-fab {
    right: 12px;
    bottom: 14px;
  }

  :deep(.user-dropdown-popper) {
    width: min(192px, calc(100vw - 18px));
    max-width: calc(100vw - 18px);
    border-radius: 12px;
    padding: 6px;
  }

  .dropdown-item-label {
    max-width: 94px;
  }
}

@media (max-width: 420px) {
  .app-header {
    margin: 8px 8px 0;
    padding: 0 8px;
  }

  .avatar {
    width: 30px;
    height: 30px;
  }

  .breadcrumb {
    max-width: 120px;
  }

  .user-pill-trigger {
    padding: 2px 4px;
  }
}
</style>
