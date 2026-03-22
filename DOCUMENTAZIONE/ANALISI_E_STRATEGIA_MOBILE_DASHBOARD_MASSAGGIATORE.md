# Analisi e strategia UX/UI mobile – Dashboard Massaggiatore

**Viewport minimi:** Portrait 393×852 px · Landscape 852×393 px  
**Pagine in scope:** `/dashboard/massaggiatore`, `/dashboard/calendario`, `/dashboard/clienti`, `/dashboard/chat`, `/dashboard/profilo`, `/dashboard/impostazioni` (inclusi moduli, modali, drawer, form e componenti interni).

**Nota:** Solo analisi e strategia operativa. Nessun codice, nessuna modifica diretta ai file.

---

## FASE 1 – Analisi completa per pagina

### 1.1 `/dashboard/massaggiatore` (Home ruolo)

| Area                 | Situazione attuale                                                                                                                              | Problemi rilevati                                                                                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**           | Container `min-h-screen w-full min-w-0`; contenuto `max-w-4xl mx-auto`; griglia `grid-cols-1 md:grid-cols-2`.                                   | Su 393px una colonna ok. Padding `p-4 sm:p-6` accettabile; verificare che non ci sia spazio morto laterale residuo.                                                                   |
| **Header sezione**   | Blocco con titolo (Hand + "Massaggiatore"), sottotitolo, barra decorativa.                                                                      | Titolo `text-2xl sm:text-3xl`: su 393px può essere dominante; gerarchia da mantenere senza compressione.                                                                              |
| **Card navigazione** | 4 card (Clienti, Chat, Calendario, Profilo); Link con `min-h-[120px]`, `p-5 sm:p-6`, icone 12×12 sm 14×14, label `text-sm`, sublabel `text-xs`. | Sublabel `text-xs` (12px): al limite; evitare ulteriori riduzioni. Hover `-translate-y-1` su mobile inutile: preferire solo feedback tap. Tap area della card è l’intera card: buono. |
| **Spaziature**       | `space-y-6 sm:space-y-8`, `gap-4 sm:gap-5`.                                                                                                     | Coerenti; su 393px aumentare leggermente gap verticale tra card se la densità risulta alta.                                                                                           |
| **CTA**              | Ogni card è un CTA full-width.                                                                                                                  | Altezza min 120px rispetta buone pratiche; nessun CTA secondario da raggiungere.                                                                                                      |

**Riepilogo problemi:** Nessun overflow orizzontale evidente. Possibili migliorie: vista default “giorno” o “agenda” su mobile per il calendario (se linkato); rimozione hover-translate su touch; eventuale scala tipografica mobile dedicata per sublabel.

---

### 1.2 `/dashboard/calendario`

| Area                  | Situazione attuale                                                                                                                                    | Problemi rilevati                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**            | Altezza `h-[calc(100vh-3.5rem)]`; sotto `lg` sidebar nascosta; FAB in basso a destra apre Drawer “Filtri e prossimi”; main = CalendarView full width. | Layout a colonna singola su mobile ok. Drawer overlay già previsto.                                                                                                                                                                                  |
| **CalendarView**      | FullCalendar; vista iniziale `dayGridMonth`; plugin dayGrid, timeGrid, list. Viste: Mese, Settimana, Giorno, Agenda.                                  | **Critico:** su 393px la vista **Mese** ha celle molto piccole; testi eventi illeggibili o troncati; tap su celle/eventi difficili. Vista **Settimana** e **Giorno** altrettanto dense. **Agenda** (listWeek) più adatta al mobile ma non è default. |
| **Drawer filtri**     | Drawer sinistro 280px max 90vw con ricerca, filtro atleta, MiniCalendar, lista “Prossimi appuntamenti”.                                               | Input e select con `min-h-[44px]`: ok. Lista prossimi: voci con tap area adeguata. Chiusura drawer su selezione appuntamento: ok.                                                                                                                    |
| **Modal form**        | Form nuovo/modifica appuntamento in modal; su mobile `items-end`, full width, `max-h-[90dvh]`, `rounded-t-2xl`, padding `p-4`.                        | Rischio: form lungo (atleta, data, ora, tipo, colore, luogo, note) con scroll; CTA “Crea appuntamento” devono restare raggiungibili con tastiera aperta. Label/input da verificare full-width e label sopra.                                         |
| **Popover dettaglio** | AppointmentPopover con posizione a coordinate.                                                                                                        | Su viewport stretti il popover può uscire dallo schermo; preferibile sotto 852px sostituire con modal/drawer full-width.                                                                                                                             |
| **FAB**               | Pulsante 56×56 fixed bottom-right per aprire drawer.                                                                                                  | Tap target ok; z-index da coordinare con altri overlay.                                                                                                                                                                                              |

