# ⚠️ IMPORTANTE: Password del Database

## 🔑 La Password NON è la Service Role Key!

La password che ti serve è la **Database Password**, che è diversa dalla Service Role Key.

## 📍 Come Ottenere la Password

### Metodo 1: Dal Dashboard (Se la Ricordi)

1. Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/database
2. Scorri fino a **"Database password"**
3. Se la vedi, usala
4. Se non la vedi (è nascosta per sicurezza), devi resettarla

### Metodo 2: Reset della Password (Se Non la Ricordi)

1. Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/database
2. Clicca su **"Reset database password"**
3. Inserisci una nuova password (salvala in un posto sicuro!)
4. Usa questa nuova password nel comando

## 🔧 Come Sostituire la Password nel Comando

### Opzione A: Usa lo Script Helper (RACCOMANDATO)

```bash
npm run db:build-pgdump
```

Quando incolli la connection string con `[YOUR-PASSWORD]`, lo script ti chiederà automaticamente di inserire la password e la sostituirà.

### Opzione B: Sostituzione Manuale

Apri il file `pg-dump-command-ready.sh` e sostituisci `[YOUR-PASSWORD]` con la tua password reale.

**PRIMA:**

```bash
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" \
```

**DOPO (esempio):**

```bash
pg_dump "postgresql://postgres:miapwd123@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" \
```

## ✅ Verifica

Dopo aver sostituito la password, esegui:

```bash
bash supabase-config-export/pg-dump-command-ready.sh
```

Se funziona, vedrai il file `schema-complete.sql` essere creato.

## 🔒 Sicurezza

- **NON** committare mai file con password in chiaro
- **NON** condividere la password pubblicamente
- Dopo l'esportazione, considera di resettare la password se l'hai condivisa

## 🆘 Se Continui ad Avere Errori

1. Verifica di aver sostituito `[YOUR-PASSWORD]` con la password reale
2. Verifica che la password sia corretta (prova a resettarla)
3. Verifica che la connection string sia completa e corretta
4. Prova con "Connection pooling" invece di "Direct connection" (o viceversa)
