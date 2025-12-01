import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const needsOnboarding = computed(() => user.value && !user.value.isProfileComplete)

  async function checkAuth() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const res = await authAPI.me()
        user.value = res.data
      } catch (err) {
        localStorage.removeItem('token')
      }
    }
    loading.value = false
  }

  async function register(username: any, email: any, password: any) {
    try {
      error.value = null
      const res = await authAPI.register({ username, email, password })
      localStorage.setItem('token', res.data.token)
      user.value = res.data.user
      return res.data.user
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed'
      error.value = message
      throw new Error(message)
    }
  }

  async function login(email: any, password: any) {
    try {
      error.value = null
      const res = await authAPI.login({ email, password })
      localStorage.setItem('token', res.data.token)
      user.value = res.data.user
      return res.data.user
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed'
      error.value = message
      throw new Error(message)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    user.value = null
  }

  async function updateProfile(data: any) {
    try {
      error.value = null
      const res = await authAPI.updateProfile(data)
      user.value = res.data
      return res.data
    } catch (err: any) {
      const message = err.response?.data?.error || 'Update failed'
      error.value = message
      throw new Error(message)
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    needsOnboarding,
    checkAuth,
    register,
    login,
    logout,
    updateProfile
  }
})
