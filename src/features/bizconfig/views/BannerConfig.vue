<template>
  <div>
    <h2 class="page-title">Banner管理</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按标题搜索" clearable style="max-width: 260px" />
      <el-select v-model="filterType" placeholder="类型筛选" clearable style="width: 180px" @change="reload">
        <el-option label="广告(ad)" value="ad" />
        <el-option label="官方通知(official)" value="official" />
      </el-select>
      <el-button type="primary" @click="openCreate">新增 Banner</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredRows" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column prop="type" label="类型" width="110" />
        <el-table-column label="展示区" min-width="180">
          <template #default="{ row }">
            {{ positionsText(row.positions || row.position) }}
          </template>
        </el-table-column>
        <el-table-column prop="jump_type" label="跳转类型" width="110" />
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

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑 Banner' : '新增 Banner'" width="1080px" destroy-on-close>
      <el-form :model="form" label-position="top">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" maxlength="120" />
        </el-form-item>

        <el-form-item label="图片上传" required>
          <ImageUploadField v-model="form.image_url" />
        </el-form-item>

        <el-form-item label="类型" required>
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="广告(ad)" value="ad" />
            <el-option label="官方通知(official)" value="official" />
          </el-select>
        </el-form-item>

        <el-form-item label="展示区（可多选）" required>
          <el-select v-model="form.positions" style="width: 100%" multiple>
            <el-option label="首页(home)" value="home" />
            <el-option label="彩种详情(lottery_detail)" value="lottery_detail" />
            <el-option label="帖子详情(post_detail)" value="post_detail" />
          </el-select>
        </el-form-item>

        <el-form-item label="跳转类型">
          <el-select v-model="form.jump_type" style="width: 100%">
            <el-option label="不跳转(none)" value="none" />
            <el-option label="关联帖子(post)" value="post" />
            <el-option label="外链(external)" value="external" />
            <el-option label="自定义内容(custom)" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.jump_type === 'post'" label="关联帖子" required>
          <el-select v-model="form.jump_post_id" filterable style="width: 100%">
            <el-option v-for="post in allPosts" :key="post.id" :label="`#${post.id} ${post.title}`" :value="post.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.jump_type === 'external'" label="外链地址" required>
          <el-input v-model="form.jump_url" maxlength="255" placeholder="https://..." />
        </el-form-item>

        <el-form-item v-if="form.jump_type === 'custom'" label="自定义内容（富文本）">
          <RichTextEditor v-model="form.content_html" />
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
import ImageUploadField from '@/features/ui/components/ImageUploadField.vue';
import RichTextEditor from '@/features/ui/components/RichTextEditor.vue';
import bizConfigAPI, { type BannerItem, type OfficialPostItem } from '@/features/bizconfig/api/biz-config';
import userMgmtAPI, { type PostArticle } from '@/features/operations/api/user-mgmt';

const keyword = ref('');
const filterType = ref('');
const rows = ref<BannerItem[]>([]);

const userPosts = ref<PostArticle[]>([]);
const officialPosts = ref<OfficialPostItem[]>([]);

const dialogVisible = ref(false);
const editing = ref(false);
const saving = ref(false);

const form = reactive<{
  id: number;
  title: string;
  image_url: string;
  type: string;
  positions: string[];
  jump_type: 'none' | 'post' | 'external' | 'custom';
  jump_post_id: number;
  jump_url: string;
  content_html: string;
  sort: number;
  status: boolean;
}>({
  id: 0,
  title: '',
  image_url: '',
  type: 'ad',
  positions: ['home'],
  jump_type: 'none',
  jump_post_id: 0,
  jump_url: '',
  content_html: '',
  sort: 0,
  status: true
});

const allPosts = computed(() => {
  return [...userPosts.value, ...officialPosts.value];
});

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((item) => item.title.toLowerCase().includes(q));
});

async function reload() {
  const resp = await bizConfigAPI.getBanners(filterType.value || undefined);
  rows.value = resp.items || [];
}

async function reloadPostOptions() {
  const [userResp, officialResp] = await Promise.all([userMgmtAPI.getPostArticles(), bizConfigAPI.getOfficialPosts()]);
  userPosts.value = userResp.items || [];
  officialPosts.value = officialResp.items || [];
}

function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: 0,
    title: '',
    image_url: '',
    type: 'ad',
    positions: ['home'],
    jump_type: 'none',
    jump_post_id: 0,
    jump_url: '',
    content_html: '',
    sort: 0,
    status: true
  });
  dialogVisible.value = true;
}

function openEdit(row: BannerItem) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    title: row.title || '',
    image_url: row.image_url || '',
    type: row.type || 'ad',
    positions: splitPositions(row.positions || row.position),
    jump_type: (row.jump_type as any) || 'none',
    jump_post_id: row.jump_post_id || 0,
    jump_url: row.jump_url || '',
    content_html: row.content_html || '',
    sort: row.sort || 0,
    status: Number(row.status) === 1
  });
  dialogVisible.value = true;
}

async function save() {
  if (!form.title.trim() || !form.image_url || !form.type || form.positions.length === 0) {
    ElMessage.warning('请填写完整的必填字段');
    return;
  }

  if (form.jump_type === 'post' && !form.jump_post_id) {
    ElMessage.warning('请选择关联帖子');
    return;
  }

  if (form.jump_type === 'external' && !form.jump_url.trim()) {
    ElMessage.warning('外链地址不能为空');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      title: form.title.trim(),
      image_url: form.image_url,
      type: form.type,
      positions: form.positions,
      jump_type: form.jump_type,
      jump_post_id: form.jump_post_id || undefined,
      jump_url: form.jump_url.trim(),
      content_html: form.content_html,
      sort: form.sort,
      status: form.status ? 1 : 0
    };

    if (!editing.value) {
      await bizConfigAPI.createBanner(payload);
      ElMessage.success('创建成功');
    } else {
      await bizConfigAPI.updateBanner(form.id, payload);
      ElMessage.success('更新成功');
    }

    dialogVisible.value = false;
    await reload();
  } finally {
    saving.value = false;
  }
}

async function remove(row: BannerItem) {
  await ElMessageBox.confirm(`确认删除 Banner【${row.title}】吗？`, '删除确认', {
    type: 'warning'
  });
  await bizConfigAPI.deleteBanner(row.id);
  ElMessage.success('删除成功');
  await reload();
}

function splitPositions(raw: string) {
  return (raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function positionsText(raw: string) {
  return splitPositions(raw).join('、') || '-';
}

onMounted(async () => {
  await reloadPostOptions();
  await reload();
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
