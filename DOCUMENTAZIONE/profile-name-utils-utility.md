# Utility: Profile Name Utils

## 📋 Descrizione

Utility per gestione nomi profilo. Risolve naming confusion tra nome/cognome e first_name/last_name, estrae nome completo, normalizza profili.

## 📁 Percorso File

`src/lib/profile-name-utils.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Interfacce Esportate

- `ProfileFullName`: Nome completo (firstName, lastName, fullName)

### Funzioni Principali

1. **`getProfileFullName(profile)`**: Estrae nome completo
   - Priorità: nome/cognome > first_name/last_name
   - Combina firstName e lastName
   - Fallback: 'Utente' se vuoto

2. **`normalizeProfileNames(profile)`**: Normalizza nomi profilo
   - Sincronizza nome/cognome con first_name/last_name
   - Se nome/cognome esiste, copia in first_name/last_name
   - Se first_name/last_name esiste ma nome/cognome no, copia in nome/cognome
   - Ritorna oggetto con tutti i campi normalizzati

## 🔍 Note Tecniche

- Risolve problema P4-011: naming confusion tra campi
- Priorità: nome/cognome (campo principale italiano)
- Normalizzazione bidirezionale

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
