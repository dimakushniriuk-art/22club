# 📚 Documentazione Tecnica: useAthleteFitnessForm

**Percorso**: `src/hooks/athlete-profile/use-athlete-fitness-form.ts`  
**Tipo Modulo**: React Hook (Form Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:50:00Z

---

## 📋 Panoramica

Hook per gestione form dati fitness atleta. Gestisce livello esperienza, obiettivi, preferenze allenamento, attività precedenti, infortuni pregressi.

---

## 🔧 Funzioni e Export

### 1. `useAthleteFitnessForm`

**Parametri**:

- `fitness` (object | null): Dati fitness esistenti
- `athleteId` (string): UUID dell'atleta

**Output**: Oggetto con:

- `isEditing`, `setIsEditing`, `formData`, `setFormData`
- `newArrayItem`, `setNewArrayItem`
- `showInfortunioForm`, `setShowInfortunioForm`
- `handleSave`, `handleCancel`
- `addArrayItem`, `removeArrayItem`
- `toggleObiettivoSecondario`
- `togglePreferenzaOrario`
- `addInfortunio`, `removeInfortunio`
- `updateMutation`

**Descrizione**: Hook per gestione form fitness con gestione obiettivi multipli e storico infortuni.

---

## 🔄 Funzionalità Speciali

### Gestione Obiettivi

- `toggleObiettivoSecondario(obiettivo)`: Toggle obiettivo secondario (array)

### Gestione Preferenze Orario

- `togglePreferenzaOrario(orario)`: Toggle preferenza orario allenamento (array)

### Storico Infortuni

- `addInfortunio()`: Aggiunge entry storico con data, tipo, recuperato, note
- `removeInfortunio(index)`: Rimuove entry storico

---

**Ultimo aggiornamento**: 2025-02-01T23:50:00Z
