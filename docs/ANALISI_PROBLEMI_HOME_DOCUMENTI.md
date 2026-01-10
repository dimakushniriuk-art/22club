# 🔍 Analisi Problemi Pagina `/home/documenti`

**Data analisi**: 2025-02-02  
**File analizzato**: `src/app/home/documenti/page.tsx`  
**URL**: `http://localhost:3001/home/documenti`

---

## 📋 SOMMARIO ESECUTIVO

La pagina `/home/documenti` presenta **10 problemi critici** e **4 miglioramenti consigliati** che impediscono il corretto funzionamento e degradano l'esperienza utente.

### Problemi Critici Identificati:

1. ❌ **Lookup ridondante authUserId** - Fa lookup separato invece di usare `useAuth().user?.user_id` direttamente
2. ❌ **Non usa hook useDocuments** - Usa funzione helper `getDocuments` invece dell'hook dedicato
3. ❌ **Nessuna normalizzazione ruolo** - Non gestisce ruoli diversi (atleta vs trainer/admin)
4. ❌ **Gestione errori incompleta** - Usa `alert()` invece di notifiche toast, nessun logging strutturato
5. ❌ **Nessun early return per utente non autenticato** - Non gestisce caso user null
6. ❌ **Loading state non separato** - Non distingue tra authLoading e loading
7. ❌ **Nessun refresh manuale** - Impossibile ricaricare dati manualmente
8. ❌ **Mismatch ID potenziale** - La pagina usa `authUserId` (user_id) ma `uploadDocument` potrebbe aspettarsi `athlete_id` diverso
9. ❌ **Mancanza validazione dati** - Nessun controllo su dati null/undefined prima di render
10. ❌ **Type safety incompleto** - Tipi potrebbero essere più specifici

### Miglioramenti Consigliati:

1. ⚠️ **Ottimizzazione performance** - Evitare re-render inutili
2. ⚠️ **Accessibilità** - Aggiungere ARIA labels
3. ⚠️ **Error boundary** - Proteggere da crash
4. ⚠️ **Filtri e ricerca** - Aggiungere filtri per categoria/status

---

## 🔴 PROBLEMI CRITICI

### 1. ❌ Lookup ridondante authUserId

**Severità**: 🔴 CRITICA  
**File**: `src/app/home/documenti/page.tsx:42-67`  
**Problema**: La pagina fa un lookup separato per ottenere `authUserId` da `auth.users.id`, ma `useAuth` già restituisce `user?.user_id` che è `profiles.user_id`.

**Codice problematico**:

```typescript
useEffect(() => {
  const getUserId = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (authUser?.id) {
      // Verifica che esista un profilo corrispondente
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_id, role')
        .eq('user_id', authUser.id)
        .single()

      if (profile?.user_id) {
        setAuthUserId(profile.user_id) // Usa user_id invece di profile.id
      } else {
        setAuthUserId(authUser.id)
      }
    }
  }
  getUserId()
}, [supabase])
```

**Impatto**:

- Query ridondante al database
- Possibile race condition se `user` non è ancora caricato
- Inconsistenza: `useAuth` già fornisce `user?.user_id`

**Soluzione**: Usare direttamente `user?.user_id` da `useAuth()` invece di fare lookup separato.

---

### 2. ❌ Non usa hook useDocuments

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/documenti/page.tsx:69-81`  
**Problema**: La pagina usa la funzione helper `getDocuments` invece dell'hook `useDocuments` che gestisce già loading, errori e refetch.

**Codice problematico**:

```typescript
const fetchDocuments = async () => {
  if (!authUserId) return

  try {
    setLoading(true)
    const docs = await getDocuments(authUserId)
    setDocuments(docs)
  } catch (error) {
    logger.error('Errore nel caricamento documenti', error, { authUserId })
  } finally {
    setLoading(false)
  }
}
```

**Impatto**:

- Duplicazione logica già presente nell'hook
- Gestione errori meno strutturata
- Nessun caching automatico
- Nessun refetch automatico

**Soluzione**: Usare `useDocuments({ athleteId: authUserId })` invece di `getDocuments`.

---

### 3. ❌ Nessuna normalizzazione ruolo

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/documenti/page.tsx`  
**Problema**: La pagina non normalizza il ruolo dell'utente, quindi non può adattare la visualizzazione o i filtri in base al ruolo (atleta vs trainer/admin).

**Impatto**:

- Trainer e admin vedrebbero la stessa vista degli atleti
- Impossibile mostrare documenti di tutti gli atleti per trainer/admin
- Potenziali problemi di accesso ai dati

**Soluzione**: Aggiungere normalizzazione ruolo come fatto in altre pagine.

---

