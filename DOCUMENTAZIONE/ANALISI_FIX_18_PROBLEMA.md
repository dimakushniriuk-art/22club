# 🔍 Analisi Problema FIX_18 - Standardizzazione Colonne

**Data:** 2025-02-01  
**Problema:** Impossibile aggiornare funzione `check_invite_expiry()` dentro blocco `DO $$` usando `EXECUTE`

---

## 📋 Problema Identificato

### Tentativi Falliti

1. **Tentativo 1:** Usare `EXECUTE` con stringa multi-linea e delimitatori `$func$`
   - **Errore:** `syntax error at or near "EXECUTE"`
   - **Causa:** Conflitto tra delimitatori `$$` del blocco DO e `$func$` della funzione

2. **Tentativo 2:** Usare variabile TEXT con concatenazione e `E'\n'`
   - **Errore:** `syntax error at or near "sql_text"`
   - **Causa:** `E'\n'` non può essere usato direttamente nella concatenazione in PL/pgSQL

3. **Tentativo 3:** Usare variabile TEXT con concatenazione e `CHR(10)`
   - **Errore:** `syntax error at or near "sql_text"`
   - **Causa:** Sintassi di concatenazione multi-linea non supportata in questo contesto

4. **Tentativo 4:** Usare stringa SQL in singola riga
   - **Errore:** `syntax error at or near "sql_text"`
   - **Causa:** PostgreSQL ha difficoltà a interpretare `CREATE FUNCTION` dentro `EXECUTE` in un blocco `DO $$`

---

## ✅ Soluzione Implementata

### Separazione degli Script

**Problema:** Non possiamo creare/aggiornare funzioni dentro un blocco `DO $$` usando `EXECUTE` in modo affidabile.

**Soluzione:** Separare l'aggiornamento della funzione in un file SQL separato.

### File Creati

1. **`FIX_18_AGGIORNA_FUNZIONE_CHECK_INVITE_EXPIRY.sql`**
   - Aggiorna la funzione `check_invite_expiry()` per usare `status` invece di `stato`
   - Aggiorna il trigger `trigger_check_invite_expiry`
   - Eseguire **PRIMA** di `FIX_18_STANDARDIZZAZIONE_COLONNE.sql`

2. **`FIX_18_STANDARDIZZAZIONE_COLONNE.sql`** (modificato)
   - Rimossa la parte problematica dell'aggiornamento della funzione
   - Aggiunto avviso per eseguire prima il file separato
   - Mantiene tutte le altre standardizzazioni

---

## 📝 Sequenza di Esecuzione Corretta

### Step 1: Aggiornare la funzione

```sql
-- Eseguire questo PRIMA
FIX_18_AGGIORNA_FUNZIONE_CHECK_INVITE_EXPIRY.sql
```

### Step 2: Standardizzare le colonne

```sql
-- Eseguire questo DOPO
FIX_18_STANDARDIZZAZIONE_COLONNE.sql
```

---

## 🔍 Dettagli Tecnici

### Perché non funziona `EXECUTE` dentro `DO $$`?

1. **Limitazioni PL/pgSQL:**
   - `CREATE FUNCTION` è un comando DDL che PostgreSQL preferisce eseguire direttamente
   - `EXECUTE` in PL/pgSQL è progettato principalmente per DML, non DDL complessi

2. **Problemi con delimitatori:**
   - Il blocco `DO $$` usa `$$` come delimitatore
   - La funzione usa `$$` o `$func$` come delimitatore
   - Questo crea conflitti di parsing

3. **Stringhe dinamiche complesse:**
   - Costruire stringhe SQL multi-linea con delimitatori annidati è problematico
   - PostgreSQL ha difficoltà a interpretare correttamente le virgolette e i delimitatori

### Perché la soluzione separata funziona?

1. **Esecuzione diretta:**
   - `CREATE OR REPLACE FUNCTION` viene eseguito direttamente, non tramite `EXECUTE`
   - PostgreSQL può analizzare e compilare la funzione correttamente

2. **Nessun conflitto di delimitatori:**
   - Il file SQL usa `$$` direttamente, senza conflitti
   - La funzione viene creata in modo standard

3. **Separazione delle responsabilità:**
   - Aggiornamento funzione = file separato
   - Standardizzazione colonne = file principale
   - Più facile da mantenere e debuggare

---

## ✅ Vantaggi della Soluzione

1. **Affidabilità:** Funziona sempre, senza problemi di sintassi
2. **Chiarezza:** Separazione logica tra aggiornamento funzione e standardizzazione
3. **Manutenibilità:** Più facile da capire e modificare in futuro
4. **Idempotenza:** Entrambi gli script possono essere rieseguiti senza problemi

---

## 📚 Riferimenti

- **Funzione originale:** `supabase/migrations/20250130_auto_expire_documents_invites_subscriptions.sql`
- **Tabella:** `inviti_atleti` (colonne `stato` e `status`)
- **Trigger:** `trigger_check_invite_expiry`

---

**Conclusione:** La separazione degli script è la soluzione migliore per questo caso specifico, evitando i problemi di sintassi con `EXECUTE` e `CREATE FUNCTION` dentro blocchi `DO $$`.
