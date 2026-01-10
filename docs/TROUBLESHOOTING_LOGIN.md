# 🔍 Troubleshooting Login Admin

## Problema: "Invalid API key" durante il login

### Sintomi

- Errore 401 durante il tentativo di login
- Messaggio: "Invalid API key" o "Errore del server remoto: (401) Non autorizzato"
- Il login fallisce anche con credenziali corrette

### Cause Possibili

1. **Chiave API Anon non valida o non corrispondente al progetto**
   - La chiave in `.env.local` potrebbe essere del progetto sbagliato
   - La chiave potrebbe essere scaduta o revocata

2. **Server Next.js non ha ricaricato le variabili d'ambiente**
   - Le variabili d'ambiente vengono caricate solo all'avvio del server
   - Modifiche a `.env.local` richiedono un riavvio completo

3. **Chiave API Anon non configurata correttamente**
   - La chiave potrebbe avere spazi o caratteri nascosti
   - La chiave potrebbe essere incompleta

## Soluzione Step-by-Step

### Step 1: Verifica la Chiave API nel Dashboard Supabase

1. Vai su https://app.supabase.com
2. Seleziona il progetto: **22Club-NEW** (icibqnmtacibgnhaidlz)
3. Vai su **Settings** > **API**
4. Copia la **anon public** key (non la service_role!)
5. Verifica che corrisponda a quella in `.env.local`

### Step 2: Aggiorna .env.local

Apri `.env.local` e verifica che contenga:

```env
NEXT_PUBLIC_SUPABASE_URL=https://icibqnmtacibgnhaidlz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE**:

- La chiave deve essere su una singola riga, senza spazi
- Non deve avere virgolette o apici
- Deve essere la chiave "anon public", NON la "service_role"

### Step 3: Riavvia il Server Next.js

**CRITICO**: Le variabili d'ambiente vengono caricate solo all'avvio del server!

1. Nel terminale dove gira `npm run dev`, premi **Ctrl+C** per fermare il server
2. Riavvia con: `npm run dev`
3. Attendi che il server sia completamente avviato
4. Prova di nuovo il login

### Step 4: Verifica che il Client Supabase Usi le Variabili Corrette

Lo script `src/lib/supabase/client.ts` crea il client così:

```typescript
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se le variabili non sono configurate, usa un mock client
  if (!url || !key || ...) {
    return createMockClient()
  }

  return createBrowserClient<Database>(url, key)
}
```

Se vedi il messaggio "Supabase non configurato correttamente - usando mock client", significa che le variabili non sono state caricate.

### Step 5: Test Diretto dell'API

Puoi testare direttamente se la chiave funziona:

```powershell
# Test con PowerShell
$url = "https://icibqnmtacibgnhaidlz.supabase.co"
$key = "your_anon_key_here"
$body = @{email="admin@22club.it"; password="adminadmin"} | ConvertTo-Json

Invoke-RestMethod -Uri "$url/auth/v1/token?grant_type=password" `
  -Method Post `
  -Headers @{"apikey"=$key; "Content-Type"="application/json"} `
  -Body $body
```

Se questo funziona ma il login nel browser no, il problema è nel client Next.js.

## Verifica Finale

Dopo aver seguito tutti gli step:

1. ✅ Chiave API verificata nel dashboard Supabase
2. ✅ `.env.local` aggiornato con la chiave corretta
3. ✅ Server Next.js riavviato completamente
4. ✅ Nessun messaggio "mock client" nella console del browser
5. ✅ Test diretto API funziona

Se il problema persiste, controlla:

- Console del browser per errori JavaScript
- Terminale del server Next.js per errori di compilazione
- Network tab del browser per vedere la richiesta HTTP effettiva

## Credenziali Admin

- **Email**: `admin@22club.it`
- **Password**: `adminadmin`

## Script Utili

- `npm run admin:reset-password` - Resetta la password admin via API
- `docs/VERIFICA_UTENTE_ADMIN.sql` - Verifica utente nel database
- `docs/VERIFICA_PROFILO_ADMIN.sql` - Verifica profilo admin
