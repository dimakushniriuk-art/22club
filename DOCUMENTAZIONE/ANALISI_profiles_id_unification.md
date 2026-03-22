# Analisi: profiles.id come unica chiave (FASE A)

## 1) Riferimenti a profiles.user_id e colonne \*\_user_id

### 1.1 RLS / Migrations (Supabase)

- **profiles.user_id = auth.uid()** usato in quasi tutte le policy per identificare "utente corrente" (get_profile_id_from_user_id(auth.uid()) risolve a profiles.id).
- **workout_plans.created_by** confrontato con auth.uid() in RLS (20260245) → relazione "creatore" = auth user.
- **workout_logs**: in alcune migration storiche esiste user_id (auth.users); in types attuali non presente (solo atleta_id/athlete_id).
- **communications.created_by**, **communication_recipients.user_id** → auth/users.
- **exercises.created_by** → auth.users.
- **credit_ledger.created_by** → nullable, possibile audit.

### 1.2 Tabelle (da migrations + types) con colonne "relazione" su user_id/auth

| Tabella                  | Colonna attuale     | FK / uso                              | Nuova colonna proposta  | Usata da (file/percorso)                         | Rischio             |
| ------------------------ | ------------------- | ------------------------------------- | ----------------------- | ------------------------------------------------ | ------------------- |
| profiles                 | user_id             | auth.users(id) – **si mantiene**      | -                       | Auth, RLS, login                                 | Nessuno             |
| workout_plans            | created_by          | profiles(user_id) o auth.uid() in RLS | created_by_profile_id   | RLS 20260245, API schede, use-workout-plans-list | Medio: policy e API |
| exercises                | created_by          | auth.users(id)                        | created_by_profile_id   | RLS, API esercizi                                | Basso               |
| communications           | created_by          | auth.users(id)                        | created_by_profile_id   | RLS 20250130, API comunicazioni                  | Medio               |
| communication_recipients | user_id             | auth/users (destinatario)             | recipient_profile_id    | Comunicazioni, notifiche                         | Medio               |
| credit_ledger            | created_by          | nullable                              | created_by_profile_id   | RPC/analytics                                    | Basso               |
| audit_logs               | user_id             | auth.users (audit tecnico)            | (non convertire Step 1) | Logging                                          | Segnalato: audit    |
| notifications            | user_id             | auth.users                            | (opzionale Step 2)      | Push/notifiche                                   | Basso               |
| user_settings            | user_id             | auth.users                            | (non convertire)        | Impostazioni utente                              | Session-scoped      |
| push_subscriptions       | user_id             | auth.users                            | (non convertire)        | Push                                             | Device-scoped       |
| inviti_atleti            | pt_id               | già profiles(id) da 20260211          | -                       | API inviti, RLS                                  | Già allineato       |
| inviti_cliente           | staff_id, atleta_id | profiles(id)                          | -                       | RLS                                              | Già allineato       |

### 1.3 Join / query che usano profiles.user_id per relazioni applicative

- **Auth provider**: `from('profiles').eq('user_id', session.user.id)` – corretto (legame auth → profilo).
- **API routes**: varie `.eq('user_id', session.user.id)` per ottenere profilo corrente – da sostituire con utility che restituisce profileId.
- **RLS**: `(SELECT id FROM profiles WHERE user_id = auth.uid())` o `get_profile_id_from_user_id(auth.uid())` – restano validi; Step 1 non tocca.

### 1.4 Payload API che passano user_id invece di profile_id

- **complete_athlete_registration**: athlete_user_id (RPC).
- **create_notification**: p_user_id.
- **get_or_create_user_settings**: p_user_id.
- **use-progress-analytics**, **progressi/nuovo**: commenti su athlete_id come user_id → da verificare se progress_logs.athlete_id è già profiles.id.

---

## 2) File da toccare (lista completa)

### Migration

- `supabase/migrations/YYYYMMDDHHMMSS_profiles_id_unification_step1.sql` (nuovo).

### Server utility

- `src/lib/supabase/get-current-profile.ts` (nuovo).

### API routes (lettura/scrittura duale o switch a profile_id)

- `src/app/api/...` (tutte le route che scrivono created_by / user_id su workout_plans, exercises, communications, communication_recipients, credit_ledger).
- Da cercare: route che inseriscono/aggiornano workout_plans, exercises, communications, communication_recipients.

### Hooks / pagine

- `src/hooks/workouts/use-workout-plans-list.ts` (created_by).
- Altre pagine che leggono "creatore" da API (preferire created_by_profile_id con fallback).

### Types

- `src/lib/supabase/types.ts`: aggiungere le nuove colonne (created_by_profile_id, recipient_profile_id) quando presenti nel DB (dopo migration).

### RLS (Step 1 compatibilità)

- Policy su workout_plans, exercises, communications (aggiungere condizione OR su nuova colonna profile_id dove serve).

---

## 3) Decisioni per Step 1

- **In scope**: workout_plans, exercises, communications, communication_recipients, credit_ledger.
- **Fuori scope Step 1**: audit_logs (audit tecnico), user_settings, push_subscriptions, notifications (session/device).
- **workout_logs**: non aggiungere colonna in Step 1 (atleta_id/athlete_id già riferiti a profiles; user_id eventuale lasciato per Step 2).
- **inviti_atleti / inviti_cliente**: già su profiles.id.
