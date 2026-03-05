# 📋 Database Schema Workouts - Documentazione Tecnica

**File**: `supabase/migrations/20251011_create_workouts_schema.sql`, `supabase/migrations/20250110_006_workouts.sql`, etc.  
**Classificazione**: Database Schema, SQL Migration  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T17:25:00Z

---

## 📋 Panoramica

Schema database completo per gestione schede allenamento multi-giorno. Include 4 tabelle principali: `workouts`/`workout_plans` (schede), `workout_days` (giorni), `workout_day_exercises` (esercizi per giorno), `workout_sets` (set completati). Supporta tracking completo allenamenti con statistiche e progresso.

---

## 🗄️ Struttura Tabelle

### Tabella 1: `workouts` / `workout_plans` ⚠️ DUPLICATA

**⚠️ PROBLEMA**: Esistono due tabelle per lo stesso scopo (vedi P1-008)

#### Tabella `workouts`

**File Migration**: `supabase/migrations/20251011_create_workouts_schema.sql`

```sql
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'intermediate'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  status TEXT DEFAULT 'attivo'
    CHECK (status IN ('attivo', 'completato', 'archiviato')),
  created_by_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colonne**:

- `id`: UUID primary key
- `athlete_id`: FK a `profiles.id` (atleta assegnato)
- `name`: Nome scheda (max 200 caratteri)
- `description`: Descrizione/note scheda
- `difficulty`: Difficoltà (beginner/intermediate/advanced)
- `status`: Stato scheda (attivo/completato/archiviato)
- `created_by_staff_id`: FK a `profiles.id` (PT che ha creato)
- `created_at`: Timestamp creazione
- `updated_at`: Timestamp ultimo aggiornamento (auto)

**Indici**:

- `idx_workouts_athlete`: Su `athlete_id`
- `idx_workouts_status`: Su `status`
- `idx_workouts_athlete_status`: Composito su `(athlete_id, status)`

#### Tabella `workout_plans`

**File Migration**: `supabase/migrations/20251009_create_workout_plans.sql`, `supabase/migrations/20250110_010_workout_plans.sql`

```sql
CREATE TABLE workout_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Differenze con `workouts`**:

- `start_date` / `end_date`: Date inizio/fine scheda
- `is_active`: Boolean invece di `status` text
- `created_by`: FK a `profiles.user_id` invece di `profiles.id`
- Manca `difficulty` e `status` text

**⚠️ PROBLEMA**: Due tabelle con scopo simile ma struttura diversa (vedi P1-008)

---

### Tabella 2: `workout_days`

**File Migration**: `supabase/migrations/20251011_create_workouts_schema.sql`, `supabase/migrations/20250110_007_workout_days.sql`

```sql
CREATE TABLE workout_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title VARCHAR(200),
  day_name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workout_id, day_number)
);
```

**Colonne**:

- `id`: UUID primary key
- `workout_id`: FK a `workouts.id` (scheda padre)
- `day_number`: Numero giorno (1, 2, 3, ...)
- `title`: Titolo giorno (es: "Giorno 1 - Spinta")
- `day_name`: Nome alternativo giorno
- `description`: Descrizione giorno
- `created_at`: Timestamp creazione
- `updated_at`: Timestamp ultimo aggiornamento (auto)

**Constraint**:

- `UNIQUE(workout_id, day_number)`: Un solo giorno N per scheda

**Indici**:

- `idx_workout_days_workout`: Su `workout_id`
- `idx_workout_days_day_number`: Su `day_number`

---

### Tabella 3: `workout_day_exercises`

**File Migration**: `supabase/migrations/20251011_create_workouts_schema.sql`, `supabase/migrations/20250110_008_workout_day_exercises.sql`

```sql
CREATE TABLE workout_day_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_day_id UUID NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  target_sets INTEGER DEFAULT 3,
  target_reps INTEGER DEFAULT 10,
  target_weight NUMERIC(5, 2),
  rest_timer_sec INTEGER DEFAULT 90,
  order_index INTEGER DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colonne**:

- `id`: UUID primary key
- `workout_day_id`: FK a `workout_days.id` (giorno padre)
- `exercise_id`: FK a `exercises.id` (esercizio dal catalogo)
- `target_sets`: Numero serie target (default: 3)
- `target_reps`: Numero ripetizioni target (default: 10)
- `target_weight`: Peso target in kg (NUMERIC 5,2)
- `rest_timer_sec`: Secondi recupero tra serie (default: 90)
- `order_index`: Ordine esercizio nel giorno (default: 0)
- `note`: Note specifiche esercizio
- `created_at`: Timestamp creazione
- `updated_at`: Timestamp ultimo aggiornamento (auto)

**Constraint**:

- `ON DELETE RESTRICT` su `exercise_id`: Non si può eliminare esercizio se usato in schede

**Indici**:

- `idx_workout_day_exercises_day`: Su `workout_day_id`
- `idx_workout_day_exercises_exercise`: Su `exercise_id`
- `idx_workout_day_exercises_order`: Composito su `(workout_day_id, order_index)`

---

### Tabella 4: `workout_sets`

**File Migration**: `supabase/migrations/20251011_create_workouts_schema.sql`, `supabase/migrations/20250110_009_workout_sets.sql`

```sql
CREATE TABLE workout_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_day_exercise_id UUID NOT NULL REFERENCES workout_day_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg NUMERIC(5, 2),
  completed_at TIMESTAMP WITH TIME ZONE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colonne**:

