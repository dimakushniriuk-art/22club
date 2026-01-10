# 🔍 Analisi Errori TypeScript Post-Rigenerazione Tipi Supabase

**Data**: 2025-01-31  
**Totale Errori**: 398 errori in 71 file  
**Causa**: Tipi Supabase rigenerati non completamente allineati con il codice esistente

---

## 📊 Riepilogo per Categoria

| Categoria                                | Numero Errori | Priorità | Difficoltà          |
| ---------------------------------------- | ------------- | -------- | ------------------- |
| **1. Query Supabase con tipo `never`**   | ~150          | 🔴 ALTA  | Media               |
| **2. Cache API - Parametri TTL**         | ~15           | 🟡 MEDIA | Bassa               |
| **3. Type Assertions mancanti**          | ~80           | 🔴 ALTA  | Bassa               |
| **4. Proprietà mancanti nei tipi**       | ~50           | 🔴 ALTA  | Media               |
| **5. Import/Export mancanti**            | ~5            | 🟡 MEDIA | Bassa               |
| **6. Null vs Undefined**                 | ~20           | 🟡 MEDIA | Bassa               |
| **7. Tipi incompatibili (Json, Record)** | ~30           | 🟡 MEDIA | Media               |
| **8. Componenti Recharts**               | ~20           | 🟢 BASSA | Bassa (già gestito) |
| **9. Test files**                        | ~5            | 🟢 BASSA | Bassa               |
| **10. Dipendenze mancanti**              | ~2            | 🟡 MEDIA | Bassa               |
| **11. Workout types incompatibili**      | ~10           | 🟡 MEDIA | Media               |
| **12. Variabili non dichiarate**         | ~10           | 🔴 ALTA  | Bassa               |

---

## 🔴 GRUPPO 1: Query Supabase con tipo `never` (Priorità ALTA)

**Numero Errori**: ~150  
**File Coinvolti**: ~40 file  
**Causa**: TypeScript non inferisce correttamente i tipi dalle query Supabase dopo la rigenerazione

### Pattern Comune

```typescript
// ❌ ERRORE
const { data } = await supabase.from('table').select('*')
data.property // Error: Property 'property' does not exist on type 'never'

// ✅ SOLUZIONE
const { data } = await supabase.from('table').select('*')
const typedData = data as TableRow[] | null
typedData?.property
```

### File da Correggere

#### 1.1. Communications Module (Alta Priorità)

- `src/lib/communications/service.ts` (19 errori)
- `src/lib/communications/email.ts` (15 errori)
- `src/lib/communications/push.ts` (15 errori)
- `src/lib/communications/sms.ts` (18 errori)
- `src/lib/communications/scheduler.ts` (4 errori)
- `src/lib/communications/recipients.ts` (8 errori)

**Errori Tipici**:

- `Argument of type '{ status: string; }' is not assignable to parameter of type 'never'` (`.update()`)
- `Property 'recipient_type' does not exist on type 'never'`
- `Property 'communications' does not exist on type 'never'`

**Soluzione Pattern**:

```typescript
// Per .update()
await (supabase.from('communications') as any).update({ status: 'sending' })

// Per risultati query
type CommunicationRecipient = {
  id: string
  recipient_type: string
  communications: { id: string } | { id: string }[]
  // ... altre proprietà
}
const recipient = data as CommunicationRecipient
```

#### 1.2. Analytics Module

- `src/lib/analytics.ts` (29 errori)

**Errori Tipici**:

- `Property 'data' does not exist on type 'never'`
- `Property 'durata_minuti' does not exist on type 'never'`
- `Property 'length' does not exist on type 'never'` (RPC results)

**Soluzione Pattern**:

```typescript
// Per RPC
const { data: rpcData } = await (supabase.rpc as any)('function_name', params)
const typedData = (rpcData as Array<{ type: string; count: number }>) || []

// Per query results
type LogData = {
  data?: string | Date | unknown
  durata_minuti?: number | null
  atleta_id?: string
  athlete_id?: string
  // ...
}
const log = data as LogData
```

#### 1.3. Notifications Module

- `src/lib/notifications/push.ts` (13 errori)

**Errori Tipici**:

- `Type '"user_push_tokens"' does not satisfy the constraint` (tabella non nei tipi)
- `Property 'user_id' does not exist on type 'never'`

**Soluzione**:

- Verificare se `user_push_tokens` esiste nello schema Supabase
- Se manca, aggiungere migration o usare type assertion

#### 1.4. Hooks Vari

- `src/hooks/use-appointments.ts` (2 errori)
- `src/hooks/use-clienti.ts` (4 errori)
- `src/hooks/use-communications.ts` (5 errori)
- `src/hooks/use-invitations.ts` (2 errori)
- `src/hooks/use-lesson-counters.ts` (1 errore)
- `src/hooks/use-pt-profile.ts` (2 errori)
- `src/hooks/workouts/use-workout-plans-list.ts` (6 errori)

