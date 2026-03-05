# 🔐 Reset Password Admin via API Supabase

## Descrizione

Questo script resetta la password dell'utente admin tramite l'API Admin di Supabase, utilizzando la Service Role Key. Questo è il metodo corretto per resettare le password, poiché Supabase gestisce l'hashing in modo specifico.

## Prerequisiti

1. ✅ File `.env.local` configurato con:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (chiave di servizio - SEGRETA!)

2. ✅ Utente admin esistente in `auth.users` con email `admin@22club.it`

## Come Ottenere la Service Role Key

1. Vai su https://app.supabase.com
2. Seleziona il progetto: **22Club-NEW** (icibqnmtacibgnhaidlz)
3. Vai su **Settings** > **API**
4. Copia la **service_role** key (NON la anon key!)
5. Aggiungila a `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

⚠️ **IMPORTANTE**: La Service Role Key ha privilegi completi sul database. NON esporla mai nel client-side!

## Utilizzo

### Metodo 1: Script NPM (Consigliato)

```powershell
npm run admin:reset-password
```

### Metodo 2: Esecuzione Diretta

```powershell
npx tsx scripts/reset-admin-password.ts
```

## Cosa Fa lo Script

1. ✅ Verifica che le variabili d'ambiente siano configurate
2. ✅ Crea un client Supabase con privilegi admin
3. ✅ Cerca l'utente admin (`admin@22club.it`)
4. ✅ Resetta la password a `adminadmin`
5. ✅ Conferma automaticamente l'email
6. ✅ Verifica che il reset sia andato a buon fine

## Output Atteso

```
🔐 Reset Password Utente Admin
================================

📧 Email: admin@22club.it
🔑 Nuova Password: adminadmin

🔍 Verifica esistenza utente...
✅ Utente trovato: 8e4cd6bd-1035-4e92-a8a3-3a155d763bc1
   Email confermata: Sì

🔄 Reset password in corso...
✅ Password resettata con successo!

🔍 Verifica finale...
✅ Utente verificato:
   ID: 8e4cd6bd-1035-4e92-a8a3-3a155d763bc1
   Email: admin@22club.it
   Email confermata: Sì
   Ultimo aggiornamento: 2025-12-29T18:38:10.552985Z

================================
✅ Reset password completato!

Ora puoi fare login con:
   Email: admin@22club.it
   Password: adminadmin
```

## Troubleshooting

### Errore: "SUPABASE_SERVICE_ROLE_KEY non configurato"

**Soluzione**: Aggiungi la Service Role Key a `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Errore: "Utente admin@22club.it non trovato"

**Soluzione**: Crea prima l'utente tramite:

1. Dashboard Supabase > Authentication > Users > Add User
2. Oppure esegui: `docs/CREA_UTENTE_ADMIN_DIRETTO.sql`

### Errore: "Invalid API key"

**Soluzione**: Verifica che la Service Role Key sia corretta e non scaduta.

## Credenziali Admin

Dopo il reset, puoi fare login con:

- **Email**: `admin@22club.it`
- **Password**: `adminadmin`

## Note di Sicurezza

- ⚠️ La Service Role Key ha privilegi completi sul database
- ⚠️ NON committare mai `.env.local` (è già in `.gitignore`)
- ⚠️ NON esporre mai la Service Role Key nel client-side
- ✅ Usa questo script solo in ambiente di sviluppo o con accesso sicuro

## File Correlati

- `scripts/reset-admin-password.ts` - Script principale
- `docs/RESET_PASSWORD_ADMIN.sql` - Script SQL alternativo (non raccomandato)
- `docs/CREA_UTENTE_ADMIN_DIRETTO.sql` - Crea utente admin se mancante
