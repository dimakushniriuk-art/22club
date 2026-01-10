# STEP 8B: Rigenera Types Supabase

**Fase:** A - Aggiornamento Codice Applicativo (FIX_23)  
**Priorità:** 🔴 **CRITICA** (necessario per risolvere errori TypeScript)  
**Tempo stimato:** 5 minuti  
**Stato:** ⏳ Da eseguire

---

## 📋 Obiettivo

Rigenerare il file `src/lib/supabase/types.ts` dal database aggiornato per risolvere gli errori TypeScript.

---

## ⚠️ Problema Rilevato

**Errori TypeScript trovati:**

```
src/hooks/use-documents.ts(92,41): error TS2339: Property 'uploaded_by_profile_id' does not exist on type 'DocumentWithRelations'.
src/lib/documents.ts(67,33): error TS2339: Property 'uploaded_by_profile_id' does not exist on type 'DocumentWithRelations'.
src/lib/documents.ts(123,8): error TS2769: No overload matches this call...
```

**Causa:**

- Il file `src/lib/supabase/types.ts` è generato automaticamente dal database
- Contiene ancora `uploaded_by_user_id` perché non è stato rigenerato dopo FIX_23
- Il codice usa `uploaded_by_profile_id` ma i types si aspettano `uploaded_by_user_id`

---

## ✅ Prerequisiti

**IMPORTANTE:** Assicurati che FIX_23 sia stato applicato al database!

**Verifica:**

```sql
-- Eseguire nel Supabase SQL Editor
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'documents'
  AND column_name IN ('uploaded_by_user_id', 'uploaded_by_profile_id');
```

**Risultato atteso:**

- ✅ Solo `uploaded_by_profile_id` presente
- ❌ `uploaded_by_user_id` NON presente

---

## 🚀 Istruzioni Esecuzione

### Opzione 1: Database Remoto (Raccomandato)

**Script disponibile:**

```bash
npm run supabase:gen:types:remote
```

**Oppure manualmente:**

```bash
# 1. Assicurati di essere loggato
npx supabase login

# 2. Link al progetto (se non già fatto)
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. Genera types dal database remoto
npx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

---

### Opzione 2: Database Locale

**Script disponibile:**

```bash
npm run supabase:gen:types
```

**Oppure manualmente:**

```bash
# 1. Avvia Supabase locale (se non già avviato)
npx supabase start

# 2. Genera types dal database locale
npx supabase gen types typescript --local > src/lib/supabase/types.ts
```

---

### Opzione 3: Con Project ID Diretto

**Script disponibile:**

```bash
npm run supabase:gen:types:direct
```

**Oppure manualmente:**

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```

**⚠️ Nota:** Sostituisci `YOUR_PROJECT_ID` con il tuo project ID Supabase.

---

## 🔍 Verifica Post-Rigenerazione

### 1. Verifica File Aggiornato

**Controlla che il file contenga `uploaded_by_profile_id`:**

```bash
grep -n "uploaded_by_profile_id" src/lib/supabase/types.ts
```

**Risultato atteso:**

- ✅ Vedi `uploaded_by_profile_id` nel file
- ❌ NON vedi `uploaded_by_user_id` (o solo in commenti/relazioni legacy)

---

### 2. Verifica Errori TypeScript

**Esegui typecheck:**

```bash
npm run typecheck
```

**Risultato atteso:**

- ✅ Nessun errore TypeScript
- ✅ Tutti gli errori precedenti risolti

---

### 3. Verifica Compilazione

**Esegui build:**

```bash
npm run build
```

**Risultato atteso:**

- ✅ Compilazione senza errori
- ✅ Build completata con successo

---

## 📝 Note Importanti

1. **Backup:** Il file `types.ts` verrà sovrascritto. Se hai modifiche personali, salvalle prima.

2. **Database aggiornato:** Assicurati che FIX_23 sia stato applicato al database prima di rigenerare.

3. **Project ID:** Se usi l'opzione 3, trova il Project ID nel dashboard Supabase:
   - Dashboard → Settings → General → Reference ID

4. **File generato:** Non modificare manualmente `src/lib/supabase/types.ts` - viene rigenerato automaticamente.

---

## ⚠️ Troubleshooting

### Problema 1: "Project not linked"

**Errore:**

```
Error: Project not linked. Run `supabase link` first.
```

**Soluzione:**

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

---

### Problema 2: "Not authenticated"

**Errore:**

```
Error: Not authenticated. Run `supabase login` first.
```

**Soluzione:**

```bash
npx supabase login
```

---

### Problema 3: Types ancora con `uploaded_by_user_id`

**Causa:** Database non aggiornato con FIX_23

**Soluzione:**

1. Verifica che FIX_23 sia stato applicato al database
2. Esegui `docs/FIX_23_RINOMINA_UPLOADED_BY_USER_ID.sql` se necessario
3. Rigenera i types

---

### Problema 4: Errori TypeScript dopo rigenerazione

**Possibili cause:**

- File types non aggiornato correttamente
- Cache TypeScript non aggiornata

**Soluzione:**

```bash
# Pulisci cache
rm -rf .next
rm -rf node_modules/.cache

# Rigenera types
npm run supabase:gen:types:remote

# Ricompila
npm run typecheck
```

---

## ✅ Checklist

- [ ] FIX_23 applicato al database (verificato)
- [ ] Types rigenerati dal database aggiornato
- [ ] File `types.ts` contiene `uploaded_by_profile_id`
- [ ] File `types.ts` NON contiene `uploaded_by_user_id` (o solo in relazioni legacy)
- [ ] `npm run typecheck` senza errori
- [ ] `npm run build` senza errori

---

## 🎯 Prossimo Step

Dopo aver risolto gli errori TypeScript:
👉 **STEP 9:** Test funzionalità documenti

---

**Data creazione:** 2025-02-01  
**Prerequisito:** FIX_23 applicato al database ✅
