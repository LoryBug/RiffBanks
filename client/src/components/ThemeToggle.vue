<template>
  <button
    @click="toggleTheme"
    class="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-zero transition-colors text-text-dim hover:text-text-main"
    :aria-label="isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'"
  >
    <i class="ph-bold text-lg" :class="isDark ? 'ph-sun' : 'ph-moon'"></i>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(true)

onMounted(() => {
  // Check if light theme was previously set
  const savedTheme = localStorage.getItem('riffbank-theme')
  if (savedTheme === 'light') {
    isDark.value = false
    document.body.classList.add('light-theme')
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.body.classList.remove('light-theme')
    localStorage.setItem('riffbank-theme', 'dark')
  } else {
    document.body.classList.add('light-theme')
    localStorage.setItem('riffbank-theme', 'light')
  }
}
</script>
