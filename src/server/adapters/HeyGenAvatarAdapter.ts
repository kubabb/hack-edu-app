import { AvatarAdapter } from './AvatarAdapter';

type HeyGenContextListResponse = {
  data?: Array<{ id: string; name?: string }>
}

export class HeyGenAvatarAdapter implements AvatarAdapter {
  constructor(private apiKey: string) {}

  async createClip(params: { text: string; avatarId: string }): Promise<{ videoUrl: string; taskId: string }> {
    console.log('HeyGen clip requested for avatar', params.avatarId);
    return {
      taskId: 'fake-task-id',
      videoUrl: 'https://example.com/fake-video.mp4',
    };
  }

  async createSession(
    avatarId: string = '9650a758-1085-4d49-8bf3-f347565ec229',
    voiceId?: string,
    contextConfig?: { name?: string; prompt?: string; openingText?: string },
  ): Promise<{ sessionToken: string }> {
    let contextId = '';

    if (!contextConfig?.prompt) {
      // 1. Spróbuj znaleźć istniejący kontekst tylko dla domyślnej sesji ogólnej
      try {
        const getCtxRes = await fetch('https://api.liveavatar.com/v1/contexts', {
          method: 'GET',
          headers: { 'x-api-key': this.apiKey }
        });
        if (getCtxRes.ok) {
          const getCtxData = await getCtxRes.json() as HeyGenContextListResponse;
          const contexts = Array.isArray(getCtxData.data) ? getCtxData.data : [];
          const existing = contexts.find((context) => context.name === 'TutorAI Session');
          if (existing) {
            contextId = existing.id;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch contexts', e);
      }
    }

    // 2. Jeśli nie znaleziono, utwórz nowy
    if (!contextId) {
      const contextName = contextConfig?.name || "TutorAI Session";
      const contextPrompt = contextConfig?.prompt || "You are a helpful AI tutor.";
      const openingText = contextConfig?.openingText || "Cześć! O czym dzisiaj porozmawiamy?";

      let ctxRes = await fetch('https://api.liveavatar.com/v1/contexts', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contextName,
          prompt: contextPrompt,
          opening_text: openingText
        })
      });

      if (!ctxRes.ok) {
        const errText = await ctxRes.text();
        if (errText.includes('already exists')) {
          // Fallback na unikalną nazwę
          ctxRes = await fetch('https://api.liveavatar.com/v1/contexts', {
            method: 'POST',
            headers: {
              'x-api-key': this.apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: `${contextName} ${Date.now()}`,
              prompt: contextPrompt,
              opening_text: openingText
            })
          });
          if (!ctxRes.ok) throw new Error(`Failed to create fallback context: ${await ctxRes.text()}`);
        } else {
          throw new Error(`Failed to create context: ${errText}`);
        }
      }
      const ctxData = await ctxRes.json();
      contextId = ctxData.data.id;
    }

    // 2. Create Session Token
    const tokenRes = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'FULL',
        avatar_id: avatarId,
        avatar_persona: {
          ...(voiceId ? { voice_id: voiceId } : {}),
          context_id: contextId,
          language: 'pl'
        }
      })
    });

    if (!tokenRes.ok) throw new Error(`Failed to create session token: ${await tokenRes.text()}`);
    const tokenData = await tokenRes.json();
    const sessionToken = tokenData.data.session_token;

    // SDK LiveAvatara samodzielnie woła /v1/sessions/start, dlatego nie robimy tego tutaj.
    return {
      sessionToken
    };
  }
}
