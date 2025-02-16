import { createApp } from 'vue'
import App from './App.vue'
//路由
import router from './router/index.js'
//全局样式入口
import './styles/base.scss'
//element-plus样式
import 'element-plus/dist/index.css'
//pinia
import { createPinia } from 'pinia'
//pinia持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// svg
import 'virtual:svg-icons-register'
// 暗黑主题
import 'element-plus/theme-chalk/dark/css-vars.css'
// 导入 SVG 组件
import SvgIcon from '@/components/svg-icon/index.vue'

const app = createApp(App)
app.use(router)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
// 全局注册 SVG 组件
app.component('svg-icon', SvgIcon)
app.mount('#app')
