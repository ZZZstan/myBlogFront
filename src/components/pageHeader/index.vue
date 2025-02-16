<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FaChevronDown from '~icons/fa/chevron-down'
import MdiCalendarTime from '~icons/mdi/calendar-time'
import GrommetIconsDocumentUpdate from '~icons/grommet-icons/document-update'
import CarbonCategory from '~icons/carbon/category'
import LucideTag from '~icons/lucide/tag'
import BxLike from '~icons/bx/like'
import IconamoonEyeBold from '~icons/iconamoon/eye-bold'
import { useArticleStore } from '@/store/index.js'
import { getWebsiteBaseInfoService  } from '@/api/statistics'

const route = useRoute()
const articleStore = useArticleStore()

// 添加网站信息的响应式数据
const webInfo = ref({
  notice: '',
  signature: '',
  homepageCover: '',
  otherCover: '',
  maximList: []
})

// 当前显示的格言索引
const currentMaximIndex = ref(0)
const displayText = ref('')
const typeSpeed = 50

// 获取随机索引
const getRandomIndex = (max) => {
  return Math.floor(Math.random() * max)
}

// 获取网站信息
const getWebsiteInfo = async () => {
  try {
    const res = await getWebsiteBaseInfoService()
    if (res.data.code === 1) {
      webInfo.value = res.data.data
      // 获取数据后开始打字效果
      startTypeWriter()
    }
  } catch (error) {
    console.error('获取网站信息失败:', error)
  }
}

// 打字效果
const typeWriter = (text) => {
  let currentIndex = 0
  displayText.value = ''
  
  const timer = setInterval(() => {
    if (currentIndex < text.length) {
      displayText.value += text[currentIndex]
      currentIndex++
    } else {
      clearInterval(timer)
    }
  }, typeSpeed)
}

// 开始打字效果
const startTypeWriter = () => {
  if (webInfo.value.maximList && webInfo.value.maximList.length > 0) {
    // 随机选择一条格言
    const randomIndex = getRandomIndex(webInfo.value.maximList.length)
    const randomMaxim = webInfo.value.maximList[randomIndex]
    if (randomMaxim) {
      typeWriter(randomMaxim.content)
    }
  }
}

const scrollToBottom = () => {
  const homeElement = document.querySelector('#home')
  if (homeElement) {
    document.body.scrollTo({
      top: homeElement.clientHeight,
      behavior: 'smooth'
    })
  }
}

onMounted(() => {
  getWebsiteInfo()
})
</script>

<template>
  <div class="page-header">
    <!-- 主页头部显示 -->
    <div class="home" v-if="route.path=='/home'" id="home">
      <el-image class="banner" :src="webInfo.homepageCover" fit="cover"></el-image>
      <div class="content">
        <div class="title">stan的个人博客</div>
        <div class="saying-container">
          <div class="saying">{{ displayText }}<span class="cursor"></span></div>
        </div>

      </div>
      <div class="mask"></div>
      <div class="scroll-button">
        <FaChevronDown class="scorll-icon w-8 h-8" @click="scrollToBottom()"></FaChevronDown>
      </div>
    </div>
    <!-- 文章头部显示 -->
    <div class="article" v-else-if="route.path=='/article'">
      <el-image class="banner" :src="webInfo.otherCover" fit="cover"></el-image>
      <div class="content">
        <div class="title">{{ articleStore.getArticle().title }}</div>
        <div class="info text-md mb-3 flex items-center flex-wrap justify-center w-full">
              <!-- 创建时间 -->
              <div class="item mr-[1rem] flex items-center createTime">
                <MdiCalendarTime class="w-[1.2rem] h-[1.2rem] mr-[0.2rem]"/>
                <span class="text-md">发表于{{ articleStore.getArticle().createdTime }}</span>
              </div>
              <!-- 更新时间 -->
              <div class="item mr-[1rem] flex items-center updateTime">
                <GrommetIconsDocumentUpdate class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">更新于{{ articleStore.getArticle().updatedTime }}</span>
              </div>
              <!-- 分类 -->
              <div class="item mr-[1rem] flex items-center category">
                <CarbonCategory class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">分类:{{ articleStore.getArticle().category.categoryName }}</span>
              </div>
              <!-- 标签 -->
              <div class="item mr-[1rem] flex items-center tags">
                <LucideTag class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">标签:{{ articleStore.getArticle().tags.map(tag => tag.tagName).join('、') }}</span>
              </div>
              <!-- 点赞 -->
              <div class="item mr-[1rem] flex items-center likes">
                <BxLike class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">点赞数 {{ articleStore.getArticle().likes }}</span>
              </div>
              <!-- 浏览数 -->
              <div class="item mr-[1rem] flex items-center views">
                <IconamoonEyeBold class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">浏览次数 {{ articleStore.getArticle().views }}</span>
              </div>
              <!-- 浏览时长 -->
              <!-- <div class="item mr-[1rem] flex items-center views">
                <GameIconsDuration class="w-[1rem] h-[1rem] mr-[0.2rem]"/>
                <span class="text-md">浏览时长 {{ articleStore.getArticle().readDuration }}</span>
              </div> -->
            </div>
      </div>
      <div class="mask"></div>
    </div>
    <!-- 其他头部展示 -->
    <div v-else class="other">
      <el-image class="banner" :src="webInfo.otherCover" fit="cover"></el-image>
      <div class="content">
        <div class="title">{{ route.name }}</div>
      </div>
      <div class="mask"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banner{
  width: 100%;
  height: 100%;
}
.content{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      max-width: 70rem;
      color: #fff;
      z-index: 998;
    }
.title{
      font-size: 2.4rem;
      font-weight: bold;
      color: #fff;
      text-align: center;
      z-index: 998;
      padding-bottom: 20px;
    }
.page-header{
  width: 100%;

  .home{
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    }
    .scroll-button{
      z-index: 998;
      position: absolute;
      bottom: 1rem;
      left: 50%;
      color: #fff;
      transform: translateX(-50%);
            
      .scorll-icon{
        cursor: pointer;
        animation:bounce 1.5s infinite;
      }
    }
}
  .article{
    position: relative;
    height: 24rem;
    overflow: hidden;
  }
  .other{
    position: relative;
    height: 24rem;
    overflow: hidden;
  }
.mask{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.3);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-50%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    opacity: 1;
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    opacity: 0.3;
  }
}

.saying-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

.saying {
  position: relative;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 800px;
  min-height: 3em;
  text-align: center;
  font-size: 1.25rem;
  line-height: 1.75;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1.4em;
  background-color: #fff;
  animation: blink 0.7s infinite;
  margin-left: 2px;
  vertical-align: middle;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.info {
  margin: 0 auto;
  max-width: 25rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
</style>