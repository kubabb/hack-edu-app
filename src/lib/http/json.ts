export type JsonRecord = Record<string, unknown>

export function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function readJsonSafely<T = JsonRecord>(
  response: Response
): Promise<T | null> {
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
    return JSON.parse(trimmed) as T
  } catch {
    return null
  }
}

export function getResponseError(body: JsonRecord | null, fallback: string) {
  return typeof body?.error === 'string' && body.error.trim()
    ? body.error
    : fallback
}
