# 📚 Documentazione Tecnica: useAthleteAdministrative / useUpdateAthleteAdministrative / useUploadDocumentoContrattuale

**Percorso**: `src/hooks/athlete-profile/use-athlete-administrative.ts`  
**Tipo Modulo**: React Hook (React Query Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:55:00Z

---

## 📋 Panoramica

Hook React Query per gestione dati amministrativi atleta. Fornisce query per GET dati amministrativi, mutation per UPDATE, e mutation per upload documenti contrattuali.

---

## 🔧 Funzioni e Export

### 1. `useAthleteAdministrative`

**Tipo**: `(athleteId: string | null) => UseQueryResult<AthleteAdministrativeData | null>`

**Descrizione**: Hook per ottenere dati amministrativi atleta (abbonamenti, lezioni, pagamenti).

**Configurazione**:

- `staleTime`: 5 minuti (dati cambiano raramente)
- `gcTime`: 30 minuti

---

### 2. `useUpdateAthleteAdministrative`

**Tipo**: `(athleteId: string | null) => UseMutationResult<AthleteAdministrativeData, Error, AthleteAdministrativeDataUpdate>`

**Descrizione**: Hook per aggiornare dati amministrativi. `lezioni_rimanenti` viene calcolato automaticamente dal trigger database.

**Note**: `lezioni_rimanenti` non viene aggiornato manualmente (calcolato da trigger).

---

### 3. `useUploadDocumentoContrattuale`

**Tipo**: `(athleteId: string | null) => UseMutationResult<DocumentoContrattuale, Error, UploadDocumentoContrattualeParams>`

**Parametri Mutation**:

- `file`: File da caricare
- `nome`: Nome documento
- `tipo`: Tipo documento
- `note?`: Note opzionali

**Descrizione**: Hook per upload documento contrattuale. Processo:

1. Upload file a Supabase Storage (`athlete-documents` bucket)
2. Ottieni URL pubblico
3. Crea oggetto `DocumentoContrattuale`
4. Aggiunge a array `documenti_contrattuali` nel record amministrativo
5. Rollback automatico se database update fallisce (elimina file caricato)

---

## 📊 Dipendenze

**Dipende da**: `@tanstack/react-query`, `createClient` (Supabase), `handleApiError`, Zod schemas

**Utilizzato da**: `useAthleteAdministrativeForm`, componenti tab amministrativo

---

**Ultimo aggiornamento**: 2025-02-01T23:55:00Z
