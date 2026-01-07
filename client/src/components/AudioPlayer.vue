<template>
  <div class="flex items-center gap-3 p-3 border border-border-zero bg-surface-zero">
    <audio
      ref="audioRef"
      :src="url"
      @timeupdate="currentTime = $event.target.currentTime"
      @loadedmetadata="duration = $event.target.duration"
      @ended="playing = false"
    />
    <button
      @click="togglePlay"
      class="w-10 h-10 border border-accent flex items-center justify-center text-accent hover:bg-accent hover:text-bg-zero transition-colors"
    >
      <i v-if="playing" class="ph ph-pause text-lg"></i>
      <i v-else class="ph ph-play text-lg ml-0.5"></i>
    </button>
    <div class="flex-1 min-w-0">
      <div class="text-sm text-text-main font-bold truncate uppercase">{{ title }}</div>
      <div class="font-tech text-[0.6rem] text-text-dim">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})

const audioRef = ref(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)

function togglePlay() {
  if (playing.value) {
    audioRef.value?.pause()
  } else {
    audioRef.value?.play()
  }
  playing.value = !playing.value
}

function formatTime(time) {
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>
