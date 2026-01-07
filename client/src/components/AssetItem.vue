<template>
  <div class="border border-border-zero p-4 hover:border-text-dim transition-colors">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <i v-if="asset.type === 'audio'" class="ph ph-file-audio text-accent"></i>
        <i v-else-if="asset.type === 'image'" class="ph ph-image text-accent"></i>
        <i v-else class="ph ph-file-text text-accent"></i>
        <span class="font-tech text-xs text-text-dim uppercase">{{ asset.authorName }}</span>
      </div>
      <span class="font-tech text-[0.6rem] text-text-dim">
        {{ new Date(asset.createdAt).toLocaleDateString('it-IT') }}
      </span>
    </div>

    <!-- Content based on type -->
    <AudioPlayer v-if="asset.type === 'audio'" :url="asset.url" :title="asset.title" />

    <img
      v-else-if="asset.type === 'image'"
      :src="asset.url"
      :alt="asset.title"
      class="w-full max-h-64 object-cover border border-border-zero"
    />

    <div
      v-else-if="asset.type === 'text'"
      class="bg-surface-zero border border-border-zero p-3 text-sm text-text-dim whitespace-pre-wrap max-h-48 overflow-y-auto"
    >
      {{ asset.content }}
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between mt-3 pt-3 border-t border-border-zero">
      <button
        @click="handleVote"
        :disabled="voting"
        :class="[
          'flex items-center gap-2 px-3 py-1.5 font-tech text-xs uppercase transition-all border',
          asset.votedByMe
            ? 'bg-accent-dim text-accent border-accent/30'
            : 'bg-surface-zero text-text-dim border-border-zero hover:text-text-main hover:border-text-dim'
        ]"
      >
        <i :class="['ph', asset.votedByMe ? 'ph-fill ph-heart' : 'ph ph-heart']"></i>
        <span>{{ asset.voteCount || asset.votes?.length || 0 }}</span>
      </button>

      <button
        v-if="canDelete"
        @click="$emit('delete', asset._id)"
        class="p-2 text-text-dim hover:text-accent transition-colors"
      >
        <i class="ph ph-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AudioPlayer from './AudioPlayer.vue'

const props = defineProps({
  asset: {
    type: Object,
    required: true
  },
  canDelete: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['vote', 'delete'])

const voting = ref(false)

async function handleVote() {
  voting.value = true
  try {
    await emit('vote', props.asset._id)
  } finally {
    voting.value = false
  }
}
</script>
