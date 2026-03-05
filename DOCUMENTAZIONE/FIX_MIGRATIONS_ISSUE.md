# 🔧 Fix: Problema Disallineamento Migrazioni

## 📋 Problema Identificato

Il comando `npx supabase db push` e `npx supabase db pull` falliscono perché ci sono migrazioni remote che non esistono localmente. Questo è normale se:

- Le migrazioni sono state applicate direttamente nel dashboard Supabase
- Le migrazioni sono state applicate da un altro ambiente
- C'è stata una sincronizzazione manuale del database

## ✅ Soluzione: Script di Riparazione

Ho creato uno script PowerShell che ripara automaticamente la tabella delle migrazioni.

### Esecuzione Script

```powershell
.\scripts\repair-migrations.ps1
```

Oppure esegui manualmente i comandi:

```powershell
# Marca le migrazioni remote come "reverted" (non esistono localmente)
npx supabase migration repair --status reverted 20250111
npx supabase migration repair --status reverted 20250112
# ... (vedi script per lista completa)

# Marca le migrazioni locali come "applied" (esistono localmente)
npx supabase migration repair --status applied 001
npx supabase migration repair --status applied 002
# ... (vedi script per lista completa)
```

## 🎯 Soluzione Rapida: Applicare Trigger Manualmente

**RACCOMANDATO**: Applica la migrazione del trigger direttamente nel dashboard Supabase invece di riparare tutte le migrazioni.

### Step 1: Apri SQL Editor

Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new

### Step 2: Copia e Incolla

Apri il file `docs/QUICK_APPLY_TRIGGER.sql` e copia tutto il contenuto nell'editor SQL.

### Step 3: Esegui

Clicca "Run" o premi `Ctrl+Enter`.

### Step 4: Verifica

Esegui le query di verifica incluse nel file per confermare che il trigger sia attivo.

## 🔄 Alternativa: Sincronizzazione Completa

Se preferisci sincronizzare completamente le migrazioni:

### Opzione A: Riparazione Automatica

```powershell
.\scripts\repair-migrations.ps1
```

### Opzione B: Reset Completo (ATTENZIONE: Cancella dati locali)

```powershell
# ⚠️ ATTENZIONE: Questo cancella il database locale
npx supabase db reset
npx supabase db pull
```

## 📊 Stato Migrazioni

### Migrazioni Remote (Non Esistono Localmente)

Queste migrazioni sono state applicate nel database remoto ma non esistono nei file locali:

- `20250111` - `20250127` (varie)
- `20250127120000` - `20250127150000` (varie)
- `20250128` - `20250315` (varie)
- `20251008` - `20251014` (varie)
- `20251112` - `20251130002000` (varie)

### Migrazioni Locali (Esistono nei File)

Queste migrazioni esistono nei file locali e devono essere marcate come "applied":

- `001_create_tables.sql`
- `002_rls_policies.sql`
- `09_progress_tracking.sql`
- `10_analytics_views.sql`
- `11_notifications.sql`
- `20240115_documents.sql`
- `20240116_payments.sql`
- `20241220_chat_messages.sql`
- `20241220_inviti_atleti.sql`
- `20250109_*` (varie)
- `20250110_*` (varie)
- `20250127_create_profile_trigger.sql` ⭐ **DA APPLICARE**
- `20251008_*` (varie)
- `20251009_*` (varie)
- `20251011_create_workouts_schema.sql`
- `20251031_add_updated_at_to_exercises.sql`
- `2025_*` (varie)

## ⚠️ Note Importanti

1. **Non cancellare migrazioni remote**: Le migrazioni remote sono state applicate al database e contengono modifiche importanti
2. **Applica trigger manualmente**: La migrazione del trigger può essere applicata direttamente nel dashboard
3. **Backup prima di riparare**: Fai sempre un backup prima di modificare la tabella delle migrazioni
4. **Verifica dopo riparazione**: Dopo la riparazione, verifica che tutto funzioni correttamente

## 🔍 Verifica Post-Riparazione

Dopo aver riparato le migrazioni, verifica:

```powershell
# Verifica stato migrazioni
npx supabase migration list

# Prova push (dovrebbe funzionare ora)
npx supabase db push

# Verifica trigger
npm run db:verify-profiles
```

## 📝 File Creati

1. `scripts/repair-migrations.ps1` - Script PowerShell per riparazione automatica
2. `docs/QUICK_APPLY_TRIGGER.sql` - SQL pronto per applicare il trigger
3. `docs/APPLY_TRIGGER_MIGRATION.md` - Guida applicazione trigger
4. `docs/FIX_MIGRATIONS_ISSUE.md` - Questo documento
