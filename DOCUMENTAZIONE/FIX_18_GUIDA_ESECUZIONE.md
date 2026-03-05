# 📋 Guida Esecuzione FIX_18 - Standardizzazione Colonne

**Data:** 2025-02-01  
**Prerequisito:** Eseguire FIX_17 prima di FIX_18

---

## ✅ Checklist Pre-Esecuzione

Prima di eseguire `FIX_18_STANDARDIZZAZIONE_COLONNE.sql`, verificare:

- [ ] ✅ FIX_17 eseguito e risultati analizzati
- [ ] ✅ Backup database completato
- [ ] ✅ Uso colonne verificato nel codice applicativo
- [ ] ✅ Test in ambiente di sviluppo pianificato

---

## 📊 Risultati Attesi da FIX_17

Dopo aver eseguito FIX_17, dovresti vedere risultati per:

1. **workout_logs** - Analisi `atleta_id` vs `athlete_id`
2. **inviti_atleti** - Analisi `stato` vs `status`, `pt_id` vs `trainer_id`
3. **notifications** - Analisi `body` vs `message`, `read` vs `is_read`
4. **payments** - Analisi `payment_method` vs `method_text`
5. **user_settings** - Analisi colonne duplicate
6. **cliente_tags** - Analisi multilingua (✅ già visto - nessuna modifica necessaria)

---

## 🎯 Decisioni di Standardizzazione

Basate sull'analisi FIX_17 e sul codice applicativo, le decisioni sono:

### ✅ workout_logs

- **Mantieni:** `atleta_id` (NOT NULL, colonna principale)
- **Rimuovi:** `athlete_id` (colonna alias/legacy)
- **Motivo:** Il codice usa principalmente `atleta_id`

### ✅ inviti_atleti

- **Mantieni:** `status` e `pt_id`
- **Rimuovi:** `stato` e `trainer_id`
- **Motivo:** Standardizzazione su inglese, `pt_id` è la colonna principale

### ✅ notifications

- **Mantieni:** `message` e `is_read`
- **Rimuovi:** `body` e `read`
- **Motivo:** Standardizzazione su nomi più descrittivi

### ✅ payments

- **Mantieni:** `payment_method` e `created_by_staff_id`
- **Rimuovi:** `method_text` e `trainer_id`
- **Motivo:** `payment_method` è più standard, `created_by_staff_id` è la colonna principale

### ✅ user_settings

- **Mantieni:** `notification_settings`, `privacy_settings`, `account_settings`
- **Rimuovi:** `notifications`, `privacy`, `account`
- **Motivo:** Nomi più descrittivi e consistenti

### ✅ cliente_tags

- **Nessuna modifica** - Colonne multilingua mantenute

---

## ⚠️ Importante: Aggiornamento Codice Applicativo

Dopo aver eseguito FIX_18, devi aggiornare il codice applicativo per usare le colonne standardizzate:

### File da Aggiornare (esempi):

1. **workout_logs:**
   - Cercare `athlete_id` → Sostituire con `atleta_id`
   - File: `src/hooks/use-allenamenti.ts`, `src/app/home/allenamenti/*`

2. **inviti_atleti:**
   - Cercare `stato` → Sostituire con `status`
   - Cercare `trainer_id` → Sostituire con `pt_id`

3. **notifications:**
   - Cercare `body` → Sostituire con `message`
   - Cercare `read` → Sostituire con `is_read`

4. **payments:**
   - Cercare `method_text` → Sostituire con `payment_method`
   - Cercare `trainer_id` → Sostituire con `created_by_staff_id`

5. **user_settings:**
   - Cercare `notifications` → Sostituire con `notification_settings`
   - Cercare `privacy` → Sostituire con `privacy_settings`
   - Cercare `account` → Sostituire con `account_settings`

---

## 🚀 Sequenza di Esecuzione

1. **Eseguire FIX_17** - Analisi uso colonne
2. **Verificare risultati** - Vedere quale colonna è utilizzata
3. **Verificare codice** - Grep per colonne duplicate nel codice
4. **Backup database** - Essenziale prima di modifiche
5. **Eseguire FIX_18** - Standardizzazione colonne
6. **Aggiornare codice** - Sostituire colonne legacy
7. **Testare** - Verificare che tutto funzioni
8. **Deploy** - Solo dopo test completi

---

## 📝 Note

- Lo script FIX_18 è idempotente (può essere rieseguito)
- Lo script copia automaticamente i dati da colonne legacy a colonne standard
- Lo script rimuove solo le colonne dopo aver copiato i dati
- `cliente_tags` non viene modificato (multilingua)

---

**Ultimo aggiornamento:** 2025-02-01
