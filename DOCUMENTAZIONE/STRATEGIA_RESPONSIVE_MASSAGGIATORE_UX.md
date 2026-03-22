# Strategia responsive e UX – Account Massaggiatore (e multi-ruolo)

**Riferimento viewport minimo:** 393×852 px (portrait), 852×393 px (landscape)  
**Scope analisi:** Dashboard massaggiatore e pagine raggiungibili da esso (Clienti, Chat, Calendario, Profilo, Impostazioni).

---

## FASE 1 – Analisi strutturale (pagine massaggiatore)

### 1.1 Navigazione e layout globale

| Elemento               | Situazione attuale                                                                                              | Rischio                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Sidebar**            | `hidden md:flex` → sotto 768px la sidebar **non è visibile** e non esiste alternativa (hamburger / bottom nav). | **Critico:** su 393px l’utente non può navigare tra Dashboard, Calendario, Clienti, Chat, Profilo, Impostazioni. |
| **Main content**       | `flex-1 flex flex-col min-h-0` con `overflow-auto`; nessun header fisso dedicato.                               | Su mobile il contenuto può “galleggiare” senza ancoraggio visivo.                                                |
| **Centratura desktop** | Contenuti con `max-w-[1800px] mx-auto` e `px-4 sm:px-6`.                                                        | Buona base; verificare che sidebar + main siano allineati e che non ci siano margini asimmetrici.                |

### 1.2 Pagina Dashboard Massaggiatore (`/dashboard/massaggiatore`)

| Elemento           | Situazione attuale                                               | Rischio                                                                                                              |
| ------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Container**      | `min-h-screen p-6`, `max-w-4xl mx-auto`, `space-y-6`.            | Su 393px `p-6` può ridurre troppo l’area utile; nessun adattamento esplicito per 393px.                              |
| **Griglia card**   | `grid grid-cols-1 md:grid-cols-2 gap-4`.                         | Sotto md una colonna: ok. Sublabel `text-[11px]` è **micro-font** (< 12px), sconsigliato per accessibilità e touch.  |
| **Card**           | `p-6`, icone 14×14 (h-14 w-14), testi `text-sm` / `text-[11px]`. | CTA “card” intera: buono per touch. Altezza e padding da ricalibrare per proporzioni mobile (più alte, meno larghe). |
| **Header sezione** | Titolo `text-3xl`, sottotitolo `text-base`, barra decorativa.    | Su 393px titolo può dominare; gerarchia da bilanciare.                                                               |

### 1.3 Pagina Clienti (`/dashboard/clienti`)

| Elemento          | Situazione attuale                                                           | Rischio                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Header**        | Titolo + azioni (Invita cliente, ecc.) in `flex-col sm:flex-row`.            | Su 393px i pulsanti possono andare in stack; verificare ordine e priorità (Invita cliente sempre accessibile).                       |
| **Toolbar**       | Filtri, ricerca, toggle table/grid.                                          | Densità elevata su mobile; rischio overflow orizzontale o CTA troppo vicine.                                                         |
| **Vista tabella** | Tabella HTML classica (`Table`, `TableRow`, celle multiple).                 | **Alto:** tabelle con molte colonne generano **scroll orizzontale** e celle illeggibili su 393px.                                    |
| **Vista griglia** | Card clienti.                                                                | Più adatta al mobile; verificare dimensioni card, font e tap target (min 44px).                                                      |
| **KPI**           | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, `gap-3 sm:gap-4 lg:gap-6`. | Su 393px una colonna: ok. Valori e label devono restare leggibili (no micro-font); proporzioni “più alti che larghi” da definire.    |
| **Modali**        | CreaAtleta, ModificaAtleta, InvitaCliente, FiltriAvanzati, BulkActions.      | Verificare che su 393px non escano dallo schermo (max-width, padding, no overflow orizzontale) e che CTA siano sempre raggiungibili. |

### 1.4 Pagina Calendario (`/dashboard/calendario`)

