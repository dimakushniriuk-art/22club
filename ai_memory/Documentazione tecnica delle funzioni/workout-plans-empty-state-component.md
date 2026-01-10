# Componente: WorkoutPlansEmptyState

## 📋 Descrizione

Componente che mostra lo stato vuoto quando non ci sono schede di allenamento disponibili. Mostra messaggi diversi in base alla presenza di filtri attivi e include un pulsante per creare la prima scheda.

## 📁 Percorso File

`src/components/workout-plans/workout-plans-empty-state.tsx`

## 🔧 Props

```typescript
interface WorkoutPlansEmptyStateProps {
  searchTerm: string
  statusFilter: string
}
```

### Dettaglio Props

- **`searchTerm`** (string, required): Termine di ricerca attivo (per determinare il messaggio)
- **`statusFilter`** (string, required): Filtro stato attivo (per determinare il messaggio)

## 📦 Dipendenze

### UI Components

- `Button` da `@/components/ui`
- `Target`, `Plus` da `lucide-react`

### Hooks

- `useRouter` da `next/navigation`

## ⚙️ Funzionalità

### Core

1. **Messaggio Dinamico**: Mostra messaggi diversi in base alla presenza di filtri
2. **Icona Visuale**: Icona Target con stile teal-cyan
3. **Pulsante CTA**: Bottone per creare la prima scheda (solo se non ci sono filtri)

### Funzionalità Avanzate

- **Logica Condizionale**: Mostra messaggi diversi se ci sono filtri attivi
- **Navigazione**: Naviga a `/dashboard/schede/nuova` quando si clicca sul pulsante
- **Stili Gradiente**: Titolo con gradiente teal-cyan

### UI/UX

- Icona grande con background teal
- Titolo con gradiente text
- Messaggio descrittivo
- Pulsante CTA solo se non ci sono filtri attivi
- Layout centrato e responsive

## 🎨 Struttura UI

```
Container (relative py-16 text-center)
  ├── Icon Container
  │   └── Target Icon (bg-teal-500/20)
  ├── Titolo (gradient text)
  │   └── "Nessuna scheda trovata" o "Nessuna scheda creata"
  ├── Messaggio
  │   └── Testo descrittivo
  └── Button (condizionale, solo se !searchTerm && !statusFilter)
      └── "Crea prima scheda"
```

## 💡 Esempi d'Uso

```tsx
<WorkoutPlansEmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
```

## 📝 Note Tecniche

- Componente estratto da `schede/page.tsx` per migliorare manutenibilità (FASE C - Split File Lunghi)
- Logica condizionale per mostrare messaggi diversi
- Pulsante CTA mostrato solo se non ci sono filtri attivi
- Stili con tema teal-cyan consistente
- Utilizza `useRouter` per la navigazione

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
