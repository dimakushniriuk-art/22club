# STEP 6: Aggiornare Componente document-uploader-modal

**Fase:** A - Aggiornamento Codice Applicativo (FIX_23)  
**Priorità:** 🔴 Alta  
**Tempo stimato:** 3 minuti  
**Stato:** ✅ Completato

---

## 📋 Obiettivo

Aggiornare il componente `document-uploader-modal.tsx` per usare `uploaded_by_profile_id` invece di `uploaded_by_user_id` in:

1. Commento esplicativo
2. Campo insert nel database

---

## ✅ Modifiche Applicate

**File:** `src/components/documents/document-uploader-modal.tsx`

### Modifica 1: Commento (Riga 79)

```typescript
// PRIMA:
// Get PT profile to use as uploaded_by_user_id

// DOPO:
// Get PT profile to use as uploaded_by_profile_id
```

### Modifica 2: Insert Database (Riga 123)

```typescript
// PRIMA:
uploaded_by_user_id: typedProfile.id,

// DOPO:
uploaded_by_profile_id: typedProfile.id,
```

---

## 🔍 Verifica

- ✅ Commento aggiornato
- ✅ Campo insert aggiornato
- ✅ Nessun errore di linting
- ✅ Nessuna occorrenza rimanente di `uploaded_by_user_id`

---

## 📝 Note

- Il componente ora inserisce correttamente `uploaded_by_profile_id` nel database
- Il profilo viene recuperato correttamente da `profiles.id` (non più da `profiles.user_id`)
- Il componente è compatibile con il tipo `Document` aggiornato

---

## 🎯 Prossimo Step

👉 **STEP 7:** Aggiornare pagina `documenti/page.tsx`

---

**Data completamento:** 2025-02-01  
**File modificato:** `src/components/documents/document-uploader-modal.tsx`
