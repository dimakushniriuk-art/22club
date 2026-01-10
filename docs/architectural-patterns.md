# 🏛️ Pattern Architetturali 22Club

Documentazione completa dei pattern architetturali utilizzati in 22Club.

## 📋 Overview

22Club utilizza pattern moderni e best practices per:

- **State Management**: React Query per server state
- **Form Management**: Zod validation + custom utilities
- **Error Handling**: Centralizzato e strutturato
- **API Communication**: Type-safe con Supabase
- **Realtime**: Supabase Realtime subscriptions

## 🔄 React Query Pattern

### Setup

```typescript
// src/providers/query-provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

### Custom Hooks Pattern

```typescript
// src/hooks/use-appointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'

export function useAppointments({ userId, role }: UseAppointmentsProps) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Query per fetch dati
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments', userId, role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('athlete_id', userId)

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })

  // Mutation per creare appuntamento
  const createMutation = useMutation({
    mutationFn: async (appointment: CreateAppointmentData) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate e refetch
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] })
    },
  })

  return {
    appointments: data || [],
    loading: isLoading,
    error,
    createAppointment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}
```

### Best Practices

1. **Query Keys**: Strutturati e consistenti

   ```typescript
   ;['appointments', userId, role][('documents', athleteId, filters)][('profile', userId)]
   ```

2. **Stale Time**: Configurare appropriatamente

   ```typescript
   staleTime: 5 * 60 * 1000 // 5 minuti per dati che cambiano poco
   staleTime: 0 // Dati che cambiano frequentemente
   ```

3. **Error Handling**: Centralizzato

   ```typescript
   onError: (error) => {
     console.error('Query error:', error)
     notifyError('Errore nel caricamento dati')
   }
   ```

4. **Optimistic Updates**: Per UX migliore
   ```typescript
   onMutate: async (newAppointment) => {
     await queryClient.cancelQueries({ queryKey: ['appointments'] })
     const previous = queryClient.getQueryData(['appointments'])
     queryClient.setQueryData(['appointments'], (old) => [...old, newAppointment])
     return { previous }
   },
   onError: (err, newAppointment, context) => {
     queryClient.setQueryData(['appointments'], context.previous)
   }
   ```

## 📝 Form Management Pattern

### Zod Schema Pattern

```typescript
// src/lib/validations/appointment.ts
import { z } from 'zod'

export const appointmentSchema = z.object({
  athlete_id: z.string().uuid('ID atleta non valido'),
  type: z.enum(['allenamento', 'cardio', 'check', 'consulenza']),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  location: z.string().optional(),
  notes: z.string().optional(),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>
```

### Sanitization Pattern

```typescript
// src/lib/utils/sanitize.ts
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function sanitizeEmail(value: string): string {
  return sanitizeString(value).toLowerCase()
}

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '') // Solo numeri
}
```

### Form Handler Pattern

```typescript
// src/lib/utils/athlete-profile-form.ts
import { z } from 'zod'
import type { ZodSchema } from 'zod'

export async function handleAthleteProfileSave<TFormData, TSanitized = TFormData>(params: {
  formData: TFormData
  schema: ZodSchema<TSanitized>
  mutation: { mutateAsync: (data: TSanitized) => Promise<unknown> }
  sanitize?: (data: TFormData) => TSanitized
  onSuccess?: () => void
  onError?: (error: string) => void
  successMessage?: string
  errorMessage?: string
}): Promise<boolean> {
  try {
    // 1. Sanitize
    const sanitized = params.sanitize ? params.sanitize(params.formData) : params.formData

    // 2. Validate
    const validation = validateAndSanitizeFormData(sanitized, params.schema)
    if (!validation.success) {
      params.onError?.(validation.error)
      return false
    }

    // 3. Mutate
    await params.mutation.mutateAsync(validation.data)

    // 4. Success
    params.onSuccess?.()
    if (params.successMessage) {
      notifySuccess(params.successMessage)
    }
    return true
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : params.errorMessage || 'Errore nel salvataggio'
    params.onError?.(errorMsg)
    notifyError(errorMsg)
    return false
  }
}
```

### Usage in Components

```typescript
// src/hooks/athlete-profile/use-athlete-anagrafica-form.ts
import { handleAthleteProfileSave } from '@/lib/utils/athlete-profile-form'
import { anagraficaSchema } from '@/lib/validations/athlete'

