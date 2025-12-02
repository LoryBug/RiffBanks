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
          <span class="font-bold text-lg leading-none tracking-tight text-text-main">Unit_Config</span>
        </div>
        <ThemeToggle />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden relative pb-24">
      <div class="container-zero py-6 space-y-8 animate-fade-in">
        <!-- Section Header -->
        <div class="border-l-2 border-accent pl-4">
          <h1 class="text-3xl font-bold uppercase leading-none mb-1 text-text-main">Unit_Config</h1>
          <p class="font-tech text-xs text-text-dim">Join or initialize a new unit</p>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-border-zero">
          <button
            @click="activeTab = 'join'; error = ''"
            class="pb-2 px-4 font-tech text-xs font-bold uppercase transition-all"
            :class="activeTab === 'join' ? 'text-accent border-b-2 border-accent' : 'text-text-dim hover:text-text-main'"
          >
            Join_Unit
          </button>
          <button
            @click="activeTab = 'create'; error = ''"
            class="pb-2 px-4 font-tech text-xs font-bold uppercase transition-all"
            :class="activeTab === 'create' ? 'text-accent border-b-2 border-accent' : 'text-text-dim hover:text-text-main'"
          >
            Init_Unit
          </button>
        </div>

        <!-- Join Form -->
        <div v-if="activeTab === 'join'" class="space-y-6">
          <div class="border border-border-zero p-6 space-y-6">
            <div class="text-center space-y-2">
              <i class="ph ph-key text-4xl text-accent"></i>
              <h2 class="text-xl font-bold text-text-main">Enter Invite Code</h2>
              <p class="font-tech text-xs text-text-dim uppercase">
                Input the code received from unit admin
              </p>
            </div>

            <form @submit.prevent="handleJoin" class="space-y-5">
              <div>
                <label class="font-tech text-xs text-accent uppercase block mb-1">Invite_Code</label>
                <input
                  v-model="inviteCode"
                  type="text"
                  placeholder="RC-99X-DEV"
                  class="input-zero text-lg font-tech uppercase text-center tracking-widest"
                  required
                  @input="inviteCode = inviteCode.toUpperCase()"
                />
              </div>

              <div>
                <label class="font-tech text-xs text-accent uppercase block mb-1">
                  Your_Role <span class="text-text-dim">(optional)</span>
                </label>
                <input
                  v-model="joinInstrument"
                  type="text"
                  placeholder="Guitar, Vocals, Drums..."
                  class="input-zero font-tech text-sm uppercase"
                />
              </div>

              <div v-if="error && activeTab === 'join'" class="border border-accent/50 p-3 font-tech text-sm text-text-main">
                {{ error }}
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full py-4 bg-surface-zero border border-border-zero font-tech text-sm uppercase text-text-main hover:bg-text-main hover:text-bg-zero hover:border-text-main transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span v-if="loading" class="animate-pulse">Connecting...</span>
                <template v-else>
                  Connect_Unit <i class="ph-bold ph-arrow-right"></i>
                </template>
              </button>
            </form>
          </div>
        </div>

        <!-- Create Form -->
        <div v-if="activeTab === 'create'" class="space-y-6">
          <div class="border border-border-zero p-6 space-y-6">
            <div class="text-center space-y-2">
              <i class="ph ph-plus text-4xl text-accent"></i>
              <h2 class="text-xl font-bold text-text-main">Initialize New Unit</h2>
              <p class="font-tech text-xs text-text-dim uppercase">
                Become admin and invite members
              </p>
            </div>

            <form @submit.prevent="handleCreate" class="space-y-5">
              <div>
                <label class="font-tech text-xs text-accent uppercase block mb-1">
                  Unit_Name <span class="text-accent">*</span>
                </label>
                <input
                  v-model="createForm.name"
                  type="text"
                  placeholder="THE_BAND_NAME"
                  class="input-zero font-tech text-lg uppercase"
                  required
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="font-tech text-xs text-accent uppercase block mb-1">Genre</label>
                  <input
                    v-model="createForm.genre"
                    type="text"
                    placeholder="ROCK, JAZZ..."
                    class="input-zero font-tech text-sm uppercase"
                  />
                </div>
                <div>
                  <label class="font-tech text-xs text-accent uppercase block mb-1">Location</label>
                  <input
                    v-model="createForm.location"
                    type="text"
                    placeholder="MILAN, IT"
                    class="input-zero font-tech text-sm uppercase"
                  />
                </div>
              </div>

              <div>
                <label class="font-tech text-xs text-accent uppercase block mb-1">Bio</label>
                <textarea
                  v-model="createForm.bio"
                  placeholder="Unit description and mission..."
                  rows="3"
                  class="input-zero font-tech text-sm resize-none"
                />
              </div>

              <div>
                <label class="font-tech text-xs text-accent uppercase block mb-1">
                  Your_Role <span class="text-text-dim">(optional)</span>
                </label>
                <input
                  v-model="createForm.instrument"
                  type="text"
                  placeholder="Guitar, Vocals, Producer..."
                  class="input-zero font-tech text-sm uppercase"
                />
              </div>

              <div v-if="error && activeTab === 'create'" class="border border-accent/50 p-3 font-tech text-sm text-text-main">
                {{ error }}
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full py-4 bg-surface-zero border border-border-zero font-tech text-sm uppercase text-text-main hover:bg-text-main hover:text-bg-zero hover:border-text-main transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span v-if="loading" class="animate-pulse">Initializing...</span>
                <template v-else>
                  Init_Unit <i class="ph-bold ph-arrow-right"></i>
                </template>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { bandsAPI } from '@/services/api'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()

const activeTab = ref('join')
const loading = ref(false)
const error = ref('')

const createForm = reactive({
  name: '',
  genre: '',
  bio: '',
  location: '',
  instrument: ''
})

const inviteCode = ref('')
const joinInstrument = ref('')

async function handleCreate() {
  if (!createForm.name.trim()) {
    error.value = 'Unit name is required'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await bandsAPI.create(createForm)
    router.push({ name: 'band-info', params: { id: res.data._id } })
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create unit'
  } finally {
    loading.value = false
  }
}

async function handleJoin() {
  if (!inviteCode.value.trim()) {
    error.value = 'Invite code is required'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await bandsAPI.join(inviteCode.value, joinInstrument.value)
    router.push({ name: 'band-info', params: { id: res.data._id } })
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to join unit'
  } finally {
    loading.value = false
  }
}
</script>
