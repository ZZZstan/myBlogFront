<script setup>
import {useRouter} from 'vue-router'
import cardBg from '@/assets/images/card.jpg'
import MdiCalendarTime from '~icons/mdi/calendar-time'
import GrommetIconsDocumentUpdate from '~icons/grommet-icons/document-update'
import CarbonCategory from '~icons/carbon/category'
import LucideTag from '~icons/lucide/tag'
import BxLike from '~icons/bx/like'
import IconamoonEyeBold from '~icons/iconamoon/eye-bold'
import BasilQqOutline from '~icons/basil/qq-outline'
import MingcuteWechatLine from '~icons/mingcute/wechat-line'
import RiGithubFill from '~icons/ri/github-fill'
import NotoLoudspeaker from '~icons/noto/loudspeaker'
import StashBillingInfo from '~icons/stash/billing-info'
import { onMounted, reactive, ref, watch } from 'vue'
import { getArticleListService } from '@/api/article'
import { getTagsListService } from '@/api/tags'
import { getWebsiteStatsService,getWebsiteBaseInfoService } from '@/api/statistics'
import { getCategoryListService } from '@/api/category'
import qqQrCode from '@/assets/images/qq-qr.jpg'  
import wechatQrCode from '@/assets/images/wechat-qr.jpg'  
import tx from '@/assets/images/tx.jpg'  
import { getArticlesByTagService } from '@/api/article'
import { getArticlesByCategoryService } from '@/api/category'
import { useArticleStore } from '@/store/modules/article'

const router=useRouter()
const articleStore = useArticleStore()
//分页参数
const params = reactive({
  currentPage: 1,
  pageSize: 5
})

const articleListVo = ref([])  //后端传来的文章数据用vo接收
const articleList = ref([]) //分好页文章的数据

const handleTagClick = (tagId) => {
  articleStore.setSelectedTagId(tagId)
  router.push('/articles')
}

const handleCategoryClick = (categoryId) => {
  articleStore.setSelectedCategoryId(categoryId)
  router.push('/articles')
}

const getArticleList = async () => {
  const res = await getArticleListService() //res为整个的返回结果
  articleListVo.value = res.data.data  //res.data.data为真正要的数据
  getArticleListPage()
}
//分页逻辑
const getArticleListPage = () => {
  let current = ((params.currentPage - 1) * params.pageSize); //当前页的起始位置
  articleList.value = articleListVo.value.slice(current, current + params.pageSize) //截取数据
}

//跳转到文章详情页并获得文章详细内容
const gotoArticle=async(id)=>{
  if (!id) return
  router.push({
    path: '/article',
    query:{id}
  })
}

const tagsList = ref([])
const categoryList = ref([])
const getTagsList = async () => {
  const res = await getTagsListService()
  tagsList.value = res.data.data
}

const getCategoryList = async () => {
  const res = await getCategoryListService()
  categoryList.value = res.data.data
}

// 添加网站信息的响应式数据
const websiteBaseInfo = ref({
  notice: '',
  signature: '',
  homepageCover: '',
  otherCover: '',
  maximList: []
})
const websiteStats = ref({
  articleNum: 0,
  categoryNum: 0,
  tagNum: 0,
  runTime: 0,
  visits: 0,
})


// 获取网站信息
const getWebsiteInfo = async () => {

  try {
    const res = await getWebsiteStatsService()
    if (res.data.code === 1) {
      websiteStats.value = res.data.data
    }
    const res2 = await getWebsiteBaseInfoService()
    if (res2.data.code === 1) {
      websiteBaseInfo.value = res2.data.data
    }
  } catch (error) {
    console.error('获取网站信息失败:', error)
  }

}

// 添加 GitHub 跳转链接
const githubUrl = 'https://github.com/ZZZstan'  

// 添加控制二维码显示的响应式变量
const showQQCode = ref(false)
const showWechatCode = ref(false)

// GitHub 跳转函数
const goToGithub = () => {
  window.open(githubUrl, '_blank')
}

// 监听路由参数变化
watch(
  () => router.currentRoute.value.query,
  async (newQuery) => {
    if (newQuery.tagId) {
      // 根据标签获取文章
      const res = await getArticlesByTagService(newQuery.tagId)
      articleListVo.value = res.data.data
    } else if (newQuery.categoryId) {
      // 根据分类获取文章
      const res = await getArticlesByCategoryService(newQuery.categoryId)
      articleListVo.value = res.data.data
    } else {
      // 获取所有文章
      getArticleList()
    }
    // 重新分页
    getArticleListPage()
  },
  { immediate: true }
)

