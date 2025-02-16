import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useArticleStore = defineStore(
  'article',
  () => {
    const article = ref({
      id: -1,
      title: '',
      description: '',
      imgUrl: '',
      createdTime: '',
      updatedTime: '',
      views: -1,
      likes: -1,
      categoryName: '',
      tags: [],
      // readDuration:''
    })

    const getArticle = () => article.value

    const setArticle = (data) => {
      Object.assign(article.value, data)
    }

    // 存储选中的标签或分类ID
    const selectedTagId = ref(null)
    const selectedCategoryId = ref(null)

    // 设置选中的标签
    const setSelectedTagId = (id) => {
      selectedTagId.value = id
      selectedCategoryId.value = null // 清除分类选择
    }

    // 设置选中的分类
    const setSelectedCategoryId = (id) => {
      selectedCategoryId.value = id
      selectedTagId.value = null // 清除标签选择
    }

    // 清除选择
    const clearSelection = () => {
      selectedTagId.value = null
      selectedCategoryId.value = null
    }

    return {
      article,
      getArticle,
      setArticle,
      selectedTagId,
      selectedCategoryId,
      setSelectedTagId,
      setSelectedCategoryId,
      clearSelection,
    }
  },
  {
    persist: {
      key: 'Article', // 持久化存储的键名
      storage: localStorage, // 使用 localStorage 进行持久化
    },
  }
)
