# Utility: Validations Workout Target

## 📋 Descrizione

Utility per validazione target workout. Valida serie, ripetizioni, peso e tempo recupero con errori e warning per valori non ragionevoli.

## 📁 Percorso File

`src/lib/validations/workout-target.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Interfacce Esportate

1. **`WorkoutTarget`**: Interfaccia target workout
   - `target_sets?` (number | null)
   - `target_reps?` (number | null)
   - `target_weight?` (number | null)
   - `rest_timer_sec?` (number | null)

2. **`WorkoutTargetValidation`**: Interfaccia risultato validazione
   - `isValid: boolean`
   - `errors: string[]`
   - `warnings: string[]`

### Funzioni Esportate

1. **`validateWorkoutTarget(target: WorkoutTarget): WorkoutTargetValidation`**
   - Valida singolo target workout
   - **Serie**: min 1, warning se > 10, warning forte se > 20
   - **Ripetizioni**: min 1, warning se > 50, warning forte se > 100
   - **Peso**: min 0, warning se > 300kg, warning forte se > 500kg
   - **Recupero**: min 0, warning se < 15s o > 10min
   - **Coerenza**: warning se serie senza ripetizioni o viceversa

2. **`validateWorkoutTargets(targets: WorkoutTarget[]): WorkoutTargetValidation`**
   - Valida array di target workout
   - Aggrega errori e warning con prefisso "Esercizio N:"

## 🔍 Note Tecniche

- Validazione con errori (bloccanti) e warning (non bloccanti)
- Coerenza: verifica che serie e ripetizioni siano entrambe presenti se una è > 0
- Warning per valori estremi ma non impossibili

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
