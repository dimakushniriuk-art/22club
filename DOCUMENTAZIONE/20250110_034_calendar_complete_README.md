# 📅 Gestione Calendario - Documentazione SQL

## Panoramica

Questo script SQL fornisce una gestione completa del calendario e degli appuntamenti in Supabase, includendo:

- Tabella `appointments` con tutte le colonne necessarie
- Trigger automatici per aggiornare nomi atleta/trainer
- Funzioni RPC per operazioni CRUD
- Verifica sovrapposizioni
- Statistiche e report
- Indici per performance ottimale

## 📋 Struttura Tabella

### Tabella `appointments`

```sql
- id: UUID (Primary Key)
- org_id: TEXT (default: 'default-org')
- athlete_id: UUID (FK → profiles.id)
- staff_id: UUID (FK → profiles.id)
- trainer_id: UUID (FK → profiles.id, alias di staff_id)
- starts_at: TIMESTAMP WITH TIME ZONE
- ends_at: TIMESTAMP WITH TIME ZONE
- type: TEXT (allenamento, cardio, check, consulenza, prima_visita, riunione, massaggio, nutrizionista)
- status: TEXT (attivo, completato, annullato, in_corso, cancelled, scheduled)
- location: TEXT (opzionale)
- notes: TEXT (opzionale)
- recurrence_rule: TEXT (per appuntamenti ricorrenti)
- cancelled_at: TIMESTAMP WITH TIME ZONE (per soft delete)
- trainer_name: TEXT (denormalizzato)
- athlete_name: TEXT (denormalizzato)
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

## 🔧 Funzioni RPC Disponibili

### 1. `create_appointment` - Crea un nuovo appuntamento

```sql
SELECT create_appointment(
  p_athlete_id := 'uuid-atleta',
  p_staff_id := 'uuid-staff',
  p_starts_at := '2025-01-15 10:00:00+00',
  p_ends_at := '2025-01-15 11:00:00+00',
  p_type := 'allenamento',
  p_notes := 'Sessione di forza - Upper body',
  p_location := 'Palestra A',
  p_org_id := 'default-org'
);
```

**Ritorna:** UUID dell'appuntamento creato

**Note:** Verifica automaticamente sovrapposizioni e aggiorna i nomi atleta/trainer

---

### 2. `update_appointment` - Aggiorna un appuntamento esistente

```sql
SELECT update_appointment(
  p_appointment_id := 'uuid-appuntamento',
  p_athlete_id := 'uuid-atleta', -- opzionale
  p_starts_at := '2025-01-15 14:00:00+00', -- opzionale
  p_ends_at := '2025-01-15 15:00:00+00', -- opzionale
  p_type := 'consulenza', -- opzionale
  p_status := 'completato', -- opzionale
  p_notes := 'Note aggiornate', -- opzionale
  p_location := 'Palestra B' -- opzionale
);
```

**Ritorna:** `true` se aggiornato con successo

**Note:** Verifica sovrapposizioni escludendo l'appuntamento corrente

---

### 3. `cancel_appointment` - Cancella un appuntamento (soft delete)

```sql
SELECT cancel_appointment(
  p_appointment_id := 'uuid-appuntamento',
  p_reason := 'Atleta malato' -- opzionale
);
```

**Ritorna:** `true` se cancellato con successo

**Note:** Imposta `status = 'annullato'` e `cancelled_at = NOW()`

---

### 4. `delete_appointment` - Elimina definitivamente un appuntamento

```sql
SELECT delete_appointment(
  p_appointment_id := 'uuid-appuntamento'
);
```

**Ritorna:** `true` se eliminato con successo

**⚠️ ATTENZIONE:** Operazione irreversibile!

---

### 5. `check_appointment_overlap` - Verifica sovrapposizioni

```sql
SELECT * FROM check_appointment_overlap(
  p_staff_id := 'uuid-staff',
  p_starts_at := '2025-01-15 10:00:00+00',
  p_ends_at := '2025-01-15 11:00:00+00',
  p_exclude_appointment_id := 'uuid-appuntamento' -- opzionale, per escludere dalla verifica
);
```

**Ritorna:**

```json
{
  "has_overlap": true/false,
  "conflicting_appointments": [
    {
      "id": "uuid",
      "athlete_name": "Mario Rossi",
      "starts_at": "2025-01-15T10:00:00Z",
      "ends_at": "2025-01-15T11:00:00Z",
      "type": "allenamento"
    }
  ]
}
```

---

### 6. `get_appointments_in_range` - Ottiene appuntamenti in un periodo

```sql
SELECT * FROM get_appointments_in_range(
  p_staff_id := 'uuid-staff', -- opzionale
  p_athlete_id := 'uuid-atleta', -- opzionale
  p_start_date := '2025-01-01 00:00:00+00', -- opzionale
  p_end_date := '2025-01-31 23:59:59+00', -- opzionale
  p_status := 'attivo', -- opzionale
  p_type := 'allenamento' -- opzionale
);
```

**Ritorna:** Tabella con tutti gli appuntamenti che corrispondono ai filtri

---

### 7. `get_today_appointments` - Ottiene appuntamenti del giorno corrente

```sql
SELECT * FROM get_today_appointments(
  p_staff_id := 'uuid-staff'
);
```

**Ritorna:** Appuntamenti del giorno corrente per lo staff specificato

**Note:** Esclude automaticamente appuntamenti cancellati e completati

---

### 8. `get_appointment_stats` - Ottiene statistiche appuntamenti

```sql
SELECT * FROM get_appointment_stats(
  p_staff_id := 'uuid-staff', -- opzionale
  p_start_date := '2025-01-01 00:00:00+00', -- opzionale (default: inizio mese corrente)
  p_end_date := '2025-01-31 23:59:59+00' -- opzionale (default: fine mese corrente)
);
```

**Ritorna:**

```json
{
  "totali": 50,
  "completati": 30,
  "annullati": 5,
  "in_corso": 2,
  "programmati": 13,
  "per_tipo": {
    "allenamento": 40,
    "consulenza": 8,
    "prima_visita": 2
  }
}
```

---

### 9. `duplicate_appointment` - Duplica un appuntamento

```sql
SELECT duplicate_appointment(
  p_appointment_id := 'uuid-appuntamento',
  p_new_starts_at := '2025-01-22 10:00:00+00',
  p_new_ends_at := '2025-01-22 11:00:00+00'
);
```

**Ritorna:** UUID del nuovo appuntamento creato

**Note:** Copia tutti i dati dell'appuntamento originale tranne data/orario

---

## 📊 View Disponibili

### `monthly_appointments_view`

Statistiche mensili per staff:

```sql
SELECT * FROM monthly_appointments_view
WHERE staff_id = 'uuid-staff'
ORDER BY month DESC;
```

### `daily_appointments_view`

Statistiche giornaliere per staff:

```sql
SELECT * FROM daily_appointments_view
WHERE staff_id = 'uuid-staff'
  AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

