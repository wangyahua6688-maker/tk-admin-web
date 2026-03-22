<template>
  <div>
    <h2 class="page-title">客户端用户列表</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按用户名/昵称搜索" clearable style="max-width: 280px" />
      <el-select v-model="filterUserType" placeholder="用户类型筛选" clearable style="width: 180px" @change="reload">
        <el-option label="自然用户" value="natural" />
        <el-option label="官方账号" value="official" />
        <el-option label="机器人账号" value="robot" />
      </el-select>
      <el-button type="primary" @click="openCreate">新增用户</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredRows" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="nickname" label="昵称" min-width="140" />
        <el-table-column label="用户类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ userTypeLabel(row.user_type) }}</el-tag>
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

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑用户' : '新增用户'" width="520px" destroy-on-close>
      <el-form label-position="top" :model="form">
        <el-form-item label="用户名" :required="!editing">
          <el-input v-model="form.username" :disabled="editing" maxlength="64" />
        </el-form-item>

        <el-form-item label="昵称">
          <el-input v-model="form.nickname" maxlength="64" />
        </el-form-item>

        <el-form-item label="头像上传">
          <ImageUploadField v-model="form.avatar" />
        </el-form-item>

        <el-form-item label="用户类型">
          <el-select v-model="form.user_type" style="width: 100%">
            <el-option label="自然用户" value="natural" />
            <el-option label="官方账号" value="official" />
            <el-option label="机器人账号" value="robot" />
          </el-select>
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
import userMgmtAPI, { type ClientUser, type UserType } from '@/features/operations/api/user-mgmt';

const keyword = ref('');
const filterUserType = ref<UserType | ''>('');
const rows = ref<ClientUser[]>([]);

const dialogVisible = ref(false);
const editing = ref(false);
const saving = ref(false);

const form = reactive<{
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  user_type: UserType;
  status: boolean;
}>({
  id: 0,
  username: '',
  nickname: '',
  avatar: '',
  user_type: 'natural',
  status: true
});

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((item) => `${item.username} ${item.nickname}`.toLowerCase().includes(q));
});

async function reload() {
  const resp = await userMgmtAPI.getClientUsers(filterUserType.value || undefined);
  rows.value = resp.items || [];
}

function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: 0,
    username: '',
    nickname: '',
    avatar: '',
    user_type: 'natural',
    status: true
  });
  dialogVisible.value = true;
}

function openEdit(row: ClientUser) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    username: row.username,
    nickname: row.nickname || '',
    avatar: row.avatar || '',
    user_type: row.user_type || 'natural',
    status: Number(row.status) === 1
  });
  dialogVisible.value = true;
}

async function save() {
  if (!editing.value && !form.username.trim()) {
    ElMessage.warning('用户名不能为空');
    return;
  }

  saving.value = true;
  try {
    if (!editing.value) {
      await userMgmtAPI.createClientUser({
        username: form.username.trim(),
        nickname: form.nickname.trim(),
        avatar: form.avatar,
        user_type: form.user_type,
        status: form.status ? 1 : 0
      });
      ElMessage.success('创建成功');
    } else {
      await userMgmtAPI.updateClientUser(form.id, {
        nickname: form.nickname.trim(),
        avatar: form.avatar,
        user_type: form.user_type,
        status: form.status ? 1 : 0
      });
      ElMessage.success('更新成功');
    }

    dialogVisible.value = false;
    await reload();
  } finally {
    saving.value = false;
  }
}

async function remove(row: ClientUser) {
  await ElMessageBox.confirm(`确认删除用户【${row.username}】吗？`, '删除确认', {
    type: 'warning'
  });
  await userMgmtAPI.deleteClientUser(row.id);
  ElMessage.success('删除成功');
  await reload();
}

function userTypeLabel(type: UserType) {
  if (type === 'official') return '官方账号';
  if (type === 'robot') return '机器人';
  return '自然用户';
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
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
