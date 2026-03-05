# Componente: WorkoutPlansFilters

## 📋 Descrizione

Componente che gestisce i filtri per la ricerca e il filtro per stato delle schede di allenamento. Include un campo di ricerca e un selettore per lo stato.

## 📁 Percorso File

`src/components/workout-plans/workout-plans-filters.tsx`

## 🔧 Props

```typescript
interface WorkoutPlansFiltersProps {
  searchTerm: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
}
```

### Dettaglio Props

- **`searchTerm`** (string, required): Valore corrente del campo di ricerca
- **`statusFilter`** (string, required): Valore corrente del filtro stato
- **`onSearchChange`** (function, required): Callback chiamato quando cambia il termine di ricerca
- **`onStatusFilterChange`** (function, required): Callback chiamato quando cambia il filtro stato

## 📦 Dipendenze

### UI Components

- `Input` da `@/components/ui`
- `SimpleSelect` da `@/components/ui/simple-select`
- `Search` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Campo di Ricerca**: Input per cercare per nome scheda, atleta o PT
2. **Filtro Stato**: Select per filtrare per stato (tutti, attive, completate, archiviate)
3. **Gestione Eventi**: Gestisce i cambiamenti e propaga i valori al parent

### Funzionalità Avanzate

- **Icona Ricerca**: Icona Search a sinistra dell'input
- **Layout Responsive**: Layout flessibile che si adatta a mobile e desktop
- **Stili Personalizzati**: Input con stile teal e focus states

### UI/UX

- Input con icona a sinistra
- Select con opzioni predefinite
- Layout responsive (flex-col su mobile, flex-row su desktop)
- Stili con tema teal-cyan

## 🎨 Struttura UI

```
Container (relative p-4)
  └── Flex Container (responsive)
      ├── Input (flex-1)
      │   └── Icon Search
      └── SimpleSelect (w-full md:w-48)
          └── Opzioni:
              - Tutti gli stati
              - Attive
              - Completate
              - Archiviate
```

## 💡 Esempi d'Uso

```tsx
<WorkoutPlansFilters
  searchTerm={searchTerm}
  statusFilter={statusFilter}
  onSearchChange={setSearchTerm}
  onStatusFilterChange={setStatusFilter}
/>
```

## 📝 Note Tecniche

- Componente estratto da `schede/page.tsx` per migliorare manutenibilità (FASE C - Split File Lunghi)
- Utilizza `SimpleSelect` per il filtro stato
- Input con `leftIcon` per l'icona di ricerca
- Stili con tema teal-cyan consistente con il resto dell'app
- Layout responsive con Tailwind CSS

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
