# 🎨 Componenti UI - Documentazione Completa

Documentazione di tutti i componenti UI disponibili in 22Club.

## 📦 Componenti Base

Tutti i componenti sono disponibili in `src/components/ui/` e esportati tramite `src/components/ui/index.ts`.

### Button (`button.tsx`)

Componente bottone con varianti e dimensioni.

```typescript
import { Button } from '@/components/ui'

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

**Props:**

- `variant`: `'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'`
- `size`: `'sm' | 'md' | 'lg'`
- `disabled`: `boolean`
- `loading`: `boolean`
- `icon`: `ReactNode` (opzionale)

**Varianti:**

- `primary`: Bottone principale (teal/cyan)
- `secondary`: Bottone secondario (grigio)
- `ghost`: Bottone trasparente
- `danger`: Bottone per azioni pericolose (rosso)
- `outline`: Bottone con bordo

### Card (`card.tsx`)

Container per contenuto strutturato.

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

**Componenti:**

- `Card`: Container principale
- `CardHeader`: Header con titolo
- `CardTitle`: Titolo card
- `CardContent`: Contenuto principale
- `CardFooter`: Footer (opzionale)

### Input (`input.tsx`)

Campo input con validazione e errori.

```typescript
import { Input } from '@/components/ui'

<Input
  type="text"
  name="email"
  placeholder="Email"
  value={value}
  onChange={handleChange}
  error={error}
/>
```

**Props:**

- `type`: HTML input types
- `name`: Nome campo
- `placeholder`: Placeholder text
- `value`: Valore controllato
- `onChange`: Handler cambio
- `error`: Messaggio errore
- `disabled`: `boolean`
- `required`: `boolean`

### Textarea (`textarea.tsx`)

Campo textarea multi-linea.

```typescript
import { Textarea } from '@/components/ui'

<Textarea
  name="notes"
  placeholder="Note..."
  value={value}
  onChange={handleChange}
  rows={4}
/>
```

### Select (`select.tsx`)

Dropdown select nativo HTML.

```typescript
import { Select } from '@/components/ui'

<Select
  name="status"
  value={value}
  onChange={handleChange}
>
  <option value="active">Attivo</option>
  <option value="inactive">Inattivo</option>
</Select>
```

**Nota**: Usa HTML `<select>` nativo, non Radix UI Select.

### Dialog (`dialog.tsx`)

Modal dialog per contenuto modale.

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    <div>Content</div>
  </DialogContent>
</Dialog>
```

**Componenti:**

- `Dialog`: Wrapper principale
- `DialogContent`: Contenuto modale
- `DialogHeader`: Header modale
- `DialogTitle`: Titolo modale
- `DialogDescription`: Descrizione (opzionale)

### Drawer (`drawer.tsx`)

Drawer laterale per mobile.

```typescript
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui'

<Drawer open={isOpen} onOpenChange={setIsOpen}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
    </DrawerHeader>
    <div>Content</div>
  </DrawerContent>
</Drawer>
```

### AlertDialog (`alert-dialog.tsx`)

Dialog per conferme e azioni critiche.

```typescript
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui'

<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Conferma azione</AlertDialogTitle>
      <AlertDialogDescription>
        Sei sicuro di voler procedere?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <div className="flex gap-2">
      <AlertDialogCancel>Annulla</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirm}>Conferma</AlertDialogAction>
    </div>
  </AlertDialogContent>
</AlertDialog>
```

### Badge (`badge.tsx`)

Badge per status e labels.

```typescript
import { Badge } from '@/components/ui'

<Badge variant="success">Attivo</Badge>
<Badge variant="warning">In attesa</Badge>
<Badge variant="error">Errore</Badge>
```

**Varianti:**

- `success`: Verde
- `warning`: Giallo/arancione
- `error`: Rosso
- `info`: Blu
- `default`: Grigio

### Table (`table.tsx`)

Tabella strutturata.

```typescript
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Mario</TableCell>
      <TableCell>mario@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Tabs (`tabs.tsx`)

Sistema di tabs.

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### DropdownMenu (`dropdown-menu.tsx`)

Menu dropdown con azioni.

```typescript
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui'

<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleEdit}>Modifica</DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete}>Elimina</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Skeleton (`skeleton.tsx`)

Loading skeleton per stati di caricamento.

```typescript
import { Skeleton } from '@/components/ui'

<Skeleton className="h-4 w-full" />
<Skeleton className="h-8 w-32" />
```

### Spinner (`spinner.tsx`)

Spinner di caricamento.

```typescript
import { Spinner } from '@/components/ui'

<Spinner size="md" />
```

**Props:**

