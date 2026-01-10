# Componente: FitnessExperienceGoalsSection

## 📋 Descrizione

Sezione modulare per esperienza e obiettivi fitness. Gestisce livello esperienza (principiante, intermedio, avanzato, professionista), obiettivo primario e obiettivi secondari con toggle. Utilizzata in `AthleteFitnessTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/fitness/fitness-experience-goals-section.tsx`

## 🔧 Props

```typescript
interface FitnessExperienceGoalsSectionProps {
  isEditing: boolean
  formData: AthleteFitnessDataUpdate
  fitness: { livello_esperienza; obiettivo_primario; obiettivi_secondari } | null
  onFormDataChange: (data: Partial<AthleteFitnessDataUpdate>) => void
  onToggleObiettivoSecondario: (obiettivo: ObiettivoFitnessEnum) => void
}
```

## ⚙️ Funzionalità

- Select livello esperienza (4 opzioni)
- Select obiettivo primario (7 opzioni: dimagrimento, massa, forza, resistenza, tonificazione, riabilitazione, altro)
- Toggle obiettivi secondari (badge multipli)
- Visualizzazione read-only quando non editing

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
