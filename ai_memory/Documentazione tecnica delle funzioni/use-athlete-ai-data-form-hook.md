# 📚 Documentazione Tecnica: useAthleteAIDataForm

**Percorso**: `src/hooks/athlete-profile/use-athlete-ai-data-form.ts`  
**Tipo Modulo**: React Hook (Form Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:50:00Z

---

## 📋 Panoramica

Hook per gestione form dati AI atleta. Gestisce stato form, validazione, sanitizzazione, salvataggio con React Query mutation per dati AI (insights, raccomandazioni, pattern, predizioni, score).

---

## 🔧 Funzioni e Export

### 1. `useAthleteAIDataForm`

**Classificazione**: React Hook, Form Management Hook, Client Component  
**Tipo**: `(props: UseAthleteAIDataFormProps) => UseAthleteAIDataFormReturn`

**Parametri**:

- `aiData` (object | null): Dati AI esistenti
  - `insights_aggregati`: `Record<string, unknown>`
  - `raccomandazioni`: `Array<{ tipo, descrizione, priorita, azione? }>`
  - `pattern_rilevati`: `Array<{ tipo, descrizione, frequenza }>`
  - `predizioni_performance`: `Array<{ metrica, valore_predetto, data_target, confidenza }>`
  - `score_engagement`: `number | null` (0-100)
  - `score_progresso`: `number | null` (0-100)
  - `fattori_rischio`: `string[]`
  - `note_ai`: `string | null`
- `athleteId` (string): UUID dell'atleta

**Output**: Oggetto con:

- `isEditing`, `setIsEditing`, `formData`, `setFormData`, `handleSave`, `handleCancel`, `updateMutation`

**Descrizione**: Hook per gestione form dati AI con sanitizzazione array complessi e validazione score.

---

## 🔄 Flusso Logico

### Sanitizzazione

- **Score**: Range 0-100
- **Array raccomandazioni/pattern/predizioni**: Sanitizzazione campi stringa
- **JSONB insights**: Sanitizzazione oggetti annidati
- **Array fattori_rischio**: Sanitizzazione elementi (max 200 char)

---

## 📊 Dipendenze

**Dipende da**: `useUpdateAthleteAIData`, `useToast`, `handleAthleteProfileSave`, sanitize utilities, `updateAthleteAIDataSchema`

---

**Ultimo aggiornamento**: 2025-02-01T23:50:00Z
