import { createClient } from '@/src/lib/supabase/client'
import { useEffect, useState } from 'react'

export type AppUser = {
  id: string
  email: string
  name: string | null
  role: string
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function load() {
      const { data: { user: su } } = await supabase.auth.getUser()
      if (!mounted) return
      if (!su) { setUser(null); setLoading(false); return }

      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      const name = su.user_metadata?.name || su.email?.split('@')[0] || null
      setUser({
        id: su.id,
        email: su.email!,
        name,
        role: (su.user_metadata?.role as string) || 'STUDENT',
      })
      setLoading(false)
    }

    load()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (!session?.user) { setUser(null); setLoading(false); return }
      const su = session.user
      setUser({
        id: su.id,
        email: su.email!,
        name: su.user_metadata?.name || su.email?.split('@')[0] || null,
        role: (su.user_metadata?.role as string) || 'STUDENT',
      })
      setLoading(false)
    })

    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])

  return { user, loading }
}
