# 22Club Setup

[![CI/CD](https://github.com/d.kushniriuk/22club-setup/actions/workflows/deploy.yml/badge.svg)](https://github.com/d.kushniriuk/22club-setup/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/d.kushniriuk/22club-setup/actions/workflows/codeql.yml/badge.svg)](https://github.com/d.kushniriuk/22club-setup/actions/workflows/codeql.yml)
[![E2E Tests](https://github.com/d.kushniriuk/22club-setup/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/d.kushniriuk/22club-setup/actions/workflows/e2e-tests.yml)
[![Coverage](https://codecov.io/gh/d.kushniriuk/22club-setup/branch/main/graph/badge.svg)](https://codecov.io/gh/d.kushniriuk/22club-setup)

Un'applicazione Next.js 15 moderna con TypeScript, Tailwind CSS e Supabase.

## 🚀 Build Status

Pipeline automatica:

- ✅ Lint e test su ogni commit
- 🚀 Deploy automatico su Vercel
- 🗄️ Migrazioni DB su Supabase
- 🔒 Security scanning con CodeQL
- 🧪 E2E tests con Playwright

## 🚀 Quick Start

1. **Clona il repository**

   ```bash
   git clone <repository-url>
   cd 22club-setup
   ```

2. **Installa le dipendenze**

   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**

   ```bash
   cp env.example .env.local
   ```

   Modifica `.env.local` con le tue credenziali Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Avvia il server di sviluppo**

   ```bash
   npm run dev
   ```

5. **Apri l'applicazione**
   Vai su [http://localhost:3000](http://localhost:3000)

## 🛠️ Tecnologie

- **Next.js 15** con App Router
- **TypeScript** strict mode
- **Tailwind CSS** con dark mode
- **Supabase** per backend e autenticazione
- **ESLint** + **Prettier** per code quality
- **Radix UI** per componenti accessibili

## 📁 Struttura Progetto

```
src/
├── app/                    # App Router pages
│   ├── page.tsx           # Homepage
│   ├── login/page.tsx     # Login page
│   └── layout.tsx         # Root layout
├── components/ui/          # UI components
│   ├── button.tsx
│   └── card.tsx
├── lib/                    # Utilities
│   ├── supabase/          # Supabase clients
│   │   ├── server.ts      # Server client
│   │   ├── middleware.ts  # Middleware client
│   │   └── types.ts       # Database types
│   └── utils.ts           # Utility functions
├── types/                  # TypeScript types
└── middleware.ts           # Next.js middleware
```

## 🔧 Scripts Disponibili

### Sviluppo

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Build per produzione
- `npm run start` - Avvia il server di produzione
- `npm run lint` - Esegue ESLint
- `npm run typecheck` - Controlla i tipi TypeScript
- `npm run format` - Formatta il codice con Prettier

### Testing

- `npm run test` - Esegue test unitari
- `npm run test:run` - Esegue test una volta
- `npm run test:coverage` - Esegue test con coverage
- `npm run test:e2e` - Esegue test E2E con Playwright
- `npm run test:all` - Esegue tutti i test

### CI/CD

- `npm run ci:deploy` - Pipeline completa (lint + typecheck + test + build)
- `npm run ci:lint` - Lint per CI
- `npm run ci:typecheck` - Typecheck per CI
- `npm run ci:test` - Test con coverage per CI
- `npm run ci:build` - Build per CI

## 🔐 Configurazione Supabase

1. Crea un nuovo progetto su [supabase.com](https://supabase.com)
2. Vai su Settings > API
3. Copia l'URL del progetto e la chiave anonima
4. Incollali nel file `.env.local`

## 📊 Gestione Clienti

Il modulo di **gestione clienti** è il cuore della dashboard staff, progettato per personal trainer che vogliono gestire i propri atleti in modo efficiente e professionale.

### Caratteristiche Principali

- ✅ **Ricerca real-time** con debounce intelligente
- ✅ **Filtri avanzati** (stato, data iscrizione, allenamenti, documenti)
- ✅ **Ordinamento colonne** con un click
- ✅ **Vista tabella & griglia** responsive per mobile
- ✅ **Paginazione server-side** (20 risultati/pagina)
- ✅ **Export CSV/PDF** per report e analisi
- ✅ **Azioni bulk** (email multipli, eliminazione)
- ✅ **Real-time updates** tramite Supabase
- ✅ **Accessibilità WCAG AA** completa
- ✅ **SEO ottimizzato** con meta tags e breadcrumb

### Accesso Rapido

```bash
# Avvia l'app e vai su:
http://localhost:3001/dashboard/clienti
```

### Documentazione Completa

Per la documentazione dettagliata del modulo clienti:
👉 [docs/CLIENTI_MANAGEMENT.md](docs/CLIENTI_MANAGEMENT.md)

Include:

- Architettura e stack tecnologico
- Database schema e migrazioni
- API hooks e componenti
- Testing e deployment
- Troubleshooting e best practices

### Migrazioni Database

Esegui le migrazioni per configurare il database:

```bash
# Applica le migrazioni
cd 22club-setup/supabase
supabase db push

# Migrazioni clienti:
# - 20251009_update_profiles_for_clienti.sql
# - 20251009_create_workout_logs.sql
# - 20251009_create_tags_system.sql
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📨 Gestione Inviti

Il modulo di **gestione inviti** permette ai personal trainer di invitare nuovi atleti sulla piattaforma in modo semplice e professionale.

### Caratteristiche Principali

- ✅ **Creazione inviti** con validazione Zod
- ✅ **Codici univoci** a 8 caratteri generati automaticamente
- ✅ **Scadenza configurabile** (3, 7, 14, 30 giorni)
- ✅ **Invio email** opzionale con checkbox
- ✅ **QR Code** generato per ogni invito
- ✅ **Link registrazione** copiabile con un click
- ✅ **Ricerca e filtri** (stato: inviati, registrati, scaduti)
- ✅ **Sorting** per data, nome, stato
- ✅ **Azioni bulk** (elimina multipli)
- ✅ **Export CSV** per analisi
- ✅ **Breadcrumb e accessibilità** completa

### Accesso Rapido

```bash
# Avvia l'app e vai su:
http://localhost:3001/dashboard/invita-atleta
```

### Documentazione Completa

Per la documentazione dettagliata del modulo inviti:
👉 [docs/INVITI_MANAGEMENT.md](docs/INVITI_MANAGEMENT.md)

Include:

- Flusso inviti e stati
- Validazione e sicurezza
- QR Code e condivisione
- Testing e best practices

## 💪 Gestione Allenamenti

Il modulo **Gestione Allenamenti** permette ai personal trainer di monitorare, gestire e analizzare le sessioni di allenamento dei propri atleti in tempo reale.

### Caratteristiche Principali

- ✅ **Dashboard statistiche** in tempo reale (oggi, completati, in corso, programmati)
- ✅ **Ricerca real-time** con debounce per atleta o nome scheda
- ✅ **Filtri avanzati** per periodo (oggi/settimana/mese) o date personalizzate
- ✅ **Ordinamento flessibile** per data, atleta, durata
- ✅ **Modal dettagli completo** con info allenamento, progress bar e note
- ✅ **Export CSV** per analisi esterna
- ✅ **Real-time updates** tramite Supabase subscriptions
- ✅ **Gestione completa** con azioni CRUD (visualizza, modifica, elimina)
- ✅ **Breadcrumb e accessibilità** completa con aria-labels
- ✅ **Testing E2E** completo con Playwright

### Accesso Rapido

```bash
# Avvia l'app e vai su:
http://localhost:3001/dashboard/allenamenti
```

### Documentazione Completa

Per la documentazione dettagliata del modulo allenamenti:
👉 [docs/allenamenti.md](docs/allenamenti.md)

Include:

- Architettura e database schema
- Hook e validazioni
- Componenti UI
- Flow utente completo
- Testing e miglioramenti futuri

## 🎯 Nuove Funzionalità (Production Ready)

### Modali Dashboard Personal Trainer

4 modali funzionali completamente implementate:

1. **Crea Appuntamento** (`/dashboard`)
   - Selezione atleta, data/ora, tipo appuntamento
   - Validazione form completa
   - Insert diretto in database `appointments`

2. **Registra Pagamento** (`/dashboard`)
   - Inserimento pagamento e aggiornamento contatore lezioni
   - Supporto multipli metodi di pagamento
   - Doppio insert: `payments` + `lesson_counters`

3. **Assegna Scheda** (`/dashboard/allenamenti`)
   - Creazione e assegnazione workout plan
   - Date di validità configurabili
   - Insert in tabella `workout_plans`

4. **Carica Documento** (`/dashboard/documenti`)
   - Upload file su Supabase Storage
   - Categorie documenti (certificati medici, etc.)
   - Rollback automatico su errore
   - Insert metadata in `documents`

### Ottimizzazioni Performance

- ✅ Lazy loading modali (-200KB bundle size)
- ✅ Code splitting con React.lazy
- ✅ Error Boundaries su tutti i layout
- ✅ Skeleton loading states

### Sicurezza

- ✅ Autenticazione reale attivata (DEMO MODE rimosso)
- ✅ Redirect ruoli funzionante
- ✅ RLS policies attive

## 📝 Note

- Il file `.env.local` non viene committato per sicurezza
- Usa `env.example` come template per le variabili d'ambiente
- Il progetto è configurato con TypeScript strict mode
- Tailwind CSS è configurato con dark mode support
- Row Level Security (RLS) attivo su tutte le tabelle Supabase
- Console.log limitati solo in development mode
