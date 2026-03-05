# 📋 Piano Completo - Problemi Opzionali Rimanenti

**Data creazione:** 2025-02-01  
**Stato:** 2 problemi opzionali rimanenti  
**Priorità:** Media-Bassa (database già funzionante)

---

## 🎯 Obiettivo

Completare gli ultimi 2 problemi opzionali:

1. **Migrazione Storage Legacy** (FIX_19, FIX_20)
2. **Aggiornamento Codice Applicativo** (post FIX_23)

---

## 📊 Riepilogo Stato Attuale

✅ **Completati:**

- 18 fix esecutivi (12 critici + 6 opzionali)
- Standardizzazione colonne (FIX_18)
- Ottimizzazione indici (FIX_16)
- FK workout_plans (FIX_21, FIX_22)
- Rinomina colonna documents (FIX_23) - **Database aggiornato**

⏳ **Rimanenti:**

- Migrazione Storage Legacy (FIX_19, FIX_20)
- Aggiornamento codice applicativo (post FIX_23)

---

## 🚀 PIANO COMPLETO STEP-BY-STEP

### **FASE A: Aggiornamento Codice Applicativo (FIX_23)**

**Priorità:** 🔴 **ALTA** (necessario per funzionamento applicazione)  
**Tempo stimato:** 30-45 minuti  
**Rischio:** 🟢 Basso

---

#### **STEP 1: Verifica stato database**

**Azione:** Verificare che FIX_23 sia stato applicato correttamente

**Script da eseguire:**

```sql
-- Eseguire: docs/FIX_23_VERIFICA_FINALE.sql
```

**Risultato atteso:**

- ✅ Colonna `uploaded_by_profile_id` esiste in `documents`
- ✅ FK `documents_uploaded_by_profile_id_fkey` esiste
- ✅ Colonna `uploaded_by_user_id` NON esiste più

**Sezione:** A.1  
**File:** `docs/FIX_23_VERIFICA_FINALE.sql`

---

#### **STEP 2: Backup codice applicativo**

**Azione:** Creare branch Git per le modifiche

**Comandi:**

```bash
git checkout -b fix/update-uploaded-by-profile-id
git status
```

**Sezione:** A.2  
**Nota:** Assicurarsi di essere su un branch separato prima di modificare il codice

---

#### **STEP 3: Aggiornare type definitions**

**Azione:** Aggiornare il tipo TypeScript per `Document`

**File da modificare:** `src/types/document.ts`

**Modifiche:**

- Cercare: `uploaded_by_user_id`
- Sostituire con: `uploaded_by_profile_id`

**Sezione:** A.3  
**File:** `src/types/document.ts`  
**Guida:** `docs/FIX_23_AGGIORNA_CODICE_APPLICATIVO.md` (linee 20-40)

---

#### **STEP 4: Aggiornare hook use-documents**

**Azione:** Aggiornare l'hook che gestisce i documenti

**File da modificare:** `src/hooks/use-documents.ts`

**Modifiche:**

- Cercare tutte le occorrenze di `uploaded_by_user_id`
- Sostituire con `uploaded_by_profile_id`
- Verificare query e mutazioni

**Sezione:** A.4  
**File:** `src/hooks/use-documents.ts`  
**Guida:** `docs/FIX_23_AGGIORNA_CODICE_APPLICATIVO.md` (linee 42-65)

---

#### **STEP 5: Aggiornare lib documents**

**Azione:** Aggiornare le funzioni di libreria per i documenti

**File da modificare:** `src/lib/documents.ts`

**Modifiche:**

- Cercare tutte le occorrenze di `uploaded_by_user_id`
- Sostituire con `uploaded_by_profile_id`
- Verificare funzioni di inserimento/aggiornamento

**Sezione:** A.5  
**File:** `src/lib/documents.ts`  
**Guida:** `docs/FIX_23_AGGIORNA_CODICE_APPLICATIVO.md` (linee 67-90)

---

#### **STEP 6: Aggiornare componente document-uploader-modal**

**Azione:** Aggiornare il componente di upload documenti

**File da modificare:** `src/components/documents/document-uploader-modal.tsx`

