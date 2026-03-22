# 🛠️ Piano di Risoluzione Problemi Verifica Supabase

**Data**: 2025-02-02  
**Priorità**: 🔴 ALTA - Problema bloccante identificato

---

## 🎯 Obiettivo

Risolvere il problema di visualizzazione video nel form di modifica esercizio rendendo il bucket `exercise-videos` pubblico e verificando/correggendo le RLS policies.

---

## 📋 Problemi Identificati

### 🔴 CRITICO: Bucket exercise-videos è PRIVATO

**Impatto**: I video non possono essere visualizzati direttamente nel browser  
**Causa Problema Originale**: Questo è la causa principale del problema "video non visibile dopo caricamento"

### ⚠️ MEDIO: RLS Policies exercise-thumbs da verificare

**Impatto**: Le thumbnail potrebbero non essere accessibili correttamente

---

## 🚀 Piano di Esecuzione

### Step 1: Rendere Bucket exercise-videos PUBBLICO ⚡ PRIORITÀ ALTA

**File**: `docs/FIX_BUCKET_EXERCISE_VIDEOS_PUBLIC.sql`

**Istruzioni**:

1. Aprire Supabase Dashboard
2. Andare su **SQL Editor**
3. Copiare e incollare tutto il contenuto del file `FIX_BUCKET_EXERCISE_VIDEOS_PUBLIC.sql`
4. Cliccare **Run** o premere `Ctrl+Enter`
5. Verificare che il risultato mostri `✅ PUBBLICO - Video accessibili direttamente`

**Tempo Stimato**: 1 minuto

**Risultato Atteso**:

```
Bucket: exercise-videos
Stato: ✅ PUBBLICO - Video accessibili direttamente
```

---

### Step 2: Verificare e Correggere RLS Policies exercise-thumbs ⚡ PRIORITÀ MEDIA

**File**: `docs/VERIFICA_FIX_RLS_EXERCISE_THUMBS.sql`

**Istruzioni**:

1. Aprire Supabase Dashboard
2. Andare su **SQL Editor**
3. Copiare e incollare tutto il contenuto del file `VERIFICA_FIX_RLS_EXERCISE_THUMBS.sql`
4. Cliccare **Run** o premere `Ctrl+Enter`
5. Verificare che tutte le policies siano create correttamente

**Tempo Stimato**: 1 minuto

**Risultato Atteso**:

- ✅ Policy SELECT per accesso pubblico
- ✅ Policy INSERT per trainer/admin
- ✅ Policy UPDATE per trainer/admin
- ✅ Policy DELETE per trainer/admin

---

### Step 3: Verifica Finale

**File**: `docs/VERIFICA_BUCKET_PUBLIC_PRIVATE.sql`

**Istruzioni**:

1. Eseguire lo script di verifica
2. Verificare che entrambi i bucket siano pubblici
3. Verificare che le raccomandazioni siano soddisfatte

**Tempo Stimato**: 30 secondi

**Risultato Atteso**:

```
exercise-videos: ✅ PUBBLICO - Video accessibili direttamente via URL pubblico
exercise-thumbs: ✅ PUBBLICO - Thumbnail accessibili direttamente via URL pubblico
```

---

## ✅ Checklist Post-Risoluzione

Dopo aver eseguito tutti gli step, verificare:

- [ ] Bucket exercise-videos è pubblico
- [ ] Bucket exercise-thumbs è pubblico
- [ ] RLS policies per exercise-thumbs sono presenti e corrette
- [ ] Video sono visualizzabili nel form di modifica esercizio
- [ ] Thumbnail sono visualizzabili correttamente

---

## 🧪 Test da Eseguire

### Test 1: Caricamento Video

1. Aprire il form di modifica esercizio
2. Caricare un video MP4
3. **Verificare**: Il video deve essere visibile immediatamente dopo il caricamento
4. **Verificare**: Il video deve essere riproducibile con i controlli del player

### Test 2: Visualizzazione Video Esistente

1. Aprire il form di modifica esercizio per un esercizio con video esistente
2. **Verificare**: Il video deve essere visualizzato correttamente
3. **Verificare**: Il video deve essere riproducibile

### Test 3: Caricamento Thumbnail

1. Aprire il form di modifica esercizio
2. Caricare una thumbnail
3. **Verificare**: La thumbnail deve essere visualizzata correttamente

---

## 📝 Note Tecniche

### Perché il bucket deve essere pubblico?

**Bucket Privato**:

- Richiede signed URLs per l'accesso
- I video non possono essere visualizzati direttamente nel tag `<video>`
- Serve chiamare `getSignedUrl()` con scadenza

**Bucket Pubblico**:

- I file sono accessibili direttamente via URL pubblico
- I video possono essere visualizzati nel tag `<video>` senza problemi
- `getPublicUrl()` funziona correttamente
- **Sicurezza**: Le RLS policies controllano comunque chi può caricare/eliminare

### Configurazione Finale Attesa

**exercise-videos**:

- ✅ Pubblico: `true`
- ✅ Limite: 50MB
- ✅ MIME types: `video/*`
- ✅ RLS: SELECT pubblico, INSERT/UPDATE/DELETE solo trainer/admin

**exercise-thumbs**:

- ✅ Pubblico: `true`
- ✅ Limite: Illimitato (da limitare a 5MB in futuro)
- ✅ MIME types: Tutti (da limitare a `image/*` in futuro)
- ✅ RLS: SELECT pubblico, INSERT/UPDATE/DELETE solo trainer/admin

---

## ⚠️ Avvertenze

1. **Non modificare manualmente** le RLS policies dopo aver eseguito gli script
2. **Verificare sempre** i risultati degli script prima di procedere
3. **Testare** sempre dopo ogni modifica
4. **Backup**: Gli script sono idempotenti (possono essere eseguiti più volte)

---

## 🔄 Rollback (se necessario)

Se qualcosa va storto, è possibile:

1. **Rendere bucket privato di nuovo**:

```sql
UPDATE storage.buckets SET public = false WHERE id = 'exercise-videos';
```

2. **Ripristinare policies originali**:
   - Eseguire `supabase/migrations/20250202_fix_storage_exercise_media_policies.sql`

---

## 📊 Risultati Attesi

Dopo aver completato tutti gli step:

- ✅ **Problema principale risolto**: Video visibili nel form
- ✅ **Bucket configurati correttamente**: Entrambi pubblici
- ✅ **RLS policies corrette**: Accesso pubblico per lettura, controllato per scrittura
- ✅ **Sistema funzionante**: Caricamento e visualizzazione video operativi

---

**Ultimo aggiornamento**: 2025-02-02
