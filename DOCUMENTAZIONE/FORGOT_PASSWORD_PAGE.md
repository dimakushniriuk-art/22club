# Pagina Forgot Password (Recupero password)

Documentazione della pagina di recupero password: design, flusso, API e integrazione Resend con template.

---

## Percorso

- **URL:** `/forgot-password`
- **File:** `src/app/forgot-password/page.tsx`
- **Tipo:** Client Component (`'use client'`)

---

## Design e layout

Stesso **stile** della pagina [Login](LOGIN_PAGE.md): sfondo `AthleteBackground`, card con blur, palette teal, tipografia e componenti condivisi.

### Due stati della pagina

1. **Form richiesta** – campo email + pulsante "Invia istruzioni"
2. **Successo** – messaggio "Email inviata!" + link "Torna al Login" + box con hint (es. spam, Inbucket in locale)

### Struttura (form)

- **Link indietro:** "Torna al Login" con freccia `ArrowLeft` → `/login`
- **Header:** logo (come login), titolo "Password dimenticata?", sottotitolo con istruzioni
- **Form:** campo Email con icona Mail, placeholder `la.tua@email.com`
- **Pulsante:** "Invia istruzioni" (icona Mail quando non in loading), spinner durante l’invio
- **Help:** "Ricordi la password? Accedi" → `/login`
- **Box errore:** stesso stile della login (rosso, `AlertCircle`)

### Struttura (successo)

- Logo, icona `CheckCircle2` in cerchio teal, titolo "Email inviata!", testo con l’email inserita
- Box informativo (spam; in localhost link a Inbucket `http://localhost:54324`)
- Pulsante "Torna al Login" → `/login`

### Componenti usati

- `AthleteBackground`, `Card`, `CardContent`, `Button`, `Input`, `Label`
- `Link`, `Image`, icone `ArrowLeft`, `Mail`, `CheckCircle2`, `AlertCircle` (lucide-react)
- Logger: `createLogger('app:forgot-password:page')`

---

## Flusso utente

1. Utente inserisce l’email e invia il form.
2. Frontend chiama **`POST /api/auth/forgot-password`** con body:
   - `email` (string, obbligatorio)
   - `redirectTo` (string, opzionale) – default lato API: `origin + '/reset-password'`
3. Se risposta OK → stato `success = true` → viene mostrata la vista "Email inviata!".
4. Se risposta non OK → messaggio di errore dal body (`data.error`) nel box rosso.
5. Eccezione di rete/altro → messaggio generico "Errore durante l'invio della richiesta. Riprova più tardi."

---

## API: POST /api/auth/forgot-password

- **File:** `src/app/api/auth/forgot-password/route.ts`
- **Metodo:** POST
- **Body (JSON):**
  - `email` (string, obbligatorio)
  - `redirectTo` (string, opzionale) – URL di redirect dopo il click sul link nella email (es. `https://app.example.com/reset-password`)
- **Comportamento:**
  1. Valida `email`; se manca → 400 con `{ error: 'Email obbligatoria' }`.
  2. Usa `redirectTo` dal body oppure `request.nextUrl.origin + '/reset-password'`.
  3. Chiama `sendResetPasswordEmail({ email, redirectTo })` (vedi sotto).
  4. Successo → 200 con `{ success: true }`.
  5. Fallimento invio email → 502 con `{ error: string }`.
  6. Eccezione → 500 con `{ error: 'Errore interno del server' }`.

---

## Invio email (Resend + template)

La email **non** è inviata da Supabase Auth: il link di recovery viene generato lato server e l’email viene inviata tramite **Resend** usando un **template** definito nella dashboard Resend.

### Modulo: send-reset-password-email

- **File:** `src/lib/communications/send-reset-password-email.ts`
- **Funzione:** `sendResetPasswordEmail({ email, redirectTo })`

Passi:

1. **Generazione link:** con client Supabase **Admin** (service role) viene chiamato  
   `supabase.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo } })`.  
   Da `data.properties.action_link` si ottiene l’URL da inserire nella email.
