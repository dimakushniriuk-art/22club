# 📚 Guida di Riferimento: Mapping ID Profiles

**Data Creazione**: 2025-02-02  
**Versione**: 1.0  
**Scopo**: Documentare e standardizzare il mapping tra `profiles.id`, `profiles.user_id` e `auth.users.id` nelle foreign keys del database

---

## 🎯 Executive Summary

Il database 22Club ha un'**inconsistenza intenzionale** nelle foreign keys:

- Alcune tabelle usano `profiles.id` come FK
- Altre tabelle usano `profiles.user_id` (che è `auth.users.id`) come FK

Questa guida documenta **esattamente** quale tabella usa quale tipo di ID e come gestire le conversioni nel codice.

---

## 📊 Schema Profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,                    -- UUID generato (profiles.id)
  user_id UUID REFERENCES auth.users(id) -- FK a auth.users.id (profiles.user_id)
);
```

**Relazione**:

- `profiles.id` = UUID univoco del profilo (generato)
- `profiles.user_id` = `auth.users.id` (FK a tabella auth)
- **1:1**: Ogni `profiles.id` ha un unico `profiles.user_id`

---

## 🔗 Tabelle che usano `profiles.id` come FK

Queste tabelle usano **`profiles.id`** nelle loro foreign keys:

### 1. **`appointments`**

```sql
athlete_id UUID REFERENCES profiles(id)  -- ✅ FK a profiles.id
staff_id UUID REFERENCES profiles(id)     -- ✅ FK a profiles.id
trainer_id UUID REFERENCES profiles(id)   -- ✅ FK a profiles.id
```

**Uso nel codice**:

```typescript
// ✅ CORRETTO: usa profiles.id
const profileId = user?.id // da useAuth() - user.id è già profiles.id
useAppointments({ userId: profileId })
```

**Hook**: `useAppointments` - riceve `profiles.id`

---

### 2. **`workout_logs`**

```sql
atleta_id UUID REFERENCES profiles(id)   -- ✅ FK a profiles.id
athlete_id UUID REFERENCES profiles(id)   -- ✅ FK a profiles.id (alias)
```

**Uso nel codice**:

```typescript
// ✅ CORRETTO: usa profiles.id
const profileId = user?.id // da useAuth()
query.eq('athlete_id', profileId)
```

**Hook**: `useAllenamenti` - riceve `profiles.id`

---

### 3. **`workout_plans`**

```sql
athlete_id UUID REFERENCES profiles(id)  -- ✅ FK a profiles.id
```

**Nota**: `workout_plans.created_by` è FK a `profiles.user_id` (vedi sezione successiva)

**Uso nel codice**:

```typescript
// ✅ CORRETTO: usa profiles.id per athlete_id
const profileId = user?.id
query.eq('athlete_id', profileId)
```

---

### 4. **`chat_messages`**

```sql
sender_id UUID REFERENCES profiles(id)    -- ✅ FK a profiles.id
receiver_id UUID REFERENCES profiles(id)  -- ✅ FK a profiles.id
```

**Uso nel codice**:

```typescript
// ✅ CORRETTO: usa profiles.id
const profileId = user?.id
query.eq('sender_id', profileId)
```

**Hook**: `useChat` - riceve `profiles.id`

---

### 5. **`pt_atleti`**

```sql
pt_id UUID REFERENCES profiles(id)        -- ✅ FK a profiles.id
atleta_id UUID REFERENCES profiles(id)    -- ✅ FK a profiles.id
```

**Uso nel codice**:

```typescript
// ✅ CORRETTO: usa profiles.id
const profileId = user?.id
query.eq('pt_id', profileId)
```

---

### 6. **`payments`**

```sql
athlete_id UUID REFERENCES profiles(id)  -- ✅ FK a profiles.id
```

**Uso nel codice**:

```typescript
// ✅ CORRETTO: usa profiles.id
const profileId = user?.id
query.eq('athlete_id', profileId)
```

---

## 🔗 Tabelle che usano `profiles.user_id` come FK

Queste tabelle usano **`profiles.user_id`** (che è `auth.users.id`) nelle loro foreign keys:

### 1. **`progress_logs`**

```sql
athlete_id UUID REFERENCES profiles(user_id)  -- ✅ FK a profiles.user_id
```

**Uso nel codice**:

```typescript
// ✅ CORRETTO: usa profiles.user_id
const athleteUserId = user?.user_id // da useAuth() - user.user_id è auth.users.id
query.eq('athlete_id', athleteUserId)
```

**Hook**: `useProgress` - riceve `profiles.user_id`

**⚠️ IMPORTANTE**: Questa è l'unica tabella che usa `user_id` per `athlete_id`, causando confusione.

---

### 2. **`documents`**

```sql
athlete_id UUID REFERENCES profiles(user_id)        -- ✅ FK a profiles.user_id
uploaded_by_user_id UUID REFERENCES profiles(user_id) -- ✅ FK a profiles.user_id
```

**Uso nel codice**:

```typescript
// ✅ CORRETTO: usa profiles.user_id
const athleteUserId = user?.user_id
query.eq('athlete_id', athleteUserId)
```

**Hook**: `useDocuments` - riceve `profiles.user_id`

---

### 3. **`workout_plans`** (solo `created_by`)

```sql
created_by UUID REFERENCES profiles(user_id)  -- ✅ FK a profiles.user_id
```

**Nota**: `workout_plans.athlete_id` usa `profiles.id`, ma `created_by` usa `profiles.user_id`

**Uso nel codice**:

```typescript
// ✅ CORRETTO: usa profiles.user_id per created_by
const createdByUserId = user?.user_id
query.eq('created_by', createdByUserId)
```

---

## 📋 Tabella Riepilogativa Completa

| Tabella         | Colonna FK            | Tipo FK            | Hook/Componente       | Note             |
| --------------- | --------------------- | ------------------ | --------------------- | ---------------- |
| `appointments`  | `athlete_id`          | `profiles.id`      | `useAppointments`     | ✅               |
| `appointments`  | `staff_id`            | `profiles.id`      | `useAppointments`     | ✅               |
| `appointments`  | `trainer_id`          | `profiles.id`      | `useAppointments`     | ✅               |
| `workout_logs`  | `athlete_id`          | `profiles.id`      | `useAllenamenti`      | ✅               |
| `workout_logs`  | `atleta_id`           | `profiles.id`      | `useAllenamenti`      | ✅ (alias)       |
| `workout_plans` | `athlete_id`          | `profiles.id`      | `useWorkoutPlansList` | ✅               |
| `workout_plans` | `created_by`          | `profiles.user_id` | `useWorkoutPlansList` | ⚠️ Inconsistente |
| `chat_messages` | `sender_id`           | `profiles.id`      | `useChat`             | ✅               |
| `chat_messages` | `receiver_id`         | `profiles.id`      | `useChat`             | ✅               |
| `pt_atleti`     | `pt_id`               | `profiles.id`      | Vari                  | ✅               |
| `pt_atleti`     | `atleta_id`           | `profiles.id`      | Vari                  | ✅               |
| `payments`      | `athlete_id`          | `profiles.id`      | `usePayments`         | ✅               |
| `progress_logs` | `athlete_id`          | `profiles.user_id` | `useProgress`         | ⚠️ Inconsistente |
| `documents`     | `athlete_id`          | `profiles.user_id` | `useDocuments`        | ⚠️ Inconsistente |
| `documents`     | `uploaded_by_user_id` | `profiles.user_id` | `useDocuments`        | ⚠️ Inconsistente |

**Legenda**:

- ✅ = Consistente con altre tabelle simili
- ⚠️ = Inconsistente (usa `user_id` invece di `id`)

---

## 🔄 Conversioni e Utility Functions

### Da `auth.users.id` → `profiles.id`

```typescript
// Funzione helper (già implementata in useAppointments con cache)
async function getProfileIdFromUserId(userId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  return profile?.id || null
}
```

**Uso**: Quando hai `auth.users.id` ma serve `profiles.id` per query su `appointments`, `workout_logs`, ecc.

---

### Da `profiles.id` → `profiles.user_id`

```typescript
// Funzione helper
async function getUserIdFromProfileId(profileId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  return profile?.user_id || null
}
```

**Uso**: Quando hai `profiles.id` ma serve `profiles.user_id` per query su `progress_logs`, `documents`, ecc.

---

## 🛠️ Best Practices

### 1. **Usa `useAuth()` per ottenere ID corretti**

```typescript
const { user } = useAuth()

