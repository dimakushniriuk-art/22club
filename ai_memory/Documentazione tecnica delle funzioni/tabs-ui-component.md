# Componente: Tabs (UI Base)

## 📋 Descrizione

Componente tabs per navigazione a tab. Supporta 3 varianti (default, pills, underline), stato controllato/non controllato, sub-componenti (List, Trigger, Content) e gestione stato con Context API. Utilizzato per navigazione, sezioni e contenuti organizzati.

## 📁 Percorso File

`src/components/ui/tabs.tsx`

## 🔧 Props

### Tabs Props

```typescript
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}
```

### TabsList Props

```typescript
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pills' | 'underline'
}
```

### TabsTrigger Props

```typescript
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  variant?: 'default' | 'pills' | 'underline'
  disabled?: boolean
}
```

### TabsContent Props

```typescript
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}
```

## 📦 Dipendenze

### React

- `React.createContext`, `React.useContext`, `React.forwardRef`, `React.useState`, `React.useCallback` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **3 Varianti**: default, pills, underline
2. **State Management**: Stato controllato o non controllato
3. **Context API**: Gestione stato con React Context
4. **Active State**: Evidenziazione tab attiva
5. **Sub-components**: List, Trigger, Content
6. **Disabled State**: Tab disabilitati

### Funzionalità Avanzate

- **Controlled/Uncontrolled**: Supporto per entrambi i pattern
- **Variant Styling**: Stili diversi per ogni variante
- **Active Indicators**: Indicatori visivi per tab attiva
- **Focus States**: Focus ring per accessibilità
- **Transparent Override**: Supporto per bg-transparent

### UI/UX

- Tabs con layout flex
- Active state con background o border
- Hover effects
- Focus ring per accessibilità
- Transizioni smooth
- Layout responsive

## 🎨 Struttura UI

```
Tabs (Context Provider)
  ├── TabsList
  │   └── TabsTrigger[] (per ogni tab)
  └── TabsContent[] (per ogni tab)
      └── Contenuto tab
```

## 💡 Esempi d'Uso

```tsx
// Tabs base
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Contenuto 1</TabsContent>
  <TabsContent value="tab2">Contenuto 2</TabsContent>
</Tabs>

// Tabs controllato
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList variant="pills">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="settings">...</TabsContent>
</Tabs>

// Tabs underline
<Tabs>
  <TabsList variant="underline">
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">...</TabsContent>
</Tabs>
```

## 📝 Note Tecniche

- Utilizza React Context per gestione stato
- Supporto controlled/uncontrolled pattern
- 3 varianti: default (rounded-lg), pills (rounded-full), underline (border-bottom)
- Active state con data-[state=active]
- Variant styling: default (bg-elevated), pills (bg-brand), underline (border-brand)
- Focus ring cyan-500 per accessibilità
- Disabled state con opacity-50 e pointer-events-none
- Transparent override support per className
- Transizioni smooth (duration-200)
- Layout responsive
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
