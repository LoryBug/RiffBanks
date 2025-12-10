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
  {
    path: '/song/:id',
    name: 'song-detail',
    component: () => import('@/views/SongDetailView.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/gigs',
    name: 'gigs',
    component: () => import('@/views/GigsView.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (authStore.loading) {
    await authStore.checkAuth()
  }

  const isAuthenticated = authStore.isAuthenticated
  const needsOnboarding = authStore.needsOnboarding

  if (to.meta.requiresGuest && isAuthenticated) {
    if (needsOnboarding) {
      return next({ name: 'onboarding' })
    }
    return next({ name: 'dashboard' })
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'auth' })
  }

  if (to.meta.requiresOnboarding && needsOnboarding) {
    return next({ name: 'onboarding' })
  }

  if (to.name === 'onboarding' && isAuthenticated && !needsOnboarding) {
    return next({ name: 'dashboard' })
  }

  next()
})


export default router
