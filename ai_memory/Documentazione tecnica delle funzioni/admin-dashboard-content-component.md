# Componente: AdminDashboardContent

## 📋 Descrizione

Componente contenuto principale per dashboard amministratore. Mostra statistiche globali sistema (utenti totali, attivi, nuovi questo mese, organizzazioni, trainer, atleti) con card colorate e link a sezioni amministrative.

## 📁 Percorso File

`src/components/dashboard/admin/admin-dashboard-content.tsx`

## 🔧 Props

```typescript
// Nessuna prop - componente senza props
```

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect` da `react`

### Supabase

- `createClient` da `@/lib/supabase/client`

### UI Components

- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` da `@/components/ui/card`
- `Button` da `@/components/ui/button`
- `Skeleton` da `@/components/shared/ui/skeleton`

### Next.js

- `Link` da `next/link`

### Icons

- `Users`, `UserPlus`, `Settings`, `Shield`, `BarChart3`, `Building2` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Statistiche Globali**: Carica e visualizza 6 metriche principali
2. **Calcolo Client-Side**: Calcola statistiche da dati Supabase
3. **Loading State**: Skeleton loading durante caricamento
4. **Link Navigazione**: Link a sezioni amministrative

### Metriche Visualizzate

1. **Utenti Totali**: Count totale profili
2. **Utenti Attivi**: Profili con `stato === 'attivo'`
3. **Nuovi Questo Mese**: Profili creati questo mese
4. **Organizzazioni**: Count organizzazioni uniche (da `org_id`)
5. **Trainer**: Profili con `role === 'pt' || 'trainer'`
6. **Atleti**: Profili con `role === 'atleta' || 'athlete'`

### Funzionalità Avanzate

- **Calcolo Mese**: Filtra per `created_at >= startOfMonth`
- **Set Organizzazioni**: Usa Set per contare organizzazioni uniche
- **Promise.all**: Carica dati in parallelo
- **Error Handling**: Gestisce errori con console.error

### UI/UX

- Container centrato con padding
- Header con titolo e descrizione
- Grid responsive (1 colonna mobile, 2 tablet, 3 desktop)
- Card colorate con gradienti
- Icone per ogni metrica
- Link a sezioni amministrative

## 🎨 Struttura UI

```
div (container mx-auto, p-6, space-y-6)
  ├── Header
  │   ├── h1 "Dashboard Amministratore"
  │   └── p Descrizione
  ├── Grid Statistiche (1/2/3 colonne)
  │   └── Card (per ogni metrica)
  │       ├── CardHeader
  │       │   ├── CardTitle
  │       │   └── Icona
  │       └── CardContent
  │           ├── Valore (text-2xl, bold)
  │           └── Descrizione (text-xs)
  └── Sezione Link (se presente)
      └── Link a sezioni admin
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AdminDashboardContent } from '@/components/dashboard/admin/admin-dashboard-content'

export default function AdminDashboardPage() {
  return <AdminDashboardContent />
}
```

## 🔍 Note Tecniche

### Calcolo Statistiche

```typescript
const statsData: AdminStats = {
  totalUsers: usersResult.count || 0,
  activeUsers: allUsers.filter((u) => u.stato === 'attivo').length,
  newUsersThisMonth: allUsers.filter((u) => u.created_at && new Date(u.created_at) >= startOfMonth)
    .length,
  totalOrganizations: new Set(profilesResult.data?.map((p) => p.org_id).filter(Boolean) || []).size,
  totalTrainers: allUsers.filter((u) => u.role === 'pt' || u.role === 'trainer').length,
  totalAthletes: allUsers.filter((u) => u.role === 'atleta' || u.role === 'athlete').length,
}
```

### Limitazioni

- Calcolo client-side (potrebbe essere lento per molti utenti)
- Solo 6 metriche (non estendibili facilmente)
- Nessun refresh automatico (solo al mount)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
