# 🚀 Guida Deployment - 22Club

**Ultimo Aggiornamento**: 2025-02-02  
**Versione**: 1.0.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Prerequisiti](#prerequisiti)
3. [Deployment Vercel](#deployment-vercel)
4. [Deployment Docker](#deployment-docker)
5. [Configurazione Ambiente](#configurazione-ambiente)
6. [Migrazioni Database](#migrazioni-database)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Post-Deployment](#post-deployment)
9. [Rollback](#rollback)
10. [Troubleshooting](#troubleshooting)

---

## Panoramica

22Club supporta deployment su **Vercel** (consigliato) e **Docker** (self-hosted). La pipeline CI/CD automatizza build, test, security scan e deploy.

### Stack Deployment

- **Platform**: Vercel (Next.js optimized) o Docker
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (opzionale)

---

## Prerequisiti

### Account e Servizi Richiesti

1. **Vercel Account** (per deployment Vercel)
   - Vercel CLI installato: `npm i -g vercel`
   - Token Vercel: Settings > Tokens

2. **Supabase Project** (database)
   - Progetto creato su [supabase.com](https://supabase.com)
   - Access Token: Settings > Access Tokens

3. **GitHub Repository** (CI/CD)
   - Repository configurato
   - Secrets configurati (vedi `.github/SECRETS.md`)

### Variabili d'Ambiente

Copia `env.example` e configura:

```bash
cp env.example .env.local
```

**Variabili Obbligatorie**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

**Variabili Opzionali**:

- `NEXT_PUBLIC_VAPID_KEY` (push notifications)
- `NEXT_PUBLIC_SENTRY_DSN` (monitoring)

---

## Deployment Vercel

### Setup Iniziale

1. **Link Progetto Vercel**:

   ```bash
   vercel link
   ```

2. **Configura Environment Variables**:
   - Vai su Vercel Dashboard > Project Settings > Environment Variables
   - Aggiungi tutte le variabili da `env.example`

3. **Deploy Manuale**:
   ```bash
   vercel --prod
   ```

### Deployment Automatico (CI/CD)

Il workflow `.github/workflows/deploy.yml` esegue automaticamente:

1. **Build & Test**:
   - Lint, TypeScript check
   - Unit tests con coverage
   - Build applicazione

2. **Security Scan**:
   - `npm audit`
   - Snyk scan (se configurato)

3. **Deploy Vercel**:
   - Deploy automatico su push a `main` o `release/*`
   - Commenta URL deployment su PR

4. **Migrazioni Database**:
   - Esegue `supabase db push` dopo deploy

### Configurazione Vercel

**Build Settings**:

- Framework Preset: Next.js
- Build Command: `npm run build:prod`
- Output Directory: `.next`
- Install Command: `npm ci`

**Environment Variables**:

- Production: Tutte le variabili da `env.example`
- Preview: Stesse variabili (o override per staging)

---

## Deployment Docker

### Build Immagine

```bash
# Build immagine
docker build -f Dockerfile.production -t 22club:latest .

# Test locale
docker run -p 3001:3001 --env-file .env.local 22club:latest
```

### Docker Compose

```bash
# Avvia stack completo
docker-compose -f docker-compose.production.yml up -d

# Logs
docker-compose -f docker-compose.production.yml logs -f

# Stop
docker-compose -f docker-compose.production.yml down
```

### Configurazione Docker

**Dockerfile.production**:

- Multi-stage build (builder + runner)
- Utente non-root (`nextjs`)
- Health check: `/api/health`
- Porta: `3001`

**docker-compose.production.yml**:

- Service `app`: Next.js application
- Service `nginx`: Reverse proxy (opzionale)
- Network: `22club-network`
- Health check: 30s interval

---

## Configurazione Ambiente

### Environment Variables

**Produzione**:

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
CRON_SECRET=xxx
```

**Staging**:

```env
NODE_ENV=production
# Usa progetto Supabase separato per staging
NEXT_PUBLIC_SUPABASE_URL=https://xxx-staging.supabase.co
```

### Verifica Configurazione

```bash
# Verifica Supabase
npm run db:verify

# Verifica tutte le configurazioni
npm run verify:all

# Health check
curl http://localhost:3001/api/health
```

---

## Migrazioni Database

### Pre-Deployment

1. **Verifica Migrazioni**:

   ```bash
   supabase db diff
   ```

2. **Test Locale**:
   ```bash
   supabase db reset
   supabase db push
   ```

### Deployment Automatico

Il workflow CI/CD esegue automaticamente:

```yaml
# .github/workflows/deploy.yml
- name: Push database migrations
  run: supabase db push
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### Migrazioni Manuali

```bash
# Link progetto
supabase link --project-ref $PROJECT_REF

# Push migrazioni
supabase db push

# Verifica
supabase db diff
```

---

## CI/CD Pipeline

### Workflow GitHub Actions

**File**: `.github/workflows/deploy.yml`

**Jobs**:

1. `build_and_test`: Lint, typecheck, test, build
2. `security_scan`: npm audit, Snyk
3. `deploy_vercel`: Deploy su Vercel
4. `migrate_supabase`: Migrazioni database

### Trigger

- **Push a `main`**: Deploy produzione
- **Push a `release/*`**: Deploy produzione
- **Pull Request**: Build e test (no deploy)

### Secrets Richiesti

Configura in GitHub > Settings > Secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SNYK_TOKEN` (opzionale)

---

## Post-Deployment

### Verifica Deployment

1. **Health Check**:

   ```bash
   curl https://your-domain.vercel.app/api/health
   ```

2. **Test Funzionalità**:
   - Login
   - Dashboard
   - CRUD operazioni

3. **Verifica Database**:
   ```bash
   npm run db:verify
   ```

### Monitoring

- **Vercel Analytics**: Automatico su Vercel
- **Sentry**: Configura `NEXT_PUBLIC_SENTRY_DSN`
- **Health Endpoint**: `/api/health`

---

## Rollback

### Vercel Rollback

1. **Dashboard Vercel**:
   - Vai su Deployments
   - Trova deployment precedente
   - Clicca "Promote to Production"

2. **CLI**:
   ```bash
   vercel rollback [deployment-url]
   ```

### Database Rollback

```bash
# Ripristina migrazione specifica
supabase migration repair [migration-name] --status reverted

# Oppure rollback manuale SQL
psql -h [host] -U [user] -d [db] -f rollback.sql
```

---

## Troubleshooting

### Build Failures

**Errore**: TypeScript errors

```bash
# Fix automatico
npm run fix-ts-auto

# Verifica
npm run typecheck
```

**Errore**: ESLint errors

```bash
# Fix automatico
npm run lint:fix
```

### Deployment Failures

**Errore**: Environment variables mancanti

- Verifica Vercel Dashboard > Environment Variables
- Assicurati che tutte le variabili siano configurate

**Errore**: Database connection

- Verifica `NEXT_PUBLIC_SUPABASE_URL`
- Verifica `SUPABASE_SERVICE_ROLE_KEY`
- Test connessione: `npm run db:test`

### Performance Issues

**Lighthouse Score Basso**:

```bash
# Analizza bundle
npm run build:analyze

# Ottimizza build
npm run build:optimize
```

---

## Best Practices

1. **Sempre testare localmente** prima di deploy
2. **Usa staging environment** per test pre-produzione
3. **Monitora health endpoint** dopo ogni deploy
4. **Backup database** prima di migrazioni importanti
5. **Documenta breaking changes** nelle migrazioni

---

**Ultimo aggiornamento**: 2025-02-02
