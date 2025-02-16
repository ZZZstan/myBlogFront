import request from '@/utils/request'

// 获取分类列表
export const getCategoryListService = () => {
  return request.get('/user/category/list')
}

// 根据分类获取文章列表
export const getArticlesByCategoryService = (categoryId) => {
  return request.get(`/user/article/category/${categoryId}`)
}
