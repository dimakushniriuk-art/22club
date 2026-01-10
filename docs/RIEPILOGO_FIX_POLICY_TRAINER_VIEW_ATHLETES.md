# 🔒 Fix Policy RLS per Trainer - Vedere Solo Atleti Assegnati

**Data**: 2026-01-09  
**Problema**: Trainer `b.francesco@22club.it` non vede gli atleti assegnati nella pagina Clienti  
**Soluzione**: Policy RLS specifiche che permettono ai trainer di vedere solo gli atleti assegnati tramite `pt_atleti`

---

## 📊 Situazione Attuale

### Trainer: `b.francesco@22club.it`
- **Profile ID**: `f6fdd6cb-c602-4ced-89a7-41a347e8faa9`
- **User ID**: `be43f62f-b94a-4e4d-85d0-aed6fe4e595a`
- **Ruolo**: `trainer`
- **Atleti Assegnati**: **37 atleti** nella tabella `pt_atleti`

### Problema
Il trainer ha 37 atleti assegnati nel database, ma nella pagina Clienti vede "0 clienti trovati".

---

## 🔧 Soluzione Implementata

### 1. Funzioni Helper Create

#### `is_athlete_assigned_to_current_trainer(athlete_profile_id UUID)`
Verifica se un atleta è assegnato al trainer corrente:
- Ottiene `auth.uid()` dell'utente autenticato
- Trova il `profile_id` del trainer corrente
- Verifica se esiste una riga in `pt_atleti` che collega trainer ↔ atleta
- **Sicurezza**: `SECURITY DEFINER` + `STABLE` per evitare ricorsione

#### `get_current_trainer_profile_id()`
Restituisce il `profile_id` del trainer corrente:
- Utile per altre policy o query
- Restituisce `NULL` se l'utente non è un trainer
- **Sicurezza**: `SECURITY DEFINER` + `STABLE`

### 2. Policy RLS Create

#### Policy SELECT su `profiles`:

1. **"Users can view own profile"**
   - **Chi**: Tutti gli utenti autenticati
   - **Cosa**: Possono vedere il loro profilo (`user_id = auth.uid()`)

2. **"Trainers can view assigned athletes"**
   - **Chi**: Trainer (ruolo `pt` o `trainer`)
   - **Cosa**: Possono vedere solo gli atleti assegnati tramite `pt_atleti`
   - **Come**: Usa `is_athlete_assigned_to_current_trainer(id)` per verificare assegnazione

3. **"Athletes can view own profile"**
   - **Chi**: Atleti (ruolo `atleta` o `athlete`)
   - **Cosa**: Possono vedere solo il loro profilo
   - **Nota**: Redundante con "Users can view own profile", ma esplicita per chiarezza

4. **"Staff can view all profiles"**
   - **Chi**: Admin e altri staff (nutrizionista, massaggiatore)
   - **Cosa**: Vedono tutti i profili (compatibilità)

### 3. Policy Rimossa

- **"Authenticated users can view all profiles"** ❌ **RIMOSSA**
  - Era troppo permissiva e impediva il controllo specifico per trainer
  - Con questa policy attiva, tutti gli utenti autenticati vedevano TUTTI i profili
  - Ora i trainer vedono SOLO i loro atleti assegnati

---

## 📋 Migrazione da Eseguire

### File: `supabase/migrations/20260109_fix_rls_trainer_view_assigned_athletes.sql`

**Cosa fa**:
1. ✅ Crea funzione `is_athlete_assigned_to_current_trainer(UUID)`
2. ✅ Crea funzione `get_current_trainer_profile_id()`
3. ✅ Rimuove policy "Trainers can view assigned athletes and own profile" (vecchia)
4. ✅ Rimuove policy "Authenticated users can view all profiles" (troppo permissiva)
5. ✅ Crea policy "Users can view own profile"
6. ✅ Crea policy "Trainers can view assigned athletes"
7. ✅ Crea policy "Athletes can view own profile"
8. ✅ Crea policy "Staff can view all profiles"
9. ✅ Verifica che tutto sia stato creato correttamente

---

## ✅ Verifica Dopo Migrazione

### Script di Test: `docs/TEST_POLICY_TRAINER_VIEW_ATHLETES.sql`

**Esegui questo script per verificare**:

1. ✅ Funzioni helper create (2 funzioni)
2. ✅ Policy SELECT create (almeno 4 policy)
3. ✅ Policy permissiva rimossa
4. ✅ Atleti assegnati al trainer (37 atleti)
5. ✅ RLS attivo su `profiles`
6. ✅ Permessi funzioni corretti

