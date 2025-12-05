<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="handleCancel"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-sm bg-bg-zero border border-border-zero animate-fade-in">
          <!-- Header -->
          <div class="p-4 border-b border-border-zero">
            <div class="flex items-center gap-3">
              <i :class="[iconClass, 'text-xl']"></i>
              <h3 class="font-tech text-sm uppercase text-text-main">{{ title }}</h3>
            </div>
          </div>

          <!-- Body -->
          <div class="p-4">
            <p class="text-sm text-text-dim">{{ message }}</p>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-border-zero flex gap-3 justify-end">
            <button
              @click="handleCancel"
              class="px-4 py-2 border border-border-zero font-tech text-xs uppercase text-text-dim hover:text-text-main hover:border-text-dim transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              :class="[
                'px-4 py-2 font-tech text-xs uppercase transition-colors',
                variant === 'danger'
                  ? 'bg-accent text-bg-zero hover:bg-text-main'
                  : 'bg-text-main text-bg-zero hover:bg-accent'
              ]"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Conferma'
  },
  message: {
    type: String,
    default: 'Sei sicuro di voler procedere?'
  },
  confirmText: {
    type: String,
    default: 'Conferma'
  },
  cancelText: {
    type: String,
    default: 'Annulla'
  },
  variant: {
    type: String,
    default: 'danger', // 'danger' | 'default'
    validator: (v) => ['danger', 'default'].includes(v)
  },
  icon: {
    type: String,
    default: '' // Optional custom icon class
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const iconClass = computed(() => {
  if (props.icon) return props.icon
  return props.variant === 'danger'
    ? 'ph ph-warning text-accent'
    : 'ph ph-question text-text-main'
})

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
