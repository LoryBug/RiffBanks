<template>
  <div class="relative">
    <!-- Bell Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-text-dim hover:text-accent transition-colors btn-press"
      aria-label="Notifiche"
    >
      <i class="ph ph-bell text-xl"></i>
      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent text-bg-zero text-[0.6rem] font-tech font-bold flex items-center justify-center px-1 badge-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-80 max-h-96 bg-bg-zero border border-border-zero shadow-lg z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border-zero shrink-0">
          <h3 class="font-tech text-xs uppercase text-text-main">Notifiche</h3>
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllAsRead"
            class="font-tech text-[0.6rem] text-accent hover:text-text-main uppercase"
          >
            Segna tutte lette
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <i class="ph ph-spinner text-xl text-text-dim animate-spin"></i>
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="py-8 text-center">
          <i class="ph ph-bell-slash text-3xl text-text-dim mb-2"></i>
          <p class="font-tech text-xs text-text-dim uppercase">Nessuna notifica</p>
        </div>

        <!-- Notifications List -->
        <div v-else class="flex-1 overflow-y-auto">
          <div
            v-for="(notification, index) in notifications"
            :key="notification._id"
            @click="handleNotificationClick(notification)"
            :class="[
              'px-4 py-3 border-b border-border-zero cursor-pointer transition-colors hover:bg-surface-zero stagger-item',
              notification.read ? 'bg-bg-zero' : 'bg-surface-zero'
            ]"
            :style="{ animationDelay: `${index * 0.03}s` }"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div :class="['w-8 h-8 flex items-center justify-center shrink-0', getIconClass(notification.type)]">
                <i :class="getIcon(notification.type)"></i>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-text-main truncate">{{ notification.title }}</p>
                <p class="text-xs text-text-dim line-clamp-2">{{ notification.message }}</p>
                <span class="font-tech text-[0.6rem] text-text-dim mt-1 block">
                  {{ formatTime(notification.createdAt) }}
                </span>
              </div>

              <!-- Unread dot -->
              <div v-if="!notification.read" class="w-2 h-2 bg-accent shrink-0 mt-1"></div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0" class="px-4 py-2 border-t border-border-zero shrink-0">
          <button
            v-if="hasMore"
            @click="loadMore"
            class="w-full font-tech text-[0.6rem] text-text-dim hover:text-text-main uppercase text-center"
          >
            Carica altre
          </button>
        </div>
      </div>
    </Transition>

    <!-- Click outside overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { notificationsAPI } from '@/services/api'
import { useSocketStore } from '@/stores/socket'

const router = useRouter()
const socketStore = useSocketStore()

const isOpen = ref(false)
const loading = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const hasMore = ref(true)
const limit = 10

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value && notifications.value.length === 0) {
    loadNotifications()
  }
}

async function loadNotifications() {
  try {
    loading.value = true
    const res = await notificationsAPI.list(limit, 0)
    notifications.value = res.data
    hasMore.value = res.data.length === limit
  } catch (err) {
    console.error('Failed to load notifications:', err)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  try {
    const res = await notificationsAPI.list(limit, notifications.value.length)
    notifications.value = [...notifications.value, ...res.data]
    hasMore.value = res.data.length === limit
  } catch (err) {
    console.error('Failed to load more notifications:', err)
  }
}

async function loadUnreadCount() {
  try {
    const res = await notificationsAPI.getUnreadCount()
    unreadCount.value = res.data.count
  } catch (err) {
    console.error('Failed to load unread count:', err)
  }
}

async function handleMarkAllAsRead() {
  try {
    await notificationsAPI.markAllAsRead()
    notifications.value = notifications.value.map(n => ({ ...n, read: true }))
    unreadCount.value = 0
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}

async function handleNotificationClick(notification) {
  // Mark as read
  if (!notification.read) {
    try {
      await notificationsAPI.markAsRead(notification._id)
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  if (notification.link) {
    isOpen.value = false
    router.push(notification.link)
  }
}

function handleNewNotification(notification) {
  notifications.value = [notification, ...notifications.value]
  unreadCount.value++
}

function getIcon(type) {
  switch (type) {
    case 'application_accepted': return 'ph ph-check-circle'
    case 'application_rejected': return 'ph ph-x-circle'
    case 'new_applicant': return 'ph ph-user-plus'
    case 'member_joined': return 'ph ph-users'
    case 'new_message': return 'ph ph-chat-centered-text'
    case 'new_asset': return 'ph ph-file-arrow-up'
    default: return 'ph ph-bell'
  }
}

function getIconClass(type) {
  switch (type) {
    case 'application_accepted': return 'text-accent'
    case 'application_rejected': return 'text-text-dim'
    case 'new_applicant': return 'text-accent'
    case 'member_joined': return 'text-accent'
    case 'new_message': return 'text-text-main'
    case 'new_asset': return 'text-text-main'
    default: return 'text-text-dim'
  }
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Ora'
  if (diffMins < 60) return `${diffMins}m fa`
  if (diffHours < 24) return `${diffHours}h fa`
  if (diffDays < 7) return `${diffDays}g fa`
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

onMounted(() => {
  loadUnreadCount()

  // Listen for real-time notifications
  if (socketStore.socket) {
    socketStore.socket.on('new_notification', handleNewNotification)
  }
})

onUnmounted(() => {
  if (socketStore.socket) {
    socketStore.socket.off('new_notification', handleNewNotification)
  }
})

// Expose for parent to refresh
defineExpose({ loadUnreadCount })
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
