import test from 'node:test'
import assert from 'node:assert/strict'

import {
  extractResponseError,
  formatRegistrationError,
  readJsonSafely,
} from '../src/lib/auth/registration.ts'

test('formats Supabase email rate limit errors for the registration form', () => {
  const message = formatRegistrationError({
    message: 'Email rate limit exceeded',
    status: 429,
  })

  assert.equal(
    message,
    'Supabase osiągnął limit wysyłania emaili. Poczekaj około godziny albo skonfiguruj własny SMTP w Supabase.'
  )
})

test('formats duplicate-user errors in Polish', () => {
  assert.equal(
    formatRegistrationError({ message: 'User already registered' }),
    'Użytkownik już istnieje'
  )
})

test('reads JSON responses without throwing on HTML POST errors', async () => {
  const response = new Response('<!doctype html><h1>POST failed</h1>', {
    status: 500,
    headers: { 'content-type': 'text/html' },
  })

  assert.equal(await readJsonSafely(response), null)
})

test('extracts API error messages from JSON response bodies', () => {
  assert.equal(
    extractResponseError({ error: 'Nieprawidłowe dane' }, 'Fallback'),
    'Nieprawidłowe dane'
  )
})
