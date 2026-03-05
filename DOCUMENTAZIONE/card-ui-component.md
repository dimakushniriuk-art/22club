# Componente: Card (UI Base)

## 📋 Descrizione

Componente card principale del design system con sub-componenti (CardHeader, CardTitle, CardDescription, CardContent, CardFooter). Supporta 6 varianti, hoverable option e integrazione con design tokens. Utilizzato per contenitori, sezioni e layout.

## 📁 Percorso File

`src/components/ui/card.tsx`

## 🔧 Props

### Card Props

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'athlete' | 'trainer' | 'admin'
  hoverable?: boolean
}
```

### CardHeader Props

```typescript
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
}
```

### CardTitle Props

```typescript
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
```

### CardDescription Props

```typescript
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'muted' | 'subtle'
}
```

### CardContent Props

```typescript
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
}
```

### CardFooter Props

```typescript
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
  justify?: 'start' | 'center' | 'end' | 'between'
}
```

## 📦 Dipendenze

### React

- `React.forwardRef` da `react`

### Config

- `designSystem` da `@/config/design-system`
- `masterAnimations`, `masterCards` da `@/config/master-design.config`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **6 Varianti Card**: default, elevated, outlined, athlete, trainer, admin
2. **Hoverable Option**: Effetti hover con lift e glow
3. **Sub-components**: Header, Title, Description, Content, Footer
4. **Padding Variants**: Padding personalizzabile per header, content, footer
5. **Title Sizes**: 4 dimensioni per titolo
6. **Description Variants**: 3 varianti per descrizione
7. **Footer Justify**: 4 opzioni di allineamento footer

### Funzionalità Avanzate

- **Design Tokens**: Integrazione con design system e master cards
- **Transparent Override**: Supporto per bg-transparent in className
- **Hover Effects**: Lift e glow animations da master animations
- **Role-based Variants**: Varianti specifiche per ruolo (athlete, trainer, admin)
- **Responsive Padding**: Padding responsive per sub-components

### UI/UX

- Card con rounded-lg da design system
- Gradient background per varianti
- Border coordinato con variante
- Hover effects con lift e glow
- Layout flessibile con sub-components
- Spacing consistente

## 🎨 Struttura UI

```
Card (div con variant e hoverable)
  ├── CardHeader (opzionale)
  │   ├── CardTitle (opzionale)
  │   └── CardDescription (opzionale)
  ├── CardContent
  └── CardFooter (opzionale)
```

## 💡 Esempi d'Uso

```tsx
// Card base
<Card variant="default" hoverable>
  <CardHeader>
    <CardTitle>Titolo</CardTitle>
    <CardDescription>Descrizione</CardDescription>
  </CardHeader>
  <CardContent>
    Contenuto
  </CardContent>
  <CardFooter>
    Azioni
  </CardFooter>
</Card>

// Card con variante ruolo
<Card variant="athlete">
  <CardContent padding="lg">
    Contenuto atleta
  </CardContent>
</Card>

// Card con footer allineato
<Card>
  <CardContent>Contenuto</CardContent>
  <CardFooter justify="between">
    <Button>Annulla</Button>
    <Button>Salva</Button>
  </CardFooter>
</Card>
```

## 📝 Note Tecniche

- Utilizza `React.forwardRef` per ref forwarding
- Integrazione con design tokens e master cards
- 6 varianti con stili predefiniti
- Hoverable con lift e glow animations
- Supporto per bg-transparent override in className
- Sub-components: Header, Title, Description, Content, Footer
- Padding variants: sm (p-3), md (p-4), lg (p-6)
- Title sizes: sm (text-lg), md (text-xl), lg (text-2xl), xl (text-3xl)
- Description variants: default, muted, subtle
- Footer justify: start, center, end, between
- Transizioni da master animations
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
