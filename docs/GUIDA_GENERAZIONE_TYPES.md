# 🔄 Guida Generazione Types TypeScript da Supabase

**Project ID**: `icibqnmtacibgnhaidlz`  
**File Output**: `src/lib/supabase/types.ts`

---

## 🚀 Quick Start: Autenticazione Permanente (Raccomandato)

**Esegui UNA SOLA VOLTA** per salvare l'autenticazione in modo permanente:

```powershell
npm run supabase:auth:setup
```

Questo script ti guiderà attraverso il processo di autenticazione e salverà le credenziali nel profilo Supabase CLI. Dopo questa configurazione, potrai generare i types senza dover reinserire il token ogni volta!

**Dopo l'autenticazione, genera i types:**

```powershell
npm run supabase:gen:types:direct
```

---

## 🎯 Opzione 1: Usare Access Token (Raccomandato)

### Passo 1: Ottieni l'Access Token

1. Vai su: https://supabase.com/dashboard/account/tokens
2. Clicca su **"Generate new token"**
3. Copia il token (formato: `sbp_...`)
4. **IMPORTANTE**: Salva il token in un posto sicuro, non sarà più visibile!

### Passo 2: Imposta la Variabile d'Ambiente

**In PowerShell:**

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_tuo-token-qui"
```

**In CMD:**

```cmd
set SUPABASE_ACCESS_TOKEN=sbp_tuo-token-qui
```

### Passo 3: Genera i Types

**Metodo A - Usando lo script PowerShell:**

```powershell
npm run supabase:gen:types:direct
```

**Metodo B - Comando diretto:**

```powershell
cd "C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online"
npx supabase gen types typescript --project-id icibqnmtacibgnhaidlz | Out-File -FilePath "src/lib/supabase/types.ts" -Encoding utf8
```

---

## 🎯 Opzione 2: Login Interattivo (Se hai accesso al browser)

### Passo 1: Esegui il Login

Apri un terminale PowerShell/CMD e esegui:

```powershell
cd "C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online"
npx supabase login
```

Questo aprirà il browser per autenticarti.

### Passo 2: Genera i Types

Dopo il login, esegui:

```powershell
npx supabase gen types typescript --project-id icibqnmtacibgnhaidlz | Out-File -FilePath "src/lib/supabase/types.ts" -Encoding utf8
```

---

## 🎯 Opzione 3: Copia Manuale dal Dashboard (Senza autenticazione)

### Passo 1: Apri il Dashboard

Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/api

### Passo 2: Copia i Types

1. Scorri fino alla sezione **"TypeScript types"**
2. Clicca su **"Copy"** per copiare tutto il codice
3. Incolla il contenuto in `src/lib/supabase/types.ts` (sostituisci tutto il contenuto esistente)

---

## ✅ Verifica Dopo la Generazione

Dopo aver generato i types, verifica che tutto funzioni:

```powershell
# Verifica che non ci siano errori TypeScript
npm run typecheck

# Verifica che il build funzioni
npm run build
```

---

## 🔍 Troubleshooting

### Errore: "Unauthorized"

- Verifica che l'access token sia valido
- Assicurati che la variabile d'ambiente `SUPABASE_ACCESS_TOKEN` sia impostata correttamente
- Il token potrebbe essere scaduto, genera un nuovo token

### Errore: "Cannot find path"

- Assicurati di essere nella directory corretta del progetto
- Verifica che la cartella `src/lib/supabase/` esista

### Errore: "Project not found"

- Verifica che il project ID sia corretto: `icibqnmtacibgnhaidlz`
- Assicurati di avere i permessi sul progetto

---

## 📝 Note

- I types vengono generati direttamente dal database remoto
- Qualsiasi modifica manuale ai types verrà sovrascritta alla prossima generazione
- È consigliabile rigenerare i types dopo ogni modifica allo schema del database
- Il file `src/lib/supabase/types.ts` è già presente nel progetto e verrà sovrascritto

---

## 🚀 Quick Start (Se hai già il token)

```powershell
# 1. Imposta il token
$env:SUPABASE_ACCESS_TOKEN = "sbp_tuo-token"

# 2. Genera i types
npm run supabase:gen:types:direct

# 3. Verifica
npm run typecheck
```
