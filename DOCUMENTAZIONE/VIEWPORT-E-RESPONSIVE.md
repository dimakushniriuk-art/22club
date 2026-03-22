# Viewport e design responsive — 22Club

Documento di riferimento per adattamento UX, UI, design e spaziatura alle misure minime di cellulare e iPad, in orientamento verticale e orizzontale.

---

## 1. Misure minime di riferimento

| Dispositivo   | Larghezza | Altezza | DPR |
| ------------- | --------- | ------- | --- |
| **Cellulare** | 393 px    | 852 px  | 3   |
| **iPad**      | 834 px    | 1194 px | 2   |

_(Larghezza e altezza sono in CSS logical pixels, viewport. Il DPR non si imposta nel layout; serve per scaling e asset.)_

---

## 2. Le quattro configurazioni (portrait + landscape)

| Dispositivo   | Verticale (portrait) | Orizzontale (landscape) |
| ------------- | -------------------- | ----------------------- |
| **Cellulare** | 393 × 852 (DPR 3)    | 852 × 393 (DPR 3)       |
| **iPad**      | 834 × 1194 (DPR 2)   | 1194 × 834 (DPR 2)      |

---

## 3. Cosa adattare per ogni vista

Per ogni pagina e per ognuna delle quattro viste si considerano:

- **UX:** navigazione, tab bar, sidebar, uso dello spazio (es. sidebar sempre visibile su iPad landscape, tab bar compatta su cellulare landscape).
- **UI:** griglie, colonne, dimensioni tap target, visibilità degli elementi principali.
- **Design:** tipografia, card, bordi, coerenza dark / Apple-like.
- **Spaziatura:** padding, gap, safe area (notch / home indicator), margini tra sezioni.

In **portrait** si ha più altezza e meno larghezza; in **landscape** più larghezza e meno altezza — il layout va ottimizzato di conseguenza.

---

## 4. Breakpoint e uso in progetto

- **Mobile (cellulare):** larghezza massima **393 px** per layout “solo cellulare”; sotto questa soglia (o fino a 393) si usa layout a colonna singola, tab bar in basso, contenuti a piena larghezza.
- **Tablet (iPad):** da **834 px** in su (min-width) si usa layout tablet (es. due colonne, sidebar, griglie più ampie).
- **Orientamento:** dove serve, usare `orientation: portrait` / `orientation: landscape` in media query (es. per regole specifiche iPad landscape 1194×834 o cellulare landscape 852×393).

_(Dettaglio implementativo: Tailwind, `globals.css`, eventuali variabili CSS e progetti Playwright per test su queste dimensioni.)_

---

## 5. Pagine adattate

| Pagina                                                       | Cellulare 393×852 | Cellulare 852×393 | iPad 834×1194 | iPad 1194×834 |
| ------------------------------------------------------------ | ----------------- | ----------------- | ------------- | ------------- |
| **Login** (`/login`)                                         | ✅                | ✅                | ✅            | ✅            |
| **Home atleti** (`/home`)                                    | ✅                | ✅                | ✅            | ✅            |
| **Allenamenti** (`/home/allenamenti`)                        | ✅                | ✅                | ✅            | ✅            |
| **Scheda allenamento** (`/home/allenamenti/[id]`)            | ✅                | ✅                | ✅            | ✅            |
| **Dettaglio esercizio** (`/home/allenamenti/esercizio/[id]`) | ✅                | ✅                | ✅            | ✅            |
| **Allenamento di oggi** (`/home/allenamenti/oggi`)           | ✅                | ✅                | ✅            | ✅            |
| **Riepilogo allenamento** (`/home/allenamenti/riepilogo`)    | ✅                | ✅                | ✅            | ✅            |
| **Progressi** (`/home/progressi`)                            | ✅                | ✅                | ✅            | ✅            |
| **Storico allenamenti** (`/home/progressi/storico`)          | ✅                | ✅                | ✅            | ✅            |
| **Statistiche allenamenti** (`/home/progressi/allenamenti`)  | ✅                | ✅                | ✅            | ✅            |
| **Misurazioni** (`/home/progressi/misurazioni`)              | ✅                | ✅                | ✅            | ✅            |
| **Chat** (`/home/chat`)                                      | ✅                | ✅                | ✅            | ✅            |
| **Documenti** (`/home/documenti`)                            | ✅                | ✅                | ✅            | ✅            |
| **Foto / Risultati** (`/home/foto-risultati`)                | ✅                | ✅                | ✅            | ✅            |
| **Aggiungi foto** (`/home/foto-risultati/aggiungi`)          | ✅                | ✅                | ✅            | ✅            |
| **Nutrizionista** (`/home/nutrizionista`)                    | ✅                | ✅                | ✅            | ✅            |
| **Massaggiatore** (`/home/massaggiatore`)                    | ✅                | ✅                | ✅            | ✅            |

