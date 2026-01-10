# 🔍 Analisi Completa Problemi - Home Page (`/home`)

**Data Analisi**: 2025-02-01  
**File Analizzato**: `src/app/home/page.tsx`  
**URL**: `http://localhost:3001/home`

---

## 📋 Riepilogo Problemi Trovati

**Totale Problemi**: 12  
**Critici**: 4  
**Importanti**: 5  
**Miglioramenti**: 3

---

## 🔴 PROBLEMI CRITICI

### 1. **Dati Mock Hardcoded invece di Database Reale**

**File**: `src/app/home/page.tsx:16-31`

**Problema**:

```typescript
const mockProgressData = {
  type: 'weight',
  current: 76,
  previous: 78,
  unit: 'kg',
  trend: 'down',
  period: 'questa settimana',
}
```

I dati dei progressi sono hardcoded e non vengono recuperati dal database `progress_logs`.

**Impatto**:

- L'utente vede dati falsi invece dei propri progressi reali
- Il componente `ProgressFlash` mostra sempre gli stessi valori (76kg, 78kg)
- Nessuna personalizzazione per utente

**Soluzione**:

- Usare `useProgress` hook per recuperare dati reali da `progress_logs`
- Recuperare ultimo peso da `progress_logs.weight_kg` ordinato per `date DESC`
- Calcolare trend confrontando ultimo peso con quello precedente
- Gestire stato vuoto quando non ci sono dati

**Priorità**: 🔴 CRITICA

---

### 2. **Peso Aggiornato Non Salvato nel Database**

**File**: `src/app/home/page.tsx:154-169`

**Problema**:

```typescript
const handleWeightUpdate = (newWeight: number) => {
  // ... calcola trend ...
  setProgressData({ ...progressData, current: newWeight, trend })
  // Qui potresti salvare il peso nel database
  logger.debug('Peso aggiornato', undefined, { newWeight })
}
```

Il commento dice "Qui potresti salvare il peso nel database" ma **non viene fatto nulla**.

**Impatto**:

- L'utente aggiorna il peso ma non viene salvato
- Al refresh della pagina, il peso torna ai valori mock
- Nessuna persistenza dati
- Il peso dovrebbe essere salvato in `progress_logs` con `athlete_id`, `date`, `weight_kg`

**Soluzione**:

- Creare funzione `saveWeightToDatabase` che inserisce/aggiorna `progress_logs`
- Usare `useProgress` hook che ha già `createProgressLog`
- Inserire record con `date = CURRENT_DATE`, `weight_kg = newWeight`
- Se esiste già un record per oggi, fare UPDATE invece di INSERT

**Priorità**: 🔴 CRITICA

---

### 3. **useAppointments Usa `userId` invece di `profile_id`**

**File**: `src/app/home/page.tsx:106`, `src/hooks/use-appointments.ts:67,75`

**Problema**:

```typescript
// In page.tsx
const { appointments } = useAppointments({
  userId: stableUserId, // Questo è user.id (auth.users.id)
  role: normalizedRole,
})

// In use-appointments.ts
if (role === 'atleta' || role === 'athlete') {
  query = query.eq('athlete_id', userId) // ❌ userId è auth.users.id, non profiles.id
}
```

La tabella `appointments` usa `athlete_id` che è FK a `profiles.id`, ma viene passato `user.id` (da `auth.users`).

**Impatto**:

- Gli appuntamenti potrebbero non essere trovati
- RLS policies potrebbero non funzionare correttamente
- Query fallisce silenziosamente o restituisce array vuoto

**Soluzione**:

- Recuperare `profile.id` da `profiles` usando `user.id`
- Passare `profileId` invece di `userId` a `useAppointments`
- Oppure modificare `useAppointments` per accettare `userId` e fare lookup interno

**Priorità**: 🔴 CRITICA

---

### 4. **Timeout Loading Nasconde Problemi Reali**

**File**: `src/app/home/page.tsx:171-210`

**Problema**:

```typescript
useEffect(() => {
  if (authLoading || appointmentsLoading) {
    timeoutRef.current = setTimeout(() => {
      setLoadingTimeout(true)
      logger.warn('Loading timeout raggiunto')
    }, 10000) // 10 secondi
  }
}, [authLoading, appointmentsLoading])

const effectiveLoading = useMemo(() => {
  return loadingTimeout ? false : authLoading || appointmentsLoading
}, [loadingTimeout, authLoading, appointmentsLoading])
```

