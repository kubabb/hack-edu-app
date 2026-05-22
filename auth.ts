// Supabase Auth compat layer — replaces @auth/next-auth v5 (next-auth)
import { createClient } from '@/src/lib/supabase/server'
import { prisma } from '@/src/server/prisma'

export async function auth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) {
    try {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email,
          password: '', // domyślnie pusty dla logowania zewnętrznego
        }
      });
    } catch (e) {
      console.error('Error creating user in auth.ts:', e);
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
      name: dbUser?.name || user.user_metadata?.name || user.email,
      role: dbUser?.role || 'STUDENT',
    }
  }
}

// ---- compat stubs for removed NextAuth exports ----
export async function signIn() {
  throw new Error('Use Supabase client signIn: supabase.auth.signInWithPassword()')
}
export async function signOut() {
  throw new Error('Use Supabase client signOut: supabase.auth.signOut()')
}
export const handlers = {
  GET: () => new Response('NextAuth removed. Use Supabase auth.', { status: 410 }),
  POST: () => new Response('NextAuth removed. Use Supabase auth.', { status: 410 }),
}
