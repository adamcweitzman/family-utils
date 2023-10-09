import { RouteRecordRaw } from 'vue-router'
import BoardGame from '../components/BoardGame.vue'
import AddNewBoardGame from '../components/AddNewBoardGame.vue'
import LogGame from '../components/LogGame.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: BoardGame,
    name: 'Home'
  },
  {
    path: '/LogGame',
    component: () => import('../components/LogGame.vue'),
    name: 'LogGame'
  },
  {
    path: '/AddNewBoardGame',
    component: () => import('../components/AddNewBoardGame.vue'),
    name: 'AddNewBoardGame'
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
