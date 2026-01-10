# 📋 Riepilogo Regole e Decisioni Tecniche - 22Club

**Data Creazione**: Chat corrente  
**Ultimo Aggiornamento**: Chat corrente  
**Build Status**: ✅ Tutti gli errori TypeScript risolti  
**Stato Migrazioni**: ✅ Applicate

---

## 1. Workout Wizard - Campo "Serie"

**Regola**: Il campo "Serie" nel workout wizard ha valore di default **1** (non 0).

**File coinvolti**:

- `src/components/workout/wizard-steps/workout-wizard-step-4.tsx`: `value={exercise.target_sets ?? 1}`
- `src/hooks/workout/use-workout-wizard.ts`: `target_sets: 1` nella funzione `addExerciseToDay`

---

## 2. Tipi di Appuntamento (Appointments)

**Regola**: Solo 3 tipi di appuntamento sono ammessi:

- `'allenamento'`
- `'prova'`
- `'valutazione'`

**Tipi rimossi**: `'cardio'`, `'check'`, `'consulenza'`, `'prima_visita'`, `'riunione'`, `'massaggio'`, `'nutrizionista'`

**File coinvolti**:

- `src/types/appointment.ts`: `type: 'allenamento' | 'prova' | 'valutazione'`
- `src/types/supabase.ts`: Aggiornato il tipo per `appointments`
- `src/lib/validations/appointment.ts`: Schema Zod aggiornato
- `src/components/calendar/appointment-form.tsx`: Opzioni dropdown aggiornate
- `src/components/dashboard/appointment-modal.tsx`: Tipo formData aggiornato
- `src/components/calendar/appointment-detail.tsx`: Mappatura tipi aggiornata
- `src/components/calendar/appointments-table.tsx`: Funzione `getAppointmentType` aggiornata
- `src/hooks/calendar/use-calendar-page.ts`: Mappatura vecchi tipi ai nuovi

**Migrazione Database**:

- `supabase/migrations/20260104_update_appointment_type_constraint.sql`: Aggiornato constraint CHECK

**Mappatura Vecchi Tipi**:

- `'cardio'` → `'allenamento'`
- `'consulenza'`, `'prima_visita'`, `'riunione'`, `'massaggio'`, `'nutrizionista'`, `'check'` → `'valutazione'`
- Altri → `'allenamento'` (default)

---

## 3. Durata Default Appuntamenti

**Regola**: La durata di default di un appuntamento è **1 ora e 20 minuti** (80 minuti) dall'orario di inizio.

**Logica**:

- L'orario di fine viene calcolato automaticamente
- I minuti vengono arrotondati al più vicino multiplo di 15 (per allinearsi alle opzioni del dropdown)
- Esempio: Inizio `01:15` → Fine `02:30` (arrotondato da `02:35`)

**File coinvolti**:

- `src/components/calendar/appointment-form.tsx`: Funzioni `getDefaultDateTime()` e `handleStartTimeChange()`
- `src/components/dashboard/appointment-modal.tsx`: Stessa logica

**Codice di riferimento**:

```typescript
// Calcola l'orario di fine (1 ora e 20 minuti dopo)
let endHour = defaultHour + 1
let endMinute = defaultMinute + 20

// Gestisci il caso in cui i minuti superano 60
if (endMinute >= 60) {
  endHour += 1
  endMinute -= 60
}

// Arrotonda i minuti al più vicino multiplo di 15
const roundedEndMinutes = Math.round(endMinute / 15) * 15
```

---

## 4. TypeScript - Tipi Workout Plans

**Regola**: Usare `WorkoutRowSelected` per i dati parziali di workout_plans invece di `WorkoutRow` completo.

**Motivazione**: Quando si selezionano solo alcuni campi dalla query, TypeScript può dare errori perché `WorkoutRow` include campi opzionali come `start_date`, `end_date`, `trainer_id` che non vengono selezionati.

**File coinvolti**:

- `src/hooks/workout-plans/use-workout-plans.ts`: Definizione tipo personalizzato

**Definizione tipo**:

```typescript
type WorkoutRowSelected = {
  id: string
  athlete_id: string
  name: string
  description: string | null
  objective?: string | null
  is_active: boolean | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}
```

---

## 5. TypeScript - ExerciseFilter

**Regola**: Quando si resettano i filtri degli esercizi, usare un'annotazione di tipo esplicita per evitare errori TypeScript.

**File coinvolti**:

- `src/components/workout/exercise-catalog.tsx`: Funzione `clearFilters()`

**Codice**:

```typescript
const clearFilters = () => {
  const emptyFilters: ExerciseFilter = {
    search: '',
    muscle_group: 'all',
    equipment: 'all',
    difficulty: 'all',
  }
  setTempFilters(emptyFilters)
  setFilters(emptyFilters)
}
```

---

## 6. Variabili Duplicate - Appointment Form

**Regola**: Evitare di dichiarare variabili con lo stesso nome nello stesso scope, anche se in blocchi diversi.

**Esempio problema risolto**: `roundedMinutes` dichiarato due volte in `getDefaultDateTime()` → rinominata la seconda in `roundedEndMinutes`.

---

## Note Importanti

1. **Migrazione Database**: Quando si cambiano i tipi di appuntamento, aggiornare anche il constraint CHECK nel database.
2. **Backward Compatibility**: I vecchi tipi nel database vengono mappati ai nuovi tipi nel codice TypeScript.
3. **Validazione**: Tutti i form e validazioni devono rispettare i nuovi tipi ammessi.
4. **UI Consistency**: Assicurarsi che tutti i dropdown e selettori riflettano i tipi corretti.

---

## Checklist per Nuove Feature

Quando si lavora su appuntamenti:

- [ ] Verificare che il tipo sia uno dei 3 ammessi
- [ ] Aggiornare tipo TypeScript se necessario
- [ ] Aggiornare validazione Zod se necessario
- [ ] Aggiornare constraint database se necessario
- [ ] Verificare mappatura vecchi tipi se si caricano dati esistenti

Quando si lavora su workout wizard:

- [ ] Verificare che i valori di default siano appropriati (serie = 1)
- [ ] Verificare che tutti i campi obbligatori siano validati correttamente

---

## Altri Cambiamenti Significativi (Riferimento Storico)

### Campo Obiettivo Scheda Allenamento

- Aggiunto campo `objective` obbligatorio alle schede
- Migrazione: `supabase/migrations/20260104_add_objective_to_workout_plans.sql`

### Validazione Sovrapposizione Appuntamenti

- **Rimossa** la validazione overlap per permettere più atleti nello stesso orario
- File: `src/lib/appointment-utils.ts` (funzione rimossa)

### Etichette Difficoltà

- Standardizzate a: "Principiante" (verde), "Intermedio" (arancione), "Avanzato" (rosso)

### Design Pagina Statistiche

- Migliorato con colori vivaci, gradienti, ombre e effetti hover

### Link Pulsanti Dashboard

- "Nuovo Cliente" → `/dashboard/clienti?new=true`
- "Nuova Scheda" → `/dashboard/schede/nuova`

---

**NOTA**: Questo documento può essere copiato e incollato in nuove chat per mantenere la continuità del progetto.
