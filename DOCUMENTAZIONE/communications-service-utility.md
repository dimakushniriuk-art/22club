# Utility: Communications Service

## 📋 Descrizione

Servizio CRUD per comunicazioni e recipients. Gestisce creazione, lettura, aggiornamento, eliminazione comunicazioni, gestione recipients, calcolo statistiche, filtri destinatari.

## 📁 Percorso File

`src/lib/communications/service.ts`

## 📦 Dipendenze

- `@supabase/supabase-js` (`createClient`)
- `@/types/supabase` (Database, Tables, TablesInsert, TablesUpdate)

## ⚙️ Funzionalità

### CRUD Operations

1. **`createCommunication(userId, input)`**: Crea nuova comunicazione
2. **`getCommunication(id)`**: Ottiene comunicazione con recipients
3. **`updateCommunication(id, input)`**: Aggiorna comunicazione
4. **`deleteCommunication(id)`**: Elimina comunicazione
5. **`listCommunications(filters)`**: Lista comunicazioni con filtri

### Recipients Management

- **`createRecipients(communicationId, recipients)`**: Crea recipients per comunicazione
- **`updateRecipientStatus(id, status, data)`**: Aggiorna status recipient
- **`updateCommunicationStats(id)`**: Aggiorna statistiche comunicazione

### Tipi Esportati

- `RecipientFilter`: Filtri destinatari (role, athlete_ids, all_users)
- `CreateCommunicationInput`: Input creazione comunicazione
- `UpdateCommunicationInput`: Input aggiornamento comunicazione
- `CommunicationWithStats`: Comunicazione con statistiche

## 🔍 Note Tecniche

- Usa Supabase Service Role Key per operazioni server-side
- Gestisce filtri destinatari complessi
- Calcola statistiche aggregate (total_sent, total_delivered, ecc.)

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
