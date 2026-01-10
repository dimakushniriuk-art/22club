# 📋 Modulo Profilo Atleta

**Versione**: 1.0  
**Data Completamento**: 2025-01-29  
**Stato**: ✅ **COMPLETATO** (10/10 fasi completate)

---

## 🎯 Overview

Il modulo **Profilo Atleta** è un sistema completo per la gestione di tutte le informazioni relative agli atleti nella piattaforma 22Club. Il modulo supporta sia la visualizzazione e modifica da parte del Personal Trainer (PT) che dell'atleta stesso.

### Caratteristiche Principali

- ✅ **9 categorie dati** complete e strutturate
- ✅ **Interfaccia dual-mode**: Dashboard PT e Profilo Atleta
- ✅ **Sicurezza avanzata**: RLS policies, validazione client/server, audit logs
- ✅ **Performance ottimizzate**: Caching, lazy loading, optimistic updates
- ✅ **File storage**: Upload/download certificati, referti, documenti
- ✅ **Smart tracking**: Integrazione dati wearable e AI insights

---

## 📊 Struttura Dati

Il modulo gestisce **9 categorie dati** principali:

### 1. Anagrafica

Dati personali estesi: data nascita, sesso, indirizzo, contatti emergenza, documenti.

**Tabella**: `profiles` (colonne estese)  
**Hook**: `useAthleteAnagrafica`  
**Componente**: `AthleteAnagraficaTab`

### 2. Medica

Certificati medici, referti, allergie, patologie, farmaci assunti.

**Tabella**: `athlete_medical_data`  
**Hook**: `useAthleteMedical`, `useUploadCertificatoMedico`, `useUploadRefertoMedico`  
**Componente**: `AthleteMedicalTab`

### 3. Fitness

Misurazioni corporee, obiettivi fitness, livello esperienza, zone problematiche.

**Tabella**: `athlete_fitness_data`  
**Hook**: `useAthleteFitness`  
**Componente**: `AthleteFitnessTab`

### 4. Motivazionale

Obiettivi personali, motivazioni, ostacoli percepiti, preferenze ambiente/compagnia.

**Tabella**: `athlete_motivational_data`  
**Hook**: `useAthleteMotivational`  
**Componente**: `AthleteMotivationalTab`

### 5. Nutrizione

Obiettivi calorici, macronutrienti, intolleranze, allergie alimentari, preferenze.

**Tabella**: `athlete_nutrition_data`  
**Hook**: `useAthleteNutrition`  
**Componente**: `AthleteNutritionTab`

### 6. Massaggi

Tipi massaggio preferiti, zone problematiche, frequenza, preferenze pressione.

**Tabella**: `athlete_massage_data`  
**Hook**: `useAthleteMassage`  
**Componente**: `AthleteMassageTab`

### 7. Amministrativa

Abbonamenti, pagamenti, lezioni incluse/utilizzate, documenti contrattuali.

**Tabella**: `athlete_administrative_data`  
**Hook**: `useAthleteAdministrative`, `useUploadDocumentoContrattuale`  
**Componente**: `AthleteAdministrativeTab`

### 8. Smart Tracking

Dati da dispositivi wearable: passi, calorie, battito cardiaco, sonno, attività.

**Tabella**: `athlete_smart_tracking_data`  
**Hook**: `useAthleteSmartTracking`, `useAthleteSmartTrackingHistory`  
**Componente**: `AthleteSmartTrackingTab`

### 9. AI Data

Insights aggregati, raccomandazioni, pattern rilevati, predizioni performance.

**Tabella**: `athlete_ai_data`  
**Hook**: `useAthleteAIData`, `useRefreshAthleteAIData`, `useAthleteAIDataHistory`  
**Componente**: `AthleteAIDataTab`

---

## 🏗️ Architettura

### Stack Tecnologico

- **Frontend**: Next.js 15, React 18, TypeScript
- **State Management**: React Query (TanStack Query)
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Validazione**: Zod
- **Testing**: Vitest

### Struttura File

