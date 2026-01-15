<template>
  <div class="h-screen bg-bg-zero text-text-main overflow-y-scroll snap-y snap-mandatory">
    <!-- Scanlines Overlay -->
    <ScanlineOverlay />

    <!-- Top Navigation (minimal) -->
    <header class="fixed top-0 left-0 w-full h-16 bg-bg-zero/90 backdrop-blur-md border-b border-border-zero z-50">
      <div class="container-zero h-full flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 bg-accent"></div>
          <span class="font-bold text-xl tracking-tight">RiffBanks</span>
        </div>

        <!-- Login Button -->
        <div class="flex items-center gap-4">
          <ThemeToggle />
          <button
            @click="router.push({ name: 'auth' })"
            class="px-4 py-2 border border-accent text-accent font-tech text-xs uppercase hover:bg-accent hover:text-bg-zero transition-all btn-press hover-glow cursor-pointer"
          >
            Login
          </button>
        </div>
      </div>
    </header>

    <!-- Sidebar Navigation (Desktop) -->
    <nav class="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-1">
      <!-- Progress Line -->
      <div class="absolute left-[7px] top-4 bottom-4 w-px bg-border-zero">
        <div
          class="w-full bg-accent transition-all duration-300"
          :style="{ height: progressHeight + '%' }"
        ></div>
      </div>

      <!-- Section Items -->
      <a
        v-for="(section, index) in sections"
        :key="section.id"
        @click.prevent="scrollToSection(section.id)"
        class="flex items-center gap-3 py-2 cursor-pointer group relative"
      >
        <!-- Dot Indicator -->
        <div
          class="w-[15px] h-[15px] border-2 transition-all duration-300 flex items-center justify-center z-10"
          :class="activeSection === section.id
            ? 'border-accent bg-accent'
            : sectionIndex >= index
              ? 'border-accent bg-bg-zero'
              : 'border-border-zero bg-bg-zero group-hover:border-text-dim'"
        >
          <div
            v-if="activeSection === section.id"
            class="w-1.5 h-1.5 bg-bg-zero"
          ></div>
        </div>

        <!-- Label -->
        <span
          class="font-tech text-[0.65rem] uppercase tracking-widest transition-all duration-300 whitespace-nowrap"
          :class="activeSection === section.id
            ? 'text-accent translate-x-1'
            : 'text-text-dim group-hover:text-text-main'"
        >
          {{ section.label }}
        </span>

        <!-- Section Number -->
        <span
          v-if="activeSection === section.id"
          class="font-tech text-[0.5rem] text-accent ml-auto"
        >
          {{ String(index + 1).padStart(2, '0') }}/{{ String(sections.length).padStart(2, '0') }}
        </span>
      </a>
    </nav>

    <!-- Mobile Section Indicator -->
    <div class="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-bg-zero/95 backdrop-blur border border-border-zero px-4 py-2 flex items-center gap-3">
      <span class="font-tech text-[0.6rem] text-accent">
        {{ String(sectionIndex + 1).padStart(2, '0') }}/{{ String(sections.length).padStart(2, '0') }}
      </span>
      <span class="font-tech text-[0.65rem] text-text-main uppercase">
        {{ sections[sectionIndex]?.label }}
      </span>
      <!-- Mini progress bar -->
      <div class="w-16 h-1 bg-border-zero">
        <div
          class="h-full bg-accent transition-all duration-300"
          :style="{ width: progressHeight + '%' }"
        ></div>
      </div>
    </div>

    <!-- Sections Container -->
    <main>
      <!-- Hero Section -->
      <section
        id="hero"
        class="h-screen flex items-center justify-center pt-16 relative snap-start snap-always"
      >
        <div class="container-zero text-center">
          <div class="mb-8 animate-fade-in">
            <span class="font-tech text-xs text-accent uppercase tracking-[0.3em] mb-4 block">
              Applicazioni e Servizi Web
            </span>
            <h1 class="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              Riff<span class="text-accent">Banks</span>
            </h1>
            <p class="font-tech text-sm text-text-dim max-w-xl mx-auto">
              Piattaforma collaborativa per musicisti: gestione progetti, comunicazione real-time e recruiting
            </p>
          </div>

          <div class="flex flex-col md:flex-row items-center justify-center gap-4 mt-12">
            <button
              @click="router.push({ name: 'auth' })"
              class="px-8 py-4 bg-accent text-bg-zero font-tech text-sm uppercase tracking-wider hover:shadow-glow transition-all btn-press cursor-pointer"
            >
              Inizia Ora
            </button>
            <button
              @click="scrollToSection('problema')"
              class="px-8 py-4 border border-border-zero text-text-main font-tech text-sm uppercase tracking-wider hover:border-accent transition-all btn-press cursor-pointer"
            >
              Scopri di Piu
            </button>
          </div>

          <!-- Author Info -->
          <div class="mt-16 pt-8 border-t border-border-zero inline-block">
            <p class="font-tech text-xs text-text-dim">
              Lorenzo Leoni - 0001192033 // A.A. 2025/2026
            </p>
          </div>

          <!-- Scroll Indicator -->
          <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
            <i class="ph ph-caret-down text-2xl text-text-dim"></i>
          </div>
        </div>
      </section>

      <!-- Problema Section -->
      <section
        id="problema"
        class="h-screen flex items-center py-20 border-t border-border-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">01 // Il Problema</span>
              <h2 class="text-4xl font-bold mb-6">La frammentazione degli strumenti</h2>
              <p class="text-text-dim leading-relaxed mb-6">
                Nel panorama musicale contemporaneo, i musicisti si trovano quotidianamente ad affrontare
                una sfida organizzativa significativa: la gestione della collaborazione attraverso
                strumenti frammentati e disconnessi tra loro.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start gap-3">
                  <i class="ph ph-chat-circle text-accent mt-1"></i>
                  <span class="text-text-dim">Conversazioni su WhatsApp o Telegram</span>
                </li>
                <li class="flex items-start gap-3">
                  <i class="ph ph-cloud text-accent mt-1"></i>
                  <span class="text-text-dim">File audio su Google Drive o WeTransfer</span>
                </li>
                <li class="flex items-start gap-3">
                  <i class="ph ph-envelope text-accent mt-1"></i>
                  <span class="text-text-dim">Coordinamento via email</span>
                </li>
                <li class="flex items-start gap-3">
                  <i class="ph ph-users text-accent mt-1"></i>
                  <span class="text-text-dim">Recruiting su molteplici piattaforme</span>
                </li>
              </ul>
            </div>
            <div class="border border-border-zero p-8 bg-surface-zero">
              <blockquote class="text-xl italic text-text-main mb-4">
                "Abbiamo tre gruppi WhatsApp diversi e non riesco mai a trovare i file quando mi servono"
              </blockquote>
              <p class="font-tech text-xs text-text-dim uppercase">
                Marco, chitarrista in band rock
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Soluzione Section -->
      <section
        id="soluzione"
        class="h-screen flex items-center py-20 border-t border-border-zero bg-surface-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">02 // La Soluzione</span>
          <h2 class="text-4xl font-bold mb-12">Uno spazio digitale unificato</h2>

          <div class="grid md:grid-cols-3 gap-6">
            <!-- Feature 1 -->
            <div class="p-6 border border-border-zero bg-bg-zero card-lift">
              <div class="w-12 h-12 border border-accent flex items-center justify-center mb-4">
                <i class="ph ph-music-notes text-2xl text-accent"></i>
              </div>
              <h3 class="font-bold text-lg mb-2">Progetti Musicali</h3>
              <p class="text-text-dim text-sm">
                Gestione strutturata dei progetti musicali con versionamento degli asset audio e immagini
              </p>
              <ul class="mt-4 space-y-2 font-tech text-xs text-text-dim">
                <li>// Workflow: Idea → In Progress → Mix → Master</li>
                <li>// Sistema di voto sugli asset</li>
                <li>// Upload audio e immagini</li>
              </ul>
            </div>

            <!-- Feature 2 -->
            <div class="p-6 border border-border-zero bg-bg-zero card-lift">
              <div class="w-12 h-12 border border-accent flex items-center justify-center mb-4">
                <i class="ph ph-chats text-2xl text-accent"></i>
              </div>
              <h3 class="font-bold text-lg mb-2">Chat Real-time</h3>
              <p class="text-text-dim text-sm">
                Sistema di comunicazione in tempo reale contestualizzato per ogni brano
              </p>
              <ul class="mt-4 space-y-2 font-tech text-xs text-text-dim">
                <li>// WebSocket con Socket.io</li>
                <li>// Notifiche push</li>
                <li>// Messaggi di sistema automatici</li>
              </ul>
            </div>

            <!-- Feature 3 -->
            <div class="p-6 border border-border-zero bg-bg-zero card-lift">
              <div class="w-12 h-12 border border-accent flex items-center justify-center mb-4">
                <i class="ph ph-broadcast text-2xl text-accent"></i>
              </div>
              <h3 class="font-bold text-lg mb-2">Gig Economy</h3>
              <p class="text-text-dim text-sm">
                Bacheca per il recruiting di musicisti con annunci per posizioni permanenti o session
              </p>
              <ul class="mt-4 space-y-2 font-tech text-xs text-text-dim">
                <li>// Tipologia: Member / Session</li>
                <li>// Filtri per strumento e genere</li>
                <li>// Sistema candidature</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Requisiti Section -->
      <section
        id="requisiti"
        class="h-screen flex items-center py-20 border-t border-border-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">03 // Requisiti</span>
          <h2 class="text-4xl font-bold mb-8">Requisiti del Sistema</h2>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- Requisiti Funzionali -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Requisiti Funzionali</h3>
              <div class="space-y-2">
                <div class="p-3 border border-border-zero flex items-start gap-3">
                  <i class="ph ph-key text-accent mt-0.5"></i>
                  <div>
                    <span class="font-bold text-sm">Autenticazione</span>
                    <p class="text-text-dim text-xs">JWT stateless, registrazione, login, onboarding wizard</p>
                  </div>
                </div>
                <div class="p-3 border border-border-zero flex items-start gap-3">
                  <i class="ph ph-users text-accent mt-0.5"></i>
                  <div>
                    <span class="font-bold text-sm">Gestione Band</span>
                    <p class="text-text-dim text-xs">Codice invito univoco (XX-XXX-000), ruoli Admin/Member</p>
                  </div>
                </div>
                <div class="p-3 border border-border-zero flex items-start gap-3">
                  <i class="ph ph-music-notes text-accent mt-0.5"></i>
                  <div>
                    <span class="font-bold text-sm">Progetti Musicali</span>
                    <p class="text-text-dim text-xs">CRUD canzoni, workflow: Idea → In Progress → Mix → Master</p>
                  </div>
                </div>
                <div class="p-3 border border-border-zero flex items-start gap-3">
                  <i class="ph ph-upload text-accent mt-0.5"></i>
                  <div>
                    <span class="font-bold text-sm">Asset Management</span>
                    <p class="text-text-dim text-xs">Upload audio/immagini, sistema di voto real-time</p>
                  </div>
                </div>
                <div class="p-3 border border-border-zero flex items-start gap-3">
                  <i class="ph ph-chats text-accent mt-0.5"></i>
                  <div>
                    <span class="font-bold text-sm">Chat Real-time</span>
                    <p class="text-text-dim text-xs">Messaggi contestuali per brano + notifiche di sistema</p>
                  </div>
                </div>
                <div class="p-3 border border-border-zero flex items-start gap-3">
                  <i class="ph ph-broadcast text-accent mt-0.5"></i>
                  <div>
                    <span class="font-bold text-sm">Gig Economy</span>
                    <p class="text-text-dim text-xs">Annunci Member/Session, sistema candidature</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Requisiti Non Funzionali -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Requisiti Non Funzionali</h3>
              <div class="space-y-3">
                <div class="p-4 border border-border-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-device-mobile text-accent"></i>
                    <span class="font-bold text-sm">Mobile-first Design</span>
                  </div>
                  <p class="text-text-dim text-xs">Interfaccia ottimizzata per dispositivi touch</p>
                </div>
                <div class="p-4 border border-border-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-eye text-accent"></i>
                    <span class="font-bold text-sm">Accessibilita WCAG 2.2 AA</span>
                  </div>
                  <p class="text-text-dim text-xs">Touch target 44x44px, ARIA attributes, contrasto</p>
                </div>
                <div class="p-4 border border-border-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-lightning text-accent"></i>
                    <span class="font-bold text-sm">Performance</span>
                  </div>
                  <p class="text-text-dim text-xs">API response &lt; 200ms, architettura stateless</p>
                </div>
                <div class="p-4 border border-border-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-shield-check text-accent"></i>
                    <span class="font-bold text-sm">Sicurezza</span>
                  </div>
                  <p class="text-text-dim text-xs">bcrypt hashing, JWT expiry, input validation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tecnologie Section -->
      <section
        id="tecnologie"
        class="h-screen flex items-center py-20 border-t border-border-zero bg-surface-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">04 // Stack Tecnologico</span>
          <h2 class="text-4xl font-bold mb-12">MEVN Stack + Real-time</h2>

          <div class="grid md:grid-cols-2 gap-12">
            <!-- Stack Overview -->
            <div>
              <div class="space-y-4">
                <div class="flex items-center gap-4 p-4 border border-border-zero bg-bg-zero">
                  <span class="font-tech text-accent w-8">M</span>
                  <div>
                    <h4 class="font-bold">MongoDB</h4>
                    <p class="text-text-dim text-sm">Database documentale NoSQL</p>
                  </div>
                </div>
                <div class="flex items-center gap-4 p-4 border border-border-zero bg-bg-zero">
                  <span class="font-tech text-accent w-8">E</span>
                  <div>
                    <h4 class="font-bold">Express.js</h4>
                    <p class="text-text-dim text-sm">Framework web per API RESTful</p>
                  </div>
                </div>
                <div class="flex items-center gap-4 p-4 border border-border-zero bg-bg-zero">
                  <span class="font-tech text-accent w-8">V</span>
                  <div>
                    <h4 class="font-bold">Vue.js 3</h4>
                    <p class="text-text-dim text-sm">Composition API + Pinia</p>
                  </div>
                </div>
                <div class="flex items-center gap-4 p-4 border border-border-zero bg-bg-zero">
                  <span class="font-tech text-accent w-8">N</span>
                  <div>
                    <h4 class="font-bold">Node.js</h4>
                    <p class="text-text-dim text-sm">Runtime asincrono non bloccante</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Tech -->
            <div>
              <h3 class="font-tech text-xs text-text-dim uppercase mb-4">Tecnologie Aggiuntive</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 border border-border-zero bg-bg-zero text-center">
                  <i class="ph ph-plug text-2xl text-accent mb-2 block"></i>
                  <span class="font-tech text-xs">Socket.io</span>
                </div>
                <div class="p-4 border border-border-zero bg-bg-zero text-center">
                  <i class="ph ph-key text-2xl text-accent mb-2 block"></i>
                  <span class="font-tech text-xs">JWT Auth</span>
                </div>
                <div class="p-4 border border-border-zero bg-bg-zero text-center">
                  <i class="ph ph-cube text-2xl text-accent mb-2 block"></i>
                  <span class="font-tech text-xs">Docker</span>
                </div>
                <div class="p-4 border border-border-zero bg-bg-zero text-center">
                  <i class="ph ph-wind text-2xl text-accent mb-2 block"></i>
                  <span class="font-tech text-xs">Tailwind CSS</span>
                </div>
              </div>

              <div class="mt-8 p-4 border border-accent bg-accent-dim">
                <h4 class="font-bold mb-2">Vantaggi dello Stack</h4>
                <ul class="space-y-1 text-sm text-text-dim">
                  <li>// JavaScript full-stack</li>
                  <li>// Architettura asincrona</li>
                  <li>// Schema flessibile</li>
                  <li>// Containerizzazione Docker</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Frontend Architecture Section -->
      <section
        id="frontend"
        class="h-screen flex items-center py-20 border-t border-border-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">05 // Frontend</span>
          <h2 class="text-4xl font-bold mb-8">Pattern MVVM</h2>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- MVVM Pattern -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Model-View-ViewModel</h3>
              <div class="space-y-3">
                <div class="p-4 border border-border-zero bg-surface-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-eye text-accent"></i>
                    <span class="font-bold text-sm">View</span>
                  </div>
                  <p class="text-text-dim text-xs">Componenti Vue in views/ e components/</p>
                </div>
                <div class="p-4 border border-border-zero bg-surface-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-git-branch text-accent"></i>
                    <span class="font-bold text-sm">ViewModel</span>
                  </div>
                  <p class="text-text-dim text-xs">Pinia stores (auth, socket) con stato reattivo</p>
                </div>
                <div class="p-4 border border-border-zero bg-surface-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-database text-accent"></i>
                    <span class="font-bold text-sm">Model</span>
                  </div>
                  <p class="text-text-dim text-xs">Services API con Axios + Backend</p>
                </div>
              </div>
            </div>

            <!-- Structure -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Struttura MVVM</h3>
              <div class="border border-border-zero p-4 bg-surface-zero font-tech text-xs">
                <div class="text-text-dim">
                  <p>client/src/</p>
                  <p class="ml-4">├── <span class="text-accent">views/</span> <span class="text-text-dim">// View Layer</span></p>
                  <p class="ml-4">├── <span class="text-accent">components/</span> <span class="text-text-dim">// View Layer</span></p>
                  <p class="ml-4">├── <span class="text-accent">stores/</span> <span class="text-text-dim">// ViewModel (Pinia)</span></p>
                  <p class="ml-4">├── <span class="text-accent">composables/</span> <span class="text-text-dim">// Logica riusabile</span></p>
                  <p class="ml-4">├── <span class="text-accent">services/</span> <span class="text-text-dim">// Model (API)</span></p>
                  <p class="ml-4">└── <span class="text-accent">router/</span> <span class="text-text-dim">// Navigation</span></p>
                </div>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2">
                <div class="p-3 border border-border-zero text-center">
                  <span class="text-accent font-bold text-lg">Pinia</span>
                  <p class="font-tech text-xs text-text-dim">ViewModel</p>
                </div>
                <div class="p-3 border border-border-zero text-center">
                  <span class="text-accent font-bold text-lg">Axios</span>
                  <p class="font-tech text-xs text-text-dim">Model Access</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Design System -->
          <div class="mt-8 p-4 border border-accent bg-accent-dim">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-accent"></div>
                <span class="font-tech text-xs">Teenage Engineering</span>
              </div>
              <span class="text-text-dim">+</span>
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 border-2 border-text-main"></div>
                <span class="font-tech text-xs">Nothing</span>
              </div>
              <span class="text-text-dim">=</span>
              <span class="font-bold">Design System</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Backend Architecture Section -->
      <section
        id="backend"
        class="h-screen flex items-center py-20 border-t border-border-zero bg-surface-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">06 // Backend</span>
          <h2 class="text-4xl font-bold mb-8">Architettura Backend</h2>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- API Structure -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">RESTful API Design</h3>
              <div class="space-y-2">
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <span class="font-tech text-xs text-accent w-16">GET</span>
                  <span class="text-sm">/api/bands</span>
                  <span class="text-text-dim text-xs ml-auto">Lista band utente</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <span class="font-tech text-xs text-accent w-16">POST</span>
                  <span class="text-sm">/api/songs</span>
                  <span class="text-text-dim text-xs ml-auto">Crea nuovo brano</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <span class="font-tech text-xs text-accent w-16">PUT</span>
                  <span class="text-sm">/api/songs/:id</span>
                  <span class="text-text-dim text-xs ml-auto">Aggiorna workflow</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <span class="font-tech text-xs text-accent w-16">DELETE</span>
                  <span class="text-sm">/api/assets/:id</span>
                  <span class="text-text-dim text-xs ml-auto">Rimuovi asset</span>
                </div>
              </div>
            </div>

            <!-- Middleware & Auth -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Middleware Stack</h3>
              <div class="space-y-3">
                <div class="p-4 border border-border-zero bg-bg-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-shield-check text-accent"></i>
                    <span class="font-bold text-sm">JWT Authentication</span>
                  </div>
                  <p class="text-text-dim text-xs">Token stateless con expiry configurabile</p>
                </div>
                <div class="p-4 border border-border-zero bg-bg-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-user-check text-accent"></i>
                    <span class="font-bold text-sm">Authorization</span>
                  </div>
                  <p class="text-text-dim text-xs">Verifica membership band per ogni risorsa</p>
                </div>
                <div class="p-4 border border-border-zero bg-bg-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-upload text-accent"></i>
                    <span class="font-bold text-sm">Multer</span>
                  </div>
                  <p class="text-text-dim text-xs">Gestione upload file multipart/form-data</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Server Structure -->
          <div class="mt-8 border border-border-zero p-4 bg-bg-zero font-tech text-xs">
            <div class="grid md:grid-cols-4 gap-4 text-center">
              <div class="p-3 border border-border-zero">
                <span class="text-accent">routes/</span>
                <p class="text-text-dim mt-1">Definizione endpoint</p>
              </div>
              <div class="p-3 border border-border-zero">
                <span class="text-accent">controllers/</span>
                <p class="text-text-dim mt-1">Business logic</p>
              </div>
              <div class="p-3 border border-border-zero">
                <span class="text-accent">models/</span>
                <p class="text-text-dim mt-1">Mongoose schemas</p>
              </div>
              <div class="p-3 border border-border-zero">
                <span class="text-accent">middleware/</span>
                <p class="text-text-dim mt-1">Auth, validation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Database Section -->
      <section
        id="database"
        class="h-screen flex items-center py-20 border-t border-border-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">07 // Database</span>
          <h2 class="text-4xl font-bold mb-8">Schema MongoDB</h2>

          <!-- Collections Description -->
          <div class="grid md:grid-cols-3 gap-4">
            <div class="p-4 border border-border-zero flex items-start gap-3">
              <i class="ph ph-user text-accent text-xl mt-0.5"></i>
              <div>
                <h4 class="font-bold text-sm mb-1">Users</h4>
                <p class="text-text-dim text-xs">Musicisti registrati con profilo, strumenti e preferenze</p>
              </div>
            </div>
            <div class="p-4 border border-border-zero flex items-start gap-3">
              <i class="ph ph-users-three text-accent text-xl mt-0.5"></i>
              <div>
                <h4 class="font-bold text-sm mb-1">Bands</h4>
                <p class="text-text-dim text-xs">Gruppi musicali con membri, ruoli e codice invito</p>
              </div>
            </div>
            <div class="p-4 border border-border-zero flex items-start gap-3">
              <i class="ph ph-music-notes text-accent text-xl mt-0.5"></i>
              <div>
                <h4 class="font-bold text-sm mb-1">Songs</h4>
                <p class="text-text-dim text-xs">Progetti musicali con workflow a stati</p>
              </div>
            </div>
            <div class="p-4 border border-border-zero flex items-start gap-3">
              <i class="ph ph-file-audio text-accent text-xl mt-0.5"></i>
              <div>
                <h4 class="font-bold text-sm mb-1">Assets</h4>
                <p class="text-text-dim text-xs">File audio e immagini con sistema di voto</p>
              </div>
            </div>
            <div class="p-4 border border-border-zero flex items-start gap-3">
              <i class="ph ph-chat-circle text-accent text-xl mt-0.5"></i>
              <div>
                <h4 class="font-bold text-sm mb-1">Messages</h4>
                <p class="text-text-dim text-xs">Chat contestuale per brano con notifiche</p>
              </div>
            </div>
            <div class="p-4 border border-border-zero flex items-start gap-3">
              <i class="ph ph-broadcast text-accent text-xl mt-0.5"></i>
              <div>
                <h4 class="font-bold text-sm mb-1">Gigs</h4>
                <p class="text-text-dim text-xs">Annunci per recruiting musicisti</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Real-time Section -->
      <section
        id="realtime"
        class="h-screen flex items-center py-20 border-t border-border-zero bg-surface-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">08 // Real-time</span>
          <h2 class="text-4xl font-bold mb-8">Comunicazione WebSocket</h2>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- Socket Events -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Eventi Socket.io</h3>
              <div class="space-y-2">
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-arrow-right text-accent"></i>
                  <code class="font-tech text-xs">join_song</code>
                  <span class="text-text-dim text-xs ml-auto">Entra nella room del brano</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-arrow-right text-accent"></i>
                  <code class="font-tech text-xs">send_message</code>
                  <span class="text-text-dim text-xs ml-auto">Invia messaggio chat</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-arrow-left text-accent"></i>
                  <code class="font-tech text-xs">new_message</code>
                  <span class="text-text-dim text-xs ml-auto">Ricevi messaggio</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-arrow-left text-accent"></i>
                  <code class="font-tech text-xs">vote_update</code>
                  <span class="text-text-dim text-xs ml-auto">Aggiornamento voti asset</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-arrow-left text-accent"></i>
                  <code class="font-tech text-xs">asset_uploaded</code>
                  <span class="text-text-dim text-xs ml-auto">Notifica nuovo asset</span>
                </div>
              </div>
            </div>

            <!-- Architecture -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Architettura Ibrida</h3>
              <div class="border border-border-zero p-6 bg-bg-zero mb-4">
                <div class="space-y-4">
                  <div class="flex items-start gap-3">
                    <i class="ph ph-database text-accent mt-1"></i>
                    <div>
                      <span class="font-bold text-sm">Persistenza MongoDB</span>
                      <p class="text-text-dim text-xs">Messaggi salvati per storico e offline</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="ph ph-lightning text-accent mt-1"></i>
                    <div>
                      <span class="font-bold text-sm">Delivery Socket.io</span>
                      <p class="text-text-dim text-xs">Broadcast real-time agli utenti connessi</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="ph ph-bell text-accent mt-1"></i>
                    <div>
                      <span class="font-bold text-sm">Sistema Notifiche</span>
                      <p class="text-text-dim text-xs">Conteggio non letti per brano e band</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="p-4 border border-accent bg-accent-dim">
                <p class="font-tech text-xs">
                  <span class="text-accent">Room-based:</span> Ogni brano ha una room dedicata per isolare il traffico
                </p>
              </div>
            </div>
          </div>

          <!-- Flow Diagram -->
          <div class="mt-8 p-6 border border-border-zero bg-bg-zero">
            <h4 class="font-tech text-xs text-text-dim uppercase mb-4">Flusso Messaggio</h4>
            <div class="flex items-center justify-between text-center font-tech text-xs">
              <div class="p-3 border border-accent">
                <i class="ph ph-user text-accent text-xl block mb-1"></i>
                Client A
              </div>
              <i class="ph ph-arrow-right text-text-dim"></i>
              <div class="p-3 border border-border-zero">
                <i class="ph ph-cloud text-accent text-xl block mb-1"></i>
                Socket Server
              </div>
              <i class="ph ph-arrow-right text-text-dim"></i>
              <div class="p-3 border border-border-zero">
                <i class="ph ph-database text-accent text-xl block mb-1"></i>
                MongoDB
              </div>
              <i class="ph ph-arrow-right text-text-dim"></i>
              <div class="p-3 border border-accent">
                <i class="ph ph-users text-accent text-xl block mb-1"></i>
                Room Broadcast
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Test & Validazione Section -->
      <section
        id="test"
        class="h-screen flex items-center py-20 border-t border-border-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">09 // Test</span>
          <h2 class="text-4xl font-bold mb-8">Test e Validazione</h2>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- Test Tecnici -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Test Tecnici</h3>
              <div class="space-y-3">
                <div class="p-4 border border-border-zero bg-surface-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-browsers text-accent"></i>
                    <span class="font-bold text-sm">Cross-Browser Testing</span>
                  </div>
                  <p class="text-text-dim text-xs">Chrome, Firefox, Edge + iOS e Android mobile</p>
                </div>
                <div class="p-4 border border-border-zero bg-surface-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-plugs-connected text-accent"></i>
                    <span class="font-bold text-sm">API Testing (Postman)</span>
                  </div>
                  <p class="text-text-dim text-xs">Collection completa: flussi nominali, errori, autenticazione JWT</p>
                </div>
                <div class="p-4 border border-border-zero bg-surface-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-lightning text-accent"></i>
                    <span class="font-bold text-sm">Test Real-time</span>
                  </div>
                  <p class="text-text-dim text-xs">Connessioni multiple simultanee, propagazione eventi chat e notifiche</p>
                </div>
              </div>
            </div>

            <!-- Lighthouse Scores -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Lighthouse Scores</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 border border-border-zero text-center">
                  <div class="w-14 h-14 border-2 border-accent flex items-center justify-center font-bold text-xl mx-auto mb-2">
                    75
                  </div>
                  <span class="font-tech text-xs text-text-dim">Performance</span>
                </div>
                <div class="p-4 border border-border-zero text-center">
                  <div class="w-14 h-14 border-2 border-accent flex items-center justify-center font-bold text-xl mx-auto mb-2">
                    88
                  </div>
                  <span class="font-tech text-xs text-text-dim">Accessibility</span>
                </div>
                <div class="p-4 border border-border-zero text-center">
                  <div class="w-14 h-14 border-2 border-accent flex items-center justify-center font-bold text-xl mx-auto mb-2">
                    96
                  </div>
                  <span class="font-tech text-xs text-text-dim">Best Practices</span>
                </div>
                <div class="p-4 border border-border-zero text-center">
                  <div class="w-14 h-14 border-2 border-accent flex items-center justify-center font-bold text-xl mx-auto mb-2">
                    83
                  </div>
                  <span class="font-tech text-xs text-text-dim">SEO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Accessibility Section -->
      <section
        id="accessibility"
        class="h-screen flex items-center py-20 border-t border-border-zero bg-surface-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">10 // Accessibilita</span>
          <h2 class="text-4xl font-bold mb-8">WCAG 2.2 Level AA</h2>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- Standards -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Standard Implementati</h3>
              <div class="space-y-3">
                <div class="p-4 border border-border-zero bg-bg-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-hand-tap text-accent"></i>
                    <span class="font-bold text-sm">Touch Target 44x44px</span>
                  </div>
                  <p class="text-text-dim text-xs">Tutti gli elementi interattivi rispettano le dimensioni minime</p>
                </div>
                <div class="p-4 border border-border-zero bg-bg-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-eye text-accent"></i>
                    <span class="font-bold text-sm">Contrasto 4.5:1</span>
                  </div>
                  <p class="text-text-dim text-xs">Rapporto di contrasto conforme per testo e elementi UI</p>
                </div>
                <div class="p-4 border border-border-zero bg-bg-zero">
                  <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-cursor text-accent"></i>
                    <span class="font-bold text-sm">Focus Visible</span>
                  </div>
                  <p class="text-text-dim text-xs">Indicatori di focus evidenti per navigazione keyboard</p>
                </div>
              </div>
            </div>

            <!-- ARIA Implementation -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Implementazione ARIA</h3>
              <div class="border border-border-zero p-4 bg-bg-zero font-tech text-xs space-y-2">
                <p><span class="text-accent">aria-label</span> <span class="text-text-dim">// Etichette per screen reader</span></p>
                <p><span class="text-accent">aria-current</span> <span class="text-text-dim">// Stato navigazione</span></p>
                <p><span class="text-accent">aria-expanded</span> <span class="text-text-dim">// Stato menu espandibili</span></p>
                <p><span class="text-accent">aria-live</span> <span class="text-text-dim">// Regioni dinamiche</span></p>
                <p><span class="text-accent">role="button"</span> <span class="text-text-dim">// Semantica elementi custom</span></p>
              </div>
              <div class="mt-4 p-4 border border-accent bg-accent-dim">
                <h4 class="font-bold text-sm mb-2">Semantic HTML</h4>
                <p class="text-text-dim text-xs">
                  Uso di &lt;header&gt;, &lt;main&gt;, &lt;nav&gt;, &lt;section&gt;, &lt;button&gt; per struttura accessibile nativa
                </p>
              </div>
            </div>
          </div>

          <!-- Mobile Accessibility -->
          <div class="mt-6 grid grid-cols-3 gap-4">
            <div class="p-4 border border-border-zero text-center">
              <i class="ph ph-device-mobile text-accent text-2xl mb-2 block"></i>
              <span class="font-tech text-xs">Mobile-first</span>
            </div>
            <div class="p-4 border border-border-zero text-center">
              <i class="ph ph-sun-dim text-accent text-2xl mb-2 block"></i>
              <span class="font-tech text-xs">Dark/Light Mode</span>
            </div>
            <div class="p-4 border border-border-zero text-center">
              <i class="ph ph-arrows-out text-accent text-2xl mb-2 block"></i>
              <span class="font-tech text-xs">Responsive Design</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Deployment Section -->
      <section
        id="deployment"
        class="h-screen flex items-center py-20 border-t border-border-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">11 // Deployment</span>
          <h2 class="text-4xl font-bold mb-8">Containerizzazione Docker</h2>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- Docker Architecture -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">docker-compose.yml</h3>
              <div class="space-y-3">
                <div class="p-4 border border-border-zero flex items-center gap-4">
                  <div class="w-12 h-12 border border-accent flex items-center justify-center">
                    <i class="ph ph-database text-accent text-xl"></i>
                  </div>
                  <div>
                    <span class="font-bold">mongo</span>
                    <p class="font-tech text-xs text-text-dim">Database MongoDB con volume persistente</p>
                  </div>
                </div>
                <div class="p-4 border border-border-zero flex items-center gap-4">
                  <div class="w-12 h-12 border border-accent flex items-center justify-center">
                    <i class="ph ph-gear text-accent text-xl"></i>
                  </div>
                  <div>
                    <span class="font-bold">server</span>
                    <p class="font-tech text-xs text-text-dim">Express.js + Socket.io backend</p>
                  </div>
                </div>
                <div class="p-4 border border-border-zero flex items-center gap-4">
                  <div class="w-12 h-12 border border-accent flex items-center justify-center">
                    <i class="ph ph-browser text-accent text-xl"></i>
                  </div>
                  <div>
                    <span class="font-bold">client</span>
                    <p class="font-tech text-xs text-text-dim">Vue.js SPA con Nginx</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Benefits & Config -->
            <div>
              <h3 class="font-tech text-sm text-accent uppercase mb-4">Vantaggi</h3>
              <div class="space-y-2">
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-check text-accent"></i>
                  <span class="text-sm">Ambiente isolato e riproducibile</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-check text-accent"></i>
                  <span class="text-sm">Deploy con singolo comando</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-check text-accent"></i>
                  <span class="text-sm">Scalabilita orizzontale</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-check text-accent"></i>
                  <span class="text-sm">Configurazione tramite .env</span>
                </div>
              </div>
              <div class="mt-4 p-4 border border-border-zero bg-surface-zero font-tech text-xs">
                <p class="text-text-dim mb-2"># Quick Start</p>
                <p class="text-accent">docker-compose up -d</p>
              </div>
            </div>
          </div>

          <!-- Network Diagram -->
          <div class="mt-6 p-4 border border-accent bg-accent-dim">
            <div class="flex items-center justify-center gap-4 font-tech text-xs text-center">
              <div class="p-2 border border-border-zero bg-bg-zero">Client :80</div>
              <i class="ph ph-arrow-right text-text-dim"></i>
              <div class="p-2 border border-border-zero bg-bg-zero">Server :5000</div>
              <i class="ph ph-arrow-right text-text-dim"></i>
              <div class="p-2 border border-border-zero bg-bg-zero">MongoDB :27017</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Conclusioni Section -->
      <section
        id="conclusioni"
        class="h-screen flex items-center py-20 border-t border-border-zero bg-surface-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">12 // Conclusioni</span>
          <h2 class="text-4xl font-bold mb-8">Conclusione</h2>

          <!-- Final CTA -->
          <div class="border border-accent p-6 text-center">
            <div class="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                @click="router.push({ name: 'auth' })"
                class="px-6 py-3 bg-accent text-bg-zero font-tech text-xs uppercase tracking-wider hover:shadow-glow transition-all btn-press cursor-pointer"
              >
                Prova RiffBanks
              </button>
              <a
                href="https://github.com/LoryBug/RiffBanks"
                target="_blank"
                class="px-6 py-3 border border-border-zero text-text-main font-tech text-xs uppercase tracking-wider hover:border-accent transition-all btn-press flex items-center gap-2 cursor-pointer"
              >
                <i class="ph ph-github-logo"></i>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ScanlineOverlay from '@/components/ScanlineOverlay.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const activeSection = ref('hero')
