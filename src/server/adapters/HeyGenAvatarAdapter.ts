import { AvatarAdapter } from './AvatarAdapter';

export class HeyGenAvatarAdapter implements AvatarAdapter {
  constructor(private apiKey: string) {}

  async createClip(params: { text: string; avatarId: string }): Promise<{ videoUrl: string; taskId: string }> {
    // TODO: replace with real HeyGen API call
    // POST https://api.heygen.com/v2/video/generate
    // Body: { script: { type: "text", input: params.text }, avatar_id: params.avatarId, voice_id: "..." }
    // Then poll GET /v1/video/status/{task_id} until done
    console.log('HeyGen clip requested for avatar', params.avatarId);
    return {
      taskId: 'fake-task-id',
      videoUrl: 'https://example.com/fake-video.mp4',
    };
  }
}
