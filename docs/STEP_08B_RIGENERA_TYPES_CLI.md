# STEP 8B: Rigenera Types Supabase (Metodo CLI)

**Fase:** A - Aggiornamento Codice Applicativo (FIX_23)  
**Priorità:** 🔴 **CRITICA**  
**Tempo stimato:** 5 minuti  
**Stato:** ⏳ Da eseguire

---

## 📋 Obiettivo

Rigenerare il file `src/lib/supabase/types.ts` dal database aggiornato usando il CLI Supabase.

---

## ✅ Prerequisiti Verificati

- ✅ Database aggiornato: solo `uploaded_by_profile_id` presente
- ✅ FIX_23 applicato correttamente

---

## 🚀 Istruzioni Esecuzione

### Metodo 1: Con Project ID (Più Semplice)

**Comando:**

```bash
npx supabase gen types typescript --project-id icibqnmtacibgnhaidlz > src/lib/supabase/types.ts
```

**⚠️ Nota:** Potrebbe richiedere autenticazione. Se chiede il token, vedi Metodo 2.

---

### Metodo 2: Con Access Token

**1. Ottieni l'Access Token:**

- Vai su: https://supabase.com/dashboard/account/tokens
- Clicca su "Generate new token"
- Copia il token (formato: `sbp_...`)

**2. Imposta il token (PowerShell):**

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_tuo-token-qui"
```

**3. Genera i types:**

```bash
npx supabase gen types typescript --project-id icibqnmtacibgnhaidlz > src/lib/supabase/types.ts
```

---

### Metodo 3: Con Login Interattivo

**1. Login:**

```bash
npx supabase login
```

Ti aprirà il browser per autenticarti.

**2. Genera i types:**

```bash
npx supabase gen types typescript --project-id icibqnmtacibgnhaidlz > src/lib/supabase/types.ts
```

---

## 🔍 Verifica Post-Rigenerazione

### 1. Verifica che contenga `uploaded_by_profile_id`

**Comando:**

```bash
grep -n "uploaded_by_profile_id" src/lib/supabase/types.ts
```

**Risultato atteso:**

- ✅ Vedi `uploaded_by_profile_id` nel file
- ✅ Appare nelle definizioni Row, Insert, Update

---

### 2. Verifica che NON contenga `uploaded_by_user_id` (o solo in relazioni legacy)

**Comando:**

```bash
grep -n "uploaded_by_user_id" src/lib/supabase/types.ts
```

**Risultato atteso:**

- ✅ Nessuna occorrenza, OPPURE
- ✅ Solo in relazioni legacy (foreignKeyName) che possono rimanere

---

### 3. Verifica Errori TypeScript

**Comando:**

```bash
npm run typecheck
```

**Risultato atteso:**

- ✅ Nessun errore TypeScript
- ✅ Tutti gli errori precedenti risolti

---

### 4. Verifica Compilazione

**Comando:**

```bash
npm run build
```

**Risultato atteso:**

- ✅ Compilazione senza errori
- ✅ Build completata con successo

---

## ⚠️ Troubleshooting

### Problema: "Unauthorized" o "Not authenticated"

**Soluzione:**
Usa il Metodo 2 o Metodo 3 per autenticarti.

---

### Problema: "Project not found"

**Soluzione:**
Verifica che il project ID sia corretto: `icibqnmtacibgnhaidlz`

---

### Problema: Types ancora con `uploaded_by_user_id`

**Causa:** Cache o database non aggiornato

**Soluzione:**

1. Verifica che FIX_23 sia stato applicato (già verificato ✅)
2. Riprova a generare i types
3. Verifica che il file sia stato sovrascritto correttamente

---

## ✅ Checklist

- [ ] Types rigenerati dal database aggiornato
- [ ] File `types.ts` contiene `uploaded_by_profile_id`
- [ ] File `types.ts` NON contiene `uploaded_by_user_id` (o solo in relazioni)
- [ ] `npm run typecheck` senza errori
- [ ] `npm run build` senza errori

---

## 🎯 Prossimo Step

Dopo aver risolto gli errori TypeScript:
👉 **STEP 9:** Test funzionalità documenti

---

**Data creazione:** 2025-02-01  
**Project ID:** icibqnmtacibgnhaidlz
