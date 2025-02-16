<script setup>
import { defineAsyncComponent, ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDarkStore } from '@/store/index.js';
import { loginService, registerService, sendVerificationCodeService, checkTokenService, verifyCodeService, resetPasswordService } from '@/api/user'
import NotoCrescentMoon from '~icons/noto/crescent-moon'
import NotoV1Sun from '~icons/noto-v1/sun'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import defaultAvatar from '@/icons/svg/defaultAvatar.svg'
import { useDialogStore } from '@/store/modules/dialog'
import MaterialSymbolsReadMore from '~icons/material-symbols/read-more';

// 登录表单ref
const loginFormRef = ref()

// 注册表单ref
const registerFormRef = ref()

// 忘记密码表单ref
const forgotPasswordFormRef = ref()

const darkStore = useDarkStore();
const status=ref(darkStore.getIsDark())

const router = useRouter();
const handleSelect = (path) => {
  if (path) {
    router.push(path)
  }
}

const menuList = [
  {
    title: "首页",
    icon: defineAsyncComponent(() => import("~icons/carbon/home")),
    path: "/home",
    children:[]
  },
  {
    title: "文章列表",
    icon: defineAsyncComponent(() => import("~icons/mdi/list-box")),
    path: "/articles",
    children:[]
  },
  {
    title: "时间轴",
    icon: defineAsyncComponent(() => import("~icons/mdi/axis-z-rotate-counterclockwise")),
    path: "/archive",
    children:[]
  },
  {
    title: "说说",
    icon: defineAsyncComponent(() => import("~icons/ri/kakao-talk-line")),
    path: "/talk",
    children:[]
  },
  {
    title: "更多",
    icon: defineAsyncComponent(() => import("~icons/gg/more-r")),
    path: "/more",
    children:[
      {
        title: "网站导航",
        icon: defineAsyncComponent(() => import("~icons/mdi/about-variant")),
        path: "/more/navigation",
      }
    ]
  },
]

// 用户菜单是否显示
const userMenuVisible = ref(false)

const dialogStore = useDialogStore()

// 使用 dialogStore 的 loginDialogVisible
const loginDialogVisible = computed({
  get: () => dialogStore.loginDialogVisible,
  set: (value) => dialogStore.loginDialogVisible = value
})

// 登录表单数据
const loginForm = ref({
  username: '',
  password: ''
})

// 登录表单规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 注册弹窗显示控制
const registerDialogVisible = ref(false)

// 注册表单数据
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  verificationCode: ''
})

// 注册表单规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为 6 位', trigger: 'blur' }
  ]
}

// 忘记密码弹窗显示控制
const forgotPasswordDialogVisible = ref(false)

// 忘记密码表单数据
const forgotPasswordForm = ref({
  email: '',
  verificationCode: ''
})

// 忘记密码表单规则
const forgotPasswordRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为 6 位', trigger: 'blur' }
  ]
}

// 统一的验证码倒计时
const countdown = ref(0)
let countdownTimer = null

// 统一的发送验证码函数
const sendVerificationCode = async (email, formRef) => {
  if (countdown.value > 0) return
  
  // 先验证表单
  if (formRef) {
    try {
      // 只验证邮箱字段
      await formRef.validateField('email')
    } catch (error) {
      return
    }
  }

  try {
    const res = await sendVerificationCodeService(email)
    if (res.data.code === 1) {
      ElMessage.success('验证码已发送')
      // 开始倒计时
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }, 1000)
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error('发送验证码失败')
  }
}

// 注册验证码
const sendRegisterCode = async () => {
  if (!registerFormRef.value) return
  
  // 只验证用户名、密码、确认密码和邮箱字段
  try {
    await registerFormRef.value.validateField(['username', 'password', 'confirmPassword', 'email'])
    sendVerificationCode(
      registerForm.value.email,
      registerFormRef.value
    )
  } catch (error) {
    ElMessage.error('请先完善其他信息')
  }
}

// 重置密码验证码
const sendResetCode = async () => {
  if (!forgotPasswordFormRef.value) return

  // 只验证邮箱字段
  try {
    await forgotPasswordFormRef.value.validateField('email')
    sendVerificationCode(
      forgotPasswordForm.value.email,
      forgotPasswordFormRef.value
    )
  } catch (error) {
    ElMessage.error('请先输入正确的邮箱')
  }
}

// 获取store
const userStore = useUserStore()

// 是否登录状态 - 直接使用store的状态
const isLogin = ref(userStore.isLogin)

// 用户信息 - 直接使用store的用户信息
const userInfo = ref(userStore.userInfo)

