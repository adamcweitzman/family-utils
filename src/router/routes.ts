import { RouteRecordRaw } from 'vue-router'
import BoardGame from '../components/BoardGame.vue'
import HomeComponent from '../components/Home.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: HomeComponent,
    name: 'Home'
  },
  {
    path: '/turn',
    name: 'turn',
    component: BoardGame
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