**Modifiche:**

- Cercare tutte le occorrenze di `uploaded_by_user_id`
- Sostituire con `uploaded_by_profile_id`
- Verificare logica di upload

**Sezione:** A.6  
**File:** `src/components/documents/document-uploader-modal.tsx`  
**Guida:** `docs/FIX_23_AGGIORNA_CODICE_APPLICATIVO.md` (linee 92-115)

---

#### **STEP 7: Aggiornare pagina documenti**

**Azione:** Aggiornare la pagina principale dei documenti

**File da modificare:** `src/app/home/documenti/page.tsx`

**Modifiche:**

- Cercare tutte le occorrenze di `uploaded_by_user_id`
- Sostituire con `uploaded_by_profile_id`
- Verificare query e rendering

**Sezione:** A.7  
**File:** `src/app/home/documenti/page.tsx`  
**Guida:** `docs/FIX_23_AGGIORNA_CODICE_APPLICATIVO.md` (linee 117-140)

---

#### **STEP 8: Verifica globale codice**

**Azione:** Cercare altre occorrenze nel codebase

**Comando:**

```bash
# Cercare tutte le occorrenze rimanenti
grep -r "uploaded_by_user_id" src/
```

**Risultato atteso:**

- ✅ Nessuna occorrenza trovata (o solo commenti/documentazione)

**Sezione:** A.8  
**Nota:** Se vengono trovate occorrenze, aggiornarle seguendo lo stesso pattern

---

#### **STEP 9: Test funzionalità documenti**

**Azione:** Testare le funzionalità dei documenti nell'applicazione

**Test da eseguire:**

1. ✅ Visualizzare lista documenti
2. ✅ Caricare nuovo documento
3. ✅ Visualizzare dettagli documento
4. ✅ Verificare che `uploaded_by_profile_id` sia popolato correttamente

**Sezione:** A.9  
**Ambiente:** Sviluppo locale

---

#### **STEP 10: Commit e merge**

**Azione:** Committare le modifiche e fare merge

**Comandi:**

```bash
git add .
git commit -m "fix: aggiorna uploaded_by_user_id a uploaded_by_profile_id (FIX_23)"
git checkout main  # o master
git merge fix/update-uploaded-by-profile-id
```

**Sezione:** A.10  
**Nota:** Verificare che tutti i test passino prima del merge

---

### **FASE B: Migrazione Storage Legacy (FIX_19, FIX_20)**

**Priorità:** 🟡 **MEDIA** (ottimizzazione, non critico)  
**Tempo stimato:** 1-2 giorni  
**Rischio:** 🟡 Medio (richiede migrazione file fisici)

---

#### **STEP 11: Analisi bucket storage**

**Azione:** Eseguire analisi completa dei bucket duplicati

**Script da eseguire:**

```sql
-- Eseguire: docs/FIX_19_MIGRAZIONE_STORAGE_LEGACY.sql
```

**Risultato atteso:**

- Report dettagliato bucket `documents` vs `athlete-documents`
- Report dettagliato bucket `progress-photos` vs `athlete-progress-photos`
- Conteggio file per bucket
- Dimensione totale per bucket

**Sezione:** B.1  
**File:** `docs/FIX_19_MIGRAZIONE_STORAGE_LEGACY.sql`

---

#### **STEP 12: Verifica utilizzo bucket nel codice**

**Azione:** Verificare quale bucket è utilizzato dal codice applicativo

**Comandi:**

```bash
# Cercare riferimenti ai bucket nel codice
grep -r "documents" src/ --include="*.ts" --include="*.tsx"
grep -r "athlete-documents" src/ --include="*.ts" --include="*.tsx"
grep -r "progress-photos" src/ --include="*.ts" --include="*.tsx"
grep -r "athlete-progress-photos" src/ --include="*.ts" --include="*.tsx"
```

**Risultato atteso:**

- Identificare quale bucket è utilizzato attivamente
- Identificare quale bucket è legacy (non utilizzato)

**Sezione:** B.2  
**Nota:** Documentare i risultati per la decisione successiva

---

