import { NextResponse } from 'next/server';
import { createOpenAIClient, resolveModel } from '@/src/server/lib/openai-client';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Nieprawidłowy format wiadomości' }, { status: 400 });
    }

    // Konwertuj wiadomości na format OpenAI API
    const openaiMessages = messages.map((msg: any) => {
      if (msg.role === 'user' && msg.imageUrl) {
        return {
          role: 'user',
          content: [
            { type: 'text', text: msg.content },
            { 
              type: 'image_url', 
              image_url: { url: msg.imageUrl } 
            }
          ]
        };
      }
      
      return {
        role: msg.role,
        content: msg.content
      };
    });

    const apiKey = process.env.OPENAI_API_KEY || '';
    const openai = createOpenAIClient(apiKey);

    // Użyj gpt-4o, który obsługuje vision
    const completion = await openai.chat.completions.create({
      model: resolveModel('gpt-4o', apiKey),
      messages: [
        {
          role: "system",
          content: "Jesteś wybitnym korepetytorem AI (TutorAI). Pomagasz uczniom rozwiązywać zadania z ich tablicy. Otrzymasz obrazki z zadaniami (wycinki z tablicy). Twoim zadaniem jest rozpoznać tekst, zrozumieć problem matematyczny, fizyczny lub inny, a następnie wytłumaczyć krok po kroku jak to rozwiązać. Odpowiadaj w języku polskim, używając Markdown. Pamiętaj, by odpowiedź była bardzo czytelna: używaj wypunktowań, oddzielaj kroki nowymi liniami, a równania zapisuj w blokach matematycznych LaTeX."
        },
        ...openaiMessages
      ],
      max_tokens: 1500,
    });

    return NextResponse.json({ 
      response: completion.choices[0].message.content 
    });

  } catch (error: any) {
    console.error('Board Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Wystąpił błąd podczas analizy obrazu.' }, { status: 500 });
  }
}
