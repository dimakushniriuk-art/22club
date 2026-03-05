# 🔧 Guida Troubleshooting - 22Club

**Ultimo Aggiornamento**: 2025-02-02  
**Versione**: 1.0.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Problemi Comuni](#problemi-comuni)
3. [Errori Database](#errori-database)
4. [Errori Build](#errori-build)
5. [Errori Runtime](#errori-runtime)
6. [Performance Issues](#performance-issues)
7. [Deployment Issues](#deployment-issues)

---

## Panoramica

Questa guida copre i problemi più comuni e le loro soluzioni.

---

## Problemi Comuni

### Porta 3001 già in uso

**Errore**: `Port 3001 is already in use`

**Soluzione**:

```bash
# Kill processo sulla porta 3001
npm run kill-port

# Oppure manualmente
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:3001 | xargs kill
```

### Environment Variables mancanti

**Errore**: `NEXT_PUBLIC_SUPABASE_URL is not defined`

**Soluzione**:

```bash
# Verifica .env.local esiste
ls -la .env.local

# Copia da template
cp env.example .env.local

# Verifica variabili
npm run db:verify-config
```

---

## Errori Database

### Connection Error

**Errore**: `Failed to connect to Supabase`

**Soluzione**:

```bash
# Verifica URL e key
npm run db:test

# Verifica configurazione
npm run db:verify-config

# Test connessione diretta
npm run supabase:status
```

### RLS Policy Error

**Errore**: `new row violates row-level security policy`

**Soluzione**:

```bash
# Analizza RLS policies
npm run db:analyze-rls

# Verifica con auth
npm run db:verify-rls-auth

# Applica fix RLS
npm run db:apply-rls-fix
```

### Migration Error

**Errore**: `Migration failed`

**Soluzione**:

```bash
# Verifica migrazioni
supabase db diff

# Reset locale
supabase db reset

# Repair migrazioni
npm run db:repair-migrations
```

---

## Errori Build

### TypeScript Errors

**Errore**: `Type error: Property 'x' does not exist`

**Soluzione**:

```bash
# Fix automatico
npm run fix-ts-auto

# Verifica
npm run typecheck

# Fix manuale
npm run fix-ts
```

### ESLint Errors

**Errore**: `ESLint errors found`

**Soluzione**:

```bash
# Fix automatico
npm run lint:fix

# Verifica
npm run lint
```

### Build Failure

**Errore**: `Build failed`

**Soluzione**:

```bash
# Clean build
rm -rf .next
npm run build

# Verifica dipendenze
npm ci

# Build ottimizzato
npm run build:optimize
```

---

## Errori Runtime

### Hydration Error

**Errore**: `Hydration failed because the initial UI does not match`

**Soluzione**:

- Verifica server/client mismatch
- Usa `suppressHydrationWarning` se necessario
- Evita `useEffect` per rendering condizionale

### API Route Error

**Errore**: `500 Internal Server Error`

**Soluzione**:

```bash
# Verifica logs
# Vercel: Dashboard > Logs
# Docker: docker logs [container]

# Test endpoint
curl http://localhost:3001/api/health
```

---

## Performance Issues

### Slow Queries

**Problema**: Query lente

**Soluzione**:

```bash
# Analizza query
npm run db:analyze-complete

# Verifica indici
# Aggiungi indici su colonne usate frequentemente
```

### Bundle Size

**Problema**: Bundle troppo grande

**Soluzione**:

```bash
# Analizza bundle
npm run build:analyze

# Ottimizza
npm run build:optimize

# Verifica lazy loading
# Usa dynamic imports per componenti pesanti
```

---

## Deployment Issues

### Vercel Deploy Failed

**Errore**: `Deployment failed`

**Soluzione**:

1. Verifica build locale: `npm run build`
2. Verifica environment variables su Vercel
3. Controlla logs su Vercel Dashboard
4. Verifica Node version (20.12.2)

### Database Migration Failed

**Errore**: `Migration failed in production`

**Soluzione**:

```bash
# Test migrazione locale
supabase db reset
supabase db push

# Rollback produzione
# Vai su Supabase Dashboard > Database > Migrations
# Revert ultima migrazione
```

---

## Best Practices

1. **Always Test Locally**: Testa prima di deploy
2. **Check Logs**: Sempre controlla logs per errori
3. **Verify Environment**: Verifica env vars prima di deploy
4. **Backup Database**: Backup prima di migrazioni importanti
5. **Monitor Health**: Monitora `/api/health` endpoint

---

**Ultimo aggiornamento**: 2025-02-02
