<template>
  <div>
    <h2 class="page-title">短信通道配置</h2>

    <div class="toolbar card">
      <el-select v-model="statusFilter" style="width: 220px" @change="reload">
        <el-option label="全部状态" value="" />
        <el-option label="启用" value="1" />
        <el-option label="停用" value="0" />
      </el-select>
      <el-button type="primary" @click="openCreate">新增通道</el-button>
    </div>

    <div class="card">
      <el-table :data="rows" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="provider" label="服务商" width="120" />
        <el-table-column prop="channel_name" label="通道名称" min-width="180" />
        <el-table-column prop="sign_name" label="签名" width="140" />
        <el-table-column label="限流配置" min-width="220">
          <template #default="{ row }">
            <span>{{ row.minute_limit }}次/分钟</span>
            <span> · </span>
            <span>{{ row.daily_limit }}次/日</span>
            <span> · </span>
            <span>TTL {{ row.code_ttl_seconds }}秒</span>
          </template>
        </el-table-column>
        <el-table-column label="模式" width="140">
          <template #default="{ row }">
            <el-tag :type="Number(row.mock_mode) === 1 ? 'warning' : 'success'">
              {{ Number(row.mock_mode) === 1 ? '模拟发送' : '真实发送' }}
            </el-tag>
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

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑短信通道' : '新增短信通道'" width="820px" destroy-on-close>
      <el-form label-position="top" :model="form">
        <el-form-item label="服务商标识" required>
          <el-select v-model="form.provider" style="width: 100%">
            <el-option label="阿里云(aliyun)" value="aliyun" />
            <el-option label="腾讯云(tencent)" value="tencent" />
            <el-option label="Twilio(twilio)" value="twilio" />
            <el-option label="自定义(custom)" value="custom" />
            <el-option label="模拟(mock)" value="mock" />
          </el-select>
        </el-form-item>

        <el-form-item label="通道名称" required>
          <el-input v-model="form.channel_name" maxlength="64" placeholder="用于后台识别，例如：主通道A" />
        </el-form-item>

        <el-form-item label="AccessKey">
          <el-input v-model="form.access_key" maxlength="128" />
        </el-form-item>

        <el-form-item label="AccessSecret">
          <el-input v-model="form.access_secret" maxlength="255" show-password />
        </el-form-item>

        <el-form-item label="Endpoint">
          <el-input v-model="form.endpoint" maxlength="255" placeholder="https://..." />
        </el-form-item>

        <el-form-item label="短信签名">
          <el-input v-model="form.sign_name" maxlength="64" />
        </el-form-item>

        <el-form-item label="登录验证码模板编码">
          <el-input v-model="form.template_code_login" maxlength="64" />
        </el-form-item>

        <el-form-item label="注册验证码模板编码">
          <el-input v-model="form.template_code_register" maxlength="64" />
        </el-form-item>

        <el-form-item label="分钟发送上限">
          <el-input-number v-model="form.minute_limit" :min="1" style="width: 100%" />
        </el-form-item>

        <el-form-item label="单日发送上限">
          <el-input-number v-model="form.daily_limit" :min="1" style="width: 100%" />
        </el-form-item>

        <el-form-item label="验证码有效期（秒）">
          <el-input-number v-model="form.code_ttl_seconds" :min="30" style="width: 100%" />
        </el-form-item>

        <el-form-item label="发送模式">
          <el-switch v-model="form.mock_mode" active-text="模拟发送" inactive-text="真实发送" />
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
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import bizConfigAPI, { type SMSChannelItem } from '@/features/bizconfig/api/biz-config';

// rows 记录列表数据。
const rows = ref<SMSChannelItem[]>([]);
// statusFilter 记录状态筛选值。
const statusFilter = ref('');
// dialogVisible 控制弹窗开关。
const dialogVisible = ref(false);
// editing 标记当前是否编辑模式。
const editing = ref(false);
// saving 防止重复提交。
const saving = ref(false);

