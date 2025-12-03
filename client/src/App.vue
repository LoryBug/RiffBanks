<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSocketStore } from '@/stores/socket'

const authStore = useAuthStore()
const socketStore = useSocketStore()

onMounted(async () => {
  await authStore.checkAuth()
  if (authStore.isAuthenticated) {
    socketStore.connect()
  }
})

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated: any) => {
    if (isAuthenticated) {
      socketStore.connect()
    } else {
      socketStore.disconnect()
    }
  }
)
</script>
<style scoped></style>
