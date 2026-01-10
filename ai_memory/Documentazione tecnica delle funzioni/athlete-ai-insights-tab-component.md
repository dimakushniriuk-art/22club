# Componente: AthleteAIInsightsTab

## 📋 Descrizione

Componente tab per la sezione AI insights del profilo atleta. Mostra engagement score e raccomandazioni generate da AI.

## 📁 Percorso File

`src/components/home-profile/athlete-ai-insights-tab.tsx`

## 🔧 Props

```typescript
interface AthleteAIInsightsTabProps {
  aiData: {
    engagement_score?: number
    raccomandazioni?: string | null
  } | null
}
```

### Dettaglio Props

- **`aiData`** (object | null, required): Dati AI insights (engagement score, raccomandazioni)

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Brain` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Engagement Score**: Mostra punteggio engagement (se disponibile)
2. **Raccomandazioni**: Mostra raccomandazioni AI (se disponibili)
3. **Empty State**: Mostra messaggio quando non ci sono dati AI

### Stati

- **No Data**: Messaggio "Nessun dato AI disponibile"
- **With Data**: Visualizzazione engagement score e/o raccomandazioni

### UI/UX

- Card con bordo teal
- Sezioni separate per ogni metrica
- Empty state semplice

## 🎨 Struttura UI

```
Card
  ├── Empty State (se !aiData)
  │   └── Messaggio "Nessun dato AI disponibile"
  └── With Data
      ├── CardHeader
      │   └── CardTitle "AI Insights" (icona Brain)
      └── CardContent
          ├── Card "Engagement Score" (se presente)
          │   └── Valore numerico
          └── Card "Raccomandazioni" (se presente)
              └── Testo raccomandazioni
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteAIInsightsTab } from '@/components/home-profile/athlete-ai-insights-tab'

function ProfilePage() {
  return (
    <AthleteAIInsightsTab
      aiData={{
        engagement_score: 92,
        raccomandazioni: 'Continua così! I tuoi progressi sono eccellenti.',
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Visibilità Condizionale

- **Engagement Score**: Mostrato solo se `engagement_score !== undefined`
- **Raccomandazioni**: Mostrato solo se `raccomandazioni` presente e non null

### Empty State

- Mostrato quando `aiData === null`
- Messaggio semplice senza azioni

### Limitazioni

- Non permette modifiche (solo visualizzazione)
- Non gestisce refresh dati AI
- Non mostra storico insights

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
