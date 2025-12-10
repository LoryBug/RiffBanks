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


