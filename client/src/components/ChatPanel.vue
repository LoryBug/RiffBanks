<template>
  <!-- ARIA Live Region for new messages -->
  <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
    {{ liveAnnouncement }}
  </div>

  <!-- Closed state - floating button (only in non-embedded mode) -->
  <button
    v-if="!isOpen && !embedded"
    @click="$emit('toggle')"
    aria-label="Apri chat"
    class="fixed right-4 w-14 h-14 bg-accent flex items-center justify-center shadow-glow hover:bg-accent/90 transition-colors active:scale-95 z-50"
    :style="{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0))' }"
  >
    <i class="ph ph-chat-centered-text text-2xl text-bg-zero"></i>
  </button>

  <!-- Open state - panel (embedded or floating) -->
  <div
    v-if="isOpen || embedded"
    ref="panelRef"
    role="dialog"
    aria-modal="true"
    aria-labelledby="chat-title"
    :class="[
      embedded
        ? 'flex flex-col h-full'
        : 'fixed bottom-0 right-0 w-full sm:w-96 h-[60vh] sm:h-[500px] sm:right-4 bg-bg-zero border border-border-zero flex flex-col shadow-glow z-50'
    ]"
    :style="!embedded ? { bottom: 'env(safe-area-inset-bottom, 0)', right: 'env(safe-area-inset-right, 0)' } : {}"
  >
    <!-- Header (only in non-embedded mode) -->
    <div v-if="!embedded" class="flex items-center justify-between px-4 py-3 border-b border-border-zero">
      <div class="flex items-center gap-2">
        <i class="ph ph-chat-centered-text text-accent"></i>
        <h2 id="chat-title" class="font-tech text-xs uppercase text-text-main">Comms</h2>
        <span v-if="socketStore.connected" class="w-1.5 h-1.5 bg-accent"></span>
        <span v-else class="w-1.5 h-1.5 bg-text-dim"></span>
      </div>
      <button
        @click="$emit('toggle')"
        aria-label="Chiudi chat"
        class="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-dim hover:text-text-main transition-colors"
      >
        <i class="ph ph-x text-lg"></i>
      </button>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-6" role="log" aria-label="Messaggi chat">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <LoadingSpinner message="Loading messages..." />
      </div>

      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <i class="ph ph-chat-centered-text text-3xl text-text-dim mb-2"></i>
        <p class="font-tech text-xs text-text-dim uppercase">No transmissions</p>
        <p class="font-tech text-[0.6rem] text-text-dim uppercase">Start the conversation</p>
      </div>

      <template v-else>
        <div
          v-for="message in messages"
          :key="message._id"
          :class="[
            'flex flex-col gap-1',
            message.userId === authStore.user?._id ? 'items-end ml-auto' : 'items-start',
            'max-w-[85%]'
          ]"
        >
          <!-- System Message -->
          <template v-if="message.type === 'system'">
            <div class="w-full text-center">
              <span class="font-tech text-[0.6rem] text-text-dim uppercase">
                {{ message.text }}
              </span>
            </div>
          </template>

          <!-- User Message -->
          <template v-else>
            <span class="font-tech text-[0.6rem] uppercase" :class="message.userId === authStore.user?._id ? 'text-text-main' : 'text-accent'">
              {{ message.userId === authStore.user?._id ? 'You' : message.username }}
            </span>
            <p
              class="text-sm leading-relaxed"
              :class="[
                message.userId === authStore.user?._id
                  ? 'text-text-main border-r border-accent pr-3 text-right'
                  : 'text-text-dim border-l border-border-zero pl-3'
              ]"
            >
              {{ message.text }}
            </p>
          </template>
        </div>

        <!-- Typing Indicator -->
        <div v-if="typingUsers.length > 0" class="flex flex-col gap-1 items-start max-w-[85%]">
          <span class="font-tech text-[0.6rem] text-text-dim uppercase">
            Typing...
          </span>
        </div>

        <div ref="messagesEndRef" />
      </template>
    </div>

    <!-- Input -->
    <div class="mt-4 pt-4 border-t border-border-zero px-4 pb-4">
      <form @submit.prevent="handleSend" class="flex gap-4">
        <label for="chat-input" class="sr-only">Scrivi un messaggio</label>
        <input
          id="chat-input"
          ref="inputRef"
          v-model="newMessage"
          type="text"
          :placeholder="socketStore.connected ? 'TRANSMIT MESSAGE...' : 'CONNECTING...'"
          :disabled="!socketStore.connected"
          aria-label="Messaggio chat"
          class="input-zero flex-1 font-tech text-xs uppercase"
          maxlength="2000"
          @input="handleInputChange"
        />
        <button
          type="submit"
          :disabled="!newMessage.trim() || sending || !socketStore.connected"
          :aria-label="sending ? 'Invio messaggio in corso' : 'Invia messaggio'"
          class="text-accent hover:text-text-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="sending" class="ph ph-spinner text-xl animate-pulse"></i>
          <i v-else class="ph-bold ph-arrow-right text-xl"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { messagesAPI } from '@/services/api'