2. **Invio tramite Resend:** uso del template Resend **`password-reset-request`** (id/alias nel dashboard).
3. **Variabile template:** il link viene passato come variabile **`22club_reset_password_url`** (prefisso univoco per evitare conflitti). Nel template il bottone "Reimposta password" deve usare `{{22club_reset_password_url}}`.  
   Per usare un altro nome nel dashboard Resend, aggiorna la costante `TEMPLATE_VAR_RESET_LINK` in `send-reset-password-email.ts`.
4. **Subject:** "Reimposta la password - 22Club" (passato alla chiamata Resend; può essere sovrascritto dal template se configurato).

### Client Resend (template)

- **File:** `src/lib/communications/email-resend-client.ts`
- **Funzione:** `sendEmailViaResendTemplate(to, templateId, variables, subject?)`
- **Costante:** `RESEND_TEMPLATE_PASSWORD_RESET = 'password-reset-request'`

Con Resend non configurato (es. sviluppo senza env), l’invio viene **simulato** (stesso comportamento degli altri flussi email Resend nel progetto).

---

## Configurazione

### Variabili d’ambiente (server)

| Variabile                   | Obbligatoria | Uso |
|----------------------------|--------------|-----|
| `RESEND_API_KEY`           | Sì*          | API key Resend |
| `RESEND_FROM_EMAIL`        | Sì*          | Mittente (es. noreply@22club.it) |
| `RESEND_FROM_NAME`         | Sì*          | Nome mittente (es. 22Club) |
| `SUPABASE_SERVICE_ROLE_KEY`| Sì           | Per `createAdminClient()` e `generateLink` |
| `NEXT_PUBLIC_SUPABASE_URL` | Sì           | Per client Supabase |

\*Se mancano, `isResendConfigured()` è false e l’email viene simulata (nessun invio reale).

### Template Resend

- **Nome/alias in dashboard:** `password-reset-request`
- **Variabile richiesta:** `22club_reset_password_url` – viene sempre passato come **URL assoluto** (es. `https://…`) per compatibilità con i client email. Nel template il bottone usa `{{22club_reset_password_url}}`.
- Il template deve essere **pubblicato** per poter essere usato nell’invio.

### Se il link nel bottone non funziona dopo il click

1. **Campo Link del bottone in Resend**  
   Nel template, il campo "Link" / "URL" del bottone deve contenere **solo** la variabile:  
   `{{22club_reset_password_url}}`  
   Nessun prefisso (es. "Link:"), nessuno spazio prima/dopo, nessun altro testo. Se l'editor aggiunge qualcosa attorno, il link risulta rotto.

2. **Redirect URL in Supabase**  
   Il link nell'email porta prima a Supabase (verifica token); Supabase poi reindirizza alla tua app (`/reset-password`).  
   In **Supabase Dashboard** → **Authentication** → **URL Configuration** → **Redirect URLs** devono essere presenti gli URL di destinazione, ad esempio:
   - Produzione: `https://tuodominio.com/reset-password`
   - Sviluppo: `http://localhost:3001/reset-password`  
   Se l'URL non è in elenco, dopo il click il flusso si interrompe.

3. **URL pulito**  
   Il backend invia già l'URL senza spazi/newline, adatto all'uso in `href` nel template.

---

## File coinvolti (riepilogo)

| Ruolo              | File |
|--------------------|------|
| Pagina UI          | `src/app/forgot-password/page.tsx` |
| API route          | `src/app/api/auth/forgot-password/route.ts` |
| Logica + template  | `src/lib/communications/send-reset-password-email.ts` |
| Client Resend      | `src/lib/communications/email-resend-client.ts` (incluso `sendEmailViaResendTemplate`, `RESEND_TEMPLATE_PASSWORD_RESET`) |
| Client Supabase    | `src/lib/supabase/server.ts` (`createAdminClient`) |

---

## Link correlati

- [Auth: Login, Forgot, Reset](AUTH_LOGIN_FORGOT_RESET.md) – documentazione completa flusso auth
- [Login](LOGIN_PAGE.md) – pagina di accesso (stesso design)
- [Reset Password](RESET_PASSWORD_PAGE.md) – pagina impostazione nuova password dopo click sul link
- Inviti atleta (stesso stack Resend): `src/lib/invitations/README.md`
