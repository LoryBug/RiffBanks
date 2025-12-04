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
            <span class="font-bold text-lg leading-none tracking-tight text-text-main">Profile</span>
            <span class="font-tech text-[0.6rem] text-text-dim uppercase">User_Settings</span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto pb-24">
      <div class="container-zero py-6 space-y-6 animate-fade-in">
        <!-- User Info Card -->
        <div class="border border-border-zero p-6">
          <div class="flex items-center gap-4 mb-6">
            <!-- Avatar -->
            <div class="w-16 h-16 border-2 border-accent flex items-center justify-center text-accent font-tech text-2xl">
              {{ authStore.user?.username?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-text-main">{{ authStore.user?.username }}</h2>
              <p class="font-tech text-xs text-text-dim">{{ authStore.user?.email }}</p>
            </div>
          </div>
        </div>

        <!-- Instruments Section -->
        <div class="border border-border-zero p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-tech text-xs text-accent uppercase">Strumenti</h3>
            <button
              v-if="!editingInstruments"
              @click="startEditInstruments"
              class="font-tech text-xs text-text-dim hover:text-accent uppercase flex items-center gap-1 transition-colors"
            >
              <i class="ph ph-pencil-simple"></i> Edit
            </button>
          </div>

          <!-- View Mode -->
          <div v-if="!editingInstruments" class="flex flex-wrap gap-2">
            <span
              v-for="instrument in authStore.user?.instruments"
              :key="instrument"
              class="px-3 py-1 border border-border-zero font-tech text-xs uppercase text-text-main"
            >
              {{ instrument }}
            </span>
            <span v-if="!authStore.user?.instruments?.length" class="font-tech text-xs text-text-dim">
              Nessuno strumento selezionato
            </span>
          </div>

          <!-- Edit Mode -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="instrument in INSTRUMENTS"
                :key="instrument.id"
                type="button"
                @click="toggleInstrument(instrument.name)"
                :class="[
                  'min-h-[60px] p-3 border flex flex-col items-center gap-1 transition-all active:scale-95',
                  selectedInstruments.includes(instrument.name)
                    ? 'bg-accent-dim border-accent text-text-main'
                    : 'bg-surface-zero border-border-zero text-text-dim hover:border-text-dim'
                ]"
              >
                <i :class="['ph text-xl', instrument.icon]"></i>
                <span class="font-tech text-[0.6rem] uppercase">{{ instrument.name }}</span>
              </button>
            </div>
            <!-- Custom Instrument Input -->
            <div v-if="selectedInstruments.includes('Altro')" class="animate-fade-in">
              <label class="font-tech text-xs text-accent uppercase block mb-2">Specifica strumento</label>
              <input
                v-model="customInstrument"
                type="text"
                placeholder="Es: Ukulele, Mandolino..."
                class="w-full px-4 py-3 bg-surface-zero border border-border-zero text-text-main font-tech text-sm uppercase placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div class="flex gap-2">
              <button
                @click="cancelEditInstruments"
                class="flex-1 py-3 border border-border-zero font-tech text-xs uppercase text-text-dim hover:text-text-main hover:border-text-dim transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveInstruments"
                :disabled="saving"
                class="flex-1 py-3 bg-surface-zero border border-border-zero font-tech text-xs uppercase text-text-main hover:bg-text-main hover:text-bg-zero hover:border-text-main transition-colors disabled:opacity-50"
              >
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Genres Section -->
        <div class="border border-border-zero p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-tech text-xs text-accent uppercase">Generi</h3>
            <button
              v-if="!editingGenres"
              @click="startEditGenres"
              class="font-tech text-xs text-text-dim hover:text-accent uppercase flex items-center gap-1 transition-colors"
            >
              <i class="ph ph-pencil-simple"></i> Edit
            </button>
          </div>

          <!-- View Mode -->
          <div v-if="!editingGenres" class="flex flex-wrap gap-2">
            <span
              v-for="genre in authStore.user?.genres"
              :key="genre"
              class="px-3 py-1 border border-border-zero font-tech text-xs uppercase text-text-main"
            >
              {{ genre }}
            </span>
            <span v-if="!authStore.user?.genres?.length" class="font-tech text-xs text-text-dim">
              Nessun genere selezionato
            </span>
          </div>

          <!-- Edit Mode -->
          <div v-else class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="genre in GENRES"
                :key="genre"
                type="button"
                @click="toggleGenre(genre)"
                :class="[
                  'min-h-[36px] px-3 py-1 border font-tech text-xs uppercase transition-all active:scale-95',
                  selectedGenres.includes(genre)
                    ? 'bg-text-main text-bg-zero border-text-main'
                    : 'bg-transparent border-border-zero text-text-dim hover:border-text-dim hover:text-text-main'
                ]"
              >
                {{ genre }}
              </button>
            </div>
            <!-- Custom Genre Input -->
            <div v-if="selectedGenres.includes('Altro')" class="animate-fade-in">
              <label class="font-tech text-xs text-accent uppercase block mb-2">Specifica genere</label>
              <input
                v-model="customGenre"
                type="text"
                placeholder="Es: Afrobeat, Drum & Bass..."
                class="w-full px-4 py-3 bg-surface-zero border border-border-zero text-text-main font-tech text-sm uppercase placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div class="flex gap-2">
              <button
                @click="cancelEditGenres"
                class="flex-1 py-3 border border-border-zero font-tech text-xs uppercase text-text-dim hover:text-text-main hover:border-text-dim transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveGenres"
                :disabled="saving"
                class="flex-1 py-3 bg-surface-zero border border-border-zero font-tech text-xs uppercase text-text-main hover:bg-text-main hover:text-bg-zero hover:border-text-main transition-colors disabled:opacity-50"
              >
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Logout Section -->
        <div class="border border-accent/30 p-4">
          <h3 class="font-tech text-xs text-accent uppercase mb-3">Actions</h3>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-3 border border-accent/50 text-accent font-tech text-xs uppercase hover:bg-accent-dim transition-all"
          >
            <i class="ph ph-sign-out"></i>
            Logout
          </button>
        </div>

        <div v-if="error" class="border border-accent/50 p-3 font-tech text-sm text-text-main">
          {{ error }}
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()
const { confirm } = useConfirm()

