# 🧪 Strategia Testing 22Club

Documentazione completa della strategia di testing utilizzata in 22Club.

## 📊 Overview

22Club utilizza un approccio **multi-layer** per il testing:

1. **Unit Tests**: Test di funzioni e componenti isolati
2. **Integration Tests**: Test di integrazione tra moduli
3. **E2E Tests**: Test end-to-end dei flussi utente
4. **Performance Tests**: Test di performance e Core Web Vitals
5. **Security Tests**: Test di sicurezza e penetration

## 🛠️ Stack Tecnologico

### Framework

- **Vitest**: Unit e integration tests
- **Playwright**: E2E tests
- **Testing Library**: Testing React components
- **@vitest/coverage-v8**: Code coverage

### Configurazione

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

## 🧪 Unit Tests

### Struttura

```
tests/
├── unit/
│   ├── utils.test.ts
│   ├── api.test.ts
│   └── middleware.test.ts
└── src/
    └── hooks/
        └── __tests__/
            ├── use-auth.test.ts
            ├── use-appointments.test.ts
            └── use-documents.test.ts
```

### Esempio Unit Test

```typescript
import { describe, it, expect } from 'vitest'
import { sanitizeEmail, sanitizePhone } from '@/lib/utils/sanitize'

describe('sanitizeEmail', () => {
  it('should remove whitespace', () => {
    expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com')
  })

  it('should lowercase email', () => {
    expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
  })
})
```

### Best Practices

1. **Test isolati**: Ogni test deve essere indipendente
2. **Naming**: Usa `describe` e `it` con nomi descrittivi
3. **AAA Pattern**: Arrange, Act, Assert
4. **Mocking**: Mock dipendenze esterne
5. **Coverage**: Target >70% coverage

## 🔗 Integration Tests

### Struttura

```
tests/
└── integration/
    ├── supabase-client.test.ts
    └── api-routes.test.ts
```

### Esempio Integration Test

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@/lib/supabase'

describe('Supabase Client Integration', () => {
  let supabase: ReturnType<typeof createClient>

  beforeAll(() => {
    supabase = createClient()
  })

  it('should connect to Supabase', async () => {
    const { data, error } = await supabase.from('profiles').select('count')
    expect(error).toBeNull()
    expect(data).toBeDefined()
  })
})
```

## 🎭 Component Tests

### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useAppointments } from '@/hooks/use-appointments'

describe('useAppointments', () => {
  it('should fetch appointments', async () => {
    const { result } = renderHook(() => useAppointments({ userId: 'test-id', role: 'staff' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.appointments).toBeDefined()
  })
})
```

## 🎬 E2E Tests

### Struttura

```
tests/
└── e2e/
    ├── athlete-registration-flow.spec.ts
    ├── workout-creation-flow.spec.ts
    ├── chat-flow.spec.ts
    ├── payment-lesson-counter-flow.spec.ts
    ├── appointments.spec.ts
    ├── documents.spec.ts
    ├── performance.spec.ts
    └── security.spec.ts
```

### Esempio E2E Test

```typescript
import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
    await expect(page.getByText(/Dashboard/i)).toBeVisible()
  })
})
```

### Flussi E2E Coperti

1. ✅ **Registrazione Atleta**: Invito → Registrazione → Completamento profilo
2. ✅ **Creazione Scheda**: Workout wizard completo
3. ✅ **Chat PT-Atleta**: Invio messaggi, risposte, file upload
4. ✅ **Pagamento**: Registrazione pagamento → Aggiornamento contatore lezioni
5. ✅ **Appuntamenti**: Creazione, modifica, cancellazione
6. ✅ **Documenti**: Upload, visualizzazione, validazione
7. ✅ **Performance**: Core Web Vitals, large datasets, pagination
8. ✅ **Security**: XSS, SQL injection, CSRF, route protection

## ⚡ Performance Tests

### Core Web Vitals

