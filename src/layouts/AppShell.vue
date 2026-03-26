<template>
  <div class="shell">
    <SidebarMenu
      :collapsed="collapsed"
      :mobile="isCompact"
      @mobile-select="closeSidebarOnMobile"
      @toggle-collapse="toggleCollapse"
    />

    <transition name="mask-fade">
      <div
        v-if="isCompact && !collapsed"
        class="shell-mask"
        @click="closeSidebarOnMobile"
      ></div>
    </transition>

    <div class="main-area">
      <AppHeader :collapsed="collapsed" @toggle-collapse="toggleCollapse" />

      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import SidebarMenu from '@/layouts/SidebarMenu.vue';
import AppHeader from '@/layouts/AppHeader.vue';
import { useAppearanceStore } from '@/features/ui/store/appearance';

/**
 * 侧边栏折叠状态。
 */
const collapsed = ref(false);
const isCompact = ref(false);
const appearance = useAppearanceStore();
const COMPACT_BREAKPOINT = 992;
let mediaQuery: MediaQueryList | null = null;

/**
 * 应用启动后初始化界面偏好设置。
 * 说明：会自动恢复用户上次选择的配色、字体和字号。
 */
onMounted(() => {
  appearance.bootstrap();
  mediaQuery = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT}px)`);
  syncViewportMode(mediaQuery.matches, false);
  mediaQuery.addEventListener('change', onViewportChange);
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', onViewportChange);
});

/**
 * 同步当前视口模式：
 * 1. 窄屏下默认收起侧栏（作为抽屉）；
 * 2. 回到宽屏时默认展开侧栏（作为固定导航）。
 */
function syncViewportMode(isNowCompact: boolean, fromResize: boolean) {
  const wasCompact = isCompact.value;
  isCompact.value = isNowCompact;

  if (!fromResize) {
    collapsed.value = isNowCompact;
    return;
  }

  if (!wasCompact && isNowCompact) {
    collapsed.value = true;
  }
  if (wasCompact && !isNowCompact) {
    collapsed.value = false;
  }
}

function onViewportChange(e: MediaQueryListEvent) {
  syncViewportMode(e.matches, true);
}

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

function closeSidebarOnMobile() {
  if (!isCompact.value) return;
  collapsed.value = true;
}
</script>

<style scoped>
.shell {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: radial-gradient(
    circle at 20% -10%,
    var(--shell-bg-1) 0%,
    var(--shell-bg-2) 28%,
    var(--shell-bg-3) 60%,
    var(--shell-bg-4) 100%
  );
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
}

.content-area {
  flex: 1;
  min-height: 0;
  margin: clamp(10px, 1.5vw, 14px) clamp(10px, 1.6vw, 16px) clamp(10px, 1.6vw, 16px);
  padding: clamp(12px, 2vw, 18px);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  overflow: auto;
}

.shell-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(2px);
  z-index: 1199;
}

.mask-fade-enter-active,
.mask-fade-leave-active {
  transition: opacity 0.2s ease;
}

.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}

@media (min-width: 1680px) {
  .content-area {
    margin: 16px 20px 20px;
    padding: 22px;
  }
}

@media (max-width: 1200px) {
  .content-area {
    border-radius: 14px;
  }
}

@media (max-width: 768px) {
  .content-area {
    margin: 8px;
    padding: 10px;
    border-radius: 12px;
  }
}
</style>
