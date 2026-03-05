# Componente: ClientiTableView

## 📋 Descrizione

Componente per visualizzare clienti in vista tabella. Include selezione multipla, ordinamento, paginazione, badge stato, formattazione date e dropdown menu azioni per ogni cliente.

## 📁 Percorso File

`src/components/dashboard/clienti/clienti-table-view.tsx`

## 🔧 Props

```typescript
interface ClientiTableViewProps {
  clienti: Cliente[]
  selectedIds: Set<string>
  sort: ClienteSort
  total: number
  page: number
  totalPages: number
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectOne: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void
  onSort: (field: ClienteSort['field']) => void
  onPageChange: (page: number) => void
  onEdit: (cliente: Cliente) => void
  onViewHistory: (cliente: Cliente) => void
  onViewDocuments: (cliente: Cliente) => void
  onSendEmail: (cliente: Cliente) => void
  onDelete: (cliente: Cliente) => void
}
```

### Dettaglio Props

- **`clienti`** (Cliente[], required): Array clienti da visualizzare
- **`selectedIds`** (Set<string>, required): Set ID clienti selezionati
- **`sort`** (ClienteSort, required): Configurazione ordinamento corrente
- **`total`** (number, required): Numero totale clienti
- **`page`** (number, required): Pagina corrente
- **`totalPages`** (number, required): Totale pagine
- **`onSelectAll`** (function, required): Callback seleziona tutti
- **`onSelectOne`** (function, required): Callback seleziona uno
- **`onSort`** (function, required): Callback ordinamento
- **`onPageChange`** (function, required): Callback cambio pagina
- **`onEdit`** (function, required): Callback modifica cliente
- **`onViewHistory`** (function, required): Callback storico
- **`onViewDocuments`** (function, required): Callback documenti
- **`onSendEmail`** (function, required): Callback invia email
- **`onDelete`** (function, required): Callback elimina cliente

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### Next.js

- `Link` da `next/link`

### UI Components

- `Button`, `Badge`, `Checkbox` da `@/components/ui`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` da `@/components/ui`

### Icons

- `User`, `Mail`, `Phone`, `Calendar`, `MessageSquare`, `MoreVertical`, `ArrowUpDown`, `ArrowUp`, `ArrowDown`, `CheckCircle`, `AlertCircle` da `lucide-react`

### Componenti Interni

- `ClienteDropdownMenu` da `@/components/dashboard/cliente-dropdown-menu`

### Types

- `Cliente`, `ClienteSort` da `@/types/cliente`

## ⚙️ Funzionalità

### Core

1. **Tabella Clienti**: Visualizza clienti in formato tabella
2. **Selezione Multipla**: Checkbox per selezionare clienti
3. **Ordinamento**: Click header per ordinare (nome, data iscrizione, stato, allenamenti)
4. **Paginazione**: Navigazione tra pagine
5. **Azioni Cliente**: Dropdown menu con azioni per ogni cliente

### Colonne Tabella

- **Checkbox**: Selezione multipla
- **Cliente**: Nome, email, telefono con avatar
- **Contatti**: Email e telefono
- **Iscrizione**: Data formattata (ordinabile)
- **Stato**: Badge colorato (ordinabile)
- **Allenamenti/mese**: Numero (ordinabile)
- **Azioni**: Dropdown menu

### Funzionalità Avanzate

- **Sort Icons**: ArrowUpDown (inattivo), ArrowUp (asc), ArrowDown (desc)
- **Badge Stato**: Colori semantici (success, primary, warning)
- **Formattazione Date**: Formato italiano (giorno, mese, anno)
- **Avatar**: Avatar cliente con fallback
- **Paginazione**: Bottoni prev/next con numeri pagina

### UI/UX

- Tabella responsive con scroll orizzontale
- Header con icona e conteggio
- Checkbox per selezione
- Icone ordinamento interattive
- Badge stato colorati
- Dropdown menu azioni

## 🎨 Struttura UI

```
div (p-6)
  ├── Header
  │   ├── Icona User
  │   └── Titolo "Lista Clienti (X)"
  └── Table
      ├── TableHeader
      │   └── TableRow
      │       ├── Checkbox Select All
      │       └── TableHead (per ogni colonna, clickable per sort)
      └── TableBody
          └── TableRow (per ogni cliente)
              ├── Checkbox Select
              ├── TableCell Cliente (avatar, nome, email, phone)
              ├── TableCell Contatti
              ├── TableCell Iscrizione
              ├── TableCell Stato (badge)
              ├── TableCell Allenamenti
              └── TableCell Azioni (dropdown menu)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ClientiTableView } from '@/components/dashboard/clienti/clienti-table-view'

function ClientsPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<ClienteSort>({ field: 'nome', direction: 'asc' })

  return (
    <ClientiTableView
      clienti={clienti}
      selectedIds={selectedIds}
      sort={sort}
      total={total}
      page={page}
      totalPages={totalPages}
      onSelectAll={(e) => {
        // Logica select all
      }}
      onSelectOne={(id, e) => {
        // Logica select one
      }}
      onSort={(field) => {
        // Logica sort
      }}
      onPageChange={(page) => {
        // Logica paginazione
      }}
      onEdit={(cliente) => {
        // Logica edit
      }}
      // ... altri callbacks
    />
  )
}
```

## 🔍 Note Tecniche

### Ordinamento

- Campi ordinabili: `nome`, `data_iscrizione`, `stato`, `allenamenti_mese`
- Icone dinamiche basate su `sort.field` e `sort.direction`
- Click header chiama `onSort(field)`

### Badge Stato

- **attivo**: Badge verde con CheckCircle
- **inattivo**: Badge blu
- **sospeso**: Badge giallo

### Formattazione Date

```typescript
new Date(dataString).toLocaleDateString('it-IT', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
```

### Limitazioni

- Paginazione gestita dal parent (non interna)
- Ordinamento gestito dal parent (non interno)
- Callbacks devono essere implementati nel parent

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
