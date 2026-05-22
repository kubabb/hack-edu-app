import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/server/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  supabaseUserId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().max(100).optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 })
  }

  try {
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 400 })
    }

    const { supabaseUserId, email, name } = parsed.data
    const normalizedName = name || null

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      if (existing.id === supabaseUserId) {
        return NextResponse.json({ id: existing.id, email: existing.email })
      }

      return NextResponse.json({ error: 'Użytkownik już istnieje' }, { status: 409 })
    }

    const user = await prisma.user.upsert({
      where: { id: supabaseUserId },
      update: {
        email,
        ...(name !== undefined ? { name: normalizedName } : {}),
      },
      create: {
        id: supabaseUserId,
        email,
        name: normalizedName,
        password: '',
      },
    })

    return NextResponse.json({ id: user.id, email: user.email })
  } catch (error: unknown) {
    console.error('Profile sync failed during registration', error)
    return NextResponse.json(
      { error: 'Nie udało się zsynchronizować profilu. Spróbuj ponownie.' },
      { status: 500 }
    )
  }
}
