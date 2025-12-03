<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col relative bg-bg-zero">
    <!-- Scanlines Overlay -->
    <ScanlineOverlay />

    <!-- Header -->
    <header class="h-16 bg-bg-zero/90 backdrop-blur-md border-b border-border-zero z-30 shrink-0 sticky top-0">
      <div class="container-zero h-full flex items-center justify-between">
      <!-- Band Selector -->
      <div class="flex items-center gap-4 cursor-pointer group" @click="toggleBandMenu">
        <div class="w-2 h-2 bg-accent group-hover:shadow-glow transition-all"></div>
        <div class="flex flex-col">
          <span class="font-bold text-lg leading-none tracking-tight text-text-main">
            {{ activeBand ? activeBand.name : 'Seleziona Band' }}
          </span>
          <span class="font-tech text-[0.6rem] text-text-dim uppercase group-hover:text-text-main transition-colors">
            Select Band <i class="ph-bold ph-caret-down"></i>
          </span>
        </div>
      </div>

      <!-- Right Side: Theme Toggle & User -->
      <div class="flex items-center gap-4">
        <ThemeToggle />
        <div
          @click="authStore.logout(); router.push({ name: 'auth' })"
          class="relative group cursor-pointer"
          :aria-label="`Logout ${authStore.user?.username || 'Utente'}`"
        >
          <div class="w-8 h-8 bg-surface-zero border border-border-zero flex items-center justify-center font-tech text-xs text-text-dim group-hover:text-accent group-hover:border-accent transition-colors">
            {{ authStore.user?.username?.substring(0, 2).toUpperCase() || 'US' }}
          </div>
          <div class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-accent"></div>
        </div>
      </div>
      </div>
    </header>

    <!-- Band Selection Modal -->
    <div
      v-if="showBandMenu"
      class="absolute inset-0 z-50 bg-bg-zero/95 backdrop-blur-xl flex items-start justify-center animate-fade-in"
      @click.self="showBandMenu = false"
    >
      <div class="container-zero flex flex-col h-full py-8">
        <div class="flex justify-between items-center mb-12 border-b border-border-zero pb-4">
          <h2 class="text-3xl font-bold text-text-main">SELECT BAND</h2>
          <button @click="showBandMenu = false" class="text-text-dim hover:text-text-main" aria-label="Chiudi">
            <i class="ph ph-x text-2xl"></i>
          </button>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>

        <div v-else class="space-y-4 flex-1 overflow-y-auto">
          <div
            v-for="band in bands"
            :key="band._id"
            @click="selectBand(band)"
            class="group flex items-center justify-between p-6 border border-border-zero hover:border-accent hover:bg-accent-dim cursor-pointer transition-all duration-300"
            :class="activeBand?._id === band._id ? 'border-accent bg-accent-dim' : ''"
          >
            <div class="flex items-center gap-4">
              <span class="font-tech text-xs text-text-dim group-hover:text-accent">
                {{ String(bands.indexOf(band) + 1).padStart(2, '0') }}
              </span>
              <span class="text-xl font-bold uppercase tracking-tight text-text-main">{{ band.name }}</span>
              <span
                v-if="unreadCounts[band._id] > 0"
                class="px-2 py-0.5 bg-accent text-bg-zero text-xs font-tech font-bold"
              >
                {{ unreadCounts[band._id] > 9 ? '9+' : unreadCounts[band._id] }}
              </span>
            </div>
            <i class="ph-bold ph-arrow-right opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-accent"></i>
          </div>

          <div v-if="bands.length === 0" class="text-center py-12">
            <p class="font-tech text-text-dim text-sm uppercase">No bands found</p>
          </div>
        </div>

        <button
          @click="router.push({ name: 'create-band' }); showBandMenu = false"
          class="mt-auto w-full py-4 border border-dashed border-border-zero text-text-dim font-tech text-xs uppercase hover:text-text-main hover:border-text-main transition-colors"
        >
          + Initialize New Band
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
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
          <!-- Status Strip -->
          <div class="grid grid-cols-3 gap-4 mb-10">
            <div class="p-3 border border-border-zero">
              <span class="block font-tech text-[0.6rem] text-text-dim uppercase mb-1">Status</span>
              <span class="block text-accent font-bold text-sm">ONLINE</span>
            </div>
            <div class="p-3 border border-border-zero">
              <span class="block font-tech text-[0.6rem] text-text-dim uppercase mb-1">Bands</span>
              <span class="block text-text-main font-bold text-sm">{{ bands.length }}</span>
            </div>
            <div class="p-3 border border-border-zero">
              <span class="block font-tech text-[0.6rem] text-text-dim uppercase mb-1">User</span>
              <span class="block text-text-main font-bold text-sm font-tech">{{ authStore.user?.username?.substring(0, 6).toUpperCase() || 'USR' }}</span>
            </div>
          </div>

          <!-- Welcome Message -->
          <div class="border-l-2 border-accent pl-4 mb-8">
            <h2 class="text-2xl font-bold text-text-main mb-1">
              Benvenuto, {{ authStore.user?.username }}
            </h2>
            <p class="font-tech text-xs text-text-dim uppercase">
              {{ authStore.user?.instruments?.length > 0
                ? authStore.user.instruments.join(' // ')
                : 'Ready to create' }}
            </p>
          </div>

          <!-- Band List Section -->
          <div class="flex justify-between items-end mb-6 border-b border-border-zero pb-2">
            <h3 class="font-tech text-xs text-text-dim uppercase tracking-widest">Band Index</h3>
            <button
              @click="router.push({ name: 'create-band' })"
              class="text-accent hover:text-text-main transition-colors"
              aria-label="Crea nuova band"
            >
              <i class="ph ph-plus text-xl"></i>
            </button>
          </div>

          <!-- Band List -->
          <div v-if="bands.length > 0" class="space-y-px bg-border-zero">
            <div
              v-for="band in bands"
              :key="band._id"
              @click="router.push({ name: 'songs', params: { bandId: band._id } })"
              class="bg-bg-zero p-5 flex justify-between items-center group cursor-pointer hover:bg-surface-zero transition-colors"
            >
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h4 class="text-lg font-bold uppercase group-hover:text-text-main transition-colors text-text-main">
                    {{ band.name }}
                  </h4>
                  <span
                    v-if="unreadCounts[band._id] > 0"
                    class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                  ></span>
                </div>
                <p class="font-tech text-[0.6rem] text-text-dim uppercase">
                  MEMBERS: {{ band.members?.length || 0 }} // <span class="text-text-main">{{ band.genre || 'N/A' }}</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="border border-border-zero p-8 text-center">
            <i class="ph ph-users text-4xl text-text-dim mb-4"></i>
            <h3 class="text-lg font-bold text-text-main mb-2">No Bands Found</h3>
            <p class="font-tech text-xs text-text-dim uppercase mb-6">
              Initialize a new band or join with invite code
            </p>
            <button
              @click="router.push({ name: 'create-band' })"
              class="px-6 py-3 bg-surface-zero border border-border-zero font-tech text-xs uppercase text-text-main hover:bg-text-main hover:text-bg-zero transition-colors"
            >
              + Initialize Band
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { bandsAPI } from '@/services/api'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

const bands = ref([])
const activeBand = ref(null)
const loading = ref(true)
const error = ref('')
const showBandMenu = ref(false)

onMounted(async () => {
  await Promise.all([
    loadBands(),
  ])
})

async function loadBands() {
  try {
    loading.value = true
    const res = await bandsAPI.list()
    bands.value = res.data
    if (res.data.length > 0) {
      activeBand.value = res.data[0]
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Errore nel caricamento delle band'
  } finally {
    loading.value = false
  }
}


function toggleBandMenu() {
  showBandMenu.value = !showBandMenu.value
}

function selectBand(band) {
  activeBand.value = band
  showBandMenu.value = false
  router.push({ name: 'songs', params: { bandId: band._id } })
}
</script>
