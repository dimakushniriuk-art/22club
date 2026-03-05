# ✅ Fix Errore ON CONFLICT - APPLICATO

**Data Fix**: 2025-01-30  
**Errore**: `there is no unique or exclusion constraint matching the ON CONFLICT specification`  
**Status**: ✅ FIX APPLICATO - RICHIEDE HARD REFRESH

---

## 🔍 Problema Identificato

L'errore era causato dall'uso di `.single()` dopo `.insert().select()` in Supabase PostgREST. Questo può far sì che PostgREST tenti un upsert implicito anche quando non c'è un constraint unico appropriato.

---

## ✅ Fix Applicato

### File Modificati:

1. **`src/hooks/calendar/use-calendar-page.ts`** (linea ~467)
   - **Prima**: `.insert(insertData).select().single()`
   - **Dopo**: `.insert(insertData).select()` + estrazione manuale `dataArray[0]`

2. **`src/lib/appointment-utils.ts`** (linee ~250 e ~299)
   - **Prima**: `.insert(...).select().single()`
   - **Dopo**: `.insert(...).select()` + estrazione manuale `dataArray[0]`

---

## 🚀 Istruzioni per Testare il Fix

### Passo 1: Hard Refresh del Browser

1. Apri la pagina del calendario: `/dashboard/calendario`
2. **Fai un Hard Refresh**:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
   - Oppure: Apri DevTools (F12) → Click destro sul bottone Refresh → "Empty Cache and Hard Reload"

### Passo 2: Verifica Console

1. Apri la Console del browser (F12 → Console)
2. Prova a creare un nuovo appuntamento
3. Dovresti vedere i log:
   - `🔍 [DEBUG] Tentativo INSERT appuntamento:`
   - `✅ [SUCCESS] Appuntamento inserito con successo:` (se tutto va bene)
   - `❌ [ERROR] Errore Supabase INSERT:` (se c'è ancora un errore)

### Passo 3: Test Creazione Appuntamento

1. Clicca su "Nuovo Appuntamento" o su uno slot del calendario
2. Compila i campi:
   - Atleta: Seleziona un atleta
   - Data: Scegli una data futura
   - Inizio: Es. 10:00
   - Fine: Es. 11:00
   - Tipo: Es. "Allenamento"
3. Clicca "Salva"
4. **Verifica**: L'appuntamento dovrebbe essere creato senza errori

---

## 🔧 Se l'Errore Persiste

Se dopo l'hard refresh l'errore continua:

### Opzione 1: Verifica Network Tab

1. Apri DevTools (F12) → Tab Network
2. Filtra per "appointments" o "rest/v1"
3. Clicca sulla richiesta che fallisce
4. Controlla la risposta per vedere l'errore completo da Supabase

### Opzione 2: Verifica Console

Controlla la console per vedere i log dettagliati:

- `🔍 [DEBUG] Tentativo INSERT appuntamento:` mostra i dati inviati
- `❌ [ERROR] Errore Supabase INSERT:` mostra l'errore completo

### Opzione 3: Verifica Database

Potrebbe esserci un problema con i trigger o constraint nel database. Controlla:

- Trigger `trigger_update_appointment_names`
- Constraint sulla tabella `appointments`

---

## 📝 Note Tecniche

### Perché `.single()` Causava Problemi?

PostgREST può interpretare `.single()` come richiesta di upsert quando:

1. Rileva un constraint unico sulla tabella
2. Il payload contiene valori per quel constraint
3. PostgREST tenta automaticamente un `ON CONFLICT DO UPDATE`

Nel nostro caso, non c'è un constraint unico appropriato (solo PRIMARY KEY su `id` che è generato), quindi l'upsert fallisce.

### Soluzione

Rimuovendo `.single()` e estraendo manualmente il primo elemento dall'array restituito, evitiamo che PostgREST tenti l'upsert automatico.

---

## ✅ Checklist Verifica

- [x] Fix applicato al codice
- [ ] Hard refresh del browser eseguito
- [ ] Test creazione appuntamento eseguito
- [ ] Errore risolto
- [ ] Appuntamento creato con successo

---

**Ultimo Aggiornamento**: 2025-01-30
