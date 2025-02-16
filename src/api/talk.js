import request from '@/utils/request'

// 获取说说列表（带分页）
export const getTalkListService = (params) => {
  return request({
    url: 'user/talk',
    method: 'GET',
    params,
  })
}
