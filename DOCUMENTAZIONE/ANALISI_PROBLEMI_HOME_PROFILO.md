# 🔍 Analisi Problemi Pagina `/home/profilo`

**Data analisi**: 2025-02-02  
**File analizzato**: `src/app/home/profilo/page.tsx`  
**URL**: `http://localhost:3001/home/profilo`

---

## 📋 SOMMARIO ESECUTIVO

La pagina `/home/profilo` presenta **9 problemi critici** e **4 miglioramenti consigliati** che impediscono il corretto funzionamento e degradano l'esperienza utente.

### Problemi Critici Identificati:

1. ❌ **Mismatch ID in useAthleteStats** - Passa `athleteUserId` (user_id) ma fa query su `workout_logs.athlete_id` che è `profiles.id`
2. ❌ **Hook chiamati con stringa vuota** - Gli hook vengono chiamati anche quando `athleteUserId` è null, passando stringa vuota
3. ❌ **Nessuna normalizzazione ruolo** - Non gestisce ruoli diversi (atleta vs trainer/admin)
4. ❌ **Gestione errori incompleta** - Non mostra errori all'utente con notifiche
5. ❌ **Loading state combinato in modo errato** - Combina `authLoading` e `statsLoading` ma non gestisce errori separati
6. ❌ **Nessun refresh manuale** - Impossibile ricaricare dati manualmente
7. ❌ **Mancanza validazione dati** - Nessun controllo su dati null/undefined prima di render
8. ❌ **Hook non utilizzati** - Alcuni hook vengono chiamati ma i dati non vengono usati
9. ❌ **Type safety incompleto** - Tipi potrebbero essere più specifici

### Miglioramenti Consigliati:

1. ⚠️ **Ottimizzazione performance** - Evitare re-render inutili
2. ⚠️ **Accessibilità** - Aggiungere ARIA labels
3. ⚠️ **Error boundary** - Proteggere da crash
4. ⚠️ **Gestione errori per tab** - Mostrare errori specifici per ogni tab

---

## 🔴 PROBLEMI CRITICI

### 1. ❌ Mismatch ID in useAthleteStats

**Severità**: 🔴 CRITICA  
**File**: `src/app/home/profilo/page.tsx:103-112`, `src/hooks/home-profile/use-athlete-stats.ts:99-110`  
**Problema**: `useAthleteStats` riceve `athleteUserId` (che è `user_id` da `profiles.user_id`), ma fa query su `workout_logs.athlete_id` che è `profiles.id`, non `profiles.user_id`.

**Codice problematico**:

```typescript
// In page.tsx
const athleteUserId = user?.user_id || null // ⚠️ Questo è profiles.user_id

const {
  stats,
  loading: statsLoading,
  error: statsError,
  calculateProgress,
} = useAthleteStats({
  athleteUserId, // ⚠️ Passa user_id
  // ...
})

// In use-athlete-stats.ts
const { count } = await supabase
  .from('workout_logs')
  .select('*', { count: 'exact', head: true })
  .eq('athlete_id', athleteUserId) // ⚠️ Cerca per athlete_id (profiles.id) ma riceve user_id
```

**Impatto**:

- Le query su `workout_logs` non trovano risultati perché cercano `athlete_id = user_id` invece di `athlete_id = profiles.id`
- Le statistiche non vengono calcolate correttamente
- Fallback a `atleta_id` potrebbe funzionare solo se i dati sono vecchi

**Soluzione**: Convertire `user_id` a `profiles.id` prima di passarlo a `useAthleteStats`, oppure modificare `useAthleteStats` per accettare `user_id` e fare lookup interno.

---

### 2. ❌ Hook chiamati con stringa vuota

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/profilo/page.tsx:87-94`  
**Problema**: Gli hook vengono chiamati anche quando `athleteUserId` è `null`, passando stringa vuota `''`.

**Codice problematico**:

```typescript
const athleteUserId = user?.user_id || null

