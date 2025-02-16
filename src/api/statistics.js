import request from '@/utils/request'

// 获取网站基本信息
export const getWebsiteBaseInfoService = () => {
  return request({
    url: '/webinfo/baseinfo',
    method: 'GET',
  })
}

// 获取网站统计信息
export const getWebsiteStatsService = () => {
  return request({
    url: '/webinfo',
    method: 'GET',
  })
}
