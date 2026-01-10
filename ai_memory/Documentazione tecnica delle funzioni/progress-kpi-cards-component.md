# Componente: ProgressKPICards

## 📋 Descrizione

Componente che visualizza le KPI (Key Performance Indicators) dei progressi dell'atleta in una griglia di card. Include peso attuale, variazione 7 giorni, forza massima, completamento schede e streak allenamenti.

## 📁 Percorso File

`src/components/dashboard/progress-kpi-cards.tsx`

## 🔧 Props

```typescript
interface ProgressKPICardsProps {
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
- `TrendingUp`, `TrendingDown`, `Minus`, `Target`, `Zap`, `Calendar` da `lucide-react`

### Types

- `ProgressKPI` da `@/hooks/use-progress-analytics`

## ⚙️ Funzionalità

### Core

1. **5 KPI Cards**: Peso Attuale, Variazione 7gg, Forza Massima, Schede Completate, Streak
2. **Messaggio Motivazionale**: Banner con messaggio motivazionale in base ai dati
3. **Icone e Colori**: Icone e colori dinamici in base ai valori
4. **Loading State**: Skeleton durante il caricamento
5. **Empty State**: Messaggio quando non ci sono dati

### Funzionalità Avanzate

- **Calcolo Variazione**: Mostra variazione peso con icona e colore appropriati
- **Badge Dinamici**: Badge con colori in base alla variazione (success/error/secondary)
- **Messaggio Motivazionale**: Genera messaggi motivazionali in base ai dati
- **Formattazione Valori**: Formatta i valori in modo leggibile (kg, %, giorni)

### UI/UX

- Grid responsive (1 colonna mobile, 2 tablet, 5 desktop)
- Card con stile trainer e bordo teal
- Icone colorate per ogni KPI
- Badge per variazioni
- Banner motivazionale in alto
- Layout responsive

## 🎨 Struttura UI

```
Container
  ├── Banner Motivazionale (se data presente)
  │   └── Messaggio dinamico
  └── Grid KPI Cards
      ├── Se loading
      │   └── Skeleton[] (5 cards)
      ├── Se !data
      │   └── Empty State
      └── Se data presente
          ├── Card: Peso Attuale
          │   ├── Icon Target
          │   ├── Valore: pesoAttuale kg
          │   └── Variazione 7gg con icona
          ├── Card: Variazione 7gg
          │   ├── Icon TrendingUp
          │   ├── Valore: variazionePeso7gg kg
          │   └── Badge dinamico
          ├── Card: Forza Massima
          │   ├── Icon Zap
          │   ├── Valore: forzaMassima kg
          │   └── Messaggio
          ├── Card: Schede Completate
          │   ├── Icon Target
          │   ├── Valore: percentualeCompletamento %
          │   └── "Ultimi 30gg"
          └── Card: Streak Allenamenti
              ├── Icon Calendar
              ├── Valore: streak giorni
              └── Messaggio motivazionale
```

## 💡 Esempi d'Uso

```tsx
<ProgressKPICards data={progressData} loading={isLoading} />
```

## 📝 Note Tecniche

- Utilizza `ProgressKPI` type da `use-progress-analytics` hook
- Funzioni helper per calcolare icone, colori e testi delle variazioni
- Messaggio motivazionale generato dinamicamente in base ai dati
- Grid layout responsive con Tailwind CSS
- Gestione stati loading e empty
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
