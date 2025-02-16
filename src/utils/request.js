import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const baseURL = import.meta.env.VITE_BASE_URL

const instance = axios.create({
  baseURL,
  timeout: 10000,
})
// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从localStorage的user键中获取token
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      // 如果有token则添加到请求头
      if (user.token) {
        config.headers.token = user.token
      }
    }
    return config
  },
  (err) => Promise.reject(err)
)
//响应拦截器
instance.interceptors.response.use(
  (res) => {
    // TODO 3. 处理业务失败
    // TODO 4. 摘取核心响应数据
    if (res.data.code === 1) {
      return res
    }
    ElMessage.error(res.data.msg || '服务异常1')
    return Promise.reject(res.data)
  },
  (err) => {
    // TODO 5. 处理401错误
    if (err.response.status === 401) {
      router.push('/Login')
    }
    //错误默认情况
    ElMessage.error(err.response.data.msg || '服务异常2')
    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
