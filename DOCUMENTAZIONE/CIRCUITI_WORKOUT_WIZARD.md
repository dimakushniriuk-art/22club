# Circuiti nel wizard Nuova scheda

Documentazione del funzionamento dei circuiti nella creazione e modifica delle schede di allenamento (wizard `/dashboard/schede/nuova` e `/dashboard/schede/[id]/modifica`).

---

## 1. Cosa sono i circuiti

Un **circuito** è un blocco di esercizi da eseguire in sequenza (es. Esercizio A → B → C, eventualmente ripetuto per più giri). Nel wizard:

- I circuiti sono **configurati** allo step 3 (Esercizi) nella sezione "Circuito" (sotto la barra di navigazione).
- Ogni circuito è una lista ordinata di esercizi con parametri (serie, ripetizioni, recupero, ecc.).
- I circuiti configurati possono essere **assegnati al Giorno 1** (toggle sulla card): clic sulla card = aggiungi/rimuovi dal giorno.
- In step 4 (Target) i blocchi circuito sono in sola lettura; gli altri esercizi del giorno sono modificabili. L’ordine del giorno (esercizi + circuiti) è riordinabile con drag-and-drop.

---

## 2. Flusso utente (step 3)

1. **Aggiungi esercizi per il circuito**  
   Apre il modal in due step:
   - **Seleziona**: catalogo esercizi con toggle (click = aggiungi/rimuovi dal circuito). Badge numero sequenza sulle card selezionate.
   - **Configura**: tabella con serie, ripetizioni, peso, tempo esecuzione, recupero per ogni esercizio del circuito. Pulsante "Conferma circuito".

2. **Conferma circuito**  
   Il circuito viene aggiunto a `circuitList` (stato del wizard) e, in creazione, viene aggiunto anche al **Giorno 1** (`addCircuitToDay(0, newId)`). L’id del circuito in creazione è `circuit-${Date.now()}`; in modifica (caricato da DB) è l’UUID `circuit_block_id`.

3. **Lista circuiti configurati**  
   Sotto la sezione "Circuito" compaiono le card "Circuito configurato" (anteprime 3×3, badge "✓ Selezionato" se il circuito è nel giorno 1). Su ogni card:
   - **Click** sulla card: toggle aggiunta/rimozione dal Giorno 1.
   - **Modifica**: apre lo stesso modal con esercizi e parametri del circuito (stesso flusso selezione/configura).
   - **Elimina**: rimuove il circuito da `circuitList` e da tutti i giorni.

4. **Esercizi per giorno**  
   Ogni giorno (Giorno 1, 2, …) ha il suo catalogo per aggiungere esercizi singoli. I circuiti si assegnano solo al Giorno 1 dalla sezione Circuito.

---

## 3. Modello dati (frontend)

### 3.1 Stato nel wizard

- **`circuitList`**  
  `Array<{ id: string; params: WorkoutDayExerciseData[] }>`  
  Elenco dei circuiti configurati. Ogni elemento ha:
  - `id`: in creazione `circuit-${Date.now()}`, in modifica l’UUID letto da `circuit_block_id`.
  - `params`: array ordinato di esercizi del circuito (stessi campi di un esercizio giorno: `exercise_id`, `target_sets`, `target_reps`, `rest_timer_sec`, ecc.).

- **`wizardData.days[].items`** (se presente)  
  `DayItem[]` dove `DayItem = { type: 'exercise', exercise } | { type: 'circuit', circuitId }`.  
  Ordine degli elementi nel giorno: esercizi singoli e blocchi circuito. Se `items` è vuoto/assente si deriva da `days[].exercises` (solo esercizi, senza circuiti).

- **`getDayItems(day)`**  
  Restituisce `day.items` se presente e non vuoto, altrimenti `day.exercises` mappati in `{ type: 'exercise', exercise }`.

### 3.2 Persistenza Supabase

- **workout_day_exercises.circuit_block_id** (UUID, nullable)
  - `NULL`: esercizio singolo.
  - Stesso UUID su più righe dello stesso `workout_day_id`: quelle righe formano un unico circuito; l’ordine è dato da `order_index` (e dalla posizione nella risposta).

- Non esiste una tabella separata "circuiti": un circuito è identificato dall’insieme delle righe `workout_day_exercises` con lo stesso `(workout_day_id, circuit_block_id)`.

---

## 4. Salvataggio (creazione scheda)

1. **Nuova scheda** (`/dashboard/schede/nuova`)
   - `onSave(workoutData, circuitList)` → `handleCreateWorkout(workoutData, circuitList)`.

2. **handleCreateWorkout** (in `use-workout-plans.ts`):
   - Inserisce `workout_plans`, poi per ogni giorno `workout_days`.
   - Per ogni giorno, la lista di esercizi da inserire è costruita con **getExercisesWithCircuitBlock(day, circuitList)**:
     - Per ogni `item` in `getDayItems(day)`:
       - Se `item.type === 'exercise'`: una riga con `circuit_block_id = null`.
       - Se `item.type === 'circuit'`: si trova il circuito in `circuitList` per `item.circuitId`; per ogni esercizio in `circuit.params` si inserisce una riga con lo stesso `circuit_block_id` (UUID). L’UUID è generato al volo se l’id circuito non è un UUID valido (es. `circuit-123`), altrimenti si riusa l’id (modifica).
   - Per ogni riga si inserisce `workout_day_exercises` (incluso `circuit_block_id` se non null) e le relative `workout_sets`.