```typescript
test('should have good Core Web Vitals', async ({ page }) => {
  await page.goto('http://localhost:3001/login')

  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        resolve(lastEntry.startTime)
      }).observe({ entryTypes: ['largest-contentful-paint'] })
    })
  })

  expect(lcp).toBeLessThan(2500) // LCP < 2.5s
})
```

### Large Datasets

```typescript
test('should handle large datasets efficiently', async ({ page }) => {
  await page.goto('http://localhost:3001/dashboard/clienti')
  const startTime = Date.now()
  await page.waitForLoadState('networkidle')
  const loadTime = Date.now() - startTime

  expect(loadTime).toBeLessThan(5000) // Load < 5s
})
```

## 🔒 Security Tests

### XSS Prevention

```typescript
test('should prevent XSS attacks', async ({ page }) => {
  await page.goto('http://localhost:3001/login')
  const maliciousScript = '<script>alert("XSS")</script>'
  await page.fill('input[name="email"]', maliciousScript)
  await page.click('button[type="submit"]')

  const alertHandled = await page.evaluate(() => {
    return new Promise((resolve) => {
      window.alert = () => resolve(true)
      setTimeout(() => resolve(false), 1000)
    })
  })

  expect(alertHandled).toBe(false)
})
```

### Route Protection

```typescript
test('should prevent unauthorized access', async ({ page }) => {
  await page.goto('http://localhost:3001/dashboard/admin')
  await page.waitForURL('**/login', { timeout: 5000 })
  await expect(page.getByText(/Accedi|Login/i)).toBeVisible()
})
```

## 📈 Code Coverage

### Target

- **Overall Coverage**: >70%
- **Critical Paths**: >90%
- **UI Components**: >60%
- **Utilities**: >80%

### Generazione Report

```bash
npm run test:coverage
```

Il report viene generato in `coverage/` directory.

## 🎯 Testing Patterns

### 1. Form Testing

```typescript
test('should validate form fields', async ({ page }) => {
  await page.goto('http://localhost:3001/dashboard/clienti')
  await page.click('button:has-text("Nuovo Cliente")')

  // Try submit without filling
  await page.click('button[type="submit"]')
  await expect(page.getByText(/obbligatorio|required/i)).toBeVisible()

  // Fill form
  await page.fill('input[name="nome"]', 'Test')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')

  // Verify success
  await expect(page.getByText(/successo|created/i)).toBeVisible()
})
```

### 2. API Testing

```typescript
test('should handle API errors gracefully', async ({ page }) => {
  // Mock API error
  await page.route('**/api/appointments', (route) => {
    route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) })
  })

  await page.goto('http://localhost:3001/dashboard/appuntamenti')
  await expect(page.getByText(/errore|error/i)).toBeVisible()
})
```

### 3. Realtime Testing

```typescript
test('should update in realtime', async ({ page, context }) => {
  await page.goto('http://localhost:3001/dashboard/chat')

  // Open second browser context (simulate second user)
  const secondPage = await context.newPage()
  await secondPage.goto('http://localhost:3001/home/chat')

  // Send message from second page
  await secondPage.fill('textarea[placeholder*="messaggio"]', 'Test message')
  await secondPage.click('button:has-text("Invia")')

  // Verify message appears in first page
  await expect(page.getByText('Test message')).toBeVisible({ timeout: 5000 })
})
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:run
      - run: npm run test:e2e:ci
```

## 📝 Best Practices

1. **Test First**: Scrivere test prima del codice (TDD quando possibile)
2. **Isolation**: Ogni test deve essere indipendente
3. **Cleanup**: Pulire dati di test dopo ogni test
4. **Naming**: Nomi descrittivi e chiari
5. **Coverage**: Mantenere coverage >70%
6. **Speed**: Test veloci (< 1s per unit test)
7. **Reliability**: Test devono essere deterministici
8. **Documentation**: Commentare test complessi

## 🔗 Riferimenti

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [E2E Tests](../tests/e2e/)
- [Unit Tests](../tests/unit/)
