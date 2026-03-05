# Componente: MotivationalMotivationsObstaclesSection

## 📋 Descrizione

Sezione modulare per motivazioni secondarie e ostacoli percepiti. Gestisce array motivazioni secondarie e ostacoli percepiti con add/remove. Utilizzata in `AthleteMotivationalTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/motivational/motivational-motivations-obstacles-section.tsx`

## 🔧 Props

```typescript
interface MotivationalMotivationsObstaclesSectionProps {
  isEditing: boolean
  motivazioniSecondarie: string[]
  ostacoliPercepiti: string[]
  newMotivazione: string
  newOstacolo: string
  motivational: { motivazioni_secondarie, ostacoli_percepiti } | null
  onMotivazioneAdd/Remove, onOstacoloAdd/Remove, onNewMotivazioneChange, onNewOstacoloChange
}
```

## ⚙️ Funzionalità

- Input + bottone aggiungi per motivazioni secondarie
- Lista badge motivazioni con rimozione
- Input + bottone aggiungi per ostacoli
- Lista badge ostacoli con rimozione
- Grid layout 2 colonne quando editing

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
