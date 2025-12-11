# Riffbanks - Piattaforma collaborativa per musicisti

## Introduzione


Nel panorama musicale contemporaneo, i musicisti e le band si trovano quotidianamente ad affrontare una sfida organizzativa significativa: la gestione della collaborazione attraverso strumenti frammentati e disconnessi tra loro. Le conversazioni avvengono su WhatsApp o Telegram, i file audio vengono condivisi tramite Google Drive o WeTransfer, il coordinamento delle sessioni passa attraverso email, e la ricerca di nuovi collaboratori richiede la consultazione di molteplici piattaforme e gruppi social. Questa frammentazione genera inefficienze considerevoli, dalla difficolta nel reperire versioni specifiche di un brano alla perdita di contesto nelle discussioni creative.

RiffBanks nasce con l'obiettivo di risolvere queste problematiche offrendo uno spazio digitale unificato pensato specificamente per le esigenze dei musicisti. La piattaforma integra quattro funzionalita fondamentali: la gestione strutturata dei progetti musicali con versionamento degli asset, un sistema di comunicazione in tempo reale contestualizzato per ogni brano e una bacheca per il recruiting di musicisti (denominata "Gig Economy").

Il target principale dell'applicazione comprende musicisti amatoriali e semi-professionali, band in fase di formazione o consolidamento, e session musician alla ricerca di opportunita di collaborazione. L'interfaccia è stata progettata con un approccio mobile-first, riconoscendo che gran parte delle interazioni tra musicisti avviene in mobilita, durante le prove o negli spostamenti.

## Requisiti

### Analisi dell'utenza

Per comprendere a fondo le esigenze degli utenti finali, sono state definite tre personas rappresentative che incarnano i principali profili di utilizzo della piattaforma.

La prima persona è Marco, un chitarrista che suona stabilmente in una band rock composta da quattro elementi. Marco necessita di uno strumento efficace per condividere demo e ricevere feedback dai compagni di band, oltre a voler mantenere traccia delle diverse iterazioni di ogni brano durante il processo creativo. La sua frustrazione principale riguarda la dispersione delle informazioni: "Abbiamo tre gruppi WhatsApp diversi e non riesco mai a trovare i file quando mi servono".

La seconda persona è Giulia, una cantautrice che lavora principalmente in autonomia sulla scrittura di testi e melodie. Giulia cerca regolarmente musicisti a chiamata per le fasi di registrazione dei suoi brani e ha bisogno di strumenti che la aiutino a superare i momenti di blocco creativo. Si chiede spesso dove poter trovare un batterista disponibile per una sessione di registrazione senza dover contattare decine di conoscenti.

La terza persona è Alessandro, un bassista freelance che lavora come musicista a chiamata per diverse band e progetti. Alessandro è costantemente alla ricerca di nuove opportunita di collaborazione e necessita di un modo efficiente per presentare il proprio profilo artistico. Attualmente deve monitorare numerose piattaforme e gruppi social per trovare offerte di lavoro, con un notevole dispendio di tempo.

### Inserire diagramma

### Requisiti Utente

Dall'analisi dell'utenza emergono i requisiti che l'applicazione deve soddisfare dal punto di vista dell'esperienza utente. Gli utenti devono poter gestire un'area riservata personale contenente il proprio profilo con le preferenze musicali, inclusi gli strumenti suonati e i generi di riferimento. Devono poter creare nuove band e gestirne i membri attraverso un sistema di inviti basato su codici univoci, eliminando la necessita di condividere indirizzi email o altri dati personali.

La gestione dei contenuti musicali rappresenta il cuore dell'applicazione: gli utenti devono poter caricare e organizzare file audio e immagini associandoli a specifici brani, comunicare in tempo reale con gli altri membri della band nel contesto di ciascuna canzone, e ricevere notifiche tempestive per nuovi messaggi e attivita rilevanti. Per quanto riguarda l'aspetto sociale, gli utenti devono poter cercare opportunita di collaborazione nella bacheca pubblica e candidarsi a quelle di interesse. Infine, devono poter accedere a strumenti di generazione testuale assistita per supportare il processo creativo.

