import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

async function exists(path) {
  try {
    await access(new URL(path, import.meta.url))
    return true
  } catch {
    return false
  }
}

test('Next 16 uses proxy.ts instead of deprecated middleware.ts', async () => {
  assert.equal(await exists('../middleware.ts'), false)
  assert.equal(await exists('../proxy.ts'), true)

  const proxySource = await readFile(new URL('../proxy.ts', import.meta.url), 'utf8')
  assert.match(proxySource, /export\s+async\s+function\s+proxy/)
})
