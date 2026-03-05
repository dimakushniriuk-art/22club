# 📚 Documentazione Tecnica: useCalendarPage

**Percorso**: `src/hooks/calendar/use-calendar-page.ts`  
**Tipo Modulo**: React Hook (Page State Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione completa pagina calendario. Gestisce fetch appuntamenti, fetch atleti, creazione/modifica/cancellazione appuntamenti, controllo sovrapposizioni, e normalizzazione stato.

---

## 🔧 Funzioni e Export

### 1. `useCalendarPage`

**Classificazione**: React Hook, Page State Hook, Client Component, Async, Side-Effecting  
**Tipo**: `() => UseCalendarPageReturn`

**Parametri**: Nessuno (usa `useSearchParams` e `useRouter` per URL)

**Output**: Oggetto con:

- **Dati**:
  - `appointments`: `AppointmentUI[]` - Array appuntamenti con nomi atleti
  - `appointmentsLoading`: `boolean` - Stato caricamento appuntamenti
  - `athletes`: `Array<{ id: string; name: string; email: string }>` - Lista atleti attivi
  - `athletesLoading`: `boolean` - Stato caricamento atleti
  - `trainerId`: `string | null` - ID trainer/staff corrente
  - `trainerName`: `string | null` - Nome trainer/staff corrente
  - `loading`: `boolean` - Stato operazioni (create/update/delete)
- **Operazioni**:
  - `fetchAppointments()`: `Promise<void>` - Ricarica appuntamenti
  - `handleFormSubmit(data, editingAppointment)`: `Promise<void>` - Crea/modifica appuntamento
  - `handleCancel(appointmentId)`: `Promise<void>` - Cancella appuntamento
  - `handleDelete(appointmentId)`: `Promise<void>` - Elimina appuntamento

**Descrizione**: Hook completo per gestione calendario con:

- Fetch appuntamenti per trainer corrente (`staff_id = trainerId`)
- Join con `profiles` per nomi atleti
- Normalizzazione stato appuntamenti (completato/annullato/in_corso/attivo)
- Creazione/modifica appuntamenti con controllo sovrapposizioni
- Cancellazione/eliminazione appuntamenti
- Fetch lista atleti attivi per selezione

---

## 🔄 Flusso Logico

### Inizializzazione

1. **Fetch Profilo Staff**:
   - GET `profiles` WHERE `user_id = currentUser.id`
   - Imposta `trainerId` e `trainerName`

2. **Fetch Appuntamenti** (quando `trainerId` disponibile):
   - SELECT `appointments` WHERE `staff_id = trainerId`
   - ORDER BY `starts_at ASC`

3. **Fetch Nomi Atleti**:
   - SELECT `profiles` WHERE `role IN ('athlete', 'atleta') AND stato = 'attivo'`
   - Mappa a `{ id, name, email }`

4. **Mapping Appuntamenti**:
   - Aggiunge `athlete_name` da `athleteNamesMap`
   - Normalizza `status` (completato/annullato/in_corso/attivo)
   - Crea `title`: `${athleteName} - ${notes || type || 'Sessione'}`

### Create/Update Appointment

1. **Validazione**:
   - Verifica `trainerId` disponibile
   - Verifica `athlete_id` selezionato
   - Verifica `starts_at` e `ends_at` presenti
   - Verifica `ends_at > starts_at`

2. **Controllo Sovrapposizioni**:
   - Chiama `checkAppointmentOverlap(trainerId, startsAt, endsAt, editingId)`
   - Se sovrapposizione → errore con dettagli conflitti

3. **Update** (se `editingAppointment.id` presente):
   - UPDATE `appointments` WHERE `id = editingId`
   - SET: `athlete_id`, `starts_at`, `ends_at`, `type`, `status`, `notes`, `location`, `athlete_name`

4. **Create** (se nuovo):
   - INSERT `appointments` con:
     - `org_id`, `athlete_id`, `staff_id` (trainerId), `starts_at`, `ends_at`, `type`, `status`, `notes`, `location`
   - Status default: 'attivo' (se non valido)

5. **Refetch**:
   - Chiama `fetchAppointments()` dopo successo

### Cancel Appointment

1. UPDATE `appointments`:
   - SET `cancelled_at = NOW()`, `status = 'annullato'`
   - WHERE `id = appointmentId`

2. Refetch appuntamenti

### Delete Appointment

1. DELETE `appointments` WHERE `id = appointmentId`

2. Refetch appuntamenti

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`), Next.js (`useSearchParams`, `useRouter`), `createClient` (Supabase), `checkAppointmentOverlap`, tipo `AppointmentUI`, `CreateAppointmentData`, `EditAppointmentData`

**Utilizzato da**: Pagina calendario (`calendar/page.tsx`)

---

## ⚠️ Note Tecniche

- **Staff ID**: Usa `staff_id` nel database (non `trainer_id`, rimosso nella nuova struttura)
- **Normalizzazione Stato**: Converte vari formati stato (completato/completed, annullato/cancelled, etc.) a formato standard
- **Controllo Sovrapposizioni**: Usa `checkAppointmentOverlap` utility per verificare conflitti
- **Error Handling**: Gestisce errori Supabase con dettagli (message, details, hint)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