#### **STEP 13: Decisione bucket da mantenere**

**Azione:** Decidere quale bucket mantenere per ogni coppia

**Decisioni da prendere:**

**Per documenti:**

- [ ] Mantenere `documents` (legacy)
- [ ] Mantenere `athlete-documents` (nuovo)
- [ ] **Raccomandazione:** `athlete-documents` (più specifico e organizzato)

**Per progress photos:**

- [ ] Mantenere `progress-photos` (legacy)
- [ ] Mantenere `athlete-progress-photos` (nuovo)
- [ ] **Raccomandazione:** `athlete-progress-photos` (più specifico e organizzato)

**Sezione:** B.3  
**Nota:** Documentare le decisioni prese

---

#### **STEP 14: Backup storage e database**

**Azione:** Creare backup completo prima della migrazione

**Backup da eseguire:**

1. ✅ Backup database Supabase (dashboard → Settings → Database → Backups)
2. ✅ Export file storage (se possibile, o documentare file critici)
3. ✅ Snapshot database corrente

**Sezione:** B.4  
**Nota:** ⚠️ **CRITICO** - Non procedere senza backup

---

#### **STEP 15: Migrazione file fisici (documents)**

**Azione:** Migrare file da `documents` a `athlete-documents`

**Opzioni:**

**Opzione A: Script Supabase Storage API**

- Creare script Node.js/TypeScript per migrare file
- Utilizzare Supabase Storage API per copiare file

**Opzione B: Dashboard Supabase**

- Migrare manualmente file per file (solo se pochi file)

**Opzione C: Supabase CLI**

- Utilizzare CLI per migrazione batch

**Sezione:** B.5  
**Nota:** ⚠️ Richiede script personalizzato o migrazione manuale  
**File da creare:** `scripts/migrate-storage-documents.ts` (opzionale)

---

#### **STEP 16: Migrazione file fisici (progress-photos)**

**Azione:** Migrare file da `progress-photos` a `athlete-progress-photos`

**Opzioni:**

- Stesse opzioni dello STEP 15

**Sezione:** B.6  
**Nota:** ⚠️ Richiede script personalizzato o migrazione manuale  
**File da creare:** `scripts/migrate-storage-progress-photos.ts` (opzionale)

---

#### **STEP 17: Verifica migrazione file**

**Azione:** Verificare che tutti i file siano stati migrati correttamente

**Verifiche:**

1. ✅ Contare file nel bucket legacy
2. ✅ Contare file nel bucket nuovo
3. ✅ Verificare che numero file corrisponda
4. ✅ Verificare dimensioni file corrispondano
5. ✅ Testare accesso a file campione nel bucket nuovo

**Sezione:** B.7  
**Script:** Eseguire nuovamente `FIX_19_MIGRAZIONE_STORAGE_LEGACY.sql` per confronto

---

#### **STEP 18: Aggiornamento URL nel database**

**Azione:** Aggiornare tutti gli URL nel database dopo migrazione file

**Script da eseguire:**

```sql
-- Eseguire: docs/FIX_20_AGGIORNAMENTO_URL_STORAGE.sql
```

**Risultato atteso:**

- ✅ URL in `documents.url` aggiornati da `documents/` a `athlete-documents/`
- ✅ URL in `progress_photos.image_url` aggiornati da `progress-photos/` a `athlete-progress-photos/`
- ✅ Report di record aggiornati

**Sezione:** B.8  
**File:** `docs/FIX_20_AGGIORNAMENTO_URL_STORAGE.sql`  
**Nota:** ⚠️ Eseguire DOPO migrazione file fisici (STEP 15-16)

---

#### **STEP 19: Verifica aggiornamento URL**

**Azione:** Verificare che tutti gli URL siano stati aggiornati correttamente

**Query di verifica:**

```sql
-- Verificare URL legacy rimanenti
SELECT COUNT(*) FROM documents
WHERE url LIKE '%/storage/v1/object/public/documents/%';

SELECT COUNT(*) FROM progress_photos
WHERE image_url LIKE '%/storage/v1/object/public/progress-photos/%';
```

