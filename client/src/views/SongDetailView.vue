<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col relative bg-bg-zero">
    <!-- Scanlines Overlay -->
    <ScanlineOverlay />

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <LoadingSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error && !song" class="flex-1 p-6">
      <button @click="goBack" class="font-tech text-xs text-text-dim hover:text-text-main uppercase flex items-center gap-2 mb-6">
        <i class="ph-bold ph-arrow-left"></i> Back
      </button>
      <div class="border border-accent/50 p-4 font-tech text-sm text-text-main">
        {{ error }}
      </div>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Sticky Sub-header -->
      <header class="sticky top-0 z-20 bg-bg-zero/95 border-b border-border-zero backdrop-blur shrink-0">
        <div class="container-zero py-4 flex justify-between items-center">
          <button @click="goBack" class="font-tech text-xs text-text-dim hover:text-text-main uppercase flex items-center gap-2">
            <i class="ph-bold ph-arrow-left"></i> Back
          </button>
          <span class="font-tech text-xs text-accent uppercase tracking-widest">Editing Mode</span>
        </div>
      </header>

      <!-- Song Header -->
      <div class="border-b border-border-zero shrink-0">
        <div class="container-zero py-6">
          <h1 class="text-4xl font-bold uppercase mb-2 leading-none text-text-main">{{ song?.title }}</h1>
          <div class="flex gap-4 font-tech text-[0.6rem] text-text-dim uppercase mb-4">
            <span>BPM: {{ song?.bpm || 120 }}</span>
            <span>Key: {{ song?.key || 'Am' }}</span>
            <span>Status: {{ song?.status }}</span>
          </div>
          <p v-if="song?.description" class="text-sm text-text-dim">{{ song.description }}</p>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Files Section - NO shift when chat opens -->
        <main class="flex-1 overflow-y-auto pb-24">
          <div class="container-zero py-6 space-y-4">
            <div v-if="error" class="border border-accent/50 p-3 font-tech text-sm text-text-main mb-4">
              {{ error }}
            </div>

            <!-- Section Header -->
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-tech text-xs text-text-dim uppercase tracking-widest">Project Files</h3>
              <span class="font-tech text-[0.6rem] text-text-dim">{{ assets.length }} files</span>
            </div>

            <!-- Assets List -->
            <div v-for="(asset, idx) in assets" :key="asset._id" class="border border-border-zero p-4 hover:border-text-dim transition-colors group">
              <div class="flex justify-between items-start mb-4">
                <span class="font-tech text-[0.6rem] text-text-dim">TRK_{{ String(idx + 1).padStart(2, '0') }}</span>
                <div class="flex gap-2">
                  <button
                    @click="handleVote(asset._id)"
                    class="font-tech text-[0.6rem] uppercase transition-colors"
                    :class="asset.votedByMe ? 'text-accent' : 'text-text-dim hover:text-accent'"
                  >
                    {{ asset.voteCount || 0 }} Votes
                  </button>
                  <button
                    v-if="asset.uploaderId === authStore.user?._id"
                    @click="handleDelete(asset._id)"
                    class="font-tech text-[0.6rem] uppercase text-text-dim hover:text-accent"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <!-- Play Button for Audio -->
                <button
                  v-if="asset.type === 'audio'"
                  @click="togglePlay(asset)"
                  class="w-8 h-8 border border-text-main flex items-center justify-center hover:bg-text-main hover:text-bg-zero transition-colors text-text-main"
                >
                  <i class="ph-fill text-xs" :class="currentlyPlaying === asset._id ? 'ph-pause' : 'ph-play'"></i>
                </button>

                <!-- Image Preview -->
                <div v-else-if="asset.type === 'image'" class="w-8 h-8 border border-border-zero overflow-hidden">
                  <img :src="getAssetUrl(asset.url)" :alt="asset.title" class="w-full h-full object-cover" />
                </div>

                <!-- Text Icon -->
                <div v-else class="w-8 h-8 border border-border-zero flex items-center justify-center">
                  <i class="ph ph-file-text text-text-dim"></i>
                </div>

                <div class="flex-1">
                  <div class="font-bold uppercase text-sm mb-1 text-text-main">{{ asset.title }}</div>
                  <!-- Minimal Waveform for Audio -->
                  <div v-if="asset.type === 'audio'" class="h-6 flex items-center gap-0.5 opacity-50">
                    <div
                      v-for="n in 20"
                      :key="n"
                      class="w-1 bg-text-main group-hover:bg-accent transition-colors"
                      :style="{ height: getWaveformHeight(n) + '%' }"
                    ></div>
                  </div>
                  <!-- Text Content Preview -->
                  <p v-else-if="asset.type === 'text'" class="text-xs text-text-dim truncate">
                    {{ asset.content?.substring(0, 50) }}...
                  </p>
                </div>
              </div>
            </div>

            <!-- Upload Button -->
            <input
              ref="fileInputRef"
              type="file"
              accept="audio/*,image/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <button
              @click="fileInputRef?.click()"
              :disabled="uploading"
              class="w-full py-4 text-center font-tech text-xs text-text-dim border border-dashed border-border-zero uppercase hover:border-text-main hover:text-text-main transition-colors"
            >
              <span v-if="uploading">[ Uploading... ]</span>
              <span v-else>[ Upload New Stem ]</span>
            </button>

            <!-- Empty State -->
            <div v-if="assets.length === 0 && !uploading" class="border border-border-zero p-8 text-center">
              <i class="ph ph-upload text-4xl text-text-dim mb-4"></i>
              <h3 class="text-lg font-bold text-text-main mb-2">No Files Yet</h3>
              <p class="font-tech text-xs text-text-dim uppercase">
                Upload audio, images or text to share with the unit
              </p>
            </div>
          </div>
        </main>

        <!-- Desktop Side Panel Chat (lg+) -->
        <aside
          v-if="chatOpen && song"
          class="hidden lg:flex fixed right-0 top-0 w-[400px] bg-bg-zero border-l border-border-zero flex-col z-40"
          :style="{ paddingTop: 'calc(64px + 120px)', bottom: '5rem' }"
        >
          <!-- Chat Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-border-zero shrink-0">
            <div class="flex items-center gap-3">
              <i class="ph ph-chat-centered-text text-accent"></i>
              <h2 class="font-tech text-xs uppercase text-text-main">Comms</h2>
              <span v-if="socketStore.connected" class="w-1.5 h-1.5 bg-accent"></span>
              <span v-else class="w-1.5 h-1.5 bg-text-dim"></span>
            </div>
            <button
              @click="chatOpen = false"
              class="w-10 h-10 flex items-center justify-center text-text-dim hover:text-text-main transition-colors"
              aria-label="Close chat"
            >
              <i class="ph ph-x text-xl"></i>
            </button>
          </div>

          <!-- Chat Messages -->
          <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            <div v-if="messagesLoading" class="flex items-center justify-center h-full">
              <LoadingSpinner />
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

          <!-- Chat Input -->
          <div class="px-4 pt-3 pb-6 border-t border-border-zero shrink-0">
            <form @submit.prevent="handleSendMessage" class="flex gap-4">
              <input
                ref="chatInputRef"
                v-model="newMessage"
                type="text"
                :placeholder="socketStore.connected ? 'TRANSMIT MESSAGE...' : 'CONNECTING...'"
                :disabled="!socketStore.connected"
                class="input-zero flex-1 font-tech text-xs uppercase"
                maxlength="2000"
                @input="handleTyping"
              />
              <button
                type="submit"
                :disabled="!newMessage.trim() || sendingMessage || !socketStore.connected"
                class="text-accent hover:text-text-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i v-if="sendingMessage" class="ph ph-spinner text-xl animate-pulse"></i>
                <i v-else class="ph-bold ph-arrow-right text-xl"></i>
              </button>
            </form>
          </div>
        </aside>
      </div>
    </template>

    <!-- Hidden Audio Element -->
    <audio ref="audioRef" @ended="currentlyPlaying = null"></audio>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Floating Chat Button -->
    <button
      v-if="!chatOpen && song"
      @click="chatOpen = true"
      class="fixed z-50 w-14 h-14 bg-accent flex items-center justify-center hover:bg-accent/80 transition-all active:scale-95"
      :style="{ bottom: 'calc(6rem + env(safe-area-inset-bottom, 0))', right: '1.5rem' }"
      aria-label="Open chat"
    >
      <i class="ph ph-chat-centered-text text-2xl text-bg-zero"></i>
      <!-- Unread indicator -->
      <span
        v-if="unreadMessages > 0"
        class="absolute -top-1 -right-1 w-5 h-5 bg-text-main text-bg-zero text-[0.6rem] font-tech font-bold flex items-center justify-center"
      >
        {{ unreadMessages > 9 ? '9+' : unreadMessages }}
      </span>
    </button>

    <!-- Mobile Chat Overlay (below lg) - positioned above bottom nav -->
    <Transition name="slide-up">
      <div
        v-if="chatOpen && song"
        class="lg:hidden fixed inset-x-0 z-50 bg-bg-zero border-t border-border-zero flex flex-col"
        :style="{ height: 'calc(60vh)', bottom: '5rem' }"
      >
        <!-- Chat Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border-zero shrink-0">
          <div class="flex items-center gap-3">
            <i class="ph ph-chat-centered-text text-accent"></i>
            <h2 class="font-tech text-xs uppercase text-text-main">Comms</h2>
            <span v-if="socketStore.connected" class="w-1.5 h-1.5 bg-accent"></span>
            <span v-else class="w-1.5 h-1.5 bg-text-dim"></span>
          </div>
          <button
            @click="chatOpen = false"
            class="w-10 h-10 flex items-center justify-center text-text-dim hover:text-text-main transition-colors"
            aria-label="Close chat"
          >
            <i class="ph ph-x text-xl"></i>
          </button>
        </div>

        <!-- Chat Messages -->
        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <div v-if="messagesLoading" class="flex items-center justify-center h-full">
            <LoadingSpinner />
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

            <div ref="mobileMessagesEndRef" />
          </template>
        </div>

        <!-- Chat Input -->
        <div class="px-4 pt-3 pb-4 border-t border-border-zero shrink-0">
          <form @submit.prevent="handleSendMessage" class="flex gap-4">
            <input
              ref="mobileChatInputRef"
              v-model="newMessage"
              type="text"
              :placeholder="socketStore.connected ? 'TRANSMIT MESSAGE...' : 'CONNECTING...'"
              :disabled="!socketStore.connected"
              class="input-zero flex-1 font-tech text-xs uppercase"
              maxlength="2000"
              @input="handleTyping"
            />
            <button
              type="submit"
              :disabled="!newMessage.trim() || sendingMessage || !socketStore.connected"
              class="text-accent hover:text-text-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="sendingMessage" class="ph ph-spinner text-xl animate-pulse"></i>
              <i v-else class="ph-bold ph-arrow-right text-xl"></i>
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { songsAPI, assetsAPI, messagesAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useSocketStore } from '@/stores/socket'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const socketStore = useSocketStore()