Se il loading dura più di 10 secondi, viene nascosto invece di mostrare l'errore.

**Impatto**:

- Problemi di rete/database vengono nascosti
- L'utente vede una pagina vuota invece di un errore
- Difficile debug di problemi reali

**Soluzione**:

- Rimuovere timeout o aumentarlo significativamente
- Mostrare errore invece di nascondere loading
- Aggiungere retry mechanism
- Mostrare messaggio all'utente se loading è troppo lungo

**Priorità**: 🔴 CRITICA

---

## 🟡 PROBLEMI IMPORTANTI

### 5. **Errori Solo Loggati, Non Mostrati all'Utente**

**File**: `src/app/home/page.tsx:138-144`

**Problema**:

```typescript
if (appointmentsError) {
  logger.warn('Errore nel caricamento appuntamenti', appointmentsError, {
    userId: user?.id,
    role: normalizedRole,
  })
  // ❌ Nessun feedback visivo all'utente
}
```

Gli errori vengono solo loggati ma non mostrati all'utente.

**Impatto**:

- L'utente non sa perché i dati non si caricano
- Nessuna possibilità di retry
- UX negativa

**Soluzione**:

- Mostrare toast/alert con messaggio errore
- Aggiungere pulsante "Riprova"
- Usare componente `ErrorBoundary` con fallback UI

**Priorità**: 🟡 IMPORTANTE

---

### 6. **ProgressFlash Non Recupera Dati Reali**

**File**: `src/components/athlete/progress-flash.tsx`

**Problema**:
Il componente `ProgressFlash` riceve `progress` come prop ma non fa fetch autonomo. Dipende completamente dai dati passati dalla pagina, che sono mock.

**Impatto**:

- Componente non riutilizzabile
- Dipendenza da dati mock
- Non può funzionare standalone

**Soluzione**:

- Aggiungere hook interno `useProgressData` in `ProgressFlash`
- Oppure usare `useProgress` nella pagina e passare dati reali
- Gestire loading/error states internamente

**Priorità**: 🟡 IMPORTANTE

---

### 7. **Mancanza Gestione Stati Vuoti**

**File**: `src/app/home/page.tsx`

**Problema**:
Non c'è gestione per quando:

- `user` è `null` o `undefined`
- `dbAppointments` è vuoto (gestito da `AppointmentsCard` ma non nella pagina)
- `progressData` è `null` (gestito da `ProgressFlash` ma non nella pagina)

**Impatto**:

- Possibili crash se `user` è null
- Nessun feedback quando non ci sono dati
- UX incompleta

**Soluzione**:

- Aggiungere early return se `user` è null
- Mostrare skeleton/placeholder durante loading
- Aggiungere stati vuoti espliciti

**Priorità**: 🟡 IMPORTANTE

---

### 8. **useAppointments Query Potenzialmente Problematica per PT**

**File**: `src/hooks/use-appointments.ts:70-75`

**Problema**:

```typescript
} else if (role === 'pt' || role === 'trainer' || role === 'admin') {
  query = query.or(`staff_id.eq.${userId},trainer_id.eq.${userId}`)
}
```

Se `userId` è `auth.users.id` invece di `profiles.id`, la query non funziona perché `staff_id` e `trainer_id` sono FK a `profiles.id`.

**Impatto**:

- PT non vede i propri appuntamenti
- Query fallisce o restituisce array vuoto

**Soluzione**:

- Verificare che `userId` sia `profile.id` per PT
- Aggiungere lookup se necessario
- Testare con utente PT reale

**Priorità**: 🟡 IMPORTANTE

---

### 9. **Normalizzazione Ruolo Potrebbe Essere Migliorata**

**File**: `src/app/home/page.tsx:92-98`

**Problema**:

```typescript
const normalizedRole = useMemo(() => {
  if (!user?.role) return undefined
  const role = user.role.trim().toLowerCase()
  if (role === 'pt') return 'pt'
  if (role === 'atleta') return 'atleta'
  return role // ❌ Potrebbe restituire valori non gestiti
}, [user?.role])
```

Se il ruolo è diverso da 'pt' o 'atleta', viene restituito così com'è, ma `useAppointments` potrebbe non gestirlo.

**Impatto**:

