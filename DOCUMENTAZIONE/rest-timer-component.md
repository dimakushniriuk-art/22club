# Componente: RestTimer

## 📋 Descrizione

Componente timer per il recupero tra esercizi durante un workout. Include countdown visuale con cerchio animato, controlli play/pause/reset, input per secondi personalizzati e feedback di completamento.

## 📁 Percorso File

`src/components/workout/rest-timer.tsx`

## 🔧 Props

```typescript
interface RestTimerProps {
  initialSeconds?: number
  onComplete?: () => void
  onNextExercise?: () => void
  className?: string
}
```

### Dettaglio Props

- **`initialSeconds`** (number, optional): Secondi iniziali del timer (default: 60)
- **`onComplete`** (function, optional): Callback chiamato quando il timer raggiunge 0
- **`onNextExercise`** (function, optional): Callback chiamato quando si clicca "Prossimo esercizio"
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### React

- `useState`, `useEffect`, `useRef` da `react`

### UI Components

- `Button` da `@/components/ui`
- `Card`, `CardContent` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Input` da `@/components/ui`

## ⚙️ Funzionalità

### Core

1. **Countdown Timer**: Timer countdown con secondi personalizzabili
2. **Cerchio Animato**: Progress bar circolare animata
3. **Controlli**: Play, pause, reset
4. **Formattazione Tempo**: Formato MM:SS
5. **Completamento**: Feedback quando timer raggiunge 0
6. **Vibrazione**: Vibrazione opzionale al completamento

### Funzionalità Avanzate

- **Progress Circle**: Cerchio SVG con animazione progress
- **Custom Seconds**: Input per personalizzare secondi (10-600)
- **Vibration API**: Vibrazione al completamento se supportata
- **Auto-cleanup**: Cleanup interval al unmount
- **State Management**: Gestione stati running/completed
- **Next Exercise**: Pulsante per passare al prossimo esercizio

### UI/UX

- Card centrata con max-width
- Cerchio SVG animato con progress
- Tempo formattato al centro
- Input per secondi personalizzati
- Pulsanti play/pause/reset
- Badge success al completamento
- Suggerimenti durante pausa
- Layout responsive

## 🎨 Struttura UI

```
Card (max-w-md)
  └── CardContent
      └── Container (space-y-6 text-center)
          ├── Titolo + Descrizione
          ├── Cerchio Animato (h-32 w-32)
          │   ├── SVG Circle (background)
          │   ├── SVG Circle (progress, animato)
          │   └── Tempo (centro, MM:SS)
          ├── Se !isCompleted
          │   ├── Input Secondi (10-600)
          │   ├── Pulsanti
          │   │   ├── Avvia/Riavvia (se !isRunning)
          │   │   └── Pausa (se isRunning)
          │   └── Reset
          │   └── Suggerimenti (se !isRunning)
          └── Se isCompleted
              ├── Badge Success
              ├── Button "Prossimo esercizio" (se onNextExercise)
              └── Button "Nuovo timer"
```

## 💡 Esempi d'Uso

```tsx
<RestTimer
  initialSeconds={90}
  onComplete={() => console.log('Timer completato')}
  onNextExercise={() => goToNextExercise()}
/>
```

## 📝 Note Tecniche

- Utilizza `useRef` per gestire interval
- Cleanup automatico interval al unmount
- Calcolo progress per animazione cerchio
- Formattazione tempo con `padStart`
- Vibrazione tramite `navigator.vibrate` (se supportata)
- SVG circle con `strokeDasharray` e `strokeDashoffset` per animazione
- Transizioni CSS per smooth animation
- Input validazione: min 10, max 600 secondi
- Stili con tema brand/valid consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
