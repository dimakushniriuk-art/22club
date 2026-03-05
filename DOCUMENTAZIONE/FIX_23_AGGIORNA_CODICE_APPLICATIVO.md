# 📝 FIX_23: Aggiornamento Codice Applicativo

**Data:** 2025-02-01  
**Scopo:** Guida per aggiornare il codice applicativo dopo la rinomina di `uploaded_by_user_id` in `uploaded_by_profile_id`

---

## ⚠️ IMPORTANTE

Dopo aver eseguito `FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql`, è necessario aggiornare il codice applicativo per usare il nuovo nome della colonna.

---

## 📋 File da Aggiornare

### 1. `src/types/document.ts`

**Riga 12:**

```typescript
// PRIMA:
uploaded_by_user_id: string

// DOPO:
uploaded_by_profile_id: string
```

### 2. `src/hooks/use-documents.ts`

**Riga 92:**

```typescript
// PRIMA:
uploaded_by_user_id: doc.uploaded_by_user_id ?? '',

// DOPO:
uploaded_by_profile_id: doc.uploaded_by_profile_id ?? '',
```

**Riga 136 (query Supabase):**

```typescript
// PRIMA:
uploaded_by:profiles!uploaded_by_user_id(nome, cognome)

// DOPO:
uploaded_by:profiles!uploaded_by_profile_id(nome, cognome)
```

**Riga 203 (query Supabase):**

```typescript
// PRIMA:
uploaded_by:profiles!uploaded_by_user_id(nome, cognome)

// DOPO:
uploaded_by:profiles!uploaded_by_profile_id(nome, cognome)
```

**Riga 360 (query Supabase):**

```typescript
// PRIMA:
uploaded_by:profiles!uploaded_by_user_id(nome, cognome)

// DOPO:
uploaded_by:profiles!uploaded_by_profile_id(nome, cognome)
```

### 3. `src/lib/documents.ts`

**Riga 67:**

```typescript
// PRIMA:
uploaded_by_user_id: row.uploaded_by_user_id,

// DOPO:
uploaded_by_profile_id: row.uploaded_by_profile_id,
```

**Riga 127:**

```typescript
// PRIMA:
uploaded_by_user_id: uploadedBy, // Chi carica il documento

// DOPO:
uploaded_by_profile_id: uploadedBy, // Chi carica il documento
```

### 4. `src/components/documents/document-uploader-modal.tsx`

**Riga 79 (commento):**

```typescript
// PRIMA:
// Get PT profile to use as uploaded_by_user_id

// DOPO:
// Get PT profile to use as uploaded_by_profile_id
```

**Riga 123:**

```typescript
// PRIMA:
uploaded_by_user_id: typedProfile.id,

// DOPO:
uploaded_by_profile_id: typedProfile.id,
```

### 5. `src/app/home/documenti/page.tsx`

**Riga 40 (commento):**

```typescript
// PRIMA:
// documents.athlete_id e uploaded_by_user_id sono FK a profiles.user_id

// DOPO:
// documents.athlete_id e uploaded_by_profile_id sono FK a profiles.id
```

---

## 🔍 Verifica Post-Aggiornamento

Dopo aver aggiornato il codice, verificare:

1. **Compilazione TypeScript:** `npm run build` o `npm run type-check`
2. **Test funzionalità documenti:**
   - Caricamento documenti
   - Visualizzazione documenti
   - Filtri e ricerca
3. **Query Supabase:** Verificare che le query con join funzionino correttamente

---

## 📝 Note

- La colonna referenzia `profiles.id` (non `profiles.user_id`)
- Il nome `uploaded_by_profile_id` è più chiaro e coerente
- Tutti gli indici vengono rinominati automaticamente da PostgreSQL

---

## ✅ Checklist

- [ ] Eseguito `FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql`
- [ ] Aggiornato `src/types/document.ts`
- [ ] Aggiornato `src/hooks/use-documents.ts`
- [ ] Aggiornato `src/lib/documents.ts`
- [ ] Aggiornato `src/components/documents/document-uploader-modal.tsx`
- [ ] Aggiornato commenti in `src/app/home/documenti/page.tsx`
- [ ] Verificato compilazione TypeScript
- [ ] Testato funzionalità documenti
