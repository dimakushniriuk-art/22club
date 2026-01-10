# 📚 Documentazione Tecnica: API Admin Statistics

**Percorso**: `src/app/api/admin/statistics/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per statistiche avanzate admin. Fornisce statistiche complete su utenti, pagamenti, appuntamenti, documenti e comunicazioni con calcoli di crescita, distribuzioni e trend mensili.

---

## 🔧 Endpoints

### 1. `GET /api/admin/statistics`

**Classificazione**: API Route, GET Handler, Admin Only  
**Autenticazione**: Richiesta (session)  
**Autorizzazione**: Solo ruolo `admin`

**Query Parameters**: Nessuno

**Response Success** (200):

```typescript
{
  users: {
    total: number
    active: number
    thisMonth: number
    growth: number // percentuale crescita vs mese precedente
    byRole: Record<string, number> // distribuzione per ruolo
    byMonth: Array<{ month: string; count: number }> // ultimi 6 mesi
  }
  payments: {
    totalRevenue: number
    thisMonth: number
    growth: number // percentuale crescita vs mese precedente
    byMethod: Record<string, number> // distribuzione metodi pagamento
    byMonth: Array<{ month: string; revenue: number }> // ultimi 6 mesi
  }
  appointments: {
    total: number
    thisMonth: number
    byStatus: Record<string, number> // distribuzione per status
  }
  documents: {
    total: number
    byStatus: Record<string, number> // distribuzione per status
    expired: number // documenti scaduti non ancora marcati
  }
  communications: {
    total: number
    totalSent: number
    totalDelivered: number
    totalOpened: number
    totalFailed: number
    deliveryRate: number // percentuale
    openRate: number // percentuale
  }
}
```

**Response Error**:

- `401`: Non autenticato
- `403`: Non autorizzato (non admin)
- `500`: Errore server

**Descrizione**: Endpoint statistiche avanzate con:

- **Statistiche Utenti**:
  - Totale, attivi, nuovi questo mese
  - Crescita percentuale vs mese precedente
  - Distribuzione per ruolo
  - Crescita ultimi 6 mesi
- **Statistiche Pagamenti**:
  - Revenue totale e questo mese
  - Crescita percentuale vs mese precedente
  - Distribuzione metodi pagamento
  - Revenue ultimi 6 mesi
- **Statistiche Appuntamenti**:
  - Totale, questo mese
  - Distribuzione per status
- **Statistiche Documenti**:
  - Totale, distribuzione per status
  - Documenti scaduti non ancora marcati
- **Statistiche Comunicazioni**:
  - Totali sent/delivered/opened/failed
  - Delivery rate e open rate

---

## 🔄 Flusso Logico

### Calcolo Statistiche

1. **Autenticazione e Autorizzazione**:
   - Verifica session
   - Verifica ruolo `admin`

2. **Calcolo Date**:
   - `startOfMonth`: Inizio mese corrente
   - `startOfLastMonth`: Inizio mese precedente
   - `endOfLastMonth`: Fine mese precedente

3. **Statistiche Utenti**:
   - Fetch tutti i profili
   - Filtra per mese corrente/precedente
   - Calcola crescita: `((thisMonth - lastMonth) / lastMonth) * 100`
   - Aggrega per ruolo
   - Calcola crescita ultimi 6 mesi

4. **Statistiche Pagamenti**:
   - Fetch pagamenti (escludi reversals)
   - Calcola revenue totale e mensile
   - Calcola crescita percentuale
   - Aggrega per metodo pagamento
   - Calcola revenue ultimi 6 mesi

5. **Statistiche Appuntamenti**:
   - Fetch appuntamenti
   - Conta questo mese
   - Aggrega per status

6. **Statistiche Documenti**:
   - Fetch documenti
   - Aggrega per status
   - Conta documenti scaduti non marcati

7. **Statistiche Comunicazioni**:
   - Fetch comunicazioni (gestisce errore se tabella non esiste)
   - Somma totali sent/delivered/opened/failed
   - Calcola delivery rate e open rate

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Server Client (`createServerClient`)

**Utilizzato da**: Componente `AdminStatisticsContent`

---

## ⚠️ Note Tecniche

- **Error Handling**: Comunicazioni gestisce errore se tabella non esiste (non critico)
- **Date Calculations**: Usa `new Date()` per calcoli mese corrente/precedente
- **Growth Calculation**: Gestisce divisione per zero (se `lastMonth === 0` → growth = 0)
- **Reversals**: Pagamenti escludono `is_reversal === true` per revenue

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
