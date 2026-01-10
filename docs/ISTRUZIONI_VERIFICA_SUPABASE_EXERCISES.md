# 🔍 Istruzioni Verifica Supabase per Esercizi e Storage

**Data**: 2025-02-02  
**Obiettivo**: Verificare completamente la configurazione Supabase prima di apportare modifiche al codice

---

## 📋 Checklist Verifica

### 1. Eseguire Script di Verifica Completa

**File**: `docs/VERIFICA_SUPABASE_EXERCISES_COMPLETA.sql`

**Come eseguire**:
1. Aprire Supabase Dashboard
2. Andare su **SQL Editor**
3. Copiare e incollare tutto il contenuto del file
4. Cliccare **Run** o premere `Ctrl+Enter`
5. Analizzare i risultati

**Cosa verifica**:
- ✅ Struttura tabella `exercises` (colonne video_url, thumb_url, thumbnail_url)
- ✅ Esistenza bucket `exercise-videos` e `exercise-thumbs`
- ✅ Configurazione bucket (pubblico/privato, limiti dimensione, MIME types)
- ✅ RLS policies per storage buckets
- ✅ RLS policies per tabella exercises
- ✅ Statistiche file nei bucket
- ✅ Inconsistenze (es. colonne duplicate)

### 2. Eseguire Script Verifica Pubblico/Privato

**File**: `docs/VERIFICA_BUCKET_PUBLIC_PRIVATE.sql`

**Come eseguire**:
1. Aprire Supabase Dashboard
2. Andare su **SQL Editor**
3. Copiare e incollare tutto il contenuto del file
4. Cliccare **Run** o premere `Ctrl+Enter`
5. Analizzare i risultati

**Cosa verifica**:
- ✅ Se i bucket sono pubblici o privati
- ✅ Impatto sulla visualizzazione video/thumbnail
- ✅ Raccomandazioni per configurazione corretta

---

## 🔍 Interpretazione Risultati

### ✅ Stato OK

Se tutti i controlli mostrano **✅ OK**, significa:
- La struttura database è corretta
- I bucket esistono e sono configurati
- Le RLS policies sono presenti
- Non ci sono inconsistenze critiche

**Azione**: Procedere con le modifiche al codice

### ⚠️ Avvisi (Warning)

Se compaiono **⚠️**, significa:
- C'è qualcosa da verificare o migliorare
- Non è bloccante ma potrebbe causare problemi
- Esempi:
  - Bucket privato quando dovrebbe essere pubblico
  - Colonne duplicate (thumbnail_url e thumb_url)
  - RLS policies incomplete

**Azione**: Valutare se correggere prima di procedere

### ❌ Errori (Critical)

Se compaiono **❌**, significa:
- C'è un problema critico che deve essere risolto
- Le modifiche al codice potrebbero non funzionare
- Esempi:
  - Bucket mancante
  - Colonna mancante
  - RLS non abilitato

**Azione**: **RISOLVERE PRIMA** di procedere con le modifiche

---

## 🛠️ Problemi Comuni e Soluzioni

### Problema 1: Bucket `exercise-thumbs` non esiste

**Sintomo**: Script mostra `❌ NON ESISTE` per `exercise-thumbs`

**Soluzione**: Eseguire la migration `supabase/migrations/20250202_fix_storage_exercise_media_policies.sql` o creare manualmente il bucket nel dashboard Supabase

### Problema 2: Bucket privato quando dovrebbe essere pubblico

**Sintomo**: Script mostra `🔒 PRIVATO` per `exercise-videos` o `exercise-thumbs`

**Soluzione**: 
1. Aprire Supabase Dashboard → Storage → Buckets
2. Cliccare sul bucket
3. Modificare impostazione "Public" a `true`
4. Oppure eseguire:
```sql
UPDATE storage.buckets SET public = true WHERE id IN ('exercise-videos', 'exercise-thumbs');
```

### Problema 3: Colonne duplicate (thumbnail_url e thumb_url)

**Sintomo**: Script mostra `⚠️ INCONSISTENZA: Esistono sia thumbnail_url che thumb_url`

**Soluzione**: 
1. Verificare se ci sono dati in `thumbnail_url` da migrare
2. Eseguire migration per copiare dati da `thumbnail_url` a `thumb_url`
3. Rimuovere colonna `thumbnail_url` se non più necessaria

### Problema 4: RLS policies mancanti

**Sintomo**: Script mostra `⚠️ DA VERIFICARE` per RLS policies

**Soluzione**: Eseguire la migration `supabase/migrations/20250202_fix_storage_exercise_media_policies.sql`

---

## 📊 Report da Generare

Dopo aver eseguito gli script, creare un report con:

1. **Stato Tabella exercises**
   - Colonne presenti
   - Inconsistenze trovate

2. **Stato Bucket Storage**
   - Esistenza bucket
   - Configurazione (pubblico/privato)
   - Limiti dimensione
   - MIME types consentiti

3. **Stato RLS Policies**
   - Policies presenti per storage
   - Policies presenti per tabella exercises
   - Gaps identificati

4. **Raccomandazioni**
   - Azioni da intraprendere prima di modificare il codice
   - Priorità (alta/media/bassa)

---

## ✅ Verifica Finale

Prima di procedere con le modifiche al codice, assicurarsi che:

- [ ] Tabella `exercises` esiste con colonne `video_url` e `thumb_url`
- [ ] Bucket `exercise-videos` esiste ed è **PUBBLICO**
- [ ] Bucket `exercise-thumbs` esiste ed è **PUBBLICO**
- [ ] RLS policies per storage sono configurate correttamente
- [ ] Non ci sono inconsistenze critiche

---

## 📝 Note

- Gli script sono **read-only** (solo SELECT) e non modificano nulla
- Eseguire gli script in ordine (prima verifica completa, poi pubblico/privato)
- Salvare i risultati per riferimento futuro
- Se ci sono errori, risolverli prima di procedere

---

**Ultimo aggiornamento**: 2025-02-02
