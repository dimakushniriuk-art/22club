# 📊 Analisi RLS Policies Esistenti

**Data**: 2025-12-07  
**Problema Identificato**: Troppe policies duplicate e ridondanti

---

## 🔴 Problema Principale

Il database ha **MOLTE policies duplicate e ridondanti**, specialmente per la tabella `appointments` che ha **14 policies diverse**! Questo può creare conflitti e rendere i dati invisibili.

### Esempio: `appointments` (14 policies!)

1. Athletes can view own appointments
2. Only staff can delete appointments
3. Only staff can insert appointments
4. Only staff can update appointments
5. Staff can view own appointments
6. appointments_delete_own_org
7. appointments_insert_own_org
8. appointments_select_own_athlete
9. appointments_select_own_org
10. appointments_update_own_org
11. authenticated_users_delete_appointments
12. authenticated_users_insert_appointments
13. authenticated_users_select_appointments
14. authenticated_users_update_appointments

**Problema**: Troppe policies che si sovrappongono possono creare conflitti o essere troppo restrittive.

---

## 📋 Tabelle con Più Policies

| Tabella           | Numero Policies | Stato     |
| ----------------- | --------------- | --------- |
| **appointments**  | 14              | 🔴 TROPPE |
| **workout_logs**  | 9               | 🔴 TROPPE |
| **workout_plans** | 9               | 🔴 TROPPE |
| **exercises**     | 6               | 🟡 MOLTE  |
| **inviti_atleti** | 6               | 🟡 MOLTE  |
| **profiles**      | 6               | 🟡 MOLTE  |
| **payments**      | 5               | 🟡 MOLTE  |
| **chat_messages** | 4               | ✅ OK     |
| **notifications** | 2               | ✅ OK     |

---

## ⚠️ Policies "Everyone" (Troppo Permissive)

Alcune policies usano "Everyone" che è troppo permissivo:

- `workout_logs`: "Everyone can create/view/update/delete workout logs"
- `workout_plans`: "Everyone can create/view/update/delete workout plans"

**Problema**: Queste policies permettono a chiunque di fare qualsiasi cosa, bypassando la sicurezza.

---

## ✅ Soluzione

### Script Creati

1. **`ANALYZE_RLS_POLICIES.sql`** - Analizza tutte le policies esistenti
2. **`CLEANUP_RLS_POLICIES.sql`** - Rimuove policies duplicate (opzionale)
3. **`FIX_RLS_POLICIES_COMPLETE.sql`** - ⭐ **DA USARE** - Rimuove TUTTE le policies esistenti e crea nuove corrette

### Procedura Consigliata

1. **Esegui analisi** (opzionale):

   ```sql
   -- Esegui ANALYZE_RLS_POLICIES.sql per vedere tutte le policies
   ```

2. **Applica fix completo**:

   ```sql
   -- Esegui FIX_RLS_POLICIES_COMPLETE.sql
   -- Questo script:
   -- - Rimuove TUTTE le policies esistenti dalle tabelle principali
   -- - Crea nuove policies corrette e non duplicate
   -- - Verifica esistenza tabelle/colonne prima di creare
   ```

3. **Verifica**:
   ```bash
   npm run db:verify-data-deep
   ```

---

## 🎯 Risultato Atteso

Dopo l'applicazione di `FIX_RLS_POLICIES_COMPLETE.sql`:

- ✅ **appointments**: 2 policies (SELECT + ALL per trainer)
- ✅ **profiles**: 4 policies (SELECT own, SELECT trainers, UPDATE own, INSERT admin)
- ✅ **exercises**: 2 policies (SELECT all, ALL trainers)
- ✅ **payments**: 2 policies (SELECT own, ALL trainers)
- ✅ **notifications**: 3 policies (SELECT own, UPDATE own, INSERT system)
- ✅ **chat_messages**: 3 policies (SELECT own, INSERT own, UPDATE received)
- ✅ **inviti_atleti**: 2 policies (SELECT trainer, ALL trainer)
- ✅ **pt_atleti**: 2 policies (SELECT own, ALL trainer)

**Totale**: ~20 policies invece di 100+ duplicate!

---

## 📝 Note

- Lo script `FIX_RLS_POLICIES_COMPLETE.sql` è stato aggiornato per:
  - Rimuovere TUTTE le policies esistenti prima di crearne di nuove
  - Verificare esistenza tabelle/colonne
  - Saltare tabelle mancanti
  - Non generare errori se colonne mancano

- Le policies "Everyone" verranno rimosse e sostituite con policies più sicure

- Dopo il fix, i dati dovrebbero essere visibili con anon key
