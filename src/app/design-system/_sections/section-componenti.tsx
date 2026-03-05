'use client'

import { Box, Save, X } from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Label,
  Progress,
  Select,
  Separator,
  SimpleSelect,
  Skeleton,
  Slider,
  Spinner,
  Stepper,
  Switch,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Textarea,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui'
import { DesignSystemDialogDemo, DesignSystemDrawerDemo } from './demo-dialog-drawer'

const cardFrameClass =
  'overflow-hidden p-5 !rounded-[8px] !border-[rgb(255_255_255/0.5)] !shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.06)]'

export function SectionComponenti() {
  return (
    <section id="componenti" className="scroll-mt-24">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <Box className="h-6 w-6 text-primary" />
        Componenti
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Set da <code className="rounded bg-surface-300 px-1.5 py-0.5 font-mono text-xs">@/components/ui</code>. Varianti e dimensioni in uso nel progetto.
      </p>
      <div className="space-y-8">
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Button</h3>
          <p className="mb-4 text-xs text-text-muted">
            Primary per azione principale, Secondary/Outline per secondarie, Ghost per terziarie, Destructive per eliminazioni.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Varianti</p>
          <div className="mb-6 flex flex-wrap items-end gap-4">
            {[
              { variant: 'primary' as const, label: 'primary' },
              { variant: 'secondary' as const, label: 'secondary' },
              { variant: 'outline' as const, label: 'outline' },
              { variant: 'ghost' as const, label: 'ghost' },
              { variant: 'destructive' as const, label: 'destructive' },
              { variant: 'success' as const, label: 'success' },
            ].map(({ variant, label }) => (
              <div key={variant} className="flex flex-col items-center gap-1.5">
                <Button variant={variant}>{label.charAt(0).toUpperCase() + label.slice(1)}</Button>
                <span className="text-xs text-text-muted">{label}</span>
              </div>
            ))}
          </div>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Dimensioni (Primary)</p>
          <div className="mb-6 flex flex-wrap items-end gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="primary" size="sm">Small</Button>
              <span className="text-xs text-text-muted">sm</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="primary">Default</Button>
              <span className="text-xs text-text-muted">md</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="primary" size="lg">Large</Button>
              <span className="text-xs text-text-muted">lg</span>
            </div>
          </div>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Stati (loading)</p>
          <div className="mb-6 flex flex-wrap items-end gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="primary" loading>Caricamento</Button>
              <span className="text-xs text-text-muted">loading</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="secondary" loading>Caricamento</Button>
              <span className="text-xs text-text-muted">loading</span>
            </div>
          </div>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Con icona</p>
          <div className="mb-6 flex flex-wrap items-end gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="primary" className="gap-2">
                <Save className="h-4 w-4" />
                Salva
              </Button>
              <span className="text-xs text-text-muted">icon + testo</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="outline" className="gap-2">
                <X className="h-4 w-4" />
                Annulla
              </Button>
              <span className="text-xs text-text-muted">icon + testo</span>
            </div>
          </div>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Stati (disabled)</p>
          <div className="flex flex-wrap items-end gap-4">
            {[
              { variant: 'primary' as const },
              { variant: 'secondary' as const },
              { variant: 'outline' as const },
              { variant: 'ghost' as const },
              { variant: 'destructive' as const },
              { variant: 'success' as const },
            ].map(({ variant }) => (
              <div key={variant} className="flex flex-col items-center gap-1.5">
                <Button variant={variant} disabled>
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </Button>
                <span className="text-xs text-text-muted">disabled</span>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Badge</h3>
          <p className="mb-4 text-xs text-text-muted">
            Etichette per stati (success, warning, error), ruoli o categorie. Primary per accent, Outline/Neutral per secondari.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Varianti</p>
          <div className="mb-6 flex flex-wrap items-end gap-4">
            {[
              { variant: 'primary' as const, label: 'primary' },
              { variant: 'success' as const, label: 'success' },
              { variant: 'warning' as const, label: 'warning' },
              { variant: 'error' as const, label: 'error' },
              { variant: 'outline' as const, label: 'outline' },
              { variant: 'neutral' as const, label: 'neutral' },
            ].map(({ variant, label }) => (
              <div key={variant} className="flex flex-col items-center gap-1.5">
                <Badge variant={variant}>{label.charAt(0).toUpperCase() + label.slice(1)}</Badge>
                <span className="text-xs text-text-muted">{label}</span>
              </div>
            ))}
          </div>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Dimensioni (Primary)</p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <Badge variant="primary" size="sm">sm</Badge>
              <span className="text-xs text-text-muted">sm</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Badge variant="primary" size="md">md</Badge>
              <span className="text-xs text-text-muted">md</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Badge variant="primary" size="lg">lg</Badge>
              <span className="text-xs text-text-muted">lg</span>
            </div>
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Avatar</h3>
          <p className="mb-4 text-xs text-text-muted">
            Icona utente con fallback su iniziale. Dimensioni sm, md, lg, xl per contesti diversi (liste, header, profilo).
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Dimensioni</p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <Avatar fallbackText="A" size="sm" />
              <span className="text-xs text-text-muted">sm</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Avatar fallbackText="B" size="md" />
              <span className="text-xs text-text-muted">md</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Avatar fallbackText="C" size="lg" />
              <span className="text-xs text-text-muted">lg</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Avatar fallbackText="D" size="xl" />
              <span className="text-xs text-text-muted">xl</span>
            </div>
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Input</h3>
          <p className="mb-4 text-xs text-text-muted">
            Campo di testo singola riga. Supporta label, placeholder, stati error/success e validazione.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Esempi</p>
          <div className="max-w-sm space-y-4">
            <Input placeholder="Placeholder" />
            <Input label="Con label" placeholder="Testo" />
            <Input variant="error" placeholder="Stato errore" />
            <Input variant="success" placeholder="Stato success" />
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Textarea</h3>
          <p className="mb-4 text-xs text-text-muted">
            Campo di testo multiriga. Label, placeholder e messaggio di errore per validazione.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Esempi</p>
          <div className="max-w-sm space-y-4">
            <Textarea placeholder="Placeholder" />
            <Textarea label="Con label" placeholder="Testo multiriga…" />
            <Textarea errorMessage="Campo obbligatorio" placeholder="Errore" />
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Select (nativo) & SimpleSelect</h3>
          <p className="mb-4 text-xs text-text-muted">
            Selezione da elenco. Select nativo per form semplici, SimpleSelect per UI custom e ricerca.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Esempi</p>
          <div className="flex flex-wrap gap-8">
            <div className="w-48">
              <Select label="Select" onChange={() => {}}>
                <option value="">Seleziona…</option>
                <option value="a">Opzione A</option>
                <option value="b">Opzione B</option>
              </Select>
            </div>
            <div className="w-48">
              <SimpleSelect
                placeholder="SimpleSelect"
                options={[
                  { value: '1', label: 'Opzione 1' },
                  { value: '2', label: 'Opzione 2' },
                ]}
              />
            </div>
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Checkbox</h3>
          <p className="mb-4 text-xs text-text-muted">
            Scelta singola o multipla. Label opzionale, stati checked e errore per validazione.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Esempi</p>
          <div className="flex flex-wrap gap-6">
            <Checkbox />
            <Checkbox label="Con label" />
            <Checkbox label="Checked" defaultChecked />
            <Checkbox label="Errore" errorMessage="Obbligatorio" />
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Switch & Progress</h3>
          <p className="mb-4 text-xs text-text-muted">
            Switch per toggle on/off. Progress per indicare avanzamento o percentuale.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Switch</p>
          <div className="mb-4 flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <Switch />
                <Label>off</Label>
              </div>
              <span className="text-xs text-text-muted">off</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>on</Label>
              </div>
              <span className="text-xs text-text-muted">on</span>
            </div>
          </div>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Progress</p>
          <div className="w-48">
            <Progress value={60} className="h-2" />
            <span className="mt-1 block text-xs text-text-muted">60%</span>
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Slider</h3>
          <p className="mb-4 text-xs text-text-muted">
            Selezione di un valore numerico su un intervallo (es. volume, intensità, range).
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Esempio</p>
          <div className="max-w-xs">
            <Slider defaultValue={50} />
            <span className="mt-1 block text-xs text-text-muted">valore default 50</span>
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Spinner</h3>
          <p className="mb-4 text-xs text-text-muted">
            Indicatore di caricamento. Dimensioni sm, md, lg, xl per inline, bottoni o full-screen.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Dimensioni</p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <Spinner size="sm" />
              <span className="text-xs text-text-muted">sm</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Spinner size="md" />
              <span className="text-xs text-text-muted">md</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Spinner size="lg" />
              <span className="text-xs text-text-muted">lg</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Spinner size="xl" />
              <span className="text-xs text-text-muted">xl</span>
            </div>
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Skeleton</h3>
          <p className="mb-4 text-xs text-text-muted">
            Placeholder animato per contenuti in caricamento. Adatta classi per forma (pulsante, card, testo).
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Esempi</p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-10 w-24 rounded-full" />
              <span className="text-xs text-text-muted">pulsante</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-20 w-40 rounded-xl" />
              <span className="text-xs text-text-muted">card</span>
            </div>
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Tabs</h3>
          <p className="mb-4 text-xs text-text-muted">
            Navigazione tra pannelli di contenuto. TabsList + TabsTrigger per le tab, TabsContent per il corpo.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Esempio</p>
          <Tabs defaultValue="tab1" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Contenuto tab 1.</TabsContent>
            <TabsContent value="tab2">Contenuto tab 2.</TabsContent>
            <TabsContent value="tab3">Contenuto tab 3.</TabsContent>
          </Tabs>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Stepper</h3>
          <p className="mb-4 text-xs text-text-muted">
            Flusso a step con stati completed, active e pending. Per wizard, checkout o onboarding.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Esempio</p>
          <Stepper
            steps={[
              { id: '1', label: 'Step 1', description: 'Desc', completed: true },
              { id: '2', label: 'Step 2', description: 'Desc', active: true },
              { id: '3', label: 'Step 3', completed: false },
            ]}
            variant="default"
          />
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Table</h3>
          <p className="mb-4 text-xs text-text-muted">
            Tabella dati con TableHeader, TableBody, TableRow, TableHead, TableCell. Per liste utenti, report, dati tabellari.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Esempio</p>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ruolo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Mario Rossi</TableCell>
                  <TableCell>Atleta</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Luigi Verdi</TableCell>
                  <TableCell>PT</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Dialog</h3>
          <p className="mb-4 text-xs text-text-muted">
            Modale centrato per conferme, form o contenuti focali. Trigger + contenuto.
          </p>
          <DesignSystemDialogDemo />
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Drawer</h3>
          <p className="mb-4 text-xs text-text-muted">
            Pannello laterale scorrevole per dettagli, filtri o azioni secondarie.
          </p>
          <DesignSystemDrawerDemo />
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">DropdownMenu</h3>
          <p className="mb-4 text-xs text-text-muted">
            Menu a tendina su click. Trigger + voci e separatori.
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Apri menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => {}}>Voce 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Voce 2</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>Esci</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
        <Card variant="default" className={cardFrameClass}>
          <h3 className="mb-1 text-sm font-medium text-text-secondary">Separator</h3>
          <p className="mb-4 text-xs text-text-muted">
            Linea di separazione orizzontale tra blocchi di contenuto.
          </p>
          <p className="mb-2 text-xs font-medium text-text-tertiary">Esempio</p>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Blocco sopra</p>
            <Separator className="bg-border" />
            <p className="text-sm text-text-secondary">Blocco sotto</p>
          </div>
        </Card>
      </div>
    </section>
  )
}
