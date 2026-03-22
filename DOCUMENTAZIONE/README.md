# 📋 Guida all'Esportazione Configurazione Supabase

## ⚡ Quick Start (Comandi Funzionanti)

**Per esportare lo schema completo:**

```bash
bash supabase-config-export/pg-dump-completo.sh
```

**Vedi anche:**

- `ISTRUZIONI-FINALI-FUNZIONANTI.md` - Istruzioni complete con comandi testati
- `COMANDI-RAPIDI.md` - Reference rapido dei comandi

---

## File Disponibili

### 1. `export-database-schema.sql`

Contiene 16 query SQL per esportare tutte le informazioni del database:

- Tabelle
- Colonne
- Primary Keys
- Foreign Keys
- Unique Constraints
- Check Constraints
- Indici
- Funzioni/Stored Procedures
- Trigger
- Viste
- RLS Policies
- RLS Enabled Tables
- Estensioni
- Sequences
- Enums
- **Comments** (Query 16) - Commenti su tabelle e colonne

### 2. `storage-config.json`

Configurazione completa dei bucket storage (10 bucket trovati).

### 3. `config.json`

Configurazione generale del progetto Supabase.

### 4. `REPORT.md`

Report markdown con riepilogo della configurazione.

## Come Usare

### Passo 1: Esegui le Query SQL

1. Apri [Supabase Dashboard](https://supabase.com/dashboard)
2. Vai al progetto `icibqnmtacibgnhaidlz`
3. Apri **SQL Editor**
4. Copia e incolla le query da `export-database-schema.sql`
5. Esegui una query alla volta o tutte insieme

### Passo 2: Esporta i Risultati

Per ogni query, esporta i risultati:

- **Formato JSON**: Clicca su "Download" > "JSON" nel SQL Editor
- **Formato CSV**: Clicca su "Download" > "CSV"
- Salva i file con nomi descrittivi:
  - `01-tables.json`
  - `02-columns.json`
  - `03-primary-keys.json`
  - ...e così via

### Passo 3: Query 16 - Comments

La query 16 restituisce tutti i commenti su tabelle e colonne. Questo è molto utile per:

- Documentazione del database
- Capire lo scopo di ogni tabella/colonna
- Onboarding nuovi sviluppatori

**Esempio risultato Query 16:**

```sql
-- 16. COMMENTS (Table and column comments)
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  a.attname AS column_name,
  obj_description(c.oid, 'pg_class') AS table_comment,
  col_description(c.oid, a.attnum) AS column_comment
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_attribute a ON c.oid = a.attrelid AND a.attnum > 0 AND NOT a.attisdropped
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND n.nspname NOT LIKE 'pg_%'
  AND c.relkind IN ('r', 'v')
ORDER BY n.nspname, c.relname, a.attnum;
```

## Prossimi Passi

1. ✅ Esegui tutte le 16 query nel SQL Editor
2. ✅ Esporta i risultati in formato JSON
3. ✅ Salva i file nella cartella `supabase-config-export/`
4. ✅ Usa i file come documentazione della configurazione

## Note Importanti

- Le query includono anche tabelle di sistema (`auth`, `storage`, `realtime`, etc.)
- Filtra i risultati se vuoi solo le tabelle del progetto (`schema = 'public'`)
- I commenti sono molto utili per capire la struttura del database
- Alcune tabelle hanno commenti dettagliati (es: `progress_logs`, `athlete_*`)

## Script Utili

Per rieseguire l'esportazione storage:

```bash
npm run db:export-config
```

Oppure:

```bash
npx tsx scripts/export-supabase-config-complete.ts
```
