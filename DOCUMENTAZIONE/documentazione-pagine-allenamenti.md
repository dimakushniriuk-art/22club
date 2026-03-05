# Documentazione pagine Allenamenti (stato definitivo)

Documentazione delle pagine modificate nel flusso atleta per allenamenti, esercizi e raccolta dati. Stato attuale definitivo.

---

## 1. `/home/allenamenti` – Lista allenamenti

**File:** `src/app/home/allenamenti/page.tsx`

### Scopo
Pagina principale “I miei Allenamenti”: vista d’insieme, statistiche, allenamento di oggi, schede assegnate e card motivazionale.

### Dati letti
- **workout_logs** (hook `useAllenamenti`): filtro `atleta_id` = `profiles.id`, stato “tutti”. Campi: id, atleta_id, scheda_id, data, stato, durata_minuti, esercizi_completati/totali, volume_totale, note, relazioni atleta/scheda.
- **workout_plans** (hook `useWorkouts`): filtro `athlete_id` = `profiles.id`, ruolo atleta. Nome, descrizione, difficoltà, muscle_group, staff_name, status.

### Comportamento
- **Refresh al mount:** all’ingresso (e al ritorno da altre pagine) vengono chiamati `refreshAllenamenti()` e `refetchWorkouts()` così lista e schede sono aggiornate.
- **Statistiche:** calcolate da `workout_logs`: settimana, mese, streak (giorni consecutivi con completati), volume medio (solo log completati con volume valido).
- **“Oggi”:** primo log con `data` = oggi e `stato` in `programmato` | `in_corso`. Se presente: card con titolo, descrizione, durata, numero esercizi, PT, pulsante “Inizia Allenamento” → `/home/allenamenti/oggi`. Media (video/thumb) del primo esercizio del giorno caricata da workout_days → workout_day_exercises → exercises.
- **Schede assegnate:** elenco di `workout_plans` con `status === 'attivo'`. Link a `/home/allenamenti/[id]` per dettaglio scheda.
- **Sezione “Completati di recente”:** rimossa. Non è più presente in questa pagina (lo storico è in `/home/progressi/storico`).
- **Overlay hover:** rimossi i div di overlay a gradiente teal sulle card (stats, oggi).
- **Card motivazionale:** “Ottimo lavoro questa settimana!”, conteggio settimana, link “Vedi i tuoi progressi” → `/home/progressi`.

### Nessun salvataggio
La pagina è in sola lettura; non scrive su DB.

---

## 2. `/home/allenamenti/[id]` – Dettaglio scheda

**File:** `src/app/home/allenamenti/[id]/page.tsx`

### Scopo
Dettaglio di una scheda (workout_plan): giorni, esercizi e circuiti; pulsante per avviare un giorno.

### Dati letti
- **workout_plans:** id, name, description (param `id` dalla URL).
- **workout_days:** per `workout_plan_id` = plan.id, ordinati per day_number; id, day_number, title, day_name.
- **workout_day_exercises:** per ogni giorno; id, exercise_id, order_index, circuit_block_id.
- **exercises:** dettagli (name, description, video_url, thumb_url, image_url, difficulty, equipment, muscle_group).

### Comportamento
- Giorni espandibili; per ogni giorno: lista esercizi singoli e circuiti (raggruppati per `circuit_block_id`). Per ogni esercizio: media, nome, descrizione, badge (muscle_group, equipment, difficulty).
- “Inizia questo giorno” → `/home/allenamenti/oggi?workout_plan_id=<planId>&workout_day_id=<dayId>`.

### Nessun salvataggio
Sola lettura.

---

## 3. `/home/allenamenti/oggi` – Sessione allenamento

**File:** `src/app/home/allenamenti/oggi/page.tsx`

### Scopo
Esecuzione della sessione: blocchi (esercizio singolo o circuito), set con reps/peso/tempo, timer, completamento e salvataggio.

### Dati letti
- **workout_plans** (da `useWorkoutSession`): per atleta (`athlete_id` = profile id) e opzionalmente `workout_plan_id` / `workout_day_id` da query.
- **workout_days**, **workout_day_exercises**, **exercises**, **workout_sets** (set esistenti per precompilare).

### Dati salvati al “Completa allenamento”
1. **workout_sets**
   - Set con `id` UUID valido: `UPDATE` con reps, weight_kg, execution_time_sec, completed_at.
   - Set senza id (nuovi): `INSERT` con workout_day_exercise_id, set_number, reps, weight_kg, execution_time_sec, completed_at.
2. **workout_logs**
   - `INSERT` con: atleta_id, athlete_id, scheda_id, data (oggi YYYY-MM-DD), stato `completato`, esercizi_completati, esercizi_totali, **durata_minuti** (calcolata da inizio sessione), **volume_totale** (somma reps×weight_kg su tutti i set), note (“Completato con PT” / “Completato da solo”), opzionale user_id.
3. **Collegamento set → log**
   - Dopo l’insert del log: `UPDATE workout_sets SET workout_log_id = :id` per i set della sessione con completed_at negli ultimi 2 ore e workout_log_id ancora null.

### Logica aggiuntiva
- **sessionStartedAtRef:** impostato al primo caricamento della sessione (currentWorkout con esercizi). Usato per `durata_minuti` = (now - sessionStartedAtRef) / 60000.
- **volume_totale:** somma di `reps * weight_kg` per ogni set della sessione (solo valori numerici validi).
- Redirect post-completamento: `/home/allenamenti/riepilogo?workout_id=<workout_log_id>`.

