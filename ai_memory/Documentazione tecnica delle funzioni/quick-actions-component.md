# Componente: QuickActions

## 📋 Descrizione

Componente floating per azioni rapide. Mostra bottoni circolari fissi a destra dello schermo per creare rapidamente appuntamenti, schede, pagamenti e documenti. Integrato con ModalContext.

## 📁 Percorso File

`src/components/dashboard/quick-actions.tsx`

## 🔧 Props

```typescript
interface QuickActionsProps {
  onAddAppointment?: () => void
  onAddScheda?: () => void
  onAddPayment?: () => void
  onAddDocument?: () => void
}
```

### Dettaglio Props

- **`onAddAppointment`** (function, optional): Callback aggiungi appuntamento
- **`onAddScheda`** (function, optional): Callback aggiungi scheda
- **`onAddPayment`** (function, optional): Callback aggiungi pagamento
- **`onAddDocument`** (function, optional): Callback aggiungi documento

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Button` da `@/components/ui`

### Hooks

- `useModalActions` da `./modals-wrapper`

## ⚙️ Funzionalità

### Core

1. **Azioni Rapide**: 4 bottoni floating per azioni comuni
2. **Modal Integration**: Integrato con ModalContext per aprire modali
3. **Tooltip**: Tooltip su hover per ogni azione
4. **Fixed Position**: Posizione fissa a destra, centrata verticalmente

### Azioni Disponibili

1. **+Appuntamento** (📅): Crea nuovo appuntamento
2. **+Scheda** (💪): Assegna nuova scheda
3. **+Pagamento** (💰): Registra pagamento
4. **+Documento** (📄): Carica documento atleta

### Funzionalità Avanzate

- **Modal Context Priority**: Usa `useModalActions` se disponibile, altrimenti prop
- **Tooltip Animations**: Tooltip con fade-in su hover
- **Hover Effects**: Scale e shadow enhancement
- **Icon Emoji**: Icone emoji per ogni azione

### UI/UX

- Bottoni circolari grandi (h-14 w-14)
- Posizione fissa a destra, centrata verticalmente
- Spaziatura verticale tra bottoni
- Tooltip a sinistra dei bottoni
- Shadow e hover effects

## 🎨 Struttura UI

```
div (fixed right-6 top-1/2, z-40)
  └── div (space-y-3, per ogni azione)
      └── div (group relative)
          ├── Button (circolare, icon-lg)
          │   └── span (emoji icon)
          └── Tooltip (absolute, right-full)
              └── div (tooltip content)
                  └── Freccia tooltip
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { QuickActions } from '@/components/dashboard/quick-actions'

function DashboardPage() {
  return (
    <>
      <DashboardContent />
      <QuickActions
        onAddAppointment={() => setShowAppointmentModal(true)}
        onAddScheda={() => setShowWorkoutModal(true)}
      />
    </>
  )
}
```

### Esempio con ModalContext

```tsx
// Se ModalsWrapper è presente, QuickActions usa automaticamente il context
<ModalsWrapper>
  <DashboardContent />
  <QuickActions /> {/* Usa automaticamente useModalActions */}
</ModalsWrapper>
```

## 🔍 Note Tecniche

### Modal Context Integration

- Priorità: `useModalActions` > props
- Se context disponibile, usa `openAppointment`, `openWorkout`, `openPayment`, `openDocument`
- Altrimenti usa props `onAddAppointment`, `onAddScheda`, etc.

### Tooltip Positioning

- Posizione: `right-full` (a sinistra del bottone)
- Offset: `mr-3` (margin-right 12px)
- Centrato verticalmente: `top-1/2 -translate-y-1/2`
- Freccia: CSS border trick per freccia triangolare

### Hover Effects

- Scale: `hover:scale-110`
- Shadow: `hover:shadow-[0_0_10px_rgba(2,179,191,0.3)]`
- Transizione: `transition-all duration-200`

### Limitazioni

- Solo 4 azioni predefinite (non configurabili)
- Icone solo emoji (non ReactNode)
- Tooltip solo testo (non HTML)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
