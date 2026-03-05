# 📚 Documentazione Tecnica: useAthleteAdministrativeForm

**Percorso**: `src/hooks/athlete-profile/use-athlete-administrative-form.ts`  
**Tipo Modulo**: React Hook (Form Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:50:00Z

---

## 📋 Panoramica

Hook per gestione form dati amministrativi atleta. Gestisce abbonamenti, lezioni, pagamenti, e upload documenti contrattuali.

---

## 🔧 Funzioni e Export

### 1. `useAthleteAdministrativeForm`

**Parametri**:

- `administrative` (AthleteAdministrativeData | null): Dati amministrativi esistenti
- `athleteId` (string): UUID dell'atleta

**Output**: Oggetto con:

- `isEditing`, `setIsEditing`, `formData`, `setFormData`
- `showUploadDocumento`, `setShowUploadDocumento`
- `uploadFile`, `setUploadFile`
- `documentoData`, `setDocumentoData`
- `handleSave`, `handleCancel`, `handleUploadDocumento`
- `updateMutation`, `uploadDocumentoMutation`

**Descrizione**: Hook completo per gestione form amministrativo con upload documenti.

---

## 🔄 Funzionalità Speciali

### Upload Documento Contrattuale

1. Utente seleziona file → `setUploadFile(file)`
2. Compila nome, tipo, note → `setDocumentoData({ nome, tipo, note })`
3. `handleUploadDocumento()`:
   - Upload file a Supabase Storage (`athlete-documents` bucket)
   - Crea oggetto `DocumentoContrattuale`
   - Aggiunge a array `documenti_contrattuali` nel record amministrativo
   - Rollback automatico se database update fallisce

---

## 📊 Dipendenze

**Dipende da**: `useUpdateAthleteAdministrative`, `useUploadDocumentoContrattuale`, `useToast`, sanitize utilities

---

**Ultimo aggiornamento**: 2025-02-01T23:50:00Z
