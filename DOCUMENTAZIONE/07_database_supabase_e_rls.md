# 🗄️ 07 - Database: Supabase e RLS

> **Analisi schema database e Row Level Security**

---

## 📊 SCHEMA TABELLE

### Tabelle Principali

```
┌─────────────────────────────────────────────────────────────────┐
│ profiles                                                        │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)          │ UUID                                         │
│ user_id          │ UUID → auth.users.id                         │
│ org_id           │ UUID                                         │
│ nome, cognome    │ VARCHAR                                      │
│ email            │ VARCHAR (unique)                             │
│ role             │ VARCHAR (pt, atleta, admin, etc.)           │
│ stato            │ VARCHAR (attivo, inattivo, sospeso)         │
│ ...anagrafica    │ Vari campi                                   │
│ created_at       │ TIMESTAMP                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ appointments                                                    │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)          │ UUID                                         │
│ org_id           │ UUID                                         │
│ athlete_id       │ UUID → profiles.id                           │
│ trainer_id       │ UUID → profiles.id (legacy)                  │
│ staff_id         │ UUID → profiles.id (nuovo)                   │
│ starts_at        │ TIMESTAMP                                    │
│ ends_at          │ TIMESTAMP                                    │
│ status           │ VARCHAR (attivo, completato, annullato)     │
│ type             │ VARCHAR (allenamento, consulenza, etc.)     │
│ cancelled_at     │ TIMESTAMP (soft delete)                      │
│ created_at       │ TIMESTAMP                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ documents                                                       │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)          │ UUID                                         │
│ org_id           │ UUID                                         │
│ athlete_id       │ UUID → profiles.id                           │
│ file_url         │ VARCHAR                                      │
│ file_name        │ VARCHAR                                      │
│ status           │ VARCHAR (valido, scaduto, in-revisione)     │
│ expires_at       │ TIMESTAMP                                    │
│ created_at       │ TIMESTAMP                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ workout_logs                                                    │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)          │ UUID                                         │
│ atleta_id        │ UUID → profiles.id (legacy)                  │
│ athlete_id       │ UUID → profiles.id (nuovo)                   │
│ workout_plan_id  │ UUID                                         │
│ data             │ DATE                                         │
│ stato            │ VARCHAR (completato, in_corso)              │
│ durata_minuti    │ INTEGER                                      │
│ created_at       │ TIMESTAMP                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Altre Tabelle

| Tabella                    | Descrizione          |
| -------------------------- | -------------------- |
| `exercises`                | Catalogo esercizi    |
| `workout_plans`            | Schede allenamento   |
| `payments`                 | Pagamenti atleti     |
| `lesson_counters`          | Contatori lezioni    |
| `communications`           | Sistema notifiche    |
| `communication_recipients` | Destinatari          |
| `notifications`            | Notifiche push       |
| `user_push_tokens`         | Token push           |
| `chat_messages`            | Messaggi chat        |
| `inviti_atleti`            | Inviti registrazione |
| `cliente_tags`             | Tag clienti          |

---

## 🔒 RLS POLICIES

### Pattern Generali

```sql
-- Utenti vedono solo propri dati
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Trainer vedono atleti assegnati
CREATE POLICY "Trainers can view assigned athletes" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pt_atleti
      WHERE pt_id = auth.uid() AND atleta_id = profiles.user_id
    )
    OR role IN ('atleta', 'athlete')
  );

-- Admin vedono tutto
CREATE POLICY "Admins can view all" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Tabella appointments

```sql
-- Atleti vedono propri appuntamenti
CREATE POLICY "Athletes view own appointments" ON appointments
  FOR SELECT USING (
    athlete_id = (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Staff vede appuntamenti assegnati
CREATE POLICY "Staff view assigned appointments" ON appointments
  FOR SELECT USING (
    staff_id = (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR trainer_id = (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

---

## 📝 RPC FUNCTIONS

### get_clienti_stats

```sql
CREATE OR REPLACE FUNCTION get_clienti_stats()
RETURNS TABLE (
  totali BIGINT,
  attivi BIGINT,
  inattivi BIGINT,
  nuovi_mese BIGINT,
  documenti_scadenza BIGINT
) AS $$
BEGIN
  -- Statistiche aggregate clienti
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### check_appointment_overlap

```sql
CREATE OR REPLACE FUNCTION check_appointment_overlap(
  p_staff_id UUID,
  p_starts_at TIMESTAMP,
  p_ends_at TIMESTAMP,
  p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS TABLE (has_overlap BOOLEAN) AS $$
BEGIN
  -- Verifica sovrapposizione appuntamenti
END;
$$ LANGUAGE plpgsql;
```

### get_analytics_distribution_data

```sql
-- Distribuzione per tipo appuntamento
```

### get_analytics_performance_data

```sql
-- Performance atleti
```

---

## 👁️ VIEWS

### workout_completion_rate_view

```sql
CREATE VIEW workout_completion_rate_view AS
SELECT
  athlete_id,
  nome_atleta,
  schede_assegnate,
  schede_completate,
  schede_attive,
  percentuale_completamento
FROM ...
```

---

## ⚠️ PROBLEMI RILEVATI

### Campi Duplicati

```
profiles:
├── nome/cognome vs first_name/last_name
├── phone vs telefono
└── avatar vs avatar_url

workout_logs:
├── atleta_id vs athlete_id
```

### ID Confusion

```
appointments:
├── trainer_id (legacy)
├── staff_id (nuovo)
└── Trigger sincronizza ma confusione persiste
```

### RPC Fallback

```
Analytics usa mock data se RPC non disponibili:
├── get_analytics_distribution_data
└── get_analytics_performance_data
```

---

## 📊 VALUTAZIONE

| Aspetto             | Rating    | Note                       |
| ------------------- | --------- | -------------------------- |
| Chiarezza logica    | ★★★☆☆     | Campi duplicati confondono |
| Robustezza          | ★★★★☆     | RLS policies presenti      |
| Debito tecnico      | **ALTO**  | Naming inconsistente       |
| Rischio regressioni | **MEDIO** | RLS sensibili              |

---

## 🔗 FILE CORRELATI

- `src/types/supabase.ts` - Tipi TypeScript
- `src/lib/supabase/types.ts` - Tipi generati
- `supabase/migrations/` - Migrazioni
