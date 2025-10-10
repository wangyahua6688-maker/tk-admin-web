// main.ts - Vue 应用入口文件
// 导入必要的模块和组件
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // 状态管理库
import ElementPlus from 'element-plus'; // Element Plus UI 组件库
import 'element-plus/dist/index.css'; // Element Plus 样式
import App from './App.vue'; // 根组件
import router from './router'; // 路由配置
import '@/styles/index.scss'; // 全局样式

// 创建 Vue 应用实例
const app = createApp(App);

// 安装插件
app.use(createPinia()); // 使用 Pinia 进行状态管理
app.use(router); // 使用 Vue Router 进行路由管理
app.use(ElementPlus); // 使用 Element Plus UI 组件库

// 挂载应用到 DOM
app.mount('#app');