<template>
  <div class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 animate-fade-in">
    <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] animate-pulse-slow"></div>

    <div class="w-full max-w-md space-y-8 relative z-10">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-indigo-600/30">
          <Music v-if="step === 1" :size="32" class="text-white" />
          <Zap v-else :size="32" class="text-white" />
        </div>
        <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          {{ step === 1 ? `Ciao, ${authStore.user?.username || 'Musicista'}!` : 'I tuoi gusti' }}
        </h2>
        <p class="text-zinc-400">
          {{ step === 1 ? 'Quali sono le tue armi preferite?' : 'Definisci il tuo sound.' }}
        </p>
      </div>

      <!-- Instruments -->
      <div v-if="step === 1" class="grid grid-cols-2 gap-3 animate-slide-up" role="group" aria-labelledby="instruments-label">
        <span id="instruments-label" class="sr-only">Seleziona i tuoi strumenti</span>
        <button
          v-for="instrument in INSTRUMENTS"
          :key="instrument.id"
          type="button"
          @click="toggleInstrument(instrument.name)"
          :aria-pressed="selectedInstruments.includes(instrument.name)"
          :aria-label="`${instrument.name}${selectedInstruments.includes(instrument.name) ? ', selezionato' : ''}`"
          :class="[
            'min-h-[80px] p-4 rounded-xl border flex flex-col items-center gap-2 transition-all active:scale-95',
            selectedInstruments.includes(instrument.name)
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          ]"
        >
          <component :is="instrument.icon" :size="24" aria-hidden="true" />
          <span class="text-sm font-bold">{{ instrument.name }}</span>
        </button>
      </div>

      <!-- Genres -->
      <div v-if="step === 2" class="flex flex-wrap gap-3 justify-center animate-slide-up" role="group" aria-labelledby="genres-label">
        <span id="genres-label" class="sr-only">Seleziona i tuoi generi musicali</span>
        <button
          v-for="genre in GENRES"
          :key="genre"
          type="button"
          @click="toggleGenre(genre)"
          :aria-pressed="selectedGenres.includes(genre)"
          :aria-label="`${genre}${selectedGenres.includes(genre) ? ', selezionato' : ''}`"
          :class="[
            'min-h-[44px] px-4 py-2 rounded-full border text-sm font-bold transition-all active:scale-95',
            selectedGenres.includes(genre)
              ? 'bg-white text-black border-white'
              : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500'
          ]"
        >
          {{ genre }}
        </button>
      </div>

      <div v-if="error" role="alert" class="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-zinc-300 text-sm">
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="pt-4 flex gap-3">
        <button
          v-if="step === 2"
          type="button"
          @click="step = 1"
          aria-label="Torna al passo precedente"
          class="flex-1 min-h-[56px] py-4 rounded-xl font-bold text-zinc-400 hover:bg-zinc-900 active:scale-95 transition-all"
        >
          Indietro
        </button>
        <button
          type="button"
          @click="step === 1 ? handleNext() : handleFinish()"
          :disabled="(step === 1 && selectedInstruments.length === 0) || (step === 2 && selectedGenres.length === 0) || loading"
          :aria-label="loading ? 'Salvataggio in corso' : (step === 1 ? 'Continua al passo successivo' : 'Completa configurazione e inizia')"
          class="flex-[2] min-h-[56px] py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <template v-if="loading">
            <Loader2 :size="20" class="animate-spin" aria-hidden="true" />
            <span>Salvataggio...</span>
          </template>
          <template v-else>
            <span>{{ step === 1 ? 'Continua' : 'Inizia a Suonare' }}</span>
            <ArrowRight :size="18" aria-hidden="true" />
          </template>
        </button>
      </div>

      <!-- Step Indicators -->
      <div class="flex gap-2 justify-center mt-6" role="group" aria-label="Progresso wizard">
        <div
          :class="['h-1.5 rounded-full transition-all', step === 1 ? 'w-8 bg-indigo-500' : 'w-2 bg-zinc-800']"
          aria-label="Passo 1: Strumenti"
          :aria-current="step === 1 ? 'step' : undefined"
        />
        <div
          :class="['h-1.5 rounded-full transition-all', step === 2 ? 'w-8 bg-indigo-500' : 'w-2 bg-zinc-800']"
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
import { Music, Guitar, Mic, Drum, Activity, ArrowRight, Zap, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const INSTRUMENTS = [
  { id: 'guitar', name: 'Chitarra', icon: Guitar },
  { id: 'bass', name: 'Basso', icon: Music },
  { id: 'drums', name: 'Batteria', icon: Drum },
  { id: 'voice', name: 'Voce', icon: Mic },
  { id: 'keyboard', name: 'Tastiere', icon: Music },
  { id: 'producer', name: 'Producer', icon: Activity }
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
