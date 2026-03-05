# 🤝 Guida Contributing - 22Club

**Ultimo Aggiornamento**: 2025-02-02  
**Versione**: 1.0.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Setup Sviluppo](#setup-sviluppo)
3. [Workflow Git](#workflow-git)
4. [Code Style](#code-style)
5. [Testing](#testing)
6. [Pull Request](#pull-request)
7. [Commit Messages](#commit-messages)
8. [Best Practices](#best-practices)

---

## Panoramica

Benvenuto nel progetto 22Club! Questa guida ti aiuterà a contribuire efficacemente.

### Stack Tecnologico

- **Next.js 15** con App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** con dark mode
- **Supabase** per backend
- **Vitest** + **Playwright** per testing

---

## Setup Sviluppo

### Prerequisiti

- Node.js 20.12.2
- npm o yarn
- Git
- Supabase CLI (opzionale)

### Setup Locale

1. **Clona Repository**:

   ```bash
   git clone <repository-url>
   cd 22club-setup
   ```

2. **Installa Dipendenze**:

   ```bash
   npm install
   ```

3. **Configura Environment**:

   ```bash
   cp env.example .env.local
   # Modifica .env.local con le tue credenziali
   ```

4. **Avvia Development Server**:

   ```bash
   npm run dev
   ```

5. **Verifica Setup**:
   ```bash
   npm run db:verify
   npm run typecheck
   npm run lint
   ```

---

## Workflow Git

### Branch Strategy

- `main`: Branch produzione (protetto)
- `develop`: Branch sviluppo (opzionale)
- `feature/*`: Nuove funzionalità
- `fix/*`: Bug fixes
- `docs/*`: Documentazione

### Workflow Standard

1. **Crea Branch**:

   ```bash
   git checkout -b feature/nome-funzionalita
   ```

2. **Sviluppa**:
   - Scrivi codice
   - Aggiungi test
   - Aggiorna documentazione

3. **Commit**:

   ```bash
   git add .
   git commit -m "feat: aggiungi funzionalità X"
   ```

4. **Push**:

   ```bash
   git push origin feature/nome-funzionalita
   ```

5. **Pull Request**:
   - Crea PR su GitHub
   - Attendi review
   - Risolvi feedback

---

## Code Style

### TypeScript

**Strict Mode**: Attivo, nessun `any` non necessario

```typescript
// ✅ CORRETTO
interface User {
  id: string
  name: string
}

// ❌ SBAGLIATO
const user: any = { id: '1', name: 'John' }
```

### ESLint

**Config**: ESLint flat config

```bash
# Verifica
npm run lint

# Fix automatico
npm run lint:fix
```

**Regole**:

- Max warnings: 0 in CI
- Usa sempre type safety
- Evita console.log in produzione

### Prettier

**Config**: Prettier con semi = false

```bash
# Formatta
npm run format

# Verifica
npm run format:check
```

---

## Testing

### Unit Tests

```bash
# Watch mode
npm run test

# Run una volta
npm run test:run

# Coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E
npm run test:e2e

# UI mode
npm run test:e2e:ui
```

### Pre-Commit

Husky esegue automaticamente:

- TypeScript check
- ESLint
- Test unitari

---

## Pull Request

### Checklist PR

- [ ] Codice segue code style
- [ ] Test passati (unit + E2E)
- [ ] Documentazione aggiornata
- [ ] TypeScript check passato
- [ ] ESLint senza errori
- [ ] Breaking changes documentati

### Template PR

```markdown
## Descrizione

Breve descrizione delle modifiche

## Tipo Modifica

- [ ] Bug fix
- [ ] Nuova funzionalità
- [ ] Breaking change
- [ ] Documentazione

## Testing

Come testato le modifiche

## Checklist

- [ ] Codice testato
- [ ] Documentazione aggiornata
- [ ] Breaking changes documentati
```

---

## Commit Messages

### Formato

```
<type>: <descrizione>

[corpo opzionale]

[footer opzionale]
```

### Types

- `feat`: Nuova funzionalità
- `fix`: Bug fix
- `docs`: Documentazione
- `style`: Formattazione
- `refactor`: Refactoring
- `test`: Test
- `chore`: Build, config, etc.

### Esempi

```bash
feat: aggiungi filtro avanzato clienti

fix: risolvi errore RLS policies

docs: aggiorna guida deployment

refactor: estrai logica form in hook
```

---

## Best Practices

### ✅ DO

1. **Testa Localmente**: Sempre testa prima di PR
2. **Piccoli PR**: PR piccole e focalizzate
3. **Documenta**: Aggiorna documentazione se necessario
4. **Chiedi Aiuto**: Non esitare a chiedere

### ❌ DON'T

1. **Non committare secrets**: Mai `.env.local`
2. **Non bypassare test**: Tutti i test devono passare
3. **Non ignorare feedback**: Risolvi tutti i commenti PR
4. **Non fare force push**: Su branch condivisi

---

## Risorse

- [Guida Deployment](./GUIDA_DEPLOYMENT.md)
- [Guida Testing](./GUIDA_TESTING.md)
- [Design System](./DESIGN_SYSTEM_COMPLETO.md)
- [Database Schema](./DATABASE_SCHEMA_COMPLETO.md)

---

**Ultimo aggiornamento**: 2025-02-02
