# 🔒 Analisi Permessi e Consigli per Sistemazione

**Data**: 2025-02-01  
**Obiettivo**: Verificare e sistemare i permessi secondo le specifiche richieste

---

## 📋 Specifiche Richieste

### 1. **Admin**

- ✅ Accesso completo a tutto il gestionale
- ✅ Può creare, modificare e cancellare qualsiasi informazione
- ✅ Accesso completo a Supabase e tutto il resto

### 2. **Trainer**

- ✅ Può modificare solo il proprio profilo
- ✅ Può modificare schede di allenamento
- ✅ Può modificare DB esercizi
- ✅ Registra i propri atleti (visibili solo a lui)
- ✅ Crea schede di allenamento e può assegnarle solo ai propri atleti
- ✅ Può creare esercizi (visibili a tutti i trainer)
- ✅ **Gestisce abbonamenti/pagamenti solo per i propri atleti** (NUOVO)

### 3. **Atleta**

- ✅ Può modificare solo il proprio profilo

---

## 🔍 Situazione Attuale (Dopo Verifica)

### ❌ **PROBLEMI IDENTIFICATI**

#### 1. **PROFILES - Troppo Permissive**

- **Problema**: Policy `"Authenticated users can update profiles"` con `USING (true)` permette a chiunque di modificare qualsiasi profilo
- **Impatto**: ⚠️ **CRITICO** - Trainer e atleti possono modificare profili di altri utenti
- **Fix Necessario**: ✅ Implementato nello script `SQL_FIX_PERMISSIONS_COMPLETE.sql`

#### 2. **PT_ATLETI - Nessun Isolamento**

- **Problema**: Policy `"Users can manage pt_atleti"` con `USING (true)` permette a chiunque di gestire relazioni trainer-atleta
- **Impatto**: ⚠️ **CRITICO** - Trainer può vedere e modificare atleti di altri trainer
- **Fix Necessario**: ✅ Implementato nello script `SQL_FIX_PERMISSIONS_COMPLETE.sql`

#### 3. **WORKOUT_PLANS - Nessun Isolamento**

- **Problema**: Policy `"Staff can view/create/update/delete workout plans"` con `USING (true)` permette a qualsiasi trainer di vedere/modificare schede di altri trainer
- **Impatto**: ⚠️ **CRITICO** - Trainer può assegnare schede ad atleti di altri trainer
- **Fix Necessario**: ✅ Implementato nello script `SQL_FIX_PERMISSIONS_COMPLETE.sql`

#### 4. **EXERCISES - Parzialmente OK**

- **Stato**: ✅ Policy attuali permettono a tutti i trainer di vedere esercizi
- **Problema Minore**: Alcune policy potrebbero essere più specifiche
- **Fix Necessario**: ✅ Migliorato nello script `SQL_FIX_PERMISSIONS_COMPLETE.sql`

---

## ✅ **SOLUZIONI IMPLEMENTATE**

### Script SQL Creati

1. **`docs/SQL_VERIFY_PERMISSIONS_STRUCTURE.sql`**
   - Script di verifica completo
   - Identifica tutte le policy problematiche
   - Mostra struttura tabelle e foreign keys
   - **ESEGUIRE PRIMA** per vedere la situazione attuale
   - ✅ **CORRETTO**: Risolto errore di ambiguità con `oid`

2. **`docs/SQL_CLEANUP_DUPLICATE_POLICIES.sql`** (NUOVO)
   - Script di pulizia per rimuovere tutte le policy duplicate
   - Rimuove automaticamente tutte le policy esistenti
   - **ESEGUIRE PRIMA** di `SQL_FIX_PERMISSIONS_COMPLETE.sql` se ci sono policy duplicate

3. **`docs/SQL_FIX_PERMISSIONS_COMPLETE.sql`**
   - Script di correzione completo
   - Implementa tutte le specifiche richieste
   - Crea funzione `is_admin()` helper
   - Sistema tutte le RLS policies
   - ✅ **AGGIORNATO**: Rimuove anche policy da `SQL_ADMIN_FULL_PERMISSIONS.sql`
   - ✅ **AGGIORNATO**: Aggiunge policy "Admins have full access" per compatibilità

---

## 🛠️ **PIANO DI AZIONE**

### Fase 1: Verifica (ORA)

1. ✅ Eseguire `docs/SQL_VERIFY_PERMISSIONS_STRUCTURE.sql` in Supabase SQL Editor
2. ✅ Analizzare i risultati per confermare i problemi identificati
3. ✅ Verificare che la funzione `is_admin()` esista (se non esiste, verrà creata dallo script di fix)

### Fase 2: Pulizia (OPZIONALE - solo se ci sono policy duplicate)

1. ⚠️ **BACKUP DATABASE** prima di procedere
2. ✅ Eseguire `docs/SQL_CLEANUP_DUPLICATE_POLICIES.sql` in Supabase SQL Editor
3. ✅ Verificare che tutte le policy siano state rimosse

### Fase 3: Correzione (DOPO VERIFICA/PULIZIA)

1. ⚠️ **BACKUP DATABASE** prima di procedere (se non già fatto)
2. ✅ Eseguire `docs/SQL_FIX_PERMISSIONS_COMPLETE.sql` in Supabase SQL Editor
3. ✅ Verificare che tutte le policies siano state create correttamente
4. ✅ Testare accessi con utenti di test (admin, trainer, atleta)

### Fase 4: Verifica Codice (DOPO CORREZIONE SQL)

1. ✅ Verificare che le API routes rispettino le nuove policies
2. ✅ Aggiungere controlli lato codice se necessario
3. ✅ Testare funzionalità critiche:
   - Trainer crea atleta → verifica che sia visibile solo a lui
   - Trainer crea scheda → verifica che possa assegnarla solo ai propri atleti
   - Trainer crea esercizio → verifica che sia visibile a tutti i trainer
   - Admin modifica qualsiasi cosa → verifica che funzioni

