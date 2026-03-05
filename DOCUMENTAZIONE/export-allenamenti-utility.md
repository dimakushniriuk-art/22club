# Utility: Export Allenamenti

## 📋 Descrizione

Utility per export allenamenti in CSV. Formatta dati allenamenti per export, gestisce formattazione date e durata.

## 📁 Percorso File

`src/lib/export-allenamenti.ts`

## 📦 Dipendenze

- `@/types/allenamento` (`Allenamento`)
- `./export-utils` (`exportToCSV`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`formatAllenamentiForExport(allenamenti)`**: Formatta allenamenti per export
   - Mappa Allenamento a formato export
   - Colonne: ID, Atleta, Scheda, Data (formato italiano con ora), Durata (min), Stato, Esercizi completati/totali, Volume (kg), Note
   - Formattazione data: formato italiano con ora (DD/MM/YYYY HH:mm)

2. **`exportAllenamentiToCSV(allenamenti)`**: Esporta allenamenti in CSV
   - Genera filename con timestamp: `allenamenti_YYYY-MM-DD_HH-MM.csv`

## 🔍 Note Tecniche

- Formattazione data: Intl.DateTimeFormat italiano con ora
- Filename: include timestamp per unicità

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
