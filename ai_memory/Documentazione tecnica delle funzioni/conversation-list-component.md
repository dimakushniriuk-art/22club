# Componente: ConversationList

## 📋 Descrizione

Componente lista conversazioni per la chat. Mostra tutte le conversazioni disponibili con ricerca, filtri e informazioni su ultimo messaggio. Supporta selezione conversazione e visualizzazione contatore messaggi non letti.

## 📁 Percorso File

`src/components/chat/conversation-list.tsx`

## 🔧 Props

```typescript
interface ConversationListProps {
  conversations: ConversationParticipant[]
  currentConversationId?: string
  onSelectConversation: (userId: string) => void
  className?: string
}

interface ConversationParticipant {
  other_user_id: string
  other_user_name: string
  other_user_role: string
  last_message_at: string
  unread_count: number
}
```

### Dettaglio Props

- **`conversations`** (ConversationParticipant[], required): Array delle conversazioni disponibili
- **`currentConversationId`** (string, optional): ID della conversazione attualmente selezionata
- **`onSelectConversation`** (function, required): Callback chiamato quando si seleziona una conversazione
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### UI Components

- `Card` da `@/components/ui/card`
- `Badge` da `@/components/ui/badge`
- `User`, `MessageCircle`, `Clock` da `lucide-react`

### Utilities

- `cn` da `@/lib/utils`

### Types

- `ConversationParticipant` da `@/types/chat`

## ⚙️ Funzionalità

### Core

1. **Lista Conversazioni**: Visualizza tutte le conversazioni disponibili
2. **Ricerca**: Campo di ricerca per filtrare conversazioni per nome
3. **Selezione**: Click su conversazione per selezionarla
4. **Highlight**: Evidenzia conversazione attualmente selezionata
5. **Contatore Non Lette**: Badge con numero messaggi non letti
6. **Formattazione Tempo**: Formatta data ultimo messaggio (Xm, HH:mm, Ieri, DD/MM)

### Funzionalità Avanzate

- **Icone Ruolo**: Icone emoji diverse per ruolo (atleta 🏃‍♂️, pt 💪, admin 👑)
- **Empty State**: Messaggio quando non ci sono conversazioni
- **Scroll Area**: Area scrollabile per liste lunghe
- **Hover Effects**: Effetti hover sulle card conversazioni

### UI/UX

- Header con campo ricerca
- Lista scrollabile con card conversazioni
- Badge contatore non lette
- Icone ruolo emoji
- Formattazione tempo user-friendly
- Highlight conversazione selezionata
- Layout responsive

## 🎨 Struttura UI

```
Container (flex flex-col h-full)
  ├── Search Header (border-b)
  │   └── Input Ricerca
  └── Conversations List (flex-1 overflow-y-auto)
      ├── Se empty
      │   └── Empty State
      │       ├── Icon MessageCircle
      │       ├── Titolo
      │       └── Messaggio
      └── Se presenti
          └── Card[] (per ogni conversazione)
              ├── Avatar (User icon)
              ├── Info
              │   ├── Nome + Icona Ruolo
              │   └── Ultimo messaggio (Clock + tempo)
              └── Badge + Icon (se unread_count > 0)
```

## 💡 Esempi d'Uso

```tsx
<ConversationList
  conversations={conversations}
  currentConversationId={selectedConversationId}
  onSelectConversation={handleSelectConversation}
/>
```

## 📝 Note Tecniche

- Utilizza `useState` per gestire ricerca locale
- Filtraggio client-side per performance
- Formattazione date personalizzata con logica relativa
- Icone ruolo con emoji per visualizzazione immediata
- Highlight conversazione selezionata con stili condizionali
- Scroll area con `overflow-y-auto`
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