---

## 4. `/home/allenamenti/riepilogo` – Riepilogo post-allenamento

**File:** `src/app/home/allenamenti/riepilogo/page.tsx`

### Scopo
Riepilogo dell’allenamento appena completato (o ultimo completato): titolo, statistiche, esercizi con set eseguiti, performance, pulsanti “Invia al PT” e “Torna alla home”.

### Dati letti
- **workout_logs:** per `atleta_id` = profile id, stato `completato`. Se in query c’è `workout_id`, viene usato quel log; altrimenti ultimo completato (order by data desc, created_at desc, limit 1). Select con join su **workout_plans** (scheda) → workout_days → workout_day_exercises (target_sets, target_reps, target_weight) → exercises.
- **workout_sets:** per `workout_log_id` = id del log selezionato; campi workout_day_exercise_id, set_number, reps, weight_kg, completed_at. Ordinati per set_number.

### Comportamento
- Set eseguiti costruiti da **workout_sets** (reps, weight_kg reali). Se per un esercizio non ci sono set in DB, si usa il fallback con target_sets/target_reps/target_weight dalla scheda.
- Statistiche: total_exercises, completed_exercises, total_sets, completed_sets, total_time (durata_minuti del log), total_volume (somma performed_weight × performed_reps da workout_sets), consistency_score, average_weight_increase e personal_records (placeholder/TODO).
- “Invia al PT”: solo simulato (setTimeout + messaggio); nessuna scrittura su DB.
- total_time preso da `workout_logs.durata_minuti`.

### Nessun salvataggio
Sola lettura (+ simulazione invio PT).

---

## 5. `/home/progressi/storico` – Storico allenamenti

**File:** `src/app/home/progressi/storico/page.tsx`

### Scopo
Storico allenamenti completati dall’atleta: filtri periodo (7/30/90 giorni, tutto), statistiche (totali, ore, media/settimana, streak), lista e export PDF.

### Dati letti
- **profiles:** id, nome, cognome per `user_id` = auth.uid() (per avere `profiles.id` = atleta_id).
- **workout_logs:** filtro `atleta_id` = profiles.id. Select: id, atleta_id, scheda_id, data, stato, durata_minuti, note, created_at. Join **workout_plans** (alias scheda): name, description.
- Filtro periodo: se non “all”, `data >= startDate` (startDate in base a 7d/30d/90d). Ordinamento: data desc, created_at desc.

### Comportamento
- Mapping per l’UI: da ogni riga si ricavano started_at (da data/created_at), completed_at (se stato completato), duration_minutes (durata_minuti), workout.titolo (scheda.name), workout.descrizione (scheda.description).
- Statistiche da righe restituite: total_workouts, total_hours (somma durata_minuti/60), avg_per_week, current_streak (0 per ora).
- Export PDF: stesso dataset, formattato in tabella (data, scheda, durata, stato, note).

### Allineamento schema
La pagina usa lo schema reale: **atleta_id**, **scheda_id**, **data**, **stato**, **durata_minuti**, **note**, relazione con **workout_plans** (name, description). Non usa più user_id, workout_id, started_at, completed_at, duration_minutes, workouts(titolo, descrizione).

---

## 6. Migration RLS – Allineamento policy

**File:** `supabase/migrations/20260226_workout_rls_and_data_align.sql`

### Contenuto
- **workout_sets:** policy SELECT “Users can view workout sets” per `authenticated` con `USING (true)` (necessaria per riepilogo e statistiche che leggono set per workout_log_id).
- **workout_logs:** policy INSERT “Athletes can insert own workout logs” con `WITH CHECK (COALESCE(athlete_id, atleta_id) IN (SELECT id FROM profiles WHERE user_id = auth.uid()))`.

### Note
Le policy restano attive (RLS non disabilitato). Gli atleti possono inserire solo i propri log e leggere/aggiornare i set; il riepilogo può leggere i set del proprio workout_log.

---

## Riepilogo dati per tabella

| Tabella                 | Lettura atleta                                                                 | Scrittura atleta                                                                 |
|-------------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| workout_logs            | Lista (allenamenti), riepilogo, storico; filtro atleta_id = profiles.id       | INSERT al completamento (oggi): atleta_id, scheda_id, data, stato, durata_minuti, volume_totale, esercizi_* |
| workout_sets            | Riepilogo (per workout_log_id), statistiche progressi, precompilazione oggi     | INSERT nuovi set; UPDATE reps, weight_kg, execution_time_sec, completed_at; UPDATE workout_log_id dopo completamento |
| workout_plans           | Lista schede, dettaglio [id], riepilogo (scheda), storico (nome scheda)         | No                                                                              |
| workout_days            | Dettaglio [id], oggi (sessione), riepilogo (struttura)                         | No                                                                              |
| workout_day_exercises   | Dettaglio [id], oggi (esercizi e target), riepilogo                             | No                                                                              |
| exercises               | Dettaglio [id], oggi (nome, media, descrizione)                                | No                                                                              |

---

*Ultimo aggiornamento: stato definitivo dopo le modifiche per raccolta dati (durata, volume, set reali), allineamento storico a workout_logs/workout_plans, refresh lista allenamenti, rimozione sezione “Completati di recente” e overlay, e migration RLS 20260226.*
