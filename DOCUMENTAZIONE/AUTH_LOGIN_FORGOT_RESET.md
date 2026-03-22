# Auth: Login, Forgot Password, Reset Password

Documentazione completa del flusso di accesso e recupero password: pagine, API, Resend, Supabase e configurazione.

---

## Panoramica

| Fase            | URL                | Descrizione                                                          |
| --------------- | ------------------ | -------------------------------------------------------------------- |
| Login           | `/login`           | Accesso con email/password, redirect per ruolo                       |
| Forgot password | `/forgot-password` | Richiesta email con link di reset (invio via Resend)                 |
| Reset password  | `/reset-password`  | Pagina raggiunta dopo il click sul link; impostazione nuova password |

Flusso recupero password: utente su `/forgot-password` → inserisce email → backend genera link Supabase e invia email con template Resend → utente clicca link → Supabase verifica token e reindirizza a `/reset-password` → utente imposta nuova password → redirect a `/login`.

---

## Documenti di dettaglio

- **[LOGIN_PAGE.md](LOGIN_PAGE.md)** – Pagina login: design, flusso auth, redirect per ruolo, query `?error=profilo`, env.
- **[FORGOT_PASSWORD_PAGE.md](FORGOT_PASSWORD_PAGE.md)** – Pagina forgot-password: design, API `POST /api/auth/forgot-password`, Resend template, variabile `22club_reset_password_url`, configurazione e troubleshooting link.
- **[RESET_PASSWORD_PAGE.md](RESET_PASSWORD_PAGE.md)** – Pagina reset-password: come si arriva, stati UI, verifica sessione, form nuova password, errori da URL.

---

## Riepilogo file e ruoli

| Ruolo                            | File                                                  |
| -------------------------------- | ----------------------------------------------------- |
| Pagina Login                     | `src/app/login/page.tsx`                              |
| Pagina Forgot Password           | `src/app/forgot-password/page.tsx`                    |
| Pagina Reset Password            | `src/app/reset-password/page.tsx`                     |
| API Forgot Password              | `src/app/api/auth/forgot-password/route.ts`           |
| Logica email reset + template    | `src/lib/communications/send-reset-password-email.ts` |
| Client Resend (invio + template) | `src/lib/communications/email-resend-client.ts`       |
| Client Supabase server (admin)   | `src/lib/supabase/server.ts` (`createAdminClient`)    |
| Sfondo condiviso                 | `src/components/athlete/athlete-background.tsx`       |

---

## API: POST /api/auth/forgot-password

- **Body:** `{ email: string, redirectTo?: string }`
- **redirectTo:** URL a cui Supabase reindirizza dopo la verifica (default: `origin + '/reset-password'`).
- **Risposte:** 200 `{ success: true }` | 400 email mancante | 502 errore invio email | 500 errore server.
- **Comportamento:** valida email, chiama `sendResetPasswordEmail({ email, redirectTo })`, restituisce esito.

---

## Invio email (Resend + Supabase)

1. **Generazione link:** `createAdminClient()` → `supabase.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo } })` → si usa `data.properties.action_link`.
2. **URL nel template:** l’URL viene normalizzato (assoluto, senza spazi/newline) e passato al template Resend come variabile **`22club_reset_password_url`**.
3. **Template Resend:** id `password-reset-request`. Nel bottone “Reimposta password” il campo Link deve essere **solo** `{{22club_reset_password_url}}`.
4. **Invio:** `sendEmailViaResendTemplate(to, 'password-reset-request', { 22club_reset_password_url: fullResetUrl }, subject)`.

Se Resend non è configurato (env mancanti), l’invio è simulato (nessuna email reale).

---

## Configurazione

### Variabili d’ambiente

| Variabile                       | Dove                         | Uso                              |
| ------------------------------- | ---------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Client + Server              | Supabase project URL             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client                       | Auth e API pubbliche             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server (API forgot-password) | `generateLink` per recovery      |
| `RESEND_API_KEY`                | Server                       | Invio email Resend               |
| `RESEND_FROM_EMAIL`             | Server                       | Mittente (es. noreply@22club.it) |
| `RESEND_FROM_NAME`              | Server                       | Nome mittente (es. 22Club)       |

### Supabase Dashboard

- **Authentication → URL Configuration → Redirect URLs:** devono essere presenti gli URL di destinazione dopo il reset, es.:
  - Produzione: `https://tuodominio.com/reset-password`
  - Sviluppo: `http://localhost:3001/reset-password`

Se l’URL non è in elenco, dopo il click sul link nell’email il flusso si interrompe.

### Resend Dashboard

- Template **password-reset-request** (alias/id) deve essere **pubblicato**.
- Variabile del template: **`22club_reset_password_url`** (URL completo, senza spazi/newline).
- Nel bottone: campo Link = `{{22club_reset_password_url}}` senza altro testo o prefissi.

---

## Troubleshooting

| Problema                      | Controllo                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Link nel bottone non funziona | Campo Link in Resend solo `{{22club_reset_password_url}}`; Redirect URLs in Supabase con l’URL della tua app `/reset-password`. |
| Email non arriva              | Verificare `RESEND_*` e dominio Resend; in sviluppo senza Resend l’invio è simulato.                                            |
| “Link non valido o scaduto”   | Token scaduto o già usato; Supabase redirect URL non in allowlist; riprovare da `/forgot-password`.                             |
| Profilo non trovato al login  | Middleware può reindirizzare a `/login?error=profilo`; completare registrazione profilo per quell’utente.                       |

---

## Design condiviso (Login, Forgot, Reset)

- **Sfondo:** `AthleteBackground` (gradient teal/cyan, griglia, blur).
- **Card:** `backdrop-blur-xl`, `shadow-2xl`, `bg-background-secondary/95`, `border-border`, `rounded-2xl`, `max-w-md`.
- **Logo:** `/logo.svg`, drop-shadow teal, blur decorativo.
- **Palette:** teal (pulsanti, link), `text-text-primary` / `text-text-secondary`, box errore rosso.
- **Animazioni:** `animate-fade-in` con delay; spinner sui pulsanti in loading.

Per dettagli su singole pagine e flussi si rimanda a [LOGIN_PAGE.md](LOGIN_PAGE.md), [FORGOT_PASSWORD_PAGE.md](FORGOT_PASSWORD_PAGE.md), [RESET_PASSWORD_PAGE.md](RESET_PASSWORD_PAGE.md).
