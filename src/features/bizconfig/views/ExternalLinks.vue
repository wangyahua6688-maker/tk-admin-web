<template>
  <div>
    <h2 class="page-title">外链配置</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按名称/链接/位置搜索" clearable style="max-width: 320px" />
      <el-button type="primary" @click="openCreate">新增外链</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredRows" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="url" label="链接" min-width="260" show-overflow-tooltip />
        <el-table-column prop="position" label="位置" width="120" />
        <el-table-column prop="group_key" label="分组" width="120" />
        <el-table-column label="图标" width="100">
          <template #default="{ row }">
            <el-image v-if="row.icon_url" :src="row.icon_url" fit="cover" style="width: 36px; height: 36px; border-radius: 50%" />
            <span v-else>-</span>
          </template>
        </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑外链' : '新增外链'" width="560px" destroy-on-close>
      <el-form label-position="top" :model="form">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" maxlength="80" />
        </el-form-item>

        <el-form-item label="链接" required>
          <el-input v-model="form.url" maxlength="255" placeholder="https://..." />
        </el-form-item>

        <el-form-item label="位置" required>
          <el-select v-model="form.position" style="width: 100%">
            <el-option label="首页外链(home_external)" value="home_external" />
            <el-option label="首页金刚导航(home_kingkong)" value="home_kingkong" />
            <el-option label="首页(home)" value="home" />
            <el-option label="帖子详情(post_detail)" value="post_detail" />
            <el-option label="彩种详情(lottery_detail)" value="lottery_detail" />
          </el-select>
        </el-form-item>

        <el-form-item label="图标上传（用于金刚导航）">
          <ImageUploadField v-model="form.icon_url" />
        </el-form-item>

        <el-form-item label="分组键（如 aocai / hkcai / default）">
          <el-input v-model="form.group_key" maxlength="32" />
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
import bizConfigAPI, { type ExternalLinkItem } from '@/features/bizconfig/api/biz-config';
import ImageUploadField from '@/features/ui/components/ImageUploadField.vue';

const keyword = ref('');
const rows = ref<ExternalLinkItem[]>([]);

const dialogVisible = ref(false);
const editing = ref(false);
const saving = ref(false);

const form = reactive<{
  id: number;
  name: string;
  url: string;
  position: string;
  icon_url: string;
  group_key: string;
  sort: number;
  status: boolean;
}>({
  id: 0,
  name: '',
  url: '',
  position: 'home_external',
  icon_url: '',
  group_key: '',
  sort: 0,
  status: true
});

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((item) => `${item.name} ${item.url} ${item.position} ${item.group_key}`.toLowerCase().includes(q));
});

async function reload() {
  const resp = await bizConfigAPI.getExternalLinks();
  rows.value = resp.items || [];
}

function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: 0,
    name: '',
    url: '',
    position: 'home_external',
    icon_url: '',
    group_key: '',
    sort: 0,
    status: true
  });
  dialogVisible.value = true;
}

function openEdit(row: ExternalLinkItem) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    name: row.name || '',
    url: row.url || '',
    position: row.position || 'home_external',
    icon_url: row.icon_url || '',
    group_key: row.group_key || '',
    sort: row.sort || 0,
    status: Number(row.status) === 1
  });
  dialogVisible.value = true;
}

async function save() {
  if (!form.name.trim() || !form.url.trim() || !form.position.trim()) {
    ElMessage.warning('请填写完整的必填字段');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      url: form.url.trim(),
      position: form.position,
      icon_url: form.icon_url.trim(),
      group_key: form.group_key.trim(),
      sort: form.sort,
      status: form.status ? 1 : 0
    };

    if (!editing.value) {
      await bizConfigAPI.createExternalLink(payload);
      ElMessage.success('创建成功');
    } else {
      await bizConfigAPI.updateExternalLink(form.id, payload);
      ElMessage.success('更新成功');
    }

    dialogVisible.value = false;
    await reload();
  } finally {
    saving.value = false;
  }
}

async function remove(row: ExternalLinkItem) {
  await ElMessageBox.confirm(`确认删除外链【${row.name}】吗？`, '删除确认', {
    type: 'warning'
  });
  await bizConfigAPI.deleteExternalLink(row.id);
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
