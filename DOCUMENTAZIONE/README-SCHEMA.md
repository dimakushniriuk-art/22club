# 📚 Schema SQL - Guida Completa

## 🎯 Fonte di Verità

**`schema-with-data.sql` è l'UNICA fonte di verità per lo schema del database.**

Tutte le modifiche al database devono essere basate su questo file e aggiornarlo dopo ogni modifica.

---

## 📁 File in Questa Directory

### File Principali

- **`schema-with-data.sql`** ⭐ - **FONTE DI VERITÀ UNICA**
  - Schema completo del database
  - Usato come base per tutte le migrazioni
  - Deve essere aggiornato dopo ogni modifica al database

- **`schema-complete.sql`** - Export temporaneo
  - Generato da `pg_dump`
  - Può essere sovrascritto
  - Usato per aggiornare `schema-with-data.sql`

### Documentazione

- **`SCHEMA-SOURCE-OF-TRUTH.md`** - Regola fondamentale e workflow
- **`ERRORI-DA-CORREGGERE.md`** - Analisi errori e note tecniche
- **`ANALISI-ERRORI-SCHEMA.md`** - Report analisi completo
- **`ISTRUZIONI-ESPORTazione.md`** - Come esportare lo schema
- **`COMANDI-PRONTI.md`** - Comandi pronti per esportazione
- **`README-SCHEMA.md`** - Questo file

---

## 🚀 Quick Start

### Aggiornare Schema da Database

```bash
# Metodo 1: Script automatico (raccomandato)
npm run db:update-source-of-truth

# Metodo 2: Manuale
bash supabase-config-export/pg-dump-completo.sh
cp supabase-config-export/schema-complete.sql supabase-config-export/schema-with-data.sql
```

### Verificare Sincronizzazione

```bash
npm run db:sync-schema
```

### Analizzare Errori

```bash
npm run db:analyze-schema
```

---

## 📋 Workflow Completo

### 1. Prima di Modificare il Database

```bash
# 1. Leggi schema-with-data.sql per capire lo stato attuale
cat supabase-config-export/schema-with-data.sql

# 2. Verifica eventuali errori
npm run db:analyze-schema
```

### 2. Crea la Migrazione

- Basa la migrazione su `schema-with-data.sql`
- Verifica dipendenze (foreign keys, trigger, policies)
- Crea il file SQL di migrazione

### 3. Esegui la Migrazione

- Supabase Dashboard > SQL Editor
- Oppure: `supabase db push`

### 4. Aggiorna Fonte di Verità

```bash
# Aggiorna schema-with-data.sql dal database
npm run db:update-source-of-truth

# Verifica che sia sincronizzato
npm run db:sync-schema
```

### 5. Committa nel Repository

```bash
git add supabase-config-export/schema-with-data.sql
git commit -m "chore: aggiorna schema-with-data.sql dopo [descrizione modifica]"
```

---

## 🔍 Verifiche

### Verifica Sincronizzazione

```bash
# Confronta schema attuale con fonte di verità
npm run db:sync-schema
```

### Verifica Errori

```bash
# Analizza errori nel file
npm run db:analyze-schema
```

### Verifica Differenze

```bash
# Confronta due file
diff supabase-config-export/schema-with-data.sql supabase-config-export/schema-complete.sql
```

---

## 📝 Note Importanti

1. **Sempre aggiornare** `schema-with-data.sql` dopo modifiche al database
2. **Sempre consultare** `schema-with-data.sql` prima di creare migrazioni
3. **Sempre committare** `schema-with-data.sql` nel repository
4. **Non usare** altri file SQL come fonte di verità

---

## 🆘 Troubleshooting

### Il file non si aggiorna

```bash
# Verifica che pg_dump funzioni
which pg_dump

# Verifica connection string
cat env.local | grep DATABASE_URL
```

### Errori durante l'esportazione

Vedi `ISTRUZIONI-ESPORTazione.md` per soluzioni comuni.

### File troppo grande

Il file può essere grande (11K+ righe). È normale per un database completo.

---

## 📚 Documentazione Correlata

- [SCHEMA-SOURCE-OF-TRUTH.md](./SCHEMA-SOURCE-OF-TRUTH.md) - Regola fondamentale
- [ERRORI-DA-CORREGGERE.md](./ERRORI-DA-CORREGGERE.md) - Analisi errori
- [ISTRUZIONI-ESPORTazione.md](./ISTRUZIONI-ESPORTazione.md) - Come esportare
- [COMANDI-PRONTI.md](./COMANDI-PRONTI.md) - Comandi pronti

---

**Ultimo aggiornamento**: 17 Gennaio 2026
