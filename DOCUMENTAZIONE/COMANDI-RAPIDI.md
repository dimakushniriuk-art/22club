# ⚡ Comandi Rapidi - Reference

## 🚀 Esporta Schema (Comando Principale)

```bash
bash supabase-config-export/pg-dump-completo.sh
```

**Oppure comando completo:**
```bash
pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:22Club-NEW@aws-1-eu-north-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-complete.sql
```

## 📋 Connection String

```
postgresql://postgres.icibqnmtacibgnhaidlz:22Club-NEW@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

**Componenti:**
- User: `postgres.icibqnmtacibgnhaidlz`
- Password: `22Club-NEW`
- Host: `aws-1-eu-north-1.pooler.supabase.com`
- Porta: `5432`
- Database: `postgres`
- Schema: `public`

## 📁 File Output

- `schema-complete.sql` - Schema completo (11,355 righe)

## 🔄 Aggiorna Password

Se la password cambia, modifica:
1. `supabase-config-export/pg-dump-completo.sh`
2. `supabase-config-export/pg-dump-con-dati.sh`

Sostituisci `22Club-NEW` con la nuova password.

## 📖 Documentazione Completa

Vedi `ISTRUZIONI-FINALI-FUNZIONANTI.md` per dettagli completi.
