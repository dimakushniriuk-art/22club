# Componente: Progress (UI Base)

## 📋 Descrizione

Componente progress bar per indicare progresso operazioni. Supporta 4 varianti, 3 dimensioni, valore personalizzabile e max value. Utilizzato per upload, download, completamento task e indicatori di progresso.

## 📁 Percorso File

`src/components/ui/progress.tsx`

## 🔧 Props

```typescript
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}
```

### Dettaglio Props

- **`value`** (number, optional): Valore progresso (default: 0)
- **`max`** (number, optional): Valore massimo (default: 100)
- **`variant`** (string, optional): Variante colore (default: 'default')
- **`size`** ('sm' | 'md' | 'lg', optional): Dimensione barra (default: 'md')
- **`className`** (string, optional): Classi CSS aggiuntive
- **`...props`**: Tutte le props HTML standard per div

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Progress Bar**: Barra progresso con valore percentuale
2. **4 Varianti**: default, success, warning, error
3. **3 Dimensioni**: sm, md, lg
4. **Value/Max**: Valore e max personalizzabili
5. **Percentage Calculation**: Calcolo automatico percentuale

### Funzionalità Avanzate

- **Gradient Fill**: Fill con gradient per ogni variante
- **Smooth Transitions**: Transizioni smooth per animazione
- **Transform Animation**: Transform translateX per animazione
- **Clamping**: Valore clamped tra 0 e 100%

### UI/UX

- Container con border e background gradient
- Fill bar con gradient colorato
- Transizioni smooth
- Dimensioni multiple
- Layout responsive

## 🎨 Struttura UI

```
Container (relative overflow-hidden rounded-full border)
  └── Fill Bar (absolute, gradient, transition)
      └── Transform translateX per percentuale
```

## 💡 Esempi d'Uso

```tsx
// Progress base
<Progress value={50} />

// Progress con variante
<Progress value={75} variant="success" />

// Progress con dimensione
<Progress value={30} size="lg" />

// Progress con max personalizzato
<Progress value={3} max={10} />

// Progress upload
<Progress value={uploadProgress} variant="default" />
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- Calcolo percentuale: `(value / max) * 100`
- Clamping: `Math.min(Math.max(percentage, 0), 100)`
- 4 varianti con gradient: default (teal-cyan), success (green), warning (yellow), error (red)
- Dimensioni: sm (h-2), md (h-3), lg (h-4)
- Container: background gradient teal-cyan, border teal-700/50
- Fill bar: gradient con transition-all duration-300
- Transform: `translateX(-${100 - percentage}%)` per animazione
- Transizioni smooth per animazione
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