---

## 🧪 Test Funzionale

### Test 1: Trainer vede solo atleti assegnati

**Prerequisiti**:
- Login come trainer `b.francesco@22club.it`
- Apri pagina Clienti

**Risultato Atteso**:
- ✅ Vede **37 atleti** assegnati (non tutti gli atleti del sistema)
- ✅ Non vede atleti assegnati ad altri trainer
- ✅ Non vede altri trainer o admin

### Test 2: Admin vede tutti i profili

**Prerequisiti**:
- Login come admin
- Apri pagina Clienti

**Risultato Atteso**:
- ✅ Vede **tutti i profili** (admin, trainer, atleti, staff)
- ✅ Può vedere tutti gli utenti del sistema

### Test 3: Atleta vede solo il suo profilo

**Prerequisiti**:
- Login come atleta
- Vai a pagina profilo

**Risultato Atteso**:
- ✅ Vede solo il suo profilo
- ✅ Non vede altri atleti o trainer

---

## 🔍 Come Funziona

### Flusso Query Trainer

1. **Utente loggato come trainer** (`b.francesco@22club.it`)
2. **Query a `pt_atleti`**:
   ```sql
   SELECT atleta_id 
   FROM pt_atleti 
   WHERE pt_id = 'f6fdd6cb-c602-4ced-89a7-41a347e8faa9'
   ```
   → Restituisce 37 `atleta_id`

3. **Query a `profiles`**:
   ```sql
   SELECT * 
   FROM profiles 
   WHERE id IN (lista_37_atleta_id)
   ```

4. **Policy RLS verifica**:
   - ✅ "Users can view own profile" → FALSE (non è il suo profilo)
   - ✅ "Trainers can view assigned athletes" → TRUE (atleta assegnato tramite `pt_atleti`)
   - ✅ "Athletes can view own profile" → FALSE (non è l'atleta stesso)
   - ✅ "Staff can view all profiles" → FALSE (non è admin/staff)
   - **Risultato**: Trainer può vedere l'atleta ✅

---

## ⚠️ Note Importanti

### 1. Funzioni `SECURITY DEFINER`
- Le funzioni helper usano `SECURITY DEFINER` per garantire che funzionino anche con RLS attivo
- Questo permette alle funzioni di leggere `profiles` e `pt_atleti` anche se RLS è attivo
- **Sicurezza**: Le funzioni verificano comunque `auth.uid()` per garantire che solo utenti autenticati possano usarle

### 2. Policy in OR Logico
- PostgreSQL valuta le policy RLS in **OR logico**
- Se **UNA** policy permette l'accesso, l'utente può vedere il record
- Questo significa che dobbiamo essere **attenti** a non creare policy troppo permissive

### 3. Performance
- Le funzioni helper sono marcate come `STABLE` per ottimizzazione
- La funzione `is_athlete_assigned_to_current_trainer` fa una SELECT su `profiles` e una su `pt_atleti`
- Per 37 atleti, questo è accettabile, ma per migliaia di atleti potrebbe essere necessario ottimizzare

### 4. Compatibilità
- La policy "Staff can view all profiles" garantisce che admin e altri staff vedano tutto
- Questo mantiene la compatibilità con il codice esistente
- Se vogliamo essere più restrittivi, possiamo modificare questa policy

---

## 🎯 Prossimi Passi

1. **Eseguire migrazione**: `supabase/migrations/20260109_fix_rls_trainer_view_assigned_athletes.sql`
2. **Verificare policy**: `docs/TEST_POLICY_TRAINER_VIEW_ATHLETES.sql`
3. **Testare pagina Clienti**: Login come trainer e verificare che veda 37 atleti
4. **Testare altri ruoli**: Verificare che admin vedano tutto e atleti vedano solo loro profilo
5. **Monitorare performance**: Se ci sono problemi di performance con molti atleti, ottimizzare le funzioni

---

## 📚 Documentazione

- **Migrazione**: `supabase/migrations/20260109_fix_rls_trainer_view_assigned_athletes.sql`
- **Test**: `docs/TEST_POLICY_TRAINER_VIEW_ATHLETES.sql`
- **Query Verifica**: `docs/VERIFICA_TRAINER_ATLETI_ASSEGNATI.sql`

---

**Ultimo Aggiornamento**: 2026-01-09  
**Stato**: ✅ **MIGRAZIONE CREATA - IN ATTESA DI ESECUZIONE**
