# 🔧 Istruzioni Fix RLS Policies (P1-001)

**Problema**: RLS Policies Troppo Restrittive (Severity: 75)  
**Migration**: `supabase/migrations/20250131_fix_rls_policies_complete.sql`  
**Tempo stimato**: 2h

---

## 📊 Stato Attuale (PRIMA del Fix)

**Verifica eseguita**: 2025-01-31

| Tabella       | ANON Key | SERVICE Key | Differenza | Problema                  |
| ------------- | -------- | ----------- | ---------- | ------------------------- |
| profiles      | 0        | 20          | 20         | 🔴 RLS troppo restrittivo |
| exercises     | 0        | 8           | 8          | 🔴 RLS troppo restrittivo |
| payments      | 0        | 4           | 4          | 🔴 RLS troppo restrittivo |
| notifications | 0        | 3           | 3          | 🔴 RLS troppo restrittivo |
| chat_messages | 0        | 13          | 13         | 🔴 RLS troppo restrittivo |
| inviti_atleti | 0        | 1           | 1          | 🔴 RLS troppo restrittivo |
| pt_atleti     | 0        | 2           | 2          | 🔴 RLS troppo restrittivo |
| appointments  | 0        | 3           | 3          | 🔴 RLS troppo restrittivo |

**Totale tabelle problematiche**: 8/8

---

## 🚀 Procedura di Fix

### STEP 1: Verifica Stato Attuale (Opzionale)

Eseguire lo script di verifica per vedere lo stato attuale delle policies:

```sql
-- Eseguire: docs/VERIFY_RLS_POLICIES_STATUS.sql
-- Nel SQL Editor di Supabase Dashboard
```

Oppure:

```bash
npm run db:verify-data-deep
```

---

### STEP 2: Applicare Migration

**Opzione A: Tramite Supabase Dashboard (Consigliato)**

1. Aprire Supabase Dashboard: https://supabase.com/dashboard
2. Selezionare il progetto: `icibqnmtacibgnhaidlz`
3. Andare su **SQL Editor**
4. Aprire il file: `supabase/migrations/20250131_fix_rls_policies_complete.sql`
5. Copiare tutto il contenuto
6. Incollare nel SQL Editor
7. Cliccare **Run** o premere `Ctrl+Enter`
8. Verificare che non ci siano errori

**Opzione B: Tramite Supabase CLI (se progetto linkato)**

```bash
# Se il progetto è linkato a Supabase
supabase db push

# Oppure eseguire direttamente la migration
supabase db execute --file supabase/migrations/20250131_fix_rls_policies_complete.sql
```

---

### STEP 3: Verifica Post-Fix

Dopo aver applicato la migration, verificare che il fix sia stato applicato correttamente:

```bash
npm run db:verify-data-deep
```

**Risultati Attesi**:

| Tabella       | ANON Key (Atteso) | SERVICE Key | Stato                               |
| ------------- | ----------------- | ----------- | ----------------------------------- |
| profiles      | 20                | 20          | ✅ ANON = SERVICE                   |
| exercises     | 8                 | 8           | ✅ ANON = SERVICE                   |
| payments      | 4                 | 4           | ✅ ANON = SERVICE                   |
| notifications | 3                 | 3           | ✅ ANON = SERVICE                   |
| chat_messages | 13                | 13          | ✅ ANON = SERVICE                   |
| inviti_atleti | 1                 | 1           | ✅ ANON = SERVICE                   |
| pt_atleti     | 2                 | 2           | ✅ ANON = SERVICE                   |
| appointments  | 3                 | 3           | ✅ ANON = SERVICE (no errore 42501) |

**Success Criteria**:

- ✅ Tutte le 8 tabelle accessibili con anon key
- ✅ Query `profiles` ritorna 20 righe (non 0)
- ✅ Nessun errore 42501 su `appointments`
- ✅ ANON key = SERVICE key per tutte le tabelle

---

### STEP 4: Verifica Policies Create

Eseguire lo script di verifica per vedere le policies create:

```sql
-- Eseguire: docs/VERIFY_RLS_POLICIES_STATUS.sql
-- Nel SQL Editor di Supabase Dashboard
```

Dovresti vedere:

- ✅ Policies create per tutte le 8 tabelle
- ✅ RLS attivo su tutte le tabelle
- ✅ Policies corrette (non duplicate)

---

## 🔍 Cosa Fa la Migration

La migration:

1. **Crea funzione helper** `drop_all_policies_for_table()` per rimuovere tutte le policies esistenti
2. **Rimuove policies duplicate** da tutte le 8 tabelle problematiche
3. **Crea nuove policies corrette** per ogni tabella:
   - **profiles**: Utenti vedono proprio profilo + Trainer vedono profili atleti
   - **exercises**: Tutti gli utenti autenticati vedono esercizi
   - **appointments**: Utenti vedono propri appuntamenti + Trainer gestiscono
   - **payments**: Utenti vedono propri pagamenti + Trainer gestiscono
   - **notifications**: Utenti vedono proprie notifiche
   - **chat_messages**: Utenti vedono propri messaggi
   - **inviti_atleti**: Trainer vedono propri inviti
   - **pt_atleti**: Utenti vedono proprie relazioni PT-Atleti
4. **Verifica colonne disponibili** per creare policies dinamiche (gestisce `trainer_id` vs `staff_id`, ecc.)
5. **Pulisce funzione helper** alla fine

---

## ⚠️ Note Importanti

1. **Le policies richiedono autenticazione**: Le nuove policies usano `TO authenticated`, quindi funzionano solo per utenti autenticati. Questo è corretto per sicurezza.

2. **Verifica con utente autenticato**: Per testare correttamente, assicurati di essere autenticato quando esegui `npm run db:verify-data-deep` o usa un utente di test.

3. **Backup**: La migration è idempotente (può essere eseguita più volte senza problemi), ma è sempre consigliabile fare un backup prima di modifiche importanti.

---

## 📝 File Coinvolti

- **Migration**: `supabase/migrations/20250131_fix_rls_policies_complete.sql`
- **Verifica Status**: `docs/VERIFY_RLS_POLICIES_STATUS.sql`
- **Verifica Dati**: `scripts/verify-supabase-data-deep.ts` (eseguito con `npm run db:verify-data-deep`)

---

## ✅ Checklist Completamento

- [ ] Verifica stato attuale (opzionale)
- [ ] Applica migration SQL
- [ ] Verifica post-fix con `npm run db:verify-data-deep`
- [ ] Verifica policies create con `VERIFY_RLS_POLICIES_STATUS.sql`
- [ ] Test manuale accesso dati nell'applicazione
- [ ] Aggiorna `sviluppo_PARTE1_PROBLEMI_TODO.md` con stato completato

---

**Ultimo aggiornamento**: 2025-01-31T00:00:00Z
