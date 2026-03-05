# Fix Test Validazione Form

## Problema
Il test `login.spec.ts:42` falliva perché:
- Il form aveva `required` HTML5 sui campi
- Quando si cliccava il button senza riempire i campi, il browser bloccava il submit e mostrava la validazione HTML5 nativa
- Il test cercava "Email è richiesta" e "Password è richiesta" ma questi messaggi vengono mostrati solo quando `handleLogin` viene chiamato e imposta `validationErrors`
- Con `required` HTML5, `handleLogin` non veniva mai chiamato quando i campi erano vuoti

## Soluzione Applicata
Aggiunto `noValidate` al form per disabilitare la validazione HTML5 nativa:

```tsx
<form onSubmit={handleLogin} className="space-y-5" noValidate>
```

Questo permette a `handleLogin` di essere chiamato anche quando i campi sono vuoti, così può:
1. Verificare se i campi sono vuoti
2. Impostare `validationErrors` con i messaggi personalizzati
3. Mostrare i messaggi di errore personalizzati sotto gli input

## Modifiche
- File: `src/app/login/page.tsx` (linea ~196)
- Aggiunto `noValidate` al tag `<form>`

## Test da Eseguire
```bash
npm run test:e2e -- tests/e2e/login.spec.ts:42
```

## Note
- La validazione HTML5 nativa viene disabilitata con `noValidate`
- La validazione è gestita completamente in JavaScript tramite `handleLogin`
- I messaggi di errore personalizzati vengono mostrati sotto gli input
- I campi mantengono l'attributo `required` per accessibilità (lettori di schermo)