// 个人信息弹窗显示控制
const dialogVisible = ref(false)

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await userStore.login(loginForm.value)
        if (res.data.code === 1) {
          ElMessage.success('登录成功')
          loginDialogVisible.value = false
        }
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败')
      }
    }
  })
}

// 处理退出登录
const handleCommand = async (command) => {
  switch(command) {
    case 'profile':
      dialogVisible.value = true
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('退出成功')
      router.push('/home')
      break
    case 'login':
      loginDialogVisible.value = true
      break
  }
}

// 处理注册
const handleRegister = () => {
  loginDialogVisible.value = false
  registerDialogVisible.value = true
}

// 处理忘记密码
const handleForgotPassword = () => {
  loginDialogVisible.value = false
  forgotPasswordDialogVisible.value = true
}

// 处理注册提交
const handleRegisterSubmit = async () => {
  if (!registerFormRef.value) return
  
  try {
    // 验证所有字段
    await registerFormRef.value.validate()
    
    const res = await registerService(registerForm.value)
    if (res.data.code === 1) {
      ElMessage.success('注册成功')
      registerDialogVisible.value = false
      loginDialogVisible.value = true
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      console.error('注册失败:', error)
      ElMessage.error('注册失败')
    }
  }
}

// 监听注册表单变化，控制注册按钮
const isRegisterFormValid = ref(false)
const checkRegisterForm = () => {
  if (!registerFormRef.value) return
  registerFormRef.value.validate((valid) => {
    isRegisterFormValid.value = valid
  })
}

// 监听表单变化
watch(() => registerForm.value, () => {
  checkRegisterForm()
}, { deep: true })



// 组件卸载时清除定时器
onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})

// 重置登录表单
const resetLoginForm = () => {
  if (loginFormRef.value) {
    loginFormRef.value.resetFields()
  }
}

// 重置注册表单
const resetRegisterForm = () => {
  if (registerFormRef.value) {
    registerFormRef.value.resetFields()
  }
}

// 重置忘记密码表单
const resetForgotPasswordForm = () => {
  if (forgotPasswordFormRef.value) {
    forgotPasswordFormRef.value.resetFields()
  }
}

// 监听弹窗关闭事件
watch(loginDialogVisible, (newVal) => {
  if (!newVal) {
    resetLoginForm()
  }
})

watch(registerDialogVisible, (newVal) => {
  if (!newVal) {
    resetRegisterForm()
  }
})

watch(forgotPasswordDialogVisible, (newVal) => {
  if (!newVal) {
    resetForgotPasswordForm()
  }
})

// 检查登录状态
const checkLoginStatus = async () => {
  const isValid = await userStore.checkLogin()
  if (!isValid) {
    userStore.logout()
  }
}

// 监听登录状态
watch(() => userStore.isLogin, (newVal) => {
  isLogin.value = newVal
}, { immediate: true })

// 监听用户信息
watch(() => userStore.userInfo, (newVal) => {
  userInfo.value = newVal
}, { deep: true, immediate: true })

// 在组件挂载时检查登录状态
onMounted(() => {
  checkLoginStatus()
})

// 添加新的响应式变量
const newPasswordDialogVisible = ref(false)
const newPasswordForm = ref({
  email: '', // 保存邮箱，用于重置密码
  password: '',
  confirmPassword: ''
})

// 新密码表单规则
const newPasswordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== newPasswordForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 修改处理重置密码的函数
const handleResetPassword = async () => {
  if (!forgotPasswordFormRef.value) return
  
  try {
    await forgotPasswordFormRef.value.validate()
    
    // 先验证验证码
    const verifyRes = await verifyCodeService({
      email: forgotPasswordForm.value.email,
      verificationCode: forgotPasswordForm.value.verificationCode
    })
    
    if (verifyRes.data.code === 1) {
      // 验证码正确，显示新密码输入弹窗
      newPasswordForm.value.email = forgotPasswordForm.value.email // 保存邮箱
      forgotPasswordDialogVisible.value = false
      newPasswordDialogVisible.value = true
    } else {
      ElMessage.error('验证码错误')
    }
  } catch (error) {
    console.error('验证失败:', error)
    ElMessage.error(error.response?.data?.msg || '验证失败')
  }
}

// 添加提交新密码的函数
const handleSubmitNewPassword = async () => {
  if (!newPasswordFormRef.value) return
  
  try {
    await newPasswordFormRef.value.validate()
    
    const res = await resetPasswordService({
      email: newPasswordForm.value.email,
      password: newPasswordForm.value.password
    })
    
    if (res.data.code === 1) {
      ElMessage.success('密码重置成功')
      newPasswordDialogVisible.value = false
      loginDialogVisible.value = true
    }
  } catch (error) {
    console.error('重置密码失败:', error)
    ElMessage.error(error.response?.data?.msg || '重置密码失败')
  }
}

