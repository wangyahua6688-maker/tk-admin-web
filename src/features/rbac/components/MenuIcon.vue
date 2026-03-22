<template>
  <el-icon :size="size" class="menu-icon">
    <!--
      统一图标渲染容器：
      1. Element Plus 与 Lucide 都放进 el-icon，保证菜单中的图标间距一致；
      2. Lucide 额外传 size/strokeWidth，避免线性图标过粗或尺寸不一致。
    -->
    <component
      :is="iconComponent"
      :size="library === 'lucide' ? size : undefined"
      :stroke-width="library === 'lucide' ? 1.8 : undefined"
    />
  </el-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  getMenuIconLibrary,
  resolveMenuIconComponent
} from '@/features/rbac/utils/menu-icons';

interface Props {
  icon: string;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 16
});

/**
 * 图标来源库（Element Plus / Lucide）。
 */
const library = computed(() => getMenuIconLibrary(props.icon));

/**
 * 图标组件引用。
 */
const iconComponent = computed(() => resolveMenuIconComponent(props.icon));
</script>

<style scoped>
.menu-icon {
  flex: 0 0 auto;
}
</style>