---

## 5. Salvataggio (modifica scheda)

1. **Modifica scheda** (`/dashboard/schede/[id]/modifica`)
   - Caricamento: `useWorkoutDetail(workoutId)` restituisce la scheda con `days[].items` e `circuitList` ricostruiti da `circuit_block_id` (vedi sotto).
   - Salvataggio: `handleUpdateWorkout(workoutId, workoutData, circuitList)`.

2. **handleUpdateWorkout**:
   - Aggiorna `workout_plans` (nome, descrizione, atleta, ecc.).
   - Elimina tutte le righe `workout_day_exercises` dei giorni della scheda e poi i `workout_days`.
   - Re-inserisce giorni ed esercizi come in creazione, usando di nuovo **getExercisesWithCircuitBlock(day, circuitList)**. I circuiti in modifica hanno `id` = UUID già presente in DB, quindi si riusa come `circuit_block_id`.

---

## 6. Caricamento per modifica (use-workout-detail)

- La query legge `workout_plans` → `workout_days` → `workout_day_exercises` (con `circuit_block_id`) e set.
- Per ogni giorno, gli esercizi sono ordinati (es. per `order_index`). Poi:
  - Si scorrono gli esercizi in ordine.
  - Se `circuit_block_id` è null: si aggiunge un item `{ type: 'exercise', exercise }` a `items`.
  - Se `circuit_block_id` è valorizzato: si raggruppano tutte le righe consecutive con lo stesso `circuit_block_id`, si costruisce l’array `params` (WorkoutDayExerciseData) e si aggiunge a `circuitList` con `id: circuit_block_id`; si aggiunge un item `{ type: 'circuit', circuitId: circuit_block_id }` a `items`.
- In uscita: `workout.days[d].items` e `workout.circuitList` sono popolati così da poter riaprire il wizard in modifica con circuiti e ordine corretti.

---

## 7. Riepilogo punti chiave

| Aspetto                        | Dettaglio                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| Dove si configurano i circuiti | Step 3, sezione "Circuito" → "Aggiungi esercizi per il circuito" (modal).                      |
| Dove si assegnano al giorno    | Step 3: card "Circuito configurato" → click = toggle sul Giorno 1.                             |
| Persistenza DB                 | Solo `workout_day_exercises.circuit_block_id`; stesso UUID = stesso circuito nel giorno.       |
| Creazione                      | Id circuito `circuit-${Date.now()}`; in salvataggio si genera un UUID per `circuit_block_id`.  |
| Modifica                       | Id circuito = UUID da DB; in salvataggio si riusa come `circuit_block_id`.                     |
| Step 4                         | Blocchi circuito in sola lettura; esercizi singoli modificabili; drag-and-drop per riordinare. |

---

## 8. Dettaglio scheda atleta: `/home/allenamenti/[id]`

Pagina in cui l’atleta vede i giorni della scheda e gli esercizi (o i circuiti) di ogni giorno.

### 8.1 Dati e raggruppamento

- Fetch: `workout_plans`, `workout_days`, `workout_day_exercises` (con `circuit_block_id`) e dettagli `exercises`.
- Per ogni giorno, le righe `workout_day_exercises` sono ordinate per `order_index`. Le righe consecutive con lo stesso `circuit_block_id` non null sono raggruppate in un unico **item di tipo circuito**; le righe con `circuit_block_id` null sono item **esercizio singolo**.
- Struttura: `DayItem = { type: 'exercise', exercise } | { type: 'circuit', exercises }` (con `exercises` array di dettagli per ogni esercizio del circuito).

### 8.2 UI giorni

- Sotto il titolo del giorno viene mostrato **"N a circuito, M singoli"** (es. "4 a circuito, 0 singoli"). Se ci sono solo circuiti o solo singoli, si mostrano comunque entrambi i numeri (anche 0).
- Lista item del giorno:
  - **Esercizio singolo**: card con video/thumbnail, nome, descrizione, badge (muscle_group, equipment, difficulty).
  - **Circuito**: una sola card “Circuito” con thumbnail del primo esercizio, testo “Circuito · N esercizi”, “Clicca per aprire la lista”. Al click si espande (stato `expandedCircuitKey`) e mostra la lista completa degli esercizi del circuito (video, nome, descrizione, badge per ciascuno).
- Pulsante **“Inizia questo giorno”** in fondo a ogni giorno: reindirizza a `/home/allenamenti/oggi?workout_plan_id=&workout_day_id=` per avviare la sessione di quel giorno.

---

## 9. Hook `use-workout-session` e `circuit_block_id`

