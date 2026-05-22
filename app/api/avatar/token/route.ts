import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { HeyGenAvatarAdapter } from '@/src/server/adapters/HeyGenAvatarAdapter';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const heygenKey = process.env.HEYGEN_API_KEY;
    if (!heygenKey) {
      return NextResponse.json({ error: 'Brak klucza API HeyGen w zmiennych środowiskowych serwera. Zrestartuj serwer.' }, { status: 500 });
    }

    const adapter = new HeyGenAvatarAdapter(heygenKey);
    const sessionData = await adapter.createSession('9650a758-1085-4d49-8bf3-f347565ec229');

    return NextResponse.json({ 
      sessionToken: sessionData.sessionToken
    });
  } catch (error: any) {
    console.error('Error generating HeyGen token:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
