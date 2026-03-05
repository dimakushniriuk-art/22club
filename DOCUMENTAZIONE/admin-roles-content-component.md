# Componente: AdminRolesContent

## 📋 Descrizione

Componente per gestione ruoli e permessi amministratore. Permette di creare, modificare ed eliminare ruoli, configurare permessi per categoria (Utenti, Clienti, Appuntamenti, Schede, Pagamenti, Documenti) e visualizzare conteggio utenti per ruolo.

## 📁 Percorso File

`src/components/dashboard/admin/admin-roles-content.tsx`

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

- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` da `@/components/ui/card`
- `Button`, `Input`, `Label`, `Badge` da `@/components/ui`
- `Skeleton` da `@/components/shared/ui/skeleton`

### Icons

- `Shield`, `Users`, `Edit`, `Save`, `X` da `lucide-react`

### Utils

- `notifySuccess`, `notifyError` da `@/lib/notifications`

### Componenti Interni

- `RolePermissionsEditor` da `./role-permissions-editor`

## ⚙️ Funzionalità

### Core

1. **Gestione Ruoli**: CRUD completo per ruoli
2. **Editor Permessi**: Editor per configurare permessi per categoria
3. **Categorie Permessi**: 6 categorie con permessi view/create/edit/delete
4. **Conteggio Utenti**: Mostra numero utenti per ruolo

### Categorie Permessi

1. **Utenti**: view, create, edit, delete
2. **Clienti**: view, create, edit, delete
3. **Appuntamenti**: view, create, edit, delete
4. **Schede Allenamento**: view, create, edit, delete
5. **Pagamenti**: view, create, edit, delete
6. **Documenti**: view, upload, delete

### Funzionalità Avanzate

- **CRUD Ruoli**: Create, Read, Update, Delete ruoli
- **Editor Permessi**: Componente RolePermissionsEditor per configurare permessi
- **Validazione**: Validazione nome ruolo obbligatorio
- **Notifiche**: Success/error notifications
- **Loading States**: Skeleton loading durante caricamento

### UI/UX

- Container con header
- Lista ruoli con card
- Form creazione/modifica ruolo
- Editor permessi integrato
- Badge conteggio utenti
- Bottoni azioni (edit, delete)

## 🎨 Struttura UI

```
div (container)
  ├── Header
  │   ├── Titolo
  │   └── Descrizione
  ├── Button Crea Ruolo
  ├── Grid Ruoli
  │   └── Card (per ogni ruolo)
  │       ├── Header (nome, badge utenti)
  │       ├── Descrizione
  │       ├── Editor Permessi (se editing)
  │       └── Azioni (edit, delete)
  └── Form Creazione/Modifica (se aperto)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AdminRolesContent } from '@/components/dashboard/admin/admin-roles-content'

export default function AdminRolesPage() {
  return <AdminRolesContent />
}
```

## 🔍 Note Tecniche

### Categorie Permessi

Definite in `PERMISSION_CATEGORIES` array con:

- Categoria nome
- Array permessi (key, label, description)

### Limitazioni

- Categorie permessi hardcoded (non configurabili)
- Solo 6 categorie (non estendibili facilmente)
- Permessi binari (true/false, non livelli)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
