# 📅 Lista Argomenti Sistema Calendario e Appuntamenti - 22Club

**Ultimo aggiornamento**: 2025-01-30T15:30:00Z  
**Stato Sistema**: 🟢 100% COMPLETO

---

## 📋 INDICE ARGOMENTI

1. [Vista Calendario](#1-vista-calendario)
2. [Gestione Appuntamenti](#2-gestione-appuntamenti)
3. [Tipi di Appuntamento](#3-tipi-di-appuntamento)
4. [Ricorrenze](#4-ricorrenze)
5. [Validazioni e Controlli](#5-validazioni-e-controlli)
6. [Interfaccia Utente](#6-interfaccia-utente)
7. [Database e Storage](#7-database-e-storage)
8. [Utility e Helper](#8-utility-e-helper)
9. [Integrazioni](#9-integrazioni)
10. [Visualizzazioni e Rappresentazioni](#10-visualizzazioni-e-rappresentazioni)

---

## 1. Vista Calendario

### 1.1 Viste Disponibili

- **Vista Mensile** (`dayGridMonth`): Visualizzazione mensile con griglia giorni
- **Vista Settimanale** (`timeGridWeek`): Visualizzazione settimana con orari
- **Vista Giornaliera** (`timeGridDay`): Visualizzazione giorno con orari dettagliati

### 1.2 Navigazione

- Navigazione tra mesi/settimane/giorni
- Pulsante "Oggi" per tornare alla data corrente
- Click su data per cambiare vista o aprire form

### 1.3 Caratteristiche Tecniche

- Lazy loading FullCalendar (code splitting)
- Orari visualizzati: 06:00 - 22:00
- Weekend abilitati
- Indicatore ora corrente
- Selezione date abilitata

### 1.4 Interazioni

- Click su evento → Apre dettaglio appuntamento
- Click su data (vista mensile) → Cambia a vista giornaliera
- Click su data (vista sett/giorno) → Apre form nuovo appuntamento
- Drag & drop: Non implementato (futuro)

---

## 2. Gestione Appuntamenti

### 2.1 Operazioni CRUD

#### Creazione

- Form creazione appuntamento
- Validazione client-side completa
- Verifica sovrapposizioni con altri appuntamenti
- Supporto creazione ricorrenti (serie multiple)

#### Lettura

- Caricamento appuntamenti per trainer
- Filtraggio automatico per trainer_id
- Ordinamento per data/ora crescente
- Caricamento nomi atleti/trainer

#### Aggiornamento

- Modifica appuntamento esistente
- Mantiene storico (updated_at)
- Validazione sovrapposizioni anche in modifica
- Esclusione appuntamento corrente dalla verifica sovrapposizioni

#### Eliminazione

- Eliminazione definitiva (hard delete)
- Cancellazione logica (soft delete via cancelled_at)
- Aggiornamento status a 'annullato'

### 2.2 Stati Appuntamento

- `attivo`: Appuntamento schedulato
- `completato`: Appuntamento completato
- `annullato`: Appuntamento cancellato
- `in_corso`: Appuntamento in corso
- `cancelled`: Variante annullato (compatibilità)
- `scheduled`: Variante attivo (compatibilità)

### 2.3 Campi Appuntamento

- `id`: UUID identificativo
- `org_id`: Organizzazione (default: 'default-org')
- `athlete_id`: ID atleta (FK → profiles.id)
- `trainer_id`: ID trainer/staff (FK → profiles.id)
- `staff_id`: Alias trainer_id (FK → profiles.id)
- `starts_at`: Data/ora inizio (TIMESTAMP WITH TIME ZONE)
- `ends_at`: Data/ora fine (TIMESTAMP WITH TIME ZONE)
- `type`: Tipo appuntamento
- `status`: Stato appuntamento
- `location`: Luogo (opzionale)
- `notes`: Note (opzionale)
- `recurrence_rule`: Regola ricorrenza RFC5545 (opzionale)
- `cancelled_at`: Data cancellazione (soft delete)
- `trainer_name`: Nome trainer (denormalizzato)
- `athlete_name`: Nome atleta (denormalizzato)
- `created_at`: Data creazione
- `updated_at`: Data ultimo aggiornamento

---

## 3. Tipi di Appuntamento

### 3.1 Tipi Base

- **`allenamento`**: Sessione di allenamento standard (default)
- **`cardio`**: Sessione cardio
- **`check`**: Riunione/controllo
- **`consulenza`**: Consulenza generica

### 3.2 Tipi Specializzati (mappati a `consulenza`)

- **`prima_visita`**: Prima visita atleta
- **`massaggio`**: Sessione massaggio
- **`nutrizionista`**: Consulenza nutrizionale
- **`riunione`**: Riunione (mappato a `check`)

### 3.3 Colori per Tipo (UI)

- **Allenamento**: Teal/Cyan gradient (default)
- **Cardio**: Verde (success)
- **Consulenza**: Oro/Amber
- **Check/Riunione**: Blu (warning)

### 3.4 Gestione Note

- Tipo specializzato aggiunto automaticamente alle note
- Esempio: "Prima Visita", "Massaggio", "Nutrizionista"

---

## 4. Ricorrenze

### 4.1 Frequenze Supportate

- **Giornaliera** (`daily`): Ogni giorno o ogni N giorni
- **Settimanale** (`weekly`): Ogni settimana o ogni N settimane + giorno settimana
- **Mensile** (`monthly`): Ogni mese o ogni N mesi

### 4.2 Configurazione Ricorrenza

- **Intervallo**: 1-12 (ogni quanti giorni/settimane/mesi)
- **Giorno settimana**: Lunedì-Domenica (solo per settimanale)
- **Numero occorrenze**: 2-52 appuntamenti totali da creare

### 4.3 Regole RFC5545

- Formato: `FREQ=WEEKLY;INTERVAL=1;BYDAY=MO`
- Supporto parsing e generazione automatica
- Compatibilità standard calendario

### 4.4 Creazione Ricorrenti

- Genera serie completa di appuntamenti
- Mantiene durata originale per ogni occorrenza
- Salva recurrence_rule su ogni appuntamento della serie
- Verifica sovrapposizioni per ogni occorrenza

### 4.5 Visualizzazione Ricorrenze

- Icona 🔄 nel calendario per eventi ricorrenti
- Badge ricorrenza nel dettaglio appuntamento
- Descrizione leggibile (es. "Ogni Lunedì", "Ogni 2 settimane")

---

## 5. Validazioni e Controlli

### 5.1 Validazioni Client-Side

- Atleta selezionato (obbligatorio)
- Data selezionata (obbligatorio)
- Orario inizio selezionato (obbligatorio)
- Orario fine selezionato (obbligatorio)
- Data/orario non nel passato
- Orario fine > orario inizio

### 5.2 Validazioni Server-Side

- Verifica sovrapposizioni con altri appuntamenti
- Esclusione appuntamento corrente in modifica
- Controllo vincoli database (CHECK constraints)
- Validazione formato RFC5545 per ricorrenze

### 5.3 Verifica Sovrapposizioni

- Query database per conflitti temporali
- Solo appuntamenti non cancellati
- Solo appuntamenti stesso trainer
- Messaggio errore con dettagli conflitti

### 5.4 Vincoli Database

- `valid_time_range`: ends_at > starts_at
- `CHECK type`: Valori consentiti per tipo
- `CHECK status`: Valori consentiti per status
- Foreign keys su athlete_id, trainer_id, staff_id

---

## 6. Interfaccia Utente

### 6.1 Componenti Principali

- **CalendarView**: Vista calendario FullCalendar
- **AppointmentForm**: Form creazione/modifica
- **AppointmentDetail**: Dettaglio appuntamento
- **AppointmentsTable**: Tabella lista appuntamenti
- **CalendarHeader**: Header calendario

### 6.2 Form Appuntamento

- Sezione atleta (select)
- Sezione data/orari (date + 2 select orari)
- Sezione tipo appuntamento (select)
- Sezione ricorrenza (toggle + configurazione)
- Sezione note (textarea opzionale)
- Validazione in tempo reale
- Auto-calcolo orario fine (+1 ora)

### 6.3 Dettaglio Appuntamento

- Header con atleta e tipo
- Badge status colorato
- Data e ora formattate
- Note (se presenti)
- Badge ricorrenza (se presente)
- Info annullamento (se annullato)
- Azioni: Modifica, Annulla, Elimina

### 6.4 Stili e Design

- Design System dark mode stile Apple
- Palette teal/cyan per tema trainer
- Colori differenziati per tipo appuntamento
- Indicatori visivi per stato (attivo, annullato, ricorrente)
- Responsive design
- Animazioni fade-in

---

## 7. Database e Storage

### 7.1 Tabella `appointments`

- Struttura completa con 17 colonne
- Indici per performance (athlete_id, trainer_id, starts_at, type, cancelled_at)
- Indice composito per query comuni
- Trigger per aggiornamento updated_at
- Trigger per sincronizzazione nomi atleta/trainer

### 7.2 Funzioni RPC

- `create_appointment`: Crea appuntamento con verifica sovrapposizioni
- `update_appointment`: Aggiorna appuntamento esistente
- `cancel_appointment`: Cancellazione soft delete
- Funzioni statistiche (mensili, giornaliere)

### 7.3 Views Database

- `monthly_appointments_view`: Statistiche mensili
- `daily_appointments_view`: Statistiche giornaliere

### 7.4 RLS Policies

- Policy SELECT: Utenti autenticati possono vedere tutti
- Policy ALL: Utenti autenticati possono gestire tutti
- (Nota: Potrebbe essere raffinato per privacy)

---

## 8. Utility e Helper

### 8.1 Funzioni Appointment Utils (`appointment-utils.ts`)

- `checkAppointmentOverlap`: Verifica sovrapposizioni
- `generateRecurrenceRule`: Genera regola ricorrenza (deprecato)
- `generateRecurrenceRuleFromParams`: Genera regola da parametri
- `parseRecurrenceRule`: Parse regola per visualizzazione
- `createRecurringAppointments`: Crea serie ricorrenti
- `formatAppointmentTime`: Formatta orari
- `formatAppointmentDate`: Formatta date
- `isAppointmentInPast`: Verifica se nel passato
- `canCancelAppointment`: Verifica se cancellabile
- `canModifyAppointment`: Verifica se modificabile
- `getAppointmentStatus`: Calcola stato da date
- `getAppointmentDuration`: Calcola durata in minuti
- `formatDuration`: Formatta durata

### 8.2 Validazioni (`validations/appointment.ts`)

- `createAppointmentSchema`: Schema Zod per creazione
- `updateAppointmentSchema`: Schema Zod per aggiornamento
- `timeSlotSchema`: Schema Zod per time slot
- `recurrenceRuleSchema`: Schema Zod per regola ricorrenza
- `validateAppointmentTimeSlot`: Validazione time slot
- `validateRecurrenceRule`: Validazione regola ricorrenza

### 8.3 Hooks React

- `useAppointments`: Hook gestione appuntamenti (pagina lista)
- `useCalendarPage`: Hook gestione pagina calendario
- Caricamento dati, gestione form, CRUD operations

---

## 9. Integrazioni

### 9.1 FullCalendar

- Libreria calendario principale
- Plugin: dayGrid, timeGrid, interaction
- Localizzazione italiana
- Theme personalizzato dark mode

### 9.2 Supabase

- Database PostgreSQL
- Real-time subscriptions (non implementato per appuntamenti)
- RLS per sicurezza
- Funzioni RPC

### 9.3 Design System

- Componenti UI riusabili
- Token di design centralizzati
- Tema dark mode coerente
- Icons Lucide React

---

## 10. Visualizzazioni e Rappresentazioni

### 10.1 Vista Calendario

- Eventi colorati per tipo
- Indicatore ora corrente
- Evidenziazione giorno corrente
- Popover eventi (FullCalendar)

### 10.2 Vista Lista

- Tabella appuntamenti
- Colonne: Data, Ora, Atleta, Tipo, Status, Azioni
- Filtri e ricerca (non implementato)

### 10.3 Vista Dashboard

- Agenda timeline giornaliera
- Statistiche rapide
- Prossimi appuntamenti

### 10.4 Indicatori Visivi

- Colori per tipo appuntamento
- Badge status (attivo, completato, annullato)
- Icona ricorrenza 🔄
- Opacità ridotta per cancellati
- Line-through per cancellati

---

## 📊 STATISTICHE SISTEMA

### File Principali

- `src/components/calendar/`: 6 componenti
- `src/hooks/calendar/`: 1 hook
- `src/hooks/appointments/`: 1 hook
- `src/lib/appointment-utils.ts`: 12+ funzioni utility
- `src/types/appointment.ts`: Tipi TypeScript
- `supabase/migrations/*appointments*.sql`: Multiple migrazioni

### Funzionalità Complete

- ✅ Vista calendario (mese/settimana/giorno)
- ✅ CRUD appuntamenti completo
- ✅ Tipi appuntamento multipli
- ✅ Ricorrenze (giornaliera/settimanale/mensile)
- ✅ Validazioni client/server
- ✅ Verifica sovrapposizioni
- ✅ UI form completa
- ✅ Visualizzazione dettaglio
- ✅ Indicatori visivi

### Problemi Risolti

- ✅ P4-004: Validazione sovrapposizioni
- ✅ P4-005: UI ricorrenze

### Limitazioni Attuali

- ⚠️ Drag & drop non implementato
- ⚠️ Real-time subscriptions non attive
- ⚠️ Integrazione calendari esterni (Google, Outlook) non presente
- ⚠️ Ricerca/filtri avanzati non implementati

---

## 🔄 CHANGELOG PRINCIPALE

### 2025-01-30 - Implementazione Ricorrenze

- ✅ Aggiunta UI ricorrenze nel form
- ✅ Supporto frequenze giornaliera/settimanale/mensile
- ✅ Creazione serie ricorrenti
- ✅ Visualizzazione ricorrenze
- ✅ Indicatori visivi ricorrenza

### 2025-01-29 - Refactoring e Split File

- ✅ Split calendario/page.tsx in hook dedicato
- ✅ Migliorata manutenibilità codice

### 2025-01-10 - Sistema Base

- ✅ Creazione tabella appointments
- ✅ Funzioni RPC base
- ✅ Componenti UI principali

---

**Stato Finale**: 🟢 **100% COMPLETO**  
**Prossimi Sviluppi**: Drag & drop, real-time, integrazioni esterne
