# Componente: Slider (UI Base)

## 📋 Descrizione

Componente slider per valori numerici. Supporta min/max/step, valore controllato/non controllato, click su track per impostare valore, thumb animato e accessibilità. Utilizzato per range input, settings e controlli numerici.

## 📁 Percorso File

`src/components/ui/slider.tsx`

## 🔧 Props

```typescript
interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  className?: string
  disabled?: boolean
}
```

### Dettaglio Props

- **`min`** (number, optional): Valore minimo (default: 0)
- **`max`** (number, optional): Valore massimo (default: 100)
- **`step`** (number, optional): Step incremento (default: 1)
- **`value`** (number, optional): Valore controllato
- **`defaultValue`** (number, optional): Valore iniziale non controllato (default: min)
- **`onChange`** (function, optional): Callback per cambio valore
- **`className`** (string, optional): Classi CSS aggiuntive
- **`disabled`** (boolean, optional): Disabilita slider (default: false)

## 📦 Dipendenze

### React

- `React.useState` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Range Input**: Input range HTML nascosto
2. **Custom Track**: Track custom con background
3. **Custom Thumb**: Thumb custom posizionato
4. **Click on Track**: Click su track per impostare valore
5. **Controlled/Uncontrolled**: Supporto per entrambi i pattern
6. **Accessibility**: ARIA attributes

### Funzionalità Avanzate

- **Percentage Calculation**: Calcolo percentuale per posizionamento
- **Click Position**: Calcolo valore da posizione click
- **Step Snapping**: Snap a step più vicino
- **Clamping**: Valore clamped tra min e max
- **Transform Animation**: Transform per posizionamento thumb

### UI/UX

- Track con background-tertiary
- Fill bar con brand color
- Thumb circolare con border
- Hover effects su thumb
- Transizioni smooth
- Layout responsive

## 🎨 Struttura UI

```
Container (relative w-full)
  ├── Input Range (sr-only, hidden)
  └── Custom Track (relative)
      ├── Fill Bar (absolute, width dinamico)
      └── Thumb (absolute, left dinamico)
```

## 💡 Esempi d'Uso

```tsx
// Slider base
<Slider
  min={0}
  max={100}
  value={value}
  onChange={setValue}
/>

// Slider non controllato
<Slider
  defaultValue={50}
  onChange={(value) => console.log(value)}
/>

// Slider con step
<Slider
  min={0}
  max={100}
  step={10}
  value={volume}
  onChange={setVolume}
/>

// Slider disabilitato
<Slider
  value={value}
  disabled
/>
```

## 📝 Note Tecniche

- Input range nascosto con sr-only per accessibilità
- Track custom con background-tertiary
- Fill bar con width basato su percentuale
- Thumb posizionato con left calc basato su percentuale
- Click su track: calcolo valore da posizione click
- Step snapping: Math.round(value / step) \* step
- Clamping: Math.max(min, Math.min(max, value))
- Percentage: ((value - min) / (max - min)) \* 100
- Hover effects: scale-110 su thumb
- Disabled state con opacity-50
- ARIA attributes: aria-valuemin, aria-valuemax, aria-valuenow
- Transizioni smooth
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
