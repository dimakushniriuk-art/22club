# Utility: Utils Client Stats Calculator

## 📋 Descrizione

Utility per calcolo statistiche clienti lato client. Ottimizzato per performance con calcoli in singolo passaggio, supporta filtri.

## 📁 Percorso File

`src/lib/utils/client-stats-calculator.ts`

## 📦 Dipendenze

- `@/types/cliente` (`Cliente`)

## ⚙️ Funzionalità

### Interfacce Esportate

- `ClientStatsCalculation`: Statistiche clienti (totali, attivi, inattivi, nuovi_mese, documenti_scadenza)

### Funzioni Principali

1. **`calculateClientStats(clienti)`**: Calcola statistiche da array clienti
   - Calcolo in singolo passaggio per performance
   - Conta: totali, attivi, inattivi, nuovi_mese, documenti_scadenza

2. **`calculateFilteredClientStats(clienti, filters?)`**: Calcola statistiche con filtri
   - Applica filtri (stato, dataIscrizioneDa/A, solo_documenti_scadenza)
   - Calcola statistiche su array filtrato

## 🔍 Note Tecniche

- Ottimizzazione: calcolo in singolo passaggio (for loop)
- Filtri supportati: stato, date iscrizione, documenti scadenza
- Usa data_iscrizione o created_at come fallback

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
