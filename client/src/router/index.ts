import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
   {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/AuthView.vue'),
    meta: { requiresGuest: true }
  },
   {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/OnboardingView.vue'),
    meta: { requiresAuth: true }
  },
    {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
    {
    path: '/band/new',
    name: 'create-band',
    component: () => import('@/views/JoinCreateBandView.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
    {
    path: '/band/:id',
    name: 'band-info',
    component: () => import('@/views/BandInfoView.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/band/:bandId/songs',
    name: 'songs',
    component: () => import('@/views/SongListView.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/band/:bandId/songs/new',
    name: 'create-song',
    component: () => import('@/views/CreateSongView.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  // {
  //   path: '/song/:id',
  //   name: 'song-detail',
  //   component: () => import('@/views/SongDetailView.vue'),
  //   meta: { requiresAuth: true, requiresOnboarding: true }
  // },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to be checked on first load
  if (authStore.loading) {
    await authStore.checkAuth()
  }

  const isAuthenticated = authStore.isAuthenticated
  const needsOnboarding = authStore.needsOnboarding

  // Guest-only routes (login/register)
  if (to.meta.requiresGuest && isAuthenticated) {
    if (needsOnboarding) {
      return next({ name: 'onboarding' })
    }
    return next({ name: 'dashboard' })
  }

  // Auth required routes
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'auth' })
  }

  // Onboarding required routes
  if (to.meta.requiresOnboarding && needsOnboarding) {
    return next({ name: 'onboarding' })
  }

  // If on onboarding page but already completed
  if (to.name === 'onboarding' && isAuthenticated && !needsOnboarding) {
    return next({ name: 'dashboard' })
  }

  next()
})


export default router
