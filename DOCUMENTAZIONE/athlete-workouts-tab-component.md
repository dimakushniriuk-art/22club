# Componente: AthleteWorkoutsTab

## 📋 Descrizione

Tab allenamenti per profilo atleta (vista PT). Mostra conteggio schede attive, link a pagina schede con filtro atleta, empty state se nessuna scheda, bottone crea prima scheda.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-workouts-tab.tsx`

## 🔧 Props

```typescript
interface AthleteWorkoutsTabProps {
  athleteId: string
  schedeAttive: number
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta
- **`schedeAttive`** (number, required): Numero schede attive

## 📦 Dipendenze

### Next.js

- `Link` da `next/link`

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Button` da `@/components/ui`

### Icons

- `Dumbbell`, `ArrowLeft` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Conteggio Schede**: Mostra numero schede attive
2. **Link Schede**: Link a pagina schede con filtro atleta
3. **Empty State**: Messaggio e bottone se nessuna scheda
4. **Placeholder**: Placeholder per future schede attive

### Funzionalità Avanzate

- **Empty State**: Empty state con icona e bottone crea prima scheda
- **Link con Filtro**: Link include query param `athlete_id` per filtrare
- **Link Crea**: Link a pagina schede con `new=true` per creare nuova scheda

### UI/UX

- Card con bordo teal
- Header con titolo e conteggio
- Link "Vedi tutte le schede"
- Empty state con icona e bottone
- Placeholder per future schede

## 🎨 Struttura UI

```
Card (border teal)
  └── CardContent
      ├── Header (flex justify-between)
      │   ├── Titolo + Conteggio
      │   └── Link "Vedi tutte le schede"
      └── (se schedeAttive === 0)
          └── Empty State
              ├── Icona
              ├── Messaggio
              └── Link "Crea Prima Scheda"
          (altrimenti)
          └── Grid Placeholder Schede
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteWorkoutsTab } from '@/components/dashboard/athlete-profile/athlete-workouts-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  const schedeAttive = 3

  return <AthleteWorkoutsTab athleteId={athleteId} schedeAttive={schedeAttive} />
}
```

## 🔍 Note Tecniche

### Link con Filtro

```tsx
<Link href={`/dashboard/schede?athlete_id=${athleteId}`}>
```

### Link Crea

```tsx
<Link href={`/dashboard/schede?athlete_id=${athleteId}&new=true`}>
```

### Limitazioni

- Placeholder per schede (non mostra schede effettive)
- Conteggio schede deve essere calcolato esternamente
- Link a pagina esterna (non componente standalone)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
