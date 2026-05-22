import { ChatMessageRepository } from '../repositories/ChatMessageRepository';
import { AvatarAdapter } from '../adapters/AvatarAdapter';

export class AvatarService {
  constructor(
    private messageRepo: ChatMessageRepository,
    private avatarAdapter: AvatarAdapter
  ) {}

  async generateClipForMessage(chatMessageId: string) {
    const message = await this.messageRepo.findById(chatMessageId);
    if (!message || message.role !== 'ASSISTANT') throw new Error('Invalid message');

    const result = await this.avatarAdapter.createClip({ text: message.content, avatarId: 'default-avatar' });
    await this.messageRepo.updateAvatarUrl(chatMessageId, result.videoUrl);
    return result.videoUrl;
  }
}
