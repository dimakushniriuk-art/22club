# 📚 Documentazione Tecnica: useAthleteProfileFormBase

**Percorso**: `src/hooks/athlete-profile/use-athlete-profile-form-base.ts`  
**Tipo Modulo**: React Hook (Base Form Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:50:00Z

---

## 📋 Panoramica

Hook base generico per gestione form profilo atleta. Estratto per ridurre duplicazione tra i vari tab componenti. Fornisce logica comune per inizializzazione, salvataggio, annullamento.

---

## 🔧 Funzioni e Export

### 1. `useAthleteProfileFormBase`

**Classificazione**: React Hook, Base Hook, Generic Hook, Client Component  
**Tipo**: `<TData, TFormData, TSanitized>(props: UseAthleteProfileFormBaseProps) => UseAthleteProfileFormBaseReturn`

**Parametri Generici**:

- `TData`: Tipo dati esistenti
- `TFormData`: Tipo dati form
- `TSanitized`: Tipo dati sanitizzati (default: `TFormData`)

**Parametri**:

- `data` (TData | null): Dati esistenti
- `athleteId` (string): UUID dell'atleta
- `initialFormData` (TFormData): Dati form iniziali
- `schema` (ZodSchema<TSanitized>): Schema validazione Zod
- `mutation`: React Query mutation object
- `getFormDataFromData`: `(data: TData) => TFormData` - Funzione estrazione dati form
- `sanitize?`: `(data: TFormData) => TSanitized` - Funzione sanitizzazione opzionale
- `successMessage?`: string
- `errorMessage?`: string

**Output**: Oggetto con:

- `isEditing`: `boolean`
- `setIsEditing`: `(value: boolean) => void`
- `formData`: `TFormData`
- `setFormData`: `(data: TFormData) => void`
- `handleSave`: `() => Promise<boolean>`
- `handleCancel`: `() => void`
- `updateMutation`: React Query mutation object

**Descrizione**: Hook base generico che fornisce logica comune per tutti i form profilo atleta.

---

## 🔄 Flusso Logico

### Inizializzazione

1. Hook riceve `data`, `initialFormData`, `getFormDataFromData`
2. `useEffect` inizializza `formData` quando `data` cambia e non si sta editando
3. Usa `getFormDataFromData(data)` per estrarre dati form

### Salvataggio

1. `handleSave()` chiama `handleAthleteProfileSave()`:
   - Sanitizza con `sanitize` se fornita
   - Valida con `schema` (Zod)
   - Esegue `mutation.mutateAsync()`
   - Toast successo/errore
   - `setIsEditing(false)` su successo
2. Ritorna `boolean` (successo/errore)

### Annullamento

1. `handleCancel()` chiama `resetFormToOriginal()`:
   - `setIsEditing(false)`
   - Reset `formData` usando `getFormDataFromData(data)`

---

## 📊 Utilizzo

Hook base utilizzato come foundation per hook form specifici. Pattern:

```typescript
// Hook specifico estende hook base
export function useAthleteNutritionForm({ nutrition, athleteId }) {
  // Logica specifica (array management, etc.)
  // ...

  // Usa hook base per logica comune
  const base = useAthleteProfileFormBase({
    data: nutrition,
    athleteId,
    initialFormData: {
      /* ... */
    },
    schema: updateAthleteNutritionDataSchema,
    mutation: updateMutation,
    getFormDataFromData: (data) => ({
      /* ... */
    }),
    sanitize: sanitizeFormData,
  })

  // Combina logica specifica + base
  return { ...base /* logica specifica */ }
}
```

---

## 📊 Dipendenze

**Dipende da**: `useToast`, `handleAthleteProfileSave`, `resetFormToOriginal`, Zod

**Utilizzato da**: Hook form specifici (indirettamente, come pattern di riferimento)

---

**Ultimo aggiornamento**: 2025-02-01T23:50:00Z
