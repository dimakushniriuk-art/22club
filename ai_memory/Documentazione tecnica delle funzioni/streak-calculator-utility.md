# Utility: Streak Calculator

## 📋 Descrizione

Utility per calcolo streak giorni consecutivi. Calcola streak_giorni da workout_logs, filtra solo workout completati, conta giorni consecutivi.

## 📁 Percorso File

`src/lib/streak-calculator.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Funzioni Principali

1. **`calculateStreakDays(workoutLogs)`**: Calcola streak giorni
   - Filtra solo workout completati (stato = 'completato'/'completed' o null)
   - Estrae date uniche e normalizza (YYYY-MM-DD)
   - Ordina date (più recente prima)
   - Conta giorni consecutivi partendo da oggi
   - Ritorna numero giorni streak

## 🔍 Note Tecniche

- Risolve problema P4-003: calcolo streak_giorni
- Normalizza date: rimuove time, ordina
- Conta consecutivi: verifica giorni consecutivi partendo da oggi

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
