# Componente: ClientiBulkActions

## 📋 Descrizione

Componente floating per azioni bulk su clienti selezionati. Mostra barra fissa in basso a destra quando ci sono clienti selezionati, con azioni email e elimina, e bottone per deselezionare tutti.

## 📁 Percorso File

`src/components/dashboard/clienti-bulk-actions.tsx`

## 🔧 Props

```typescript
interface ClientiBulkActionsProps {
  selectedCount: number
  onSendEmail: () => void
  onDelete: () => void
  onClear: () => void
}
```

### Dettaglio Props

- **`selectedCount`** (number, required): Numero clienti selezionati
- **`onSendEmail`** (function, required): Callback invia email a selezionati
- **`onDelete`** (function, required): Callback elimina selezionati
- **`onClear`** (function, required): Callback deseleziona tutti

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Button` da `@/components/ui`

### Icons

- `Mail`, `Trash`, `X`, `Users` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Barra Floating**: Barra fissa in basso a destra (fixed, z-40)
2. **Contatore**: Mostra numero clienti selezionati
3. **Azioni Bulk**: Bottoni per email e elimina
4. **Clear Selection**: Bottone per deselezionare tutti

### Funzionalità Avanzate

- **Render Condizionale**: Mostra solo se `selectedCount > 0`
- **Glow Effect**: Effetto glow con gradiente blur
- **Gradient Background**: Background con gradiente teal-cyan-blue
- **Decorative Elements**: Linea gradiente in alto
- **Animazione**: Fade-in animation
- **Responsive Text**: Testo nascosto su mobile per bottoni

### UI/UX

- Posizione fissa bottom-right
- Z-index alto (z-40)
- Background blur e gradiente
- Shadow e glow effects
- Bottoni con icona e testo (testo nascosto su mobile)
- Animazione fade-in

## 🎨 Struttura UI

```
div (fixed bottom-4 right-4 z-40)
  └── div (glow effect, absolute, blur-xl)
  └── div (barra principale)
      ├── Linea gradiente (top)
      └── div (content, flex)
          ├── Badge contatore
          │   ├── Icona Users
          │   └── Testo "X clienti selezionati"
          └── div (bottoni, flex gap-2)
              ├── Button Email
              ├── Button Elimina (rosso)
              └── Button Clear (X icon)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ClientiBulkActions } from '@/components/dashboard/clienti-bulk-actions'

function ClientsPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  return (
    <ClientiBulkActions
      selectedCount={selectedIds.size}
      onSendEmail={() => {
        // Invia email a clienti selezionati
        console.log('Sending email to', Array.from(selectedIds))
      }}
      onDelete={() => {
        // Elimina clienti selezionati
        handleBulkDelete(Array.from(selectedIds))
      }}
      onClear={() => setSelectedIds(new Set())}
    />
  )
}
```

## 🔍 Note Tecniche

### Render Condizionale

```typescript
if (selectedCount === 0) return null
```

### Glow Effect

```typescript
<div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-blue-500/20 blur-xl" />
```

### Responsive Text

- Testo "Email" e "Elimina" nascosto su mobile (`hidden sm:inline`)
- Solo icone visibili su mobile

### Limitazioni

- Solo 2 azioni bulk (email e elimina)
- Posizione fissa (non configurabile)
- Z-index fisso (potrebbe sovrapporsi ad altri elementi)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
