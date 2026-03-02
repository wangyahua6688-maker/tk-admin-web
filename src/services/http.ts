// src/services/http.ts - HTTP客户端封装
// 使用 axios 进行 HTTP 请求
import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/auth'; // 导入认证状态管理
import router from '@/router'; // 导入路由实例

// 创建 axios 实例，设置基础 URL 和超时时间
const http = axios.create({
  baseURL: '/api',     // API 的基础路径
  timeout: 15000,      // 请求超时时间：15秒
  withCredentials: true // 允许携带 HttpOnly Cookie
});

// 响应拦截器：处理响应数据和错误
http.interceptors.response.use(
  (res) => res.data,  // 直接返回响应数据
  async (err) => {
    const status = err?.response?.status;
    const auth = useAuthStore();
    
    // 401 未认证错误：清除本地认证信息并跳转到登录页
    if (status === 401) {
      auth.logout();
      if (router.currentRoute.value.path !== '/login') {
        const redirect = encodeURIComponent(router.currentRoute.value.fullPath);
        await router.replace(`/login?redirect=${redirect}`);
      }
    }
    
    // 403 权限错误：可以在此处添加全局提示
    if (status === 403) {
      // 可在此触发全局消息提示，无权限访问
      // ElMessage.error?.('无权限访问该资源');
    }
    
    // 获取错误信息并返回拒绝的 Promise
    const message = err?.response?.data?.message || err.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

// 导出封装好的 HTTP 客户端实例
export default http;
