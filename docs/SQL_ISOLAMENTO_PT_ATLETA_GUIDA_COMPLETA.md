# 🔒 Guida Completa Isolamento PT-Atleta

## 📊 Situazione Attuale

Dalla verifica risulta:

- **5 PT totali**
- **13 atleti totali**
- **Solo 2 relazioni PT-Atleta** (11 atleti senza PT!)
- **5 RLS policies su pt_atleti**
- **4 RLS policies su profiles**
- **3 RLS policies su chat_messages**

## ⚠️ Problemi Identificati

1. **11 atleti senza PT assegnato** - Non possono usare il sistema correttamente
2. **Funzione `complete_athlete_registration` buggata** - Usa `user_id` invece di `profiles.id`
3. **RLS policies incomplete** - Non garantiscono isolamento completo su tutte le tabelle
4. **Possibili policies duplicate** - Possono creare conflitti

## 📋 Ordine di Esecuzione Script

### STEP 1: Verifica Situazione Attuale

```sql
-- Esegui: docs/SQL_VERIFY_PT_ATHLETE_ISOLATION.sql
```

**Cosa fa**: Analizza lo stato attuale del sistema, mostra statistiche, verifica RLS policies esistenti.

**Output atteso**: Vedrai quanti atleti non hanno PT, quante policies esistono, etc.

---

### STEP 2: Lista Atleti Senza PT

```sql
-- Esegui: docs/SQL_LIST_ATHLETES_WITHOUT_PT.sql
```

**Cosa fa**: Mostra tutti gli atleti che non hanno un PT assegnato e i PT disponibili.

**Output atteso**: Lista di 11 atleti senza PT e lista di 5 PT disponibili.

---

### STEP 3: Assegna PT a Tutti gli Atleti (OPZIONALE)

```sql
-- Esegui: docs/SQL_ASSIGN_PT_TO_ALL_ATHLETES.sql
```

**Cosa fa**: Assegna automaticamente un PT a tutti gli atleti senza PT, distribuendoli in modo equo.

**⚠️ ATTENZIONE**: Questo script assegna PT in modo automatico. Se preferisci assegnare manualmente, salta questo step.

**Output atteso**: Tutti gli atleti avranno un PT assegnato.

---

### STEP 4: Correzione Completa Isolamento

```sql
-- Esegui: docs/SQL_FIX_PT_ATHLETE_ISOLATION_COMPLETE.sql
```

**Cosa fa**:

1. Corregge la funzione `complete_athlete_registration` (usa `profiles.id` invece di `user_id`)
2. Aggiorna RLS policies su `pt_atleti` per isolamento completo
3. Aggiorna RLS policies su `profiles` per isolamento completo
4. Aggiorna RLS policies su `chat_messages` per isolamento completo
5. Aggiorna RLS policies su `appointments` per isolamento completo
6. Aggiorna RLS policies su `workout_logs` per isolamento completo
7. Aggiorna RLS policies su `workout_plans` per isolamento completo
8. Aggiorna RLS policies su `progress_logs` per isolamento completo

**⚠️ IMPORTANTE**: Questo script rimuove tutte le policies esistenti e le ricrea. Assicurati di avere un backup.

**Output atteso**: Tutte le tabelle avranno RLS policies corrette per garantire isolamento completo.

---

### STEP 5: Verifica Finale

```sql
-- Esegui di nuovo: docs/SQL_VERIFY_PT_ATHLETE_ISOLATION.sql
```

**Cosa fa**: Verifica che tutte le correzioni siano state applicate correttamente.

**Output atteso**:

- 0 atleti senza PT (se hai eseguito STEP 3)
- RLS policies corrette su tutte le tabelle
- Isolamento completo garantito

---

## 🔍 Verifica Manuale

Dopo aver eseguito tutti gli script, verifica manualmente:

### 1. Verifica Isolamento PT

```sql
-- Come PT, prova a vedere atleti di altri PT (NON dovresti vederli)
SELECT * FROM profiles WHERE role IN ('atleta', 'athlete');
-- Dovresti vedere solo i tuoi atleti
```

### 2. Verifica Isolamento Atleta

```sql
-- Come atleta, prova a vedere altri PT (NON dovresti vederli)
SELECT * FROM profiles WHERE role IN ('pt', 'trainer');
-- Dovresti vedere solo il tuo PT
```

### 3. Verifica Chat

```sql
-- Come atleta, prova a inviare messaggio a PT diverso dal tuo (NON dovresti riuscire)
-- Come PT, prova a inviare messaggio ad atleta non tuo (NON dovresti riuscire)
```

---

## 📝 Note Importanti

1. **Backup**: Fai sempre un backup del database prima di eseguire script di modifica
2. **Test**: Testa sempre in ambiente di sviluppo prima di applicare in produzione
3. **Ordine**: Esegui gli script nell'ordine indicato
4. **Verifica**: Dopo ogni step, verifica che tutto funzioni correttamente

---

## 🆘 Risoluzione Problemi

### Problema: "Error: column reference is ambiguous"

**Soluzione**: Lo script è già stato corretto. Se persiste, verifica che non ci siano variabili con lo stesso nome.

### Problema: "Error: policy already exists"

**Soluzione**: Lo script rimuove automaticamente le policies esistenti. Se persiste, rimuovi manualmente le policies duplicate.

### Problema: "Atleti ancora senza PT dopo assegnazione"

**Soluzione**: Verifica che esistano PT disponibili e che le RLS policies su `pt_atleti` permettano l'inserimento.

---

## ✅ Checklist Post-Applicazione

- [ ] Tutti gli atleti hanno un PT assegnato
- [ ] PT può vedere solo i propri atleti
- [ ] Atleta può vedere solo il proprio PT
- [ ] Chat funziona solo tra PT e i propri atleti
- [ ] Appointments isolati per PT
- [ ] Workout logs isolati per PT
- [ ] Workout plans isolati per PT
- [ ] Progress logs isolati per PT

---

## 📞 Supporto

Se riscontri problemi, verifica:

1. Log degli errori in Supabase
2. RLS policies attive: `SELECT * FROM pg_policies WHERE tablename = 'NOME_TABELLA'`
3. Relazioni PT-Atleta: `SELECT * FROM pt_atleti`
