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
        <ThemeToggle />
      </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden relative pb-24">
      <div class="container-zero py-6 space-y-6">

        <!-- Toolbar: Filters + Search + New Gig -->
        <div class="flex items-center justify-between gap-4">
          <!-- Filter Pills -->
          <div class="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              @click="filters.type = ''"
              :class="[
                'px-3 py-1.5 font-tech text-[0.65rem] uppercase whitespace-nowrap transition-all border',
                !filters.type
                  ? 'border-accent text-accent bg-accent-dim'
                  : 'border-border-zero text-text-dim hover:border-text-dim hover:text-text-main'
              ]"
            >
              All
            </button>
            <button
              @click="filters.type = 'member'"
              :class="[
                'px-3 py-1.5 font-tech text-[0.65rem] uppercase whitespace-nowrap transition-all border',
                filters.type === 'member'
                  ? 'border-accent text-accent bg-accent-dim'
                  : 'border-border-zero text-text-dim hover:border-text-dim hover:text-text-main'
              ]"
            >
              Band
            </button>
            <button
              @click="filters.type = 'session'"
              :class="[
                'px-3 py-1.5 font-tech text-[0.65rem] uppercase whitespace-nowrap transition-all border',
                filters.type === 'session'
                  ? 'border-accent text-accent bg-accent-dim'
                  : 'border-border-zero text-text-dim hover:border-text-dim hover:text-text-main'
              ]"
            >
              Session
            </button>
          </div>

          <!-- Right Side: Search + New Gig -->
          <div class="flex items-center gap-2">
            <!-- Expandable Search -->
            <div class="relative flex items-center">
              <button
                v-if="!searchOpen && !filters.search"
                @click="openSearch"
                class="p-2 text-text-dim hover:text-accent transition-colors"
              >
                <i class="ph ph-magnifying-glass"></i>
              </button>
              <div
                v-else
                class="flex items-center gap-2 animate-fade-in"
              >
                <input
                  ref="searchInputRef"
                  v-model="filters.search"
                  @keyup.enter="loadGigs"
                  @blur="handleSearchBlur"
                  type="text"
                  placeholder="Search..."
                  class="w-32 bg-transparent border-b border-border-zero focus:border-accent outline-none font-tech text-xs uppercase py-1 transition-colors"
                />
                <button
                  v-if="filters.search"
                  @click="clearSearch"
                  class="p-1 text-text-dim hover:text-accent transition-colors"
                >
                  <i class="ph ph-x text-sm"></i>
                </button>
              </div>
            </div>

            <!-- New Gig Button (only for admins) -->
            <button
              v-if="adminBands.length > 0"
              @click="showCreateModal = true"
              class="p-2 bg-accent text-bg-zero hover:bg-text-main transition-colors"
              title="Pubblica Gig"
            >
              <i class="ph ph-plus"></i>
            </button>
          </div>
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
            v-for="(gig, index) in gigs"
            :key="gig._id"
            @click="selectedGig = gig"
            class="relative pl-6 border-l border-border-zero hover:border-accent transition-colors group cursor-pointer btn-press stagger-item"
            :style="{ animationDelay: `${index * 0.05}s` }"
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
                {{ gig.bandId?.name || 'Unknown Band' }} // {{ gig.applicantCount || 0 }} applicants
              </span>
              <button
                v-if="!gig.hasApplied"
                @click.stop="handleApply(gig._id, '')"
                class="font-tech text-xs font-bold uppercase flex items-center gap-2 hover:gap-3 transition-all text-text-main underline-slide"
              >
                Connect <i class="ph-bold ph-arrow-right"></i>
              </button>
              <span v-else class="font-tech text-xs text-accent uppercase">
                Applied
              </span>
            </div>
          </div>
        </div>

        <!-- ========== LE MIE CANDIDATURE (Collapsible) ========== -->
        <div v-if="myApplications.length > 0" class="border border-border-zero">
          <button
            @click="showApplications = !showApplications"
            class="w-full p-4 flex items-center justify-between hover:bg-surface-zero transition-colors"
          >
            <div class="flex items-center gap-3">
              <i class="ph ph-paper-plane-tilt text-accent"></i>
              <span class="font-tech text-xs uppercase text-text-main">Le Mie Candidature</span>
              <span class="bg-accent text-bg-zero text-[0.6rem] px-1.5 font-tech">
                {{ myApplications.length }}
              </span>
            </div>
            <i :class="['ph text-text-dim transition-transform', showApplications ? 'ph-caret-up' : 'ph-caret-down']"></i>
          </button>

          <div v-if="showApplications" class="border-t border-border-zero p-4 space-y-3 animate-fade-in">
            <div
              v-for="app in myApplications"
              :key="app._id"
              class="p-3 bg-surface-zero border border-border-zero"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-bold text-text-main text-sm">{{ app.role }}</p>
                  <p class="font-tech text-[0.6rem] text-text-dim uppercase">{{ app.bandId?.name }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span
                    :class="[
                      'font-tech text-[0.6rem] uppercase px-2 py-1 border',
                      getApplicationStatusClass(app.myApplicationStatus)
                    ]"
                  >
                    {{ getApplicationStatusLabel(app.myApplicationStatus) }}
                  </span>
                  <button
                    v-if="app.myApplicationStatus === 'pending'"
                    @click="handleWithdrawApplication(app._id)"
                    class="p-1 text-text-dim hover:text-accent transition-colors"
                    title="Ritira"
                  >
                    <i class="ph ph-x"></i>
                  </button>
                </div>
              </div>

              <!-- Invite Code shown when accepted to a member gig -->
              <div
                v-if="app.myApplicationStatus === 'accepted' && app.type === 'member' && app.bandInviteCode"
                class="mt-3 p-3 bg-accent/10 border border-accent/30"
              >
                <p class="font-tech text-[0.6rem] text-accent uppercase mb-2">
                  <i class="ph ph-key mr-1"></i> Codice Invito Band
                </p>
                <div class="flex items-center gap-3">
                  <code class="font-mono text-accent text-lg tracking-wider">{{ app.bandInviteCode }}</code>
                  <button
                    @click="copyInviteCode(app.bandInviteCode)"
                    class="p-1.5 border border-accent/30 text-accent hover:bg-accent hover:text-bg-zero transition-colors"
                    title="Copia codice"
                  >
                    <i class="ph ph-copy text-sm"></i>
                  </button>
                </div>
                <p class="font-tech text-[0.55rem] text-text-dim uppercase mt-2">
                  Usa questo codice per entrare nella band dalla Dashboard
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== I MIEI GIG (Collapsible) ========== -->
        <div v-if="myGigs.length > 0" class="border border-border-zero">
          <button
            @click="showMyGigs = !showMyGigs"
            class="w-full p-4 flex items-center justify-between hover:bg-surface-zero transition-colors"
          >
            <div class="flex items-center gap-3">
              <i class="ph ph-megaphone text-accent"></i>
              <span class="font-tech text-xs uppercase text-text-main">I Miei Gig</span>
              <span class="bg-text-dim text-bg-zero text-[0.6rem] px-1.5 font-tech">
                {{ myGigs.length }}
              </span>
            </div>
            <i :class="['ph text-text-dim transition-transform', showMyGigs ? 'ph-caret-up' : 'ph-caret-down']"></i>
          </button>

          <div v-if="showMyGigs" class="border-t border-border-zero animate-fade-in">
            <div
              v-for="gig in myGigs"
              :key="gig._id"
              class="border-b border-border-zero last:border-b-0"
            >
              <!-- Gig Header -->
              <div class="p-4 flex items-center justify-between">
                <div>
                  <p class="font-bold text-text-main">{{ gig.role }}</p>
                  <p class="font-tech text-[0.6rem] text-text-dim uppercase">
                    {{ gig.bandId?.name }} // {{ gig.applicants?.length || 0 }} candidati
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'font-tech text-[0.6rem] uppercase px-2 py-1 border',
                      gig.status === 'open' ? 'border-accent text-accent' : 'border-text-dim text-text-dim'
                    ]"
                  >
                    {{ gig.status === 'open' ? 'APERTO' : 'CHIUSO' }}
                  </span>
                  <button
                    @click="handleDeleteGig(gig._id)"
                    class="p-1 text-text-dim hover:text-accent transition-colors"
                    title="Elimina"
                  >
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </div>

              <!-- Applicants (if any) -->
              <div v-if="gig.applicants?.length > 0" class="px-4 pb-4 space-y-2">
                <div
                  v-for="applicant in gig.applicants"
                  :key="applicant._id"
                  class="flex items-center justify-between p-2 bg-surface-zero border border-border-zero"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 border border-accent flex items-center justify-center text-accent font-tech text-sm">
                      {{ applicant.userId?.username?.charAt(0).toUpperCase() || '?' }}
                    </div>
                    <span class="font-bold text-text-main text-sm">{{ applicant.userId?.username }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span
                      v-if="applicant.status !== 'pending'"
                      :class="['font-tech text-[0.6rem] uppercase', applicant.status === 'accepted' ? 'text-accent' : 'text-text-dim']"
                    >
                      {{ applicant.status === 'accepted' ? 'OK' : 'NO' }}
                    </span>
                    <template v-else>
                      <button
                        @click="handleRespondToApplicant(gig._id, applicant._id, 'accept')"
                        class="p-1.5 bg-accent text-bg-zero hover:bg-text-main transition-colors"
                      >
                        <i class="ph ph-check text-sm"></i>
                      </button>
                      <button
                        @click="handleRespondToApplicant(gig._id, applicant._id, 'reject')"
                        class="p-1.5 border border-border-zero text-text-dim hover:text-accent hover:border-accent transition-colors"
                      >
                        <i class="ph ph-x text-sm"></i>
                      </button>
                    </template>
                  </div>
                </div>
              </div>
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
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { gigsAPI, bandsAPI } from '@/services/api'
import { useConfirm } from '@/composables/useConfirm'
import { useSocketStore } from '@/stores/socket'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import CreateGigModal from '@/components/CreateGigModal.vue'
import GigDetailModal from '@/components/GigDetailModal.vue'

const router = useRouter()
const { confirm } = useConfirm()
const socketStore = useSocketStore()

// Browse state
const gigs = ref([])
const userBands = ref([])
const loading = ref(true)
const error = ref('')
const showCreateModal = ref(false)
const selectedGig = ref(null)

// Search state
const searchOpen = ref(false)
const searchInputRef = ref(null)

// Collapsible sections state
const showApplications = ref(false)
const showMyGigs = ref(false)

const filters = reactive({
  type: '',
  role: '',
  search: ''
})

// My Applications state
const myApplications = ref([])

// My Gigs state
const myGigs = ref([])

const adminBands = computed(() =>
  userBands.value.filter(b => b.members?.some(m => m.role === 'Admin'))
)

const hasActiveFilters = computed(() =>
  filters.type || filters.role || filters.search
)

// Watch filter changes
watch(() => filters.type, () => loadGigs())

onMounted(async () => {
  await Promise.all([loadGigs(), loadUserBands(), loadMyApplications(), loadMyGigs()])

  // Listen for application status changes via notifications
  if (socketStore.socket) {
    socketStore.socket.on('new_notification', handleNotification)
  }
})

onUnmounted(() => {
  if (socketStore.socket) {
    socketStore.socket.off('new_notification', handleNotification)
  }
})

function handleNotification(notification) {
  if (notification.type === 'application_accepted' || notification.type === 'application_rejected') {
    loadMyApplications()
  }
}

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

async function loadMyApplications() {
  try {
    const res = await gigsAPI.myApplications()
    myApplications.value = res.data
  } catch (err) {
    console.error('Failed to load applications:', err)
  }
}

async function loadMyGigs() {
  try {
    const res = await gigsAPI.myGigs()
    myGigs.value = res.data
  } catch (err) {
    console.error('Failed to load my gigs:', err)
  }
}

function clearFilters() {
  filters.type = ''
  filters.role = ''
  filters.search = ''
  loadGigs()
}

// Search functions
async function openSearch() {
  searchOpen.value = true
  await nextTick()
  searchInputRef.value?.focus()
}

function handleSearchBlur() {
  if (!filters.search) {
    searchOpen.value = false
  }
}

function clearSearch() {
  filters.search = ''
  searchOpen.value = false
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
    // Reload applications
    await loadMyApplications()
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
    // Reload applications
    await loadMyApplications()
    return true
  } catch (err) {
    throw err
  }
}

