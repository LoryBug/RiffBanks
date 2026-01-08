<template>
  <div class="min-h-screen bg-bg-zero flex flex-col items-center justify-center p-8">
    <!-- Form Container -->
    <div class="w-full max-w-sm animate-fade-in">
      <!-- Branding -->
      <div class="mb-12 border-l-2 border-accent pl-6">
        <h1 class="text-5xl font-bold tracking-tighter mb-2 text-text-main">
          RIFF<span class="text-accent">BANKS</span>
        </h1>
        <p class="font-tech text-xs text-text-dim uppercase tracking-[0.2em]">
          Zero_OS // v.3.0
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <div v-if="!isLogin">
          <label class="font-tech text-xs text-accent uppercase block mb-1">Identity</label>
          <input
            v-model="formData.username"
            type="text"
            placeholder="USR_ID"
            aria-label="Nome Artista"
            class="input-zero text-lg font-tech uppercase"
            :required="!isLogin"
          />
        </div>

        <div>
          <label class="font-tech text-xs text-accent uppercase block mb-1">
            {{ isLogin ? 'Identity' : 'Email' }}
          </label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="USR@DOMAIN.COM"
            aria-label="Indirizzo Email"
            class="input-zero text-lg font-tech uppercase"
            required
          />
        </div>

        <div>
          <label class="font-tech text-xs text-accent uppercase block mb-1">Key</label>
          <input
            v-model="formData.password"
            type="password"
            placeholder="********"
            aria-label="Password, minimo 6 caratteri"
            class="input-zero text-lg font-tech"
            required
            minlength="6"
          />
        </div>

        <div v-if="error" role="alert" class="border border-accent/50 p-3 text-text-main text-sm font-tech">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          :aria-label="loading ? (isLogin ? 'Accesso in corso' : 'Creazione account in corso') : (isLogin ? 'Accedi' : 'Crea Account')"
          class="w-full py-4 bg-surface-zero border border-border-zero text-sm font-tech font-bold uppercase tracking-widest text-text-main hover:bg-text-main hover:text-bg-zero hover:border-text-main transition-colors duration-300 flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="animate-pulse">PROCESSING...</span>
          <template v-else>
            {{ isLogin ? 'Connect_System' : 'Init_Account' }}
          </template>
        </button>
      </form>

      <!-- Toggle Mode -->
      <div class="mt-8 text-center">
        <button
          @click="toggleMode"
          class="font-tech text-xs text-text-dim uppercase hover:text-accent transition-colors"
        >
          {{ isLogin ? '[ New_User? Init_Account ]' : '[ Existing_User? Connect ]' }}
        </button>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-center">
        <p class="font-tech text-[0.6rem] text-text-dim">SECURE CONNECTION ESTABLISHED</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')
const formData = reactive({
  username: '',
  email: '',
  password: ''
})

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = ''
  formData.username = ''
  formData.email = ''
  formData.password = ''
}

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    if (isLogin.value) {
      await authStore.login(formData.email, formData.password)
    } else {
      await authStore.register(formData.username, formData.email, formData.password)
    }

    if (authStore.needsOnboarding) {
      router.push({ name: 'onboarding' })
    } else {
      router.push({ name: 'dashboard' })
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
