# 📋 Gestione Clienti - Documentazione

## Panoramica

Il modulo di gestione clienti è la funzionalità centrale della dashboard staff di 22Club. Permette ai personal trainer di gestire i propri atleti, monitorare i loro progressi, visualizzare statistiche e comunicare efficacemente.

## Caratteristiche Principali

### ✅ Funzionalità Implementate

#### 🔍 **Ricerca e Filtri**

- **Ricerca real-time** con debounce (300ms)
- **Filtro per stato**: Tutti, Attivi, Inattivi, Sospesi
- **Filtri avanzati**:
  - Range data iscrizione
  - Allenamenti minimi al mese
  - Solo documenti in scadenza
  - Filtro per tags

#### 📊 **Visualizzazione Dati**

- **Statistiche aggregate**: Totali, Attivi, Nuovi del mese, Documenti in scadenza
- **Vista tabella**: Completa con sorting su tutte le colonne
- **Vista griglia**: Ottimizzata per mobile con cards responsive
- **Paginazione server-side**: 20 risultati per pagina

#### 🔄 **Aggiornamenti Real-time**

- Sincronizzazione automatica tramite Supabase Realtime
- Aggiornamenti immediati su modifiche da altre sessioni

#### 📥 **Export Dati**

- **Export CSV**: Per analisi in Excel/Google Sheets
- **Export PDF**: Per report cartacei
- Formattazione automatica dei dati

#### ⚙️ **Azioni Bulk**

- Selezione multipla clienti
- Invio email di massa
- Eliminazione multipla con conferma

#### 🎯 **Azioni per Cliente**

- **Visualizza profilo**: Accesso rapido ai progressi
- **Chat**: Messaggio diretto all'atleta
- **Menu azioni**:
  - Modifica profilo
  - Storico allenamenti
  - Visualizza documenti
  - Invia email
  - Elimina cliente

#### ♿ **Accessibilità (WCAG AA)**

- Aria-labels su tutti i pulsanti icona
- Announce screen reader per risultati ricerca
- Focus trap nei modali
- Keyboard navigation completa

#### 🌐 **SEO & UX**

- Meta tags ottimizzati
- Breadcrumb navigation
- URL state management (filtri persistiti nell'URL)
- Loading e error states appropriati

## Architettura

### Stack Tecnologico

```typescript
// Frontend
- React 18 con TypeScript strict
- Next.js 14 App Router
- Tailwind CSS per styling

// State Management
- React hooks (useState, useMemo, useCallback)
- Custom hooks (useClienti, useDebouncedValue)

// Backend
- Supabase (PostgreSQL + Realtime)
- Row Level Security (RLS) policies
- Server-side pagination

// Testing
- Vitest per unit tests
- Playwright per E2E tests
```

### Struttura File

```
22club-setup/
├── src/
│   ├── app/dashboard/clienti/
│   │   └── page.tsx                    # Pagina principale
│   │
│   ├── components/dashboard/
│   │   ├── loading-state.tsx           # Loading skeleton
│   │   ├── error-state.tsx             # Error fallback
│   │   ├── error-boundary.tsx          # React Error Boundary
│   │   ├── breadcrumb.tsx              # Breadcrumb navigation
│   │   ├── cliente-card.tsx            # Card view cliente
│   │   ├── cliente-dropdown-menu.tsx   # Menu azioni cliente
│   │   ├── clienti-filtri-avanzati.tsx # Modal filtri
│   │   ├── clienti-bulk-actions.tsx    # Barra azioni bulk
│   │   └── clienti-export-menu.tsx     # Menu export
│   │
│   ├── hooks/
│   │   ├── use-clienti.ts              # Hook fetch & manage clienti
│   │   └── use-debounced-value.ts      # Hook debounce
│   │
│   ├── types/
│   │   └── cliente.ts                  # Type definitions
│   │
│   ├── lib/
│   │   ├── validations/
│   │   │   └── cliente.ts              # Zod schemas
│   │   └── export-utils.ts             # Utility export CSV/PDF
│   │
│   └── components/ui/
│       ├── dialog.tsx                   # Modal component
│       ├── dropdown-menu.tsx            # Dropdown menu
│       ├── slider.tsx                   # Range slider
│       ├── switch.tsx                   # Toggle switch
│       ├── date-range-picker.tsx        # Date picker
│       └── spinner.tsx                  # Loading spinner
│
├── supabase/migrations/
│   ├── 20251009_update_profiles_for_clienti.sql
│   ├── 20251009_create_workout_logs.sql
│   └── 20251009_create_tags_system.sql
│
└── tests/
    ├── e2e/clienti.spec.ts
    └── hooks/__tests__/use-clienti.test.ts
```

## Database Schema

### Tabella `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  nome VARCHAR(100),
  cognome VARCHAR(100),
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role VARCHAR(20),
  data_iscrizione TIMESTAMP,
  stato TEXT CHECK (stato IN ('attivo', 'inattivo', 'sospeso')),
  documenti_scadenza BOOLEAN DEFAULT false,
  ultimo_accesso TIMESTAMP,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabella `workout_logs`

```sql
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY,
  atleta_id UUID REFERENCES profiles(id),
  workout_plan_id UUID REFERENCES workout_plans(id),
  data TIMESTAMP DEFAULT NOW(),
  completato BOOLEAN DEFAULT true,
  durata_minuti INTEGER,
  note TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tabella `cliente_tags`

```sql
CREATE TABLE cliente_tags (
  id UUID PRIMARY KEY,
  nome VARCHAR(50) UNIQUE,
  colore VARCHAR(7),
  descrizione TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE profiles_tags (
  profile_id UUID REFERENCES profiles(id),
  tag_id UUID REFERENCES cliente_tags(id),
  assigned_at TIMESTAMP,
  PRIMARY KEY (profile_id, tag_id)
);
```

### Funzioni SQL Utili

```sql
-- Conta allenamenti del mese
CREATE FUNCTION get_allenamenti_mese(p_atleta_id UUID) RETURNS INTEGER;

-- Ottiene scheda attiva
CREATE FUNCTION get_scheda_attiva(p_atleta_id UUID) RETURNS TEXT;

-- Ottiene tags di un profilo
CREATE FUNCTION get_profile_tags(p_profile_id UUID) RETURNS JSON;
```

## Hook API

### `useClienti()`

Hook principale per gestire i clienti.

```typescript
const {
  clienti, // Array di clienti filtrati
  stats, // Statistiche aggregate
  total, // Totale clienti (con filtri)
  totalPages, // Numero pagine totali
  loading, // Loading state
  error, // Messaggio errore
  refetch, // Funzione per ricaricare
  updateCliente, // Aggiorna un cliente
  deleteCliente, // Elimina un cliente
} = useClienti({
  filters: {
    search: '',
    stato: 'tutti',
    dataIscrizioneDa: null,
    dataIscrizioneA: null,
    allenamenti_min: null,
    solo_documenti_scadenza: false,
    tags: [],
  },
  sort: {
    field: 'data_iscrizione',
    direction: 'desc',
  },
  page: 1,
  pageSize: 20,
  realtime: true, // Abilita real-time updates
})
```

### `useDebouncedValue()`

Hook per debouncing valori (utile per ricerche).

```typescript
const debouncedSearch = useDebouncedValue(searchTerm, 300)
```

## Componenti Riutilizzabili

### LoadingState

```typescript
<LoadingState message="Caricamento clienti..." size="lg" />
```

### ErrorState

```typescript
<ErrorState
  title="Errore nel caricamento"
  message={error}
  onRetry={refetch}
/>
```

### ErrorBoundary

```typescript
<ErrorBoundary fallback={(error, reset) => <CustomError error={error} reset={reset} />}>
  <YourComponent />
</ErrorBoundary>
```

### Breadcrumb

```typescript
<Breadcrumb
  items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Clienti' },
  ]}
