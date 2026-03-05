# Utility: Export Payments

## 📋 Descrizione

Utility per export pagamenti in CSV/PDF. Formatta dati pagamenti per export, gestisce formattazione valuta e date.

## 📁 Percorso File

`src/lib/export-payments.ts`

## 📦 Dipendenze

- `./export-utils` (`exportToCSV`, `exportToPDF`)
- `@/types/payment` (`Payment`)

## ⚙️ Funzionalità

### Tipi

- `PaymentExportData`: Record<string, string | number | boolean | null>[]

### Funzioni Principali

1. **`formatPaymentsForExport(payments)`**: Formatta pagamenti per export
   - Mappa Payment a formato export
   - Colonne: Data, Atleta, Importo (€X.XX), Metodo, Lezioni Acquistate, Stato, Storno, Note
   - Formattazione valuta: €X.XX
   - Formattazione date: formato italiano

2. **`exportPaymentsToCSV(payments, filename?)`**: Esporta pagamenti in CSV
   - Default filename: `pagamenti-YYYY-MM-DD.csv`

3. **`exportPaymentsToPDF(payments, filename?)`**: Esporta pagamenti in PDF
   - Default filename: `pagamenti-YYYY-MM-DD.pdf`

## 🔍 Note Tecniche

- Formattazione valuta: €X.XX
- Formattazione date: formato italiano (DD/MM/YYYY)
- Storno: 'Sì'/'No' invece di boolean

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
