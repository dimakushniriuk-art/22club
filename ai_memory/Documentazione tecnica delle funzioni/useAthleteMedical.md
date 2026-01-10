# 📚 Documentazione Tecnica: useAthleteMedical

**Percorso**: `src/hooks/athlete-profile/use-athlete-medical.ts`  
**Tipo Modulo**: React Hook (React Query Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-01-29T15:30:00Z

---

## 📋 Panoramica

Hook React Query per gestione dati medici atleta. Include GET, UPDATE dati medici e upload file (certificati/referti) con validazione Zod e gestione errori robusta.

---

## 🔧 Funzioni e Export

### 1. `athleteMedicalKeys`

**Classificazione**: Query Key Factory (Pure Object)  
**Tipo**: `{ all: readonly ['athlete-medical'], detail: (athleteId: string) => readonly ['athlete-medical', string] }`

**Descrizione**: Factory per creare query keys consistenti per React Query.

---

### 2. `useAthleteMedical`

**Classificazione**: React Hook, React Query Hook, Client Component, Async  
**Tipo**: `(athleteId: string | null) => UseQueryResult<AthleteMedicalData | null>`

**Parametri**:

- `athleteId` (string | null): UUID dell'atleta (user_id)

**Output**: React Query `UseQueryResult` con dati medici o `null`

**Descrizione**: Hook per ottenere dati medici atleta da database.

---

### 3. `useUpdateAthleteMedical`

**Classificazione**: React Hook, React Query Mutation Hook, Client Component, Async, Side-Effecting  
**Tipo**: `(athleteId: string | null) => UseMutationResult<AthleteMedicalData, Error, AthleteMedicalDataUpdate>`

**Descrizione**: Hook per aggiornare dati medici con supporto INSERT/UPDATE automatico e upload file.

---

## 🔄 Flusso Logico

### `useAthleteMedical` - Query Flow

1. Query `athlete_medical_data` table con `athlete_id = athleteId`
2. Se errore `PGRST116` (record non trovato) → ritorna `null` (non errore)
3. Valida con `createAthleteMedicalDataSchema.parse()`
4. Ritorna `AthleteMedicalData` validato

### `useUpdateAthleteMedical` - Mutation Flow

1. Valida `updates` con `updateAthleteMedicalDataSchema.parse()`
2. Verifica se record esiste:
   - Se esiste → UPDATE
   - Se non esiste → INSERT
3. Gestisce upload file per certificati/referti (se presente in `updates`)
4. Ritorna dati aggiornati validati

---

## 📥 Parametri Input

### `useAthleteMedical`

- `athleteId`: `string | null`

### `useUpdateAthleteMedical`

- `athleteId`: `string | null`
- `updates`: `AthleteMedicalDataUpdate` (per `mutate`)

---

## 📤 Output

### `useAthleteMedical`

- `data`: `AthleteMedicalData | null`
- `isLoading`, `isError`, `error`, `refetch`

### `useUpdateAthleteMedical`

- `mutate`, `mutateAsync`, `isPending`, `isError`, `error`, `isSuccess`, `data`

---

## ⚠️ Errori Possibili

1. **Record non trovato**: Ritorna `null` (non errore)
2. **Validazione Zod fallita**: Throw `Error`
3. **Upload file fallito**: Throw `Error`
4. **Update/Insert fallito**: Rollback automatico

---

## 🔗 Dipendenze Critiche

1. **React Query**: `useQuery`, `useMutation`, `useQueryClient`
2. **Supabase Client**: `createClient()`, `supabase.from('athlete_medical_data')`
3. **Validazione Zod**: `createAthleteMedicalDataSchema`, `updateAthleteMedicalDataSchema`
4. **Error Handler**: `handleApiError()`
5. **Supabase Storage**: Upload file certificati/referti

---

## 🎯 Utilizzo

```typescript
const { data, isLoading } = useAthleteMedical(athleteId)
const { mutate } = useUpdateAthleteMedical(athleteId)

mutate({
  certificato_medico_url: 'https://...',
  allergie: ['glutine', 'lattosio'],
  patologie: ['diabete'],
})
```

**Utilizzato da**: `athlete-medical-tab.tsx`

---

## 📝 Changelog

### 2025-01-29

- ✅ Hook completo con supporto INSERT/UPDATE automatico
- ✅ Upload file certificati/referti
- ✅ Validazione Zod implementata

---

**Ultimo aggiornamento**: 2025-01-29T15:30:00Z
