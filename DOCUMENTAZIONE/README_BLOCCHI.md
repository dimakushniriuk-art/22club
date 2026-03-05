# 📋 Migrazioni Database - Ordine di Esecuzione

Questo documento elenca l'ordine di esecuzione dei blocchi di migrazione.

## ⚠️ IMPORTANTE

Esegui i blocchi **nell'ordine numerico** per evitare errori di dipendenze.

## 📦 Blocchi Disponibili

### Blocco 001: Funzioni di Supporto

**File:** `20250110_001_functions.sql`

- Funzione `update_updated_at_column()`
- Funzione `column_exists()`

### Blocco 002: Tabella Roles

**File:** `20250110_002_roles.sql`

- Creazione/aggiornamento tabella `roles`
- Inserimento ruoli base
- Trigger e RLS

### Blocco 003: Tabella Profiles

**File:** `20250110_003_profiles.sql` (da creare)

- Creazione/aggiornamento tabella `profiles`
- Aggiunta colonne mancanti
- Indici e RLS policies

### Blocco 004-025: Altre Tabelle

I blocchi rimanenti seguono lo stesso pattern numerato.

## 🚀 Esecuzione Rapida

Esegui tutti i blocchi in sequenza dalla dashboard Supabase SQL Editor oppure usa lo script PowerShell:

```powershell
cd supabase/migrations
.\_split_migration.ps1
```

Poi esegui i file nell'ordine numerico.
