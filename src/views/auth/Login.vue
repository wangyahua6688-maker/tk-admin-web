<!-- src/views/auth/Login.vue - 登录页面组件 -->
<template>
  <!-- 登录页面容器 -->
  <div class="login">
    <!-- 登录卡片 -->
    <el-card class="login-card">
      <!-- 页面标题 -->
      <h2>欢迎登录</h2>
      <!-- 登录表单 -->
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <!-- 用户名输入框 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="admin" />
        </el-form-item>
        <!-- 密码输入框 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="123456" show-password />
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button type="primary" @click="onSubmit" block>登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 登录页面逻辑
// 导入所需模块和组件
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import authAPI from '@/services/api/auth';

// 获取路由实例
const router = useRouter();
const route = useRoute();
// 获取认证状态管理实例
const auth = useAuthStore();

// 初始化表单数据
const form = reactive({ username: 'admin', password: '123456' });
// 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};
// 表单引用
const formRef = ref();

// 登录提交处理函数
async function onSubmit() {
  (formRef.value as any).validate(async (valid: boolean) => {
    if (!valid) return; // 表单验证失败则返回
    try {
      // 调用登录API
      const res = await authAPI.login(form);
      // 登录成功，保存认证信息
      auth.login(res.token, {
        id: res.user.id,
        name: res.user.name,
        role: res.user.role
      });
      // 获取重定向路径或默认跳转到首页
      const redirect = (route.query.redirect as string) || '/';
      router.replace(redirect);
    } catch (error) {
      console.error('登录失败:', error);
    }
  });
}
</script>

<style scoped>
/* 登录页面样式 */
.login {
  height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background-color: var(--bg-color);
}

.login-card {
  width: 360px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  background: #fff;
  border: none;
}

h2 {
  margin: 0 0 16px;
  text-align: center;
  font-weight: 600;
  font-size: 20px;
  color: var(--text-color);
}
</style>