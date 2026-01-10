# 📋 STEP 2 — SQL DI CONTROLLO DATABASE
**Data**: 2025-01-27  
**File**: `PAGE_AUDIT_STEP2_SQL_CONTROLLO.sql`

---

## 🎯 OBIETTIVO

Verificare lo stato attuale del database Supabase per:
- Schema tabelle (`appointments`, `profiles`)
- Foreign Keys e vincoli
- Indicii esistenti e utilizzo
- RLS Policies attuali (critico!)
- Permessi e grants
- Integrità dati (orphan rows, duplicati, anomalie)
- Performance query (EXPLAIN)
- Cardinalità e statistiche

---

## 📝 ISTRUZIONI ESECUZIONE

### 1. Accedi a Supabase Dashboard
- Vai su https://supabase.com/dashboard
- Seleziona il progetto
- Vai a **SQL Editor**

### 2. Esegui lo Script
- Copia il contenuto di `PAGE_AUDIT_STEP2_SQL_CONTROLLO.sql`
- Incolla nello SQL Editor
- Clicca **Run** (o premi `Ctrl+Enter`)

### 3. Salva i Risultati
Per ogni sezione (1-11), salva:
- **Screenshot** dei risultati, oppure
- **Export CSV** (se disponibile), oppure
- **Copia testo** dei risultati in file separati

---

## 🔍 COSA CERCARE NEI RISULTATI

### ✅ SEZIONE 1: Schema Tabelle
**Cosa verificare:**
- Tutte le colonne esistono? (`org_id`, `status`, `staff_id`, `athlete_id`, ecc.)
- Tipo dati corretto? (`UUID`, `TIMESTAMP WITH TIME ZONE`, `TEXT`)
- Default values presenti?

**Problemi da segnalare:**
- ❌ Colonne mancanti
- ❌ Tipo dati errato
- ❌ Default mancanti dove necessari

---

### ✅ SEZIONE 2: Foreign Keys
**Cosa verificare:**
- FK `athlete_id → profiles(id)` esiste?
- FK `staff_id → profiles(id)` esiste?
- `ON DELETE` rule corretta? (CASCADE vs SET NULL)

**Problemi da segnalare:**
- ❌ FK mancanti
- ❌ `ON DELETE` rule errata

---

### ✅ SEZIONE 3: Indicii
**Cosa verificare:**
- Indici su colonne usate in WHERE (`staff_id`, `starts_at`, `cancelled_at`)
- Indici compositi per query comuni (`staff_id, starts_at`)
- Indicii non utilizzati (`idx_scan = 0`)

**Problemi da segnalare:**
- ❌ Indicii mancanti per query dashboard
- ⚠️ Indicii non utilizzati (candidati per rimozione)

---

### ✅ SEZIONE 4: RLS Policies ⚠️ CRITICO
**Cosa verificare:**
- RLS è **ATTIVO** o **DISABILITATO**?
- Policies hanno `USING(true)` o filtri specifici?
- Esistono filtri per `org_id` o `staff_id`?

**Problemi da segnalare:**
- ❌ **CRITICO**: RLS con `USING(true)` → tutti vedono tutto!
- ❌ **CRITICO**: Nessun filtro per `org_id` o `staff_id`
- ⚠️ Policies duplicate o conflittanti

**Esempio risultato atteso (PROBLEMATICO):**
```
policyname: "Users can view appointments"
qual: "(true)"  ❌ PERMISSIVA
```

**Esempio risultato desiderato:**
```
policyname: "Staff can view own org appointments"
qual: "org_id = auth.jwt() ->> 'org_id' AND staff_id = auth.uid()"  ✅ FILTRA
```

---

### ✅ SEZIONE 5: Grants e Permessi
**Cosa verificare:**
- Ruolo `authenticated` ha permessi necessari?
- Permessi eccessivi (es. `DELETE` a tutti)?

**Problemi da segnalare:**
- ❌ Permessi mancanti
- ⚠️ Permessi eccessivi

---

### ✅ SEZIONE 6: Trigger e Funzioni
**Cosa verificare:**
- Trigger `update_appointments_updated_at` esiste?
- Trigger `trigger_update_appointment_names` esiste?
- Funzioni RPC utilizzate esistono?

