# 📚 Documentazione Tecnica: useAthleteMassageForm

**Percorso**: `src/hooks/athlete-profile/use-athlete-massage-form.ts`  
**Tipo Modulo**: React Hook (Form Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:50:00Z

---

## 📋 Panoramica

Hook per gestione form dati massaggi atleta. Gestisce preferenze tipo massaggio, zone problematiche, allergie, storico massaggi.

---

## 🔧 Funzioni e Export

### 1. `useAthleteMassageForm`

**Parametri**:

- `massage` (AthleteMassageData | null): Dati massaggi esistenti
- `athleteId` (string): UUID dell'atleta

**Output**: Oggetto con:

- `isEditing`, `setIsEditing`, `formData`, `setFormData`
- `newArrayItem`, `setNewArrayItem`
- `showMassaggioForm`, `setShowMassaggioForm`
- `handleSave`, `handleCancel`
- `addArrayItem`, `removeArrayItem`
- `toggleTipoMassaggio`
- `addMassaggio`, `removeMassaggio`
- `updateMutation`

**Descrizione**: Hook per gestione form massaggi con gestione array e storico.

---

## 🔄 Funzionalità Speciali

### Gestione Tipo Massaggio

- `toggleTipoMassaggio(tipo)`: Toggle selezione tipo massaggio (array `preferenze_tipo_massaggio`)

### Storico Massaggi

- `addMassaggio()`: Aggiunge entry storico con tipo, data, note
- `removeMassaggio(index)`: Rimuove entry storico

---

**Ultimo aggiornamento**: 2025-02-01T23:50:00Z
