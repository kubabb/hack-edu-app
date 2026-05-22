const EMAIL_RATE_LIMIT_MESSAGE =
  'Supabase osiągnął limit wysyłania emaili. Poczekaj około godziny albo skonfiguruj własny SMTP w Supabase.'

type JsonRecord = Record<string, unknown>

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message
  if (isJsonRecord(error) && typeof error.message === 'string') return error.message
  if (typeof error === 'string') return error
  return null
}

function getErrorStatus(error: unknown): number | null {
  if (!isJsonRecord(error)) return null
  return typeof error.status === 'number' ? error.status : null
}

export function formatRegistrationError(
  error: unknown,
  fallback = 'Błąd rejestracji'
) {
  const message = getErrorMessage(error)
  const normalized = message?.toLowerCase() ?? ''
  const status = getErrorStatus(error)

  if (
    status === 429 ||
    normalized.includes('email rate limit') ||
    normalized.includes('rate limit exceeded')
  ) {
    return EMAIL_RATE_LIMIT_MESSAGE
  }

  if (normalized.includes('user already registered')) {
    return 'Użytkownik już istnieje'
  }

  return message || fallback
}

export async function readJsonSafely(response: Response): Promise<JsonRecord | null> {
  let text = ''

  try {
    text = await response.text()
  } catch {
    return null
  }

  const trimmed = text.trim()
  if (!trimmed) return null

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  const looksLikeJson = trimmed.startsWith('{') || trimmed.startsWith('[')

  if (!contentType.includes('application/json') && !looksLikeJson) {
    return null
  }

  try {
    const data: unknown = JSON.parse(trimmed)
    return isJsonRecord(data) ? data : null
  } catch {
    return null
  }
}

export function extractResponseError(
  body: JsonRecord | null,
  fallback: string
) {
  return typeof body?.error === 'string' && body.error.trim()
    ? body.error
    : fallback
}
