# ComunicazioniPage - Documentazione Tecnica

**File**: `src/app/dashboard/comunicazioni/page.tsx`  
**Tipo**: Next.js Page Component  
**Righe**: 536  
**Stato**: ⚠️ INCOMPLETO (Mock Data)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Comunicazioni / Messaggistica di Massa
- **Tipo**: Next.js Page Component
- **Dipendenze**: React, UI Components (Card, Button, Input, Tabs, Badge)
- **Utilizzato da**: Route `/dashboard/comunicazioni`

---

## 🎯 Obiettivo

Gestire comunicazioni di massa (push, email, SMS) per PT/Admin:

- Visualizzazione comunicazioni (inviate, bozze)
- Creazione nuova comunicazione
- Filtri per tipo e stato
- Statistiche comunicazioni (destinatari, consegnati, aperti)

**Nota**: Attualmente usa mock data. Funzionalità non completamente implementata.

---

## 📥 Parametri

Nessun parametro (page component)

---

## 📤 Output / Return Value

Componente React che renderizza pagina comunicazioni

---

## 🔄 Flusso Logico

### 1. Stato Componente

- `comunicazioni`: Array mock comunicazioni
- `activeTab`: 'tutte' | 'inviate' | 'bozze'
- `showNewModal`: boolean (modal creazione)
- `searchTerm`: string (ricerca)

### 2. Filtri

- Filtro per tab (tutte, inviate, bozze)
- Filtro ricerca (titolo, messaggio)
- Filtro per tipo (push, email, SMS)

### 3. Visualizzazione

- Lista comunicazioni con badge stato
- Statistiche per comunicazione (destinatari, consegnati, aperti)
- Icone per tipo comunicazione

### 4. Creazione (Non Implementata)

- Modal creazione (UI presente ma logica non implementata)
- Form per titolo, messaggio, tipo, destinatari

---

## 🗄️ Database

**Nessuna tabella database attuale**

**Futuro**: Tabelle da creare:

- `communications` - comunicazioni inviate
- `communication_recipients` - destinatari comunicazioni
- `communication_stats` - statistiche comunicazioni

---

## ⚠️ Errori Possibili

1. **Funzionalità non implementata**: Tutte le funzionalità sono mock

---

## 🔗 Dipendenze Critiche

- **UI Components**: Card, Button, Input, Tabs, Badge da `@/components/ui`
- **Icons**: Lucide React icons
- **Futuro**: Sistema notifiche push/email/SMS

---

## 📝 Esempio Utilizzo

```typescript
// Accessibile via route: /dashboard/comunicazioni
// Non richiede parametri
```

---

## 🐛 Problemi Identificati

1. **⚠️ Funzionalità non implementata**: Tutto è mock data, nessuna logica reale
2. **⚠️ Database mancante**: Nessuna tabella per comunicazioni
3. **⚠️ Integrazione notifiche**: Non integrato con sistema notifiche esistente
4. **⚠️ Sistema email/SMS**: Nessun servizio email/SMS configurato

---

## 📊 Metriche

- **Complessità Ciclomatica**: Bassa (~5-7) - solo UI
- **Dipendenze Esterne**: UI Components
- **Side Effects**: No (solo mock)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificato che funzionalità non è implementata (mock)
- ✅ Mappate dipendenze future

---

**Stato**: ⚠️ DOCUMENTATO (Mock Data - Funzionalità Non Implementata)
