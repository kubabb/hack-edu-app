import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json(
    { error: 'NextAuth removed. Use Supabase auth.' },
    { status: 410 }
  )
}

export function POST() {
  return NextResponse.json(
    { error: 'NextAuth removed. Use Supabase auth.' },
    { status: 410 }
  )
}