// form 保存新增/编辑表单值。
const form = reactive<{
  id: number;
  provider: string;
  channel_name: string;
  access_key: string;
  access_secret: string;
  endpoint: string;
  sign_name: string;
  template_code_login: string;
  template_code_register: string;
  daily_limit: number;
  minute_limit: number;
  code_ttl_seconds: number;
  mock_mode: boolean;
  status: boolean;
}>({
  id: 0,
  provider: 'custom',
  channel_name: '',
  access_key: '',
  access_secret: '',
  endpoint: '',
  sign_name: '',
  template_code_login: '',
  template_code_register: '',
  daily_limit: 20,
  minute_limit: 1,
  code_ttl_seconds: 300,
  mock_mode: true,
  status: true
});

// reload 查询通道列表。
async function reload() {
  const params = statusFilter.value === '' ? undefined : { status: Number(statusFilter.value) };
  const resp = await bizConfigAPI.getSMSChannels(params);
  rows.value = resp.items || [];
}

// openCreate 重置并打开创建弹窗。
function openCreate() {
  editing.value = false;
  Object.assign(form, {
    id: 0,
    provider: 'custom',
    channel_name: '',
    access_key: '',
    access_secret: '',
    endpoint: '',
    sign_name: '',
    template_code_login: '',
    template_code_register: '',
    daily_limit: 20,
    minute_limit: 1,
    code_ttl_seconds: 300,
    mock_mode: true,
    status: true
  });
  dialogVisible.value = true;
}

// openEdit 回填并打开编辑弹窗。
function openEdit(row: SMSChannelItem) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    provider: row.provider || 'custom',
    channel_name: row.channel_name || '',
    access_key: row.access_key || '',
    access_secret: row.access_secret || '',
    endpoint: row.endpoint || '',
    sign_name: row.sign_name || '',
    template_code_login: row.template_code_login || '',
    template_code_register: row.template_code_register || '',
    daily_limit: Number(row.daily_limit || 20),
    minute_limit: Number(row.minute_limit || 1),
    code_ttl_seconds: Number(row.code_ttl_seconds || 300),
    mock_mode: Number(row.mock_mode) === 1,
    status: Number(row.status) === 1
  });
  dialogVisible.value = true;
}

// save 提交新增或更新。
async function save() {
  // 校验必填字段。
  if (!form.channel_name.trim()) {
    ElMessage.warning('请填写通道名称');
    return;
  }

  // 切换保存态。
  saving.value = true;
  try {
    // 组装统一请求体。
    const payload = {
      provider: form.provider || 'custom',
      channel_name: form.channel_name.trim(),
      access_key: form.access_key.trim(),
      access_secret: form.access_secret.trim(),
      endpoint: form.endpoint.trim(),
      sign_name: form.sign_name.trim(),
      template_code_login: form.template_code_login.trim(),
      template_code_register: form.template_code_register.trim(),
      daily_limit: form.daily_limit,
      minute_limit: form.minute_limit,
      code_ttl_seconds: form.code_ttl_seconds,
      mock_mode: form.mock_mode ? 1 : 0,
      status: form.status ? 1 : 0
    };

    // 根据模式调用接口。
    if (editing.value) {
      await bizConfigAPI.updateSMSChannel(form.id, payload);
      ElMessage.success('更新成功');
    } else {
      await bizConfigAPI.createSMSChannel(payload);
      ElMessage.success('创建成功');
    }

    // 关闭弹窗并刷新。
    dialogVisible.value = false;
    await reload();
  } finally {
    // 结束保存态。
    saving.value = false;
  }
}

// remove 删除通道。
async function remove(row: SMSChannelItem) {
  await ElMessageBox.confirm(`确认删除短信通道【${row.channel_name}】吗？`, '删除确认', {
    type: 'warning'
  });
  await bizConfigAPI.deleteSMSChannel(row.id);
  ElMessage.success('删除成功');
  await reload();
}

// 页面挂载时加载数据。
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