**Problemi da segnalare:**
- ❌ Trigger mancanti
- ❌ Funzioni mancanti

---

### ✅ SEZIONE 7: Integrità Dati ⚠️ CRITICO
**Cosa verificare:**
- **Valori NULL** su colonne NOT NULL
- **Violazioni CHECK** (`ends_at <= starts_at`)
- **Orphan rows** (FK rotte)
- **Valori non validi** (`status`, `type` fuori da CHECK)
- **Duplicati** (stesso staff_id + stesso orario)
- **Sovrapposizioni** orari

**Problemi da segnalare:**
- ❌ **CRITICO**: Orphan rows → FK rotte
- ❌ **CRITICO**: Violazioni CHECK constraint
- ⚠️ Duplicati o sovrapposizioni

**Esempio risultato problematico:**
```
problema: "Orphan appointments: athlete_id non esistente"
count_orphans: 15
sample_athlete_ids: ['{uuid1, uuid2, ...}']
```

---

### ✅ SEZIONE 8: Cardinalità e Statistiche
**Cosa verificare:**
- Numero totale appointments
- Distribuzione per `type` e `status`
- Appointments per giorno (ultimi 30 giorni)
- Top staff per numero appointments

**Problemi da segnalare:**
- ⚠️ Distribuzione anomala (es. tutti `status = NULL`)
- ⚠️ Cardinalità molto alta (necessaria paginazione)

---

### ✅ SEZIONE 9: Performance (EXPLAIN)
**Cosa verificare:**
- Query usa indicii? (cerca `Index Scan` o `Index Only Scan`)
- Query usa `Seq Scan` (full table scan)? → lento!
- Costo query elevato?

**Problemi da segnalare:**
- ❌ **CRITICO**: `Seq Scan` su tabella grande → aggiungere indice
- ⚠️ Costo query elevato → ottimizzare query o indicii

**Esempio risultato problematico:**
```json
{
  "Plan": {
    "Node Type": "Seq Scan",  ❌ SCAN LINEARE (LENTO)
    "Relation Name": "appointments",
    "Total Cost": 15000.50
  }
}
```

**Esempio risultato desiderato:**
```json
{
  "Plan": {
    "Node Type": "Index Scan",  ✅ USA INDICE (VELOCE)
    "Index Name": "idx_appointments_staff_starts",
    "Total Cost": 50.25
  }
}
```

---

### ✅ SEZIONE 10: Anomalie e Edge Cases
**Cosa verificare:**
- Appointments futuri molto lontani (> 1 anno)
- Appointments passati molto vecchi (> 1 anno fa)
- Durata anomala (< 15 min o > 4 ore)
- Denormalizzazione incompleta (`athlete_name`, `trainer_name` NULL)
- `trainer_id != staff_id` (inconsistenza)

**Problemi da segnalare:**
- ⚠️ Dati legacy o errori di data
- ⚠️ Denormalizzazione incompleta

---

### ✅ SEZIONE 11: Summary Report
**Cosa verificare:**
- Riassunto problemi critici trovati

**Problemi da segnalare:**
- ❌ **CRITICO**: Qualsiasi problema con stato `CRITICO`
- ⚠️ **WARNING**: Qualsiasi problema con stato `WARNING`

---

## 📤 COSA FARE DOPO

1. **Raccogli tutti i risultati** in file o screenshot
2. **Segna i problemi critici** trovati (RLS, orphan rows, violazioni constraint)
3. **Incolla i risultati nello STEP 3** quando richiesto
4. **Non eseguire fix manuali** prima dello STEP 3 (genereremo SQL fix automatici)

---

## ⚠️ NOTE IMPORTANTI

- ❌ **NON modificare il database** prima dello STEP 3
- ✅ Salva tutti i risultati per analisi successiva
- ✅ Fai screenshot dei risultati critici (RLS, orphan rows)
- ✅ Presta attenzione alle sezioni marcate **CRITICO**

---

## 🔗 PROSSIMI STEP

**STEP 3**: Genereremo SQL di fix/migrazione basato sui risultati di questo STEP 2

---

**Stato**: ✅ STEP 2 COMPLETATO (script generato)  
**Prossimo**: Eseguire script su Supabase e incollare risultati per STEP 3
