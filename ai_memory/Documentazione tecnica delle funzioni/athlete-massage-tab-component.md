# Componente: AthleteMassageTab

## 📋 Descrizione

Tab massaggio per profilo atleta (vista PT). Visualizza e modifica dati massaggi, zone problematiche, allergie prodotti, preferenze tipo massaggio (svedese, sportivo, decontratturante, rilassante, linfodrenante), intensità, storico massaggi con date.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-massage-tab.tsx`

## 🔧 Props

```typescript
interface AthleteMassageTabProps {
  athleteId: string
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta

## 📦 Dipendenze

### React Hooks

- `useMemo` da `react`
- Custom hooks: `useAthleteMassage`, `useAthleteMassageForm`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button`, `Input`, `Label`, `Textarea`, `Badge` da `@/components/ui`
- `LoadingState`, `ErrorState` da `@/components/dashboard`

### Icons

- `Hand`, `Edit`, `Save`, `X`, `Plus`, `Trash2`, `Calendar`, `Clock` da `lucide-react`

### Types

- `TipoMassaggioEnum`, `IntensitaMassaggioEnum` da `@/types/athlete-profile`

### Utils

- `sanitizeString`, `sanitizeNumber` da `@/lib/sanitize`

## ⚙️ Funzionalità

### Core

1. **Gestione Dati Massaggi**: Visualizza e modifica dati massaggi completi
2. **Tipi Massaggio**: Svedese, Sportivo, Decontratturante, Rilassante, Linfodrenante, Altro
3. **Intensità**: Leggera, Media, Intensa
4. **Gestione Array**: Aggiungi/rimuovi zone problematiche, allergie, tipi massaggio, storico massaggi

### Tipi Massaggio

- Svedese, Sportivo, Decontratturante, Rilassante, Linfodrenante, Altro

### Intensità Massaggio

- Leggera, Media, Intensa

### Funzionalità Avanzate

- **Memoizzazione**: `useMemo` per liste array
- **Form Dinamico**: Aggiungi/rimuovi elementi array
- **Toggle Tipo Massaggio**: Toggle preferenze tipo massaggio
- **Gestione Storico**: Form per aggiungere massaggi con data

### UI/UX

- Header con titolo e bottone modifica
- Card organizzate per sezioni
- Form inline per array items
- Bottoni salva/annulla

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header + Button Modifica
  └── Grid (2 colonne)
      ├── Card Zone Problematiche
      ├── Card Allergie Prodotti
      ├── Card Preferenze Tipo Massaggio
      └── Card Storico Massaggi
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteMassageTab } from '@/components/dashboard/athlete-profile/athlete-massage-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  return <AthleteMassageTab athleteId={athleteId} />
}
```

## 🔍 Note Tecniche

### Memoizzazione Liste

```typescript
const zoneList = useMemo(() => formData.zone_problematiche || [], [formData.zone_problematiche])
const tipiMassaggioList = useMemo(
  () => formData.preferenze_tipo_massaggio || [],
  [formData.preferenze_tipo_massaggio],
)
```

### Limitazioni

- Dipende da hooks custom
- Gestione array complessa

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
