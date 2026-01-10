# Componente: EmojiPicker

## 📋 Descrizione

Componente selettore emoji per la chat. Mostra emoji organizzati per categorie (Faces, Gestures, Objects, Symbols) con tab navigation e click outside per chiudere.

## 📁 Percorso File

`src/components/chat/emoji-picker.tsx`

## 🔧 Props

```typescript
interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  className?: string
}
```

### Dettaglio Props

- **`onEmojiSelect`** (function, required): Callback chiamato quando si seleziona un emoji
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### React

- `useState`, `useRef`, `useEffect` da `react`

### UI Components

- `Button` da `@/components/ui/button`
- `Smile` da `lucide-react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Selettore Emoji**: Pulsante per aprire/chiudere picker
2. **Categorie**: 4 categorie emoji (Faces, Gestures, Objects, Symbols)
3. **Tab Navigation**: Tab per navigare tra categorie
4. **Grid Emoji**: Grid 8 colonne con emoji cliccabili
5. **Click Outside**: Chiude picker quando si clicca fuori

### Funzionalità Avanzate

- **Click Outside Detection**: Gestisce click fuori dal picker per chiudere
- **Active Category**: Evidenzia categoria attiva
- **Scroll Area**: Area scrollabile per emoji (max-h-60)
- **Hover Effects**: Effetti hover sugli emoji

### UI/UX

- Pulsante icona Smile
- Dropdown posizionato assoluto
- Tab per categorie
- Grid emoji scrollabile
- Chiusura automatica dopo selezione
- Stili con tema teal-cyan

## 🎨 Struttura UI

```
Container (relative)
  ├── Button (icon Smile)
  └── Dropdown (se isOpen, absolute bottom-10 right-0)
      ├── Category Tabs (flex border-b)
      │   └── Button[] (per ogni categoria)
      └── Emoji Grid (max-h-60 overflow-y-auto)
          └── Grid (grid-cols-8)
              └── Button[] (per ogni emoji)
```

## 💡 Esempi d'Uso

```tsx
<EmojiPicker onEmojiSelect={(emoji) => setMessage((prev) => prev + emoji)} />
```

## 📝 Note Tecniche

- Utilizza `useRef` per gestire click outside
- `useEffect` per aggiungere/rimuovere event listener
- Emoji hardcoded in `EMOJI_CATEGORIES` object
- Grid 8 colonne per layout ottimale
- Chiusura automatica dopo selezione emoji
- Z-index alto (z-50) per overlay
- Backdrop blur per modernità
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
