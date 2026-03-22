# 📋 Istruzioni Esportazione Schema Database

## ⚠️ Problema Docker

Se vedi l'errore `Cannot connect to the Docker daemon`, significa che Supabase CLI sta cercando di usare il database locale invece di quello remoto.

## ✅ Soluzione: Usa il Flag --linked

Quando esporti, **sempre** usa il flag `--linked` per forzare l'uso del database remoto:

```bash
npx supabase db dump --schema public --linked -f schema-complete.sql
```

## 🔧 Setup Iniziale (Solo Prima Volta)

### 1. Login a Supabase

```bash
npx supabase login
```

### 2. Linka il Progetto

```bash
npx supabase link --project-ref icibqnmtacibgnhaidlz
```

Ti chiederà:

- **Database Password**: La password del database (non la service role key!)
  - Trovala in: Supabase Dashboard > Settings > Database > Database password
  - Oppure resettala se non la ricordi

### 3. Esporta lo Schema

```bash
npx supabase db dump --schema public --linked -f supabase-config-export/schema-complete.sql
```

## 🎯 Alternativa: pg_dump (Senza Docker)

Se non vuoi usare Supabase CLI o hai problemi con Docker:

### 1. Ottieni Connection String

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Progetto: `icibqnmtacibgnhaidlz`
3. **Settings** > **Database**
4. Copia la **Connection string** (usa "Direct connection" o "Connection pooling")
5. Sostituisci `[YOUR-PASSWORD]` con la password del database

### 2. Esporta con pg_dump

```bash
# Solo schema (senza dati)
pg_dump "postgresql://postgres:[PASSWORD]@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  > supabase-config-export/schema-only.sql

# Schema + dati
pg_dump "postgresql://postgres:[PASSWORD]@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-acl \
  > supabase-config-export/schema-with-data.sql
```

## 📝 Note Importanti

- **--linked**: Forza l'uso del database remoto (non locale)
- **Database Password**: Diversa dalla service role key
- **Schema-only**: Usa `pg_dump --schema-only` per solo struttura
- **Con dati**: File molto grande, usa solo se necessario

## 🔍 Verifica Setup

Verifica che il progetto sia linkato:

```bash
npx supabase status
```

Dovresti vedere informazioni sul progetto remoto, non locale.
