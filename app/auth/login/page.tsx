'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, GraduationCap, Loader2, Lock, Mail, Sparkles } from 'lucide-react'
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
      email: email.trim().toLowerCase(),
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
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center">
        <div className="cartoon-panel grid w-full overflow-hidden rounded-[32px] lg:grid-cols-[0.92fr_1.08fr]">
          <section className="flex flex-col justify-center px-6 py-10 md:px-12">
            <Link href="/" className="mb-8 flex w-fit items-center gap-2 text-[#06296b]">
              <span className="font-display text-3xl">TutorAI</span>
              <GraduationCap className="h-6 w-6 text-[#20b981]" />
            </Link>

            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#f6dec0] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
              <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
              Witaj z powrotem
            </div>

            <h1 className="font-display text-5xl leading-none text-[#06296b] md:text-6xl">
              Kontynuuj swoją naukę
            </h1>
            <p className="mt-4 max-w-md text-base font-bold leading-7 text-[#6e7fa6]">
              Zaloguj się i wróć do planów, quizów, nagrań oraz grafu wiedzy.
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-[#ffd3cf] bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#d8342b]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
              <label className="grid gap-2 text-sm font-extrabold text-[#06296b]">
                Email
                <span className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7057ff]" />
                  <input
                    type="email"
                    placeholder="twoj@email.pl"
                    className="w-full rounded-2xl border border-[#dce7f5] bg-white py-4 pl-12 pr-4 text-sm font-bold text-[#06296b] outline-none placeholder:text-[#a5b1ca] focus:border-[#7057ff]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-extrabold text-[#06296b]">
                Hasło
                <span className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7057ff]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-[#dce7f5] bg-white py-4 pl-12 pr-4 text-sm font-bold text-[#06296b] outline-none placeholder:text-[#a5b1ca] focus:border-[#7057ff]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="cartoon-button inline-flex items-center justify-center gap-3 rounded-2xl bg-[#ff5144] px-5 py-4 font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                Zaloguj się
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-bold text-[#6e7fa6]">
              Nie masz konta?{' '}
              <Link href="/auth/register" className="font-extrabold text-[#11805e] hover:underline">
                Zarejestruj się
              </Link>
            </p>
          </section>

          <section className="relative hidden min-h-[650px] overflow-hidden bg-[#fff4cf] lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(111,240,174,0.42),transparent_16rem),radial-gradient(circle_at_84%_80%,rgba(112,87,255,0.22),transparent_18rem)]" />
            <div className="relative flex h-full items-center justify-center p-12">
              <Image
                src="/assets/tutorai-hero-tutor-collage.png"
                alt="AI korepetytorzy TutorAI"
                width={420}
                height={640}
                priority
                className="max-h-[560px] w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
