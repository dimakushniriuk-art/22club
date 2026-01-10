# 📚 Documentazione Tecnica: AlertDialog

**Percorso**: `src/components/ui/alert-dialog.tsx`  
**Tipo Modulo**: React Component (UI Component, Dialog Component, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Componente dialog alert. Sistema di dialog modale per conferme e avvisi con backdrop blur, gestione overflow body, e composizione componenti.

---

## 🔧 Components e Export

### 1. `AlertDialog`

**Classificazione**: React Component, Dialog Component, Client Component, Context Provider  
**Tipo**: `(props: AlertDialogProps) => JSX.Element`

**Props**:

- `open`: `boolean` - Stato apertura dialog
- `onOpenChange`: `(open: boolean) => void` - Handler cambio stato
- `children`: `React.ReactNode` - Contenuto dialog

**Output**: JSX Element (Context Provider)

**Descrizione**: Provider context per dialog con:

- **Context**: Fornisce `open` e `onOpenChange` ai children
- **Body Overflow**: Gestisce `document.body.style.overflow` (hidden quando aperto)
- **Cleanup**: Reset overflow al unmount

### 2. `AlertDialogContent`

**Classificazione**: React Component, Dialog Component, Client Component  
**Tipo**: `(props: AlertDialogContentProps) => JSX.Element | null`

**Props**:

- `children`: `React.ReactNode` - Contenuto dialog
- `className?`: `string` - Classi CSS aggiuntive

**Output**: JSX Element (dialog content) o null

**Descrizione**: Contenuto dialog con:

- **Backdrop**: Fixed overlay con `bg-black/70 backdrop-blur-md`, click chiude dialog
- **Dialog**: Card centrata con `max-w-md`, `role="alertdialog"`, `aria-modal="true"`
- **Conditional Render**: Ritorna null se `!open`

### 3. `AlertDialogHeader`

**Classificazione**: React Component, Dialog Component, Client Component  
**Tipo**: `(props: AlertDialogHeaderProps) => JSX.Element`

**Props**:

- `children`: `React.ReactNode` - Contenuto header
- `className?`: `string` - Classi CSS aggiuntive

**Output**: JSX Element (header container)

**Descrizione**: Container header con spacing (`mb-4 space-y-2`)

### 4. `AlertDialogTitle`

**Classificazione**: React Component, Dialog Component, Client Component  
**Tipo**: `(props: AlertDialogTitleProps) => JSX.Element`

**Props**:

- `children`: `React.ReactNode` - Titolo
- `className?`: `string` - Classi CSS aggiuntive

**Output**: JSX Element (h2 title)

**Descrizione**: Titolo dialog (`text-lg font-semibold text-text-primary`)

### 5. `AlertDialogDescription`

**Classificazione**: React Component, Dialog Component, Client Component  
**Tipo**: `(props: AlertDialogDescriptionProps) => JSX.Element`

**Props**:

- `children`: `React.ReactNode` - Descrizione
- `className?`: `string` - Classi CSS aggiuntive

**Output**: JSX Element (p description)

**Descrizione**: Descrizione dialog (`text-sm text-text-secondary`)

### 6. `AlertDialogFooter`

**Classificazione**: React Component, Dialog Component, Client Component  
**Tipo**: `(props: AlertDialogFooterProps) => JSX.Element`

**Props**:

- `children`: `React.ReactNode` - Contenuto footer (bottoni)
- `className?`: `string` - Classi CSS aggiuntive

**Output**: JSX Element (footer container)

**Descrizione**: Container footer con flex justify-end (`mt-6 flex justify-end gap-3`)

### 7. `AlertDialogAction`

**Classificazione**: React Component, Dialog Component, Client Component  
**Tipo**: `(props: AlertDialogActionProps) => JSX.Element`

**Props**:

- `children`: `React.ReactNode` - Testo bottone
- `onClick?`: `() => void` - Handler click
- `className?`: `string` - Classi CSS aggiuntive

**Output**: JSX Element (Button)

**Descrizione**: Bottone azione con:

- **Button**: Usa `Button` component (variant default)
- **Auto Close**: Chiama `onOpenChange(false)` dopo `onClick`

### 8. `AlertDialogCancel`

**Classificazione**: React Component, Dialog Component, Client Component  
**Tipo**: `(props: AlertDialogCancelProps) => JSX.Element`

**Props**:

- `children`: `React.ReactNode` - Testo bottone
- `onClick?`: `() => void` - Handler click
- `className?`: `string` - Classi CSS aggiuntive

**Output**: JSX Element (Button)

**Descrizione**: Bottone annulla con:

- **Button**: Usa `Button` component (variant outline)
- **Auto Close**: Chiama `onOpenChange(false)` dopo `onClick`

---

## 🔄 Flusso Logico

### AlertDialog (Provider)

1. **Body Overflow**:
   - Se `open` → `document.body.style.overflow = 'hidden'`
   - Se `!open` → `document.body.style.overflow = 'unset'`
   - Cleanup: reset al unmount

2. **Context Provider**:
   - Fornisce `{ open, onOpenChange }` ai children

### AlertDialogContent

1. **Conditional Render**:
   - Se `!open` → return null

2. **Backdrop + Dialog**:
   - Backdrop: fixed overlay, click → `onOpenChange(false)`
   - Dialog: card centrata con contenuto

### AlertDialogAction/Cancel

1. **Click Handler**:
   - Chiama `onClick?.()`
   - Chiama `onOpenChange(false)` (chiude dialog)

---

## 📊 Dipendenze

**Dipende da**: React (`useContext`, `useEffect`), UI Components (`Button`), Lucide icons (`X`), `cn` utility

**Utilizzato da**: Componenti che necessitano dialog conferma (es. `UserDeleteDialog`)

---

## ⚠️ Note Tecniche

- **Context Pattern**: Usa React Context per gestire stato dialog
- **Body Overflow**: Gestisce overflow per prevenire scroll quando dialog aperto
- **Auto Close**: Action/Cancel chiudono automaticamente dialog dopo click

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