### Requisiti Funzionali

Dal punto di vista funzionale, il sistema deve implementare un completo flusso di autenticazione che comprende la registrazione di nuovi utenti, il login sicuro con generazione di token JWT, e la gestione del profilo personale attraverso un wizard di onboarding che guida l'utente nella configurazione iniziale.

La gestione delle band costituisce un modulo centrale dell'applicazione. Alla creazione di una nuova band, il sistema genera automaticamente un codice invito univoco nel formato XX-XXX-000 che puo essere condiviso con i potenziali membri. Chi riceve il codice puo unirsi alla band inserendolo nell'apposita sezione, e il sistema gestisce automaticamente i ruoli distinguendo tra amministratori e membri semplici.

Per quanto riguarda i progetti musicali, il sistema implementa operazioni CRUD complete sulle canzoni, ciascuna caratterizzata da un workflow di stato che riflette le fasi tipiche della produzione musicale: Idea, In Progress, Mix e Master. Gli asset associati a ogni canzone possono essere di tre tipologie: file audio caricati dall'utente, immagini di riferimento, e testi generati tramite l'assistente AI o inseriti manualmente. Ogni asset e soggetto a un sistema di voto che permette ai membri della band di esprimere preferenze, con conteggio aggiornato in tempo reale.

La comunicazione avviene attraverso una chat integrata per ogni canzone, che combina messaggi degli utenti e notifiche di sistema relative agli upload e ad altre attivita significative. Il modulo Gig Economy consente la pubblicazione di annunci di due tipologie: "member" per posizioni permanenti nella band, e "session" per collaborazioni temporanee su specifici progetti. Gli utenti possono candidarsi agli annunci e gli amministratori delle band possono gestire le candidature ricevute.

### Requisiti Non Funzionali

L'usabilita rappresenta un requisito fondamentale: l'interfaccia deve risultare intuitiva anche per utenti non esperti di tecnologia, con un design ottimizzato per dispositivi mobili secondo l'approccio mobile-first. L'accessibilita e stata curata seguendo le linee guida WCAG 2.1 livello AA, implementando supporto per screen reader attraverso attributi ARIA appropriati e garantendo touch target di dimensioni minime di 44x44 pixel per facilitare l'interazione su dispositivi touch.

Sul fronte della sicurezza, l'autenticazione avviene tramite token JWT stateless con scadenza configurabile, le password vengono memorizzate dopo hashing con algoritmo bcrypt utilizzando 10 salt rounds, e tutti gli input utente sono sottoposti a validazione per prevenire injection e altri attacchi comuni.

Le performance target prevedono tempi di risposta delle API inferiori ai 200 millisecondi, mentre l'architettura stateless del backend consente la scalabilita orizzontale per gestire carichi crescenti. Gli aggiornamenti in tempo reale per chat, notifiche e conteggio voti sono garantiti dall'utilizzo del protocollo WebSocket attraverso la libreria Socket.io.

## Design

### Metodologia

Il sistema si basa su un database MongoDB organizzato in sei collezioni principali che modellano il dominio applicativo. La collezione "users" memorizza i profili dei musicisti con le relative credenziali di autenticazione e le preferenze musicali espresse in termini di strumenti suonati e generi di riferimento. La collezione "bands" rappresenta i gruppi di lavoro, contenendo il nome, il genere musicale, la localita geografica, il codice invito univoco e l'elenco dei membri con i rispettivi ruoli. La collezione "songs" archivia i progetti musicali associati a ciascuna band, con metadati quali titolo, BPM, genere e stato di avanzamento nel workflow produttivo. La collezione "assets" contiene i file e i contenuti testuali associati alle canzoni, includendo il riferimento all'uploader, la tipologia (audio, immagine o testo), l'eventuale URL del file e l'array dei voti ricevuti. La collezione "messages" gestisce la chat ibrida che combina messaggi degli utenti e log di sistema. Infine, la collezione "gigs" memorizza gli annunci pubblicati per il recruiting di musicisti, con le relative candidature.

