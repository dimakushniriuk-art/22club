# Componente: AthleteProgress

## 📋 Descrizione

Componente per visualizzare progressi atleta: ultima misurazione (peso, forza massimale, circonferenze, mood, note), foto recenti, calcolo variazione peso, link visualizza tutto e grafici. Supporta loading state e empty state.

## 📁 Percorso File

`src/components/dashboard/athlete-progress.tsx`

## 🔧 Props

```typescript
interface AthleteProgressProps {
  athleteId: string
  athleteName: string
  progressLogs: ProgressLog[]
  progressPhotos: ProgressPhoto[]
  loading?: boolean
  onViewFullProgress?: (athleteId: string) => void
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta
- **`athleteName`** (string, required): Nome atleta
- **`progressLogs`** (ProgressLog[], required): Array log progressi
- **`progressPhotos`** (ProgressPhoto[], required): Array foto progressi
- **`loading`** (boolean, optional): Stato loading
- **`onViewFullProgress`** (function, optional): Callback visualizza progressi completi

## 📦 Dipendenze

### Next.js

- `Image` da `next/image`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Badge`, `Button`, `Skeleton` da `@/components/ui`

### Icons

- `TrendingUp`, `Calendar`, `Weight`, `Target`, `Image as ImageIcon`, `Eye`, `BarChart3` da `lucide-react`

### Types

- `ProgressLog`, `ProgressPhoto` da `@/types/progress`

## ⚙️ Funzionalità

### Core

1. **Ultima Misurazione**: Mostra ultima misurazione (peso, forza, circonferenze, mood, note)
2. **Variazione Peso**: Calcola e mostra variazione peso rispetto a misurazione precedente
3. **Foto Recenti**: Mostra foto più recenti (max 3)
4. **Azioni**: Link visualizza tutto e grafici

### Dati Visualizzati

- **Peso**: Peso attuale con badge variazione
- **Forza Massimale**: Bench, Squat, Deadlift
- **Circonferenze**: Petto, Vita, Fianchi, Bicipiti
- **Mood**: Emoji stato
- **Note**: Note aggiuntive
- **Foto**: Foto recenti (fino a 3)

### Funzionalità Avanzate

- **Calcolo Variazione**: Calcola variazione peso e percentuale
- **Filtro Foto**: Mostra solo foto della data ultima misurazione
- **Loading State**: Skeleton loading durante caricamento
- **Empty State**: Messaggio se nessun dato

### UI/UX

- Card con header
- Grid layout per dati
- Badge variazione peso
- Thumbnail foto
- Bottoni azioni

## 🎨 Struttura UI

```
Card
  ├── CardHeader (Titolo + Icona)
  └── CardContent
      ├── Ultima Misurazione
      │   ├── Data
      │   ├── Peso + Badge Variazione
      │   ├── Forza Massimale (Grid 3 colonne)
      │   ├── Circonferenze (Grid 2 colonne)
      │   ├── Mood (se presente)
      │   └── Note (se presente)
      ├── Foto Recenti (se presenti)
      └── Azioni (Bottoni)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteProgress } from '@/components/dashboard/athlete-progress'

function AthleteDashboard({ athleteId }: { athleteId: string }) {
  const progressLogs = useProgressLogs(athleteId)
  const progressPhotos = useProgressPhotos(athleteId)

  return (
    <AthleteProgress
      athleteId={athleteId}
      athleteName="Mario Rossi"
      progressLogs={progressLogs}
      progressPhotos={progressPhotos}
      onViewFullProgress={(id) => router.push(`/progressi/${id}`)}
    />
  )
}
```

## 🔍 Note Tecniche

### Calcolo Variazione Peso

```typescript
const getWeightChange = (current: number, previous?: number) => {
  if (!previous) return null
  const change = current - previous
  return {
    value: Math.abs(change),
    isPositive: change < 0, // Perdita di peso è positiva
    percentage: ((change / previous) * 100).toFixed(1),
  }
}
```

### Limitazioni

- Dati devono essere forniti come props (non fetch interno)
- Grafici non implementati (TODO)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
