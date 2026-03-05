# STEP 9: Test Funzionalità Documenti

**Fase:** A - Aggiornamento Codice Applicativo (FIX_23)  
**Priorità:** 🔴 Alta  
**Tempo stimato:** 10-15 minuti  
**Stato:** ⏳ Da eseguire manualmente

---

## 📋 Obiettivo

Testare tutte le funzionalità relative ai documenti per verificare che l'aggiornamento a `uploaded_by_profile_id` funzioni correttamente.

---

## 🧪 Test da Eseguire

### 1. Test Compilazione TypeScript

**Azione:** Verificare che il codice compili senza errori

**Comando:**

```bash
npm run build
```

**Oppure:**

```bash
npm run type-check
```

**Risultato atteso:**

- ✅ Compilazione senza errori
- ⚠️ Se ci sono errori in `src/lib/supabase/types.ts`, rigenerare i types (vedi STEP 8)

---

### 2. Test Visualizzazione Lista Documenti

**Azione:** Verificare che la lista documenti si carichi correttamente

**Passi:**

1. Avviare l'applicazione: `npm run dev`
2. Navigare alla pagina documenti: `/home/documenti`
3. Verificare che i documenti vengano visualizzati

**Risultato atteso:**

- ✅ Lista documenti caricata correttamente
- ✅ Nessun errore in console
- ✅ Informazioni documento visualizzate correttamente

**Cosa verificare:**

- Nome atleta
- Categoria documento
- Data scadenza
- Stato documento
- Nome di chi ha caricato il documento

---

### 3. Test Caricamento Nuovo Documento

**Azione:** Verificare che il caricamento di un nuovo documento funzioni

**Passi:**

1. Cliccare su "Carica Documento" o pulsante equivalente
2. Selezionare un atleta
3. Selezionare un file (PDF, JPG, PNG)
4. Compilare categoria e altri campi opzionali
5. Cliccare su "Carica"

**Risultato atteso:**

- ✅ File caricato correttamente
- ✅ Documento salvato nel database
- ✅ `uploaded_by_profile_id` popolato correttamente
- ✅ Messaggio di successo visualizzato
- ✅ Documento appare nella lista

**Cosa verificare nel database:**

```sql
SELECT id, athlete_id, uploaded_by_profile_id, created_at
FROM documents
ORDER BY created_at DESC
LIMIT 1;
```

Verificare che:

- ✅ `uploaded_by_profile_id` contenga un UUID valido
- ✅ L'UUID corrisponda al profilo del trainer corrente

---

### 4. Test Visualizzazione Dettagli Documento

**Azione:** Verificare che i dettagli del documento siano visualizzati correttamente

**Passi:**

1. Cliccare su un documento nella lista
2. Verificare tutte le informazioni

**Risultato atteso:**

- ✅ Tutte le informazioni visualizzate correttamente
- ✅ Nome di chi ha caricato il documento visualizzato
- ✅ Nessun errore in console

---

### 5. Test Query Supabase

**Azione:** Verificare che le query Supabase funzionino correttamente

**Test manuale in console browser:**

```javascript
// Aprire console browser (F12)
// Eseguire query di test (se possibile)
```

**Oppure testare direttamente nel codice:**

- Verificare che `useDocuments()` hook funzioni
- Verificare che `getDocuments()` funzione funzioni
- Verificare che join con `profiles` funzioni

**Risultato atteso:**

- ✅ Query eseguite senza errori
- ✅ Join con `profiles` funziona correttamente
- ✅ Dati restituiti correttamente

---

## 🔍 Verifica Database

### Query di Verifica

Eseguire nel Supabase SQL Editor:

```sql
-- Verificare che i nuovi documenti abbiano uploaded_by_profile_id
SELECT
    id,
    athlete_id,
    uploaded_by_profile_id,
    created_at,
    (SELECT nome || ' ' || cognome FROM profiles WHERE id = uploaded_by_profile_id) as uploaded_by_name
FROM documents
ORDER BY created_at DESC
LIMIT 5;
```

**Risultato atteso:**

- ✅ `uploaded_by_profile_id` popolato per tutti i nuovi documenti
- ✅ Join con `profiles` funziona correttamente
- ✅ Nome trainer visualizzato correttamente

---

## ⚠️ Problemi Comuni e Soluzioni

### Problema 1: Errori TypeScript su `types.ts`

**Sintomo:**

```
Property 'uploaded_by_user_id' does not exist on type...
```

**Soluzione:**
Rigenerare i types Supabase:

```bash
npx supabase gen types typescript --project-id [your-project-id] > src/lib/supabase/types.ts
```

---

### Problema 2: Query Supabase fallisce

**Sintomo:**

```
Error: relationship "uploaded_by_user_id" does not exist
```

**Soluzione:**

- Verificare che FIX_23 sia stato applicato al database
- Verificare che la query usi `uploaded_by_profile_id` invece di `uploaded_by_user_id`
- Controllare che la FK esista nel database

---

### Problema 3: Documento caricato ma `uploaded_by_profile_id` è NULL

**Sintomo:**
Il documento viene caricato ma il campo è vuoto.

**Soluzione:**

- Verificare che il profilo trainer esista
- Verificare che `typedProfile.id` contenga un valore valido
- Controllare i log della console per errori

---

## ✅ Checklist Test

- [ ] Compilazione TypeScript senza errori
- [ ] Lista documenti si carica correttamente
- [ ] Caricamento nuovo documento funziona
- [ ] `uploaded_by_profile_id` popolato correttamente nel database
- [ ] Dettagli documento visualizzati correttamente
- [ ] Query Supabase funzionano correttamente
- [ ] Nessun errore in console browser
- [ ] Nessun errore nel log applicazione

---

## 📝 Note

- Se tutti i test passano, procedere con STEP 10 (Commit e Merge)
- Se ci sono problemi, risolverli prima di procedere
- Documentare eventuali problemi riscontrati

---

## 🎯 Prossimo Step

Se tutti i test passano:
👉 **STEP 10:** Commit e merge

---

**Data creazione:** 2025-02-01  
**Nota:** Questo step richiede esecuzione manuale e test dell'applicazione
