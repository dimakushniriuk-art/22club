# Componente: PTNotificationsTab

## 📋 Descrizione

Componente tab per la gestione delle notifiche del Personal Trainer. Permette di visualizzare, filtrare, cercare e gestire tutte le notifiche ricevute, con supporto per marcare come lette/non lette e eliminare.

## 📁 Percorso File

`src/components/profile/pt-notifications-tab.tsx`

## 🔧 Props

```typescript
interface PTNotificationsTabProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
}

interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  link: string
  type: string
  sent_at: string
  read_at: string | null
  action_text: string
  is_push_sent: boolean
  created_at: string
  priority: 'high' | 'medium' | 'low'
  category: string
}
```

### Dettaglio Props

- **`notifications`** (Notification[], required): Array delle notifiche da visualizzare
- **`onMarkAsRead`** (function, required): Callback chiamato quando si marca una notifica come letta
- **`onMarkAllAsRead`** (function, required): Callback chiamato quando si marcano tutte le notifiche come lette
- **`onDelete`** (function, required): Callback chiamato quando si elimina una notifica

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Button` da `@/components/ui`
- `Input` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Select` da `@/components/ui`
- `Bell`, `Search`, `Check`, `CheckCheck`, `ArrowRight`, `Clock`, `CheckCircle`, `MoreVertical`, `Users`, `CreditCard`, `Calendar` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Notifiche**: Mostra lista di notifiche con dettagli completi
2. **Filtri**: Filtra per tipo (tutte/non lette/lette) e categoria
3. **Ricerca**: Cerca nelle notifiche per titolo e corpo
4. **Gestione Stato**: Marca singole o tutte le notifiche come lette
5. **Eliminazione**: Elimina notifiche individuali
6. **Navigazione**: Link alle azioni associate alle notifiche

### Funzionalità Avanzate

- **Contatore Non Lette**: Mostra il numero di notifiche non lette
- **Icone Categoria**: Icone diverse per categoria (client, payment, appointment)
- **Badge Priorità**: Badge colorati per priorità (high/medium/low)
- **Formattazione Date**: Date formattate in modo user-friendly (Adesso, X min fa, X ore fa, etc.)
- **Empty State**: Messaggio quando non ci sono notifiche
- **Ring Highlight**: Notifiche non lette evidenziate con ring teal

### UI/UX

- Header con contatore notifiche non lette
- Pulsante "Segna tutte come lette" (solo se ci sono non lette)
- Filtri e ricerca in card separata
- Lista notifiche con card individuali
- Badge per stato (Nuova) e priorità
- Pulsanti azione per ogni notifica
- Layout responsive

## 🎨 Struttura UI

```
Container (space-y-6)
  ├── Header Card
  │   ├── Icon + Titolo
  │   ├── Contatore non lette
  │   └── Button "Segna tutte come lette"
  ├── Filtri Card
  │   ├── Input Ricerca (con icona Search)
  │   └── Select Filtri (tipo e categoria)
  └── Lista Notifiche
      ├── Se empty
      │   └── Empty State
      └── Se presenti
          └── Card[] (per ogni notifica)
              ├── Icona Categoria
              ├── Contenuto
              │   ├── Titolo + Badge (Nuova, Priorità)
              │   ├── Corpo
              │   └── Metadati (data, tipo, stato lettura)
              └── Azioni
                  ├── Button Azione (link)
                  ├── Button Segna letta (se non letta)
                  └── Button Elimina
```

## 💡 Esempi d'Uso

```tsx
<PTNotificationsTab
  notifications={notifications}
  onMarkAsRead={handleMarkAsRead}
  onMarkAllAsRead={handleMarkAllAsRead}
  onDelete={handleDelete}
/>
```

## 📝 Note Tecniche

- Componente estratto da `profilo/page.tsx` per migliorare manutenibilità (FASE C - Split File Lunghi)
- Utilizza `useMemo` per ottimizzare filtri e calcoli
- Filtri combinati: ricerca + tipo + categoria
- Formattazione date personalizzata con logica relativa
- Icone categoria dinamiche in base al tipo
- Colori priorità dinamici (red/yellow/blue)
- Navigazione tramite `window.location.href` per i link
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
