# 📚 Documentazione Tecnica: useAthleteTabPrefetch

**Percorso**: `src/hooks/athlete-profile/use-athlete-tab-prefetch.ts`  
**Tipo Modulo**: React Hook (Prefetch Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:55:00Z

---

## 📋 Panoramica

Hook per prefetch dati tab profilo atleta. Precarica dati quando utente passa il mouse su un tab per migliorare performance UX (dati pronti quando tab viene aperto).

---

## 🔧 Funzioni e Export

### 1. `useAthleteTabPrefetch`

**Classificazione**: React Hook, Prefetch Hook, Client Component, Async  
**Tipo**: `(athleteUserId: string | null) => { handlePrefetchTab: (tabName: string) => void }`

**Parametri**:

- `athleteUserId` (string | null): UUID dell'atleta (user_id)

**Output**: Oggetto con:

- `handlePrefetchTab(tabName)`: `void` - Prefetch dati per tab specifico

**Tab Supportati**:

- `'anagrafica'` - Dati anagrafici da `profiles`
- `'medica'` - Dati medici da `athlete_medical_data`
- `'fitness'` - Dati fitness da `athlete_fitness_data`
- `'motivazionale'` - Dati motivazionali da `athlete_motivational_data`
- `'nutrizione'` - Dati nutrizionali da `athlete_nutrition_data`
- `'massaggio'` - Dati massaggi da `athlete_massage_data`
- `'amministrativo'` - Dati amministrativi da `athlete_administrative_data`
- `'smart-tracking'` - Dati smart tracking da `athlete_smart_tracking_data` (ultimo record)
- `'ai-data'` - Dati AI da `athlete_ai_data` (ultimo record)

**Descrizione**: Hook per prefetch intelligente dati tab. Ogni tab ha query key e query function mappati.

---

## 🔄 Flusso Logico

### Prefetch Tab

1. Utente passa mouse su tab → `handlePrefetchTab(tabName)`
2. Hook verifica `tabPrefetchMap[tabName]`
3. Se mappato → `queryClient.prefetchQuery()` con:
   - `queryKey`: Query key specifica tab
   - `queryFn`: Query function Supabase
   - `staleTime`: 5 minuti (stesso dei hook)
4. Dati precaricati in React Query cache

---

## 📊 Dipendenze

**Dipende da**: `useQueryClient` (React Query), `createSupabaseClient`, query key factories di tutti gli hooks profilo

**Utilizzato da**: Componenti tab profilo atleta (onMouseEnter event)

---

## ⚠️ Note Tecniche

- **Performance**: Prefetch migliora UX - dati pronti quando tab viene aperto
- **Cache**: Usa React Query cache con `staleTime` 5 minuti
- **Error Handling**: Gestisce errori `PGRST116` (record non trovato) come `null`

---

**Ultimo aggiornamento**: 2025-02-01T23:55:00Z