**Riepilogo problemi:** Vista calendario troppo densa su 393px (celle e testi piccoli); nessuna vista “agenda/giorno” come default mobile; popover dettaglio a rischio overflow; form lungo con CTA da tenere visibili sopra la tastiera.

---

### 1.3 `/dashboard/clienti`

| Area              | Situazione attuale                                                                                                                                                                     | Problemi rilevati                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**        | Container `max-w-[1800px] mx-auto`, `space-y-10`, `px-4 sm:px-6`. Header + Toolbar + contenuto (tabella o griglia) + KPI in basso.                                                     | Su mobile colonna singola; effetto “vista forzata a griglia” sotto 768px già previsto: riduce rischio scroll orizzontale.                                                  |
| **Header**        | Titolo “Clienti”, sottotitolo, CTA (Invita cliente / Aggiungi atleta in base al ruolo). `flex-col sm:flex-row`, `flex-wrap gap-2`.                                                     | Su 393px i pulsanti vanno in stack; “Invita cliente” ha `min-h-[44px]`: ok. Verificare ordine e che il CTA principale resti in evidenza.                                   |
| **Toolbar**       | ClientiToolbar: Input ricerca (h-12), filtri Tutti/Attivi/Inattivi, Filtri avanzati, toggle Griglia/Tabella, Export. Due righe: prima ricerca + filtri, seconda toggle vista + export. | Densità alta; pulsanti `size="sm"` potrebbero avere tap target sotto 44px. Rischio overflow se tutto resta su una riga sotto 393px.                                        |
| **Vista tabella** | ClientiTableView: tabella con checkbox, nome, email, stato, data, azioni (dropdown). Molte colonne.                                                                                    | **Critico:** sotto 768px la vista è forzata a griglia, ma se l’utente avesse ancora tabella (es. resize da desktop) si avrebbe **scroll orizzontale** e celle illeggibili. |
| **Vista griglia** | ClientiGridView: card per cliente.                                                                                                                                                     | Più adatta al mobile; verificare altezza card, font, e che azioni (Chat, Email, ecc.) abbiano min 44px.                                                                    |
| **KPI**           | 4 ModernKPICard in griglia `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.                                                                                                                | Su 393px una colonna; valori numerici e label devono restare leggibili (no micro-font); proporzioni “più alte che larghe” da confermare.                                   |
| **Modali**        | CreaAtleta, ModificaAtleta, InvitaCliente, FiltriAvanzati, BulkActions (lazy).                                                                                                         | Verificare su 393px: max-width, padding, assenza overflow orizzontale, CTA sempre visibili e min 44px.                                                                     |

**Riepilogo problemi:** Toolbar con molti controlli e possibile overflow o tap target piccoli; tabella da evitare del tutto sotto 852px (solo griglia/card); modali da validare su 393px.

---

### 1.4 `/dashboard/chat`

| Area                    | Situazione attuale                                                                                                        | Problemi rilevati                                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**              | Due colonne: lista conversazioni `w-full lg:w-[320px]` + area messaggi `flex-1`; stesso livello in `flex gap-4 sm:gap-6`. | **Critico:** sotto `lg` (1280px) le due colonne restano **affiancate** (w-full + flex-1); su 393px lista e area chat sono **entrambe visibili ma strettissime** o una domina. Non c’è pattern “lista full width → tap → conversazione full width” con back. |
| **Lista conversazioni** | ConversationList in pannello 320px su lg; su mobile con w-full condivide lo spazio con l’area messaggi.                   | Su 393px occorre **una sola vista** (lista **oppure** conversazione) con navigazione esplicita (es. back dalla chat alla lista).                                                                                                                            |
| **Area messaggi**       | MessageList + MessageInput in basso (`shrink-0`, `border-t`, `px-4 py-3 sm:p-4`).                                         | Input sempre in fondo: buono. Con tastiera virtuale aperta l’input può essere coperto; area scrittura e CTA invio devono restare accessibili (scroll o posizionamento).                                                                                     |
| **Stato vuoto**         | “Seleziona una conversazione” con icona e testo.                                                                          | Centrato; su mobile ok se la vista è lista-first.                                                                                                                                                                                                           |
| **Header**              | Titolo Chat, pulsante Indietro, badge non letti.                                                                          | Pulsante back utile per tornare alla lista da conversazione; verificare min 44px.                                                                                                                                                                           |

**Riepilogo problemi:** Layout a due colonne non adattato a 393px (manca vista singola con switch lista/chat); input e CTA invio da tenere sopra la tastiera; pattern “lista → tap → chat → back” da definire e applicare sotto 852px.

---

### 1.5 `/dashboard/profilo`

| Area                             | Situazione attuale                                                                                                                                                         | Problemi rilevati                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Layout**                       | Container `max-w-[1800px] mx-auto`, `space-y-4 sm:space-y-6`, `px-4 sm:px-6`. Header + eventuale messaggio success + Tabs (Profilo, Notifiche, Impostazioni) + TabContent. | Struttura verticale adatta al mobile.                                                                    |
| **Tabs**                         | TabsList variant pills; TabsTrigger con icona + testo (Profilo, Notifiche, Impostazioni).                                                                                  | Su 393px i tab possono andare in wrap o diventare troppo piccoli; verificare tap 44px e leggibilità.     |
| **Tab Profilo**                  | PTProfileTab (lazy): form profilo (nome, cognome, email, phone, specializzazione, certificazioni, Modifica/Salva/Annulla).                                                 | Input e label: verificare label sopra input, input full width, pulsanti full width e min 44px su mobile. |
| **Tab Notifiche / Impostazioni** | Contenuti lazy; impostazioni con toggle e sezioni.                                                                                                                         | Stesse regole: input full width, toggle grandi, sezioni separabili (es. collapsible).                    |
| **Avatar**                       | Se presente in PTProfileTab.                                                                                                                                               | Centrato e proporzionato; nessun elemento troppo piccolo.                                                |

**Riepilogo problemi:** Verificare che tutti i form (profilo, notifiche, impostazioni) abbiano label sopra, full width, CTA 44px e spaziatura adeguata; tab non devono essere troppo compressi su 393px.

---

### 1.6 `/dashboard/impostazioni`

| Area              | Situazione attuale                                                                                                             | Problemi rilevati                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**        | Tabs (Profilo, Notifiche, Privacy, Account, Trainer profile); contenuti lazy per tab.                                          | Lista sezioni e tab: su mobile layout a colonna singola; verificare che i tab non creino overflow orizzontale.                         |
| **Form e toggle** | SettingsProfileTab, SettingsNotificationsTab (toggle notifiche), SettingsPrivacyTab, SettingsAccountTab, change password, 2FA. | Toggle devono essere grandi (min 44px area tap); label e testo secondario leggibili (no micro-font); feedback visivo chiaro al cambio. |
| **Sezioni**       | Più card/sezioni per categoria.                                                                                                | Separazione visiva chiara; eventuale pattern collapsible per ridurre densità su mobile.                                                |
| **Modali**        | Change password, 2FA setup, ecc.                                                                                               | Full width su mobile, CTA sempre visibili, nessun overflow.                                                                            |

**Riepilogo problemi:** Toggle e controlli form devono rispettare 44px; testi secondari non troppo lunghi o piccoli; sezioni eventualmente collapsible; modali adattate a 393px.

---

### 1.7 Componenti condivisi (modali, drawer, form)

| Componente                                                     | Uso                                    | Problemi rilevati                                                                                                                                                                                                   |
| -------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Drawer (UI)**                                                | Navigazione mobile, Filtri calendario. | z-[100]; overlay ok. Larghezza 280px max 85–90vw; contenuti con min-h-[44px] dove serve.                                                                                                                            |
| **AppointmentForm**                                            | Modal nuovo/modifica appuntamento.     | Molti campi (atleta, data, ora, tipo, colore, luogo, note); su 393px il wrapper è full width con max-h 90dvh e padding; CTA in basso: assicurare che restino visibili con tastiera aperta (scroll o sticky footer). |
| **InvitaClienteModal / CreaAtletaModal / ModificaAtletaModal** | Clienti.                               | Stesse regole: full width sotto 852px, label sopra, CTA 44px, nessun overflow.                                                                                                                                      |
| **AppointmentPopover**                                         | Dettaglio evento calendario.           | Posizione a coordinate: su 393px sostituire con modal/drawer full width per evitare fuori viewport.                                                                                                                 |
| **ClientiFiltriAvanzati**                                      | Drawer/modal filtri.                   | Se drawer: full height e scroll interno; se modal: full width mobile.                                                                                                                                               |
| **ModernKPICard**                                              | Clienti (e altre dashboard).           | Su mobile: card più alte che larghe, numero leggibile, label ≥ 12px; tap target se cliccabili.                                                                                                                      |

---

## FASE 2 – Strategia mobile globale

### 2.1 Layout

- **Sotto 852px:** colonna singola obbligatoria per contenuto principale; nessuna griglia multi-colonna per contenuti primari.
- **Nessuno scroll orizzontale:** nessun elemento con larghezza fissa o min-width che superi 100vw; tabelle sostituite da card/lista.
- **Sidebar:** sotto `md` solo Drawer overlay (già previsto); contenuto main a tutta larghezza.
- **Header:** compatto (es. h-14), full width; CTA essenziali sempre visibili.
- **Spaziatura verticale:** aumentata tra sezioni su mobile (es. space-y-6 → space-y-8 sotto 852px).
- **CTA principali:** sempre visibili senza scroll orizzontale; priorità in alto dove possibile.

### 2.2 Regole proporzionali (393×852 e 852×393)

- **Pulsanti / CTA:** min height 44px; distanza tra CTA adiacenti ≥ 8px.
- **Card:** padding aumentato (es. p-5–6); margini verticali tra card ≥ 12px; nessun micro-font (tutto ≥ 12px).
- **KPI:** proporzione “più alti che larghi”; numero centrale leggibile; label secondaria ridotta ma ≥ 12px.
- **Icone:** dimensioni coerenti (es. 20–24px); non dominanti; allineate al testo.
- **Font:** titoli proporzionati; testo secondario ≥ 12px; eliminare font &lt; 12px su mobile.
- **Densità:** evitare troppi blocchi in una sola colonna; preferire sezioni collapsible o step successivi.

---

## Pagina per pagina – Strategia mobile

### 1. `/dashboard/massaggiatore`

- **Obiettivo:** Menu principale chiaro; card grandi e touch-friendly.
- **Card:** full width (già); spaziatura verticale aumentata; icona centrata; titolo ben leggibile; descrizione con `text-xs` (12px) minimo; su touch rimuovere effetto hover translate o limitarlo a `active`; tap area 100% della card.
- **Verifiche:** Allineamento centrato; nessuna compressione testo; padding coerente (p-4 sm:p-6); nessun overflow.

### 2. `/dashboard/calendario`

- **Problemi tipici:** Griglia troppo densa; celle piccole; eventi illeggibili.
- **Mobile redesign:** Vista **agenda (listWeek)** o **giorno (timeGridDay)** come default sotto 852px (non mese); eventi in lista/card; tap su evento → dettaglio in modal/drawer full width (non popover a coordinate); scroll verticale naturale.
- **Landscape 852×393:** Vista settimana compatta solo se colonne ancora leggibili; altrimenti mantenere agenda/giorno.
- **Form appuntamento:** Full width; CTA “Crea appuntamento” / “Annulla” sticky in basso o subito dopo ultimo campo; scroll interno senza nascondere CTA; considerare `scroll-margin` o padding-bottom per tastiera.
- **FAB filtri:** Mantenere; z-index sotto al modal form.

### 3. `/dashboard/clienti`

- **Problemi:** Tabella illeggibile; troppe colonne.
- **Mobile redesign:** Solo **lista verticale / card clienti** sotto 852px (niente tabella); card con nome + stato + CTA primaria (es. Chat / Email) visibili; info secondarie in espansione o pagina dettaglio; ricerca sticky in alto; toolbar con filtri in una o due righe con wrap; pulsanti toolbar e toggle Griglia/Tabella con min 44px dove possibile.
- **KPI:** Una colonna; card alte; numeri leggibili.

### 4. `/dashboard/chat`

- **Priorità:** Mobile-first.
- **Regole:** Sotto 852px **vista singola**: lista chat full width **oppure** conversazione full width; tap su conversazione → nascondere lista e mostrare area messaggi con pulsante “Indietro” per tornare alla lista; lista full width; altezza area messaggi ottimizzata; input sempre visibile; area scrittura e CTA invio sopra tastiera (layout o scroll); nessun elemento fuori viewport.
- **Landscape:** Due pannelli solo se larghezza sufficiente e leggibili; altrimenti vista singola con switch.

### 5. `/dashboard/profilo`

- **Mobile redesign:** Sezioni verticali; input full width; label sopra input; pulsanti full width e min 44px; avatar centrato; separazione visiva chiara tra sezioni; tab orizzontali con scroll o wrap senza micro-font.

### 6. `/dashboard/impostazioni`

- **Mobile:** Lista sezioni; toggle grandi (min 44px); niente testo secondario troppo lungo; sezioni eventualmente collapsible; feedback visivo chiaro su modifiche; modali (password, 2FA) full width e CTA sempre visibili.

---

## FASE 3 – Controllo desktop e tablet

### Desktop (≥ 1280px)

- Contenuto centrato con `max-w-[1800px] mx-auto`; margini simmetrici (`px-4 sm:px-6`).
- Sidebar proporzionata; main con `flex-1 min-w-0`; nessun contenuto “fluttuante”.
- KPI in griglia 2/4 colonne distribuite in modo armonico; nessuna colonna visivamente sbilanciata.
- Tabelle (dove ancora usate) con colonne proporzionate e leggibili.

### Tablet (768px – 1023px)

- Layout intermedio: sidebar visibile (md); contenuti a 1–2 colonne dove ha senso; spaziatura coerente con breakpoint.
- Calendario: sidebar 280px + calendar; oppure solo calendar con FAB filtri se si preferisce coerenza con mobile.
- Chat: due colonne solo se larghezza sufficiente (es. ≥ 1024px); sotto mantenere vista singola.

### Verifiche trasversali

- Header centrato; nessuno spazio vuoto asimmetrico.
- Griglie con gap uniforme; allineamenti coerenti.

---

## FASE 4 – Design system check

### Scala spacing mobile

- Introdurre (o documentare) una scala “mobile” per padding e gap: valori leggermente superiori al desktop per sezioni e card sotto 852px (es. `space-y-8`, `gap-5`).
- Applicare in modo coerente a tutte le pagine in scope.

### Tipografia mobile

- Scala font “mobile”: titoli (h1/h2), corpo, secondario, caption con valori **≥ 12px** per tutto il testo leggibile.
- Sotto 852px usare questa scala invece di ridurre arbitrariamente i valori desktop.

### Radius e ombre

- Radius coerente (es. rounded-2xl card); su mobile evitare radius eccessivi che riducano area utile.
- Ombre leggere su mobile per non appesantire.

### Gerarchia colore

- Contrasto sufficiente (WCAG AA); focus visibile per link e CTA; gerarchia primario/secondario/terziario chiara su sfondo scuro.

### KPI mobile

- Variante “mobile” delle KPI card: layout verticale (icona + valore + label); font valore grande; label ≥ 12px; altezza minima 44px se la card è cliccabile.

---

## Checklist finale di validazione

Per **ogni** pagina e per **tutti** i moduli/modali/drawer/form interni:

- [ ] **Nessuno scroll orizzontale** a 393px e a 852px landscape.
- [ ] **Layout stabile** a 393px (nessun elemento tagliato o sovrapposto).
- [ ] **Layout stabile** a 852px landscape (stesso criterio).
- [ ] **CTA** facilmente cliccabili (min 44px, distanza adeguata).
- [ ] **KPI** leggibili (font e contrasto).
- [ ] **Font** proporzionati (nessun micro-font &lt; 12px).
- [ ] **Desktop** centrato (max-width coerente, margini simmetrici).
- [ ] **Tablet** layout armonico (2 colonne solo se leggibili).
- [ ] **Spaziatura** coerente tra sezioni equivalenti.
- [ ] **Calendario:** vista default mobile = agenda o giorno; dettaglio evento = modal/drawer (non popover).
- [ ] **Chat:** sotto 852px vista singola (lista o conversazione) con back.
- [ ] **Clienti:** sotto 852px solo griglia/card; nessuna tabella.
- [ ] **Modali/drawer:** full width sotto 852px; CTA sempre visibili; form con label sopra e input full width.

---

## Riepilogo priorità implementative

1. **Calendario:** Vista default mobile = listWeek o timeGridDay; sostituire popover dettaglio con modal/drawer sotto 852px; form con CTA visibili con tastiera aperta.
2. **Chat:** Layout a vista singola sotto 852px (lista ↔ conversazione con back); input e CTA invio sopra tastiera.
3. **Clienti:** Nascondere o disabilitare tabella sotto 852px; toolbar con tap 44px e wrap; modali full width.
4. **Massaggiatore:** Confermare full width e rimuovere/adeguare hover su touch.
5. **Profilo e Impostazioni:** Form e toggle con regole full width, 44px, label sopra; tab e sezioni adattati.
6. **Design system:** Documentare scala spacing e tipografia mobile; variante KPI mobile; applicare in modo coerente.
