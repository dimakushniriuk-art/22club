# 🎨 Componenti UI - Modulo Profilo Atleta

**Versione**: 1.0  
**Ultimo aggiornamento**: 2025-01-29

---

## Overview

Il modulo Profilo Atleta include **9 componenti tab** che gestiscono ciascuna categoria dati. Tutti i componenti seguono lo stesso pattern architetturale e utilizzano gli hook React Query per la gestione dei dati.

---

## Struttura Componenti

Tutti i componenti tab si trovano in:

```
src/components/dashboard/athlete-profile/
```

### Pattern Comune

Ogni componente tab segue questo pattern:

```typescript
'use client'

import { useState, useCallback, useMemo } from 'react'
import { useAthleteXxx, useUpdateAthleteXxx } from '@/hooks/athlete-profile/use-athlete-xxx'

export function AthleteXxxTab({ athleteId }: { athleteId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})

  const { data, isLoading, error } = useAthleteXxx(athleteId)
  const updateMutation = useUpdateAthleteXxx(athleteId)

  const handleSave = useCallback(async () => {
    await updateMutation.mutateAsync(formData)
    setIsEditing(false)
  }, [formData, updateMutation])

  // ... rendering
}
```

---

## Componenti Tab

### 1. `AthleteAnagraficaTab`

**File**: `athlete-anagrafica-tab.tsx`  
**Hook**: `useAthleteAnagrafica`, `useUpdateAthleteAnagrafica`

**Campi gestiti**:

- Dati personali base (nome, cognome, email)
- Data nascita, sesso
- Indirizzo completo
- Contatti emergenza
- Documenti (codice fiscale, carta identità)

**Caratteristiche**:

- ✅ Validazione form completa
- ✅ Edit inline
- ✅ Empty state gestito
- ✅ Error handling

---

### 2. `AthleteMedicalTab`

**File**: `athlete-medical-tab.tsx`  
**Hook**: `useAthleteMedical`, `useUpdateAthleteMedical`, `useUploadCertificatoMedico`, `useUploadRefertoMedico`

**Campi gestiti**:

- Certificato medico (upload, visualizzazione, scadenza)
- Referti medici (array con upload multipli)
- Allergie (array)
- Patologie (array)
- Farmaci assunti (array)

**Caratteristiche**:

- ✅ Upload file certificato/referti
- ✅ Gestione array dinamici (add/remove)
- ✅ Validazione date scadenza
- ✅ Visualizzazione file caricati

**Esempio upload**:

```typescript
const uploadCertificato = useUploadCertificatoMedico(athleteId)

await uploadCertificato.mutateAsync({
  file: selectedFile,
  data_scadenza: '2025-12-31',
  note: 'Certificato annuale',
})
```

---

### 3. `AthleteFitnessTab`

**File**: `athlete-fitness-tab.tsx`  
**Hook**: `useAthleteFitness`, `useUpdateAthleteFitness`

**Campi gestiti**:

- Misurazioni corporee (peso, altezza, BMI calcolato)
- Livello esperienza
- Obiettivi primari/secondari
- Zone problematiche (array)
- Note fitness

**Caratteristiche**:

- ✅ Calcolo automatico BMI
- ✅ Gestione array obiettivi/zone
- ✅ Slider per livello esperienza
- ✅ Validazione misurazioni

---

### 4. `AthleteMotivationalTab`

**File**: `athlete-motivational-tab.tsx`  
**Hook**: `useAthleteMotivational`, `useUpdateAthleteMotivational`

**Campi gestiti**:

- Motivazione principale
- Motivazioni secondarie (array)
- Ostacoli percepiti (array)
- Preferenze ambiente (array)
- Preferenze compagnia (array)
- Livello motivazione (slider 1-10)

**Caratteristiche**:

- ✅ Slider livello motivazione
- ✅ Gestione array multipli
- ✅ Tag input per preferenze

---

### 5. `AthleteNutritionTab`

**File**: `athlete-nutrition-tab.tsx`  
**Hook**: `useAthleteNutrition`, `useUpdateAthleteNutrition`

**Campi gestiti**:

- Obiettivo calorico
- Macronutrienti target (JSONB: proteine, carboidrati, grassi)
- Intolleranze (array)
- Allergie alimentari (array)
- Preferenze alimentari (array)
- Preferenze orari pasti (array)

**Caratteristiche**:

- ✅ Gestione JSONB macronutrienti
- ✅ Calcolo automatico percentuali
- ✅ Validazione obiettivi calorici

---

### 6. `AthleteMassageTab`

**File**: `athlete-massage-tab.tsx`  
**Hook**: `useAthleteMassage`, `useUpdateAthleteMassage`

**Campi gestiti**:

- Tipi massaggio preferiti (array)
- Zone problematiche (array)
- Frequenza massaggi
- Preferenze pressione
- Storico massaggi (array)

**Caratteristiche**:

