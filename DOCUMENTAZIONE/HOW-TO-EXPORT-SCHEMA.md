# 📋 Come Esportare lo Schema Completo del Database

Questo file contiene le istruzioni per creare un file SQL completo che rappresenta lo stato attuale del database. Questo file può essere usato come base per:

- Importare modifiche
- Ricreare il database
- Versioning dello schema
- Backup dello schema

## 🎯 Metodo 1: Supabase CLI (RACCOMANDATO)

### Prerequisiti

1. Supabase CLI installato: `npm install -g supabase` (o usa `npx supabase`)
2. Essere loggato: `npx supabase login`
3. Progetto linkato: `npx supabase link --project-ref icibqnmtacibgnhaidlz`

### Esportazione Schema (con dati)

```bash
npx supabase db dump --schema public -f schema-complete.sql
```

**Nota**: Supabase CLI esporta schema + dati. Per solo schema, usa `pg_dump` (vedi Metodo 2).

### Esportazione Schema + Dati (ATTENZIONE: file molto grande)

```bash
npx supabase db dump --schema public > schema-with-data.sql
```

### Esportazione Solo Schema Pubblico (usa pg_dump)

Vedi Metodo 2 per esportare solo lo schema senza dati.

## 🎯 Metodo 2: pg_dump (Richiede Connection String)

### Prerequisiti

1. PostgreSQL client tools installati (`pg_dump`)
2. Connection string diretta dal Supabase Dashboard

### Ottenere Connection String

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto `icibqnmtacibgnhaidlz`
3. Vai su **Settings** > **Database**
4. Copia la **Connection string** (usa "Direct connection" o "Connection pooling")

### Esportazione Schema Solo

```bash
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  > schema-complete.sql
```

### Esportazione Schema + Dati

```bash
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-acl \
  > schema-with-data.sql
```

## 🎯 Metodo 3: Script Automatico

Esegui lo script che prova automaticamente a esportare:

```bash
npm run db:export-schema
```

Oppure:

```bash
npx tsx scripts/export-supabase-schema-dump.ts
```

## 📁 File Generati

Dopo l'esportazione, avrai un file SQL che contiene:

- ✅ CREATE TABLE statements
- ✅ CREATE INDEX statements
- ✅ CREATE FUNCTION statements
- ✅ CREATE TRIGGER statements
- ✅ CREATE VIEW statements
- ✅ CREATE POLICY statements (RLS)
- ✅ CREATE TYPE statements (ENUMs)
- ✅ ALTER TABLE statements (constraints, defaults)
- ✅ COMMENT statements

## 🔄 Come Usare il File SQL

### Per Importare in un Nuovo Database

```bash
# Con Supabase CLI
npx supabase db reset
psql "postgresql://..." < schema-complete.sql

# Oppure nel SQL Editor di Supabase
# Copia e incolla il contenuto del file
```

### Per Applicare Modifiche

1. Modifica il file `schema-complete.sql`
2. Esegui le modifiche nel SQL Editor
3. Oppure usa migrazioni Supabase

## ⚠️ Note Importanti

- **Schema-only**: Non include dati, solo struttura
- **Con dati**: Include tutti i dati (file molto grande)
- **Backup**: Salva sempre il file in un repository versionato
- **Sicurezza**: Non committare file con dati sensibili

## 🔗 Link Utili

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
