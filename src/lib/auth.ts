import { createClient } from '@/src/lib/supabase/server'
import { prisma } from '@/src/server/prisma'

export async function auth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: dbUser?.name || user.user_metadata?.name || user.email,
      role: dbUser?.role || 'STUDENT',
    }
  }
}
