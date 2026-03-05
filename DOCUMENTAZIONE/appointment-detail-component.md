# Componente: AppointmentDetail

## 📋 Descrizione

Componente card per visualizzare i dettagli completi di un appuntamento. Mostra informazioni atleta, data/ora, tipo, stato, note e azioni (modifica, annulla, elimina).

## 📁 Percorso File

`src/components/calendar/appointment-detail.tsx`

## 🔧 Props

```typescript
interface AppointmentDetailProps {
  appointment: AppointmentUI
  onEdit?: () => void
  onCancel?: () => void
  onDelete?: () => void
  onClose?: () => void
  loading?: boolean
}
```

### Dettaglio Props

- **`appointment`** (AppointmentUI, required): Oggetto appuntamento con tutti i dettagli
- **`onEdit`** (function, optional): Callback chiamato quando si clicca "Modifica"
- **`onCancel`** (function, optional): Callback chiamato quando si clicca "Annulla"
- **`onDelete`** (function, optional): Callback chiamato quando si clicca "Elimina"
- **`onClose`** (function, optional): Callback chiamato quando si clicca il pulsante chiudi
- **`loading`** (boolean, optional, default: false): Mostra stato di caricamento durante azioni

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`
- `Badge` da `@/components/ui`
- `User`, `Calendar`, `Clock`, `FileText`, `X`, `Edit`, `Ban`, `Trash2` da `lucide-react`

### Types

- `AppointmentUI` da `@/types/appointment`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Dettagli**: Mostra tutte le informazioni dell'appuntamento
2. **Gestione Stato**: Mostra badge con stato (attivo, annullato, completato)
3. **Azioni**: Permette modifica, annullamento ed eliminazione (se appuntamento attivo)
4. **Formattazione Date**: Formatta date e orari in formato italiano

### Funzionalità Avanzate

- **Rilevamento Tipo**: Estrae il tipo appuntamento dalle note o dal campo `type`
- **Stati Supportati**: Attivo, Annullato, Completato
- **Info Annullamento**: Mostra data/ora annullamento se presente
- **Protezione Modifiche**: Disabilita azioni se appuntamento non è attivo

### UI/UX

- Card con gradiente e backdrop blur
- Layout organizzato con sezioni separate
- Icone per ogni sezione
- Pulsanti azioni con colori semantici
- Empty state per note mancanti

## 🎨 Struttura UI

```
Card (variant="trainer")
  ├── CardHeader
  │   ├── CardTitle "Dettagli Appuntamento"
  │   └── Button (chiudi, se onClose)
  └── CardContent
      ├── Header Atleta
      │   ├── Icona User
      │   ├── Nome atleta
      │   ├── Tipo appuntamento
      │   └── Badge stato
      ├── Data e Ora
      │   ├── Icona Clock
      │   ├── Data formattata
      │   └── Orario (inizio - fine)
      ├── Note (se presenti)
      │   ├── Icona FileText
      │   └── Testo note
      ├── Info Annullamento (se annullato)
      │   ├── Icona Ban
      │   └── Data annullamento
      └── Azioni (se attivo)
          ├── Button "Modifica"
          ├── Button "Annulla"
          └── Button "Elimina"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AppointmentDetail } from '@/components/calendar/appointment-detail'

function MyComponent() {
  const handleEdit = () => {
    // Apri modal modifica
  }

  const handleCancel = async () => {
    // Annulla appuntamento
  }

  const handleDelete = async () => {
    // Elimina appuntamento
  }

  return (
    <AppointmentDetail
      appointment={appointment}
      onEdit={handleEdit}
      onCancel={handleCancel}
      onDelete={handleDelete}
      onClose={() => setSelectedAppointment(null)}
    />
  )
}
```

## 🔍 Note Tecniche

### Rilevamento Tipo Appuntamento

Il tipo viene estratto in questo ordine:

1. Dalle note: "Prima Visita", "Massaggio", "Nutrizionista"
2. Dal campo `type`: "check" → "Riunione", "cardio" → "Cardio"
3. Default: "Allenamento"

### Formattazione Date

- **Data**: Formato italiano completo (es: "lunedì 3 febbraio 2025")
- **Orario**: Formato 24h (es: "14:30 - 15:30")

### Stati e Colori

- **Attivo**: Badge success (verde)
- **Annullato**: Badge error (rosso)
- **Completato**: Badge info (blu)

### Limitazioni

- Non gestisce ricorrenze (rimosse nella nuova struttura)
- Le azioni sono disponibili solo se l'appuntamento è attivo
- Non mostra informazioni aggiuntive come durata calcolata

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
