import { describe, it, expect, vi } from 'vitest'
import { getUserResilient, isAuthNetworkLikeError } from '@/lib/supabase/singleflight-get-user'

describe('singleflight-get-user helpers', () => {
  it('isAuthNetworkLikeError detects Failed to fetch', () => {
    expect(isAuthNetworkLikeError(new Error('Failed to fetch'))).toBe(true)
    expect(isAuthNetworkLikeError({ name: 'AuthRetryableFetchError', message: 'x' })).toBe(true)
    expect(isAuthNetworkLikeError(new Error('PGRST116'))).toBe(false)
  })

  it('getUserResilient returns user on first success', async () => {
    const getUser = vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    const getSession = vi.fn()
    const client = { auth: { getUser, getSession } } as never
    const r = await getUserResilient(client, { networkRetries: 2 })
    expect(r.user?.id).toBe('u1')
    expect(r.error).toBeNull()
    expect(getUser).toHaveBeenCalledTimes(1)
  })
})
