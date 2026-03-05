# Componente: MotivationalAbandonmentsSection

## 📋 Descrizione

Sezione modulare per storico abbandoni. Gestisce array abbandoni storici con form per aggiungere nuovi (data, motivo, durata). Utilizzata in `AthleteMotivationalTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/motivational/motivational-abandonments-section.tsx`

## 🔧 Props

```typescript
interface MotivationalAbandonmentsSectionProps {
  isEditing: boolean
  abbandoni: AbbandonoStorico[]
  showAbbandonoForm: boolean
  newAbbandono: Partial<AbbandonoStorico>
  motivational: { storico_abbandoni } | null
  onShowAbbandonoFormChange
  onNewAbbandonoChange
  onAbbandonoAdd
  onAbbandonoRemove
}
```

## ⚙️ Funzionalità

- Lista abbandoni con card (data, motivo, durata)
- Form per aggiungere nuovo abbandono
- Bottone rimuovi per ogni abbandono
- Sanitizzazione input

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