Le relazioni tra le entita seguono un modello orientato ai documenti tipico di MongoDB. Un utente puo appartenere a molteplici band attraverso l'array di membri embedded in ciascuna band. Ogni band contiene multiple canzoni, referenziate tramite il campo bandId. A sua volta, ogni canzone puo avere associati numerosi asset e messaggi, collegati tramite il campo songId. Gli annunci gig sono pubblicati da una band specifica e raccolgono candidature da parte degli utenti interessati.

La struttura del database e le relazioni tra le entita sono rappresentate nel seguente diagramma:

**Inserire diagramma ER del db**

L'architettura generale segue il pattern REST per le operazioni CRUD, affiancato dal protocollo WebSocket per le funzionalita che richiedono aggiornamenti in tempo reale. Il frontend comunica con il backend attraverso chiamate HTTP per le operazioni transazionali e mantiene una connessione WebSocket persistente per ricevere notifiche push relative a nuovi messaggi, aggiornamenti dei voti e altre attivita collaborative.

### Architettura delle Interfacce Utente

Il design dell'interfaccia utente e stato sviluppato seguendo un approccio iterativo direttamente in codice, utilizzando Tailwind CSS come framework di styling. Questa scelta ha permesso di mantenere elevata flessibilita durante le fasi di raffinamento, evitando la rigidita che talvolta caratterizza i passaggi da mockup statici a implementazione.

Le scelte estetiche si orientano verso un tema scuro **da fare e aggiornare con nuovo stile**

L'applicazione si articola in sette viste principali. La schermata di autenticazione presenta un form animato per login e registrazione, accompagnato da elementi decorativi che introducono l'identita visiva del prodotto. Il wizard di onboarding guida i nuovi utenti attraverso due step per la selezione degli strumenti suonati e dei generi musicali preferiti. La dashboard mostra l'elenco delle band dell'utente attraverso card interattive e fornisce l'accesso alla bacheca dei gig. La vista dettaglio band organizza le informazioni in tre tab: panoramica, elenco membri e impostazioni con gestione del codice invito. La lista canzoni presenta i brani della band in formato griglia, con badge colorati che indicano lo stato di avanzamento. La vista dettaglio canzone integra un player audio personalizzato, la timeline degli asset con sistema di voto, e una chat flottante per la comunicazione contestuale. Infine, la vista Gig mostra la bacheca degli annunci con funzionalita di ricerca e filtri per strumento, genere e tipologia.

**mettere screen delle schermate**

## Tecnologie

Lo stack tecnologico adottato e il MEVN, acronimo che identifica la combinazione di MongoDB, Express, Vue.js e Node.js, arricchito da Socket.io per le funzionalita real-time.
### Backend

Il backend e costruito su Node.js versione 18 o successiva, scelto per il suo modello asincrono non bloccante particolarmente adatto ad applicazioni con elevata concorrenza di connessioni. Express versione 4 fornisce il framework web per la definizione delle route e la gestione del middleware, offrendo la flessibilita necessaria per strutturare un'API RESTful ben organizzata.

La persistenza dei dati e affidata a MongoDB, un database documentale NoSQL che si adatta naturalmente alla struttura flessibile dei dati musicali e collaborative. Mongoose funge da ODM (Object Document Mapper), fornendo uno strato di astrazione che include validazione degli schema, middleware e query builder.

La comunicazione in tempo reale e implementata attraverso Socket.io, che gestisce le connessioni WebSocket con fallback automatico su polling per garantire compatibilita con ambienti di rete restrittivi. Questa libreria permette l'organizzazione delle connessioni in "room" logiche, ciascuna corrispondente a una canzone specifica, ottimizzando la distribuzione dei messaggi.

