# 🗄️ Database Schema Completo - 22Club

**Ultimo Aggiornamento**: 2025-02-02  
**Versione**: 1.0.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Tabelle Principali](#tabelle-principali)
3. [Relazioni](#relazioni)
4. [Indici](#indici)
5. [RLS Policies](#rls-policies)
6. [Funzioni RPC](#funzioni-rpc)
7. [Trigger](#trigger)
8. [Storage Buckets](#storage-buckets)

---

## Panoramica

Database PostgreSQL su Supabase con:

- **25+ tabelle** principali
- **Row Level Security (RLS)** attivo su tutte le tabelle
- **Foreign Keys** per integrità referenziale
- **Trigger** per sincronizzazione automatica
- **RPC Functions** per query complesse

### Stack Database

- **Database**: PostgreSQL 15+
- **Hosting**: Supabase
- **ORM**: Supabase Client (no ORM esterno)
- **Migrations**: Supabase CLI

---

## Tabelle Principali

### `profiles`

**Descrizione**: Profili utenti (atleti, trainer, admin)

**Colonne**:

- `id`: UUID (PK)
- `user_id`: UUID (FK → auth.users, UNIQUE)
- `org_id`: TEXT
- `nome`, `cognome`: VARCHAR(100)
- `email`: TEXT
- `phone`: TEXT
- `role`: VARCHAR(20) (admin, pt, trainer, atleta, athlete)
- `stato`: TEXT (attivo, inattivo, sospeso)
- `avatar`, `avatar_url`: TEXT
- `data_iscrizione`: TIMESTAMP
- `documenti_scadenza`: BOOLEAN
- `note`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `user_id` (UNIQUE)
- `role`
- `stato`

### `roles`

**Descrizione**: Ruoli sistema con permessi

**Colonne**:

- `id`: UUID (PK)
- `name`: VARCHAR(20) (UNIQUE)
- `description`: TEXT
- `permissions`: JSONB
- `created_at`, `updated_at`: TIMESTAMP

### `appointments`

**Descrizione**: Appuntamenti (allenamenti, consulenze)

**Colonne**:

- `id`: UUID (PK)
- `org_id`: TEXT
- `athlete_id`: UUID (FK → profiles)
- `trainer_id`: UUID (FK → profiles)
- `starts_at`, `ends_at`: TIMESTAMP
- `status`: TEXT (attivo, completato, annullato, in_corso)
- `type`: TEXT (allenamento, cardio, check, consulenza)
- `location`: TEXT
- `notes`: TEXT
- `recurrence_rule`: TEXT
- `cancelled_at`: TIMESTAMP
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `athlete_id`
- `trainer_id`
- `starts_at`

### `workout_plans`

**Descrizione**: Schede allenamento assegnate

**Colonne**:

- `id`: UUID (PK)
- `org_id`: TEXT
- `athlete_id`: UUID (FK → profiles)
- `trainer_id`: UUID (FK → profiles)
- `name`: TEXT
- `description`: TEXT
- `valid_from`, `valid_to`: TIMESTAMP
- `status`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

### `workout_logs`

**Descrizione**: Log allenamenti completati

**Colonne**:

- `id`: UUID (PK)
- `workout_plan_id`: UUID (FK → workout_plans)
- `athlete_id`: UUID (FK → profiles)
- `completed_at`: TIMESTAMP
- `duration_minutes`: INTEGER
- `notes`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

### `documents`

**Descrizione**: Documenti atleti (certificati, etc.)

**Colonne**:

- `id`: UUID (PK)
- `org_id`: TEXT
- `athlete_id`: UUID (FK → profiles)
- `file_url`: TEXT
- `file_name`: TEXT
- `file_type`: TEXT
- `file_size`: INTEGER
- `status`: TEXT (valido, scaduto, in-revisione, in_scadenza, non_valido)
- `expires_at`: TIMESTAMP
- `notes`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `athlete_id`
- `status`
- `expires_at`

### `payments`

**Descrizione**: Pagamenti e lezioni

**Colonne**:

- `id`: UUID (PK)
- `org_id`: TEXT
- `athlete_id`: UUID (FK → profiles)
- `trainer_id`: UUID (FK → profiles)
- `amount`: DECIMAL
- `method_text`: TEXT
- `is_reversal`: BOOLEAN
- `notes`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `athlete_id`
- `trainer_id`
- `created_at`

### `lesson_counters`

**Descrizione**: Contatori lezioni per atleta

**Colonne**:

- `id`: UUID (PK)
- `athlete_id`: UUID (FK → profiles, UNIQUE)
- `total_lessons`: INTEGER
- `used_lessons`: INTEGER
- `remaining_lessons`: INTEGER
- `last_updated`: TIMESTAMP
- `created_at`, `updated_at`: TIMESTAMP

### `notifications`

**Descrizione**: Notifiche in-app

**Colonne**:

- `id`: UUID (PK)
- `user_id`: UUID (FK → profiles)
- `title`: TEXT
- `body`: TEXT
- `type`: TEXT
- `link`: TEXT
- `action_text`: TEXT
- `read_at`: TIMESTAMP
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `user_id`
- `read_at`

### `chat_messages`

**Descrizione**: Messaggi chat

**Colonne**:

- `id`: UUID (PK)
- `sender_id`: UUID (FK → profiles)
- `receiver_id`: UUID (FK → profiles)
- `message`: TEXT
- `read_at`: TIMESTAMP
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `sender_id`
- `receiver_id`
- `created_at`

### `communications`

**Descrizione**: Comunicazioni bulk (email/push/sms)

**Colonne**:

- `id`: UUID (PK)
- `type`: TEXT (push, email, sms, all)
- `title`: TEXT
- `body`: TEXT
- `status`: TEXT (draft, scheduled, sending, sent, failed, cancelled)
- `recipient_filter`: JSONB
- `total_recipients`: INTEGER
- `total_sent`, `total_delivered`, `total_opened`, `total_failed`: INTEGER
- `scheduled_at`: TIMESTAMP
- `sent_at`: TIMESTAMP
- `metadata`: JSONB
- `created_at`, `updated_at`: TIMESTAMP

### `communication_recipients`

**Descrizione**: Destinatari comunicazioni

**Colonne**:

- `id`: UUID (PK)
- `communication_id`: UUID (FK → communications)
- `user_id`: UUID (FK → profiles)
- `recipient_type`: TEXT (push, email, sms)
- `status`: TEXT (pending, sent, delivered, opened, failed, bounced)
- `sent_at`, `delivered_at`, `opened_at`, `failed_at`: TIMESTAMP
- `error_message`: TEXT
- `metadata`: JSONB
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `communication_id`
- `user_id`
- `status`

### `progress_logs`

**Descrizione**: Log progressi atleti (peso, misure)

**Colonne**:

- `id`: UUID (PK)
- `athlete_id`: UUID (FK → profiles)
- `date`: DATE
- `weight_kg`: DECIMAL
- `chest_cm`, `waist_cm`, `hips_cm`, `biceps_cm`, `thighs_cm`: DECIMAL
- `max_bench_kg`, `max_squat_kg`, `max_deadlift_kg`: DECIMAL
- `notes`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `athlete_id`
- `date`

### `progress_photos`

**Descrizione**: Foto progresso atleti

**Colonne**:

- `id`: UUID (PK)
- `athlete_id`: UUID (FK → profiles)
- `photo_url`: TEXT
- `date`: DATE
- `notes`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

### `inviti_atleti`

**Descrizione**: Inviti registrazione atleti

**Colonne**:

- `id`: UUID (PK)
- `code`: TEXT (UNIQUE, 8 caratteri)
- `trainer_id`: UUID (FK → profiles)
- `athlete_email`: TEXT
- `athlete_name`: TEXT
- `expires_at`: TIMESTAMP
- `accepted_at`: TIMESTAMP
- `status`: TEXT (invitato, registrato, scaduto)
- `qr_url`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `code` (UNIQUE)
- `trainer_id`
- `status`

### `pt_atleti`

**Descrizione**: Relazione PT-Atleti

**Colonne**:

- `id`: UUID (PK)
- `pt_id`: UUID (FK → profiles)
- `athlete_id`: UUID (FK → profiles)
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `pt_id`
- `athlete_id`

### `push_subscriptions`

**Descrizione**: Subscription push notifications

**Colonne**:

- `id`: UUID (PK)
- `user_id`: UUID (FK → profiles)
- `endpoint`: TEXT (UNIQUE)
- `p256dh`: TEXT
- `auth`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

**Indici**:

- `user_id`
- `endpoint` (UNIQUE)

### `user_settings`

**Descrizione**: Impostazioni utente

**Colonne**:

- `id`: UUID (PK)
- `user_id`: UUID (FK → profiles, UNIQUE)
- `notifications`: JSONB
- `privacy`: JSONB
- `account`: JSONB
- `two_factor_enabled`: BOOLEAN
- `two_factor_secret`: TEXT
- `backup_codes`: TEXT[]
- `created_at`, `updated_at`: TIMESTAMP

---

## Relazioni

### Foreign Keys Principali

- `profiles.user_id` → `auth.users.id` (CASCADE)
- `appointments.athlete_id` → `profiles.id`
- `appointments.trainer_id` → `profiles.id`
- `workout_plans.athlete_id` → `profiles.id`
- `workout_logs.workout_plan_id` → `workout_plans.id`
- `documents.athlete_id` → `profiles.id`
- `payments.athlete_id` → `profiles.id`
- `notifications.user_id` → `profiles.id`
- `chat_messages.sender_id` → `profiles.id`
- `chat_messages.receiver_id` → `profiles.id`
- `communication_recipients.communication_id` → `communications.id`
- `communication_recipients.user_id` → `profiles.id`

---

## Indici

### Indici Principali

**profiles**:

- `user_id` (UNIQUE)
- `role`
- `stato`

**appointments**:

- `athlete_id`
- `trainer_id`
- `starts_at`

**documents**:

- `athlete_id`
- `status`
- `expires_at`

**payments**:

- `athlete_id`
- `created_at`

---

## RLS Policies

### Policy Pattern Standard

**Select Policy**:

```sql
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);
```

**Insert Policy**:

```sql
CREATE POLICY "Users can insert own data"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Update Policy**:

```sql
CREATE POLICY "Users can update own data"
ON table_name FOR UPDATE
USING (auth.uid() = user_id);
```

### Verifica RLS

```bash
# Analizza RLS policies
npm run db:analyze-rls

# Verifica con auth
npm run db:verify-rls-auth
```

---

## Funzioni RPC

### `get_clienti_stats()`

Statistiche clienti (con fallback se timeout).

### `get_progress_stats()`

Statistiche progressi atleti.

### `check_appointment_overlap()`

Verifica sovrapposizione appuntamenti.

### `update_document_statuses()`

Aggiorna stati documenti scaduti.

### `update_expired_invites()`

Aggiorna inviti scaduti.

---

## Trigger

### `update_updated_at_column()`

Aggiorna automaticamente `updated_at` su UPDATE.

### `handle_new_user()`

Crea profilo automaticamente quando nuovo utente si registra.

### `sync_lesson_counters()`

Sincronizza contatori lezioni quando pagamento creato.

---

## Storage Buckets

### `documents`

Documenti atleti (certificati, etc.)

**RLS Policies**:

- Utente può vedere solo propri documenti
- Staff può vedere tutti i documenti

### `avatars`

Avatar utenti

**RLS Policies**:

- Utente può vedere tutti gli avatar (pubblici)
- Utente può uploadare solo proprio avatar

---

## Migrazioni

### Ordine Esecuzione

Vedi `supabase/migrations/ORDINE_ESECUZIONE.md` per ordine completo.

### Applicare Migrazioni

```bash
# Push migrazioni
supabase db push

# Reset locale
supabase db reset
```

---

## Best Practices

1. **Sempre usare Foreign Keys** per integrità referenziale
2. **RLS attivo** su tutte le tabelle
3. **Indici** su colonne usate frequentemente
4. **Trigger** per sincronizzazione automatica
5. **RPC Functions** per query complesse

---

**Ultimo aggiornamento**: 2025-02-02
