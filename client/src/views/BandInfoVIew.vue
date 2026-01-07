<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col relative bg-bg-zero">
    <!-- Scanlines Overlay -->
    <ScanlineOverlay />

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <LoadingSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error && !band" class="flex-1 p-6">
      <button @click="router.push({ name: 'dashboard' })" class="font-tech text-xs text-text-dim hover:text-text-main uppercase flex items-center gap-2 mb-6">
        <i class="ph-bold ph-arrow-left"></i> Back
      </button>
      <div class="border border-accent/50 p-4 font-tech text-sm text-text-main">
        {{ error }}
      </div>
    </div>

    <!-- Main Content -->
    <template v-else>
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
              <span class="font-bold text-lg leading-none tracking-tight text-text-main">{{ band?.name }}</span>
              <span class="font-tech text-[0.6rem] text-text-dim uppercase">Unit_Info</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <!-- Band Info Strip -->
      <div class="container-zero py-4 border-b border-border-zero">
        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 border border-border-zero">
            <span class="block font-tech text-[0.6rem] text-text-dim uppercase mb-1">Genre</span>
            <span class="block text-text-main font-bold text-sm font-tech">{{ band?.genre?.substring(0, 8).toUpperCase() || 'N/A' }}</span>
          </div>
          <div class="p-3 border border-border-zero">
            <span class="block font-tech text-[0.6rem] text-text-dim uppercase mb-1">Location</span>
            <span class="block text-text-main font-bold text-sm font-tech">{{ band?.location?.substring(0, 8).toUpperCase() || 'N/A' }}</span>
          </div>
          <button
            @click="router.push({ name: 'songs', params: { bandId: band?._id } })"
            class="p-3 border border-border-zero hover:border-accent hover:bg-accent-dim transition-colors text-left group"
          >
            <span class="block font-tech text-[0.6rem] text-text-dim uppercase mb-1 group-hover:text-accent">Projects</span>
            <span class="block text-text-main font-bold text-sm group-hover:text-accent flex items-center gap-1">
              <i class="ph ph-music-notes"></i> VIEW
            </span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="container-zero flex border-b border-border-zero mt-3">
        <button
          @click="activeTab = 'overview'"
          class="pb-2 px-4 font-tech text-xs font-bold uppercase transition-all"
          :class="activeTab === 'overview' ? 'text-accent border-b-2 border-accent' : 'text-text-dim hover:text-text-main'"
        >
          Overview
        </button>
        <button
          @click="activeTab = 'members'"
          class="pb-2 px-4 font-tech text-xs font-bold uppercase transition-all"
          :class="activeTab === 'members' ? 'text-accent border-b-2 border-accent' : 'text-text-dim hover:text-text-main'"
        >
          Members ({{ band?.members?.length }})
        </button>
      </div>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto pb-24">
        <div class="container-zero py-6 space-y-6 animate-fade-in">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <div v-if="band?.bio" class="border border-border-zero p-4">
              <h3 class="font-tech text-xs text-accent uppercase mb-2">About</h3>
              <p class="text-text-main text-sm">{{ band.bio }}</p>
            </div>

            <!-- Invite Code Card -->
            <div class="border border-accent/30 bg-accent-dim p-5">
              <h3 class="font-tech text-xs text-accent uppercase mb-3">Invite_Code</h3>
              <div class="flex items-center gap-3">
                <code class="flex-1 bg-bg-zero border border-border-zero px-4 py-4 text-accent text-xl tracking-widest font-tech text-center">
                  {{ band?.inviteCode }}
                </code>
                <button
                  @click="copyInviteCode"
                  class="p-3 border border-border-zero text-text-dim hover:text-text-main hover:border-text-dim transition-all"
                  title="Copia codice"
                >
                  <i v-if="copied" class="ph ph-check text-accent text-lg"></i>
                  <i v-else class="ph ph-copy text-lg"></i>
                </button>
                <button
                  v-if="isAdmin"
                  @click="regenerateCode"
                  :disabled="regenerating"
                  class="p-3 border border-border-zero text-text-dim hover:text-text-main hover:border-text-dim transition-all disabled:opacity-50"
                  title="Rigenera codice"
                >
                  <i :class="['ph ph-arrows-clockwise text-lg', regenerating ? 'animate-spin' : '']"></i>
                </button>
              </div>
              <p class="font-tech text-[0.6rem] text-text-dim uppercase mt-3">
                Share this code to invite members to the unit
              </p>
            </div>

          </div>

          <!-- Members Tab -->
          <div v-if="activeTab === 'members'" class="space-y-3">
            <div
              v-for="member in band?.members"
              :key="member.userId._id"
              class="border border-border-zero p-4 flex items-center gap-4 hover:border-text-dim transition-colors"
            >
              <div class="w-12 h-12 border border-accent flex items-center justify-center text-accent font-tech text-lg">
                {{ member.userId.username?.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-text-main font-bold">{{ member.userId.username }}</span>
                  <i v-if="member.role === 'Admin'" class="ph-fill ph-crown text-accent"></i>
                </div>
                <span v-if="member.instrument" class="font-tech text-xs text-text-dim uppercase">{{ member.instrument }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-tech text-[0.6rem] text-text-dim">
                  {{ new Date(member.joinedAt).toLocaleDateString('it-IT') }}
                </span>
                <!-- Leave button for current user -->
                <button
                  v-if="member.userId._id === authStore.user?._id"
                  @click="handleLeave"
                  class="p-2 text-text-dim hover:text-accent transition-colors"
                  title="Lascia unit"
                >
                  <i class="ph ph-sign-out text-lg"></i>
                </button>
                <!-- Remove button for admin (can remove others, not self) -->
                <button
                  v-else-if="isAdmin && member.role !== 'Admin'"
                  @click="handleRemoveMember(member.userId._id, member.userId.username)"
                  class="p-2 text-text-dim hover:text-accent transition-colors"
                  title="Rimuovi membro"
                >
                  <i class="ph ph-user-minus text-lg"></i>
                </button>
              </div>
            </div>

            <!-- Leave Unit Section -->
            <div class="border border-accent/30 p-4 mt-6">
              <h3 class="font-tech text-xs text-accent uppercase mb-3">Actions</h3>
              <button
                @click="handleLeave"
                class="flex items-center gap-2 px-4 py-3 border border-accent/50 text-accent font-tech text-xs uppercase hover:bg-accent-dim transition-all"
              >
                <i class="ph ph-sign-out"></i>
                Leave_Unit
              </button>
            </div>
          </div>

          <div v-if="error" class="border border-accent/50 p-3 font-tech text-sm text-text-main">
            {{ error }}
          </div>
        </div>
      </main>
    </template>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { bandsAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const { confirm } = useConfirm()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const band = ref(null)
const loading = ref(true)
const error = ref('')
const activeTab = ref('overview')
const copied = ref(false)
const regenerating = ref(false)

const isAdmin = computed(() => {
  return band.value?.members?.find(m => m.userId._id === authStore.user?._id)?.role === 'Admin'
})

onMounted(async () => {
  await loadBand()
})

async function loadBand() {
  try {
    loading.value = true
    const res = await bandsAPI.get(route.params.id)
    band.value = res.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load unit'
  } finally {
    loading.value = false
  }
}

function copyInviteCode() {
  navigator.clipboard.writeText(band.value.inviteCode)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

async function regenerateCode() {
  const confirmed = await confirm({
    title: 'Rigenera Codice',
    message: 'Sei sicuro? Il vecchio codice smettera di funzionare.',
    confirmText: 'Rigenera',
    cancelText: 'Annulla',
    variant: 'default'
  })
  if (!confirmed) return

  regenerating.value = true
  try {
    const res = await bandsAPI.regenerateCode(route.params.id)
    band.value = { ...band.value, inviteCode: res.data.inviteCode }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to regenerate code'
  } finally {
    regenerating.value = false
  }
}

async function handleLeave() {
  const confirmed = await confirm({
    title: 'Lascia Unit',
    message: 'Sei sicuro di voler lasciare questa unit?',
    confirmText: 'Lascia',
    cancelText: 'Annulla',
    variant: 'danger'
  })
  if (!confirmed) return

  try {
    await bandsAPI.leave(route.params.id)
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to leave unit'
  }
}

async function handleRemoveMember(userId, username) {
  const confirmed = await confirm({
    title: 'Rimuovi Membro',
    message: `Sei sicuro di voler rimuovere ${username} dalla unit?`,
    confirmText: 'Rimuovi',
    cancelText: 'Annulla',
    variant: 'danger'
  })
  if (!confirmed) return

  try {
    await bandsAPI.removeMember(route.params.id, userId)
    await loadBand()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to remove member'
  }
}
</script>
