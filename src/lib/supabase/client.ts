import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lock: (async (_name: string, _acquireTimeout: number, fn: () => Promise<unknown>) => {
          return fn()
        }) as any,
      },
    }
  )
}