### Dettaglio Login

- **Mobile portrait (393×852):** padding ridotto (p-3), card `max-w-md`, logo h-24, input/bottone min-height 44px (touch), safe area, `100dvh`.
- **Mobile landscape:** in `globals.css` per `orientation: landscape` e `max-height: 500px` — allineamento in alto, overflow-y auto, padding verticale ridotto.
- **iPad (834px+):** card `max-w-lg`, padding aumentato (p-6/p-8), logo h-32, spaziatura `space-y-6`, link “Reimposta password” con padding tap ridotto.

### Dettaglio Home atleti

- **Mobile portrait (393×852):** rimosso min-width/min-height fissi (402/874); contenuto `w-full max-w-full`, padding px-3/py-4, header con p-4, griglia 2 colonne gap-2.5, card con min-h 44px (touch), safe-area-inset-bottom, altezza main `calc(100dvh - 56px)`.
- **Mobile landscape (852×393):** da 834px la griglia passa a 3 colonne (852 ≥ 834), quindi layout a 3 col già usato; padding e spaziatura come iPad.
- **iPad (834px+):** header e main con px-6/py-5, titolo Benvenuto text-xl, sottotitolo text-sm, griglia 3 colonne gap-4, card PROFILO col-span-3, label text-xs, icone h-7 w-7, padding card py-4 px-4. Layout header con safe-area-inset-top e padding responsive.

### Dettaglio Home Allenamenti (`/home/allenamenti`)

