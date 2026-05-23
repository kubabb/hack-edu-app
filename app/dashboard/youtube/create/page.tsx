import Link from 'next/link'
import { ChevronLeft, PlaySquare, Sparkles } from 'lucide-react'
import DashboardLayout from '@/src/components/DashboardLayout'
import StartSessionForm from '@/src/components/StartSessionForm'

type SearchParams = Promise<{
  youtubeUrl?: string | string[]
  title?: string | string[]
}>

function readSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function YouTubeSessionCreatePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const youtubeUrl = readSingleValue(resolvedSearchParams.youtubeUrl) || ''
  const title = readSingleValue(resolvedSearchParams.title) || 'Transkrypcja z YouTube'

  return (
    <DashboardLayout>
      <Link
        href="/dashboard/youtube"
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#dce7f5] bg-white px-4 py-2 text-sm font-extrabold text-[#06296b]"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.7} />
        Wróć do linku YouTube
      </Link>

      <section className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-start">
        <div className="cartoon-panel rounded-[32px] p-6 md:p-10">
          <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#ffd9b5] bg-[#fff4cf] px-4 py-2 text-sm font-extrabold text-[#06296b]">
            <Sparkles className="h-4 w-4 text-[#ff5144]" fill="#ff5144" />
            Sesja z transkrypcji YouTube
          </p>
          <h1 className="font-display text-5xl leading-none text-[#06296b] md:text-6xl">
            Przygotuj naukę z filmu
          </h1>
          <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-[#6e7fa6]">
            Transkrypcja filmu zostanie pobrana automatycznie podczas startu. Wybierz tryb nauki i w razie potrzeby dodaj własne pliki, żeby rozszerzyć kontekst dla AI.
          </p>

          <div className="mt-8 rounded-[28px] border border-[#dce7f5] bg-[#fffefb] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ff5144] text-white">
                <PlaySquare className="h-6 w-6" strokeWidth={2.7} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#b85a00]">Wybrany film</p>
                <p className="mt-2 text-lg font-extrabold text-[#06296b]">{title}</p>
                <p className="mt-1 break-all text-xs font-bold text-[#8d6d3e]">{youtubeUrl}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <StartSessionForm
              initialTopic={title}
              youtubeUrl={youtubeUrl}
              youtubeTitle={title}
            />
          </div>
        </div>

        <aside className="cartoon-panel rounded-[28px] p-6">
          <h2 className="font-display text-3xl leading-none text-[#06296b]">Jak to zadziała?</h2>
          <div className="mt-6 grid gap-4">
            {[
              'Pobieramy transkrypcję z filmu YouTube.',
              'Łączymy ją z dodatkowymi plikami, jeśli je dołączysz.',
              'Budujemy notatki, graf wiedzy, mapę myśli i czat AI na tym samym pipeline co dla zwykłych materiałów.',
            ].map((step, index) => (
              <div key={step} className="rounded-2xl border border-[#dce7f5] bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7057ff]">Krok {index + 1}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#06296b]">{step}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </DashboardLayout>
  )
}