**Risultato atteso:**

- ✅ 0 URL legacy rimanenti

**Sezione:** B.9  
**Nota:** Se ci sono URL legacy rimanenti, verificare manualmente

---

#### **STEP 20: Aggiornamento codice applicativo (storage)**

**Azione:** Aggiornare riferimenti ai bucket nel codice

**File da modificare:**

- Cercare tutti i riferimenti a `documents` bucket
- Cercare tutti i riferimenti a `progress-photos` bucket
- Sostituire con `athlete-documents` e `athlete-progress-photos`

**Comandi:**

```bash
# Cercare riferimenti
grep -r "documents" src/ --include="*.ts" --include="*.tsx" | grep -i bucket
grep -r "progress-photos" src/ --include="*.ts" --include="*.tsx" | grep -i bucket
```

**Sezione:** B.10  
**Nota:** Aggiornare solo riferimenti ai bucket, non agli URL nel database

---

#### **STEP 21: Test funzionalità storage**

**Azione:** Testare tutte le funzionalità che utilizzano storage

**Test da eseguire:**

1. ✅ Caricare nuovo documento
2. ✅ Visualizzare documento esistente
3. ✅ Caricare nuova progress photo
4. ✅ Visualizzare progress photo esistente
5. ✅ Verificare che file siano nel bucket corretto

**Sezione:** B.11  
**Ambiente:** Sviluppo locale

---

#### **STEP 22: Rimozione bucket legacy**

**Azione:** Rimuovere bucket legacy dopo verifica completa

**⚠️ ATTENZIONE:** Eseguire SOLO dopo:

- ✅ Migrazione file completata (STEP 15-16)
- ✅ URL database aggiornati (STEP 18)
- ✅ Codice applicativo aggiornato (STEP 20)
- ✅ Test completati con successo (STEP 21)
- ✅ Verifica in produzione (se applicabile)

**Azione:**

1. Dashboard Supabase → Storage
2. Selezionare bucket legacy (`documents` o `progress-photos`)
3. Verificare che sia vuoto o contenere solo file non referenziati
4. Eliminare bucket

**Sezione:** B.12  
**Nota:** ⚠️ **IRREVERSIBILE** - Verificare tutto prima di eliminare

---

#### **STEP 23: Verifica finale storage**

**Azione:** Verifica finale completa del sistema storage

**Query di verifica:**

```sql
-- Verificare bucket esistenti
SELECT name, public, created_at
FROM storage.buckets
WHERE name IN ('documents', 'athlete-documents', 'progress-photos', 'athlete-progress-photos')
ORDER BY name;

-- Verificare file nei bucket
SELECT bucket_id, COUNT(*) as file_count
FROM storage.objects
WHERE bucket_id IN ('athlete-documents', 'athlete-progress-photos')
GROUP BY bucket_id;

-- Verificare URL nel database
SELECT
    'documents' as tabella,
    COUNT(*) as totali,
    COUNT(*) FILTER (WHERE url LIKE '%athlete-documents%') as url_corretti,
    COUNT(*) FILTER (WHERE url LIKE '%documents%' AND url NOT LIKE '%athlete-documents%') as url_legacy
FROM documents
UNION ALL
SELECT
    'progress_photos' as tabella,
    COUNT(*) as totali,
    COUNT(*) FILTER (WHERE image_url LIKE '%athlete-progress-photos%') as url_corretti,
    COUNT(*) FILTER (WHERE image_url LIKE '%progress-photos%' AND image_url NOT LIKE '%athlete-progress-photos%') as url_legacy
FROM progress_photos;
```

**Risultato atteso:**

- ✅ Solo bucket nuovi esistono (o bucket legacy vuoti)
- ✅ Tutti i file nei bucket nuovi
- ✅ 0 URL legacy nel database

**Sezione:** B.13  
**Nota:** Se tutto è corretto, migrazione completata con successo

---

## 📊 Riepilogo Numerazione

### **FASE A: Aggiornamento Codice Applicativo (FIX_23)**

