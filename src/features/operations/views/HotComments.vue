<template>
  <div>
    <h2 class="page-title">热点评论</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按评论内容搜索" clearable style="max-width: 320px" />
      <span class="hint">新增评论已并入「帖子管理 > 评论管理」</span>
    </div>

    <div class="card">
      <el-table :data="filteredRows" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="post_id" label="帖子ID" width="100" />
        <el-table-column prop="user_id" label="用户ID" width="100" />
        <el-table-column prop="content" label="评论内容" min-width="260" show-overflow-tooltip />
        <el-table-column prop="likes" label="点赞" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="180" />
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

    <el-dialog v-model="dialogVisible" title="编辑评论" width="900px" destroy-on-close>
      <el-form :model="form" label-position="top">
        <el-form-item label="评论内容" required>
          <RichTextEditor v-model="form.content" />
        </el-form-item>
        <el-form-item label="点赞数">
          <el-input-number v-model="form.likes" :min="0" style="width: 100%" />
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
import userMgmtAPI, { type HotComment } from '@/features/operations/api/user-mgmt';

const keyword = ref('');
const rows = ref<HotComment[]>([]);

const dialogVisible = ref(false);
const saving = ref(false);

const form = reactive<{
  id: number;
  content: string;
  likes: number;
  status: boolean;
}>({
  id: 0,
  content: '',
  likes: 0,
  status: true
});

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((item) => item.content.toLowerCase().includes(q));
});

async function reload() {
  const resp = await userMgmtAPI.getHotComments();
  rows.value = resp.items || [];
}

function openEdit(row: HotComment) {
  Object.assign(form, {
    id: row.id,
    content: row.content || '',
    likes: row.likes || 0,
    status: Number(row.status) === 1
  });
  dialogVisible.value = true;
}

async function save() {
  if (!form.content.trim()) {
    ElMessage.warning('评论内容不能为空');
    return;
  }

  saving.value = true;
  try {
    await userMgmtAPI.updateHotComment(form.id, {
      content: form.content,
      likes: form.likes,
      status: form.status ? 1 : 0
    });
    ElMessage.success('更新成功');
    dialogVisible.value = false;
    await reload();
  } finally {
    saving.value = false;
  }
}

async function remove(row: HotComment) {
  await ElMessageBox.confirm(`确认删除评论 #${row.id} 吗？`, '删除确认', {
    type: 'warning'
  });
  await userMgmtAPI.deleteHotComment(row.id);
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

.hint {
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
