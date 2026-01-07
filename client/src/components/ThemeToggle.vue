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
  const savedTheme = localStorage.getItem('riffbanks-theme')
  // Se era salvato light, applichiamo la classe e aggiorniamo lo stato
  if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.add('light-theme') // <--- CAMBIATO QUI
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
  
  if (isDark.value) {
    // Torna a Dark (Rimuovi la classe light)
    document.documentElement.classList.remove('light-theme') // <--- CAMBIATO QUI
    localStorage.setItem('riffbanks-theme', 'dark')
  } else {
    // Passa a Light (Aggiungi la classe light)
    document.documentElement.classList.add('light-theme') // <--- CAMBIATO QUI
    localStorage.setItem('riffbanks-theme', 'light')
  }
}
</script>