- **STEP 1:** Verifica stato database
- **STEP 2:** Backup codice applicativo
- **STEP 3:** Aggiornare type definitions
- **STEP 4:** Aggiornare hook use-documents
- **STEP 5:** Aggiornare lib documents
- **STEP 6:** Aggiornare componente document-uploader-modal
- **STEP 7:** Aggiornare pagina documenti
- **STEP 8:** Verifica globale codice
- **STEP 9:** Test funzionalità documenti
- **STEP 10:** Commit e merge

### **FASE B: Migrazione Storage Legacy (FIX_19, FIX_20)**

- **STEP 11:** Analisi bucket storage
- **STEP 12:** Verifica utilizzo bucket nel codice
- **STEP 13:** Decisione bucket da mantenere
- **STEP 14:** Backup storage e database
- **STEP 15:** Migrazione file fisici (documents)
- **STEP 16:** Migrazione file fisici (progress-photos)
- **STEP 17:** Verifica migrazione file
- **STEP 18:** Aggiornamento URL nel database
- **STEP 19:** Verifica aggiornamento URL
- **STEP 20:** Aggiornamento codice applicativo (storage)
- **STEP 21:** Test funzionalità storage
- **STEP 22:** Rimozione bucket legacy
- **STEP 23:** Verifica finale storage

---

## ✅ Checklist Completa

### FASE A: Aggiornamento Codice Applicativo

- [ ] STEP 1: Verifica stato database
- [ ] STEP 2: Backup codice applicativo
- [ ] STEP 3: Aggiornare type definitions
- [ ] STEP 4: Aggiornare hook use-documents
- [ ] STEP 5: Aggiornare lib documents
- [ ] STEP 6: Aggiornare componente document-uploader-modal
- [ ] STEP 7: Aggiornare pagina documenti
- [ ] STEP 8: Verifica globale codice
- [ ] STEP 9: Test funzionalità documenti
- [ ] STEP 10: Commit e merge

### FASE B: Migrazione Storage Legacy

- [ ] STEP 11: Analisi bucket storage
- [ ] STEP 12: Verifica utilizzo bucket nel codice
- [ ] STEP 13: Decisione bucket da mantenere
- [ ] STEP 14: Backup storage e database
- [ ] STEP 15: Migrazione file fisici (documents)
- [ ] STEP 16: Migrazione file fisici (progress-photos)
- [ ] STEP 17: Verifica migrazione file
- [ ] STEP 18: Aggiornamento URL nel database
- [ ] STEP 19: Verifica aggiornamento URL
- [ ] STEP 20: Aggiornamento codice applicativo (storage)
- [ ] STEP 21: Test funzionalità storage
- [ ] STEP 22: Rimozione bucket legacy
- [ ] STEP 23: Verifica finale storage

---

## 🎯 Priorità Esecuzione

**Raccomandazione:**

1. **PRIMA:** Completare FASE A (STEP 1-10) - Necessario per funzionamento applicazione
2. **POI:** Completare FASE B (STEP 11-23) - Ottimizzazione, può essere fatto quando si ha tempo

---

## ⚠️ Note Importanti

1. **Backup sempre:** Fare backup prima di ogni modifica importante
2. **Test in sviluppo:** Testare sempre in ambiente di sviluppo prima di produzione
3. **Deployment graduale:** Applicare modifiche gradualmente
4. **Verifiche continue:** Verificare ogni step prima di procedere al successivo
5. **Documentazione:** Documentare tutte le decisioni prese

---

## 📚 File di Riferimento

- `docs/FIX_23_AGGIORNA_CODICE_APPLICATIVO.md` - Guida dettagliata aggiornamento codice
- `docs/FIX_23_VERIFICA_FINALE.sql` - Verifica stato database FIX_23
- `docs/FIX_19_MIGRAZIONE_STORAGE_LEGACY.sql` - Analisi bucket storage
- `docs/FIX_20_AGGIORNAMENTO_URL_STORAGE.sql` - Aggiornamento URL database
- `docs/DOCUMENTAZIONE_COMPLETA_TRAINER_ATLETA.md` - Documentazione completa database

---

**Ultimo aggiornamento:** 2025-02-01  
**Versione:** 1.0
