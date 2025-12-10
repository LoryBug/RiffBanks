import { ref, reactive } from 'vue'

const state = reactive({
  isOpen: false,
  title: 'Conferma',
  message: 'Sei sicuro di voler procedere?',
  confirmText: 'Conferma',
  cancelText: 'Annulla',
  variant: 'danger',
  icon: '',
  resolve: null
})

export function useConfirm() {
  function confirm(options = {}) {
    return new Promise((resolve) => {
      state.isOpen = true
      state.title = options.title || 'Conferma'
      state.message = options.message || 'Sei sicuro di voler procedere?'
      state.confirmText = options.confirmText || 'Conferma'
      state.cancelText = options.cancelText || 'Annulla'
      state.variant = options.variant || 'danger'
      state.icon = options.icon || ''
      state.resolve = resolve
    })
  }

  function handleConfirm() {
    state.isOpen = false
    if (state.resolve) {
      state.resolve(true)
      state.resolve = null
    }
  }

  function handleCancel() {
    state.isOpen = false
    if (state.resolve) {
      state.resolve(false)
      state.resolve = null
    }
  }

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel
  }
}
