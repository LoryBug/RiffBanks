<template>
  <div class="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30 pb-20 overflow-x-hidden animate-fade-in" style="padding-bottom: env(safe-area-inset-bottom, 5rem)">
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ liveMessage }}
    </div>

    <header role="banner" class="sticky z-20 bg-black/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between" style="top: env(safe-area-inset-top, 0)">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          RiffBank
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <button
          aria-label="Profilo utente"
          class="min-w-[44px] min-h-[44px] rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold border-2 border-zinc-900 active:scale-95 transition-transform"
        >
          <span aria-hidden="true">U</span>
        </button>
      </div>
    </header>

    <main role="main" class="p-4 mx-auto space-y-4 max-w-md">
      <div v-if="loading" class="flex items-center justify-center py-20" role="status" aria-label="Caricamento in corso">
        <Loader2 class="w-10 h-10 text-indigo-500 animate-spin" aria-hidden="true" />
      </div>

      <div v-else-if="error" role="alert" class="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-zinc-300 text-sm">
        {{ error }}
      </div>

      <div v-else class="space-y-6 animate-fade-in">
        <div class="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
          <h2 class="text-2xl font-bold mb-2">
            Ciao, Utente!
          </h2>
          <p class="text-zinc-400 text-sm mb-3">
            Bentornato! Pronto a suonare?
          </p>
        </div>

        <section aria-labelledby="bands-heading">
          <h2 id="bands-heading" class="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
            Le tue Band
          </h2>

          <div v-if="bands.length === 0" class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
            <div class="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <Users :size="28" class="text-zinc-500" />
            </div>
            <h3 class="text-lg font-bold mb-2">Nessuna band</h3>
            <p class="text-zinc-400 text-sm mb-6">
              Crea una nuova band o unisciti con un codice invito
            </p>
          </div>

          <ul v-else class="grid gap-3" role="list">
            <li v-for="band in bands" :key="band._id">
              <button
                @click="router.push({ name: 'songs', params: { bandId: band._id } })"
                :aria-label="`Apri band ${band.name}`"
                class="w-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 min-h-[80px] transition-all hover:border-zinc-600 cursor-pointer active:scale-[0.98] active:bg-zinc-800 group text-left relative"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="min-w-[48px] min-h-[48px] rounded-lg bg-gradient-to-r from-indigo-900 to-purple-900 flex items-center justify-center text-white opacity-80 relative" aria-hidden="true">
                      <Users :size="20" />
                    </div>
                    <div>
                      <h3 class="font-bold text-lg">{{ band.name }}</h3>
                      <p class="text-xs text-zinc-400">
                        {{ band.members?.length }} Membri - {{ band.genre }}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    :size="20"
                    class="text-zinc-600 group-hover:text-indigo-400 transition-colors"
                    aria-hidden="true"
                  />
                </div>
              </button>
            </li>
          </ul>

          <div class="flex flex-col gap-3 mt-4">
            <button
              @click="router.push({ name: 'create-band' })"
              aria-label="Unisciti o crea una nuova band"
              class="w-full min-h-[56px] border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-medium"
            >
              <Plus :size="20" aria-hidden="true" />
              <span>Unisciti o Crea Band</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Plus, ChevronRight, Loader2 } from 'lucide-vue-next'
import { bandsAPI } from '@/services/api'

const router = useRouter()

const bands = ref([])
const loading = ref(true)
const error = ref('')
const liveMessage = ref('')

onMounted(async () => {
  await loadBands()
})

async function loadBands() {
  try {
    loading.value = true
    liveMessage.value = 'Caricamento band in corso...'
    const res = await bandsAPI.list()
    bands.value = res.data
    liveMessage.value = `${res.data.length} band caricate`
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Errore nel caricamento delle band'
    error.value = errorMsg
    liveMessage.value = errorMsg
  } finally {
    loading.value = false
  }
}
</script>