const scrollContainer = ref(null)

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'problema', label: 'Problema' },
  { id: 'soluzione', label: 'Soluzione' },
  { id: 'requisiti', label: 'Requisiti' },
  { id: 'tecnologie', label: 'Stack' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'database', label: 'Database' },
  { id: 'realtime', label: 'Real-time' },
  { id: 'test', label: 'Test' },
  { id: 'accessibility', label: 'A11y' },
  { id: 'deployment', label: 'Deploy' },
  { id: 'conclusioni', label: 'Conclusioni' },
]

// Computed: current section index
const sectionIndex = computed(() => {
  return sections.findIndex(s => s.id === activeSection.value)
})

// Computed: progress percentage for the sidebar line
const progressHeight = computed(() => {
  if (sectionIndex.value < 0) return 0
  return ((sectionIndex.value + 1) / sections.length) * 100
})

function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

function handleScroll() {
  const container = scrollContainer.value
  if (!container) return

  const scrollPosition = container.scrollTop + window.innerHeight / 2

  for (const section of sections) {
    const element = document.getElementById(section.id)
    if (element) {
      const { offsetTop, offsetHeight } = element
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
        activeSection.value = section.id
        break
      }
    }
  }
}

onMounted(() => {
  scrollContainer.value = document.querySelector('.snap-y')
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll)
  }
  handleScroll()
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>
