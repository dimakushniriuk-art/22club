# Componente: Switch (UI Base)

## 📋 Descrizione

Componente switch/toggle per attivazione/disattivazione. Supporta stato controllato/non controllato, disabled state, animazioni smooth e accessibilità. Utilizzato per toggle, settings e attivazione funzionalità.

## 📁 Percorso File

`src/components/ui/switch.tsx`

## 🔧 Props

```typescript
interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}
```

### Dettaglio Props

- **`checked`** (boolean, optional): Stato controllato
- **`defaultChecked`** (boolean, optional): Stato iniziale non controllato (default: false)
- **`onCheckedChange`** (function, optional): Callback per cambio stato
- **`disabled`** (boolean, optional): Disabilita switch (default: false)
- **`className`** (string, optional): Classi CSS aggiuntive
- **`id`** (string, optional): ID elemento

## 📦 Dipendenze

### React

- `React.useState` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Toggle State**: Attivazione/disattivazione
2. **Controlled/Uncontrolled**: Supporto per entrambi i pattern
3. **Disabled State**: Disabilitazione switch
4. **Animation**: Animazione smooth per toggle
5. **Accessibility**: ARIA attributes (role="switch", aria-checked)

### Funzionalità Avanzate

- **State Management**: Gestione stato interno e controllato
- **Transform Animation**: Transform translateX per animazione thumb
- **Color States**: Colori diversi per checked/unchecked
- **Callback Support**: onCheckedChange callback

### UI/UX

- Switch con rounded-full
- Thumb con transform animation
- Colori dinamici per stato
- Disabled state con opacity
- Layout responsive

## 🎨 Struttura UI

```
Button (role="switch")
  └── Span (thumb)
      └── Transform translateX per posizione
```

## 💡 Esempi d'Uso

```tsx
// Switch non controllato
<Switch defaultChecked={false} onCheckedChange={(checked) => console.log(checked)} />

// Switch controllato
<Switch
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
/>

// Switch disabilitato
<Switch disabled defaultChecked={true} />

// Switch con callback
<Switch
  checked={notifications}
  onCheckedChange={(checked) => {
    updateSettings({ notifications: checked })
  }}
/>
```

## 📝 Note Tecniche

- Gestione stato interno con useState se non controllato
- Controlled pattern: checked prop controlla stato
- Uncontrolled pattern: defaultChecked per stato iniziale
- Transform animation: translate-x-1 (unchecked) → translate-x-6 (checked)
- Colori: bg-brand (checked), bg-background-tertiary (unchecked)
- Disabled state con opacity-50 e cursor-not-allowed
- Dimensioni: h-6 w-11 per container, h-4 w-4 per thumb
- ARIA attributes: role="switch", aria-checked
- Transizioni smooth per transform e colori
- Layout responsive
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
