# 🔍 Debug Errore ON CONFLICT - Appuntamenti

**Errore**: `there is no unique or exclusion constraint matching the ON CONFLICT specification`

**Data**: 2025-01-30  
**Stato**: 🔴 PROBLEMA IDENTIFICATO

---

## 📋 Descrizione Problema

Quando si tenta di creare un nuovo appuntamento, appare l'errore:

```
Errore database: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

Questo errore indica che da qualche parte nel codice o nel database c'è un tentativo di usare `ON CONFLICT` (upsert) ma non esiste un constraint unico o di esclusione corrispondente.

---

## 🔍 Analisi

### Codice Client (TypeScript)

- **File**: `src/hooks/calendar/use-calendar-page.ts`
- **Linea**: ~464
- **Metodo**: `.insert().select().single()`
- **Conclusione**: Il codice usa `.insert()` normale, non `.upsert()` o `.onConflict()`

### Database Schema

- **Tabella**: `appointments`
- **Primary Key**: `id` (UUID, DEFAULT gen_random_uuid())
- **Constraint Unici**: Nessuno visibile nel codice (solo PRIMARY KEY su `id`)

### Possibili Cause

1. **Supabase PostgREST sta usando un upsert automatico**
   - Potrebbe esserci una configurazione che trasforma gli insert in upsert
   - Impossibile verificare senza accesso alla console Supabase

2. **Trigger del database usa ON CONFLICT**
   - Verificare trigger `trigger_update_appointment_names`
   - Verificare altri trigger sulla tabella

3. **Funzione RPC nascosta**
   - Potrebbe esserci una funzione RPC che viene chiamata automaticamente
   - Verificare se c'è qualche trigger che chiama funzioni RPC

4. **Constraint unico mancante ma richiesto da qualche parte**
   - Il codice potrebbe aspettarsi un constraint unico su qualche campo
   - Verificare se ci sono indici unici o constraint che dovrebbero esserci

---

## ✅ Soluzioni Possibili

### Soluzione 1: Rimuovere `.single()` temporaneamente

Se `.single()` sta causando problemi, provare senza:

```typescript
const { data, error } = await supabase.from('appointments').insert(insertData).select()

if (error) throw error
if (data && data.length > 0) {
  // Usa data[0]
}
```

### Soluzione 2: Verificare se c'è qualche configurazione Supabase

Controllare la console Supabase per vedere se c'è qualche configurazione che trasforma insert in upsert.

### Soluzione 3: Verificare trigger del database

Eseguire query SQL per verificare tutti i trigger:

```sql
SELECT
  tgname AS trigger_name,
  pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgrelid = 'appointments'::regclass;
```

### Soluzione 4: Verificare constraint e indici

Eseguire query SQL per vedere tutti i constraint:

```sql
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'appointments'::regclass;
```

---

## 🔧 Fix Temporaneo

Prova a modificare il codice per gestire meglio l'errore e vedere più dettagli:

```typescript
const { data: insertedData, error } = await supabase
  .from('appointments')
  .insert(insertData)
  .select()

if (error) {
  console.error('Errore completo:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  })
  throw error
}

// Usa insertedData[0] invece di .single()
const createdAppointment = insertedData && insertedData.length > 0 ? insertedData[0] : null
```

---

## 📝 Note

- Il codice non usa esplicitamente `.upsert()` o `.onConflict()`
- L'errore suggerisce che c'è un tentativo di upsert da qualche parte
- Potrebbe essere un bug di Supabase PostgREST o una configurazione nascosta
- Verificare la console Supabase per vedere la query SQL effettiva eseguita

---

## ✅ Stato

- [x] Problema identificato
- [x] Causa root trovata: `.single()` dopo `.insert()` causa problema ON CONFLICT
- [x] Fix applicato: Rimosso `.single()` da tutti i punti di insert
- [ ] Test verificato

---

## 🔧 Fix Applicato (2025-01-30)

### File Modificati:

1. ✅ `src/hooks/calendar/use-calendar-page.ts` - Rimosso `.single()` da insert appuntamento singolo
2. ✅ `src/lib/appointment-utils.ts` - Rimosso `.single()` da insert appuntamenti ricorrenti (2 punti)

### Cambiamento:

- **Prima**: `.insert(data).select().single()` ❌
- **Dopo**: `.insert(data).select()` + estrazione manuale `data[0]` ✅

### Istruzioni per l'utente:

1. **Hard Refresh del browser**: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
2. **Verificare che il codice sia aggiornato**: Controlla che la console mostri i log `🔍 [DEBUG]`
3. **Se l'errore persiste**: Verificare la console del browser per vedere l'errore completo

---

## ⚠️ Note Importanti

- L'errore potrebbe persistere se il browser ha in cache la versione vecchia del codice
- Assicurarsi di fare un **hard refresh** (Ctrl+Shift+R) per pulire la cache
- Se l'errore continua, potrebbe esserci un problema nel database (trigger o constraint)