onMounted(() => {
  getTagsList()
  getCategoryList()
  getWebsiteInfo()
})

</script>

<template >
  <el-row :gutter="20" >
    <el-col :span="18" :xs="24">
      <!-- 文章列表 -->
      <el-card shadow="always" v-for="article in articleList" :key="article.id" class="mb-[1.2rem]">
        <div class="article-item w-[100%] md:h-[18rem]  flex md:flex-row flex-col" >
          <div class="article-cover md:w-[45%] md:h-[100%] w-[100%] h-[50%] overflow-hidden"> 
            <el-image @click="gotoArticle(article.id)" :src="article.imgUrl" class="w-[100%] h-[100%] duration-300 hover:scale-125" fit="cover" >
            </el-image> 
          </div>
          <div class="article-content md:w-[55%] md:h-[100%] w-[100%] h-[50%] p-[1.2rem] flex flex-col justify-center"> 
            <div class="title text-3xl mb-6 mt-4" @click="gotoArticle(article.id)">{{ article.title }}</div>
            <div class="info text-md mb-3 flex items-center flex-wrap"> 
              <!-- 创建时间 -->
              <div class="item mr-[1rem] flex items-center createTime">
                <MdiCalendarTime class="w-[1.2rem] h-[1.2rem] mr-[0.2rem]"/>
                <span class="text-md">发表于{{ article.createdTime }}</span>
              </div>
              <!-- 更新时间 -->
              <div class="item mr-[1rem] flex items-center updateTime">
                <GrommetIconsDocumentUpdate class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">更新于{{ article.updatedTime }}</span>
              </div>
              <!-- 分类 -->
              <div class="item mr-[1rem] flex items-center category">
                <CarbonCategory class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">分类:{{ article.category.categoryName }}</span>
              </div>
              <!-- 标签 -->
              <div class="item mr-[1rem] flex items-center tags">
                <LucideTag class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">标签:{{ article.tags.map(tag => tag.tagName).join('、') }}</span>
              </div>
              <!-- 点赞 -->
              <div class="item mr-[1rem] flex items-center likes">
                <BxLike class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">{{ article.likes }}</span>
              </div>
              <!-- 浏览数 -->
              <div class="item mr-[1rem] flex items-center views">
                <IconamoonEyeBold class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">{{ article.views }}</span>
              </div>
            </div>
            <div class="desc text-xl w-[100%] text-ellipsis overflow-hidden whitespace-nowrap">{{ article.description }}</div>
          </div>
        </div>
      </el-card>
      <!-- 分页导航 -->
      <div class="flex justify-center items-center mb-[2rem]">
        <el-pagination  @change="getArticleListPage()" v-model:current-page="params.currentPage" v-model:page-size="params.pageSize" background layout="prev, pager, next" :total="articleList.length" />
      </div>
    </el-col>
    <el-col :span="6" :xs="24">
      <!-- 个人博客信息 -->
      <el-card class="mb-[1.2rem] ov">
        <div class="banner w-[100%] h-[8rem]">
          <el-image class="w-[100%] h-[100%]" fit="cover" :src="cardBg"></el-image>
        </div>
        <div class="info-box flex items-center ">
          <el-avatar :size="48" class="mr-[5px]" :src="websiteBaseInfo.avatar"></el-avatar>
           <div class="text-2xl">个人博客</div>
        </div>

        <div class="saying p-[5px] test-sm">{{ websiteBaseInfo.signature }}</div>
        <div class="flex justify-around items-center p-[20px] relative contact-wrapper">
          <div class="item">
            <div class="title text-center text-xl">文章</div>
            <div class="value text-center">{{ websiteStats.articleNum }}</div>
          </div>
          <div class="item">
            <div class="title text-center text-xl">分类</div>
            <div class="value text-center">{{ websiteStats.categoryNum }}</div>
          </div>
          <div class="item">
            <div class="title text-center text-xl">标签</div>
            <div class="value text-center">{{ websiteStats.tagNum }}</div>
          </div>
        </div>
        <!-- 联系方式 -->
        <div class="flex justify-around items-center p-[20px] relative contact-wrapper">
          <!-- QQ -->
          <div class="relative">
            <BasilQqOutline 
              class="w-[2rem] h-[2rem] cursor-pointer hover:text-blue-500 transition-colors"
              @mouseenter="showQQCode = true"
              @mouseleave="showQQCode = false"
            />
            <!-- QQ二维码弹出层 -->
            <div 
              v-show="showQQCode" 
              class="fixed bottom-[auto] left-1/2 transform -translate-x-1/2 mb-2 z-[9999] qr-container"
            >
              <el-image 
                :src="websiteBaseInfo.qqCover" 
                class="qr-image"
                fit="contain"
              />

            </div>
          </div>

          <!-- 微信 -->
          <div class="relative">
            <MingcuteWechatLine 
              class="w-[2rem] h-[2rem] cursor-pointer hover:text-green-500 transition-colors"
              @mouseenter="showWechatCode = true"
              @mouseleave="showWechatCode = false"
            />
            <!-- 微信二维码弹出层 -->
            <div 
              v-show="showWechatCode" 
              class="fixed bottom-[auto] left-1/2 transform -translate-x-1/2 mb-2 z-[9999] qr-container"
            >
              <el-image 
                :src="websiteBaseInfo.wechatCover" 
                class="qr-image"
                fit="contain"

              />
            </div>
          </div>

          <!-- GitHub -->
          <RiGithubFill 
            class="w-[2rem] h-[2rem] cursor-pointer hover:text-gray-600 transition-colors"
            @click="goToGithub"
          />
        </div>
      </el-card>
      <!-- 公告 -->
      <el-card class="mb-[1.2rem]">
        <template #header>
          <div class="text-xl font-bold flex items-center">
            <NotoLoudspeaker class="w-[2rem] h-[2rem] mr-[0.5rem]"/>公告
          </div>
        </template>
        <div class="p-[1rem]">{{ websiteBaseInfo.notice }}</div>
      </el-card>
      <!-- 分类 -->
      <el-card class="mb-[1.2rem]">
        <template #header>
          <div class="text-xl font-bold flex items-center">
            <CarbonCategory class="w-[2rem] h-[2rem] mr-[0.5rem]"/>分类
          </div>
        </template>
        <div class="p-[1rem] flex items-center flex-wrap">
          <div 
            v-for="category in categoryList" 
            :key="category.id" 
            class="px-[0.3rem] py-[0.1rem] bg-zinc-400 mr-[0.3rem] mb-[0.3rem] rounded-md cursor-pointer hover:bg-zinc-500"
            @click="handleCategoryClick(category.id)"
          >
            {{ category.categoryName }}
          </div>
        </div>
      </el-card>
      <!-- 标签 -->
      <el-card class="mb-[1.2rem]">
        <template #header>
          <div class="text-xl font-bold flex items-center">
            <LucideTag class="w-[2rem] h-[2rem] mr-[0.5rem]"/>标签
          </div>
        </template>
        <div class="p-[1rem] flex items-center flex-wrap">
          <div 
            v-for="tag in tagsList" 
            :key="tag.id" 
            class="px-[0.3rem] py-[0.1rem] bg-zinc-400 mr-[0.3rem] mb-[0.3rem] rounded-md cursor-pointer hover:bg-zinc-500"
            @click="handleTagClick(tag.id)"
          >
            {{ tag.tagName }}
          </div>
        </div>
      </el-card>
      <!-- 网站资讯 -->
      <el-card class="mb-[1.2rem]">
        <template #header>
          <div class="text-xl font-bold flex items-center">
            <StashBillingInfo class="w-[2rem] h-[2rem] mr-[0.5rem]"/>网站资讯
          </div>
        </template>
        <div class="p-[1rem] flex flex-col justify-center items-center">
          <div class="item flex items-center justify-between w-[100%] mb-[0.5rem]">
            <div class="title text-md">文章数目</div>
            <div class="value text-md">{{ websiteStats.articleNum }}</div>
          </div>
          <div class="item flex items-center justify-between w-[100%] mb-[0.5rem]">
            <div class="title text-md">运行时间</div>
            <div class="value text-md">{{ websiteStats.runTime }}天</div>
          </div>
          <div class="item flex items-center justify-between w-[100%] mb-[0.5rem]">
            <div class="title text-md">博客访问次数</div>
            <div class="value text-md">{{ websiteStats.visits }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
:deep(.ov){
  overflow: visible;
}
.qr-container {
  padding: 0;
  position: absolute; 
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
}

.qr-image {
  width: 300px;
  height: 300px;
  object-fit: contain;
}

/* 添加过渡动画 */
.qr-container {
  transition: opacity 0.3s ease;
}
</style>