```
src/
├── types/
│   ├── athlete-profile.ts              # Tipi TypeScript
│   └── athlete-profile.schema.ts        # Schemi Zod validazione
├── hooks/
│   └── athlete-profile/
│       ├── use-athlete-anagrafica.ts
│       ├── use-athlete-medical.ts
│       ├── use-athlete-fitness.ts
│       ├── use-athlete-motivational.ts
│       ├── use-athlete-nutrition.ts
│       ├── use-athlete-massage.ts
│       ├── use-athlete-administrative.ts
│       ├── use-athlete-smart-tracking.ts
│       ├── use-athlete-ai-data.ts
│       └── __tests__/                   # Test unitari
├── components/
│   └── dashboard/
│       └── athlete-profile/
│           ├── athlete-anagrafica-tab.tsx
│           ├── athlete-medical-tab.tsx
│           ├── athlete-fitness-tab.tsx
│           ├── athlete-motivational-tab.tsx
│           ├── athlete-nutrition-tab.tsx
│           ├── athlete-massage-tab.tsx
│           ├── athlete-administrative-tab.tsx
│           ├── athlete-smart-tracking-tab.tsx
│           └── athlete-ai-data-tab.tsx
└── app/
    ├── dashboard/
    │   └── atleti/
    │       └── [id]/
    │           └── page.tsx            # Dashboard PT
    └── home/
        └── profilo/
            └── page.tsx                # Profilo Atleta

supabase/
└── migrations/
    ├── 20250127_extend_profiles_anagrafica.sql
    ├── 20250127_create_athlete_medical_data.sql
    ├── 20250127_create_athlete_fitness_data.sql
    ├── 20250127_create_athlete_motivational_data.sql
    ├── 20250127_create_athlete_nutrition_data.sql
    ├── 20250127_create_athlete_massage_data.sql
    ├── 20250127_create_athlete_administrative_data.sql
    ├── 20250127_create_athlete_smart_tracking_data.sql
    ├── 20250127_create_athlete_ai_data.sql
    ├── 20250127_setup_storage_buckets.sql
    ├── 20250127_create_helper_functions.sql
    └── 20250127_add_athlete_profile_indexes.sql
```

---

## 🚀 Quick Start

### Utilizzo Base

```typescript
import { useAthleteAnagrafica } from '@/hooks/athlete-profile/use-athlete-anagrafica'

function MyComponent() {
  const { data, isLoading, error } = useAthleteAnagrafica('athlete-id')

  if (isLoading) return <div>Caricamento...</div>
  if (error) return <div>Errore: {error.message}</div>

  return <div>{data?.nome} {data?.cognome}</div>
}
```

### Aggiornamento Dati

```typescript
import { useUpdateAthleteAnagrafica } from '@/hooks/athlete-profile/use-athlete-anagrafica'

function EditComponent() {
  const updateMutation = useUpdateAthleteAnagrafica('athlete-id')

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      phone: '+39 123 456 7890',
      indirizzo: 'Via Roma 1',
    })
  }

  return <button onClick={handleSave}>Salva</button>
}
```

---

## 📚 Documentazione Dettagliata

- [**API Reference**](./api-reference.md) - Documentazione completa degli hook
- [**Componenti UI**](./components.md) - Guida ai componenti tab
- [**Database Schema**](./database-schema.md) - Struttura tabelle e relazioni
- [**Guida Sviluppatori**](./developer-guide.md) - Best practices e esempi avanzati
- [**Sicurezza**](./security.md) - RLS policies, validazione, audit logs
- [**Performance**](./performance.md) - Ottimizzazioni e caching

---

## ✅ Stato Completamento

### Fasi Sviluppo

- ✅ **Fase 1**: Database & Supabase (100%)
- ✅ **Fase 2**: TypeScript Types (100%)
- ✅ **Fase 3**: Hooks React Query (100%)
- ✅ **Fase 4**: UI/UX Tabs PT (100%)
- ✅ **Fase 5**: UI/UX Profilo Atleta (100%)
- ✅ **Fase 6**: Sicurezza (100%)
- ✅ **Fase 7**: Performance (100%)
- ✅ **Fase 8**: Migrazione & Backfill (100%)
- ✅ **Fase 9**: QA + Testing (100%)
- ✅ **Fase 10**: Documentazione (100%)

### Test Coverage

- ✅ **Test Unitari**: 9/9 hook (100%)
- ✅ **Test SQL**: 3/3 script (100%)
- ✅ **Test Manuali**: UI, File Storage, Dashboard (100%)

---

## 🔗 Link Utili

- [Piano di Sviluppo](../../../PLAN_PROFILO_ATLETA.md)
- [Risultati Test](../FASE9_TEST_RESULTS.md)
- [Guida Test Manuali](../FASE9_TEST_MANUALI_GUIDA.md)

---

**Ultimo aggiornamento**: 2025-01-29
