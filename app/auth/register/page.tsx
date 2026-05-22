'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/src/lib/supabase/client'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Create user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || null },
        },
      })

      if (signUpError) {
        setError(signUpError.message === 'User already registered' ? 'Użytkownik już istnieje' : signUpError.message)
        setLoading(false)
        return
      }

      if (!signUpData.user) {
        setError('Błąd rejestracji — spróbuj ponownie')
        setLoading(false)
        return
      }

      // 2. Sync profile in Prisma
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseUserId: signUpData.user.id, email, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Błąd synchronizacji profilu')
        setLoading(false)
        return
      }

      // 3. Auto-login after registration
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

      if (loginError) {
        // If confirmation required, redirect to login
        router.push('/auth/login?registered=1')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Błąd rejestracji')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6faf9] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl font-bold text-[#1a1a1a]">TutorAI</span>
          <Sparkles className="w-6 h-6 text-[#2ba599]" />
        </div>

        <div className="bg-white rounded-2xl border border-[#e5f0ee] p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Utwórz konto</h1>
          <p className="text-sm text-[#666] mb-6">Rozpocznij swoją przygodę z nauką.</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Imię</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                  type="text"
                  placeholder="Jan"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#d0e5e1] bg-[#fafcfb] text-sm focus:outline-none focus:ring-2 focus:ring-[#1d7874]/20 focus:border-[#1d7874] transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                  type="email"
                  placeholder="twoj@email.pl"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#d0e5e1] bg-[#fafcfb] text-sm focus:outline-none focus:ring-2 focus:ring-[#1d7874]/20 focus:border-[#1d7874] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Hasło</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#d0e5e1] bg-[#fafcfb] text-sm focus:outline-none focus:ring-2 focus:ring-[#1d7874]/20 focus:border-[#1d7874] transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1d7874] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#166a66] disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Zarejestruj się
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-[#666]">
            Masz już konto?{' '}
            <Link href="/auth/login" className="font-medium text-[#1d7874] hover:underline">
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
