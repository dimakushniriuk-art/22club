# Componente: CalendarHeader

## 📋 Descrizione

Componente header semplice per la pagina calendario. Mostra il titolo e una breve descrizione della sezione.

## 📁 Percorso File

`src/components/calendar/calendar-header.tsx`

## 🔧 Props

```typescript
interface CalendarHeaderProps {
  // Nessuna prop necessaria al momento, ma manteniamo l'interfaccia per future estensioni
}
```

### Dettaglio Props

- Nessuna prop al momento (interfaccia vuota mantenuta per future estensioni)

## 📦 Dipendenze

Nessuna dipendenza esterna (componente puro)

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Titolo**: Mostra "Calendario" come titolo principale
2. **Descrizione**: Mostra breve descrizione "Visualizza e gestisci i tuoi appuntamenti"

### UI/UX

- Layout responsive (flex-col su mobile, flex-row su desktop)
- Titolo con dimensioni responsive (text-2xl sm:text-3xl lg:text-4xl)
- Spacing ottimizzato con gap-4

## 🎨 Struttura UI

```
div (flex flex-col sm:flex-row)
  └── div
      ├── h1 "Calendario"
      └── p "Visualizza e gestisci i tuoi appuntamenti"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { CalendarHeader } from '@/components/calendar/calendar-header'

function CalendarPage() {
  return (
    <div>
      <CalendarHeader />
      {/* Resto del contenuto calendario */}
    </div>
  )
}
```

## 🔍 Note Tecniche

### Design

- Componente molto semplice e statico
- Interfaccia vuota mantenuta per permettere future estensioni (filtri, azioni, etc.)
- Estratto da `calendario/page.tsx` per migliorare manutenibilità

### Limitazioni

- Non gestisce azioni o filtri (potrebbe essere esteso in futuro)
- Contenuto completamente statico

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
