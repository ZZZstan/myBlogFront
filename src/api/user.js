import request from '@/utils/request'

// 获取用户信息
export const getUserInfoService = () => {
  return request.get('/user/info')
}

// 登录
export const loginService = (data) => {
  return request.post('/user/login', data)
}

// 注册
export const registerService = (data) => {
  return request.post('/user/register', data)
}

// 发送验证码
export const sendVerificationCodeService = (email) => {
  return request.get(`/common/code?email=${email}`)
}

// 重置密码
export const resetPasswordService = (data) => {
  return request.post('/user/resetPassword', data)
}

// 验证token
export const checkTokenService = () => {
  return request.get('/user/check')
}

// 验证验证码
export const verifyCodeService = (data) => {
  return request.post('/user/verifyCode', data)
}
