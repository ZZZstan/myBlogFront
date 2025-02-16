import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginService, checkTokenService } from '@/api/user'

export const useUserStore = defineStore(
  'user',
  () => {
    // 用户信息
    const userInfo = ref({})
    // token
    const token = ref('')
    // 登录状态
    const isLogin = ref(false)

    // 登录
    const login = async (loginForm) => {
      const res = await loginService(loginForm)
      if (res.data.code === 1) {
        // 保存token
        token.value = res.data.data.token
        // 保存用户信息
        userInfo.value = {
          id: res.data.data.id,
          username: res.data.data.username,
          email: res.data.data.email,
          createTime: res.data.data.registerTime,
        }
        // 更新登录状态
        isLogin.value = true
      }
      return res
    }

    // 退出登录
    const logout = () => {
      // 清除token
      token.value = ''
      // 清除用户信息
      userInfo.value = {}
      // 更新登录状态
      isLogin.value = false
    }

    // 检查登录状态
    const checkLogin = async () => {
      if (!token.value) return false
      try {
        const res = await checkTokenService()
        return res.data.code === 1
      } catch {
        return false
      }
    }

    return {
      userInfo,
      token,
      isLogin,
      login,
      logout,
      checkLogin,
    }
  },
  {
    persist: {
      key: 'user', // 指定localStorage的键名为user
    },
  }
)
