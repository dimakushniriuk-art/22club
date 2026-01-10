# 🔍 Analisi Completa Sistema Comunicazioni

**Data Analisi**: 2025-01-31  
**URL Testato**: http://localhost:3001/dashboard/comunicazioni  
**Obiettivo**: Analisi approfondita di tutti i moduli, SQL, UX/UI e identificazione completa di problemi e mancanze

---

## 📋 INDICE

1. [Database Schema & SQL](#1-database-schema--sql)
2. [Backend Services](#2-backend-services)
3. [API Routes](#3-api-routes)
4. [Frontend Hooks](#4-frontend-hooks)
5. [UI Components](#5-ui-components)
6. [Provider Configuration](#6-provider-configuration)
7. [Errori Identificati](#7-errori-identificati)
8. [Problemi UX/UI](#8-problemi-uxui)
9. [Mancanze Funzionali](#9-mancanze-funzionali)
10. [TODO Prioritaria](#10-todo-prioritaria)

---

## 1. Database Schema & SQL

### ✅ 1.1 Tabelle Esistenti

**File**: `supabase/migrations/20250130_create_communications_tables.sql`

#### ✅ `communications` table

- **Stato**: ✅ ESISTE
- **Colonne principali**:
  - `id` (UUID, PK)
  - `created_by` (UUID, FK → auth.users)
  - `title` (TEXT, NOT NULL)
  - `message` (TEXT, NOT NULL)
  - `type` (TEXT, CHECK: 'push', 'email', 'sms', 'all')
  - `status` (TEXT, CHECK: 'draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')
  - `scheduled_for` (TIMESTAMP WITH TIME ZONE)
  - `sent_at` (TIMESTAMP WITH TIME ZONE)
  - `recipient_filter` (JSONB, default '{}')
  - `total_recipients` (INTEGER, default 0)
  - `total_sent` (INTEGER, default 0)
  - `total_delivered` (INTEGER, default 0)
  - `total_opened` (INTEGER, default 0)
  - `total_failed` (INTEGER, default 0)
  - `metadata` (JSONB, default '{}')
  - `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

#### ✅ `communication_recipients` table

- **Stato**: ✅ ESISTE
- **Colonne principali**:
  - `id` (UUID, PK)
  - `communication_id` (UUID, FK → communications, CASCADE DELETE)
  - `user_id` (UUID, FK → auth.users, CASCADE DELETE)
  - `recipient_type` (TEXT, CHECK: 'push', 'email', 'sms')
  - `status` (TEXT, CHECK: 'pending', 'sent', 'delivered', 'opened', 'failed', 'bounced')
  - `sent_at`, `delivered_at`, `opened_at`, `failed_at` (TIMESTAMP WITH TIME ZONE)
  - `error_message` (TEXT)
  - `metadata` (JSONB, default '{}')
  - `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)
  - **UNIQUE constraint**: `(communication_id, user_id, recipient_type)`

#### ✅ Indici

- ✅ Indici per performance su colonne chiave (created_by, status, type, scheduled_for, sent_at)
- ✅ Indici compositi per query comuni
- ✅ Indici parziali per recipient_type e status

#### ✅ RLS Policies

- ✅ RLS abilitato per entrambe le tabelle
- ✅ Policies per staff (admin, pt, trainer, staff) per gestire comunicazioni
- ✅ Policy per utenti per vedere i propri recipients

### ⚠️ 1.2 Problemi Database

1. **Tabella `user_push_tokens`**
   - ✅ Esiste (creata in `11_notifications.sql`)
   - ⚠️ Ma le push notifications sono **simulate**, non reali
   - ⚠️ Problema: quando si creano recipients push, vengono creati anche senza token, ma durante l'invio vengono marcati come failed

2. **Campo `telefono` in `profiles`**
   - ✅ Esiste (aggiunto in migration `20250129_add_telefono_column_to_profiles.sql`)
   - ⚠️ Potrebbe non essere popolato per tutti gli utenti
   - ⚠️ Nessuna validazione formato telefono (deve iniziare con `+` per Twilio)

3. **Campo `email` in `profiles`**
   - ✅ Esiste
   - ⚠️ Potrebbe non essere popolato per tutti gli utenti
   - ✅ C'è constraint di formato email

---

## 2. Backend Services

### ✅ 2.1 Service Layer (`src/lib/communications/service.ts`)

**Funzioni Principali**:

- ✅ `createCommunication(userId, input)` - Crea comunicazione
- ✅ `getCommunications(options?)` - Lista comunicazioni
- ✅ `getCommunicationById(id)` - Dettaglio comunicazione con recipients
- ✅ `updateCommunication(id, input)` - Aggiorna comunicazione
- ✅ `deleteCommunication(id)` - Elimina comunicazione
- ✅ `createCommunicationRecipients(communicationId, recipients)` - Crea recipients
- ✅ `updateRecipientStatus(recipientId, status, metadata?)` - Aggiorna status recipient
- ✅ `updateCommunicationStats(communicationId)` - Aggiorna statistiche aggregate

**Problemi Identificati**:

- ⚠️ **P1-BACKEND-001**: Quando si aggiorna una comunicazione con `updateCommunication`, se cambia il `recipient_filter`, i recipients esistenti **NON vengono aggiornati**. Dovrebbero essere eliminati e ricreati.

### ✅ 2.2 Recipients Logic (`src/lib/communications/recipients.ts`)

**Funzioni Principali**:

- ✅ `getRecipientsByFilter(filter)` - Ottiene destinatari in base al filtro
- ✅ `validateRecipients(recipients, type)` - Valida recipients per tipo comunicazione
- ✅ `generateRecipientTypes(recipients, type)` - Genera lista recipient types
- ✅ `countRecipientsByFilter(filter)` - Conta destinatari senza recuperare tutti i dati

**Problemi Identificati**:

- ⚠️ **P1-BACKEND-002**: `getRecipientsByFilter` non filtra per `stato = 'attivo'` nella tabella `profiles`. Dovrebbe escludere utenti inattivi.
- ✅ **RISOLTO**: `generateRecipientTypes` ora crea recipients push anche senza token (saranno marcati come failed durante l'invio)
- ✅ **RISOLTO**: Gestisce correttamente `'atleta'` e `'athlete'` come sinonimi

### ✅ 2.3 Push Service (`src/lib/communications/push.ts`)

**Funzioni Principali**:

- ✅ `sendCommunicationPush(communicationId)` - Invia comunicazione push
- ✅ `sendPushToRecipient(recipientId)` - Retry push per recipient specifico
- ✅ `processScheduledPushCommunications()` - Processa comunicazioni programmate

**Problemi Critici**:

- 🔴 **P1-BACKEND-003**: `sendWebPushNotification` in `src/lib/notifications/push.ts` è **SOLO SIMULAZIONE** (righe 242-283). Non invia realmente push notifications.
  - Codice commentato per web-push reale
  - In produzione non funzionerà
  - **Impatto**: Le push notifications non vengono mai inviate realmente

### ✅ 2.4 Email Service (`src/lib/communications/email.ts`)

**Funzioni Principali**:

- ✅ `sendCommunicationEmail(communicationId)` - Invia comunicazione email
- ✅ `sendEmailToRecipient(recipientId)` - Retry email per recipient specifico

**Problemi Identificati**:

- ⚠️ **P1-BACKEND-004**: Resend è configurato ma in sviluppo viene simulato. Funzionerà solo in produzione con variabili ambiente.

### ✅ 2.5 SMS Service (`src/lib/communications/sms.ts`)

**Funzioni Principali**:

- ✅ `sendCommunicationSMS(communicationId)` - Invia comunicazione SMS
- ✅ `sendSMSToRecipient(recipientId)` - Retry SMS per recipient specifico

**Problemi Identificati**:

- ⚠️ **P1-BACKEND-005**: Twilio è configurato ma in sviluppo viene simulato. Funzionerà solo in produzione con variabili ambiente.
- ⚠️ **P1-BACKEND-006**: Valida formato telefono (deve iniziare con `+`) ma se il formato è sbagliato, il recipient viene marcato come failed senza possibilità di correzione automatica.

### ✅ 2.6 Scheduler (`src/lib/communications/scheduler.ts`)

**Funzioni Principali**:

- ✅ `processScheduledCommunications()` - Processa comunicazioni programmate
- ✅ `ensureRecipientsCreated(communicationId, communication)` - Assicura che recipients siano creati
- ✅ `scheduleCommunication(communicationId, scheduledFor)` - Programma comunicazione

**Problemi Identificati**:

- ✅ **RISOLTO**: `ensureRecipientsCreated` ora aggiorna `total_recipients = 0` se non trova recipients

---

## 3. API Routes

### ✅ 3.1 `/api/communications/send` (`src/app/api/communications/send/route.ts`)

**Funzionalità**:

- ✅ Verifica autenticazione e permessi staff
- ✅ Verifica stato comunicazione (draft, scheduled, sending, failed)
- ✅ Reset automatico da `failed` a `draft` per retry
- ✅ Crea recipients se non esistono
- ✅ Verifica che recipients siano stati creati
- ✅ Invio con timeout (5 minuti)
- ✅ Gestione errori completa

**Problemi Identificati**:

- ⚠️ **P1-API-001**: Timeout di 5 minuti potrebbe essere troppo per comunicazioni con molti destinatari (1000+). Dovrebbe essere configurabile o dinamico in base al numero di recipients.
- ⚠️ **P1-API-002**: Se `ensureRecipientsCreated` fallisce silenziosamente (solo log), l'API route non lo rileva e procede comunque. Dovrebbe verificare meglio.

### ✅ 3.2 `/api/communications/count-recipients` (`src/app/api/communications/count-recipients/route.ts`)

**Funzionalità**:

- ✅ Verifica autenticazione e permessi staff
- ✅ Calcola conteggio destinatari in base al filtro
- ✅ Usa service role key (corretto)

**Problemi Identificati**:

- ✅ Funziona correttamente

### ✅ 3.3 `/api/communications/check-stuck` (`src/app/api/communications/check-stuck/route.ts`)

**Funzionalità**:

- ✅ Rileva comunicazioni bloccate in stato "sending" da > 10 minuti
- ✅ Reset automatico a "failed"
- ✅ Verifica autenticazione e permessi

**Problemi Identificati**:

- ⚠️ **P1-API-003**: Threshold di 10 minuti è hardcoded. Dovrebbe essere configurabile.
- ⚠️ **P1-API-004**: Non c'è cron job automatico per chiamare questo endpoint. Viene chiamato solo manualmente o dal controllo periodico nel frontend (ogni 2 minuti).

---

## 4. Frontend Hooks

### ✅ 4.1 `useCommunications` (`src/hooks/use-communications.ts`)

**Funzionalità**:

- ✅ Fetch comunicazioni con filtri
- ✅ Create, update, delete comunicazioni
- ✅ Send, reset, cancel comunicazioni
- ✅ Auto-refresh ogni 30 secondi se abilitato

**Problemi Identificati**:

- ⚠️ **P1-HOOK-001**: `createCommunication` nel hook client-side chiama `supabase.auth.getUser()` che potrebbe fallire se la sessione non è sincronizzata. Dovrebbe usare il service backend.
- ⚠️ **P1-HOOK-002**: `sendCommunication` ora restituisce `{ success, error?, message? }` ma alcuni punti del codice potrebbero ancora aspettarsi un `boolean`.

### ✅ 4.2 `useCommunicationsPage` (`src/hooks/communications/use-communications-page.tsx`)

**Funzionalità**:

- ✅ Gestione stato form (tipo, titolo, messaggio, filtro destinatari, schedulazione)
- ✅ Calcolo conteggio destinatari tramite API route
- ✅ Handle create, update, edit, send, reset
- ✅ Controllo periodico comunicazioni bloccate (ogni 2 minuti)

**Problemi Identificati**:

- ⚠️ **P1-HOOK-003**: Quando si modifica una comunicazione, se cambia il `recipient_filter`, i recipients esistenti non vengono aggiornati. Dovrebbero essere eliminati e ricreati all'invio.
- ⚠️ **P1-HOOK-004**: Il controllo periodico per comunicazioni bloccate (righe 63-87) potrebbe causare chiamate API non necessarie se ci sono molte comunicazioni in stato "sending". Dovrebbe essere ottimizzato.

---

## 5. UI Components

### ✅ 5.1 `CommunicationsHeader` (`src/components/communications/communications-header.tsx`)

**Stato**: ✅ FUNZIONA  
**Problemi**: Nessuno

### ✅ 5.2 `CommunicationsSearch` (`src/components/communications/communications-search.tsx`)

**Stato**: ✅ FUNZIONA  
**Problemi**: Nessuno

### ✅ 5.3 `CommunicationsList` (`src/components/communications/communications-list.tsx`)

**Stato**: ✅ FUNZIONA  
**Funzionalità**:

- ✅ Mostra lista comunicazioni
- ✅ Gestione loading state
- ✅ Empty state con CTA

**Problemi Identificati**:

- ⚠️ **P1-UI-001**: Non c'è paginazione. Se ci sono molte comunicazioni, vengono caricate tutte in una volta.

### ✅ 5.4 `CommunicationCard` (`src/components/communications/communication-card.tsx`)

**Stato**: ✅ FUNZIONA  
**Funzionalità**:

- ✅ Mostra dettagli comunicazione
- ✅ Badge stato (sent, draft, scheduled, sending, failed)
- ✅ Statistiche (destinatari, consegnati, aperti)
- ✅ Action buttons (Modifica, Invia, Riprova, Reset)

**Problemi Identificati**:

- ⚠️ **P1-UI-002**: Per draft con `total_recipients = 0`, mostra "Destinatari calcolati all'invio" che è corretto, ma potrebbe confondere. Meglio mostrare il conteggio potenziale se disponibile.
- ⚠️ **P1-UI-003**: Il pulsante "Riprova invio" per stato "sending" chiama `check-stuck` che è asincrono ma non mostra loading state durante il check.

### ✅ 5.5 `NewCommunicationModal` (`src/components/communications/new-communication-modal.tsx`)

**Stato**: ✅ FUNZIONA  
**Funzionalità**:

- ✅ Form creazione/modifica comunicazione
- ✅ Selezione tipo (push, email, SMS, all)
- ✅ Selezione destinatari (Tutti, Solo atleti)
- ✅ Conteggio destinatari dinamico
- ✅ Programmazione invio

**Problemi Identificati**:

- ⚠️ **P1-UI-004**: Non c'è validazione lato client per lunghezza messaggio SMS (160 caratteri). C'è solo il counter visuale.
- ⚠️ **P1-UI-005**: Non c'è opzione per selezionare atleti specifici (solo "Tutti" o "Solo atleti"). Il filtro `athlete_ids` esiste nel backend ma non è esposto nell'UI.

---

## 6. Provider Configuration

### ⚠️ 6.1 Push Notifications

**Configurazione Richiesta**:

- `NEXT_PUBLIC_VAPID_KEY` (public key)
- `VAPID_PRIVATE_KEY` (server-side, non esposta)
- `VAPID_EMAIL` (email per VAPID)

**Stato**:

- ⚠️ **P1-CONFIG-001**: Le push notifications sono **simulate**. Il codice reale è commentato in `src/lib/notifications/push.ts` (righe 258-270).
- ⚠️ **P1-CONFIG-002**: Non c'è implementazione reale di `web-push` library.
- ⚠️ **P1-CONFIG-003**: La tabella `user_push_tokens` esiste ma i token potrebbero non essere registrati correttamente perché le push sono simulate.

### ⚠️ 6.2 Email (Resend)

**Configurazione Richiesta**:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`

**Stato**:

- ✅ Codice implementato correttamente
- ⚠️ **P1-CONFIG-004**: In sviluppo viene simulato. Funzionerà solo con variabili ambiente configurate.
- ⚠️ **P1-CONFIG-005**: Non c'è webhook per tracking apertura email. Il tracking pixel esiste ma il route `/api/track/email-open/[id]` potrebbe non essere implementato.

### ⚠️ 6.3 SMS (Twilio)

**Configurazione Richiesta**:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

**Stato**:

- ✅ Codice implementato correttamente
- ⚠️ **P1-CONFIG-006**: In sviluppo viene simulato. Funzionerà solo con variabili ambiente configurate.
- ⚠️ **P1-CONFIG-007**: Webhook SMS esiste (`/api/webhooks/sms`) ma la verifica signature Twilio è TODO (riga 45 di `src/app/api/webhooks/sms/route.ts`).

---

## 7. Errori Identificati

### 🔴 ERRORI CRITICI (Bloccanti)

#### E1-CRITICO-001: Push Notifications Non Funzionanti

- **Percorso**: `src/lib/notifications/push.ts:242-283`
- **Descrizione**: `sendWebPushNotification` è solo simulazione. Non invia realmente push notifications.
- **Impatto**: Le comunicazioni push non vengono mai inviate realmente.
- **Soluzione**: Implementare web-push library reale con VAPID keys.

#### E1-CRITICO-002: Recipients Non Aggiornati su Modifica

- **Percorso**: `src/hooks/communications/use-communications-page.tsx:303-364` (`handleUpdateCommunication`)
- **Descrizione**: Quando si modifica una comunicazione e cambia il `recipient_filter`, i recipients esistenti non vengono eliminati e ricreati.
- **Impatto**: Se si modifica il filtro destinatari, i vecchi recipients rimangono, causando invii a destinatari sbagliati.
- **Soluzione**: Eliminare recipients esistenti quando cambia `recipient_filter` e ricrearli all'invio.

### 🟡 ERRORI MEDI (Funzionali ma Problematici)

#### E2-MEDIO-001: Conteggio Destinatari Non Filtra Utenti Inattivi

- **Percorso**: `src/lib/communications/recipients.ts:47-129` (`getRecipientsByFilter`)
- **Descrizione**: Non filtra per `stato = 'attivo'` nella tabella `profiles`. Include anche utenti inattivi/sospesi.
- **Impatto**: Il conteggio destinatari include utenti che non dovrebbero ricevere comunicazioni.
- **Soluzione**: Aggiungere filtro `.eq('stato', 'attivo')` alla query.

#### E2-MEDIO-002: Timeout Fisso 5 Minuti

- **Percorso**: `src/app/api/communications/send/route.ts:11`
- **Descrizione**: Timeout hardcoded a 5 minuti. Per comunicazioni con molti destinatari (1000+), potrebbe non essere sufficiente.
- **Impatto**: Comunicazioni con molti destinatari potrebbero essere interrotte prematuramente.
- **Soluzione**: Timeout dinamico basato sul numero di recipients (es. 1 minuto per 100 recipients).

#### E2-MEDIO-003: Controllo Periodico Troppo Frequente

- **Percorso**: `src/hooks/communications/use-communications-page.tsx:63-87`
- **Descrizione**: Controlla comunicazioni bloccate ogni 2 minuti. Se ci sono molte comunicazioni in "sending", potrebbe essere inefficiente.
- **Impatto**: Chiamate API non necessarie.
- **Soluzione**: Ottimizzare per controllare solo comunicazioni in "sending" visibili nella lista corrente.

#### E2-MEDIO-004: Nessuna Paginazione nella Lista

- **Percorso**: `src/components/communications/communications-list.tsx`
- **Descrizione**: Tutte le comunicazioni vengono caricate in una volta.
- **Impatto**: Performance degradata con molte comunicazioni.
- **Soluzione**: Implementare paginazione o infinite scroll.

### 🟢 ERRORI MINORI (Miglioramenti)

#### E3-MINORE-001: Validazione SMS Solo Visuale

- **Percorso**: `src/components/communications/new-communication-modal.tsx:140-143`
- **Descrizione**: Counter caratteri SMS ma nessuna validazione lato client che impedisca invio se > 160 caratteri.
- **Impatto**: Utente può creare SMS troppo lunghi.
- **Soluzione**: Aggiungere validazione Zod o lato client.

#### E3-MINORE-002: Nessuna Selezione Atleti Specifici nell'UI

- **Percorso**: `src/components/communications/new-communication-modal.tsx:104-121`
- **Descrizione**: Solo "Tutti" o "Solo atleti". Il filtro `athlete_ids` esiste nel backend ma non è esposto.
- **Impatto**: Impossibile inviare comunicazioni a atleti specifici selezionati.
- **Soluzione**: Aggiungere multi-select per atleti specifici.

#### E3-MINORE-003: Messaggio "Destinatari calcolati all'invio" Confuso

- **Percorso**: `src/components/communications/communication-card.tsx:79-82`
- **Descrizione**: Per draft, mostra "Destinatari calcolati all'invio" invece del conteggio potenziale.
- **Impatto**: Confusione per l'utente.
- **Soluzione**: Calcolare e mostrare il conteggio potenziale anche per draft.

---

## 8. Problemi UX/UI

### 🟡 UX-001: Feedback Invio Incompleto

- **Problema**: Quando si clicca "Invia", non c'è feedback visivo chiaro del progresso per comunicazioni con molti destinatari.
- **Soluzione**: Aggiungere progress bar o indicatore di avanzamento.

### 🟡 UX-002: Errori Mostrati Solo in Alert

- **Problema**: Gli errori vengono mostrati con `alert()` che è poco user-friendly.
- **Soluzione**: Usare toast notifications o componenti error dedicati.

### 🟡 UX-003: Nessuna Conferma per Azioni Distruttive

- **Problema**: Eliminazione comunicazione non ha conferma.
- **Soluzione**: Aggiungere dialog di conferma.

### 🟡 UX-004: Nessuna Informazione Dettaglio Recipients

- **Problema**: Non c'è modo di vedere l'elenco dettagliato dei recipients (chi ha ricevuto, chi ha aperto, chi ha fallito).
- **Soluzione**: Aggiungere modal/drawer con dettagli recipients.

### 🟢 UX-005: Badge Stato Potrebbero Essere Più Informativi

- **Problema**: Badge "Invio in corso" non mostra percentuale completamento.
- **Soluzione**: Aggiungere percentuale se disponibile (es. "Invio in corso (45%)").

---

## 9. Mancanze Funzionali

### 🔴 FUNZ-001: Push Notifications Reali

- **Descrizione**: Le push notifications sono simulate. Non funzionano realmente.
- **Priorità**: 🔴 ALTA
- **File Coinvolti**: `src/lib/notifications/push.ts`

### 🟡 FUNZ-002: Aggiornamento Recipients su Modifica

- **Descrizione**: Quando si modifica `recipient_filter`, i recipients non vengono aggiornati.
- **Priorità**: 🟡 MEDIA
- **File Coinvolti**: `src/hooks/communications/use-communications-page.tsx`, `src/lib/communications/service.ts`

### 🟡 FUNZ-003: Filtro Utenti Inattivi

- **Descrizione**: Non filtra utenti con `stato != 'attivo'`.
- **Priorità**: 🟡 MEDIA
- **File Coinvolti**: `src/lib/communications/recipients.ts`

### 🟡 FUNZ-004: Selezione Atleti Specifici nell'UI

- **Descrizione**: Non c'è modo di selezionare atleti specifici dall'UI.
- **Priorità**: 🟡 MEDIA
- **File Coinvolti**: `src/components/communications/new-communication-modal.tsx`

### 🟡 FUNZ-005: Paginazione Lista Comunicazioni

- **Descrizione**: Tutte le comunicazioni vengono caricate in una volta.
- **Priorità**: 🟡 MEDIA
- **File Coinvolti**: `src/hooks/use-communications.ts`, `src/components/communications/communications-list.tsx`

### 🟢 FUNZ-006: Dettaglio Recipients

- **Descrizione**: Non c'è modo di vedere l'elenco dettagliato dei recipients.
- **Priorità**: 🟢 BASSA
- **File Coinvolti**: Nuovo componente da creare

### 🟢 FUNZ-007: Export Report Comunicazioni

- **Descrizione**: Non c'è modo di esportare report delle comunicazioni.
- **Priorità**: 🟢 BASSA
- **File Coinvolti**: Nuovo feature da implementare

### 🟢 FUNZ-008: Template Personalizzati

- **Descrizione**: I template email/SMS esistono nel codice ma non c'è UI per gestirli.
- **Priorità**: 🟢 BASSA
- **File Coinvolti**: Nuovo feature da implementare

---

## 10. TODO Prioritaria

### 🔴 PRIORITÀ ALTA (Bloccanti)

#### TODO-001: Implementare Push Notifications Reali

- **File**: `src/lib/notifications/push.ts`
- **Azioni**:
  1. Installare `web-push` package: `npm install web-push`
  2. Configurare VAPID keys (generare se non esistono)
  3. Implementare `sendWebPushNotification` reale (sostituire simulazione righe 242-283)
  4. Testare invio reale push notification
- **Dipendenze**: VAPID keys configurate
- **Tempo Stimato**: 2-3 ore

#### TODO-002: Fix Aggiornamento Recipients su Modifica

- **File**: `src/hooks/communications/use-communications-page.tsx`, `src/lib/communications/service.ts`
- **Azioni**:
  1. Quando si modifica una comunicazione, verificare se `recipient_filter` è cambiato
  2. Se cambiato, eliminare recipients esistenti prima di salvare
  3. All'invio, creare nuovi recipients con il nuovo filtro
  4. Alternativa: eliminare e ricreare recipients direttamente durante `updateCommunication` se cambia `recipient_filter`
- **Tempo Stimato**: 1-2 ore

### 🟡 PRIORITÀ MEDIA (Importanti)

#### TODO-003: Filtrare Utenti Inattivi

- **File**: `src/lib/communications/recipients.ts`
- **Azioni**:
  1. Aggiungere `.eq('stato', 'attivo')` alla query in `getRecipientsByFilter` (riga 53)
  2. Aggiungere stesso filtro in `countRecipientsByFilter` (riga 225)
  3. Testare che il conteggio escluda utenti inattivi
- **Tempo Stimato**: 30 minuti

#### TODO-004: Timeout Dinamico per Invio

- **File**: `src/app/api/communications/send/route.ts`
- **Azioni**:
  1. Calcolare timeout basato su numero di recipients (es. 1 minuto per 100 recipients, minimo 2 minuti, massimo 10 minuti)
  2. Aggiornare `SEND_TIMEOUT_MS` per essere dinamico
- **Tempo Stimato**: 30 minuti

#### TODO-005: Implementare Selezione Atleti Specifici

- **File**: `src/components/communications/new-communication-modal.tsx`
- **Azioni**:
  1. Aggiungere terza opzione "Atleti specifici" al filtro destinatari
  2. Mostrare multi-select/searchable per atleti quando selezionato
  3. Aggiornare `formRecipientFilter` per supportare `'custom'`
  4. Gestire `athlete_ids` array nel `recipient_filter`
- **Dipendenze**: Hook/API per fetch lista atleti
- **Tempo Stimato**: 2-3 ore

#### TODO-006: Ottimizzare Controllo Periodico Comunicazioni Bloccate

- **File**: `src/hooks/communications/use-communications-page.tsx`
- **Azioni**:
  1. Controllare solo comunicazioni in "sending" visibili nella lista corrente
  2. O aumentare intervallo a 5 minuti invece di 2
  3. O controllare solo quando la pagina è attiva (usare `document.visibilityState`)
- **Tempo Stimato**: 1 ora

#### TODO-007: Aggiungere Paginazione Lista Comunicazioni

- **File**: `src/hooks/use-communications.ts`, `src/components/communications/communications-list.tsx`
- **Azioni**:
  1. Implementare paginazione lato hook (limit/offset)
  2. Aggiungere controlli paginazione nell'UI
  3. Mantenere totale count per mostrare "X di Y comunicazioni"
- **Tempo Stimato**: 2-3 ore

### 🟢 PRIORITÀ BASSA (Miglioramenti)

#### TODO-008: Validazione SMS Lato Client

- **File**: `src/components/communications/new-communication-modal.tsx`
- **Azioni**:
  1. Aggiungere validazione Zod per max 160 caratteri per SMS
  2. Disabilitare "Invia ora" se supera il limite
  3. Mostrare messaggio di errore chiaro
- **Tempo Stimato**: 30 minuti

#### TODO-009: Sostituire Alert con Toast Notifications

- **File**: Tutti i file che usano `alert()`
- **Azioni**:
  1. Installare libreria toast (es. `sonner` o `react-hot-toast`)
  2. Sostituire tutti gli `alert()` con toast notifications
- **Tempo Stimato**: 1-2 ore

#### TODO-010: Aggiungere Dettaglio Recipients

- **File**: Nuovo componente
- **Azioni**:
  1. Creare componente `CommunicationRecipientsDetail`
  2. Mostrare lista recipients con status, data invio/consegna/apertura, errori
  3. Filtri per status (sent, delivered, opened, failed)
  4. Integrare nel `CommunicationCard` come modal/drawer
- **Tempo Stimato**: 3-4 ore

#### TODO-011: Aggiungere Dialog Conferma Eliminazione

- **File**: `src/components/communications/communication-card.tsx` (da aggiungere), `src/app/dashboard/comunicazioni/page.tsx`
- **Azioni**:
  1. Creare dialog di conferma per eliminazione
  2. Integrare nell'action button delete
- **Tempo Stimato**: 1 ora

#### TODO-012: Mostrare Conteggio Potenziale per Draft

- **File**: `src/components/communications/communication-card.tsx`, `src/hooks/communications/use-communications-page.tsx`
- **Azioni**:
  1. Quando si crea/modifica, calcolare e salvare `estimated_recipients` nel metadata
  2. Mostrare questo valore invece di "Destinatari calcolati all'invio"
- **Tempo Stimato**: 1 ora

#### TODO-013: Progress Bar per Invio in Corso

- **File**: `src/components/communications/communication-card.tsx`
- **Azioni**:
  1. Se status = 'sending', calcolare percentuale: `(total_sent + total_failed) / total_recipients * 100`
  2. Mostrare progress bar con percentuale
- **Tempo Stimato**: 1-2 ore

#### TODO-014: Implementare Webhook Email Tracking

- **File**: `src/app/api/track/email-open/[id]/route.ts` (da verificare se esiste)
- **Azioni**:
  1. Verificare se esiste il route
  2. Se non esiste, crearlo per tracciare aperture email
  3. Aggiornare `communication_recipients.opened_at` quando viene chiamato
- **Tempo Stimato**: 1-2 ore

#### TODO-015: Verifica Signature Twilio Webhook

- **File**: `src/app/api/webhooks/sms/route.ts`
- **Azioni**:
  1. Implementare verifica signature Twilio (rimuovere TODO riga 45)
  2. Testare con webhook reali da Twilio
- **Tempo Stimato**: 1-2 ore

---

## 📊 Riepilogo Statistiche

### File Analizzati

- **Database**: 1 migration file
- **Backend Services**: 9 file
- **API Routes**: 3 route files
- **Frontend Hooks**: 2 file
- **UI Components**: 6 componenti
- **Totale**: ~21 file

### Problemi Identificati

- 🔴 **Critici**: 2
- 🟡 **Medi**: 6
- 🟢 **Minori**: 3
- **Totale**: 11 problemi

### Mancanze Funzionali

- 🔴 **Alta Priorità**: 1
- 🟡 **Media Priorità**: 4
- 🟢 **Bassa Priorità**: 4
- **Totale**: 9 mancanze

### TODO Totale

- 🔴 **Priorità Alta**: 2 TODO
- 🟡 **Priorità Media**: 5 TODO
- 🟢 **Priorità Bassa**: 9 TODO
- **Totale**: 16 TODO

### Tempo Stimato Totale

- **Priorità Alta**: 3-5 ore
- **Priorità Media**: 8-12 ore
- **Priorità Bassa**: 12-18 ore
- **TOTALE**: ~23-35 ore

---

## 🎯 Prossimi Passi Immediati

1. **TODO-001**: Implementare push notifications reali (CRITICO)
2. **TODO-002**: Fix aggiornamento recipients su modifica (CRITICO)
3. **TODO-003**: Filtrare utenti inattivi (MEDIO, veloce da fixare)
4. **TODO-004**: Timeout dinamico (MEDIO, veloce da fixare)

---

**Documento Creato**: 2025-01-31  
**Prossima Revisione**: Dopo completamento TODO priorità alta
