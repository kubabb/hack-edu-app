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

    const systemPrompt = `Jesteś ekspertem w tworzeniu grafów wiedzy. Analizujesz materiał edukacyjny i zwracasz graf pojęć w formacie JSON.

FORMAT JSON:
{
  "nodes": [
    { "id": "n1", "label": "Nazwa pojęcia", "type": "CONCEPT" },
    { "id": "n2", "label": "Zadanie: ...", "type": "TASK" }
  ],
  "edges": [
    { "source": "n1", "target": "n2", "type": "DEPENDS_ON", "label": "wymaga znajomości" },
    { "source": "n1", "target": "n3", "type": "SIMILAR", "label": "podobne do" }
  ]
}

ZASADY:
- 8-15 węzłów (pojęcia, zadania, sekcje)
- 5-12 krawędzi między powiązanymi węzłami
- Typy węzłów: CONCEPT, TASK, SECTION
- Typy krawędzi: DEPENDS_ON, SIMILAR, NEXT, PART_OF
- Etykiety krótkie i konkretne (max 80 znaków)
- ODPOWIEDZ TYLKO JSON-em`;

    const openai = createOpenAIClient(process.env.OPENAI_API_KEY || '');
    const completion = await openai.chat.completions.create({
      model: resolveModel('gpt-4o-mini', process.env.OPENAI_API_KEY || ''),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Stwórz graf wiedzy z materiału:\n\n${fullText.substring(0, 15000)}` },
      ],
      temperature: 0.4,
      max_completion_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('LLM nie zwrócił odpowiedzi');

    // Extract JSON
    let graph: any;
    try {
      graph = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) graph = JSON.parse(match[0]);
      else throw new Error('Nie udało się sparsować grafu');
    }

    return NextResponse.json({ graph });

  } catch (error: any) {
    console.error('Error generating graph:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to generate graph' }, { status: 500 });
  }
}
