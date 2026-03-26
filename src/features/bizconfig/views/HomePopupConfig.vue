<template>
  <div>
    <h2 class="page-title">首屏弹窗配置</h2>

    <div class="toolbar card">
      <el-select v-model="positionFilter" style="width: 220px" @change="reload">
        <el-option label="首页(home)" value="home" />
        <el-option label="全部位置" value="" />
      </el-select>
      <el-button type="primary" @click="openCreate">新增弹窗</el-button>
    </div>

    <div class="card">
      <el-table :data="rows" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="160" />
        <el-table-column prop="position" label="位置" width="120" />
        <el-table-column prop="show_once" label="单次展示" width="120">
          <template #default="{ row }">
            <el-tag :type="Number(row.show_once) === 1 ? 'success' : 'info'">
              {{ Number(row.show_once) === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="时间窗口" min-width="240">
          <template #default="{ row }">
            <span>{{ row.start_at || '-' }}</span>
            <span> ~ </span>
            <span>{{ row.end_at || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="Number(row.status) === 1 ? 'success' : 'warning'">
              {{ Number(row.status) === 1 ? '启用' : '停用' }}
            </el-tag>
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

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑首屏弹窗' : '新增首屏弹窗'" width="980px" destroy-on-close>
      <el-form label-position="top" :model="form">
        <el-form-item label="弹窗标题" required>
          <el-input v-model="form.title" maxlength="120" placeholder="请输入弹窗标题" />
        </el-form-item>

        <el-form-item label="弹窗图片">
          <ImageUploadField v-model="form.image_url" />
        </el-form-item>

        <el-form-item label="弹窗内容（富文本）">
          <RichTextEditor v-model="form.content" />
        </el-form-item>

        <el-form-item label="按钮文案">
          <el-input v-model="form.button_text" maxlength="40" placeholder="例如：立即参与" />
        </el-form-item>

        <el-form-item label="按钮跳转地址">
          <el-input v-model="form.button_link" maxlength="255" placeholder="https://..." />
        </el-form-item>

        <el-form-item label="展示位置">
          <el-select v-model="form.position" style="width: 100%">
            <el-option label="首页(home)" value="home" />
          </el-select>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="单设备只展示一次">
          <el-switch v-model="form.show_once" active-text="是" inactive-text="否" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="启用" inactive-text="停用" />
        </el-form-item>

        <el-form-item label="生效开始时间">
          <el-date-picker
            v-model="form.start_at"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            placeholder="可不填"
          />
        </el-form-item>

        <el-form-item label="生效结束时间">
          <el-date-picker
            v-model="form.end_at"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            placeholder="可不填"
          />
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
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import bizConfigAPI, { type HomePopupItem } from '@/features/bizconfig/api/biz-config';
import ImageUploadField from '@/features/ui/components/ImageUploadField.vue';
import RichTextEditor from '@/features/ui/components/RichTextEditor.vue';

// rows 管理列表数据。
const rows = ref<HomePopupItem[]>([]);
// positionFilter 记录位置筛选项。
const positionFilter = ref('home');
// dialogVisible 控制弹窗开关。
const dialogVisible = ref(false);
// editing 标记当前是否编辑模式。
const editing = ref(false);
// saving 标记保存中状态，避免重复提交。
const saving = ref(false);

// form 统一承载创建/编辑表单。
const form = reactive<{
  id: number;
  title: string;
  content: string;
  image_url: string;
  button_text: string;
  button_link: string;
  position: string;
  show_once: boolean;
  status: boolean;
  sort: number;
  start_at: string;
  end_at: string;
}>({
  id: 0,
  title: '',
  content: '',
  image_url: '',
  button_text: '',
  button_link: '',
  position: 'home',
  show_once: true,
  status: true,
  sort: 0,
  start_at: '',
  end_at: ''
});

// reload 拉取最新列表。
async function reload() {
  const resp = await bizConfigAPI.getHomePopups(positionFilter.value ? { position: positionFilter.value } : undefined);
  rows.value = resp.items || [];
}

// openCreate 重置表单并打开创建弹窗。
function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: 0,
    title: '',
    content: '',
    image_url: '',
    button_text: '',
    button_link: '',
    position: 'home',
    show_once: true,
    status: true,
    sort: 0,
    start_at: '',
    end_at: ''
  });
  dialogVisible.value = true;
}

// openEdit 回填表单并打开编辑弹窗。
function openEdit(row: HomePopupItem) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    image_url: row.image_url || '',
    button_text: row.button_text || '',
    button_link: row.button_link || '',
    position: row.position || 'home',
    show_once: Number(row.show_once) === 1,
    status: Number(row.status) === 1,
    sort: Number(row.sort || 0),
    start_at: row.start_at || '',
    end_at: row.end_at || ''
  });
  dialogVisible.value = true;
}

// save 提交新增或编辑操作。
async function save() {
  // 校验必填项。
  if (!form.title.trim()) {
    ElMessage.warning('请填写弹窗标题');
    return;
  }

  // 开始保存流程。
  saving.value = true;
  try {
    // 组装请求体。
    const payload = {
      title: form.title.trim(),
      content: form.content || '',
      image_url: form.image_url.trim(),
      button_text: form.button_text.trim(),
      button_link: form.button_link.trim(),
      position: form.position || 'home',
      show_once: form.show_once ? 1 : 0,
      status: form.status ? 1 : 0,
      sort: form.sort,
      start_at: form.start_at || '',
      end_at: form.end_at || ''
    };

    // 根据模式决定调用新增或编辑接口。
    if (editing.value) {
      await bizConfigAPI.updateHomePopup(form.id, payload);
      ElMessage.success('更新成功');
    } else {
      await bizConfigAPI.createHomePopup(payload);
      ElMessage.success('创建成功');
    }

    // 关闭弹窗并刷新列表。
    dialogVisible.value = false;
    await reload();
  } finally {
    // 结束保存态。
    saving.value = false;
  }
}

// remove 删除指定配置记录。
async function remove(row: HomePopupItem) {
  await ElMessageBox.confirm(`确认删除弹窗【${row.title}】吗？`, '删除确认', {
    type: 'warning'
  });
  await bizConfigAPI.deleteHomePopup(row.id);
  ElMessage.success('删除成功');
  await reload();
}

// 页面初始化时拉取数据。
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