const { data: anagrafica } = useAthleteAnagrafica(athleteUserId || '') // ⚠️ Passa '' se null
const { data: fitness } = useAthleteFitness(athleteUserId || '') // ⚠️ Passa '' se null
const { data: administrative } = useAthleteAdministrative(athleteUserId || '') // ⚠️ Passa '' se null
const { data: smartTracking } = useAthleteSmartTracking(athleteUserId || '') // ⚠️ Passa '' se null
const { data: aiData } = useAthleteAIData(athleteUserId || '') // ⚠️ Passa '' se null
```

**Impatto**:

- Gli hook fanno query anche quando `athleteUserId` è null
- Query inutili al database
- Possibili errori se gli hook non gestiscono stringa vuota

**Soluzione**: Chiamare gli hook solo se `athleteUserId` non è null, oppure farli gestire `null` esplicitamente.

---

### 3. ❌ Nessuna normalizzazione ruolo

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/profilo/page.tsx`  
**Problema**: La pagina non normalizza il ruolo dell'utente, quindi non può adattare la visualizzazione o i filtri in base al ruolo (atleta vs trainer/admin).

**Impatto**:

- Trainer e admin vedrebbero la stessa vista degli atleti
- Impossibile mostrare informazioni specifiche per ruolo
- Potenziali problemi di accesso ai dati

**Soluzione**: Aggiungere normalizzazione ruolo come fatto in altre pagine.

---

### 4. ❌ Gestione errori incompleta

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/profilo/page.tsx:131-140`  
**Problema**: La gestione errori mostra solo `ErrorState` ma non mostra errori specifici per ogni hook o tab, e non usa notifiche toast.

**Codice problematico**:

```typescript
if (statsError && !user) {
  return (
    <ErrorState
      message={statsError || 'Impossibile caricare il profilo'}
      onRetry={() => router.push('/login')}
    />
  )
}
```

**Impatto**:

- L'utente non riceve notifiche toast per errori
- Nessun feedback visivo coerente con il resto dell'app
- Errori specifici per tab non vengono mostrati

**Soluzione**: Integrare `notifyError` da `@/lib/notifications` e mostrare errori specifici per ogni tab.

---

### 5. ❌ Loading state combinato in modo errato

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/profilo/page.tsx:123-129`  
**Problema**: Il loading state combina `authLoading` e `statsLoading`, ma non gestisce errori separati o stati di loading parziali.

**Codice problematico**:

```typescript
if (authLoading || statsLoading) {
  return (
    <div className="mobile-container min-h-screen bg-black pb-24">
      <LoadingState message="Caricamento profilo..." />
    </div>
  )
}
```

**Impatto**:

- L'utente non sa se sta aspettando autenticazione o dati
- Loading state potrebbe essere mostrato anche quando non necessario
- Nessuna distinzione tra loading di autenticazione e loading di dati

**Soluzione**: Separare loading states e mostrare loading solo se necessario.

---

### 6. ❌ Nessun refresh manuale

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/profilo/page.tsx`  
**Problema**: Non c'è meccanismo di refresh manuale per aggiornare i dati del profilo.

**Impatto**:

- L'utente deve ricaricare la pagina per vedere aggiornamenti
- Nessuna possibilità di aggiornamento on-demand

**Soluzione**: Aggiungere pulsante "Ricarica" nell'header che invalida le query React Query.

---

### 7. ❌ Mancanza validazione dati

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/profilo/page.tsx`  
**Problema**: I componenti potrebbero ricevere dati null/undefined senza validazione.

**Impatto**:

- Potenziali crash se i componenti non gestiscono dati null
- Nessun fallback per dati invalidi

**Soluzione**: Aggiungere validazione prima di passare dati ai componenti.

---

### 8. ❌ Hook non utilizzati

**Severità**: 🟢 BASSA  
**File**: `src/app/home/profilo/page.tsx:89-93`  
**Problema**: Alcuni hook vengono chiamati ma i dati non vengono usati (es. `fitness`, `smartTracking`).