### 4. ❌ Gestione errori incompleta

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/documenti/page.tsx:198-202, 253-258`  
**Problema**: La gestione errori usa `alert()` invece di notifiche toast, e non mostra errori all'utente in modo strutturato.

**Codice problematico**:

```typescript
if (!authUserId) {
  alert('Devi essere autenticato per caricare documenti')
  return
}

// ...

catch (error) {
  logger.error("Errore durante l'upload", error, { authUserId, category })
  const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
  alert(`Errore nel caricamento del documento: ${errorMessage}`)
}
```

**Impatto**:

- L'utente non riceve notifiche toast per errori
- `alert()` blocca l'interfaccia
- Nessun feedback visivo coerente con il resto dell'app

**Soluzione**: Integrare `notifyError` e `notifySuccess` da `@/lib/notifications`.

---

### 5. ❌ Nessun early return per utente non autenticato

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/documenti/page.tsx`  
**Problema**: Non c'è gestione esplicita del caso in cui `user` è `null` o non autenticato.

**Impatto**:

- Potenziali errori se `user` è null
- Nessun redirect a login
- UX confusa per utenti non autenticati

**Soluzione**: Aggiungere early return con redirect a login se `!authLoading && !user`.

---

### 6. ❌ Loading state non separato

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/documenti/page.tsx:274-287`  
**Problema**: Il loading state non distingue tra `authLoading` e `loading` (documenti).

**Impatto**:

- L'utente non sa se sta aspettando autenticazione o dati
- Loading state potrebbe essere mostrato anche quando non necessario

**Soluzione**: Separare `authLoading` da `loading` e mostrare loading solo se necessario.

---

### 7. ❌ Nessun refresh manuale

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/documenti/page.tsx`  
**Problema**: Non c'è meccanismo di refresh manuale per aggiornare i documenti.

**Impatto**:

- L'utente deve ricaricare la pagina per vedere nuovi documenti
- Nessuna possibilità di aggiornamento on-demand

**Soluzione**: Aggiungere pulsante "Ricarica" nell'header che chiama `refetch` da `useDocuments`.

---

### 8. ❌ Mismatch ID potenziale

**Severità**: 🔴 CRITICA  
**File**: `src/app/home/documenti/page.tsx:247, src/lib/documents.ts:92-123`  
**Problema**: La pagina passa `authUserId` (che è `profiles.user_id`) a `uploadDocument`, ma la funzione si aspetta `athleteId` che dovrebbe essere lo stesso `user_id` per un atleta che carica i propri documenti. Tuttavia, se un trainer carica un documento per un atleta, dovrebbe passare l'`athlete_id` dell'atleta, non il proprio `user_id`.

**Codice problematico**:

```typescript
// In page.tsx
await uploadDocument(file, category, authUserId)

// In documents.ts
export async function uploadDocument(
  file: File,
  category: string,
  athleteId: string, // ⚠️ Nome suggerisce che dovrebbe essere l'ID dell'atleta
  expiresAt?: string,
  notes?: string,
): Promise<DocumentDTO> {
  // ...
  .insert({
    athlete_id: athleteId, // ⚠️ Usa athleteId come athlete_id
    uploaded_by_user_id: athleteId, // ⚠️ Usa anche athleteId come uploaded_by_user_id
  })
```

**Impatto**:

- Se un trainer carica un documento per un atleta, dovrebbe passare l'`athlete_id` dell'atleta, non il proprio `user_id`
- La funzione `uploadDocument` usa `athleteId` sia per `athlete_id` che per `uploaded_by_user_id`, il che è corretto solo se l'atleta carica per se stesso
- Nessuna distinzione tra "chi carica" e "per chi è il documento"

**Soluzione**:

- Per atleti: `athleteId = user?.user_id` (corretto)
- Per trainer/admin: permettere selezione atleta e usare `athleteId = selectedAthlete.user_id`, `uploaded_by_user_id = user?.user_id`

---

### 9. ❌ Mancanza validazione dati

**Severità**: 🟡 MEDIA  
**File**: `src/app/home/documenti/page.tsx`  
**Problema**: I componenti potrebbero ricevere dati null/undefined senza validazione.

**Impatto**:

- Potenziali crash se i componenti non gestiscono dati null
- Nessun fallback per dati invalidi

**Soluzione**: Aggiungere validazione prima di passare dati ai componenti.

---

### 10. ❌ Type safety incompleto

**Severità**: 🟢 BASSA  
**File**: `src/app/home/documenti/page.tsx`  
**Problema**: I tipi potrebbero essere più specifici e allineati con i tipi da `@/types/document`.

**Impatto**:

- Potenziali errori di tipo non rilevati
- Mancanza di autocompletamento corretto

**Soluzione**: Migliorare tipizzazione usando tipi esistenti.

---

## ⚠️ MIGLIORAMENTI CONSIGLIATI

