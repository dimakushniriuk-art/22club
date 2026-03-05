# 🚀 Quick Start: Esporta Schema Database

## Opzione 1: Supabase CLI (Più Semplice)

```bash
# 1. Login
npx supabase login

# 2. Linka il progetto
npx supabase link --project-ref icibqnmtacibgnhaidlz

# 3. Esporta schema + dati (usa --linked per database remoto)
npx supabase db dump --schema public --linked -f schema-complete.sql
```

**Risultato**: File `schema-complete.sql` con tutto lo schema e i dati.

## Opzione 2: Solo Schema (pg_dump)

Se vuoi **solo lo schema senza dati**:

1. Ottieni la connection string da Supabase Dashboard > Settings > Database
2. Usa `pg_dump`:

```bash
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  > schema-only.sql
```

**Risultato**: File `schema-only.sql` con solo la struttura (CREATE TABLE, INDEX, etc.).

## Opzione 3: Script Automatico

```bash
npm run db:export-schema
```

Lo script proverà automaticamente a esportare usando Supabase CLI.

## 📁 Dove Trovare i File

Tutti i file vengono salvati in: `supabase-config-export/`

- `schema-complete.sql` - Schema completo (se esportato)
- `HOW-TO-EXPORT-SCHEMA.md` - Istruzioni dettagliate
- `QUICK-START.md` - Questo file

## ✅ Cosa Fare Dopo

Una volta ottenuto il file SQL:

1. **Salvalo in un repository versionato** (Git)
2. **Usalo come base** per nuove modifiche
3. **Applica modifiche** creando nuove migrazioni
4. **Mantieni aggiornato** quando fai modifiche importanti

## 🔄 Workflow Consigliato

1. **Esporta schema iniziale**: `schema-complete.sql`
2. **Per modifiche**: Crea migrazioni in `supabase/migrations/`
3. **Per backup**: Riesporta periodicamente lo schema
4. **Per deploy**: Usa le migrazioni, non il file completo

## ⚠️ Importante

- Il file SQL completo può essere molto grande se include i dati
- Per produzione, usa sempre le **migrazioni** invece del file completo
- Il file completo è utile per **backup** e **documentazione**