L'autenticazione si basa su JSON Web Token attraverso la libreria jsonwebtoken, implementando un meccanismo stateless che non richiede storage lato server per le sessioni. Le password vengono processate con bcryptjs, che applica l'algoritmo bcrypt con un fattore di costo di 10 round per generare hash sicuri.

La gestione dell'upload dei file e affidata a Multer, un middleware per Express specializzato nel parsing di richieste multipart/form-data. La configurazione prevede un limite di 50 megabyte per singolo file e un filtro che accetta esclusivamente formati audio (mp3, wav, ogg, webm) e immagini (jpg, png, gif).

**sicuramente da migliorare e controllare meglio**

### Frontend

Il frontend e sviluppato con Vue.js, sfruttando appieno la Composition API attraverso la sintassi script setup che permette di scrivere logica reattiva in modo conciso ed espressivo. Questa scelta architetturale facilita la composizione di funzionalità complesse e migliora la manutenibilita del codice rispetto all'Options API delle versioni precedenti.

La gestione dello stato applicativo e centralizzata attraverso Pinia, lo state manager ufficiale per Vue 3. Due store principali gestiscono rispettivamente lo stato di autenticazione (utente corrente, token, flag di onboarding) e la connessione Socket.io (istanza socket, stato di connessione, room attiva).

Il routing client-side e implementato con Vue Router, configurato con navigation guard per proteggere le route che richiedono autenticazione e per gestire il reindirizzamento verso l'onboarding per gli utenti che non hanno completato la configurazione del profilo. Il caricamento delle viste avviene in modalita lazy attraverso import dinamici, riducendo il bundle iniziale e migliorando i tempi di caricamento.

Vite costituisce il build tool del progetto, offrendo un server di sviluppo con Hot Module Replacement quasi istantaneo e producendo bundle ottimizzati per la produzione. La configurazione include un proxy che inoltra le richieste API al backend durante lo sviluppo, semplificando la gestione del CORS.

Lo styling e realizzato interamente con Tailwind CSS, adottando l'approccio utility-first che permette di comporre stili direttamente nel markup senza dover gestire fogli di stile separati. Le icone provengono dalla libreria Lucide Vue Next, scelta per la coerenza stilistica e la leggerezza del bundle.

Le comunicazioni HTTP con il backend sono gestite da Axios, configurato con interceptor che aggiungono automaticamente il token JWT alle richieste e gestiscono gli errori di autenticazione reindirizzando al login quando necessario.

## Codice

### Struttura del Progetto
Il progetto adotta una struttura monorepo gestita attraverso npm workspace, con due package principali: 
- client, con la parte contenente il frontend in VUE
- server, backend express
Questa organizzazione permette di condividere configurazioni e script a livello di root mantenendo al contempo una chiara separazione di responsabilità.

#### Client
La cartella client contiene l'applicazione Vue organizzata secondo le convezioni del framework. 
- **components** ospita i vari componenti riutilizzabili come ad asempio AudioPlayer, ChatPanel, GigGard e i vari modal.
- **views** contiene i componenti che rappresentano le varie pagine dell'applicazione, mappati alle route definite nel router.
- **stores** contiene Pinia store per auth e socket.
- **services** contiene il modulo api che centralizza tutte le chiamate HTTP.
- **routes** definisce tutte le route e i navigation guard

#### Server
Server contiene tutto il backend del progetto ed è organizzato nel seguente modo:
- **models** contiene gli schemi di Mongoose per le diverse collezioni del DB.
- **controllers** implementa la logica applicativa per ciascuna risorsa
- **routes** definisce tutti gli endpoint e li collega al controller
- **middleware** ospita i moduli per autenticazione e upload
- **services** contiene la logica di business riutilizzabile
- **socket** gestisce gli handler per gli eventi websocket

**INSERIRE DIAGRAMMA DEI COMPONENTI QUI**