# Pagina Reset Password (Imposta nuova password)

Documentazione della pagina in cui l’utente imposta la nuova password dopo aver cliccato il link nell’email di recupero.

---

## Percorso

- **URL:** `/reset-password`
- **File:** `src/app/reset-password/page.tsx`
- **Tipo:** Client Component (`'use client'`), con `Suspense` per `useSearchParams`

---

## Quando si arriva qui

1. L’utente richiede il reset da [Forgot Password](FORGOT_PASSWORD_PAGE.md) (`/forgot-password`).
2. Riceve l’email (Resend, template `password-reset-request`) con il link.
3. Il link punta a Supabase Auth (`/auth/v1/verify?type=recovery&token=...&redirect_to=...`).
4. Supabase verifica il token e reindirizza alla tua app su `/reset-password` (con hash/fragment che Supabase usa per la sessione).
5. La pagina `/reset-password` verifica la sessione e mostra il form per la nuova password.

---

## Design e layout

Stesso **stile** di [Login](LOGIN_PAGE.md) e [Forgot Password](FORGOT_PASSWORD_PAGE.md): `AthleteBackground`, card con blur, palette teal.

### Stati della pagina

1. **Verifica link** – messaggio “Stiamo verificando il tuo link di reset password.” (loading).
2. **Errore link** – messaggio di errore (link scaduto/non valido) + link “Richiedi nuovo link” → `/forgot-password`.
3. **Form nuova password** – due campi (Nuova password, Conferma password), pulsante “Imposta password”, link “Torna al Login”.
4. **Successo** – icona CheckCircle2, “Password aggiornata!”, pulsante “Vai al Login” → `/login`.

### Elementi UI (form)

- Campi: Nuova password, Conferma password (icone Lock, toggle show/hide con Eye/EyeOff).
- Validazione: minimo 6 caratteri, password e conferma devono coincidere.
- Box errore: stesso stile delle altre pagine auth (rosso, `AlertCircle`).

---

## Flusso tecnico

1. **Lettura query/hash:** `searchParams` per `error`, `error_code`, `error_description` (Supabase può reindirizzare con errori in query). Hash per `access_token`, `type=recovery`.
2. **Verifica sessione:** dopo una breve attesa (500ms), `supabase.auth.getUser()`. Se non c’è utente ma c’è token recovery nell’hash, attesa 1s e nuovo `getUser()`.
3. **Auth state change:** `onAuthStateChange` per eventi `PASSWORD_RECOVERY` o `SIGNED_IN`; quando arriva l’utente si imposta `hasValidSession = true`.
4. **Submit form:** se `!hasValidSession` → errore. Altrimenti `supabase.auth.refreshSession()` poi `supabase.auth.updateUser({ password })`. Successo → stato success, redirect a `/login` o messaggio “Vai al Login”.

---

## Errori URL (Supabase redirect con errori)

- `error_code=otp_expired` → “Il link di reset password è scaduto. Richiedi un nuovo link.”
- `error_code=access_denied` → messaggio da `error_description` (decodificato) o generico.
- Altri `error` in query → “Link non valido o scaduto”.

---

## Variabili d’ambiente (client)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

(stesse della [Login](LOGIN_PAGE.md)).

---

## Link correlati

- [Auth: Login, Forgot, Reset](AUTH_LOGIN_FORGOT_RESET.md) – documentazione completa flusso auth
- [Login](LOGIN_PAGE.md)
- [Forgot Password](FORGOT_PASSWORD_PAGE.md) – richiesta email e configurazione Resend/Supabase redirect
