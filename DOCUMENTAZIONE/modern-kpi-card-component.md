# Componente: ModernKPICard

## 📋 Descrizione

Componente card KPI moderno e riusabile con supporto per colori personalizzabili, link, click handler e animazioni. Utilizzato per visualizzare metriche chiave con stile moderno e gradiente.

## 📁 Percorso File

`src/components/dashboard/modern-kpi-card.tsx`

## 🔧 Props

```typescript
interface ModernKPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: KPIColor
  href?: string
  onClick?: () => void
  animationDelay?: string
}

type KPIColor = 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'indigo' | 'teal' | 'red' | 'gray'
```

### Dettaglio Props

- **`title`** (string, required): Titolo della card KPI
- **`value`** (string | number, required): Valore da visualizzare
- **`icon`** (ReactNode, required): Icona da mostrare
- **`color`** (KPIColor, optional): Colore del tema (default: 'blue')
- **`href`** (string, optional): Link opzionale (trasforma la card in link)
- **`onClick`** (function, optional): Handler click opzionale
- **`animationDelay`** (string, optional): Delay per animazioni CSS

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Link` da `next/link`

## ⚙️ Funzionalità

### Core

1. **Card KPI**: Visualizza titolo, valore e icona
2. **Temi Colore**: 9 temi colore predefiniti
3. **Interattività**: Supporta link o click handler
4. **Gradient Background**: Background con gradiente basato sul colore
5. **Animazioni**: Supporto per animation delay

### Funzionalità Avanzate

- **9 Temi Colore**: blue, green, orange, purple, cyan, indigo, teal, red, gray
- **Gradient Overlay**: Overlay gradiente sopra la card
- **Hover Effects**: Effetti hover sui bordi
- **Link Wrapper**: Wrapper Link se href è fornito
- **Click Handler**: Supporto per onClick se fornito
- **Backdrop Blur**: Effetto blur per modernità

### UI/UX

- Card con gradiente e backdrop blur
- Icona in cerchio colorato
- Titolo e valore ben visibili
- Hover effects sui bordi
- Layout responsive
- Min-height per consistenza

## 🎨 Struttura UI

```
Card (con gradiente e blur)
  ├── Gradient Overlay (top 60%)
  └── CardContent
      └── Flex Container
          ├── Titolo (text-sm)
          └── Flex Row
              ├── Valore (text-2xl font-bold)
              └── Icon Container (rounded-full)
                  └── Icon
```

## 💡 Esempi d'Uso

```tsx
// Card base
<ModernKPICard
  title="Totale Clienti"
  value={150}
  icon={<Users />}
  color="teal"
/>

// Card con link
<ModernKPICard
  title="Schede Attive"
  value={25}
  icon={<Target />}
  color="cyan"
  href="/dashboard/schede"
/>

// Card con click handler
<ModernKPICard
  title="Nuovi Appuntamenti"
  value={12}
  icon={<Calendar />}
  color="green"
  onClick={() => setShowModal(true)}
/>
```

## 📝 Note Tecniche

- Componente riusabile e generico
- 9 temi colore con classi Tailwind predefinite
- Supporto per href (Link) o onClick (div)
- Gradient overlay per effetto moderno
- Backdrop blur per profondità
- Min-height per consistenza visiva
- Hover effects sui bordi
- Animation delay support per animazioni CSS

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
