# 📊 Analisi Colonne Tabelle - Report

**Data**: 2025-12-07  
**Problema**: Lo script `FIX_RLS_POLICIES_COMPLETE.sql` cerca colonne che potrebbero non esistere

---

## 🔍 Problema Identificato

Lo script RLS cerca colonne che potrebbero non esistere o avere nomi diversi nelle tabelle:

### 📋 Tabelle con Colonne Mancanti

#### 1. **appointments**

- ❌ `athlete_id` - Potrebbe non esistere
- ❌ `trainer_id` - Potrebbe non esistere
- ❌ `staff_id` - Potrebbe non esistere

**Nota**: Le colonne potrebbero esistere ma RLS troppo restrittivo impedisce la lettura.

#### 2. **payments**

- ✅ `athlete_id` - Esiste
- ❌ `trainer_id` - **MANCA**
- ✅ `created_by_staff_id` - Esiste (alternativa)

**Soluzione**: Lo script già gestisce il caso senza `trainer_id`, ma potrebbe usare `created_by_staff_id`.

#### 3. **inviti_atleti**

- ❌ `trainer_id` - **MANCA**
- ✅ `pt_id` - Esiste
- ✅ `invited_by` - Esiste

**Soluzione**: ✅ Lo script già gestisce questo caso correttamente!

#### 4. **workout_plans**

- ❌ `athlete_id` - Potrebbe non esistere
- ❌ `trainer_id` - Potrebbe non esistere
- ❌ `created_by` - Potrebbe non esistere

**Nota**: Le colonne potrebbero esistere ma RLS troppo restrittivo impedisce la lettura.

#### 5. **workout_logs**

- ❌ `athlete_id` - Potrebbe non esistere
- ❌ `atleta_id` - Potrebbe non esistere
- ❌ `workout_plan_id` - Potrebbe non esistere
- ✅ `scheda_id` - Potrebbe esistere (alternativa)

**Nota**: Le colonne potrebbero esistere ma RLS troppo restrittivo impedisce la lettura.

---

## ✅ Soluzioni

### Opzione 1: Verificare Colonne Reali (CONSIGLIATO)

1. **Esegui `VERIFY_TABLE_COLUMNS.sql`** nel dashboard Supabase
   - Mostra tutte le colonne esistenti
   - Identifica quali mancano realmente

2. **Aggiungi colonne mancanti** con `FIX_MISSING_COLUMNS.sql`
   - Aggiunge solo le colonne che realmente mancano
   - Non modifica colonne esistenti

3. **Applica `FIX_RLS_POLICIES_COMPLETE.sql`**
   - Ora dovrebbe funzionare correttamente

### Opzione 2: Aggiornare Script RLS

Lo script `FIX_RLS_POLICIES_COMPLETE.sql` è già robusto e:

- ✅ Verifica esistenza colonne prima di usarle
- ✅ Usa colonne alternative se disponibili
- ✅ Crea policies generiche se necessario

**Ma** potrebbe essere migliorato per:

- Usare `created_by_staff_id` invece di `trainer_id` in `payments`
- Usare `scheda_id` invece di `workout_plan_id` in `workout_logs`

---

## 📋 Checklist

- [ ] 1. Esegui `VERIFY_TABLE_COLUMNS.sql` per vedere colonne reali
- [ ] 2. Esegui `FIX_MISSING_COLUMNS.sql` per aggiungere colonne mancanti
- [ ] 3. Verifica che le colonne siano state aggiunte
- [ ] 4. Applica `FIX_RLS_POLICIES_COMPLETE.sql`
- [ ] 5. Verifica con `npm run db:verify-data-deep`

---

## 🔧 Script Disponibili

1. **`VERIFY_TABLE_COLUMNS.sql`** - Mostra colonne esistenti
2. **`FIX_MISSING_COLUMNS.sql`** - Aggiunge colonne mancanti
3. **`FIX_RLS_POLICIES_COMPLETE.sql`** - Crea policies RLS corrette

---

## 💡 Note

- Le tabelle **esistono tutte** (verificato)
- Il problema è che alcune **colonne mancano** o hanno **nomi diversi**
- Lo script RLS è già robusto ma potrebbe essere migliorato
- La soluzione migliore è verificare le colonne reali e aggiungere quelle mancanti
