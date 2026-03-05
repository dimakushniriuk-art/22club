# Componente: ModalsWrapper

## 📋 Descrizione

Wrapper component che fornisce ModalContext per gestire modali globalmente. Carica lazy i componenti modali pesanti (AppointmentModal, PaymentFormModal, AssignWorkoutModal, DocumentUploaderModal) e fornisce funzioni per aprirli via context.

## 📁 Percorso File

`src/components/dashboard/modals-wrapper.tsx`

## 🔧 Props

```typescript
// Nessuna prop - componente wrapper senza props
```

## 📦 Dipendenze

### React Hooks

- `useState`, `createContext`, `useContext`, `lazy`, `Suspense` da `react`

### Componenti Lazy

- `AppointmentModal` (lazy da `./appointment-modal`)
- `PaymentFormModal` (lazy da `./payment-form-modal`)
- `AssignWorkoutModal` (lazy da `./assign-workout-modal`)
- `DocumentUploaderModal` (lazy da `@/components/documents/document-uploader-modal`)

## ⚙️ Funzionalità

### Core

1. **ModalContext**: Context React per azioni modali globali
2. **Lazy Loading**: Carica modali solo quando necessario
3. **State Management**: Gestisce stato apertura per ogni modale
4. **Auto Refresh**: Refresh pagina dopo successo modali

### Context API

```typescript
interface ModalContextType {
  openAppointment: () => void
  openPayment: () => void
  openWorkout: () => void
  openDocument: () => void
  isAvailable: boolean
}
```

### Funzionalità Avanzate

- **Lazy Loading**: Modali caricate solo quando aperte (code splitting)
- **Suspense Boundaries**: Fallback null per modali lazy
- **Auto Refresh**: `window.location.reload()` dopo successo
- **Default Context**: Context con funzioni no-op se non disponibile
- **isAvailable Flag**: Flag per verificare se context è disponibile

### Modali Gestite

1. **AppointmentModal**: Creazione appuntamento
2. **PaymentFormModal**: Creazione pagamento
3. **AssignWorkoutModal**: Assegnazione workout
4. **DocumentUploaderModal**: Upload documento

### UI/UX

- Componente invisibile (solo context provider)
- Modali renderizzate solo quando aperte
- Refresh automatico dopo successo

## 🎨 Struttura UI

```
ModalContext.Provider
  └── Suspense (per ogni modale)
      └── Modal Component (lazy)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ModalsWrapper, useModalActions } from '@/components/dashboard/modals-wrapper'

function DashboardLayout({ children }) {
  return <ModalsWrapper>{children}</ModalsWrapper>
}

// In un componente child
function QuickActions() {
  const { openAppointment } = useModalActions()

  return <Button onClick={openAppointment}>Nuovo Appuntamento</Button>
}
```

### Esempio con Verifica Disponibilità

```tsx
function MyComponent() {
  const { openPayment, isAvailable } = useModalActions()

  if (!isAvailable) {
    // Fallback se context non disponibile
    return <Button onClick={() => router.push('/dashboard/pagamenti')}>Pagamento</Button>
  }

  return <Button onClick={openPayment}>Nuovo Pagamento</Button>
}
```

## 🔍 Note Tecniche

### Lazy Loading

- Modali importate con `lazy()` per code splitting
- Riduce bundle size iniziale
- Caricate solo quando necessario

### Context Default

- Default context con funzioni no-op e `isAvailable: false`
- Previene errori se context non disponibile
- Console.warn per debug

### Auto Refresh

- `window.location.reload()` dopo successo modali
- Potrebbe essere sostituito con refresh più granulare (router.refresh())

### Limitazioni

- Solo 4 modali gestite (non estendibile facilmente)
- Refresh full page (non ottimale per UX)
- Modali devono supportare props `open`, `onOpenChange`, `onSuccess`

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
