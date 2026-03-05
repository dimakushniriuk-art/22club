# Componente: AthleteAnagraficaTab

## 📋 Descrizione

Tab anagrafica per profilo atleta (vista PT). Visualizza e modifica dati anagrafici atleta (nome, cognome, email, telefono, data nascita, indirizzo, codice fiscale, ecc.) con form editabile e integrazione Supabase.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-anagrafica-tab.tsx`

## 🔧 Props

```typescript
interface AthleteAnagraficaTabProps {
  athleteId: string
}
```

### Dettaglio Props

- **`athleteId`** (string, required): ID atleta

## 📦 Dipendenze

### React Hooks

- Custom hooks: `useAthleteAnagrafica`, `useAthleteAnagraficaForm`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button`, `Input`, `Label` da `@/components/ui`
- `LoadingState`, `ErrorState` da `@/components/dashboard`

### Icons

- `User`, `Mail`, `Phone`, `Calendar`, `MapPin`, `Edit`, `Save`, `X`, `AlertCircle` da `lucide-react`

### Utils

- `sanitizeString`, `sanitizeEmail`, `sanitizePhone`, `sanitizeNumber` da `@/lib/sanitize`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Dati**: Mostra dati anagrafici atleta
2. **Modifica Dati**: Form editabile con validazione
3. **Salvataggio**: Integrazione Supabase per salvare modifiche
4. **Sanitizzazione**: Sanitizzazione input per sicurezza

### Campi Form

- Informazioni Personali: Nome, Cognome, Data Nascita, Luogo Nascita, Codice Fiscale, Sesso
- Contatti: Email, Telefono, Indirizzo, Città, CAP, Provincia, Nazione
- Altri campi anagrafici

### Funzionalità Avanzate

- **Loading State**: Mostra loading durante caricamento
- **Error State**: Gestisce errori caricamento
- **Empty State**: Messaggio se nessun dato
- **Validazione**: Validazione client-side
- **Sanitizzazione**: Sanitizzazione input

### UI/UX

- Header con titolo e bottone modifica
- Card organizzate per sezioni
- Form responsive
- Bottoni salva/annulla

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Header (flex justify-between)
  │   ├── Titolo + Descrizione
  │   └── Button Modifica
  └── Grid Form (2 colonne)
      ├── Card Informazioni Personali
      └── Card Contatti
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteAnagraficaTab } from '@/components/dashboard/athlete-profile/athlete-anagrafica-tab'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  return <AthleteAnagraficaTab athleteId={athleteId} />
}
```

## 🔍 Note Tecniche

### Hooks Utilizzati

- `useAthleteAnagrafica`: Carica dati anagrafici
- `useAthleteAnagraficaForm`: Gestisce form e salvataggio

### Limitazioni

- Dipende da hooks custom (non standalone)
- Validazione solo client-side

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
