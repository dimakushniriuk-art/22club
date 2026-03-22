# 🔧 Soluzione: Connection Refused

## Problema

Se vedi l'errore:

```
connection to server at "db.icibqnmtacibgnhaidlz.supabase.co" failed: Connection refused
```

Significa che la **Direct Connection** non è disponibile o non è abilitata.

## ✅ Soluzione: Usa Connection Pooling

### Passo 1: Ottieni la Connection String del Pooler

1. Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/database
2. Scorri fino a **"Connection string"**
3. Seleziona **"Connection pooling"** (NON "Direct connection")
4. Copia la connection string

Dovrebbe essere qualcosa come:

```
postgresql://postgres.icibqnmtacibgnhaidlz:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### Passo 2: Usa il Comando con Pooler

Ho creato un file alternativo: `pg-dump-command-pooler.sh`

Modificalo con:

1. La password corretta (sostituisci `22Club-NEW` se diversa)
2. La regione corretta (sostituisci `eu-central-1` se diversa)

Poi esegui:

```bash
bash supabase-config-export/pg-dump-command-pooler.sh
```

### Passo 3: Se Anche il Pooler Non Funziona

Verifica la regione corretta:

- Vai su Dashboard > Settings > Database
- La connection string mostra la regione (es: `eu-central-1`, `us-east-1`)
- Assicurati di usare la stessa regione nel comando

## 🔍 Come Trovare la Regione Corretta

La regione è nella connection string del pooler:

- `aws-0-eu-central-1` = Europa Centrale
- `aws-0-us-east-1` = USA Est
- `aws-0-us-west-1` = USA Ovest
- `aws-0-ap-southeast-1` = Asia Pacifico

## 📝 Esempio Comando Corretto

Se la tua connection string del pooler è:

```
postgresql://postgres.icibqnmtacibgnhaidlz:mypassword@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

Il comando sarà:

```bash
pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:mypassword@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-complete.sql
```

## ⚠️ Nota

- **Connection Pooling**: Usa sempre questa per `pg_dump` (più affidabile)
- **Direct Connection**: Potrebbe non essere abilitata o non funzionare da remoto
- **Porta**: Usa sempre `5432` per il pooler
