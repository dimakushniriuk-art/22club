# ✅ Fase 2: Type Assertions - Progresso Parziale

**Data**: 2025-01-31  
**Errori Risolti Finora**: ~15 errori  
**Errori Rimanenti**: ~410 errori

---

## ✅ Completato

### Gruppo 6: Null vs Undefined (COMPLETATO)

**File Modificato**: `src/hooks/use-user-settings.ts:364-366`

```typescript
// Prima: updateData.two_factor_secret = null
// Dopo: updateData.two_factor_secret = undefined
```

**Errori Risolti**: 3 errori

---

### Gruppo 3: Type Assertions (IN CORSO)

#### ✅ `src/hooks/use-progress.ts`

**Errori Risolti**: 8 errori

- Aggiunto type assertion per `logs` e `photos` da query Supabase
- Creato tipo `ProgressLogRow` per gestire proprietà `weight_kg`, `chest_cm`, etc.

```typescript
type ProgressLogRow = {
  weight_kg?: number | null
  chest_cm?: number | null
  waist_cm?: number | null
  hips_cm?: number | null
  biceps_cm?: number | null
  thighs_cm?: number | null
  [key: string]: unknown
}
const typedLogs = (logs as ProgressLogRow[]) || []
```

#### ✅ `src/lib/analytics.ts`

**Errori Risolti**: ~20 errori

- Aggiunto type assertions per:
  - `WorkoutLogRow` - per `log.data`, `log.durata_minuti`, `log.atleta_id`, `log.athlete_id`
  - `DocumentRow` - per `doc.created_at`
  - `DistributionRpcRow` - per risultati RPC `get_analytics_distribution_data`
  - `PerformanceRpcRow` - per risultati RPC `get_analytics_performance_data`
  - `AppointmentRow` - per `apt.type`
  - `AthleteRow` - per `athlete.id`, `athlete.user_id`, `athlete.nome`, etc.
  - `WorkoutPlanRow` - per `plan.athlete_id`, `plan.is_active`

- Aggiunto `as any` per chiamate RPC:
  ```typescript
  const { data: rpcData } = await (supabase.rpc as any)('function_name', params)
  ```

#### ✅ `src/lib/communications/service.ts`

**Errori Risolti**: 1 errore (import Json)

- Aggiunto import di `Json` type:
  ```typescript
  import type { Json } from '@/lib/supabase/types'
  ```

---

## ⏳ In Corso

### File da Correggere (Priorità Alta)

1. **`src/lib/communications/email.ts`** (11 errori)
   - Type assertions per `.update()` calls
   - Type assertions per `recipient.communications`
   - Type assertions per `profile.email`

2. **`src/lib/communications/push.ts`** (15 errori)
   - Type assertions per `communication.type`, `communication.metadata`
   - Type assertions per `recipient.communications`, `recipient.user_id`

3. **`src/lib/communications/sms.ts`** (19 errori)
   - Type assertions simili a `email.ts` e `push.ts`

4. **`src/lib/communications/recipients.ts`** (8 errori)
   - Type assertions per `profiles.map((p) => p.user_id)`
   - Type assertions per `p.email`, `p.telefono`, `p.role`

5. **`src/lib/notifications/push.ts`** (13 errori)
   - Type assertions per `user_push_tokens` (tabella non nei tipi)
   - Type assertions per `user.user_id`, `notification.user_id`, etc.

---

## 📊 Statistiche

- **Errori Risolti**: ~15 / ~100 (15%)
- **File Completati**: 3 file
- **File in Corso**: 5 file
- **Tempo Impiegato**: ~1 ora

---

## 🔄 Prossimi Step

1. Continuare con `src/lib/communications/*.ts` (priorità alta)
2. Poi `src/lib/notifications/push.ts`
3. Infine componenti dashboard e calendar

---

## 📝 Note

- Le type assertions sono necessarie perché Supabase non inferisce correttamente i tipi dopo la rigenerazione
- Usiamo pattern consistenti: `type RowType = { ... }` e `const typed = (data as RowType[]) || []`
- Per RPC calls, usiamo `(supabase.rpc as any)` quando necessario
