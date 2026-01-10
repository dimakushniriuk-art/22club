# ✅ Checklist Pre-Commit e Pre-Deploy - 22Club

**Data Creazione**: 2025-01-27  
**Ultimo Aggiornamento**: 2025-01-27

---

## 🚨 STATO ATTUALE

### ⚠️ Warning Build (Non Bloccanti)
- ✅ `twilio` - Modulo opzionale, gestito con try-catch e fallback
- ✅ `web-push` - Modulo opzionale, gestito con try-catch e fallback

**Nota**: Questi warning sono accettabili perché i moduli sono importati dinamicamente solo quando necessari e hanno fallback per sviluppo.

---

## 📋 CHECKLIST PRE-COMMIT

### 1. ✅ Verifica Build
```bash
npm run build
```
- [x] Build completa senza errori ✅
- [x] Warning accettabili (twilio/web-push opzionali) ✅
- [x] Nessun errore TypeScript ✅ (verificato)
- [x] Nessun errore di compilazione ✅

### 2. ✅ Verifica Linting
```bash
npm run lint
```
- [x] Nessun errore di linting
- [ ] Nessun warning critico
- [ ] Codice formattato correttamente

### 3. ✅ Verifica TypeScript
```bash
npm run typecheck
```
- [ ] Nessun errore TypeScript
- [ ] Tipi corretti
- [ ] Nessun `any` non necessario

### 4. ✅ Test (Opzionale ma Consigliato)
```bash
npm run test:run
```
- [ ] Test unitari passano
- [ ] Test di integrazione passano
- [ ] Coverage accettabile (>70%)

### 5. ✅ Verifica Git Status
```bash
git status
```
- [ ] File modificati reviewati
- [ ] File non necessari non committati
- [ ] `.env.local` non committato (già in .gitignore)
- [ ] File di test temporanei rimossi

### 6. ✅ Verifica File Sensibili
- [ ] Nessuna chiave API nel codice
- [ ] Nessuna password hardcoded
- [ ] Variabili d'ambiente usate correttamente
- [ ] `.env.local` non tracciato

### 7. ✅ Verifica Dipendenze
```bash
npm audit
```
- [ ] Nessuna vulnerabilità critica
- [ ] Dipendenze aggiornate se necessario
- [ ] `package-lock.json` aggiornato

---

## 🚀 CHECKLIST PRE-DEPLOY

### 1. ✅ Variabili d'Ambiente Produzione

#### Supabase (OBBLIGATORIE)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Configurata
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Configurata
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Configurata (server-side only)

#### App Configuration (OBBLIGATORIE)
- [ ] `NEXT_PUBLIC_APP_URL` - URL produzione (es: `https://22club.it`)
- [ ] `NODE_ENV=production` - Impostata

#### Email (OBBLIGATORIE per comunicazioni)
- [ ] `RESEND_API_KEY` - Configurata
- [ ] `RESEND_FROM_EMAIL` - Email verificata
- [ ] `RESEND_FROM_NAME` - Configurata

#### Push Notifications (OPZIONALI)
- [ ] `NEXT_PUBLIC_VAPID_KEY` - Configurata (se usi push)
- [ ] `VAPID_PRIVATE_KEY` - Configurata (se usi push)
- [ ] `VAPID_EMAIL` - Configurata (se usi push)

#### SMS (OPZIONALI)
- [ ] `TWILIO_ACCOUNT_SID` - Configurata (se usi SMS)
- [ ] `TWILIO_AUTH_TOKEN` - Configurata (se usi SMS)
- [ ] `TWILIO_PHONE_NUMBER` - Configurata (se usi SMS)

#### Sentry (OPZIONALI ma Consigliati)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Configurata
- [ ] `SENTRY_DSN` - Configurata

#### Altri
- [ ] `CRON_SECRET` - Configurata (se usi cron jobs)

### 2. ✅ Build Produzione
```bash
npm run build:prod
```
- [ ] Build completa senza errori
- [ ] Bundle size ottimizzato
- [ ] Nessun warning critico
- [ ] Static assets generati correttamente

### 3. ✅ Verifica Database Supabase

#### Migrazioni
- [ ] Tutte le migrazioni applicate
- [ ] Database schema aggiornato
- [ ] Nessuna migrazione pendente

#### RLS Policies
- [ ] Policies RLS verificate
- [ ] Permessi corretti per ruoli
- [ ] Test di isolamento dati trainer/atleta

#### Trigger e Funzioni
- [ ] Trigger attivi e funzionanti
- [ ] Funzioni database testate
- [ ] Nessun errore nei log Supabase

### 4. ✅ Test End-to-End (Opzionale ma Consigliato)
```bash
npm run test:e2e:ci
```
- [ ] Test E2E passano
- [ ] Login funziona
- [ ] Dashboard accessibile
- [ ] Funzionalità critiche testate

### 5. ✅ Verifica Performance

#### Lighthouse (Opzionale)
```bash
npm run lighthouse:ci
```
- [ ] Performance score > 80
- [ ] Accessibility score > 90
- [ ] Best practices score > 90
- [ ] SEO score > 80

#### Bundle Analysis
```bash
npm run build:analyze
```
- [ ] Bundle size accettabile
- [ ] Nessun chunk troppo grande
- [ ] Code splitting ottimizzato

### 6. ✅ Verifica Sicurezza

