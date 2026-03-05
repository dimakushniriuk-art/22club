# Pagina Login

Documentazione della pagina di accesso 22Club: design, flusso di autenticazione e redirect per ruolo.

---

## Percorso

- **URL:** `/login`
- **File:** `src/app/login/page.tsx`
- **Tipo:** Client Component (`'use client'`)

---

## Design e layout

La pagina condivide **stile e struttura** con la pagina [Forgot Password](FORGOT_PASSWORD_PAGE.md) (card, sfondo, palette).

### Struttura

- **Contenitore:** `min-h-screen`, centrato, `bg-background`, `p-4`
- **Sfondo:** componente `AthleteBackground` (gradient teal/cyan, griglia, blur)
- **Card:** `max-w-md`, `backdrop-blur-xl`, `shadow-2xl`, `bg-background-secondary/95`, `border-border`, `rounded-2xl`
- **Animazioni:** `animate-fade-in` con `animationDelay` (100ms header, 200ms form)

### Elementi UI

| Elemento        | Descrizione |
|-----------------|-------------|
| Logo            | `/logo.svg`, h-28, drop-shadow teal `rgba(20,184,166,0.3)`, blur decorativo |
| Titolo          | "Accedi" – `text-2xl font-bold text-text-primary` |
| Sottotitolo     | "Inserisci le tue credenziali per accedere al tuo account." – `text-text-secondary` |
| Campi           | Email e Password con icone (Mail, Lock) a sinistra, `pl-10`, `focus:border-teal-500` |
| Placeholder     | Email: `la.tua@email.com`, Password: `••••••••` |
| Pulsante        | Teal `bg-teal-500 hover:bg-teal-600`, spinner in loading, disabled se email/password vuoti |
| Link            | "Password dimenticata? Reimposta password" → `/forgot-password` (teal-400/teal-300) |
| Box errore      | Sfondo/bordo rosso, icona `AlertCircle`, titolo "Errore" + messaggio |

### Componenti usati

- `AthleteBackground` da `@/components/athlete/athlete-background`
- `Card`, `CardContent` da `@/components/ui/card`
- `Button`, `Input`, `Label` da `@/components/ui`
- `Image` (Next.js), `Link` (Next.js)
- Icone: `Mail`, `Lock`, `AlertCircle` da `lucide-react`

---

## Flusso di autenticazione

1. **Validazione client:** email e password obbligatorie; in caso di errori si mostrano `validationErrors` sotto i campi.
2. **Login Supabase:** `supabase.auth.signInWithPassword({ email, password })`.
3. **Gestione errore auth:**
   - "Failed to fetch" / "Supabase not configured" → messaggio su variabili d’ambiente.
   - Altro → messaggio generico "Credenziali non valide".
4. **Caricamento profilo:** dopo login, lettura da `profiles` (`role`, `org_id`, `first_login`) per `user_id = data.user.id`.
5. **Gestione errore profilo:**
   - `PGRST116` (nessun record) → "Profilo non trovato. Contatta l'amministratore..."
   - Rate limit (429) → "Troppe richieste. Riprova tra qualche secondo."
   - Altro → messaggio restituito dal backend.
6. **Redirect in base al ruolo:**

| Ruolo (DB)   | Normalizzato | Redirect |
|--------------|--------------|----------|
| admin, owner | admin        | `/dashboard/admin` |
| pt, staff    | trainer      | `/dashboard` |
| nutrizionista| –            | `/dashboard/nutrizionista` |
| massaggiatore| –            | `/dashboard/massaggiatore` |
| atleta       | athlete      | `first_login === true` → `/welcome`, altrimenti `/home` |
| Altro        | –            | Nessun redirect; messaggio "Ruolo non riconosciuto" |

7. **Fallback:** in caso di eccezione durante il caricamento del profilo → `router.replace('/post-login')`.

---

## Query string e messaggi

- **`?error=profilo`:** impostato dal middleware quando il profilo non è trovato; la pagina mostra:  
  "Profilo non trovato. Contatta l'amministratore per completare la registrazione."

---

## Variabili d’ambiente (client)

- `NEXT_PUBLIC_SUPABASE_URL` – URL progetto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – chiave anonima Supabase

In sviluppo, al mount viene loggata in console la presenza di queste variabili (solo per diagnostica).

---

## Dipendenze

- **Supabase:** `createClient()` da `@/lib/supabase/client` per `signInWithPassword` e lettura `profiles`.
- **Routing:** `useRouter`, `useSearchParams` da `next/navigation`.
- Nessuna chiamata a API interne per il login (auth diretta verso Supabase).

---

## Link correlati

- [Auth: Login, Forgot, Reset](AUTH_LOGIN_FORGOT_RESET.md) – documentazione completa flusso auth
- [Forgot Password](FORGOT_PASSWORD_PAGE.md) – recupero password e template Resend
- [Reset Password](RESET_PASSWORD_PAGE.md) – pagina impostazione nuova password dopo click sul link email
- Registrazione: `/registrati`
