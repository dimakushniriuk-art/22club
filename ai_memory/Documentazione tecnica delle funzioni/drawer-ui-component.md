# Componente: Drawer (UI Base)

## 📋 Descrizione

Componente drawer/sidebar per pannelli laterali. Supporta 4 lati (left, right, top, bottom), 5 dimensioni, animazioni slide, backdrop blur e sub-componenti (Content, Header, Body, Footer). Utilizzato per menu laterali, pannelli e drawer.

## 📁 Percorso File

`src/components/ui/drawer.tsx`

## 🔧 Props

### Drawer Props

```typescript
interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}
```

### DrawerContent Props

```typescript
interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
  onClose?: () => void
}
```

### DrawerHeader Props

```typescript
interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}
```

## 📦 Dipendenze

### React

- `React.forwardRef`, `React.useState`, `React.useEffect`, `React.useCallback` da `react`
- `X` da `lucide-react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **4 Lati**: left, right, top, bottom
2. **5 Dimensioni**: sm, md, lg, xl, full
3. **Animazioni Slide**: Animazioni slide per ogni lato
4. **Backdrop Blur**: Backdrop con blur effect
5. **Close Button**: Bottone chiusura opzionale
6. **Sub-components**: Content, Header, Body, Footer

### Funzionalità Avanzate

- **Slide Animations**: Animazioni slide-in per ogni direzione
- **Backdrop Click**: Chiusura con click su backdrop
- **State Management**: Gestione stato interno e controllato
- **Responsive Sizing**: Dimensioni responsive per ogni lato
- **Flex Layout**: Layout flex per content

### UI/UX

- Drawer posizionato su lato specificato
- Backdrop con blur e opacity
- Animazioni smooth per apertura/chiusura
- Close button in header
- Layout flessibile con sub-components

## 🎨 Struttura UI

```
Drawer (fixed inset-0 z-50)
  ├── Backdrop (fixed inset-0)
  └── Drawer Container (fixed, posizionato per side)
      └── DrawerContent
          ├── Close Button (se showCloseButton)
          ├── DrawerHeader (opzionale)
          │   ├── Title
          │   └── Description (opzionale)
          ├── DrawerBody (contenuto scrollabile)
          └── DrawerFooter (opzionale)
```

## 💡 Esempi d'Uso

```tsx
// Drawer base
<Drawer open={isOpen} onOpenChange={setIsOpen} side="right" size="md">
  <DrawerContent showCloseButton onClose={() => setIsOpen(false)}>
    <DrawerHeader title="Menu" description="Opzioni disponibili">
      <DrawerBody>
        <p>Contenuto drawer</p>
      </DrawerBody>
      <DrawerFooter>
        <Button>Salva</Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</Drawer>

// Drawer left
<Drawer open={isOpen} side="left" size="lg">
  <DrawerContent>
    <DrawerHeader title="Navigazione" />
    <DrawerBody>Menu items</DrawerBody>
  </DrawerContent>
</Drawer>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- Gestione stato interno e controllato
- 4 lati con posizionamento fixed
- 5 dimensioni: sm (max-w-sm), md (max-w-md), lg (max-w-lg), xl (max-w-xl), full (max-w-full)
- Animazioni: slide-in-left, slide-in-right, slide-in-down, slide-in-up
- Backdrop con `bg-black/70 backdrop-blur-md`
- Click outside per chiudere su backdrop
- Z-index z-50 per overlay
- Transizioni smooth (duration-300 ease-in-out)
- Layout flex per content
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
