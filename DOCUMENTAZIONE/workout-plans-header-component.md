# Componente: WorkoutPlansHeader

## 📋 Descrizione

Componente header per la pagina delle schede di allenamento. Mostra il titolo, la descrizione e il pulsante per creare una nuova scheda.

## 📁 Percorso File

`src/components/workout-plans/workout-plans-header.tsx`

## 🔧 Props

```typescript
interface WorkoutPlansHeaderProps {
  onNewWorkout?: () => void
}
```

### Dettaglio Props

- **`onNewWorkout`** (function, optional): Callback chiamato quando si clicca su "Nuova Scheda". Se non fornito, naviga a `/dashboard/schede/nuova`

## 📦 Dipendenze

### UI Components

- `Button` da `@/components/ui`
- `Plus` da `lucide-react`

### Hooks

- `useRouter` da `next/navigation`

## ⚙️ Funzionalità

### Core

1. **Titolo e Descrizione**: Mostra il titolo "Schede Allenamento" e la descrizione
2. **Pulsante Nuova Scheda**: Bottone per creare una nuova scheda
3. **Navigazione**: Gestisce la navigazione alla pagina di creazione

### Funzionalità Avanzate

- **Callback Personalizzato**: Supporta callback personalizzato o navigazione di default
- **Layout Responsive**: Layout flessibile che si adatta a mobile e desktop

### UI/UX

- Titolo con font grande e tracking tight
- Descrizione secondaria
- Bottone con gradiente teal-cyan
- Layout responsive (flex-col su mobile, flex-row su desktop)

## 🎨 Struttura UI

```
Container (flex responsive)
  ├── Sezione Titolo
  │   ├── H1: "Schede Allenamento"
  │   └── P: Descrizione
  └── Button: "Nuova Scheda"
      └── Icon Plus
```

## 💡 Esempi d'Uso

```tsx
// Con callback personalizzato
<WorkoutPlansHeader onNewWorkout={() => setShowModal(true)} />

// Con navigazione di default
<WorkoutPlansHeader />
```

## 📝 Note Tecniche

- Componente estratto da `schede/page.tsx` per migliorare manutenibilità (FASE C - Split File Lunghi)
- Se `onNewWorkout` non è fornito, usa `useRouter` per navigare
- Stile del bottone con gradiente teal-cyan e shadow
- Layout responsive con Tailwind CSS

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
