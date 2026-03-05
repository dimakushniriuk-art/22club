# 📝 Esempi generateStaticParams() per Route Dinamiche

**Data**: 2025-01-17  
**Scopo**: Esempi di implementazione per rendere le route dinamiche compatibili con Capacitor

---

## Panoramica

Le route dinamiche (es. `/dashboard/atleti/[id]`) devono implementare `generateStaticParams()` per essere pre-generate durante il build statico.

**Nota**: Attualmente queste route vengono spostate temporaneamente durante il build Capacitor. Questi esempi mostrano come implementarle quando verranno ripristinate.

---

## Esempio 1: Route Atleta `/dashboard/atleti/[id]`

```typescript
// src/app/dashboard/atleti/[id]/page.tsx
'use client' // O Server Component se necessario

import { createClient } from '@/lib/supabase/server' // Solo per generateStaticParams

// Questa funzione viene eseguita solo durante il build
export async function generateStaticParams() {
  try {
    // Usa createClient server-side per il build
    const supabase = await createClient()
    
    // Carica tutti gli ID atleti
    const { data: athletes, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'athlete')
      .limit(100) // Limita per non sovraccaricare il build
    
    if (error) {
      console.warn('Errore caricamento atleti per generateStaticParams:', error)
      return []
    }
    
    return athletes?.map(athlete => ({
      id: athlete.id,
    })) || []
  } catch (error) {
    console.error('Errore generateStaticParams atleti:', error)
    return []
  }
}

// Fallback per route non pre-generate
export const dynamicParams = true

export default function AtletaPage({ params }: { params: { id: string } }) {
  // ... resto del componente
}
```

**Nota**: Se ci sono troppi atleti, considera di pre-generare solo i più recenti o attivi.

---

## Esempio 2: Route Scheda `/dashboard/schede/[id]`

```typescript
// src/app/dashboard/schede/[id]/page.tsx
'use client'

import { createClient } from '@/lib/supabase/server'

export async function generateStaticParams() {
  try {
    const supabase = await createClient()
    
    // Carica tutti gli ID schede
    const { data: schede, error } = await supabase
      .from('workout_plans')
      .select('id')
      .limit(100)
    
    if (error) {
      console.warn('Errore caricamento schede per generateStaticParams:', error)
      return []
    }
    
    return schede?.map(scheda => ({
      id: scheda.id,
    })) || []
  } catch (error) {
    console.error('Errore generateStaticParams schede:', error)
    return []
  }
}

export const dynamicParams = true

export default function SchedaPage({ params }: { params: { id: string } }) {
  // ... resto del componente
}
```

---

## Esempio 3: Route Nidificate `/home/allenamenti/[workout_plan_id]/[day_id]`

```typescript
// src/app/home/allenamenti/[workout_plan_id]/[day_id]/page.tsx
'use client'

import { createClient } from '@/lib/supabase/server'

export async function generateStaticParams() {
  try {
    const supabase = await createClient()
    
    // Carica workout plans
    const { data: workoutPlans, error: plansError } = await supabase
      .from('workout_plans')
      .select('id')
      .limit(50)
    
    if (plansError) {
      console.warn('Errore caricamento workout plans:', plansError)
      return []
    }
    
    // Per ogni workout plan, carica i giorni
    const params: { workout_plan_id: string; day_id: string }[] = []
    
    for (const plan of workoutPlans || []) {
      const { data: days, error: daysError } = await supabase
        .from('workout_plan_days')
        .select('id')
        .eq('workout_plan_id', plan.id)
        .limit(10) // Limita giorni per plan
      
      if (!daysError && days) {
        for (const day of days) {
          params.push({
            workout_plan_id: plan.id,
            day_id: day.id,
          })
        }
      }
    }
    
    return params
  } catch (error) {
    console.error('Errore generateStaticParams allenamenti:', error)
    return []
  }
}

export const dynamicParams = true

export default function AllenamentoDayPage({
  params,
}: {
  params: { workout_plan_id: string; day_id: string }
}) {
  // ... resto del componente
}
```

**Nota**: Per route nidificate, devi generare tutte le combinazioni possibili.

---

## Esempio 4: Route con Query Parameters (Alternativa)

Se ci sono troppe combinazioni possibili, considera di convertire in query parameters:

```typescript
// Prima: /dashboard/atleti/[id]
// Dopo: /dashboard/atleti?id=xxx

// src/app/dashboard/atleti/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function AtletiPage() {
  const searchParams = useSearchParams()
  const athleteId = searchParams.get('id')
  
  // ... carica dati per athleteId
}
```

**Vantaggi**:
- ✅ Funziona sempre con export statico
- ✅ Non richiede pre-generazione
- ✅ Più flessibile

**Svantaggi**:
- ⚠️ Cambia URL structure
- ⚠️ Richiede refactoring

---

## Best Practices

### 1. Limita il numero di route pre-generate

```typescript
export async function generateStaticParams() {
  // Pre-genera solo le route più importanti
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'athlete')
    .order('created_at', { ascending: false })
    .limit(50) // Solo i 50 più recenti
}
```

### 2. Usa `dynamicParams = true` per fallback

```typescript
export const dynamicParams = true
```

Questo permette a Next.js di generare route non pre-generate al volo (se supportato) o restituire 404.

### 3. Gestisci errori gracefully

```typescript
export async function generateStaticParams() {
  try {
    // ... query
  } catch (error) {
    console.error('Errore generateStaticParams:', error)
    return [] // Restituisci array vuoto invece di fallire il build
  }
}
```

### 4. Considera cache durante il build

```typescript
import { unstable_cache } from 'next/cache'

export async function generateStaticParams() {
  return unstable_cache(
    async () => {
      // ... query database
    },
    ['static-params-atleti'],
    { revalidate: 3600 } // Cache per 1 ora
  )()
}
```

---

## Quando Implementare

**Priorità Alta**:
- Route molto utilizzate (es. `/dashboard/atleti/[id]`)
- Route con numero limitato di parametri possibili

**Priorità Media**:
- Route utilizzate occasionalmente
- Route con molti parametri possibili (considera query parameters)

**Priorità Bassa**:
- Route raramente utilizzate
- Route con parametri illimitati (usa query parameters)

---

## Testing

Dopo aver implementato `generateStaticParams()`, testa il build:

```bash
npm run build:capacitor
```

Verifica che:
1. ✅ Le route vengono pre-generate correttamente
2. ✅ Il build non fallisce
3. ✅ Le route funzionano nell'app mobile

---

**Ultimo aggiornamento**: 2025-01-17T23:55:00Z
