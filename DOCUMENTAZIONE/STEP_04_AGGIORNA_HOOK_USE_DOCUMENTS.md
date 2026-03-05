# STEP 4: Aggiornare Hook use-documents

**Fase:** A - Aggiornamento Codice Applicativo (FIX_23)  
**Priorità:** 🔴 Alta  
**Tempo stimato:** 3 minuti  
**Stato:** ✅ Completato

---

## 📋 Obiettivo

Aggiornare l'hook `use-documents.ts` per usare `uploaded_by_profile_id` invece di `uploaded_by_user_id` in:

1. Query Supabase (join con profiles)
2. Mapping dati trasformati

---

## ✅ Modifiche Applicate

**File:** `src/hooks/use-documents.ts`

### Modifica 1: Query Supabase (Riga 46)

```typescript
// PRIMA:
uploaded_by:profiles!uploaded_by_user_id(nome, cognome)

// DOPO:
uploaded_by:profiles!uploaded_by_profile_id(nome, cognome)
```

### Modifica 2: Mapping Dati (Riga 92)

```typescript
// PRIMA:
uploaded_by_user_id: doc.uploaded_by_user_id ?? '',

// DOPO:
uploaded_by_profile_id: doc.uploaded_by_profile_id ?? '',
```

---

## 🔍 Verifica

- ✅ Query Supabase aggiornata
- ✅ Mapping dati aggiornato
- ✅ Nessun errore di linting
- ✅ TypeScript compiler non mostra errori

---

## 📝 Note

- La query Supabase ora fa join corretto con `profiles` usando `uploaded_by_profile_id`
- Il mapping dati ora usa la nuova colonna dal database
- Il tipo `Document` (aggiornato nello STEP 3) è compatibile con queste modifiche

---

## 🎯 Prossimo Step

👉 **STEP 5:** Aggiornare lib `documents.ts`

---

**Data completamento:** 2025-02-01  
**File modificato:** `src/hooks/use-documents.ts`
