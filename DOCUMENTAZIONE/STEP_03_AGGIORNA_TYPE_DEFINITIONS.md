# STEP 3: Aggiornare Type Definitions

**Fase:** A - Aggiornamento Codice Applicativo (FIX_23)  
**Priorità:** 🔴 Alta  
**Tempo stimato:** 2 minuti  
**Stato:** ✅ Completato

---

## 📋 Obiettivo

Aggiornare il tipo TypeScript `Document` per usare `uploaded_by_profile_id` invece di `uploaded_by_user_id`.

---

## ✅ Modifica Applicata

**File:** `src/types/document.ts`

**Riga 12:**

```typescript
// PRIMA:
uploaded_by_user_id: string

// DOPO:
uploaded_by_profile_id: string
```

---

## 🔍 Verifica

Il file è stato aggiornato correttamente. La modifica è stata applicata alla riga 12.

---

## 📝 Note

- Questa modifica aggiorna il tipo TypeScript che viene usato in tutto il codice
- TypeScript compiler mostrerà errori se ci sono altri riferimenti a `uploaded_by_user_id`
- Questi errori ci aiuteranno a trovare tutti i punti da aggiornare

---

## 🎯 Prossimo Step

👉 **STEP 4:** Aggiornare hook `use-documents.ts`

---

**Data completamento:** 2025-02-01  
**File modificato:** `src/types/document.ts`
