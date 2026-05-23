import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { prisma } from '@/src/server/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: { equals: user.email, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    if (!dbUser) {
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          password: ''
        }
      })
      dbUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      }
    }

    const userIdForStats = dbUser.id;

    const sessionsCount = await prisma.learningSession.count({
      where: { userId: userIdForStats }
    })

    const quizzesCount = await prisma.sessionChunk.count({
      where: {
        type: 'TASK',
        session: {
          userId: userIdForStats
        }
      }
    })

    return NextResponse.json({
      user: dbUser,
      stats: {
        sessions: sessionsCount,
        quizzes: quizzesCount
      }
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, password } = await request.json()

    if (name !== undefined) {
      try {
        const existing = await prisma.user.findFirst({
          where: {
            OR: [
              { id: user.id },
              { email: { equals: user.email, mode: 'insensitive' } }
            ]
          }
        });

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { name }
          });
        } else {
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              name: name,
              password: ''
            }
          });
        }
      } catch (e) {
        console.error("Prisma profile update error:", e);
      }
      
      // Update Supabase metadata
      await supabase.auth.updateUser({
        data: { name }
      })
    }

    if (password) {
      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
