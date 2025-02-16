import { defineStore } from "pinia";
import { useDark, useToggle } from '@vueuse/core';

export const useDarkStore = defineStore(
  "dark",
  () => {
    const isDark = useDark();
    const toggleDark = useToggle(isDark);
    // 定义 getter 和 action
    const getIsDark = () => isDark.value;
    const setIsDark = () => {
      toggleDark()
    }

    return { 
      isDark, // state
      getIsDark, // getter
      setIsDark // action
    };
  },
  {
    persist: {
      key: 'dark', // 持久化存储的键名
      storage: localStorage, // 使用 localStorage 进行持久化
    }
  }
);