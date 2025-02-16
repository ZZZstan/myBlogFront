<script setup>
import ChatRoom from '@/components/chatRoom/index.vue'
</script>

<template>
  <div>
    <router-view></router-view>
    <ChatRoom />
    <div class="icp-info">
      <a href="https://beian.miit.gov.cn/" target="_blank" class="text-gray-500 hover:text-gray-700">
        浙ICP备2025150808号
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// body{
//   background: url(../assets/images/homeBanner.jpg) fixed;
// }
.icp-info {
  width: 100%;
  text-align: center;
  padding: 1rem 0;
  font-size: 0.875rem;
  position: relative;
  bottom: 0;
  background-color: var(--el-bg-color);
  
  a {
    text-decoration: none;
    transition: color 0.3s ease;
  }
}
</style>