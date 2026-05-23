import { LearningSessionRepository } from '../repositories/LearningSessionRepository';
import { ChatMessageRepository } from '../repositories/ChatMessageRepository';
import { KnowledgeQueryService } from './KnowledgeQueryService';
import { LlmAdapter, LlmPrompt } from '../adapters/LlmAdapter';

export class TutoringService {
  constructor(
    private sessionRepo: LearningSessionRepository,
    private messageRepo: ChatMessageRepository,
    private knowledgeQueryService: KnowledgeQueryService,
    private llmAdapter: LlmAdapter
  ) {}

  async handleUserMessage(sessionId: string, message: string, selectedNodeId?: string) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new Error('Session not found');

    await this.messageRepo.create({ sessionId, role: 'USER', content: message });

    const history = await this.messageRepo.findBySessionId(sessionId);
    const contextItems = await this.knowledgeQueryService.getHybridContext(
      session.id,
      message,
      selectedNodeId
    );

    // Build context with source markers
    const contextBlock = contextItems.length > 0
      ? contextItems
          .map((c, i) => `[Fragment ${i + 1}] (Źródło: ${c.source})\n${c.content}`)
          .join('\n\n---\n\n')
      : 'Brak dopasowanych fragmentów w materiałach.';

    const systemPrompt = `Jesteś korepetytorem AI. Odpowiadasz po polsku. 

ZASADY:
1. NIE podawaj od razu pełnej odpowiedzi. Zadawaj pytania pośrednie, aby uczeń sam doszedł do rozwiązania.
2. Opieraj odpowiedzi TYLKO na dostarczonym kontekście z materiałów (Fragmenty poniżej).
3. Jeśli kontekst nie zawiera odpowiedzi na pytanie, powiedz: "Nie znalazłem tej informacji w materiałach. Czy mogę pomóc w inny sposób?"
4. Jeśli powołujesz się na konkretny fragment, zacytuj go lub podaj numer fragmentu.
5. Bądź cierpliwy i zachęcający, używaj prostego języka.

KONTEKST Z MATERIAŁÓW (${contextItems.length} fragmentów):
${contextBlock}`;

    const prompt: LlmPrompt = {
      system: systemPrompt,
      messages: history.map((m) => ({
        role: m.role === 'USER' ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
    };

    const response = await this.llmAdapter.complete(prompt);
    const assistantMessage = await this.messageRepo.create({
      sessionId,
      role: 'ASSISTANT',
      content: response.content,
    });

    return { sessionId, assistantMessage };
  }
}
