<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FlatColorIconsOldTimeCamera from '~icons/flat-color-icons/old-time-camera'
import { getArticleListService } from '@/api/article'

const router = useRouter()

const articleList = ref([])
const articlePageList = ref([])

// 获取文章列表
const getArticleList = async () => {
  const res = await getArticleListService()
  articleList.value = res.data.data
  console.log(articleList.value);
  
  getArticlePageList()
}

// 分页参数
const params = reactive({
  currentPage: 1,
  pageSize: 5
})

// 分页获取文章列表
const getArticlePageList = () => {
  let current = ((params.currentPage - 1) * params.pageSize)
  articlePageList.value = articleList.value.slice(current, current + params.pageSize)
}

// 跳转到文章详情
const gotoArticle = (id) => {
  router.push({
    path: '/article',
    query: { id }
  })
}

onMounted(() => {
  getArticleList()
})
</script>

<template>
  <div class="archive-container">
    <h1 class="text-3xl font-bold mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
      文章归档
    </h1>

    <div class="timeline-container">
      <el-timeline>
        <el-timeline-item
          v-for="article in articlePageList"
          :key="article.id"
          placement="top"
          :icon="FlatColorIconsOldTimeCamera"
          type="primary"
          :size="'large'"
          class="timeline-item"
        >
          <div class="time-label text-lg font-bold mb-4">
            {{ article.createdTime }}
          </div>

          <div class="timeline-card" @click="gotoArticle(article.id)">
            <div class="card-content">
              <div class="image-container">
                <el-image 
                  :src="article.imgUrl" 
                  fit="cover"
                  class="article-image"
                />
              </div>
              <div class="article-info">
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-desc">{{ article.description }}</p>
              </div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="params.currentPage"
        v-model:page-size="params.pageSize"
        :total="articleList.length"
        @current-change="getArticlePageList"
        background
        layout="prev, pager, next"
      />
    </div>
  </div>
</template>

<style scoped>
.archive-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.timeline-container {
  margin: 2rem 0;
}

.timeline-card {
  padding: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
}

.card-content {
  display: flex;
  gap: 1rem;
}

.image-container {
  width: 200px;
  height: 120px;
  overflow: hidden;
  border-radius: 4px;
}

.article-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-image:hover {
  transform: scale(1.1);
}

.article-info {
  flex: 1;
}

.article-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.article-desc {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-time {
  font-size: 0.75rem;
  color: #999;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* 暗黑模式适配 */
:deep(.dark) .timeline-card {
  background: #1a1a1a;
}

:deep(.dark) .article-title {
  color: #e5e5e5;
}

:deep(.dark) .article-desc {
  color: #999;
}

:deep(.dark) .article-time {
  color: #666;
}

.timeline-item :deep(.el-timeline-item__node) {
  width: 24px !important;
  height: 24px !important;
  left: -12px !important;
}

.timeline-item :deep(.el-timeline-item__icon) {
  font-size: 18px !important;
}

/* 修改时间标签样式 */
.time-label {
  position: relative;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  /* background: #f0f9ff; */
  border-radius: 4px;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  color: #3b82f6;  /* 使用蓝色 */
  font-size: 1.1rem;
  border-left: 4px solid #3b82f6;  /* 添加左边框 */
}

/* 暗黑模式适配 */
:deep(.dark) .time-label {
  background: #1e3a8a;
  color: #93c5fd;
  border-left-color: #93c5fd;
}
</style>