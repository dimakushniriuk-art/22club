# 📚 API Reference - Modulo Profilo Atleta

**Versione**: 1.0  
**Ultimo aggiornamento**: 2025-01-29

---

## Overview

Tutti gli hook del modulo Profilo Atleta utilizzano **React Query (TanStack Query)** per la gestione dello stato, caching e sincronizzazione con il database Supabase.

### Pattern Comune

Tutti gli hook seguono questo pattern:

```typescript
// GET hook
const { data, isLoading, error, refetch } = useAthleteXxx(athleteId)

// UPDATE hook
const updateMutation = useUpdateAthleteXxx(athleteId)
await updateMutation.mutateAsync(updates)
```

---

## Hook Anagrafica

### `useAthleteAnagrafica`

Ottiene i dati anagrafici estesi dell'atleta.

```typescript
function useAthleteAnagrafica(athleteId: string | null): UseQueryResult<ProfileAnagrafica | null>
```

**Parametri**:

- `athleteId`: UUID dell'atleta (user_id) o `null`

**Ritorna**:

- `data`: Dati anagrafici o `null` se non esiste
- `isLoading`: Stato di caricamento
- `error`: Eventuale errore

**Esempio**:

```typescript
const { data, isLoading } = useAthleteAnagrafica('athlete-id')
```

### `useUpdateAthleteAnagrafica`

Aggiorna i dati anagrafici dell'atleta.

```typescript
function useUpdateAthleteAnagrafica(
  athleteId: string | null,
): UseMutationResult<ProfileAnagrafica, Error, ProfileAnagraficaUpdate>
```

**Parametri**:

- `athleteId`: UUID dell'atleta (user_id) o `null`

**Mutazione**:

```typescript
await updateMutation.mutateAsync({
  phone: '+39 123 456 7890',
  indirizzo: 'Via Roma 1',
  citta: 'Milano',
})
```

**Caratteristiche**:

- ✅ Optimistic update
- ✅ Validazione Zod
- ✅ Cache invalidation automatica

---

## Hook Medica

### `useAthleteMedical`

Ottiene i dati medici dell'atleta.

```typescript
function useAthleteMedical(athleteId: string | null): UseQueryResult<AthleteMedicalData | null>
```

### `useUpdateAthleteMedical`

Aggiorna i dati medici dell'atleta.

```typescript
function useUpdateAthleteMedical(
  athleteId: string | null,
): UseMutationResult<AthleteMedicalData, Error, AthleteMedicalDataUpdate>
```

### `useUploadCertificatoMedico`

Carica un certificato medico.

```typescript
function useUploadCertificatoMedico(
  athleteId: string | null,
): UseMutationResult<AthleteMedicalData, Error, UploadCertificatoParams>
```

**Parametri upload**:

```typescript
{
  file: File,
  data_scadenza: string, // ISO date
  note?: string
}
```

### `useUploadRefertoMedico`

Carica un referto medico.

```typescript
function useUploadRefertoMedico(
  athleteId: string | null,
): UseMutationResult<AthleteMedicalData, Error, UploadRefertoParams>
```

**Parametri upload**:

```typescript
{
  file: File,
  tipo: string,
  data: string, // ISO date
  note?: string
}
```

---

## Hook Fitness

### `useAthleteFitness`

Ottiene i dati fitness dell'atleta.

```typescript
function useAthleteFitness(athleteId: string | null): UseQueryResult<AthleteFitnessData | null>
```

### `useUpdateAthleteFitness`

Aggiorna i dati fitness dell'atleta.

```typescript
function useUpdateAthleteFitness(
  athleteId: string | null,
): UseMutationResult<AthleteFitnessData, Error, AthleteFitnessDataUpdate>
```

**Esempio array operations**:

```typescript
// Aggiungi zona problematica
await updateMutation.mutateAsync({
  zone_problematiche: [...currentZones, 'schiena'],
})

// Rimuovi zona problematica
await updateMutation.mutateAsync({
  zone_problematiche: currentZones.filter((z) => z !== 'schiena'),
})
```

