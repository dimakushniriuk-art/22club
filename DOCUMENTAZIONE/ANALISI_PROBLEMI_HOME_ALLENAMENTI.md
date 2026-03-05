# 🔍 Analisi Problemi Pagina `/home/allenamenti`

**Data analisi**: 2025-01-27  
**File analizzato**: `src/app/home/allenamenti/page.tsx`  
**URL**: `http://localhost:3001/home/allenamenti`

---

## 📋 SOMMARIO ESECUTIVO

La pagina `/home/allenamenti` presenta **8 problemi critici** e **5 miglioramenti consigliati** che possono impedire il corretto funzionamento o degradare l'esperienza utente.

### Problemi Critici Identificati:

1. ❌ **Mismatch userId vs profileId** - Potenziale errore RLS
2. ❌ **Normalizzazione ruolo incompleta** - Non gestisce tutti i casi
3. ❌ **Errori non mostrati all'utente** - Solo logging, nessun feedback visivo
4. ❌ **Query workout_logs potrebbe fallire** - RLS policies potrebbero bloccare
5. ❌ **Query workout_plans potrebbe fallire** - Mismatch created_by vs user_id
6. ❌ **Loading state troppo generico** - Non distingue tra diversi tipi di loading
7. ❌ **Mancanza validazione dati** - Nessun controllo su dati null/undefined
8. ❌ **Statistiche calcolate su dati potenzialmente vuoti** - Nessun fallback

### Miglioramenti Consigliati:

1. ⚠️ **Ottimizzazione performance** - Troppi re-render
2. ⚠️ **Gestione stati vuoti** - Migliorare UX quando non ci sono dati
3. ⚠️ **Type safety** - Migliorare tipizzazione
4. ⚠️ **Accessibilità** - Aggiungere ARIA labels
5. ⚠️ **Error boundary** - Proteggere da crash

---

## 🔴 PROBLEMI CRITICI

### 1. ❌ Mismatch userId vs profileId

**Severità**: 🔴 CRITICA  
**File**: `src/app/home/allenamenti/page.tsx:107`  
**Problema**: `user?.id` da `useAuth` restituisce `profiles.id`, ma le query potrebbero richiedere `profiles.user_id` (auth.users.id) per alcune operazioni.

**Codice problematico**:

```typescript
const stableUserId = useMemo(() => user?.id, [user?.id]) // Questo è profiles.id

// Ma workout_logs.atleta_id è FK a profiles.id ✅
// Ma workout_plans.created_by è FK a profiles.user_id ❌
```

**Impatto**:

- Le query su `workout_plans` potrebbero fallire se `created_by` richiede `user_id` invece di `profile.id`
- Le RLS policies potrebbero bloccare l'accesso se c'è confusione tra i due ID

**Soluzione**:

```typescript
// Verificare quale ID è necessario per ogni query
// Per workout_logs: atleta_id = profiles.id ✅ (corretto)
// Per workout_plans: created_by = profiles.user_id ❌ (potrebbe essere sbagliato)
```

**File correlati**:

- `src/hooks/use-allenamenti.ts:192` - Usa `atleta_id` (profiles.id) ✅
- `src/hooks/workouts/use-workout-plans-list.ts:44-62` - Gestisce il mismatch ma potrebbe fallire

---

### 2. ❌ Normalizzazione ruolo incompleta

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/allenamenti/page.tsx:110-116`  
**Problema**: La normalizzazione ruolo non gestisce tutti i casi possibili (`athlete`, `trainer`, `admin`, ecc.)

**Codice problematico**:

```typescript
const normalizedRole = useMemo(() => {
  if (!user?.role) return undefined
  const role = user.role.trim().toLowerCase()
  if (role === 'pt') return 'pt'
  if (role === 'atleta') return 'atleta'
  return role // ⚠️ Potrebbe restituire valori non gestiti
}, [user?.role])
```

**Impatto**:

- Se il ruolo è `'athlete'` o `'trainer'`, non viene normalizzato correttamente
- Le query potrebbero fallire o restituire dati errati

**Soluzione**:

```typescript
const normalizedRole = useMemo(() => {
  if (!user?.role) return undefined
  const role = user.role.trim().toLowerCase()
  // Mappatura completa
  if (role === 'pt' || role === 'trainer') return 'pt'
  if (role === 'atleta' || role === 'athlete') return 'atleta'
  if (role === 'admin' || role === 'owner') return 'admin'
  // Log warning per ruoli non riconosciuti
  logger.warn('Ruolo non riconosciuto', undefined, { role: user.role })
  return role
}, [user?.role])
```

---

### 3. ❌ Errori non mostrati all'utente

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/allenamenti/page.tsx:289-299`  
**Problema**: Gli errori vengono solo loggati, ma non mostrati all'utente con toast o messaggi di errore.

**Codice problematico**:

```typescript
if (allenamentiError) {
  logger.warn('Errore nel caricamento allenamenti', allenamentiError, {
    userId: user?.id,
  })
  // ⚠️ Nessun feedback visivo all'utente
}
```

