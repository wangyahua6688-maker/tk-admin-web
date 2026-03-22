<template>
  <div class="state-page">
    <div class="state-card">
      <h2>页面组件未映射</h2>
      <p>
        当前菜单已下发，但前端尚未实现对应页面。
        请在 <code>src/features/rbac/routes/dynamic.ts</code> 中补充路径映射。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 该页面用于菜单已授权但前端暂未实现时的兜底展示。
</script>

<style scoped>
.state-page {
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
}

.state-card {
  width: min(720px, 92vw);
  padding: 32px;
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--shadow-lg);
}

p {
  margin-top: 10px;
  color: var(--text-secondary);
}

code {
  background: #f2f4f8;
  border-radius: 6px;
  padding: 2px 6px;
}
</style>
