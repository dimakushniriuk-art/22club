# 📊 Report Configurazione Supabase - 22Club

**Data esportazione**: 17/01/2026, 21:49:53

**URL Progetto**: https://icibqnmtacibgnhaidlz.supabase.co

**Project ID**: icibqnmtacibgnhaidlz

## 📦 Storage Buckets

| Nome | Pubblico | File Size Limit | Allowed MIME Types |
|------|----------|-----------------|-------------------|
| general-files | ❌ | N/A | */* |
| athlete-certificates | ❌ | 10485760 | application/pdf, image/jpeg, image/png, image/jpg |
| athlete-referti | ❌ | 10485760 | application/pdf, image/jpeg, image/png, image/jpg |
| athlete-progress-photos | ❌ | 5242880 | image/jpeg, image/png, image/jpg, image/webp |
| athlete-documents | ❌ | 10485760 | application/pdf, image/jpeg, image/png, image/jpg, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| exercise-thumbs | ✅ | N/A | Tutti |
| documents | ❌ | 10485760 | application/pdf, image/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| progress-photos | ❌ | 5242880 | image/* |
| avatars | ✅ | 2097152 | image/* |
| exercise-videos | ✅ | 52428800 | video/* |

## 🗃️ Database Schema

Per esportare lo schema completo del database:

1. Apri Supabase Dashboard > SQL Editor
2. Esegui il file `export-database-schema.sql`
3. Esporta i risultati in JSON o CSV

Oppure usa Supabase CLI:

```bash
# Esegui le query SQL
supabase db execute --file export-database-schema.sql

# Oppure esporta lo schema completo
supabase db dump --schema public > schema-dump.sql
```

## 📁 File Generati

- `export-database-schema.sql` - Query SQL per esportare tutto lo schema
- `storage-config.json` - Configurazione storage buckets
- `REPORT.md` - Questo report

## 🔧 Prossimi Passi

1. Esegui `export-database-schema.sql` nel SQL Editor di Supabase
2. Esporta i risultati di ogni query in file JSON separati
3. Usa i file generati come documentazione della configurazione

