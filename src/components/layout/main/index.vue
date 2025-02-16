<script setup>
import PageHeader from '@/components/pageHeader/index.vue'
import { useRoute } from 'vue-router';
import { useDarkStore } from '@/store/index.js';
const route = useRoute()
const wideList = ["/home", "/article"]
const darkStore= useDarkStore()
</script>

<template>
  
  <div class="main-container" :class="darkStore.isDark ? 'dark' :'light'">
    <PageHeader></PageHeader>
    <div :class="[wideList.includes(route.path)?'max-w-[1280px]':'max-w-[880px]','mx-auto','md:px-[40px]','py-[60px]','px-[10px]']" >
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dark{
  background: #282828;
}
.light{
  background: #d6d7cf;
}

</style>