#### Secrets
- [ ] Nessun secret nel codice
- [ ] Variabili d'ambiente configurate in piattaforma
- [ ] Chiavi API non esposte nel client

#### Dependencies
```bash
npm audit --production
```
- [ ] Nessuna vulnerabilità critica
- [ ] Vulnerabilità medie risolte se possibile

### 7. ✅ Verifica Configurazione Deploy

#### Next.js Config
- [ ] `next.config.ts` configurato per produzione
- [ ] Redirect e rewrites corretti
- [ ] Headers di sicurezza configurati

#### Docker (se usi Docker)
- [ ] `Dockerfile.production` aggiornato
- [ ] `docker-compose.production.yml` configurato
- [ ] Health checks configurati

#### Vercel/Platform (se usi)
- [ ] Environment variables configurate
- [ ] Build command corretto
- [ ] Output directory corretto
- [ ] Domini configurati

### 8. ✅ Backup e Rollback Plan

#### Database
- [ ] Backup database recente
- [ ] Piano di rollback preparato
- [ ] Migrazioni reversibili se possibile

#### Code
- [ ] Tag git creato per release
- [ ] Branch di rollback preparato
- [ ] Changelog aggiornato

### 9. ✅ Monitoraggio Post-Deploy

#### Health Checks
- [ ] Endpoint `/api/health` funzionante
- [ ] Monitoring configurato (Sentry)
- [ ] Logs accessibili

#### Alerting
- [ ] Alert configurati per errori critici
- [ ] Notifiche per downtime
- [ ] Dashboard monitoring attivo

---

## 🔧 COMANDI RAPIDI PRE-DEPLOY

```bash
# 1. Verifica completa
npm run check:prod

# 2. Build produzione
npm run build:prod

# 3. Verifica variabili d'ambiente (crea script se necessario)
# Verifica manualmente tutte le variabili in env.example

# 4. Test finali
npm run test:run
npm run test:e2e:ci

# 5. Audit sicurezza
npm audit --production

# 6. Verifica database
npm run db:verify
npm run db:analyze-rls
```

---

## 📝 NOTE IMPORTANTI

### ⚠️ Warning Build Accettabili
I warning per `twilio` e `web-push` sono **accettabili** perché:
- I moduli sono importati dinamicamente solo quando necessari
- Hanno fallback per sviluppo (simulazione)
- Non bloccano il build o il funzionamento dell'app

### 🔒 Sicurezza
- **MAI** committare `.env.local` o file con secrets
- Usa sempre variabili d'ambiente per configurazioni sensibili
- Verifica che le chiavi API non siano esposte nel client-side bundle

### 🗄️ Database
- Prima di ogni deploy, verifica che le migrazioni siano applicate
- Testa le RLS policies per garantire isolamento dati
- Fai sempre backup prima di modifiche al database

### 🚀 Performance
- Monitora il bundle size dopo ogni deploy
- Usa code splitting per componenti pesanti
- Ottimizza immagini e assets statici

---

## ✅ STATO ATTUALE (2025-01-27) - AGGIORNATO

### Build Status
- ✅ Build: **SUCCESSO** (con warning accettabili) ✅ Verificato
- ✅ Build Produzione: **SUCCESSO** ✅ Verificato
- ✅ Linting: **Nessun errore** ✅ Verificato
- ✅ TypeScript: **Nessun errore** ✅ Verificato 2025-01-27
- ⚠️ Test: **Da eseguire** (`npm run test:run`) - Opzionale

### Git Status
- ⚠️ **Molti file modificati** - Review necessario
- ⚠️ **File non tracciati** - Decidere cosa committare
- ✅ `.env.local` non tracciato (corretto) ✅ Verificato

### Sicurezza
- ✅ **Nessun secret hardcoded** ✅ Verificato
- ✅ **`.gitignore` configurato correttamente** ✅ Verificato
- ⚠️ **3 vulnerabilità moderate Sentry** - Fix consigliato (`npm audit fix`)

### Variabili d'Ambiente
- ⚠️ **Verifica manuale necessaria** per produzione
- ✅ Template disponibile in `env.example` ✅ Verificato

### Database
- ⚠️ **Verifica migrazioni necessaria** - Eseguire `npm run db:verify`
- ⚠️ **Test RLS policies consigliato** - Eseguire `npm run db:analyze-rls`

### Configurazione
- ✅ **Next.js config**: Corretto ✅ Verificato
- ✅ **Moduli opzionali**: Configurati come esterni ✅ Verificato
- ✅ **Code Splitting**: Attivo ✅ Verificato

---

## 🎯 PROSSIMI PASSI

1. **PRIMA DEL COMMIT**:
   - [ ] Eseguire `npm run typecheck`
   - [ ] Eseguire `npm run lint`
   - [ ] Review file modificati
   - [ ] Decidere cosa committare

2. **PRIMA DEL DEPLOY**:
   - [ ] Verificare tutte le variabili d'ambiente
   - [ ] Eseguire `npm run build:prod`
   - [ ] Verificare migrazioni database
   - [ ] Test E2E se possibile
   - [ ] Backup database

3. **DOPO IL DEPLOY**:
   - [ ] Verificare health endpoint
   - [ ] Testare funzionalità critiche
   - [ ] Monitorare logs e errori
   - [ ] Verificare performance

---

**Ultimo aggiornamento**: 2025-01-27T18:00:00Z