// user.id = profiles.id ✅
// user.user_id = profiles.user_id = auth.users.id ✅
```

### 2. **Usa il tipo corretto in base alla tabella**

```typescript
// Per appointments, workout_logs, chat_messages:
const profileId = user?.id // ✅ profiles.id

// Per progress_logs, documents:
const athleteUserId = user?.user_id // ✅ profiles.user_id
```

### 3. **Documenta conversioni quando necessarie**

```typescript
// ⚠️ CONVERSIONE NECESSARIA
// workout_plans.created_by è FK a profiles.user_id
// Ma abbiamo solo profiles.id
const createdByUserId = await getUserIdFromProfileId(profileId)
```

### 4. **Usa cache per conversioni frequenti**

```typescript
// Cache in-memory (già implementata in useAppointments)
const profileIdCache = new Map<string, string>()
```

### 5. **Valida sempre gli ID prima di usarli**

```typescript
import { isValidUUID } from '@/lib/utils/type-guards'

if (!isValidUUID(profileId)) {
  throw new Error('Invalid profile ID')
}
```

---

## ⚠️ Problemi Comuni e Soluzioni

### Problema 1: Mismatch ID in `handleWeightUpdate`

**Errore**:

```typescript
// ❌ ERRATO
athlete_id: stableProfileId // profiles.id
```

**Soluzione**:

```typescript
// ✅ CORRETTO
athlete_id: user?.user_id // profiles.user_id per progress_logs
```

**File**: `src/app/home/page.tsx:379` - ✅ **RISOLTO**

---

### Problema 2: Mismatch ID in `useAppointments`

**Errore**:

```typescript
// ❌ ERRATO (se userId è auth.users.id)
query.eq('athlete_id', userId) // appointments.athlete_id è FK a profiles.id
```

**Soluzione**:

```typescript
// ✅ CORRETTO (con cache)
const profileId = await getProfileId(userId, client) // Converte se necessario
query.eq('athlete_id', profileId)
```

**File**: `src/hooks/use-appointments.ts` - ✅ **RISOLTO** (con cache)

---

### Problema 3: Mismatch ID in `useAthleteStats`

**Errore**:

```typescript
// ❌ ERRATO
// useAthleteStats riceve user_id ma fa query su workout_logs.athlete_id (profiles.id)
.eq('athlete_id', athleteUserId)  // athleteUserId è user_id, ma athlete_id è profiles.id
```

**Soluzione**:

```typescript
// ✅ CORRETTO
// Converti user_id → profile_id prima della query
const profileId = await getProfileIdFromUserId(athleteUserId)
query.eq('athlete_id', profileId)
```

**File**: `src/hooks/home-profile/use-athlete-stats.ts` - ⚠️ **DA RISOLVERE**

---

## 🔍 Verifica Mapping Corretto

### Query SQL per Verificare FK

```sql
-- Verifica tutte le FK che referenziano profiles
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  CASE
    WHEN ccu.column_name = 'id' THEN '✅ FK a profiles.id'
    WHEN ccu.column_name = 'user_id' THEN '⚠️ FK a profiles.user_id'
    ELSE '❓ FK sconosciuta'
  END AS mapping_type
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'profiles'
ORDER BY tc.table_name, kcu.column_name;
```

---

## 📝 Utility Functions da Creare

### 1. **`src/lib/utils/profile-id-utils.ts`**

```typescript
/**
 * Utility functions per conversione tra profiles.id e profiles.user_id
 */

