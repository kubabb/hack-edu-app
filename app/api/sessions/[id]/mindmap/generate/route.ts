import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { createOpenAIClient, resolveModel } from '@/src/server/lib/openai-client';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const chunkRepo = new SessionChunkRepository(prisma);
    const chunks = await chunkRepo.findBySessionId(id);

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Brak materiału. Najpierw wgraj plik.' }, { status: 400 });
    }

    const fullText = chunks.map(c => c.content).join('\n\n');

    const systemPrompt = `Jesteś ekspertem w tworzeniu map myśli. Otrzymujesz materiał edukacyjny.
Stwórz hierarchiczną mapę myśli w formacie JSON.

FORMAT JSON:
{
  "label": "Tytuł główny",
  "children": [
    {
      "label": "Temat 1",
      "children": [
        { "label": "Podtemat 1.1" },
        { "label": "Podtemat 1.2" }
      ]
    },
    {
      "label": "Temat 2",
      "children": [...]
    }
  ]
}

ZASADY:
- 3-6 głównych tematów (dzieci roota)
- Każdy temat ma 2-4 podtematów
- Podtematy mogą mieć własne dzieci (max 3 poziomy)
- Używaj krótkich, treściwych etykiet (max 60 znaków)
- ODPOWIEDZ TYLKO JSON-em, bez markdown`;

    const openai = createOpenAIClient(process.env.OPENAI_API_KEY || '');
    const completion = await openai.chat.completions.create({
      model: resolveModel('gpt-4o-mini', process.env.OPENAI_API_KEY || ''),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Stwórz mapę myśli z materiału:\n\n${fullText.substring(0, 15000)}` },
      ],
      temperature: 0.4,
      max_completion_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('LLM nie zwrócił odpowiedzi');

    // Extract JSON
    let tree: any;
    try {
      tree = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) tree = JSON.parse(match[0]);
      else throw new Error('Nie udało się sparsować mapy myśli');
    }

    return NextResponse.json({ tree });

  } catch (error: any) {
    console.error('Error generating mind map:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to generate mind map' }, { status: 500 });
  }
}
