# 📚 Documentazione Tecnica: useAthleteProfileData

**Percorso**: `src/hooks/athlete-profile/use-athlete-profile-data.ts`  
**Tipo Modulo**: React Hook (Data Loading Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:55:00Z

---

## 📋 Panoramica

Hook per caricamento dati profilo atleta e statistiche. Carica profilo atleta da `profiles` e calcola statistiche (allenamenti totali/mese, schede attive, documenti scadenza, peso attuale).

---

## 🔧 Funzioni e Export

### 1. `useAthleteProfileData`

**Classificazione**: React Hook, Data Loading Hook, Client Component, Async  
**Tipo**: `(athleteId: string) => UseAthleteProfileDataReturn`

**Parametri**:

- `athleteId` (string): UUID dell'atleta (id da `profiles`)

**Output**: Oggetto con:

- `athlete`: `Cliente | null` - Profilo atleta completo
- `stats`: `AthleteStats` - Statistiche atleta
  - `allenamenti_totali`: number
  - `allenamenti_mese`: number
  - `schede_attive`: number
  - `documenti_scadenza`: number
  - `ultimo_accesso`: string | null
  - `peso_attuale`: number | null
- `loading`: `boolean` - Stato caricamento
- `error`: `string | null` - Errore caricamento
- `athleteUserId`: `string | null` - user_id estratto dal profilo
- `loadAthleteData()`: `() => Promise<void>` - Funzione reload manuale
- `loadAthleteStats()`: `() => Promise<void>` - Funzione reload statistiche

**Descrizione**: Hook completo per caricamento profilo atleta e statistiche con:

- Caricamento profilo da `profiles` (supporta role 'atleta' e 'athlete')
- Estrazione `user_id` per componenti profilo
- Calcolo statistiche da multiple tabelle
- Gestione errori robusta con fallback

---

## 🔄 Flusso Logico

### Caricamento Profilo

1. Query `profiles` WHERE `id = athleteId` AND `role IN ('atleta', 'athlete')`
2. Se errore con 'atleta' → retry con 'athlete'
3. Estrae `user_id` (obbligatorio)
4. Mappa a tipo `Cliente` con valori default

### Caricamento Statistiche

1. **Allenamenti totali**: COUNT `workout_logs` WHERE `atleta_id` o `athlete_id = athleteId`
2. **Allenamenti mese**: COUNT `workout_logs` WHERE data >= inizio mese
3. **Schede attive**: COUNT `workout_plans` WHERE `athlete_id = athleteId` AND `is_active = true`
4. **Documenti scadenza**: COUNT `documents` WHERE `athlete_id = athleteId` AND `status = 'in_scadenza'`
5. **Peso attuale**: SELECT `weight_kg` da `progress_logs` ORDER BY `date` DESC LIMIT 1

**Note**: Query hanno fallback per colonne alternative (`atleta_id` vs `athlete_id`).

---

## 📊 Dipendenze

**Dipende da**: `createClient` (Supabase), `useQueryClient` (React Query), tipo `Cliente`

**Utilizzato da**: Pagina profilo atleta (`atleti/[id]/page.tsx`)

---

## ⚠️ Note Tecniche

- **Fallback Colonne**: Gestisce sia `atleta_id` che `athlete_id` per compatibilità
- **Role Support**: Supporta sia 'atleta' che 'athlete' per compatibilità
- **user_id Extraction**: Estrae `user_id` necessario per componenti profilo
- **Error Handling**: Gestisce errori con retry e fallback

---

**Ultimo aggiornamento**: 2025-02-01T23:55:00Z
