# 📅 useAppointments Hook - Documentazione Tecnica

**File**: `src/hooks/use-appointments.ts`  
**Classificazione**: React Hook, Client Component, Side-Effecting, Async  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T16:45:00Z

---

## 📋 Panoramica

Hook React personalizzato per gestire operazioni CRUD su appuntamenti (appointments) nel sistema calendario. Fornisce funzionalità complete per creare, leggere, aggiornare, cancellare e verificare sovrapposizioni di appuntamenti, con filtri basati sul ruolo utente (atleta, PT, admin).

---

## 🔧 Parametri

### Input

```typescript
interface UseAppointmentsProps {
  userId?: string // ID utente (profile.id o user_id)
  role?: string // Ruolo utente: 'atleta' | 'pt' | 'admin'
}
```

**Parametri**:

- `userId` (opzionale): ID dell'utente corrente. Se non fornito, il hook non caricherà dati.
- `role` (opzionale): Ruolo dell'utente per filtrare gli appuntamenti:
  - `'atleta'`: Vede solo i propri appuntamenti futuri non cancellati
  - `'pt'` o `'admin'`: Vede tutti i propri appuntamenti (come trainer)

---

## 📤 Output

```typescript
{
  appointments: Appointment[]        // Array di appuntamenti
  loading: boolean                    // Stato caricamento
  error: string | null               // Errore eventuale
  createAppointment: (data) => Promise<Appointment | undefined>
  updateAppointment: (id, updates) => Promise<Appointment | undefined>
  cancelAppointment: (id) => Promise<Appointment | undefined>
  deleteAppointment: (id) => Promise<void>
  checkOverlap: (trainerId, startsAt, endsAt, excludeId?) => Promise<boolean>
  refetch: () => Promise<void>
}
```

**Proprietà**:

- `appointments`: Array di appuntamenti caricati, trasformati con nomi atleta/trainer
- `loading`: `true` durante il caricamento iniziale o refetch
- `error`: Messaggio di errore se presente, `null` altrimenti
- `createAppointment`: Crea un nuovo appuntamento e ricarica la lista
- `updateAppointment`: Aggiorna un appuntamento esistente e ricarica la lista
- `cancelAppointment`: Cancella un appuntamento (soft delete con `cancelled_at`)
- `deleteAppointment`: Elimina definitivamente un appuntamento
- `checkOverlap`: Verifica se esiste una sovrapposizione temporale per un trainer
- `refetch`: Ricarica manualmente gli appuntamenti

---

## 🔄 Flusso Logico

### 1. Inizializzazione

```typescript
useEffect(() => {
  if (!userId) return
  fetchAppointments()
}, [userId, role, fetchAppointments])
```

- Il hook carica automaticamente gli appuntamenti quando `userId` è disponibile
- Dipende da `userId`, `role` e `fetchAppointments` (memoizzato con `useCallback`)

### 2. Fetch Appuntamenti (`fetchAppointments`)

**Query Base**:

```typescript
supabase.from('appointments').select(`
  *,
  athlete:profiles!athlete_id(first_name, last_name),
  trainer:profiles!trainer_id(first_name, last_name)
`)
```

**Filtri per Ruolo**:

- **Atleta**:
  - `eq('athlete_id', userId)` - Solo propri appuntamenti
  - `gte('starts_at', new Date().toISOString())` - Solo futuri
  - `is('cancelled_at', null)` - Solo non cancellati
- **PT/Admin**:
  - `eq('trainer_id', userId)` - Solo propri appuntamenti come trainer

**Trasformazione Dati**:

- Combina `first_name` e `last_name` in `athlete_name` e `trainer_name`
- Normalizza campi opzionali (`recurrence_rule`, `location`, `notes`, `cancelled_at`)

### 3. Creazione Appuntamento (`createAppointment`)

```typescript
const { data, error } = await supabase.from('appointments').insert([appointmentData]).select()
```

- Inserisce un nuovo appuntamento
- Ricarica automaticamente la lista dopo l'inserimento
- Ritorna l'appuntamento creato o `undefined` in caso di errore

### 4. Aggiornamento Appuntamento (`updateAppointment`)

```typescript
const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select()
```

- Aggiorna parzialmente un appuntamento esistente
- Ricarica automaticamente la lista
- Ritorna l'appuntamento aggiornato

### 5. Cancellazione Appuntamento (`cancelAppointment`)

```typescript
const { data, error } = await supabase
  .from('appointments')
  .update({ cancelled_at: new Date().toISOString() })
  .eq('id', id)
  .select()
```

- Soft delete: imposta `cancelled_at` invece di eliminare
- L'appuntamento rimane nel database ma viene filtrato nelle query atleta

### 6. Eliminazione Appuntamento (`deleteAppointment`)

```typescript
const { error } = await supabase.from('appointments').delete().eq('id', id)
```

- Eliminazione definitiva dal database
- Ricarica automaticamente la lista

### 7. Verifica Sovrapposizioni (`checkOverlap`)

```typescript
let query = supabase
  .from('appointments')
  .select('id, starts_at, ends_at')
  .eq('trainer_id', trainerId)
  .is('cancelled_at', null)
  .or(`and(starts_at.lt.${endsAt},ends_at.gt.${startsAt})`)
```

**Logica Sovrapposizione**:

- Cerca appuntamenti del trainer che si sovrappongono temporalmente
- Esclude appuntamenti cancellati
- Opzionalmente esclude un ID (utile per edit)
- Ritorna `true` se esiste sovrapposizione, `false` altrimenti

**Nota**: Questa funzione esiste ma **non viene usata** nel form creazione (vedi P4-004)

---

## ⚠️ Errori Possibili

### Errori Database

