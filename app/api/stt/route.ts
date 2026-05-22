import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { createReadStream } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Zapisujemy tymczasowo plik audio, bo OpenAI SDK dla Node.js preferuje ReadStream
    const uploadDir = join(process.cwd(), 'tmp', 'audio');
    await mkdir(uploadDir, { recursive: true });
    
    // OpenAI obsługuje m.in. webm z przeglądarki
    const filePath = join(uploadDir, `${Date.now()}_audio.webm`);
    await writeFile(filePath, buffer);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(filePath) as any,
      model: 'whisper-1',
      language: 'pl', // ustawiamy język domyślny na polski, żeby lepiej łapał
    });

    // Usuwamy plik tymczasowy
    await unlink(filePath).catch(console.error);

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error('Error in POST /api/stt:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