---

## Hook Motivazionale

### `useAthleteMotivational`

Ottiene i dati motivazionali dell'atleta.

```typescript
function useAthleteMotivational(
  athleteId: string | null,
): UseQueryResult<AthleteMotivationalData | null>
```

### `useUpdateAthleteMotivational`

Aggiorna i dati motivazionali dell'atleta.

```typescript
function useUpdateAthleteMotivational(
  athleteId: string | null,
): UseMutationResult<AthleteMotivationalData, Error, AthleteMotivationalDataUpdate>
```

**Esempio slider**:

```typescript
await updateMutation.mutateAsync({
  livello_motivazione: 8, // 1-10
})
```

---

## Hook Nutrizione

### `useAthleteNutrition`

Ottiene i dati nutrizionali dell'atleta.

```typescript
function useAthleteNutrition(athleteId: string | null): UseQueryResult<AthleteNutritionData | null>
```

### `useUpdateAthleteNutrition`

Aggiorna i dati nutrizionali dell'atleta.

```typescript
function useUpdateAthleteNutrition(
  athleteId: string | null,
): UseMutationResult<AthleteNutritionData, Error, AthleteNutritionDataUpdate>
```

**Esempio JSONB**:

```typescript
await updateMutation.mutateAsync({
  macronutrienti_target: {
    proteine: 150,
    carboidrati: 200,
    grassi: 65,
  },
})
```

---

## Hook Massaggi

### `useAthleteMassage`

Ottiene i dati massaggi dell'atleta.

```typescript
function useAthleteMassage(athleteId: string | null): UseQueryResult<AthleteMassageData | null>
```

### `useUpdateAthleteMassage`

Aggiorna i dati massaggi dell'atleta.

```typescript
function useUpdateAthleteMassage(
  athleteId: string | null,
): UseMutationResult<AthleteMassageData, Error, AthleteMassageDataUpdate>
```

---

## Hook Amministrativa

### `useAthleteAdministrative`

Ottiene i dati amministrativi dell'atleta.

```typescript
function useAthleteAdministrative(
  athleteId: string | null,
): UseQueryResult<AthleteAdministrativeData | null>
```

### `useUpdateAthleteAdministrative`

Aggiorna i dati amministrativi dell'atleta.

```typescript
function useUpdateAthleteAdministrative(
  athleteId: string | null,
): UseMutationResult<AthleteAdministrativeData, Error, AthleteAdministrativeDataUpdate>
```

### `useUploadDocumentoContrattuale`

Carica un documento contrattuale.

```typescript
function useUploadDocumentoContrattuale(
  athleteId: string | null,
): UseMutationResult<AthleteAdministrativeData, Error, UploadDocumentoParams>
```

**Parametri upload**:

```typescript
{
  file: File,
  tipo: 'contratto' | 'liberatoria' | 'altro',
  data: string, // ISO date
  note?: string
}
```

---

## Hook Smart Tracking

### `useAthleteSmartTracking`

Ottiene l'ultimo record di smart tracking dell'atleta.

```typescript
function useAthleteSmartTracking(
  athleteId: string | null,
): UseQueryResult<AthleteSmartTrackingData | null>
```

**Nota**: Restituisce solo l'ultimo record per `data_rilevazione`.

### `useAthleteSmartTrackingByDate`

Ottiene i dati smart tracking per una data specifica.

```typescript
function useAthleteSmartTrackingByDate(
  athleteId: string | null,
  date: string | null,
): UseQueryResult<AthleteSmartTrackingData | null>
```

**Parametri**:

- `athleteId`: UUID dell'atleta
- `date`: Data in formato ISO string (YYYY-MM-DD)

### `useUpdateAthleteSmartTracking`

Crea o aggiorna i dati smart tracking per una data.

