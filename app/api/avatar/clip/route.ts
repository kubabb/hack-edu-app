import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { AvatarService } from '@/src/server/services/AvatarService';
import { ChatMessageRepository } from '@/src/server/repositories/ChatMessageRepository';
import { HeyGenAvatarAdapter } from '@/src/server/adapters/HeyGenAvatarAdapter';
import { z } from 'zod';

const schema = z.object({
  chatMessageId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input: ' + parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });

  const messageRepo = new ChatMessageRepository(prisma);
  const avatarAdapter = new HeyGenAvatarAdapter(process.env.HEYGEN_API_KEY || '');
  const avatarService = new AvatarService(messageRepo, avatarAdapter);

  const videoUrl = await avatarService.generateClipForMessage(parsed.data.chatMessageId);
  return NextResponse.json({ videoUrl });
}