// Song & Assets state
const song = ref(null)
const assets = ref([])
const loading = ref(true)
const uploading = ref(false)
const error = ref('')
const fileInputRef = ref(null)
const audioRef = ref(null)
const currentlyPlaying = ref(null)

// Chat state
const chatOpen = ref(false)
const messages = ref([])
const messagesLoading = ref(false)
const newMessage = ref('')
const sendingMessage = ref(false)
const typingUsers = ref([])
const unreadMessages = ref(0)
const messagesEndRef = ref(null)
const mobileMessagesEndRef = ref(null)
const chatInputRef = ref(null)
const mobileChatInputRef = ref(null)
let typingTimeoutId = null

// Check if we're on desktop
const isDesktop = ref(window.innerWidth >= 1024)

// Generate pseudo-random waveform heights
function getWaveformHeight(n) {
  const seed = n * 17
  return 20 + (seed % 80)
}

function getAssetUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${url}`
}

function togglePlay(asset) {
  if (!audioRef.value) return

  if (currentlyPlaying.value === asset._id) {
    audioRef.value.pause()
    currentlyPlaying.value = null
  } else {
    audioRef.value.src = getAssetUrl(asset.url)
    audioRef.value.play()
    currentlyPlaying.value = asset._id
  }
}

// Handle resize
function handleResize() {
  isDesktop.value = window.innerWidth >= 1024
}

// Load song and assets
onMounted(async () => {
  await loadData()
  setupSocketListeners()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  cleanupSocketListeners()
  window.removeEventListener('resize', handleResize)
  if (audioRef.value) {
    audioRef.value.pause()
  }
  if (typingTimeoutId) clearTimeout(typingTimeoutId)
  // Leave room when unmounting
  if (route.params.id) {
    socketStore.leaveRoom(route.params.id)
  }
})

function setupSocketListeners() {
  if (!socketStore.socket) return

  // Join the room for this song
  socketStore.joinRoom(route.params.id)

  socketStore.socket.on('asset_uploaded', handleAssetUploaded)
  socketStore.socket.on('asset_deleted', handleAssetDeleted)
  socketStore.socket.on('vote_update', handleVoteUpdate)
  socketStore.socket.on('new_message', handleNewMessage)
  socketStore.socket.on('user_typing', handleUserTyping)
}

function cleanupSocketListeners() {
  if (!socketStore.socket) return
  socketStore.socket.off('asset_uploaded', handleAssetUploaded)
  socketStore.socket.off('asset_deleted', handleAssetDeleted)
  socketStore.socket.off('vote_update', handleVoteUpdate)
  socketStore.socket.off('new_message', handleNewMessage)
  socketStore.socket.off('user_typing', handleUserTyping)
}

function handleAssetUploaded({ asset, uploadedBy }) {
  assets.value = [{ ...asset, votedByMe: false }, ...assets.value]
  // Add system message to chat
  if (chatOpen.value) {
    messages.value.push({
      _id: `system-${Date.now()}`,
      type: 'system',
      text: `${uploadedBy} uploaded a new file`,
      createdAt: new Date().toISOString()
    })
  }
}

function handleAssetDeleted({ assetId }) {
  assets.value = assets.value.filter(a => a._id !== assetId)
}

function handleVoteUpdate({ assetId, votes }) {
  assets.value = assets.value.map(a =>
    a._id === assetId ? { ...a, voteCount: votes } : a
  )
}

function handleNewMessage(message) {
  messages.value.push(message)
  typingUsers.value = typingUsers.value.filter(id => id !== message.userId)

  // Increment unread if chat is closed and message is not from current user
  if (!chatOpen.value && message.userId !== authStore.user?._id && message.type !== 'system') {
    unreadMessages.value++
  }

  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
    mobileMessagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

function handleUserTyping({ userId, isTyping }) {
  if (userId === authStore.user?._id) return

  if (isTyping && !typingUsers.value.includes(userId)) {
    typingUsers.value.push(userId)
  } else if (!isTyping) {
    typingUsers.value = typingUsers.value.filter(id => id !== userId)
  }
}

async function loadData() {
  try {
    loading.value = true
    const [songRes, assetsRes] = await Promise.all([
      songsAPI.get(route.params.id),
      assetsAPI.list(route.params.id)
    ])
    song.value = songRes.data
    assets.value = assetsRes.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load song'
  } finally {
    loading.value = false
  }
}

// Load messages when chat opens
watch(chatOpen, async (isOpen) => {
  if (isOpen) {
    unreadMessages.value = 0
    messagesLoading.value = true
    try {
      const res = await messagesAPI.list(route.params.id)
      messages.value = res.data
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      messagesLoading.value = false
    }
    nextTick(() => {
      messagesEndRef.value?.scrollIntoView({ behavior: 'instant' })
      mobileMessagesEndRef.value?.scrollIntoView({ behavior: 'instant' })
      // Focus appropriate input based on screen size
      if (isDesktop.value) {
        chatInputRef.value?.focus()
      } else {
        mobileChatInputRef.value?.focus()
      }
    })
  }
})

async function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return

  uploading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('songId', route.params.id)
    formData.append('title', file.name)

    const res = await assetsAPI.upload(formData)
    assets.value = [res.data, ...assets.value]
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to upload file'
  } finally {
    uploading.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

async function handleVote(assetId) {
  try {
    const res = await assetsAPI.vote(assetId)
    assets.value = assets.value.map(a =>
      a._id === assetId
        ? { ...a, votedByMe: res.data.votedByMe, voteCount: res.data.votes }
        : a
    )
  } catch (err) {
    console.error('Vote error:', err)
  }
}

async function handleDelete(assetId) {
  if (!window.confirm('Eliminare questo file?')) return

  try {
    await assetsAPI.delete(assetId)
    assets.value = assets.value.filter(a => a._id !== assetId)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete asset'
  }
}

function handleTyping() {
  socketStore.startTyping(route.params.id)

  if (typingTimeoutId) clearTimeout(typingTimeoutId)

  typingTimeoutId = setTimeout(() => {
    socketStore.stopTyping(route.params.id)
  }, 2000)
}

async function handleSendMessage() {
  const text = newMessage.value.trim()
  if (!text || sendingMessage.value) return

  sendingMessage.value = true
  socketStore.stopTyping(route.params.id)

  try {
    socketStore.sendMessage(route.params.id, text)
    newMessage.value = ''
    // Focus appropriate input
    if (isDesktop.value) {
      chatInputRef.value?.focus()
    } else {
      mobileChatInputRef.value?.focus()
    }
  } catch (err) {
    console.error('Failed to send message:', err)
  } finally {
    sendingMessage.value = false
  }
}

function goBack() {
  if (song.value?.bandId) {
    router.push({ name: 'songs', params: { bandId: song.value.bandId } })
  } else {
    router.push({ name: 'dashboard' })
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
