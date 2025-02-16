import request from '@/utils/request'

export const getTagsListService = () => {
  return request.get('/user/tags/list')
}
