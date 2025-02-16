<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { getTalkListService } from '@/api/talk'
import { getTalkCommentListService, addTalkCommentService, deleteTalkCommentService } from '@/api/comment'
import { getWebsiteBaseInfoService } from '@/api/statistics'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import tx from '@/assets/images/tx.jpg'

const userStore = useUserStore()
const TalkList = ref([])
const commentContent = ref('') // 评论内容
const activeCommentId = ref(null) // 当前展开的评论区ID
const loadMore = ref(true)
const params = ref({
  currentPage: 1,
  pageSize: 10
})

// 评论列表
const commentLists = ref(new Map())

// 添加头像数据
const websiteInfo = ref({
  avatar: ''
})

// 获取网站信息
const getWebsiteInfo = async () => {
  try {
    const res = await getWebsiteBaseInfoService()
    if (res.data.code === 1) {
      websiteInfo.value = res.data.data
    }
  } catch (error) {
    console.error('获取网站信息失败:', error)
  }
}

// 获取说说列表
const getTalkList = async () => {
  try {
    const res = await getTalkListService({
      currentPage: params.value.currentPage,
      pageSize: params.value.pageSize
    })
    
    if (res.data.code === 1) {
      const { records, total } = res.data.data
      
      // 第一页直接赋值，其他页追加数据
      TalkList.value = params.value.currentPage === 1 
        ? records 
        : [...TalkList.value, ...records]
      
      // 判断是否还有更多数据
      loadMore.value = TalkList.value.length < total
      
      // 重新设置观察者
      nextTick(() => {
        observerTalk()
      })
    }
  } catch (error) {
    console.error('获取说说列表失败:', error)
    loadMore.value = false
  }
}

// 获取评论列表
const getCommentList = async (talkId) => {
  try {
    const res = await getTalkCommentListService(talkId)
    if (res.data.code === 1) {
      commentLists.value.set(talkId, res.data.data)
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
  }
}

// 切换评论区显示
const toggleComment = async (talkId) => {
  if (activeCommentId.value === talkId) {
    activeCommentId.value = null
  } else {
    activeCommentId.value = talkId
    if (!commentLists.value.has(talkId)) {
      await getCommentList(talkId)
    }
  }
}

// 提交评论
const submitComment = async (talkId) => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  try {
    const res = await addTalkCommentService({
      talkId,
      comment: commentContent.value,
      userId: userStore.userInfo.id
    })

    if (res.data.code === 1) {
      ElMessage.success('评论成功')
      commentContent.value = ''
      await getCommentList(talkId)
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    ElMessage.error('评论失败')
  }
}

// 观察者相关
let observer = null
let observerDom = null

// 观察者回调函数
const observerTalk = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }

  observerDom = document.querySelector('.observer')
  if (!observerDom) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && loadMore.value) {
          params.value.currentPage++
          getTalkList()
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '100px'
    }
  )

  observer.observe(observerDom)
}

