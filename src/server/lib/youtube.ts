import { getVideoDetails } from 'youtube-caption-extractor'

type CaptionTrack = {
  baseUrl: string
  languageCode?: string
  name?: { simpleText?: string; runs?: Array<{ text?: string }> }
  kind?: string
}

type YouTubePlayerResponse = {
  videoDetails?: {
    title?: string
  }
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[]
    }
  }
}

type TranscriptResult = {
  videoId: string
  title: string
  transcript: string
  languageCode?: string
  languageLabel?: string
}

type PreviewResult = Omit<TranscriptResult, 'transcript'>

type ExtractedSubtitle = {
  text: string
}

function readTrackLabel(track: CaptionTrack): string | undefined {
  if (track.name?.simpleText) return track.name.simpleText
  return track.name?.runs?.map((run) => run.text || '').join('').trim() || undefined
}

function pickCaptionTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (tracks.length === 0) return null

  const preferredTrack =
    tracks.find((track) => track.languageCode === 'pl' && track.kind !== 'asr') ||
    tracks.find((track) => track.languageCode?.startsWith('pl')) ||
    tracks.find((track) => track.kind !== 'asr') ||
    tracks[0]

  return preferredTrack || null
}

function parsePlayerResponseFromHtml(html: string): YouTubePlayerResponse | null {
  const patterns = [
    /ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});/,
    /"playerResponse":"({[\s\S]*?})"/,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (!match?.[1]) continue

    try {
      if (pattern.source.includes('"playerResponse"')) {
        return JSON.parse(JSON.parse(`"${match[1]}"`)) as YouTubePlayerResponse
      }
      return JSON.parse(match[1]) as YouTubePlayerResponse
    } catch {
      continue
    }
  }

  return null
}