export function useAthleteAnagraficaForm(athleteId: string) {
  const mutation = useMutation({
    mutationFn: async (data: AnagraficaData) => {
      // Save to Supabase
    },
  })

  const sanitizeFormData = useCallback((data: AnagraficaFormData) => {
    return {
      nome: sanitizeString(data.nome),
      cognome: sanitizeString(data.cognome),
      email: sanitizeEmail(data.email),
      telefono: sanitizePhone(data.telefono),
    }
  }, [])

  const handleSave = useCallback(async () => {
    return handleAthleteProfileSave({
      formData,
      schema: anagraficaSchema,
      mutation,
      sanitize: sanitizeFormData,
      successMessage: 'Dati anagrafici salvati con successo',
      errorMessage: 'Errore nel salvataggio dei dati anagrafici',
    })
  }, [formData, mutation, sanitizeFormData])

  return { handleSave, isSaving: mutation.isPending }
}
```

## ⚠️ Error Handling Pattern

### Error Handler Class

```typescript
// src/lib/error-handler.ts
export class ApiErrorHandler {
  private logError(error: ApiError) {
    console.error('[API Error]', {
      message: error.message,
      code: error.code,
      status: error.status,
      context: error.context,
      timestamp: error.timestamp,
    })

    // Send to Sentry
    if (typeof window !== 'undefined') {
      Sentry.captureException(new Error(error.message), {
        tags: { errorCode: error.code, context: error.context },
        extra: error.details,
      })
    }
  }

  handleError(error: unknown, context?: string): ApiError {
    if (error instanceof Error) {
      return this.handleGenericError(error, context)
    }
    // Handle other error types
  }

  handleValidationError(errors: unknown[], context?: string): ApiError {
    return {
      message: 'Errori di validazione',
      code: 'VALIDATION_ERROR',
      status: 400,
      details: { errors },
      timestamp: new Date().toISOString(),
      context: context || 'unknown',
    }
  }
}
```

### Error Display Components

```typescript
// src/components/ui/error-display.tsx
export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  if (!error) return null

  // Network errors
  if (error.code === 'NETWORK_ERROR') {
    return <NetworkErrorDisplay error={error} onRetry={onRetry} />
  }

  // Validation errors
  if (error.code === 'VALIDATION_ERROR') {
    return <ValidationErrorDisplay error={error} />
  }

  // Generic error
  return <InfoErrorDisplay error={error} onRetry={onRetry} />
}
```

### Error Boundary Pattern

```typescript
// src/components/shared/ui/error-boundary.tsx
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    })

    // Call custom handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
        ? <this.props.fallback error={this.state.error} resetError={this.resetError} />
        : <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }
    return this.props.children
  }
}
```

## 🔌 API Communication Pattern

### Supabase Client Pattern

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

### API Routes Pattern

```typescript
// src/app/api/admin/users/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Verifica autenticazione
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Esegui operazione con service role
    const adminSupabase = createServiceRoleClient()
    const body = await request.json()

    // ... operazione admin

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
```

## 🔔 Realtime Pattern

### Realtime Hook Pattern

```typescript
// src/hooks/useRealtimeChannel.ts
export function useAppointmentsRealtime(orgId?: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!orgId) return

    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          // Invalidate queries per refetch
          queryClient.invalidateQueries({ queryKey: ['appointments'] })

          // Notifica utente
          if (payload.eventType === 'INSERT') {
            notifyInfo('Nuovo appuntamento', 'Un nuovo appuntamento è stato creato')
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orgId, queryClient])
}
```

## 🎯 Best Practices

### 1. Type Safety

- Usa TypeScript strict mode
- Genera types da Supabase
- Valida con Zod

### 2. Error Handling

- Centralizza error handling
- Logga errori a Sentry
- Mostra messaggi user-friendly

### 3. Performance

- Usa React Query caching
- Implementa optimistic updates
- Lazy load componenti pesanti

### 4. Code Organization

- Separare concerns (hooks, utils, components)
- Riutilizzare pattern comuni
- Documentare pattern complessi

## 🔗 Riferimenti

- [React Query Docs](https://tanstack.com/query/latest)
- [Zod Docs](https://zod.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Error Handler](../src/lib/error-handler.ts)
- [Form Utils](../src/lib/utils/athlete-profile-form.ts)
