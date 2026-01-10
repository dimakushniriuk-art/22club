# Componente: AthleteDocumentsTab

## 📋 Descrizione

Tab documenti per profilo atleta (vista PT). Mostra conteggio documenti in scadenza, alert se documenti scadenti, link a pagina documenti con filtro atleta, empty state con icona.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-documents-tab.tsx`

## 🔧 Props

```typescript
interface AthleteDocumentsTabProps {
  athleteId: string
  documentiScadenza: number
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta
- **`documentiScadenza`** (number, required): Numero documenti in scadenza

## 📦 Dipendenze

### Next.js

- `Link` da `next/link`

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Button` da `@/components/ui`

### Icons

- `FileText`, `ArrowLeft`, `AlertCircle` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Alert Scadenza**: Mostra alert se documenti in scadenza
2. **Link Documenti**: Link a pagina documenti con filtro atleta
3. **Empty State**: Empty state con icona e messaggio
4. **Gestione Scadenze**: Alert colorato per documenti scadenti

### Funzionalità Avanzate

- **Alert Condizionale**: Alert solo se `documentiScadenza > 0`
- **Link con Filtro**: Link include query param `atleta` per filtrare
- **Alert Styling**: Alert rosso con icona e messaggio

### UI/UX

- Card con bordo teal
- Header con titolo e descrizione
- Alert scadenza (se presente)
- Link "Vedi tutti i documenti"
- Empty state con icona

## 🎨 Struttura UI

```
Card (border teal)
  └── CardContent
      ├── Header (flex justify-between)
      │   ├── Titolo + Descrizione
      │   └── Link "Vedi tutti i documenti"
      ├── (se documentiScadenza > 0)
      │   └── Alert Scadenza (rosso)
      │       ├── Icona AlertCircle
      │       └── Messaggio
      └── Empty State
          ├── Icona FileText
          ├── Titolo
          └── Descrizione
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteDocumentsTab } from '@/components/dashboard/athlete-profile/athlete-documents-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  const documentiScadenza = 2

  return <AthleteDocumentsTab athleteId={athleteId} documentiScadenza={documentiScadenza} />
}
```

## 🔍 Note Tecniche

### Link con Filtro

```tsx
<Link href={`/dashboard/documenti?atleta=${athleteId}`}>
```

### Alert Scadenza

```tsx
{
  documentiScadenza > 0 && (
    <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <div>
          <p className="text-red-400 font-semibold mb-1">
            {documentiScadenza} {documentiScadenza === 1 ? 'documento' : 'documenti'} in scadenza
          </p>
          <p className="text-red-300/80 text-sm">
            Richiedi il rinnovo dei documenti scaduti o in scadenza
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Limitazioni

- Solo alert e link (non mostra documenti effettivi)
- Conteggio documenti scadenza deve essere calcolato esternamente
- Link a pagina esterna (non componente standalone)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
