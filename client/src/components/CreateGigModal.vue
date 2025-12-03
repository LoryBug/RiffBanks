<template>
  <div class="fixed inset-0 bg-bg-zero/95 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
    <div class="bg-bg-zero border border-border-zero w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-border-zero">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 border border-accent flex items-center justify-center">
            <i class="ph ph-briefcase text-xl text-accent"></i>
          </div>
          <h2 class="text-lg font-bold text-text-main">Post_Gig</h2>
        </div>
        <button
          @click="$emit('close')"
          class="text-text-dim hover:text-text-main transition-colors"
        >
          <i class="ph ph-x text-xl"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-4 space-y-5">
        <!-- Band Selection -->
        <div>
          <label class="font-tech text-xs text-accent uppercase block mb-1">Unit *</label>
          <select
            v-model="formData.bandId"
            class="input-zero font-tech text-sm uppercase"
            required
          >
            <option v-for="band in bands" :key="band._id" :value="band._id">
              {{ band.name }}
            </option>
          </select>
        </div>

        <!-- Title -->
        <div>
          <label class="font-tech text-xs text-accent uppercase block mb-1">Gig_Title *</label>
          <input
            v-model="formData.title"
            type="text"
            placeholder="LEAD GUITARIST NEEDED"
            class="input-zero font-tech text-sm uppercase"
            required
          />
        </div>

        <!-- Type Selection -->
        <div>
          <label class="font-tech text-xs text-accent uppercase block mb-2">Type *</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="type in GIG_TYPES"
              :key="type.value"
              type="button"
              @click="formData.type = type.value"
              :class="[
                'p-3 border text-left transition-colors',
                formData.type === type.value
                  ? 'border-accent bg-accent-dim'
                  : 'border-border-zero hover:border-text-dim'
              ]"
            >
              <div class="flex items-center gap-2 mb-1">
                <i :class="['ph', type.value === 'member' ? 'ph-users' : 'ph-music-note', 'text-accent']"></i>
                <span class="text-text-main font-tech text-xs uppercase">{{ type.label }}</span>
              </div>
              <p class="font-tech text-[0.6rem] text-text-dim uppercase">{{ type.desc }}</p>
            </button>
          </div>
        </div>

        <!-- Role -->
        <div>
          <label class="font-tech text-xs text-accent uppercase block mb-1">Role *</label>
          <select
            v-model="formData.role"
            class="input-zero font-tech text-sm uppercase"
            required
          >
            <option value="">SELECT_ROLE</option>
            <option v-for="role in COMMON_ROLES" :key="role" :value="role">{{ role }}</option>
          </select>
          <input
            v-if="formData.role === 'Other'"
            v-model="formData.customRole"
            type="text"
            placeholder="SPECIFY_ROLE"
            class="input-zero font-tech text-sm uppercase mt-2"
            required
          />
        </div>

        <!-- Genre & Location -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="font-tech text-xs text-accent uppercase block mb-1">Genre</label>
            <input
              v-model="formData.genre"
              type="text"
              placeholder="ROCK, JAZZ..."
              class="input-zero font-tech text-sm uppercase"
            />
          </div>
          <div>
            <label class="font-tech text-xs text-accent uppercase block mb-1">Location</label>
            <input
              v-model="formData.location"
              type="text"
              placeholder="CITY, REMOTE..."
              class="input-zero font-tech text-sm uppercase"
            />
          </div>
        </div>

        <!-- Compensation -->
        <div>
          <label class="font-tech text-xs text-accent uppercase block mb-1">Compensation</label>
          <input
            v-model="formData.compensation"
            type="text"
            placeholder="REVENUE SHARE, $200/GIG, UNPAID"
            class="input-zero font-tech text-sm uppercase"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="font-tech text-xs text-accent uppercase block mb-1">Description</label>
          <textarea
            v-model="formData.description"
            placeholder="Describe the opportunity..."
            rows="4"
            class="input-zero font-tech text-sm resize-none"
          />
        </div>

        <div v-if="error" class="border border-accent/50 p-3 font-tech text-sm text-text-main">
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-3 border border-border-zero font-tech text-xs uppercase text-text-dim hover:text-text-main hover:border-text-dim transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 py-3 bg-surface-zero border border-border-zero font-tech text-sm uppercase text-text-main hover:bg-text-main hover:text-bg-zero hover:border-text-main transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="animate-pulse">Posting...</span>
            <template v-else>Post_Gig</template>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { gigsAPI } from '@/services/api'

const props = defineProps({
  bands: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'created'])

const GIG_TYPES = [
  { value: 'member', label: 'Band Member', desc: 'Permanent position' },
  { value: 'session', label: 'Session', desc: 'Project or gig' }
]

const COMMON_ROLES = [
  'Guitarist', 'Bassist', 'Drummer', 'Vocalist', 'Keyboardist',
  'Saxophonist', 'Violinist', 'Cellist', 'Trumpet', 'Producer',
  'Sound Engineer', 'DJ', 'Percussionist', 'Other'
]

const loading = ref(false)
const error = ref('')

const formData = reactive({
  bandId: props.bands[0]?._id || '',
  title: '',
  type: 'member',
  role: '',
  customRole: '',
  genre: '',
  location: '',
  compensation: '',
  description: ''
})

async function handleSubmit() {
  const role = formData.role === 'Other' ? formData.customRole : formData.role

  if (!formData.bandId || !formData.title || !role) {
    error.value = 'Please fill in all required fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await gigsAPI.create({
      bandId: formData.bandId,
      title: formData.title,
      type: formData.type,
      role,
      genre: formData.genre,
      location: formData.location,
      compensation: formData.compensation,
      description: formData.description
    })

    emit('created', res.data)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create gig'
  } finally {
    loading.value = false
  }
}
</script>
