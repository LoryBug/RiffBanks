<template>
  <RouterView />

  <ConfirmModal
    :is-open="confirmState.isOpen"
    :title="confirmState.title"
    :message="confirmState.message"
    :confirm-text="confirmState.confirmText"
    :cancel-text="confirmState.cancelText"
    :variant="confirmState.variant"
    :icon="confirmState.icon"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSocketStore } from '@/stores/socket'
import { useConfirm } from '@/composables/useConfirm'
import ConfirmModal from '@/components/ConfirmModal.vue'

const authStore = useAuthStore()
const { state: confirmState, handleConfirm, handleCancel } = useConfirm()
const socketStore = useSocketStore()

onMounted(async () => {
  await authStore.checkAuth()

  if (authStore.isAuthenticated) {
    socketStore.connect()
  }
})

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      socketStore.connect()
    } else {
      socketStore.disconnect()
    }
  }
)
</script>
