# Componente: DocumentInvalidModal

## 📋 Descrizione

Modal per segnalare documento non valido. Richiede motivazione obbligatoria per segnalare documento. Utilizza overlay custom (non Dialog standard) e validazione campo obbligatorio.

## 📁 Percorso File

`src/components/dashboard/documenti/document-invalid-modal.tsx`

## 🔧 Props

```typescript
interface DocumentInvalidModalProps {
  open: boolean
  rejectionReason: string
  onRejectionReasonChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
}
```

### Dettaglio Props

- **`open`** (boolean, required): Stato apertura modal
- **`rejectionReason`** (string, required): Motivazione rifiuto corrente
- **`onRejectionReasonChange`** (function, required): Callback cambio motivazione
- **`onConfirm`** (function, required): Callback conferma segnalazione
- **`onCancel`** (function, required): Callback annulla

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button`, `Textarea` da `@/components/ui`

## ⚙️ Funzionalità

### Core

1. **Form Segnalazione**: Textarea per motivazione obbligatoria
2. **Validazione**: Bottone conferma disabilitato se motivazione vuota
3. **Overlay Custom**: Overlay con backdrop blur (non Dialog standard)

### Funzionalità Avanzate

- **Validazione Real-time**: Bottone disabilitato se `!rejectionReason.trim()`
- **Overlay Blur**: Backdrop blur per focus
- **Stile Pericoloso**: Bottone conferma con colore rosso (error)

### Validazioni

- Motivazione obbligatoria (non vuota dopo trim)

### UI/UX

- Modal centrato con overlay blur
- Card con max-width
- Textarea per motivazione
- Bottoni annulla/conferma
- Bottone conferma disabilitato se vuoto

## 🎨 Struttura UI

```
div (fixed inset-0, overlay blur)
  └── Card (max-w-md, centrato)
      ├── CardHeader
      │   └── CardTitle "Segnala documento non valido"
      └── CardContent
          ├── Textarea Motivazione (rows 4)
          └── div (bottoni, flex gap-2)
              ├── Button Annulla (flex-1)
              └── Button Segnala (flex-1, rosso, disabled se vuoto)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { DocumentInvalidModal } from '@/components/dashboard/documenti/document-invalid-modal'

function DocumentsPage() {
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  return (
    <DocumentInvalidModal
      open={showModal}
      rejectionReason={rejectionReason}
      onRejectionReasonChange={setRejectionReason}
      onConfirm={() => {
        // Segnala documento
        handleMarkInvalid(rejectionReason)
        setShowModal(false)
        setRejectionReason('')
      }}
      onCancel={() => {
        setShowModal(false)
        setRejectionReason('')
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Validazione

```typescript
disabled={!rejectionReason.trim()}
```

### Overlay Custom

- Non usa Dialog standard
- Overlay con `bg-black/70 backdrop-blur-md`
- Modal centrato con flex

### Limitazioni

- Solo campo motivazione (non altri campi)
- Overlay custom (non usa Dialog standard)
- Validazione solo client-side (non server-side)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
