<script setup>
import { useArticleStore } from '@/store/index.js'
import { useDarkStore } from '@/store/index.js';
import { MdPreview, MdCatalog } from 'md-editor-v3';
import { getArticleDetailService, likeArticleService } from '@/api/article'
import 'md-editor-v3/lib/preview.css';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus'
import BxLike from '~icons/bx/like'
import { 
  getArticleCommentListService, 
  addArticleCommentService, 
  deleteArticleCommentService 
} from '@/api/comment'
import { useUserStore } from '@/store/modules/user'
import defaultAvatar from '@/icons/svg/defaultAvatar.svg'

const darkStore = useDarkStore()
const route = useRoute()
const id = route.query.id
// 使用window.location.href获取完整URL
const url = window.location.href

const articleStore = useArticleStore();
const articleDetailVo = ref(null)
const getById = async () => {
  const res = await getArticleDetailService(id)
  articleDetailVo.value = res.data.data
  articleStore.setArticle(articleDetailVo.value)
}

// 防抖函数
let timer = null
const handleLike = async () => {
  if (timer) return
  timer = setTimeout(async () => {
    try {
      const res = await likeArticleService(id)
      if (res.data.code === 1) {
        articleDetailVo.value.likes++
        ElMessage.success('点赞成功')
      }
    } catch (error) {
      console.error('点赞失败:', error)
      ElMessage.error('点赞失败')
    }
    timer = null
  }, 1000)
}

// 评论列表
const commentList = ref([])

// 评论内容
const commentContent = ref('')

// 获取评论列表
const getCommentList = async () => {
  try {
    const res = await getArticleCommentListService(route.query.id)
    if (res.data.code === 1) {
      commentList.value = res.data.data
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
  }
}

// 发表评论
const addComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  // 检查是否登录
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const res = await addArticleCommentService({
      articleId: route.query.id,
      userId: userStore.userInfo.id,  // 保留用户ID
      comment: commentContent.value
    })

    if (res.data.code === 1) {
      ElMessage.success('评论成功')
      commentContent.value = ''
      await getCommentList()
    }
  } catch (error) {
    console.error('评论失败:', error)
    ElMessage.error('评论失败')
  }
}

// 获取用户store
const userStore = useUserStore()

// 删除评论
const deleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteArticleCommentService(commentId)
    if (res.data.code === 1) {
      ElMessage.success('删除成功')
      await getCommentList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  getById()
  getCommentList() // 获取评论列表
})

const po = 'preview-only';
const scrollElement = document.body;
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="18" :xs="24">
      <el-card>
        <MdPreview 
          :editorId="po" 
          :modelValue="articleStore.getArticle().content" 
          :theme="darkStore.isDark ? 'dark' : 'light'"

        />
        <!-- 点赞按钮 -->
        <div class="flex flex-col items-center mt-8">
          <div 
            class="like-btn flex flex-col items-center cursor-pointer transition-all duration-300"
            @click="handleLike"
          >
            <BxLike class="w-8 h-8 mb-2"/>
            <span class="text-sm">{{ articleDetailVo?.likes || 0 }}</span>
          </div>
        </div>
      </el-card>
      <el-card class="mt-[1.2rem]">
        <template #header>
          <div class="font-bold text-lg">评论区</div>
        </template>
        
        <!-- 评论输入框 -->
        <div class="comment-input mb-6">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            placeholder="说点什么吧..."
          />
          <div class="flex justify-end mt-2">
            <el-button type="primary" @click="addComment">发表评论</el-button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list">
          <div v-if="commentList.length === 0" class="text-center text-gray-500">
            暂无评论，快来抢沙发吧~
          </div>
          <div 
            v-for="comment in commentList" 
            :key="comment.id" 
            class="comment-item mb-4 pb-4 border-b last:border-b-0"
          >
            <div class="flex items-start">
              <el-avatar :size="50" class="avatar">
                <img :src="defaultAvatar" class="w-full h-full object-fill"/>
              </el-avatar>
              <div class="ml-4 flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-bold">{{ comment.username }}</span>
                  <span class="text-sm text-gray-500">{{ comment.createdTime }}</span>
                </div>
                <div class="mt-2 text-gray-700">{{ comment.comment }}</div>
                <div class="mt-2 flex justify-end">
                  <el-button
                    v-if="comment.userId === userStore.userInfo.id"
                    type="danger"
                    link
                    size="small"
                    @click="deleteComment(comment.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
      <el-card class="mt-[1.2rem]">
        <div class="copyright-info p-[20px] ">
          <div class="item flex items-center w-[100%]">
            <div class="label">文章作者</div>
            <div class="value underline"><a href="/home">Stan</a></div>
          </div>
          <div class="item flex items-center w-[100%]">
            <div class="label">类型</div>
            <div class="value">原创</div>
          </div>
          <div class="item flex items-center w-[100%]">
            <div class="label">本文链接</div>
            <div class="value underline">
              <a :href="url">{{ url }}</a>
            </div>
          </div>
          <div class="item flex items-center w-[100%]">
            <div class="label">声明</div>
            <div class="value">此文章版权归 Stan 所有，如有转载，请注明来自原作者</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6" :xs="0">
      <el-affix :offset="60">
        <el-card class="pb-[1.2rem] pt-[1.2rem]">
          <MdCatalog :scrollElementOffsetTop="60" :editorId="po" :scrollElement="scrollElement" />
        </el-card>
      </el-affix>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.like-btn {
  padding: 8px 16px;
  border-radius: 20px;
  color: #666;
  
  &:hover {
    color: #ef4444;
    transform: scale(1.1);
  }
}

.label{
  position: relative;
  margin-right: 0.5rem;
}
.label::after{
  content: ':';
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 0.1rem;
}

/* 暗黑模式适配 */
:deep(.dark) {
  .comment-item {
    border-color: #333;
  }
  
  .text-gray-700 {
    color: #e5e5e5;
  }
}

.comment-item {
  position: relative;
  
  /* 鼠标悬浮时显示删除按钮 */
  &:hover {
    .el-button {
      opacity: 1;
    }
  }
  
  .el-button {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
}

.avatar {
  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
} 


</style>