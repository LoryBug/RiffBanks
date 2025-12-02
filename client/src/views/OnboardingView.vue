<template>
  <div class="min-h-screen bg-bg-zero flex flex-col items-center justify-center p-8 relative">
    <!-- Scanlines -->
    <ScanlineOverlay />

    <div class="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
      <!-- Header -->
      <div class="border-l-2 border-accent pl-6">
        <h2 class="text-3xl font-bold text-text-main mb-1">
          {{ step === 1 ? `Init_Profile` : 'Define_Sound' }}
        </h2>
        <p class="font-tech text-xs text-text-dim uppercase">
          {{ step === 1 ? `Welcome, ${authStore.user?.username || 'User'}` : 'Select your genres' }}
        </p>
      </div>

      <!-- Step 1: Instruments -->
      <div v-if="step === 1" class="grid grid-cols-2 gap-3" role="group" aria-labelledby="instruments-label">
        <span id="instruments-label" class="sr-only">Seleziona i tuoi strumenti</span>
        <button
          v-for="instrument in INSTRUMENTS"
          :key="instrument.id"
          type="button"
          @click="toggleInstrument(instrument.name)"
          :aria-pressed="selectedInstruments.includes(instrument.name)"
          :class="[
            'min-h-[80px] p-4 border flex flex-col items-center gap-2 transition-all active:scale-95',
            selectedInstruments.includes(instrument.name)
              ? 'bg-accent-dim border-accent text-text-main'
              : 'bg-surface-zero border-border-zero text-text-dim hover:border-text-dim'
          ]"
        >
          <i :class="['ph text-2xl', instrument.icon]" aria-hidden="true"></i>
          <span class="font-tech text-xs uppercase">{{ instrument.name }}</span>
        </button>
      </div>

      <!-- Step 2: Genres -->
      <div v-if="step === 2" class="flex flex-wrap gap-3 justify-center" role="group" aria-labelledby="genres-label">
        <span id="genres-label" class="sr-only">Seleziona i tuoi generi musicali</span>
        <button
          v-for="genre in GENRES"
          :key="genre"
          type="button"
          @click="toggleGenre(genre)"
          :aria-pressed="selectedGenres.includes(genre)"
          :class="[
            'min-h-[44px] px-4 py-2 border font-tech text-xs uppercase transition-all active:scale-95',
            selectedGenres.includes(genre)
              ? 'bg-text-main text-bg-zero border-text-main'
              : 'bg-transparent border-border-zero text-text-dim hover:border-text-dim hover:text-text-main'
          ]"
        >
          {{ genre }}
        </button>
      </div>

      <div v-if="error" role="alert" class="border border-accent/50 p-3 font-tech text-sm text-text-main">
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="pt-4 flex gap-3">
        <button
          v-if="step === 2"
          type="button"
          @click="step = 1"
          aria-label="Torna indietro"
          class="flex-1 min-h-[56px] py-4 border border-border-zero font-tech text-xs uppercase text-text-dim hover:text-text-main hover:border-text-dim active:scale-95 transition-all"
        >
          Back
        </button>
        <button
          type="button"
          @click="step === 1 ? handleNext() : handleFinish()"
          :disabled="(step === 1 && selectedInstruments.length === 0) || (step === 2 && selectedGenres.length === 0) || loading"
          class="flex-[2] min-h-[56px] py-4 bg-surface-zero border border-border-zero font-tech text-sm uppercase text-text-main hover:bg-text-main hover:text-bg-zero hover:border-text-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="animate-pulse">Processing...</span>
          <template v-else>
            {{ step === 1 ? 'Continue' : 'Start_Session' }}
            <i class="ph-bold ph-arrow-right"></i>
          </template>
        </button>
      </div>

      <!-- Step Indicators -->
      <div class="flex gap-2 justify-center mt-6" role="group" aria-label="Progresso wizard">
        <div
          :class="['h-[2px] transition-all', step === 1 ? 'w-8 bg-accent' : 'w-2 bg-border-zero']"
          aria-label="Passo 1: Strumenti"
          :aria-current="step === 1 ? 'step' : undefined"
        />
        <div
          :class="['h-[2px] transition-all', step === 2 ? 'w-8 bg-accent' : 'w-2 bg-border-zero']"
          aria-label="Passo 2: Generi"
          :aria-current="step === 2 ? 'step' : undefined"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'

const router = useRouter()
const authStore = useAuthStore()

const INSTRUMENTS = [
  { id: 'guitar', name: 'Chitarra', icon: 'ph-guitar' },
  { id: 'bass', name: 'Basso', icon: 'ph-music-note' },
  { id: 'drums', name: 'Batteria', icon: 'ph-metronome' },
  { id: 'voice', name: 'Voce', icon: 'ph-microphone-stage' },
  { id: 'keyboard', name: 'Tastiere', icon: 'ph-piano-keys' },
  { id: 'producer', name: 'Producer', icon: 'ph-equalizer' }
]

const GENRES = [
  'Rock', 'Jazz', 'Indie', 'Metal', 'Pop',
  'Electronic', 'Blues', 'Funk'
]

const step = ref(1)
const selectedInstruments = ref([])
const selectedGenres = ref([])
const loading = ref(false)
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

function handleNext() {
  if (step.value === 1 && selectedInstruments.value.length > 0) {
    step.value = 2
  }
}

async function handleFinish() {
  if (selectedGenres.value.length === 0) return

  loading.value = true
  error.value = ''

  try {
    await authStore.updateProfile({
      instruments: selectedInstruments.value,
      genres: selectedGenres.value
    })
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
