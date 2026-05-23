import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import { fetchYouTubeVideoPreview } from '@/src/server/lib/youtube';

const previewSchema = z.object({
  url: z.string().min(1, 'Podaj link do YouTube'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = previewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 },
      );
    }

    const preview = await fetchYouTubeVideoPreview(parsed.data.url);

    return NextResponse.json(preview);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nie udało się sprawdzić filmu z YouTube.';
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
