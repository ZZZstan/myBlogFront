import request from '@/utils/request'

// 文章评论相关接口
export const getArticleCommentListService = (articleId) => {
  return request.get(`/user/comment/article/${articleId}`)
}
// 添加文章评论
export const addArticleCommentService = (data) => {
  return request.post('/user/comment/article/add', data)
}
// 删除文章评论
export const deleteArticleCommentService = (commentId) => {
  return request.delete(`/user/comment/article/${commentId}`)
}

// 说说评论相关接口
export const getTalkCommentListService = (talkId) => {
  return request({
    url: `/user/comment/talk/${talkId}`,
    method: 'GET',
  })
}
// 添加说说评论
export const addTalkCommentService = (data) => {
  return request({
    url: '/user/comment/talk',
    method: 'POST',
    data,
  })
}
// 删除说说评论
export const deleteTalkCommentService = (commentId) => {
  return request({
    url: `/user/comment/talk/${commentId}`,
    method: 'DELETE',
  })
}
