<template>
  <div class="fixed inset-0 bg-bg-zero/95 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
    <div class="bg-bg-zero border border-border-zero w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-border-zero">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 border border-accent flex items-center justify-center">
            <img
              v-if="gig.bandId?.coverImage"
              :src="gig.bandId.coverImage"
              :alt="gig.bandId.name"
              class="w-full h-full object-cover"
            />
            <i v-else class="ph ph-music-note text-xl text-accent"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-text-main">{{ gig.title }}</h2>
            <p class="font-tech text-[0.6rem] text-text-dim uppercase">{{ gig.bandId?.name }}</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="text-text-dim hover:text-text-main transition-colors"
        >
          <i class="ph ph-x text-xl"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="p-4 space-y-5">
        <!-- Type Badge -->
        <div class="flex items-center justify-between">
          <span class="font-tech text-xs text-text-main border border-border-zero px-2 py-1">
            {{ gig.type === 'member' ? 'BAND_MEMBER' : 'SESSION' }}
          </span>
          <span class="font-tech text-[0.6rem] text-text-dim uppercase">
            {{ gig.applicantCount || 0 }} applicant{{ gig.applicantCount !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div class="border border-border-zero p-3">
            <div class="flex items-center gap-2 font-tech text-[0.6rem] text-accent uppercase mb-1">
              <i class="ph ph-user"></i>
              Role
            </div>
            <p class="text-text-main font-bold text-sm uppercase">{{ gig.role }}</p>
          </div>

          <div v-if="gig.genre" class="border border-border-zero p-3">
            <div class="flex items-center gap-2 font-tech text-[0.6rem] text-accent uppercase mb-1">
              <i class="ph ph-music-note"></i>
              Genre
            </div>
            <p class="text-text-main font-bold text-sm uppercase">{{ gig.genre }}</p>
          </div>

          <div v-if="gig.location" class="border border-border-zero p-3">
            <div class="flex items-center gap-2 font-tech text-[0.6rem] text-accent uppercase mb-1">
              <i class="ph ph-map-pin"></i>
              Location
            </div>
            <p class="text-text-main font-bold text-sm uppercase">{{ gig.location }}</p>
          </div>

          <div v-if="gig.compensation" class="border border-border-zero p-3">
            <div class="flex items-center gap-2 font-tech text-[0.6rem] text-accent uppercase mb-1">
              <i class="ph ph-currency-circle-dollar"></i>
              Compensation
            </div>
            <p class="text-text-main font-bold text-sm uppercase">{{ gig.compensation }}</p>
          </div>
        </div>

        <!-- Description -->
        <div v-if="gig.description" class="border border-border-zero p-4">
          <h3 class="font-tech text-xs text-accent uppercase mb-2">Description</h3>
          <p class="text-text-dim text-sm whitespace-pre-wrap leading-relaxed">{{ gig.description }}</p>
        </div>

        <!-- Requirements -->
        <div v-if="gig.requirements?.length > 0" class="border border-border-zero p-4">
          <h3 class="font-tech text-xs text-accent uppercase mb-3">Requirements</h3>
          <ul class="space-y-2">
            <li v-for="(req, i) in gig.requirements" :key="i" class="flex items-start gap-2 text-text-dim text-sm">
              <i class="ph ph-check text-accent mt-0.5 flex-shrink-0"></i>
              {{ req }}
            </li>
          </ul>
        </div>

        <!-- Meta -->
        <div class="flex items-center gap-4 font-tech text-[0.6rem] text-text-dim uppercase">
          <span class="flex items-center gap-1">
            <i class="ph ph-clock"></i>
            Posted {{ formatDate(gig.createdAt) }}
          </span>
        </div>

        <div v-if="error" class="border border-accent/50 p-3 font-tech text-sm text-text-main">
          {{ error }}
        </div>

        <!-- Apply Form -->
        <form v-if="showApplyForm && !gig.hasApplied" @submit.prevent="handleApply" class="space-y-4">
          <div>
            <label class="font-tech text-xs text-accent uppercase block mb-1">Message (optional)</label>
            <textarea
              v-model="message"
              placeholder="Introduce yourself and why you're interested..."
              rows="3"
              maxlength="500"
              class="input-zero font-tech text-sm resize-none"
            />
          </div>
          <div class="flex gap-3">
            <button
              type="button"
              @click="showApplyForm = false"
              class="flex-1 px-4 py-3 border border-border-zero font-tech text-xs uppercase text-text-dim hover:text-text-main hover:border-text-dim transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="applying"
              class="flex-1 py-3 bg-surface-zero border border-border-zero font-tech text-sm uppercase text-text-main hover:bg-text-main hover:text-bg-zero hover:border-text-main transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="applying" class="animate-pulse">Sending...</span>
              <template v-else>
                <i class="ph ph-paper-plane-right"></i>
                Submit
              </template>
            </button>
          </div>
        </form>

        <!-- Action Buttons -->
        <div v-if="!showApplyForm" class="flex gap-3 pt-2">
          <button
            v-if="gig.hasApplied"
            @click="handleWithdraw"
            :disabled="withdrawing"
            class="flex-1 py-3 border border-accent/50 bg-accent-dim font-tech text-sm uppercase text-accent hover:bg-accent hover:text-bg-zero transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="withdrawing" class="animate-pulse">...</span>
            <template v-else>
              <i class="ph ph-check"></i>
              Applied - Withdraw
            </template>
          </button>
          <button
            v-else
            @click="showApplyForm = true"
            class="flex-1 py-3 bg-surface-zero border border-border-zero font-tech text-sm uppercase text-text-main hover:bg-text-main hover:text-bg-zero hover:border-text-main transition-colors flex items-center justify-center gap-2"
          >
            <i class="ph ph-paper-plane-right"></i>
            Apply_Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  gig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'apply', 'withdraw'])

const applying = ref(false)
const withdrawing = ref(false)
const message = ref('')
const showApplyForm = ref(false)
const error = ref('')

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function handleApply() {
  applying.value = true
  error.value = ''

  try {
    await emit('apply', props.gig._id, message.value)
    showApplyForm.value = false
    message.value = ''
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to apply'
  } finally {
    applying.value = false
  }
}

async function handleWithdraw() {
  if (!window.confirm('Are you sure you want to withdraw your application?')) return

  withdrawing.value = true
  try {
    await emit('withdraw', props.gig._id)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to withdraw'
  } finally {
    withdrawing.value = false
  }
}
</script>
