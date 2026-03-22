<template>
  <div>
    <h2 class="page-title">系统广播配置</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按标题/内容搜索" clearable style="max-width: 320px" />
      <el-button type="primary" @click="openCreate">新增广播</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredRows" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button text size="small" @click="openEdit(row)">编辑</el-button>
              <el-button text size="small" type="danger" @click="remove(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑广播' : '新增广播'" width="980px" destroy-on-close>
      <el-form label-position="top" :model="form">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" maxlength="120" />
        </el-form-item>

        <el-form-item label="内容（富文本）" required>
          <RichTextEditor v-model="form.content" />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import RichTextEditor from '@/features/ui/components/RichTextEditor.vue';
import bizConfigAPI, { type BroadcastItem } from '@/features/bizconfig/api/biz-config';

const keyword = ref('');
const rows = ref<BroadcastItem[]>([]);

const dialogVisible = ref(false);
const editing = ref(false);
const saving = ref(false);

const form = reactive<{
  id: number;
  title: string;
  content: string;
  sort: number;
  status: boolean;
}>({
  id: 0,
  title: '',
  content: '',
  sort: 0,
  status: true
});

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((item) => `${item.title} ${item.content}`.toLowerCase().includes(q));
});

async function reload() {
  const resp = await bizConfigAPI.getBroadcasts();
  rows.value = resp.items || [];
}

function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: 0,
    title: '',
    content: '',
    sort: 0,
    status: true
  });
  dialogVisible.value = true;
}

function openEdit(row: BroadcastItem) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    sort: row.sort || 0,
    status: Number(row.status) === 1
  });
  dialogVisible.value = true;
}

async function save() {
  if (!form.title.trim() || !form.content.trim()) {
    ElMessage.warning('标题和内容不能为空');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      title: form.title.trim(),
      content: form.content,
      sort: form.sort,
      status: form.status ? 1 : 0
    };

    if (!editing.value) {
      await bizConfigAPI.createBroadcast(payload);
      ElMessage.success('创建成功');
    } else {
      await bizConfigAPI.updateBroadcast(form.id, payload);
      ElMessage.success('更新成功');
    }

    dialogVisible.value = false;
    await reload();
  } finally {
    saving.value = false;
  }
}

async function remove(row: BroadcastItem) {
  await ElMessageBox.confirm(`确认删除广播【${row.title}】吗？`, '删除确认', {
    type: 'warning'
  });
  await bizConfigAPI.deleteBroadcast(row.id);
  ElMessage.success('删除成功');
  await reload();
}

onMounted(() => {
  void reload();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