const INSTRUMENTS = [
  { id: 'guitar', name: 'Chitarra', icon: 'ph-guitar' },
  { id: 'bass', name: 'Basso', icon: 'ph-music-note' },
  { id: 'drums', name: 'Batteria', icon: 'ph-metronome' },
  { id: 'voice', name: 'Voce', icon: 'ph-microphone-stage' },
  { id: 'keyboard', name: 'Tastiere', icon: 'ph-piano-keys' },
  { id: 'producer', name: 'Producer', icon: 'ph-equalizer' },
  { id: 'sax', name: 'Sassofono', icon: 'ph-music-notes' },
  { id: 'trumpet', name: 'Tromba', icon: 'ph-speaker-high' },
  { id: 'violin', name: 'Violino', icon: 'ph-music-notes-simple' },
  { id: 'flute', name: 'Flauto', icon: 'ph-wind' },
  { id: 'dj', name: 'DJ', icon: 'ph-disc' },
  { id: 'other', name: 'Altro', icon: 'ph-dots-three' }
]

const GENRES = [
  'Rock', 'Jazz', 'Indie', 'Metal', 'Pop',
  'Electronic', 'Blues', 'Funk', 'Hip-Hop', 'R&B',
  'Classical', 'Reggae', 'Country', 'Soul', 'Altro'
]

// Edit state
const editingInstruments = ref(false)
const editingGenres = ref(false)
const selectedInstruments = ref([])
const selectedGenres = ref([])
const customInstrument = ref('')
const customGenre = ref('')
const saving = ref(false)
const error = ref('')

function toggleInstrument(name) {
  if (selectedInstruments.value.includes(name)) {
    selectedInstruments.value = selectedInstruments.value.filter(i => i !== name)
  } else {
    selectedInstruments.value.push(name)
  }
}

function toggleGenre(genre) {
  if (selectedGenres.value.includes(genre)) {
    selectedGenres.value = selectedGenres.value.filter(g => g !== genre)
  } else {
    selectedGenres.value.push(genre)
  }
}

function startEditInstruments() {
  // Map current instruments to selection, checking for custom ones
  const knownInstruments = INSTRUMENTS.map(i => i.name)
  const currentInstruments = authStore.user?.instruments || []

  selectedInstruments.value = []
  currentInstruments.forEach(inst => {
    if (knownInstruments.includes(inst)) {
      selectedInstruments.value.push(inst)
    } else {
      // It's a custom instrument
      selectedInstruments.value.push('Altro')
      customInstrument.value = inst
    }
  })

  editingInstruments.value = true
}

function cancelEditInstruments() {
  editingInstruments.value = false
  selectedInstruments.value = []
  customInstrument.value = ''
}

async function saveInstruments() {
  saving.value = true
  error.value = ''

  try {
    let finalInstruments = selectedInstruments.value.filter(i => i !== 'Altro')
    if (selectedInstruments.value.includes('Altro') && customInstrument.value.trim()) {
      finalInstruments.push(customInstrument.value.trim())
    }

    await authStore.updateProfile({ instruments: finalInstruments })
    editingInstruments.value = false
    selectedInstruments.value = []
    customInstrument.value = ''
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

function startEditGenres() {
  const knownGenres = GENRES
  const currentGenres = authStore.user?.genres || []

  selectedGenres.value = []
  currentGenres.forEach(genre => {
    if (knownGenres.includes(genre)) {
      selectedGenres.value.push(genre)
    } else {
      selectedGenres.value.push('Altro')
      customGenre.value = genre
    }
  })

  editingGenres.value = true
}

function cancelEditGenres() {
  editingGenres.value = false
  selectedGenres.value = []
  customGenre.value = ''
}

async function saveGenres() {
  saving.value = true
  error.value = ''

  try {
    let finalGenres = selectedGenres.value.filter(g => g !== 'Altro')
    if (selectedGenres.value.includes('Altro') && customGenre.value.trim()) {
      finalGenres.push(customGenre.value.trim())
    }

    await authStore.updateProfile({ genres: finalGenres })
    editingGenres.value = false
    selectedGenres.value = []
    customGenre.value = ''
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

async function handleLogout() {
  const confirmed = await confirm({
    title: 'Logout',
    message: 'Sei sicuro di voler uscire?',
    confirmText: 'Esci',
    cancelText: 'Annulla',
    variant: 'default'
  })
  if (!confirmed) return
  authStore.logout()
  router.push({ name: 'auth' })
}
</script>
