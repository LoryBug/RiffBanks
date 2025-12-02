<template>
  <nav class="fixed bottom-0 left-0 w-full h-20 bg-bg-zero/95 backdrop-blur border-t border-border-zero z-40 pb-safe">
    <div class="container-zero h-full flex items-center justify-around">
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="handleNavClick(item.id)"
        class="flex flex-col items-center justify-center flex-1 h-full gap-2 group"
        :aria-label="item.label"
        :aria-current="currentView === item.id ? 'page' : undefined"
      >
        <!-- Line indicator -->
        <div
          class="w-8 h-[1px] mb-1 transition-colors duration-300"
          :class="currentView === item.id ? 'bg-accent' : 'bg-transparent group-hover:bg-border-zero'"
        ></div>

        <span
          class="font-tech text-[0.6rem] uppercase tracking-widest transition-colors duration-300"
          :class="currentView === item.id ? 'text-text-main' : 'text-text-dim group-hover:text-text-main'"
        >
          {{ item.mobileLabel }}
        </span>
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
  { id: 'dashboard', label: 'Console', mobileLabel: 'Console', route: 'dashboard' },
  { id: 'gigs', label: 'Gig_Net', mobileLabel: 'Network', route: 'gigs' },
]

const currentView = computed(() => {
  if (route.name === 'gigs') return 'gigs'
  return 'dashboard'
})

function handleNavClick(viewId) {
  if (viewId === 'gigs') {
    router.push({ name: 'gigs' })
  } else {
    router.push({ name: 'dashboard' })
  }
}
</script>