- **File**: `src/hooks/workouts/use-workout-session.ts`.
- La query su `workout_day_exercises` include la colonna **`circuit_block_id`** (tipo `WorkoutDayExerciseRow` e oggetti restituiti).
- Ogni elemento dell’array `exercises` della sessione ha il campo **`circuit_block_id: string | null`** (oltre a `id`, `exercise`, `sets`, `target_*`, `rest_timer_sec`, ecc.).
- La sessione è una lista **piatta** di “esercizi” (una voce per ogni riga `workout_day_exercises`). I circuiti sono quindi N voci consecutive con lo stesso `circuit_block_id`; la logica a “blocchi” (un circuito = un blocco) è applicata nella pagina “oggi” (vedi sotto).

---

## 10. Pagina “Oggi” (sessione allenamento): `/home/allenamenti/oggi`

Quando l’atleta avvia un giorno dalla scheda, la pagina “oggi” carica la sessione (hook sopra) e mostra gli esercizi. I **circuiti sono trattati come un unico blocco** per navigazione, contatore e completamento.

### 10.1 Blocchi (circuito = un solo “esercizio” per l’atleta)

- **`blocks`** (derivato da `workoutSession.exercises`): array di blocchi. Ogni blocco è:
  - un **esercizio singolo** (una riga con `circuit_block_id` null), oppure
  - un **circuito** (tutte le righe consecutive con lo stesso `circuit_block_id`).
- **`currentBlockIndex`**: stato che indica il blocco corrente (0, 1, …). L’“esercizio” mostrato è il **primo** del blocco: `currentExerciseIndex = blocks[currentBlockIndex].startIndex`.
- **Navigazione** (Precedente / Successivo): sposta di **un blocco** alla volta, non di singola riga. Es.: un circuito da 4 esercizi conta come 1 passo.
- **Contatore**: “ESERCIZIO x / N” usa i blocchi (es. “1 / 3” se ci sono 1 circuito + 2 esercizi singoli).

### 10.2 Vista quando il blocco corrente è un circuito

- **Titolo card**: “Circuito · N esercizi”.
- **Griglia 3×3**: fino a 9 celle con il video (o thumbnail) di ogni esercizio del circuito (`ExerciseMediaDisplay`). Le celle sono **cliccabili**: si apre un dialog con il video (o immagine) ingrandito e il nome dell’esercizio.
- **Sotto la griglia**: sezione “Esercizi nel circuito” con la **stessa impostazione di un esercizio normale**:
  - Intestazione colonne: Peso (kg), Ripetizioni, Tempo (sec) se presente, Recupero (sec).
  - Per ogni esercizio del circuito: **nome sopra** e una riga con numero progressivo (1, 2, 3…) e valori peso, ripetizioni, recupero (e tempo se previsto). Layout compatto (padding e font ridotti).
- **Timer di esecuzione**: se almeno un esercizio del circuito ha `execution_time_sec` > 0 (da set o da esercizio), sotto la card viene mostrato il timer di esecuzione; il valore usato è il primo `execution_time_sec` > 0 trovato tra gli esercizi del circuito.
- **Completa esercizio**: il pulsante **completa l’intero blocco** (tutti gli esercizi del circuito). Lo stato “Esercizio completato” è attivo quando tutti gli esercizi del blocco sono segnati completati.

### 10.3 Vista quando il blocco è un esercizio singolo

- Comportamento invariato rispetto al passato: un video/immagine, tabella set (Peso, Ripetizioni, Recupero, eventuale Tempo), pulsante “Completa esercizio” per quel singolo esercizio. Navigazione e contatore restano a livello blocco (in questo caso un blocco = un esercizio).

### 10.4 Riepilogo file e concetti (pagina oggi)

| Elemento                    | Dettaglio                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Stato blocchi               | `blocks` (useMemo da `workoutSession.exercises` + `circuit_block_id`), `currentBlockIndex`.                        |
| Indice esercizio per vista  | `currentExerciseIndex = blocks[currentBlockIndex].startIndex`.                                                     |
| `circuitGroup`              | Esercizi del circuito corrente (stesso `circuit_block_id` dell’esercizio alla `currentExerciseIndex`).             |
| `completeBlock(blockIndex)` | Segna come completati (o toglie il completamento) tutti gli esercizi del blocco; usato per circuito e per singolo. |
| Dialog video ingrandito     | Stato `enlargedCircuitVideo`; click su una cella della griglia 3×3 apre il dialog con video/immagine e nome.       |

---

## 11. Riepilogo funzionalità circuito (end-to-end)

| Fase                               | Cosa fa                                                                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Wizard (PT)**                    | Crea/modifica circuiti (step 3), assegna al giorno, salva `circuit_block_id` in `workout_day_exercises`.                                                           |
| **Dettaglio scheda**               | Mostra “N a circuito, M singoli”, card circuito espandibile, “Inizia questo giorno” → oggi.                                                                        |
| **Sessione (use-workout-session)** | Carica esercizi con `circuit_block_id`; lista piatta di righe.                                                                                                     |
| **Pagina oggi**                    | Raggruppa per blocco; circuito = 1 blocco; griglia 3×3 video, lista esercizi sotto, timer esecuzione, video ingrandito; navigazione e “Completa” a livello blocco. |

---

_Ultimo aggiornamento: febbraio 2026._
