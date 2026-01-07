<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col relative bg-bg-zero">
    <!-- Scanlines Overlay -->
    <ScanlineOverlay />

    <!-- Header -->
    <header class="h-16 bg-bg-zero/90 backdrop-blur-md border-b border-border-zero z-30 shrink-0">
      <div class="container-zero h-full flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="router.push({ name: 'songs', params: { bandId: route.params.bandId } })"
            class="font-tech text-xs text-text-dim hover:text-text-main uppercase flex items-center gap-2"
          >
            <i class="ph-bold ph-arrow-left"></i> Back
          </button>
          <div class="w-px h-6 bg-border-zero"></div>
          <span class="font-bold text-lg leading-none tracking-tight text-text-main">Init_Project</span>
        </div>
        <ThemeToggle />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden relative pb-24">
      <div class="container-zero py-6 animate-fade-in">
        <!-- Section Header -->
        <div class="border border-border-zero p-6 mb-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 border border-accent flex items-center justify-center">
              <i class="ph ph-music-notes text-2xl text-accent"></i>
            </div>
            <div>
              <h1 class="text-xl font-bold text-text-main">New_Project</h1>
              <p class="font-tech text-xs text-text-dim uppercase">{{ band?.name || 'Loading...' }}</p>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label class="font-tech text-xs text-accent uppercase block mb-1">
                Title <span class="text-accent">*</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                placeholder="PROJECT_TITLE"
                class="input-zero font-tech text-lg uppercase"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="font-tech text-xs text-accent uppercase block mb-1">Genre</label>
                <input
                  v-model="formData.genre"
                  type="text"
                  placeholder="ROCK, POP..."
                  class="input-zero font-tech text-sm uppercase"
                />
              </div>
              <div>
                <label class="font-tech text-xs text-accent uppercase block mb-1">BPM</label>
                <input
                  v-model="formData.bpm"
                  type="number"
                  placeholder="120"
                  min="20"
                  max="300"
                  class="input-zero font-tech text-sm"
                />
              </div>
            </div>

            <div>
              <label class="font-tech text-xs text-accent uppercase block mb-2">Status</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="status in STATUSES"
                  :key="status"
                  type="button"
                  @click="formData.status = status"
                  :class="[
                    'py-2 px-3 border font-tech text-[0.6rem] uppercase transition-all',
                    formData.status === status
                      ? 'bg-accent-dim border-accent text-accent'
                      : 'bg-transparent border-border-zero text-text-dim hover:border-text-dim'
                  ]"
                >
                  {{ status }}
                </button>
              </div>
            </div>

            <div>
              <label class="font-tech text-xs text-accent uppercase block mb-1">Description</label>
              <textarea
                v-model="formData.description"
                placeholder="Project description, themes, mood..."
                rows="3"
                class="input-zero font-tech text-sm resize-none"
              />
            </div>

            <!-- AI Lyrics Toggle -->
            <div class="border border-accent/30 bg-accent-dim p-4">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="formData.useAI"
                  type="checkbox"
                  class="w-5 h-5 accent-accent"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 text-text-main font-bold text-sm">
                    <i class="ph ph-sparkle text-accent"></i>
                    AI_Lyrics_Gen
                  </div>
                  <p class="font-tech text-[0.6rem] text-text-dim uppercase mt-1">
                    Let RiffBot generate lyrics based on project info
                  </p>
                </div>
              </label>
            </div>

            <div v-if="error" class="border border-accent/50 p-3 font-tech text-sm text-text-main">
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-4 bg-surface-zero border border-border-zero font-tech text-sm uppercase text-text-main hover:bg-text-main hover:text-bg-zero hover:border-text-main transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="loading" class="animate-pulse">Initializing...</span>
              <template v-else>
                Init_Project <i class="ph-bold ph-arrow-right"></i>
              </template>
            </button>
          </form>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { songsAPI, bandsAPI } from '@/services/api'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const route = useRoute()

const STATUSES = ['Idea', 'In Progress', 'Mix', 'Master']

const band = ref(null)
const loading = ref(false)
const error = ref('')

const formData = reactive({
  title: '',
  genre: '',
  bpm: '',
  description: '',
  status: 'Idea',
  useAI: false
})

onMounted(async () => {
  try {
    const res = await bandsAPI.get(route.params.bandId)
    band.value = res.data
    formData.genre = band.value.genre || ''
  } catch (err) {
    console.error('Failed to load band:', err)
  }
})

async function handleSubmit() {
  if (!formData.title.trim()) {
    error.value = 'Project title is required'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await songsAPI.create({
      bandId: route.params.bandId,
      title: formData.title,
      genre: formData.genre,
      bpm: formData.bpm ? parseInt(formData.bpm) : undefined,
      description: formData.description,
      status: formData.status
    })

    router.push({ name: 'song-detail', params: { id: res.data._id } })
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create project'
    loading.value = false
  }
}
</script>
