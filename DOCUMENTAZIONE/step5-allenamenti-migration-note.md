# STEP 5: Migrazione useAllenamenti a React Query - NOTA

**Stato**: ⚠️ **PARZIALE** - File troppo complesso per migrazione completa in una sessione

**Problema**:

- `useAllenamenti` ha ~600 righe di codice
- Logica complessa con mock data, stats calcolate, query multiple, trainer profiles
- Mutation che chiamano fetchAllenamenti

**Decisione**:

- Migrazione parziale completata (query keys, queryClient importato)
- Logica fetch rimane in `useCallback` per ora (compatibilità)
- Mutation possono essere migrate in STEP 6 insieme alle altre mutation

**Prossimi Step**:

1. STEP 6: Aggiungere invalidazione query alle mutation (include useAllenamenti)
2. Poi tornare a completare migrazione useAllenamenti se necessario

**Nota**: La migrazione parziale non rompe nulla - il hook funziona ancora come prima, ma ora può beneficiare di invalidazione query nelle mutation.