**Impatto**:

- L'utente non sa se c'è un errore di caricamento
- Nessuna possibilità di retry manuale

**Soluzione**:

```typescript
import { notifyError } from '@/lib/notifications'

useEffect(() => {
  if (allenamentiError) {
    logger.warn('Errore nel caricamento allenamenti', allenamentiError, {
      userId: user?.id,
    })
    notifyError('Errore nel caricamento allenamenti', allenamentiError)
  }
}, [allenamentiError, user?.id])

// Aggiungere anche un ErrorBoundary o componente di errore
```

---

### 4. ❌ Query workout_logs potrebbe fallire per RLS

**Severità**: 🔴 CRITICA  
**File**: `src/hooks/use-allenamenti.ts:192`  
**Problema**: La query usa `atleta_id` che deve essere `profiles.id`, ma le RLS policies potrebbero richiedere `get_profile_id()` o verifiche più complesse.

**Codice problematico**:

```typescript
if (filters?.atleta_id) {
  query = query.eq('atleta_id', filters.atleta_id) // ⚠️ Deve essere profiles.id
}
```

**RLS Policy attuale** (da `docs/SQL_FIX_PERMISSIONS_COMPLETE.sql`):

```sql
-- Le policies usano get_profile_id() o subquery su profiles
-- Potrebbero non funzionare se atleta_id non è corretto
```

**Impatto**:

- Se `atleta_id` non corrisponde a `profiles.id` dell'utente corrente, la query viene bloccata
- Nessun dato viene restituito

**Soluzione**:

- Verificare che `stableUserId` sia effettivamente `profiles.id`
- Aggiungere logging per diagnosticare problemi RLS
- Verificare le RLS policies nel database

---

### 5. ❌ Query workout_plans potrebbe fallire per mismatch created_by

**Severità**: 🔴 CRITICA  
**File**: `src/hooks/workouts/use-workout-plans-list.ts:44-62`  
**Problema**: `workout_plans.created_by` punta a `profiles.user_id` (auth.users.id), ma `userId` passato potrebbe essere `profiles.id`.

**Codice problematico**:

```typescript
if (role === 'atleta') {
  query = query.eq('athlete_id', userId) // ✅ Corretto: athlete_id è profiles.id
} else if (role === 'pt' || role === 'admin') {
  // ⚠️ Cerca di convertire, ma potrebbe fallire
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', userId)
    .single()

  if (profile?.user_id) {
    query = query.eq('created_by', profile.user_id) // ✅ Corretto dopo conversione
  } else {
    query = query.eq('created_by', userId) // ❌ Potrebbe essere sbagliato
  }
}
```

**Impatto**:

- Se la conversione fallisce, la query potrebbe non restituire dati
- Le RLS policies potrebbero bloccare l'accesso

**Soluzione**:

- Verificare sempre che la conversione avvenga correttamente
- Aggiungere logging per diagnosticare problemi
- Gestire il caso in cui `profile` non viene trovato

---

### 6. ❌ Loading state troppo generico

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/allenamenti/page.tsx:301`  
**Problema**: Il loading state non distingue tra diversi tipi di caricamento (auth, allenamenti, workouts).

**Codice problematico**:

```typescript
const loading = authLoading || allenamentiLoading || workoutsLoading
// ⚠️ Non distingue quale risorsa sta caricando
```

**Impatto**:

- L'utente non sa cosa sta aspettando
- Se un caricamento fallisce, gli altri potrebbero ancora essere in corso

**Soluzione**:

```typescript
// Mostrare loading progressivo o separato
{allenamentiLoading && <LoadingState message="Caricamento allenamenti..." />}
{workoutsLoading && <LoadingState message="Caricamento schede..." />}
```

---

### 7. ❌ Mancanza validazione dati

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/allenamenti/page.tsx:143-191`  
**Problema**: Le statistiche vengono calcolate senza validare che i dati siano validi.

**Codice problematico**:

```typescript
const stats = useMemo(() => {
  if (!workoutLogs || workoutLogs.length === 0) {
    return { settimana: 0, mese: 0, streak: 0, volume_medio: 0 }
  }
  // ⚠️ Non valida che workoutLogs[i].data sia valida
  // ⚠️ Non valida che workoutLogs[i].volume_totale sia un numero
}, [workoutLogs])
```

**Impatto**:

- Se i dati sono corrotti o malformati, le statistiche potrebbero essere errate
- Potrebbero verificarsi errori JavaScript

**Soluzione**:

```typescript
const stats = useMemo(() => {
  if (!workoutLogs || workoutLogs.length === 0) {
    return { settimana: 0, mese: 0, streak: 0, volume_medio: 0 }
  }

  // Valida ogni log prima di usarlo
  const validLogs = workoutLogs.filter((log) => {
    if (!log.data) return false
    const date = new Date(log.data)
    return !isNaN(date.getTime())
  })

  // Calcola statistiche solo su dati validi
  // ...
}, [workoutLogs])
```

---

