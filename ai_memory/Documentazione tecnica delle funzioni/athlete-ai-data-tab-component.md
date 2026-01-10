# Componente: AthleteAIDataTab

## 📋 Descrizione

Tab AI Data per profilo atleta (vista PT). Visualizza e modifica dati AI, insights, raccomandazioni, pattern, predizioni, fattori di rischio, score, note AI. Utilizza sezioni modulari (AIDataScoresSection, AIDataRiskFactorsSection, ecc.).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-ai-data-tab.tsx`

## 🔧 Props

```typescript
interface AthleteAIDataTabProps {
  athleteId: string
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta

## 📦 Dipendenze

### React Hooks

- `useMemo` da `react`
- Custom hooks: `useAthleteAIData`, `useAthleteAIDataForm`

### UI Components

- `Button`, `Card`, `CardContent` da `@/components/ui`
- `LoadingState`, `ErrorState` da `@/components/dashboard`

### Icons

- `Brain`, `Edit`, `Save`, `X` da `lucide-react`

### Componenti Interni

- `AIDataScoresSection`, `AIDataRiskFactorsSection`, `AIDataRecommendationsSection`, `AIDataPatternsSection`, `AIDataPredictionsSection`, `AIDataInsightsSection`, `AIDataNotesSection` da `./ai-data`

## ⚙️ Funzionalità

### Core

1. **Gestione Dati AI**: Visualizza e modifica dati AI completi
2. **Sezioni Modulari**: Organizza dati in sezioni (score, fattori rischio, raccomandazioni, pattern, predizioni, insights, note)
3. **Priorità Badge**: Badge per priorità raccomandazioni (alta, media, bassa)
4. **Ultima Analisi**: Mostra data ultima analisi AI

### Sezioni

1. **Score**: Score AI vari
2. **Fattori Rischio**: Fattori di rischio identificati
3. **Raccomandazioni**: Raccomandazioni con priorità
4. **Pattern**: Pattern identificati
5. **Predizioni**: Predizioni future
6. **Insights**: Insights generati
7. **Note**: Note AI

### Funzionalità Avanzate

- **Memoizzazione**: `useMemo` per liste array
- **Priorità Badge**: Funzione per badge priorità
- **Ultima Analisi**: Mostra data ultima analisi

### UI/UX

- Header con titolo, descrizione e data ultima analisi
- Grid layout con sezioni
- Badge priorità per raccomandazioni
- Bottoni salva/annulla

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header + Button Modifica + Data Ultima Analisi
  └── Grid (2 colonne)
      ├── AIDataScoresSection
      ├── AIDataRiskFactorsSection
      ├── AIDataRecommendationsSection
      ├── AIDataPatternsSection
      ├── AIDataPredictionsSection
      ├── AIDataInsightsSection
      └── AIDataNotesSection
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteAIDataTab } from '@/components/dashboard/athlete-profile/athlete-ai-data-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  return <AthleteAIDataTab athleteId={athleteId} />
}
```

## 🔍 Note Tecniche

### Priorità Badge

```typescript
const getPrioritaBadge = (priorita: 'alta' | 'media' | 'bassa') => {
  const badges = {
    alta: { color: 'destructive', text: 'Alta' },
    media: { color: 'warning', text: 'Media' },
    bassa: { color: 'secondary', text: 'Bassa' },
  }
  return badges[priorita]
}
```

### Limitazioni

- Dipende da sezioni modulari (non standalone)
- Dati AI devono essere generati esternamente

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
