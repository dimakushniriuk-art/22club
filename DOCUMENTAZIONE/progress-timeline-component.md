# Componente: ProgressTimeline

## 📋 Descrizione

Componente che visualizza una timeline dei progressi dell'atleta, mostrando gli ultimi progressi registrati con peso, forza e note. Include stati di loading e empty state.

## 📁 Percorso File

`src/components/dashboard/progress-timeline.tsx`

## 🔧 Props

```typescript
interface ProgressTimelineProps {
  data: ProgressKPI | undefined
  loading: boolean
}
```

### Dettaglio Props

- **`data`** (ProgressKPI | undefined, required): Dati dei progressi dell'atleta
- **`loading`** (boolean, required): Stato di caricamento

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Skeleton` da `@/components/ui`
- `Calendar`, `Weight`, `Zap`, `MessageSquare` da `lucide-react`

### Types

- `ProgressKPI` da `@/hooks/use-progress-analytics`

## ⚙️ Funzionalità

### Core

1. **Timeline Visuale**: Mostra i progressi in ordine cronologico
2. **Formattazione Date**: Formatta le date in modo user-friendly (Oggi, Ieri, X giorni fa)
3. **Dati Progressi**: Mostra peso, forza (panca, squat, stacco) e note
4. **Loading State**: Mostra skeleton durante il caricamento
5. **Empty State**: Mostra messaggio quando non ci sono progressi

### Funzionalità Avanzate

- **Badge "Ultimo"**: Evidenzia il progresso più recente
- **Icone Condizionali**: Icone diverse per peso, forza e note
- **Formattazione Forza**: Mostra i valori di forza in formato leggibile
- **Timeline Dots**: Dots visivi per la timeline con stili diversi per il primo elemento

### UI/UX

- Card con stile trainer e bordo teal
- Timeline con dots e linee
- Badge per il progresso più recente
- Icone per ogni tipo di dato
- Layout responsive

## 🎨 Struttura UI

```
Card (trainer variant)
  ├── CardHeader
  │   └── CardTitle: "Timeline Progressi" + Icon Calendar
  └── CardContent
      ├── Se loading
      │   └── Skeleton[] (5 items)
      ├── Se !data || data.ultimiProgressi.length === 0
      │   └── Empty State
      └── Se data presente
          └── Timeline Items[]
              ├── Timeline Dot (con icona o punto)
              └── Content
                  ├── Data + Badge "Ultimo" (se index === 0)
                  ├── Peso (se presente)
                  ├── Forza (se presente)
                  └── Note (se presente)
```

## 💡 Esempi d'Uso

```tsx
<ProgressTimeline data={progressData} loading={isLoading} />
```

## 📝 Note Tecniche

- Utilizza `ProgressKPI` type da `use-progress-analytics` hook
- Formattazione date personalizzata con logica "Oggi", "Ieri", "X giorni fa"
- Gestione condizionale dei dati (mostra solo se presenti)
- Stili con tema teal-cyan consistente
- Skeleton loading state per migliorare UX
- Empty state con messaggio motivazionale

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
