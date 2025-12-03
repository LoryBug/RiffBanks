<template>
  <div v-if="typingUsers.length > 0" class="flex items-center gap-2 text-text-dim font-tech text-[0.6rem] uppercase mb-2" role="status" aria-live="polite">
    <div class="flex gap-1" aria-hidden="true">
      <span class="w-1.5 h-1.5 bg-accent animate-bounce" style="animation-delay: 0ms" />
      <span class="w-1.5 h-1.5 bg-accent animate-bounce" style="animation-delay: 150ms" />
      <span class="w-1.5 h-1.5 bg-accent animate-bounce" style="animation-delay: 300ms" />
    </div>
    <span>{{ message }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  typingUsers: {
    type: Array,
    default: () => []
  }
})

const message = computed(() => {
  if (props.typingUsers.length === 1) {
    return 'Someone is typing...'
  }
  return `${props.typingUsers.length} people are typing...`
})
</script>
