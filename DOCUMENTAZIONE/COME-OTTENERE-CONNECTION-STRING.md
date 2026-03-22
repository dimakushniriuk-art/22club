# 🔗 Come Ottenere la Connection String

## 📍 Passo 1: Vai al Dashboard

Apri: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/database

## 📍 Passo 2: Trova Connection String

Scorri fino alla sezione **"Connection string"**

Vedrai qualcosa come:

```
postgresql://postgres.icibqnmtacibgnhaidlz:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

## 📍 Passo 3: Scegli il Tipo

Hai due opzioni:

### Opzione A: Connection Pooling (Raccomandato)

- Usa: **"Connection pooling"**
- Formato: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`
- Esempio: `postgresql://postgres.icibqnmtacibgnhaidlz:mypassword@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`

### Opzione B: Direct Connection

- Usa: **"Direct connection"**
- Formato: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- Esempio: `postgresql://postgres.icibqnmtacibgnhaidlz:mypassword@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres`

## 📍 Passo 4: Sostituisci [YOUR-PASSWORD]

**IMPORTANTE**: La password NON è la service role key!

La password è quella che hai impostato quando hai creato il progetto, oppure:

- Vai su: Settings > Database > Database password
- Se non la ricordi, clicca "Reset database password"

## 🚀 Metodo Automatico

Usa lo script helper:

```bash
npm run db:build-pgdump
```

Lo script ti chiederà:

1. Se vuoi incollare la connection string completa OPPURE
2. Se vuoi inserire i valori separatamente (project ref, password, region)

Poi genererà automaticamente il comando corretto!

## 📝 Esempio Completo

Se la tua connection string è:

```
postgresql://postgres.icibqnmtacibgnhaidlz:mypassword123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

Il comando sarà:

```bash
pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:mypassword123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-complete.sql
```

## ⚠️ Sicurezza

- **NON** committare mai file con password in chiaro
- **NON** condividere la connection string pubblicamente
- Usa variabili d'ambiente per progetti in produzione
