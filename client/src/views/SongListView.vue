<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col relative bg-bg-zero">
    <!-- Scanlines Overlay -->
    <ScanlineOverlay />

    <!-- Header -->
    <header class="h-16 bg-bg-zero/90 backdrop-blur-md border-b border-border-zero z-30 shrink-0">
      <div class="container-zero h-full flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="router.push({ name: 'dashboard' })"
          class="font-tech text-xs text-text-dim hover:text-text-main uppercase flex items-center gap-2"
        >
          <i class="ph-bold ph-arrow-left"></i> Back
        </button>
        <div class="w-px h-6 bg-border-zero"></div>
        <div class="flex flex-col">
          <span class="font-bold text-lg leading-none tracking-tight text-text-main">{{ band?.name || 'Loading...' }}</span>
          <span class="font-tech text-[0.6rem] text-text-dim uppercase">Project Index</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <ThemeToggle />
      </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden relative pb-24">
      <div class="container-zero py-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="border border-accent/50 p-4 font-tech text-sm text-text-main">
          {{ error }}
        </div>

        <!-- Content -->
        <div v-else class="animate-fade-in">
          <!-- KPI Strip -->
          <div class="grid grid-cols-3 gap-4 mb-10">
            <div class="p-3 border border-border-zero">
              <span class="block font-tech text-[0.6rem] text-text-dim uppercase mb-1">Status</span>
              <span class="block text-accent font-bold text-sm">ACTIVE</span>
            </div>
            <div class="p-3 border border-border-zero">
              <span class="block font-tech text-[0.6rem] text-text-dim uppercase mb-1">Projects</span>
              <span class="block text-text-main font-bold text-sm">{{ songs.length }}</span>
            </div>
            <div class="p-3 border border-border-zero">
              <span class="block font-tech text-[0.6rem] text-text-dim uppercase mb-1">Genre</span>
              <span class="block text-text-main font-bold text-sm font-tech">{{ band?.genre?.substring(0, 6).toUpperCase() || 'N/A' }}</span>
            </div>
          </div>

          <!-- Section Header -->
          <div class="flex justify-between items-end mb-6 border-b border-border-zero pb-2">
            <h3 class="font-tech text-xs text-text-dim uppercase tracking-widest">Project Index</h3>
            <button
              @click="router.push({ name: 'create-song', params: { bandId: route.params.bandId } })"
              class="text-accent hover:text-text-main transition-colors"
              aria-label="Crea nuova canzone"
            >
              <i class="ph ph-plus text-xl"></i>
            </button>
          </div>

          <!-- Song List -->
          <div v-if="songs.length > 0" class="space-y-px bg-border-zero">
            <div
              v-for="song in songs"
              :key="song._id"
              @click="router.push({ name: 'song-detail', params: { id: song._id } })"
              class="bg-bg-zero p-5 flex justify-between items-center group cursor-pointer hover:bg-surface-zero transition-colors"
            >
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h4
                    class="text-lg font-bold uppercase group-hover:text-text-main transition-colors"
                    :class="song.status === 'Mix' || song.status === 'Master' ? 'text-accent' : 'text-text-main'"
                  >
                    {{ song.title }}
                  </h4>
                  <span
                    v-if="song.status === 'Mix'"
                    class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                  ></span>
                </div>
                <p class="font-tech text-[0.6rem] text-text-dim uppercase">
                  UPDATED: {{ formatDate(song.updatedAt || song.createdAt) }} //
                  <span class="text-text-main">{{ song.bpm || 120 }} BPM</span>
                </p>
              </div>

              <div class="flex items-center gap-4">
                <!-- Status Badge -->
                <span :class="['px-2 py-1 font-tech text-[0.6rem] uppercase border', getStatusClass(song.status)]">
                  {{ song.status }}
                </span>

                <!-- Progress Bar -->
                <div class="w-16 h-1 bg-border-zero hidden sm:block">
                  <div
                    class="h-full bg-text-main group-hover:bg-accent transition-colors"
                    :style="{ width: getProgressPercent(song.status) + '%' }"
                  ></div>
                </div>

                <!-- Delete Button (Admin Only) -->
                <button
                  v-if="isAdmin"
                  @click.stop="handleDelete(song._id)"
                  class="p-2 text-text-dim hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                  title="Elimina canzone"
                >
                  <i class="ph ph-trash text-lg"></i>
                </button>

                <i class="ph-bold ph-caret-right text-text-dim group-hover:text-text-main"></i>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="border border-border-zero p-8 text-center">
            <i class="ph ph-music-notes text-4xl text-text-dim mb-4"></i>
            <h3 class="text-lg font-bold text-text-main mb-2">No Projects Found</h3>
            <p class="font-tech text-xs text-text-dim uppercase mb-6">
              Initialize a new project to start creating
            </p>
            <button
              @click="router.push({ name: 'create-song', params: { bandId: route.params.bandId } })"
              class="px-6 py-3 bg-surface-zero border border-border-zero font-tech text-xs uppercase text-text-main hover:bg-text-main hover:text-bg-zero transition-colors"
            >
              + Initialize Project
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { songsAPI, bandsAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const band = ref(null)
const songs = ref([])
const loading = ref(true)
const error = ref('')

const isAdmin = computed(() => {
  return band.value?.members?.some(m => m.userId === authStore.user?._id && m.role === 'Admin')
})

function getStatusClass(status) {
  const classes = {
    'Idea': 'border-text-dim text-text-dim',
    'In Progress': 'border-accent text-accent',
    'Mix': 'border-accent text-accent bg-accent-dim',
    'Master': 'border-text-main text-text-main'
  }
  return classes[status] || classes['Idea']
}

function getProgressPercent(status) {
  const progress = {
    'Idea': 20,
    'In Progress': 50,
    'Mix': 80,
    'Master': 100
  }
  return progress[status] || 20
}

function formatDate(dateStr) {
  if (!dateStr) return 'NOW'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'NOW'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }).toUpperCase()
}

onMounted(async () => {
  await Promise.all([loadBand(), loadSongs()])
})

async function loadBand() {
  try {
    const res = await bandsAPI.get(route.params.bandId)
    band.value = res.data
  } catch (err) {
    console.error('Failed to load band:', err)
  }
}

async function loadSongs() {
  try {
    loading.value = true
    const res = await songsAPI.list(route.params.bandId)
    songs.value = res.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load songs'
  } finally {
    loading.value = false
  }
}

async function handleDelete(songId) {
  if (!window.confirm('Sei sicuro di voler eliminare questa canzone? Questa azione non puo essere annullata.')) {
    return
  }

  try {
    await songsAPI.delete(songId)
    songs.value = songs.value.filter(s => s._id !== songId)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete song'
  }
}
</script>
