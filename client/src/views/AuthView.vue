<template>
  <div class="min-h-screen bg-black flex items-center justify-center relative overflow-hidden p-6 font-sans">
    <!-- Animated Background Blobs -->
    <div class="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-600/30 blur-[120px] rounded-full animate-pulse-slow"></div>
    <div
      class="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/20 blur-[100px] rounded-full animate-pulse-slow"
      style="animation-delay: 2s"
    ></div>

    <!-- Form Container -->
    <div class="w-full max-w-md bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800 p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 animate-float">
          <Music :size="40" class="text-white drop-shadow-md" />
        </div>
        <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight">
          RiffBank
        </h1>
        <p class="text-zinc-500 text-sm mt-2 font-medium">
          {{ isLogin ? 'Bentornato, Maestro.' : 'Inizia il tuo viaggio sonoro.' }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!isLogin" class="relative group">
          <label for="username" class="sr-only">Nome Artista</label>
          <User
            class="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors"
            :size="20"
            aria-hidden="true"
          />
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="Nome Artista"
            aria-label="Nome Artista"
            class="w-full bg-black/50 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            :required="!isLogin"
          />
        </div>

        <div class="relative group">
          <label for="email" class="sr-only">Indirizzo Email</label>
          <Mail
            class="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors"
            :size="20"
            aria-hidden="true"
          />
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="email@example.com"
            aria-label="Indirizzo Email"
            class="w-full bg-black/50 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            required
          />
        </div>

        <div class="relative group">
          <label for="password" class="sr-only">Password (minimo 6 caratteri)</label>
          <Lock
            class="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors"
            :size="20"
            aria-hidden="true"
          />
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="Password (min 6 caratteri)"
            aria-label="Password, minimo 6 caratteri"
            class="w-full bg-black/50 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            required
            minlength="6"
          />
        </div>

        <div v-if="error" role="alert" class="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-zinc-300 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          :aria-label="loading ? (isLogin ? 'Accesso in corso' : 'Creazione account in corso') : (isLogin ? 'Accedi' : 'Crea Account')"
          class="w-full min-h-[56px] py-4 mt-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/10 flex items-center justify-center gap-2 group"
        >
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" aria-hidden="true" />
          <template v-else>
            <span>{{ isLogin ? 'Accedi' : 'Crea Account' }}</span>
            <ArrowRight
              :size="20"
              class="group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </template>
        </button>
      </form>

      <!-- Toggle Mode -->
      <div class="mt-6 text-center">
        <p class="text-zinc-500 text-sm">
          {{ isLogin ? 'Non hai un account?' : 'Hai già un account?' }}
          <button
            @click="toggleMode"
            class="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
          >
            {{ isLogin ? 'Registrati' : 'Accedi' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Music, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-vue-next'
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
