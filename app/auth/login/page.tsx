'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/src/lib/supabase/client'

export default function LoginPage() {
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

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      setError('Nieprawidłowy email lub hasło')
    } else {
      router.push('/dashboard')
      router.refresh()
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
          <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Zaloguj się</h1>
          <p className="text-sm text-[#666] mb-6">Witaj z powrotem! Kontynuuj naukę.</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              Zaloguj się
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-[#666]">
            Nie masz konta?{' '}
            <Link href="/auth/register" className="font-medium text-[#1d7874] hover:underline">
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
