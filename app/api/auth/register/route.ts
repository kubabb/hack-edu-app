import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/server/prisma'
import { z } from 'zod'

const schema = z.object({
  supabaseUserId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 400 })
    }

    const { supabaseUserId, email, name } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Użytkownik już istnieje' }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
        name: name || null,
        password: '', // hasło zarządzane przez Supabase Auth
      },
    })

    return NextResponse.json({ id: user.id, email: user.email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Błąd serwera' }, { status: 500 })
  }
}
