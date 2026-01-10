# 📚 Documentazione Tecnica: useCommunicationsPage

**Percorso**: `src/hooks/communications/use-communications-page.tsx`  
**Tipo Modulo**: React Hook (Page State Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione completa pagina comunicazioni. Gestisce stato form, paginazione, filtri, ricerca, operazioni CRUD, invio comunicazioni, e controllo comunicazioni bloccate.

---

## 🔧 Funzioni e Export

### 1. `useCommunicationsPage`

**Classificazione**: React Hook, Page State Hook, Client Component, Side-Effecting  
**Tipo**: `() => UseCommunicationsPageReturn`

**Parametri**: Nessuno

**Output**: Oggetto con:

- **Dati Lista**:
  - `communications`: `Communication[]` - Comunicazioni filtrate
  - `totalCount`: `number | null` - Totale comunicazioni
  - `loading`: `boolean` - Stato caricamento
  - `error`: `Error | null` - Errore
- **Paginazione**:
  - `currentPage`: `number` - Pagina corrente
  - `totalPages`: `number` - Totale pagine
  - `itemsPerPage`: `number` - Items per pagina (10)
  - `hasNextPage`: `boolean` - Ha pagina successiva
  - `hasPrevPage`: `boolean` - Ha pagina precedente
  - `handleNextPage()`: `() => void` - Vai a pagina successiva
  - `handlePrevPage()`: `() => void` - Vai a pagina precedente
  - `handlePageChange(page)`: `(page: number) => void` - Vai a pagina specifica
- **Filtri e Ricerca**:
  - `activeTab`: `string` - Tab attivo ('tutte' | 'push' | 'email' | 'sms')
  - `setActiveTab`: `(tab: string) => void` - Cambia tab
  - `searchTerm`: `string` - Termine ricerca
  - `setSearchTerm`: `(term: string) => void` - Cambia termine ricerca
- **Form Stato**:
  - `formType`: `'push' | 'email' | 'sms' | 'all'` - Tipo comunicazione
  - `setFormType`: `(type) => void`
  - `formTitle`: `string` - Titolo
  - `setFormTitle`: `(title: string) => void`
  - `formMessage`: `string` - Messaggio
  - `setFormMessage`: `(message: string) => void`
  - `formRecipientFilter`: `'all' | 'atleti' | 'custom'` - Filtro destinatari
  - `setFormRecipientFilter`: `(filter) => void`
  - `formSelectedAthletes`: `string[]` - Atleti selezionati (per custom)
  - `setFormSelectedAthletes`: `(athletes: string[]) => void`
  - `formScheduled`: `boolean` - Programmato
  - `setFormScheduled`: `(scheduled: boolean) => void`
  - `formScheduledDate`: `string` - Data programmazione
  - `setFormScheduledDate`: `(date: string) => void`
  - `formLoading`: `boolean` - Stato salvataggio
  - `recipientCount`: `number | null` - Count destinatari
  - `editingCommunicationId`: `string | null` - ID comunicazione in edit
- **Operazioni**:
  - `handleCreateCommunication(sendNow)`: `(sendNow: boolean) => Promise<void>` - Crea comunicazione
  - `handleUpdateCommunication(sendNow)`: `(sendNow: boolean) => Promise<void>` - Aggiorna comunicazione
  - `handleEditCommunication(id)`: `(id: string | null) => void` - Carica comunicazione per edit
  - `handleSendCommunication(id)`: `(id: string) => Promise<void>` - Invia comunicazione
  - `handleResetCommunication(id)`: `(id: string) => Promise<void>` - Reset comunicazione bloccata
  - `handleDeleteCommunication(id)`: `(id: string) => Promise<void>` - Elimina comunicazione
- **UI Helpers**:
  - `getTipoIcon(tipo)`: `(tipo: string) => ReactNode` - Icona tipo comunicazione
  - `getStatoBadge(stato)`: `(stato: string) => ReactNode` - Badge stato comunicazione
  - `formatData(dataString)`: `(dataString: string | null) => string` - Formatta data

**Descrizione**: Hook completo per gestione pagina comunicazioni con:

- Integrazione con `useCommunications` per CRUD
- Paginazione automatica (10 items per pagina)
- Filtri per tipo (push/email/sms/tutte)
- Ricerca client-side (titolo/messaggio)
- Form creazione/modifica comunicazioni
- Calcolo count destinatari dinamico
- Controllo comunicazioni bloccate (check ogni 5 minuti)
- Gestione schedulazione

---

## 🔄 Flusso Logico

### Inizializzazione

1. Hook inizializza stato form vuoto
2. `useCommunications` carica comunicazioni con filtri/paginazione
3. Reset pagina a 1 quando cambia tab

### Creazione Comunicazione

1. Validazione: `formTitle` e `formMessage` non vuoti
2. Costruisce `CreateCommunicationInput`:
   - `title`, `message`, `type`
   - `recipient_filter`: `{ all_users: true }` | `{ role: 'atleta' }` | `{ athlete_ids: [...] }`
   - `scheduled_for`: Data se programmato
3. Chiama `createCommunication(input)`
4. Se `sendNow` → chiama `sendCommunication(id)`
5. Reset form e refresh lista

### Modifica Comunicazione

1. `handleEditCommunication(id)`:
   - Carica comunicazione da lista
   - Popola form con dati esistenti
   - Mappa `recipient_filter` a form state
2. `handleUpdateCommunication(sendNow)`:
   - Validazione form
   - Costruisce `UpdateCommunicationInput`
   - Chiama `updateCommunication(id, input)`
   - Se `sendNow` → chiama `sendCommunication(id)`
   - Reset form e refresh lista

### Invio Comunicazione

1. Chiama `sendCommunication(id)` (API route `/api/communications/send`)
2. API gestisce:
   - Creazione recipients da `recipient_filter`
   - Invio effettivo (push/email/SMS)
   - Aggiornamento stato a 'sent'
3. Refresh lista dopo invio

### Reset Comunicazione Bloccata

1. Controllo automatico ogni 5 minuti:
   - Verifica comunicazioni con `status = 'sending'`
   - Chiama `/api/communications/check-stuck`
   - Reset automatico se bloccate
2. Reset manuale: `handleResetCommunication(id)`
   - UPDATE `status = 'draft'` WHERE `status IN ('sending', 'failed')`

### Calcolo Count Destinatari

1. Quando cambia `formRecipientFilter`:
   - `'all'` → API `/api/communications/count-recipients` con `{ all_users: true }`
   - `'atleti'` → API con `{ role: 'atleta' }`
   - `'custom'` → Count = `formSelectedAthletes.length`

---

## 📊 Dipendenze

**Dipende da**: `useCommunications`, `useToast`, Lucide icons, `Badge` component

**Utilizzato da**: Pagina `comunicazioni/page.tsx`

---

## ⚠️ Note Tecniche

- **Paginazione**: 10 items per pagina, reset a pagina 1 quando cambia filtro
- **Ricerca Client-Side**: Filtra per titolo/messaggio (può essere migliorata con ricerca server-side)
- **Auto-Refresh**: `useCommunications` con `autoRefresh: true` (refresh ogni 30s)
- **Stuck Communications**: Controllo ogni 5 minuti solo se pagina visibile (performance)
- **Count Destinatari**: Calcolo dinamico via API (usa service role key lato server)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
