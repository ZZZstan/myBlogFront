import request from '@/utils/request'

export const getArticleListService = () => {
  return request.get('/user/article/list')
}

export const getArticleDetailService = (id) => {
  return request.get('/user/article', {
    params: {
      id,
    },
  })
}

export const likeArticleService = (id) => {
  return request.get(`/user/article/like/${id}`)
}

export const getArticlesByTagService = (tagId) => {
  return request.get(`/user/article/tag/${tagId}`)
}

export const getArticlesByCategoryService = (categoryId) => {
  return request.get(`/user/article/category/${categoryId}`)
}

export const getArticleListByParamsService = (params) => {
  return request({
    url: '/user/article/condition/list',
    method: 'GET',
    params,
  })
}
