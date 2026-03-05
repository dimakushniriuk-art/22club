# 📋 Guida Verifiche Pre-Deploy - 22Club

**Data Creazione**: 2025-01-27  
**Stato**: Preparazione Deploy Vercel  
**Repository GitHub**: https://github.com/dimakushniriuk-art/club_1225

---

## ✅ Fase 1: Preparazione Pre-Commit - COMPLETATA

- ✅ File Git organizzati e committati
- ✅ TypeScript verificato
- ✅ Linting verificato
- ✅ Build produzione verificato
- ✅ File sensibili esclusi (.auth/*.json)

---

## 🔍 Fase 2: Verifiche Database e Configurazione

### 2.1 Verifica Database Supabase

#### Comandi da Eseguire

```bash
# Verifica setup Supabase
npm run db:verify

# Analizza RLS policies
npm run db:analyze-rls

# Verifica dati profondi (opzionale)
npm run db:verify-data-deep
```

**Nota**: Lo script `db:analyze-rls` è stato creato e funziona correttamente. Verifica RLS per tutte le tabelle principali.

#### Verifiche Manuali nel Dashboard Supabase

1. **Accedere a Supabase Dashboard**
   - URL: https://app.supabase.com
   - Selezionare progetto 22Club

2. **Verificare Migrazioni**
   - Vai su: Database → Migrations
   - Verifica che tutte le migrazioni in `supabase/migrations/` siano applicate
   - Se mancano migrazioni, applicarle manualmente

3. **Verificare RLS Policies**
   - Vai su: Authentication → Policies
   - Verifica che le policies siano attive per:
     - `profiles`
     - `appointments`
     - `workout_plans`
     - `athlete_profiles`
   - Verifica isolamento dati trainer/atleta

4. **Verificare Trigger e Funzioni**
   - Vai su: Database → Functions
   - Verifica che i trigger critici siano attivi
   - Controlla log per errori

---

### 2.2 Configurazione Variabili d'Ambiente Vercel

#### Variabili OBBLIGATORIE

Queste variabili DEVONO essere configurate in Vercel:

| Variabile | Descrizione | Dove Trovarla |
|-----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL progetto Supabase | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave anonima Supabase | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chiave servizio (server-side) | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_APP_URL` | URL produzione Vercel | Vercel Dashboard → Domains |
| `NODE_ENV` | Ambiente | Impostare a `production` |

#### Variabili OBBLIGATORIE per Comunicazioni

| Variabile | Descrizione | Dove Trovarla |
|-----------|-------------|---------------|
| `RESEND_API_KEY` | API key Resend | Resend Dashboard → API Keys |
| `RESEND_FROM_EMAIL` | Email mittente verificata | Resend Dashboard → Domains |
| `RESEND_FROM_NAME` | Nome mittente | Opzionale (default: "22Club") |

#### Variabili OPZIONALI

| Variabile | Descrizione | Quando Usare |
|-----------|-------------|--------------|
| `NEXT_PUBLIC_VAPID_KEY` | VAPID public key | Se usi push notifications |
| `VAPID_PRIVATE_KEY` | VAPID private key | Se usi push notifications |
| `VAPID_EMAIL` | Email VAPID | Se usi push notifications |
| `TWILIO_ACCOUNT_SID` | Account SID Twilio | Se usi SMS |
| `TWILIO_AUTH_TOKEN` | Auth token Twilio | Se usi SMS |
| `TWILIO_PHONE_NUMBER` | Numero telefono Twilio | Se usi SMS |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN client | Se usi Sentry |
| `SENTRY_DSN` | Sentry DSN server | Se usi Sentry |
| `CRON_SECRET` | Secret per cron jobs | Se usi cron jobs |

#### Come Configurare in Vercel

1. **Accedere a Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Selezionare progetto 22Club

2. **Aggiungere Variabili**
   - Vai su: Settings → Environment Variables
   - Clicca "Add New"
   - Inserisci nome e valore
   - Seleziona ambiente: **Production** (e Preview se necessario)
   - Salva

3. **Verifica Template**
   - Confronta con `env.example` nel repository
   - Assicurati che tutte le variabili obbligatorie siano configurate

---

### 2.3 Verifica GitHub Secrets (per CI/CD)

#### Secrets Necessari

| Secret | Descrizione | Dove Trovarlo |
|--------|-------------|---------------|
| `VERCEL_TOKEN` | Token Vercel | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | ID organizzazione | Vercel Dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | ID progetto | Vercel Dashboard → Settings → General |
| `SUPABASE_ACCESS_TOKEN` | Token Supabase | Supabase Dashboard → Settings → Access Tokens |
| `SUPABASE_PROJECT_REF` | Reference progetto | Supabase Dashboard → Settings → General |

#### Come Configurare in GitHub

1. **Accedere a GitHub Repository**
   - Vai su: Settings → Secrets and variables → Actions

2. **Aggiungere Secrets**
   - Clicca "New repository secret"
   - Inserisci nome e valore
   - Salva

3. **Verifica Workflow**
   - Controlla `.github/workflows/deploy.yml`
   - Verifica che tutti i secrets siano referenziati correttamente

---

## 🚀 Fase 3: Deploy su Vercel

### Opzione A: Deploy via GitHub Actions (Consigliato)

1. **Push su branch main**
   ```bash
   git push origin main
   ```
   
   **Nota**: Ci sono ~40 commit locali da pushare. Vedi `ISTRUZIONI_PUSH_GITHUB.md` per dettagli.

2. **Monitorare Workflow**
   - Vai su: https://github.com/dimakushniriuk-art/club_1225/actions
   - Verifica che il workflow `.github/workflows/deploy.yml` si esegua
   - Attendi completamento

3. **Verifica Deploy**
   - Vai su: Vercel Dashboard → Deployments
   - Verifica che il deploy sia completato con successo

### Opzione B: Deploy Manuale via CLI

```bash
# Installare Vercel CLI (se non presente)
npm i -g vercel

# Login
vercel login

# Link progetto (se non già linkato)
vercel link

# Deploy preview (test)
vercel

# Deploy produzione (dopo verifica)
vercel --prod
```

---

## ✅ Fase 4: Verifiche Post-Deploy

### 4.1 Verifica Health Endpoint

```bash
# Sostituisci [your-domain] con il tuo dominio Vercel
curl https://[your-domain]/api/health

# Risposta attesa:
# {"status":"ok","timestamp":"..."}
```

### 4.2 Verifica Funzionalità Critiche

**Checklist Manuale**:

- [ ] **Homepage**: `https://[your-domain]` carica correttamente
- [ ] **Login**: `https://[your-domain]/login` funziona
- [ ] **Dashboard**: `https://[your-domain]/dashboard` accessibile dopo login
- [ ] **Database**: Connessione Supabase funziona
- [ ] **API Endpoints**: Rispondono correttamente
- [ ] **Pagine Principali**: Caricano senza errori

### 4.3 Monitoraggio

#### Vercel Logs
- Vai su: Vercel Dashboard → Deployments → [Latest] → Logs
- Verifica errori o warning

#### Sentry (se configurato)
- Vai su: Sentry Dashboard
- Verifica errori in produzione
- Controlla performance

---

## 📝 Fase 5: Documentazione

### File da Aggiornare

1. **REPORT_ESECUZIONE_CHECKLIST.md**
   - Aggiungere risultati deploy
   - Documentare eventuali problemi

2. **ANALISI_VULNERABILITA_AUDIT.md**
   - Aggiornare stato fix vulnerabilità

3. **DEPLOYMENT_REPORT.md** (se esiste)
   - Aggiungere informazioni deploy

---

## 🔄 Rollback Plan

### Se Qualcosa Va Male

#### Via Vercel CLI
```bash
vercel rollback
```

#### Via Vercel Dashboard
1. Vai su: Deployments
2. Seleziona deployment precedente
3. Clicca "Promote to Production"

---

## 📊 Checklist Finale

### Pre-Deploy ✅
- [x] Build produzione: OK
- [x] TypeScript: OK
- [x] Linting: OK
- [x] Vulnerabilità produzione: 0
- [x] File Git committati

### Pre-Deploy ⚠️ (Manuale)
- [ ] Variabili d'ambiente Vercel configurate
- [ ] Database migrazioni applicate
- [ ] RLS policies verificate
- [ ] GitHub Secrets configurati

### Post-Deploy ✅
- [ ] Health endpoint funziona
- [ ] Login funziona
- [ ] Dashboard accessibile
- [ ] Nessun errore critico nei log
- [ ] Performance accettabile

---

## 🆘 Troubleshooting

### Problema: Build Fallisce in Vercel

**Possibili Cause**:
- Variabili d'ambiente mancanti
- Errori TypeScript
- Dipendenze mancanti

**Soluzione**:
1. Verifica logs Vercel
2. Verifica variabili d'ambiente
3. Testa build locale: `npm run build:prod`

### Problema: Database Non Connesso

**Possibili Cause**:
- `NEXT_PUBLIC_SUPABASE_URL` errato
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` errato
- RLS policies troppo restrittive

**Soluzione**:
1. Verifica variabili d'ambiente
2. Verifica RLS policies
3. Testa connessione manualmente

### Problema: Pagine Non Caricano

**Possibili Cause**:
- Errori runtime
- Variabili d'ambiente mancanti
- Problemi di routing

**Soluzione**:
1. Verifica logs Vercel
2. Verifica console browser
3. Verifica routing Next.js

---

**Ultimo aggiornamento**: 2025-01-27T19:00:00Z
