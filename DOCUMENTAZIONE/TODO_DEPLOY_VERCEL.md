# ✅ TODO Deploy Vercel - 22Club

**Data**: 2025-01-31  
**Progetto**: club_1225  
**URL Vercel**: https://vercel.com/dimakushniriuk-arts-projects/club_1225

---

## 📋 Checklist Pre-Deploy

### 🔴 FASE 1: Configurazione Variabili d'Ambiente (OBBLIGATORIO)

**URL Configurazione**: https://vercel.com/dimakushniriuk-arts-projects/club_1225/settings/environment-variables

#### Variabili OBBLIGATORIE (minimo per far partire il build):

- [ ] **NEXT_PUBLIC_SUPABASE_URL**
  - Valore: `https://your-project-id.supabase.co`
  - Dove trovarlo: Supabase Dashboard > Settings > API > Project URL
  - Ambienti: ✅ Production, ✅ Preview, ✅ Development

- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY**
  - Valore: `your_supabase_anon_key`
  - Dove trovarlo: Supabase Dashboard > Settings > API > Project API keys > `anon` `public`
  - Ambienti: ✅ Production, ✅ Preview, ✅ Development

- [ ] **SUPABASE_SERVICE_ROLE_KEY**
  - Valore: `your_supabase_service_role_key`
  - Dove trovarlo: Supabase Dashboard > Settings > API > Project API keys > `service_role` `secret`
  - ⚠️ IMPORTANTE: Segna come "Sensitive" (non leggibile dopo il salvataggio)
  - Ambienti: ✅ Production, ✅ Preview, ✅ Development

#### Variabili CONSIGLIATE (app funzionerà ma con limitazioni):

- [ ] **NEXT_PUBLIC_APP_URL**
  - Valore: `https://club1225-dimakushniriuk-arts-projects.vercel.app`
  - Ambienti: ✅ Production, ✅ Preview, ✅ Development

- [ ] **DATABASE_URL** (se usi Prisma/Drizzle)
  - Valore: `postgresql://postgres.your-project-id:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true`
  - Dove trovarlo: Supabase Dashboard > Settings > Database > Connection string > Connection pooling
  - ⚠️ Segna come "Sensitive"
  - Ambienti: ✅ Production, ✅ Preview, ✅ Development

- [ ] **DIRECT_URL** (se usi Prisma/Drizzle)
  - Valore: `postgresql://postgres.your-project-id:password@aws-0-region.pooler.supabase.com:5432/postgres`
  - Dove trovarlo: Supabase Dashboard > Settings > Database > Connection string > Direct connection
  - ⚠️ Segna come "Sensitive"
  - Ambienti: ✅ Production, ✅ Preview, ✅ Development

#### Variabili OPZIONALI (funzionalità avanzate):

- [ ] **NEXT_PUBLIC_VAPID_KEY** (Push Notifications)
- [ ] **VAPID_PRIVATE_KEY** (Push Notifications - Sensitive)
- [ ] **VAPID_EMAIL** (Push Notifications)
- [ ] **RESEND_API_KEY** (Email - Sensitive)
- [ ] **RESEND_FROM_EMAIL** (Email)
- [ ] **RESEND_FROM_NAME** (Email)
- [ ] **TWILIO_ACCOUNT_SID** (SMS)
- [ ] **TWILIO_AUTH_TOKEN** (SMS - Sensitive)
- [ ] **TWILIO_PHONE_NUMBER** (SMS)
- [ ] **NEXT_PUBLIC_SENTRY_DSN** (Error Tracking)
- [ ] **SENTRY_DSN** (Error Tracking)
- [ ] **CRON_SECRET** (Cron Jobs - Sensitive)

---

### 🟡 FASE 2: Verifica Configurazione

- [ ] Verificare che tutte le variabili obbligatorie siano configurate
- [ ] Verificare che gli ambienti siano selezionati correttamente (Production, Preview, Development)
- [ ] Verificare che le variabili sensibili siano marcate come "Sensitive"
- [ ] Verificare build locale: `npm run build` (deve completarsi senza errori)
- [ ] Verificare TypeScript: `npm run typecheck` (deve essere 0 errori)
- [ ] Verificare ESLint: `npm run lint` (deve essere 0 errori)

---

### 🟢 FASE 3: Deploy

- [ ] Eseguire deploy produzione:

  ```bash
  vercel --prod --yes
  ```

- [ ] Monitorare il deploy su Vercel Dashboard:
  - URL: https://vercel.com/dimakushniriuk-arts-projects/club_1225
  - Verificare che il build completi con successo
  - Controllare i log per eventuali errori

- [ ] Verificare deploy completato:
  - URL Produzione: https://club1225-dimakushniriuk-arts-projects.vercel.app
  - Testare funzionalità base (login, connessione Supabase)
  - Verificare che l'app si carichi correttamente

---

## 🔍 Troubleshooting

### Build fallisce con "Command 'npm run build' exited with 1"

**Possibili cause**:

1. Variabili d'ambiente mancanti (soprattutto Supabase)
2. Errori TypeScript/ESLint
3. Problemi con script `postbuild`

**Soluzione**:

1. Verifica che tutte le variabili obbligatorie siano configurate
2. Controlla i log dettagliati su Vercel Dashboard
3. Testa il build localmente: `npm run build`

### App non si connette a Supabase

**Causa**: Variabili Supabase mancanti o errate

**Soluzione**:

1. Verifica che `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` siano corrette
2. Controlla che gli URL non abbiano spazi o caratteri speciali
3. Verifica che le chiavi siano complete (non troncate)

---

## 📝 Note Importanti

- ⚠️ **NON committare mai valori reali** delle variabili d'ambiente in Git
- ✅ Le variabili con prefisso `NEXT_PUBLIC_` sono esposte al client-side
- 🔒 Le variabili senza prefisso sono solo server-side
- 🎯 Dopo ogni modifica alle variabili d'ambiente, è necessario un nuovo deploy

---

## 🔗 Link Utili

- **Dashboard Vercel**: https://vercel.com/dimakushniriuk-arts-projects/club_1225
- **Environment Variables**: https://vercel.com/dimakushniriuk-arts-projects/club_1225/settings/environment-variables
- **Deployments**: https://vercel.com/dimakushniriuk-arts-projects/club_1225/deployments
- **Logs**: https://vercel.com/dimakushniriuk-arts-projects/club_1225/logs
- **Supabase Dashboard**: https://supabase.com/dashboard (per trovare le chiavi API)

---

## ✅ Stato Attuale

- ✅ Progetto collegato a Vercel: `club_1225`
- ✅ Vercel CLI autenticato
- ✅ Build locale funziona correttamente
- ⏳ **Prossimo step**: Configurare variabili d'ambiente su Vercel

---

**Ultimo aggiornamento**: 2025-01-31T16:00:00Z
