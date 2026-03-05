# STEP 5: Aggiornare lib documents.ts

**Fase:** A - Aggiornamento Codice Applicativo (FIX_23)  
**Priorità:** 🔴 Alta  
**Tempo stimato:** 5 minuti  
**Stato:** ✅ Completato

---

## 📋 Obiettivo

Aggiornare tutte le funzioni in `src/lib/documents.ts` per usare `uploaded_by_profile_id` invece di `uploaded_by_user_id` in:

1. Mapping dati (`mapDocument`)
2. Insert documenti (`uploadDocument`)
3. Query Supabase (3 occorrenze in select)

---

## ✅ Modifiche Applicate

**File:** `src/lib/documents.ts`

### Modifica 1: Mapping Dati (Riga 67)

```typescript
// PRIMA:
uploaded_by_user_id: row.uploaded_by_user_id,

// DOPO:
uploaded_by_profile_id: row.uploaded_by_profile_id,
```

### Modifica 2: Insert Documento (Riga 127)

```typescript
// PRIMA:
uploaded_by_user_id: uploadedBy, // Chi carica il documento

// DOPO:
uploaded_by_profile_id: uploadedBy, // Chi carica il documento
```

### Modifica 3-5: Query Supabase (Righe 136, 203, 360)

```typescript
// PRIMA:
uploaded_by:profiles!uploaded_by_user_id(nome, cognome)

// DOPO:
uploaded_by:profiles!uploaded_by_profile_id(nome, cognome)
```

**Occorrenze aggiornate:**

- ✅ `uploadDocument()` - select dopo insert (riga 136)
- ✅ `getDocuments()` - select principale (riga 203)
- ✅ `updateDocument()` - select dopo update (riga 360)

---

## 🔍 Verifica

- ✅ Mapping dati aggiornato
- ✅ Insert documento aggiornato
- ✅ Tutte le query Supabase aggiornate (3 occorrenze)
- ✅ Nessun errore di linting
- ✅ Nessuna occorrenza rimanente di `uploaded_by_user_id`

---

## 📝 Note

- Il parametro della funzione `uploadDocument` rimane `uploadedByUserId` per retrocompatibilità
- Il valore viene comunque inserito correttamente come `uploaded_by_profile_id` nel database
- Tutte le query Supabase ora fanno join corretto con `profiles` usando `uploaded_by_profile_id`

---

## 🎯 Prossimo Step

👉 **STEP 6:** Aggiornare componente `document-uploader-modal.tsx`

---

**Data completamento:** 2025-02-01  
**File modificato:** `src/lib/documents.ts`
