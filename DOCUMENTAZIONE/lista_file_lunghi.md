# 📋 Lista File sopra 500 righe - 22Club

**Data analisi**: 2025-01-30  
**Criterio**: File `.ts`, `.tsx` esclusi test e file `.d.ts`

---

## 🔴 File sopra 1000 righe (PRIORITÀ ALTA)

1. **1,053 righe** - `src/app/dashboard/atleti/[id]/page.tsx`
   - Pagina profilo atleta (vista PT)
   - ✅ **SPLITTATO** (ora 107 righe, -90%) - 2025-01-30

2. **1,030 righe** - `src/components/dashboard/athlete-profile/athlete-nutrition-tab.tsx`
   - Tab nutrizione atleta
   - ✅ **SPLITTATO** (ora 175 righe, -83%) - 2025-01-30

3. **968 righe** - `src/lib/supabase/types.ts`
   - Tipi generati da Supabase
   - ℹ️ **AUTO-GENERATO** - Non modificare manualmente

---

## 🟠 File 800-1000 righe (PRIORITÀ MEDIA-ALTA)

4. **852 righe** - `src/components/dashboard/athlete-profile/athlete-fitness-tab.tsx`
   - Tab fitness atleta
   - ✅ **SPLITTATO** (ora 173 righe, -80%) - 2025-01-30

5. **825 righe** - `src/components/workout/workout-wizard.tsx`
   - Wizard creazione workout
   - ✅ **SPLITTATO** (ora 288 righe, -65%) - 2025-01-30

6. **787 righe** - `src/app/dashboard/appuntamenti/page.tsx`
   - Pagina appuntamenti
   - ✅ **SPLITTATO** (ora 294 righe, -63%) - 2025-01-30

7. **780 righe** - `src/app/home/profilo/page.tsx`
   - Pagina profilo atleta (vista atleta)
   - ✅ **SPLITTATO** (ora 280 righe, -64%) - 2025-01-30

8. **769 righe** - `src/components/dashboard/athlete-profile/athlete-motivational-tab.tsx`
   - Tab motivazionale atleta
   - ✅ **SPLITTATO** (ora 169 righe, -78%) - 2025-01-30

9. **731 righe** - `src/components/dashboard/athlete-profile/athlete-administrative-tab.tsx`
   - Tab amministrativa atleta

10. **717 righe** - `src/types/athlete-profile.ts`
    - Tipi TypeScript profilo atleta

11. **715 righe** - `src/components/dashboard/athlete-profile/athlete-medical-tab.tsx`
    - Tab medica atleta

12. **709 righe** - `src/app/dashboard/profilo/page.tsx`
    - ⚠️ **GIÀ SPLITTATO** (era 1885 righe, ora 709)
    - Potrebbe necessitare ulteriore split

13. **693 righe** - `src/types/athlete-profile.schema.ts`
    - Schema Zod profilo atleta

14. **690 righe** - `src/components/dashboard/athlete-profile/athlete-massage-tab.tsx`
    - Tab massaggi atleta

15. **676 righe** - `src/components/dashboard/athlete-profile/athlete-anagrafica-tab.tsx`
    - Tab anagrafica atleta

16. **675 righe** - `src/components/profile/pt-settings-tab.tsx`
    - Tab impostazioni profilo PT

---

## 🟡 File 500-800 righe (PRIORITÀ MEDIA)

17. **605 righe** - `src/app/dashboard/schede/page.tsx`
    - Pagina schede workout
    - ✅ **SPLITTATO** (ora 128 righe, -79%) - 2025-01-30

18. **602 righe** - `src/components/dashboard/athlete-profile/athlete-ai-data-tab.tsx`
    - Tab AI data atleta
    - ✅ **SPLITTATO** (ora 193 righe, -68%) - 2025-01-30

19. **592 righe** - `src/app/dashboard/comunicazioni/page.tsx`
    - Pagina comunicazioni
    - ✅ **SPLITTATO** (ora 134 righe, -77%) - 2025-01-30

20. **586 righe** - `src/hooks/use-workouts.ts`
    - Hook gestione workout
    - ✅ **SPLITTATO** (ora 54 righe, -91%) - 2025-01-30

21. **558 righe** - `src/components/workout/workout-detail-modal.tsx`
    - Modal dettaglio workout
    - ✅ **SPLITTATO** (ora 105 righe, -81%) - 2025-01-30

22. **543 righe** - `src/types/supabase.ts`
    - Tipi Supabase (potrebbe essere auto-generato)
    - ℹ️ **AUTO-GENERATO** - Non modificare manualmente

23. **506 righe** - `src/lib/communications/email.ts`
    - Servizio email comunicazioni
    - ✅ **SPLITTATO** (ora 280 righe, -45%) - 2025-01-30

24. **498 righe** - `src/app/dashboard/calendario/page.tsx`
    - ⚠️ **SOTTO 500** - Non incluso nella lista principale
    - ✅ **SPLITTATO** (ora 157 righe, -68%) - 2025-01-30

---

## 📊 Riepilogo

- **File sopra 1000 righe**: 3 file (2 splittati, 1 auto-generato)
- **File 800-1000 righe**: 13 file (5 splittati)
- **File 500-800 righe**: 8 file (7 splittati, 1 auto-generato)
- **TOTALE**: 24 file sopra 500 righe
- **✅ COMPLETATI**: 14 file splittati
- **ℹ️ AUTO-GENERATI**: 2 file (non splittabili)
- **⏳ RIMANENTI**: 8 file (tutti sopra 500 righe ma sotto 800)

---

## 🎯 Raccomandazioni

### Priorità 1 (Immediata):

1. `src/app/dashboard/atleti/[id]/page.tsx` (1,053 righe)
2. `src/components/dashboard/athlete-profile/athlete-nutrition-tab.tsx` (1,030 righe)

### Priorità 2 (Alta):

3. `src/components/dashboard/athlete-profile/athlete-fitness-tab.tsx` (852 righe)
4. `src/components/workout/workout-wizard.tsx` (825 righe)
5. `src/app/dashboard/appuntamenti/page.tsx` (787 righe)
6. `src/app/home/profilo/page.tsx` (780 righe)

### Priorità 3 (Media):

- Altri file 600-800 righe

### Note:

- `src/lib/supabase/types.ts` e `src/types/supabase.ts` sono probabilmente auto-generati → **NON SPLITTARE**
- `src/types/athlete-profile.schema.ts` contiene schemi Zod → valutare se splittare per categoria

---

**Ultimo aggiornamento**: 2025-01-30
