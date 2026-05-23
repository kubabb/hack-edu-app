'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Image as ImageIcon } from 'lucide-react';
import { readJsonSafely } from '@/src/lib/http/json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface BoardChatProps {
  pendingSnapshotUrl: string | null;
  onSnapshotSent: () => void;
}

const renderMarkdown = (text: string, role: 'user' | 'assistant') => {
  if (!text) return null;

  const isUser = role === 'user';
  // Match block math \[ \], inline math \( \), and bold ** **
  const tokens = text.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\*\*[\s\S]*?\*\*)/g);

  return (
    <div className="leading-relaxed break-words">
      {tokens.map((token, i) => {
        if (!token) return null;

        if (token.startsWith('\\[') && token.endsWith('\\]')) {
          return (
            <div key={i} className={`my-3 overflow-x-auto rounded-xl px-4 py-3 text-center font-mono text-base font-extrabold shadow-sm border ${isUser ? 'bg-white/20 border-white/30 text-white' : 'bg-[#f0edff] border-[#dce7f5] text-[#7057ff]'}`}>
              {token.slice(2, -2).trim()}
            </div>
          );
        }
        if (token.startsWith('\\(') && token.endsWith('\\)')) {
          return (
            <span key={i} className={`mx-1 rounded-md px-1.5 py-0.5 font-mono font-extrabold border ${isUser ? 'bg-white/20 border-white/30 text-white' : 'bg-[#f0edff] border-[#dce7f5] text-[#7057ff]'}`}>
              {token.slice(2, -2).trim()}
            </span>
          );
        }
        if (token.startsWith('**') && token.endsWith('**')) {
          return <strong key={i} className={`font-extrabold ${isUser ? 'text-white' : 'text-[#06296b]'}`}>{token.slice(2, -2)}</strong>;
        }

        return (
          <span key={i}>
            {token.split('\n').map((line, j, arr) => (
              <React.Fragment key={j}>
                {line}
                {j < arr.length - 1 && <div className="h-2" />}
              </React.Fragment>
            ))}
          </span>
        );
      })}
    </div>
  );
};

export const BoardChat: React.FC<BoardChatProps> = ({ pendingSnapshotUrl, onSnapshotSent }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Cześć! Narysuj równanie, wklej zdjęcie zadania na tablicę obok, a potem zaznacz i kliknij przycisk aparatu, abym mógł to rozwiązać!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingSnapshotUrl]);

  const handleSend = async (imageToSend: string | null = null, customPrompt: string = input) => {
    const textToSend = customPrompt.trim() || (imageToSend ? 'Proszę, rozwiąż to zadanie ze zdjęcia.' : '');
    
    if (!textToSend && !imageToSend) return;

    const newMessage: Message = { role: 'user', content: textToSend, imageUrl: imageToSend || undefined };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    if (imageToSend) onSnapshotSent();
    setLoading(true);

    try {
      const res = await fetch('/api/board-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMessage].map(m => ({
            role: m.role,
            content: m.content,
            imageUrl: m.imageUrl
          }))
        })
      });
      
      const data = await readJsonSafely<{ response?: string, error?: string }>(res);
      
      if (!res.ok) {
        throw new Error(data?.error || 'Wystąpił błąd podczas komunikacji z AI.');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data?.response || '' }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Błąd: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[32px] border border-[#dce7f5] bg-[#fffefb] shadow-sm">
      {/* Nagłówek czatu */}
      <div className="border-b border-[#dce7f5] bg-[#fff4cf] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#ff5144] text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-[#06296b]">Korepetytor Wizyjny</h2>
            <p className="text-xs font-bold text-[#b58145]">Widzi Twoją tablicę</p>
          </div>
        </div>
      </div>

      {/* Lista wiadomości */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              msg.role === 'user' ? 'bg-[#eafff4] text-[#11805e]' : 'bg-[#f0edff] text-[#7057ff]'
            }`}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm font-bold leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-[#11805e] text-white rounded-tr-sm' 
                : 'bg-white border border-[#dce7f5] text-[#33456b] rounded-tl-sm'
            }`}>
              {msg.imageUrl && (
                <div className="mb-3 rounded-xl overflow-hidden border border-white/20">
                  <img src={msg.imageUrl} alt="Zrzut z tablicy" className="max-w-full object-contain" />
                </div>
              )}
              {renderMarkdown(msg.content, msg.role)}
            </div>
          </div>
        ))}

        {pendingSnapshotUrl && (
          <div className="flex gap-3 flex-row-reverse opacity-70">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eafff4] text-[#11805e]">
              <User className="h-4 w-4" />
            </div>
            <div className="max-w-[80%] rounded-2xl bg-[#11805e] p-4 text-white rounded-tr-sm shadow-sm relative">
              <div className="mb-2 rounded-xl overflow-hidden">
                <img src={pendingSnapshotUrl} alt="Gotowe do wysłania" className="max-w-full object-contain" />
              </div>
              <p className="text-xs font-extrabold text-[#6ff0ae] flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> Czeka na wysłanie... Wpisz treść i wyślij.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f0edff] text-[#7057ff]">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 text-sm font-bold text-[#6e7fa6] rounded-tl-sm shadow-sm">
              AI analizuje zadanie...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#dce7f5] bg-white p-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(pendingSnapshotUrl, input);
          }} 
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={pendingSnapshotUrl ? "O co zapytać do tego zdjęcia?" : "Zadaj pytanie..."}
            className="w-full rounded-2xl border border-[#dce7f5] bg-[#f6f4ef] py-4 pl-4 pr-14 text-sm font-bold text-[#06296b] outline-none transition-colors focus:border-[#7057ff] focus:bg-white placeholder:text-[#6e7fa6]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || (!input.trim() && !pendingSnapshotUrl)}
            className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#7057ff] text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        {pendingSnapshotUrl && (
          <button 
            type="button"
            onClick={() => handleSend(pendingSnapshotUrl, input)}
            className="w-full mt-2 cartoon-button rounded-xl bg-[#11805e] px-4 py-2 text-xs font-extrabold text-white"
          >
            Wyślij obraz natychmiast
          </button>
        )}
      </div>
    </div>
  );
};
