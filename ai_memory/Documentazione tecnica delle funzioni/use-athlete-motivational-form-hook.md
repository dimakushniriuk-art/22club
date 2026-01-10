# 📚 Documentazione Tecnica: useAthleteMotivationalForm

**Percorso**: `src/hooks/athlete-profile/use-athlete-motivational-form.ts`  
**Tipo Modulo**: React Hook (Form Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:50:00Z

---

## 📋 Panoramica

Hook per gestione form dati motivazionali atleta. Gestisce motivazioni, ostacoli, preferenze ambiente/compagnia, livello motivazione, storico abbandoni.

---

## 🔧 Funzioni e Export

### 1. `useAthleteMotivationalForm`

**Parametri**:

- `motivational` (object | null): Dati motivazionali esistenti
- `athleteId` (string): UUID dell'atleta

**Output**: Oggetto con:

- `isEditing`, `setIsEditing`, `formData`, `setFormData`
- `newArrayItem`, `setNewArrayItem`
- `showAbbandonoForm`, `setShowAbbandonoForm`
- `handleSave`, `handleCancel`
- `addArrayItem`, `removeArrayItem`
- `togglePreferenza`
- `addAbbandono`, `removeAbbandono`
- `updateMutation`

**Descrizione**: Hook per gestione form motivazionale con gestione preferenze e storico abbandoni.

---

## 🔄 Funzionalità Speciali

### Gestione Preferenze

- `togglePreferenza(field, value)`: Toggle preferenza ambiente/compagnia (array)

### Storico Abbandoni

- `addAbbandono()`: Aggiunge entry storico con data, motivo, durata_mesi
- `removeAbbandono(index)`: Rimuove entry storico

---

**Ultimo aggiornamento**: 2025-02-01T23:50:00Z