// 添加删除评论方法
const deleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteTalkCommentService(commentId)
    if (res.data.code === 1) {
      ElMessage.success('删除成功')
      // 重新获取当前展开的说说的评论列表
      if (activeCommentId.value) {
        await getCommentList(activeCommentId.value)
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  getWebsiteInfo()
  getTalkList().then(() => {
    nextTick(() => {
      observerTalk()
    })
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <el-card>
    <div class="p-[40px]">
      <!-- 每条说说 -->
      <div 
        v-for="talk in TalkList" 
        :key="talk.id" 
        class="talk-item mb-8 pb-4 border-b last:border-b-0"
      >
        <!-- 头部信息 -->
        <div class="flex items-start mb-4">
          <el-avatar :size="50" :src="websiteInfo.avatar" class="mr-3"/>
          <div>
            <div class="font-bold text-lg">Stan</div>
            <div class="text-sm text-gray-400">{{ talk.createdTime }}</div>
          </div>
        </div>

        <!-- 说说内容 -->
        <div class="ml-[52px]">
          <!-- 文字内容 -->
          <div class="text-base mb-3">{{ talk.content }}</div>

          <!-- 图片网格 -->
          <div v-if="talk.imgUrl && talk.imgUrl.length > 0" class="mb-4">
            <div 
              class="grid gap-2"
              :class="{
                'grid-cols-3': talk.imgUrl.length >= 3,
                'grid-cols-2': talk.imgUrl.length === 2,
                'grid-cols-1': talk.imgUrl.length === 1
              }"
            >
              <div 
                v-for="(url, index) in talk.imgUrl" 
                :key="index"
                class="relative"
                :class="{
                  'aspect-square': talk.imgUrl.length > 1,
                  'max-w-[240px]': talk.imgUrl.length === 1
                }"
              >
                <el-image 
                  :src="url" 
                  fit="cover"
                  class="w-full h-full rounded cursor-pointer"
                  :preview-src-list="talk.imgUrl"
                  :initial-index="index"
                  preview-teleported
                />
              </div>
            </div>
          </div>

          <!-- 评论区 -->
          <div class="mt-4">
            <div class="flex justify-end mb-2">
              <el-button 
                type="primary" 
                link 
                @click="toggleComment(talk.id)"
              >
                {{ activeCommentId === talk.id ? '收起评论' : '查看评论' }}
              </el-button>
            </div>

            <!-- 评论展开区域 -->
            <div v-show="activeCommentId === talk.id">
              <!-- 评论输入框 -->
              <div class="comment-input-box">
                <el-input
                  v-model="commentContent"
                  placeholder="写下你的评论..."
                  :rows="2"
                  type="textarea"
                  class="mb-2"
                />
                <div class="flex justify-end">
                  <el-button type="primary" @click="submitComment(talk.id)">
                    发表评论
                  </el-button>
                </div>
              </div>

              <!-- 评论列表 -->
              <div class="comment-list-box">
                <div 
                  v-for="comment in commentLists.get(talk.id)" 
                  :key="comment.id"
                  class="py-2 border-b last:border-none comment-item"
                >
                  <div class="flex items-start gap-3">
                    <el-avatar :size="40">
                      <svg-icon name="defaultAvatar" class="w-full h-full" />
                    </el-avatar>
                    <div class="flex-1">
                      <div class="flex justify-between items-center">
                        <div class="text-sm font-bold">{{ comment.username }}</div>
                        <!-- 添加删除按钮 -->
                        <el-button
                          v-if="userStore.userInfo.id === comment.userId"
                          type="danger"
                          link
                          size="small"
                          class="delete-btn opacity-0 transition-opacity duration-300"
                          @click="deleteComment(comment.id)"
                        >
                          删除
                        </el-button>
                      </div>
                      <div class="mt-1 text-sm">{{ comment.comment }}</div>
                      <div class="mt-1 text-xs text-gray-400">
                        {{ comment.createdTime }}
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 无评论提示 -->
                <div 
                  v-if="!commentLists.get(talk.id)?.length" 
                  class="text-center text-gray-500 py-2 text-sm"
                >
                  暂无评论，快来抢沙发吧~
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="mt-4 pb-4">
        <div v-if="TalkList.length > 0" class="observer text-center text-gray-500 py-4">
          <div v-if="loadMore" class="flex items-center justify-center">
            <el-icon class="animate-spin mr-2"><Loading /></el-icon>
            加载更多
          </div>
          <div v-else>已经到底了~</div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          暂无说说内容
        </div>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.comment-input-box,
.comment-list-box {
  background-color: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  
  :deep(.el-textarea__inner) {
    background-color: var(--el-bg-color);
    border-color: var(--el-border-color);
    color: var(--el-text-color-primary);
    
    &:focus {
      border-color: var(--el-color-primary);
    }
    
    &::placeholder {
      color: var(--el-text-color-placeholder);
    }
  }
}

/* 暗黑模式适配 */
:deep(.dark) {
  .comment-input-box,
  .comment-list-box {
    background-color: var(--el-bg-color-overlay);
    border-color: var(--el-border-color-darker);
  }
  
  .el-textarea__inner {
    background-color: var(--el-bg-color) !important;
    border-color: var(--el-border-color-darker) !important;
    
    &:focus {
      border-color: var(--el-color-primary) !important;
    }
  }
}

/* 加载提示样式 */
.observer {
  min-height: 50px;
  margin-top: 20px;
}

:deep(.el-avatar) {
  .svg-icon {
    width: 100%;
    height: 100%;
    display: block;
  }
}

:deep(.dark) {
  .el-avatar {
    background-color: var(--el-bg-color-overlay);
  }
}

/* 添加评论项悬浮样式 */
.comment-item {
  &:hover {
    .delete-btn {
      opacity: 1;
    }
  }
}
</style>