async function fetchVideoPage(videoId: string) {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=pl`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pl,en;q=0.9',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Nie udało się pobrać strony filmu z YouTube.')
  }

  const html = await response.text()
  const playerResponse = parsePlayerResponseFromHtml(html)

  if (!playerResponse) {
    throw new Error('Nie udało się odczytać danych filmu z YouTube.')
  }

  return {
    html,
    playerResponse,
  }
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
}

function transcriptFromJsonPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object' || !('events' in payload)) {
    return ''
  }

  const events = (payload as { events?: Array<{ segs?: Array<{ utf8?: string }> }> }).events
  if (!Array.isArray(events)) return ''

  return events
    .map((event) =>
      Array.isArray(event.segs)
        ? event.segs
            .map((segment) => segment.utf8 || '')
            .join('')
            .replace(/\n+/g, ' ')
        : '',
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function transcriptFromXmlPayload(payload: string) {
  const matches = [...payload.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)]
  if (matches.length === 0) return ''

  return matches
    .map((match) => decodeXmlEntities(match[1] || ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function transcriptFromVttPayload(payload: string) {
  const cleaned = payload
    .replace(/^WEBVTT[\s\S]*?\n\n/, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false
      if (/^\d+$/.test(line)) return false
      if (/^\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}/.test(line)) return false
      if (/^\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}\.\d{3}/.test(line)) return false
      return true
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  return decodeXmlEntities(cleaned)
}

function stripUrlParam(url: string, paramName: string) {
  const parsedUrl = new URL(url)
  parsedUrl.searchParams.delete(paramName)
  return parsedUrl.toString()
}

function buildTranscriptCandidateUrls(baseUrl: string) {
  const normalizedBaseUrl = stripUrlParam(stripUrlParam(baseUrl, 'fmt'), 'format')
  const separator = normalizedBaseUrl.includes('?') ? '&' : '?'

  return [
    baseUrl,
    `${normalizedBaseUrl}${separator}fmt=json3`,
    `${normalizedBaseUrl}${separator}fmt=srv3`,
    `${normalizedBaseUrl}${separator}fmt=srv2`,
    `${normalizedBaseUrl}${separator}fmt=srv1`,
    `${normalizedBaseUrl}${separator}fmt=vtt`,
    normalizedBaseUrl,
  ]
}

function parseTranscriptPayload(payload: string) {
  const trimmedPayload = payload.trim()
  if (!trimmedPayload) return ''

  try {
    return transcriptFromJsonPayload(JSON.parse(trimmedPayload))
  } catch {
    if (trimmedPayload.startsWith('<')) {
      return transcriptFromXmlPayload(trimmedPayload)
    }

    if (trimmedPayload.startsWith('WEBVTT') || trimmedPayload.includes('-->')) {
      return transcriptFromVttPayload(trimmedPayload)
    }

    return ''
  }
}

async function tryFetchTranscript(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      Accept: 'application/json,text/plain,text/vtt,text/xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pl,en;q=0.9',
      Referer: 'https://www.youtube.com/',
      Origin: 'https://www.youtube.com',
    },
    cache: 'no-store',
  })

  if (!response.ok) return ''

  const payload = await response.text()
  return parseTranscriptPayload(payload)
}

async function fetchTranscriptText(baseUrl: string) {
  const attemptedUrls: string[] = []

  for (const candidateUrl of buildTranscriptCandidateUrls(baseUrl)) {
    attemptedUrls.push(candidateUrl)
    const transcript = await tryFetchTranscript(candidateUrl)
    if (transcript) {
      return transcript
    }
  }

  throw new Error(
    `Nie udało się odczytać treści napisów z YouTube dla tego filmu. Sprawdzone warianty: ${attemptedUrls.length}.`,
  )
}

async function fetchTranscriptFromExtractor(videoId: string) {
  const details = await getVideoDetails({
    videoID: videoId,
    lang: 'pl',
  })

  const transcript = (details.subtitles as ExtractedSubtitle[])
    .map((subtitle) => subtitle.text.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  return {
    title: details.title || 'Film z YouTube',
    transcript,
  }
}

export function extractYouTubeVideoId(rawUrl: string): string | null {
  if (!rawUrl?.trim()) return null

  try {
    const normalized = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
    const url = new URL(normalized)
    const hostname = url.hostname.replace(/^www\./, '')

    if (hostname === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || null
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (url.pathname === '/watch') {
        return url.searchParams.get('v')
      }

      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live') {
        return parts[1] || null
      }
    }
  } catch {
    return null
  }

  return null
}

export async function fetchYouTubeVideoPreview(rawUrl: string): Promise<PreviewResult> {
  const videoId = extractYouTubeVideoId(rawUrl)
  if (!videoId) {
    throw new Error('Podaj poprawny link do filmu YouTube.')
  }

  const { playerResponse } = await fetchVideoPage(videoId)
  const tracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
  const selectedTrack = pickCaptionTrack(tracks)

  if (!selectedTrack) {
    throw new Error('Ten film nie udostępnia transkrypcji lub napisów.')
  }

  return {
    videoId,
    title: playerResponse.videoDetails?.title || 'Film z YouTube',
    languageCode: selectedTrack.languageCode,
    languageLabel: readTrackLabel(selectedTrack),
  }
}

export async function fetchYouTubeTranscript(rawUrl: string): Promise<TranscriptResult> {
  const preview = await fetchYouTubeVideoPreview(rawUrl)
  const { playerResponse } = await fetchVideoPage(preview.videoId)
  const tracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
  const selectedTrack = pickCaptionTrack(tracks)

  if (!selectedTrack?.baseUrl) {
    throw new Error('Nie znaleziono ścieżki do transkrypcji filmu.')
  }

  try {
    const transcript = await fetchTranscriptText(selectedTrack.baseUrl)

    return {
      ...preview,
      transcript,
    }
  } catch {
    const extractorResult = await fetchTranscriptFromExtractor(preview.videoId)

    if (!extractorResult.transcript) {
      throw new Error('Nie udało się pobrać transkrypcji tego filmu z YouTube.')
    }

    return {
      ...preview,
      title: extractorResult.title || preview.title,
      transcript: extractorResult.transcript,
    }
  }
}
