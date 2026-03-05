# Componente: AthleteAdministrativeTab

## 📋 Descrizione

Tab amministrativo per profilo atleta (vista PT). Visualizza e modifica dati amministrativi, abbonamenti (tipo, stato, scadenza, metodo pagamento), documenti contrattuali con upload file e integrazione Supabase.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-administrative-tab.tsx`

## 🔧 Props

```typescript
interface AthleteAdministrativeTabProps {
  athleteId: string
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta

## 📦 Dipendenze

### React Hooks

- `useMemo` da `react`
- Custom hooks: `useAthleteAdministrative`, `useAthleteAdministrativeForm`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button`, `Input`, `Label`, `Textarea`, `Badge` da `@/components/ui`
- `LoadingState`, `ErrorState` da `@/components/dashboard`

### Icons

- `FileText`, `CreditCard`, `Calendar`, `Edit`, `Save`, `X`, `Plus`, `Trash2`, `Upload`, `ExternalLink`, `AlertCircle`, `CheckCircle` da `lucide-react`

### Types

- `TipoAbbonamentoEnum`, `StatoAbbonamentoEnum`, `MetodoPagamentoEnum`, `DocumentoContrattuale` da `@/types/athlete-profile`

### Utils

- `sanitizeString`, `sanitizeNumber` da `@/lib/sanitize`

## ⚙️ Funzionalità

### Core

1. **Gestione Abbonamenti**: Visualizza e modifica abbonamenti (tipo, stato, scadenza, metodo pagamento)
2. **Upload Documenti**: Upload documenti contrattuali
3. **Gestione Documenti**: Lista documenti con download/eliminazione
4. **Calcolo Stato**: Calcola stato abbonamento (attivo, scaduto, sospeso, in attesa)

### Tipi Abbonamento

- Mensile, Trimestrale, Semestrale, Annuale, Pacchetto Lezioni, Nessuno

### Stati Abbonamento

- Attivo, Scaduto, Sospeso, In Attesa

### Metodi Pagamento

- Carta di Credito, Bonifico, Contanti, PayPal, Altro

### Funzionalità Avanzate

- **Badge Stato**: Badge colorato per stato abbonamento
- **Upload File**: Upload documenti contrattuali
- **Memoizzazione**: `useMemo` per calcolo stato abbonamento
- **Validazione**: Validazione form

### UI/UX

- Header con titolo e bottone modifica
- Card abbonamento con badge stato
- Form upload documenti
- Lista documenti con azioni

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header + Button Modifica
  ├── Card Abbonamento
  │   ├── Tipo + Stato (Badge)
  │   ├── Scadenza + Metodo Pagamento
  │   └── Note
  └── Card Documenti Contrattuali
      ├── Lista Documenti
      └── Form Upload
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteAdministrativeTab } from '@/components/dashboard/athlete-profile/athlete-administrative-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  return <AthleteAdministrativeTab athleteId={athleteId} />
}
```

## 🔍 Note Tecniche

### Calcolo Stato Abbonamento

```typescript
const statoAbbonamentoBadge = useMemo(() => {
  if (!administrative?.stato_abbonamento) return null
  const stato = administrative.stato_abbonamento
  const badges = {
    attivo: { color: 'success', icon: CheckCircle, text: 'Attivo' },
    scaduto: { color: 'destructive', icon: AlertCircle, text: 'Scaduto' },
    // ...
  }
  return badges[stato]
}, [administrative?.stato_abbonamento])
```

### Limitazioni

- Dipende da hooks custom
- Upload file richiede Supabase Storage configurato

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
