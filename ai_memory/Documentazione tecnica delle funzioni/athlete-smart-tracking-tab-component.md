# Componente: AthleteSmartTrackingTab

## 📋 Descrizione

Tab Smart Tracking per profilo atleta (vista PT). Visualizza e modifica dati smart tracking da dispositivi wearable e app fitness: info dispositivo, attività, frequenza cardiaca, sonno, metriche personalizzate. Supporta storico dati.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-smart-tracking-tab.tsx`

## 🔧 Props

```typescript
interface AthleteSmartTrackingTabProps {
  athleteId: string
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta

## 📦 Dipendenze

### React Hooks

- Custom hooks: `useAthleteSmartTracking`, `useSmartTrackingForm`

### UI Components

- `Button` da `@/components/ui`
- `LoadingState`, `ErrorState` da `@/components/dashboard`

### Icons

- `Activity`, `Edit`, `Save`, `X` da `lucide-react`

### Componenti Interni

- `DeviceInfoSection`, `ActivitySection`, `HeartRateSection`, `SleepSection`, `CustomMetricsSection` da `./smart-tracking`

## ⚙️ Funzionalità

### Core

1. **Gestione Dati Smart Tracking**: Visualizza e modifica dati smart tracking completi
2. **Sezioni Modulari**: Organizza dati in sezioni (dispositivo, attività, frequenza cardiaca, sonno, metriche personalizzate)
3. **Data Rilevazione**: Data rilevazione dati
4. **Ultimo Aggiornamento**: Mostra data ultimo aggiornamento

### Sezioni

1. **Info Dispositivo**: Tipo, marca dispositivo
2. **Attività**: Dati attività (passi, calorie, distanza, ecc.)
3. **Frequenza Cardiaca**: Dati frequenza cardiaca (resting, max, avg)
4. **Sonno**: Dati sonno (durata, qualità, fasi)
5. **Metriche Personalizzate**: Metriche personalizzate

### Funzionalità Avanzate

- **Supporto Storico**: Supporta storico dati
- **Ultimo Aggiornamento**: Mostra data ultimo aggiornamento
- **Form Dinamico**: Update dati per sezione

### UI/UX

- Header con titolo, descrizione e data ultimo aggiornamento
- Grid layout con sezioni
- Form per ogni sezione
- Bottoni salva/annulla

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header + Button Modifica + Data Ultimo Aggiornamento
  └── Grid (2 colonne)
      ├── DeviceInfoSection
      ├── ActivitySection
      ├── HeartRateSection
      ├── SleepSection
      └── CustomMetricsSection
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteSmartTrackingTab } from '@/components/dashboard/athlete-profile/athlete-smart-tracking-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  return <AthleteSmartTrackingTab athleteId={athleteId} />
}
```

## 🔍 Note Tecniche

### Hook Utilizzato

- `useSmartTrackingForm`: Gestisce form e salvataggio (nota: nome hook diverso da altri tab)

### Limitazioni

- Dipende da sezioni modulari (non standalone)
- Dati devono essere sincronizzati da dispositivi esterni

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
