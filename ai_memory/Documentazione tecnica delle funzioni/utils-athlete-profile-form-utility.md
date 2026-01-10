# Utility: Utils Athlete Profile Form

## 📋 Descrizione

Utility per gestione form profilo atleta. Fornisce funzioni comuni per validazione, sanitizzazione e salvataggio form con pattern riusabile.

## 📁 Percorso File

`src/lib/utils/athlete-profile-form.ts`

## 📦 Dipendenze

- `zod` (`z`, `ZodSchema`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`validateAndSanitizeFormData(data, schema)`**: Valida e sanitizza dati form
   - Usa schema.safeParse per validazione Zod
   - Ritorna { success: true, data } o { success: false, error }
   - Formatta errori con path e message

2. **`handleAthleteProfileSave(params)`**: Gestisce salvataggio form
   - Sanitizzazione opzionale
   - Validazione con schema
   - Salvataggio con mutation
   - Callback success/error
   - Messaggi personalizzabili

## 🔍 Note Tecniche

- Pattern riusabile per tutti i form profilo atleta
- Supporta sanitizzazione opzionale prima di validazione
- Gestione errori con messaggi personalizzabili

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
