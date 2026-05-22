'use client'

import { PlayCircle } from 'lucide-react'

export default function AvatarPlayer({ videoUrl }: { videoUrl: string }) {
  if (!videoUrl) return null

  return (
    <div className="mt-3 rounded-[22px] border border-[#dce7f5] bg-[#fffefb] p-2 shadow-[0_10px_28px_rgba(6,41,107,0.08)]">
      <div className="mb-2 flex items-center gap-2 px-2 text-xs font-extrabold text-[#6e7fa6]">
        <PlayCircle className="h-4 w-4 text-[#ff5144]" strokeWidth={2.7} />
        Nagranie AI korepetytora
      </div>
      <video controls src={videoUrl} className="max-h-56 w-full rounded-2xl bg-[#06296b]" />
    </div>
  )
}
