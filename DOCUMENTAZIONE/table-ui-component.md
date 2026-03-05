# Componente: Table (UI Base)

## 📋 Descrizione

Componente tabella principale del design system con sub-componenti (Header, Body, Footer, Row, Head, Cell, Caption). Supporta hover effects, selected state e layout responsive. Utilizzato per dati tabellari, liste e report.

## 📁 Percorso File

`src/components/ui/table.tsx`

## 🔧 Props

Tutti i componenti estendono le props HTML standard per i rispettivi elementi.

### Sub-components

- `Table` - Container principale con overflow
- `TableHeader` - Header section (thead)
- `TableBody` - Body section (tbody)
- `TableFooter` - Footer section (tfoot)
- `TableRow` - Row (tr)
- `TableHead` - Header cell (th)
- `TableCell` - Data cell (td)
- `TableCaption` - Caption

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Table Structure**: Struttura tabella HTML standard
2. **Overflow Handling**: Container con overflow-auto per scroll
3. **Hover Effects**: Hover su righe
4. **Selected State**: Stato selezionato per righe
5. **Border Styling**: Bordi coordinati
6. **Sub-components**: Header, Body, Footer, Row, Head, Cell, Caption

### Funzionalità Avanzate

- **Responsive Overflow**: Scroll orizzontale per tabelle larghe
- **Hover States**: Hover con background-tertiary
- **Selected State**: Data attribute per stato selezionato
- **Border Management**: Bordi dinamici (ultima riga senza border)
- **Checkbox Support**: Supporto per checkbox in celle

### UI/UX

- Tabella con overflow-auto
- Hover effects su righe
- Border coordinati
- Spacing consistente
- Layout responsive

## 🎨 Struttura UI

```
Table (div con overflow-auto)
  └── Table Element
      ├── TableCaption (opzionale)
      ├── TableHeader
      │   └── TableRow
      │       └── TableHead[]
      ├── TableBody
      │   └── TableRow[]
      │       └── TableCell[]
      └── TableFooter (opzionale)
          └── TableRow
              └── TableCell[]
```

## 💡 Esempi d'Uso

```tsx
// Tabella base
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Ruolo</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Mario Rossi</TableCell>
      <TableCell>mario@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>

// Tabella con caption e footer
<Table>
  <TableCaption>Lista utenti</TableCaption>
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Totale: 10</TableCell>
    </TableRow>
  </TableFooter>
</Table>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- Container con overflow-auto per scroll orizzontale
- Hover effects con bg-background-tertiary/50
- Selected state con data-[state=selected]
- Border management: ultima riga senza border-bottom
- Checkbox support: padding-right 0 se contiene checkbox
- Footer con background-secondary/50
- Caption con text-tertiary
- Spacing consistente (px-4, py-2)
- Layout responsive
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
