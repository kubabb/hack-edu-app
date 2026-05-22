'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, Sparkles } from 'lucide-react';
import AvatarPlayer from './AvatarPlayer';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  avatarVideoUrl?: string | null;
}

export default function ChatPanel({
  bookId,
  selectedNodeId,
}: {
  bookId: string;
  selectedNodeId?: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);

    const userMsg = input.trim();
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, bookId, message: userMsg, selectedNodeId }),
    });

    const data = await res.json();
    if (data.sessionId) setSessionId(data.sessionId);

    setMessages((prev) => [
      ...prev,
      { id: 'u-' + Date.now(), role: 'USER', content: userMsg },
      data.assistantMessage,
    ]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#666]">
            <div className="bg-[#f0f7f6] p-4 rounded-full mb-3">
              <Sparkles className="w-8 h-8 text-[#1d7874]" />
            </div>
            <p className="font-medium">Zadaj pytanie o książkę</p>
            <p className="text-sm text-[#999] mt-1">AI odpowie na podstawie grafu wiedzy.</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'USER' ? 'flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              m.role === 'USER' ? 'bg-[#1d7874]/10' : 'bg-[#f0f7f6]'
            }`}>
              {m.role === 'USER' ? <User className="w-4 h-4 text-[#1d7874]" /> : <Bot className="w-4 h-4 text-[#2ba599]" />}
            </div>
            <div className={`max-w-[80%] ${m.role === 'USER' ? 'items-end' : 'items-start'}`}>
              <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'USER'
                  ? 'bg-[#1d7874] text-white rounded-br-md'
                  : 'bg-[#f0f7f6] text-[#1a1a1a] rounded-bl-md'
              }`}>
                {m.content}
              </div>
              {m.avatarVideoUrl && <AvatarPlayer videoUrl={m.avatarVideoUrl} />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#f0f7f6] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#2ba599]" />
            </div>
            <div className="bg-[#f0f7f6] px-4 py-2.5 rounded-2xl rounded-bl-md">
              <Loader2 className="w-4 h-4 text-[#1d7874] animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-4 pt-4 border-t border-[#e5f0ee]">
        <div className="flex items-center gap-2 bg-[#fafcfb] border border-[#d0e5e1] rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-[#1d7874]/20 focus-within:border-[#1d7874] transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-[#1a1a1a] placeholder-[#999] focus:outline-none"
            placeholder="Napisz wiadomość..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-2 bg-[#1d7874] text-white rounded-lg hover:bg-[#166a66] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
