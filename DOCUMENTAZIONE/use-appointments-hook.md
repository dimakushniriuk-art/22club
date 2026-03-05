# 📚 Documentazione Tecnica: useAppointments

**Percorso**: `src/hooks/use-appointments.ts`  
**Tipo Modulo**: React Hook (Data Fetching Hook, CRUD Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook principale per gestione appuntamenti. Fornisce fetch lista con filtri ruolo, CRUD completo (create, update, cancel, delete), controllo sovrapposizioni via RPC, e join con profili atleti/trainer.

---

## 🔧 Funzioni e Export

### 1. `useAppointments`

**Classificazione**: React Hook, Data Fetching Hook, CRUD Hook, Client Component, Async  
**Tipo**: `(props: UseAppointmentsProps) => UseAppointmentsReturn`

**Parametri**:

- `props`: `UseAppointmentsProps`
  - `userId?`: `string` - ID utente corrente
  - `role?`: `string` - Ruolo utente ('atleta' | 'pt' | 'admin')

**Output**: Oggetto con:

- **Dati**:
  - `appointments`: `Appointment[]` - Array appuntamenti (con `athlete_name` e `trainer_name`)
  - `loading`: `boolean` - Stato caricamento
  - `error`: `string | null` - Errore
- **Operazioni**:
  - `fetchAppointments()`: `Promise<void>` - Ricarica appuntamenti
  - `createAppointment(appointmentData)`: `Promise<Appointment>` - Crea appuntamento
  - `updateAppointment(id, updates)`: `Promise<Appointment>` - Aggiorna appuntamento
  - `cancelAppointment(id)`: `Promise<Appointment>` - Cancella appuntamento (soft delete)
  - `deleteAppointment(id)`: `Promise<void>` - Elimina appuntamento (hard delete)
  - `checkOverlap(trainerId, startsAt, endsAt, excludeId?)`: `Promise<boolean>` - Verifica sovrapposizioni
  - `refetch()`: `Promise<void>` - Alias per `fetchAppointments`

**Descrizione**: Hook completo per gestione appuntamenti con:

- Fetch lista con filtri basati su ruolo:
  - `'atleta'`: WHERE `athlete_id = userId` AND `starts_at >= NOW()` AND `cancelled_at IS NULL` (solo futuri, non cancellati)
  - `'pt' | 'admin'`: WHERE `trainer_id = userId` (tutti i propri appuntamenti)
- Join con `profiles` per nomi atleti e trainer
- CRUD completo (create, update, cancel, delete)
- Controllo sovrapposizioni via RPC `check_appointment_overlap`

---

## 🔄 Flusso Logico

### Fetch Appointments

1. **Query Base**:
   - SELECT da `appointments` con join:
     - `athlete:profiles!athlete_id(first_name, last_name)`
     - `trainer:profiles!trainer_id(first_name, last_name)`

2. **Filtri Ruolo**:
   - `'atleta'`:
     - WHERE `athlete_id = userId`
     - AND `starts_at >= NOW()` (solo futuri)
     - AND `cancelled_at IS NULL` (non cancellati)
   - `'pt' | 'admin'`:
     - WHERE `trainer_id = userId`

3. **Trasformazione Dati**:
   - Aggiunge `athlete_name`: `${athlete.first_name} ${athlete.last_name}`
   - Aggiunge `trainer_name`: `${trainer.first_name} ${trainer.last_name}`
   - Normalizza campi opzionali (`location`, `notes`, `cancelled_at`)

4. **Ordinamento**:
   - ORDER BY `starts_at ASC`

### Create Appointment

1. INSERT in `appointments` con `appointmentData`
2. SELECT record creato
3. Refetch automatico lista

### Update Appointment

1. UPDATE `appointments` WHERE `id = id` con `updates`
2. SELECT record aggiornato
3. Refetch automatico lista

### Cancel Appointment

1. UPDATE `appointments`:
   - SET `cancelled_at = NOW()`
   - WHERE `id = id`

2. SELECT record aggiornato
3. Refetch automatico lista

### Delete Appointment

1. DELETE `appointments` WHERE `id = id`
2. Refetch automatico lista

### Check Overlap

1. **Chiamata RPC**:
   - `supabase.rpc('check_appointment_overlap', { p_staff_id: trainerId, p_starts_at: startsAt, p_ends_at: endsAt, p_exclude_appointment_id: excludeId })`

2. **Parsing Risultato**:
   - RPC ritorna array con `{ has_overlap: boolean }`
   - Ritorna `result.has_overlap || false`

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`), `createClient` (Supabase), tipo `Appointment`

**Utilizzato da**: Componenti gestione appuntamenti, calendario

---

## ⚠️ Note Tecniche

- **Join Supabase**: Usa sintassi `profiles!athlete_id` per join automatico
- **Filtri Atleta**: Solo appuntamenti futuri e non cancellati (per UX migliore)
- **RPC Overlap**: Usa RPC function per controllo sovrapposizioni (più efficiente di query manuale)
- **Soft Delete**: `cancelAppointment` è soft delete (imposta `cancelled_at`), `deleteAppointment` è hard delete

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
