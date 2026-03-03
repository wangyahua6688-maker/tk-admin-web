import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from '@/App.vue';
import router from '@/router';
import '@/styles/index.scss';

/**
 * 应用启动入口。
 * 说明：
 * 1. 先注册状态管理与路由；
 * 2. 再挂载 UI 组件库；
 * 3. 最终将根组件挂到 #app。
 */
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus);
app.mount('#app');
