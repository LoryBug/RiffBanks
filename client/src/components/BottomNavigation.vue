<template>
  <nav class="fixed bottom-0 left-0 w-full h-20 bg-bg-zero/95 backdrop-blur border-t border-border-zero z-40 pb-safe">
    <div class="container-zero h-full flex items-center justify-around">
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="handleNavClick(item.id)"
        class="flex flex-col items-center justify-center flex-1 h-full gap-1.5 group btn-press"
        :aria-label="item.label"
        :aria-current="currentView === item.id ? 'page' : undefined"
      >
        <!-- Icon -->
        <i
          :class="[
            item.icon,
            'text-xl transition-all duration-300',
            currentView === item.id
              ? 'text-accent scale-110'
              : 'text-text-dim group-hover:text-text-main'
          ]"
        ></i>

        <!-- Label -->
        <span
          class="font-tech text-[0.55rem] uppercase tracking-widest transition-colors duration-300"
          :class="currentView === item.id ? 'text-text-main' : 'text-text-dim group-hover:text-text-main'"
        >
          {{ item.mobileLabel }}
        </span>

        <!-- Active indicator dot -->
        <div
          class="w-1 h-1 rounded-full transition-all duration-300"
          :class="currentView === item.id ? 'bg-accent' : 'bg-transparent'"
        ></div>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  { id: 'dashboard', label: 'Console', mobileLabel: 'Console', route: 'dashboard', icon: 'ph ph-terminal' },
  { id: 'gigs', label: 'Gig_Net', mobileLabel: 'Network', route: 'gigs', icon: 'ph ph-broadcast' },
  { id: 'profile', label: 'Profile', mobileLabel: 'Profile', route: 'profile', icon: 'ph ph-user' },
]

const currentView = computed(() => {
  if (route.name === 'gigs') return 'gigs'
  if (route.name === 'profile') return 'profile'
  return 'dashboard'
})

function handleNavClick(viewId) {
  router.push({ name: viewId })
}
</script>