- **RLS Policy Error**: Se le RLS policies sono troppo restrittive (P1-001)
  - Sintomo: `0 righe visibili` anche se esistono dati
  - Fix: Applicare `docs/FIX_RLS_POLICIES_COMPLETE.sql`

- **Foreign Key Error**: Se `athlete_id` o `trainer_id` non esistono
  - Sintomo: `insert or update on table "appointments" violates foreign key constraint`
  - Fix: Verificare che i profili esistano prima di creare appuntamenti

- **Constraint Error**: Se `ends_at <= starts_at`
  - Sintomo: `new row for relation "appointments" violates check constraint "valid_time_range"`
  - Fix: Validare che `ends_at > starts_at` prima di salvare

### Errori Network

- **Timeout**: Query troppo lente
  - Sintomo: `error.message` contiene timeout
  - Fix: Ottimizzare query, aggiungere indici

### Errori Trasformazione

- **Missing Data**: Se `athlete` o `trainer` non esistono nella join
  - Sintomo: `athlete_name` o `trainer_name` sono `undefined`
  - Fix: Gestito con fallback a stringa vuota

---

## 🔗 Dipendenze Critiche

### Dipendenze Esterne

1. **Supabase Client** (`@/lib/supabase`)
   - Richiesto per tutte le operazioni database
   - Deve essere configurato correttamente

2. **React Hooks** (`useState`, `useEffect`, `useCallback`)
   - Gestione stato e side-effects

3. **Database Schema** (`appointments` table)
   - Deve avere colonne: `id`, `athlete_id`, `trainer_id`, `starts_at`, `ends_at`, `cancelled_at`, etc.
   - Deve avere foreign keys a `profiles` table
   - Deve avere RLS policies configurate

### Dipendenze Interne

- **Profiles Table**: Per join con nomi atleta/trainer
- **RLS Policies**: Per filtrare appuntamenti in base al ruolo

---

## 📝 Esempi d'Uso

### Esempio 1: Caricare Appuntamenti Atleta

```typescript
import { useAppointments } from '@/hooks/use-appointments'
import { useAuth } from '@/hooks/use-auth'

function AthleteAppointments() {
  const { user } = useAuth()
  const { appointments, loading, error } = useAppointments({
    userId: user?.id,
    role: 'atleta'
  })

  if (loading) return <div>Caricamento...</div>
  if (error) return <div>Errore: {error}</div>

  return (
    <div>
      {appointments.map(apt => (
        <div key={apt.id}>
          {apt.athlete_name} - {apt.starts_at}
        </div>
      ))}
    </div>
  )
}
```

### Esempio 2: Creare Appuntamento

```typescript
const { createAppointment, error } = useAppointments({
  userId: trainerId,
  role: 'pt',
})

const handleCreate = async () => {
  try {
    const newAppointment = await createAppointment({
      org_id: 'default-org',
      athlete_id: 'athlete-uuid',
      trainer_id: trainerId,
      starts_at: '2025-02-01T10:00:00Z',
      ends_at: '2025-02-01T11:00:00Z',
      type: 'allenamento',
      notes: 'Sessione forza - Upper body',
    })
    console.log('Appuntamento creato:', newAppointment)
  } catch (err) {
    console.error('Errore:', err)
  }
}
```

### Esempio 3: Verificare Sovrapposizioni

```typescript
const { checkOverlap } = useAppointments({ userId, role: 'pt' })

const handleCheck = async () => {
  const hasOverlap = await checkOverlap(trainerId, '2025-02-01T10:00:00Z', '2025-02-01T11:00:00Z')

  if (hasOverlap) {
    alert('Esiste già un appuntamento in questo orario!')
  }
}
```

### Esempio 4: Cancellare Appuntamento

```typescript
const { cancelAppointment } = useAppointments({ userId, role: 'pt' })

const handleCancel = async (appointmentId: string) => {
  try {
    await cancelAppointment(appointmentId)
    // Appuntamento cancellato (soft delete)
  } catch (err) {
    console.error('Errore cancellazione:', err)
  }
}
```

---

## 🎯 Side-Effects

### Side-Effects Positivi

1. **Query Database**: Tutte le operazioni CRUD eseguono query Supabase
2. **State Updates**: Aggiorna `appointments`, `loading`, `error` in React state
3. **Auto-Refetch**: Dopo create/update/cancel/delete, ricarica automaticamente la lista
4. **Console Logging**: Log errori in console per debugging

### Side-Effects Negativi (da evitare)

- Nessun side-effect negativo identificato

---

## 🔍 Note Tecniche

### Performance

- **Memoizzazione**: `fetchAppointments` è memoizzato con `useCallback` per evitare re-render
- **Query Ottimizzate**: Usa `select` specifico per ridurre dati trasferiti
- **Indici Database**: Richiede indici su `starts_at`, `athlete_id`, `trainer_id`, `cancelled_at`

### Limitazioni

- **Nessuna Paginazione**: Carica tutti gli appuntamenti in una volta
- **Nessuna Cache**: Ogni refetch ricarica tutto dal database
- **Nessun Optimistic Update**: Le operazioni attendono la risposta del server

### Miglioramenti Futuri

- Integrare React Query per caching e optimistic updates
- Aggiungere paginazione per grandi volumi di dati
- Implementare real-time subscriptions per aggiornamenti automatici

---

## 📚 Changelog

### 2025-01-29T16:45:00Z - Documentazione Iniziale

- ✅ Documentazione completa hook `useAppointments`
- ✅ Descrizione funzioni CRUD
- ✅ Esempi d'uso
- ✅ Gestione errori
- ✅ Note tecniche e miglioramenti futuri

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare `CalendarView` e `AppointmentForm` components
