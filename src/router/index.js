import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/layout/index.vue'
import Home from '../views/home.vue'
import Archive from '../views/archive/index.vue'
import navigation from '../views/navigation/index.vue'
import Talk from '../views/talk/index.vue'
import Article from '../views/article/index.vue'
import ArticleList from '../views/article/articleList.vue'

const routes = [
  {
    name: 'Layout',
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        name: 'Home',
        path: 'home',
        component: Home,
      },
      {
        name: 'Article',
        path: 'article',
        component: Article,
      },
      {
        name: 'ArticleList',
        path: 'articles',
        component: ArticleList,
      },
      {
        name: 'Archive',
        path: 'archive',
        component: Archive,
      },
      {
        name: 'Talk',
        path: 'talk',
        component: Talk,
      },
      {
        name: 'More',
        path: 'more',
        children: [
          {
            name: 'Navigation',
            path: 'navigation',
            component: navigation,
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
