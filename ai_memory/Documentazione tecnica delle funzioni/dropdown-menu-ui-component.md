# Componente: DropdownMenu (UI Base)

## 📋 Descrizione

Componente dropdown menu per menu contestuali. Supporta trigger, content posizionabile, items cliccabili, separatori e click outside per chiudere. Utilizzato per menu contestuali, azioni e navigazione.

## 📁 Percorso File

`src/components/ui/dropdown-menu.tsx`

## 🔧 Props

### DropdownMenu Props

```typescript
interface DropdownMenuProps {
  children: React.ReactNode
}
```

### DropdownMenuContent Props

```typescript
interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}
```

### DropdownMenuItem Props

```typescript
interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}
```

## 📦 Dipendenze

### React

- `React.createContext`, `React.useContext`, `React.useState`, `React.useEffect`, `React.useRef` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Trigger**: Bottone o elemento cliccabile per aprire menu
2. **Content**: Menu dropdown posizionabile
3. **Items**: Items cliccabili nel menu
4. **Separator**: Separatore tra items
5. **Click Outside**: Chiusura con click fuori dal menu
6. **AsChild Pattern**: Supporto asChild per trigger

### Funzionalità Avanzate

- **Context API**: Gestione stato con React Context
- **Click Outside Detection**: Gestione click fuori con useRef
- **Auto Close**: Chiusura automatica dopo click item
- **Disabled State**: Items disabilitati
- **Alignment**: Allineamento content (start, center, end)

### UI/UX

- Menu posizionato sotto trigger
- Shadow e border per profondità
- Hover effects su items
- Disabled state con opacity
- Transizioni smooth

## 🎨 Struttura UI

```
DropdownMenu (Context Provider, relative)
  ├── DropdownMenuTrigger
  │   └── Children (button o elemento)
  └── DropdownMenuContent (se open, absolute)
      ├── DropdownMenuItem[]
      └── DropdownMenuSeparator (opzionale)
```

## 💡 Esempi d'Uso

```tsx
// Dropdown base
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuItem onClick={handleEdit}>Modifica</DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete}>Elimina</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleShare}>Condividi</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// Dropdown con asChild
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <IconButton><MoreVertical /></IconButton>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Opzione 1</DropdownMenuItem>
    <DropdownMenuItem disabled>Opzione 2 (disabilitata)</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## 📝 Note Tecniche

- Utilizza React Context per gestione stato
- Click outside detection con useRef e event listeners
- Auto-close dopo click item
- Alignment: start (left-0), center (left-1/2 -translate-x-1/2), end (right-0)
- Z-index z-50 per overlay
- Min-width 12rem per content
- Hover effects con bg-background-tertiary
- Disabled state con opacity-50 e cursor-not-allowed
- Separator con h-px e bg-border
- Transizioni smooth
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
