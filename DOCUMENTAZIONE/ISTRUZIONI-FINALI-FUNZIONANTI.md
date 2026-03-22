# 📋 Istruzioni Finali - Comandi Funzionanti

**Data creazione**: 17 Gennaio 2026  
**Progetto**: 22Club  
**Database**: Supabase (icibqnmtacibgnhaidlz)  
**Regione**: eu-north-1

## ✅ Comandi che Hanno Funzionato

### 1. Esportazione Schema Completo (Senza Dati)

**Comando:**

```bash
pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:22Club-NEW@aws-1-eu-north-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-complete.sql
```

**Oppure esegui lo script:**

```bash
bash supabase-config-export/pg-dump-completo.sh
```

**Risultato**: File `schema-complete.sql` con tutto lo schema del database (11,355 righe)

### 2. Esportazione Schema (File Alternativo)

**Comando:**

```bash
pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:22Club-NEW@aws-1-eu-north-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-with-data.sql
```

**Oppure esegui lo script:**

```bash
bash supabase-config-export/pg-dump-con-dati.sh
```

## 📝 Dettagli Connection String

- **Host**: `aws-1-eu-north-1.pooler.supabase.com`
- **Porta**: `5432` (direct connection attraverso pooler)
- **Database**: `postgres`
- **Schema**: `public`
- **User**: `postgres.icibqnmtacibgnhaidlz`
- **Password**: `22Club-NEW`
- **Regione**: `eu-north-1`

## 🔧 Script Disponibili

### Script 1: `pg-dump-completo.sh`

Esporta solo schema (senza dati) in `schema-complete.sql`

```bash
bash supabase-config-export/pg-dump-completo.sh
```

### Script 2: `pg-dump-con-dati.sh`

Esporta solo schema (senza dati) in `schema-with-data.sql`

```bash
bash supabase-config-export/pg-dump-con-dati.sh
```

## 📍 Come Ottenere la Connection String

1. Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/database
2. Scorri fino a **"Connection string"**
3. Seleziona **"Connection pooling"** (NON "Direct connection")
4. Copia la connection string
5. Sostituisci `[YOUR-PASSWORD]` con la password del database

**Formato atteso:**

```
postgresql://postgres.icibqnmtacibgnhaidlz:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

## ⚠️ Note Importanti

1. **Password**: È la password del database, NON la service role key
2. **Porta**: Usa sempre `5432` per pg_dump (non `6543` che è per pgbouncer)
3. **Regione**: Verifica che sia `eu-north-1` (potrebbe cambiare)
4. **Schema-only**: Il flag `--schema-only` esporta solo la struttura, non i dati
5. **Direct Connection**: Non funziona, usa sempre Connection Pooling

## 📦 Cosa Contiene il File SQL

Il file `schema-complete.sql` contiene:

- ✅ CREATE TABLE statements (tutte le tabelle)
- ✅ CREATE INDEX statements (tutti gli indici)
- ✅ CREATE FUNCTION statements (tutte le funzioni)
- ✅ CREATE TRIGGER statements (tutti i trigger)
- ✅ CREATE VIEW statements (tutte le viste)
- ✅ CREATE POLICY statements (tutte le RLS policies)
- ✅ CREATE TYPE statements (tutti gli ENUM)
- ✅ ALTER TABLE statements (constraints, defaults)
- ✅ COMMENT statements (commenti su tabelle/colonne)

## 🔄 Come Usare il File in Futuro

### Per Importare in un Nuovo Database

```bash
psql "postgresql://postgres.icibqnmtacibgnhaidlz:22Club-NEW@aws-1-eu-north-1.pooler.supabase.com:5432/postgres" \
  -f supabase-config-export/schema-complete.sql
```

### Per Applicare Modifiche

1. Modifica il file `schema-complete.sql`
2. Esegui le modifiche nel SQL Editor di Supabase
3. Oppure usa migrazioni Supabase

### Per Backup Periodico

Esegui periodicamente:

```bash
bash supabase-config-export/pg-dump-completo.sh
```

Poi committa il file in Git (senza password!) per versioning.

## 🚀 Workflow Consigliato

1. **Esportazione iniziale**: ✅ Fatto - `schema-complete.sql` creato
2. **Per modifiche future**: Crea migrazioni in `supabase/migrations/`
3. **Per backup**: Riesporta periodicamente con il comando sopra
4. **Per deploy**: Usa sempre le migrazioni, non il file completo

## 📁 File Generati

- ✅ `schema-complete.sql` (11,355 righe) - Schema completo funzionante
- ✅ `schema-with-data.sql` (11,355 righe) - Schema completo (alternativo)
- ✅ `pg-dump-completo.sh` - Script eseguibile
- ✅ `pg-dump-con-dati.sh` - Script eseguibile alternativo

## 🔒 Sicurezza

- ⚠️ **NON** committare mai file con password in chiaro
- ⚠️ **NON** condividere la connection string pubblicamente
- ✅ Usa variabili d'ambiente per progetti in produzione
- ✅ Considera di resettare la password se l'hai condivisa

## 📞 Supporto

Se i comandi non funzionano in futuro:

1. Verifica che la password sia ancora corretta
2. Verifica che la regione sia ancora `eu-north-1`
3. Controlla che il progetto sia ancora attivo
4. Usa `npm run db:build-pgdump` per rigenerare i comandi
