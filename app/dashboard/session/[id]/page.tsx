'use client'

import { useEffect, useRef, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mic, PhoneOff, Send, Square } from 'lucide-react'
import { LiveAvatarSession, SessionEvent, AgentEventsEnum } from '@heygen/liveavatar-web-sdk'

const renderMarkdown = (text: string) => {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g)
    const isListItem = line.trim().startsWith('- ') || /^\d+\.\s/.test(line.trim())
    
    if (line.trim() === '') return <div key={i} className="h-2" />

    return (
      <div key={i} className={`${isListItem ? 'ml-4 flex gap-2' : ''} mb-1 leading-relaxed`}>
        {isListItem && <span className="font-bold text-current opacity-70">•</span>}
        <div>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-extrabold">{part.slice(2, -2)}</strong>
            }
            // Zwykły tekst, dla list usuwamy znacznik początkowy, jeśli to pierwszy element tekstu
            let textPart = part
            if (isListItem && j === 0) {
              textPart = textPart.replace(/^(- |\d+\.\s)/, '')
            }
            return <span key={j}>{textPart}</span>
          })}
        </div>
      </div>
    )
  })
}

export default function InteractiveSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const sessionId = resolvedParams.id
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const userVideoRef = useRef<HTMLVideoElement>(null)
  const sessionRef = useRef<any>(null)
  
  const [connecting, setConnecting] = useState(true)
  const [error, setError] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])

  // Stan dyktafonu i kamery usera
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)

  // Pobieranie strumienia z kamery usera
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    async function setupLocalCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.warn('Nie udało się uzyskać dostępu do kamery użytkownika:', err)
      }
    }

    setupLocalCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let currentSession: any = null

    async function initStreaming() {
      try {
        const tokenRes = await fetch('/api/avatar/token', { method: 'POST' })
        const tokenData = await tokenRes.json().catch(() => ({}))
        if (!tokenRes.ok) throw new Error(tokenData.error || 'Brak autoryzacji do tokenu HeyGen')
        const { sessionToken } = tokenData
        
        if (!sessionToken) throw new Error('Brak sessionToken z API.')

        if (!mounted) {
          const unusedSession = new LiveAvatarSession(sessionToken)
          unusedSession.stop().catch(() => {})
          return
        }

        const newSession = new LiveAvatarSession(sessionToken)
        currentSession = newSession
        sessionRef.current = newSession
        
        newSession.on(SessionEvent.SESSION_STREAM_READY, () => {
          if (videoRef.current) {
            newSession.attach(videoRef.current)
          }
        })

        // Podpinamy nasłuchiwanie na to co mówi użytkownik i avatar
        newSession.on(AgentEventsEnum.USER_TRANSCRIPTION, (event: any) => {
          setMessages(prev => [...prev, { role: 'user', content: event.text }])
        })
        newSession.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, (event: any) => {
          setMessages(prev => [...prev, { role: 'assistant', content: event.text }])
        })
        
        await newSession.start()

        if (mounted) {
          setConnecting(false)
          // Usunęliśmy twardo wpisane powitanie, bo LiveAvatar wyemituje je sam przez zdarzenie AVATAR_TRANSCRIPTION
        }
        
      } catch (err: any) {
        console.error("Session start error:", err)
        if (mounted) {
          if (err.message && err.message.toLowerCase().includes('concurrency')) {
            console.log('Concurrency limit hit (Strict Mode overlap). Retrying in 1.5s...')
            setTimeout(() => {
              if (mounted) initStreaming()
            }, 1500)
            return
          }
          setError(err.message || 'Wystąpił błąd podczas łączenia z wirtualnym korepetytorem.')
          setConnecting(false)
        }
      }
    }

    void initStreaming()

    return () => {
      mounted = false
      if (currentSession) {
        currentSession.stop().catch(() => {})
      }
    }
  }, [])

  const toggleRecording = async () => {
    if (!sessionRef.current || isRecording) return
    
    // W trybie conversational odpalamy mikrofon tylko raz. System sam wykrywa ciszę!
    try {
      await sessionRef.current.voiceChat.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Brak dostępu do mikrofonu:', err)
      alert('Aby rozmawiać, musisz zezwolić na dostęp do mikrofonu.')
    }
  }

  const sendMessageToBot = (text: string) => {
    // Ręcznie dodajemy wiadomość usera do czatu
    setMessages(prev => [...prev, { role: 'user', content: text }])
    
    // LiveAvatar wysyła tekst do LLM, a awatar go wypowiada (funkcja 'message')
    if (sessionRef.current) {
      sessionRef.current.message(text)
    }
  }

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!chatMessage.trim() || connecting) return
    const text = chatMessage
    setChatMessage('')
    sendMessageToBot(text)
  }

  const endSession = async () => {
    try {
      // Wywołanie /api/sessions/summary żeby zakończyć i wygenerować podsumowanie
      await fetch(`/api/sessions/${sessionId}/summary`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      })
    } catch(err) {
      console.error(err)
    }
    router.push('/dashboard')
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#f3f6ff] text-[#06296b]">
      <header className="flex items-center justify-between px-8 py-4">
        <h1 className="font-display text-2xl tracking-wide text-[#7057ff]">TutorAI Live</h1>
        <button onClick={endSession} className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500 transition-colors hover:bg-red-500 hover:text-white" title="Zakończ i odbierz podsumowanie">
          <PhoneOff className="h-5 w-5" />
        </button>
      </header>

      <main className="flex flex-1 gap-6 overflow-hidden p-6 pt-0">
        
        <section className="relative flex-1 overflow-hidden rounded-[32px] bg-black shadow-2xl">
          {connecting && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#06296b]/80 backdrop-blur-sm">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#7057ff]" />
              <p className="font-extrabold text-[#dce7f5]">Łączenie z Twoim korepetytorem...</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 p-8 text-center">
              <p className="mb-4 text-xl font-bold text-red-400">{error}</p>
              <button onClick={() => window.location.reload()} className="rounded-xl bg-white px-6 py-3 font-bold text-black">Spróbuj ponownie</button>
            </div>
          )}
          <video 
            ref={videoRef} 
            className="h-full w-full object-cover" 
            autoPlay 
            playsInline 
          />

          {/* Mini kamerka usera */}
          <video
            ref={userVideoRef}
            className="absolute bottom-6 right-6 w-64 aspect-video rounded-2xl object-cover border-2 border-white/10 shadow-lg scale-x-[-1] z-10"
            autoPlay
            playsInline
            muted
          />
          
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-4 rounded-[28px] bg-black/40 p-4 backdrop-blur-md z-10">
            <button 
              onClick={toggleRecording} 
              disabled={isProcessingAudio || connecting || isRecording}
              className={`flex h-16 px-6 items-center justify-center gap-3 rounded-[20px] transition-transform ${
                isRecording 
                  ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                  : 'bg-white/20 hover:bg-white/30 text-white hover:scale-105'
              } disabled:opacity-90`}
            >
              {isProcessingAudio ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : isRecording ? (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-bold">Nasłuchuję...</span>
                </>
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </button>
          </div>
        </section>

        <aside className="flex w-[400px] flex-col rounded-[32px] bg-white text-[#06296b]">
          <div className="border-b border-[#f0edff] p-6">
            <h2 className="font-display text-2xl text-[#7057ff]">Czat z asystentem</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm font-bold leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#7057ff] text-white rounded-br-sm' 
                    : msg.role === 'system'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-[#f3f6ff] text-[#06296b] rounded-bl-sm'
                }`}>
                  {renderMarkdown(msg.content)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#f0edff] p-6">
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={isRecording ? "Nagrywanie..." : "Napisz coś do asystenta..."} 
                disabled={isRecording}
                className="w-full rounded-[20px] bg-[#f3f6ff] pl-5 pr-14 py-4 text-sm font-bold text-[#06296b] placeholder:text-[#a5b1ca] focus:outline-none focus:ring-2 focus:ring-[#7057ff] disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={connecting || !chatMessage.trim()}
                className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7057ff] text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </aside>

      </main>
    </div>
  )
}
