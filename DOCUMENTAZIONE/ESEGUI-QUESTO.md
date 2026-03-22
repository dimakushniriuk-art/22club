# 🚀 Esegui Questo per Esportare lo Schema

## ✅ Metodo Semplice (pg_dump - RACCOMANDATO)

### Passo 1: Ottieni la Connection String

1. Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/database
2. Scorri fino a **Connection string**
3. Seleziona **"Direct connection"** (non "Connection pooling")
4. Copia la connection string, esempio:
   ```
   postgresql://postgres.icibqnmtacibgnhaidlz:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
5. **Sostituisci `[YOUR-PASSWORD]`** con la password del database
   - La password NON è la service role key!
   - Se non la ricordi, resettala dal dashboard

### Passo 2: Esegui il Comando

Apri il terminale nella cartella del progetto e esegui:

```bash
# Solo schema (senza dati) - RACCOMANDATO
pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-complete.sql
```

**Sostituisci:**

- `[PASSWORD]` con la tua password del database
- `eu-central-1` con la tua regione (se diversa)

### Passo 3: Verifica

Dopo l'esecuzione, dovresti avere:

- ✅ File `supabase-config-export/schema-complete.sql` creato
- ✅ File con tutti i CREATE TABLE, INDEX, FUNCTION, etc.

## 🎯 Alternativa: Script Automatico

Se hai configurato `DATABASE_URL` o `DIRECT_URL` in `env.local`:

```bash
npm run db:export-schema-pgdump
```

Lo script proverà a esportare automaticamente.

## 📝 Esempio Completo

```bash
# Esempio con password "miapassword123"
pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:miapassword123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-complete.sql
```

## ⚠️ Note Importanti

- **Password**: È la password del database, NON la service role key
- **Solo schema**: Il flag `--schema-only` esporta solo la struttura (senza dati)
- **Con dati**: Rimuovi `--schema-only` se vuoi anche i dati (file molto grande!)
- **Sicurezza**: Non committare mai file con password in chiaro

## ✅ Risultato

Dopo l'esecuzione avrai `schema-complete.sql` che contiene:

- CREATE TABLE statements
- CREATE INDEX statements
- CREATE FUNCTION statements
- CREATE TRIGGER statements
- CREATE VIEW statements
- CREATE POLICY statements (RLS)
- CREATE TYPE statements (ENUMs)
- ALTER TABLE statements
- COMMENT statements

Questo file può essere usato come base per:

- ✅ Importare modifiche
- ✅ Ricreare il database
- ✅ Versioning dello schema
- ✅ Backup dello schema
