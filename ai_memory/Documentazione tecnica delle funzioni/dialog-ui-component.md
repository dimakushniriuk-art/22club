# Componente: Dialog (UI Base)

## 📋 Descrizione

Componente dialog/modal principale del design system. Supporta backdrop blur, chiusura con click esterno, gestione body overflow e sub-componenti (Header, Title, Description, Footer). Utilizzato per modali, dialoghi e popup.

## 📁 Percorso File

`src/components/ui/dialog.tsx`

## 🔧 Props

### Dialog Props

```typescript
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}
```

### DialogContent Props

```typescript
interface DialogContentProps {
  children: React.ReactNode
  className?: string
}
```

### DialogHeader Props

```typescript
interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}
```

### DialogTitle Props

```typescript
interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}
```

### DialogDescription Props

```typescript
interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}
```

### DialogFooter Props

```typescript
interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}
```

## 📦 Dipendenze

### React

- `React.createContext`, `React.useContext`, `React.useEffect` da `react`
- `X` da `lucide-react`

### Components

- `Button` da `./button`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Dialog Modal**: Modal con backdrop e contenuto centrato
2. **Context API**: Gestione stato con React Context
3. **Body Overflow**: Blocca scroll body quando aperto
4. **Backdrop Blur**: Backdrop con blur effect
5. **Close Button**: Bottone X per chiudere
6. **Click Outside**: Chiusura con click su backdrop
7. **Sub-components**: Header, Title, Description, Footer, Trigger

### Funzionalità Avanzate

- **Body Lock**: Blocca scroll body quando dialog aperto
- **Backdrop Click**: Chiusura con click su backdrop
- **Accessibility**: ARIA attributes (dialog, aria-modal)
- **Z-index**: Z-index alto (z-50) per overlay
- **Responsive**: Max-width lg per contenuto

### UI/UX

- Dialog centrato verticalmente e orizzontalmente
- Backdrop con blur e opacity
- Contenuto con border e shadow
- Close button in alto a destra
- Layout flessibile con sub-components

## 🎨 Struttura UI

```
Dialog (Context Provider)
  ├── DialogTrigger (opzionale)
  └── DialogContent (se open)
      ├── Backdrop (fixed inset-0)
      └── Dialog Container (centrato)
          ├── Close Button (X icon)
          ├── DialogHeader (opzionale)
          │   ├── DialogTitle
          │   └── DialogDescription (opzionale)
          ├── Children (contenuto)
          └── DialogFooter (opzionale)
```

## 💡 Esempi d'Uso

```tsx
// Dialog base
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titolo</DialogTitle>
      <DialogDescription>Descrizione</DialogDescription>
    </DialogHeader>
    <p>Contenuto dialog</p>
    <DialogFooter>
      <Button onClick={() => setIsOpen(false)}>Chiudi</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Dialog con trigger
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>
    <Button>Apri Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Conferma</DialogTitle>
    <p>Sei sicuro?</p>
  </DialogContent>
</Dialog>
```

## 📝 Note Tecniche

- Utilizza React Context per gestione stato
- Blocca body overflow quando aperto con `useEffect`
- Backdrop con `bg-black/70 backdrop-blur-md`
- Close button con Button component variant ghost
- Click outside per chiudere su backdrop
- Z-index z-50 per overlay
- Max-width lg per contenuto
- ARIA attributes per accessibilità
- Layout responsive e centrato
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