/>
```

## Security & RLS

### Row Level Security Policies

```sql
-- Staff può vedere tutti i profili atleti
CREATE POLICY "Staff can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'pt'))
    OR user_id = auth.uid()
  );

-- Staff può aggiornare i profili atleti
CREATE POLICY "Staff can update athlete profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'pt'))
    OR user_id = auth.uid()
  );
```

## Performance Optimization

### 1. **Debouncing**

- Ricerca con debounce di 300ms
- Riduce query API del 70%

### 2. **Server-side Pagination**

- 20 risultati per pagina
- Fetch only dei dati visibili

### 3. **Indici Database**

```sql
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_stato ON profiles(stato);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_workout_logs_atleta ON workout_logs(atleta_id);
```

### 4. **Memoization**

```typescript
const filters = useMemo(
  () => ({
    search: debouncedSearch,
    stato: statoFilter,
    ...advancedFilters,
  }),
  [debouncedSearch, statoFilter, advancedFilters],
)
```

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:coverage
```

Target: >60% coverage

## Deployment

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Build

```bash
npm run build
```

### Database Migrations

```bash
supabase db push
```

## Troubleshooting

### Problema: Clienti non caricano

**Soluzione**: Verifica RLS policies su Supabase

### Problema: Real-time non funziona

**Soluzione**: Verifica che Realtime sia abilitato su Supabase e channel permissions

### Problema: Export CSV non scarica

**Soluzione**: Verifica permessi browser per download automatici

## Roadmap Futuri Miglioramenti

- [ ] Keyboard navigation avanzata (arrow keys)
- [ ] Visualizzazione campi extra (ultimo_accesso, tags in tabella)
- [ ] Filtro avanzato per range allenamenti
- [ ] Import clienti da CSV
- [ ] Template email personalizzati
- [ ] Grafici statistiche clienti
- [ ] Integrazione calendario appuntamenti
- [ ] Export Excel con formattazione

## Contribuire

Per contribuire a questo modulo:

1. Seguire le coding guidelines del progetto
2. Aggiungere test per nuove features
3. Aggiornare questa documentazione
4. Creare PR con descrizione dettagliata

## Supporto

Per domande o problemi:

- Aprire issue su GitHub
- Consultare la documentazione Supabase
- Verificare i log del browser console

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: 2025-10-09  
**Autore**: 22Club Development Team