| Elemento              | Situazione attuale                                                                    | Rischio                                                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**            | `h-[calc(100vh-64px)] flex`; aside **`hidden lg:flex`** 280px; main con CalendarView. | **Critico:** sotto 1024px la **sidebar sinistra scompare** (cerca, filtri, mini-calendario, prossimi appuntamenti) **senza alternativa** per mobile. Su 393px l’utente perde ricerca, filtri e lista “Prossimi appuntamenti”. |
| **CalendarView**      | FullCalendar o simile in `flex-1`.                                                    | Su 393px le celle e gli eventi possono essere troppo piccoli; densità e touch da ricalibrare.                                                                                                                                 |
| **Modal form**        | `max-w-md`; contenuto form con campi multipli.                                        | Su 393px può essere stretto o causare scroll; assicurare label sopra input, full-width, CTA in basso sempre visibili (anche con tastiera aperta).                                                                             |
| **Popover dettaglio** | Posizionamento a coordinate.                                                          | Rischio che esca dallo viewport su mobile; preferibile modal/drawer a tutta larghezza sotto 852px.                                                                                                                            |

### 1.5 Pagina Chat (`/dashboard/chat`)

| Elemento    | Situazione attuale                                                        | Rischio                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Layout**  | Due colonne: lista conversazioni `lg:w-[320px]` + area messaggi `flex-1`. | Su 393px le due colonne devono diventare **una sola** (lista **oppure** conversazione), con navigazione chiara (es. back da chat a lista). |
| **Altezze** | `min-h-0`, `flex-1`, `overflow-hidden`.                                   | Verificare che input messaggio e CTA invio restino sempre visibili e raggiungibili (anche con tastiera virtuale).                          |

### 1.6 Pagina Profilo e Impostazioni

| Elemento                 | Situazione attuale                       | Rischio                                                                                  |
| ------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Form e campi**         | Da verificare in dettaglio.              | Regola generale: label sopra input, input full-width, spaziatura adeguata, CTA min 44px. |
| **Allineamento desktop** | Stesso pattern `max-w-[1800px] mx-auto`. | Coerenza con Clienti/Calendario.                                                         |

### 1.7 Riepilogo criticità

- **Sidebar nascosta sotto md:** nessuna navigazione su smartphone (393px).
- **Calendario: sidebar nascosta sotto lg:** niente ricerca/filtri/prossimi su mobile.
- **Tabelle Clienti:** scroll orizzontale e leggibilità scarsa su 393px.
- **Micro-font:** es. sublabel 11px sulla dashboard massaggiatore; da eliminare sotto soglia mobile.
- **Modali e popover:** rischio overflow e CTA fuori viewport su 393px.
- **KPI e card:** proporzioni e gerarchia da ricalibrare per mobile (non solo “ridotte”).

---

## FASE 2 – Strategia responsive mobile

### 2.1 Breakpoint di riferimento

- **Mobile portrait:** &lt; 393px (estremo), 393–767px (target).
- **Mobile landscape / tablet stretto:** 393–851px in larghezza (altezza 393px).
- **Tablet / desktop:** ≥ 852px (e ≥ 768px per sidebar visibile se si mantiene `md`).

Definire una soglia unica “mobile” (es. **852px**) sotto la quale applicare layout a **colonna singola** e pattern “mobile-first” descritti sotto.

### 2.2 Layout sotto 852px

- **Una sola colonna** per contenuto principale; niente griglie multi-colonna per contenuti primari.
- **Niente scroll orizzontale:** nessun contenuto con larghezza fissa o min-width che superi 100vw; tabelle sostituite o trasformate (vedi sotto).
- **Spaziatura verticale aumentata** tra sezioni (es. `space-y-6` → `space-y-8` su mobile) per ridurre densità.
- **Contenuti chiave in alto:** KPI/azioni principali subito visibili; blocchi secondari sotto.
- **Navigazione sempre disponibile:** sostituire la sidebar nascosta con **menu mobile** (hamburger + drawer) o **bottom navigation** (es. 4–5 voci: Dashboard, Calendario, Clienti, Chat, Profilo/Altro).

