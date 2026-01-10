# Componente: AthleteBackground

## 📋 Descrizione

Componente decorativo per il background delle pagine atleta. Fornisce elementi visivi decorativi (gradienti animati, pattern griglia, cerchi blur) che corrispondono al design system della pagina di login.

## 📁 Percorso File

`src/components/athlete/athlete-background.tsx`

## 🔧 Props

Nessuna prop (componente puro decorativo)

## 📦 Dipendenze

Nessuna dipendenza esterna (componente puro CSS)

## ⚙️ Funzionalità

### Core

1. **Gradiente Animato**: Gradiente di sfondo animato con pulse-glow
2. **Pattern Griglia**: Griglia decorativa con opacità ridotta
3. **Cerchi Decorativi**: 3 cerchi blur animati con delay diversi

### Elementi Decorativi

- **Gradiente Background**: `from-teal-500/10 via-transparent to-cyan-500/10` con animazione pulse-glow
- **Griglia Pattern**: Linee teal con opacità 0.05, dimensione 40x40px
- **Cerchio 1**: Top-left, 72x72, teal-500/20, blur-3xl
- **Cerchio 2**: Bottom-right, 96x96, cyan-500/20, blur-3xl, delay 1s
- **Cerchio 3**: Center, 80x80, gradiente teal-cyan, blur-3xl, delay 2s

### UI/UX

- Elementi posizionati in `absolute` per non interferire con contenuto
- Animazioni pulse per movimento dinamico
- Opacità ridotte per non sovrastare contenuto
- Pattern griglia con pointer-events-none

## 🎨 Struttura UI

```
Fragment
  ├── div (Gradiente animato - absolute inset-0)
  ├── div (Pattern griglia - absolute inset-0)
  ├── div (Cerchio 1 - top-left)
  ├── div (Cerchio 2 - bottom-right, delay 1s)
  └── div (Cerchio 3 - center, delay 2s)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteBackground } from '@/components/athlete/athlete-background'

function AthletePage() {
  return (
    <div className="relative min-h-screen">
      <AthleteBackground />
      {/* Contenuto pagina */}
    </div>
  )
}
```

## 🔍 Note Tecniche

### Design System

- Corrisponde al design system della pagina di login
- Usa stessi colori (teal, cyan) e stile (blur, gradienti)

### Performance

- Elementi decorativi con `pointer-events-none` per non interferire con interazioni
- Animazioni CSS native (performanti)
- Blur effects possono essere costosi su dispositivi meno potenti

### Limitazioni

- Non configurabile (design fisso)
- Non adattivo (stesso design su tutti i dispositivi)
- Non gestisce temi (solo dark mode)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
