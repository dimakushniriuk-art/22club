# 🔄 Guida: Rigenerare Tipi TypeScript da Supabase (Metodo Manuale)

## 📋 Informazioni Progetto

- **Project Reference ID**: `icibqnmtacibgnhaidlz`
- **URL Dashboard**: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz

## ✅ Metodo 1: Interfaccia Web (Consigliato - 2 minuti)

1. **Vai al dashboard Supabase**:
   - Apri: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz
   - Oppure: https://supabase.com/dashboard → Seleziona il progetto

2. **Vai alle impostazioni API**:
   - Clicca su **Settings** (icona ingranaggio) nella sidebar sinistra
   - Clicca su **API** nel menu

3. **Copia i tipi TypeScript**:
   - Scorri fino alla sezione **"TypeScript types"**
   - Clicca su **"Generate types"** se necessario
   - Copia tutto il codice TypeScript mostrato

4. **Sostituisci il file**:
   - Apri `src/lib/supabase/types.ts`
   - Sostituisci tutto il contenuto con il codice copiato
   - Salva il file

5. **Verifica**:
   ```powershell
   npm run typecheck
   ```

## 🔧 Metodo 2: Access Token CLI (Se preferisci automatizzare)

Se vuoi usare il CLI, devi ottenere un access token valido:

1. **Ottieni l'access token**:
   - Vai su: https://supabase.com/dashboard/account/tokens
   - Clicca su **"Generate new token"**
   - Copia il token (formato: `sbp_0102...1920`)

2. **Usa lo script**:
   ```powershell
   $env:SUPABASE_ACCESS_TOKEN = "sbp_tuo-token-qui"
   $env:SUPABASE_PROJECT_REF = "icibqnmtacibgnhaidlz"
   npm run supabase:gen:types:remote
   ```

## 📝 Note

- I tipi vengono generati automaticamente dallo schema del database
- Dopo aver applicato la migration `20250131_align_schema_for_typescript_types.sql`, i nuovi tipi rifletteranno:
  - Colonne nullable (`org_id`, `updated_at`, `nome`, `cognome`, etc.)
  - Nuovi indici
  - Modifiche allo schema

## ✅ Verifica Post-Rigenerazione

Dopo aver rigenerato i tipi, verifica:

```powershell
# 1. Verifica errori TypeScript
npm run typecheck

# 2. Build completa
npm run build
```

Dovresti vedere una **riduzione significativa** degli errori `Property 'X' does not exist on type 'never'`.
