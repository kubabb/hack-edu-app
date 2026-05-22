import { ChatSessionRepository } from '../repositories/ChatSessionRepository';
import { ChatMessageRepository } from '../repositories/ChatMessageRepository';
import { KnowledgeQueryService } from './KnowledgeQueryService';
import { LlmAdapter, LlmPrompt } from '../adapters/LlmAdapter';

export class TutoringService {
  constructor(
    private sessionRepo: ChatSessionRepository,
    private messageRepo: ChatMessageRepository,
    private knowledgeQueryService: KnowledgeQueryService,
    private llmAdapter: LlmAdapter
  ) {}

  async startSession(userId: string, bookId: string) {
    return this.sessionRepo.create({ userId, bookId });
  }

  async handleUserMessage(sessionId: string, message: string, selectedNodeId?: string) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new Error('Session not found');

    await this.messageRepo.create({ sessionId, role: 'USER', content: message });

    const history = await this.messageRepo.findBySessionId(sessionId);
    const context = await this.knowledgeQueryService.getContextForQuestion(session.bookId, message, selectedNodeId);

    const prompt: LlmPrompt = {
      system: `Jesteś korepetytorem AI. Odpowiadasz po polsku. Nie podawaj od razu pełnej odpowiedzi. Zadawaj pytania pośrednie, aby uczeń sam doszedł do rozwiązania.\n\nKontekst z książki:\n${context.join('\n---\n')}`,
      messages: history.map((m) => ({ role: m.role === 'USER' ? 'user' : 'assistant', content: m.content })),
    };

    const response = await this.llmAdapter.complete(prompt);
    const assistantMessage = await this.messageRepo.create({ sessionId, role: 'ASSISTANT', content: response.content });

    return { sessionId, assistantMessage };
  }
}
