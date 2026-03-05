# 📚 Documentazione Tecnica: usePTProfile

**Percorso**: `src/hooks/use-pt-profile.ts`  
**Tipo Modulo**: React Hook (Profile Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione profilo PT. Carica profilo dal database, calcola statistiche (mock), e fornisce funzioni per salvataggio.

---

## 🔧 Funzioni e Export

### 1. `usePTProfile`

**Classificazione**: React Hook, Profile Hook, Client Component, Async  
**Tipo**: `() => UsePTProfileReturn`

**Parametri**: Nessuno

**Output**: Oggetto con:

- **Stato**:
  - `authUserId`: `string` - ID utente autenticato
  - `profile`: `Profile | null` - Profilo PT completo
    - Dati base: nome, cognome, email, phone, data_nascita, data_iscrizione, specializzazione, certificazioni, avatar
    - `stats`: Statistiche (clienti_attivi, sessioni_mese, anni_esperienza, valutazione_media, certificazioni_conseguite, revenue_mensile)
    - `badge`: Array badge (mock)
  - `loading`: `boolean` - Stato caricamento
  - `isSaving`: `boolean` - Stato salvataggio
- **Funzioni**:
  - `saveProfile(profileData)`: `(profileData: Partial<Profile>) => Promise<{ success: boolean, error?: string }>` - Salva profilo
  - `updateProfileField(field, value)`: `(field: keyof Profile, value: any) => void` - Aggiorna campo locale
  - `refetch()`: `() => Promise<void>` - Ricarica profilo

**Descrizione**: Hook per profilo PT con:

- Fetch profilo da `profiles` WHERE `user_id = authUserId`
- Statistiche mock (TODO: calcolare da dati reali)
- Salvataggio via `handlePTProfileSave` utility
- Aggiornamento locale stato

---

## 🔄 Flusso Logico

### Inizializzazione

1. **Fetch Auth User ID**:
   - `supabase.auth.getUser()` → `authUserId`

2. **Load Profile** (quando `authUserId` disponibile):
   - SELECT `profiles` WHERE `user_id = authUserId`
   - Mappa a `Profile` con:
     - Dati base da `profiles`
     - Stats mock (TODO: calcolare da dati reali)
     - Badge mock

### Save Profile

1. Chiama `handlePTProfileSave(authUserId, profileData)`
2. Se successo → aggiorna `profile` state locale
3. Ritorna `{ success, error }`

### Update Profile Field

1. Aggiorna `profile` state locale: `{ ...prev, [field]: value }`

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`), `createClient` (Supabase), `handlePTProfileSave` (utility)

**Utilizzato da**: Pagina profilo PT

---

## ⚠️ Note Tecniche

- **Stats Mock**: Statistiche sono mock (TODO: calcolare da dati reali)
- **Badge Mock**: Badge array vuoto (TODO: implementare sistema badge)
- **Save Utility**: Usa utility esterna `handlePTProfileSave` per salvataggio

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
