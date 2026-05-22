import test from 'node:test'
import assert from 'node:assert/strict'

import { readJsonSafely } from '../src/lib/http/json.ts'

test('client JSON reader returns null for empty JSON responses', async () => {
  const response = new Response(null, {
    status: 204,
    headers: { 'content-type': 'application/json' },
  })

  assert.equal(await readJsonSafely(response), null)
})

test('client JSON reader returns null for HTML error pages', async () => {
  const response = new Response('<!doctype html><h1>Proxy error</h1>', {
    status: 502,
    headers: { 'content-type': 'text/html' },
  })

  assert.equal(await readJsonSafely(response), null)
})

test('client JSON reader parses valid JSON payloads', async () => {
  const response = new Response('{"books":[]}', {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

  assert.deepEqual(await readJsonSafely<{ books: unknown[] }>(response), { books: [] })
})
