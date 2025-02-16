import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDialogStore = defineStore(
  'dialog',
  () => {
    const loginDialogVisible = ref(false)

    const showLoginDialog = () => {
      loginDialogVisible.value = true
    }

    return {
      loginDialogVisible,
      showLoginDialog,
    }
  },
  {
    persist: false,
  }
)
