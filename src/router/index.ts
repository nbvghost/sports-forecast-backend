import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'
import { NO_RESET_WHITE_LIST } from '@/constants'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard/analysis',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/analysis',
    name: 'Dashboard',
    meta: {
      title: '主页',
      icon: 'ant-design:dashboard-filled',
      alwaysShow: true
    },
    children: [
      {
        path: 'analysis',
        component: () => import('@/views/Seer/Index.vue'),
        name: 'Analysis',
        meta: {
          title: '专家管理',
          noCache: true,
          affix: true
        }
      }
    ]
  },
  {
    path: '/seer',
    component: Layout,
    name: 'Seer',
    meta: {},
    children: [
      {
        path: 'index',
        component: () => import('@/views/Seer/Index.vue'),
        name: 'SeerIndex',
        meta: {
          title: '专家管理',
          icon: 'cib:telegram-plane'
        }
      }
    ]
  },
  {
    path: '/schedule',
    component: Layout,
    name: 'schedule',
    meta: {},
    children: [
      {
        path: 'index',
        component: () => import('@/views/Schedule/Index.vue'),
        name: 'ScheduleIndex',
        meta: {
          title: '赛事管理',
          icon: 'cib:telegram-plane'
        }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    name: 'user',
    meta: {},
    children: [
      {
        path: 'index',
        component: () => import('@/views/User/Index.vue'),
        name: 'UserIndex',
        meta: {
          title: '用户列表',
          icon: 'cib:telegram-plane'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !NO_RESET_WHITE_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
