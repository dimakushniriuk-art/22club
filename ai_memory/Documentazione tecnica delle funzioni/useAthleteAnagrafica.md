# 📚 Documentazione Tecnica: useAthleteAnagrafica

**Percorso**: `src/hooks/athlete-profile/use-athlete-anagrafica.ts`  
**Tipo Modulo**: React Hook (React Query Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-01-29T15:00:00Z

---

## 📋 Panoramica

Hook React Query per gestione dati anagrafici atleta. Fornisce query per GET dati e mutation per UPDATE con validazione Zod, optimistic updates, e gestione errori robusta.

---

## 🔧 Funzioni e Export

### 1. `athleteAnagraficaKeys`

**Classificazione**: Query Key Factory (Pure Object)  
**Tipo**: `{ all: readonly ['athlete-anagrafica'], detail: (athleteId: string) => readonly ['athlete-anagrafica', string] }`

**Descrizione**: Factory per creare query keys consistenti per React Query.

**Utilizzato da**: `useAthleteAnagrafica`, `useUpdateAthleteAnagrafica`

---

### 2. `useAthleteAnagrafica`

**Classificazione**: React Hook, React Query Hook, Client Component, Async  
**Tipo**: `(athleteId: string | null) => UseQueryResult<AthleteAnagrafica | null>`

**Parametri**:

- `athleteId` (string | null): UUID dell'atleta (user_id)

**Output**: React Query `UseQueryResult` con:

- `data`: `AthleteAnagrafica | null`
- `isLoading`: `boolean`
- `isError`: `boolean`
- `error`: `Error | null`
- `refetch`: funzione per refetch manuale

**Descrizione**: Hook per ottenere dati anagrafici atleta da database con caching e refetch automatico.

---

### 3. `useUpdateAthleteAnagrafica`

**Classificazione**: React Hook, React Query Mutation Hook, Client Component, Async, Side-Effecting  
**Tipo**: `(athleteId: string | null) => UseMutationResult<AthleteAnagrafica, Error, AthleteAnagraficaUpdate>`

**Parametri**:

- `athleteId` (string | null): UUID dell'atleta (user_id)

**Output**: React Query `UseMutationResult` con:

- `mutate`: `(updates: AthleteAnagraficaUpdate) => void`
- `mutateAsync`: `(updates: AthleteAnagraficaUpdate) => Promise<AthleteAnagrafica>`
- `isPending`: `boolean`
- `isError`: `boolean`
- `error`: `Error | null`
- `isSuccess`: `boolean`
- `data`: `AthleteAnagrafica | undefined`

**Descrizione**: Hook per aggiornare dati anagrafici atleta con optimistic updates e rollback automatico.

---

## 🔄 Flusso Logico

### `useAthleteAnagrafica` - Query Flow

1. **Inizializzazione**:
   - Verifica `athleteId` → se `null`, ritorna `null`
   - Crea Supabase client

2. **Query Function** (`queryFn`):
   - Query `profiles` table con `user_id = athleteId`
   - Select tutti i campi anagrafici (nome, cognome, email, telefono, data_nascita, sesso, ecc.)
   - Se errore → throw error
   - Se `!data` → ritorna `null`

3. **Validazione e Trasformazione**:
   - Normalizza `sesso` con `normalizeSesso(data.sesso)`
   - Gestisce legacy field `phone` → mappa a `telefono`
   - Valida con `createAthleteAnagraficaSchema.parse()`
   - Ritorna `AthleteAnagrafica` validato

4. **Gestione Errori**:
   - Cattura errori con `handleApiError()`
   - Log errore in console
   - Throw `Error` con messaggio

5. **React Query Options**:
   - `enabled: !!athleteId` - query abilitata solo se `athleteId` presente
   - `staleTime: 5 * 60 * 1000` - dati considerati freschi per 5 minuti
   - `gcTime: 30 * 60 * 1000` - cache mantenuta per 30 minuti
   - `refetchOnWindowFocus: false` - no refetch automatico su focus
   - `refetchOnMount: false` - no refetch se dati freschi
   - `retry: 1` - riprova solo 1 volta in caso di errore

---

### `useUpdateAthleteAnagrafica` - Mutation Flow

1. **Mutation Function** (`mutationFn`):
   - Verifica `athleteId` → se `null`, throw error
   - Valida `updates` con `updateAthleteAnagraficaSchema.parse()`
   - Prepara `updateData` rimuovendo campi `undefined`
   - Sincronizza `telefono` → imposta anche `phone` (legacy)
   - Esegue `supabase.from('profiles').update(updateData).eq('user_id', athleteId)`
   - Se errore → throw error
   - Se `!data` → throw error "Dati non trovati dopo aggiornamento"
   - Valida risultato con `createAthleteAnagraficaSchema.parse()`
   - Ritorna `AthleteAnagrafica` validato

2. **Optimistic Update** (`onMutate`):
   - Annulla query in corso per evitare override
   - Snapshot valore precedente dalla cache
   - Aggiorna cache optimisticamente con nuovi valori
   - Aggiorna `updated_at` a timestamp corrente
   - Ritorna context con `previousData` per rollback

3. **Error Handling** (`onError`):
   - Se errore durante mutation:
     - Rollback cache al valore precedente (`previousData`)
     - Log errore in console
   - Cache viene ripristinata automaticamente

4. **Success Handling** (`onSuccess`):
   - Invalida query corrente per refetch dati aggiornati
   - Invalida anche query complete profilo se esistono
   - Assicura sincronizzazione cache con database

---

## 📥 Parametri Input

### `useAthleteAnagrafica`

- `athleteId`: `string | null` - UUID atleta (user_id)

### `useUpdateAthleteAnagrafica`

- `athleteId`: `string | null` - UUID atleta (user_id)
- `updates` (per `mutate`): `AthleteAnagraficaUpdate` - oggetto con campi da aggiornare (tutti opzionali)

---

## 📤 Output

### `useAthleteAnagrafica` Output

```typescript
{
  data: AthleteAnagrafica | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
  // ... altri metodi React Query
}
```

### `useUpdateAthleteAnagrafica` Output

```typescript
{
  mutate: (updates: AthleteAnagraficaUpdate) => void
  mutateAsync: (updates: AthleteAnagraficaUpdate) => Promise<AthleteAnagrafica>
  isPending: boolean
  isError: boolean
  error: Error | null
  isSuccess: boolean
  data: AthleteAnagrafica | undefined
  // ... altri metodi React Query
}
```

---

## ⚠️ Errori Possibili

1. **Errore query database**:
   - `handleApiError()` gestisce e logga errore
   - Throw `Error` con messaggio

2. **Profilo non trovato**:
   - Query ritorna `null` se `!data`
   - Hook ritorna `data: null` (non errore)

3. **Validazione Zod fallita**:
   - `createAthleteAnagraficaSchema.parse()` lancia `ZodError`
   - Catturato e gestito come errore API

4. **Update fallito**:
   - Errore Supabase → throw error
   - Rollback automatico cache in `onError`

5. **Dati non trovati dopo update**:
   - Throw error "Dati non trovati dopo aggiornamento"
   - Rollback cache

**Gestione**: Tutti gli errori sono gestiti gracefully con logging e rollback automatico.

---

## 🔗 Dipendenze Critiche

1. **React Query** (`@tanstack/react-query`):
   - `useQuery` - query hook
   - `useMutation` - mutation hook
   - `useQueryClient` - accesso query client

2. **Supabase Client** (`@/lib/supabase`):
   - `createClient()` - creazione client Supabase
   - `supabase.from('profiles')` - query/update profilo

3. **Validazione Zod** (`@/types/athlete-profile.schema`):
   - `createAthleteAnagraficaSchema` - schema validazione GET
   - `updateAthleteAnagraficaSchema` - schema validazione UPDATE
   - `AthleteAnagrafica` - tipo dati validato
   - `AthleteAnagraficaUpdate` - tipo update parziale

4. **Sanitizzazione** (`@/lib/sanitize`):
   - `normalizeSesso()` - normalizzazione campo sesso

5. **Error Handler** (`@/lib/error-handler`):
   - `handleApiError()` - gestione errori API

---

## 🎯 Utilizzo

**Esempio Base - GET Dati**:

```typescript
'use client'
import { useAthleteAnagrafica } from '@/hooks/athlete-profile/use-athlete-anagrafica'

export default function AthleteProfile({ athleteId }: { athleteId: string }) {
  const { data, isLoading, isError, error } = useAthleteAnagrafica(athleteId)

  if (isLoading) return <div>Caricamento...</div>
  if (isError) return <div>Errore: {error?.message}</div>
  if (!data) return <div>Profilo non trovato</div>

  return (
    <div>
      <h1>{data.nome} {data.cognome}</h1>
      <p>Email: {data.email}</p>
      <p>Telefono: {data.telefono}</p>
    </div>
  )
}
```

**Esempio Base - UPDATE Dati**:

```typescript
'use client'
import { useUpdateAthleteAnagrafica } from '@/hooks/athlete-profile/use-athlete-anagrafica'
import { useToast } from '@/components/ui/toast'

export default function EditProfile({ athleteId }: { athleteId: string }) {
  const { mutate, isPending, isError, error } = useUpdateAthleteAnagrafica(athleteId)
  const { addToast } = useToast()

  const handleSave = (updates: AthleteAnagraficaUpdate) => {
    mutate(updates, {
      onSuccess: () => {
        addToast({
          title: 'Profilo aggiornato',
          message: 'I dati anagrafici sono stati aggiornati con successo',
          type: 'success',
        })
      },
      onError: (error) => {
        addToast({
          title: 'Errore',
          message: error.message,
          type: 'error',
        })
      },
    })
  }

  return (
    <button
      onClick={() => handleSave({ nome: 'Nuovo Nome' })}
      disabled={isPending}
    >
      {isPending ? 'Salvataggio...' : 'Salva'}
    </button>
  )
}
```

**Utilizzato da**:

- `src/components/dashboard/athlete-profile/athlete-anagrafica-tab.tsx` - tab anagrafica
- Componenti che visualizzano/modificano dati anagrafici

---

## 🔄 Side-Effects

1. **Query Database**: Query `profiles` table su mount e refetch
2. **Update Database**: Update `profiles` table su mutation
3. **Cache Updates**: Aggiornamento cache React Query (optimistic + invalidation)
4. **Console Logging**: Log errori per debugging

---

## 📝 Changelog

### 2025-01-29

- ✅ Hook completo e funzionante
- ✅ Validazione Zod implementata
- ✅ Optimistic updates implementati
- ✅ Rollback automatico su errore
- ✅ Normalizzazione campo `sesso` con `normalizeSesso()`
- ✅ Supporto legacy field `phone` → `telefono`
- ✅ Gestione errori robusta con `handleApiError()`

---

**Ultimo aggiornamento**: 2025-01-29T15:00:00Z