### 8. ❌ Statistiche calcolate su dati potenzialmente vuoti

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/allenamenti/page.tsx:194-287`  
**Problema**: `organizedAllenamenti` viene calcolato senza validare che `workoutLogs` contenga dati validi.

**Codice problematico**:

```typescript
const organizedAllenamenti = useMemo(() => {
  if (!workoutLogs || workoutLogs.length === 0) {
    return { oggi: null, programmati: [], completati: [] }
  }
  // ⚠️ Non valida che workoutLogs[i].data sia valida
  // ⚠️ Non gestisce errori di parsing date
}, [workoutLogs])
```

**Impatto**:

- Se le date sono malformate, `organizedAllenamenti` potrebbe essere vuoto anche se ci sono dati
- Potrebbero verificarsi errori JavaScript durante il rendering

**Soluzione**: Aggiungere validazione come nel problema #7.

---

## ⚠️ MIGLIORAMENTI CONSIGLIATI

### 1. ⚠️ Ottimizzazione performance

**File**: `src/app/home/allenamenti/page.tsx`  
**Problema**: Troppi `useMemo` e calcoli che potrebbero essere ottimizzati.

**Suggerimenti**:

- Usare `useCallback` per funzioni helper
- Memoizzare componenti pesanti
- Evitare re-render inutili

---

### 2. ⚠️ Gestione stati vuoti

**File**: `src/app/home/allenamenti/page.tsx:430-434, 477-481`  
**Problema**: Gli stati vuoti sono minimali e non invitano all'azione.

**Suggerimenti**:

- Aggiungere pulsanti per creare nuovo allenamento
- Mostrare messaggi motivazionali
- Aggiungere link a guide o tutorial

---

### 3. ⚠️ Type safety

**File**: `src/app/home/allenamenti/page.tsx`  
**Problema**: Alcuni tipi potrebbero essere più specifici.

**Suggerimenti**:

- Definire tipi per `organizedAllenamenti`
- Usare type guards per validazione
- Migliorare tipizzazione di `stats`

---

### 4. ⚠️ Accessibilità

**File**: `src/app/home/allenamenti/page.tsx`  
**Problema**: Mancano ARIA labels e ruoli appropriati.

**Suggerimenti**:

- Aggiungere `aria-label` a tutti i pulsanti
- Usare `role` appropriati per le card
- Migliorare navigazione da tastiera

---

### 5. ⚠️ Error boundary

**File**: `src/app/home/allenamenti/page.tsx`  
**Problema**: Nessun ErrorBoundary per proteggere da crash.

**Suggerimenti**:

- Avvolgere sezioni critiche in ErrorBoundary
- Mostrare fallback user-friendly
- Aggiungere pulsante "Riprova"

---

## 📊 PRIORITÀ DI INTERVENTO

### 🔴 Alta Priorità (Bloccanti)

1. **Problema #1**: Mismatch userId vs profileId
2. **Problema #4**: Query workout_logs potrebbe fallire per RLS
3. **Problema #5**: Query workout_plans potrebbe fallire per mismatch created_by

### 🟡 Media Priorità (Importanti)

4. **Problema #2**: Normalizzazione ruolo incompleta
5. **Problema #3**: Errori non mostrati all'utente
6. **Problema #7**: Mancanza validazione dati
7. **Problema #8**: Statistiche calcolate su dati potenzialmente vuoti

### 🟢 Bassa Priorità (Miglioramenti)

8. **Problema #6**: Loading state troppo generico
9. **Miglioramento #1-5**: Ottimizzazioni e miglioramenti UX

---

## 🧪 TEST CONSIGLIATI

1. **Test RLS**: Verificare che un atleta possa vedere solo i propri allenamenti
2. **Test Ruoli**: Verificare che tutti i ruoli funzionino correttamente
3. **Test Errori**: Verificare che gli errori vengano mostrati all'utente
4. **Test Dati Vuoti**: Verificare che la pagina gestisca correttamente l'assenza di dati
5. **Test Performance**: Verificare che non ci siano re-render inutili

---

## 📝 NOTE TECNICHE

- **RLS Policies**: Le policies per `workout_logs` e `workout_plans` sono complesse e potrebbero richiedere debug
- **ID Mapping**: C'è confusione tra `profiles.id`, `profiles.user_id`, e `auth.users.id` - necessario chiarire
- **Hook Dependencies**: Alcuni hook potrebbero avere dipendenze mancanti o eccessive

---

## ✅ CHECKLIST RISOLUZIONE

- [ ] Verificare che `user?.id` sia sempre `profiles.id`
- [ ] Correggere normalizzazione ruolo
- [ ] Aggiungere notifiche errori
- [ ] Verificare RLS policies per `workout_logs`
- [ ] Verificare RLS policies per `workout_plans`
- [ ] Aggiungere validazione dati
- [ ] Migliorare loading states
- [ ] Aggiungere ErrorBoundary
- [ ] Testare con dati reali
- [ ] Testare con ruoli diversi

---

**Fine Analisi**