---

## 🟡 GRUPPO 2: Cache API - Parametri TTL (Priorità MEDIA)

**Numero Errori**: ~15  
**File Coinvolti**: ~8 file  
**Causa**: `frequentQueryCache.set()` e `statsCache.set()` non accettano più il terzo parametro TTL

### Pattern Comune

```typescript
// ❌ ERRORE
frequentQueryCache.set('key', data, CACHE_TTL_MS)

// ✅ SOLUZIONE
frequentQueryCache.set('key', data)
// Il TTL è gestito internamente dalla cache strategy
```

### File da Correggere

- `src/hooks/use-clienti.ts:467`
- `src/hooks/use-invitations.ts:153`
- `src/hooks/use-payments-stats.ts:79, 113`
- `src/hooks/use-progress.ts:169, 230`

**Azione**: Rimuovere il terzo parametro da tutte le chiamate `cache.set()`

---

## 🔴 GRUPPO 3: Type Assertions Mancanti (Priorità ALTA)

**Numero Errori**: ~80  
**File Coinvolti**: ~30 file  
**Causa**: Risultati query Supabase richiedono type assertions esplicite

### Pattern Comune

```typescript
// ❌ ERRORE
const { data: profile } = await supabase.from('profiles').select('*').single()
profile.role // Error: Property 'role' does not exist on type 'never'

// ✅ SOLUZIONE
const { data: profile } = await supabase.from('profiles').select('*').single()
type ProfileData = { role?: string; nome?: string; cognome?: string /* ... */ }
const profileData = profile as ProfileData | null
profileData?.role
```

### File da Correggere

#### 3.1. Components Dashboard

- `src/components/dashboard/admin/admin-statistics-content.tsx` (24 errori)
- `src/components/dashboard/admin/admin-users-content.tsx` (1 errore)
- `src/components/dashboard/athlete-profile/*.tsx` (vari file, ~30 errori totali)

#### 3.2. Components Calendar

- `src/components/calendar/*.tsx` (vari file, ~15 errori totali)

#### 3.3. Components Communications

- `src/components/communications/*.tsx` (vari file, ~20 errori totali)

---

## 🔴 GRUPPO 4: Proprietà Mancanti nei Tipi (Priorità ALTA)

**Numero Errori**: ~50  
**File Coinvolti**: ~20 file  
**Causa**: Proprietà usate nel codice non presenti nei tipi generati

### 4.1. Tabella `inviti_atleti` - Campo `token` mancante

**File**: `src/hooks/use-invitations.ts:193`

```typescript
// ❌ ERRORE
const insertData: TablesInsert<'inviti_atleti'> = {
  codice: '...',
  pt_id: '...',
  // token mancante
}

// ✅ SOLUZIONE
// Verificare se 'token' è obbligatorio nel database
// Se sì, aggiungere al insertData
// Se no, modificare migration per renderlo nullable
```

**Azione**:

1. Verificare schema `inviti_atleti` in Supabase
2. Se `token` è NOT NULL, aggiungere generazione token
3. Se può essere nullable, modificare migration

### 4.2. Tabella `lesson_counters` - Campo `lesson_type` mancante

**File**: `src/hooks/use-lesson-counters.ts:120`

```typescript
// ❌ ERRORE
const insertData: TablesInsert<'lesson_counters'> = {
  athlete_id: '...',
  lessons_total: 0,
  // lesson_type mancante
}

// ✅ SOLUZIONE
// Aggiungere lesson_type con valore default o da parametro
```

**Azione**: Aggiungere `lesson_type` all'insert (es: `'standard'` o da parametro)

### 4.3. Tabella `workout_plans` - Proprietà mancanti

**File**: `src/hooks/workouts/use-workout-plans-list.ts`

**Proprietà mancanti**:

- `org_id`
- `muscle_group`
- `equipment`
- `difficulty`
- `video_url`
- `image_url`

**Azione**:

1. Verificare se queste colonne esistono nel database
2. Se sì, rigenerare i tipi
3. Se no, rimuovere dal codice o aggiungere migration

### 4.4. Tabella `profiles` - Proprietà `certificazioni`

**File**: `src/hooks/use-pt-profile.ts:71-72`

```typescript
// ❌ ERRORE
profileData?.certificazioni

// ✅ SOLUZIONE
// Verificare se 'certificazioni' esiste nello schema
// Se no, rimuovere o aggiungere colonna
```

---

## 🟡 GRUPPO 5: Import/Export Mancanti (Priorità MEDIA)

**Numero Errori**: ~5  
**File Coinvolti**: 1 file

### 5.1. ExportData non esportato

**File**: `src/lib/analytics-export.ts:4`