async function handleWithdrawApplication(gigId) {
  const confirmed = await confirm({
    title: 'Ritira Candidatura',
    message: 'Sei sicuro di voler ritirare questa candidatura?',
    confirmText: 'Ritira',
    cancelText: 'Annulla',
    variant: 'danger'
  })
  if (!confirmed) return

  try {
    await gigsAPI.withdraw(gigId)
    myApplications.value = myApplications.value.filter(a => a._id !== gigId)
    // Also update browse list if visible
    gigs.value = gigs.value.map(g =>
      g._id === gigId ? { ...g, hasApplied: false, applicantCount: Math.max(0, (g.applicantCount || 1) - 1) } : g
    )
  } catch (err) {
    console.error('Failed to withdraw:', err)
  }
}

async function handleRespondToApplicant(gigId, applicantId, action) {
  try {
    const res = await gigsAPI.respond(gigId, applicantId, action)
    // Update local state
    myGigs.value = myGigs.value.map(g => {
      if (g._id === gigId) {
        return { ...g, applicants: res.data.applicants }
      }
      return g
    })
  } catch (err) {
    console.error('Failed to respond:', err)
  }
}

async function handleDeleteGig(gigId) {
  const confirmed = await confirm({
    title: 'Elimina Gig',
    message: 'Sei sicuro di voler eliminare questo gig? Questa azione non puo essere annullata.',
    confirmText: 'Elimina',
    cancelText: 'Annulla',
    variant: 'danger'
  })
  if (!confirmed) return

  try {
    await gigsAPI.delete(gigId)
    myGigs.value = myGigs.value.filter(g => g._id !== gigId)
    gigs.value = gigs.value.filter(g => g._id !== gigId)
  } catch (err) {
    console.error('Failed to delete gig:', err)
  }
}

function handleGigCreated(newGig) {
  gigs.value = [newGig, ...gigs.value]
  myGigs.value = [newGig, ...myGigs.value]
  showCreateModal.value = false
}

function getApplicationStatusClass(status) {
  switch (status) {
    case 'pending': return 'border-text-dim text-text-dim'
    case 'accepted': return 'border-accent text-accent bg-accent-dim'
    case 'rejected': return 'border-accent/50 text-accent/50'
    default: return 'border-text-dim text-text-dim'
  }
}

function getApplicationStatusLabel(status) {
  switch (status) {
    case 'pending': return 'In Attesa'
    case 'accepted': return 'Accettata'
    case 'rejected': return 'Rifiutata'
    default: return status
  }
}

async function copyInviteCode(code) {
  try {
    await navigator.clipboard.writeText(code)
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>
