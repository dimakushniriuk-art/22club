# 📚 Documentazione Tecnica: useSmartTrackingForm

**Percorso**: `src/hooks/athlete-profile/use-smart-tracking-form.ts`  
**Tipo Modulo**: React Hook (Form Management Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-01T23:50:00Z

---

## 📋 Panoramica

Hook per gestione form dati smart tracking atleta. Gestisce dati wearable (passi, calorie, distanza, battito cardiaco, sonno, attività).

---

## 🔧 Funzioni e Export

### 1. `useSmartTrackingForm`

**Parametri**:

- `athleteId` (string): UUID dell'atleta
- `smartTracking` (AthleteSmartTrackingData | null | undefined): Dati smart tracking esistenti

**Output**: Oggetto con:

- `isEditing`, `setIsEditing`, `formData`, `setFormData`
- `handleSave`, `handleCancel`
- `isPending`: boolean (stato mutation)

**Descrizione**: Hook per gestione form smart tracking con validazione data_rilevazione obbligatoria.

---

## 🔄 Funzionalità Speciali

### Validazione Data Rilevazione

- `data_rilevazione` è obbligatoria per salvataggio
- Schema Zod esteso per includere `data_rilevazione`
- Validazione formato data ISO

### Sanitizzazione Metriche

- **Passi**: 0-100000
- **Calorie**: 0-20000
- **Distanza**: 0-1000 km
- **Battito cardiaco**: 30-250 bpm
- **Ore sonno**: 0-24
- **Attività minuti**: 0-1440 (24h)

---

**Ultimo aggiornamento**: 2025-02-01T23:50:00Z
