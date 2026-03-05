# 🔧 Applicazione Migrazioni 2026-01-09

## 📋 Situazione

Le modifiche al codice di login sono state completate, ma le migrazioni Supabase potrebbero non essere state applicate. Questo potrebbe causare problemi con:
- Performance delle query su `profiles`
- RLS policies che potrebbero bloccare l'accesso
- Ruoli mancanti (nutrizionista, massaggiatore)

## ✅ Verifica Utenti

**Risultato**: ✅ Tutti gli utenti esistono e hanno profili corretti
- ✅ `b.francesco@22club.it` - Trainer (ID: be43f62f-b94a-4e4d-85d0-aed6fe4e595a)
- ✅ `admin@22club.it` - Admin (ID: 8e4cd6bd-1035-4e92-a8a3-3a155d763bc1)
- ✅ `dima.kushniriuk@gmail.com` - Athlete (ID: decf0dcc-6f88-4d40-8e24-e277acf48292)

## 🔧 Migrazioni da Applicare

### 1. Ottimizzazione Performance Query Profiles

**File**: `supabase/migrations/20260109_optimize_profiles_query_performance.sql`

**Cosa fa**:
- Aggiunge indici compositi per query comuni
- Ottimizza RLS policies
- Aggiorna statistiche per il planner

**Come applicare**:
1. Vai al dashboard Supabase → SQL Editor
2. Copia e incolla il contenuto del file
3. Esegui la query

### 2. Aggiunta Ruoli Nutrizionista e Massaggiatore

**File**: `supabase/migrations/20260109_add_nutrizionista_massaggiatore_roles.sql`

**Cosa fa**:
- Aggiunge i ruoli 'nutrizionista' e 'massaggiatore'
- Aggiorna i constraint CHECK su `roles` e `profiles`

**Come applicare**:
1. Vai al dashboard Supabase → SQL Editor
2. Copia e incolla il contenuto del file
3. Esegui la query

### 3. Verifica Utenti e Fix

**File**: `supabase/migrations/20260109_verify_users_and_apply_fixes.sql`

**Cosa fa**:
- Verifica esistenza utenti
- Verifica RLS policies
- Crea indici mancanti
- Assicura che le policies necessarie esistano

**Come applicare**:
1. Vai al dashboard Supabase → SQL Editor
2. Copia e incolla il contenuto del file
3. Esegui la query

## 🚀 Procedura Completa

### Opzione 1: Applicazione Manuale (Consigliata)

1. **Apri Dashboard Supabase**
   - Vai su https://supabase.com/dashboard
   - Seleziona il progetto `icibqnmtacibgnhaidlz`

2. **Vai a SQL Editor**
   - Clicca su "SQL Editor" nel menu laterale

3. **Applica Migrazioni in Ordine**:
   ```sql
   -- 1. Ottimizzazione Performance
   -- Copia contenuto di: 20260109_optimize_profiles_query_performance.sql
   
   -- 2. Aggiunta Ruoli
   -- Copia contenuto di: 20260109_add_nutrizionista_massaggiatore_roles.sql
   
   -- 3. Verifica e Fix
   -- Copia contenuto di: 20260109_verify_users_and_apply_fixes.sql
   ```

4. **Verifica Risultati**:
   - Controlla che non ci siano errori
   - Verifica che gli indici siano stati creati
   - Verifica che le policies siano corrette

### Opzione 2: Riparazione Migrazioni (Avanzato)

Se vuoi sincronizzare le migrazioni locali con quelle remote:

```bash
# 1. Ripara migrazioni remote mancanti
npx supabase migration repair --status reverted <migration_ids>

# 2. Pull migrazioni remote
npx supabase db pull

# 3. Applica migrazioni locali
npx supabase db push
```

**⚠️ Attenzione**: Questa operazione può essere complessa se ci sono molte discrepanze.

## 🔍 Verifica Post-Applicazione

Dopo aver applicato le migrazioni, verifica:

1. **Indici Creati**:
   ```sql
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'profiles' 
   AND indexname LIKE 'idx_profiles%';
   ```

2. **RLS Policies Attive**:
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'profiles';
   ```

3. **Ruoli Disponibili**:
   ```sql
   SELECT name, description 
   FROM roles 
   ORDER BY name;
   ```

## 🐛 Troubleshooting

### Problema: Login fallisce con 400

**Possibili cause**:
1. Password errata (verifica nel dashboard Supabase)
2. RLS policies che bloccano l'accesso
3. Problema con configurazione client

**Soluzione**:
1. Verifica password nel dashboard Supabase (Auth → Users)
2. Verifica che le RLS policies permettano l'accesso
3. Controlla console browser per errori dettagliati

### Problema: Profilo non trovato dopo login

**Possibili cause**:
1. Trigger `on_auth_user_created` non funziona
2. RLS policy blocca la query

**Soluzione**:
1. Verifica che il trigger esista e sia attivo
2. Verifica RLS policies su `profiles`
3. Crea profilo manualmente se necessario

## 📝 Note

- Le migrazioni sono idempotenti (possono essere eseguite più volte)
- Le migrazioni non modificano dati esistenti
- Le migrazioni sono ottimizzate per performance

## ✅ Checklist Post-Applicazione

- [ ] Migrazione ottimizzazione performance applicata
- [ ] Migrazione ruoli applicata
- [ ] Migrazione verifica applicata
- [ ] Indici creati correttamente
- [ ] RLS policies corrette
- [ ] Ruoli disponibili nel database
- [ ] Test login funzionante