import { useSocketStore } from '@/stores/socket'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  songId: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  embedded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle'])

const socketStore = useSocketStore()
const authStore = useAuthStore()

const messages = ref([])
const newMessage = ref('')
const loading = ref(true)
const sending = ref(false)
const typingUsers = ref([])
const liveAnnouncement = ref('')
const messagesEndRef = ref(null)
const inputRef = ref(null)
const panelRef = ref(null)
let typingTimeoutId = null

// Load initial messages
watch(
  () => [props.songId, props.isOpen, props.embedded],
  async ([songId, isOpen, embedded]) => {
    if (!songId || (!isOpen && !embedded)) return

    try {
      loading.value = true
      const res = await messagesAPI.list(songId)
      messages.value = res.data
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

// Join/leave room
watch(
  () => [props.songId, props.isOpen, props.embedded],
  ([songId, isOpen, embedded], [oldSongId, oldIsOpen]) => {
    if (!songId || (!isOpen && !embedded)) {
      if (oldSongId && oldIsOpen) {
        socketStore.leaveRoom(oldSongId)
      }
      return
    }
    socketStore.joinRoom(songId)
  },
  { immediate: true }
)

// Focus input when panel opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  }
)

// Socket event listeners
watch(
  () => [socketStore.socket, props.isOpen, props.embedded],
  ([socket, isOpen, embedded]) => {
    if (!socket || (!isOpen && !embedded)) return

    const handleNewMessage = (message) => {
      messages.value.push(message)
      typingUsers.value = typingUsers.value.filter(id => id !== message.userId)

      if (message.userId !== authStore.user?._id && message.type !== 'system') {
        liveAnnouncement.value = `Nuovo messaggio da ${message.username}`
      }

      nextTick(() => {
        messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
      })
    }

    const handleUserTyping = ({ userId, isTyping }) => {
      if (userId === authStore.user?._id) return

      if (isTyping && !typingUsers.value.includes(userId)) {
        typingUsers.value.push(userId)
      } else if (!isTyping) {
        typingUsers.value = typingUsers.value.filter(id => id !== userId)
      }
    }

    const handleAssetUploaded = ({ uploadedBy }) => {
      const systemMessage = {
        _id: `system-${Date.now()}`,
        type: 'system',
        text: `${uploadedBy} uploaded a new file`,
        createdAt: new Date().toISOString()
      }
      messages.value.push(systemMessage)
    }

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleUserTyping)
    socket.on('asset_uploaded', handleAssetUploaded)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleUserTyping)
      socket.off('asset_uploaded', handleAssetUploaded)
    }
  },
  { immediate: true }
)

// ESC key handler
function handleEscape(e) {
  if (e.key === 'Escape' && props.isOpen && !props.embedded) {
    emit('toggle')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  if (typingTimeoutId) clearTimeout(typingTimeoutId)
})

function handleInputChange() {
  socketStore.startTyping(props.songId)

  if (typingTimeoutId) clearTimeout(typingTimeoutId)

  typingTimeoutId = setTimeout(() => {
    socketStore.stopTyping(props.songId)
  }, 2000)
}

async function handleSend() {
  const text = newMessage.value.trim()
  if (!text || sending.value) return

  sending.value = true
  socketStore.stopTyping(props.songId)

  try {
    socketStore.sendMessage(props.songId, text)
    newMessage.value = ''
    inputRef.value?.focus()
  } catch (err) {
    console.error('Failed to send message:', err)
  } finally {
    sending.value = false
  }
}
</script>
