<script setup>
import { ref, onMounted, watch, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArticleListByParamsService } from '@/api/article'
import { getCategoryListService } from '@/api/category'
import { getTagsListService } from '@/api/tags'
import { useArticleStore } from '@/store/modules/article'
import { ElMessage } from 'element-plus'

const router = useRouter()
const articleStore = useArticleStore()
const articleList = ref([])
const title = ref('文章列表')
const total = ref(0)
const categoryList = ref([])
const tagList = ref([])

// 查询参数
const params = reactive({
  title: '',
  description: '',
  categoryId: '',
  tagIds: [],
  createdTime: [],
  currentPage: 1,
  pageSize: 10
})

// 添加一个标记，用于判断是否是首次加载
const isFirstLoad = ref(true)

// 获取分类列表
const getCategoryListData = async () => {
  const res = await getCategoryListService()
  if (res.data.code === 1) {
    categoryList.value = res.data.data.map(item => ({
      label: item.categoryName,
      value: item.id
    }))
  }
}

// 获取标签列表
const getTagListData = async () => {
  const res = await getTagsListService()
  if (res.data.code === 1) {
    tagList.value = res.data.data.map(item => ({
      label: item.tagName,
      value: item.id
    }))
  }
}

// 获取文章列表
const getArticleList = async () => {
  try {
    // 确保分类和标签列表已加载
    if (!categoryList.value.length || !tagList.value.length) {
      await Promise.all([
        getCategoryListData(),
        getTagListData()
      ])
    }

    // 只在首次加载时设置 store 中的值
    if (isFirstLoad.value) {
      if (articleStore.selectedTagId) {
        params.tagIds = [articleStore.selectedTagId]
        title.value = '标签文章列表'
      } else if (articleStore.selectedCategoryId) {
        params.categoryId = articleStore.selectedCategoryId
        title.value = '分类文章列表'
      }
      isFirstLoad.value = false
    }

    // 构造请求参数
    const requestParams = {
      ...params,
      tagIds: Array.isArray(params.tagIds) ? params.tagIds.join(',') : '',
    }

    // 处理时间范围
    if (Array.isArray(params.createdTime) && params.createdTime.length === 2) {
      requestParams.startTime = params.createdTime[0]
      requestParams.endTime = params.createdTime[1]
      delete requestParams.createdTime
    }

    const res = await getArticleListByParamsService(requestParams)
    if (res.data.code === 1) {
      articleList.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  }
}

// 重置搜索
const handleReset = () => {
  params.title = ''
  params.description = ''
  params.categoryId = ''
  params.tagIds = []
  params.createdTime = []
  params.currentPage = 1
  articleStore.clearSelection() // 清除 store 中的选择
  title.value = '文章列表'
  isFirstLoad.value = true // 重置首次加载标记
  getArticleList()
}

// 跳转到文章详情
const gotoArticle = (row) => {
  router.push({
    path: '/article',
    query: { id: row.id }
  })
}

// 添加表格高度计算
const tableHeight = ref(600) // 设置一个默认高度

// 计算表格高度的函数
const calculateTableHeight = () => {
  // 获取视窗高度
  const windowHeight = window.innerHeight
  // 减去其他元素的高度（头部、搜索表单、分页等）
  // 预留出合适的空间，可以根据实际情况调整
  tableHeight.value = windowHeight - 300 
}

// 监听窗口大小变化
onMounted(() => {
  calculateTableHeight()
  window.addEventListener('resize', calculateTableHeight)
  getArticleList()
})

// 组件销毁时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', calculateTableHeight)
})

// 修改分页事件处理
const handleCurrentChange = (val) => {
  params.currentPage = val
  getArticleList()
}

const handleSizeChange = (val) => {
  params.pageSize = val
  params.currentPage = 1
  getArticleList()
}
</script>

<template>
  <el-card class="article-list-container">
    <template #header>{{ title }}</template>

    <!-- 搜索表单 -->
    <el-form :inline="true" :model="params" class="mb-4">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="标题">
            <el-input v-model="params.title" placeholder="请输入标题" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="描述">
            <el-input v-model="params.description" placeholder="请输入描述" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="分类">
            <el-select v-model="params.categoryId" clearable placeholder="请选择分类" class="w-full">
              <el-option
                v-for="item in categoryList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="标签">
            <el-select 
              v-model="params.tagIds"
              multiple
              clearable 
              placeholder="请选择标签"
              class="w-full"
              :collapse-tags="false"

            >
              <el-option
                v-for="item in tagList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="params.createdTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="[
                new Date(2000, 1, 1, 0, 0, 0),
                new Date(2000, 1, 1, 23, 59, 59),
              ]"
              class="w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" class="flex justify-center mt-4">
          <el-form-item>
            <el-button type="primary" @click="getArticleList">搜索</el-button>
            <el-button @click="handleReset" class="ml-2">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 调整表格容器的高度 -->
    <div class="table-container">
      <el-table 
        :data="articleList" 
        style="width: 100%" 
        border 
        @row-click="(row) => gotoArticle(row)"
        :height="tableHeight"
      >
        <el-table-column label="封面" width="160" align="center">
          <template #default="{ row }">
            <el-image 
              :src="row.imgUrl" 
              class="article-cover"
              fit="cover"
            >
              <template #error>
                <div class="article-cover-placeholder">
                  暂无图片
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="180">
          <template #default="{ row }">
            <span class="text-blue-500 cursor-pointer hover:text-blue-600">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="120">
          <template #default="{ row }">
            {{ row.category?.categoryName }}
          </template>
        </el-table-column>
        <el-table-column label="标签" width="200">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <el-tag 
                v-for="tag in row.tags" 
                :key="tag.id"
                size="small"
              >
                {{ tag.tagName }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" align="center" />
        <el-table-column prop="updatedTime" label="更新时间" width="180" align="center" />
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="mt-4 flex justify-end">
      <el-pagination
        v-model:current-page="params.currentPage"
        v-model:page-size="params.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.article-list-container {
  max-width: 1400px; // 增加最大宽度
  min-height: calc(100vh - 100px); // 设置最小高度，减去头部和边距
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  margin: 1rem 0;
}

:deep(.el-form-item) {
  width: 100%;
  margin-bottom: 18px;
  
  .el-form-item__content {
    width: calc(100% - 80px); // 减去label的宽度
  }
}

/* 暗黑模式适配 */
:deep(.dark) {
  .el-table {
    --el-table-bg-color: var(--el-bg-color-overlay);
    --el-table-tr-bg-color: var(--el-bg-color-overlay);
    --el-table-header-bg-color: var(--el-bg-color);
    --el-table-border-color: var(--el-border-color-darker);
  }
}

:deep(.el-table) {
  // 调整表格行高
  .el-table__row {
    height: 70px;
  }
  
  // 调整图片列的样式
  .el-table__cell {
    .article-cover {
      width: 120px;
      height: 67.5px;
      border-radius: 4px;
    }
  }
}

// 添加占位图样式
.article-cover-placeholder {
  width: 120px;
  height: 67.5px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  border-radius: 4px;
}
</style>