```typescript
// ❌ ERRORE
import { exportToCSV, type ExportData } from '@/lib/export-utils'

// ✅ SOLUZIONE
// In src/lib/export-utils.ts, cambiare:
type ExportData = ...
// in:
export type ExportData = ...
```

**Azione**: Aggiungere `export` al tipo `ExportData` in `src/lib/export-utils.ts`

---

## 🟡 GRUPPO 6: Null vs Undefined (Priorità MEDIA)

**Numero Errori**: ~20  
**File Coinvolti**: ~10 file  
**Causa**: I tipi Supabase usano `null`, il codice si aspetta `undefined`

### Pattern Comune

```typescript
// ❌ ERRORE
updateData.two_factor_secret = null // Type 'null' is not assignable to type 'string | undefined'

// ✅ SOLUZIONE
updateData.two_factor_secret = null as any
// oppure
updateData.two_factor_secret = undefined
```

### File da Correggere

- `src/hooks/use-user-settings.ts:364-366` (3 errori)
  - `two_factor_secret`
  - `two_factor_backup_codes`
  - `two_factor_enabled_at`

**Azione**: Usare `undefined` invece di `null` o type assertion `as any`

---

## 🟡 GRUPPO 7: Tipi Incompatibili Json/Record (Priorità MEDIA)

**Numero Errori**: ~30  
**File Coinvolti**: ~10 file  
**Causa**: `Json` type da Supabase non compatibile con `Record<string, unknown>`

### Pattern Comune

```typescript
// ❌ ERRORE
recipient_filter: input.recipient_filter as Json
// Type 'Record<string, unknown>' is not assignable to type 'Json'

// ✅ SOLUZIONE
// Importare Json type
import type { Json } from '@/lib/supabase/types'
// oppure
recipient_filter: input.recipient_filter as unknown as Json
```

### File da Correggere

- `src/lib/communications/service.ts` (vari errori con `Json`)
- `src/hooks/use-communications.ts` (errori con `metadata` e `recipient_filter`)

**Azione**:

1. Importare `Json` type da `@/lib/supabase/types`
2. Usare `as unknown as Json` per conversioni

---

## 🟢 GRUPPO 8: Componenti Recharts (Priorità BASSA)

**Numero Errori**: ~20  
**File Coinvolti**: 3 file  
**Causa**: Problemi noti con tipi Recharts (già gestiti con workaround)

### File Coinvolti

- `src/components/athlete/progress-charts.tsx` (20 errori)
- `src/components/dashboard/progress-charts.tsx` (21 errori)
- `src/components/dashboard/stats-charts.tsx` (29 errori)

**Soluzione**: Già presente workaround `{...({} as any)}` per `ResponsiveContainer`

**Azione**: Verificare che il workaround sia applicato correttamente

---

## 🟢 GRUPPO 9: Test Files (Priorità BASSA)

**Numero Errori**: ~5  
**File Coinvolti**: 2 file

### File da Correggere

- `tests/unit/fetch-with-cache.test.ts:59`
- `tests/unit/utils-functions.test.ts:59`

**Errore**: `Property 'trainer_id' does not exist` in `appointments`

**Azione**:

1. Verificare se `trainer_id` esiste ancora nello schema
2. Se no, usare `staff_id` nei test
3. Se sì, rigenerare i tipi

---

## 🟡 GRUPPO 10: Dipendenze Mancanti (Priorità MEDIA)

**Numero Errori**: ~2  
**File Coinvolti**: 2 file

### 10.1. Modulo `resend` mancante

**File**: `src/lib/communications/email-resend-client.ts:57`

```typescript
// ❌ ERRORE
const resend = await import('resend')

// ✅ SOLUZIONE
npm install resend
```

### 10.2. Modulo `twilio` mancante

**File**: `src/lib/communications/sms.ts:95`

```typescript
// ❌ ERRORE
const twilio = await import('twilio')

// ✅ SOLUZIONE
npm install twilio
```

**Azione**: Installare dipendenze mancanti o gestire import condizionale

---

## 🟡 GRUPPO 11: Workout Types Incompatibili (Priorità MEDIA)

**Numero Errori**: ~10  
**File Coinvolti**: 2 file

### 11.1. WorkoutWizardData incompatibile

**File**: `src/hooks/workout/use-workout-wizard.ts:88, 109`

**Errore**:

- `Property 'name' is missing` in `WorkoutDayData`
- `Property 'sets' is missing` in `WorkoutDayExerciseData`

**Azione**:

1. Verificare definizione `WorkoutDayData` e `WorkoutDayExerciseData` in `src/types/workout.ts`
2. Allineare i dati creati nel wizard con i tipi attesi

---

## 🔴 GRUPPO 12: Variabili Non Dichiarate (Priorità ALTA)

