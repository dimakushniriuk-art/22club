# Componente: ProgressFlash

## 📋 Descrizione

Componente per visualizzare i progressi del peso in modo flash/animato. Include animazioni, grafico storico simulato, statistiche e dialog per aggiornare il peso con picker scrollabile.

## 📁 Percorso File

`src/components/athlete/progress-flash.tsx`

## 🔧 Props

```typescript
interface ProgressFlashProps {
  progress?: ProgressData
  loading?: boolean
  onWeightUpdate?: (weight: number) => void
}

interface ProgressData {
  type: 'weight' | 'workouts' | 'strength'
  current: number
  previous: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  period: string
}
```

### Dettaglio Props

- **`progress`** (ProgressData, optional): Dati del progresso (peso, allenamenti, forza)
- **`loading`** (boolean, optional, default: false): Mostra stato di caricamento
- **`onWeightUpdate`** (function, optional): Callback chiamato quando il peso viene aggiornato

## 📦 Dipendenze

### React Hooks

- `useState`, `useRef`, `useEffect` da `react`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Button` da `@/components/ui`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` da `@/components/ui/dialog`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Peso Animato**: Mostra peso corrente con animazione da valore precedente
2. **Statistiche**: Calcola e mostra kg persi, percentuale obiettivo, kg/settimana
3. **Grafico Storico**: Genera e mostra grafico simulato degli ultimi 5 mesi
4. **Dialog Aggiornamento**: Permette di aggiornare peso con picker scrollabile (40-150 kg, step 0.1)
5. **Obiettivo Peso**: Permette di impostare e tracciare progresso verso obiettivo

### Funzionalità Avanzate

- **Animazione Contatore**: Animazione fluida del peso da valore precedente a corrente
- **Animazione Grafico**: Curva SVG animata con gradiente colorato
- **Picker Scrollabile**: Lista scrollabile con snap e scroll automatico al valore corrente
- **Calcolo Progresso**: Calcola progresso percentuale verso obiettivo
- **Generazione Storico**: Simula dati storici 5 mesi con curva di perdita peso

### Stati

- **Loading**: Skeleton durante caricamento
- **Empty**: Messaggio quando non ci sono dati
- **With Data**: Visualizzazione completa con animazioni

### UI/UX

- Card con gradiente e backdrop blur
- Peso grande e animato con gradiente text
- Statistiche in griglia 3 colonne
- Grafico SVG con curva animata
- Dialog con picker scrollabile e progress bar

## 🎨 Struttura UI

```
Card
  └── CardContent
      ├── Peso Animato (text-4xl/5xl con gradiente)
      ├── Statistiche (grid 3 colonne)
      │   ├── kg persi
      │   ├── % obiettivo
      │   └── kg/settimana
      └── Grafico 5 mesi (se type === 'weight')
          ├── SVG con curva animata
          ├── Punto iniziale
          └── Punto finale con glow

Dialog (quando aperto)
  ├── Statistiche rapide (precedente, attuale, obiettivo)
  ├── Picker scrollabile peso (40-150 kg, step 0.1)
  ├── Input obiettivo peso
  ├── Progress bar verso obiettivo
  └── Pulsanti (Annulla, Salva)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ProgressFlash } from '@/components/athlete/progress-flash'

function MyComponent() {
  const handleWeightUpdate = (weight: number) => {
    // Salva nuovo peso
    updateWeight(weight)
  }

  return (
    <ProgressFlash
      progress={{
        type: 'weight',
        current: 76.5,
        previous: 80,
        unit: 'kg',
        trend: 'down',
        period: 'ultimo mese',
      }}
      onWeightUpdate={handleWeightUpdate}
    />
  )
}
```

## 🔍 Note Tecniche

### Animazione Peso

- Utilizza `setInterval` per animare il contatore
- 60 step in 1500ms
- Calcola incremento: `(endWeight - startWeight) / steps`

### Generazione Storico

- Simula 150 giorni (5 mesi)
- Usa curva di perdita peso: `1 - (1 - progress)²` (più veloce all'inizio)
- Genera dati con date retroattive

### Picker Scrollabile

- Array di 1101 valori (40-150 kg, step 0.1)
- Scroll automatico al valore corrente all'apertura
- Snap center per selezione precisa
- Gradiente superiore/inferiore per effetto fade

### Calcolo Statistiche

- **kg persi**: `previous - current`
- **% obiettivo**: `(totalLost / previous) * 100`
- **kg/settimana**: `totalLost / weeks` (150 giorni / 7)

### Limitazioni

- Il grafico storico è simulato (non usa dati reali)
- Il picker supporta solo peso (non altri tipi di progresso)
- L'obiettivo peso è salvato solo localmente (non persistito)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
