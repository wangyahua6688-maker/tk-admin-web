<template>
  <div>
    <h2 class="page-title">登录日志</h2>

    <div class="toolbar card">
      <el-input v-model="query.username" placeholder="按用户名筛选" clearable style="max-width: 280px" />
      <div class="toolbar-actions">
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="reloadLogs">查询</el-button>
      </div>
    </div>

    <div class="card">
      <el-table :data="logs" stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="ip" label="IP" min-width="120" />
        <el-table-column prop="device" label="设备" min-width="260" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="登录时间" min-width="180" />
      </el-table>

      <div class="pager-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next, sizes"
          :total="total"
          :current-page="query.page"
          :page-size="query.page_size"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="onPageChange"
          @size-change="onPageSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import auditAPI, { type LoginLogItem } from '@/features/rbac/api/audit';

/**
 * 查询参数。
 */
const query = reactive({
  page: 1,
  page_size: 20,
  username: ''
});

const logs = ref<LoginLogItem[]>([]);
const total = ref(0);
const loading = ref(false);

async function reloadLogs() {
  loading.value = true;
  try {
    const res = await auditAPI.getLoginLogs({
      page: query.page,
      page_size: query.page_size,
      username: query.username.trim()
    });

    logs.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.username = '';
  query.page = 1;
  reloadLogs();
}

function onPageChange(page: number) {
  query.page = page;
  reloadLogs();
}

function onPageSizeChange(size: number) {
  query.page_size = size;
  query.page = 1;
  reloadLogs();
}

onMounted(() => {
  void reloadLogs();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
}

.pager-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: flex-end;
  }

  .pager-wrap {
    justify-content: center;
  }
}
</style>
