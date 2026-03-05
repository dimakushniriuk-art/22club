# Componente: NotificationsSection (Athlete)

## 📋 Descrizione

Componente per visualizzare le notifiche recenti dell'atleta. Mostra fino a 3 notifiche con icone colorate per tipo, stato letto/non letto e gestione click.

## 📁 Percorso File

`src/components/athlete/notifications-section.tsx`

## 🔧 Props

```typescript
interface NotificationsSectionProps {
  notifications?: Notification[]
  loading?: boolean
  onViewAll?: () => void
  onMarkAsRead?: (id: string) => void
}

interface Notification {
  id: string
  type: 'workout' | 'document' | 'appointment' | 'payment'
  title: string
  message: string
  timestamp: string
  isRead: boolean
}
```

### Dettaglio Props

- **`notifications`** (array, optional): Array di notifiche da visualizzare
- **`loading`** (boolean, optional, default: false): Mostra stato di caricamento
- **`onViewAll`** (function, optional): Callback chiamato quando si clicca "Tutte le notifiche"
- **`onMarkAsRead`** (function, optional): Callback chiamato quando si clicca su una notifica

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Notifiche**: Mostra fino a 3 notifiche recenti
2. **Icone Tipo**: Icone diverse per tipo notifica (workout, document, appointment, payment)
3. **Stato Letto/Non Letto**: Distingue visivamente notifiche lette e non lette
4. **Mark as Read**: Permette di segnare notifiche come lette al click

### Funzionalità Avanzate

- **Colori Semantici**: Colori diversi per tipo notifica
- **Indicatore Non Letto**: Punto colorato per notifiche non lette
- **Click Handler**: Click su notifica la segna come letta

### Stati

- **Loading**: Skeleton durante caricamento
- **Empty**: Messaggio quando non ci sono notifiche
- **With Data**: Lista notifiche con icone e stati

### UI/UX

- Card con gradiente e backdrop blur
- Icone emoji per tipo notifica
- Background diverso per notifiche lette/non lette
- Hover effect su notifiche
- Empty state con icona e messaggio

## 🎨 Struttura UI

```
Card
  ├── CardHeader
  │   ├── CardTitle "Notifiche recenti"
  │   └── Button "Tutte le notifiche" (se onViewAll)
  └── CardContent
      ├── Empty State (se nessuna notifica)
      │   ├── Icona 🔔
      │   └── Messaggio
      └── Lista Notifiche (max 3)
          └── div (per ogni notifica)
              ├── Icona tipo (emoji)
              └── Contenuto
                  ├── Titolo + Indicatore non letto
                  ├── Messaggio
                  └── Timestamp
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { NotificationsSection } from '@/components/athlete/notifications-section'

function MyComponent() {
  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id)
  }

  return (
    <NotificationsSection
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onViewAll={() => router.push('/home/notifiche')}
    />
  )
}
```

## 🔍 Note Tecniche

### Icone Tipo

- **workout**: 💪 (text-brand)
- **document**: 📄 (text-state-warn)
- **appointment**: 📅 (text-state-info)
- **payment**: 💰 (text-state-valid)
- **default**: 🔔 (text-text-primary)

### Stato Letto/Non Letto

- **Letta**: Background terziario/50, testo secondario
- **Non Letta**: Background terziario/70 con bordo teal, testo primario, punto indicatore

### Limitazioni

- Mostra solo prime 3 notifiche
- Non gestisce azioni specifiche per tipo notifica
- Timestamp non formattato (mostrato come stringa)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