- `id`: UUID primary key
- `workout_day_exercise_id`: FK a `workout_day_exercises.id` (esercizio padre)
- `set_number`: Numero set (1, 2, 3, ...)
- `reps`: Ripetizioni eseguite (può differire da target)
- `weight_kg`: Peso usato in kg (NUMERIC 5,2)
- `completed_at`: Timestamp completamento set (NULL = non completato)
- `note`: Note specifiche set
- `created_at`: Timestamp creazione

**Indici**:

- `idx_workout_sets_exercise`: Su `workout_day_exercise_id`
- `idx_workout_sets_completed`: Su `completed_at`

**Nota**: Non ha `updated_at` (set non vengono modificati, solo creati/completati)

---

### Tabella 5: `workout_logs` (Opzionale)

**File Migration**: `supabase/migrations/20251009_create_workout_logs.sql`, `supabase/migrations/20250110_011_workout_logs.sql`

```sql
CREATE TABLE workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atleta_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheda_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  durata_minuti INTEGER DEFAULT 0,
  stato TEXT DEFAULT 'programmato'
    CHECK (stato IN ('completato', 'in_corso', 'programmato', 'saltato')),
  esercizi_completati INTEGER DEFAULT 0,
  esercizi_totali INTEGER DEFAULT 0,
  volume_totale NUMERIC(10, 2) DEFAULT 0,
  completato BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colonne**:

- `id`: UUID primary key
- `atleta_id`: FK a `profiles.id` (atleta)
- `scheda_id`: FK a `workout_plans.id` (scheda eseguita)
- `data`: Data/ora allenamento
- `durata_minuti`: Durata allenamento in minuti
- `stato`: Stato allenamento (completato/in_corso/programmato/saltato)
- `esercizi_completati`: Numero esercizi completati
- `esercizi_totali`: Numero esercizi totali
- `volume_totale`: Volume totale in kg (peso × ripetizioni)
- `completato`: Boolean completamento
- `note`: Note allenamento
- `created_at`: Timestamp creazione
- `updated_at`: Timestamp ultimo aggiornamento (auto)

**Nota**: ⚠️ Usa `workout_plans` invece di `workouts` (vedi P1-008)

---

## 🔗 Relazioni tra Tabelle

```
workouts / workout_plans (1)
  └── workout_days (N)
        └── workout_day_exercises (N)
              └── workout_sets (N)
                    └── exercises (1) [FK]
```

**Relazioni**:

- `workouts` → `workout_days`: 1-to-many (una scheda ha molti giorni)
- `workout_days` → `workout_day_exercises`: 1-to-many (un giorno ha molti esercizi)
- `workout_day_exercises` → `workout_sets`: 1-to-many (un esercizio ha molti set)
- `workout_day_exercises` → `exercises`: many-to-1 (molti esercizi-scheda → un esercizio catalogo)
- `workouts` → `profiles` (athlete): many-to-1 (molte schede → un atleta)
- `workouts` → `profiles` (staff): many-to-1 (molte schede → un PT)

---

## 🔒 Row Level Security (RLS)

### Policies `workouts`

```sql
CREATE POLICY "Users can view workouts" ON workouts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can create workouts" ON workouts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update workouts" ON workouts
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Staff can delete workouts" ON workouts
  FOR DELETE TO authenticated
  USING (true);
```

**Comportamento**:

- **SELECT**: Tutti gli utenti autenticati possono vedere
- **INSERT/UPDATE/DELETE**: Tutti gli utenti autenticati possono modificare

**⚠️ PROBLEMA**: Policies troppo permissive (vedi P1-001)

### Policies `workout_days`, `workout_day_exercises`, `workout_sets`

Simili a `workouts`: tutti gli utenti autenticati possono vedere/modificare.

---

## 🔧 Trigger

### Trigger `update_updated_at_column`

```sql
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Comportamento**:

- Aggiorna automaticamente `updated_at` prima di ogni UPDATE
- Applicato a: `workouts`, `workout_days`, `workout_day_exercises`

**Nota**: ⚠️ Richiede funzione `update_updated_at_column()` (vedi P1-002)

---

## ⚠️ Errori Possibili

### Errori Schema

- **Duplicazione Tabelle**: `workouts` e `workout_plans` coesistono
  - Sintomo: Confusione, possibili bug, duplicazione dati
  - Fix: Unificare in una sola tabella (vedi P1-008)

- **Foreign Key Mismatch**: `workout_plans.created_by` → `profiles.user_id` invece di `profiles.id`
  - Sintomo: Foreign key constraint violation
  - Fix: Allineare foreign keys

### Errori RLS

