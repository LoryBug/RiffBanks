<template>
  <!-- System message -->
  <div v-if="message.type === 'system'" class="flex justify-center my-2">
    <div class="border border-border-zero text-text-dim font-tech text-[0.6rem] uppercase px-3 py-1 flex items-center gap-2">
      <i class="ph ph-upload-simple"></i>
      <span>{{ message.text }}</span>
    </div>
  </div>

  <!-- User message -->
  <div v-else :class="['flex mb-3', isOwn ? 'justify-end' : 'justify-start']">
    <div :class="['max-w-[75%]', isOwn ? 'order-2' : 'order-1']">
      <div v-if="!isOwn" class="font-tech text-[0.6rem] text-accent uppercase mb-1 ml-1">
        {{ message.username }}
      </div>
      <div
        :class="[
          'px-4 py-2 border',
          isOwn
            ? 'bg-accent-dim border-accent/30 text-text-main'
            : 'bg-surface-zero border-border-zero text-text-main'
        ]"
      >
        <p class="text-sm whitespace-pre-wrap break-words">{{ message.text }}</p>
      </div>
      <div :class="['font-tech text-[0.6rem] text-text-dim mt-1', isOwn ? 'text-right mr-1' : 'ml-1']">
        {{ formatTime(message.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: Object,
    required: true
  },
  isOwn: {
    type: Boolean,
    default: false
  }
})

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>