// 添加新密码表单ref
const newPasswordFormRef = ref()

// 重置新密码表单
const resetNewPasswordForm = () => {
  if (newPasswordFormRef.value) {
    newPasswordFormRef.value.resetFields()
  }
}

// 监听新密码弹窗关闭事件
watch(newPasswordDialogVisible, (newVal) => {
  if (!newVal) {
    resetNewPasswordForm()
  }
})

</script>

<template>
  <div class="header-container">
    <!-- 导航栏左侧 -->
    <div class="left flex items-center">
      <!-- 移动端菜单按钮 -->
      <div class="md:hidden mr-2">
        <el-dropdown trigger="click">
          <el-button class="mobile-menu-btn !bg-transparent !border-none !p-1">
            <MaterialSymbolsReadMore class="text-2xl text-gray-600 dark:text-gray-300" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 导航菜单项 -->
              <el-dropdown-item v-for="menu in menuList" :key="menu.path" @click="handleSelect(menu.path)">
                <component :is="menu.icon" class="menu-icon" />
                {{ menu.title }}
              </el-dropdown-item>
              <!-- 子菜单项 -->
              <template v-for="menu in menuList" :key="menu.path">
                <template v-if="menu.children && menu.children.length">
                  <el-dropdown-item 
                    v-for="subMenu in menu.children" 
                    :key="subMenu.path"
                    @click="handleSelect(subMenu.path)"
                  >
                    <component :is="subMenu.icon" class="menu-icon" />
                    {{ subMenu.title }}
                  </el-dropdown-item>
                </template>
              </template>
              <!-- 分割线 -->
              <div class="border-t border-gray-200 my-1"></div>
              <!-- 登录/用户操作 -->
              <template v-if="isLogin">
                <el-dropdown-item @click="handleCommand('profile')">
                  <el-icon><User /></el-icon>
                  <span class="ml-1">个人信息</span>
                </el-dropdown-item>
                <el-dropdown-item @click="handleCommand('logout')">
                  <el-icon><SwitchButton /></el-icon>
                  <span class="ml-1">退出登录</span>
                </el-dropdown-item>
              </template>
              <template v-else>
                <el-dropdown-item @click="loginDialogVisible = true">
                  <el-icon><User /></el-icon>
                  <span class="ml-1">登录</span>
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <svg-icon name="logo" class="logo mr-[3rem]" />
      <el-switch
        @change="darkStore.setIsDark"
        v-model="status"
        size="large"
        style="--el-switch-on-color: #afc4cd82; --el-switch-off-color: #06121954"
        :active-icon="NotoV1Sun"
        inline-prompt
        :inactive-icon="NotoCrescentMoon"
      />
    </div>

    <!-- 导航栏右侧 - 仅在PC端显示 -->
    <div class="right hidden md:flex">
      <el-menu :ellipsis="false" mode="horizontal" @select="handleSelect">
        <div v-for="menu in menuList" :key="menu.path">
          <el-sub-menu v-if="menu.children.length" :index="menu.path">
            <template #title>
              <component :is="menu.icon" class="menu-icon"></component>
              {{ menu.title }}
            </template>
            <el-menu-item v-for="subMenu in menu.children" :key="subMenu.path" :index="subMenu.path">
              <component :is="subMenu.icon" class="menu-icon"></component>
              {{ subMenu.title }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="menu.path">
            <component :is="menu.icon" class="menu-icon"></component>
            {{ menu.title }}
          </el-menu-item>
        </div>
        <template v-if="isLogin">
          <el-dropdown @command="handleCommand" trigger="click">
            <el-avatar :size="40" class="cursor-pointer avatar">
              <img :src="defaultAvatar" class="w-full h-full object-fill"/>
            </el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-menu-item @click="loginDialogVisible = true">
            <component :is="defineAsyncComponent(() => import('~icons/ep/user'))" class="menu-icon"/>
            登录
          </el-menu-item>
        </template>
      </el-menu>
    </div>
  </div>

  <!-- 登录弹窗 -->
  <el-dialog
    v-model="loginDialogVisible"
    title="登录"
    width="360px"
    :close-on-click-modal="false"
    @closed="resetLoginForm"
  >
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-width="0"
    >
      <el-form-item prop="username">
        <el-input 
          v-model="loginForm.username" 
          placeholder="请输入用户名"
          prefix-icon="User"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
          prefix-icon="Lock"
        />
      </el-form-item>
    </el-form>

    <!-- 添加忘记密码和注册链接 -->
    <div class="flex justify-between text-sm mb-4 text-gray-500">
      <el-button 
        link 
        type="primary" 
        @click="handleRegister"
      >
        注册账号
      </el-button>
      <el-button 
        link 
        type="primary" 
        @click="handleForgotPassword"
      >
        忘记密码？
      </el-button>
    </div>

    <template #footer>
      <div class="w-full">
        <el-button 
          type="primary" 
          class="w-full"
          @click="handleLogin"
        >
          登录
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 个人信息弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    title="个人信息"
    width="30%"
    :close-on-click-modal="false"
  >
    <div class="user-info">
      <div class="flex items-center justify-center mb-6">
        <el-avatar :size="80" :src="userInfo.avatar || defaultAvatar"/>
      </div>
      <div class="info-item mb-4">
        <span class="label">用户名：</span>
        <span>{{ userInfo.username }}</span>
      </div>
      <div class="info-item mb-4">
        <span class="label">邮箱：</span>
        <span>{{ userInfo.email }}</span>
      </div>
      <div class="info-item mb-4">
        <span class="label">注册时间：</span>
        <span>{{ userInfo.createTime }}</span>
      </div>
    </div>
  </el-dialog>

  <!-- 注册弹窗 -->
  <el-dialog
    v-model="registerDialogVisible"
    title="注册账号"
    width="360px"
    :close-on-click-modal="false"
    @closed="resetRegisterForm"
  >
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-width="0"
      status-icon
    >
      <el-form-item prop="username">
        <el-input 
          v-model="registerForm.username" 
          placeholder="请输入用户名"
          prefix-icon="User"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
          prefix-icon="Lock"
        />
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请确认密码"
          show-password
          prefix-icon="Lock"
        />
      </el-form-item>
      <el-form-item prop="email">
        <el-input
          v-model="registerForm.email"
          placeholder="请输入邮箱"
          prefix-icon="Message"
        />
      </el-form-item>
      
      <el-form-item prop="verificationCode">
        <div class="flex gap-2">
          <el-input
            v-model="registerForm.verificationCode"
            placeholder="请输入验证码"
            prefix-icon="Key"
          />
          <el-button 
            :disabled="countdown > 0"
            @click="sendRegisterCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="w-full">
        <el-button 
          type="primary" 
          class="w-full"
          :disabled="!isRegisterFormValid"
          @click="handleRegisterSubmit"
        >
          注册
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 忘记密码弹窗 -->
  <el-dialog
    v-model="forgotPasswordDialogVisible"
    title="忘记密码"
    width="360px"
    :close-on-click-modal="false"
    @closed="resetForgotPasswordForm"
  >
    <el-form
      ref="forgotPasswordFormRef"
      :model="forgotPasswordForm"
      :rules="forgotPasswordRules"
      label-width="0"
      status-icon
    >
      <el-form-item prop="email">
        <el-input
          v-model="forgotPasswordForm.email"
          placeholder="请输入邮箱"
          prefix-icon="Message"
        />
      </el-form-item>
      <el-form-item prop="verificationCode">
        <div class="flex gap-2">
          <el-input
            v-model="forgotPasswordForm.verificationCode"
            placeholder="请输入验证码"
            prefix-icon="Key"
          />
          <el-button 
            :disabled="countdown > 0"
            @click="sendResetCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="w-full">
        <el-button 
          type="primary" 
          class="w-full"
          @click="handleResetPassword"
        >
          重置密码
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 新密码输入弹窗 -->
  <el-dialog
    v-model="newPasswordDialogVisible"
    title="设置新密码"
    width="360px"
    :close-on-click-modal="false"
    @closed="resetNewPasswordForm"
  >
    <el-form
      ref="newPasswordFormRef"
      :model="newPasswordForm"
      :rules="newPasswordRules"
      label-width="0"
      status-icon
    >
      <el-form-item prop="password">
        <el-input
          v-model="newPasswordForm.password"
          type="password"
          placeholder="请输入新密码"
          show-password
          prefix-icon="Lock"
        />
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="newPasswordForm.confirmPassword"
          type="password"
          placeholder="请确认新密码"
          show-password
          prefix-icon="Lock"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="w-full">
        <el-button 
          type="primary" 
          class="w-full"
          @click="handleSubmitNewPassword"
        >
          确认重置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.header-container {
  .mobile-menu-btn {
    &:hover, &:focus {
      background-color: transparent !important;
    }
  }
}

.user-info {
  padding: 20px;
  
  .info-item {
    .label {
      font-weight: bold;
      margin-right: 10px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.avatar {
  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
}
</style>