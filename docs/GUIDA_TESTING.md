# 🧪 Guida Testing - 22Club

**Ultimo Aggiornamento**: 2025-02-02  
**Versione**: 1.0.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Setup Testing](#setup-testing)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [E2E Tests](#e2e-tests)
6. [Testing Best Practices](#testing-best-practices)
7. [CI/CD Integration](#cicd-integration)
8. [Coverage](#coverage)

---

## Panoramica

22Club usa un approccio multi-livello per testing:

- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Vitest + Supabase test client
- **E2E Tests**: Playwright
- **Coverage**: Vitest Coverage v8

### Stack Testing

- **Vitest**: Unit e integration tests
- **Playwright**: E2E tests
- **React Testing Library**: Component testing
- **@testing-library/jest-dom**: Matchers DOM

---

## Setup Testing

### Installazione Dipendenze

```bash
npm install
```

Dipendenze già incluse in `package.json`:

- `vitest`
- `@playwright/test`
- `@testing-library/react`
- `@testing-library/jest-dom`

### Configurazione

**Vitest Config**: `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // ...
  },
})
```

**Playwright Config**: `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  // ...
})
```

---

## Unit Tests

### Eseguire Unit Tests

```bash
# Watch mode
npm run test

# Run una volta
npm run test:run

# Con UI
npm run test:ui

# Coverage
npm run test:coverage
```

### Struttura Test

```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── setup.ts
```

### Esempio Test Component

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### Esempio Test Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useClienti } from '@/hooks/use-clienti'

describe('useClienti', () => {
  it('fetches clients', async () => {
    const { result } = renderHook(() => useClienti())

    await waitFor(() => {
      expect(result.current.clients).toBeDefined()
    })
  })
})
```

---

## Integration Tests

### Setup Supabase Test Client

```typescript
// tests/setup.ts
import { createClient } from '@supabase/supabase-js'

export const testSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
```

### Esempio Integration Test

```typescript
import { testSupabase } from '../setup'

describe('Supabase Integration', () => {
  it('connects to database', async () => {
    const { data, error } = await testSupabase.from('profiles').select('id').limit(1)

    expect(error).toBeNull()
    expect(data).toBeDefined()
  })
})
```

---

## E2E Tests

### Eseguire E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Headed mode
npm run test:e2e:headed

# CI mode
npm run test:e2e:ci
```

### Struttura E2E

```
tests/
└── e2e/
    ├── auth.spec.ts
    ├── dashboard.spec.ts
    └── clienti.spec.ts
```

### Esempio E2E Test

```typescript
import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('/login')

  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
})
```

### Global Setup

**File**: `tests/e2e/global-setup.ts`

Esegue setup prima di tutti i test E2E:

- Avvia server locale
- Configura test database
- Cleanup dopo test

---

## Testing Best Practices

### 1. Test Naming

```typescript
// ✅ CORRETTO
describe('Button Component', () => {
  it('should render with primary variant', () => {})
  it('should call onClick when clicked', () => {})
})

// ❌ SBAGLIATO
describe('Button', () => {
  it('test 1', () => {})
})
```

### 2. Test Isolation

Ogni test deve essere indipendente:

```typescript
// ✅ CORRETTO - Usa beforeEach/afterEach
beforeEach(() => {
  // Setup
})

afterEach(() => {
  // Cleanup
})

// ❌ SBAGLIATO - Dipendenze tra test
```

### 3. Mock Appropriati

```typescript
// ✅ CORRETTO - Mock solo quando necessario
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

// ❌ SBAGLIATO - Over-mocking
```

### 4. Assertions Chiare

```typescript
// ✅ CORRETTO
expect(screen.getByRole('button')).toBeInTheDocument()
expect(screen.getByText('Submit')).toHaveClass('primary')

// ❌ SBAGLIATO
expect(screen.getByRole('button')).toBeTruthy()
```

---

## CI/CD Integration

### GitHub Actions

**File**: `.github/workflows/e2e-tests.yml`

Esegue automaticamente:

1. Install dependencies
2. Install Playwright browsers
3. Build application
4. Start application
5. Run E2E tests
6. Upload test results

### Pre-Commit Hooks

**File**: `.husky/pre-commit`

Esegue:

```bash
npm run typecheck
npm run lint
npm run test:run
```

---

## Coverage

### Target Coverage

- **Unit Tests**: >80%
- **Integration Tests**: >70%
- **E2E Tests**: Critical paths 100%

### Generare Coverage

```bash
# Coverage completo
npm run test:coverage

# Coverage solo unit tests
vitest run --coverage

# Coverage con threshold
vitest run --coverage --coverage.threshold.lines=80
```

### Coverage Report

Coverage generato in:

- `coverage/lcov.info` (LCOV format)
- `coverage/index.html` (HTML report)

### CI Coverage

GitHub Actions uploada coverage a Codecov:

```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v4
  with:
    file: ./coverage/lcov.info
```

---

## Test Utilities

### Custom Matchers

**File**: `tests/setup.ts`

```typescript
import '@testing-library/jest-dom'
```

Matchers disponibili:

- `toBeInTheDocument()`
- `toHaveClass()`
- `toHaveTextContent()`
- etc.

### Test Helpers

**File**: `tests/helpers.ts`

```typescript
export const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}
```

---

## Troubleshooting

### Test Failures

**Errore**: "Cannot find module"

```bash
# Verifica import paths
# Usa path aliases: @/components/ui/button
```

**Errore**: "Supabase connection failed"

```bash
# Verifica .env.test
# Usa test Supabase project
```

### E2E Failures

**Errore**: "Timeout"

```bash
# Aumenta timeout in playwright.config.ts
test.setTimeout(60000)
```

**Errore**: "Element not found"

```bash
# Usa data-testid invece di selettori CSS
<button data-testid="submit-btn">
```

---

## Best Practices

1. **Test First**: Scrivi test prima del codice (TDD)
2. **Test Critical Paths**: Focus su funzionalità critiche
3. **Keep Tests Fast**: Unit tests < 1s, E2E < 30s
4. **Maintain Tests**: Aggiorna test quando cambia codice
5. **Use Mocks Wisely**: Mock solo quando necessario

---

**Ultimo aggiornamento**: 2025-02-02
