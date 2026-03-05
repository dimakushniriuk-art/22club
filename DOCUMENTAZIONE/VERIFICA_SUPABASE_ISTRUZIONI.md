# 🔍 Istruzioni Verifica Supabase - 22Club

**Data**: 2025-02-02  
**Scopo**: Verifica completa schema, RLS policies, funzioni e trigger dopo i fix delle pagine `/home/*`

---

## 📋 Cosa Verificare

### 1. Schema Database

- ✅ Tabelle critiche esistenti
- ✅ Foreign keys corrette
- ✅ Colonne necessarie presenti

### 2. RLS Policies

- ✅ RLS attivo sulle tabelle critiche
- ✅ Policies esistenti e corrette
- ✅ Uso corretto di `get_profile_id()` o `auth.uid()`

### 3. Funzioni Helper

- ✅ `get_profile_id()` presente e con `SECURITY DEFINER`
- ✅ `is_admin()` se necessario

### 4. Trigger

- ✅ `on_auth_user_created` per creare profilo automaticamente
- ✅ Trigger `update_updated_at_column` se necessario

### 5. Dati

- ✅ Profili presenti
- ✅ Relazioni trainer-atleta (`pt_atleti`)
- ✅ Dati di esempio nelle tabelle critiche

---

## 🚀 Come Eseguire la Verifica

### Step 1: Apri SQL Editor

1. Vai su: https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new
2. Sostituisci `[PROJECT_ID]` con il tuo project ID

### Step 2: Esegui Script di Verifica

1. Apri il file: `docs/SQL_VERIFICA_COMPLETA_SUPABASE.sql`
2. Copia **tutto** il contenuto
3. Incolla nel SQL Editor di Supabase
4. Clicca **"Run"** o premi **Ctrl+Enter**

### Step 3: Analizza i Risultati

Lo script produce 9 sezioni di risultati:

#### Sezione 1: Verifica Tabelle Critiche

- ✅ Verifica che tutte le tabelle critiche esistano
- ✅ Controlla il numero di colonne

#### Sezione 2: Verifica Foreign Keys

- ✅ Verifica che le FK siano corrette:
  - `appointments.athlete_id` → `profiles.id` ✅
  - `workout_logs.athlete_id` → `profiles.id` ✅
  - `chat_messages.sender_id/receiver_id` → `profiles.id` ✅
  - `workout_plans.created_by` → `profiles.user_id` ✅
  - `documents.athlete_id` → `profiles.user_id` ✅
  - `progress_logs.athlete_id` → `profiles.user_id` ✅

#### Sezione 3: Verifica RLS Attivo

- ✅ Tutte le tabelle critiche devono avere RLS **ATTIVO**
- ❌ Se vedi "DISABILITATO", devi abilitarlo

#### Sezione 4: Verifica RLS Policies

- ✅ Ogni tabella deve avere almeno 2-3 policies (SELECT, INSERT, UPDATE)
- ✅ Le policies devono usare `get_profile_id()` per tabelle con FK a `profiles.id`
- ✅ Le policies devono usare `auth.uid()` per tabelle con FK a `profiles.user_id`

#### Sezione 5: Verifica Funzioni Helper

- ✅ `get_profile_id()` deve esistere
- ✅ Deve avere `SECURITY DEFINER`
- ✅ Deve restituire `profiles.id` da `auth.uid()`

#### Sezione 6: Verifica Trigger

- ✅ `on_auth_user_created` deve esistere
- ✅ Deve creare automaticamente il profilo quando un utente si registra

#### Sezione 7: Verifica Dati

- ✅ Controlla che ci siano profili, appuntamenti, messaggi, ecc.
- ✅ Verifica relazioni trainer-atleta in `pt_atleti`

#### Sezione 8: Verifica Problemi Comuni

- ✅ Nessun utente auth senza profilo
- ✅ Nessun profilo senza user_id valido
- ✅ Nessun appuntamento/messaggio con ID non validi

#### Sezione 9: Riepilogo Finale

- ✅ Conta tabelle, policies, funzioni, trigger
- ✅ Fornisce un riepilogo generale

---

## 🔧 Cosa Fare se Troviamo Problemi

### Problema: Tabelle Mancanti

**Soluzione**: Esegui le migrazioni mancanti o crea le tabelle manualmente.

### Problema: Foreign Keys Errate

**Soluzione**: Esegui `docs/SQL_VERIFY_AND_FIX_HOME_PAGES_SCHEMA.sql` per correggere le FK.

### Problema: RLS Disabilitato

**Soluzione**:

```sql
ALTER TABLE [tabella] ENABLE ROW LEVEL SECURITY;
```

### Problema: Policies Mancanti o Errate

**Soluzione**: Esegui `docs/SQL_FIX_HOME_PAGES_RLS_POLICIES.sql` per correggere le policies.

### Problema: Funzione `get_profile_id()` Mancante

**Soluzione**: Esegui `docs/SQL_VERIFY_AND_FIX_HOME_PAGES_SCHEMA.sql` che la crea automaticamente.

### Problema: Trigger Mancante

**Soluzione**: Esegui `docs/QUICK_APPLY_TRIGGER.sql` per creare il trigger `on_auth_user_created`.

### Problema: Dati Orfani

**Soluzione**: Esegui query di pulizia per rimuovere record orfani o correggere le relazioni.

---

## ✅ Checklist Post-Verifica

Dopo aver eseguito lo script, verifica che:

- [ ] Tutte le tabelle critiche esistono
- [ ] Tutte le foreign keys sono corrette
- [ ] RLS è attivo su tutte le tabelle critiche
- [ ] Ogni tabella ha almeno 2-3 policies RLS
- [ ] `get_profile_id()` esiste e ha `SECURITY DEFINER`
- [ ] `on_auth_user_created` trigger esiste
- [ ] Non ci sono utenti auth senza profilo
- [ ] Non ci sono dati orfani

---

## 📊 Risultati Attesi

### Stato Ideale

```
✅ Tabelle critiche: 8/8 esistenti
✅ Foreign keys: Tutte corrette
✅ RLS attivo: 8/8 tabelle
✅ Policies RLS: 20+ policies totali
✅ Funzioni helper: get_profile_id() presente
✅ Trigger: on_auth_user_created presente
✅ Dati: Nessun record orfano
```

### Se Vedi Problemi

Se lo script mostra problemi (❌ o ⚠️), esegui gli script di fix corrispondenti:

1. **Schema/FK**: `docs/SQL_VERIFY_AND_FIX_HOME_PAGES_SCHEMA.sql`
2. **RLS Policies**: `docs/SQL_FIX_HOME_PAGES_RLS_POLICIES.sql`
3. **Trigger**: `docs/QUICK_APPLY_TRIGGER.sql`

---

## 🧪 Test Post-Verifica

Dopo aver corretto eventuali problemi, testa l'applicazione:

1. **Login**: Verifica che il login funzioni
2. **Profilo**: Verifica che il profilo si carichi
3. **Appuntamenti**: Verifica che gli appuntamenti siano visibili
4. **Chat**: Verifica che i messaggi siano visibili
5. **Allenamenti**: Verifica che gli allenamenti siano visibili
6. **Progressi**: Verifica che i progressi siano visibili

---

## 📝 Note

- Lo script di verifica è **solo lettura** - non modifica nulla
- Se trovi problemi, esegui gli script di fix corrispondenti
- Salva i risultati della verifica per riferimento futuro
- Esegui la verifica dopo ogni modifica importante a Supabase

---

**Fine Istruzioni**
