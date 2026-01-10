# Componente: MessageList

## 📋 Descrizione

Componente lista messaggi per la chat. Visualizza messaggi di testo e file con layout differenziato per messaggi propri/altrui, stati lettura, auto-scroll e supporto per caricamento messaggi precedenti.

## 📁 Percorso File

`src/components/chat/message-list.tsx`

## 🔧 Props

```typescript
interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  className?: string
}

interface ChatMessage {
  id: string
  sender_id: string
  message: string
  type: 'text' | 'file'
  file_url?: string
  file_name?: string
  file_size?: number
  created_at: string
  read_at: string | null
}
```

### Dettaglio Props

- **`messages`** (ChatMessage[], required): Array dei messaggi da visualizzare
- **`currentUserId`** (string, required): ID utente corrente per distinguere messaggi propri
- **`isLoading`** (boolean, optional): Stato di caricamento messaggi precedenti
- **`onLoadMore`** (function, optional): Callback per caricare messaggi precedenti
- **`hasMore`** (boolean, optional): Indica se ci sono più messaggi da caricare
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### React

- `useEffect`, `useRef` da `react`

### UI Components

- `Button` da `@/components/ui/button`
- `Download`, `Eye`, `Check`, `CheckCheck`, `MessageCircle` da `lucide-react`

### Utilities

- `cn` da `@/lib/utils`
- `useIcon` da `@/components/ui/professional-icons`

### Types

- `ChatMessage` da `@/types/chat`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Messaggi**: Mostra messaggi di testo e file
2. **Layout Differenziato**: Layout diverso per messaggi propri/altrui
3. **Stati Lettura**: Icone Check/CheckCheck per messaggi letti/non letti
4. **Auto-scroll**: Scroll automatico all'ultimo messaggio
5. **File Actions**: Visualizza e scarica file
6. **Load More**: Caricamento messaggi precedenti

### Funzionalità Avanzate

- **Bubble Style**: Stili bubble chat con bordi arrotondati differenziati
- **File Icons**: Icone diverse per tipo file (immagine, PDF, altro)
- **File Download**: Download file tramite link temporaneo
- **File Preview**: Apertura file in nuova tab
- **Formattazione Tempo**: Formattazione orario (HH:mm)
- **Empty State**: Messaggio quando non ci sono messaggi

### UI/UX

- Layout flex con messaggi allineati a destra/sinistra
- Bubble con gradient per messaggi propri
- Bubble con background per messaggi altrui
- Icone lettura per messaggi propri
- Pulsanti azione per file
- Auto-scroll smooth al nuovo messaggio
- Load more button in alto
- Layout responsive

## 🎨 Struttura UI

```
Container (flex flex-col h-full)
  ├── Load More Button (se hasMore)
  │   └── Button "Carica messaggi precedenti"
  └── Messages Area (flex-1 overflow-y-auto)
      ├── Se empty
      │   └── Empty State
      │       ├── Icon MessageCircle
      │       ├── Titolo
      │       └── Messaggio
      └── Se presenti
          ├── Ref Start
          ├── Message[] (per ogni messaggio)
          │   ├── Se type === 'text'
          │   │   └── Bubble Text
          │   │       ├── Messaggio (whitespace-pre-wrap)
          │   │       └── Footer (tempo + icon lettura)
          │   ├── Se type === 'file'
          │   │   └── Bubble File
          │   │       ├── Icon File
          │   │       ├── Nome + Dimensione
          │   │       ├── Buttons (Visualizza, Scarica)
          │   │       └── Footer (tempo + icon lettura)
          │   └── Se altro
          │       └── Bubble System
          └── Ref End
```

## 💡 Esempi d'Uso

```tsx
<MessageList
  messages={messages}
  currentUserId={userId}
  isLoading={isLoadingMore}
  onLoadMore={handleLoadMore}
  hasMore={hasMoreMessages}
/>
```

## 📝 Note Tecniche

- Utilizza `useRef` per refs scroll (messagesEndRef, messagesStartRef)
- Auto-scroll con `scrollIntoView({ behavior: 'smooth' })` su nuovo messaggio
- Distinzione messaggi propri/altrui con `isOwn = message.sender_id === currentUserId`
- Formattazione tempo con `toLocaleTimeString`
- Icone file dinamiche in base all'estensione
- Download file tramite creazione link temporaneo
- Preview file con `window.open` in nuova tab
- Stili bubble con bordi arrotondati differenziati (rounded-tl/tr/bl/br)
- Gradient per messaggi propri (teal-cyan)
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
