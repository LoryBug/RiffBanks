<template>
  <div class="flex flex-col items-center justify-center gap-3">
    <div class="relative w-8 h-8">
      <div class="absolute inset-0 border border-border-zero animate-pulse"></div>
      <div class="absolute inset-1 border border-accent animate-pulse" style="animation-delay: 0.2s"></div>
    </div>
    <p class="font-tech text-[0.6rem] text-text-dim uppercase tracking-widest">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Loading...'
  }
})
</script>
