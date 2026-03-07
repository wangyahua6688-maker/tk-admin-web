<template>
  <div>
    <h2 class="page-title">帖子管理</h2>

    <div class="toolbar card">
      <el-input v-model="keyword" placeholder="按标题搜索" clearable style="max-width: 320px" />
      <el-button type="primary" @click="openCreate">新增帖子</el-button>
    </div>

    <div class="card">
      <el-table :data="filteredRows" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column label="发帖用户" min-width="160">
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
        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button text size="small" @click="openEdit(row)">编辑</el-button>
              <el-button text size="small" type="primary" @click="openCommentDialog(row)">评论管理</el-button>
              <el-button text size="small" type="danger" @click="remove(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑帖子' : '新增帖子'" width="1020px" destroy-on-close>
      <el-form label-position="top" :model="form">
        <el-form-item label="发帖机器人" required>
          <el-select v-model="form.user_id" style="width: 100%" filterable>
            <el-option v-for="user in robotUsers" :key="user.id" :label="`${user.username}(${user.nickname || '-'})`" :value="user.id" />
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

    <el-dialog v-model="commentDialogVisible" :title="`评论管理 - ${currentPost?.title || ''}`" width="1080px" destroy-on-close>
      <div class="comment-toolbar card-lite">
        <el-button type="primary" @click="openCreateComment(0)">增加评论</el-button>
      </div>

      <el-table :data="comments" stripe>
        <el-table-column prop="id" label="评论ID" width="90" />
        <el-table-column prop="parent_id" label="父评论ID" width="100" />
        <el-table-column label="评论用户" min-width="180">
          <template #default="{ row }">
            {{ commentUserLabel(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip />
        <el-table-column prop="created_at" label="时间" min-width="170" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button text size="small" type="primary" @click="openCreateComment(row.id)">回复</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="commentFormVisible" :title="commentForm.parent_id ? '回复评论' : '新增评论'" width="900px" destroy-on-close>
      <el-form :model="commentForm" label-position="top">
        <el-form-item label="评论用户类型">
          <el-radio-group v-model="commentUserType" @change="onCommentUserTypeChange">
            <el-radio value="robot">机器人账号</el-radio>
            <el-radio value="official">官方账号</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="评论用户" required>
          <el-select v-model="commentForm.user_id" filterable style="width: 100%">
            <el-option
              v-for="user in commentCandidateUsers"
              :key="user.id"
              :label="`${user.username}(${user.nickname || '-'})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="评论内容" required>
          <RichTextEditor v-model="commentForm.content" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="commentForm.status" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="commentFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingComment" @click="submitComment">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import ImageUploadField from '@/features/ui/components/ImageUploadField.vue';
import RichTextEditor from '@/features/ui/components/RichTextEditor.vue';
import userMgmtAPI, {
  type ClientUser,
  type PostArticle,
  type PostCommentItem,
  type UserType
} from '@/features/operations/api/user-mgmt';

const keyword = ref('');
const rows = ref<PostArticle[]>([]);
const robotUsers = ref<ClientUser[]>([]);
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

const commentDialogVisible = ref(false);
const commentFormVisible = ref(false);
const currentPost = ref<PostArticle | null>(null);
const comments = ref<PostCommentItem[]>([]);
const savingComment = ref(false);
const commentUserType = ref<UserType>('robot');

const commentForm = reactive<{
  user_id: number;
  parent_id: number;
  content: string;
  status: boolean;
}>({
  user_id: 0,
  parent_id: 0,
  content: '',
  status: true
});

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((item) => item.title.toLowerCase().includes(q));
});

const commentCandidateUsers = computed(() => {
  return commentUserType.value === 'official' ? officialUsers.value : robotUsers.value;
});

async function reload() {
  const resp = await userMgmtAPI.getPostArticles();
  rows.value = (resp.items || []).filter((item) => Number(item.is_official) === 0);
}

async function reloadUserOptions() {
  const [robotResp, officialResp] = await Promise.all([
    userMgmtAPI.getClientUsers('robot'),
    userMgmtAPI.getClientUsers('official')
  ]);
  robotUsers.value = robotResp.items || [];
  officialUsers.value = officialResp.items || [];
}

function userLabel(userID: number) {
  const hit = robotUsers.value.find((item) => item.id === userID) || officialUsers.value.find((item) => item.id === userID);
  if (!hit) return `ID:${userID}`;
  return `${hit.username}(${hit.nickname || '-'})`;
}

function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: 0,
    user_id: robotUsers.value[0]?.id || 0,
    title: '',
    cover_image: '',
    content: '',
    status: true
  });
  dialogVisible.value = true;
}

function openEdit(row: PostArticle) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    user_id: row.user_id || 0,
    title: row.title,
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
    ElMessage.warning('请选择发帖机器人');
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
      await userMgmtAPI.createPostArticle(payload);
      ElMessage.success('创建成功');
    } else {
      await userMgmtAPI.updatePostArticle(form.id, payload);
      ElMessage.success('更新成功');
    }

    dialogVisible.value = false;
    await reload();
  } finally {
    saving.value = false;
  }
}

async function remove(row: PostArticle) {
  await ElMessageBox.confirm(`确认删除帖子【${row.title}】吗？`, '删除确认', {
    type: 'warning'
  });
  await userMgmtAPI.deletePostArticle(row.id);
  ElMessage.success('删除成功');
  await reload();
}

async function openCommentDialog(row: PostArticle) {
  currentPost.value = row;
  commentDialogVisible.value = true;
  await reloadComments();
}

async function reloadComments() {
  if (!currentPost.value) return;
  const resp = await userMgmtAPI.getPostComments(currentPost.value.id);
  comments.value = resp.items || [];
}

function openCreateComment(parentID: number) {
  commentUserType.value = 'robot';
  Object.assign(commentForm, {
    user_id: robotUsers.value[0]?.id || 0,
    parent_id: parentID,
    content: '',
    status: true
  });
  commentFormVisible.value = true;
}

function onCommentUserTypeChange() {
  commentForm.user_id = commentCandidateUsers.value[0]?.id || 0;
}

async function submitComment() {
  if (!currentPost.value) return;
  if (!commentForm.user_id || !commentForm.content.trim()) {
    ElMessage.warning('评论用户和评论内容不能为空');
    return;
  }

  savingComment.value = true;
  try {
    await userMgmtAPI.createPostComment(currentPost.value.id, {
      user_id: commentForm.user_id,
      parent_id: commentForm.parent_id || undefined,
      content: commentForm.content,
      status: commentForm.status ? 1 : 0
    });
    ElMessage.success('评论保存成功');
    commentFormVisible.value = false;
    await reloadComments();
  } finally {
    savingComment.value = false;
  }
}

function commentUserLabel(row: PostCommentItem) {
  const name = row.nickname || row.username || `ID:${row.user_id}`;
  const type = row.user_type === 'official' ? '官方' : row.user_type === 'robot' ? '机器人' : '自然';
  return `${name} [${type}]`;
}

onMounted(async () => {
  await reloadUserOptions();
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

.card-lite {
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid #e2e8f3;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