### 2.3 Ricalibrazione proporzioni mobile

- **KPI:**
  - Card più **alte** che larghe; numero/valore centrale e ben leggibile (font size dedicato, es. scala “mobile”); testo secondario ridotto ma **≥ 12px**.
  - Padding card aumentato; margini verticali tra card più generosi.

- **Card generiche:**
  - Padding interno adatto al touch (min 16px); margini verticali tra card ≥ 12px.
  - Gerarchia: titolo principale → sottotitolo → azioni; evitare testi lunghi in corpo piccolo.

- **Font:**
  - Titoli: leggibili e proporzionati (es. scala ridotta ma non “schiacciata”).
  - Testo secondario: semplificato, **nessun font &lt; 12px** su mobile.
  - Eliminare micro-font (es. 11px) ovunque sotto la soglia mobile.

- **Icone:**
  - Dimensioni coerenti (es. 20–24px per icone principali); non dominanti; allineate al testo.

- **Pulsanti e CTA:**
  - **Larghezza 100%** dove è l’azione principale (es. “Invita cliente”, “Crea appuntamento”).
  - **Altezza minima 44px** per area di tap.
  - Distanza tra CTA adiacenti ≥ 8px per evitare tap accidentali.

### 2.4 Tabelle

- **Sotto 852px:** non usare tabelle HTML con molte colonne.
- **Alternative:**
  - **Card verticali:** una card per riga, campi impilati (es. Nome, Email, Stato, Azioni).
  - **Liste espandibili:** riga compatta con info principale; tap per espandere dettaglio secondario.
- Regole:
  - Nessuna “micro-colonna”; dati essenziali visibili subito; dettagli secondari in espansione o pagina dettaglio.

### 2.5 Dashboard (hub e pagine con KPI)

- **Mobile:**
  - KPI principali in alto (1 colonna).
  - Blocchi secondari (liste, azioni rapide) sotto.
  - Zero affollamento; numeri chiave in evidenza (dimensione e contrasto).

### 2.6 Form (modali e pagine)

- **Input:** full width; **label sopra** l’input.
- **Spaziatura:** tra un campo e l’altro ≥ 12px (meglio 16px).
- **CTA principale:** sempre visibile (sticky in basso o subito dopo gli ultimi campi); altezza min 44px.
- **Tastiera mobile:** evitare che il CTA principale resti coperto dalla tastiera (es. scroll automatico o layout che lasci spazio in basso).

---

## FASE 3 – Desktop e tablet “perfection”

### 3.1 Centratura e max-width

- **Contenuto principale:** `max-w-[1800px] mx-auto` (o valore coerente) su tutte le pagine staff.
- **Margini laterali:** simmetrici (es. `px-4 sm:px-6` o equivalente); nessun padding asimmetrico.

### 3.2 Sidebar

- Larghezza fissa (es. 256px estesa, 80px collassata); nessun “fluttuare” del contenuto quando si espande/riduce.
- Main content con `flex-1 min-w-0` per evitare overflow; layout che non dipende da viewport non definiti.

### 3.3 Griglie

- **KPI:** 2 colonne (sm), 4 colonne (lg) con gap uniforme; nessuna colonna visivamente più “pesante”.
- **Card dashboard:** 2 colonne (md) con gap coerente; allineamento a griglia.

### 3.4 Verifiche

- Header (se presente) centrato rispetto al contenuto.
- Nessuno spazio vuoto sbilanciato a sinistra/destra.
- Tabella (dove ancora usata) con colonne proporzionate e leggibili.

---

## FASE 4 – Design system adattivo

### 4.1 Scale tipografiche mobile