---

## 🔄 Trigger Automatici

### `trigger_update_appointment_names`

Aggiorna automaticamente `athlete_name` e `trainer_name` quando:

- Viene inserito un nuovo appuntamento
- Viene modificato `athlete_id` o `staff_id`
- I nomi sono NULL

**Non richiede intervento manuale!**

---

## 📈 Indici per Performance

Gli indici creati ottimizzano le query per:

- Ricerca per staff/atleta
- Filtri per data
- Filtri per tipo/status
- Verifica sovrapposizioni (usando GIST per range)

---

## 🔒 Sicurezza (RLS)

- **SELECT:** Tutti gli utenti autenticati possono vedere gli appuntamenti
- **INSERT/UPDATE/DELETE:** Tutti gli utenti autenticati possono gestire gli appuntamenti

**Nota:** Per sicurezza più granulare, modifica le policies in base alle tue esigenze.

---

## 💡 Esempi di Utilizzo

### Esempio 1: Creare un appuntamento

```sql
-- Crea appuntamento per domani alle 10:00
SELECT create_appointment(
  p_athlete_id := (SELECT id FROM profiles WHERE email = 'atleta@22club.it'),
  p_staff_id := (SELECT id FROM profiles WHERE user_id = auth.uid()),
  p_starts_at := (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours'),
  p_ends_at := (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '11 hours'),
  p_type := 'allenamento',
  p_notes := 'Sessione di forza - Upper body'
);
```

### Esempio 2: Verificare disponibilità

```sql
-- Verifica se lo staff è libero domani alle 14:00
SELECT * FROM check_appointment_overlap(
  p_staff_id := (SELECT id FROM profiles WHERE user_id = auth.uid()),
  p_starts_at := (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '14 hours'),
  p_ends_at := (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '15 hours')
);
```

### Esempio 3: Ottenere appuntamenti della settimana

```sql
SELECT * FROM get_appointments_in_range(
  p_staff_id := (SELECT id FROM profiles WHERE user_id = auth.uid()),
  p_start_date := DATE_TRUNC('week', CURRENT_DATE),
  p_end_date := DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
);
```

### Esempio 4: Statistiche del mese corrente

```sql
SELECT * FROM get_appointment_stats(
  p_staff_id := (SELECT id FROM profiles WHERE user_id = auth.uid())
);
```

---

## 🚀 Installazione

1. Apri Supabase Dashboard
2. Vai su SQL Editor
3. Incolla il contenuto di `20250110_034_calendar_complete.sql`
4. Esegui lo script
5. Verifica che tutte le funzioni siano state create correttamente

---

## ✅ Verifica Installazione

```sql
-- Verifica che la tabella esista
SELECT * FROM information_schema.tables
WHERE table_name = 'appointments';

-- Verifica che le funzioni esistano
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%appointment%';

-- Verifica che i trigger esistano
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'appointments';
```

---

## 🐛 Troubleshooting

### Errore: "Sovrapposizione: esiste già un appuntamento"

- Verifica che non ci siano appuntamenti attivi nello stesso orario
- Usa `check_appointment_overlap` per vedere i conflitti

### I nomi atleta/trainer non si aggiornano

- Verifica che i profili esistano nella tabella `profiles`
- Controlla che `athlete_id` e `staff_id` siano corretti

### Performance lente

- Verifica che gli indici siano stati creati: `\d+ appointments`
- Considera di aggiungere filtri più specifici alle query

---

## 📝 Note Importanti

1. **Sovrapposizioni:** Le funzioni verificano automaticamente le sovrapposizioni per lo stesso `staff_id`
2. **Soft Delete:** Usa `cancel_appointment` invece di `delete_appointment` per mantenere storico
3. **Denormalizzazione:** `athlete_name` e `trainer_name` sono aggiornati automaticamente dai trigger
4. **Timezone:** Tutte le date sono in `TIMESTAMP WITH TIME ZONE` per gestire correttamente i fusi orari

---

**Ultimo aggiornamento:** 2025-01-10
