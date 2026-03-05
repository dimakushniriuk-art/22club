# 🗄️ Guida Migrazioni Database - Modulo Allenamenti

## 📋 Panoramica

Questo documento descrive tutte le migrazioni necessarie per il modulo **Gestione Allenamenti**.

---

## ✅ Checklist Migrazioni

### Migrazioni Richieste (in ordine)

1. ✅ `001_create_tables.sql` - Tabelle base (roles, profiles)
2. ✅ `20251009_create_workout_plans.sql` - Tabella schede allenamento
3. ✅ `20251009_create_workout_logs.sql` - Tabella allenamenti
4. ✅ `20251009_update_workout_logs_for_allenamenti.sql` - Aggiungi campi mancanti
5. ✅ `20251009_fix_rls_policies.sql` - Fix policy RLS
6. ✅ `20251009_COMPLETE_allenamenti_setup.sql` - **MIGRAZIONE CONSOLIDATA** ⭐

---

## 🚀 Metodo Consigliato: Migrazione Consolidata

La migrazione `20251009_COMPLETE_allenamenti_setup.sql` include **tutto** in un unico file.

### Opzione A: Supabase Dashboard (Consigliato)

1. Vai su [https://app.supabase.com](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Naviga a **Database** → **SQL Editor**
4. Apri il file `supabase/migrations/20251009_COMPLETE_allenamenti_setup.sql`
5. Copia tutto il contenuto
6. Incolla nel SQL Editor
7. Clicca **Run**

### Opzione B: CLI Supabase (Avanzato)

```bash
# 1. Verifica che Supabase CLI sia installato
npx supabase --version

# 2. Linkat il progetto (se non già fatto)
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. Pusha tutte le migrazioni
npx supabase db push

# 4. Verifica che siano state applicate
npx supabase db reset --debug
```

### Opzione C: Applicazione Manuale via psql

```bash
# Connettiti al database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Esegui la migrazione
\i supabase/migrations/20251009_COMPLETE_allenamenti_setup.sql

# Verifica
\dt  -- Lista tabelle
\d workout_logs  -- Descrizione tabella
```

---

## 📊 Struttura Database Finale

### Tabella: `profiles`

| Colonna              | Tipo         | Descrizione                |
| -------------------- | ------------ | -------------------------- |
| `id`                 | UUID         | Primary key                |
| `user_id`            | UUID         | Foreign key → auth.users   |
| `nome`               | VARCHAR(100) | Nome utente                |
| `cognome`            | VARCHAR(100) | Cognome utente             |
| `role`               | VARCHAR(20)  | Ruolo (admin/pt/atleta)    |
| `email`              | TEXT         | Email utente               |
| `phone`              | TEXT         | Telefono                   |
| `data_iscrizione`    | TIMESTAMPTZ  | Data iscrizione            |
| `stato`              | TEXT         | attivo/inattivo/sospeso    |
| `documenti_scadenza` | BOOLEAN      | Flag documenti in scadenza |
| `note`               | TEXT         | Note aggiuntive            |

### Tabella: `workout_plans` (Schede)

| Colonna       | Tipo         | Descrizione        |
| ------------- | ------------ | ------------------ |
| `id`          | UUID         | Primary key        |
| `athlete_id`  | UUID         | FK → profiles.id   |
| `name`        | VARCHAR(200) | Nome scheda        |
| `description` | TEXT         | Descrizione scheda |
| `start_date`  | DATE         | Data inizio        |
| `end_date`    | DATE         | Data fine          |
| `is_active`   | BOOLEAN      | Scheda attiva      |
| `created_by`  | UUID         | FK → auth.users.id |

### Tabella: `workout_logs` (Allenamenti)

| Colonna               | Tipo          | Descrizione                             |
| --------------------- | ------------- | --------------------------------------- |
| `id`                  | UUID          | Primary key                             |
| `atleta_id`           | UUID          | FK → profiles.id                        |
| `scheda_id`           | UUID          | FK → workout_plans.id                   |
| `data`                | TIMESTAMPTZ   | Data e ora allenamento                  |
| `durata_minuti`       | INTEGER       | Durata in minuti                        |
| `stato`               | TEXT          | completato/in_corso/programmato/saltato |
| `esercizi_completati` | INTEGER       | Num. esercizi completati                |
| `esercizi_totali`     | INTEGER       | Num. esercizi totali                    |
| `volume_totale`       | NUMERIC(10,2) | Volume totale in kg                     |
| `note`                | TEXT          | Note allenamento                        |
| `completato`          | BOOLEAN       | Flag completamento (legacy)             |

---

## 🔒 Row Level Security (RLS)

Tutte le tabelle hanno RLS abilitato con policy semplificate:

```sql
-- Policy semplificate per evitare ricorsione
CREATE POLICY "Everyone can view" ON [table]
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Everyone can create" ON [table]
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Everyone can update" ON [table]
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Everyone can delete" ON [table]
  FOR DELETE TO authenticated USING (true);
```

**Nota**: La logica di autorizzazione granulare è gestita lato applicazione.

---

## 🛠️ Funzioni Helper

### `get_allenamenti_mese(atleta_id UUID)`

Ritorna il numero di allenamenti completati nell'ultimo mese per un atleta.

```sql
SELECT get_allenamenti_mese('uuid-atleta');
```

### `get_scheda_attiva(atleta_id UUID)`

Ritorna il nome della scheda attiva per un atleta.

```sql
SELECT get_scheda_attiva('uuid-atleta');
```

---

## 🧪 Verifica Post-Migrazione

Esegui questi comandi per verificare che tutto sia ok:

```sql
-- 1. Verifica tabelle
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'workout_plans', 'workout_logs');

-- 2. Verifica colonne workout_logs
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workout_logs'
ORDER BY ordinal_position;

-- 3. Verifica RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('profiles', 'workout_plans', 'workout_logs');

-- 4. Verifica funzioni
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('get_allenamenti_mese', 'get_scheda_attiva');

-- 5. Verifica indici
SELECT indexname
FROM pg_indexes
WHERE tablename = 'workout_logs';
```

---

## ⚠️ Troubleshooting

### Errore: "Cannot find project ref"

```bash
# Soluzione: Link il progetto prima
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Errore: "relation already exists"

✅ **Non è un problema!** Le migrazioni usano `IF NOT EXISTS` e gestiscono i conflitti.

### Errore: "infinite recursion detected"

✅ **Risolto!** La migrazione `20251009_fix_rls_policies.sql` rimuove le policy ricorsive.

### Errore: "column does not exist"

```bash
# Ri-esegui la migrazione consolidata
npx supabase db reset
npx supabase db push
```

---

## 📝 Note Importanti

1. **Ordine delle migrazioni**: La migrazione consolidata gestisce automaticamente l'ordine corretto
2. **Idempotenza**: Tutte le migrazioni possono essere eseguite multiple volte senza errori
3. **Rollback**: Se necessario, usa `DROP TABLE ... CASCADE` (ATTENZIONE: cancella i dati!)
4. **Backup**: Esegui sempre un backup prima di applicare migrazioni in produzione

---

## 🎯 Prossimi Passi

Dopo aver applicato le migrazioni:

1. ✅ Verifica che non ci siano errori
2. ✅ Testa la pagina `/dashboard/allenamenti`
3. ✅ Verifica che i dati vengano caricati correttamente
4. ✅ Testa la creazione di nuovi allenamenti
5. ✅ Verifica le RLS policies con utenti diversi

---

## 📚 Risorse

- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

**Ultimo aggiornamento**: 2025-10-09  
**Versione**: 1.0  
**Compatibilità**: Supabase v2.x, PostgreSQL 14+
