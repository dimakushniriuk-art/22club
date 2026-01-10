# Script SQL per Verifica e Fix Chat

Eseguire questi file SQL **uno alla volta** nell'editor SQL di Supabase.

## Ordine Consigliato

### 1. Verifica (Eseguire prima)

- `01_verifica_indici.sql` - Verifica indici esistenti
- `02_verifica_rls.sql` - Verifica se RLS è abilitato
- `03_verifica_policy_rls.sql` - Verifica policy RLS
- `04_verifica_statistiche.sql` - Verifica statistiche tabella
- `05_verifica_lock.sql` - Verifica lock attivi (se "No rows" = OK)
- `06_verifica_connessioni.sql` - Verifica connessioni attive (se "No rows" = OK)
- `07_verifica_dimensione.sql` - Verifica dimensione tabella

### 2. Fix (Eseguire dopo la verifica)

- `08_rimuovi_indici_ridondanti.sql` - Rimuove indici duplicati ✅
- `09_fix_policy_update.sql` - Corregge policy UPDATE (rimuove read_at IS NOT NULL) ✅
- `10_aggiorna_statistiche.sql` - Aggiorna statistiche per ottimizzazione ✅

### 3. Verifica Fix Applicati

- `11_verifica_fix_applicati.sql` - Verifica che i fix siano stati applicati correttamente

## Note

- Eseguire **un file alla volta**
- Se una query restituisce "No rows", potrebbe essere normale (es. nessun lock attivo)
- Dopo i fix, rieseguire le query di verifica per confermare
