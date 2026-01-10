# 🔄 Guida Manuale: Rigenerare Tipi TypeScript da Supabase

## 📋 Quando Rigenerare i Tipi

Rigenera i tipi TypeScript quando:

- ✅ Hai applicato una migration SQL che modifica lo schema
- ✅ Hai aggiunto/modificato colonne in una tabella
- ✅ Hai creato nuove tabelle
- ✅ Vedi errori TypeScript tipo `Property 'X' does not exist on type 'never'`
- ✅ I tipi non corrispondono più allo schema del database

---

## 🎯 Metodo 1: CLI Supabase (Consigliato - Automatico)

### Prerequisiti

- Access token Supabase CLI (formato: `sbp_...`)
- Project Reference ID: `icibqnmtacibgnhaidlz`

### Passi

1. **Ottieni l'Access Token** (se non ce l'hai già):
   - Vai su: https://supabase.com/dashboard/account/tokens
   - Clicca su **"Generate new token"**
   - Copia il token (formato: `sbp_...`)

2. **Imposta la variabile d'ambiente** (PowerShell):

   ```powershell
   $env:SUPABASE_ACCESS_TOKEN = "sbp_tuo-token-qui"
   ```

3. **Rigenera i tipi**:

   ```powershell
   npx supabase gen types typescript --project-id icibqnmtacibgnhaidlz > src/lib/supabase/types.ts
   ```

   Oppure usa lo script NPM:

   ```powershell
   npm run supabase:gen:types:direct
   ```

   (Lo script verificherà automaticamente se hai l'access token)

### Comando Completo (One-liner)

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_tuo-token"; npx supabase gen types typescript --project-id icibqnmtacibgnhaidlz > src/lib/supabase/types.ts
```

---

## 🌐 Metodo 2: Interfaccia Web (Manuale - Copia/Incolla)

### Passi

1. **Vai al dashboard Supabase**:
   - Apri: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz

2. **Naviga alle impostazioni API**:
   - Clicca su **Settings** (icona ingranaggio) nella sidebar sinistra
   - Clicca su **API** nel menu

3. **Trova la sezione TypeScript types**:
   - Scorri la pagina verso il basso
   - Cerca la sezione **"TypeScript types"** o **"Generate types"**
   - Se non la vedi, prova a cercare nella sezione **"Database"** → **"Types"**

4. **Copia i tipi**:
   - Clicca su **"Generate types"** se necessario
   - Seleziona tutto il codice TypeScript mostrato (Ctrl+A)
   - Copia (Ctrl+C)

5. **Sostituisci il file**:
   - Apri `src/lib/supabase/types.ts` nel tuo editor
   - Seleziona tutto (Ctrl+A)
   - Incolla il codice copiato (Ctrl+V)
   - Salva (Ctrl+S)

---

## 🔍 Verifica Post-Rigenerazione

Dopo aver rigenerato i tipi, verifica che tutto funzioni:

```powershell
# 1. Verifica errori TypeScript
npm run typecheck

# 2. Build completa
npm run build
```

### Risultati Attesi

- ✅ Riduzione errori `Property 'X' does not exist on type 'never'` del 60-70%
- ✅ I tipi riflettono le modifiche allo schema (colonne nullable, nuove colonne, etc.)
- ✅ Migliore inferenza TypeScript per query Supabase

---

## 📝 Workflow Consigliato

### Dopo ogni Migration SQL:

```powershell
# 1. Applica la migration
npx supabase db push
# oppure applica manualmente nel dashboard

# 2. Rigenera i tipi
$env:SUPABASE_ACCESS_TOKEN = "sbp_tuo-token"
npx supabase gen types typescript --project-id icibqnmtacibgnhaidlz > src/lib/supabase/types.ts

# 3. Verifica
npm run typecheck
```

---

## ⚙️ Configurazione Permanente (Opzionale)

Per non dover inserire l'access token ogni volta, puoi salvarlo in un file `.env.local`:

1. **Crea/Modifica `.env.local`**:

   ```env
   SUPABASE_ACCESS_TOKEN=sbp_tuo-token-qui
   ```

2. **Modifica lo script** `scripts/generate-types-direct.ps1` per leggere da `.env.local`:

   ```powershell
   # All'inizio dello script, aggiungi:
   if (Test-Path ".env.local") {
       Get-Content ".env.local" | ForEach-Object {
           if ($_ -match "SUPABASE_ACCESS_TOKEN=(.+)") {
               $env:SUPABASE_ACCESS_TOKEN = $matches[1].Trim('"').Trim("'")
           }
       }
   }
   ```

3. **Ora puoi eseguire semplicemente**:
   ```powershell
   npm run supabase:gen:types:direct
   ```

---

## 🆘 Troubleshooting

### Errore: "Invalid access token format"

- Verifica che il token inizi con `sbp_`
- Assicurati di aver copiato tutto il token (sono molto lunghi)

### Errore: "Unauthorized"

- Il token potrebbe essere scaduto o revocato
- Genera un nuovo token da: https://supabase.com/dashboard/account/tokens

### Errore: "Project not found"

- Verifica che il Project Reference ID sia corretto: `icibqnmtacibgnhaidlz`
- Verifica di avere i permessi sul progetto

### I tipi non si aggiornano

- Assicurati di aver applicato la migration SQL prima di rigenerare i tipi
- Verifica che il file `src/lib/supabase/types.ts` sia stato sovrascritto
- Controlla la data di modifica del file

---

## 📚 Riferimenti

- **Documentazione Supabase CLI**: https://supabase.com/docs/reference/cli
- **Dashboard Tokens**: https://supabase.com/dashboard/account/tokens
- **API Settings**: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/api

---

## ✅ Checklist Rapida

- [ ] Access token ottenuto da dashboard
- [ ] Variabile d'ambiente impostata (o salvata in `.env.local`)
- [ ] Migration SQL applicata (se necessario)
- [ ] Tipi rigenerati con CLI o copiati dall'interfaccia web
- [ ] File `src/lib/supabase/types.ts` aggiornato
- [ ] `npm run typecheck` eseguito senza errori nuovi
- [ ] `npm run build` completato con successo