### 1. ⚠️ Ottimizzazione performance

**File**: `src/app/home/documenti/page.tsx`  
**Problema**: Potrebbero esserci re-render inutili.

**Suggerimenti**:

- Usare `useMemo` per calcoli complessi (statistiche, filtri)
- Memoizzare componenti pesanti
- Evitare calcoli inutili

---

### 2. ⚠️ Accessibilità

**File**: `src/app/home/documenti/page.tsx`  
**Problema**: Mancano ARIA labels e ruoli appropriati.

**Suggerimenti**:

- Aggiungere `aria-label` a tutti gli elementi interattivi
- Usare `role` appropriati
- Migliorare navigazione tastiera

---

### 3. ⚠️ Error boundary

**File**: `src/app/home/documenti/page.tsx`  
**Problema**: Nessun ErrorBoundary per proteggere da crash.

**Suggerimenti**:

- Avvolgere sezioni critiche in ErrorBoundary
- Mostrare fallback user-friendly
- Aggiungere pulsante "Riprova"

---

### 4. ⚠️ Filtri e ricerca

**File**: `src/app/home/documenti/page.tsx`  
**Problema**: Non ci sono filtri per categoria/status o ricerca.

**Suggerimenti**:

- Aggiungere filtri per categoria (certificato, liberatoria, contratto, altro)
- Aggiungere filtri per status (valido, scaduto, in scadenza, non valido)
- Aggiungere ricerca per nome file o note
- L'hook `useDocuments` già supporta questi filtri

---

## 📊 PRIORITÀ DI INTERVENTO

### 🔴 Alta Priorità (Bloccanti)

1. **Problema #1**: Lookup ridondante authUserId
2. **Problema #8**: Mismatch ID potenziale (uploadDocument)
3. **Problema #4**: Gestione errori incompleta
4. **Problema #5**: Nessun early return per utente non autenticato

### 🟡 Media Priorità (Importanti)

5. **Problema #2**: Non usa hook useDocuments
6. **Problema #3**: Nessuna normalizzazione ruolo
7. **Problema #6**: Loading state non separato
8. **Problema #7**: Nessun refresh manuale
9. **Problema #9**: Mancanza validazione dati

### 🟢 Bassa Priorità (Miglioramenti)

10. **Problema #10**: Type safety incompleto
11. **Miglioramento #1-4**: Ottimizzazioni e miglioramenti UX

---

## 🧪 TEST CONSIGLIATI

1. **Test con atleta**: Verificare che veda solo i propri documenti e possa caricarli
2. **Test con PT/Admin**: Verificare che veda i documenti degli atleti associati (se implementato)
3. **Test errori**: Verificare che gli errori vengano mostrati all'utente con notifiche
4. **Test dati vuoti**: Verificare gestione corretta
5. **Test validazione**: Verificare che dati invalidi vengano gestiti
6. **Test refresh**: Verificare refresh manuale funziona
7. **Test upload**: Verificare upload documenti funziona correttamente
8. **Test categorie**: Verificare selezione categoria funziona

---

## 📝 NOTE TECNICHE

- **Schema DB**: Secondo `20250110_COMPLETE_TABLE_VERIFICATION_AND_ALIGNMENT.sql:753,760`, `documents.athlete_id` e `documents.uploaded_by_user_id` fanno riferimento a `profiles(user_id)`, non `profiles(id)`. Quindi `user?.user_id` da `useAuth()` è corretto.
- **Hook Disponibile**: `useDocuments` esiste già e gestisce correttamente documenti, loading, errori e refetch
- **RLS Policies**: Le policies per `documents` permettono agli atleti di vedere e caricare i propri documenti
- **Foreign Keys**: `athlete_id` e `uploaded_by_user_id` sono FK a `profiles.user_id`
- **Upload Document**: La funzione `uploadDocument` in `src/lib/documents.ts` usa `athleteId` sia per `athlete_id` che per `uploaded_by_user_id`, il che è corretto solo se l'atleta carica per se stesso. Per trainer/admin che caricano per atleti, serve logica diversa.

---

## ✅ CHECKLIST RISOLUZIONE

- [ ] Rimuovere lookup ridondante e usare `user?.user_id` direttamente
- [ ] Sostituire `getDocuments` con hook `useDocuments`
- [ ] Aggiungere normalizzazione ruolo
- [ ] Migliorare gestione errori con notifiche
- [ ] Aggiungere early return per utente non autenticato
- [ ] Separare loading states
- [ ] Aggiungere pulsante refresh manuale
- [ ] Correggere mismatch ID in `uploadDocument` (supportare trainer/admin)
- [ ] Aggiungere validazione dati
- [ ] Migliorare type safety
- [ ] Testare con dati reali
- [ ] Testare con ruoli diversi

---

**Fine Analisi**