---

## 📊 **DETTAGLIO CORREZIONI**

### PROFILES

- ✅ Utenti vedono solo il proprio profilo
- ✅ Admin vede tutti i profili
- ✅ Trainer vede il proprio profilo e quelli dei propri atleti
- ✅ Utenti possono aggiornare solo il proprio profilo
- ✅ Admin può aggiornare qualsiasi profilo
- ✅ Solo admin può inserire/eliminare profili

### PT_ATLETI

- ✅ Trainer vede solo le proprie relazioni con atleti
- ✅ Atleta vede le relazioni dove è coinvolto
- ✅ Trainer può creare relazioni solo con i propri atleti
- ✅ Trainer può modificare/eliminare solo le proprie relazioni
- ✅ Admin può fare tutto

### WORKOUT_PLANS

- ✅ Atleta vede solo le proprie schede
- ✅ Trainer vede solo le schede dei propri atleti
- ✅ Trainer può creare schede solo per i propri atleti (verifica tramite `pt_atleti`)
- ✅ Trainer può modificare/eliminare solo le schede dei propri atleti
- ✅ Admin può fare tutto

### EXERCISES

- ✅ Tutti gli utenti autenticati vedono gli esercizi
- ✅ Solo trainer e admin possono creare/modificare/eliminare esercizi
- ✅ Gli esercizi creati da un trainer sono visibili a tutti i trainer

### PAYMENTS (Abbonamenti/Pagamenti) - NUOVO

- ✅ Atleta vede solo i propri pagamenti
- ✅ Trainer vede solo i pagamenti dei propri atleti
- ✅ Trainer può creare/modificare/eliminare solo per i propri atleti
- ✅ Admin ha accesso completo

### LESSON_COUNTERS (Contatori Lezioni) - NUOVO

- ✅ Atleta vede solo il proprio contatore
- ✅ Trainer vede solo i contatori dei propri atleti
- ✅ Trainer può aggiornare solo i contatori dei propri atleti
- ✅ Admin ha accesso completo

---

## ⚠️ **ATTENZIONI**

1. **Funzione is_admin()**
   - Usa `SECURITY DEFINER` per evitare ricorsione
   - Verifica il ruolo dalla tabella `profiles`
   - Deve essere creata prima delle policies che la usano

2. **Performance**
   - Le policy con `EXISTS` su `pt_atleti` potrebbero essere più lente
   - Considerare l'aggiunta di indici se necessario
   - Monitorare performance dopo l'implementazione

3. **Compatibilità**
   - Verificare che le API routes esistenti funzionino ancora
   - Potrebbero essere necessari aggiustamenti nel codice
   - Testare tutte le funzionalità critiche

4. **Backup**
   - ⚠️ **IMPORTANTE**: Fare backup del database prima di eseguire lo script di fix
   - Le policy verranno eliminate e ricreate
   - Potrebbe essere necessario rollback se qualcosa va storto

---

## 🧪 **TEST DA ESEGUIRE**

### Test Admin

- [ ] Admin può vedere tutti i profili
- [ ] Admin può modificare qualsiasi profilo
- [ ] Admin può creare/eliminare profili
- [ ] Admin può vedere tutte le relazioni trainer-atleta
- [ ] Admin può vedere tutte le schede di allenamento
- [ ] Admin può creare/modificare/eliminare esercizi

### Test Trainer

- [ ] Trainer può vedere solo il proprio profilo
- [ ] Trainer può modificare solo il proprio profilo
- [ ] Trainer può vedere solo i propri atleti (tramite `pt_atleti`)
- [ ] Trainer può creare relazioni solo con i propri atleti
- [ ] Trainer può vedere solo le schede dei propri atleti
- [ ] Trainer può creare schede solo per i propri atleti
- [ ] Trainer NON può vedere atleti di altri trainer
- [ ] Trainer NON può assegnare schede ad atleti di altri trainer
- [ ] Trainer può creare esercizi
- [ ] Trainer può vedere esercizi creati da altri trainer

### Test Atleta

- [ ] Atleta può vedere solo il proprio profilo
- [ ] Atleta può modificare solo il proprio profilo
- [ ] Atleta può vedere solo le proprie schede di allenamento
- [ ] Atleta NON può creare/modificare schede
- [ ] Atleta NON può vedere atleti di altri trainer
- [ ] Atleta può vedere esercizi (solo lettura)

---

## 📝 **NOTE TECNICHE**

### Struttura Tabella `pt_atleti`

- `pt_id`: Riferimento a `profiles.id` (ID del trainer)
- `atleta_id`: Riferimento a `profiles.id` (ID dell'atleta)
- La relazione è univoca: un trainer può avere un atleta solo una volta

### Struttura Tabella `workout_plans`

- `athlete_id`: Riferimento a `profiles.id` (ID dell'atleta)
- `created_by`: Riferimento a `profiles.user_id` (ID auth del trainer che ha creato)
- La verifica che il trainer possa assegnare la scheda all'atleta viene fatta tramite `pt_atleti`

### Funzione `is_admin()`

- Usa `SECURITY DEFINER` per bypassare RLS quando verifica il ruolo
- Evita ricorsione nelle policy
- Restituisce `true` solo se l'utente corrente ha ruolo `admin` in `profiles`

---

## 🚀 **PROSSIMI STEP**

1. ✅ Eseguire script di verifica
2. ⏳ Eseguire script di fix (dopo backup)
3. ⏳ Testare funzionalità
4. ⏳ Verificare codice API routes
5. ⏳ Documentare eventuali modifiche necessarie al codice

---

**Ultimo aggiornamento**: 2025-02-01
