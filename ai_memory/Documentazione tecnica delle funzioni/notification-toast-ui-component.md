# Componente: NotificationToast (UI Base)

## 📋 Descrizione

Componente toast per notifiche con animazioni Framer Motion. Supporta 4 tipi (success, error, warning, info), animazioni slide, azioni opzionali, sidebar notifiche e integrazione con useNotifications hook. Utilizzato per notifiche sistema, feedback utente e comunicazioni.

## 📁 Percorso File

`src/components/shared/ui/notification-toast.tsx`

## 🔧 Props

### NotificationToast Props

Nessuna prop (usa hook useNotifications)

### NotificationSidebar Props

```typescript
{
  isOpen: boolean
  onClose: () => void
}
```

## 📦 Dipendenze

### React

- `React` da `react`
- `motion`, `AnimatePresence` da `framer-motion`
- `X`, `CheckCircle`, `AlertCircle`, `Info`, `AlertTriangle` da `lucide-react`

### Hooks

- `useNotifications`, `NotificationPayload`, `Notification` da `@/lib/notifications`

## ⚙️ Funzionalità

### Core

1. **4 Tipi**: success, error, warning, info
2. **Framer Motion**: Animazioni slide in/out
3. **Auto-remove**: Rimozione automatica notifiche
4. **Actions**: Azioni opzionali su notifiche
5. **Sidebar**: Sidebar per lista notifiche
6. **Client-only**: Rendering solo lato client

### Funzionalità Avanzate

- **AnimatePresence**: Gestione animazioni entrata/uscita
- **Notification Icons**: Icone diverse per ogni tipo
- **Action Buttons**: Bottoni azione opzionali
- **Sidebar View**: Vista sidebar con lista completa
- **Clear All**: Pulsante cancella tutte le notifiche
- **SSR Safe**: Rendering sicuro per SSR

### UI/UX

- Toast posizionato top-right
- Animazioni smooth
- Icone per tipo
- Titolo e messaggio
- Azioni opzionali
- Close button
- Sidebar per lista completa

## 🎨 Struttura UI

```
NotificationToast (fixed top-right)
  └── NotificationItem[] (per ogni notifica)
      ├── Icon (tipo-specifico)
      ├── Content
      │   ├── Title
      │   ├── Message (opzionale)
      │   └── Action Button (opzionale)
      └── Close Button

NotificationSidebar (fixed right)
  ├── Header
  │   ├── Title
  │   ├── Clear All Button
  │   └── Close Button
  └── Notifications List
      └── NotificationItem[]
```

## 💡 Esempi d'Uso

```tsx
// NotificationToast (usa hook)
const { addNotification } = useNotifications()

addNotification({
  type: 'success',
  title: 'Successo',
  message: 'Operazione completata'
})

// NotificationSidebar
<NotificationSidebar
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

## 📝 Note Tecniche

- Integrazione con useNotifications hook
- Framer Motion per animazioni (initial, animate, exit)
- 4 tipi con colori e icone diverse
- AnimatePresence per gestione animazioni
- Client-only rendering con useState e useEffect
- Sidebar con slide animation (x: 0 o 320)
- Clear all button per rimuovere tutte le notifiche
- Action buttons opzionali su notifiche
- Position fixed top-right per toast
- Position fixed right per sidebar
- Z-index z-50 per overlay
- Backdrop blur per sidebar
- Layout responsive
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
