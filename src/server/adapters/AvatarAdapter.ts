export interface AvatarAdapter {
  createClip(params: { text: string; avatarId: string }): Promise<{ videoUrl: string; taskId: string }>;
}
