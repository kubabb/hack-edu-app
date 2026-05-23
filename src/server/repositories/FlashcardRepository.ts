import { PrismaClient } from '@prisma/client';

export interface FlashcardData {
  question: string;
  answer: string;
}

export interface FlashcardSetData {
  id: string;
  sessionId: string;
  title: string;
  sourceType: string;
  sourceId: string | null;
  createdAt: Date;
  cards: FlashcardData[];
}

export class FlashcardRepository {
  constructor(private prisma: PrismaClient) {}

  async createSet(data: {
    sessionId: string;
    title: string;
    sourceType: string;
    sourceId?: string;
    cards: FlashcardData[];
  }): Promise<string> {
    const setId = `set_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    await this.prisma.$queryRawUnsafe(
      `INSERT INTO "FlashcardSet" ("id", "sessionId", "title", "sourceType", "sourceId") VALUES ($1, $2, $3, $4, $5)`,
      setId, data.sessionId, data.title, data.sourceType, data.sourceId || null
    );

    if (data.cards.length > 0) {
      const values: string[] = [];
      const params: any[] = [];
      for (let i = 0; i < data.cards.length; i++) {
        const cardId = `card_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`;
        params.push(cardId, setId, data.cards[i].question, data.cards[i].answer, i);
        const base = params.length - 5;
        values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
      }
      await this.prisma.$queryRawUnsafe(
        `INSERT INTO "Flashcard" ("id", "setId", "question", "answer", "position") VALUES ${values.join(', ')}`,
        ...params
      );
    }

    return setId;
  }

  async findBySessionId(sessionId: string): Promise<FlashcardSetData[]> {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT fs."id", fs."sessionId", fs."title", fs."sourceType", fs."sourceId", fs."createdAt",
              f."id" as "cardId", f."question", f."answer", f."position"
       FROM "FlashcardSet" fs
       LEFT JOIN "Flashcard" f ON fs."id" = f."setId"
       WHERE fs."sessionId" = $1
       ORDER BY fs."createdAt" DESC, f."position" ASC`,
      sessionId
    );

    // Group cards by set
    const setsMap = new Map<string, FlashcardSetData>();
    for (const row of rows) {
      if (!setsMap.has(row.id)) {
        setsMap.set(row.id, {
          id: row.id,
          sessionId: row.sessionId,
          title: row.title,
          sourceType: row.sourceType,
          sourceId: row.sourceId,
          createdAt: new Date(row.createdAt),
          cards: [],
        });
      }
      if (row.cardId) {
        setsMap.get(row.id)!.cards.push({
          question: row.question,
          answer: row.answer,
        });
      }
    }
    return Array.from(setsMap.values());
  }

  async deleteSet(setId: string): Promise<void> {
    await this.prisma.$queryRawUnsafe(
      `DELETE FROM "FlashcardSet" WHERE "id" = $1`,
      setId
    );
  }
}