- Introdurre una **scala font “mobile”** (es. per titoli h1/h2, corpo, secondario, caption) con valori **≥ 12px** per tutto il testo leggibile.
- Sotto 852px usare questa scala invece di ridurre in modo arbitrario i valori desktop.

### 4.2 Spaziatura verticale mobile

- **Scala spacing mobile:** valori leggermente superiori alla scala desktop per sezioni e card (es. `space-y-6` → `space-y-8`, padding card `p-6` → `p-5` o `p-6` ma con gap aumentato).
- Documentare in design system: “sotto 852px usare scala spacing mobile”.

### 4.3 Card e radius

- **Radius:** mantenere coerenza (es. `rounded-2xl` card); su mobile evitare radius eccessivi che riducano l’area utile.
- **Ombre:** leggere su mobile per non appesantire; stesso principio “mobile” nel design system.

### 4.4 Colori e leggibilità

- Contrasto sufficiente per testi (WCAG AA); stato focus visibile per link e CTA.
- Gerarchia: primario / secondario / terziario chiara anche su sfondo scuro.

### 4.5 KPI mobile-optimized

- **Variante “compact” o “mobile”** delle KPI card:
  - Layout verticale (icona + valore + label).
  - Font valore grande e leggibile; label ridotta ma ≥ 12px.
  - Altezza minima per touch (es. 44px) se la card è cliccabile.

---

## Pattern aggiornati (riepilogo)

| Contesto          | Desktop / tablet                       | Mobile (&lt; 852px)                                               |
| ----------------- | -------------------------------------- | ----------------------------------------------------------------- |
| **Navigazione**   | Sidebar fissa (md+)                    | Menu hamburger o bottom nav; sempre visibile.                     |
| **Dashboard hub** | Griglia 2 col, card compatte           | 1 col, card più alte, sublabel ≥ 12px.                            |
| **Clienti**       | Tabella o griglia; toolbar orizzontale | Solo griglia/card; toolbar compatto o in drawer.                  |
| **Calendario**    | Sidebar 280px + calendar               | Solo calendar; filtri/cerca/prossimi in drawer o barra superiore. |
| **Chat**          | Due colonne (lista + chat)             | Una colonna; lista **o** conversazione con back.                  |
| **Form / modali** | max-width moderato, centrato           | Full-width con margini; CTA in basso sticky o subito visibili.    |
| **KPI**           | Griglia 2/4 col, card orizzontali      | 1 col, card “alte”, numeri in evidenza.                           |

---

## Checklist di validazione finale

Per **ogni** pagina accessibile al massaggiatore (Dashboard, Clienti, Chat, Calendario, Profilo, Impostazioni):

- [ ] **Zero scroll orizzontale** a 393px e a 852px (landscape).
- [ ] **KPI e numeri** leggibili (font e contrasto) a 393px.
- [ ] **CTA principali** facilmente cliccabili (min 44px, distanza adeguata).
- [ ] **Layout stabile** a 393px (nessun elemento tagliato o sovrapposto).
- [ ] **Layout stabile** a 852px in landscape (stesso criterio).
- [ ] **Desktop** contenuto centrato, max-width coerente, margini simmetrici.
- [ ] **Spaziatura** coerente (stessa scala per sezioni equivalenti).
- [ ] **Navigazione** sempre disponibile su mobile (menu o bottom nav).
- [ ] **Calendario:** ricerca/filtri/prossimi accessibili su mobile (drawer/toolbar).
- [ ] **Nessun font &lt; 12px** su viewport mobile.

---

## Note operative

- **Nessuna modifica diretta al codice** in questo documento: solo strategia, regole e linee guida.
- Implementazione: applicare le regole per breakpoint &lt; 852px e 393px; poi verificare con la checklist.
- Priorità: prima **navigazione mobile** (sidebar → menu/bottom nav), poi **Calendario** (sidebar → alternativa mobile), poi **Clienti** (tabella → card/liste), infine ricalibrazione proporzioni e design system.
