# 📅 Calendario 22Club - Documentazione Completa

> **Versione**: 3.0  
> **Ultimo aggiornamento**: 14 Gennaio 2026  
> **Stile UI/UX**: Google Calendar Dark Mode

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Architettura](#architettura)
3. [Funzionalità Principali](#funzionalità-principali)
4. [Interfaccia Utente](#interfaccia-utente)
5. [Gestione Appuntamenti](#gestione-appuntamenti)
6. [Ricerca e Filtri](#ricerca-e-filtri)
7. [Scorciatoie Tastiera](#scorciatoie-tastiera)
8. [Colori Appuntamenti](#colori-appuntamenti)
9. [API e Hook](#api-e-hook)
10. [File e Struttura](#file-e-struttura)

---

## 🎯 Panoramica

Il calendario 22Club è un sistema completo per la gestione degli appuntamenti tra trainer e atleti. Ispirato a Google Calendar, offre un'esperienza utente moderna e intuitiva con supporto per:

- **4 viste** diverse (Mese, Settimana, Giorno, Agenda)
- **Drag & Drop** per spostare appuntamenti
- **Resize** per modificare la durata
- **12 colori** personalizzabili
- **Ricerca** in tempo reale
- **Filtri** per atleta
- **Scorciatoie tastiera** per power users

---

## 🏗️ Architettura

```
src/
├── app/dashboard/calendario/
│   └── page.tsx                 # Pagina principale
├── components/calendar/
│   ├── index.ts                 # Exports
│   ├── calendar-view.tsx        # Vista FullCalendar
│   ├── appointment-form.tsx     # Form crea/modifica
│   ├── appointment-popover.tsx  # Popover dettagli
│   ├── appointment-detail.tsx   # Dettagli completi
│   ├── mini-calendar.tsx        # Mini calendario sidebar
│   └── appointments-table.tsx   # Vista tabella
├── hooks/calendar/
│   └── use-calendar-page.ts     # Hook gestione dati
├── types/
│   └── appointment.ts           # Tipi TypeScript
└── styles/
    └── fullcalendar-theme.css   # Tema personalizzato
```

---

## ⚡ Funzionalità Principali

### Viste Calendario

| Vista         | Descrizione                            | Shortcut |
| ------------- | -------------------------------------- | -------- |
| **Mese**      | Panoramica mensile con eventi compatti | `M`      |
| **Settimana** | Griglia oraria settimanale             | `W`      |
| **Giorno**    | Dettaglio singola giornata             | `D`      |
| **Agenda**    | Lista cronologica eventi               | `A`      |

### Interazioni

| Azione                               | Descrizione                              |
| ------------------------------------ | ---------------------------------------- |
| **Click su evento**                  | Apre popover con dettagli                |
| **Click su giorno (mese)**           | Passa alla vista giorno                  |
| **Click su slot (settimana/giorno)** | Apre form nuovo appuntamento             |
| **Drag evento**                      | Sposta appuntamento a nuova data/ora     |
| **Resize evento**                    | Modifica durata appuntamento             |
| **Selezione intervallo**             | Crea appuntamento con orari preimpostati |

### Navigazione

| Azione     | Descrizione             | Shortcut |
| ---------- | ----------------------- | -------- |
| Oggi       | Torna alla data odierna | `T`      |
| Precedente | Periodo precedente      | `←`      |
| Successivo | Periodo successivo      | `→`      |

---

## 🎨 Interfaccia Utente

### Layout Principale

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│  [Oggi] [◄] [►]  Gennaio 2026    [Mese][Sett][Giorno][Agenda]│
├──────────────┬──────────────────────────────────────────────┤
│   SIDEBAR    │                                              │
│              │                                              │
│ 🔍 Ricerca   │              CALENDARIO                      │
│              │                                              │
│ 📋 Filtro    │           (FullCalendar)                     │
│    atleta    │                                              │
│              │                                              │
│ 📅 Mini-cal  │                                              │
│              │                                              │
│ 📌 Prossimi  │                                              │
│              │                                              │
│ ⌨️ Shortcuts │                                        [+]   │
└──────────────┴──────────────────────────────────────────────┘
```

### Componenti UI

#### Header

- **Bottone "Oggi"**: Torna alla data corrente
- **Frecce navigazione**: Periodo precedente/successivo
- **Titolo dinamico**: Mostra mese/anno corrente
- **Tabs vista**: Mese, Settimana, Giorno, Agenda

#### Sidebar (280px, nascosta su mobile)

- **Barra ricerca**: Cerca per nome, note, location, tipo
- **Filtro atleta**: Dropdown con tutti gli atleti
- **Mini-calendario**: Navigazione rapida con indicatori
- **Prossimi appuntamenti**: Lista max 5 eventi futuri
- **Footer shortcuts**: Link a guida tastiera

#### FAB (Floating Action Button)

- Posizione: Basso destra
- Colore: #8AB4F8 (Google Blue)
- Azione: Apre form nuovo appuntamento
- Animazioni: Hover scale, press feedback

---

## 📝 Gestione Appuntamenti

### Creazione Appuntamento

**Metodi di creazione:**

1. Click su FAB (+)
2. Selezione intervallo nel calendario
3. Click su slot vuoto (vista giorno/settimana)
4. Shortcut `N`

**Campi form:**

| Campo      | Tipo    | Obbligatorio | Descrizione              |
| ---------- | ------- | ------------ | ------------------------ |
| Atleta     | Select  | Sì           | Lista atleti attivi      |
| Data       | Date    | Sì           | Data appuntamento        |
| Ora inizio | Select  | Sì           | Ogni 15 minuti           |
| Ora fine   | Select  | Sì           | Auto-calcolata +1h       |
| Tipo       | Select  | Sì           | Allenamento, Prova, etc. |
| Colore     | Palette | No           | 12 colori disponibili    |
| Luogo      | Text    | No           | Location opzionale       |
| Note       | Text    | No           | Note aggiuntive          |

**Tipi appuntamento:**

- Allenamento
- Prova
- Valutazione
- Prima Visita
- Riunione
- Massaggio
- Nutrizionista

### Modifica Appuntamento

**Metodi di modifica:**

1. Click su evento → Popover → "Modifica"
2. Drag & Drop per spostare
3. Resize per cambiare durata

### Eliminazione Appuntamento

**Opzioni:**

- **Annulla**: Marca come annullato (soft delete)
- **Elimina**: Rimuove definitivamente (hard delete)

---

## 🔍 Ricerca e Filtri

### Barra di Ricerca

Cerca in tempo reale su:

- Nome atleta
- Note appuntamento
- Location
- Tipo appuntamento

**Shortcut**: `/` per focus sulla ricerca

### Filtro Atleta

- Dropdown con tutti gli atleti
- Opzione "Tutti gli atleti"
- Filtra calendario + prossimi appuntamenti
- Link "Rimuovi filtri" quando attivi

### Indicatori Attivi

- Contatore risultati nella sidebar
- Messaggio "Nessun risultato" se vuoto

---

## ⌨️ Scorciatoie Tastiera

### Navigazione

| Tasto | Azione             |
| ----- | ------------------ |
| `T`   | Vai a oggi         |
| `←`   | Periodo precedente |
| `→`   | Periodo successivo |

### Cambio Vista

| Tasto | Azione          |
| ----- | --------------- |
| `M`   | Vista mese      |
| `W`   | Vista settimana |
| `D`   | Vista giorno    |
| `A`   | Vista agenda    |

### Azioni

| Tasto | Azione                 |
| ----- | ---------------------- |
| `N`   | Nuovo appuntamento     |
| `/`   | Focus ricerca          |
| `?`   | Mostra guida shortcuts |
| `Esc` | Chiudi popup/modal     |

---

## 🎨 Colori Appuntamenti

| Nome         | Codice HEX | Uso Suggerito           |
| ------------ | ---------- | ----------------------- |
| Azzurro      | `#039BE5`  | Default, Allenamenti    |
| Blu          | `#4285F4`  | Appuntamenti importanti |
| Viola Scuro  | `#7E57C2`  | Valutazioni             |
| Viola Chiaro | `#B39DDB`  | Prove                   |
| Rosa         | `#D81B60`  | Prima visita            |
| Rosso        | `#E53935`  | Urgenti                 |
| Arancione    | `#F4511E`  | Riunioni                |
| Giallo       | `#F6BF26`  | Promemoria              |
| Verde        | `#33B679`  | Completati              |
| Verde Chiaro | `#0B8043`  | Nutrizionista           |
| Marrone      | `#795548`  | Massaggi                |
| Grigio       | `#9E9E9E`  | Annullati               |

---

## 🔧 API e Hook

### useCalendarPage

Hook principale per la gestione del calendario.

```typescript
const {
  appointments, // AppointmentUI[] - Lista appuntamenti
  appointmentsLoading, // boolean - Stato caricamento
  athletes, // Athlete[] - Lista atleti
  athletesLoading, // boolean - Stato caricamento atleti
  loading, // boolean - Stato operazioni
  handleFormSubmit, // Crea/modifica appuntamento
  handleCancel, // Annulla appuntamento
  handleDelete, // Elimina appuntamento
  handleEventDrop, // Gestisce drag & drop
  handleEventResize, // Gestisce resize
} = useCalendarPage()
```

### Tipi Principali

```typescript
// Appuntamento completo
interface AppointmentUI {
  id: string
  athlete_id: string
  staff_id: string
  starts_at: string // ISO datetime
  ends_at: string // ISO datetime
  type: AppointmentType
  status: 'attivo' | 'completato' | 'annullato' | 'in_corso'
  color?: AppointmentColor
  notes?: string
  location?: string
  athlete_name?: string
  // ... altri campi
}

// Dati per creazione
interface CreateAppointmentData {
  athlete_id: string
  staff_id: string
  starts_at: string
  ends_at: string
  type: AppointmentType
  status?: string
  color?: AppointmentColor
  notes?: string
  location?: string
}

// Colori disponibili
type AppointmentColor =
  | 'azzurro'
  | 'blu'
  | 'viola_scuro'
  | 'viola_chiaro'
  | 'rosa'
  | 'rosso'
  | 'arancione'
  | 'giallo'
  | 'verde'
  | 'verde_chiaro'
  | 'marrone'
  | 'grigio'
```

---

## 📁 File e Struttura

### Componenti

| File                      | Descrizione                   | Linee |
| ------------------------- | ----------------------------- | ----- |
| `calendar-view.tsx`       | Vista principale FullCalendar | ~450  |
| `appointment-form.tsx`    | Form stile Google             | ~415  |
| `appointment-popover.tsx` | Popover dettagli              | ~180  |
| `appointment-detail.tsx`  | Dettagli completi             | ~310  |
| `mini-calendar.tsx`       | Mini calendario               | ~130  |
| `appointments-table.tsx`  | Vista tabella                 | ~250  |

### Pagina

| File       | Descrizione                | Linee |
| ---------- | -------------------------- | ----- |
| `page.tsx` | Pagina calendario completa | ~535  |

### Hook

| File                   | Descrizione              | Linee |
| ---------------------- | ------------------------ | ----- |
| `use-calendar-page.ts` | Logica dati e operazioni | ~510  |

### Stili

| File                     | Descrizione               |
| ------------------------ | ------------------------- |
| `fullcalendar-theme.css` | Tema Google Calendar dark |

---

## 🔒 Sicurezza e RLS

- Gli appuntamenti sono filtrati per `staff_id` (trainer corrente)
- Solo il trainer proprietario può modificare/eliminare
- Atleti visibili solo se `stato = 'attivo'`
- Validazione lato client e server

---

## 📱 Responsive

| Breakpoint          | Comportamento                 |
| ------------------- | ----------------------------- |
| Desktop (>1024px)   | Layout completo con sidebar   |
| Tablet (768-1024px) | Sidebar collassata            |
| Mobile (<768px)     | Solo calendario, FAB visibile |

---

## 🚀 Performance

- **Lazy loading**: Form caricato on-demand
- **Memoization**: Eventi e filtri ottimizzati
- **Optimistic updates**: UI aggiornata immediatamente
- **Dynamic imports**: FullCalendar caricato dinamicamente

---

## 📊 Stato Implementazione

| Funzionalità          | Stato   |
| --------------------- | ------- |
| Viste calendario      | ✅ 100% |
| CRUD appuntamenti     | ✅ 100% |
| Drag & Drop           | ✅ 100% |
| Resize                | ✅ 100% |
| Colori personalizzati | ✅ 100% |
| Ricerca               | ✅ 100% |
| Filtri                | ✅ 100% |
| Keyboard shortcuts    | ✅ 100% |
| UI Google style       | ✅ 100% |
| Responsive            | ✅ 100% |

---

_Documentazione generata automaticamente - 22Club Platform_
