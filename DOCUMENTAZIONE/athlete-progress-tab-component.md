# Componente: AthleteProgressTab

## 📋 Descrizione

Tab progressi per profilo atleta (vista PT). Mostra statistiche rapide progressi (peso attuale, allenamenti totali, allenamenti questo mese) con card KPI e link a pagina dettagli completa progressi.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-progress-tab.tsx`

## 🔧 Props

```typescript
interface AthleteProgressTabProps {
  athleteId: string
  stats: {
    peso_attuale: number | null
    allenamenti_totali: number
    allenamenti_mese: number
  }
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta
- **`stats`** (object, required): Statistiche progressi

## 📦 Dipendenze

### Next.js

- `Link` da `next/link`

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Button` da `@/components/ui`

### Icons

- `BarChart3`, `TrendingUp`, `Activity`, `Award`, `ArrowLeft` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Statistiche Rapide**: Mostra 3 KPI principali (peso attuale, allenamenti totali, allenamenti mese)
2. **Link Dettagli**: Link a pagina dettagli completa progressi
3. **Card KPI**: Card colorate per ogni metrica

### Metriche Visualizzate

1. **Peso Attuale**: Peso attuale in kg (o "N/A" se non disponibile)
2. **Allenamenti Totali**: Count allenamenti totali
3. **Questo Mese**: Count allenamenti questo mese

### Funzionalità Avanzate

- **Layout Responsive**: Grid 1 colonna mobile, 3 colonne desktop
- **Icone Colorate**: Icone con background colorato per ogni metrica
- **Link Navigazione**: Link a pagina dettagli progressi

### UI/UX

- Card con bordo teal
- Header con titolo e link dettagli
- Grid KPI cards responsive
- Icone colorate per ogni metrica

## 🎨 Struttura UI

```
Card (border teal)
  └── CardContent
      ├── Header (flex justify-between)
      │   ├── Titolo + Descrizione
      │   └── Link "Dettagli completi"
      └── Grid Statistiche (3 colonne)
          ├── Card Peso Attuale
          ├── Card Allenamenti Totali
          └── Card Questo Mese
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteProgressTab } from '@/components/dashboard/athlete-profile/athlete-progress-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  const stats = {
    peso_attuale: 75.5,
    allenamenti_totali: 120,
    allenamenti_mese: 8,
  }

  return <AthleteProgressTab athleteId={athleteId} stats={stats} />
}
```

## 🔍 Note Tecniche

### Limitazioni

- Solo statistiche rapide (non grafici dettagliati)
- Stats devono essere calcolate esternamente
- Link a pagina esterna (non componente standalone)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