- Ruoli non standard potrebbero causare comportamenti inattesi
- Nessuna validazione

**Soluzione**:

- Aggiungere validazione esplicita
- Mappare tutti i ruoli possibili
- Loggare warning se ruolo non riconosciuto

**Priorità**: 🟡 IMPORTANTE

---

## 🟢 MIGLIORAMENTI

### 10. **Performance: useMemo Potrebbe Essere Ottimizzato**

**File**: `src/app/home/page.tsx:111-136`

**Problema**:
`transformedAppointments` viene ricalcolato ogni volta che `dbAppointments` cambia, anche se la struttura è la stessa.

**Impatto**:

- Re-render inutili
- Performance leggermente peggiore

**Soluzione**:

- Aggiungere memoization più granulare
- Usare `useCallback` per funzioni helper
- Considerare React.memo per componenti figli

**Priorità**: 🟢 MIGLIORAMENTO

---

### 11. **Type Safety: Tipi Potrebbero Essere Più Stretti**

**File**: `src/app/home/page.tsx`

**Problema**:

- `user?.id` potrebbe essere `undefined`
- `normalizedRole` potrebbe essere `undefined` o stringa generica
- Nessuna validazione runtime

**Impatto**:

- Possibili errori runtime
- TypeScript non cattura tutti i casi edge

**Soluzione**:

- Aggiungere type guards
- Usare tipi più specifici
- Validazione runtime con zod

**Priorità**: 🟢 MIGLIORAMENTO

---

### 12. **Accessibilità: Mancano ARIA Labels**

**File**: `src/app/home/page.tsx`

**Problema**:
I pulsanti e le card non hanno sempre `aria-label` appropriati.

**Impatto**:

- Accessibilità ridotta per screen reader
- Non conforme a WCAG

**Soluzione**:

- Aggiungere `aria-label` a tutti gli elementi interattivi
- Aggiungere `role` appropriati
- Testare con screen reader

**Priorità**: 🟢 MIGLIORAMENTO

---

## 📊 Riepilogo Priorità

| Priorità         | Count | Problemi      |
| ---------------- | ----- | ------------- |
| 🔴 Critica       | 4     | 1, 2, 3, 4    |
| 🟡 Importante    | 5     | 5, 6, 7, 8, 9 |
| 🟢 Miglioramento | 3     | 10, 11, 12    |

---

## 🎯 Piano di Azione Consigliato

### Fase 1: Fix Critici (Immediato)

1. ✅ Fix problema #3: Usare `profile_id` invece di `userId` in `useAppointments`
2. ✅ Fix problema #1: Recuperare dati reali da `progress_logs` invece di mock
3. ✅ Fix problema #2: Salvare peso nel database quando aggiornato
4. ✅ Fix problema #4: Rimuovere timeout o mostrare errore invece di nascondere loading

### Fase 2: Fix Importanti (Prossimi giorni)

5. ✅ Mostrare errori all'utente con toast/alert
6. ✅ Aggiungere gestione stati vuoti
7. ✅ Verificare query PT in `useAppointments`
8. ✅ Migliorare normalizzazione ruolo

### Fase 3: Miglioramenti (Backlog)

9. ✅ Ottimizzare performance con memoization
10. ✅ Migliorare type safety
11. ✅ Aggiungere ARIA labels

---

## 📝 Note Tecniche

### Database Schema Riferimenti

- **`progress_logs`**: `athlete_id` (FK a `profiles.user_id`), `date`, `weight_kg`
- **`appointments`**: `athlete_id` (FK a `profiles.id`), `trainer_id` (FK a `profiles.id`), `staff_id` (FK a `profiles.id`)
- **`profiles`**: `id` (PK), `user_id` (FK a `auth.users.id`)

### Hook Disponibili

- `useProgress({ userId, role })` - Recupera progress_logs, ha `createProgressLog`
- `useAppointments({ userId, role })` - Recupera appointments (ma usa userId invece di profile_id)
- `useAuth()` - Recupera `user` con `user.id` (auth.users.id) e `user.role`

### Componenti Utilizzati

- `ProgressFlash` - Mostra grafico peso (riceve dati come prop)
- `AppointmentsCard` - Mostra lista appuntamenti (gestisce stati vuoti internamente)
- `ErrorBoundary` - Gestisce errori React (già presente)

---

**Fine Analisi**
