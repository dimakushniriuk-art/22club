# Componente: AthleteMedicalTab

## 📋 Descrizione

Tab medica per profilo atleta (vista PT). Visualizza e modifica dati medici, certificati medici con scadenza, referti medici con upload, allergie, patologie, note mediche. Calcola stato certificato (valido, in scadenza, scaduto).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-medical-tab.tsx`

## 🔧 Props

```typescript
interface AthleteMedicalTabProps {
  athleteId: string
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta

## 📦 Dipendenze

### React Hooks

- `useMemo` da `react`
- Custom hooks: `useAthleteMedical`, `useAthleteMedicalForm`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button`, `Input`, `Label`, `Textarea`, `Badge` da `@/components/ui`
- `LoadingState`, `ErrorState` da `@/components/dashboard`

### Icons

- `FileText`, `Upload`, `X`, `Edit`, `Save`, `AlertCircle`, `CheckCircle`, `Plus`, `ExternalLink` da `lucide-react`

### Types

- `RefertoMedico` da `@/types/athlete-profile`

### Utils

- `sanitizeString` da `@/lib/sanitize`

## ⚙️ Funzionalità

### Core

1. **Gestione Certificati**: Visualizza e modifica certificati medici con scadenza
2. **Upload Referti**: Upload referti medici
3. **Calcolo Stato Certificato**: Calcola stato certificato (valido, in scadenza, scaduto)
4. **Gestione Array**: Aggiungi/rimuovi allergie, patologie, referti

### Stato Certificato

- **Valido**: Scadenza > 30 giorni
- **In Scadenza**: Scadenza <= 30 giorni
- **Scaduto**: Scadenza < oggi

### Funzionalità Avanzate

- **Memoizzazione**: `useMemo` per calcolo stato certificato e liste array
- **Upload File**: Upload certificati e referti
- **Badge Stato**: Badge colorato per stato certificato
- **Gestione Referti**: Lista referti con download/eliminazione

### UI/UX

- Header con titolo e bottone modifica
- Card certificato con badge stato
- Form upload referti
- Lista referti con azioni
- Form allergie/patologie

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header + Button Modifica
  ├── Card Certificato Medico
  │   ├── Scadenza + Badge Stato
  │   └── Form Upload
  ├── Card Allergie/Patologie
  └── Card Referti Medici
      ├── Lista Referti
      └── Form Upload
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteMedicalTab } from '@/components/dashboard/athlete-profile/athlete-medical-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  return <AthleteMedicalTab athleteId={athleteId} />
}
```

## 🔍 Note Tecniche

### Calcolo Stato Certificato

```typescript
const certificatoStatus = useMemo(() => {
  if (!medical?.certificato_medico_scadenza) return null
  const scadenza = new Date(medical.certificato_medico_scadenza)
  const oggi = new Date()
  const giorniRimanenti = Math.ceil((scadenza.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24))

  if (giorniRimanenti < 0) {
    return { status: 'scaduto', color: 'destructive', text: 'Scaduto' }
  } else if (giorniRimanenti <= 30) {
    return { status: 'in_scadenza', color: 'warning', text: `Scade tra ${giorniRimanenti} giorni` }
  } else {
    return {
      status: 'valido',
      color: 'success',
      text: `Valido fino al ${scadenza.toLocaleDateString('it-IT')}`,
    }
  }
}, [medical?.certificato_medico_scadenza])
```

### Limitazioni

- Dipende da hooks custom
- Upload file richiede Supabase Storage configurato

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
