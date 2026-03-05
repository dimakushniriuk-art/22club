# Modulo Allenamenti

## Panoramica

Il modulo **Allenamenti** permette ai personal trainer di monitorare, gestire e analizzare le sessioni di allenamento dei propri atleti. Include funzionalità avanzate di filtraggio, ricerca, ordinamento ed export dati.

---

## Caratteristiche Principali

### 📊 Dashboard con Statistiche

- **Oggi**: numero di allenamenti programmati per la giornata corrente
- **Completati**: totale allenamenti completati
- **In corso**: allenamenti attualmente in esecuzione
- **Programmati**: allenamenti futuri pianificati

### 🔍 Ricerca e Filtri

- **Ricerca real-time** con debounce (500ms) per atleta o nome scheda
- **Filtri avanzati**:
  - Periodo (oggi, settimana, mese, tutti)
  - Intervallo date personalizzato
  - Stato (completato, in corso, programmato, saltato)

### 🗂️ Organizzazione

- **Tabs** per filtrare per stato
- **Ordinamento** per:
  - Data (più recenti / meno recenti)
  - Atleta (A-Z)
  - Durata (decrescente)

### 📥 Export

- **CSV**: esporta tutti gli allenamenti filtrati con tutti i dettagli

### 📄 Dettagli Allenamento

Modal con informazioni complete:

- Atleta e scheda associata
- Data, ora, durata
- Esercizi completati/totali
- Volume totale (kg)
- Note e progressi
- Barra progresso (per allenamenti in corso)

---

## Architettura

### Types

- **`Allenamento`**: interfaccia principale
- **`AllenamentoStats`**: statistiche aggregate
- **`AllenamentoFilters`**: filtri applicabili
- **`AllenamentoSort`**: tipi di ordinamento

### Validazione

Schema Zod in `@/lib/validations/allenamento.ts`:

- `allenamentoSchema`: validazione completa
- `allenamentoFiltersSchema`: validazione filtri
- `createAllenamentoSchema`: creazione nuovo allenamento
- `updateAllenamentoSchema`: aggiornamento allenamento

### Hook

`useAllenamenti(filters, sort)`:

- Fetch allenamenti da Supabase
- Calcolo statistiche
- Real-time subscriptions
- Operazioni CRUD (update, delete)

`useAllenamentoDettaglio(id)`:

- Fetch dettagli allenamento singolo
- Caricamento esercizi associati

### Database

Tabella `workout_logs` con campi:

- `id`, `atleta_id`, `scheda_id`
- `data`, `durata_minuti`
- `stato`, `esercizi_completati`, `esercizi_totali`
- `volume_totale`, `note`
- `created_at`, `updated_at`

Indici per performance:

- `idx_workout_logs_atleta`
- `idx_workout_logs_data`
- `idx_workout_logs_stato`

RLS policies:

- Solo staff (admin/PT) può visualizzare, creare, modificare, eliminare
- Atleti possono visualizzare solo i propri allenamenti

---

## Componenti UI

### `AllenamentoDettaglioModal`

Modal con dettagli completi:

- Info allenamento
- Statistiche (durata, esercizi, volume)
- Progress bar per allenamenti in corso
- Lista esercizi (TODO: implementare quando disponibile)

### `AllenamentiFiltriAvanzati`

Dialog per filtri personalizzati:

- Selezione periodo predefinito
- Date picker per intervallo custom

### `AllenamentiExportMenu`

Dropdown menu per export:

- CSV con tutti i dati filtrati

---

## Flow Utente

1. **Visualizza dashboard** → stats e lista allenamenti
2. **Filtra per stato** → usa tabs per filtrare
3. **Cerca** → digita nome atleta o scheda
4. **Ordina** → scegli criterio ordinamento
5. **Filtri avanzati** → applica filtri temporali
6. **Dettagli** → clicca "Dettagli" per vedere info complete
7. **Export** → scarica CSV per analisi esterna
8. **Naviga profilo** → vai al profilo atleta

---

## Test

Test E2E in `tests/e2e/allenamenti.spec.ts`:

- Visualizzazione header e stats
- Breadcrumb navigation
- Ricerca e filtri
- Ordinamento
- Export CSV
- Modal dettagli
- Empty state
- Progress bar allenamenti in corso

---

## Miglioramenti Futuri

- [ ] Implementare tabella `workout_exercises` per dettagli esercizi
- [ ] Aggiungere grafici progresso settimanale/mensile
- [ ] Calendario mensile con allenamenti
- [ ] Notifiche push per allenamenti imminenti
- [ ] Comparazione allenamenti (prima/dopo)
- [ ] Template allenamenti predefiniti
- [ ] Integrazione wearable devices per dati real-time

---

## Accesso Rapido

- URL: `/dashboard/allenamenti`
- Permessi: Solo staff (admin/PT)
- Hook: `useAllenamenti`
- Types: `@/types/allenamento`
- Validations: `@/lib/validations/allenamento`
