# 🚀 Comandi Pronti per Esportare lo Schema

## ✅ Comando 1: Solo Schema (Senza Dati) - RACCOMANDATO

```bash
pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:22Club-NEW@aws-1-eu-north-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-complete.sql
```

**Oppure esegui direttamente:**
```bash
bash supabase-config-export/pg-dump-completo.sh
```

## 📦 Comando 2: Schema + Dati (File Molto Grande)

```bash
pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:22Club-NEW@aws-1-eu-north-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-with-data.sql
```

**Oppure esegui direttamente:**
```bash
bash supabase-config-export/pg-dump-con-dati.sh
```

## 📋 Dettagli Connection String

- **Regione**: `eu-north-1`
- **Porta**: `5432` (direct connection attraverso pooler)
- **Schema**: `public`
- **Password**: `22Club-NEW` (già configurata)

## ✅ Verifica

Dopo l'esecuzione, verifica che il file sia stato creato:

```bash
ls -lh supabase-config-export/schema-complete.sql
```

Dovresti vedere un file con dimensioni > 0.

## 📝 Note

- **Solo schema**: Usa `--schema-only` per esportare solo la struttura (CREATE TABLE, INDEX, etc.)
- **Con dati**: Rimuovi `--schema-only` se vuoi anche i dati (file molto grande!)
- **Porta 5432**: Usa sempre questa per pg_dump (non 6543 che è per pgbouncer)
- **File risultato**: `schema-complete.sql` contiene tutto lo schema del database

## 🎯 Cosa Contiene il File

Il file `schema-complete.sql` conterrà:
- ✅ CREATE TABLE statements
- ✅ CREATE INDEX statements
- ✅ CREATE FUNCTION statements
- ✅ CREATE TRIGGER statements
- ✅ CREATE VIEW statements
- ✅ CREATE POLICY statements (RLS)
- ✅ CREATE TYPE statements (ENUMs)
- ✅ ALTER TABLE statements
- ✅ COMMENT statements

Questo file può essere usato come base per:
- Importare modifiche
- Ricreare il database
- Versioning dello schema
- Backup dello schema