- `size`: `'sm' | 'md' | 'lg'`

### Progress (`progress.tsx`)

Barra di progresso.

```typescript
import { Progress } from '@/components/ui'

<Progress value={75} max={100} />
```

### Avatar (`avatar.tsx`)

Avatar utente.

```typescript
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui'

<Avatar>
  <AvatarImage src={imageUrl} alt={name} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

### Separator (`separator.tsx`)

Separatore visivo.

```typescript
import { Separator } from '@/components/ui'

<Separator />
```

### Switch (`switch.tsx`)

Toggle switch.

```typescript
import { Switch } from '@/components/ui'

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

### Checkbox (`checkbox.tsx`)

Checkbox nativo HTML.

```typescript
import { Checkbox } from '@/components/ui'

<Checkbox
  checked={checked}
  onChange={handleChange}
  label="Accetta termini"
/>
```

**Nota**: Usa HTML `<input type="checkbox">` nativo.

### Label (`label.tsx`)

Label per form fields.

```typescript
import { Label } from '@/components/ui'

<Label htmlFor="email">Email</Label>
```

## 🎨 Componenti Avanzati

### ErrorBoundary (`error-boundary.tsx`)

React Error Boundary per gestione errori.

```typescript
import { ErrorBoundary } from '@/components/ui'

<ErrorBoundary fallback={CustomFallback}>
  <ComponentThatMayError />
</ErrorBoundary>
```

**Features:**

- Cattura errori React
- Integrazione Sentry
- Fallback UI personalizzabile
- Reset error state

### ErrorDisplay (`error-display.tsx`)

Display errori con retry.

```typescript
import { ErrorDisplay } from '@/components/ui'

<ErrorDisplay
  error={error}
  onRetry={handleRetry}
  title="Errore caricamento"
/>
```

### NavigationLoading (`navigation-loading.tsx`)

Overlay loading durante navigazione.

```typescript
import { NavigationLoading } from '@/components/ui'

<NavigationLoading
  isLoading={isLoading}
  loadingDuration={duration}
  isSlow={isSlow}
  targetPath={path}
/>
```

### Toast (`toast.tsx`)

Sistema notifiche toast.

```typescript
import { useToast } from '@/components/ui/toast'

const { addToast } = useToast()

addToast({
  title: 'Successo',
  message: 'Operazione completata',
  variant: 'success',
})
```

**Varianti:**

- `success`: Verde
- `error`: Rosso
- `warning`: Giallo
- `info`: Blu

### DateRangePicker (`date-range-picker.tsx`)

Selettore range date.

```typescript
import { DateRangePicker } from '@/components/ui'

<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onChange={handleDateChange}
/>
```

### Stepper (`stepper.tsx`)

Stepper per wizard multi-step.

```typescript
import { Stepper, StepperStep } from '@/components/ui'

<Stepper currentStep={2} totalSteps={5}>
  <StepperStep label="Step 1" />
  <StepperStep label="Step 2" />
  <StepperStep label="Step 3" />
</Stepper>
```

## 🎯 Pattern di Utilizzo

### Form Pattern

```typescript
import { Input, Button, Card, CardContent } from '@/components/ui'

function MyForm() {
  const [formData, setFormData] = useState({ email: '' })
  const [errors, setErrors] = useState({})

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Input
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          <Button type="submit">Invia</Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Modal Pattern

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@/components/ui'

function MyModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        <div>
          {/* Content */}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleConfirm}>
            Conferma
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Table Pattern

```typescript
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button, DropdownMenu } from '@/components/ui'

function MyTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost">...</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Modifica</DropdownMenuItem>
                  <DropdownMenuItem>Elimina</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

## 🎨 Styling

Tutti i componenti utilizzano:

- **Tailwind CSS** per styling
- **Design System** tokens da `src/config/master-design.config.ts`
- **Dark Mode** di default
- **Responsive** mobile-first

### Classi Comuni

```typescript
// Container
className = 'min-h-screen bg-black'

// Cards
className = 'bg-slate-900/95 border border-slate-700 rounded-lg p-6'

// Buttons
className = 'bg-teal-500 hover:bg-teal-600 text-white rounded-lg px-4 py-2'

// Text
className = 'text-white text-sm'
className = 'text-slate-400 text-xs'
```

## ♿ Accessibilità

Tutti i componenti seguono:

- **ARIA labels** appropriati
- **Keyboard navigation** supportata
- **Focus management** corretto
- **Screen reader** friendly
- **Color contrast** WCAG AA compliant

## 🔗 Riferimenti

- [Componenti UI Source](../src/components/ui/)
- [Design System Config](../src/config/master-design.config.ts)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
