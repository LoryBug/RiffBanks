<template>
  <div
    @click="$emit('click')"
    class="relative pl-6 border-l border-border-zero hover:border-accent transition-colors group cursor-pointer"
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

    <p v-if="gig.description" class="text-sm text-text-dim mb-3 leading-relaxed line-clamp-2">
      {{ gig.description }}
    </p>

    <!-- Details -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 font-tech text-[0.6rem] text-text-dim uppercase">
      <span v-if="gig.genre"><i class="ph ph-music-note"></i> {{ gig.genre }}</span>
      <span v-if="gig.location"><i class="ph ph-map-pin"></i> {{ gig.location }}</span>
      <span v-if="gig.compensation"><i class="ph ph-currency-circle-dollar"></i> {{ gig.compensation }}</span>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-3 border-t border-border-zero">
      <div class="flex items-center gap-4 font-tech text-[0.6rem] text-text-dim uppercase">
        <span>{{ gig.bandName || gig.bandId?.name || 'Unknown' }}</span>
        <span>{{ gig.applicantCount || 0 }} applicants</span>
        <span>{{ timeAgo(gig.createdAt) }}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="gig.hasApplied"
          @click.stop="handleWithdraw"
          :disabled="withdrawing"
          class="font-tech text-xs text-accent uppercase flex items-center gap-1"
        >
          <span v-if="withdrawing" class="animate-pulse">...</span>
          <template v-else>
            <i class="ph ph-check"></i> Applied
          </template>
        </button>
        <button
          v-else
          @click.stop="handleQuickApply"
          :disabled="applying"
          class="font-tech text-xs font-bold uppercase flex items-center gap-2 hover:gap-3 transition-all text-text-main"
        >
          <span v-if="applying" class="animate-pulse">...</span>
          <template v-else>
            Connect <i class="ph-bold ph-arrow-right"></i>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  gig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'apply', 'withdraw'])

const applying = ref(false)
const withdrawing = ref(false)

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'w', seconds: 604800 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 }
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count}${interval.label} ago`
    }
  }
  return 'now'
}

async function handleQuickApply() {
  applying.value = true
  try {
    await emit('apply', props.gig._id, '')
  } catch (err) {
    console.error('Apply error:', err)
  } finally {
    applying.value = false
  }
}

async function handleWithdraw() {
  if (!window.confirm('Withdraw your application?')) return

  withdrawing.value = true
  try {
    await emit('withdraw', props.gig._id)
  } catch (err) {
    console.error('Withdraw error:', err)
  } finally {
    withdrawing.value = false
  }
}
</script>