- **Policies Troppo Permissive**: Tutti possono modificare tutto
  - Sintomo: Possibili modifiche non autorizzate
  - Fix: Restringere policies per ruolo (vedi P1-001)

### Errori Trigger

- **Trigger Mancante**: `update_updated_at_column` non esiste
  - Sintomo: `updated_at` non aggiornato automaticamente
  - Fix: Creare trigger (vedi P1-002)

---

## 🔗 Dipendenze Critiche

### Dipendenze Database

1. **Tabella `profiles`**: Per foreign keys atleta/staff
2. **Tabella `exercises`**: Per foreign key esercizi catalogo
3. **Funzione `update_updated_at_column()`**: Per trigger auto-update

### Dipendenze Interne

- **RLS Policies**: Configurate per permettere accesso
- **Indici**: Richiesti per performance query

---

## 📝 Esempi Query

### Query 1: Scheda Completa con Relazioni

```sql
SELECT
  w.*,
  json_agg(
    json_build_object(
      'id', wd.id,
      'day_number', wd.day_number,
      'title', wd.title,
      'exercises', (
        SELECT json_agg(
          json_build_object(
            'id', wde.id,
            'exercise', e.name,
            'target_sets', wde.target_sets,
            'target_reps', wde.target_reps,
            'target_weight', wde.target_weight,
            'sets', (
              SELECT json_agg(
                json_build_object(
                  'set_number', ws.set_number,
                  'reps', ws.reps,
                  'weight_kg', ws.weight_kg,
                  'completed_at', ws.completed_at
                )
              )
              FROM workout_sets ws
              WHERE ws.workout_day_exercise_id = wde.id
            )
          )
        )
        FROM workout_day_exercises wde
        JOIN exercises e ON e.id = wde.exercise_id
        WHERE wde.workout_day_id = wd.id
        ORDER BY wde.order_index
      )
    )
  ) as days
FROM workouts w
LEFT JOIN workout_days wd ON wd.workout_id = w.id
WHERE w.id = 'workout-uuid'
GROUP BY w.id;
```

### Query 2: Statistiche Atleta

```sql
SELECT
  COUNT(DISTINCT w.id) as total_workouts,
  COUNT(DISTINCT CASE WHEN w.status = 'completato' THEN w.id END) as completed_workouts,
  COUNT(DISTINCT ws.id) as total_sets,
  COUNT(DISTINCT CASE WHEN ws.completed_at IS NOT NULL THEN ws.id END) as completed_sets,
  ROUND(
    COUNT(DISTINCT CASE WHEN ws.completed_at IS NOT NULL THEN ws.id END)::numeric /
    NULLIF(COUNT(DISTINCT ws.id), 0) * 100,
    2
  ) as completion_rate
FROM workouts w
LEFT JOIN workout_days wd ON wd.workout_id = w.id
LEFT JOIN workout_day_exercises wde ON wde.workout_day_id = wd.id
LEFT JOIN workout_sets ws ON ws.workout_day_exercise_id = wde.id
WHERE w.athlete_id = 'athlete-uuid';
```

### Query 3: Volume Totale (Miglioramento Futuro)

```sql
SELECT
  SUM(ws.weight_kg * ws.reps) as total_volume_kg
FROM workout_sets ws
JOIN workout_day_exercises wde ON wde.id = ws.workout_day_exercise_id
JOIN workout_days wd ON wd.id = wde.workout_day_id
JOIN workouts w ON w.id = wd.workout_id
WHERE w.athlete_id = 'athlete-uuid'
  AND ws.completed_at IS NOT NULL;
```

**Nota**: ⚠️ Questa query non è ancora implementata in `useWorkouts.fetchStats` (vedi P4-010)

---

## 🔍 Note Tecniche

### Performance

- **Indici Compositi**: Indici su coppie `(workout_id, day_number)`, `(workout_day_id, order_index)` per query ottimizzate
- **Cascade Delete**: DELETE su scheda elimina automaticamente giorni, esercizi, set
- **Restrict Delete**: Non si può eliminare esercizio se usato in schede

### Limitazioni

- **Duplicazione Tabelle**: `workouts` vs `workout_plans` crea confusione
- **Naming Inconsistency**: `workout_plans.created_by` → `user_id` invece di `id`
- **RLS Permissive**: Policies troppo aperte (tutti possono tutto)

### Miglioramenti Futuri

- Unificare `workouts` e `workout_plans` in una sola tabella (vedi P1-008)
- Restringere RLS policies per ruolo (vedi P1-001)
- Aggiungere indici per query statistiche
- Aggiungere constraint per validazione target (pesi > 0, serie > 0)

---

## 📚 Changelog

### 2025-01-29T17:25:00Z - Documentazione Iniziale

- ✅ Documentazione completa schema database workouts
- ✅ Descrizione 4 tabelle principali
- ✅ Relazioni e foreign keys
- ✅ RLS policies e trigger
- ✅ Esempi query SQL
- ⚠️ Identificato problema P1-008 (duplicazione tabelle)
- ⚠️ Identificato problema P1-001 (RLS troppo permissive)
- ⚠️ Identificato problema P1-002 (trigger mancante)

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare sistema Profili completi
