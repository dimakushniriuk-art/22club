# Utility: Utils Handle PT Profile Save

## 📋 Descrizione

Utility per salvataggio profilo PT. Estratta da profilo/page.tsx per riutilizzabilità, gestisce update profilo PT nel database.

## 📁 Percorso File

`src/lib/utils/handle-pt-profile-save.ts`

## 📦 Dipendenze

- `@/lib/supabase/client` (`createClient`)

## ⚙️ Funzionalità

### Interfacce

- `ProfileData`: Dati profilo (nome, cognome, email, phone, specializzazione?, certificazioni?)

### Funzioni Principali

1. **`handlePTProfileSave(userId, profileData)`**: Salva profilo PT
   - Update tabella profiles con user_id
   - Campi: nome, cognome, email, phone, specializzazione (opzionale), certificazioni (opzionale)
   - Ritorna { success, error }

## 🔍 Note Tecniche

- Update condizionale: specializzazione e certificazioni solo se presenti
- Gestione errori con logging
- Ritorna success/error per gestione UI

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