- ✅ Multi-select per tipi massaggio
- ✅ Gestione array zone problematiche
- ✅ Storico visualizzabile

---

### 7. `AthleteAdministrativeTab`

**File**: `athlete-administrative-tab.tsx`  
**Hook**: `useAthleteAdministrative`, `useUpdateAthleteAdministrative`, `useUploadDocumentoContrattuale`

**Campi gestiti**:

- Tipo abbonamento
- Stato abbonamento
- Date abbonamento (inizio/scadenza)
- Lezioni (incluse/utilizzate/rimanenti - calcolate da trigger)
- Metodo pagamento preferito
- Documenti contrattuali (array con upload)

**Caratteristiche**:

- ✅ Upload documenti contrattuali
- ✅ Calcolo automatico lezioni rimanenti (trigger DB)
- ✅ Badge stato abbonamento
- ✅ Validazione date

---

### 8. `AthleteSmartTrackingTab`

**File**: `athlete-smart-tracking-tab.tsx`  
**Hook**: `useAthleteSmartTracking`, `useUpdateAthleteSmartTracking`, `useAthleteSmartTrackingHistory`

**Campi gestiti**:

- Dati wearable (passi, calorie, distanza, battito cardiaco)
- Dati sonno (ore, qualità)
- Attività minuti
- Metriche custom (JSONB)
- Storico con paginazione

**Caratteristiche**:

- ✅ Visualizzazione ultimo record
- ✅ Storico paginato
- ✅ Grafici metriche (opzionale)
- ✅ Upsert per data

---

### 9. `AthleteAIDataTab`

**File**: `athlete-ai-data-tab.tsx`  
**Hook**: `useAthleteAIData`, `useUpdateAthleteAIData`, `useRefreshAthleteAIData`, `useAthleteAIDataHistory`

**Campi gestiti**:

- Insights aggregati (JSONB)
- Raccomandazioni (array)
- Pattern rilevati (array)
- Predizioni performance (array)
- Score engagement/progresso
- Fattori rischio (array)
- Storico con paginazione

**Caratteristiche**:

- ✅ Visualizzazione ultimo record
- ✅ Refresh manuale dati AI
- ✅ Storico paginato
- ✅ Visualizzazione score

---

## Pattern Comuni

### Edit Mode

Tutti i componenti implementano una modalità edit:

```typescript
const [isEditing, setIsEditing] = useState(false)

// Toggle edit
const handleEdit = useCallback(() => {
  setIsEditing(true)
  setFormData(data || {})
}, [data])

// Cancel edit
const handleCancel = useCallback(() => {
  setIsEditing(false)
  setFormData({})
}, [])
```

### Optimistic Updates

Tutti i componenti beneficiano degli optimistic updates degli hook:

```typescript
const updateMutation = useUpdateAthleteXxx(athleteId)

// L'UI si aggiorna immediatamente
await updateMutation.mutateAsync(formData)
```

### Array Operations

Per componenti con array dinamici:

```typescript
const addItem = useCallback((item: string) => {
  setFormData((prev) => ({
    ...prev,
    arrayField: [...(prev.arrayField || []), item],
  }))
}, [])

const removeItem = useCallback((index: number) => {
  setFormData((prev) => ({
    ...prev,
    arrayField: prev.arrayField?.filter((_, i) => i !== index) || [],
  }))
}, [])
```

### Memoization

Tutti i componenti utilizzano `useMemo` e `useCallback` per ottimizzazioni:

```typescript
const memoizedValue = useMemo(() => {
  // Calcolo costoso
  return computeExpensiveValue(data)
}, [data])

const memoizedCallback = useCallback(() => {
  // Funzione stabile
  doSomething()
}, [dependencies])
```

---

## Integrazione Dashboard

I componenti tab sono integrati in:

### Dashboard PT

**File**: `src/app/dashboard/atleti/[id]/page.tsx`

```typescript
import { AthleteAnagraficaTab } from '@/components/dashboard/athlete-profile/athlete-anagrafica-tab'

// Utilizzo con sistema sub-tab
<AthleteAnagraficaTab athleteId={athleteId} />
```

### Profilo Atleta

**File**: `src/app/home/profilo/page.tsx`

Stesso pattern di integrazione.

---

## Styling

Tutti i componenti utilizzano:

- **Tailwind CSS** per styling
- **shadcn/ui** per componenti base
- **Design system** coerente (dark mode, palette colori)

---

## Best Practices

1. ✅ **Sempre utilizzare `useCallback`** per funzioni passate come props
2. ✅ **Sempre utilizzare `useMemo`** per calcoli costosi
3. ✅ **Gestire loading/error states** in modo consistente
4. ✅ **Validare input** prima di salvare
5. ✅ **Mostrare feedback** all'utente (toast, spinner)
6. ✅ **Gestire empty states** quando non ci sono dati

---

**Ultimo aggiornamento**: 2025-01-29
