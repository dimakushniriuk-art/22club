# 📚 Documentazione Tecnica: useChatProfile

**Percorso**: `src/hooks/chat/use-chat-profile.ts`  
**Tipo Modulo**: React Hook (Profile ID Cache Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:58:00Z

---

## 📋 Panoramica

Hook per ottenere e cache profile ID corrente. Evita query ripetute al database mantenendo profile ID in stato locale dopo prima query.

---

## 🔧 Funzioni e Export

### 1. `useChatProfile`

**Classificazione**: React Hook, Cache Hook, Client Component, Async  
**Tipo**: `() => { currentProfileId: string | null, getCurrentProfileId: () => Promise<string> }`

**Parametri**: Nessuno

**Output**: Oggetto con:

- `currentProfileId`: `string | null` - Profile ID cached (null se non ancora caricato)
- `getCurrentProfileId()`: `Promise<string>` - Funzione per ottenere profile ID (usa cache se disponibile)

**Descrizione**: Hook per gestione profile ID con caching:

- Prima chiamata: Query database per ottenere profile ID da `user_id`
- Chiamate successive: Ritorna profile ID cached (evita query ripetute)
- Cache persistente durante lifecycle componente

---

## 🔄 Flusso Logico

### Get Current Profile ID

1. Se `currentProfileId` è già cached → ritorna immediatamente
2. Altrimenti:
   - Ottiene `user` da `supabase.auth.getUser()`
   - Query `profiles` WHERE `user_id = user.id`
   - Estrae `profile.id`
   - Salva in `currentProfileId` (cache)
   - Ritorna `profile.id`

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase)

**Utilizzato da**: Altri hooks chat (`useChatMessages`, `useChatConversations`) per ottenere profile ID

---

## ⚠️ Note Tecniche

- **Caching**: Cache profile ID in stato locale per evitare query ripetute
- **Error Handling**: Lancia errore se utente non autenticato o profilo non trovato
- **Performance**: Evita query database ripetute durante lifecycle componente

---

**Ultimo aggiornamento**: 2025-02-01T23:58:00Z
