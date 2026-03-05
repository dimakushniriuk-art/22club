# 🔐 Variabili d'Ambiente per Vercel

**Data**: 2025-01-31  
**Progetto**: club_1225  
**URL Vercel**: https://vercel.com/dimakushniriuk-arts-projects/club_1225

---

## ⚠️ IMPORTANTE

Configura queste variabili d'ambiente su Vercel prima di fare il deploy:

1. Vai su: https://vercel.com/dimakushniriuk-arts-projects/club_1225/settings/environment-variables
2. Aggiungi tutte le variabili elencate qui sotto
3. Assicurati di selezionare gli ambienti corretti (Production, Preview, Development)

---

## 🔴 VARIABILI OBBLIGATORIE (Build fallirà senza queste)

### Supabase Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Dove trovarle**: Supabase Dashboard > Settings > API

---

## 🟡 VARIABILI CONSIGLIATE (App funzionerà ma con limitazioni)

### Database URLs (se usi Prisma/Drizzle)

```bash
DATABASE_URL=postgresql://postgres.your-project-id:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.your-project-id:password@aws-0-region.pooler.supabase.com:5432/postgres
```

### Push Notifications (VAPID)

```bash
NEXT_PUBLIC_VAPID_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:admin@22club.it
```

**Genera con**: `npx web-push generate-vapid-keys`

### App URL

```bash
NEXT_PUBLIC_APP_URL=https://club1225-dimakushniriuk-arts-projects.vercel.app
```

**Nota**: Aggiorna con il tuo dominio di produzione quando disponibile

---

## 🟢 VARIABILI OPZIONALI (Funzionalità avanzate)

### Email (Resend)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@22club.it
RESEND_FROM_NAME=22Club
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### SMS (Twilio)

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+39XXXXXXXXXX
TWILIO_WEBHOOK_SECRET=your_twilio_webhook_secret
```

### Sentry (Error Tracking)

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/22club
SENTRY_DSN=https://your-dsn@sentry.io/22club
NODE_ENV=production
```

### Cron Jobs

```bash
CRON_SECRET=22club-cron-secret
```

---

## 📋 Checklist Configurazione Vercel

- [ ] Aggiunto `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Aggiunto `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Aggiunto `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Aggiunto `NEXT_PUBLIC_APP_URL` (con URL Vercel corretto)
- [ ] Configurato ambiente: Production ✅
- [ ] Configurato ambiente: Preview ✅
- [ ] Configurato ambiente: Development ✅ (opzionale)

---

## 🚀 Dopo la Configurazione

1. Riprova il deploy:

   ```bash
   vercel --prod --yes
   ```

2. Verifica il deploy:
   - Controlla i log: https://vercel.com/dimakushniriuk-arts-projects/club_1225
   - Testa l'app: https://club1225-dimakushniriuk-arts-projects.vercel.app

---

## 🔍 Troubleshooting

### Build fallisce con "Command 'npm run build' exited with 1"

**Possibili cause**:

1. Variabili d'ambiente mancanti (soprattutto Supabase)
2. Errori TypeScript/ESLint
3. Problemi con dipendenze

**Soluzione**:

1. Verifica che tutte le variabili obbligatorie siano configurate
2. Controlla i log dettagliati su Vercel Dashboard
3. Testa il build localmente: `npm run build`

### App non si connette a Supabase

**Causa**: Variabili Supabase mancanti o errate

**Soluzione**: Verifica che `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` siano corrette

---

## 📝 Note

- Le variabili con prefisso `NEXT_PUBLIC_` sono esposte al client-side
- Le variabili senza prefisso sono solo server-side
- Non committare mai valori reali in Git (usa sempre `.env.local` localmente)
