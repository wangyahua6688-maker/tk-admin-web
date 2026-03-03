<template>
  <div class="login-page">
    <div class="aurora" />

    <el-card class="login-card">
      <div class="brand">
        <h1>Go Admin Console</h1>
        <p>基于 JWT + RBAC 的后台管理平台</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" autocomplete="username" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="submit-btn" :loading="submitting" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useAuthStore } from '@/features/auth/store/auth';

const router = useRouter();
const auth = useAuthStore();

const submitting = ref(false);
const formRef = ref<FormInstance>();

const form = reactive({
  username: 'admin',
  password: 'Admin@123456'
});

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

/**
 * 登录后统一进入后台首页：
 * 1. 避免历史 redirect 参数导致落到无效页面；
 * 2. 首屏固定为首页看板，便于用户快速掌握系统概览。
 */
function onSubmit() {
  formRef.value?.validate(async (valid) => {
    if (!valid || submitting.value) return;

    submitting.value = true;
    try {
      await auth.loginByPassword({
        username: form.username.trim(),
        password: form.password
      });

      router.replace('/dashboard');
    } catch (error: any) {
      ElMessage.error(error?.message || '登录失败');
    } finally {
      submitting.value = false;
    }
  });
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(140deg, #f4f7ff 0%, #f7f9fc 40%, #ffffff 100%);
  overflow: hidden;
}

.aurora {
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(54, 120, 255, 0.28) 0%, rgba(54, 120, 255, 0) 68%);
  filter: blur(10px);
  top: -120px;
  left: -120px;
  animation: float 6s ease-in-out infinite;
}

.login-card {
  width: min(420px, 92vw);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  box-shadow: 0 24px 60px rgba(30, 41, 59, 0.16);
  z-index: 1;
}

.brand {
  margin-bottom: 18px;
  text-align: center;
}

.brand h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 650;
}

.brand p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  height: 40px;
  border-radius: 10px;
}

@keyframes float {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(28px, 20px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}
</style>
