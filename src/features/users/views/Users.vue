<template>
  <div>
    <h2 class="page-title">用户与角色管理</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按用户名/邮箱/角色搜索" clearable style="max-width: 360px" />
      <el-button type="primary" @click="openCreate">新增用户</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredUsers" stripe>
        <el-table-column label="头像" width="90" align="center">
          <template #default="{ row }">
            <el-avatar :size="34" :src="row.avatar || undefined">
              {{ row.username?.slice(0, 1)?.toUpperCase() || 'U' }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="email" label="邮箱" min-width="220" />

        <el-table-column label="角色" min-width="220">
          <template #default="{ row }">
            <div v-if="row.roleNames.length > 0" class="role-tags">
              <el-tag v-for="name in row.roleNames" :key="name" size="small" effect="plain">{{ name }}</el-tag>
            </div>
            <span v-else class="empty-role">未分配</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" min-width="180" />

        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button text size="small" @click="openEdit(row)">编辑</el-button>
              <el-button
                text
                size="small"
                type="primary"
                :disabled="isCurrentLoginUser(row)"
                @click="openBindRoles(row)"
              >
                分配角色
              </el-button>
              <el-button text size="small" type="danger" @click="remove(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑用户' : '新增用户'" width="520px" destroy-on-close>
      <el-form :model="form" label-position="top">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" :disabled="editing" maxlength="100" />
        </el-form-item>

        <el-form-item label="邮箱" required>
          <el-input v-model="form.email" maxlength="255" />
        </el-form-item>

        <el-form-item label="头像地址">
          <el-input v-model="form.avatar" maxlength="255" placeholder="https://example.com/avatar.png" />
          <div class="avatar-preview-wrap">
            <span class="avatar-preview-label">预览：</span>
            <el-avatar :size="32" :src="form.avatar || undefined">
              {{ form.username?.slice(0, 1)?.toUpperCase() || 'U' }}
            </el-avatar>
          </div>
        </el-form-item>

        <el-form-item label="密码" :required="!editing">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="editing ? '不修改请留空' : '请输入密码（至少8位）'"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="roleDialogVisible" title="分配用户角色" width="560px" destroy-on-close>
      <div class="dialog-subtitle">
        当前用户：<strong>{{ currentUser?.username || '-' }}</strong>
      </div>

      <el-checkbox-group v-model="selectedRoleIds" class="role-checkbox-group">
        <el-checkbox v-for="role in roles" :key="role.id" :value="role.id">
          {{ role.name }}（{{ role.code }}）
        </el-checkbox>
      </el-checkbox-group>

      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingRoles" @click="submitBindRoles">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/features/auth/store/auth';
import userAPI, { type User, type CreateUserData, type UpdateUserData } from '@/features/users/api/users';
import roleAPI, { type Role } from '@/features/rbac/api/roles';
import userRoleAPI from '@/features/rbac/api/user-roles';

interface UserRow extends User {
  roleIds: string[];
  roleNames: string[];
}

const auth = useAuthStore();
const keyword = ref('');
const users = ref<UserRow[]>([]);
const roles = ref<Role[]>([]);

const dialogVisible = ref(false);
const editing = ref(false);
const saving = ref(false);

/**
 * 用户角色绑定弹窗状态。
 */
const roleDialogVisible = ref(false);
const currentUser = ref<UserRow | null>(null);
const selectedRoleIds = ref<string[]>([]);
const savingRoles = ref(false);

const form = reactive<{
  id: string;
  username: string;
  email: string;
  avatar: string;
  password: string;
  status: boolean;
}>({
  id: '',
  username: '',
  email: '',
  avatar: '',
  password: '',
  status: true
});

const filteredUsers = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return users.value;
  return users.value.filter((user) => {
    const roleText = user.roleNames.join(' ');
    return `${user.username} ${user.email} ${roleText}`.toLowerCase().includes(q);
  });
});

/**
 * 重新加载角色列表（去重）。
 */