**Codice problematico**:

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { data: fitness } = useAthleteFitness(athleteUserId || '')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { data: smartTracking } = useAthleteSmartTracking(athleteUserId || '')
```

**Impatto**:

- Query inutili al database
- Performance degradata
- Confusione nel codice

**Soluzione**: Rimuovere hook non utilizzati o usarli se necessari.

---

### 9. ❌ Type safety incompleto

**Severità**: 🟢 BASSA  
**File**: `src/app/home/profilo/page.tsx`  
**Problema**: I tipi potrebbero essere più specifici e allineati con i tipi da `@/types`.

**Impatto**:

- Potenziali errori di tipo non rilevati
- Mancanza di autocompletamento corretto

**Soluzione**: Migliorare tipizzazione usando tipi esistenti.

---

## ⚠️ MIGLIORAMENTI CONSIGLIATI

### 1. ⚠️ Ottimizzazione performance

**File**: `src/app/home/profilo/page.tsx`  
**Problema**: Potrebbero esserci re-render inutili.

**Suggerimenti**:

- Usare `useMemo` per calcoli complessi
- Memoizzare componenti pesanti
- Evitare calcoli inutili

---

### 2. ⚠️ Accessibilità

**File**: `src/app/home/profilo/page.tsx`  
**Problema**: Mancano ARIA labels e ruoli appropriati.

**Suggerimenti**:

- Aggiungere `aria-label` a tutti gli elementi interattivi
- Usare `role` appropriati
- Migliorare navigazione tastiera

---

### 3. ⚠️ Error boundary

**File**: `src/app/home/profilo/page.tsx`  
**Problema**: Nessun ErrorBoundary per proteggere da crash.

**Suggerimenti**:

- Avvolgere sezioni critiche in ErrorBoundary
- Mostrare fallback user-friendly
- Aggiungere pulsante "Riprova"

---

### 4. ⚠️ Gestione errori per tab

**File**: `src/app/home/profilo/page.tsx`  
**Problema**: Non ci sono errori specifici per ogni tab.

**Suggerimenti**:

- Mostrare errori specifici per ogni tab
- Permettere retry per tab specifici
- Mostrare stato di errore nei tab

---

## 📊 PRIORITÀ DI INTERVENTO

### 🔴 Alta Priorità (Bloccanti)

1. **Problema #1**: Mismatch ID in useAthleteStats
2. **Problema #2**: Hook chiamati con stringa vuota
3. **Problema #4**: Gestione errori incompleta
4. **Problema #5**: Loading state combinato in modo errato

### 🟡 Media Priorità (Importanti)

5. **Problema #3**: Nessuna normalizzazione ruolo
6. **Problema #6**: Nessun refresh manuale
7. **Problema #7**: Mancanza validazione dati
8. **Problema #8**: Hook non utilizzati

### 🟢 Bassa Priorità (Miglioramenti)

9. **Problema #9**: Type safety incompleto
10. **Miglioramento #1-4**: Ottimizzazioni e miglioramenti UX

---

## 🧪 TEST CONSIGLIATI

1. **Test con atleta**: Verificare che veda i propri dati e statistiche
2. **Test con PT/Admin**: Verificare che veda i dati degli atleti associati (se implementato)
3. **Test errori**: Verificare che gli errori vengano mostrati all'utente
4. **Test dati vuoti**: Verificare gestione corretta
5. **Test validazione**: Verificare che dati invalidi vengano gestiti
6. **Test refresh**: Verificare refresh manuale funziona
7. **Test statistiche**: Verificare che le statistiche vengano calcolate correttamente
8. **Test tab**: Verificare che tutti i tab funzionino correttamente

---

## 📝 NOTE TECNICHE

- **Schema DB**: Secondo `20250110_COMPLETE_TABLE_VERIFICATION_AND_ALIGNMENT.sql:688-689`, `workout_logs.atleta_id` e `workout_logs.athlete_id` fanno riferimento a `profiles(id)`, non `profiles(user_id)`. Quindi `useAthleteStats` dovrebbe ricevere `profiles.id`, non `profiles.user_id`.
- **Hook Disponibili**: Gli hook `useAthleteAnagrafica`, `useAthleteFitness`, ecc. accettano `athleteId` che è `user_id` (UUID dell'utente auth), non `profiles.id`.
- **RLS Policies**: Le policies per le tabelle atleta permettono agli atleti di vedere e modificare i propri dati
- **Foreign Keys**: `workout_logs.athlete_id` è FK a `profiles.id`, mentre gli hook accettano `user_id`
- **Mismatch Critico**: `useAthleteStats` riceve `user_id` ma fa query su `workout_logs.athlete_id` che è `profiles.id`. Serve conversione.

---

## ✅ CHECKLIST RISOLUZIONE

- [ ] Correggere mismatch ID in `useAthleteStats` (convertire `user_id` a `profiles.id`)
- [ ] Chiamare hook solo se `athleteUserId` non è null
- [ ] Aggiungere normalizzazione ruolo
- [ ] Migliorare gestione errori con notifiche
- [ ] Separare loading states
- [ ] Aggiungere pulsante refresh manuale
- [ ] Aggiungere validazione dati
- [ ] Rimuovere hook non utilizzati o usarli
- [ ] Migliorare type safety
- [ ] Testare con dati reali
- [ ] Testare con ruoli diversi

---

**Fine Analisi**
