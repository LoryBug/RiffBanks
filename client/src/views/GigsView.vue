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
          <span class="font-bold text-lg leading-none tracking-tight text-text-main">Gig_Net</span>
          <span class="font-tech text-[0.6rem] text-text-dim uppercase">Global Talent Database</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button
          v-if="adminBands.length > 0"
          @click="showCreateModal = true"
          class="text-accent hover:text-text-main transition-colors"
          aria-label="Pubblica nuovo gig"
        >
          <i class="ph ph-plus text-xl"></i>
        </button>
        <ThemeToggle />
      </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden relative pb-24">
      <div class="container-zero py-6 space-y-8">
        <!-- Section Header -->
        <div class="border-l-2 border-text-main pl-4">
          <h2 class="text-3xl font-bold uppercase leading-none mb-1 text-text-main">Gig_Net</h2>
          <p class="font-tech text-xs text-text-dim">Global Talent Database</p>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-4 border-b border-border-zero pb-4 overflow-x-auto no-scrollbar">
          <button
            @click="filters.type = ''"
            :class="[
              'font-tech text-xs uppercase whitespace-nowrap transition-colors',
              !filters.type ? 'font-bold text-text-main' : 'text-text-dim hover:text-text-main'
            ]"
          >
            All Listings
          </button>
          <button
            @click="filters.type = 'member'"
            :class="[
              'font-tech text-xs uppercase whitespace-nowrap transition-colors',
              filters.type === 'member' ? 'font-bold text-text-main' : 'text-text-dim hover:text-text-main'
            ]"
          >
            Musicians
          </button>
          <button
            @click="filters.type = 'session'"
            :class="[
              'font-tech text-xs uppercase whitespace-nowrap transition-colors',
              filters.type === 'session' ? 'font-bold text-text-main' : 'text-text-dim hover:text-text-main'
            ]"
          >
            Sessions
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative">
          <i class="ph ph-magnifying-glass absolute left-0 top-1/2 -translate-y-1/2 text-text-dim"></i>
          <input
            v-model="filters.search"
            @keyup.enter="loadGigs"
            type="text"
            placeholder="Search roles, genres..."
            class="input-zero pl-8 font-tech text-sm uppercase"
          />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="border border-accent/50 p-4 font-tech text-sm text-text-main">
          {{ error }}
        </div>

        <!-- Empty State -->
        <div v-else-if="gigs.length === 0" class="border border-border-zero p-8 text-center">
          <i class="ph ph-briefcase text-4xl text-text-dim mb-4"></i>
          <h3 class="text-lg font-bold text-text-main mb-2">No Listings Found</h3>
          <p class="font-tech text-xs text-text-dim uppercase mb-6">
            {{ hasActiveFilters ? 'Try adjusting your filters' : 'Be the first to post a gig' }}
          </p>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-6 py-3 bg-surface-zero border border-border-zero font-tech text-xs uppercase text-text-main hover:bg-text-main hover:text-bg-zero transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <!-- Gig List -->
        <div v-else class="space-y-6">
          <p class="font-tech text-xs text-text-dim uppercase">
            {{ gigs.length }} {{ gigs.length === 1 ? 'listing' : 'listings' }} found
          </p>

          <div
            v-for="gig in gigs"
            :key="gig._id"
            @click="selectedGig = gig"
            class="relative pl-6 border-l border-border-zero hover:border-accent transition-colors group cursor-pointer"
          >
            <!-- Tiny visual indicator -->
            <div class="absolute -left-[3px] top-0 w-[5px] h-[5px] bg-bg-zero border border-border-zero group-hover:border-accent group-hover:bg-accent transition-colors"></div>

            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-bold uppercase group-hover:text-accent transition-colors text-text-main">
                {{ gig.role }}
              </h3>
              <span class="font-tech text-[0.6rem] text-text-main border border-border-zero px-1">
                {{ gig.type === 'member' ? 'BAND' : 'SESSION' }}
              </span>
            </div>
            <p class="text-sm text-text-dim mb-4 leading-relaxed line-clamp-2">
              {{ gig.description }}
            </p>
            <div class="flex items-center justify-between">
              <span class="font-tech text-[0.6rem] text-text-dim uppercase">
                {{ gig.bandName || 'Unknown Band' }} // {{ gig.applicantCount || 0 }} applicants
              </span>
              <button
                v-if="!gig.hasApplied"
                @click.stop="handleApply(gig._id, '')"
                class="font-tech text-xs font-bold uppercase flex items-center gap-2 hover:gap-3 transition-all text-text-main"
              >
                Connect <i class="ph-bold ph-arrow-right"></i>
              </button>
              <span v-else class="font-tech text-xs text-accent uppercase">
                Applied
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Create Gig Modal -->
    <CreateGigModal
      v-if="showCreateModal"
      :bands="adminBands"
      @close="showCreateModal = false"
      @created="handleGigCreated"
    />

    <!-- Gig Detail Modal -->
    <GigDetailModal
      v-if="selectedGig"
      :gig="selectedGig"
      @close="selectedGig = null"
      @apply="handleApply"
      @withdraw="handleWithdraw"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { gigsAPI, bandsAPI } from '@/services/api'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import CreateGigModal from '@/components/CreateGigModal.vue'
import GigDetailModal from '@/components/GigDetailModal.vue'

const router = useRouter()

const gigs = ref([])
const userBands = ref([])
const loading = ref(true)
const error = ref('')
const showCreateModal = ref(false)
const selectedGig = ref(null)

const filters = reactive({
  type: '',
  role: '',
  search: ''
})

const adminBands = computed(() =>
  userBands.value.filter(b => b.members?.some(m => m.role === 'Admin'))
)

const hasActiveFilters = computed(() =>
  filters.type || filters.role || filters.search
)

// Watch filter changes
watch(() => filters.type, () => loadGigs())

onMounted(async () => {
  await Promise.all([loadGigs(), loadUserBands()])
})

async function loadUserBands() {
  try {
    const res = await bandsAPI.list()
    userBands.value = res.data
  } catch (err) {
    console.error('Failed to load bands:', err)
  }
}

async function loadGigs() {
  try {
    loading.value = true
    error.value = ''
    const res = await gigsAPI.list(filters)
    gigs.value = res.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load gigs'
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filters.type = ''
  filters.role = ''
  filters.search = ''
  loadGigs()
}

async function handleApply(gigId, message) {
  try {
    await gigsAPI.apply(gigId, message)
    gigs.value = gigs.value.map(g =>
      g._id === gigId ? { ...g, hasApplied: true, applicantCount: (g.applicantCount || 0) + 1 } : g
    )
    if (selectedGig.value?._id === gigId) {
      selectedGig.value = { ...selectedGig.value, hasApplied: true, applicantCount: (selectedGig.value.applicantCount || 0) + 1 }
    }
    return true
  } catch (err) {
    throw err
  }
}

async function handleWithdraw(gigId) {
  try {
    await gigsAPI.withdraw(gigId)
    gigs.value = gigs.value.map(g =>
      g._id === gigId ? { ...g, hasApplied: false, applicantCount: Math.max(0, (g.applicantCount || 1) - 1) } : g
    )
    if (selectedGig.value?._id === gigId) {
      selectedGig.value = { ...selectedGig.value, hasApplied: false, applicantCount: Math.max(0, (selectedGig.value.applicantCount || 1) - 1) }
    }
    return true
  } catch (err) {
    throw err
  }
}

function handleGigCreated(newGig) {
  gigs.value = [newGig, ...gigs.value]
  showCreateModal.value = false
}
</script>
