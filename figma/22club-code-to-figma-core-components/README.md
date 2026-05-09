# 22Club Code -> Figma Core Components Exporter

Plugin locale per esportare piu componenti core del design system in un frame unico `EXPORT · Core Components`.

## Componenti supportati

- `DashboardColumnPanel`
- `EmptyState`
- `Skeleton`
- `Dialog`
- `Drawer`

## Schema base

```json
{
  "type": "ComponentType",
  "variant": "default",
  "title": "string",
  "description": "string",
  "state": "default|empty|loading",
  "actions": [],
  "items": []
}
```

Supporta oggetto singolo o array di oggetti.

## Limiti

- Non esporta logica React.
- Non esporta animazioni runtime.
- Le icone sono placeholder shape/testo, non SVG reali.
