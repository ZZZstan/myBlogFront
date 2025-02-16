<script setup>
import { useDarkStore } from '@/store/index.js';
const darkStore=useDarkStore()
</script>

<template>
  <div class="footer-container" :class="darkStore.isDark ? 'dark' :'light'">
    <div class="flex flex-col justify-center items-center h-[100%]">
      <div class="text-xl text-center">© stan的博客 2024</div>
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