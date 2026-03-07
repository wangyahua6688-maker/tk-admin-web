<template>
  <div>
    <h2 class="page-title">官方发帖管理</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按标题搜索" clearable style="max-width: 300px" />
      <el-button type="primary" @click="openCreate">新增官方帖子</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredRows" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column label="官方账号" min-width="170">
          <template #default="{ row }">
            {{ userLabel(row.user_id) }}
          </template>
        </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑官方帖子' : '新增官方帖子'" width="1020px" destroy-on-close>
      <el-form label-position="top" :model="form">
        <el-form-item label="官方账号" required>
          <el-select v-model="form.user_id" style="width: 100%" filterable>
            <el-option v-for="user in officialUsers" :key="user.id" :label="`${user.username}(${user.nickname || '-'})`" :value="user.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="标题" required>
          <el-input v-model="form.title" maxlength="160" />
        </el-form-item>

        <el-form-item label="封面图上传">
          <ImageUploadField v-model="form.cover_image" />
        </el-form-item>

        <el-form-item label="正文内容（富文本）">
          <RichTextEditor v-model="form.content" />
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
import ImageUploadField from '@/features/ui/components/ImageUploadField.vue';
import RichTextEditor from '@/features/ui/components/RichTextEditor.vue';
import bizConfigAPI, { type OfficialPostItem } from '@/features/bizconfig/api/biz-config';
import userMgmtAPI, { type ClientUser } from '@/features/operations/api/user-mgmt';

const keyword = ref('');
const rows = ref<OfficialPostItem[]>([]);
const officialUsers = ref<ClientUser[]>([]);

const dialogVisible = ref(false);
const editing = ref(false);
const saving = ref(false);

const form = reactive<{
  id: number;
  user_id: number;
  title: string;
  cover_image: string;
  content: string;
  status: boolean;
}>({
  id: 0,
  user_id: 0,
  title: '',
  cover_image: '',
  content: '',
  status: true
});

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((item) => item.title.toLowerCase().includes(q));
});

async function reload() {
  const resp = await bizConfigAPI.getOfficialPosts();
  rows.value = resp.items || [];
}

async function reloadOfficialUsers() {
  const resp = await userMgmtAPI.getClientUsers('official');
  officialUsers.value = resp.items || [];
}

function userLabel(userID: number) {
  const hit = officialUsers.value.find((item) => item.id === userID);
  if (!hit) return `ID:${userID}`;
  return `${hit.username}(${hit.nickname || '-'})`;
}

function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: 0,
    user_id: officialUsers.value[0]?.id || 0,
    title: '',
    cover_image: '',
    content: '',
    status: true
  });
  dialogVisible.value = true;
}

function openEdit(row: OfficialPostItem) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    user_id: row.user_id || 0,
    title: row.title || '',
    cover_image: row.cover_image || '',
    content: row.content || '',
    status: Number(row.status) === 1
  });
  dialogVisible.value = true;
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning('标题不能为空');
    return;
  }
  if (!form.user_id) {
    ElMessage.warning('请选择官方账号');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      user_id: form.user_id,
      title: form.title.trim(),
      cover_image: form.cover_image,
      content: form.content,
      status: form.status ? 1 : 0
    };

    if (!editing.value) {
      await bizConfigAPI.createOfficialPost(payload);
      ElMessage.success('创建成功');
    } else {
      await bizConfigAPI.updateOfficialPost(form.id, payload);
      ElMessage.success('更新成功');
    }

    dialogVisible.value = false;
    await reload();
  } finally {
    saving.value = false;
  }
}

async function remove(row: OfficialPostItem) {
  await ElMessageBox.confirm(`确认删除官方帖子【${row.title}】吗？`, '删除确认', {
    type: 'warning'
  });
  await bizConfigAPI.deleteOfficialPost(row.id);
  ElMessage.success('删除成功');
  await reload();
}

onMounted(async () => {
  await reloadOfficialUsers();
  await reload();
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