async function reloadRoles() {
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
 * 加载用户列表并拼接角色信息。
 */
async function reloadUsers() {
  const baseUsers = await userAPI.getUsers();

  const rows = await Promise.all(
    baseUsers.map(async (user): Promise<UserRow> => {
      try {
        const boundRoles = await userRoleAPI.getUserRoles(user.id);
        const roleIds = Array.from(new Set(boundRoles.map((role) => role.id).filter((id) => id)));
        const roleNames = Array.from(new Set(boundRoles.map((role) => role.name).filter((name) => name)));

        return {
          ...user,
          roleIds,
          roleNames
        };
      } catch {
        // 某个用户角色查询失败时，保证主列表仍可展示。
        return {
          ...user,
          roleIds: [],
          roleNames: []
        };
      }
    })
  );

  users.value = rows;
}

function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: '',
    username: '',
    email: '',
    avatar: '',
    password: '',
    status: true
  });
  dialogVisible.value = true;
}

function openEdit(user: UserRow) {
  editing.value = true;
  Object.assign(form, {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || '',
    password: '',
    status: user.status
  });
  dialogVisible.value = true;
}

function validateForm(): boolean {
  if (!form.username.trim()) {
    ElMessage.warning('用户名不能为空');
    return false;
  }

  if (!form.email.trim()) {
    ElMessage.warning('邮箱不能为空');
    return false;
  }

  if (!editing.value && form.password.trim().length < 8) {
    ElMessage.warning('新增用户密码长度至少8位');
    return false;
  }

  return true;
}

async function save() {
  if (!validateForm()) return;

  saving.value = true;
  try {
    if (!editing.value) {
      const payload: CreateUserData = {
        username: form.username.trim(),
        email: form.email.trim(),
        avatar: form.avatar.trim(),
        password: form.password,
        status: form.status
      };
      await userAPI.createUser(payload);
      ElMessage.success('用户创建成功');
    } else {
      const payload: UpdateUserData = {
        username: form.username.trim(),
        email: form.email.trim(),
        avatar: form.avatar.trim(),
        status: form.status
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      await userAPI.updateUser(form.id, payload);
      ElMessage.success('用户更新成功');
    }

    dialogVisible.value = false;
    await reloadUsers();
  } finally {
    saving.value = false;
  }
}

async function remove(user: UserRow) {
  await ElMessageBox.confirm(`确认删除用户【${user.username}】吗？`, '删除确认', {
    type: 'warning'
  });

  await userAPI.deleteUser(user.id);
  users.value = users.value.filter((item) => item.id !== user.id);
  ElMessage.success('用户删除成功');
}

/**
 * 打开角色绑定弹窗并加载已分配角色。
 */
async function openBindRoles(user: UserRow) {
  if (isCurrentLoginUser(user)) {
    ElMessage.warning('当前登录账号不可在此页面修改角色');
    return;
  }

  if (roles.value.length === 0) {
    await reloadRoles();
  }

  currentUser.value = user;

  try {
    const boundRoles = await userRoleAPI.getUserRoles(user.id);
    selectedRoleIds.value = Array.from(new Set(boundRoles.map((role) => role.id).filter((id) => id)));
  } catch {
    selectedRoleIds.value = Array.from(new Set(user.roleIds));
  }

  roleDialogVisible.value = true;
}

/**
 * 保存用户角色绑定。
 */
async function submitBindRoles() {
  if (!currentUser.value) return;

  savingRoles.value = true;
  try {
    await userRoleAPI.bindUserRoles(currentUser.value.id, selectedRoleIds.value);
    ElMessage.success('用户角色保存成功');
    roleDialogVisible.value = false;
    await reloadUsers();
  } catch (error: any) {
    ElMessage.error(error?.message || '用户角色保存失败');
  } finally {
    savingRoles.value = false;
  }
}

/**
 * 当前登录用户禁止修改自身角色（与后端安全策略保持一致）。
 */
function isCurrentLoginUser(user: Pick<User, 'id'>): boolean {
  return String(user.id) === String(auth.user?.id || '');
}

onMounted(() => {
  void Promise.all([reloadRoles(), reloadUsers()]);
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

.role-tags {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.empty-role {
  color: var(--text-secondary);
}

.avatar-preview-wrap {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.avatar-preview-label {
  color: var(--text-secondary);
  font-size: 12px;
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