import { createClient } from '@/lib/supabase'
import { profileIdCache } from './profile-id-cache' // Cache condivisa

/**
 * Converte auth.users.id → profiles.id
 * Usa cache per evitare query ridondanti
 */
export async function getProfileIdFromUserId(userId: string): Promise<string | null>

/**
 * Converte profiles.id → profiles.user_id
 * Usa cache per evitare query ridondanti
 */
export async function getUserIdFromProfileId(profileId: string): Promise<string | null>

/**
 * Determina se un ID è profiles.id o profiles.user_id
 * (verifica esistenza in entrambe le colonne)
 */
export async function identifyIdType(id: string): Promise<'profile_id' | 'user_id' | null>
```

---

## 🎯 Roadmap Standardizzazione (Futuro)

### Opzione A: Standardizzare tutto su `profiles.id` (Consigliato)

**Vantaggi**:

- Consistenza completa
- Meno conversioni necessarie
- Performance migliore (meno lookup)

**Svantaggi**:

- Migrazione database complessa
- RLS policies da aggiornare
- Codice esistente da modificare

**Tabelle da Migrare**:

- `progress_logs.athlete_id` → `profiles.id`
- `documents.athlete_id` → `profiles.id`
- `documents.uploaded_by_user_id` → `profiles.id`
- `workout_plans.created_by` → `profiles.id`

---

### Opzione B: Mantenere Inconsistenza (Attuale)

**Vantaggi**:

- Nessuna migrazione necessaria
- Codice esistente funziona

**Svantaggi**:

- Confusione per sviluppatori
- Conversioni necessarie
- Errori facili da commettere

**Soluzione**: Documentazione completa + utility functions + validazione

---

## ✅ Checklist per Sviluppatori

Quando lavori con foreign keys a `profiles`:

- [ ] Verifica quale tipo di ID usa la tabella (`profiles.id` o `profiles.user_id`)
- [ ] Usa `user?.id` per tabelle con FK a `profiles.id`
- [ ] Usa `user?.user_id` per tabelle con FK a `profiles.user_id`
- [ ] Se necessario, usa utility functions per conversioni
- [ ] Documenta conversioni nel codice
- [ ] Testa con dati reali per verificare mapping corretto

---

## 📚 Riferimenti

- **Schema Database**: `supabase/migrations/20250110_COMPLETE_TABLE_VERIFICATION_AND_ALIGNMENT.sql`
- **Verifica FK**: `docs/SQL_VERIFICA_COMPLETA_SUPABASE.sql`
- **Fix RLS**: `docs/SQL_FIX_HOME_PAGES_RLS_POLICIES.sql`
- **Analisi Problemi**: `docs/ANALISI_PROFONDA_DASHBOARD_HOME.md`

---

**Ultimo Aggiornamento**: 2025-02-02  
**Mantenuto da**: Cursor Autopilot System
