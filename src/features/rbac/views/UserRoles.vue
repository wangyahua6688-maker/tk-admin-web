<template>
  <div>
    <h2 class="page-title">用户角色管理</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按用户名或邮箱搜索" clearable style="max-width: 320px" />
      <el-button type="primary" @click="reloadUsers">刷新用户列表</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredUsers" stripe>
        <el-table-column prop="username" label="用户名" min-width="160" />
        <el-table-column prop="email" label="邮箱" min-width="220" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button
              text
              type="primary"
              :disabled="isCurrentLoginUser(row)"
              @click="openBindDialog(row)"
            >
              分配角色
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="bindDialogVisible" title="分配用户角色" width="560px" destroy-on-close>
      <div class="dialog-subtitle">
        当前用户：<strong>{{ currentUser?.username || '-' }}</strong>
      </div>

      <el-checkbox-group v-model="selectedRoleIds" class="role-checkbox-group">
        <el-checkbox v-for="role in roles" :key="role.id" :value="role.id">
          {{ role.name }}（{{ role.code }}）
        </el-checkbox>
      </el-checkbox-group>

      <template #footer>
        <el-button @click="bindDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitBind">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import userAPI, { type User } from '@/features/users/api/users';
import roleAPI, { type Role } from '@/features/rbac/api/roles';
import userRoleAPI from '@/features/rbac/api/user-roles';
import { useAuthStore } from '@/features/auth/store/auth';

/**
 * 页面状态。
 */
const keyword = ref('');
const users = ref<User[]>([]);
const roles = ref<Role[]>([]);
const auth = useAuthStore();

/**
 * 用户角色绑定弹窗状态。
 */
const bindDialogVisible = ref(false);
const currentUser = ref<User | null>(null);
const selectedRoleIds = ref<string[]>([]);
const saving = ref(false);

const filteredUsers = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return users.value;
  return users.value.filter((u) => `${u.username} ${u.email}`.toLowerCase().includes(q));
});

async function reloadUsers() {
  users.value = await userAPI.getUsers();
}

async function reloadRoles() {
  // 去重，避免复选框 value 重复导致点击异常。
  const raw = (await roleAPI.getRoles()).filter((role) => role.id);
  const map = new Map<string, Role>();
  raw.forEach((role) => {
    if (!map.has(role.id)) {
      map.set(role.id, role);
    }
  });
  roles.value = Array.from(map.values());
}

/**
 * 打开“分配角色”弹窗：
 * 1. 记录当前用户；
 * 2. 拉取该用户现有角色；
 */
async function openBindDialog(user: User) {
  try {
    if (isCurrentLoginUser(user)) {
      ElMessage.warning('当前登录账号不可在此页面修改角色');
      return;
    }

    currentUser.value = user;
    const boundRoles = await userRoleAPI.getUserRoles(user.id);
    selectedRoleIds.value = Array.from(new Set(boundRoles.map((r) => r.id).filter((id) => id)));
    bindDialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error?.message || '加载用户角色失败');
  }
}

/**
 * 保存角色绑定。
 */
async function submitBind() {
  if (!currentUser.value) return;

  saving.value = true;
  try {
    await userRoleAPI.bindUserRoles(currentUser.value.id, selectedRoleIds.value);
    ElMessage.success('用户角色保存成功');
    bindDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error?.message || '用户角色保存失败');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  void Promise.all([reloadUsers(), reloadRoles()]);
});

/**
 * 当前登录用户禁止修改自身角色（与后端安全策略保持一致）。
 */
function isCurrentLoginUser(user: User): boolean {
  return String(user.id) === String(auth.user?.id || '');
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.dialog-subtitle {
  margin-bottom: 14px;
  color: var(--text-secondary);
}

.role-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 10px;
  background: #f6f8fb;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
