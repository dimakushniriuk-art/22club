# 🎯 12 - Suggerimenti Prioritizzati

> **Roadmap interventi basata su analisi codice**

---

## 🔴 TOP 5 RISCHI

### 1. Debug Logging in Produzione
```
Rischio: Performance degradata + leak dati sensibili
File: auth-provider.tsx, use-clienti.ts, dashboard/page.tsx
Probabilità: 100% (codice presente)
Impatto: ALTO
Score: 100

Mitigazione:
1. grep -r "#region agent log" src/
2. Rimuovere tutti i blocchi fetch a localhost:7242
3. Verificare build non contiene riferimenti
```

### 2. Test E2E Copertura Parziale
```
Rischio: Bug non rilevati su Safari/WebKit (~20% mercato)
File: tests/e2e/*.spec.ts
Probabilità: 60% (skip attivi)
Impatto: MEDIO-ALTO
Score: 72

Mitigazione:
1. Documentare browser non testati
2. Test manuali pre-release su Safari
3. O setup HTTPS locale per test completi
```

### 3. Auth Provider Complessità
```
Rischio: Bug in modifiche auth, difficile debug
File: src/providers/auth-provider.tsx
Probabilità: 50% (ogni modifica)
Impatto: ALTO
Score: 75

Mitigazione:
1. Rimuovere debug code
2. Estrarre mapRole in utility
3. Unit test per ogni funzione
```

### 4. Cache Ruoli Non Sincronizzata
```
Rischio: Utente con permessi stale per 60s dopo cambio ruolo
File: src/middleware.ts
Probabilità: 30% (cambio ruolo raro)
Impatto: MEDIO
Score: 45

Mitigazione:
1. Ridurre TTL a 30s
2. O invalidazione esplicita su cambio ruolo
3. O Redis per cache distribuita
```

### 5. Schema DB Inconsistente
```
Rischio: Bug in query, maintenance overhead
Tabelle: profiles, workout_logs
Probabilità: 40% (ogni nuova feature)
Impatto: MEDIO
Score: 48

Mitigazione:
1. Documentare campi corretti da usare
2. Migration graduale verso naming consistente
3. Type guards nei hook
```

---

## ✅ TOP 5 INTERVENTI CONSIGLIATI

### 1. Pulizia Debug Logging
```
Priorità: IMMEDIATA
Effort: 2-4 ore
Impatto: Alto (performance + sicurezza)

Azioni:
1. rg "#region agent log" src/ > debug-blocks.txt
2. Per ogni file: rimuovere blocchi fetch localhost
3. Verificare: npm run build && rg "7242" .next/
4. Commit: "chore: remove debug logging for production"
```

### 2. Refactor Auth Provider
```
Priorità: ALTA
Effort: 1-2 giorni
Impatto: Alto (manutenibilità)

Azioni:
1. Estrarre mapRole in src/lib/utils/role-mapper.ts
2. Estrarre serializeError in src/lib/utils/error-serializer.ts
3. Rimuovere debug logging
4. Aggiungere unit test
5. Ridurre file a <300 righe
```

### 3. Migrazione useClienti a React Query
```
Priorità: MEDIA
Effort: 2-3 giorni
Impatto: Medio (consistenza, performance)

Azioni:
1. Creare src/hooks/clienti/use-clienti-query.ts
2. Implementare con useQuery + useMutation
3. Mantenere hook legacy per backward compat
4. Migrare consumer gradualmente
5. Deprecare e rimuovere vecchio hook
```

### 4. Consolidamento Tipi Supabase
```
Priorità: MEDIA
Effort: 4-8 ore
Impatto: Medio (manutenibilità)

Azioni:
1. npx supabase gen types typescript > src/lib/supabase/types.ts
2. Aggiornare src/types/supabase.ts per re-export
3. Fix import in tutti i file
4. Rimuovere duplicazioni
```

### 5. Documentazione Test Browser
```
Priorità: BASSA
Effort: 2 ore
Impatto: Basso-Medio (chiarezza)

Azioni:
1. Creare docs/TESTING.md
2. Documentare skip Safari/WebKit
3. Istruzioni per test manuali
4. CI badge per browser supportati
```

---

## ⏰ COSA FARE SUBITO vs DOPO

### SUBITO (Prima del prossimo deploy)
| Azione | Tempo | Rischio se non fatto |
|--------|-------|---------------------|
| Rimuovere debug logging | 2-4h | Performance prod |
| Verificare RPC esistono | 1h | Analytics mock |
| Test manuale Safari | 1h | Bug non rilevati |

### SPRINT CORRENTE
| Azione | Tempo | Beneficio |
|--------|-------|-----------|
| Refactor auth-provider | 1-2d | Manutenibilità |
| Split use-clienti | 2-3d | Testabilità |
| Consolidare tipi | 4-8h | Developer experience |

### BACKLOG
| Azione | Tempo | Note |
|--------|-------|------|
| Redis cache ruoli | 1w | Richiede infra |
| Migration schema DB | 1-2w | Breaking change |
| HTTPS locale test | 1d | Opzionale |
| Performance monitoring | 1w | Nice to have |

---

## 📊 MATRICE PRIORITÀ

```
                    IMPATTO
              BASSO    MEDIO    ALTO
           ┌────────┬────────┬────────┐
     BASSO │ Health │ Types  │        │
           │ check  │ consol │        │
    E      ├────────┼────────┼────────┤
    F      │ Port   │ Schema │ Cache  │
    F      │ config │ cleanup│ Redis  │
    O      ├────────┼────────┼────────┤
    R      │        │ React  │ Debug  │
    T      │        │ Query  │ logging│
     ALTO  │        │ migr   │ Auth   │
           └────────┴────────┴────────┘
                    
Legenda:
├── Alto Impatto + Basso Effort = FARE SUBITO
├── Alto Impatto + Alto Effort = PIANIFICARE
├── Basso Impatto + Basso Effort = QUICK WIN
└── Basso Impatto + Alto Effort = EVITARE
```

---

## 🏁 CHECKLIST PRE-DEPLOY

```
□ Debug logging rimosso (rg "7242" src/)
□ Build senza errori (npm run build)
□ Test E2E Chromium/Firefox pass
□ Variabili ambiente prod configurate
□ RLS policies verificate
□ Health check funzionante
□ Rollback plan pronto
```

---

## 📈 METRICHE SUCCESSO

Dopo interventi:
- [ ] Build time < 2 minuti
- [ ] TTFB < 200ms
- [ ] Test E2E > 90% pass (browser supportati)
- [ ] Zero errori console in prod
- [ ] Auth provider < 300 righe
- [ ] useClienti < 500 righe