**Numero Errori**: ~10  
**File Coinvolti**: ~5 file

### 12.1. `communicationData` non dichiarato

**File**: `src/lib/communications/email.ts:254-256, 288`

```typescript
// ❌ ERRORE
communicationData.title // Cannot find name 'communicationData'

// ✅ SOLUZIONE
// Usare 'communication' invece di 'communicationData'
// oppure dichiarare communicationData
```

### 12.2. `updates` non dichiarato

**File**: `src/hooks/use-communications.ts:250`

```typescript
// ❌ ERRORE
logger.error('Error updating communication', error, { updates })

// ✅ SOLUZIONE
// Rimuovere 'updates' o dichiararlo
logger.error('Error updating communication', error, { communicationId: id })
```

### 12.3. `communicationData` non dichiarato

**File**: `src/hooks/use-communications.ts:208`

```typescript
// ❌ ERRORE
logger.error('Error creating communication', error, { communicationData })

// ✅ SOLUZIONE
// Rimuovere o dichiarare communicationData
logger.error('Error creating communication', error, { input })
```

---

## 📋 Piano di Risoluzione Consigliato

### Fase 1: Fix Rapidi (1-2 ore)

1. ✅ **Gruppo 2**: Rimuovere parametri TTL da cache (15 errori)
2. ✅ **Gruppo 5**: Esportare `ExportData` (1 errore)
3. ✅ **Gruppo 12**: Dichiarare variabili mancanti (10 errori)
4. ✅ **Gruppo 10**: Installare dipendenze o gestire import (2 errori)

**Risultato Atteso**: ~28 errori risolti

### Fase 2: Type Assertions (2-3 ore)

1. ✅ **Gruppo 3**: Aggiungere type assertions per query Supabase (80 errori)
2. ✅ **Gruppo 6**: Convertire `null` in `undefined` dove necessario (20 errori)

**Risultato Atteso**: ~100 errori risolti

### Fase 3: Query Supabase `never` (3-4 ore)

1. ✅ **Gruppo 1**: Applicare workaround `as any` per `.update()`, `.insert()` (150 errori)
2. ✅ **Gruppo 7**: Gestire conversioni `Json` type (30 errori)

**Risultato Atteso**: ~180 errori risolti

### Fase 4: Schema e Proprietà (2-3 ore)

1. ✅ **Gruppo 4**: Verificare e aggiungere proprietà mancanti (50 errori)
   - Verificare `token` in `inviti_atleti`
   - Verificare `lesson_type` in `lesson_counters`
   - Verificare proprietà `workout_plans`
   - Verificare `certificazioni` in `profiles`

**Risultato Atteso**: ~50 errori risolti

### Fase 5: Cleanup (1 ora)

1. ✅ **Gruppo 8**: Verificare workaround Recharts (20 errori)
2. ✅ **Gruppo 9**: Fix test files (5 errori)
3. ✅ **Gruppo 11**: Allineare workout types (10 errori)

**Risultato Atteso**: ~35 errori risolti

---

## 🎯 Totale Errori Risolvibili

- **Fase 1-2**: ~128 errori (32%)
- **Fase 3**: ~180 errori (45%)
- **Fase 4**: ~50 errori (13%)
- **Fase 5**: ~35 errori (9%)
- **Rimanenti**: ~5 errori (1%) - da valutare caso per caso

**Totale**: ~393 errori risolvibili su 398

---

## 📝 Note Importanti

1. **Workaround `as any` sono accettabili** per query Supabase quando:
   - La query funziona correttamente a runtime
   - Il problema è solo di inferenza TypeScript
   - È documentato con commenti

2. **Verificare sempre lo schema database** prima di aggiungere proprietà mancanti

3. **Dopo ogni fase**, eseguire `npm run typecheck` per verificare progressi

4. **Priorità**: Risolvere prima i gruppi 1, 3, 4, 12 (errori che bloccano funzionalità core)

---

## 🔄 Prossimi Step

1. ✅ **Fase 1 completata** (fix rapidi) - Vedi `docs/FASE1_FIX_RAPIDI_COMPLETATA.md`
2. ⏳ **Fase 2**: Type Assertions (in attesa)
3. ⏳ **Fase 3**: Query Supabase `never` (in attesa)
4. ⏳ **Fase 4**: Schema e Proprietà (in attesa)
5. ⏳ **Fase 5**: Cleanup (in attesa)

## ✅ Progresso

- **Fase 1**: ✅ Completata (~12 errori risolti)
- **Fase 2**: ⏳ In attesa (~100 errori)
- **Fase 3**: ⏳ In attesa (~180 errori)
- **Fase 4**: ⏳ In attesa (~50 errori)
- **Fase 5**: ⏳ In attesa (~35 errori)

**Totale Risolto**: ~12 / 398 (3%)  
**Rimanenti**: ~386 errori