```typescript
function useUpdateAthleteSmartTracking(
  athleteId: string | null,
): UseMutationResult<
  AthleteSmartTrackingData,
  Error,
  AthleteSmartTrackingDataUpdate & { data_rilevazione: string }
>
```

**Nota**: Se esiste già un record per la data, viene aggiornato, altrimenti viene creato (upsert).

### `useAthleteSmartTrackingHistory`

Ottiene lo storico dei dati smart tracking con paginazione.

```typescript
function useAthleteSmartTrackingHistory(
  athleteId: string | null,
  page: number,
  pageSize: number,
): UseQueryResult<AthleteSmartTrackingData[]>
```

**Parametri**:

- `athleteId`: UUID dell'atleta
- `page`: Numero pagina (0-based)
- `pageSize`: Dimensione pagina

---

## Hook AI Data

### `useAthleteAIData`

Ottiene l'ultimo record di AI data dell'atleta.

```typescript
function useAthleteAIData(athleteId: string | null): UseQueryResult<AthleteAIData | null>
```

**Nota**: Restituisce solo l'ultimo record per `data_analisi`.

### `useUpdateAthleteAIData`

Aggiorna i dati AI dell'atleta.

```typescript
function useUpdateAthleteAIData(
  athleteId: string | null,
): UseMutationResult<AthleteAIData, Error, AthleteAIDataUpdate>
```

### `useRefreshAthleteAIData`

Triggera un refresh dei dati AI (chiama RPC function).

```typescript
function useRefreshAthleteAIData(athleteId: string | null): UseMutationResult<void, Error, void>
```

**Esempio**:

```typescript
const refreshMutation = useRefreshAthleteAIData('athlete-id')
await refreshMutation.mutateAsync()
```

### `useAthleteAIDataHistory`

Ottiene lo storico dei dati AI con paginazione.

```typescript
function useAthleteAIDataHistory(
  athleteId: string | null,
  page: number,
  pageSize: number,
): UseQueryResult<AthleteAIData[]>
```

---

## Configurazione Caching

Tutti gli hook utilizzano configurazioni di caching ottimizzate:

```typescript
{
  staleTime: 5 * 60 * 1000,        // 5 minuti
  gcTime: 30 * 60 * 1000,            // 30 minuti (cacheTime)
  refetchOnWindowFocus: false,       // Non refetch automatico
  refetchOnMount: false,             // Non refetch se dati freschi
  retry: 1,                          // Riprova solo 1 volta
}
```

**Eccezioni**:

- **Smart Tracking**: `gcTime: 15 minuti` (dati più dinamici)
- **AI Data**: `gcTime: 60 minuti` (dati costosi da calcolare)

---

## Optimistic Updates

Tutti gli hook `useUpdate*` implementano optimistic updates:

```typescript
onMutate: async (newData) => {
  // Cancella query in corso
  await queryClient.cancelQueries({ queryKey })

  // Snapshot dati precedenti
  const previousData = queryClient.getQueryData(queryKey)

  // Aggiorna cache ottimisticamente
  queryClient.setQueryData(queryKey, newData)

  return { previousData }
},
onError: (err, newData, context) => {
  // Rollback in caso di errore
  queryClient.setQueryData(queryKey, context.previousData)
},
onSuccess: () => {
  // Invalida e refetch
  queryClient.invalidateQueries({ queryKey })
}
```

---

## Gestione Errori

Tutti gli hook utilizzano `handleApiError` per gestire gli errori in modo consistente:

```typescript
try {
  // Operazione
} catch (error) {
  const apiError = handleApiError(error, 'hookName')
  console.error('Errore:', apiError)
  throw new Error(apiError.message)
}
```

---

## Validazione

Tutti gli hook utilizzano **Zod** per validare i dati:

```typescript
// Validazione input
const validated = updateSchema.parse(updates)

// Validazione output
const validated = createSchema.parse(data)
```

---

**Ultimo aggiornamento**: 2025-01-29
