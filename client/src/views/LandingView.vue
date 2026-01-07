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
            class="px-4 py-2 border border-accent text-accent font-tech text-xs uppercase hover:bg-accent hover:text-bg-zero transition-all btn-press hover-glow"
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
              class="px-8 py-4 bg-accent text-bg-zero font-tech text-sm uppercase tracking-wider hover:shadow-glow transition-all btn-press"
            >
              Inizia Ora
            </button>
            <button
              @click="scrollToSection('problema')"
              class="px-8 py-4 border border-border-zero text-text-main font-tech text-sm uppercase tracking-wider hover:border-accent transition-all btn-press"
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

      <!-- Target Section -->
      <section
        id="target"
        class="h-screen flex items-center py-20 border-t border-border-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">03 // Target Utenti</span>
          <h2 class="text-4xl font-bold mb-12">Pensato per i musicisti</h2>

          <div class="grid md:grid-cols-3 gap-8">
            <!-- Persona 1 -->
            <div class="border border-border-zero p-6 card-scan">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-accent flex items-center justify-center font-bold text-bg-zero">
                  M
                </div>
                <div>
                  <h3 class="font-bold">Marco</h3>
                  <p class="font-tech text-xs text-text-dim">Chitarrista in band rock</p>
                </div>
              </div>
              <p class="text-text-dim text-sm mb-4">
                Necessita di condividere demo e ricevere feedback, mantenendo traccia delle diverse
                iterazioni di ogni brano durante il processo creativo.
              </p>
              <div class="font-tech text-xs text-accent">
                Esigenza: Organizzazione e versionamento
              </div>
            </div>

            <!-- Persona 2 -->
            <div class="border border-border-zero p-6 card-scan">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-accent flex items-center justify-center font-bold text-bg-zero">
                  G
                </div>
                <div>
                  <h3 class="font-bold">Giulia</h3>
                  <p class="font-tech text-xs text-text-dim">Cantautrice solista</p>
                </div>
              </div>
              <p class="text-text-dim text-sm mb-4">
                Cerca regolarmente musicisti a chiamata per le fasi di registrazione dei suoi brani.
              </p>
              <div class="font-tech text-xs text-accent">
                Esigenza: Recruiting session musician
              </div>
            </div>

            <!-- Persona 3 -->
            <div class="border border-border-zero p-6 card-scan">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-accent flex items-center justify-center font-bold text-bg-zero">
                  A
                </div>
                <div>
                  <h3 class="font-bold">Alessandro</h3>
                  <p class="font-tech text-xs text-text-dim">Bassista freelance</p>
                </div>
              </div>
              <p class="text-text-dim text-sm mb-4">
                Costantemente alla ricerca di nuove opportunita di collaborazione con diverse band.
              </p>
              <div class="font-tech text-xs text-accent">
                Esigenza: Visibilita e opportunita
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

      <!-- Architettura Section -->
      <section
        id="architettura"
        class="h-screen flex items-center py-20 border-t border-border-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">05 // Architettura</span>
          <h2 class="text-4xl font-bold mb-12">Design e Database</h2>

          <div class="grid md:grid-cols-2 gap-12">
            <!-- Database Schema -->
            <div>
              <h3 class="font-tech text-sm text-text-dim uppercase mb-4">Collezioni MongoDB</h3>
              <div class="space-y-2">
                <div class="p-3 border border-border-zero flex justify-between items-center">
                  <span class="font-bold">users</span>
                  <span class="font-tech text-xs text-text-dim">Profili e credenziali</span>
                </div>
                <div class="p-3 border border-border-zero flex justify-between items-center">
                  <span class="font-bold">bands</span>
                  <span class="font-tech text-xs text-text-dim">Gruppi di lavoro</span>
                </div>
                <div class="p-3 border border-border-zero flex justify-between items-center">
                  <span class="font-bold">songs</span>
                  <span class="font-tech text-xs text-text-dim">Progetti musicali</span>
                </div>
                <div class="p-3 border border-border-zero flex justify-between items-center">
                  <span class="font-bold">assets</span>
                  <span class="font-tech text-xs text-text-dim">File e contenuti</span>
                </div>
                <div class="p-3 border border-border-zero flex justify-between items-center">
                  <span class="font-bold">messages</span>
                  <span class="font-tech text-xs text-text-dim">Chat ibrida</span>
                </div>
                <div class="p-3 border border-border-zero flex justify-between items-center">
                  <span class="font-bold">gigs</span>
                  <span class="font-tech text-xs text-text-dim">Annunci e candidature</span>
                </div>
              </div>
            </div>

            <!-- Design Inspiration -->
            <div>
              <h3 class="font-tech text-sm text-text-dim uppercase mb-4">Design System</h3>
              <div class="border border-border-zero p-6 bg-surface-zero mb-4">
                <p class="text-text-dim text-sm mb-4">
                  Lo stile visivo e ispirato a due brand iconici nel mondo dell'elettronica di consumo:
                </p>
                <div class="space-y-4">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-accent"></div>
                    <div>
                      <span class="font-bold">Teenage Engineering</span>
                      <p class="text-text-dim text-xs">Estetica industriale, accenti vibranti</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 border-2 border-text-main"></div>
                    <div>
                      <span class="font-bold">Nothing</span>
                      <p class="text-text-dim text-xs">Trasparenze, elementi geometrici</p>
                    </div>
                  </div>
                </div>
              </div>
              <p class="font-tech text-xs text-text-dim">
                Mockup generati con Gemini 3.0 Flash + Canvas attraverso iterazioni di prompt
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Demo Section -->
      <section
        id="demo"
        class="h-screen flex items-center py-20 border-t border-border-zero bg-surface-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">06 // Demo</span>
          <h2 class="text-4xl font-bold mb-12">L'applicazione in azione</h2>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Screenshot placeholders -->
            <div class="aspect-[9/16] border border-border-zero bg-bg-zero p-4 flex flex-col">
              <span class="font-tech text-xs text-accent mb-2">Dashboard</span>
              <div class="flex-1 border border-border-zero flex items-center justify-center">
                <i class="ph ph-terminal text-4xl text-text-dim"></i>
              </div>
              <p class="text-text-dim text-xs mt-2">Panoramica band e stato utente</p>
            </div>
            <div class="aspect-[9/16] border border-border-zero bg-bg-zero p-4 flex flex-col">
              <span class="font-tech text-xs text-accent mb-2">Song List</span>
              <div class="flex-1 border border-border-zero flex items-center justify-center">
                <i class="ph ph-list text-4xl text-text-dim"></i>
              </div>
              <p class="text-text-dim text-xs mt-2">Workflow di stato per brani</p>
            </div>
            <div class="aspect-[9/16] border border-border-zero bg-bg-zero p-4 flex flex-col">
              <span class="font-tech text-xs text-accent mb-2">Song Detail</span>
              <div class="flex-1 border border-border-zero flex items-center justify-center">
                <i class="ph ph-waveform text-4xl text-text-dim"></i>
              </div>
              <p class="text-text-dim text-xs mt-2">Player audio e chat contestuale</p>
            </div>
            <div class="aspect-[9/16] border border-border-zero bg-bg-zero p-4 flex flex-col">
              <span class="font-tech text-xs text-accent mb-2">Gig Economy</span>
              <div class="flex-1 border border-border-zero flex items-center justify-center">
                <i class="ph ph-broadcast text-4xl text-text-dim"></i>
              </div>
              <p class="text-text-dim text-xs mt-2">Bacheca annunci e candidature</p>
            </div>
          </div>

          <div class="mt-12 text-center">
            <button
              @click="router.push({ name: 'auth' })"
              class="px-8 py-4 bg-accent text-bg-zero font-tech text-sm uppercase tracking-wider hover:shadow-glow transition-all btn-press"
            >
              Prova l'Applicazione
            </button>
          </div>
        </div>
      </section>

      <!-- Test & Validazione Section -->
      <section
        id="test"
        class="h-screen flex items-center py-20 border-t border-border-zero snap-start snap-always overflow-y-auto"
      >
        <div class="container-zero">
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">07 // Test e Validazione</span>
          <h2 class="text-4xl font-bold mb-12">Qualita garantita</h2>

          <div class="grid md:grid-cols-2 gap-12">
            <!-- Test Results -->
            <div>
              <h3 class="font-tech text-sm text-text-dim uppercase mb-4">Lighthouse Scores</h3>
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 border-2 border-accent flex items-center justify-center font-bold text-xl">
                    75
                  </div>
                  <div>
                    <span class="font-bold">Performance</span>
                    <div class="w-32 h-2 bg-border-zero mt-1">
                      <div class="h-full bg-accent" style="width: 75%"></div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 border-2 border-accent flex items-center justify-center font-bold text-xl">
                    88
                  </div>
                  <div>
                    <span class="font-bold">Accessibility</span>
                    <div class="w-32 h-2 bg-border-zero mt-1">
                      <div class="h-full bg-accent" style="width: 88%"></div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 border-2 border-accent flex items-center justify-center font-bold text-xl">
                    96
                  </div>
                  <div>
                    <span class="font-bold">Best Practices</span>
                    <div class="w-32 h-2 bg-border-zero mt-1">
                      <div class="h-full bg-accent" style="width: 96%"></div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 border-2 border-accent flex items-center justify-center font-bold text-xl">
                    83
                  </div>
                  <div>
                    <span class="font-bold">SEO</span>
                    <div class="w-32 h-2 bg-border-zero mt-1">
                      <div class="h-full bg-accent" style="width: 83%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Euristiche Nielsen -->
            <div>
              <h3 class="font-tech text-sm text-text-dim uppercase mb-4">Euristiche di Nielsen</h3>
              <div class="space-y-2 text-sm">
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-check-circle text-accent"></i>
                  <span>Visibilita dello stato del sistema</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-check-circle text-accent"></i>
                  <span>Corrispondenza sistema-mondo reale</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-check-circle text-accent"></i>
                  <span>Controllo e liberta per l'utente</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-check-circle text-accent"></i>
                  <span>Consistenza e standard</span>
                </div>
                <div class="p-3 border border-border-zero flex items-center gap-3">
                  <i class="ph ph-check-circle text-accent"></i>
                  <span>Prevenzione dall'errore</span>
                </div>
              </div>
              <p class="font-tech text-xs text-text-dim mt-4">
                WCAG 2.1 Level AA // Touch target 44x44px // ARIA attributes
              </p>
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
          <span class="font-tech text-xs text-accent uppercase tracking-widest mb-4 block">08 // Conclusioni</span>
          <h2 class="text-4xl font-bold mb-12">Sviluppi futuri</h2>

          <div class="grid md:grid-cols-3 gap-6 mb-12">
            <div class="p-6 border border-border-zero bg-bg-zero">
              <i class="ph ph-waveform text-3xl text-accent mb-4 block"></i>
              <h3 class="font-bold mb-2">Player Audio Avanzato</h3>
              <p class="text-text-dim text-sm">
                Integrazione di funzionalita di editing audio base (trim, fade) e visualizzazione forma d'onda
              </p>
            </div>
            <div class="p-6 border border-border-zero bg-bg-zero">
              <i class="ph ph-cloud text-3xl text-accent mb-4 block"></i>
              <h3 class="font-bold mb-2">Storage Cloud</h3>
              <p class="text-text-dim text-sm">
                Migrazione su AWS S3 o Cloudinary per migliorare scalabilita e affidabilita
              </p>
            </div>
            <div class="p-6 border border-border-zero bg-bg-zero">
              <i class="ph ph-star text-3xl text-accent mb-4 block"></i>
              <h3 class="font-bold mb-2">Sistema Recensioni</h3>
              <p class="text-text-dim text-sm">
                Possibilita di lasciare feedback sui collaboratori incontrati tramite Gig Economy
              </p>
            </div>
          </div>

          <div class="border border-accent p-8 text-center">
            <h3 class="text-2xl font-bold mb-4">Grazie per l'attenzione</h3>
            <p class="text-text-dim mb-6">
              L'idea di RiffBanks nasce da un'esigenza concreta riscontrata nel mondo della musica amatoriale
            </p>
            <div class="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                @click="router.push({ name: 'auth' })"
                class="px-8 py-4 bg-accent text-bg-zero font-tech text-sm uppercase tracking-wider hover:shadow-glow transition-all btn-press"
              >
                Prova RiffBanks
              </button>
              <a
                href="https://github.com/LoryBug/RiffBanks"
                target="_blank"
                class="px-8 py-4 border border-border-zero text-text-main font-tech text-sm uppercase tracking-wider hover:border-accent transition-all btn-press flex items-center gap-2"
              >
                <i class="ph ph-github-logo"></i>
                GitHub Repository
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
  { id: 'target', label: 'Target' },
  { id: 'tecnologie', label: 'Tech' },
  { id: 'architettura', label: 'Design' },
  { id: 'demo', label: 'Demo' },
  { id: 'test', label: 'Test' },
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