- **Mobile portrait (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-4, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back button min 44×44px (touch). Stats 2 colonne gap-2.5. Card “Allenamento di oggi” con thumbnail 24×24, grid 3 col (Durata/Esercizi/PT), bottone “Inizia” min-h 44px. Schede assegnate e card motivazionale con padding responsive.
- **iPad (834px+):** padding px-6/py-5, stats 4 colonne gap-4, titolo text-xl, card oggi con thumbnail 28×28, testi text-sm/text-xs, bottoni h-10, card schede p-4, card motivazionale p-6 e avatar 16×16.

### Dettaglio Scheda allenamento (`/home/allenamenti/[id]`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-4, pb-24 (nav), minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back link 44×44px, titolo text-lg, descrizione text-xs. Sezione “Giorni di allenamento” con h2 text-base; card giorno con p-4, bottone expand e link “Avvia” min-h 44px. Lista esercizi/circuiti: gap-3, p-3, thumbnail 24×24, link Info 44×44; circuiti 24×24, testo text-sm; bottone “Inizia questo giorno” min-h 44px.
- **iPad (834px+):** padding px-6/py-5, titolo text-xl, h2 text-lg, card giorno p-5, “Avvia” h-10 text-sm; lista space-y-5, item p-4, thumbnail 28×28 (esercizi) e 24×24 (in circuito), badge text-xs, bottone “Inizia questo giorno” h-10 text-sm.

### Dettaglio esercizio (`/home/allenamenti/esercizio/[exerciseId]`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-4, pb-24, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back 44×44px, titolo “Dettaglio esercizio” text-lg, sottotitolo nome text-xs. Card: video/immagine aspect-video, CardContent p-4, h1 text-lg, sezione Esecuzione text-xs/text-sm, badge text-[10px].
- **iPad (834px+):** padding px-6/py-5, header p-4 e text-xl/text-sm, CardContent p-6, h1 text-xl, Esecuzione text-sm/text-base, badge text-xs e gap-2, icona placeholder Dumbbell h-20 w-20. Image con sizes responsive.

### Allenamento di oggi (`/home/allenamenti/oggi`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-3, pb-24, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back 44×44px, titolo text-base. Stati empty/error con stessi padding e bottoni min-h 44px. Loading e fallback Suspense con min-h-dvh e padding responsive.
- **iPad (834px+):** padding px-6/py-4, header p-4, titolo text-lg, space-y-4; card e bottoni h-10 dove applicabile. Stati accesso/errore/empty con p-6 e testi text-base/text-lg.

### Riepilogo allenamento (`/home/allenamenti/riepilogo`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-4, pb-24, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back 44×44px, titolo text-base. Card principale p-4, stats 2 colonne gap-2, testi text-xl/text-[10px]. Bottoni “Invia al tuo PT” e “Torna alla home” min-h 44px.
- **iPad (834px+):** padding px-6/py-5, header p-4 e titolo text-lg, card p-6, stats 4 colonne gap-3, numeri text-2xl e label text-xs, CardHeader “Esercizi eseguiti” py-4 e text-base, bottoni h-10/h-11 e text-sm.

### Progressi (`/home/progressi`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-4, pb-24, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back 44×44px, titolo text-lg, sottotitolo text-xs. Griglia 1 colonna gap-2.5, card con area tap (min-h 44px), CardHeader/CardContent con padding esplicito.
- **iPad (834px+):** padding px-6/py-5, header p-4, titolo text-xl, sottotitolo text-sm; griglia 2 colonne gap-4, card px-5 pt-5, titoli text-base, descrizioni text-sm, link Visualizza text-xs.

### Storico allenamenti (`/home/progressi/storico`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, minHeight `calc(100dvh - 56px)`, pb-24, safe-area-inset-bottom. Header con back 44×44px, titolo text-lg, filtro periodo con bottoni min-h 44px. Stats 2 colonne gap-2, card p-3. Lista con p-3, bottone Esporta PDF min-h 44px, item p-2.5 e min-h 44px.
- **iPad (834px+):** padding px-6/py-4, header titolo text-xl, filtro text-xs e min-h 36px; stats 4 colonne gap-4, card p-4 e numeri text-2xl; lista p-4, h2 text-base, Esporta h-9, item p-3 e titolo text-sm.

### Statistiche allenamenti (`/home/progressi/allenamenti`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-4, pb-24, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back 44×44px, titolo text-lg, sottotitolo text-xs. Stats 1 colonna gap-2.5, card p-3; grafici/error/empty con p-4.
- **iPad (834px+):** padding px-6/py-5, header p-4 e titolo text-xl/sottotitolo text-sm; stats 3 colonne gap-4, card p-4, label text-xs, numeri text-xl; card grafici/error/empty con p-6 e testi text-base/text-sm.

### Misurazioni (`/home/progressi/misurazioni`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-4, pb-24, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back 44×44px, titolo text-lg, sottotitolo text-xs, bottone "Nuova Misurazione" min-h 44px. Card loading/error/empty con p-8; card Range Status con CardHeader/CardContent padding esplicito.
- **iPad (834px+):** padding px-6/py-5, header p-4, titolo text-xl, sottotitolo text-sm, bottone h-10 text-sm; card loading/error/empty p-12, testi text-base/text-sm; card Range Status px-5 pt-5 pb-5, titolo text-base.

### Chat (`/home/chat`)

- **Mobile (393×852):** rimosso min 402/874; layout flex colonna `w-full max-w-full`, minHeight `calc(100dvh - 56px)`. Header e footer con p-3, back 44×44px, titolo nome/ruolo text-sm e text-[10px]. Stati loading/error/empty/no-PT con stesso contenitore e padding responsive; card error/empty con p-6 e bottone Riprova min-h 44px. Footer input con safe-area-inset-bottom.
- **iPad (834px+):** header e footer p-4, back h-9 w-9, avatar h-9 w-9, titolo text-base e sottotitolo text-xs; card error p-8, card empty p-6; skeleton e messaggi con px-6.

### Documenti (`/home/documenti`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-4, pb-24, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back 44×44px, titolo text-lg, sottotitolo text-xs, bottone Carica min-h 44px. Stats 2 colonne gap-2.5; card Validi/In scadenza p-3; card empty e lista documenti con padding responsive; bottoni Visualizza/Nuovo min-h 44px; card info con p-2.5.
- **iPad (834px+):** padding px-6/py-5, header p-4, titolo text-xl, sottotitolo text-sm, Carica h-10 text-sm; stats gap-4 e card p-4, numeri text-xl e label text-xs; card empty py-8 px-6; card documento p-4; card info p-4 e titolo text-base, lista text-sm; bottoni h-10 e text-sm.

### Foto / Risultati (`/home/foto-risultati`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-4, pb-24, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back 44×44px, titolo text-lg, sottotitolo text-xs. Link “Aggiungi nuove foto” min-h 44px e p-4; galleria 2 colonne gap-2; card empty p-6; bottone Elimina 44×44px.
- **iPad (834px+):** padding px-6/py-5, header p-4, titolo text-xl, sottotitolo text-sm; link aggiungi p-5 e icona h-14; galleria 3 colonne gap-4, titoli sezione text-base, card empty p-8; bottone elimina h-9 w-9.

### Aggiungi foto (`/home/foto-risultati/aggiungi`)

- **Mobile (393×852):** stesso contenitore responsive; header back 44×44px, titolo text-lg, sottotitolo text-xs; griglia 3 colonne gap-2, card min-h 180px e p-3; bottone “Salva le foto” min-h 44px.
- **iPad (834px+):** padding px-6/py-5, header p-4, titolo text-xl; griglia gap-4, card p-4 e min-h 200px, label text-base; Salva le foto h-10 e text-base.

### Nutrizionista (`/home/nutrizionista`)

- **Mobile (393×852):** rimosso min 402/874; contenuto `w-full max-w-full`, padding px-3/py-4, pb-24, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header con back 44×44px, icona Salad e titolo text-lg, sottotitolo text-[10px]. Stats 2 colonne gap-2.5, card p-3; card Piano Nutrizionale e Info con padding esplicito; bottone Torna alla Home min-h 44px.
- **iPad (834px+):** padding px-6/py-5, header icona p-2.5 e h-5 w-5, titolo text-xl, sottotitolo text-xs; stats gap-4 e card p-4, numeri text-xl e label text-xs; CardHeader/CardContent p-4, titolo text-base; card info p-4 e testo text-sm.

### Massaggiatore (`/home/massaggiatore`)

- **Mobile (393×852):** rimosso min 402/874; stesso pattern Nutrizionista: contenuto `w-full max-w-full`, padding px-3/py-4, pb-24, minHeight `calc(100dvh - 56px)`, safe-area-inset-bottom. Header back 44×44px, icona Hand, titolo text-lg, sottotitolo text-[10px]. Stats 2 colonne gap-2.5, card p-3; card Dati Massaggi e Info con padding responsive; bottone Torna alla Home min-h 44px.
- **iPad (834px+):** padding px-6/py-5, header icona p-2.5 e h-5 w-5, titolo text-xl, sottotitolo text-xs; stats gap-4 e card p-4, numeri text-xl e label text-xs; CardHeader/CardContent p-4; card info p-4 e testo text-sm.

---

_Ultimo aggiornamento: febbraio 2025._
