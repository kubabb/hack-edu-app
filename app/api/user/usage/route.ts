import { NextResponse } from 'next/server'
import { prisma as db } from '@/src/server/prisma'
import { auth } from '@/auth'

function getAuthenticatedUserId(session: any) {
  const userId = session?.user?.id;
  return userId;
}

export async function GET() {
  try {
    const session = await auth();
    const userId = getAuthenticatedUserId(session);
    if (!userId) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { aiMinutesUsed: true, aiMinutesLimit: true, subscriptionPlan: true },
    })

    if (!user) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 })

    const flashcardsCount = await db.flashcard.count({
      where: {
        set: {
          session: {
            userId: userId
          }
        }
      }
    })

    return NextResponse.json({
      ...user,
      flashcardsCount
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await auth();
    const userId = getAuthenticatedUserId(session);
    if (!userId) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 })

    const user = await db.user.update({
      where: { id: userId },
      data: { aiMinutesUsed: { increment: 1 } },
      select: { aiMinutesUsed: true, aiMinutesLimit: true },
    })

    return NextResponse.json(user)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
