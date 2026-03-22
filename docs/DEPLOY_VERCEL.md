# Deploy 22Club su Vercel

## 1. Collegare il progetto

- Vai su [vercel.com](https://vercel.com) e accedi (o crea account).
- **Import Git**: Vercel → Add New → Project → importa il repo (GitHub/GitLab/Bitbucket).
- Oppure da terminale nella root del progetto:
  ```bash
  npx vercel
  ```
  (alla prima volta: login con browser, poi link al progetto o creazione nuovo.)

## 2. Variabili d’ambiente (obbligatorie)

In **Vercel → Project → Settings → Environment Variables** imposta (per **Production**, **Preview** e **Development** come ti serve):

| Variabile                       | Descrizione                                                        |
| ------------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL progetto Supabase                                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave anon Supabase                                               |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key Supabase (solo server)                            |
| `NEXT_PUBLIC_APP_URL`           | URL pubblico app (es. `https://app.22club.it` o il dominio Vercel) |
| `RESEND_API_KEY`                | API key Resend (email)                                             |
| `RESEND_FROM_EMAIL`             | Email mittente (es. `noreply@22club.it`)                           |
| `RESEND_FROM_NAME`              | Nome mittente (es. `22Club`)                                       |

Opzionali ma consigliati:

| Variabile                                     | Descrizione                                                     |
| --------------------------------------------- | --------------------------------------------------------------- |
| `CRON_SECRET`                                 | Segreto per cron (es. `/api/admin/cron/refresh-marketing-kpis`) |
| `NEXT_PUBLIC_VAPID_KEY` / `VAPID_PRIVATE_KEY` | Web Push                                                        |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`       | Sentry (errori)                                                 |
| `RESEND_WEBHOOK_SECRET`                       | Verifica webhook Resend                                         |

Copia i valori dal tuo `.env.local` (o da `env.example` e compila).

## 3. Deploy

- **Da Git**: ogni push sul branch collegato (es. `main`) genera un deploy automatico.
- **Da CLI**:
  - Preview: `npx vercel`
  - Produzione: `npx vercel --prod`

## 4. Dominio (opzionale)

- Vercel → Project → Settings → Domains → aggiungi il dominio (es. `app.22club.it`).
- Imposta i record DNS come indicato da Vercel (CNAME o A).
- In produzione imposta `NEXT_PUBLIC_APP_URL` uguale a quel dominio.

## 5. Cron

In `vercel.json` è già configurato il cron giornaliero per i KPI marketing. Su piano Vercel che supporta i Cron Jobs funzionerà senza altri passi.
